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
  const { name, email, phone, userType } = req.body;
  
  try {
    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Update user
    const [result] = await db.query(
      'UPDATE users SET email = ?, phone_number = ?, user_type = ?, first_name = ?, last_name = ? WHERE id = ?',
      [email, phone, userType, firstName, lastName, id]
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

// Similar methods for providers, services, and bookings...
// (Implement getProviderById, createProvider, updateProvider, deleteProvider)
// (Implement getAllServices, getServiceById, createService, updateService, deleteService)
// (Implement getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking)