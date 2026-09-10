const dotenv = require('dotenv');
dotenv.config();

/**
 * AI Service Configuration
 * Central configuration source for the FastAPI AI Service URL.
 */
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

module.exports = {
  AI_SERVICE_URL,
};
