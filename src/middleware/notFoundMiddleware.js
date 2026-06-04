const responseHandler = require('../utils/responseHandler');

/**
 * Middleware to handle unmatched routes (404)
 */
function notFoundMiddleware(req, res, next) {
  return responseHandler.error(
    res,
    `Cannot ${req.method} ${req.originalUrl} - Route Not Found`,
    404
  );
}

module.exports = notFoundMiddleware;
