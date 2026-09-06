// routes/hospitalRoutes.js
const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/', hospitalController.getAllHospitals);
router.get('/:id', hospitalController.getHospitalById);
router.post('/', authenticate, authorize('admin'), hospitalController.createHospital);
router.put('/:id', authenticate, authorize('admin', 'hospital_staff'), hospitalController.updateHospital);

module.exports = router;
