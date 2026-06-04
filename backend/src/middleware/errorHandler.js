/**
 * PURPOSE: Global Centralized Error Handler Middleware.
 * MAQSAD: Tizim miqyosidagi markaziy xatolarni boshqarish middleware.
 */

function errorHandler(err, req, res, next) {
  // console.error is allowed for logging system failures/exceptions
  console.error('API Error Handler Caught:', err);

  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error / Tizim xatosi';

  // Handle Sequelize specific errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error / Ma\'lumotlarni tekshirishda xato',
      errors: messages
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token / Noto\'g\'ri token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired / Token muddati tugagan',
      code: 'TOKEN_EXPIRED'
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = {
  errorHandler
};
