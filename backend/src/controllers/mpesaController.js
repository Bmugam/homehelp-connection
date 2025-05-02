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

        // Store the payment attempt in the database
        const db = req.app.locals.db;
        
        try {
            debug('Starting database transaction');
            await db.query('START TRANSACTION');

            const response = await mpesaService.initiateSTKPush(
                formattedPhone,
                amount,
                accountReference,
                transactionDesc
            );

            debug('STK Push response received', response);

            // Store payment attempt
            await db.query(
                `INSERT INTO payments (
                    booking_id, 
                    amount, 
                    payment_method, 
                    status, 
                    merchant_request_id,
                    transaction_date,
                    created_at
                ) VALUES (?, ?, 'mpesa', 'pending', ?, NOW(), NOW())`,
                [bookingId, amount, response.MerchantRequestID]
            );

            await db.query('COMMIT');
            debug('Payment record created successfully');

            res.status(200).json({
                success: true,
                message: 'STK push initiated successfully',
                data: response
            });
        } catch (dbError) {
            debug('Database error occurred', dbError);
            await db.query('ROLLBACK');
            throw dbError;
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

        if (result.success) {
            debug('Payment successful, updating database');
            // Update payment status
            const [paymentRows] = await db.query(
                `UPDATE payments 
                 SET status = 'completed',
                     mpesa_receipt = ?,
                     transaction_date = ?,
                     updated_at = NOW()
                 WHERE merchant_request_id = ?
                 RETURNING booking_id`,
                [result.mpesaReceiptNumber, result.transactionDate, result.merchantRequestId]
            );

            if (paymentRows.length > 0) {
                const bookingId = paymentRows[0].booking_id;
                debug('Found booking to update', { bookingId });
                
                // Update booking status
                await db.query(
                    'UPDATE bookings SET status = \'confirmed\' WHERE id = ?',
                    [bookingId]
                );
                debug('Updated booking status to confirmed');

                // Create notification for provider
                const [providerInfo] = await db.query(
                    `SELECT p.user_id as provider_user_id 
                     FROM bookings b
                     JOIN providers p ON b.provider_id = p.id
                     WHERE b.id = ?`,
                    [bookingId]
                );

                if (providerInfo.length > 0) {
                    debug('Creating provider notification', { providerId: providerInfo[0].provider_user_id });
                    await db.query(
                        `INSERT INTO notifications (user_id, type, content)
                         VALUES (?, 'payment_received', ?)`,
                        [
                            providerInfo[0].provider_user_id,
                            `Payment received for booking #${bookingId}. Receipt: ${result.mpesaReceiptNumber}`
                        ]
                    );
                }
            }

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
            
            // Update payment status for failed transaction
            await db.query(
                `UPDATE payments 
                 SET status = 'failed',
                     failure_reason = ?,
                     updated_at = NOW()
                 WHERE merchant_request_id = ?`,
                [result.resultDesc, result.merchantRequestId]
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
