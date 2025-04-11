const adminController = {
  // Dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [users] = await db.query('SELECT COUNT(*) as count FROM users WHERE user_type = "client" OR user_type = "provider"');
      const [clients]=await db.query('SELECT COUNT(*) as count FROM users WHERE user_type = "client"');
      const [providers] = await db.query('SELECT COUNT(*) as count FROM users WHERE user_type = "provider"');
      const [bookings] = await db.query('SELECT COUNT(*) as count FROM bookings');
      const [services] = await db.query('SELECT COUNT(*) as count FROM services');
      
      
      res.json({
        totalUsers: users[0].count,
        totalProviders: providers[0].count,
        totalClients: clients[0].count,
        totalBookings: bookings[0].count,
        totalServices: services[0].count
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [users] = await db.query('SELECT * FROM users');
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  getRecentUsers: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [users] = await db.query(
        'SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 5'
      );
      res.json(users);
    } catch (error) {
      console.error('Get recent users error:', error);
      res.status(500).json({ message: 'Error fetching recent users' });
    }
  },

  getAllProviders: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [providers] = await db.query(`
        SELECT u.*, p.location, p.business_description 
        FROM users u 
        JOIN providers p ON u.id = p.user_id 
        WHERE u.user_type = 'provider'
      `);
      res.json(providers);
    } catch (error) {
      console.error('Get all providers error:', error);
      res.status(500).json({ message: 'Error fetching providers' });
    }
  },

  getAllServices: async (req, res) => {
    console.log('[DEBUG] Starting getAllServices request');
    try {
      const db = req.app.locals.db;
      if (!db) {
        console.error('[ERROR] Database connection is missing');
        return res.status(500).json({ message: 'Database connection error' });
      }

      const query = `
        SELECT 
          s.*,
          JSON_ARRAYAGG(
            CASE 
              WHEN p.id IS NULL THEN JSON_OBJECT()
              ELSE JSON_OBJECT(
                'provider_id', CAST(p.id AS CHAR),
                'business_name', COALESCE(p.business_name, ''),
                'provider_name', COALESCE(CONCAT(u.first_name, ' ', u.last_name), ''),
                'location', COALESCE(p.location, ''),
                'price', CAST(COALESCE(ps.price, 0) AS DECIMAL(10,2)),
                'description', COALESCE(ps.description, ''),
                'availability', COALESCE(ps.availability, ''),
                'verification_status', COALESCE(p.verification_status, 'pending'),
                'average_rating', CAST(COALESCE(p.average_rating, 0) AS DECIMAL(10,1)),
                'review_count', COALESCE(p.review_count, 0)
              )
            END
          ) as providers
        FROM services s
        LEFT JOIN provider_services ps ON s.id = ps.service_id
        LEFT JOIN providers p ON ps.provider_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        GROUP BY s.id
      `;
      console.log('[DEBUG] Executing query:', query);

      const [services] = await db.query(query);
      console.log('[DEBUG] Query results:', {
        rowCount: services.length,
        firstService: services.length > 0 ? services[0] : null,
        providersCount: services.length > 0 ? services[0].providers?.length : 0
      });

      if (services.length === 0) {
        console.warn('[WARNING] No services found in database');
        
        // Check if tables exist
        const [tables] = await db.query("SHOW TABLES LIKE 'services'");
        if (tables.length === 0) {
          console.error('[ERROR] services table does not exist');
        }
      }

      const formattedServices = services.map(service => ({
        ...service,
        providers: (service.providers || [])
          .filter(provider => Object.keys(provider).length > 0)
          .map(provider => ({
            ...provider,
            price: Number(provider.price || 0),
            average_rating: Number(provider.average_rating || 0),
            review_count: Number(provider.review_count || 0)
          }))
      }));

      console.log('[DEBUG] Formatted services:', {
        count: formattedServices.length,
        sample: formattedServices.length > 0 ? formattedServices[0] : null
      });

      res.json(formattedServices);
    } catch (error) {
      console.error('[ERROR] Get all services error:', {
        message: error.message,
        sql: error.sql,
        stack: error.stack
      });
      
      res.status(500).json({ 
        message: 'Error fetching services',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    }
  },

  // Create methods
  createUser: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { email, first_name, last_name, password, user_type } = req.body;
      const [result] = await db.query(
        'INSERT INTO users (email, first_name, last_name, password_hash, user_type) VALUES (?, ?, ?, ?, ?)',
        [email, first_name, last_name, password, user_type]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(400).json({ message: 'Error creating user' });
    }
  },

  // Update methods
  updateUser: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { id } = req.params;
      const { email, first_name, last_name } = req.body;
      const [result] = await db.query(
        'UPDATE users SET email = ?, first_name = ?, last_name = ? WHERE id = ?',
        [email, first_name, last_name, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(400).json({ message: 'Error updating user' });
    }
  },

  getServiceById: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [services] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
      if (services.length === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json(services[0]);
    } catch (error) {
      console.error('Get service error:', error);
      res.status(500).json({ message: 'Error fetching service' });
    }
  },

  // Bookings
  getAllBookings: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [bookings] = await db.query(`
        SELECT b.*, u.first_name, u.last_name, s.name 
        FROM bookings b 
        JOIN users u ON b.client_id = u.id 
        JOIN services s ON b.service_id = s.id
      `);
      res.json(bookings);
    } catch (error) {
      console.error('Get all bookings error:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  },

  getBookingById: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
      if (bookings.length === 0) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.json(bookings[0]);
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({ message: 'Error fetching booking' });
    }
  },

  // Admin activities
  getAdminActivities: async (req, res) => {
    try {
      // Implement your admin activities logic here
      const activities = []; // Replace with actual activities data
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateProvider: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { id } = req.params;
      const { email, first_name, last_name, location, business_description } = req.body;
      
      await db.query('START TRANSACTION');
      
      const [userResult] = await db.query(
        'UPDATE users SET email = ?, first_name = ?, last_name = ? WHERE id = ? AND user_type = "provider"',
        [email, first_name, last_name, id]
      );

      if (userResult.affectedRows === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Provider not found' });
      }

      const [providerResult] = await db.query(
        'UPDATE providers SET location = ?, business_description = ? WHERE user_id = ?',
        [location, business_description, id]
      );

      await db.query('COMMIT');
      res.json({ message: 'Provider updated successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Update provider error:', error);
      res.status(400).json({ message: 'Error updating provider' });
    }
  },

  // Delete methods
  deleteUser: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { id } = req.params;
      const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  },

  deleteProvider: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { id } = req.params;
      const [result] = await db.query('DELETE FROM providers WHERE user_id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
      console.error('Delete provider error:', error);
      res.status(500).json({ message: 'Error deleting provider' });
    }
  },

  deleteService: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { id } = req.params;
      const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      console.error('Delete service error:', error);
      res.status(500).json({ message: 'Error deleting service' });
    }
  },

  bulkDeleteServices: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid service IDs provided' });
      }

      const [result] = await db.query('DELETE FROM services WHERE id IN (?)', [ids]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No services found' });
      }

      res.json({ 
        message: `Successfully deleted ${result.affectedRows} services`,
        deletedCount: result.affectedRows 
      });
    } catch (error) {
      console.error('Bulk delete services error:', error);
      res.status(500).json({ message: 'Error deleting services' });
    }
  },

  deleteBooking: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { id } = req.params;
      const [result] = await db.query('DELETE FROM bookings WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      console.error('Delete booking error:', error);
      res.status(500).json({ message: 'Error deleting booking' });
    }
  }
};

module.exports = adminController;
