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
            
            const resultCode = callbackData.Body.stkCallback.ResultCode;
            const resultDesc = callbackData.Body.stkCallback.ResultDesc;
            const merchantRequestId = callbackData.Body.stkCallback.MerchantRequestID;

            this.debug('Extracted callback basic info', { 
                resultCode, 
                resultDesc, 
                merchantRequestId 
            });

            if (resultCode === 0) {
                const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
                const amount = callbackMetadata.find(item => item.Name === 'Amount').Value;
                const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
                const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate').Value;
                const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber').Value;

                const result = {
                    success: true,
                    merchantRequestId,
                    amount,
                    mpesaReceiptNumber,
                    transactionDate,
                    phoneNumber
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
                stack: error.stack
            });
            throw new Error(`Failed to process callback: ${error.message}`);
        }
    }
}

module.exports = new MpesaService();