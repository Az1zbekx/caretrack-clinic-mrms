const { body } = require('express-validator');

const validatePatient = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Patient full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters long'),
  
  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 0, max: 125 }).withMessage('Age must be an integer between 0 and 125'),
  
  body('gender')
    .trim()
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required'),
  
  body('doctor_id')
    .trim()
    .notEmpty().withMessage('Assigned Doctor ID is required')
    .isUUID().withMessage('Assigned Doctor ID must be a valid UUID')
];

module.exports = {
  validatePatient
};
