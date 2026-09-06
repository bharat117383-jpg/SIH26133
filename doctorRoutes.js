// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Public — patients browsing the "Find a Doctor" screen don't need to log in first
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Admin-managed onboarding
router.post('/', authenticate, authorize('admin'), doctorController.createDoctor);
router.put('/:id', authenticate, authorize('admin', 'doctor'), doctorController.updateDoctor);
router.delete('/:id', authenticate, authorize('admin'), doctorController.deleteDoctor);

module.exports = router;
