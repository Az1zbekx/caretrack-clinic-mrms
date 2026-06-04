const { body } = require('express-validator');
const { ROLES } = require('../config/constants');

const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isIn(Object.values(ROLES)).withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`)
];

const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

module.exports = {
  validateRegister,
  validateLogin
};
