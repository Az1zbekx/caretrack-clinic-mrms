const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const generateToken = require('../utils/generateToken');

class AuthService {
  static async register({ username, password, role }) {
    // Check if user already exists
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      const error = new Error('Username is already taken');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    const newUser = await UserModel.create({
      username,
      password: hashedPassword,
      role
    });

    // Remove password from returned object
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static async login({ username, password }) {
    // Find user
    const user = await UserModel.findByUsername(username);
    if (!user) {
      const error = new Error('Invalid username or password');
      error.statusCode = 401;
      throw error;
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid username or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at
      }
    };
  }

  static async getUserProfile(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = AuthService;
