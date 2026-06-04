const { body } = require('express-validator');
const { SEVERITY_LEVELS } = require('../config/constants');

const validateDiagnosis = [
  body('icd_code')
    .trim()
    .notEmpty().withMessage('ICD code is required')
    .matches(/^[A-Z][0-9][0-9A-Z](\.[0-9A-Z]{1,4})?$/).withMessage('Invalid ICD-10 code format (e.g. I10 or E11.9)'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 5 }).withMessage('Description must be at least 5 characters long'),
  
  body('severity')
    .trim()
    .notEmpty().withMessage('Severity is required')
    .isIn(Object.values(SEVERITY_LEVELS)).withMessage(`Severity must be one of: ${Object.values(SEVERITY_LEVELS).join(', ')}`),
  
  body('patient_id')
    .trim()
    .notEmpty().withMessage('Patient ID is required')
    .isUUID().withMessage('Patient ID must be a valid UUID')
];

module.exports = {
  validateDiagnosis
};
