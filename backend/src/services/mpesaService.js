const axios = require('axios');
const mpesaConfig = require('../config/mpesa');

class MpesaService {
    constructor() {
        this.baseUrl = mpesaConfig.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    async generateAccessToken() {
        const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
        try {
            const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            });
            return response.data.access_token;
        } catch (error) {
            throw new Error('Failed to generate access token');
        }
    }

    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
        const accessToken = await this.generateAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(
            `${mpesaConfig.shortCode}${mpesaConfig.passKey}${timestamp}`
        ).toString('base64');

        try {
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
            return response.data;
        } catch (error) {
            throw new Error('STK push failed');
        }
    }

    async handleCallback(callbackData) {
        // Handle the callback data from M-Pesa
        const resultCode = callbackData.Body.stkCallback.ResultCode;
        const resultDesc = callbackData.Body.stkCallback.ResultDesc;
        const merchantRequestId = callbackData.Body.stkCallback.MerchantRequestID;

        if (resultCode === 0) {
            const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
            const amount = callbackMetadata.find(item => item.Name === 'Amount').Value;
            const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
            const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate').Value;
            const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber').Value;

            return {
                success: true,
                merchantRequestId,
                amount,
                mpesaReceiptNumber,
                transactionDate,
                phoneNumber
            };
        }

        return {
            success: false,
            merchantRequestId,
            resultCode,
            resultDesc
        };
    }
}

module.exports = new MpesaService();