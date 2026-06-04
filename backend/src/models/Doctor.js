/**
 * PURPOSE: Doctor Sequelize Model.
 * MAQSAD: Doctor Sequelize Modeli.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
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
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
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
  license_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_by: {
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
  specialty: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.specialization;
    },
    set(value) {
      this.setDataValue('specialization', value);
    }
  },
  contact_info: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.phone;
    },
    set(value) {
      this.setDataValue('phone', value);
    }
  }
}, {
  tableName: 'doctors',
  timestamps: true,
  underscored: true,
  paranoid: true, // soft delete
});

// Custom toJSON to ensure compatibility properties are present in serialized JSON
Doctor.prototype.toJSON = function() {
  const values = { ...this.get() };
  values.full_name = this.full_name;
  values.specialty = this.specialty;
  values.contact_info = this.contact_info;
  return values;
};

module.exports = Doctor;
