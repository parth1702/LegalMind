/**
 * Custom lightweight HTTP request logger middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} - ${statusCode} (${duration}ms)`
    );
  });

  next();
};

module.exports = requestLogger;
