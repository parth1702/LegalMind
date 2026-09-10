const mongoose = require('mongoose');

/**
 * @desc    Get system health & db status
 * @route   GET /api/health
 * @access  Public
 */
const getHealth = (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    status: 'ok',
    service: 'LegalMind Backend Foundation',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStateMap[dbState] || 'unknown',
      connected: dbState === 1,
    },
  });
};

module.exports = {
  getHealth,
};
