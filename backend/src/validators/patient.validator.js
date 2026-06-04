/**
 * PURPOSE: Patient request validations.
 * MAQSAD: Bemorlar so'rovlarini tekshiruvchilar.
 */

const { body } = require('express-validator');

const createPatientRules = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required / Telefon raqami majburiy'),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required / Jinsi majburiy')
];

const updatePatientRules = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format / Email formati noto\'g\'ri')
];

module.exports = {
  createPatientRules,
  updatePatientRules
};
