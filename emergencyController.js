// controllers/emergencyController.js
const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

async function getPatientIdForUser(userId) {
  const [rows] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].patient_id : null;
}

// POST /api/emergency  (patient only)
const createEmergencyRequest = asyncHandler(async (req, res) => {
  const { hospitalId, emergencyType, description, latitude, longitude } = req.body;

  if (!emergencyType) {
    return error(res, 'emergencyType is required.', 422);
  }

  const patientId = await getPatientIdForUser(req.user.user_id);
  if (!patientId) {
    return error(res, 'Patient profile not found for this account.', 404);
  }

  const [result] = await pool.query(
    `INSERT INTO emergency_requests
      (patient_id, hospital_id, emergency_type, description, latitude, longitude, status)
     VALUES (?, ?, ?, ?, ?, ?, 'requested')`,
    [patientId, hospitalId || null, emergencyType, description || null, latitude || null, longitude || null]
  );

  await pool.query(
    `INSERT INTO notifications (user_id, title, message, notification_type)
     VALUES (?, 'Emergency Request Sent', 'Your emergency request has been received and help is being arranged.', 'emergency')`,
    [req.user.user_id]
  );

  return success(res, 'Emergency request submitted successfully.', { emergency_id: result.insertId }, 201);
});

// GET /api/emergency  (patient sees own, hospital_staff/admin see all or by hospital)
const getEmergencyRequests = asyncHandler(async (req, res) => {
  let sql = `
    SELECT e.*, up.full_name AS patient_name, h.hospital_name
    FROM emergency_requests e
    JOIN patients p ON p.patient_id = e.patient_id
    JOIN users up ON up.user_id = p.user_id
    LEFT JOIN hospitals h ON h.hospital_id = e.hospital_id
    WHERE 1 = 1
  `;
  const params = [];

  if (req.user.role === 'patient') {
    const patientId = await getPatientIdForUser(req.user.user_id);
    sql += ' AND e.patient_id = ?';
    params.push(patientId);
  }

  sql += ' ORDER BY e.requested_at DESC';

  const [rows] = await pool.query(sql, params);
  return success(res, 'Emergency requests fetched successfully.', { emergencies: rows, count: rows.length });
});

// PUT /api/emergency/:id/status  (hospital_staff/admin only)
const updateEmergencyStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return error(res, `Status must be one of: ${validStatuses.join(', ')}`, 422);
  }

  const [result] = await pool.query(
    'UPDATE emergency_requests SET status = ? WHERE emergency_id = ?',
    [status, id]
  );

  if (result.affectedRows === 0) {
    return error(res, 'Emergency request not found.', 404);
  }

  return success(res, `Emergency request marked as ${status}.`);
});

module.exports = { createEmergencyRequest, getEmergencyRequests, updateEmergencyStatus };
