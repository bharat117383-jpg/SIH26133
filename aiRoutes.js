// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Not gated behind authenticate(): the symptom-checker/assessment screen is
// usable before login in the current frontend. If you want to restrict AI
// usage to logged-in patients only, add `authenticate` here, e.g.:
//   const authenticate = require('../middleware/authMiddleware');
//   router.post('/chat', authenticate, aiController.chat);
router.post('/chat', aiController.chat);

module.exports = router;
