/**
 * api.js
 * ---------------------------------------------------------------------------
 * Drop this file into your existing frontend (e.g. next to script.js) and
 * include it with:
 *     <script src="js/api.js"></script>
 * before your existing script.js in index.html.
 *
 * It gives you plain functions you can call from your existing form handlers
 * and button click listeners — it does not touch or redesign any UI.
 * ---------------------------------------------------------------------------
 */

const API_BASE_URL = "http://localhost:5000/api";

/** Reads the saved JWT token (if the user is logged in). */
function getToken() {
  return localStorage.getItem("ss_token");
}

function saveSession(token, user) {
  localStorage.setItem("ss_token", token);
  localStorage.setItem("ss_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("ss_token");
  localStorage.removeItem("ss_user");
}

function getCurrentUser() {
  const raw = localStorage.getItem("ss_user");
  return raw ? JSON.parse(raw) : null;
}

/**
 * Core fetch wrapper: adds the JSON content-type header, attaches the JWT
 * (if present) as a Bearer token, and always returns the parsed JSON body
 * in the { success, message, data } shape the backend guarantees.
 */
async function apiRequest(endpoint, method = "GET", body = null, requiresAuth = false) {
  const headers = { "Content-Type": "application/json" };

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      return { success: false, message: "You must be logged in to do this." };
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    return data; // always { success, message, data? }
  } catch (err) {
    console.error("API request failed:", err);
    return { success: false, message: "Could not reach the server. Please check your connection." };
  }
}

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------

/**
 * Register a new patient.
 * formValues should map to your #patientRegisterForm fields, e.g.:
 * { fullName, email, password, phone, age, gender, city, state, emergencyPhone }
 * Note: email + password aren't in the current form — add two inputs
 * (e.g. #regEmail, #regPassword) for full authentication support.
 */
async function registerPatient(formValues) {
  const result = await apiRequest("/auth/register", "POST", {
    fullName: formValues.fullName,
    email: formValues.email,
    password: formValues.password,
    phone: formValues.phone,
    role: "patient",
    preferredLanguage: formValues.preferredLanguage || "English",
    city: formValues.city,
    state: formValues.state,
    emergencyContactPhone: formValues.emergencyPhone
  });

  if (result.success) {
    saveSession(result.data.token, result.data.user);
  }
  return result;
}

async function loginUser(email, password) {
  const result = await apiRequest("/auth/login", "POST", { email, password });
  if (result.success) {
    saveSession(result.data.token, result.data.user);
  }
  return result;
}

async function logoutUser() {
  const result = await apiRequest("/auth/logout", "POST", null, true);
  clearSession();
  return result;
}

async function getMyAuthProfile() {
  return apiRequest("/auth/profile", "GET", null, true);
}

// ---------------------------------------------------------------------------
// PATIENT PROFILE
// ---------------------------------------------------------------------------

async function getPatientProfile() {
  return apiRequest("/patients/profile", "GET", null, true);
}

async function updatePatientProfile(profileData) {
  return apiRequest("/patients/profile", "PUT", profileData, true);
}

// ---------------------------------------------------------------------------
// DOCTORS
// ---------------------------------------------------------------------------

/** filters: { specialization, city, language } — all optional */
async function getDoctors(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiRequest(`/doctors${query ? "?" + query : ""}`, "GET");
}

// ---------------------------------------------------------------------------
// HOSPITALS
// ---------------------------------------------------------------------------

async function getHospitals(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiRequest(`/hospitals${query ? "?" + query : ""}`, "GET");
}

// ---------------------------------------------------------------------------
// APPOINTMENTS  (matches #appointmentBookingForm fields)
// ---------------------------------------------------------------------------

async function bookAppointment({ doctorId, hospitalId, consultDate, consultTime, symptomsDesc }) {
  return apiRequest("/appointments", "POST", {
    doctorId,
    hospitalId,
    appointmentDate: consultDate,
    appointmentTime: consultTime,
    reasonForVisit: symptomsDesc
  }, true);
}

async function getMyAppointments(status = null) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest(`/appointments${query}`, "GET", null, true);
}

async function cancelAppointment(appointmentId) {
  return apiRequest(`/appointments/${appointmentId}`, "DELETE", null, true);
}

// ---------------------------------------------------------------------------
// MEDICAL RECORDS
// ---------------------------------------------------------------------------

async function getMyMedicalRecords(patientId) {
  return apiRequest(`/medical-records/patient/${patientId}`, "GET", null, true);
}

// ---------------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------------

async function getNotifications() {
  return apiRequest("/notifications", "GET", null, true);
}

async function markNotificationRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, "PUT", null, true);
}

// ---------------------------------------------------------------------------
// EMERGENCY
// ---------------------------------------------------------------------------

async function sendEmergencyRequest({ hospitalId, emergencyType, description, latitude, longitude }) {
  return apiRequest("/emergency", "POST", { hospitalId, emergencyType, description, latitude, longitude }, true);
}

// ---------------------------------------------------------------------------
// AI ASSISTANT
// ---------------------------------------------------------------------------
// Calls OUR backend only (/api/ai/chat). The backend holds the OpenRouter key
// and talks to OpenRouter server-side — the frontend never sees that key.
// `context` is optional structured data (e.g. symptoms/duration/severity)
// that helps the backend give a more relevant response.
async function askAI(message, context = null) {
  return apiRequest("/ai/chat", "POST", { message, context }, false);
}
