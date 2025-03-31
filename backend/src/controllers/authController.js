// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Register a new client user
const register = async (req, res) => {
  const { name, email, phone, password, userType } = req.body;
  const db = req.app.locals.db;
  
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
    
    // Insert user into database with userType as client
    const [result] = await db.query(
      'INSERT INTO users (user_type, email, password_hash, phone_number, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      ["client", email, passwordHash, phone, firstName, lastName]
    );
    
    // Create client record
    if (result.insertId) {
      await db.query('INSERT INTO clients (user_id) VALUES (?)', [result.insertId]);
    }
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Register a new provider user
const registerProvider = async (req, res) => {
  const { name, email, phone, location, services, bio, password } = req.body;
  const pool = req.app.locals.db;
  let connection;
  
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    
    // Check if user already exists
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
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
    
    // Start a transaction
    await connection.beginTransaction();
    
    try {
      // Insert user into database with userType as provider
      const [userResult] = await connection.query(
        'INSERT INTO users (user_type, email, password_hash, phone_number, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
        ["provider", email, passwordHash, phone, firstName, lastName]
      );
      
      const userId = userResult.insertId;
      
      // Create provider record with basic information
      if (userId) {
        // Insert into providers table with location and description (bio)
        const [providerResult] = await connection.query(
          'INSERT INTO providers (user_id, business_description, location) VALUES (?, ?, ?)',
          [userId, bio, location]
        );
        
        const providerId = providerResult.insertId;
        
        // Handle services - first parse the service names from the comma-separated string
        if (services && providerId) {
          const serviceNames = services.split(',').map(service => service.trim());
          
          // For each service
          for (const serviceName of serviceNames) {
            // Check if service already exists
            const [existingServices] = await connection.query(
              'SELECT id FROM services WHERE name = ?', 
              [serviceName]
            );
            
            let serviceId;
            
            // If service doesn't exist, create it
            if (existingServices.length === 0) {
              const [newService] = await connection.query(
                'INSERT INTO services (name, category) VALUES (?, ?)',
                [serviceName, 'General'] // Default category as 'General'
              );
              serviceId = newService.insertId;
            } else {
              serviceId = existingServices[0].id;
            }
            
            // Create relationship in provider_services table
            // We'll set a default price that the provider can update later
            await connection.query(
              'INSERT INTO provider_services (provider_id, service_id, price) VALUES (?, ?, ?)',
              [providerId, serviceId, 0.00] // Default price of 0
            );
          }
        }
      }
      
      // Commit transaction
      await connection.commit();
      res.status(201).json({ message: 'Provider registered successfully' });
    } catch (error) {
      // Rollback transaction in case of error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Provider registration error:', error);
    res.status(500).json({ message: 'Server error during provider registration' });
  } finally {
    // Release the connection back to the pool
    if (connection) connection.release();
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;
  const db = req.app.locals.db;
  
  try {
    console.log('Login attempt with email:', email); // Log email for debugging

    // Find user by email
    const [users] = await db.query(
      'SELECT id, email, password_hash, first_name, last_name, user_type FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    console.log('Database query result:', users); // Log query result for debugging
    
    if (users.length === 0) {
      console.error('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = users[0];
    console.log('User found:', user); // Log user details for debugging

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      console.error('Password mismatch for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.user_type },
      config.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Generated token:', token); // Log token for debugging

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = req.app.locals.db;
    
    const [users] = await db.query(
      'SELECT id, email, first_name, last_name, user_type, phone_number FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    res.json({
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      phone: user.phone_number,
      userType: user.user_type
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  registerProvider,
  login,
  getCurrentUser
};