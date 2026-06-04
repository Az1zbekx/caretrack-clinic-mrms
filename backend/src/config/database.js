/**
 * PURPOSE: Database connection configuration using Sequelize ORM.
 * MAQSAD: Sequelize ORM yordamida ma'lumotlar bazasiga ulanish konfiguratsiyasi.
 */

const { Sequelize } = require('sequelize');
const path = require('path');

const dialect = process.env.DB_DIALECT || (process.env.DB_HOST ? 'postgres' : 'sqlite');

let sequelize;

if (dialect === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'caretrack_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        paranoid: true, // soft delete
      },
    }
  );
} else {
  // Fallback to local SQLite database
  const storagePath = path.join(__dirname, '../../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true, // soft delete
    },
  });
}

module.exports = sequelize;
