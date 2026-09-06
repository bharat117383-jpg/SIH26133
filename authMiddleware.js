// middleware/authMiddleware.js
// -----------------------------------------------------------------------------
// Verifies the JWT sent by the frontend in the Authorization header:
//   Authorization: Bearer <token>
// On success it attaches the decoded payload to req.user for later use.
// -----------------------------------------------------------------------------

const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Authentication token missing. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded contains: { user_id, role, email }  (see authController on login)
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token. Please log in again.', 401);
  }
}

module.exports = authenticate;
