// db/setupDatabase.js
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const config = require('../config/config');

// Database connection configuration using config file
const dbConfig = {
  host: config.DB.HOST,
  user: config.DB.USER,
  password: config.DB.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create database if it doesn't exist
async function createDatabase() {
  try {
    // Connect without database selected
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.DB.DATABASE} 
                           CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log(`Database ${config.DB.DATABASE} created or already exists`);
    await connection.end();
    
    return true;
  } catch (err) {
    console.error('Error creating database:', err);
    throw err;
  }
}

// Create tables
async function createTables() {
  try {
    // Connect with database selected
    const connection = await mysql.createConnection({
      ...dbConfig,
      database: config.DB.DATABASE
    });
    
    console.log(`Connected to database: ${config.DB.DATABASE}`);

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_type ENUM('client', 'provider', 'admin') NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_user_type (user_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Users table created successfully');

    // Clients table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        address TEXT,
        location_coordinates POINT,
        preferences JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Clients table created successfully');

    // Rest of your table creation code...
    // (Keeping the same queries as your original code)
    
    // Providers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        business_description TEXT,
        location VARCHAR(255) NOT NULL,
        average_rating DECIMAL(3,2) DEFAULT 0,
        review_count INT DEFAULT 0,
        verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        availability_hours JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_average_rating (average_rating),
        INDEX idx_verification_status (verification_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Providers table created successfully');

    // Services table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Services table created successfully');

    // Provider Services table (Many-to-Many)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS provider_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        service_id INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        availability JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        UNIQUE KEY unique_provider_service (provider_id, service_id),
        INDEX idx_price (price)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Provider Services table created successfully');

    // Bookings/Appointments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        provider_id INT NOT NULL,
        service_id INT NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        date DATE NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        location TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Bookings table created successfully');

    // Reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        client_id INT NOT NULL,
        provider_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_booking_review (booking_id),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Reviews table created successfully');

    // Messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT NOT NULL,
        read_status BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_sender_receiver (sender_id, receiver_id),
        INDEX idx_read_status (read_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Messages table created successfully');

    // Payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'completed', 'refunded') DEFAULT 'pending',
        payment_method VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_transaction_id (transaction_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Payments table created successfully');

    // Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        read_status BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_read (user_id, read_status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Notifications table created successfully');

    await connection.end();
    console.log('All tables created successfully');
    return true;
  } catch (err) {
    console.error('Error creating tables:', err);
    throw err;
  }
}

// Insert default/seed data (basic examples)
async function insertSeedData() {
  try {
    const connection = await mysql.createConnection({
      ...dbConfig,
      database: config.DB.DATABASE
    });

    // Default service categories
    const serviceCategories = [
      { name: 'House Cleaning', description: 'Professional cleaning services for homes', category: 'Cleaning', image: '/images/services/cleaning.jpg' },
      { name: 'Plumbing', description: 'Plumbing repairs and installations', category: 'Maintenance', image: '/images/services/plumbing.jpg' },
      { name: 'Electrical', description: 'Electrical repairs and installations', category: 'Maintenance', image: '/images/services/electrical.jpg' },
      { name: 'Gardening', description: 'Garden maintenance and landscaping', category: 'Outdoor', image: '/images/services/gardening.jpg' }
    ];

    // Insert service categories
    for (const service of serviceCategories) {
      await connection.query(`
        INSERT INTO services (name, description, category, image)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        description = VALUES(description),
        image = VALUES(image)
      `, [service.name, service.description, service.category, service.image]);
    }
    console.log('Seed data inserted successfully');

    await connection.end();
    return true;
  } catch (err) {
    console.error('Error inserting seed data:', err);
    throw err;
  }
}

// Main function to run setup
async function setupDatabase() {
  try {
    await createDatabase();
    await createTables();
    await insertSeedData();
    console.log('Database setup completed successfully');
    return true;
  } catch (err) {
    console.error('Database setup failed:', err);
    return false;
  }
}

// Create connection pool for use in the application
const createConnectionPool = () => {
  return mysql.createPool({
    host: config.DB.HOST,
    user: config.DB.USER,
    password: config.DB.PASSWORD,
    database: config.DB.DATABASE,
    port: config.DB.PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

module.exports = {
  setupDatabase,
  createConnectionPool
};