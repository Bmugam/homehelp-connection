const reviewController = {
  createReview: async (req, res) => {
    const db = req.app.locals.db;
    const user_id = req.user.id;
    const { bookingId, rating, comment } = req.body;

    try {
      await db.query('START TRANSACTION');

      // Get client ID for this user
      const [clientRows] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [user_id]
      );

      if (clientRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Client profile not found' });
      }

      const client_id = clientRows[0].id;

      // Verify booking belongs to client
      const [bookingRows] = await db.query(
        `SELECT b.*, p.id as provider_id, s.name as service_name 
         FROM bookings b
         JOIN providers p ON b.provider_id = p.id
         JOIN services s ON b.service_id = s.id
         WHERE b.id = ? AND b.client_id = ?`,
        [bookingId, client_id]
      );

      if (bookingRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Booking not found or unauthorized' });
      }

      // Check if booking is completed
      if (bookingRows[0].status !== 'completed') {
        await db.query('ROLLBACK');
        return res.status(400).json({ message: 'Can only review completed bookings' });
      }

      // Check if booking has successful payment
      const [paymentRows] = await db.query(
        `SELECT id FROM payments WHERE booking_id = ? AND status = 'paid'`,
        [bookingId]
      );

      if (paymentRows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({ message: 'Payment required before reviewing this booking' });
      }

      // Check if review already exists for this booking
      const [existingReview] = await db.query(
        'SELECT id FROM reviews WHERE booking_id = ?',
        [bookingId]
      );

      if (existingReview.length > 0) {
        await db.query('ROLLBACK');
        return res.status(409).json({ message: 'A review already exists for this booking' });
      }

      // Create the review
      const [result] = await db.query(
        `INSERT INTO reviews (booking_id, client_id, provider_id, rating, comment, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [bookingId, client_id, bookingRows[0].provider_id, rating, comment]
      );

      // Update provider's average rating
      await db.query(
        `UPDATE providers p
         SET average_rating = (
           SELECT AVG(rating)
           FROM reviews r
           WHERE r.provider_id = p.id
         )
         WHERE id = ?`,
        [bookingRows[0].provider_id]
      );

      // Create notification for provider
      await db.query(
        `INSERT INTO notifications (user_id, type, content)
         SELECT user_id, 'new_review', ? 
         FROM providers 
         WHERE id = ?`,
        [
          `New ${rating}-star review for ${bookingRows[0].service_name}`,
          bookingRows[0].provider_id
        ]
      );

      await db.query('COMMIT');

      res.status(201).json({ 
        message: 'Review created successfully',
        reviewId: result.insertId
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Error creating review' });
    }
  },

  getReviewsForBooking: async (req, res) => {
    const db = req.app.locals.db;
    const { bookingId } = req.params;

    try {
      const [reviews] = await db.query(
        `SELECT r.*, 
                CONCAT(u.first_name, ' ', u.last_name) as client_name,
                u.profile_image as client_image
         FROM reviews r
         JOIN clients c ON r.client_id = c.id
         JOIN users u ON c.user_id = u.id
         WHERE r.booking_id = ?`,
        [bookingId]
      );

      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  },

  getUserReviews: async (req, res) => {
    const db = req.app.locals.db;
    const user_id = req.user.id;

    try {
      // Get all reviews for bookings where this user is the client
      const [reviews] = await db.query(
        `SELECT r.*,
                s.name as service_name,
                p.business_name as provider_name,
                b.date as service_date
         FROM reviews r
         JOIN bookings b ON r.booking_id = b.id
         JOIN services s ON b.service_id = s.id
         JOIN providers p ON b.provider_id = p.id
         JOIN clients c ON r.client_id = c.id
         WHERE c.user_id = ?
         ORDER BY r.created_at DESC`,
        [user_id]
      );

      res.json(reviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  },

  getProviderReviews: async (req, res) => {
    const db = req.app.locals.db;
    const { providerId } = req.params;

    try {
      const [reviews] = await db.query(
        `SELECT r.*,
                CONCAT(u.first_name, ' ', u.last_name) as client_name,
                u.profile_image as client_image,
                s.name as service_name,
                b.date as service_date
         FROM reviews r
         JOIN bookings b ON r.booking_id = b.id
         JOIN services s ON b.service_id = s.id
         JOIN clients c ON r.client_id = c.id
         JOIN users u ON c.user_id = u.id
         WHERE r.provider_id = ?
         ORDER BY r.created_at DESC`,
        [providerId]
      );

      res.json(reviews);
    } catch (error) {
      console.error('Error fetching provider reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  }
};

module.exports = reviewController;