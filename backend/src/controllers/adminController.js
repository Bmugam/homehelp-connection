const debug = require('debug')('admin:controller');

// Activity helper functions
const ActivityTypes = {
  BOOKING: 'booking',
  PROVIDER_VERIFICATION: 'provider_verification',
  USER_REGISTRATION: 'user_registration'
};

const getActivityDescription = (activity) => {
  try {
    switch (activity.type) {
      case ActivityTypes.BOOKING:
        return `${activity.client_name || 'A client'} booked ${activity.service_name || 'a service'} with ${activity.provider_name || 'a provider'}`;
      
      case ActivityTypes.PROVIDER_VERIFICATION:
        return `Provider ${activity.provider_name || 'Unknown'} was ${activity.status.toLowerCase()}`;
      
      case ActivityTypes.USER_REGISTRATION:
        return `New ${activity.user_type} registered: ${activity.provider_name || activity.client_name}`;
      
      default:
        console.warn('Unknown activity type:', activity.type);
        return 'Unknown activity';
    }
  } catch (error) {
    console.error('Error generating activity description:', error, activity);
    return 'Activity description unavailable';
  }
};

module.exports = {
  // Dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [users] = await db.query('SELECT COUNT(*) as count FROM users WHERE user_type = "client" OR user_type = "provider"');
      const [clients] = await db.query('SELECT COUNT(*) as count FROM users WHERE user_type = "client"');
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
    console.log('Fetching recent users...');
    try {
      const db = req.app.locals.db;
      const [users] = await db.query(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.user_type,
          u.created_at,
          CASE 
            WHEN u.user_type = 'provider' THEN p.verification_status
            ELSE NULL
          END as verification_status,
          CASE 
            WHEN u.user_type = 'provider' THEN p.business_name
            ELSE NULL
          END as business_name
        FROM users u
        LEFT JOIN providers p ON u.id = p.user_id
        ORDER BY u.created_at DESC
        LIMIT 10
      `);

      console.log(`Found ${users.length} recent users`);
      res.json(users);
    } catch (error) {
      console.error('Error fetching recent users:', error);
      res.status(500).json({ 
        message: 'Error fetching recent users',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getAllProviders: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [providers] = await db.query(`
        SELECT 
          u.id, u.first_name, u.last_name, u.email, u.phone_number, 
          u.user_type, u.profile_image, u.created_at,
          JSON_OBJECT(
            'id', p.id,
            'business_name', p.business_name,
            'business_description', p.business_description,
            'location', p.location,
            'verification_status', p.verification_status,
            'availability_hours', p.availability_hours,
            'average_rating', CAST(p.average_rating AS DECIMAL(10,1)),
            'review_count', p.review_count,
            'reviews', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', r.id,
                  'rating', r.rating,
                  'comment', r.comment,
                  'created_at', r.created_at,
                  'client_name', CONCAT(cu.first_name, ' ', cu.last_name)
                )
              )
              FROM reviews r
              JOIN clients c ON r.client_id = c.id
              JOIN users cu ON c.user_id = cu.id
              WHERE r.provider_id = p.id
            ),
            'services', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'service_id', s.id,
                  'name', s.name,
                  'category', s.category,
                  'price', CAST(ps.price AS DECIMAL(10,2)),
                  'description', ps.description,
                  'availability', ps.availability
                )
              )
              FROM provider_services ps
              JOIN services s ON ps.service_id = s.id
              WHERE ps.provider_id = p.id
            )
          ) as provider
        FROM users u
        JOIN providers p ON u.id = p.user_id
        WHERE u.user_type = 'provider'
        ORDER BY u.created_at DESC
      `);

      res.json(providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
      res.status(500).json({ message: 'Error fetching providers' });
    }
  },

  getAllServices: async (req, res) => {
    try {
      const db = req.app.locals.db;
      
      // Fetch all services
      const [services] = await db.query(`
        SELECT
          s.id,
          s.name,
          s.description,
          s.category,
          s.image
        FROM services s
        ORDER BY s.name ASC
      `);
      
      // Fetch providers for each service
      const serviceIds = services.map(service => service.id);
      let providersByService = {};
      
      if (serviceIds.length > 0) {
        const [providerRows] = await db.query(`
          SELECT
            ps.service_id,
            p.id as provider_id,
            p.business_name,
            u.first_name,
            u.last_name,
            p.location,
            ps.price,
            ps.description,
            ps.availability,
            p.verification_status,
            p.average_rating,
            p.review_count
          FROM provider_services ps
          JOIN providers p ON ps.provider_id = p.id
          JOIN users u ON p.user_id = u.id
          WHERE ps.service_id IN (?)
        `, [serviceIds]);
        
        providersByService = providerRows.reduce((acc, row) => {
          if (!acc[row.service_id]) {
            acc[row.service_id] = [];
          }
          acc[row.service_id].push({
            provider_id: row.provider_id,
            business_name: row.business_name,
            provider_name: `${row.first_name} ${row.last_name}`, // Combining first and last name
            location: row.location,
            price: row.price,
            description: row.description,
            availability: typeof row.availability === 'string' ? JSON.parse(row.availability) : row.availability,
            verification_status: row.verification_status,
            average_rating: row.average_rating,
            review_count: row.review_count
          });
          return acc;
        }, {});
      }
      
      // Attach providers to services
      const servicesWithProviders = services.map(service => ({
        ...service,
        providers: providersByService[service.id] || []
      }));
      
      res.json(servicesWithProviders);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ message: 'Error fetching services' });
    }
  },

  editService: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const serviceId = parseInt(req.params.id);
      
      // Validate serviceId
      if (!serviceId || isNaN(serviceId)) {
        return res.status(400).json({ message: 'Invalid service ID' });
      }
      
      const { name, description, category, image } = req.body;
      
      // Validate required fields
      if (!name || !category) {
        return res.status(400).json({ message: 'Name and category are required' });
      }
      
      // Check if service exists
      const [existingService] = await db.query('SELECT id FROM services WHERE id = ?', [serviceId]);
      if (existingService.length === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      // Update service
      await db.query(`
        UPDATE services
        SET name = ?,
            description = ?,
            category = ?,
            image = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, description, category, image, serviceId]);
      
      // Fetch the updated service
      const [updatedService] = await db.query(`
        SELECT id, name, description, category, image, created_at, updated_at
        FROM services
        WHERE id = ?
      `, [serviceId]);
      
      res.json({
        message: 'Service updated successfully',
        service: updatedService[0]
      });
      
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ message: 'Error updating service' });
    }
  },

  createService: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { name, description, category, image } = req.body;

      const [result] = await db.query(
        'INSERT INTO services (name, description, category, image) VALUES (?, ?, ?, ?)',
        [name, description, category, image]
      );

      res.status(201).json({ 
        id: result.insertId,
        name,
        description,
        category,
        image 
      });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ message: 'Error creating service' });
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

  createProvider: async (req, res) => {
    const connection = await req.app.locals.db.getConnection();
    try {
      await connection.beginTransaction();
      
      const { 
        first_name, last_name, email, phone_number, password,
        profile_image, provider: providerData 
      } = req.body;

      // Create user
      const [userResult] = await connection.query(
        'INSERT INTO users (user_type, email, password_hash, phone_number, first_name, last_name, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['provider', email, await bcrypt.hash(password, 10), phone_number, first_name, last_name, profile_image]
      );
      
      const userId = userResult.insertId;

      // Create provider record
      const [providerResult] = await connection.query(
        `INSERT INTO providers (
          user_id, business_name, business_description, location, 
          verification_status, availability_hours
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          providerData.business_name,
          providerData.business_description,
          providerData.location,
          'pending',
          JSON.stringify(providerData.availability_hours || {})
        ]
      );

      // Add provider services
      if (providerData.services?.length > 0) {
        for (const service of providerData.services) {
          await connection.query(
            'INSERT INTO provider_services (provider_id, service_id, price, description, availability) VALUES (?, ?, ?, ?, ?)',
            [
              providerResult.insertId,
              service.service_id,
              service.price,
              service.description,
              JSON.stringify(service.availability || {})
            ]
          );
        }
      }

      await connection.commit();
      res.status(201).json({ id: userId, message: 'Provider created successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Create provider error:', error);
      res.status(500).json({ message: 'Error creating provider' });
    } finally {
      connection.release();
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

  updateProviderStatus: async (req, res) => {
    const connection = await req.app.locals.db.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;
      const { verification_status } = req.body;

      await connection.query(
        'UPDATE providers SET verification_status = ? WHERE user_id = ?',
        [verification_status, id]
      );

      await connection.commit();
      res.json({ message: 'Provider status updated successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating provider status:', error);
      res.status(500).json({ message: 'Error updating provider status' });
    } finally {
      connection.release();
    }
  },

  verifyProvider: async (req, res) => {
    debug('Attempting to verify provider:', req.params.id);
    const connection = await req.app.locals.db.getConnection();
    try {
      await connection.beginTransaction();
      debug('Transaction started');
      
      const { id } = req.params;
      const { verification_status } = req.body;

      debug('Updating provider verification status:', { id, status: verification_status });

      // Update verification status
      const [result] = await connection.query(
        'UPDATE providers SET verification_status = ? WHERE id = ?',
        [verification_status, id]
      );

      debug('Update result:', result);

      if (result.affectedRows === 0) {
        debug('No provider found with ID:', id);
        await connection.rollback();
        return res.status(404).json({ 
          message: 'Provider not found',
          debug: { id, verification_status }
        });
      }

      // If rejecting, cancel all pending bookings
      if (verification_status === 'rejected') {
        debug('Cancelling pending bookings for rejected provider:', id);
        const [cancelResult] = await connection.query(
          `UPDATE bookings b 
           JOIN providers p ON b.provider_id = p.id 
           SET b.status = 'cancelled' 
           WHERE p.id = ? AND b.status = 'pending'`,
          [id]
        );
        debug('Cancelled bookings result:', cancelResult);
      }

      await connection.commit();
      debug('Transaction committed successfully');
      
      res.json({ 
        message: `Provider ${verification_status} successfully`,
        status: verification_status,
        debug: {
          providerId: id,
          newStatus: verification_status,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      debug('Error in verifyProvider:', error);
      await connection.rollback();
      debug('Transaction rolled back');
      
      console.error('Error verifying provider:', error);
      res.status(500).json({ 
        message: 'Error updating provider verification status',
        debug: process.env.NODE_ENV === 'development' ? {
          error: error.message,
          stack: error.stack
        } : undefined
      });
    } finally {
      connection.release();
      debug('Database connection released');
    }
  },

  updateProvider: async (req, res) => {
    const connection = await req.app.locals.db.getConnection();
    try {
      await connection.beginTransaction();
      
      const { id } = req.params;
      const { verification_status, ...providerData } = req.body;

      // Update provider basic info
      await connection.query(
        'UPDATE providers SET ? WHERE id = ?',
        [providerData, id]
      );

      await connection.commit();
      res.json({ message: 'Provider updated successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating provider:', error);
      res.status(500).json({ message: 'Error updating provider' });
    } finally {
      connection.release();
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
    console.log('Fetching all bookings...');
    try {
      const db = req.app.locals.db;
      const [bookings] = await db.query(`
        SELECT 
          b.id,
          b.client_id,
          b.provider_id,
          b.service_id,
          b.date,
          b.time_slot,
          b.location,
          b.notes,
          b.status,
          b.created_at,
          c_user.first_name as client_first_name,
          c_user.last_name as client_last_name,
          c_user.email as client_email,
          c_user.phone_number as client_phone,
          p.business_name,
          p_user.first_name as provider_first_name,
          p_user.last_name as provider_last_name,
          p_user.email as provider_email,
          p.verification_status as verification_status,
          s.name as service_name,
          ps.price as service_price,
          COALESCE(pm.amount, 0) as payment_amount,
          COALESCE(pm.status, 'pending') as payment_status
        FROM bookings b
        JOIN clients c ON b.client_id = c.id
        JOIN users c_user ON c.user_id = c_user.id
        JOIN providers p ON b.provider_id = p.id
        JOIN users p_user ON p.user_id = p_user.id
        JOIN services s ON b.service_id = s.id
        JOIN provider_services ps ON (ps.provider_id = p.id AND ps.service_id = s.id)
        LEFT JOIN payments pm ON b.id = pm.booking_id
        ORDER BY b.created_at DESC
      `);

      const formattedBookings = bookings.map(booking => ({
        id: booking.id,
        client_id: booking.client_id,
        provider_id: booking.provider_id,
        service_id: booking.service_id,
        date: booking.date,
        time_slot: booking.time_slot,
        location: booking.location,
        notes: booking.notes,
        status: booking.status,
        created_at: booking.created_at,
        client: {
          first_name: booking.client_first_name,
          last_name: booking.client_last_name,
          email: booking.client_email,
          phone_number: booking.client_phone
        },
        provider: {
          business_name: booking.business_name,
          first_name: booking.provider_first_name,
          last_name: booking.provider_last_name,
          email: booking.provider_email,
          verification_status: booking.verification_status
        },
        service: {
          name: booking.service_name,
          price: parseFloat(booking.service_price)
        },
        payment: {
          amount: parseFloat(booking.payment_amount),
          status: booking.payment_status
        }
      }));

      console.log('Successfully formatted bookings:', formattedBookings.length);
      res.json(formattedBookings);
    } catch (error) {
      console.error('Error in getAllBookings:', error);
      res.status(500).json({ 
        message: 'Error fetching bookings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  },

  updateBookingStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const db = req.app.locals.db;

      const [result] = await db.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: 'Error updating booking status' });
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

  getRecentActivities: async (req, res) => {
    console.log('Fetching recent activities...');
    try {
      const db = req.app.locals.db;
      const [activities] = await db.query(`
        (SELECT 
          'booking' as type,
          b.id,
          b.created_at,
          b.status,
          CONCAT(c_user.first_name, ' ', c_user.last_name) as client_name,
          CONCAT(p_user.first_name, ' ', p_user.last_name) as provider_name,
          s.name as service_name,
          b.date as activity_date
        FROM bookings b
        JOIN clients c ON b.client_id = c.id
        JOIN users c_user ON c.user_id = c_user.id
        JOIN providers p ON b.provider_id = p.id
        JOIN users p_user ON p.user_id = p_user.id
        JOIN services s ON b.service_id = s.id
        ORDER BY b.created_at DESC
        LIMIT 10)
        
        UNION ALL
        
        (SELECT 
          'provider_verification' as type,
          p.id,
          p.updated_at as created_at,
          p.verification_status as status,
          NULL as client_name,
          CONCAT(u.first_name, ' ', u.last_name) as provider_name,
          p.business_name as service_name,
          p.updated_at as activity_date
        FROM providers p
        JOIN users u ON p.user_id = u.id
        WHERE p.verification_status IN ('verified', 'rejected')
        ORDER BY p.updated_at DESC
        LIMIT 10)
        
        ORDER BY created_at DESC
        LIMIT 20
      `);

      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        timestamp: activity.created_at,
        description: getActivityDescription(activity),
        details: {
          status: activity.status,
          client_name: activity.client_name,
          provider_name: activity.provider_name,
          service_name: activity.service_name,
          activity_date: activity.activity_date
        }
      }));

      console.log(`Found ${formattedActivities.length} recent activities`);
      res.json(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ 
        message: 'Error fetching activities',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
    const connection = await req.app.locals.db.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;

      // Delete from providers table first (cascading will handle provider_services)
      await connection.query('DELETE FROM providers WHERE user_id = ?', [id]);
      // Then delete the user
      await connection.query('DELETE FROM users WHERE id = ?', [id]);

      await connection.commit();
      res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting provider:', error);
      res.status(500).json({ message: 'Error deleting provider' });
    } finally {
      connection.release();
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
  },

  // Detailed user management
  getDetailedUsers: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [users] = await db.query(`
        SELECT 
          u.*,
          JSON_OBJECT(
            'address', c.address,
            'location_coordinates', c.location_coordinates,
            'preferences', c.preferences
          ) as client,
          JSON_OBJECT(
            'business_name', p.business_name,
            'business_description', p.business_description,
            'location', p.location,
            'verification_status', p.verification_status,
            'availability_hours', p.availability_hours,
            'average_rating', p.average_rating,
            'review_count', p.review_count,
            'services', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'service_id', ps.service_id,
                  'name', s.name,
                  'price', ps.price,
                  'description', ps.description,
                  'availability', ps.availability
                )
              )
              FROM provider_services ps
              JOIN services s ON ps.service_id = s.id
              WHERE ps.provider_id = p.id
            )
          ) as provider
        FROM users u
        LEFT JOIN clients c ON u.id = c.user_id
        LEFT JOIN providers p ON u.id = p.user_id
      `);

      res.json(users);
    } catch (error) {
      console.error('Get detailed users error:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  createDetailedUser: async (req, res) => {
    const connection = await req.app.locals.db.getConnection();
    try {
      await connection.beginTransaction();

      const { user_type, email, password, phone_number, first_name, last_name, profile_image, client, provider } = req.body;

      // Create user
      const [userResult] = await connection.query(
        'INSERT INTO users (user_type, email, password_hash, phone_number, first_name, last_name, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_type, email, await bcrypt.hash(password, 10), phone_number, first_name, last_name, profile_image]
      );

      const userId = userResult.insertId;

      // Create client/provider specific record
      if (user_type === 'client' && client) {
        await connection.query(
          'INSERT INTO clients (user_id, address, location_coordinates, preferences) VALUES (?, ?, POINT(?, ?), ?)',
          [userId, client.address, client.location_coordinates.lat, client.location_coordinates.lng, JSON.stringify(client.preferences)]
        );
      } else if (user_type === 'provider' && provider) {
        const [providerResult] = await connection.query(
          'INSERT INTO providers (user_id, business_name, business_description, location, verification_status, availability_hours) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, provider.business_name, provider.business_description, provider.location, provider.verification_status, JSON.stringify(provider.availability_hours)]
        );

        // Add provider services
        if (provider.services?.length > 0) {
          const providerId = providerResult.insertId;
          for (const service of provider.services) {
            await connection.query(
              'INSERT INTO provider_services (provider_id, service_id, price, description, availability) VALUES (?, ?, ?, ?, ?)',
              [providerId, service.service_id, service.price, service.description, JSON.stringify(service.availability)]
            );
          }
        }
      }

      await connection.commit();
      res.status(201).json({ id: userId, message: 'User created successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Create detailed user error:', error);
      res.status(500).json({ message: 'Error creating user' });
    } finally {
      connection.release();
    }
  },

  updateDetailedUser: async (req, res) => {
    const connection = await req.app.locals.db.getConnection();
    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const { user_type, email, phone_number, first_name, last_name, profile_image, client, provider } = req.body;

      // Update user
      await connection.query(
        'UPDATE users SET email = ?, phone_number = ?, first_name = ?, last_name = ?, profile_image = ? WHERE id = ?',
        [email, phone_number, first_name, last_name, profile_image, id]
      );

      // Update client/provider specific record
      if (user_type === 'client' && client) {
        await connection.query(
          'UPDATE clients SET address = ?, location_coordinates = POINT(?, ?), preferences = ? WHERE user_id = ?',
          [client.address, client.location_coordinates.lat, client.location_coordinates.lng, JSON.stringify(client.preferences), id]
        );
      } else if (user_type === 'provider' && provider) {
        await connection.query(
          'UPDATE providers SET business_name = ?, business_description = ?, location = ?, verification_status = ?, availability_hours = ? WHERE user_id = ?',
          [provider.business_name, provider.business_description, provider.location, provider.verification_status, JSON.stringify(provider.availability_hours), id]
        );

        // Update provider services
        if (provider.services?.length > 0) {
          const [providerResult] = await connection.query('SELECT id FROM providers WHERE user_id = ?', [id]);
          const providerId = providerResult[0].id;

          // Delete existing services
          await connection.query('DELETE FROM provider_services WHERE provider_id = ?', [providerId]);

          // Add updated services
          for (const service of provider.services) {
            await connection.query(
              'INSERT INTO provider_services (provider_id, service_id, price, description, availability) VALUES (?, ?, ?, ?, ?)',
              [providerId, service.service_id, service.price, service.description, JSON.stringify(service.availability)]
            );
          }
        }
      }

      await connection.commit();
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Update detailed user error:', error);
      res.status(500).json({ message: 'Error updating user' });
    } finally {
      connection.release();
    }
  }
};
