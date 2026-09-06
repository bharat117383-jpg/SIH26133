// controllers/appointmentController.js
const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

// -----------------------------------------------------------------------------
// Helper: resolves the patient_id belonging to the logged-in user.
// -----------------------------------------------------------------------------
async function getPatientIdForUser(userId) {
  const [rows] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].patient_id : null;
}

// -----------------------------------------------------------------------------
// POST /api/appointments  (patient books an appointment)
// -----------------------------------------------------------------------------
const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, hospitalId, appointmentDate, appointmentTime, reasonForVisit } = req.body;

  if (!doctorId || !appointmentDate || !appointmentTime) {
    return error(res, 'doctorId, appointmentDate and appointmentTime are required.', 422);
  }

  // Reject dates in the past
  const requestedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
  if (Number.isNaN(requestedDateTime.getTime())) {
    return error(res, 'Invalid appointment date or time format.', 422);
  }
  if (requestedDateTime < new Date()) {
    return error(res, 'Appointment date/time cannot be in the past.', 422);
  }

  const patientId = await getPatientIdForUser(req.user.user_id);
  if (!patientId) {
    return error(res, 'Patient profile not found for this account.', 404);
  }

  // Confirm the doctor exists and is available
  const [doctorRows] = await pool.query(
    'SELECT doctor_id, hospital_id, availability_status FROM doctors WHERE doctor_id = ?',
    [doctorId]
  );
  if (doctorRows.length === 0) {
    return error(res, 'Doctor not found.', 404);
  }
  if (doctorRows[0].availability_status === 'unavailable') {
    return error(res, 'This doctor is currently not accepting appointments.', 409);
  }

  // Prevent double booking — check first for a friendly message,
  // the UNIQUE(doctor_id, appointment_date, appointment_time) constraint is the hard guarantee.
  const [clash] = await pool.query(
    `SELECT appointment_id FROM appointments
     WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
       AND appointment_status IN ('pending', 'confirmed')`,
    [doctorId, appointmentDate, appointmentTime]
  );
  if (clash.length > 0) {
    return error(res, 'This time slot is already booked for the selected doctor. Please choose another slot.', 409);
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO appointments
        (patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason_for_visit, appointment_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [patientId, doctorId, hospitalId || doctorRows[0].hospital_id || null, appointmentDate, appointmentTime, reasonForVisit || null]
    );

    // Notify the patient (simple in-app notification row)
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, notification_type)
       VALUES (?, 'Appointment Requested', 'Your appointment request has been submitted and is pending confirmation.', 'appointment')`,
      [req.user.user_id]
    );

    return success(res, 'Appointment booked successfully.', { appointment_id: result.insertId }, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, 'This time slot was just booked by someone else. Please choose another slot.', 409);
    }
    throw err;
  }
});

// -----------------------------------------------------------------------------
// GET /api/appointments  (role-aware listing)
// Patients see their own; doctors see theirs; admins see all (optionally filtered).
// -----------------------------------------------------------------------------
const getAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT a.*, up.full_name AS patient_name, ud.full_name AS doctor_name, h.hospital_name
    FROM appointments a
    JOIN patients p ON p.patient_id = a.patient_id
    JOIN users up ON up.user_id = p.user_id
    JOIN doctors d ON d.doctor_id = a.doctor_id
    JOIN users ud ON ud.user_id = d.user_id
    LEFT JOIN hospitals h ON h.hospital_id = a.hospital_id
    WHERE 1 = 1
  `;
  const params = [];

  if (req.user.role === 'patient') {
    const patientId = await getPatientIdForUser(req.user.user_id);
    sql += ' AND a.patient_id = ?';
    params.push(patientId);
  } else if (req.user.role === 'doctor') {
    const [doctorRows] = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = ?', [req.user.user_id]);
    sql += ' AND a.doctor_id = ?';
    params.push(doctorRows.length ? doctorRows[0].doctor_id : -1);
  }
  // admin / hospital_staff see everything (no extra filter)

  if (status) {
    sql += ' AND a.appointment_status = ?';
    params.push(status);
  }

  sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

  const [rows] = await pool.query(sql, params);
  return success(res, 'Appointments fetched successfully.', { appointments: rows, count: rows.length });
});

// -----------------------------------------------------------------------------
// GET /api/appointments/:id
// -----------------------------------------------------------------------------
const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT a.*, up.full_name AS patient_name, ud.full_name AS doctor_name, h.hospital_name
     FROM appointments a
     JOIN patients p ON p.patient_id = a.patient_id
     JOIN users up ON up.user_id = p.user_id
     JOIN doctors d ON d.doctor_id = a.doctor_id
     JOIN users ud ON ud.user_id = d.user_id
     LEFT JOIN hospitals h ON h.hospital_id = a.hospital_id
     WHERE a.appointment_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return error(res, 'Appointment not found.', 404);
  }

  return success(res, 'Appointment fetched successfully.', { appointment: rows[0] });
});

// -----------------------------------------------------------------------------
// PUT /api/appointments/:id  (reschedule / edit notes — patient or doctor)
// -----------------------------------------------------------------------------
const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { appointmentDate, appointmentTime, reasonForVisit, notes } = req.body;

  const [rows] = await pool.query('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
  if (rows.length === 0) {
    return error(res, 'Appointment not found.', 404);
  }

  if (appointmentDate && appointmentTime) {
    const [clash] = await pool.query(
      `SELECT appointment_id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
         AND appointment_id != ? AND appointment_status IN ('pending','confirmed')`,
      [rows[0].doctor_id, appointmentDate, appointmentTime, id]
    );
    if (clash.length > 0) {
      return error(res, 'The doctor already has an appointment at that date and time.', 409);
    }
  }

  await pool.query(
    `UPDATE appointments SET
       appointment_date = COALESCE(?, appointment_date),
       appointment_time = COALESCE(?, appointment_time),
       reason_for_visit = COALESCE(?, reason_for_visit),
       notes = COALESCE(?, notes)
     WHERE appointment_id = ?`,
    [appointmentDate, appointmentTime, reasonForVisit, notes, id]
  );

  return success(res, 'Appointment updated successfully.');
});

// -----------------------------------------------------------------------------
// PUT /api/appointments/:id/status  (doctor/admin confirms, completes, rejects)
// -----------------------------------------------------------------------------
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
  if (!validStatuses.includes(status)) {
    return error(res, `Status must be one of: ${validStatuses.join(', ')}`, 422);
  }

  const [result] = await pool.query(
    'UPDATE appointments SET appointment_status = ? WHERE appointment_id = ?',
    [status, id]
  );

  if (result.affectedRows === 0) {
    return error(res, 'Appointment not found.', 404);
  }

  return success(res, `Appointment marked as ${status}.`);
});

// -----------------------------------------------------------------------------
// DELETE /api/appointments/:id  (cancel)
// -----------------------------------------------------------------------------
const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query(
    "UPDATE appointments SET appointment_status = 'cancelled' WHERE appointment_id = ?",
    [id]
  );

  if (result.affectedRows === 0) {
    return error(res, 'Appointment not found.', 404);
  }

  return success(res, 'Appointment cancelled successfully.');
});

module.exports = {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointment, updateAppointmentStatus, deleteAppointment
};
