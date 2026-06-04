/**
 * PURPOSE: Diagnosis request validations.
 * MAQSAD: Tashxislar so'rovlarini tekshiruvchilar.
 */

const { body } = require('express-validator');

const createDiagnosisRules = [
  body('icd_code')
    .notEmpty()
    .withMessage('ICD code is required / ICD kodi majburiy'),
  body('description')
    .notEmpty()
    .withMessage('Description is required / Tavsif majburiy')
];

const updateDiagnosisRules = [
  body('icd_code')
    .optional()
    .notEmpty()
    .withMessage('ICD code cannot be empty / ICD kodi bo\'sh bo\'lishi mumkin emas')
];

module.exports = {
  createDiagnosisRules,
  updateDiagnosisRules
};
