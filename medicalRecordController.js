// controllers/medicalRecordController.js
// -----------------------------------------------------------------------------
// Medical records are the most sensitive data in the system. Every handler
// re-checks that the requesting user is actually allowed to see/touch the
// specific record, on top of the role check already done in the route.
// -----------------------------------------------------------------------------

const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

async function getPatientIdForUser(userId) {
  const [rows] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].patient_id : null;
}

async function getDoctorIdForUser(userId) {
  const [rows] = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].doctor_id : null;
}

// -----------------------------------------------------------------------------
// POST /api/medical-records  (doctor only — creates a record after a consult)
// -----------------------------------------------------------------------------
const createMedicalRecord = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, diagnosis, prescription, treatment, notes, recordDate } = req.body;

  if (!patientId || !diagnosis) {
    return error(res, 'patientId and diagnosis are required.', 422);
  }

  const doctorId = await getDoctorIdForUser(req.user.user_id);
  if (!doctorId) {
    return error(res, 'Doctor profile not found for this account.', 404);
  }

  // If linked to an appointment, verify that appointment actually belongs to this doctor & patient
  if (appointmentId) {
    const [apptRows] = await pool.query(
      'SELECT appointment_id FROM appointments WHERE appointment_id = ? AND doctor_id = ? AND patient_id = ?',
      [appointmentId, doctorId, patientId]
    );
    if (apptRows.length === 0) {
      return error(res, 'The specified appointment does not match this doctor and patient.', 422);
    }
  }

  const [result] = await pool.query(
    `INSERT INTO medical_records
      (patient_id, doctor_id, appointment_id, diagnosis, prescription, treatment, notes, record_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [patientId, doctorId, appointmentId || null, diagnosis, prescription || null, treatment || null,
      notes || null, recordDate || new Date().toISOString().slice(0, 10)]
  );

  // Notify the patient that a new medical record is available
  const [patientUser] = await pool.query(
    'SELECT u.user_id FROM users u JOIN patients p ON p.user_id = u.user_id WHERE p.patient_id = ?',
    [patientId]
  );
  if (patientUser.length) {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, notification_type)
       VALUES (?, 'New Medical Record', 'Your doctor has added a new entry to your medical records.', 'medical_record')`,
      [patientUser[0].user_id]
    );
  }

  return success(res, 'Medical record created successfully.', { record_id: result.insertId }, 201);
});

// -----------------------------------------------------------------------------
// GET /api/medical-records/patient/:patientId
// Patients: only their own. Doctors: only patients they have treated. Admin: all.
// -----------------------------------------------------------------------------
const getRecordsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (req.user.role === 'patient') {
    const ownPatientId = await getPatientIdForUser(req.user.user_id);
    if (String(ownPatientId) !== String(patientId)) {
      return error(res, 'You are not authorized to view these medical records.', 403);
    }
  }

  if (req.user.role === 'doctor') {
    const doctorId = await getDoctorIdForUser(req.user.user_id);
    const [treated] = await pool.query(
      'SELECT record_id FROM medical_records WHERE patient_id = ? AND doctor_id = ? LIMIT 1',
      [patientId, doctorId]
    );
    if (treated.length === 0) {
      return error(res, 'You are not authorized to view records for a patient you have not treated.', 403);
    }
  }

  const [rows] = await pool.query(
    `SELECT mr.*, ud.full_name AS doctor_name
     FROM medical_records mr
     JOIN doctors d ON d.doctor_id = mr.doctor_id
     JOIN users ud ON ud.user_id = d.user_id
     WHERE mr.patient_id = ?
     ORDER BY mr.record_date DESC`,
    [patientId]
  );

  return success(res, 'Medical records fetched successfully.', { records: rows, count: rows.length });
});

// -----------------------------------------------------------------------------
// GET /api/medical-records/:id
// -----------------------------------------------------------------------------
const getRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM medical_records WHERE record_id = ?', [id]);

  if (rows.length === 0) {
    return error(res, 'Medical record not found.', 404);
  }
  const record = rows[0];

  if (req.user.role === 'patient') {
    const ownPatientId = await getPatientIdForUser(req.user.user_id);
    if (ownPatientId !== record.patient_id) {
      return error(res, 'You are not authorized to view this medical record.', 403);
    }
  }
  if (req.user.role === 'doctor') {
    const doctorId = await getDoctorIdForUser(req.user.user_id);
    if (doctorId !== record.doctor_id) {
      return error(res, 'You are not authorized to view this medical record.', 403);
    }
  }

  return success(res, 'Medical record fetched successfully.', { record });
});

// -----------------------------------------------------------------------------
// PUT /api/medical-records/:id  (only the authoring doctor, or admin)
// -----------------------------------------------------------------------------
const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { diagnosis, prescription, treatment, notes } = req.body;

  const [rows] = await pool.query('SELECT * FROM medical_records WHERE record_id = ?', [id]);
  if (rows.length === 0) {
    return error(res, 'Medical record not found.', 404);
  }

  if (req.user.role === 'doctor') {
    const doctorId = await getDoctorIdForUser(req.user.user_id);
    if (doctorId !== rows[0].doctor_id) {
      return error(res, 'You can only edit medical records you authored.', 403);
    }
  }

  await pool.query(
    `UPDATE medical_records SET
       diagnosis = COALESCE(?, diagnosis),
       prescription = COALESCE(?, prescription),
       treatment = COALESCE(?, treatment),
       notes = COALESCE(?, notes)
     WHERE record_id = ?`,
    [diagnosis, prescription, treatment, notes, id]
  );

  return success(res, 'Medical record updated successfully.');
});

// -----------------------------------------------------------------------------
// DELETE /api/medical-records/:id  (admin only, enforced at route level)
// -----------------------------------------------------------------------------
const deleteRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM medical_records WHERE record_id = ?', [id]);

  if (result.affectedRows === 0) {
    return error(res, 'Medical record not found.', 404);
  }
  return success(res, 'Medical record deleted successfully.');
});

module.exports = {
  createMedicalRecord, getRecordsByPatient, getRecordById, updateRecord, deleteRecord
};
