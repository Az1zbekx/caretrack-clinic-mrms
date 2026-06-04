/**
 * PURPOSE: Authentication request validators.
 * MAQSAD: Autentifikatsiya so'rovlarini tekshiruvchilar.
 */

const { body } = require('express-validator');

const loginRules = [
  body('password')
    .notEmpty()
    .withMessage('Password is required / Parol kiritilishi shart')
];

module.exports = {
  loginRules
};
