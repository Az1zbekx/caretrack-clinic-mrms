/**
 * PURPOSE: Patient routes registration.
 * MAQSAD: Bemorlar routelarini ro'yxatdan o'tkazish.
 */

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createPatientRules, updatePatientRules } = require('../validators/patient.validator');

// View patient records - Admin, Clinician, Receptionist
router.get('/', verifyToken, patientController.getAllPatients);
router.get('/:id', verifyToken, patientController.getPatientById);

// Create patient - Admin, Receptionist
router.post('/', verifyToken, checkRole('admin', 'receptionist'), validate(createPatientRules), patientController.createPatient);

// Update patient - Admin, Clinician
router.put('/:id', verifyToken, checkRole('admin', 'clinician'), validate(updatePatientRules), patientController.updatePatient);

// Delete patient - Admin only
router.delete('/:id', verifyToken, checkRole('admin'), patientController.deletePatient);

module.exports = router;
