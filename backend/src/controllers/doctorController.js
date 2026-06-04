/**
 * PURPOSE: Doctor CRUD Controller.
 * MAQSAD: Shifokorlar ustida CRUD amallarini bajaruvchi controller.
 */

const { Doctor, Patient } = require('../models');
const { Op } = require('sequelize');

// Get all doctors with search, filters, and pagination
const getAllDoctors = async (req, res, next) => {
  try {
    const { search, department, specialization, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitVal = parseInt(limit, 10);

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { specialization: { [Op.like]: `%${search}%` } },
        { department: { [Op.like]: `%${search}%` } }
      ];
    }

    if (department) {
      whereClause.department = department;
    }

    if (specialization) {
      whereClause.specialization = specialization;
    }

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where: whereClause,
      limit: limitVal,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: doctors,
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

// Create a new doctor (Admin only)
const createDoctor = async (req, res, next) => {
  try {
    const { first_name, last_name, full_name, specialization, specialty, department, phone, contact_info, email, license_number } = req.body;

    const doctorData = {
      first_name,
      last_name,
      specialization: specialization || specialty,
      department,
      phone: phone || contact_info,
      email,
      license_number,
      created_by: req.user.id
    };

    // If full_name is provided, use virtual setter to parse it
    if (full_name) {
      doctorData.full_name = full_name;
    }

    // Fallback if first_name/last_name were not resolved
    if (!doctorData.first_name && !doctorData.last_name && full_name) {
      const parts = full_name.trim().split(' ');
      doctorData.first_name = parts[0] || 'Unknown';
      doctorData.last_name = parts.slice(1).join(' ') || 'Doctor';
    }

    const doctor = await Doctor.create(doctorData);

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully / Shifokor profili yaratildi',
      data: doctor,
      // Compatibility field for api_test.sh
      id: doctor.id
    });
  } catch (error) {
    next(error);
  }
};

// Get single doctor profile + assigned patients count
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found / Shifokor topilmadi'
      });
    }

    const patientCount = await Patient.count({
      where: { assigned_doctor_id: id }
    });

    res.status(200).json({
      success: true,
      data: {
        ...doctor.toJSON(),
        patientCount,
        patients_count: patientCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update doctor profile (Admin only)
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found / Shifokor topilmadi'
      });
    }

    const { first_name, last_name, full_name, specialization, specialty, department, phone, contact_info, email, license_number, is_active } = req.body;

    const updatedData = {
      first_name: first_name !== undefined ? first_name : doctor.first_name,
      last_name: last_name !== undefined ? last_name : doctor.last_name,
      specialization: specialization || specialty || doctor.specialization,
      department: department !== undefined ? department : doctor.department,
      phone: phone || contact_info || doctor.phone,
      email: email !== undefined ? email : doctor.email,
      license_number: license_number !== undefined ? license_number : doctor.license_number,
      is_active: is_active !== undefined ? is_active : doctor.is_active
    };

    if (full_name) {
      const parts = full_name.trim().split(' ');
      updatedData.first_name = parts[0] || 'Unknown';
      updatedData.last_name = parts.slice(1).join(' ') || 'Doctor';
    }

    await doctor.update(updatedData);

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully / Shifokor profili yangilandi',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete doctor profile (Admin only)
const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found / Shifokor topilmadi'
      });
    }

    await doctor.destroy(); // paranoid: true ensures soft-delete

    res.status(200).json({
      success: true,
      message: 'Doctor profile deleted successfully (soft-delete) / Shifokor profili o\'chirildi'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  createDoctor,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};
