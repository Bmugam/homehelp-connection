const paymentController = {
  createPayment: async (req, res) => {
    const db = req.app.locals.db;
    const { bookingId, amount, paymentMethod, status } = req.body;
    const user_id = req.user.id;

    console.log('createPayment called with:', { bookingId, amount, paymentMethod, status, user_id });

    try {
      // Verify booking belongs to client
      const [bookingRows] = await db.query(
        `SELECT b.id FROM bookings b
         JOIN clients c ON b.client_id = c.id
         WHERE b.id = ? AND c.user_id = ?`,
        [bookingId, user_id]
      );

      if (bookingRows.length === 0) {
        console.log('createPayment booking not found or unauthorized:', { bookingId, user_id });
        return res.status(404).json({ message: 'Booking not found or unauthorized' });
      }

      // Insert payment
      const [result] = await db.query(
        `INSERT INTO payments (booking_id, amount, payment_method, status, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [bookingId, amount, paymentMethod, status]
      );

      console.log('createPayment success, inserted paymentId:', result.insertId);

      res.status(201).json({ message: 'Payment created successfully', paymentId: result.insertId });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ message: 'Error creating payment' });
    }
  },

  getPaymentsByClient: async (req, res) => {
    const db = req.app.locals.db;
    const user_id = req.user.id;

    console.log('getPaymentsByClient called with user_id:', user_id);

    try {
      // Get client id
      const [clientRows] = await db.query('SELECT id FROM clients WHERE user_id = ?', [user_id]);
      if (clientRows.length === 0) {
        console.log('getPaymentsByClient client not found for user_id:', user_id);
        return res.status(404).json({ message: 'Client not found' });
      }
      const client_id = clientRows[0].id;

      // Get payments by client
      const [payments] = await db.query(
        `SELECT p.id, p.amount, p.payment_method, p.status, p.mpesa_receipt, 
                p.transaction_date, p.created_at, b.date as booking_date, 
                s.name as service_name
         FROM payments p
         JOIN bookings b ON p.booking_id = b.id
         JOIN services s ON b.service_id = s.id
         WHERE b.client_id = ?
         ORDER BY p.created_at DESC`,
        [client_id]
      );

      console.log('getPaymentsByClient success, payments count:', payments.length);

      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ message: 'Error fetching payments' });
    }
  },

  updatePayment: async (req, res) => {
    const db = req.app.locals.db;
    const paymentId = req.params.id;
    const user_id = req.user.id;
    const { amount, paymentMethod, status } = req.body;

    console.log('updatePayment called with:', { paymentId, amount, paymentMethod, status, user_id });

    try {
      // Verify payment belongs to client
      const [paymentRows] = await db.query(
        `SELECT p.id FROM payments p
         JOIN bookings b ON p.booking_id = b.id
         JOIN clients c ON b.client_id = c.id
         WHERE p.id = ? AND c.user_id = ?`,
        [paymentId, user_id]
      );

      if (paymentRows.length === 0) {
        console.log('updatePayment payment not found or unauthorized:', { paymentId, user_id });
        return res.status(404).json({ message: 'Payment not found or unauthorized' });
      }

      // Update payment
      await db.query(
        `UPDATE payments SET amount = ?, payment_method = ?, status = ? WHERE id = ?`,
        [amount, paymentMethod, status, paymentId]
      );

      console.log('updatePayment success for paymentId:', paymentId);

      res.json({ message: 'Payment updated successfully' });
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ message: 'Error updating payment' });
    }
  },

  deletePayment: async (req, res) => {
    const db = req.app.locals.db;
    const paymentId = req.params.id;
    const user_id = req.user.id;

    console.log('deletePayment called with:', { paymentId, user_id });

    try {
      // Verify payment belongs to client
      const [paymentRows] = await db.query(
        `SELECT p.id FROM payments p
         JOIN bookings b ON p.booking_id = b.id
         JOIN clients c ON b.client_id = c.id
         WHERE p.id = ? AND c.user_id = ?`,
        [paymentId, user_id]
      );

      if (paymentRows.length === 0) {
        console.log('deletePayment payment not found or unauthorized:', { paymentId, user_id });
        return res.status(404).json({ message: 'Payment not found or unauthorized' });
      }

      // Delete payment
      await db.query(`DELETE FROM payments WHERE id = ?`, [paymentId]);

      console.log('deletePayment success for paymentId:', paymentId);

      res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
      console.error('Error deleting payment:', error);
      res.status(500).json({ message: 'Error deleting payment' });
    }
  },

  getPaymentsByProvider: async (req, res) => {
    const db = req.app.locals.db;
    const user_id = req.user.id;

    console.log('getPaymentsByProvider called with user_id:', user_id);

    try {
      // Get provider id
      const [providerRows] = await db.query('SELECT id FROM providers WHERE user_id = ?', [user_id]);
      if (providerRows.length === 0) {
        console.log('getPaymentsByProvider provider not found for user_id:', user_id);
        return res.status(404).json({ message: 'Provider not found' });
      }
      const provider_id = providerRows[0].id;

      // Get payments by provider
      const [payments] = await db.query(
        `SELECT p.id, p.amount, p.payment_method, p.status, p.mpesa_receipt,
                p.transaction_date, p.created_at, b.date as booking_date, 
                s.name as service_name, 
                u.first_name, u.last_name, u.phone_number
         FROM payments p
         JOIN bookings b ON p.booking_id = b.id
         JOIN services s ON b.service_id = s.id
         JOIN clients c ON b.client_id = c.id
         JOIN users u ON c.user_id = u.id
         WHERE b.provider_id = ?
         ORDER BY p.created_at DESC`,
        [provider_id]
      );

      console.log('getPaymentsByProvider success, payments count:', payments.length);

      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments by provider:', error);
      res.status(500).json({ message: 'Error fetching payments by provider' });
    }
  }
};

module.exports = paymentController;
