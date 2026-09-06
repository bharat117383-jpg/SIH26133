// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/profile', authenticate, authorize('patient'), patientController.getMyProfile);
router.put('/profile', authenticate, authorize('patient'), patientController.updateMyProfile);
router.get('/:id', authenticate, authorize('patient', 'doctor', 'admin', 'hospital_staff'), patientController.getPatientById);

module.exports = router;
