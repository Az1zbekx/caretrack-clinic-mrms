const UserModel = require('../models/userModel');
const AuthService = require('../services/authService');
const bcrypt = require('bcrypt');
const responseHandler = require('../utils/responseHandler');

class UserController {
  static async getAll(req, res, next) {
    try {
      const users = await UserModel.findAll();
      const usersWithoutPassword = users.map(({ password, ...u }) => u);
      return responseHandler.success(res, usersWithoutPassword, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        return responseHandler.error(res, 'User not found', 404);
      }
      const { password, ...userWithoutPassword } = user;
      return responseHandler.success(res, userWithoutPassword, 'User fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { username, password, role } = req.body;
      const user = await AuthService.register({ username, password, role });
      return responseHandler.success(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { username, password, role } = req.body;

      // Check if user exists
      const user = await UserModel.findById(id);
      if (!user) {
        return responseHandler.error(res, 'User not found', 404);
      }

      const updateData = {};
      if (username) {
        // If username changes, check if it's already taken
        if (username.toLowerCase() !== user.username.toLowerCase()) {
          const existingUser = await UserModel.findByUsername(username);
          if (existingUser) {
            return responseHandler.error(res, 'Username already taken', 400);
          }
        }
        updateData.username = username;
      }

      if (password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      if (role) {
        updateData.role = role;
      }

      const updatedUser = await UserModel.update(id, updateData);
      const { password: _, ...userWithoutPassword } = updatedUser;
      return responseHandler.success(res, userWithoutPassword, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.user.id === id) {
        return responseHandler.error(res, 'You cannot delete your own account', 400);
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return responseHandler.error(res, 'User not found', 404);
      }

      await UserModel.delete(id);
      return responseHandler.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
