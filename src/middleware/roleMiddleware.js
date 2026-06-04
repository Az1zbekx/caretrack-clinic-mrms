const responseHandler = require('../utils/responseHandler');

/**
 * Middleware to restrict access to specific roles
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return responseHandler.error(res, 'Authentication required', 401);
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return responseHandler.error(
        res, 
        `Access denied. Required role(s): ${allowedRoles.join(', ')}`, 
        403
      );
    }

    next();
  };
}

module.exports = roleMiddleware;
