/**
 * PURPOSE: Main API router aggregator.
 * MAQSAD: Asosiy API routelarini jamlovchi fayl.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const doctorRoutes = require('./doctor.routes');
const patientRoutes = require('./patient.routes');
const diagnosisRoutes = require('./diagnosis.routes');
const dashboardRoutes = require('./dashboard.routes');

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/diagnoses', diagnosisRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
