require('dotenv').config();
module.exports = {
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres"
  },
  "test": {
    "username": process.env.TEST_DB_USER,
    "password": process.env.TEST_DB_PASS,
    "database": process.env.TEST_DB_NAME,
    "host": process.env.TEST_DB_HOST,
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.PRO_DB_USER,
    "password": process.env.PRO_DB_PASS,
    "database": process.env.PRO_DB_NAME,
    "host": process.env.PRO_DB_HOST,
    "dialect": "postgres"
  }
}
