const responseHandler = require('../utils/responseHandler');

/**
 * Centralized error handling middleware
 */
function errorMiddleware(err, req, res, next) {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Handle JSON parsing errors specifically
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return responseHandler.error(res, 'Malformed JSON payload', 400);
  }

  return responseHandler.error(
    res,
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
    statusCode,
    process.env.NODE_ENV === 'production' ? null : { stack: err.stack }
  );
}

module.exports = errorMiddleware;
