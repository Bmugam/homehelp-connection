const reviewController = {
  createReview: async (req, res) => {
    const db = req.app.locals.db;
    const { bookingId, rating, comment } = req.body;
    const user_id = req.user.id;

    try {
      // First, get the client_id from the user_id
      const [clientRows] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [user_id]
      );

      if (clientRows.length === 0) {
        return res.status(404).json({ message: 'Client profile not found' });
      }
      
      const client_id = clientRows[0].id;

      // Verify booking exists and belongs to client
      const [bookingRows] = await db.query(
        `SELECT b.id, b.provider_id, b.status 
         FROM bookings b
         WHERE b.id = ? AND b.client_id = ?`,
        [bookingId, client_id]
      );

      if (bookingRows.length === 0) {
        return res.status(404).json({ message: 'Booking not found or does not belong to you' });
      }

      // Check if booking is completed
      if (bookingRows[0].status !== 'completed') {
        return res.status(400).json({ message: 'Can only review completed bookings' });
      }

      // Check if booking has successful payment
      const [paymentRows] = await db.query(
        `SELECT id FROM payments WHERE booking_id = ? AND status = 'paid'`,
        [bookingId]
      );

      if (paymentRows.length === 0) {
        return res.status(400).json({ message: 'Payment required before reviewing this booking' });
      }

      const provider_id = bookingRows[0].provider_id;

      // Check if review already exists for this booking
      const [existingReview] = await db.query(
        'SELECT id FROM reviews WHERE booking_id = ?',
        [bookingId]
      );

      if (existingReview.length > 0) {
        return res.status(409).json({ message: 'A review already exists for this booking' });
      }

      // Insert review
      const [result] = await db.query(
        `INSERT INTO reviews (booking_id, client_id, provider_id, rating, comment, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [bookingId, client_id, provider_id, rating, comment]
      );

      // Update provider average rating
      await updateProviderRating(db, provider_id);

      res.status(201).json({ 
        message: 'Review created successfully', 
        reviewId: result.insertId 
      });
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
      const [clientRows] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?', 
        [user_id]
      );
      
      if (clientRows.length === 0) {
        return res.status(404).json({ message: 'Client profile not found' });
      }
      
      const client_id = clientRows[0].id;

      // Get reviews by client
      const [reviews] = await db.query(
        `SELECT r.id, r.booking_id, r.rating, r.comment, r.created_at, 
                s.name as service_name, s.category as service_category,
                p.business_name as provider_name
         FROM reviews r
         JOIN bookings b ON r.booking_id = b.id
         JOIN services s ON b.service_id = s.id
         JOIN providers p ON r.provider_id = p.id
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

  getReviewsByProvider: async (req, res) => {
    const db = req.app.locals.db;
    const providerId = req.params.providerId;

    try {
      // Get reviews for this provider
      const [reviews] = await db.query(
        `SELECT r.id, r.rating, r.comment, r.created_at,
                s.name as service_name, 
                CONCAT(u.first_name, ' ', u.last_name) as client_name
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
      res.status(500).json({ message: 'Error fetching provider reviews' });
    }
  },

  updateReview: async (req, res) => {
    const db = req.app.locals.db;
    const reviewId = req.params.id;
    const user_id = req.user.id;
    const { rating, comment } = req.body;

    try {
      // Get client_id
      const [clientRows] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [user_id]
      );
      
      if (clientRows.length === 0) {
        return res.status(404).json({ message: 'Client profile not found' });
      }
      
      const client_id = clientRows[0].id;

      // Verify review belongs to client
      const [reviewRows] = await db.query(
        `SELECT r.id, r.provider_id FROM reviews r
         WHERE r.id = ? AND r.client_id = ?`,
        [reviewId, client_id]
      );

      if (reviewRows.length === 0) {
        return res.status(404).json({ message: 'Review not found or unauthorized' });
      }

      const provider_id = reviewRows[0].provider_id;

      // Update review
      await db.query(
        `UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?`,
        [rating, comment, reviewId]
      );

      // Update provider average rating
      await updateProviderRating(db, provider_id);

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
      // Get client_id
      const [clientRows] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [user_id]
      );
      
      if (clientRows.length === 0) {
        return res.status(404).json({ message: 'Client profile not found' });
      }
      
      const client_id = clientRows[0].id;

      // Verify review belongs to client and get provider_id before deletion
      const [reviewRows] = await db.query(
        `SELECT r.id, r.provider_id FROM reviews r
         WHERE r.id = ? AND r.client_id = ?`,
        [reviewId, client_id]
      );

      if (reviewRows.length === 0) {
        return res.status(404).json({ message: 'Review not found or unauthorized' });
      }

      const provider_id = reviewRows[0].provider_id;

      // Delete review
      await db.query(
        `DELETE FROM reviews WHERE id = ?`, 
        [reviewId]
      );

      // Update provider average rating
      await updateProviderRating(db, provider_id);

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Error deleting review' });
    }
  }
};

// Helper function to update provider's average rating
async function updateProviderRating(db, providerId) {
  try {
    // Calculate new average rating
    const [ratingResult] = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count 
       FROM reviews 
       WHERE provider_id = ?`,
      [providerId]
    );
    
    const avgRating = ratingResult[0].avg_rating || 0;
    const reviewCount = ratingResult[0].review_count || 0;

    // Update provider record
    await db.query(
      `UPDATE providers 
       SET average_rating = ?, review_count = ? 
       WHERE id = ?`,
      [avgRating, reviewCount, providerId]
    );
    
    return true;
  } catch (error) {
    console.error('Error updating provider rating:', error);
    return false;
  }
}

module.exports = reviewController;