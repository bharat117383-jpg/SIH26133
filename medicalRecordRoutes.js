// routes/medicalRecordRoutes.js
const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(authenticate); // medical records are always protected

router.post('/', authorize('doctor'), medicalRecordController.createMedicalRecord);
router.get('/patient/:patientId', authorize('patient', 'doctor', 'admin'), medicalRecordController.getRecordsByPatient);
router.get('/:id', authorize('patient', 'doctor', 'admin'), medicalRecordController.getRecordById);
router.put('/:id', authorize('doctor', 'admin'), medicalRecordController.updateRecord);
router.delete('/:id', authorize('admin'), medicalRecordController.deleteRecord);

module.exports = router;
