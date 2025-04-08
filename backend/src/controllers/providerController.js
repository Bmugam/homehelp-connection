const providerController = {
  getAllProviders: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [providers] = await db.query(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.profile_image as image,
          ANY_VALUE(p.location) as location,
          ANY_VALUE(p.business_description) as bio,
          ANY_VALUE(p.average_rating) as rating,
          ANY_VALUE(p.review_count) as reviews,
          ANY_VALUE(p.verification_status) as verification_status,
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', s.id,
              'name', s.name,
              'price', COALESCE(ps.price, 0)
            )
          ) as services
        FROM users u
        JOIN providers p ON u.id = p.user_id
        LEFT JOIN provider_services ps ON p.id = ps.provider_id
        LEFT JOIN services s ON ps.service_id = s.id
        WHERE u.user_type = 'provider'
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone_number, u.profile_image
      `);

      const formattedProviders = providers.map(p => ({
        ...p,
        name: `${p.first_name} ${p.last_name}`,
        services: JSON.parse(`[${p.services}]`)
      }));

      res.json(formattedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
      res.status(500).json({ message: 'Error fetching providers' });
    }
  },

  getProviderById: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { id } = req.params;

      const [providers] = await db.query(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.profile_image as image,
          ANY_VALUE(p.location) as location,
          ANY_VALUE(p.business_description) as bio,
          ANY_VALUE(p.average_rating) as rating,
          ANY_VALUE(p.review_count) as reviews,
          ANY_VALUE(p.verification_status) as verification_status,
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', s.id,
              'name', s.name,
              'price', COALESCE(ps.price, 0)
            )
          ) as services
        FROM users u
        JOIN providers p ON u.id = p.user_id
        LEFT JOIN provider_services ps ON p.id = ps.provider_id
        LEFT JOIN services s ON ps.service_id = s.id
        WHERE u.id = ? AND u.user_type = 'provider'
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone_number, u.profile_image
      `, [id]);

      if (providers.length === 0) {
        return res.status(404).json({ message: 'Provider not found' });
      }

      const provider = {
        ...providers[0],
        name: `${providers[0].first_name} ${providers[0].last_name}`,
        services: JSON.parse(`[${providers[0].services}]`)
      };

      res.json(provider);
    } catch (error) {
      console.error('Error fetching provider:', error);
      res.status(500).json({ message: 'Error fetching provider details' });
    }
  },

  createBooking: async (req, res) => {
    const db = req.app.locals.db;
    
    try {
      const { provider_id, service_id, date, time_slot, location, notes } = req.body;
      const client_id = req.user.id; // From auth middleware

      await db.query('START TRANSACTION');

      // Get client record id
      const [clientResult] = await db.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [client_id]
      );

      if (!clientResult.length) {
        throw new Error('Client record not found');
      }

      // Create booking
      const [result] = await db.query(
        `INSERT INTO bookings 
        (client_id, provider_id, service_id, date, time_slot, location, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [clientResult[0].id, provider_id, service_id, date, time_slot, location, notes]
      );

      await db.query('COMMIT');

      res.status(201).json({ 
        message: 'Booking created successfully',
        booking_id: result.insertId 
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Error creating booking' });
    }
  }
};

module.exports = providerController;
