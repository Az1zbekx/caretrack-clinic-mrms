const express = require('express');
const DiagnosisController = require('../controllers/diagnosisController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { validateDiagnosis } = require('../validators/diagnosisValidator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authMiddleware);

// GET /api/diagnoses - View Diagnoses (Allowed: Admin, Clinician)
router.get('/', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN]), DiagnosisController.getAll);

// GET /api/diagnoses/:id - View specific diagnosis (Allowed: Admin, Clinician)
router.get('/:id', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN]), DiagnosisController.getById);

// POST /api/diagnoses - Register Diagnosis (Allowed: Admin, Clinician)
router.post('/', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN]), validateDiagnosis, validationMiddleware, DiagnosisController.create);

// PUT /api/diagnoses/:id - Update Diagnosis (Allowed: Admin, Clinician)
router.put('/:id', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN]), validateDiagnosis, validationMiddleware, DiagnosisController.update);

// DELETE /api/diagnoses/:id - Delete Diagnosis (Allowed: Admin)
router.delete('/:id', roleMiddleware([ROLES.ADMIN]), DiagnosisController.delete);

module.exports = router;
