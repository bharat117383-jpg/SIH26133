// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(authenticate); // every appointment route requires login

router.post('/', authorize('patient'), appointmentController.createAppointment);
router.get('/', authorize('patient', 'doctor', 'admin', 'hospital_staff'), appointmentController.getAppointments);
router.get('/:id', authorize('patient', 'doctor', 'admin', 'hospital_staff'), appointmentController.getAppointmentById);
router.put('/:id', authorize('patient', 'doctor', 'admin'), appointmentController.updateAppointment);
router.put('/:id/status', authorize('doctor', 'admin', 'hospital_staff'), appointmentController.updateAppointmentStatus);
router.delete('/:id', authorize('patient', 'doctor', 'admin'), appointmentController.deleteAppointment);

module.exports = router;
