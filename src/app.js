const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware Imports
const errorMiddleware = require('./middleware/errorMiddleware');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for local testing and simpler frontend integration
}));
app.use(cors());

// HTTP Request Logger
app.use(morgan('dev'));

// JSON and Form Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend assets statically
app.use(express.static(path.join(__dirname, '../frontend')));

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Handle unknown API requests with 404
app.use('/api', notFoundMiddleware);

// Catch-all route to serve the frontend single-page-app or redirects to dashboard/index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Centralized error handler
app.use(errorMiddleware);

module.exports = app;
