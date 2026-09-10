/**
 * Security headers middleware to harden HTTP responses
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Enable XSS filtering in legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Hide powered-by header
  res.removeHeader('X-Powered-By');

  next();
};

module.exports = securityHeaders;
