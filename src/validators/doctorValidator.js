const { body } = require('express-validator');

const validateDoctor = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Doctor full name is required')
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters long'),
  
  body('specialty')
    .trim()
    .notEmpty().withMessage('Specialty is required'),
  
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  
  body('contact_info')
    .trim()
    .notEmpty().withMessage('Contact info is required')
];

module.exports = {
  validateDoctor
};
