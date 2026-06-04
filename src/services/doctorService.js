const DoctorModel = require('../models/doctorModel');
const PatientModel = require('../models/patientModel');

class DoctorService {
  static async getAllDoctors() {
    return await DoctorModel.findAll();
  }

  static async getDoctorById(id) {
    const doctor = await DoctorModel.findById(id);
    if (!doctor) {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }
    return doctor;
  }

  static async createDoctor(doctorData) {
    return await DoctorModel.create(doctorData);
  }

  static async updateDoctor(id, doctorData) {
    // Check if doctor exists first
    await this.getDoctorById(id);
    return await DoctorModel.update(id, doctorData);
  }

  static async deleteDoctor(id) {
    // Check if doctor exists
    await this.getDoctorById(id);

    // BTEC Integrity Check: Check if patients are assigned to this doctor
    const patients = await PatientModel.findByDoctorId(id);
    if (patients.length > 0) {
      const error = new Error(`Cannot delete doctor. There are ${patients.length} patient(s) assigned to this doctor. Reassign patients first.`);
      error.statusCode = 400;
      throw error;
    }

    return await DoctorModel.delete(id);
  }
}

module.exports = DoctorService;
