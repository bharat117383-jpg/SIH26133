// routes/emergencyRoutes.js
const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(authenticate);

router.post('/', authorize('patient'), emergencyController.createEmergencyRequest);
router.get('/', authorize('patient', 'hospital_staff', 'admin', 'doctor'), emergencyController.getEmergencyRequests);
router.put('/:id/status', authorize('hospital_staff', 'admin'), emergencyController.updateEmergencyStatus);

module.exports = router;
