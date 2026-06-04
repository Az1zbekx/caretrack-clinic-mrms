/**
 * PURPOSE: Request Validation Middleware wrapper for express-validator.
 * MAQSAD: express-validator uchun so'rovlarni tekshirish middleware qobig'i.
 */

const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validation checks
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed / Ma\'lumotlarni tekshirishda xato',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

module.exports = {
  validate
};
