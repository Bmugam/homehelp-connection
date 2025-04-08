const bookingController = {
  createBooking: async (req, res) => {
    const db = req.app.locals.db;
    
    try {
      const { provider_id, service_id, date, time_slot, location, notes } = req.body;
      const user_id = req.user.id;

      await db.query('START TRANSACTION');

      // 1. Get client ID
      const [clientRows] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [user_id]
      );

      if (clientRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Client profile not found' });
      }

      // 2. Verify provider exists and is active
      const [providerRows] = await db.query(
        'SELECT p.id FROM providers p JOIN users u ON p.user_id = u.id WHERE u.id = ? AND u.user_type = "provider"',
        [provider_id]
      );

      if (providerRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Provider not found' });
      }

      // 3. Verify service belongs to provider
      const [serviceRows] = await db.query(
        'SELECT * FROM provider_services WHERE provider_id = ? AND service_id = ?',
        [providerRows[0].id, service_id]
      );

      if (serviceRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({ message: 'Service not available from this provider' });
      }

      // 4. Create the booking
      const [result] = await db.query(
        `INSERT INTO bookings 
        (client_id, provider_id, service_id, date, time_slot, location, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientRows[0].id,
          providerRows[0].id,
          service_id,
          date,
          time_slot,
          location,
          notes,
          'pending'
        ]
      );

      // 5. Create notification for provider
      await db.query(
        `INSERT INTO notifications (user_id, type, content)
         VALUES (?, 'new_booking', ?)`,
        [
          provider_id,
          `New booking request for ${date} at ${time_slot}`
        ]
      );

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Booking created successfully',
        booking_id: result.insertId
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Booking creation error:', error);
      res.status(500).json({ message: 'Error creating booking' });
    }
  },

  getUserBookings: async (req, res) => {
    const db = req.app.locals.db;
    
    try {
      const user_id = req.user.id;

      // Get client's bookings with provider and service details
      const [bookings] = await db.query(`
        SELECT 
          b.*,
          p.business_name as provider_name,
          s.name as service_name
        FROM bookings b
        JOIN providers p ON b.provider_id = p.id
        JOIN services s ON b.service_id = s.id
        JOIN clients c ON b.client_id = c.id
        WHERE c.user_id = ?
        ORDER BY b.created_at DESC
      `, [user_id]);

      res.json(bookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  }
};

module.exports = bookingController;
