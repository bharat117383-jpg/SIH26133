// controllers/hospitalController.js
const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

const getAllHospitals = asyncHandler(async (req, res) => {
  const { city, emergencyOnly } = req.query;
  let sql = 'SELECT * FROM hospitals WHERE 1 = 1';
  const params = [];

  if (city) {
    sql += ' AND city LIKE ?';
    params.push(`%${city}%`);
  }
  if (emergencyOnly === 'true') {
    sql += ' AND emergency_available = 1';
  }
  sql += ' ORDER BY hospital_name ASC';

  const [rows] = await pool.query(sql, params);
  return success(res, 'Hospitals fetched successfully.', { hospitals: rows, count: rows.length });
});

const getHospitalById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM hospitals WHERE hospital_id = ?', [id]);

  if (rows.length === 0) {
    return error(res, 'Hospital not found.', 404);
  }
  return success(res, 'Hospital fetched successfully.', { hospital: rows[0] });
});

const createHospital = asyncHandler(async (req, res) => {
  const {
    hospitalName, registrationNumber, address, city, state, country,
    phone, email, latitude, longitude, emergencyAvailable
  } = req.body;

  if (!hospitalName || !registrationNumber) {
    return error(res, 'hospitalName and registrationNumber are required.', 422);
  }

  const [result] = await pool.query(
    `INSERT INTO hospitals
      (hospital_name, registration_number, address, city, state, country, phone, email, latitude, longitude, emergency_available)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [hospitalName, registrationNumber, address || null, city || null, state || null, country || 'India',
      phone || null, email || null, latitude || null, longitude || null, emergencyAvailable ? 1 : 0]
  );

  return success(res, 'Hospital created successfully.', { hospital_id: result.insertId }, 201);
});

const updateHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    hospitalName, address, city, state, country, phone, email,
    latitude, longitude, emergencyAvailable
  } = req.body;

  const [result] = await pool.query(
    `UPDATE hospitals SET
       hospital_name = COALESCE(?, hospital_name),
       address = COALESCE(?, address),
       city = COALESCE(?, city),
       state = COALESCE(?, state),
       country = COALESCE(?, country),
       phone = COALESCE(?, phone),
       email = COALESCE(?, email),
       latitude = COALESCE(?, latitude),
       longitude = COALESCE(?, longitude),
       emergency_available = COALESCE(?, emergency_available)
     WHERE hospital_id = ?`,
    [hospitalName, address, city, state, country, phone, email, latitude, longitude,
      typeof emergencyAvailable === 'boolean' ? (emergencyAvailable ? 1 : 0) : null, id]
  );

  if (result.affectedRows === 0) {
    return error(res, 'Hospital not found.', 404);
  }

  return success(res, 'Hospital updated successfully.');
});

module.exports = { getAllHospitals, getHospitalById, createHospital, updateHospital };
