const { validationResult } = require('express-validator');
const responseHandler = require('../utils/responseHandler');

/**
 * Middleware to check express-validator validation results
 */
function validationMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return responseHandler.error(res, 'Validation failed', 400, formattedErrors);
  }
  next();
}

module.exports = validationMiddleware;
