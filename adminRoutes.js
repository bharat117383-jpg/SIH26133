// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(authenticate, authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.setUserActiveStatus);
router.get('/dashboard', adminController.getDashboardSummary);

module.exports = router;
