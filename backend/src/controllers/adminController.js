// controllers/adminController.js
const bcrypt = require('bcrypt');

// Users CRUD Operations
exports.getAllUsers = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [users] = await db.query(`
      SELECT id, email, first_name, last_name, user_type, phone_number, created_at 
      FROM users
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

exports.getUserById = async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  try {
    const [users] = await db.query(`
      SELECT id, email, first_name, last_name, user_type, phone_number, created_at 
      FROM users 
      WHERE id = ?
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

exports.createUser = async (req, res) => {
  const db = req.app.locals.db;
  const { name, email, phone, password, userType } = req.body;
  
  try {
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Insert user into database
    const [result] = await db.query(
      'INSERT INTO users (user_type, email, password_hash, phone_number, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      [userType, email, passwordHash, phone, firstName, lastName]
    );
    
    // Create corresponding client/provider record if needed
    if (userType === 'client') {
      await db.query('INSERT INTO clients (user_id) VALUES (?)', [result.insertId]);
    } else if (userType === 'provider') {
      await db.query('INSERT INTO providers (user_id) VALUES (?)', [result.insertId]);
    }
    
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
};

exports.updateUser = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { first_name, last_name, email, phone, userType } = req.body;
    
    try {
      // Validate required fields
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      // Update user with separate first_name and last_name fields
      const [result] = await db.query(
        'UPDATE users SET email = ?, phone_number = ?, user_type = ?, first_name = ?, last_name = ? WHERE id = ?',
        [email, phone || null, userType, first_name, last_name || '', id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error updating user' });
    }
  };


  
exports.deleteUser = async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// Providers CRUD Operations (similar structure to Users)
exports.getAllProviders = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [providers] = await db.query(`
      SELECT p.id, u.email, u.first_name, u.last_name, 
             p.business_name, p.location, p.verification_status, 
             p.created_at
      FROM providers p
      JOIN users u ON p.user_id = u.id
    `);
    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ message: 'Server error fetching providers' });
  }
};

exports.getProviderById = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    try {
        const [providers] = await db.query(`
            SELECT * FROM providers WHERE id = ?
        `, [id]);
        
        if (providers.length === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        
        res.json(providers[0]);
    } catch (error) {
        console.error('Error fetching provider:', error);
        res.status(500).json({ message: 'Server error fetching provider' });
    }
};

exports.createProvider = async (req, res) => {
    const db = req.app.locals.db;
    const { name, email, phone, businessName } = req.body;
    
    try {
        // Insert provider into database
        const [result] = await db.query(
            'INSERT INTO providers (name, email, phone, business_name) VALUES (?, ?, ?, ?)',
            [name, email, phone, businessName]
        );
        
        res.status(201).json({ message: 'Provider created successfully', providerId: result.insertId });
    } catch (error) {
        console.error('Error creating provider:', error);
        res.status(500).json({ message: 'Server error creating provider' });
    }
};

exports.updateProvider = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { name, email, phone, businessName } = req.body;
    
    try {
        const [result] = await db.query(
            'UPDATE providers SET name = ?, email = ?, phone = ?, business_name = ? WHERE id = ?',
            [name, email, phone, businessName, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        
        res.json({ message: 'Provider updated successfully' });
    } catch (error) {
        console.error('Error updating provider:', error);
        res.status(500).json({ message: 'Server error updating provider' });
    }
};

exports.deleteProvider = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    try {
        const [result] = await db.query('DELETE FROM providers WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        
        res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
        console.error('Error deleting provider:', error);
        res.status(500).json({ message: 'Server error deleting provider' });
    }
};

exports.getAllServices = async (req, res) => {
    const db = req.app.locals.db;
    try {
        const [services] = await db.query(`
            SELECT * FROM services
        `);
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Server error fetching services' });
    }
};

exports.getServiceById = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    try {
        const [services] = await db.query(`
            SELECT * FROM services WHERE id = ?
        `, [id]);
        
        if (services.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        res.json(services[0]);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Server error fetching service' });
    }
};

exports.createService = async (req, res) => {
    const db = req.app.locals.db;
    const { name, description, price } = req.body;
    
    try {
        const [result] = await db.query(
            'INSERT INTO services (name, description, price) VALUES (?, ?, ?)',
            [name, description, price]
        );
        
        res.status(201).json({ message: 'Service created successfully', serviceId: result.insertId });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Server error creating service' });
    }
};

exports.updateService = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { name, description, price } = req.body;
    
    try {
        const [result] = await db.query(
            'UPDATE services SET name = ?, description = ?, price = ? WHERE id = ?',
            [name, description, price, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        res.json({ message: 'Service updated successfully' });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Server error updating service' });
    }
};

exports.deleteService = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    try {
        const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Server error deleting service' });
    }
};

exports.getAllBookings = async (req, res) => {
    const db = req.app.locals.db;
    try {
        const [bookings] = await db.query(`
            SELECT * FROM bookings
        `);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error fetching bookings' });
    }
};

exports.getBookingById = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    try {
        const [bookings] = await db.query(`
            SELECT * FROM bookings WHERE id = ?
        `, [id]);
        
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(bookings[0]);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Server error fetching booking' });
    }
};

exports.createBooking = async (req, res) => {
    const db = req.app.locals.db;
    const { userId, serviceId, date, time } = req.body;
    
    try {
        const [result] = await db.query(
            'INSERT INTO bookings (user_id, service_id, date, time) VALUES (?, ?, ?, ?)',
            [userId, serviceId, date, time]
        );
        
        res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertId });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error creating booking' });
    }
};

exports.updateBooking = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { userId, serviceId, date, time } = req.body;
    
    try {
        const [result] = await db.query(
            'UPDATE bookings SET user_id = ?, service_id = ?, date = ?, time = ? WHERE id = ?',
            [userId, serviceId, date, time, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json({ message: 'Booking updated successfully' });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Server error updating booking' });
    }
};

exports.deleteBooking = async (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    try {
        const [result] = await db.query('DELETE FROM bookings WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Server error deleting booking' });
    }
};
