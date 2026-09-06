// controllers/adminController.js
// -----------------------------------------------------------------------------
// Admin-only management endpoints: system-wide visibility over users and
// a small dashboard summary. All routes here require role = 'admin'
// (enforced in routes/adminRoutes.js).
// -----------------------------------------------------------------------------

const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

// GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  let sql = 'SELECT user_id, full_name, email, phone, role, preferred_language, is_active, created_at FROM users WHERE 1 = 1';
  const params = [];

  if (role) {
    sql += ' AND role = ?';
    params.push(role);
  }
  sql += ' ORDER BY created_at DESC';

  const [rows] = await pool.query(sql, params);
  return success(res, 'Users fetched successfully.', { users: rows, count: rows.length });
});

// PUT /api/admin/users/:id/status  (activate / deactivate an account)
const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return error(res, 'isActive (boolean) is required.', 422);
  }

  const [result] = await pool.query('UPDATE users SET is_active = ? WHERE user_id = ?', [isActive ? 1 : 0, id]);
  if (result.affectedRows === 0) {
    return error(res, 'User not found.', 404);
  }

  return success(res, `User account ${isActive ? 'activated' : 'deactivated'} successfully.`);
});

// GET /api/admin/dashboard  (quick counts for an admin overview screen)
const getDashboardSummary = asyncHandler(async (req, res) => {
  const [[patients]] = await pool.query('SELECT COUNT(*) AS count FROM patients');
  const [[doctors]] = await pool.query('SELECT COUNT(*) AS count FROM doctors');
  const [[hospitals]] = await pool.query('SELECT COUNT(*) AS count FROM hospitals');
  const [[appointments]] = await pool.query('SELECT COUNT(*) AS count FROM appointments');
  const [[pendingAppointments]] = await pool.query("SELECT COUNT(*) AS count FROM appointments WHERE appointment_status = 'pending'");
  const [[emergencies]] = await pool.query("SELECT COUNT(*) AS count FROM emergency_requests WHERE status IN ('requested','accepted','in_progress')");

  return success(res, 'Dashboard summary fetched successfully.', {
    total_patients: patients.count,
    total_doctors: doctors.count,
    total_hospitals: hospitals.count,
    total_appointments: appointments.count,
    pending_appointments: pendingAppointments.count,
    active_emergencies: emergencies.count
  });
});

module.exports = { getAllUsers, setUserActiveStatus, getDashboardSummary };
