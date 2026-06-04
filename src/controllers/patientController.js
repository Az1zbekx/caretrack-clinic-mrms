const PatientService = require('../services/patientService');
const responseHandler = require('../utils/responseHandler');

class PatientController {
  static async getAll(req, res, next) {
    try {
      const patients = await PatientService.getAllPatients();
      return responseHandler.success(res, patients, 'Patients fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const patient = await PatientService.getPatientById(id);
      return responseHandler.success(res, patient, 'Patient profile fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const patient = await PatientService.createPatient(req.body);
      return responseHandler.success(res, patient, 'Patient admitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const patient = await PatientService.updatePatient(id, req.body);
      return responseHandler.success(res, patient, 'Patient updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await PatientService.deletePatient(id);
      return responseHandler.success(res, null, 'Patient deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PatientController;
