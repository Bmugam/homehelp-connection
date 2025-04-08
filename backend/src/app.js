// server.js or app.js

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { setupDatabase, createConnectionPool } = require('./config/database');
const config = require('./config/config');
require('dotenv').config();
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Database initialization
async function initializeApp() {
  console.log('Database configuration:', {
    host: config.DB.HOST,
    user: config.DB.USER,
    database: config.DB.DATABASE
  });

  // Set up database and tables
  const dbSetupSuccess = await setupDatabase();
  
  if (!dbSetupSuccess) {
    console.error('Failed to set up database. Exiting application.');
    process.exit(1);
  }
  
  // Create database connection pool for the application to use
  const db = createConnectionPool();
  
  // Make db available to route handlers
  app.locals.db = db;
  
  // Example API route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HomeHelp API is running' });
  });
  
  // API routes with base prefix
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/admin', adminRoutes);
  app.use('/api/bookings', require('./routes/bookingRoutes'));
   // Add this back after creating the file
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });

  // Handle production
  if (config.NODE_ENV === 'production') {
    // Serve any static files from the client build directory
    app.use(express.static(path.join(__dirname, 'client/build')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
  }
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);
  });
}

// Start the application
initializeApp().catch(err => {
  console.error('Failed to initialize application:', err);
  process.exit(1);
});