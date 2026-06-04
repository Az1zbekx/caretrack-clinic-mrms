/**
 * PURPOSE: Doctor request validations.
 * MAQSAD: Shifokorlar so'rovlarini tekshiruvchilar.
 */

const { body } = require('express-validator');

const createDoctorRules = [
  body('department')
    .notEmpty()
    .withMessage('Department is required / Bo\'lim majburiy')
];

const updateDoctorRules = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format / Email formati noto\'g\'ri')
];

module.exports = {
  createDoctorRules,
  updateDoctorRules
};
