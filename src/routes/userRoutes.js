const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { validateRegister } = require('../validators/authValidator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware([ROLES.ADMIN]));

// User CRUD - Admin access only
router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/', validateRegister, validationMiddleware, UserController.create);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;
