const path = require('path');
const fileHandler = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../data/patients.json');

class PatientModel {
  static async findAll() {
    return await fileHandler.readJson(dbPath);
  }

  static async findById(id) {
    const patients = await this.findAll();
    return patients.find(p => p.id === id) || null;
  }

  static async findByDoctorId(doctorId) {
    const patients = await this.findAll();
    return patients.filter(p => p.doctor_id === doctorId);
  }

  static async create(patient) {
    const patients = await this.findAll();
    const newPatient = {
      id: uuidv4(),
      full_name: patient.full_name,
      age: parseInt(patient.age, 10),
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      doctor_id: patient.doctor_id,
      created_at: new Date().toISOString()
    };
    patients.push(newPatient);
    await fileHandler.writeJson(dbPath, patients);
    return newPatient;
  }

  static async update(id, data) {
    const patients = await this.findAll();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return null;

    patients[index] = {
      ...patients[index],
      ...data,
      age: data.age !== undefined ? parseInt(data.age, 10) : patients[index].age,
      id,
      updated_at: new Date().toISOString()
    };

    await fileHandler.writeJson(dbPath, patients);
    return patients[index];
  }

  static async delete(id) {
    const patients = await this.findAll();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return false;

    patients.splice(index, 1);
    await fileHandler.writeJson(dbPath, patients);
    return true;
  }
}

module.exports = PatientModel;
