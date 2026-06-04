const DashboardService = require('../services/dashboardService');
const responseHandler = require('../utils/responseHandler');

class DashboardController {
  static async getStats(req, res, next) {
    try {
      const stats = await DashboardService.getStats();
      return responseHandler.success(res, stats, 'Dashboard stats fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getRecent(req, res, next) {
    try {
      const recent = await DashboardService.getRecentActivities();
      return responseHandler.success(res, recent, 'Recent activity stream fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
