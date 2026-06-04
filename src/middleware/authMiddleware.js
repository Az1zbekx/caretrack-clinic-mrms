const jwt = require('jsonwebtoken');
const responseHandler = require('../utils/responseHandler');

/**
 * Middleware to authenticate requests via JWT
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return responseHandler.error(res, 'Authentication token required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_caretrack';
    const decoded = jwt.verify(token, secret);
    
    // Attach decoded user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return responseHandler.error(res, 'Token has expired', 401);
    }
    return responseHandler.error(res, 'Invalid or corrupted token', 401);
  }
}

module.exports = authMiddleware;
