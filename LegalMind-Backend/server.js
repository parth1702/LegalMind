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

// --- CORS: Support single or comma-separated origins ---
// Example: CORS_ORIGIN=https://legalmind.vercel.app,https://legalmind-api.koyeb.app
const rawOrigin = process.env.CORS_ORIGIN || '*';
const allowedOrigins =
  rawOrigin === '*' ? '*' : rawOrigin.split(',').map((o) => o.trim());

// Security & CORS Middleware
app.use(securityHeaders);
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: allowedOrigins !== '*',
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
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
    environment: process.env.NODE_ENV || 'development',
  });
});

// Central Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Express Server — bind to 0.0.0.0 so Koyeb can route traffic
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[Server] LegalMind Backend running on port ${PORT} in ${
      process.env.NODE_ENV || 'development'
    } mode`
  );
});

// --- Graceful Shutdown (required by Koyeb & all cloud platforms) ---
const gracefulShutdown = (signal) => {
  console.log(`[Server] ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed. Exiting process.');
    process.exit(0);
  });
  // Force kill after 10 seconds if still hanging
  setTimeout(() => {
    console.error('[Server] Forced exit after 10s timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('unhandledRejection');
  }
});

module.exports = server;
