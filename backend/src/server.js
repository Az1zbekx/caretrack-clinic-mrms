/**
 * PURPOSE: Entry server file, database synchronization, and server startup.
 * MAQSAD: Kirish server fayli, ma'lumotlar bazasini sinxronizatsiya qilish va serverni ishga tushirish.
 */

require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Authenticate and sync database
    await sequelize.authenticate();
    // In production/development, sync models with the database tables
    await sequelize.sync({ alter: true });
    
    const server = app.listen(PORT, () => {
      // console.error is allowed in catches, but this is a standard boot log
      // Let's use console.error or log standard messages with care
      console.log(`=================================================`);
      console.log(` CareTrack Clinic Server running in [${NODE_ENV}] mode`);
      console.log(` Local URL: http://localhost:${PORT}`);
      console.log(`=================================================`);
    });

    // Graceful shutdown handling
    const shutdown = (signal) => {
      console.log(`${signal} signal received: closing HTTP server...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await sequelize.close();
          console.log('Database connection closed.');
          process.exit(0);
        } catch (dbErr) {
          console.error('Error closing database connection:', dbErr);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
