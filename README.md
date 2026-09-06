# SIH Healthcare Backend — Swastya Sethu

A complete, standalone **Node.js + Express + MySQL** backend and database for the Swastya Sethu (SIH) healthcare/patient-management frontend. It is designed to be dropped in **alongside your existing HTML/CSS/JS** without changing your UI.

---

## 1. Project Overview

This backend provides:
- Patient registration & login (JWT + bcrypt)
- Patient profiles & medical history
- Doctor & hospital directories
- Appointment booking with double-booking prevention
- Medical records with strict role-based access control
- Notifications
- Emergency requests
- Admin management & dashboard summary

It does **not** modify your `index.html`, `style.css`, or `script.js`. It's a separate `backend/` project that your existing frontend talks to over HTTP.

---

## 2. Technology Stack

| Layer          | Technology            |
|----------------|------------------------|
| Runtime        | Node.js                |
| Framework      | Express.js              |
| Database       | MySQL 8                |
| DB Driver      | mysql2 (connection pool, promise API) |
| Auth           | JWT (jsonwebtoken)     |
| Password hash  | bcrypt                 |
| Config         | dotenv                 |
| Security       | helmet, cors           |
| Logging        | morgan                 |

---

## 3. Folder Structure

```
backend/
├── server.js
├── package.json
├── .env
├── .gitignore
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── patientController.js
│   ├── doctorController.js
│   ├── appointmentController.js
│   ├── medicalRecordController.js
│   ├── hospitalController.js
│   ├── notificationController.js
│   ├── emergencyController.js
│   └── adminController.js
├── routes/
│   ├── authRoutes.js
│   ├── patientRoutes.js
│   ├── doctorRoutes.js
│   ├── appointmentRoutes.js
│   ├── medicalRecordRoutes.js
│   ├── hospitalRoutes.js
│   ├── notificationRoutes.js
│   ├── emergencyRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── errorMiddleware.js
├── utils/
│   └── response.js
├── database/
│   └── healthcare_database.sql
├── frontend/js/api.js       ← copy into your existing frontend project
└── README.md
```

---

## 4. Database Setup

### 4.1 MySQL installation requirements
- MySQL Server 8.0+ (or MariaDB 10.5+) installed and running.
- A MySQL client — MySQL Workbench, `mysql` CLI, or DBeaver.

### 4.2 Create & import the database

**Option A — MySQL Workbench**
1. Open MySQL Workbench and connect to your local server.
2. File → Open SQL Script → select `database/healthcare_database.sql`.
3. Click the ⚡ "Execute" button to run the whole script.

**Option B — Command line**
```bash
mysql -u root -p < database/healthcare_database.sql
```

This creates the `sih_healthcare_db` database, all 9 tables (users, patients, doctors, hospitals, appointments, medical_records, medical_history, notifications, emergency_requests), their keys/indexes, and inserts sample test data (2 patients, 2 doctors, 2 hospitals, 1 admin, sample appointments/records).

> Sample login for testing: `ramesh.kumar@example.com` / `Password123!`

---

## 5. Configure `.env`

Copy the values into `backend/.env` (already scaffolded) and edit them for your machine:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=sih_healthcare_db
DB_PORT=3306

JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d

CORS_ORIGIN=*
```

**Never commit your real `.env`** — it's already listed in `.gitignore`. For a real deployment, set `CORS_ORIGIN` to your actual frontend URL (e.g. `http://127.0.0.1:5500`) instead of `*`, and use a long random `JWT_SECRET`.

---

## 6. Install Dependencies

```bash
cd backend
npm install
```

---

## 7. Start the Backend

Development (auto-restarts on file changes, via nodemon):
```bash
npm run dev
```

Production / plain start:
```bash
node server.js
```

You should see:
```
✅ MySQL connected successfully to database: sih_healthcare_db
🚀 Server running on http://localhost:5000
```

Health check: open `http://localhost:5000/api/health` in your browser — you should get `{"success":true,"message":"OK"}`.

---

## 8. API Documentation

All responses share this shape:

```json
// success
{ "success": true, "message": "...", "data": { ... } }

// error
{ "success": false, "message": "..." }
```

Protected routes require a header: `Authorization: Bearer <token>` (the token returned by register/login).

### Auth
| Method | Endpoint             | Auth | Description |
|--------|-----------------------|------|--------------|
| POST   | /api/auth/register    | No   | Create a user (+ patient profile if role=patient) |
| POST   | /api/auth/login       | No   | Returns JWT + user info |
| POST   | /api/auth/logout      | No   | Client should discard token |
| GET    | /api/auth/profile     | Yes  | Current user's core info |

### Patients
| Method | Endpoint                 | Auth | Description |
|--------|---------------------------|------|--------------|
| GET    | /api/patients/profile     | Patient | Own profile |
| PUT    | /api/patients/profile     | Patient | Update own profile |
| GET    | /api/patients/:id         | Patient (own)/Doctor/Admin | Fetch a specific patient |

### Doctors
| Method | Endpoint            | Auth  | Description |
|--------|----------------------|-------|--------------|
| GET    | /api/doctors         | Public | List/filter doctors (?specialization=&city=&language=) |
| GET    | /api/doctors/:id     | Public | Doctor detail |
| POST   | /api/doctors         | Admin | Onboard a doctor (creates user+doctor) |
| PUT    | /api/doctors/:id     | Admin/Doctor(self) | Update |
| DELETE | /api/doctors/:id     | Admin | Remove |

