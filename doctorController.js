// controllers/doctorController.js
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

const SALT_ROUNDS = 10;

// -----------------------------------------------------------------------------
// GET /api/doctors  (public — with optional filters, used by "Find a Doctor")
// Query params: specialization, city, language
// -----------------------------------------------------------------------------
const getAllDoctors = asyncHandler(async (req, res) => {
  const { specialization, city, language } = req.query;

  let sql = `
    SELECT d.doctor_id, d.specialization, d.qualification, d.experience_years,
           d.consultation_fee, d.availability_status,
           u.full_name, u.preferred_language,
           h.hospital_id, h.hospital_name, h.city, h.state
    FROM doctors d
    JOIN users u ON u.user_id = d.user_id
    LEFT JOIN hospitals h ON h.hospital_id = d.hospital_id
    WHERE 1 = 1
  `;
  const params = [];

  if (specialization) {
    sql += ' AND d.specialization LIKE ?';
    params.push(`%${specialization}%`);
  }
  if (city) {
    sql += ' AND h.city LIKE ?';
    params.push(`%${city}%`);
  }
  if (language) {
    sql += ' AND u.preferred_language LIKE ?';
    params.push(`%${language}%`);
  }

  sql += ' ORDER BY d.experience_years DESC';

  const [rows] = await pool.query(sql, params);
  return success(res, 'Doctors fetched successfully.', { doctors: rows, count: rows.length });
});

// -----------------------------------------------------------------------------
// GET /api/doctors/:id  (public)
// -----------------------------------------------------------------------------
const getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT d.*, u.full_name, u.email, u.phone, u.preferred_language,
            h.hospital_name, h.city, h.state
     FROM doctors d
     JOIN users u ON u.user_id = d.user_id
     LEFT JOIN hospitals h ON h.hospital_id = d.hospital_id
     WHERE d.doctor_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return error(res, 'Doctor not found.', 404);
  }

  return success(res, 'Doctor fetched successfully.', { doctor: rows[0] });
});

// -----------------------------------------------------------------------------
// POST /api/doctors  (admin only — onboard a new doctor: creates USER + DOCTOR)
// -----------------------------------------------------------------------------
const createDoctor = asyncHandler(async (req, res) => {
  const {
    fullName, email, phone, password, preferredLanguage,
    hospitalId, specialization, qualification, experienceYears,
    licenseNumber, consultationFee
  } = req.body;

  if (!fullName || !email || !password || !specialization || !licenseNumber) {
    return error(res, 'fullName, email, password, specialization and licenseNumber are required.', 422);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT user_id FROM users WHERE email = ? OR (phone IS NOT NULL AND phone = ?)',
      [email, phone || null]
    );
    if (existing.length > 0) {
      await connection.rollback();
      connection.release();
      return error(res, 'An account with this email or phone already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [userResult] = await connection.query(
      `INSERT INTO users (full_name, email, phone, password, role, preferred_language)
       VALUES (?, ?, ?, ?, 'doctor', ?)`,
      [fullName, email, phone || null, passwordHash, preferredLanguage || 'English']
    );

    const [doctorResult] = await connection.query(
      `INSERT INTO doctors
        (user_id, hospital_id, specialization, qualification, experience_years, license_number, consultation_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userResult.insertId, hospitalId || null, specialization, qualification || null,
        experienceYears || 0, licenseNumber, consultationFee || 0]
    );

    await connection.commit();
    return success(res, 'Doctor created successfully.', { doctor_id: doctorResult.insertId }, 201);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

// -----------------------------------------------------------------------------
// PUT /api/doctors/:id  (admin or the doctor themselves)
// -----------------------------------------------------------------------------
const updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    hospitalId, specialization, qualification, experienceYears,
    consultationFee, availabilityStatus
  } = req.body;

  const [rows] = await pool.query('SELECT * FROM doctors WHERE doctor_id = ?', [id]);
  if (rows.length === 0) {
    return error(res, 'Doctor not found.', 404);
  }

  if (req.user.role === 'doctor' && rows[0].user_id !== req.user.user_id) {
    return error(res, 'You can only update your own doctor profile.', 403);
  }

  await pool.query(
    `UPDATE doctors SET
       hospital_id = COALESCE(?, hospital_id),
       specialization = COALESCE(?, specialization),
       qualification = COALESCE(?, qualification),
       experience_years = COALESCE(?, experience_years),
       consultation_fee = COALESCE(?, consultation_fee),
       availability_status = COALESCE(?, availability_status)
     WHERE doctor_id = ?`,
    [hospitalId, specialization, qualification, experienceYears, consultationFee, availabilityStatus, id]
  );

  return success(res, 'Doctor updated successfully.');
});

// -----------------------------------------------------------------------------
// DELETE /api/doctors/:id  (admin only)
// -----------------------------------------------------------------------------
const deleteDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM doctors WHERE doctor_id = ?', [id]);

  if (result.affectedRows === 0) {
    return error(res, 'Doctor not found.', 404);
  }

  return success(res, 'Doctor deleted successfully.');
});

module.exports = { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
