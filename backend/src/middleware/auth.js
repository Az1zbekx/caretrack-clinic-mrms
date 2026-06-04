/**
 * PURPOSE: JWT Authentication Verification Middleware.
 * MAQSAD: JWT Autentifikatsiyani tekshirish middleware.
 */

const jwt = require('jsonwebtoken');
const { accessSecret } = require('../config/jwt');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: No token provided / Ruxsat berilmadi: Token berilmagan'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, accessSecret);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists / Foydalanuvchi mavjud emas'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive / Foydalanuvchi hisobi faol emas'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken
};
