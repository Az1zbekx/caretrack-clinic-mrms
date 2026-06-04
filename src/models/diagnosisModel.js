const path = require('path');
const fileHandler = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../data/diagnoses.json');

class DiagnosisModel {
  static async findAll() {
    return await fileHandler.readJson(dbPath);
  }

  static async findById(id) {
    const diagnoses = await this.findAll();
    return diagnoses.find(d => d.id === id) || null;
  }

  static async findByPatientId(patientId) {
    const diagnoses = await this.findAll();
    return diagnoses.filter(d => d.patient_id === patientId);
  }

  static async create(diagnosis) {
    const diagnoses = await this.findAll();
    const newDiagnosis = {
      id: uuidv4(),
      icd_code: diagnosis.icd_code,
      description: diagnosis.description,
      severity: diagnosis.severity,
      patient_id: diagnosis.patient_id,
      created_at: new Date().toISOString()
    };
    diagnoses.push(newDiagnosis);
    await fileHandler.writeJson(dbPath, diagnoses);
    return newDiagnosis;
  }

  static async update(id, data) {
    const diagnoses = await this.findAll();
    const index = diagnoses.findIndex(d => d.id === id);
    if (index === -1) return null;

    diagnoses[index] = {
      ...diagnoses[index],
      ...data,
      id,
      updated_at: new Date().toISOString()
    };

    await fileHandler.writeJson(dbPath, diagnoses);
    return diagnoses[index];
  }

  static async delete(id) {
    const diagnoses = await this.findAll();
    const index = diagnoses.findIndex(d => d.id === id);
    if (index === -1) return false;

    diagnoses.splice(index, 1);
    await fileHandler.writeJson(dbPath, diagnoses);
    return true;
  }
}

module.exports = DiagnosisModel;
