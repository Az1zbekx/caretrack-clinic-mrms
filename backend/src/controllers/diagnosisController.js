/**
 * PURPOSE: Diagnosis CRUD Controller.
 * MAQSAD: Tashxislar ustida CRUD amallarini bajaruvchi controller.
 */

const { Diagnosis, Patient, Doctor } = require('../models');
const { Op } = require('sequelize');

// Get all diagnoses with filtering and pagination
const getAllDiagnoses = async (req, res, next) => {
  try {
    const { search, patientId, patient_id, severity, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitVal = parseInt(limit, 10);

    const filterPatientId = patientId || patient_id;
    const whereClause = {};

    if (filterPatientId) {
      whereClause.patient_id = filterPatientId;
    }

    if (severity) {
      // Map frontend severity if it comes as medium/high
      let mappedSeverity = severity.toLowerCase();
      if (mappedSeverity === 'medium') mappedSeverity = 'moderate';
      if (mappedSeverity === 'high') mappedSeverity = 'severe';
      whereClause.severity = mappedSeverity;
    }

    if (search) {
      whereClause[Op.or] = [
        { icd_code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: diagnoses } = await Diagnosis.findAndCountAll({
      where: whereClause,
      limit: limitVal,
      offset,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'first_name', 'last_name', 'gender', 'date_of_birth']
        },
        {
          model: Doctor,
          as: 'diagnosingDoctor',
          attributes: ['id', 'first_name', 'last_name', 'specialization', 'department']
        }
      ],
      order: [['diagnosis_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: diagnoses,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limitVal),
        currentPage: parseInt(page, 10),
        limit: limitVal
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new diagnosis record (Admin + Clinician)
const createDiagnosis = async (req, res, next) => {
  try {
    const { patient_id, patientId, icd_code, description, severity, diagnosed_by, notes, diagnosis_date } = req.body;
    const targetPatientId = patient_id || patientId;

    if (!targetPatientId || !icd_code || !description) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, ICD code, and description are required / Bemor ID, ICD kodi va tavsif majburiy'
      });
    }

    // Verify patient exists
    const patient = await Patient.findByPk(targetPatientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found / Bemor topilmadi'
      });
    }

    // Fallback to patient's assigned doctor if diagnosed_by is not provided
    const docId = diagnosed_by || patient.assigned_doctor_id;

    const diagnosis = await Diagnosis.create({
      patient_id: targetPatientId,
      icd_code,
      description,
      severity, // mapped automatically via the model's custom setter
      diagnosed_by: docId,
      notes,
      diagnosis_date: diagnosis_date || new Date(),
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Diagnosis recorded successfully / Tashxis muvaffaqiyatli saqlandi',
      data: diagnosis,
      id: diagnosis.id
    });
  } catch (error) {
    next(error);
  }
};

// Get single diagnosis + patient details
const getDiagnosisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const diagnosis = await Diagnosis.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient'
        },
        {
          model: Doctor,
          as: 'diagnosingDoctor'
        }
      ]
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found / Tashxis topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    next(error);
  }
};

// Update diagnosis record
const updateDiagnosis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const diagnosis = await Diagnosis.findByPk(id);

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found / Tashxis topilmadi'
      });
    }

    const { icd_code, description, severity, notes, diagnosis_date, diagnosed_by } = req.body;

    await diagnosis.update({
      icd_code: icd_code !== undefined ? icd_code : diagnosis.icd_code,
      description: description !== undefined ? description : diagnosis.description,
      severity: severity !== undefined ? severity : diagnosis.severity,
      notes: notes !== undefined ? notes : diagnosis.notes,
      diagnosis_date: diagnosis_date !== undefined ? diagnosis_date : diagnosis.diagnosis_date,
      diagnosed_by: diagnosed_by !== undefined ? diagnosed_by : diagnosis.diagnosed_by
    });

    res.status(200).json({
      success: true,
      message: 'Diagnosis updated successfully / Tashxis yangilandi',
      data: diagnosis
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete diagnosis (Admin only)
const deleteDiagnosis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const diagnosis = await Diagnosis.findByPk(id);

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found / Tashxis topilmadi'
      });
    }

    await diagnosis.destroy(); // soft-delete

    res.status(200).json({
      success: true,
      message: 'Diagnosis deleted successfully (soft-delete) / Tashxis o\'chirildi'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDiagnoses,
  createDiagnosis,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis
};
