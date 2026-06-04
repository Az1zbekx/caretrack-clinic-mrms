const path = require('path');
const fileHandler = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../data/doctors.json');

class DoctorModel {
  static async findAll() {
    return await fileHandler.readJson(dbPath);
  }

  static async findById(id) {
    const doctors = await this.findAll();
    return doctors.find(d => d.id === id) || null;
  }

  static async create(doctor) {
    const doctors = await this.findAll();
    const newDoctor = {
      id: uuidv4(),
      full_name: doctor.full_name,
      specialty: doctor.specialty,
      department: doctor.department,
      contact_info: doctor.contact_info,
      created_at: new Date().toISOString()
    };
    doctors.push(newDoctor);
    await fileHandler.writeJson(dbPath, doctors);
    return newDoctor;
  }

  static async update(id, data) {
    const doctors = await this.findAll();
    const index = doctors.findIndex(d => d.id === id);
    if (index === -1) return null;

    doctors[index] = {
      ...doctors[index],
      ...data,
      id, // ensure ID cannot be changed
      updated_at: new Date().toISOString()
    };

    await fileHandler.writeJson(dbPath, doctors);
    return doctors[index];
  }

  static async delete(id) {
    const doctors = await this.findAll();
    const index = doctors.findIndex(d => d.id === id);
    if (index === -1) return false;

    doctors.splice(index, 1);
    await fileHandler.writeJson(dbPath, doctors);
    return true;
  }
}

module.exports = DoctorModel;
