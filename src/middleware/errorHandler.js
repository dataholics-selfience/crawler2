const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
