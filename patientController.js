// controllers/patientController.js
const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

// -----------------------------------------------------------------------------
// GET /api/patients/profile  (protected — patient's own profile via JWT)
// -----------------------------------------------------------------------------
const getMyProfile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.full_name, u.email, u.phone, u.preferred_language
     FROM patients p
     JOIN users u ON u.user_id = p.user_id
     WHERE p.user_id = ?`,
    [req.user.user_id]
  );

  if (rows.length === 0) {
    return error(res, 'Patient profile not found.', 404);
  }

  return success(res, 'Patient profile fetched successfully.', { patient: rows[0] });
});

// -----------------------------------------------------------------------------
// PUT /api/patients/profile  (protected — update own profile)
// -----------------------------------------------------------------------------
const updateMyProfile = asyncHandler(async (req, res) => {
  const {
    dateOfBirth, gender, bloodGroup, address, city, state, country,
    emergencyContactName, emergencyContactPhone, profilePhoto, preferredLanguage
  } = req.body;

  const [patientRows] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.user_id]);
  if (patientRows.length === 0) {
    return error(res, 'Patient profile not found.', 404);
  }

  await pool.query(
    `UPDATE patients SET
       date_of_birth = COALESCE(?, date_of_birth),
       gender = COALESCE(?, gender),
       blood_group = COALESCE(?, blood_group),
       address = COALESCE(?, address),
       city = COALESCE(?, city),
       state = COALESCE(?, state),
       country = COALESCE(?, country),
       emergency_contact_name = COALESCE(?, emergency_contact_name),
       emergency_contact_phone = COALESCE(?, emergency_contact_phone),
       profile_photo = COALESCE(?, profile_photo)
     WHERE user_id = ?`,
    [dateOfBirth, gender, bloodGroup, address, city, state, country,
      emergencyContactName, emergencyContactPhone, profilePhoto, req.user.user_id]
  );

  if (preferredLanguage) {
    await pool.query('UPDATE users SET preferred_language = ? WHERE user_id = ?', [preferredLanguage, req.user.user_id]);
  }

  return success(res, 'Patient profile updated successfully.');
});

// -----------------------------------------------------------------------------
// GET /api/patients/:id  (protected — doctor/admin looking up a specific patient)
// -----------------------------------------------------------------------------
const getPatientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Patients may only fetch their own record via this route; doctors/admins may fetch any.
  if (req.user.role === 'patient') {
    const [selfCheck] = await pool.query('SELECT patient_id FROM patients WHERE patient_id = ? AND user_id = ?', [id, req.user.user_id]);
    if (selfCheck.length === 0) {
      return error(res, 'You are not authorized to view this patient record.', 403);
    }
  }

  const [rows] = await pool.query(
    `SELECT p.*, u.full_name, u.email, u.phone, u.preferred_language
     FROM patients p
     JOIN users u ON u.user_id = p.user_id
     WHERE p.patient_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return error(res, 'Patient not found.', 404);
  }

  return success(res, 'Patient fetched successfully.', { patient: rows[0] });
});

module.exports = { getMyProfile, updateMyProfile, getPatientById };
