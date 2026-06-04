const AuthService = require('../services/authService');
const responseHandler = require('../utils/responseHandler');

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, password, role } = req.body;
      const user = await AuthService.register({ username, password, role });
      return responseHandler.success(res, user, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const data = await AuthService.login({ username, password });
      return responseHandler.success(res, data, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getUserProfile(req.user.id);
      return responseHandler.success(res, user, 'User profile fetched successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
