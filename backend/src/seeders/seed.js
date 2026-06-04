/**
 * PURPOSE: Database seeder script for demo data population.
 * MAQSAD: Tizimni demo ma'lumotlar bilan to'ldirish skripti.
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User, Doctor, Patient, Diagnosis } = require('../models');

const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'General Medicine',
  'Orthopedics'
];

const SPECIALIZATIONS = [
  'Cardiologist',
  'Neurologist',
  'Pediatrician',
  'General Practitioner',
  'Orthopedic Surgeon'
];

const ICD_DIAGNOSES = [
  { icd_code: 'I10', description: 'Essential (primary) hypertension / Arterial gipertenziya' },
  { icd_code: 'E11.9', description: 'Type 2 diabetes mellitus without complications / Qandli diabet 2-tip' },
  { icd_code: 'J45.9', description: 'Unspecified asthma / Bronxial astma' },
  { icd_code: 'M54.5', description: 'Low back pain / Bel sohasidagi og\'riq' },
  { icd_code: 'K21.9', description: 'Gastro-esophageal reflux disease / Gastroezofageal reflyuks' },
  { icd_code: 'J06.9', description: 'Acute upper respiratory infection / O\'tkir respirator infeksiya' },
  { icd_code: 'N39.0', description: 'Urinary tract infection / Siydik yo\'llari infeksiyasi' },
  { icd_code: 'G43.9', description: 'Migraine, unspecified / Migren bosh og\'rig\'i' }
];

async function seedDatabase() {
  try {
    console.error('Connecting to database and force-syncing... / Bazaga ulanmoqda va tozalanmoqda...');
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    // 1. Create Users
    console.error('Creating Users... / Foydalanuvchilar yaratilmoqda...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const doctorPasswordHash = await bcrypt.hash('clinician123', salt);
    const receptionistPasswordHash = await bcrypt.hash('receptionist123', salt);

    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@caretrack.uz',
      password_hash: adminPasswordHash,
      role: 'admin'
    });

    const clinicianUser = await User.create({
      username: 'clinician',
      email: 'doctor@caretrack.uz',
      password_hash: doctorPasswordHash,
      role: 'clinician'
    });

    const receptionistUser = await User.create({
      username: 'receptionist',
      email: 'reception@caretrack.uz',
      password_hash: receptionistPasswordHash,
      role: 'receptionist'
    });

    // 2. Create 10 Doctors
    console.error('Creating 10 Doctors... / 10 ta shifokor yaratilmoqda...');
    const doctorsData = [
      { first_name: 'Gregory', last_name: 'House', specialization: 'Diagnostic Medicine', department: 'Diagnostics', phone: '+998901112233', email: 'house@caretrack.uz', license_number: 'DOC1001' },
      { first_name: 'John', last_name: 'Watson', specialization: 'General Practitioner', department: 'General Medicine', phone: '+998902223344', email: 'watson@caretrack.uz', license_number: 'DOC1002' },
      { first_name: 'Stephen', last_name: 'Strange', specialization: 'Neurosurgeon', department: 'Neurology', phone: '+998903334455', email: 'strange@caretrack.uz', license_number: 'DOC1003' },
      { first_name: 'Leonard', last_name: 'McCoy', specialization: 'General Practitioner', department: 'General Medicine', phone: '+998904445566', email: 'mccoy@caretrack.uz', license_number: 'DOC1004' },
      { first_name: 'Meredith', last_name: 'Grey', specialization: 'General Surgeon', department: 'General Medicine', phone: '+998905556677', email: 'grey@caretrack.uz', license_number: 'DOC1005' },
      { first_name: 'Allison', last_name: 'Cameron', specialization: 'Immunologist', department: 'Diagnostics', phone: '+998906667788', email: 'cameron@caretrack.uz', license_number: 'DOC1006' },
      { first_name: 'Robert', last_name: 'Chase', specialization: 'Intensivist', department: 'Diagnostics', phone: '+998907778899', email: 'chase@caretrack.uz', license_number: 'DOC1007' },
      { first_name: 'Eric', last_name: 'Foreman', specialization: 'Neurologist', department: 'Neurology', phone: '+998908889900', email: 'foreman@caretrack.uz', license_number: 'DOC1008' },
      { first_name: 'James', last_name: 'Wilson', specialization: 'Oncologist', department: 'General Medicine', phone: '+998909990011', email: 'wilson@caretrack.uz', license_number: 'DOC1009' },
      { first_name: 'Shaun', last_name: 'Murphy', specialization: 'Pediatric Surgeon', department: 'Pediatrics', phone: '+998901119999', email: 'murphy@caretrack.uz', license_number: 'DOC1010' }
    ];

    const doctors = [];
    for (const doc of doctorsData) {
      const createdDoc = await Doctor.create({
        ...doc,
        created_by: adminUser.id
      });
      doctors.push(createdDoc);
    }

    // 3. Create 20 Patients
    console.error('Creating 20 Patients... / 20 ta bemor yaratilmoqda...');
    const patientFirstNames = ['Ali', 'Vali', 'Dilshod', 'Sardor', 'Jasur', 'Malika', 'Madina', 'Laylo', 'Zuhra', 'Bobur', 'Davron', 'Umid', 'Shahzod', 'Gulnoza', 'Nigora', 'Lola', 'Sherzod', 'Javohir', 'Kamola', 'Zilola'];
    const patientLastNames = ['Karimov', 'Aliev', 'Tursunov', 'Raximov', 'Umarov', 'Sodiqova', 'Xasanova', 'Karimova', 'Usmonova', 'Rustamov', 'Ismoilov', 'Kamilov', 'Yusupov', 'Axmedova', 'Abduvalieva', 'Gafurova', 'Zokirov', 'Toshpulatov', 'Juraeva', 'Murodova'];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genders = ['Male', 'Male', 'Male', 'Male', 'Male', 'Female', 'Female', 'Female', 'Female', 'Male', 'Male', 'Male', 'Male', 'Female', 'Female', 'Female', 'Male', 'Male', 'Female', 'Female'];

    const patients = [];
    for (let i = 0; i < 20; i++) {
      const assignedDoctor = doctors[i % doctors.length];
      const registeredByUser = (i % 2 === 0) ? adminUser : receptionistUser;
      
      const birthYear = 1970 + (i * 2);
      const dob = `${birthYear}-05-15`;

      const createdPatient = await Patient.create({
        first_name: patientFirstNames[i],
        last_name: patientLastNames[i],
        date_of_birth: dob,
        gender: genders[i],
        phone: `+99894${1000000 + i * 4235}`,
        email: `${patientFirstNames[i].toLowerCase()}.${patientLastNames[i].toLowerCase()}@mail.com`,
        address: `Tashkent City, District ${i + 1}`,
        blood_type: bloodTypes[i % bloodTypes.length],
        assigned_doctor_id: assignedDoctor.id,
        registered_by: registeredByUser.id
      });
      patients.push(createdPatient);
    }

    // 4. Create 30 Diagnoses
    console.error('Creating 30 Diagnoses... / 30 ta tashxis yaratilmoqda...');
    const severities = ['mild', 'moderate', 'severe', 'critical'];
    const notesList = [
      'Patient advised to rest and drink warm liquids. / Bemorga dam olish va iliq suyuqlik ichish tavsiya etildi.',
      'Regular checkup required in 2 weeks. / 2 haftadan so\'ng muntazam tekshiruvdan o\'tish kerak.',
      'Prescribed antibiotics and painkillers. / Antibiotik va og\'riq qoldiruvchilar yozib berildi.',
      'Recommend dietary changes and daily exercise. / Parhez va har kunlik jismoniy mashqlar tavsiya etildi.',
      'Immediate treatment and monitoring required. / Zudlik bilan davolash va nazorat qilish shart.'
    ];

    for (let i = 0; i < 30; i++) {
      const patient = patients[i % patients.length];
      const doctor = doctors[(i + 3) % doctors.length];
      const createdByUser = (i % 2 === 0) ? adminUser : clinicianUser;
      const refDiagnosis = ICD_DIAGNOSES[i % ICD_DIAGNOSES.length];

      // Stagger dates in the past
      const diagDate = new Date();
      diagDate.setDate(diagDate.getDate() - (30 - i));

      await Diagnosis.create({
        patient_id: patient.id,
        icd_code: refDiagnosis.icd_code,
        description: refDiagnosis.description,
        severity: severities[i % severities.length],
        diagnosed_by: doctor.id,
        diagnosis_date: diagDate,
        notes: notesList[i % notesList.length],
        created_by: createdByUser.id
      });
    }

    console.error('=====================================================');
    console.error(' Database Seeding Completed Successfully!           ');
    console.error(' Demo Foydalanuvchilar:                             ');
    console.error(' - Admin: admin / admin123                          ');
    console.error(' - Clinician: clinician / clinician123              ');
    console.error(' - Receptionist: receptionist / receptionist123      ');
    console.error('=====================================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed / Seeding xatolik yuz berdi:', error);
    process.exit(1);
  }
}

seedDatabase();
