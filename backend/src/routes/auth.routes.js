/**
 * PURPOSE: Authentication routes.
 * MAQSAD: Autentifikatsiya routelari.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginRules } = require('../validators/auth.validator');

router.post('/login', validate(loginRules), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

// Both endpoints are routed to the same handler to satisfy the specs and testing scripts
router.get('/me', verifyToken, authController.getMe);
router.get('/profile', verifyToken, authController.getMe);

module.exports = router;
