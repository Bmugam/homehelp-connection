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

      const client_id = clientRows[0].id;

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

      const provider_id = providerRows[0].id;

      // 3. Verify service belongs to provider
      const [serviceRows] = await db.query(
        'SELECT * FROM provider_services WHERE provider_id = ? AND service_id = ?',
        [provider_id, serviceId]
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
          client_id,
          provider_id,
          serviceId,
          date,
          time,
          location,
          notes,
          'pending'
        ]
      );

      // 5. Create notification for provider
      const [providerUserRow] = await db.query(
        'SELECT user_id FROM providers WHERE id = ?',
        [provider_id]
      );

      if (providerUserRow.length > 0) {
        await db.query(
          `INSERT INTO notifications (user_id, type, content)
           VALUES (?, 'new_booking', ?)`,
          [
            providerUserRow[0].user_id,
            `New booking request for ${date} at ${time}`
          ]
        );
      }

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

      // Get the client ID for this user
      const [clientRows] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [user_id]
      );

      if (clientRows.length === 0) {
        return res.status(404).json({ message: 'Client profile not found' });
      }

      const client_id = clientRows[0].id;

      // Get bookings with payment status and review information
      const [bookings] = await db.query(`
        SELECT 
          b.id,
          b.client_id,
          b.provider_id,
          b.service_id,
          b.status,
          DATE_FORMAT(b.date, '%Y-%m-%d') as date,
          b.time_slot,
          b.location,
          b.notes,
          p.business_name as provider_name,
          p.average_rating as provider_rating,
          s.name as service_name,
          b.created_at,
          b.updated_at,
          COALESCE(ps.price, 0) as price,
          COALESCE(
            (SELECT status 
             FROM payments 
             WHERE booking_id = b.id 
             ORDER BY created_at DESC 
             LIMIT 1
            ), 'pending'
          ) as payment_status,
          EXISTS(
            SELECT 1 
            FROM reviews r 
            WHERE r.booking_id = b.id
          ) as has_review,
          COALESCE(
            (SELECT rating 
             FROM reviews r 
             WHERE r.booking_id = b.id
            ), 0
          ) as rating
        FROM bookings b
        JOIN providers p ON b.provider_id = p.id
        JOIN services s ON b.service_id = s.id
        LEFT JOIN provider_services ps ON (ps.provider_id = p.id AND ps.service_id = s.id)
        WHERE b.client_id = ?
        ORDER BY b.date DESC, b.time_slot ASC
      `, [client_id]);

      // Transform bookings to include payment and review eligibility
      const transformedBookings = bookings.map(booking => ({
        ...booking,
        is_paid: booking.payment_status === 'paid',
        can_review: booking.status === 'completed' && booking.payment_status === 'paid' && !booking.has_review
      }));

      res.json(transformedBookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  },

  updateBooking: async (req, res) => {
    const db = req.app.locals.db;
    const bookingId = req.params.id;
    const user_id = req.user.id;
    const { date, time, notes } = req.body;

    try {
      await db.query('START TRANSACTION');

      // Verify booking belongs to user
      const [bookingRows] = await db.query(`
        SELECT b.* FROM bookings b
        JOIN clients c ON b.client_id = c.id
        WHERE b.id = ? AND c.user_id = ?
      `, [bookingId, user_id]);

      if (bookingRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Booking not found or unauthorized' });
      }

      // Update booking details
      await db.query(
        `UPDATE bookings SET date = ?, time_slot = ?, notes = ? WHERE id = ?`,
        [date, time, notes, bookingId]
      );

      // Create notification for provider
      const provider_id = bookingRows[0].provider_id;
      const [providerUserRow] = await db.query(
        'SELECT user_id FROM providers WHERE id = ?',
        [provider_id]
      );

      if (providerUserRow.length > 0) {
        await db.query(
          `INSERT INTO notifications (user_id, type, content)
           VALUES (?, 'booking_update', ?)`,
          [
            providerUserRow[0].user_id,
            `Booking #${bookingId} has been rescheduled to ${date} at ${time}`
          ]
        );
      }

      await db.query('COMMIT');

      res.json({ 
        success: true,
        message: 'Booking updated successfully' 
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error updating booking:', error);
      res.status(500).json({ message: 'Error updating booking' });
    }
  },

  cancelBooking: async (req, res) => {
    const db = req.app.locals.db;
    const bookingId = req.params.id;
    const user_id = req.user.id;

    try {
      await db.query('START TRANSACTION');

      // Verify booking belongs to user
      const [bookingRows] = await db.query(`
        SELECT b.* FROM bookings b
        JOIN clients c ON b.client_id = c.id
        WHERE b.id = ? AND c.user_id = ?
      `, [bookingId, user_id]);

      if (bookingRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Booking not found or unauthorized' });
      }

      // Update booking status to cancelled
      await db.query(
        `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
        [bookingId]
      );

      // Create notification for provider
      const provider_id = bookingRows[0].provider_id;
      const [providerUserRow] = await db.query(
        'SELECT user_id FROM providers WHERE id = ?',
        [provider_id]
      );

      if (providerUserRow.length > 0) {
        await db.query(
          `INSERT INTO notifications (user_id, type, content)
           VALUES (?, 'booking_cancelled', ?)`,
          [
            providerUserRow[0].user_id,
            `Booking #${bookingId} has been cancelled by the client`
          ]
        );
      }

      await db.query('COMMIT');

      res.json({ 
        success: true,
        message: 'Booking cancelled successfully' 
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error cancelling booking:', error);
      res.status(500).json({ message: 'Error cancelling booking' });
    }
  },

  deleteBooking: async (req, res) => {
    const db = req.app.locals.db;
    const bookingId = req.params.id;
    const user_id = req.user.id;

    try {
      await db.query('START TRANSACTION');

      // Verify booking belongs to user
      const [bookingRows] = await db.query(`
        SELECT b.* FROM bookings b
        JOIN clients c ON b.client_id = c.id
        WHERE b.id = ? AND c.user_id = ?
      `, [bookingId, user_id]);

      if (bookingRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Booking not found or unauthorized' });
      }

      // Check if there are any dependencies (like payments, reviews)
      const [paymentRows] = await db.query(
        'SELECT id FROM payments WHERE booking_id = ?',
        [bookingId]
      );

      if (paymentRows.length > 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({ 
          message: 'Cannot delete booking with associated payments. Please cancel it instead.' 
        });
      }

      // Delete booking
      await db.query(
        `DELETE FROM bookings WHERE id = ?`,
        [bookingId]
      );

      await db.query('COMMIT');

      res.json({ 
        success: true,
        message: 'Booking deleted successfully' 
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error deleting booking:', error);
      res.status(500).json({ message: 'Error deleting booking' });
    }
  },

  getProviderAppointments: async (req, res) => {
    const db = req.app.locals.db;
    const provider_user_id = req.user.id;

    try {
      // First get the provider_id from the providers table using user_id
      const [provider] = await db.query(`
        SELECT id as provider_id 
        FROM providers 
        WHERE user_id = ?
      `, [provider_user_id]);

      if (!provider.length) {
        return res.status(404).json({
          success: false,
          message: 'Provider not found'
        });
      }

      const providerId = provider[0].provider_id;

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
          c.user_id as client_user_id,
          b.notes
        FROM bookings b
        JOIN clients c ON b.client_id = c.id
        JOIN users u ON c.user_id = u.id
        JOIN services s ON b.service_id = s.id
        JOIN provider_services ps ON b.service_id = ps.service_id AND b.provider_id = ps.provider_id
        WHERE b.provider_id = ?
        ORDER BY b.date DESC, b.time_slot ASC
      `, [providerId]);

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
    const user_id = req.user.id;

    try {
      await db.query('START TRANSACTION');

      // Get provider_id for this user
      const [providerRows] = await db.query(
        'SELECT id FROM providers WHERE user_id = ?',
        [user_id]
      );

      if (providerRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      const provider_id = providerRows[0].id;

      // Verify the appointment belongs to this provider
      const [booking] = await db.query(
        'SELECT * FROM bookings WHERE id = ? AND provider_id = ?',
        [id, provider_id]
      );

      if (!booking.length) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Appointment not found' });
      }

      await db.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id]
      );

      // Get client's user_id
      const [clientRows] = await db.query(
        'SELECT user_id FROM clients WHERE id = ?',
        [booking[0].client_id]
      );

      if (clientRows.length > 0) {
        // Create notification for client
        await db.query(
          `INSERT INTO notifications (user_id, type, content)
           VALUES (?, 'booking_update', ?)`,
          [
            clientRows[0].user_id,
            `Your booking has been ${status}`
          ]
        );
      }

      await db.query('COMMIT');

      res.json({ 
        success: true,
        message: 'Appointment status updated successfully' 
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error updating appointment status:', error);
      res.status(500).json({ message: 'Error updating appointment status' });
    }
  },

  rescheduleBooking: async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { date, time } = req.body;
    const user_id = req.user.id;

    try {
      await db.query('START TRANSACTION');

      // Check if the user is a client or provider
      const [clientRows] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [user_id]
      );
      
      const [providerRows] = await db.query(
        'SELECT id FROM providers WHERE user_id = ?',
        [user_id]
      );

      let client_id = null;
      let provider_id = null;
      let userType = '';

      if (clientRows.length > 0) {
        client_id = clientRows[0].id;
        userType = 'client';
      } else if (providerRows.length > 0) {
        provider_id = providerRows[0].id;
        userType = 'provider';
      } else {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'User profile not found' });
      }

      // Verify booking belongs to user (either as client or provider)
      let bookingQuery = '';
      let params = [];
      
      if (userType === 'client') {
        bookingQuery = 'SELECT * FROM bookings WHERE id = ? AND client_id = ?';
        params = [id, client_id];
      } else {
        bookingQuery = 'SELECT * FROM bookings WHERE id = ? AND provider_id = ?';
        params = [id, provider_id];
      }

      const [booking] = await db.query(bookingQuery, params);

      if (booking.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Booking not found or unauthorized' });
      }

      // Update booking schedule
      await db.query(
        'UPDATE bookings SET date = ?, time_slot = ? WHERE id = ?',
        [date, time, id]
      );

      // Determine who to notify
      let notifyUserId = null;
      
      if (userType === 'client') {
        // Get provider's user_id
        const [providerUserRows] = await db.query(
          'SELECT user_id FROM providers WHERE id = ?',
          [booking[0].provider_id]
        );
        if (providerUserRows.length > 0) {
          notifyUserId = providerUserRows[0].user_id;
        }
      } else {
        // Get client's user_id
        const [clientUserRows] = await db.query(
          'SELECT user_id FROM clients WHERE id = ?',
          [booking[0].client_id]
        );
        if (clientUserRows.length > 0) {
          notifyUserId = clientUserRows[0].user_id;
        }
      }

      // Create notification for the other party
      if (notifyUserId) {
        await db.query(
          `INSERT INTO notifications (user_id, type, content)
           VALUES (?, 'booking_rescheduled', ?)`,
          [
            notifyUserId,
            `Booking #${id} has been rescheduled to ${date} at ${time}`
          ]
        );
      }

      await db.query('COMMIT');

      res.json({ 
        success: true,
        message: 'Booking rescheduled successfully' 
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error rescheduling booking:', error);
      res.status(500).json({ message: 'Error rescheduling booking' });
    }
  },

  getAllBookings: async (req, res) => {
    const db = req.app.locals.db;
    
    try {
      const user_id = req.user.id;
      
      // Check if user is admin
      const [userRows] = await db.query(
        'SELECT user_type FROM users WHERE id = ?',
        [user_id]
      );
      
      if (userRows.length === 0 || userRows[0].user_type !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
      
      // Get all bookings with client, provider and service details
      const [bookings] = await db.query(`
        SELECT 
          b.id,
          b.status,
          DATE_FORMAT(b.date, '%Y-%m-%d') as date,
          b.time_slot,
          b.location,
          b.notes,
          CONCAT(cu.first_name, ' ', cu.last_name) as client_name,
          p.business_name as provider_name,
          s.name as service_name,
          b.created_at,
          b.updated_at
        FROM bookings b
        JOIN clients c ON b.client_id = c.id
        JOIN users cu ON c.user_id = cu.id
        JOIN providers p ON b.provider_id = p.id
        JOIN services s ON b.service_id = s.id
        ORDER BY b.date DESC, b.time_slot ASC
      `);

      res.json(bookings);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  }
};

module.exports = bookingController;