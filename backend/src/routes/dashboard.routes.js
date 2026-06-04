/**
 * PURPOSE: Dashboard routes registration.
 * MAQSAD: Dashboard routelarini ro'yxatdan o'tkazish.
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Admin and Clinician only can view dashboard stats and activity streams
router.get('/stats', verifyToken, checkRole('admin', 'clinician'), dashboardController.getStats);
router.get('/recent', verifyToken, checkRole('admin', 'clinician'), dashboardController.getRecentActivity);

module.exports = router;
