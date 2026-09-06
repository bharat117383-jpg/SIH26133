// middleware/roleMiddleware.js
// -----------------------------------------------------------------------------
// Restricts a route to one or more roles. Must run AFTER authMiddleware,
// since it relies on req.user being already populated.
//
// Usage:  router.get('/admin-only', authenticate, authorize('admin'), handler)
// -----------------------------------------------------------------------------

const { error } = require('../utils/response');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'You do not have permission to perform this action.', 403);
    }

    next();
  };
}

module.exports = authorize;
