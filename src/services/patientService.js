const PatientModel = require('../models/patientModel');
const DoctorModel = require('../models/doctorModel');
const DiagnosisModel = require('../models/diagnosisModel');

class PatientService {
  static async getAllPatients() {
    const patients = await PatientModel.findAll();
    const doctors = await DoctorModel.findAll();

    // Map doctor details onto patients
    return patients.map(patient => {
      const doctor = doctors.find(d => d.id === patient.doctor_id);
      return {
        ...patient,
        doctor: doctor ? { id: doctor.id, full_name: doctor.full_name, specialty: doctor.specialty } : null
      };
    });
  }

  static async getPatientById(id) {
    const patient = await PatientModel.findById(id);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    const doctor = await DoctorModel.findById(patient.doctor_id);
    const diagnoses = await DiagnosisModel.findByPatientId(id);

    // Return combined patient profile
    return {
      ...patient,
      doctor: doctor ? { id: doctor.id, full_name: doctor.full_name, specialty: doctor.specialty, department: doctor.department } : null,
      diagnoses: diagnoses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    };
  }

  static async createPatient(patientData) {
    // Validate that the assigned doctor exists
    const doctor = await DoctorModel.findById(patientData.doctor_id);
    if (!doctor) {
      const error = new Error('Assigned doctor does not exist');
      error.statusCode = 400;
      throw error;
    }

    return await PatientModel.create(patientData);
  }

  static async updatePatient(id, patientData) {
    // Check if patient exists
    await this.getPatientById(id);

    // Validate that the assigned doctor exists if doctor_id is updated
    if (patientData.doctor_id) {
      const doctor = await DoctorModel.findById(patientData.doctor_id);
      if (!doctor) {
        const error = new Error('Assigned doctor does not exist');
        error.statusCode = 400;
        throw error;
      }
    }

    return await PatientModel.update(id, patientData);
  }

  static async deletePatient(id) {
    // Check if patient exists
    await this.getPatientById(id);

    // Cascading delete: Delete all diagnoses associated with this patient
    const diagnoses = await DiagnosisModel.findByPatientId(id);
    for (const diagnosis of diagnoses) {
      await DiagnosisModel.delete(diagnosis.id);
    }

    // Delete patient
    return await PatientModel.delete(id);
  }
}

module.exports = PatientService;
