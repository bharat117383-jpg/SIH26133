// server.js
// -----------------------------------------------------------------------------
// Entry point for the SIH Healthcare backend. Wires up middleware, routes,
// and error handling, then starts the HTTP server.
// -----------------------------------------------------------------------------

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ---- Global middleware ------------------------------------------------------
app.use(helmet());                         // sets a handful of protective HTTP headers
app.use(morgan('dev'));                    // request logging in the console

// CORS: allows the existing HTML/CSS/JS frontend (served from anywhere,
// e.g. Live Server on a different port) to call this API.
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map(o => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());                   // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ---- Health check ------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SIH Healthcare backend is running.',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});

// ---- API routes ---------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// ---- 404 + centralized error handling -----------------------------------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
