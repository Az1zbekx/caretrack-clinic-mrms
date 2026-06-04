const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, validationMiddleware, AuthController.register);
router.post('/login', validateLogin, validationMiddleware, AuthController.login);

// Protected routes
router.get('/profile', authMiddleware, AuthController.getProfile);

module.exports = router;
