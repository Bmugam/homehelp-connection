const mpesaService = require('../services/mpesaService');
const { validatePhoneNumber, formatPhoneNumber } = require('../utils/phoneUtils');

exports.initiatePayment = async (req, res) => {
    console.log('Received M-Pesa payment initiation request:', req.body);
    try {
        const { phoneNumber, amount, bookingId } = req.body;

        if (!validatePhoneNumber(phoneNumber)) {
            console.log('Invalid phone number format:', phoneNumber);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid phone number format. Use format: 254XXXXXXXXX' 
            });
        }

        const formattedPhone = formatPhoneNumber(phoneNumber);
        const accountReference = `HomeHelp-${bookingId}`;
        const transactionDesc = 'Payment for Home Help Service';

        console.log(`Initiating payment for bookingId: ${bookingId}, phoneNumber: ${formattedPhone}, amount: ${amount}`);

        const response = await mpesaService.initiateSTKPush(
            formattedPhone,
            amount,
            accountReference,
            transactionDesc
        );

        console.log('M-Pesa payment initiation response:', response);

        res.status(200).json({
            success: true,
            message: 'STK push initiated successfully',
            data: response
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate payment',
            error: error.message
        });
    }
};

exports.handleCallback = async (req, res) => {
    try {
        const result = await mpesaService.handleCallback(req.body);
        
        // Here you would typically update your database with the payment status
        // and trigger any necessary notifications

        res.status(200).json({
            success: true,
            message: 'Callback processed successfully',
            data: result
        });
    } catch (error) {
        console.error('Callback processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process callback',
            error: error.message
        });
    }
};