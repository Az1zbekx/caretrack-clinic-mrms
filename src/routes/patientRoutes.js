const express = require('express');
const PatientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { validatePatient } = require('../validators/patientValidator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authMiddleware);

// GET /api/patients - View Patients (Allowed: Admin, Clinician, Receptionist)
router.get('/', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN, ROLES.RECEPTIONIST]), PatientController.getAll);

// GET /api/patients/:id - View patient profile details (Allowed: Admin, Clinician, Receptionist)
router.get('/:id', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN, ROLES.RECEPTIONIST]), PatientController.getById);

// POST /api/patients - Create Patient (Allowed: Admin, Receptionist)
router.post('/', roleMiddleware([ROLES.ADMIN, ROLES.RECEPTIONIST]), validatePatient, validationMiddleware, PatientController.create);

// PUT /api/patients/:id - Update Patient details (Allowed: Admin, Clinician)
router.put('/:id', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN]), validatePatient, validationMiddleware, PatientController.update);

// DELETE /api/patients/:id - Delete Patient profile (Allowed: Admin)
router.delete('/:id', roleMiddleware([ROLES.ADMIN]), PatientController.delete);

module.exports = router;
