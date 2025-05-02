// server.js or app.js

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { setupDatabase, createConnectionPool } = require('./config/database');
const config = require('./config/config');
require('dotenv').config();
const adminRoutes = require('./routes/adminRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const clientRoutes = require('./routes/clientRoutes');
const mpesaRoutes = require('./routes/mpesaRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const mpesaService = require('./services/mpesaService');

// Initialize Express app
const app = express();
const PORT = config.PORT;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:8080', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // Set to true only if using cookies
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log('--------------------');
  console.log('Incoming request:');
  console.log('URL:', req.url);
  // console.log('Method:', req.method);
  // console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('--------------------');
  next();
});

app.use(morgan('dev'));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
  app.use('/api/auth', authRoutes);
  app.use('/api/providers', providerRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/mpesa', mpesaRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reviews', reviewRoutes);

  // Add catch-all route for debugging
  app.use('*', (req, res) => {
    console.log('No route matched:', req.originalUrl);
    res.status(404).json({ message: 'Route not found', path: req.originalUrl });
  });

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

  // Schedule cleanup of stale payments every minute
  setInterval(async () => {
    try {
        await mpesaService.cleanupStalePendingPayments(app.locals.db);
    } catch (error) {
        console.error('Failed to cleanup stale payments:', error);
    }
  }, 60000); // Run every minute
  
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

module.exports = app;