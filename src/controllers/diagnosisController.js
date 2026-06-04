const DiagnosisService = require('../services/diagnosisService');
const responseHandler = require('../utils/responseHandler');

class DiagnosisController {
  static async getAll(req, res, next) {
    try {
      const diagnoses = await DiagnosisService.getAllDiagnoses();
      return responseHandler.success(res, diagnoses, 'Diagnoses fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const diagnosis = await DiagnosisService.getDiagnosisById(id);
      return responseHandler.success(res, diagnosis, 'Diagnosis fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const diagnosis = await DiagnosisService.createDiagnosis(req.body);
      return responseHandler.success(res, diagnosis, 'Diagnosis registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const diagnosis = await DiagnosisService.updateDiagnosis(id, req.body);
      return responseHandler.success(res, diagnosis, 'Diagnosis updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await DiagnosisService.deleteDiagnosis(id);
      return responseHandler.success(res, null, 'Diagnosis deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DiagnosisController;
