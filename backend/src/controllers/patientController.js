/**
 * PURPOSE: Patient CRUD Controller.
 * MAQSAD: Bemorlar ustida CRUD amallarini bajaruvchi controller.
 */

const { Patient, Doctor, Diagnosis } = require('../models');
const { Op } = require('sequelize');

// Get all patients with search and filter
const getAllPatients = async (req, res, next) => {
  try {
    const { search, doctorId, doctor_id, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitVal = parseInt(limit, 10);

    const filterDoctorId = doctorId || doctor_id;
    const whereClause = {};

    if (filterDoctorId) {
      whereClause.assigned_doctor_id = filterDoctorId;
    }

    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: whereClause,
      limit: limitVal,
      offset,
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'first_name', 'last_name', 'specialization', 'department', 'phone']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: patients,
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

// Create new patient (Admin + Receptionist can create)
const createPatient = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      full_name,
      date_of_birth,
      age,
      gender,
      phone,
      email,
      address,
      blood_type,
      assigned_doctor_id,
      doctor_id
    } = req.body;

    const patientData = {
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      blood_type,
      assigned_doctor_id: assigned_doctor_id || doctor_id,
      registered_by: req.user.id
    };

    if (full_name) {
      patientData.full_name = full_name;
    }

    if (age && !date_of_birth) {
      patientData.age = age;
    }

    // Default birth date fallback if age/dob are missing
    if (!patientData.date_of_birth) {
      patientData.date_of_birth = '1990-01-01';
    }

    // Default first/last name fallback
    if (!patientData.first_name && !patientData.last_name && full_name) {
      const parts = full_name.trim().split(' ');
      patientData.first_name = parts[0] || 'Unknown';
      patientData.last_name = parts.slice(1).join(' ') || 'Patient';
    }

    const patient = await Patient.create(patientData);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully / Bemor ro\'yxatdan o\'tkazildi',
      data: patient,
      id: patient.id
    });
  } catch (error) {
    next(error);
  }
};

// Get patient complete profile including doctor and all diagnoses
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: Doctor,
          as: 'doctor'
        },
        {
          model: Diagnosis,
          as: 'diagnoses',
          include: [
            {
              model: Doctor,
              as: 'diagnosingDoctor'
            }
          ]
        }
      ],
      order: [
        [{ model: Diagnosis, as: 'diagnoses' }, 'diagnosis_date', 'DESC']
      ]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found / Bemor topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// Update patient info (Admin + Clinician can update)
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found / Bemor topilmadi'
      });
    }

    const {
      first_name,
      last_name,
      full_name,
      date_of_birth,
      age,
      gender,
      phone,
      email,
      address,
      blood_type,
      assigned_doctor_id,
      doctor_id
    } = req.body;

    const updatedData = {
      first_name: first_name !== undefined ? first_name : patient.first_name,
      last_name: last_name !== undefined ? last_name : patient.last_name,
      date_of_birth: date_of_birth !== undefined ? date_of_birth : patient.date_of_birth,
      gender: gender !== undefined ? gender : patient.gender,
      phone: phone !== undefined ? phone : patient.phone,
      email: email !== undefined ? email : patient.email,
      address: address !== undefined ? address : patient.address,
      blood_type: blood_type !== undefined ? blood_type : patient.blood_type,
      assigned_doctor_id: assigned_doctor_id || doctor_id || patient.assigned_doctor_id
    };

    if (full_name) {
      const parts = full_name.trim().split(' ');
      updatedData.first_name = parts[0] || 'Unknown';
      updatedData.last_name = parts.slice(1).join(' ') || 'Patient';
    }

    if (age && !date_of_birth) {
      const birthYear = new Date().getFullYear() - parseInt(age, 10);
      updatedData.date_of_birth = `${birthYear}-01-01`;
    }

    await patient.update(updatedData);

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully / Bemor ma\'lumotlari yangilandi',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// Delete patient record (Admin only)
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found / Bemor topilmadi'
      });
    }

    await patient.destroy(); // soft-delete

    res.status(200).json({
      success: true,
      message: 'Patient profile deleted successfully (soft-delete) / Bemor profili o\'chirildi'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  createPatient,
  getPatientById,
  updatePatient,
  deletePatient
};
