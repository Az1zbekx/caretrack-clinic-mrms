const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authMiddleware);

// GET /api/dashboard/stats - View Dashboard Statistics (Allowed: Admin, Clinician, Receptionist)
router.get('/stats', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN, ROLES.RECEPTIONIST]), DashboardController.getStats);

// GET /api/dashboard/recent - View Recent Activities (Allowed: Admin, Clinician, Receptionist)
router.get('/recent', roleMiddleware([ROLES.ADMIN, ROLES.CLINICIAN, ROLES.RECEPTIONIST]), DashboardController.getRecent);

module.exports = router;