### Hospitals
| Method | Endpoint             | Auth | Description |
|--------|-----------------------|------|--------------|
| GET    | /api/hospitals        | Public | List/filter (?city=&emergencyOnly=true) |
| GET    | /api/hospitals/:id    | Public | Detail |
| POST   | /api/hospitals        | Admin | Create |
| PUT    | /api/hospitals/:id    | Admin/hospital_staff | Update |

### Appointments (all require login)
| Method | Endpoint                        | Auth | Description |
|--------|----------------------------------|------|--------------|
| POST   | /api/appointments                | Patient | Book (blocks past dates & double-booking) |
| GET    | /api/appointments                | Any role | Own (patient/doctor) or all (admin); `?status=` |
| GET    | /api/appointments/:id            | Any role | Detail |
| PUT    | /api/appointments/:id            | Patient/Doctor/Admin | Reschedule / edit |
| PUT    | /api/appointments/:id/status     | Doctor/Admin/hospital_staff | Change status |
| DELETE | /api/appointments/:id            | Patient/Doctor/Admin | Cancel |

### Medical Records (all require login)
| Method | Endpoint                                | Auth | Description |
|--------|-------------------------------------------|------|--------------|
| POST   | /api/medical-records                       | Doctor | Create record |
| GET    | /api/medical-records/patient/:patientId    | Owner patient / treating doctor / admin | List |
| GET    | /api/medical-records/:id                   | Owner patient / authoring doctor / admin | Detail |
| PUT    | /api/medical-records/:id                   | Authoring doctor / admin | Edit |
| DELETE | /api/medical-records/:id                   | Admin | Delete |

### Notifications (require login)
`GET /api/notifications` · `PUT /api/notifications/:id/read` · `DELETE /api/notifications/:id`

### Emergency (require login)
`POST /api/emergency` (patient) · `GET /api/emergency` (own/all) · `PUT /api/emergency/:id/status` (hospital_staff/admin)

### Admin (require login + admin role)
`GET /api/admin/users` · `PUT /api/admin/users/:id/status` · `GET /api/admin/dashboard`

---

## 9. Example API Requests

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Patient","email":"test@example.com","password":"Password123!","phone":"9998887771"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ramesh.kumar@example.com","password":"Password123!"}'
```

**Book an appointment (use the token from login):**
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"doctorId":1,"appointmentDate":"2026-09-10","appointmentTime":"11:00:00","reasonForVisit":"Fever"}'
```

A ready-to-import Postman collection can be built from the table above; every route follows the same base URL `http://localhost:5000/api`.

---

## 10. Frontend Integration Instructions

1. Copy `frontend/js/api.js` into your existing frontend, e.g. next to `script.js`.
2. In `index.html`, include it **before** `script.js`:
   ```html
   <script src="js/api.js"></script>
   <script src="script.js"></script>
   ```
3. Call the functions from your existing form handlers, for example:
   ```js
   document.getElementById('patientRegisterForm').addEventListener('submit', async (e) => {
     e.preventDefault();
     const result = await registerPatient({
       fullName: document.getElementById('regFullName').value,
       email: document.getElementById('regEmail').value,       // see note below
       password: document.getElementById('regPassword').value, // see note below
       phone: document.getElementById('regPhone').value,
       city: document.getElementById('regCity').value,
       state: document.getElementById('regState').value,
       emergencyPhone: document.getElementById('regEmergencyPhone').value
     });
     if (result.success) {
       // e.g. trigger your existing dashboard screen switch
     } else {
       // show result.message in your existing toast/error UI
     }
   });
   ```

> **Important note on your current form:** your uploaded `patientRegisterForm` collects name, age, gender, phone, city, state, and an emergency phone — but no email or password field, and there's no login screen yet. Real authentication (JWT) needs an email + password. This backend supports it fully; you just need to add two inputs (e.g. `#regEmail`, `#regPassword`) to the existing form and a small login form/screen using the same visual style as the rest of your site. That's a minor addition, not a redesign — everything else in your UI stays as-is.

4. Update `API_BASE_URL` at the top of `api.js` if you deploy the backend somewhere other than `http://localhost:5000`.

---

## 11. Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) — plaintext is never stored or logged.
- JWT secret and DB credentials are only ever read from `.env`, never hardcoded.
- All SQL uses parameterized queries (`?` placeholders) — no string concatenation, so SQL injection is prevented.
- Role-based middleware (`roleMiddleware.js`) restricts sensitive routes (medical records, admin, doctor management).
- A `UNIQUE(doctor_id, appointment_date, appointment_time)` constraint plus an application-level check prevents double-booking.
- `helmet` sets protective HTTP headers; `cors` is scoped via `CORS_ORIGIN` in production.

---

## 12. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `❌ MySQL connection failed` on startup | Wrong `DB_PASSWORD`/`DB_USER` in `.env`, or MySQL service not running |
| `401 Authentication token missing` | Frontend isn't sending `Authorization: Bearer <token>` header |
| `409 duplicate entry` on register | Email or phone already exists in `users` |
| CORS error in browser console | Set `CORS_ORIGIN` in `.env` to match the exact origin your frontend is served from |
