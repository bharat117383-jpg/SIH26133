// utils/response.js
// -----------------------------------------------------------------------------
// Small helpers so every controller returns JSON in exactly the same shape.
// This is what the frontend's fetch calls should always expect back.
// -----------------------------------------------------------------------------

function success(res, message, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = { success, error };
