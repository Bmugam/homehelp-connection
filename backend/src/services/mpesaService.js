const axios = require('axios');
const mpesaConfig = require('../config/mpesa');

class MpesaService {
    constructor() {
        this.baseUrl = mpesaConfig.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';

        this.debug = (message, data = null) => {
            console.log(`[MPESA-SERVICE] ${message}`, data ? JSON.stringify(data, null, 2) : '');
        };

        this.debug('Initialized MpesaService', { 
            environment: mpesaConfig.environment,
            baseUrl: this.baseUrl
        });
    }

    async generateAccessToken() {
        this.debug('Generating access token');
        const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
        try {
            const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            });
            this.debug('Access token generated successfully');
            return response.data.access_token;
        } catch (error) {
            this.debug('Access token generation failed', { 
                error: error.message,
                response: error.response?.data
            });
            throw new Error('Failed to generate access token');
        }
    }

    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
        try {
            this.debug('Initiating STK push request', {
                phoneNumber,
                amount,
                accountReference,
                transactionDesc
            });

            const accessToken = await this.generateAccessToken();
            const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
            const password = Buffer.from(
                `${mpesaConfig.shortCode}${mpesaConfig.passKey}${timestamp}`
            ).toString('base64');

            // Add detailed callback URL debugging
            this.debug('Verifying callback URL configuration', {
                configuredUrl: mpesaConfig.callbackUrl,
                isHttps: mpesaConfig.callbackUrl.startsWith('https://'),
                urlLength: mpesaConfig.callbackUrl.length,
                environment: mpesaConfig.environment
            });

            this.debug('Prepared STK push parameters', {
                timestamp,
                shortCode: mpesaConfig.shortCode,
                callbackUrl: mpesaConfig.callbackUrl
            });

            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                {
                    BusinessShortCode: mpesaConfig.shortCode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: amount,
                    PartyA: phoneNumber,
                    PartyB: mpesaConfig.shortCode,
                    PhoneNumber: phoneNumber,
                    CallBackURL: mpesaConfig.callbackUrl,
                    AccountReference: accountReference,
                    TransactionDesc: transactionDesc
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            this.debug('STK push response received', response.data);
            return response.data;
        } catch (error) {
            this.debug('STK push request failed', { 
                error: error.message,
                response: error.response?.data,
                stack: error.stack
            });
            throw new Error(error.response?.data?.errorMessage || 'STK push failed');
        }
    }

    async handleCallback(callbackData) {
        try {
            this.debug('Processing callback data', callbackData);
            
            if (!callbackData?.Body?.stkCallback) {
                throw new Error('Invalid callback data structure');
            }

            const resultCode = callbackData.Body.stkCallback.ResultCode;
            const resultDesc = callbackData.Body.stkCallback.ResultDesc;
            const merchantRequestId = callbackData.Body.stkCallback.MerchantRequestID;

            this.debug('Extracted callback basic info', { 
                resultCode, 
                resultDesc, 
                merchantRequestId 
            });

            if (resultCode === 0) {
                if (!callbackData.Body.stkCallback.CallbackMetadata?.Item) {
                    throw new Error('Missing callback metadata');
                }

                const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
                const amount = callbackMetadata.find(item => item.Name === 'Amount')?.Value;
                const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
                const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;
                const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber')?.Value;

                if (!amount || !mpesaReceiptNumber || !transactionDate || !phoneNumber) {
                    throw new Error('Missing required callback metadata fields');
                }

                const result = {
                    success: true,
                    merchantRequestId,
                    amount,
                    mpesaReceiptNumber,
                    transactionDate,
                    phoneNumber,
                    resultCode,
                    resultDesc
                };

                this.debug('Callback processed successfully', result);
                return result;
            }

            const result = {
                success: false,
                merchantRequestId,
                resultCode,
                resultDesc
            };

            this.debug('Callback processed with failure', result);
            return result;
        } catch (error) {
            this.debug('Callback processing error', { 
                error: error.message,
                stack: error.stack,
                callbackData
            });
            throw error; // Propagate the error with original stack trace
        }
    }

    async handleTimedOutPayments(db) {
        try {
            // Find payments that have been pending for more than 5 minutes
            const [timedOutPayments] = await db.query(
                `SELECT p.*, b.id as booking_id 
                 FROM payments p
                 JOIN bookings b ON p.booking_id = b.id
                 WHERE p.status = 'pending' 
                 AND p.created_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
            );

            for (const payment of timedOutPayments) {
                await db.query('START TRANSACTION');
                try {
                    // Update payment status
                    await db.query(
                        `UPDATE payments 
                         SET status = 'failed',
                             failure_reason = 'Payment timed out',
                             updated_at = NOW()
                         WHERE id = ?`,
                        [payment.id]
                    );

                    // Update booking status
                    await db.query(
                        'UPDATE bookings SET status = ? WHERE id = ?',
                        ['cancelled', payment.booking_id]
                    );

                    await db.query('COMMIT');
                    this.debug(`Handled timed out payment: ${payment.id}`);
                } catch (error) {
                    await db.query('ROLLBACK');
                    this.debug(`Error handling timed out payment: ${payment.id}`, error);
                }
            }
        } catch (error) {
            this.debug('Error checking for timed out payments', error);
        }
    }

    async cleanupStalePendingPayments(db) {
        try {
            this.debug('Starting cleanup of stale pending payments');
            
            // Get payments that have been pending for more than 5 minutes
            const [stalePayments] = await db.query(
                `SELECT p.*, b.id as booking_id 
                 FROM payments p
                 JOIN bookings b ON p.booking_id = b.id
                 WHERE p.status = 'pending' 
                 AND p.created_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
            );

            if (stalePayments.length > 0) {
                this.debug(`Found ${stalePayments.length} stale payments`, stalePayments);

                await db.query('START TRANSACTION');

                // Update payments to failed status
                await db.query(
                    `UPDATE payments 
                     SET status = 'failed',
                         failure_reason = 'Payment timeout - no response received',
                         updated_at = NOW()
                     WHERE status = 'pending' 
                     AND created_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
                );

                // Update associated bookings
                for (const payment of stalePayments) {
                    await db.query(
                        'UPDATE bookings SET status = ? WHERE id = ?',
                        ['cancelled', payment.booking_id]
                    );
                }

                await db.query('COMMIT');
                this.debug('Successfully cleaned up stale payments');
            } else {
                this.debug('No stale payments found');
            }
        } catch (error) {
            this.debug('Error cleaning up stale payments', { error });
            if (db) await db.query('ROLLBACK');
            throw error;
        }
    }
}

module.exports = new MpesaService();