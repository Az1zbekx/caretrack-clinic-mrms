/**
 * PURPOSE: Express Application Configuration.
 * MAQSAD: Express ilova konfiguratsiyasi.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for simpler local testing and integration
}));
app.use(cors({
  origin: true,
  credentials: true
}));

// Request logger
app.use(morgan('dev'));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve API endpoints
app.use('/api', routes);

// Serve frontend static assets in production
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Catch-all route to serve the React index.html for any frontend client-side routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      // In development, fallback to a simple index page if dist is not compiled yet
      res.status(200).send('CareTrack Clinic API Server is active. Frontend is starting...');
    }
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
