-- =============================================================================
-- SIH Healthcare / Patient Management System
-- Complete MySQL Schema
-- Run this entire file in MySQL Workbench or via:
--   mysql -u root -p < healthcare_database.sql
-- =============================================================================

DROP DATABASE IF EXISTS sih_healthcare_db;
CREATE DATABASE sih_healthcare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sih_healthcare_db;

-- -----------------------------------------------------------------------------
-- TABLE 1: USERS  (central authentication table for every role)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  user_id             INT AUTO_INCREMENT PRIMARY KEY,
  full_name           VARCHAR(150)  NOT NULL,
  email               VARCHAR(150)  NOT NULL,
  phone               VARCHAR(20)   DEFAULT NULL,
  password            VARCHAR(255)  NOT NULL,          -- bcrypt hash only, never plain text
  role                ENUM('patient','doctor','admin','hospital_staff') NOT NULL DEFAULT 'patient',
  preferred_language  VARCHAR(30)   NOT NULL DEFAULT 'English',
  is_active           TINYINT(1)    NOT NULL DEFAULT 1,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT uq_users_phone UNIQUE (phone)
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role);

-- -----------------------------------------------------------------------------
-- TABLE 2: PATIENTS  (1-to-1 extension of users where role = 'patient')
-- -----------------------------------------------------------------------------
CREATE TABLE patients (
  patient_id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id                 INT NOT NULL,
  date_of_birth           DATE DEFAULT NULL,
  gender                  ENUM('male','female','other') DEFAULT NULL,
  blood_group             VARCHAR(5) DEFAULT NULL,
  address                 VARCHAR(255) DEFAULT NULL,
  city                    VARCHAR(100) DEFAULT NULL,
  state                   VARCHAR(100) DEFAULT NULL,
  country                 VARCHAR(100) DEFAULT 'India',
  emergency_contact_name  VARCHAR(150) DEFAULT NULL,
  emergency_contact_phone VARCHAR(20)  DEFAULT NULL,
  profile_photo           VARCHAR(255) DEFAULT NULL,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_patients_user_id UNIQUE (user_id),
  CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- TABLE 4: HOSPITALS  (created before doctors since doctors reference it)
-- -----------------------------------------------------------------------------
CREATE TABLE hospitals (
  hospital_id           INT AUTO_INCREMENT PRIMARY KEY,
  hospital_name         VARCHAR(200) NOT NULL,
  registration_number   VARCHAR(100) NOT NULL,
  address               VARCHAR(255) DEFAULT NULL,
  city                  VARCHAR(100) DEFAULT NULL,
  state                 VARCHAR(100) DEFAULT NULL,
  country               VARCHAR(100) DEFAULT 'India',
  phone                 VARCHAR(20)  DEFAULT NULL,
  email                 VARCHAR(150) DEFAULT NULL,
  latitude              DECIMAL(10,7) DEFAULT NULL,
  longitude             DECIMAL(10,7) DEFAULT NULL,
  emergency_available   TINYINT(1) NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_hospitals_reg_no UNIQUE (registration_number)
) ENGINE=InnoDB;

CREATE INDEX idx_hospitals_city ON hospitals(city);

-- -----------------------------------------------------------------------------
-- TABLE 3: DOCTORS
-- -----------------------------------------------------------------------------
CREATE TABLE doctors (
  doctor_id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT NOT NULL,
  hospital_id           INT DEFAULT NULL,
  specialization        VARCHAR(150) NOT NULL,
  qualification         VARCHAR(200) DEFAULT NULL,
  experience_years      INT DEFAULT 0,
  license_number        VARCHAR(100) NOT NULL,
  consultation_fee      DECIMAL(10,2) DEFAULT 0.00,
  availability_status   ENUM('available','unavailable','on_leave') NOT NULL DEFAULT 'available',
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_doctors_user_id UNIQUE (user_id),
  CONSTRAINT uq_doctors_license UNIQUE (license_number),
  CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_doctors_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_hospital ON doctors(hospital_id);

-- -----------------------------------------------------------------------------
-- TABLE 5: APPOINTMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE appointments (
  appointment_id     INT AUTO_INCREMENT PRIMARY KEY,
  patient_id         INT NOT NULL,
  doctor_id          INT NOT NULL,
  hospital_id        INT DEFAULT NULL,
  appointment_date   DATE NOT NULL,
  appointment_time   TIME NOT NULL,
  reason_for_visit   VARCHAR(255) DEFAULT NULL,
  appointment_status ENUM('pending','confirmed','completed','cancelled','rejected') NOT NULL DEFAULT 'pending',
  notes              TEXT DEFAULT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_appt_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  -- Prevents the exact same doctor being double-booked at the same date & time.
  CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time)
) ENGINE=InnoDB;

CREATE INDEX idx_appt_patient ON appointments(patient_id);
CREATE INDEX idx_appt_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appt_status ON appointments(appointment_status);

-- -----------------------------------------------------------------------------
-- TABLE 6: MEDICAL RECORDS
-- -----------------------------------------------------------------------------
CREATE TABLE medical_records (
  record_id       INT AUTO_INCREMENT PRIMARY KEY,
  patient_id      INT NOT NULL,
  doctor_id       INT NOT NULL,
  appointment_id  INT DEFAULT NULL,
  diagnosis       TEXT DEFAULT NULL,
  prescription    TEXT DEFAULT NULL,
  treatment       TEXT DEFAULT NULL,
  notes           TEXT DEFAULT NULL,
  record_date     DATE NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_records_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_records_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_records_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_records_patient ON medical_records(patient_id);
CREATE INDEX idx_records_doctor ON medical_records(doctor_id);

-- -----------------------------------------------------------------------------
-- TABLE 7: PATIENT MEDICAL HISTORY
-- -----------------------------------------------------------------------------
CREATE TABLE medical_history (
  history_id         INT AUTO_INCREMENT PRIMARY KEY,
  patient_id         INT NOT NULL,
  medical_condition  VARCHAR(255) DEFAULT NULL,
  allergies          VARCHAR(255) DEFAULT NULL,
  previous_surgery   VARCHAR(255) DEFAULT NULL,
  medications        VARCHAR(255) DEFAULT NULL,
  additional_notes   TEXT DEFAULT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_history_patient ON medical_history(patient_id);

-- -----------------------------------------------------------------------------
-- TABLE 8: NOTIFICATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
  notification_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL,
  title               VARCHAR(150) NOT NULL,
  message             VARCHAR(500) NOT NULL,
  notification_type   ENUM('appointment','emergency','system','medical_record') NOT NULL DEFAULT 'system',
  is_read             TINYINT(1) NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- -----------------------------------------------------------------------------
-- TABLE 9: EMERGENCY REQUESTS
-- -----------------------------------------------------------------------------
CREATE TABLE emergency_requests (
  emergency_id     INT AUTO_INCREMENT PRIMARY KEY,
  patient_id       INT NOT NULL,
  hospital_id      INT DEFAULT NULL,
  emergency_type   VARCHAR(100) NOT NULL,
  description      TEXT DEFAULT NULL,
  latitude         DECIMAL(10,7) DEFAULT NULL,
  longitude        DECIMAL(10,7) DEFAULT NULL,
  status           ENUM('requested','accepted','in_progress','completed','cancelled') NOT NULL DEFAULT 'requested',
  requested_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emergency_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_emergency_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_emergency_status ON emergency_requests(status);

-- -----------------------------------------------------------------------------
-- NOTE ON TABLE 10: USER LANGUAGE PREFERENCE
-- Rather than a separate table (which would be a redundant 1-to-1 with users
-- and add an unnecessary join on every request), language preference is
-- stored directly on users.preferred_language. It persists across logins
-- automatically because it's read as part of the user's profile/JWT payload.
-- -----------------------------------------------------------------------------

-- =============================================================================
-- SAMPLE / SEED DATA
-- Passwords below are bcrypt hashes of the plain text "Password123!"
-- (hash generated with bcrypt, 10 salt rounds) — for local testing only.
-- =============================================================================

INSERT INTO users (full_name, email, phone, password, role, preferred_language) VALUES
('System Admin',        'admin@swastyasethu.in',     '9990000001', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8w4z8p6r4wCkQZmg7C9jZ7Nff3ilFC', 'admin',   'English'),
('Dr. Anita Sharma',    'anita.sharma@swastyasethu.in','9990000002', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8w4z8p6r4wCkQZmg7C9jZ7Nff3ilFC', 'doctor',  'English'),
('Dr. Rajinder Singh',  'rajinder.singh@swastyasethu.in','9990000003', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8w4z8p6r4wCkQZmg7C9jZ7Nff3ilFC', 'doctor',  'Punjabi'),
('Ramesh Kumar Sharma', 'ramesh.kumar@example.com',  '9876543210', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8w4z8p6r4wCkQZmg7C9jZ7Nff3ilFC', 'patient', 'Hindi'),
('Simran Kaur',         'simran.kaur@example.com',   '9876500001', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8w4z8p6r4wCkQZmg7C9jZ7Nff3ilFC', 'patient', 'Punjabi');

INSERT INTO hospitals (hospital_name, registration_number, address, city, state, country, phone, email, latitude, longitude, emergency_available) VALUES
('Swastya Sethu Community Health Centre', 'REG-CHC-0001', 'Main Road, Sector 12', 'Ludhiana', 'Punjab', 'India', '01614000000', 'chc@swastyasethu.in', 30.9010, 75.8573, 1),
('Rampur Rural Hospital',                 'REG-RH-0002',  'Village Chowk',        'Rampur',   'Uttar Pradesh', 'India', '05955200000', 'rh@swastyasethu.in', 28.8100, 79.0300, 1);

INSERT INTO doctors (user_id, hospital_id, specialization, qualification, experience_years, license_number, consultation_fee, availability_status) VALUES
(2, 1, 'General Physician', 'MBBS, MD (Medicine)', 12, 'LIC-PB-10021', 300.00, 'available'),
(3, 2, 'Pediatrics',        'MBBS, DCH',            8, 'LIC-PB-10022', 250.00, 'available');

INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, city, state, country, emergency_contact_name, emergency_contact_phone) VALUES
(4, '1983-04-12', 'male',   'B+', 'House No. 45, Model Town', 'Ludhiana', 'Punjab', 'India', 'Sunita Sharma', '9876543211'),
(5, '1995-09-01', 'female', 'O+', 'Street 7, Civil Lines',     'Rampur',   'Uttar Pradesh', 'India', 'Gurpreet Kaur', '9876500002');

INSERT INTO medical_history (patient_id, medical_condition, allergies, previous_surgery, medications, additional_notes) VALUES
(1, 'Type 2 Diabetes', 'Penicillin', 'Appendectomy (2010)', 'Metformin 500mg', 'Monitors blood sugar twice daily.'),
(2, 'None reported',   'None',       'None',                 'None',           'First-time registrant, no known conditions.');

INSERT INTO appointments (patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason_for_visit, appointment_status, notes) VALUES
(1, 1, 1, CURDATE() + INTERVAL 2 DAY, '10:30:00', 'Recurring fever and headache', 'confirmed', 'Follow-up on diabetes management as well.'),
(2, 2, 2, CURDATE() + INTERVAL 3 DAY, '15:00:00', 'Child routine checkup', 'pending', NULL);

INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, treatment, notes, record_date) VALUES
(1, 1, 1, 'Viral fever', 'Paracetamol 500mg twice daily for 3 days', 'Rest and hydration advised', 'Review after 3 days if fever persists', CURDATE());

INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
(4, 'Appointment Confirmed', 'Your appointment with Dr. Anita Sharma has been confirmed.', 'appointment', 0),
(5, 'Welcome to Swastya Sethu', 'Thank you for registering. Complete your profile to get started.', 'system', 0);

INSERT INTO emergency_requests (patient_id, hospital_id, emergency_type, description, latitude, longitude, status) VALUES
(1, 1, 'Chest Pain', 'Patient reporting sudden chest pain and breathlessness.', 30.9010, 75.8573, 'requested');
