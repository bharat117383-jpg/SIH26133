// controllers/notificationController.js
const pool = require('../config/database');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

// GET /api/notifications  (protected — the logged-in user's own notifications)
const getMyNotifications = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.user_id]
  );
  return success(res, 'Notifications fetched successfully.', { notifications: rows, count: rows.length });
});

// PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
    [id, req.user.user_id]
  );

  if (result.affectedRows === 0) {
    return error(res, 'Notification not found.', 404);
  }
  return success(res, 'Notification marked as read.');
});

// DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query(
    'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
    [id, req.user.user_id]
  );

  if (result.affectedRows === 0) {
    return error(res, 'Notification not found.', 404);
  }
  return success(res, 'Notification deleted successfully.');
});

module.exports = { getMyNotifications, markAsRead, deleteNotification };
