const mpesaService = require('../services/mpesaService');
const { validatePhoneNumber, formatPhoneNumber } = require('../utils/phoneUtils');

exports.initiatePayment = async (req, res) => {
    const debug = (message, data = null) => {
        console.log(`[MPESA-PAYMENT] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    };

    debug('Payment initiation request received', { body: req.body });
    
    try {
        const { phoneNumber, amount, bookingId } = req.body;

        if (!validatePhoneNumber(phoneNumber)) {
            debug('Invalid phone number format', { phoneNumber });
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid phone number format. Use format: 254XXXXXXXXX' 
            });
        }

        const formattedPhone = formatPhoneNumber(phoneNumber);
        const accountReference = `HomeHelp-${bookingId}`;
        const transactionDesc = 'Payment for Home Help Service';

        debug('Initiating STK Push', {
            phoneNumber: formattedPhone,
            amount,
            bookingId,
            accountReference
        });

        const db = req.app.locals.db;
        
        try {
            // First initiate the STK push
            const response = await mpesaService.initiateSTKPush(
                formattedPhone,
                amount,
                accountReference,
                transactionDesc
            );

            debug('STK Push response received', response);

            // Store only reference data for tracking
            await db.query(
                `INSERT INTO mpesa_requests (
                    booking_id,
                    merchant_request_id,
                    checkout_request_id,
                    phone_number,
                    amount,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())`,
                [
                    bookingId,
                    response.MerchantRequestID,
                    response.CheckoutRequestID,
                    formattedPhone,
                    amount
                ]
            );

            res.status(200).json({
                success: true,
                message: 'STK push initiated successfully',
                data: response
            });
        } catch (error) {
            debug('Payment initiation failed', error);
            throw error;
        }
    } catch (error) {
        debug('Payment initiation failed', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Failed to initiate payment',
            error: error.message
        });
    }
};

exports.handleCallback = async (req, res) => {
    const debug = (message, data = null) => {
        console.log(`[MPESA-CALLBACK] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    };
    
    debug('Callback received', { body: req.body });
    const db = req.app.locals.db;
    
    try {
        const result = await mpesaService.handleCallback(req.body);
        debug('Callback processing result', result);

        await db.query('START TRANSACTION');
        debug('Started database transaction');

        // Get the mpesa request details
        const [mpesaRequest] = await db.query(
            `SELECT * FROM mpesa_requests 
             WHERE merchant_request_id = ? AND processed = false`,
            [result.merchantRequestId]
        );

        if (mpesaRequest.length === 0) {
            debug('No matching unprocessed M-Pesa request found');
            await db.query('COMMIT');
            return res.status(404).json({
                success: false,
                message: 'No matching M-Pesa request found'
            });
        }

        const request = mpesaRequest[0];

        if (result.success) {
            debug('Payment successful, creating payment record');

            // Create the payment record
            await db.query(
                `INSERT INTO payments (
                    booking_id,
                    amount,
                    payment_method,
                    status,
                    merchant_request_id,
                    mpesa_receipt,
                    transaction_date,
                    created_at,
                    updated_at
                ) VALUES (?, ?, 'mpesa', 'completed', ?, ?, ?, NOW(), NOW())`,
                [
                    request.booking_id,
                    result.amount,
                    result.merchantRequestId,
                    result.mpesaReceiptNumber,
                    result.transactionDate
                ]
            );

            // Update booking status
            await db.query(
                'UPDATE bookings SET status = ? WHERE id = ?',
                ['confirmed', request.booking_id]
            );

            // Create notification for provider
            const [providerInfo] = await db.query(
                `SELECT p.user_id as provider_user_id 
                 FROM bookings b
                 JOIN providers p ON b.provider_id = p.id
                 WHERE b.id = ?`,
                [request.booking_id]
            );

            if (providerInfo.length > 0) {
                debug('Creating provider notification', { providerId: providerInfo[0].provider_user_id });
                await db.query(
                    `INSERT INTO notifications (user_id, type, content)
                     VALUES (?, 'payment_received', ?)`,
                    [
                        providerInfo[0].provider_user_id,
                        `Payment received for booking #${request.booking_id}. Receipt: ${result.mpesaReceiptNumber}`
                    ]
                );
            }

            // Mark the request as processed
            await db.query(
                `UPDATE mpesa_requests SET processed = true WHERE id = ?`,
                [request.id]
            );

            await db.query('COMMIT');
            debug('Database transaction committed');
            
            res.status(200).json({
                success: true,
                message: 'Payment completed successfully',
                data: result
            });
        } else {
            debug('Payment failed', { 
                merchantRequestId: result.merchantRequestId,
                resultCode: result.resultCode,
                resultDesc: result.resultDesc 
            });
            
            // Create failed payment record
            await db.query(
                `INSERT INTO payments (
                    booking_id,
                    amount,
                    payment_method,
                    status,
                    merchant_request_id,
                    failure_reason,
                    created_at,
                    updated_at
                ) VALUES (?, ?, 'mpesa', 'failed', ?, ?, NOW(), NOW())`,
                [
                    request.booking_id,
                    request.amount,
                    result.merchantRequestId,
                    result.resultDesc || 'Payment failed'
                ]
            );

            // Update booking status to cancelled
            await db.query(
                'UPDATE bookings SET status = ? WHERE id = ?',
                ['cancelled', request.booking_id]
            );

            // Mark the request as processed
            await db.query(
                `UPDATE mpesa_requests SET processed = true WHERE id = ?`,
                [request.id]
            );

            await db.query('COMMIT');
            debug('Database transaction committed for failed payment');

            res.status(200).json({
                success: false,
                message: 'Payment failed',
                error: result.resultDesc
            });
        }
    } catch (error) {
        debug('Error processing callback', { error: error.message, stack: error.stack });
        await db.query('ROLLBACK');
        debug('Database transaction rolled back');
        
        res.status(500).json({
            success: false,
            message: 'Failed to process callback',
            error: error.message
        });
    }
};
