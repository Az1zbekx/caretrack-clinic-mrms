const DoctorService = require('../services/doctorService');
const responseHandler = require('../utils/responseHandler');

class DoctorController {
  static async getAll(req, res, next) {
    try {
      const doctors = await DoctorService.getAllDoctors();
      return responseHandler.success(res, doctors, 'Doctors fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const doctor = await DoctorService.getDoctorById(id);
      return responseHandler.success(res, doctor, 'Doctor fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const doctor = await DoctorService.createDoctor(req.body);
      return responseHandler.success(res, doctor, 'Doctor registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const doctor = await DoctorService.updateDoctor(id, req.body);
      return responseHandler.success(res, doctor, 'Doctor updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await DoctorService.deleteDoctor(id);
      return responseHandler.success(res, null, 'Doctor deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorController;
