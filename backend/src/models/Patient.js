/**
 * PURPOSE: Patient Sequelize Model.
 * MAQSAD: Patient Sequelize Modeli.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  blood_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assigned_doctor_id: {
    type: DataTypes.UUID,
    allowNull: true, // will be linked to Doctor
  },
  registered_by: {
    type: DataTypes.UUID,
    allowNull: true, // will be linked to User
  },
  // Compatibility virtual fields for test script (api_test.sh)
  full_name: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.first_name || ''} ${this.last_name || ''}`.trim();
    },
    set(value) {
      if (value) {
        const parts = value.trim().split(' ');
        this.setDataValue('first_name', parts[0] || '');
        this.setDataValue('last_name', parts.slice(1).join(' ') || '');
      }
    }
  },
  age: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.date_of_birth) return null;
      const birthDate = new Date(this.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    },
    set(value) {
      if (value) {
        const birthYear = new Date().getFullYear() - parseInt(value, 10);
        this.setDataValue('date_of_birth', `${birthYear}-01-01`);
      }
    }
  },
  doctor_id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.assigned_doctor_id;
    },
    set(value) {
      this.setDataValue('assigned_doctor_id', value);
    }
  }
}, {
  tableName: 'patients',
  timestamps: true,
  underscored: true,
  paranoid: true, // soft delete
});

// Custom toJSON to ensure compatibility properties are present in serialized JSON
Patient.prototype.toJSON = function() {
  const values = { ...this.get() };
  values.full_name = this.full_name;
  values.age = this.age;
  values.doctor_id = this.doctor_id;
  return values;
};

module.exports = Patient;
