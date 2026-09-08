/* =========================================================================
   SWASTYA SETHU — COMPLETE SINGLE-PAGE APPLICATION ENGINE (script.js)
   1. Application State & Storage
   2. SPA Navigation & Screen Router
   3. Theme System (Light / Dark Mode)
   4. Multilingual System (9 Indian Languages & Native Scripts)
   5. Location-Based Language Recommendation (Geolocation + Regional Mapping)
   6. Patient Registration & Profile Management
   7. Patient Dashboard Portal
   8. Multi-Step Preliminary Health Assessment Wizard
   9. Doctor Directory & Healthcare Support (Filter, Search, Categories)
   10. Global Appointment Booking Modal Simulation
   11. Premium Voice Assistant & Voice-to-Text (Web Speech API + Visualizers)
   12. Toast Notifications & Initialization
   ========================================================================= */

(function () {
  "use strict";

  /* -------------------------------------------------------------------------
     1. APPLICATION STATE & STORAGE
     ------------------------------------------------------------------------- */
  const APP_STATE = {
    currentScreen: "home",
    currentTheme: "light",
    selectedLanguage: "en",
    detectedLocation: null,
    patientProfile: null,
    lastAssessment: null,
    speechRecognition: null,
    isListening: false,
    assessmentDraft: {
      step: 1,
      symptoms: ["Fever"],
      customSymptoms: [],
      duration: "Less than 24 hours",
      severity: "Mild",
      notes: ""
    }
  };

  /* 9 Supported Indian Languages with Native Scripts & Locales */
  const SUPPORTED_LANGUAGES = [
    { code: "en", name: "English", native: "English", locale: "en-IN", greeting: "Welcome", region: "Universal / Pan-India" },
    { code: "hi", name: "Hindi", native: "हिन्दी", locale: "hi-IN", greeting: "नमस्ते", region: "North & Central India" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", locale: "pa-IN", greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", region: "Punjab & Northern Region" },
    { code: "ta", name: "Tamil", native: "தமிழ்", locale: "ta-IN", greeting: "வணக்கம்", region: "Tamil Nadu & Puducherry" },
    { code: "te", name: "Telugu", native: "తెలుగు", locale: "te-IN", greeting: "నమస్కారం", region: "Andhra Pradesh & Telangana" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", locale: "kn-IN", greeting: "ನಮಸ್ಕಾರ", region: "Karnataka" },
    { code: "ml", name: "Malayalam", native: "മലയാളം", locale: "ml-IN", greeting: "നമസ്കാരം", region: "Kerala" },
    { code: "ur", name: "Urdu", native: "اردو", locale: "ur-IN", greeting: "آداب", region: "National & Regional" },
    { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", locale: "or-IN", greeting: "ନମସ୍କାର", region: "Odisha" }
  ];

  /* Doctor Database (Consolidated from data/doctors.js) */
  const DOCTOR_DATABASE = [
    {
      id: 1,
      name: "Dr. Anjali Rao",
      specialization: "General Physician",
      experience: 12,
      location: "New Delhi",
      languages: ["English", "Hindi"],
      availability: "Mon–Sat, 9 AM – 5 PM",
      rating: 4.9,
      reviews: 2140,
      fee: "₹400",
      avatarIcon: "fa-user-doctor"
    },
    {
      id: 2,
      name: "Dr. Vikram Sen",
      specialization: "Cardiologist",
      experience: 18,
      location: "Mumbai",
      languages: ["English", "Hindi", "Marathi"],
      availability: "Tue–Sun, 10 AM – 6 PM",
      rating: 4.9,
      reviews: 1760,
      fee: "₹800",
      avatarIcon: "fa-heart-pulse"
    },
    {
      id: 3,
      name: "Dr. Priya Nair",
      specialization: "Dermatologist",
      experience: 9,
      location: "Bengaluru",
      languages: ["English", "Hindi", "Kannada"],
      availability: "Mon–Fri, 11 AM – 7 PM",
      rating: 4.8,
      reviews: 1340,
      fee: "₹500",
      avatarIcon: "fa-hand-dots"
    },
    {
      id: 4,
      name: "Dr. Meera Iyer",
      specialization: "Pediatrician",
      experience: 14,
      location: "Chennai",
      languages: ["English", "Tamil"],
      availability: "Mon–Sat, 9 AM – 4 PM",
      rating: 4.9,
      reviews: 3020,
      fee: "₹450",
      avatarIcon: "fa-baby"
    },
    {
      id: 5,
      name: "Dr. Rohan Das",
      specialization: "Orthopedic Specialist",
      experience: 16,
      location: "Kolkata",
      languages: ["English", "Hindi", "Bengali"],
      availability: "Wed–Mon, 10 AM – 5 PM",
      rating: 4.7,
      reviews: 980,
      fee: "₹600",
      avatarIcon: "fa-bone"
    },
    {
      id: 6,
      name: "Dr. Karan Mehta",
      specialization: "Mental Health Specialist",
      experience: 11,
      location: "Pune",
      languages: ["English", "Hindi", "Marathi"],
      availability: "Mon–Fri, 12 PM – 8 PM",
      rating: 4.9,
      reviews: 1510,
      fee: "₹700",
      avatarIcon: "fa-brain"
    },
    {
      id: 7,
      name: "Dr. Sunita Devi",
      specialization: "Gynecologist",
      experience: 20,
      location: "Lucknow",
      languages: ["Hindi", "English"],
      availability: "Mon–Sat, 9 AM – 3 PM",
      rating: 4.9,
      reviews: 2450,
      fee: "₹500",
      avatarIcon: "fa-person-pregnant"
    },
    {
      id: 8,
      name: "Dr. Arjun Nambiar",
      specialization: "ENT Specialist",
      experience: 8,
      location: "Hyderabad",
      languages: ["English", "Telugu", "Hindi"],
      availability: "Tue–Sat, 10 AM – 6 PM",
      rating: 4.8,
      reviews: 890,
      fee: "₹450",
      avatarIcon: "fa-head-side-mask"
    }
  ];

  /* -------------------------------------------------------------------------
     2. SPA NAVIGATION & SCREEN ROUTER
     ------------------------------------------------------------------------- */
  function navigateTo(screenId, pushHistory = true) {
    const screens = document.querySelectorAll(".app-screen");
    const targetScreen = document.getElementById(`screen-${screenId}`);

    if (!targetScreen) {
      console.warn(`Screen with id "screen-${screenId}" not found.`);
      return;
    }

    // Smooth transition
    screens.forEach((screen) => {
      screen.classList.remove("is-active");
    });
    targetScreen.classList.add("is-active");

    APP_STATE.currentScreen = screenId;

    // Update primary nav tabs
    document.querySelectorAll("[data-screen-trigger]").forEach((trigger) => {
      const target = trigger.getAttribute("data-screen-trigger");
      const isMatch = target === screenId;
      trigger.classList.toggle("is-active", isMatch);
      if (trigger.hasAttribute("aria-selected")) {
        trigger.setAttribute("aria-selected", isMatch ? "true" : "false");
      }
    });

    // Update browser URL hash for friendly navigation and back button
    if (pushHistory && window.location.hash !== `#${screenId}`) {
      window.history.pushState({ screen: screenId }, "", `#${screenId}`);
    }

    // Close mobile nav drawer if open
    closeMobileNav();

    // Scroll back to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Refresh context if landing on dashboard or doctors
    if (screenId === "dashboard") {
      updateDashboardUI();
    } else if (screenId === "doctors") {
      renderDoctorGrid();
    }
  }

  function initRouter() {
    // Handle all data-screen-trigger elements throughout the SPA
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-screen-trigger]");
      if (trigger) {
        e.preventDefault();
        const targetScreen = trigger.getAttribute("data-screen-trigger");
        if (targetScreen) {
          navigateTo(targetScreen);
        }
      }
    });

    // Handle browser back and forward buttons
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.screen) {
        navigateTo(e.state.screen, false);
      } else if (window.location.hash) {
        const hashScreen = window.location.hash.replace("#", "");
        navigateTo(hashScreen, false);
      } else {
        navigateTo("home", false);
      }
    });

    // Handle direct link with hash on initial load
    if (window.location.hash) {
      const initialScreen = window.location.hash.replace("#", "");
      if (document.getElementById(`screen-${initialScreen}`)) {
        navigateTo(initialScreen, false);
      }
    }
  }

  /* Mobile Nav Drawer Handlers */
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileNav = document.getElementById("mobileNav");

  function openMobileNav() {
    if (!mobileNav || !hamburgerBtn) return;
    mobileNav.classList.add("is-open");
    hamburgerBtn.classList.add("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "true");
  }

  function closeMobileNav() {
    if (!mobileNav || !hamburgerBtn) return;
    mobileNav.classList.remove("is-open");
    hamburgerBtn.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
  }

  function initMobileNav() {
    if (!hamburgerBtn || !mobileNav) return;
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.contains("is-open");
      isOpen ? closeMobileNav() : openMobileNav();
    });

    document.addEventListener("click", (e) => {
      if (
        mobileNav.classList.contains("is-open") &&
        !mobileNav.contains(e.target) &&
        !hamburgerBtn.contains(e.target)
      ) {
        closeMobileNav();
      }
    });
  }

  /* -------------------------------------------------------------------------
     3. THEME SYSTEM (LIGHT / DARK MODE)
     ------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    APP_STATE.currentTheme = theme;
    localStorage.setItem("swastya_theme", theme);

    if (themeIcon) {
      if (theme === "dark") {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
      } else {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
      }
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem("swastya_theme");
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const nextTheme = APP_STATE.currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        showToast(`Switched to ${nextTheme === "dark" ? "Dark" : "Light"} Mode`, "info");
      });
    }
  }

  /* -------------------------------------------------------------------------
     4. MULTILINGUAL SYSTEM (9 INDIAN LANGUAGES)
     ------------------------------------------------------------------------- */
  const languageCardsGrid = document.getElementById("languageCardsGrid");
  const navLangLabel = document.getElementById("navLangLabel");
  const navLangNative = document.getElementById("navLangNative");
  const activeLangDisplay = document.getElementById("activeLangDisplay");
  const voiceActiveLangText = document.getElementById("voiceActiveLangText");
  const confirmLangContinueBtn = document.getElementById("confirmLangContinueBtn");

  function renderLanguageCards() {
    if (!languageCardsGrid) return;
    languageCardsGrid.innerHTML = "";

    SUPPORTED_LANGUAGES.forEach((lang) => {
      const isSelected = lang.code === APP_STATE.selectedLanguage;
      const card = document.createElement("button");
      card.type = "button";
      card.className = `lang-card ${isSelected ? "is-selected" : ""}`;
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", isSelected ? "true" : "false");
      card.setAttribute("data-lang-code", lang.code);

      card.innerHTML = `
        <div class="lang-card__check"><i class="fa-solid fa-check"></i></div>
        <div class="lang-card__native">${lang.native}</div>
        <div class="lang-card__name">${lang.name}</div>
        <div class="lang-card__region">${lang.region}</div>
      `;

      card.addEventListener("click", () => {
        selectLanguage(lang.code);
      });

      languageCardsGrid.appendChild(card);
    });
  }

  function selectLanguage(langCode, announce = true) {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    if (!langObj) return;

    APP_STATE.selectedLanguage = langCode;
    localStorage.setItem("swastya_lang", langCode);

    // Translation layer: keeps the existing application logic intact.
    if (typeof window.applySiteLanguage === "function") {
      window.applySiteLanguage(langCode);
    }

    // Update UI Badges
    if (navLangLabel) navLangLabel.textContent = langObj.name;
    if (navLangNative) navLangNative.textContent = langObj.code.toUpperCase();
    if (activeLangDisplay) activeLangDisplay.textContent = `${langObj.native} (${langObj.name})`;
    if (voiceActiveLangText) voiceActiveLangText.textContent = `${langObj.native} (${langObj.locale})`;

    // Update active state in grid
    document.querySelectorAll(".lang-card").forEach((card) => {
      const match = card.getAttribute("data-lang-code") === langCode;
      card.classList.toggle("is-selected", match);
      card.setAttribute("aria-checked", match ? "true" : "false");
    });

    // Update speech recognition locale if active
    if (APP_STATE.speechRecognition) {
      APP_STATE.speechRecognition.lang = langObj.locale;
    }

    if (announce) {
      showToast(`Language set to ${langObj.native} (${langObj.name})`, "success");
    }
  }

  function initLanguages() {
    const savedLang = localStorage.getItem("swastya_lang") || "en";
    APP_STATE.selectedLanguage = savedLang;
    renderLanguageCards();
    selectLanguage(savedLang, false);

    if (confirmLangContinueBtn) {
      confirmLangContinueBtn.addEventListener("click", () => {
        // If patient already registered, go to dashboard, else register
        if (APP_STATE.patientProfile) {
          navigateTo("dashboard");
        } else {
          navigateTo("register");
        }
      });
    }
  }

  /* -------------------------------------------------------------------------
     5. LOCATION-BASED LANGUAGE RECOMMENDATION
     ------------------------------------------------------------------------- */
  const detectLocationBtn = document.getElementById("detectLocationBtn");
  const locationRecStatus = document.getElementById("locationRecStatus");
  const locationRecResult = document.getElementById("locationRecResult");
  const recommendedLangTag = document.getElementById("recommendedLangTag");
  const applyRecommendedLangBtn = document.getElementById("applyRecommendedLangBtn");

  let pendingRecommendedLangCode = "pa";

  /* Indian state bounding coordinate approximations for reliable offline fallback */
  function matchIndianStateFromCoordinates(lat, lon) {
    if (lat >= 29.5 && lat <= 32.5 && lon >= 73.8 && lon <= 76.9) {
      return { state: "Punjab", langCode: "pa" };
    }
    if (lat >= 8.0 && lat <= 13.5 && lon >= 76.2 && lon <= 80.3) {
      return { state: "Tamil Nadu", langCode: "ta" };
    }
    if (lat >= 8.3 && lat <= 12.8 && lon >= 74.8 && lon <= 77.5) {
      return { state: "Kerala", langCode: "ml" };
    }
    if (lat >= 11.5 && lat <= 18.5 && lon >= 74.0 && lon <= 78.6) {
      return { state: "Karnataka", langCode: "kn" };
    }
    if (lat >= 12.6 && lat <= 19.9 && lon >= 76.7 && lon <= 84.8) {
      return { state: "Andhra Pradesh / Telangana", langCode: "te" };
    }
    if (lat >= 17.8 && lat <= 22.6 && lon >= 81.4 && lon <= 87.5) {
      return { state: "Odisha", langCode: "or" };
    }
    if (lat >= 21.0 && lat <= 31.0 && lon >= 74.0 && lon <= 88.0) {
      return { state: "Hindi-speaking Region (Delhi / UP / MP)", langCode: "hi" };
    }
    // Default national recommendation
    return { state: "India", langCode: "hi" };
  }

  function handleLocationRecommendation() {
    if (!navigator.geolocation) {
      if (locationRecStatus) {
        locationRecStatus.textContent = "Geolocation is not supported by your browser. Please select your language manually below.";
      }
      showToast("Geolocation not supported by browser", "warn");
      return;
    }

    if (locationRecStatus) {
      locationRecStatus.textContent = "Detecting your location... Please grant permission if prompted.";
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let stateName = "Detected Region";
        let langCode = "hi";

        // Try gentle reverse geocoding with timeout, otherwise use robust bounding fallback
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=6`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const addressState = data.address?.state || "";
            if (addressState.includes("Punjab")) { stateName = "Punjab"; langCode = "pa"; }
            else if (addressState.includes("Tamil")) { stateName = "Tamil Nadu"; langCode = "ta"; }
            else if (addressState.includes("Kerala")) { stateName = "Kerala"; langCode = "ml"; }
            else if (addressState.includes("Karnataka")) { stateName = "Karnataka"; langCode = "kn"; }
            else if (addressState.includes("Telangana") || addressState.includes("Andhra")) { stateName = "Telangana / Andhra Pradesh"; langCode = "te"; }
            else if (addressState.includes("Odisha") || addressState.includes("Orissa")) { stateName = "Odisha"; langCode = "or"; }
            else { stateName = addressState || "North/Central India"; langCode = "hi"; }
          } else {
            throw new Error("Nominatim offline");
          }
        } catch (e) {
          // Bounding coordinate fallback
          const fallbackMatch = matchIndianStateFromCoordinates(latitude, longitude);
          stateName = fallbackMatch.state;
          langCode = fallbackMatch.langCode;
        }

        const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES[1];
        pendingRecommendedLangCode = langCode;

        if (locationRecStatus) {
          locationRecStatus.textContent = `📍 Location detected in or near ${stateName}.`;
        }

        if (recommendedLangTag) {
          recommendedLangTag.textContent = `${langObj.native} (${langObj.name})`;
        }

        if (locationRecResult) {
          locationRecResult.hidden = false;
        }

        showToast(`Recommended language: ${langObj.native} based on ${stateName}`, "info");
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        if (locationRecStatus) {
          locationRecStatus.textContent = "Location access was not granted or is unavailable. That is completely okay — you can choose any language below.";
        }
        showToast("Location access declined. Manual selection available.", "info");
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }

  function initLocationFeature() {
    if (detectLocationBtn) {
      detectLocationBtn.addEventListener("click", handleLocationRecommendation);
    }
    if (applyRecommendedLangBtn) {
      applyRecommendedLangBtn.addEventListener("click", () => {
        selectLanguage(pendingRecommendedLangCode);
        showToast("Applied recommended regional language!", "success");
      });
    }
  }

  /* -------------------------------------------------------------------------
     6. PATIENT REGISTRATION & PROFILE
     ------------------------------------------------------------------------- */
  const patientRegisterForm = document.getElementById("patientRegisterForm");
  const navUserActionBtn = document.getElementById("navUserActionBtn");
  const navUserActionText = document.getElementById("navUserActionText");

  function loadSavedProfile() {
    try {
      const stored = localStorage.getItem("swastya_patient_profile");
      if (stored) {
        APP_STATE.patientProfile = JSON.parse(stored);
        if (navUserActionText) navUserActionText.textContent = "Dashboard";
        if (navUserActionBtn) navUserActionBtn.setAttribute("data-screen-trigger", "dashboard");
      }
    } catch (e) {
      console.warn("Could not parse stored profile:", e);
    }
  }

  function populateRegistrationForm() {
    if (!APP_STATE.patientProfile || !patientRegisterForm) return;
    const p = APP_STATE.patientProfile;
    if (p.fullName) document.getElementById("regFullName").value = p.fullName;
    if (p.age) document.getElementById("regAge").value = p.age;
    if (p.gender) document.getElementById("regGender").value = p.gender;
    if (p.phone) document.getElementById("regPhone").value = p.phone;
    if (p.city) document.getElementById("regCity").value = p.city;
    if (p.state) document.getElementById("regState").value = p.state;
    if (p.emergencyPhone) document.getElementById("regEmergencyPhone").value = p.emergencyPhone;
  }

  function validateRegistrationForm() {
    let isValid = true;

    const fields = [
      { id: "regFullName", errId: "err-regFullName", test: (v) => v.trim().length >= 2, msg: "Please enter your full name (at least 2 letters)." },
      { id: "regAge", errId: "err-regAge", test: (v) => Number(v) > 0 && Number(v) <= 120, msg: "Please enter a valid age (1 - 120)." },
      { id: "regGender", errId: "err-regGender", test: (v) => Boolean(v), msg: "Please select a gender." },
      { id: "regPhone", errId: "err-regPhone", test: (v) => /^[0-9]{10}$/.test(v.replace(/[\s-]/g, "")), msg: "Please enter a valid 10-digit mobile number." },
      { id: "regCity", errId: "err-regCity", test: (v) => v.trim().length >= 2, msg: "Please enter your city or village." },
      { id: "regState", errId: "err-regState", test: (v) => v.trim().length >= 2, msg: "Please enter your state or union territory." }
    ];

    fields.forEach((f) => {
      const el = document.getElementById(f.id);
      const errEl = document.getElementById(f.errId);
      const row = el ? el.closest(".form-row") : null;

      if (el) {
        if (!f.test(el.value)) {
          isValid = false;
          if (row) row.classList.add("has-error");
          if (errEl) errEl.textContent = f.msg;
        } else {
          if (row) row.classList.remove("has-error");
          if (errEl) errEl.textContent = "";
        }
      }
    });

    return isValid;
  }

  function initPatientRegistration() {
    loadSavedProfile();
    populateRegistrationForm();

    if (!patientRegisterForm) return;

    patientRegisterForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!validateRegistrationForm()) {
        showToast("Please review and fix the required registration fields.", "warn");
        return;
      }

      const profileData = {
        fullName: document.getElementById("regFullName").value.trim(),
        age: document.getElementById("regAge").value.trim(),
        gender: document.getElementById("regGender").value,
        phone: document.getElementById("regPhone").value.trim(),
        city: document.getElementById("regCity").value.trim(),
        state: document.getElementById("regState").value.trim(),
        emergencyPhone: document.getElementById("regEmergencyPhone").value.trim(),
        registeredAt: new Date().toISOString()
      };

      APP_STATE.patientProfile = profileData;
      localStorage.setItem("swastya_patient_profile", JSON.stringify(profileData));

      if (navUserActionText) navUserActionText.textContent = "Dashboard";
      if (navUserActionBtn) navUserActionBtn.setAttribute("data-screen-trigger", "dashboard");

      showToast(`Welcome, ${profileData.fullName}! Your profile has been saved.`, "success");
      updateDashboardUI();
      navigateTo("dashboard");
    });
  }

  /* -------------------------------------------------------------------------
     7. PATIENT DASHBOARD PORTAL
     ------------------------------------------------------------------------- */
  const dashPatientName = document.getElementById("dashPatientName");
  const dashProfileName = document.getElementById("dashProfileName");
  const dashProfileDetails = document.getElementById("dashProfileDetails");
  const dashProfileLang = document.getElementById("dashProfileLang");
  const dashAvatar = document.getElementById("dashAvatar");
  const dashAssessmentContent = document.getElementById("dashAssessmentContent");

  function updateDashboardUI() {
    const p = APP_STATE.patientProfile;
    const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === APP_STATE.selectedLanguage) || SUPPORTED_LANGUAGES[0];

    if (p) {
      if (dashPatientName) dashPatientName.textContent = p.fullName;
      if (dashProfileName) dashProfileName.textContent = p.fullName;
      if (dashProfileDetails) {
        dashProfileDetails.textContent = `Age: ${p.age} · ${p.gender} · ${p.city}, ${p.state} · Mobile: +91 ${p.phone}`;
      }
      if (dashAvatar) {
        dashAvatar.textContent = p.fullName.charAt(0).toUpperCase();
      }
    } else {
      if (dashPatientName) dashPatientName.textContent = "Valued Patient";
      if (dashProfileName) dashProfileName.textContent = "Guest Patient Profile";
      if (dashProfileDetails) dashProfileDetails.textContent = "Please complete your registration to personalize your health journey.";
      if (dashAvatar) dashAvatar.textContent = "P";
    }

    if (dashProfileLang) {
      dashProfileLang.textContent = `Active Language: ${currentLangObj.native} (${currentLangObj.name})`;
    }

    // Check last assessment from storage or state
    loadSavedAssessment();
    if (dashAssessmentContent) {
      if (APP_STATE.lastAssessment) {
        const a = APP_STATE.lastAssessment;
        dashAssessmentContent.innerHTML = `
          <div class="assessment-results-card">
            <div class="res-row">
              <span class="res-label">Assessment Date:</span>
              <strong class="res-value">${new Date(a.date).toLocaleDateString()}</strong>
            </div>
            <div class="res-row">
              <span class="res-label">Reported Symptoms:</span>
              <strong class="res-value">${a.symptoms.join(", ")}</strong>
            </div>
            <div class="res-row">
              <span class="res-label">Severity & Duration:</span>
              <strong class="res-value">${a.severity} · ${a.duration}</strong>
            </div>
            <div class="res-row">
              <span class="res-label">Triage Recommendation:</span>
              <strong class="res-value text-teal">${a.specialty}</strong>
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
              <button type="button" class="btn btn--primary btn--sm" data-screen-trigger="assessment">Retake Assessment</button>
              <button type="button" class="btn btn--gold btn--sm" data-screen-trigger="doctors">Consult Doctor</button>
            </div>
          </div>
        `;
      } else {
        dashAssessmentContent.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-clipboard-question"></i>
            <p>No health assessment recorded on this device yet.</p>
            <button type="button" class="btn btn--primary btn--sm" data-screen-trigger="assessment">
              Take Preliminary Assessment
            </button>
          </div>
        `;
      }
    }
  }

  function loadSavedAssessment() {
    try {
      const stored = localStorage.getItem("swastya_last_assessment");
      if (stored) {
        APP_STATE.lastAssessment = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error parsing assessment:", e);
    }
  }

  /* -------------------------------------------------------------------------
     8. MULTI-STEP HEALTH ASSESSMENT WIZARD
     ------------------------------------------------------------------------- */
  const wizardStepper = document.getElementById("wizardStepper");
  const wizardPrevBtn = document.getElementById("wizardPrevBtn");
  const wizardNextBtn = document.getElementById("wizardNextBtn");
  const assessmentSymptomsText = document.getElementById("assessmentSymptomsText");
  const assessmentVoiceBtn = document.getElementById("assessmentVoiceBtn");
  const addCustomSymptomBtn = document.getElementById("addCustomSymptomBtn");
  const customSymptomInput = document.getElementById("customSymptomInput");

  // Summary Elements
  const summarySymptomsList = document.getElementById("summarySymptomsList");
  const summaryDurationSeverity = document.getElementById("summaryDurationSeverity");
  const summarySpecialty = document.getElementById("summarySpecialty");
  const summaryGuidanceNotes = document.getElementById("summaryGuidanceNotes");
  const triageBadge = document.getElementById("triageBadge");
  const triageLevel = document.getElementById("triageLevel");
  const assessmentEmergencyBanner = document.getElementById("assessmentEmergencyBanner");

  function setAssessmentStep(stepNum) {
    APP_STATE.assessmentDraft.step = stepNum;

    // Update wizard content panes
    document.querySelectorAll(".wizard-pane").forEach((pane, idx) => {
      pane.classList.toggle("is-active", idx + 1 === stepNum);
    });

    // Update step indicators
    document.querySelectorAll(".wizard-step").forEach((stepEl) => {
      const s = parseInt(stepEl.getAttribute("data-step"), 10);
      stepEl.classList.toggle("is-active", s === stepNum);
      stepEl.classList.toggle("is-complete", s < stepNum);
    });

    // Prev / Next button states
    if (wizardPrevBtn) {
      wizardPrevBtn.disabled = stepNum === 1;
    }
    if (wizardNextBtn) {
      if (stepNum === 4) {
        wizardNextBtn.innerHTML = '<span>Done & Save</span> <i class="fa-solid fa-check"></i>';
      } else {
        wizardNextBtn.innerHTML = '<span>Next Step</span> <i class="fa-solid fa-arrow-right"></i>';
      }
    }

    if (stepNum === 4) {
      calculateAssessmentResults();
    }
  }

  // Deterministic, instant, client-side triage. This NEVER depends on a
  // network call, so the danger-symptom banner and specialty recommendation
  // always show immediately regardless of AI availability.
  function computeLocalTriage(allSymptoms, draft) {
    const isSevere = draft.severity === "Severe";
    const hasDangerSymptom = allSymptoms.some((s) =>
      s.toLowerCase().includes("chest") || s.toLowerCase().includes("breath") || s.toLowerCase().includes("shortness")
    );

    let triageCategory = "Low to Moderate Risk";
    let isUrgent = false;
    let recommendedSpec = "General Physician";
    let advice = "Consider resting, maintaining adequate hydration, and monitoring symptoms.";

    if (hasDangerSymptom || (isSevere && draft.duration === "More than 1 week")) {
      triageCategory = "High Priority / Urgent Attention";
      isUrgent = true;
      recommendedSpec = allSymptoms.some((s) => s.toLowerCase().includes("chest")) ? "Cardiologist" : "General Physician / Emergency";
      advice = "Because you reported acute distress or chest/breathing symptoms, please do not delay in consulting a qualified physician or reaching out to 108 emergency paramedics.";
    } else if (allSymptoms.some((s) => s.toLowerCase().includes("headache")) && draft.duration !== "Less than 24 hours") {
      recommendedSpec = "General Physician";
      advice = "Ensure regular fluid intake, limit screen strain, monitor blood pressure if applicable, and consult a doctor if severe.";
    } else if (allSymptoms.some((s) => s.toLowerCase().includes("cough") || s.toLowerCase().includes("sore throat"))) {
      recommendedSpec = "General Physician / ENT Specialist";
      advice = "Stay warm, try saline warm water gargles, avoid cold drinks, and seek consultation if accompanied by persistent high fever.";
    }

    return { triageCategory, isUrgent, recommendedSpec, advice };
  }

  async function calculateAssessmentResults() {
    const draft = APP_STATE.assessmentDraft;
    draft.notes = assessmentSymptomsText ? assessmentSymptomsText.value.trim() : "";

    const allSymptoms = [...draft.symptoms, ...draft.customSymptoms];
    const { triageCategory, isUrgent, recommendedSpec, advice } = computeLocalTriage(allSymptoms, draft);

    // Populate summary fields immediately with the local (instant) result.
    if (summarySymptomsList) {
      summarySymptomsList.textContent = allSymptoms.length > 0 ? allSymptoms.join(", ") : "None specified";
    }
    if (summaryDurationSeverity) {
      summaryDurationSeverity.textContent = `${draft.duration} · ${draft.severity}`;
    }
    if (summarySpecialty) {
      summarySpecialty.textContent = recommendedSpec;
    }
    if (summaryGuidanceNotes) {
      summaryGuidanceNotes.textContent = advice;
    }
    if (triageLevel) {
      triageLevel.textContent = triageCategory;
    }
    if (triageBadge) {
      triageBadge.classList.toggle("is-urgent", isUrgent);
    }
    if (assessmentEmergencyBanner) {
      assessmentEmergencyBanner.hidden = !isUrgent;
    }

    // Save to storage
    const assessmentRecord = {
      date: new Date().toISOString(),
      symptoms: allSymptoms,
      duration: draft.duration,
      severity: draft.severity,
      specialty: recommendedSpec,
      triage: triageCategory,
      notes: draft.notes
    };
    APP_STATE.lastAssessment = assessmentRecord;
    localStorage.setItem("swastya_last_assessment", JSON.stringify(assessmentRecord));

    // Enhance the guidance text via the backend AI route. This is additive
    // only: if it fails or is slow, the local `advice` text above stays put.
    fetchAIGuidance(allSymptoms, draft, advice);
  }

  async function fetchAIGuidance(allSymptoms, draft, fallbackAdvice) {
    const aiStatusEl = document.getElementById("aiGuidanceStatus");
    if (typeof askAI !== "function") return; // api.js not loaded, silently skip

    const promptMessage = draft.notes && draft.notes.length > 0
      ? draft.notes
      : `I have these symptoms: ${allSymptoms.join(", ") || "none specified"}.`;

    if (aiStatusEl) aiStatusEl.hidden = false;

    try {
      const result = await askAI(promptMessage, {
        symptoms: allSymptoms,
        duration: draft.duration,
        severity: draft.severity
      });

      // Only apply the AI text if the user is still on the summary step
      // (they may have navigated away while the request was in flight).
      if (APP_STATE.assessmentDraft.step === 4 && result && result.success && result.data && result.data.reply) {
        if (summaryGuidanceNotes) {
          summaryGuidanceNotes.textContent = result.data.reply;
        }
        if (APP_STATE.lastAssessment) {
          APP_STATE.lastAssessment.notes = APP_STATE.lastAssessment.notes || draft.notes;
          APP_STATE.lastAssessment.aiGuidance = result.data.reply;
          localStorage.setItem("swastya_last_assessment", JSON.stringify(APP_STATE.lastAssessment));
        }
      } else if (result && !result.success) {
        console.warn("AI guidance unavailable:", result.message);
      }
    } catch (e) {
      console.warn("AI guidance request failed, keeping local guidance:", e);
    } finally {
      if (aiStatusEl) aiStatusEl.hidden = true;
    }
  }

  function initAssessmentWizard() {
    // Step 1: Symptom Chips Toggle
    document.querySelectorAll(".symptom-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const sym = chip.getAttribute("data-symptom");
        chip.classList.toggle("is-selected");

        if (chip.classList.contains("is-selected")) {
          if (!APP_STATE.assessmentDraft.symptoms.includes(sym)) {
            APP_STATE.assessmentDraft.symptoms.push(sym);
          }
        } else {
          APP_STATE.assessmentDraft.symptoms = APP_STATE.assessmentDraft.symptoms.filter((s) => s !== sym);
        }
      });
    });

    // Custom Symptom Addition
    if (addCustomSymptomBtn && customSymptomInput) {
      addCustomSymptomBtn.addEventListener("click", () => {
        const val = customSymptomInput.value.trim();
        if (val) {
          APP_STATE.assessmentDraft.customSymptoms.push(val);
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "symptom-chip is-selected";
          chip.innerHTML = `<i class="fa-solid fa-check"></i> ${val}`;
          chip.addEventListener("click", () => {
            chip.remove();
            APP_STATE.assessmentDraft.customSymptoms = APP_STATE.assessmentDraft.customSymptoms.filter((s) => s !== val);
          });
          document.getElementById("symptomsChipGroup")?.appendChild(chip);
          customSymptomInput.value = "";
          showToast(`Added "${val}" to symptoms`, "info");
        }
      });
    }

    // Step 2: Duration Buttons
    document.querySelectorAll("#durationGroup .select-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#durationGroup .select-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        APP_STATE.assessmentDraft.duration = btn.getAttribute("data-duration");
      });
    });

    // Step 2: Severity Cards
    document.querySelectorAll("#severityGroup .severity-card").forEach((card) => {
      card.addEventListener("click", () => {
        document.querySelectorAll("#severityGroup .severity-card").forEach((c) => c.classList.remove("is-active"));
        card.classList.add("is-active");
        APP_STATE.assessmentDraft.severity = card.getAttribute("data-severity");
      });
    });

    // Step 3: Speak Symptoms via Voice
    if (assessmentVoiceBtn) {
      assessmentVoiceBtn.addEventListener("click", () => {
        navigateTo("voice");
        showToast("Voice assistant activated. Speak your symptoms and click 'Use in Assessment'!", "info");
      });
    }

    // Wizard Navigation Buttons
    if (wizardPrevBtn) {
      wizardPrevBtn.addEventListener("click", () => {
        if (APP_STATE.assessmentDraft.step > 1) {
          setAssessmentStep(APP_STATE.assessmentDraft.step - 1);
        }
      });
    }
    if (wizardNextBtn) {
      wizardNextBtn.addEventListener("click", () => {
        if (APP_STATE.assessmentDraft.step < 4) {
          setAssessmentStep(APP_STATE.assessmentDraft.step + 1);
        } else {
          showToast("Assessment results recorded in your Dashboard!", "success");
          navigateTo("dashboard");
        }
      });
    }
  }

  /* -------------------------------------------------------------------------
     9. DOCTOR DIRECTORY & HEALTHCARE SUPPORT
     ------------------------------------------------------------------------- */
  const doctorsGridContainer = document.getElementById("doctorsGridContainer");
  const doctorSearchInput = document.getElementById("doctorSearchInput");
  const filterSpecialtySelect = document.getElementById("filterSpecialtySelect");
  const filterLocationSelect = document.getElementById("filterLocationSelect");
  const filterLanguageSelect = document.getElementById("filterLanguageSelect");
  const resetDoctorFiltersBtn = document.getElementById("resetDoctorFiltersBtn");
  const doctorCategoryTabs = document.getElementById("doctorCategoryTabs");

  let activeCategoryFilter = "ALL";

  function renderDoctorGrid() {
    if (!doctorsGridContainer) return;

    const searchTerm = (doctorSearchInput?.value || "").toLowerCase().trim();
    const specFilter = filterSpecialtySelect?.value || "";
    const locFilter = filterLocationSelect?.value || "";
    const langFilter = filterLanguageSelect?.value || "";

    const filtered = DOCTOR_DATABASE.filter((doc) => {
      // Category filter
      if (activeCategoryFilter === "General Physician" && doc.specialization !== "General Physician") {
        return false;
      }
      if (activeCategoryFilter === "Specialist" && doc.specialization === "General Physician") {
        return false;
      }
      // Specialty dropdown
      if (specFilter && doc.specialization !== specFilter) return false;
      // Location dropdown
      if (locFilter && doc.location !== locFilter) return false;
      // Language dropdown
      if (langFilter && !doc.languages.includes(langFilter)) return false;
      // Search term
      if (searchTerm) {
        const matchesName = doc.name.toLowerCase().includes(searchTerm);
        const matchesSpec = doc.specialization.toLowerCase().includes(searchTerm);
        const matchesLoc = doc.location.toLowerCase().includes(searchTerm);
        if (!matchesName && !matchesSpec && !matchesLoc) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      doctorsGridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fa-solid fa-user-doctor"></i>
          <p>No verified doctors found matching your exact filter criteria.</p>
          <button type="button" class="btn btn--ghost btn--sm" id="emptyResetBtn">Reset Filters</button>
        </div>
      `;
      document.getElementById("emptyResetBtn")?.addEventListener("click", resetDoctorFilters);
      return;
    }

    doctorsGridContainer.innerHTML = filtered
      .map(
        (doc) => `
      <article class="doctor-card" data-doctor-id="${doc.id}">
        <div class="doctor-card__top">
          <div class="doctor-card__avatar">
            <i class="fa-solid ${doc.avatarIcon || "fa-user-doctor"}"></i>
          </div>
          <div>
            <span class="doctor-card__badge"><i class="fa-solid fa-certificate"></i> Verified</span>
            <h3 class="doctor-card__name">${doc.name}</h3>
            <p class="doctor-card__specialty">${doc.specialization}</p>
          </div>
        </div>

        <div class="doctor-card__meta">
          <div class="doctor-card__meta-item">
            <i class="fa-solid fa-briefcase-medical"></i>
            <span>${doc.experience} years experience</span>
          </div>
          <div class="doctor-card__meta-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>${doc.location}</span>
          </div>
          <div class="doctor-card__meta-item">
            <i class="fa-solid fa-language"></i>
            <span>${doc.languages.join(", ")}</span>
          </div>
          <div class="doctor-card__meta-item">
            <i class="fa-solid fa-clock"></i>
            <span>${doc.availability}</span>
          </div>
        </div>

        <div class="doctor-card__footer">
          <div class="doctor-card__rating">
            <i class="fa-solid fa-star"></i>
            <span>${doc.rating} (${doc.reviews})</span>
          </div>
          <button type="button" class="btn btn--primary btn--sm book-doc-btn" data-doctor-name="${doc.name}">
            <span>Book Visit</span> <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </article>
    `
      )
      .join("");

    // Hook up booking buttons
    document.querySelectorAll(".book-doc-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const docName = btn.getAttribute("data-doctor-name");
        openAppointmentModal(docName);
      });
    });
  }

  function resetDoctorFilters() {
    if (doctorSearchInput) doctorSearchInput.value = "";
    if (filterSpecialtySelect) filterSpecialtySelect.value = "";
    if (filterLocationSelect) filterLocationSelect.value = "";
    if (filterLanguageSelect) filterLanguageSelect.value = "";
    activeCategoryFilter = "ALL";

    document.querySelectorAll(".category-tab").forEach((tab) => {
      tab.classList.toggle("is-active", tab.getAttribute("data-category") === "ALL");
    });

    renderDoctorGrid();
    showToast("Filters reset", "info");
  }

  function initDoctorDirectory() {
    renderDoctorGrid();

    // Live filter inputs
    if (doctorSearchInput) doctorSearchInput.addEventListener("input", renderDoctorGrid);
    if (filterSpecialtySelect) filterSpecialtySelect.addEventListener("change", renderDoctorGrid);
    if (filterLocationSelect) filterLocationSelect.addEventListener("change", renderDoctorGrid);
    if (filterLanguageSelect) filterLanguageSelect.addEventListener("change", renderDoctorGrid);
    if (resetDoctorFiltersBtn) resetDoctorFiltersBtn.addEventListener("click", resetDoctorFilters);

    // Category Tabs
    if (doctorCategoryTabs) {
      doctorCategoryTabs.querySelectorAll(".category-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          doctorCategoryTabs.querySelectorAll(".category-tab").forEach((t) => t.classList.remove("is-active"));
          tab.classList.add("is-active");
          activeCategoryFilter = tab.getAttribute("data-category");

          if (activeCategoryFilter === "Emergency") {
            window.location.href = "tel:108";
            showToast("Dialing National Ambulance Helpline 108...", "warn");
          } else {
            renderDoctorGrid();
          }
        });
      });
    }
  }

  /* -------------------------------------------------------------------------
     10. GLOBAL APPOINTMENT BOOKING MODAL
     ------------------------------------------------------------------------- */
  const appointmentModalOverlay = document.getElementById("appointmentModalOverlay");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const appointmentBookingForm = document.getElementById("appointmentBookingForm");
  const bookDoctorSelect = document.getElementById("bookDoctorSelect");
  const bookPatientName = document.getElementById("bookPatientName");
  const bookPatientPhone = document.getElementById("bookPatientPhone");
  const bookDate = document.getElementById("bookDate");
  const modalBookingFormView = document.getElementById("modalBookingFormView");
  const modalBookingSuccessView = document.getElementById("modalBookingSuccessView");
  const modalSuccessDoneBtn = document.getElementById("modalSuccessDoneBtn");
  const bookingReceiptBox = document.getElementById("bookingReceiptBox");

  function populateDoctorSelectOptions() {
    if (!bookDoctorSelect) return;
    bookDoctorSelect.innerHTML = DOCTOR_DATABASE.map(
      (d) => `<option value="${d.name}">${d.name} — ${d.specialization} (${d.location})</option>`
    ).join("");
  }

  function openAppointmentModal(preSelectedDocName = null) {
    if (!appointmentModalOverlay) return;

    populateDoctorSelectOptions();

    if (preSelectedDocName && bookDoctorSelect) {
      bookDoctorSelect.value = preSelectedDocName;
    }

    // Auto-fill patient details if profile exists
    if (APP_STATE.patientProfile) {
      if (bookPatientName) bookPatientName.value = APP_STATE.patientProfile.fullName;
      if (bookPatientPhone) bookPatientPhone.value = APP_STATE.patientProfile.phone;
    }

    // Default booking date to tomorrow
    if (bookDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      bookDate.value = tomorrow.toISOString().split("T")[0];
    }

    // Reset views
    if (modalBookingFormView) modalBookingFormView.hidden = false;
    if (modalBookingSuccessView) modalBookingSuccessView.hidden = true;

    appointmentModalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeAppointmentModal() {
    if (!appointmentModalOverlay) return;
    appointmentModalOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  function initAppointmentModal() {
    populateDoctorSelectOptions();

    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeAppointmentModal);
    if (modalSuccessDoneBtn) modalSuccessDoneBtn.addEventListener("click", closeAppointmentModal);

    if (appointmentModalOverlay) {
      appointmentModalOverlay.addEventListener("click", (e) => {
        if (e.target === appointmentModalOverlay) closeAppointmentModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !appointmentModalOverlay.hidden) {
        closeAppointmentModal();
      }
    });

    if (appointmentBookingForm) {
      appointmentBookingForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const doc = bookDoctorSelect.value;
        const patient = bookPatientName.value.trim();
        const phone = bookPatientPhone.value.trim();
        const date = bookDate.value;
        const time = document.getElementById("bookTime").value;
        const concern = document.getElementById("bookSymptomsDesc").value.trim();

        if (!patient || !phone || !date) {
          showToast("Please provide patient name, phone number, and appointment date.", "warn");
          return;
        }

        const bookingRef = `SS-${Math.floor(100000 + Math.random() * 900000)}`;

        if (bookingReceiptBox) {
          bookingReceiptBox.innerHTML = `
            <p><strong>Appointment Reference:</strong> ${bookingRef}</p>
            <p><strong>Doctor:</strong> ${doc}</p>
            <p><strong>Patient:</strong> ${patient} (+91 ${phone})</p>
            <p><strong>Slot:</strong> ${date} at ${time}</p>
            ${concern ? `<p><strong>Concern:</strong> ${concern}</p>` : ""}
          `;
        }

        if (modalBookingFormView) modalBookingFormView.hidden = true;
        if (modalBookingSuccessView) modalBookingSuccessView.hidden = false;

        showToast("Consultation slot confirmed!", "success");
      });
    }
  }

  /* -------------------------------------------------------------------------
     11. PREMIUM VOICE ASSISTANT & VOICE-TO-TEXT (Web Speech API)
     ------------------------------------------------------------------------- */
  const micControlBtn = document.getElementById("micControlBtn");
  const micPulseWrapper = document.getElementById("micPulseWrapper");
  const soundWaveContainer = document.getElementById("soundWaveContainer");
  const voiceStatusText = document.getElementById("voiceStatusText");
  const voiceStatusDot = document.getElementById("voiceStatusDot");
  const speechTranscriptArea = document.getElementById("speechTranscriptArea");
  const transcriptStats = document.getElementById("transcriptStats");
  const clearTranscriptBtn = document.getElementById("clearTranscriptBtn");
  const copyTranscriptBtn = document.getElementById("copyTranscriptBtn");
  const readAloudBtn = document.getElementById("readAloudBtn");
  const useInAssessmentBtn = document.getElementById("useInAssessmentBtn");
  const voiceFallbackBox = document.getElementById("voiceFallbackBox");

  function initVoiceAssistant() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (voiceFallbackBox) voiceFallbackBox.hidden = false;
      if (voiceStatusText) {
        voiceStatusText.textContent = "Web Speech API is unsupported in this browser. You can type directly in the box below.";
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Bind to active selected language locale
      const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === APP_STATE.selectedLanguage) || SUPPORTED_LANGUAGES[0];
      recognition.lang = activeLangObj.locale;

      APP_STATE.speechRecognition = recognition;

      recognition.onstart = () => {
        APP_STATE.isListening = true;
        if (micPulseWrapper) micPulseWrapper.classList.add("is-listening");
        if (soundWaveContainer) soundWaveContainer.classList.add("is-active");
        if (voiceStatusDot) {
          voiceStatusDot.className = "status-dot status-dot--listening";
        }
        if (voiceStatusText) {
          voiceStatusText.textContent = `Listening in ${activeLangObj.native}... Please speak now into your microphone.`;
        }
        showToast("Listening... Speak now", "info");
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (speechTranscriptArea) {
          speechTranscriptArea.value = transcript;
          updateWordCount(transcript);
        }

        if (voiceStatusDot) {
          voiceStatusDot.className = "status-dot status-dot--processing";
        }
        if (voiceStatusText) {
          voiceStatusText.textContent = "Speech detected and processing...";
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        stopListeningState();
        if (voiceStatusText) {
          voiceStatusText.textContent = `Speech recognition notice: ${event.error}. Click microphone to retry.`;
        }
      };

      recognition.onend = () => {
        stopListeningState();
        if (voiceStatusText) {
          voiceStatusText.textContent = "Speech captured! Click microphone to resume speaking anytime.";
        }
      };

      if (micControlBtn) {
        micControlBtn.addEventListener("click", () => {
          if (!APP_STATE.isListening) {
            // Update speech recognition language locale before starting
            const curLang = SUPPORTED_LANGUAGES.find((l) => l.code === APP_STATE.selectedLanguage) || SUPPORTED_LANGUAGES[0];
            recognition.lang = curLang.locale;
            try {
              recognition.start();
            } catch (err) {
              console.warn("Recognition already started or error:", err);
            }
          } else {
            recognition.stop();
          }
        });
      }
    } catch (e) {
      console.warn("Speech recognition setup error:", e);
      if (voiceFallbackBox) voiceFallbackBox.hidden = false;
    }

    // Transcript Actions
    if (clearTranscriptBtn) {
      clearTranscriptBtn.addEventListener("click", () => {
        if (speechTranscriptArea) speechTranscriptArea.value = "";
        updateWordCount("");
        showToast("Transcript cleared", "info");
      });
    }

    if (copyTranscriptBtn) {
      copyTranscriptBtn.addEventListener("click", () => {
        if (speechTranscriptArea && speechTranscriptArea.value) {
          navigator.clipboard.writeText(speechTranscriptArea.value);
          showToast("Transcript copied to clipboard!", "success");
        } else {
          showToast("No speech transcript to copy.", "warn");
        }
      });
    }

    if (readAloudBtn) {
      readAloudBtn.addEventListener("click", () => {
        const text = speechTranscriptArea ? speechTranscriptArea.value.trim() : "";
        if (!text) {
          showToast("Please transcribe or type text first to read aloud.", "warn");
          return;
        }
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          const curLang = SUPPORTED_LANGUAGES.find((l) => l.code === APP_STATE.selectedLanguage) || SUPPORTED_LANGUAGES[0];
          utterance.lang = curLang.locale;
          window.speechSynthesis.speak(utterance);
          showToast("Reading aloud...", "info");
        } else {
          showToast("Text-to-speech is unsupported in this browser.", "warn");
        }
      });
    }

    if (useInAssessmentBtn) {
      useInAssessmentBtn.addEventListener("click", () => {
        const text = speechTranscriptArea ? speechTranscriptArea.value.trim() : "";
        if (!text) {
          showToast("No speech transcript captured yet. Please speak or type your symptoms first.", "warn");
          return;
        }

        if (assessmentSymptomsText) {
          assessmentSymptomsText.value = text;
        }

        navigateTo("assessment");
        setAssessmentStep(3);
        showToast("Speech transcript inserted into Health Assessment Step 3!", "success");
      });
    }
  }

  function stopListeningState() {
    APP_STATE.isListening = false;
    if (micPulseWrapper) micPulseWrapper.classList.remove("is-listening");
    if (soundWaveContainer) soundWaveContainer.classList.remove("is-active");
    if (voiceStatusDot) {
      voiceStatusDot.className = "status-dot status-dot--ready";
    }
  }

  function updateWordCount(text) {
    if (!transcriptStats) return;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    transcriptStats.textContent = `${words} word${words === 1 ? "" : "s"}`;
  }

  /* -------------------------------------------------------------------------
     12. TOAST NOTIFICATIONS & UTILITIES
     ------------------------------------------------------------------------- */
  function showToast(message, type = "info", duration = 3200) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;

    let icon = "fa-info-circle";
    if (type === "success") icon = "fa-circle-check";
    if (type === "warn") icon = "fa-triangle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /* Scroll progress & back to top */
  const scrollProgress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  const navbar = document.getElementById("navbar");

  function handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollProgress) scrollProgress.style.width = `${pct}%`;
    if (backToTop) backToTop.classList.toggle("is-visible", scrollTop > 400);
    if (navbar) navbar.classList.toggle("is-scrolled", scrollTop > 20);
  }

  function initScrollHelpers() {
    window.addEventListener("scroll", handleScroll, { passive: true });
    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* -------------------------------------------------------------------------
     13. INITIALIZATION
     ------------------------------------------------------------------------- */
  function initApp() {
    initTheme();
    initRouter();
    initMobileNav();
    initLanguages();
    initLocationFeature();
    initPatientRegistration();
    initAssessmentWizard();
    initDoctorDirectory();
    initAppointmentModal();
    initVoiceAssistant();
    initScrollHelpers();
    updateDashboardUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
