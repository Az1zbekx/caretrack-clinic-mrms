/**
 * PURPOSE: JWT Secret and Expiration configurations.
 * MAQSAD: JWT maxfiy kaliti va amal qilish muddati sozlamalari.
 */

module.exports = {
  accessSecret: process.env.JWT_SECRET || 'super_secret_caretrack_clinic_jwt_key_2026',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_caretrack_refresh_jwt_key_2026',
  accessExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};
