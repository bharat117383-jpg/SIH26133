// controllers/authController.js
// -----------------------------------------------------------------------------
// Handles registration, login, logout, and the "who am I" profile check.
// -----------------------------------------------------------------------------

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

const SALT_ROUNDS = 10;

// Signs a JWT containing the minimum info needed to identify & authorize the user.
function generateToken(user) {
  return jwt.sign(
    { user_id: user.user_id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// -----------------------------------------------------------------------------
// POST /api/auth/register
// Registers a new user. If role is "patient" (default), also creates the
// matching row in `patients` so the profile is ready to use immediately.
// -----------------------------------------------------------------------------
const register = asyncHandler(async (req, res) => {
  const {
    fullName, email, phone, password,
    role, preferredLanguage,
    // optional patient-profile fields, all safe to omit
    dateOfBirth, gender, bloodGroup, address, city, state, country,
    emergencyContactName, emergencyContactPhone
  } = req.body;

  if (!fullName || !email || !password) {
    return error(res, 'Full name, email and password are required.', 422);
  }
  if (password.length < 6) {
    return error(res, 'Password must be at least 6 characters long.', 422);
  }

  const allowedRoles = ['patient', 'doctor', 'admin', 'hospital_staff'];
  const finalRole = allowedRoles.includes(role) ? role : 'patient';

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check for existing email/phone up front for a friendlier error message
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
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone || null, passwordHash, finalRole, preferredLanguage || 'English']
    );

    const userId = userResult.insertId;

    // Auto-create a blank/partial patient profile so the frontend dashboard
    // has a row to read/update immediately after registration.
    if (finalRole === 'patient') {
      await connection.query(
        `INSERT INTO patients
          (user_id, date_of_birth, gender, blood_group, address, city, state, country,
           emergency_contact_name, emergency_contact_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          dateOfBirth || null,
          gender || null,
          bloodGroup || null,
          address || null,
          city || null,
          state || null,
          country || 'India',
          emergencyContactName || null,
          emergencyContactPhone || null
        ]
      );
    }

    await connection.commit();

    const newUser = { user_id: userId, role: finalRole, email };
    const token = generateToken(newUser);

    return success(res, 'Registration successful.', {
      token,
      user: { user_id: userId, full_name: fullName, email, role: finalRole }
    }, 201);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/login
// -----------------------------------------------------------------------------
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, 'Email and password are required.', 422);
  }

  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (rows.length === 0) {
    return error(res, 'Invalid email or password.', 401);
  }

  const user = rows[0];

  if (!user.is_active) {
    return error(res, 'This account has been deactivated. Contact support.', 403);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return error(res, 'Invalid email or password.', 401);
  }

  const token = generateToken(user);

  return success(res, 'Login successful.', {
    token,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      preferred_language: user.preferred_language
    }
  });
});

// -----------------------------------------------------------------------------
// POST /api/auth/logout
// JWTs are stateless, so "logout" is really just a signal for the frontend to
// discard its stored token. This endpoint exists for a consistent API contract
// and as a hook if you later add refresh-token/blacklist logic.
// -----------------------------------------------------------------------------
const logout = asyncHandler(async (req, res) => {
  return success(res, 'Logged out successfully. Please discard the token on the client.');
});

// -----------------------------------------------------------------------------
// GET /api/auth/profile  (protected)
// Returns the currently authenticated user's core info.
// -----------------------------------------------------------------------------
const getProfile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT user_id, full_name, email, phone, role, preferred_language, is_active, created_at
     FROM users WHERE user_id = ?`,
    [req.user.user_id]
  );

  if (rows.length === 0) {
    return error(res, 'User not found.', 404);
  }

  return success(res, 'Profile fetched successfully.', { user: rows[0] });
});

module.exports = { register, login, logout, getProfile };
