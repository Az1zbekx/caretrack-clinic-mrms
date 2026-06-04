/**
 * PURPOSE: Diagnosis routes registration.
 * MAQSAD: Tashxislar routelarini ro'yxatdan o'tkazish.
 */

const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createDiagnosisRules, updateDiagnosisRules } = require('../validators/diagnosis.validator');

// Diagnoses reading, creating, and updating - Admin and Clinician
router.get('/', verifyToken, checkRole('admin', 'clinician'), diagnosisController.getAllDiagnoses);
router.get('/:id', verifyToken, checkRole('admin', 'clinician'), diagnosisController.getDiagnosisById);
router.post('/', verifyToken, checkRole('admin', 'clinician'), validate(createDiagnosisRules), diagnosisController.createDiagnosis);
router.put('/:id', verifyToken, checkRole('admin', 'clinician'), validate(updateDiagnosisRules), diagnosisController.updateDiagnosis);

// Delete diagnosis - Admin only
router.delete('/:id', verifyToken, checkRole('admin'), diagnosisController.deleteDiagnosis);

module.exports = router;
