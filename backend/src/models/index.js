/**
 * PURPOSE: Sequelize associations and model loader.
 * MAQSAD: Sequelize aloqalari va modellarni yuklovchi fayl.
 */

const sequelize = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Diagnosis = require('./Diagnosis');

// 1. Doctor <-> Patient
Doctor.hasMany(Patient, { foreignKey: 'assigned_doctor_id', as: 'patients', onDelete: 'SET NULL' });
Patient.belongsTo(Doctor, { foreignKey: 'assigned_doctor_id', as: 'doctor' });

// 2. Patient <-> Diagnosis
Patient.hasMany(Diagnosis, { foreignKey: 'patient_id', as: 'diagnoses', onDelete: 'CASCADE' });
Diagnosis.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// 3. Doctor <-> Diagnosis
Doctor.hasMany(Diagnosis, { foreignKey: 'diagnosed_by', as: 'diagnoses', onDelete: 'SET NULL' });
Diagnosis.belongsTo(Doctor, { foreignKey: 'diagnosed_by', as: 'diagnosingDoctor' });

// 4. User relationships for auditing
User.hasMany(Doctor, { foreignKey: 'created_by', as: 'createdDoctors' });
Doctor.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Patient, { foreignKey: 'registered_by', as: 'registeredPatients' });
Patient.belongsTo(User, { foreignKey: 'registered_by', as: 'registrar' });

User.hasMany(Diagnosis, { foreignKey: 'created_by', as: 'createdDiagnoses' });
Diagnosis.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Doctor,
  Patient,
  Diagnosis
};
