const UserModel = require('../models/userModel');
const DoctorModel = require('../models/doctorModel');
const PatientModel = require('../models/patientModel');
const DiagnosisModel = require('../models/diagnosisModel');

class DashboardService {
  static async getStats() {
    const users = await UserModel.findAll();
    const doctors = await DoctorModel.findAll();
    const patients = await PatientModel.findAll();
    const diagnoses = await DiagnosisModel.findAll();

    return {
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      totalDiagnoses: diagnoses.length,
      totalUsers: users.length
    };
  }

  static async getRecentActivities() {
    const doctors = await DoctorModel.findAll();
    const patients = await PatientModel.findAll();
    const diagnoses = await DiagnosisModel.findAll();

    const activities = [];

    // Add Doctor Activities
    doctors.forEach(doc => {
      activities.push({
        id: doc.id,
        type: 'doctor',
        action: 'Registered new Doctor',
        title: doc.full_name,
        subtitle: doc.specialty,
        timestamp: doc.created_at
      });
    });

    // Add Patient Activities
    patients.forEach(pat => {
      activities.push({
        id: pat.id,
        type: 'patient',
        action: 'Admitted new Patient',
        title: pat.full_name,
        subtitle: `${pat.age} years old, ${pat.gender}`,
        timestamp: pat.created_at
      });
    });

    // Add Diagnosis Activities
    for (const diag of diagnoses) {
      const patient = patients.find(p => p.id === diag.patient_id);
      activities.push({
        id: diag.id,
        type: 'diagnosis',
        action: 'Added Diagnosis',
        title: `ICD: ${diag.icd_code}`,
        subtitle: `${diag.description} (Severity: ${diag.severity}) for ${patient ? patient.full_name : 'Unknown Patient'}`,
        timestamp: diag.created_at
      });
    }

    // Sort by timestamp descending and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }
}

module.exports = DashboardService;
