/**
 * PURPOSE: Dashboard Analytics Controller.
 * MAQSAD: Dashboard statistikalari va faoliyat lentasi controlleri.
 */

const { Doctor, Patient, Diagnosis } = require('../models');
const sequelize = require('../config/database');

const getStats = async (req, res, next) => {
  try {
    const totalDoctors = await Doctor.count();
    const totalPatients = await Patient.count();
    const totalDiagnoses = await Diagnosis.count();

    // Group diagnoses by severity
    const diagnoses = await Diagnosis.findAll({
      attributes: ['severity']
    });
    const bySeverity = { mild: 0, moderate: 0, severe: 0, critical: 0 };
    diagnoses.forEach(d => {
      if (bySeverity[d.severity] !== undefined) {
        bySeverity[d.severity]++;
      }
    });

    // Group patients by doctor's department (dialect-safe in-memory group)
    const patients = await Patient.findAll({
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['department']
        }
      ]
    });
    const byDepartment = {};
    patients.forEach(p => {
      const dept = p.doctor?.department || 'General Practice';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    });

    // Fetch recent activity
    const recentActivity = await fetchRecentActivityFeed();

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalDiagnoses,
        bySeverity,
        byDepartment,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/recent (Specifically for api_test.sh line 201)
const getRecentActivity = async (req, res, next) => {
  try {
    const recentActivity = await fetchRecentActivityFeed();
    res.status(200).json({
      success: true,
      data: recentActivity
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to build a unified activity feed from patients and diagnoses
async function fetchRecentActivityFeed() {
  const recentPatients = await Patient.findAll({
    limit: 5,
    order: [['created_at', 'DESC']],
    attributes: ['id', 'first_name', 'last_name', 'created_at']
  });

  const recentDiagnoses = await Diagnosis.findAll({
    limit: 5,
    order: [['created_at', 'DESC']],
    attributes: ['id', 'icd_code', 'created_at'],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['first_name', 'last_name']
      },
      {
        model: Doctor,
        as: 'diagnosingDoctor',
        attributes: ['first_name', 'last_name']
      }
    ]
  });

  const activities = [];

  recentPatients.forEach(p => {
    activities.push({
      id: `patient-${p.id}`,
      type: 'PATIENT_REGISTRATION',
      message: `Yangi bemor ro'yxatdan o'tkazildi: ${p.first_name} ${p.last_name}`,
      message_en: `New patient registered: ${p.first_name} ${p.last_name}`,
      timestamp: p.created_at
    });
  });

  recentDiagnoses.forEach(d => {
    const patientName = d.patient ? `${d.patient.first_name} ${d.patient.last_name}` : 'Bemor';
    const doctorName = d.diagnosingDoctor ? `Dr. ${d.diagnosingDoctor.first_name} ${d.diagnosingDoctor.last_name}` : 'Shifokor';
    activities.push({
      id: `diagnosis-${d.id}`,
      type: 'DIAGNOSIS_RECORDED',
      message: `${patientName} uchun yangi tashxis qo'yildi (${d.icd_code}) - ${doctorName} tomonidan`,
      message_en: `New diagnosis recorded (${d.icd_code}) for ${patientName} by ${doctorName}`,
      timestamp: d.created_at
    });
  });

  // Sort chronologically descending
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return activities.slice(0, 5);
}

module.exports = {
  getStats,
  getRecentActivity
};
