const express = require('express');
const DoctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { validateDoctor } = require('../validators/doctorValidator');
const { ROLES } = require('../config/constants');

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/doctors - View Doctors (Allowed: Admin, Clinician, Receptionist)
router.get('/', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN, ROLES.RECEPTIONIST]), DoctorController.getAll);

// GET /api/doctors/:id - View specific Doctor (Allowed: Admin, Clinician, Receptionist)
router.get('/:id', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN, ROLES.RECEPTIONIST]), DoctorController.getById);

// POST /api/doctors - Register Doctor (Allowed: Admin)
router.post('/', roleMiddleware([ROLES.ADMIN]), validateDoctor, validationMiddleware, DoctorController.create);

// PUT /api/doctors/:id - Update Doctor (Allowed: Admin)
router.put('/:id', roleMiddleware([ROLES.ADMIN]), validateDoctor, validationMiddleware, DoctorController.update);

// DELETE /api/doctors/:id - Delete Doctor (Allowed: Admin)
router.delete('/:id', roleMiddleware([ROLES.ADMIN]), DoctorController.delete);

module.exports = router;
