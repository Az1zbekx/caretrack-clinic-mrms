/**
 * Standardized HTTP response helper
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {any} data - Response payload
 * @param {string} message - User-friendly message
 * @param {number} statusCode - HTTP status code (default 200)
 */
function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error details or message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {any} errors - Additional validation errors list
 */
function error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  success,
  error
};
