// config/database.js
// -----------------------------------------------------------------------------
// Creates a MySQL connection pool using mysql2's promise API.
// A pool (instead of a single connection) lets many requests reuse connections
// efficiently and reconnects automatically if a connection drops.
// -----------------------------------------------------------------------------

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sih_healthcare_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,   // max simultaneous connections held in the pool
  queueLimit: 0,         // 0 = unlimited queued requests waiting for a connection
  dateStrings: true      // return DATE/DATETIME columns as strings, not JS Date objects
});

// Quick self-test so a bad .env fails loudly at startup instead of on first request.
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully to database:', process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.error('   Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT in your .env file.');
  }
}

testConnection();

module.exports = pool;
