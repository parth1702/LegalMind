const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration & DB connection
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');

// Middleware
const requestLogger = require('./middleware/loggerMiddleware');
const securityHeaders = require('./middleware/securityMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const path = require('path');

// Routes
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express App
const app = express();

// Connect to MongoDB and seed Admin credentials
connectDB().then(() => {
  seedAdmin();
});

// Security & CORS Middleware
app.use(securityHeaders);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logging Middleware
app.use(requestLogger);

// Mount API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Root Index Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'LegalMind AI Backend API Operating',
    health: '/api/health',
  });
});

// Central Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Express Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `[Server] LegalMind Backend Foundation running on port ${PORT} in ${
      process.env.NODE_ENV || 'development'
    } mode`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});

module.exports = server;
