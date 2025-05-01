require('dotenv').config();

const mpesaConfig = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    passKey: process.env.MPESA_PASS_KEY,
    shortCode: process.env.MPESA_SHORT_CODE,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
};

module.exports = mpesaConfig;