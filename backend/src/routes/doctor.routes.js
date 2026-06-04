/**
 * PURPOSE: Doctor routes registration.
 * MAQSAD: Shifokorlar routelarini ro'yxatdan o'tkazish.
 */

const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createDoctorRules, updateDoctorRules } = require('../validators/doctor.validator');

// View doctors - open to all authenticated users (Admin, Clinician, Receptionist)
router.get('/', verifyToken, doctorController.getAllDoctors);
router.get('/:id', verifyToken, doctorController.getDoctorById);

// Create, Update, Delete - restricted to Admin
router.post('/', verifyToken, checkRole('admin'), validate(createDoctorRules), doctorController.createDoctor);
router.put('/:id', verifyToken, checkRole('admin'), validate(updateDoctorRules), doctorController.updateDoctor);
router.delete('/:id', verifyToken, checkRole('admin'), doctorController.deleteDoctor);

module.exports = router;
