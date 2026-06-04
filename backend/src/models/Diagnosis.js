/**
 * PURPOSE: Diagnosis Sequelize Model.
 * MAQSAD: Diagnosis Sequelize Modeli.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Diagnosis = sequelize.define('Diagnosis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  icd_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('mild', 'moderate', 'severe', 'critical'),
    allowNull: false,
    defaultValue: 'mild',
    set(value) {
      if (value) {
        const val = value.toString().toLowerCase();
        if (val === 'medium' || val === 'moderate') {
          this.setDataValue('severity', 'moderate');
        } else if (val === 'high' || val === 'severe') {
          this.setDataValue('severity', 'severe');
        } else if (val === 'critical') {
          this.setDataValue('severity', 'critical');
        } else {
          this.setDataValue('severity', 'mild');
        }
      }
    }
  },
  diagnosed_by: {
    type: DataTypes.UUID,
    allowNull: true, // can be linked to Doctor profile
  },
  diagnosis_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true, // User who recorded it
  }
}, {
  tableName: 'diagnoses',
  timestamps: true,
  underscored: true,
  paranoid: true, // soft delete
});

module.exports = Diagnosis;
