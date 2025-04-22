const bookingController = {
  createBooking: async (req, res) => {
    const db = req.app.locals.db;
    
    try {
      console.log('Received booking create request body:', req.body);
      const { providerId, serviceId, date, time, location, notes } = req.body;
      const user_id = req.user.id;

      await db.query('START TRANSACTION');

      // 1. Get client ID
      const [clientRows] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [user_id]
      );

      if (clientRows.length === 0) {
        console.log('Client profile not found for user_id:', user_id);
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Client profile not found' });
      }

      // 2. Verify provider exists and is active
      const [providerRows] = await db.query(
        'SELECT p.id FROM providers p JOIN users u ON p.user_id = u.id WHERE p.id = ? AND u.user_type = "provider"',
        [providerId]
      );

      if (providerRows.length === 0) {
        console.log('Provider not found for providerId:', providerId);
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Provider not found' });
      }

      // 3. Verify service belongs to provider
      const [serviceRows] = await db.query(
        'SELECT * FROM provider_services WHERE provider_id = ? AND service_id = ?',
        [providerRows[0].id, serviceId]
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
          serviceId,
          date,
          time,
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
          providerId,
          `New booking request for ${date} at ${time}`
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
  },

  updateBooking: async (req, res) => {
    const db = req.app.locals.db;
    const bookingId = req.params.id;
    const user_id = req.user.id;
    const { date, time, status, notes } = req.body;

    try {
      await db.query('START TRANSACTION');

      // Verify booking belongs to user
      const [bookingRows] = await db.query(
        `SELECT b.* FROM bookings b
         JOIN clients c ON b.client_id = c.id
         WHERE b.id = ? AND c.user_id = ?`,
        [bookingId, user_id]
      );

      if (bookingRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Update booking details
      await db.query(
        `UPDATE bookings SET date = ?, time_slot = ?, status = ?, notes = ? WHERE id = ?`,
        [date, time, status, notes, bookingId]
      );

      await db.query('COMMIT');

      res.json({ message: 'Booking updated successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error updating booking:', error);
      res.status(500).json({ message: 'Error updating booking' });
    }
  },

  deleteBooking: async (req, res) => {
    const db = req.app.locals.db;
    const bookingId = req.params.id;
    const user_id = req.user.id;

    try {
      await db.query('START TRANSACTION');

      // Verify booking belongs to user
      const [bookingRows] = await db.query(
        `SELECT b.* FROM bookings b
         JOIN clients c ON b.client_id = c.id
         WHERE b.id = ? AND c.user_id = ?`,
        [bookingId, user_id]
      );

      if (bookingRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Delete booking
      await db.query(
        `DELETE FROM bookings WHERE id = ?`,
        [bookingId]
      );

      await db.query('COMMIT');

      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error deleting booking:', error);
      res.status(500).json({ message: 'Error deleting booking' });
    }
  },

  getProviderAppointments: async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.params.providerId; // This is actually the user_id

    try {
      console.log('Getting appointments for user_id:', userId);

      // First get the provider_id from the providers table using user_id
      const [provider] = await db.query(`
        SELECT p.id as provider_id 
        FROM providers p 
        WHERE p.user_id = ?
      `, [userId]);

      if (!provider.length) {
        return res.status(404).json({
          success: false,
          message: 'Provider not found'
        });
      }

      const providerId = provider[0].provider_id;
      console.log('Found provider_id:', providerId);

      // Now get the appointments using provider_id
      const [appointments] = await db.query(`
        SELECT 
          b.id,
          CONCAT(u.first_name, ' ', u.last_name) as clientName,
          s.name as service,
          DATE_FORMAT(b.date, '%Y-%m-%d') as date,
          b.time_slot as time,
          b.location,
          b.status,
          ps.price,
          c.user_id as client_user_id
        FROM bookings b
        JOIN clients c ON b.client_id = c.id
        JOIN users u ON c.user_id = u.id
        JOIN services s ON b.service_id = s.id
        JOIN provider_services ps ON b.service_id = ps.service_id AND b.provider_id = ps.provider_id
        WHERE b.provider_id = ?
        ORDER BY b.date DESC, b.time_slot ASC
      `, [providerId]);

      console.log(`Found ${appointments.length} appointments for provider`);

      res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      console.error('Error in getProviderAppointments:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  updateAppointmentStatus: async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { status } = req.body;
    const providerId = req.user.id;

    try {
      // Verify the appointment belongs to this provider
      const [booking] = await db.query(
        'SELECT * FROM bookings WHERE id = ? AND provider_id = ?',
        [id, providerId]
      );

      if (!booking.length) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      await db.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id]
      );

      // Create notification for client
      await db.query(
        `INSERT INTO notifications (user_id, type, content)
         VALUES (?, 'booking_update', ?)`,
        [
          booking[0].client_id,
          `Your booking has been ${status}`
        ]
      );

      res.json({ message: 'Appointment status updated successfully' });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({ message: 'Error updating appointment status' });
    }
  },

  rescheduleBooking: async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { date, time } = req.body;
    const userId = req.user.id;

    try {
      const [booking] = await db.query(
        'SELECT * FROM bookings WHERE id = ? AND (client_id = ? OR provider_id = ?)',
        [id, userId, userId]
      );

      if (!booking.length) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      await db.query(
        'UPDATE bookings SET date = ?, time_slot = ? WHERE id = ?',
        [date, time, id]
      );

      // Notify other party about reschedule
      const notifyUserId = userId === booking[0].client_id 
        ? booking[0].provider_id 
        : booking[0].client_id;

      await db.query(
        `INSERT INTO notifications (user_id, type, content)
         VALUES (?, 'booking_rescheduled', ?)`,
        [
          notifyUserId,
          `Booking #${id} has been rescheduled to ${date} at ${time}`
        ]
      );

      res.json({ message: 'Booking rescheduled successfully' });
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      res.status(500).json({ message: 'Error rescheduling booking' });
    }
  },

  getAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.findAll({
        include: ['user', 'provider']
      });
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  }
};

module.exports = bookingController;
