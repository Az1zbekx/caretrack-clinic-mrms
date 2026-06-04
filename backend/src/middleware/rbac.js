/**
 * PURPOSE: Role-based Access Control (RBAC) Middleware.
 * MAQSAD: Rolga asoslangan ruxsatlarni boshqarish middleware.
 */

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No active user session / Ruxsat yo\'q'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Insufficient Permissions / Ruxsat berilmadi: Huquqlar yetarli emas'
      });
    }

    next();
  };
};

module.exports = {
  checkRole
};
