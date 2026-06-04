const DiagnosisModel = require('../models/diagnosisModel');
const PatientModel = require('../models/patientModel');

class DiagnosisService {
  static async getAllDiagnoses() {
    const diagnoses = await DiagnosisModel.findAll();
    const patients = await PatientModel.findAll();

    // Map patient details onto diagnoses
    return diagnoses.map(diagnosis => {
      const patient = patients.find(p => p.id === diagnosis.patient_id);
      return {
        ...diagnosis,
        patient: patient ? { id: patient.id, full_name: patient.full_name, age: patient.age, gender: patient.gender } : null
      };
    });
  }

  static async getDiagnosisById(id) {
    const diagnosis = await DiagnosisModel.findById(id);
    if (!diagnosis) {
      const error = new Error('Diagnosis not found');
      error.statusCode = 404;
      throw error;
    }

    const patient = await PatientModel.findById(diagnosis.patient_id);

    return {
      ...diagnosis,
      patient: patient ? { id: patient.id, full_name: patient.full_name, age: patient.age, gender: patient.gender } : null
    };
  }

  static async createDiagnosis(diagnosisData) {
    // Validate patient existence
    const patient = await PatientModel.findById(diagnosisData.patient_id);
    if (!patient) {
      const error = new Error('Patient does not exist');
      error.statusCode = 400;
      throw error;
    }

    return await DiagnosisModel.create(diagnosisData);
  }

  static async updateDiagnosis(id, diagnosisData) {
    // Check if diagnosis exists
    await this.getDiagnosisById(id);

    // Validate patient existence if patient_id is updated
    if (diagnosisData.patient_id) {
      const patient = await PatientModel.findById(diagnosisData.patient_id);
      if (!patient) {
        const error = new Error('Patient does not exist');
        error.statusCode = 400;
        throw error;
      }
    }

    return await DiagnosisModel.update(id, diagnosisData);
  }

  static async deleteDiagnosis(id) {
    await this.getDiagnosisById(id);
    return await DiagnosisModel.delete(id);
  }
}

module.exports = DiagnosisService;
