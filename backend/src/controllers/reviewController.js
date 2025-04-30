const reviewController = {
  createReview: async (req, res) => {
    const db = req.app.locals.db;
    const { bookingId, rating, comment } = req.body;
    const user_id = req.user.id;

    try {
      // Verify booking belongs to client
      const [bookingRows] = await db.query(
        `SELECT b.id FROM bookings b
         JOIN clients c ON b.client_id = c.id
         WHERE b.id = ? AND c.user_id = ?`,
        [bookingId, user_id]
      );

      if (bookingRows.length === 0) {
        return res.status(404).json({ message: 'Booking not found or unauthorized' });
      }

      // Insert review
      const [result] = await db.query(
        `INSERT INTO reviews (booking_id, client_id, provider_id, rating, comment, created_at)
         SELECT b.id, c.id, b.provider_id, ?, ?, NOW()
         FROM bookings b
         JOIN clients c ON b.client_id = c.id
         WHERE b.id = ?`,
        [rating, comment, bookingId]
      );

      res.status(201).json({ message: 'Review created successfully', reviewId: result.insertId });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Error creating review' });
    }
  },

  getReviewsByClient: async (req, res) => {
    const db = req.app.locals.db;
    const user_id = req.user.id;

    try {
      // Get client id
      const [clientRows] = await db.query('SELECT id FROM clients WHERE user_id = ?', [user_id]);
      if (clientRows.length === 0) {
        return res.status(404).json({ message: 'Client not found' });
      }
      const client_id = clientRows[0].id;

      // Get reviews by client
      const [reviews] = await db.query(
        `SELECT r.id, r.rating, r.comment, r.created_at, s.name as service_name, p.business_name as provider_name
         FROM reviews r
         JOIN bookings b ON r.booking_id = b.id
         JOIN services s ON b.service_id = s.id
         JOIN providers p ON b.provider_id = p.id
         WHERE r.client_id = ?
         ORDER BY r.created_at DESC`,
        [client_id]
      );

      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  },

  updateReview: async (req, res) => {
    const db = req.app.locals.db;
    const reviewId = req.params.id;
    const user_id = req.user.id;
    const { rating, comment } = req.body;

    try {
      // Verify review belongs to client
      const [reviewRows] = await db.query(
        `SELECT r.id FROM reviews r
         JOIN clients c ON r.client_id = c.id
         WHERE r.id = ? AND c.user_id = ?`,
        [reviewId, user_id]
      );

      if (reviewRows.length === 0) {
        return res.status(404).json({ message: 'Review not found or unauthorized' });
      }

      // Update review
      await db.query(
        `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`,
        [rating, comment, reviewId]
      );

      res.json({ message: 'Review updated successfully' });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ message: 'Error updating review' });
    }
  },

  deleteReview: async (req, res) => {
    const db = req.app.locals.db;
    const reviewId = req.params.id;
    const user_id = req.user.id;

    try {
      // Verify review belongs to client
      const [reviewRows] = await db.query(
        `SELECT r.id FROM reviews r
         JOIN clients c ON r.client_id = c.id
         WHERE r.id = ? AND c.user_id = ?`,
        [reviewId, user_id]
      );

      if (reviewRows.length === 0) {
        return res.status(404).json({ message: 'Review not found or unauthorized' });
      }

      // Delete review
      await db.query(`DELETE FROM reviews WHERE id = ?`, [reviewId]);

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Error deleting review' });
    }
  }
};

module.exports = reviewController;
