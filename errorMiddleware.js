// middleware/errorMiddleware.js
// -----------------------------------------------------------------------------
// Catches any error passed to next(err) or thrown inside an async route
// (when routes are wrapped with the asyncHandler helper below) and returns
// a consistent JSON error response instead of leaking a stack trace or
// crashing the server.
// -----------------------------------------------------------------------------

function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // MySQL duplicate entry (unique constraint violation)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists (duplicate entry).'
    });
  }

  // MySQL foreign key violation
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      success: false,
      message: 'This operation violates a database relationship (invalid reference).'
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
}

// Wraps an async route handler so thrown errors are forwarded to errorHandler
// instead of needing try/catch in every single controller function.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { notFound, errorHandler, asyncHandler };
