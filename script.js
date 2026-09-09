/* =========================================================================
   SWASTYA SETHU — COMPLETE SINGLE-PAGE APPLICATION ENGINE (script.js)
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

  /* Comprehensive Multilingual Dictionary */
  const TRANSLATIONS = {
    en: {
      docTitle: "Swastya Sethu — Multilingual Healthcare Accessibility",
      skipLink: "Skip to Main Content",
      "nav.home": "Home",
      "nav.assessment": "Assessment",
      "nav.doctors": "Doctors",
      "nav.voice": "Voice Assistant",
      "nav.dashboard": "Dashboard",
      "nav.changeLanguage": "Change Language",
      "nav.toggleTheme": "Toggle Theme",
      "nav.toggleMenu": "Toggle Menu",
      "nav.backToTop": "Back to Top",
      "home.heroBadge": "Verified Healthcare Initiative",
      "home.heroTitle": "Accessible Healthcare in Your Native Language",
      "home.heroDesc": "Connecting patients across rural and urban India with doctors, AI health preliminary assessment, and voice-guided support in 9 Indian languages.",
      "home.heroCtaLang": "Choose Language & Start",
      "home.heroCtaCheck": "Quick Health Check",
      "home.trustText": "Over 50,000+ Rural Patients Assisted Nationwide",
      "home.heroImgTitle": "Doctor consulting a rural patient",
      "home.floatDoctorTitle": "Verified Doctors",
      "home.floatDoctorSub": "Available in 9 Languages",
      "home.floatRatingText": "4.9/5 Patient Satisfaction",
      "home.featuresEyebrow": "Built For Every Citizen",
      "home.featuresTitle": "Healthcare Accessibility Without Compromise",
      "home.featuresDesc": "Designed specifically to break language barriers, technological friction, and geographic distances.",
      "home.f1Title": "9 Indian Languages",
      "home.f1Desc": "Complete platform translation in Hindi, Punjabi, Tamil, Telugu, Kannada, Malayalam, Urdu, Odia, and English.",
      "home.f1Action": "Select Language",
      "home.f2Title": "Voice Assistant",
      "home.f2Desc": "Speak your health concerns into your microphone in your native language with instant text conversion.",
      "home.f2Action": "Open Voice Hub",
      "home.f3Title": "Preliminary Assessment",
      "home.f3Desc": "Guided symptom checker providing preliminary health categorization and recommended specialist care.",
      "home.f3Action": "Take Assessment",
      "home.f4Title": "Verified Doctor Directory",
      "home.f4Desc": "Connect with general physicians and specialists who speak your exact mother tongue.",
      "home.f4Action": "Browse Doctors",
      "home.impactPatients": "Patients Assisted",
      "home.impactDoctors": "Verified Doctors",
      "home.impactVillages": "Villages Reached",
      "home.impactSupport": "Emergency & Voice Support",
      "home.ruralEyebrow": "Rural Healthcare Mission",
      "home.ruralTitle": "Distance Should Never Decide Your Diagnosis",
      "home.ruralDesc": "Swastya Sethu bridges rural primary health centers (PHCs) and community healthcare workers (ASHAs) directly with multi-specialty urban doctor networks.",
      "home.r1Title": "Teleconsultation Kiosks",
      "home.r1Desc": "Deployed in village centers equipped with basic diagnostics and tablet interfaces.",
      "home.r2Title": "Community Health Workers",
      "home.r2Desc": "Voice-enabled symptom checking simplifies triage for ASHA workers on ground.",
      "home.r3Title": "Mobile Diagnostic Units",
      "home.r3Desc": "Seamless referral pathways for emergency and specialized clinic visits.",
      "home.ruralCta": "Find Nearby Doctors",
      "home.ruralImgTitle": "Rural healthcare clinic",
      "home.ctaTitle": "Ready to Experience Healthcare in Your Language?",
      "home.ctaDesc": "Register your patient profile or start a quick health assessment right now.",
      "home.ctaRegister": "Register as Patient",
      "home.ctaVoice": "Try Voice Assistant",
      "lang.backHome": "Back to Home",
      "lang.eyebrow": "Multilingual Accessibility",
      "lang.title": "Choose Your Preferred Language",
      "lang.desc": "Select your language to translate all symptoms, doctor details, assessments, and voice features.",
      "lang.locTitle": "Auto-Detect Regional Language",
      "lang.locDesc": "Click below to detect your state and get a recommended regional language.",
      "lang.recommendedTag": "Recommended:",
      "lang.applyRecommended": "Apply Recommended Language",
      "lang.detectBtn": "Detect My Location",
      "lang.currentActive": "Currently Active:",
      "lang.instantNote": "Changes apply instantly across the entire portal",
      "lang.continue": "Continue with Selected Language",
      "reg.backHome": "Back to Home",
      "reg.eyebrow": "Patient Identification",
      "reg.title": "Register Your Patient Profile",
      "reg.desc": "Create your local profile to save health assessment records, doctor appointments, and medical history.",
      "reg.fullName": "Full Name",
      "reg.fullNamePlaceholder": "e.g. Ramesh Kumar",
      "reg.age": "Age",
      "reg.agePlaceholder": "e.g. 42",
      "reg.gender": "Gender",
      "reg.selectGender": "-- Select Gender --",
      "reg.genderMale": "Male",
      "reg.genderFemale": "Female",
      "reg.genderOther": "Other / Prefer not to say",
      "reg.phone": "Mobile Phone Number",
      "reg.phonePlaceholder": "e.g. 9876543210",
      "reg.city": "City / District / Village",
      "reg.cityPlaceholder": "e.g. Amritsar",
      "reg.state": "State",
      "reg.statePlaceholder": "e.g. Punjab",
      "reg.emergencyPhone": "Emergency Contact Number (Optional)",
      "reg.emergencyPhonePlaceholder": "e.g. 9123456789",
      "reg.privacyNotice": "Your health data remains private on your local device. Swastya Sethu never shares personal information without your explicit consent.",
      "reg.saveProfile": "Save Profile & Open Dashboard",
      "reg.errFullName": "Please enter your full name (at least 2 letters).",
      "reg.errAge": "Please enter a valid age (1 - 120).",
      "reg.errGender": "Please select a gender.",
      "reg.errPhone": "Please enter a valid 10-digit mobile number.",
      "reg.errCity": "Please enter your city or village.",
      "reg.errState": "Please enter your state or union territory.",
      "dash.editProfile": "Edit Profile",
      "dash.welcome": "Welcome back,",
      "dash.desc": "Access your personal health portal, preliminary assessment history, and direct doctor consultations.",
      "dash.activeCheck": "Active Check",
      "dash.quickAssessment": "Health Assessment",
      "dash.quickAssessmentDesc": "Check symptoms, analyze severity, and get immediate preliminary care guidance.",
      "dash.startNow": "Start Now",
      "dash.doctorsAvailable": "1,200+ Available",
      "dash.consultDoctor": "Consult a Doctor",
      "dash.consultDoctorDesc": "Filter doctors by mother tongue, specialty, location, and fee structure.",
      "dash.browseDirectory": "Browse Directory",
      "dash.voiceAssisted": "Voice Assisted",
      "dash.voiceAssistant": "Voice Assistant",
      "dash.voiceAssistantDesc": "Speak symptoms in your regional dialect and convert audio directly to text.",
      "dash.openVoiceHub": "Open Voice Hub",
      "dash.languagesCount": "9 Languages",
      "dash.changeLanguage": "Language Settings",
      "dash.changeLanguageDesc": "Switch site dialect or enable regional auto-detection anytime.",
      "dash.switchLanguage": "Switch Language",
      "dash.recentAssessmentTitle": "Recent Health Assessment",
      "dash.emergencyHelplines": "Emergency Helplines",
      "dash.nationalAmbulance": "National Ambulance Service",
      "dash.medicalHelpline": "State Medical Helpline",
      "dash.womenChildHelpline": "Women & Child Emergency",
      "dash.noAssessmentYet": "No health assessment recorded on this device yet.",
      "dash.takeAssessment": "Take Preliminary Assessment",
      "dash.assessmentDate": "Assessment Date:",
      "dash.reportedSymptoms": "Reported Symptoms:",
      "dash.severityDuration": "Severity & Duration:",
      "dash.triageRec": "Triage Recommendation:",
      "dash.retakeAssessment": "Retake Assessment",
      "dash.consultDoctorBtn": "Consult Doctor",
      "dash.valuedPatient": "Valued Patient",
      "dash.guestProfile": "Guest Patient Profile",
      "dash.guestDetails": "Please complete your registration to personalize your health journey.",
      "dash.activeLangPrefix": "Active Language:",
      "assess.backHome": "Back to Home",
      "assess.eyebrow": "Preliminary Care Triage",
      "assess.title": "Symptom Assessment Wizard",
      "assess.desc": "Follow these quick steps to describe your health symptoms in your language.",
      "assess.step1": "Symptoms",
      "assess.step2": "Duration & Severity",
      "assess.step3": "Notes / Voice",
      "assess.step4": "Results",
      "assess.pane1Title": "Select Primary Symptoms",
      "assess.pane1Desc": "Tap all symptoms you are currently experiencing:",
      "assess.symFever": "Fever / Body Heat",
      "assess.symCough": "Cough / Dry Cough",
      "assess.symHeadache": "Headache / Head Pressure",
      "assess.symBreath": "Shortness of Breath",
      "assess.symBodyAche": "Body & Muscle Aches",
      "assess.symChestPain": "Chest Discomfort / Pain",
      "assess.symThroat": "Sore Throat / Swallowing Difficulty",
      "assess.symStomach": "Stomach Pain / Nausea",
      "assess.symFatigue": "Extreme Fatigue / Weakness",
      "assess.customSymptomPlaceholder": "Or type additional symptom (e.g. Skin Rash)...",
      "assess.addSymptom": "Add",
      "assess.pane2Title": "Duration & Severity",
      "assess.durationLabel": "How long have you felt these symptoms?",
      "assess.dur24": "Less than 24 hours",
      "assess.dur1to3": "1 to 3 days",
      "assess.dur4to7": "4 to 7 days",
      "assess.dur1week": "More than 1 week",
      "assess.severityLabel": "Severity Level",
      "assess.sevMildBadge": "Mild",
      "assess.sevMildTitle": "Mild Discomfort",
      "assess.sevMildDesc": "Manageable, does not stop daily routine activities.",
      "assess.sevModBadge": "Moderate",
      "assess.sevModTitle": "Moderate Intensity",
      "assess.sevModDesc": "Noticeable distress, partially restricts normal work.",
      "assess.sevSevereBadge": "Severe",
      "assess.sevSevereTitle": "Severe / Urgent",
      "assess.sevSevereDesc": "High discomfort, requires prompt medical consultation.",
      "assess.pane3Title": "Describe Additional Symptoms or Concerns",
      "assess.pane3Desc": "Type details below, or use the Voice Assistant to speak in your mother tongue.",
      "assess.pane3Placeholder": "Type medical details or pre-existing conditions...",
      "assess.voiceShortcutTitle": "Prefer speaking instead of typing?",
      "assess.voiceShortcutDesc": "Click below to open the native voice recorder in your chosen language.",
      "assess.openVoice": "Open Voice Assistant",
      "assess.triageTitle": "Triage Result:",
      "assess.pane4Title": "Preliminary Care Guidance Summary",
      "assess.emergencyBannerTitle": "Urgent Attention Recommended",
      "assess.emergencyBannerDesc": "You indicated severe symptoms or chest distress. Please consult a qualified medical professional immediately or call emergency helpline 108.",
      "assess.reportedSymptoms": "Reported Symptoms:",
      "assess.durationSeverity": "Duration & Severity:",
      "assess.recommendedSpecialty": "Recommended Care Specialty:",
      "assess.preliminaryAdvice": "Preliminary Advice & Next Steps",
      "assess.summaryGuidanceFallback": "Rest adequately, stay hydrated with warm fluids, and consult a doctor if fever exceeds 101°F.",
      "assess.aiGenerating": "Generating AI-assisted health recommendations...",
      "assess.btnPrevious": "Previous",
      "assess.btnNext": "Next Step",
      "assess.btnDoneSave": "Done & Save",
      "doc.eyebrow": "Multilingual Medical Staff",
      "doc.title": "Verified Doctors Directory",
      "doc.desc": "Filter by specialty, language, and location to consult with verified doctors speaking your language.",
      "doc.searchLabel": "Search Doctor Name",
      "doc.searchPlaceholder": "e.g. Dr. Anjali Rao or General Physician...",
      "doc.specialtyLabel": "Specialty",
      "doc.allSpecialties": "All Specialties",
      "doc.specGeneral": "General Physician",
      "doc.specCardiologist": "Cardiologist",
      "doc.specDermatologist": "Dermatologist",
      "doc.specPediatrician": "Pediatrician",
      "doc.specOrthopedic": "Orthopedic Specialist",
      "doc.specMental": "Mental Health Specialist",
      "doc.specGynecologist": "Gynecologist",
      "doc.specENT": "ENT Specialist",
      "doc.cityLabel": "City / Region",
      "doc.allLocations": "All Cities",
      "doc.spokenLanguageLabel": "Spoken Language",
      "doc.allSpokenLanguages": "All Spoken Languages",
      "doc.resetFilters": "Reset Filters",
      "doc.catAll": "All Doctors",
      "doc.catGeneral": "General Physicians",
      "doc.catSpecialists": "Specialists",
      "doc.catEmergency": "Emergency Care",
      "doc.verified": "Verified",
      "doc.expYears": "{{years}} years experience",
      "doc.bookVisit": "Book Visit",
      "doc.noResults": "No verified doctors found matching your exact filter criteria.",
      "voice.backHome": "Back to Home",
      "voice.eyebrow": "Voice-to-Text Speech Recognition",
      "voice.title": "Voice-to-Text Health Assistant",
      "voice.desc": "Speak into your microphone in your native language. Our assistant converts speech into text for symptom checking.",
      "voice.recognitionLanguage": "Recognition Language:",
      "voice.changeLanguage": "Change",
      "voice.toggleMic": "Toggle Microphone",
      "voice.statusReady": "Click microphone button and speak your symptoms...",
      "voice.statusListening": "Listening in {{lang}}... Please speak now into your microphone.",
      "voice.statusProcessing": "Speech detected and processing...",
      "voice.statusError": "Speech recognition notice: {{error}}. Click microphone to retry.",
      "voice.statusCaptured": "Speech captured! Click microphone to resume speaking anytime.",
      "voice.capturedTranscript": "Captured Speech Transcript",
      "voice.wordCount": "{{count}} word{{s}}",
      "voice.transcriptPlaceholder": "Your spoken text will automatically appear here... You can also type or edit text manually.",
      "voice.clear": "Clear",
      "voice.copy": "Copy Text",
      "voice.readAloud": "Read Aloud",
      "voice.useInAssessment": "Use in Health Assessment",
      "voice.browserUnsupported": "Speech recognition is not fully supported on this browser. You can type directly in the box above.",
      "modal.close": "Close modal",
      "modal.title": "Book Doctor Consultation",
      "modal.desc": "Schedule a teleconsultation visit or OPD appointment in your preferred language.",
      "modal.selectDoctor": "Select Doctor",
      "modal.patientName": "Patient Name",
      "modal.patientNamePlaceholder": "Full Name",
      "modal.phone": "Mobile Phone",
      "modal.phonePlaceholder": "10-digit number",
      "modal.preferredDate": "Preferred Date",
      "modal.preferredTime": "Preferred Time",
      "modal.healthConcern": "Health Concern / Symptoms",
      "modal.concernPlaceholder": "Briefly describe what you are experiencing...",
      "modal.confirmBooking": "Confirm Appointment",
      "modal.confirmedTitle": "Consultation Booking Confirmed!",
      "modal.confirmedDesc": "Your appointment has been registered. A reminder SMS has been sent to your phone.",
      "modal.done": "Done & Return",
      "modal.ref": "Appointment Reference:",
      "modal.doctor": "Doctor:",
      "modal.patient": "Patient:",
      "modal.slot": "Slot:",
      "modal.concern": "Concern:",
      "toast.themeSwitch": "Switched to {{theme}} Mode",
      "toast.langSet": "Language set to {{native}} ({{name}})",
      "toast.geoNotSupported": "Geolocation not supported by browser",
      "toast.recLang": "Recommended language: {{native}} based on {{state}}",
      "toast.geoDeclined": "Location access declined. Manual selection available.",
      "toast.appliedRec": "Applied recommended regional language!",
      "toast.fixFields": "Please review and fix the required registration fields.",
      "toast.welcomeProfile": "Welcome, {{name}}! Your profile has been saved.",
      "toast.addedSymptom": "Added \"{{val}}\" to symptoms",
      "toast.assessmentSaved": "Assessment results recorded in your Dashboard!",
      "toast.dialing108": "Dialing National Ambulance Helpline 108...",
      "toast.filtersReset": "Filters reset",
      "toast.provideBookingDetails": "Please provide patient name, phone number, and appointment date.",
      "toast.slotConfirmed": "Consultation slot confirmed!",
      "toast.listeningStart": "Listening... Speak now",
      "toast.transcriptCleared": "Transcript cleared",
      "toast.transcriptCopied": "Transcript copied to clipboard!",
      "toast.noTranscriptCopy": "No speech transcript to copy.",
      "toast.typeFirstRead": "Please transcribe or type text first to read aloud.",
      "toast.readingAloud": "Reading aloud...",
      "toast.ttsUnsupported": "Text-to-speech is unsupported in this browser.",
      "toast.noTranscriptInsert": "No speech transcript captured yet. Please speak or type your symptoms first.",
      "toast.transcriptInserted": "Speech transcript inserted into Health Assessment Step 3!",
      "toast.voiceActivated": "Voice assistant activated. Speak your symptoms and click 'Use in Assessment'!"
    },
    hi: {
      docTitle: "स्वास्थ्य सेतु — बहुभाषी स्वास्थ्य सेवा सुलभता",
      skipLink: "मुख्य सामग्री पर जाएं",
      "nav.home": "होम",
      "nav.assessment": "स्वास्थ्य जाँच",
      "nav.doctors": "डॉक्टर",
      "nav.voice": "वॉयस असिस्टेंट",
      "nav.dashboard": "डैशबोर्ड",
      "nav.changeLanguage": "भाषा बदलें",
      "nav.toggleTheme": "थीम बदलें",
      "nav.toggleMenu": "मेनू खोलें",
      "nav.backToTop": "ऊपर जाएं",
      "home.heroBadge": "सत्यापित स्वास्थ्य सेवा पहल",
      "home.heroTitle": "आपकी अपनी मातृभाषा में सुलभ स्वास्थ्य सेवा",
      "home.heroDesc": "भारत के ग्रामीण और शहरी क्षेत्रों के मरीजों को 9 भारतीय भाषाओं में डॉक्टरों, एआई प्रारंभिक स्वास्थ्य मूल्यांकन और वॉयस सहायता से जोड़ना।",
      "home.heroCtaLang": "भाषा चुनें और शुरू करें",
      "home.heroCtaCheck": "त्वरित स्वास्थ्य जाँच",
      "home.trustText": "देश भर में 50,000+ से अधिक ग्रामीण मरीजों को सहायता",
      "home.heroImgTitle": "ग्रामीण मरीज से परामर्श करते डॉक्टर",
      "home.floatDoctorTitle": "सत्यापित डॉक्टर",
      "home.floatDoctorSub": "9 भाषाओं में उपलब्ध",
      "home.floatRatingText": "4.9/5 मरीज संतुष्टि",
      "home.featuresEyebrow": "हर नागरिक के लिए निर्मित",
      "home.featuresTitle": "बिना किसी समझौते के स्वास्थ्य सेवा सुलभता",
      "home.featuresDesc": "विशेष रूप से भाषा की बाधाओं, तकनीकी कठिनाइयों और भौगोलिक दूरी को दूर करने के लिए डिज़ाइन किया गया।",
      "home.f1Title": "9 भारतीय भाषाएं",
      "home.f1Desc": "हिंदी, पंजाबी, तमिल, तेलुगु, कन्नड़, मलयालम, उर्दू, उड़िया और अंग्रेजी में पूर्ण मंच अनुवाद।",
      "home.f1Action": "भाषा चुनें",
      "home.f2Title": "वॉयस असिस्टेंट",
      "home.f2Desc": "अपनी मातृभाषा में अपने माइक पर बोलें और तुरंत टेक्स्ट रूपांतरण पाएं।",
      "home.f2Action": "वॉयस हब खोलें",
      "home.f3Title": "प्रारंभिक स्वास्थ्य जाँच",
      "home.f3Desc": "प्रारंभिक स्वास्थ्य श्रेणीकरण और अनुशंसित विशेषज्ञ देखभाल प्रदान करने वाला लक्षण जांचकर्ता।",
      "home.f3Action": "जाँच शुरू करें",
      "home.f4Title": "सत्यापित डॉक्टर निर्देशिका",
      "home.f4Desc": "अपनी भाषा बोलने वाले सामान्य चिकित्सकों और विशेषज्ञों से जुड़ें।",
      "home.f4Action": "डॉक्टर खोजें",
      "home.impactPatients": "मरीजों की सहायता की गई",
      "home.impactDoctors": "सत्यापित डॉक्टर",
      "home.impactVillages": "गांवों तक पहुंच",
      "home.impactSupport": "आपातकालीन और वॉयस सहायता",
      "home.ruralEyebrow": "ग्रामीण स्वास्थ्य मिशन",
      "home.ruralTitle": "दूरी को कभी भी आपके इलाज में बाधा न बनने दें",
      "home.ruralDesc": "स्वास्थ्य सेतु ग्रामीण प्राथमिक स्वास्थ्य केंद्रों (PHC) और आशा कार्यकर्ताओं को सीधे शहरी बहु-विशेषज्ञ डॉक्टर नेटवर्क से जोड़ता है।",
      "home.r1Title": "टेलीकंसल्टेशन कियोस्क",
      "home.r1Desc": "बुनियादी निदान और टैबलेट इंटरफेस से लैस गांव के केंद्रों में स्थापित।",
      "home.r2Title": "सामुदायिक स्वास्थ्य कार्यकर्ता",
      "home.r2Desc": "वॉयस-सक्षम लक्षण जाँच आशा कार्यकर्ताओं के लिए जमीनी स्तर पर आसान बनाती है।",
      "home.r3Title": "मोबाइल डायग्नोस्टिक यूनिट्स",
      "home.r3Desc": "आपातकालीन और विशेष क्लिनिक यात्राओं के लिए निर्बाध रेफरल मार्ग।",
      "home.ruralCta": "पास के डॉक्टर खोजें",
      "home.ruralImgTitle": "ग्रामीण स्वास्थ्य क्लिनिक",
      "home.ctaTitle": "अपनी भाषा में स्वास्थ्य सेवा का अनुभव करने के लिए तैयार हैं?",
      "home.ctaDesc": "अपना मरीज प्रोफ़ाइल दर्ज करें या अभी एक त्वरित स्वास्थ्य मूल्यांकन शुरू करें।",
      "home.ctaRegister": "मरीज के रूप में पंजीकरण करें",
      "home.ctaVoice": "वॉयस असिस्टेंट का प्रयोग करें",
      "lang.backHome": "होम पर वापस जाएं",
      "lang.eyebrow": "बहुभाषी सुलभता",
      "lang.title": "अपनी पसंदीदा भाषा चुनें",
      "lang.desc": "सभी लक्षणों, डॉक्टर विवरण, मूल्यांकन और वॉयस सुविधाओं का अनुवाद करने के लिए अपनी भाषा चुनें।",
      "lang.locTitle": "क्षेत्रीय भाषा का स्वतः पता लगाएं",
      "lang.locDesc": "अपने राज्य का पता लगाने और अनुशंसित क्षेत्रीय भाषा प्राप्त करने के लिए नीचे क्लिक करें।",
      "lang.recommendedTag": "अनुशंसित:",
      "lang.applyRecommended": "अनुशंसित भाषा लागू करें",
      "lang.detectBtn": "मेरा स्थान खोजें",
      "lang.currentActive": "वर्तमान में सक्रिय:",
      "lang.instantNote": "पूरे पोर्टल पर बदलाव तुरंत लागू होते हैं",
      "lang.continue": "चयनित भाषा के साथ आगे बढ़ें",
      "reg.backHome": "होम पर वापस जाएं",
      "reg.eyebrow": "मरीज की पहचान",
      "reg.title": "अपना मरीज प्रोफ़ाइल पंजीकृत करें",
      "reg.desc": "स्वास्थ्य मूल्यांकन रिकॉर्ड, डॉक्टर अपॉइंटमेंट और मेडिकल इतिहास सहेजने के लिए अपना स्थानीय प्रोफ़ाइल बनाएं।",
      "reg.fullName": "पूरा नाम",
      "reg.fullNamePlaceholder": "उदा. रमेश कुमार",
      "reg.age": "आयु",
      "reg.agePlaceholder": "उदा. 42",
      "reg.gender": "लिंग",
      "reg.selectGender": "-- लिंग चुनें --",
      "reg.genderMale": "पुरुष",
      "reg.genderFemale": "महिला",
      "reg.genderOther": "अन्य / नहीं बताना चाहते",
      "reg.phone": "मोबाइल फोन नंबर",
      "reg.phonePlaceholder": "उदा. 9876543210",
      "reg.city": "शहर / जिला / गांव",
      "reg.cityPlaceholder": "उदा. अमृतसर",
      "reg.state": "राज्य",
      "reg.statePlaceholder": "उदा. पंजाब",
      "reg.emergencyPhone": "आपातकालीन संपर्क नंबर (वैकल्पिक)",
      "reg.emergencyPhonePlaceholder": "उदा. 9123456789",
      "reg.privacyNotice": "आपका स्वास्थ्य डेटा आपके स्थानीय डिवाइस पर निजी रहता है। स्वास्थ्य सेतु आपकी स्पष्ट सहमति के बिना व्यक्तिगत जानकारी साझा नहीं करता है।",
      "reg.saveProfile": "प्रोफ़ाइल सहेजें और डैशबोर्ड खोलें",
      "reg.errFullName": "कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर)।",
      "reg.errAge": "कृपया एक वैध आयु दर्ज करें (1 - 120)।",
      "reg.errGender": "कृपया लिंग चुनें।",
      "reg.errPhone": "कृपया एक वैध 10-अंकों का मोबाइल नंबर दर्ज करें।",
      "reg.errCity": "कृपया अपना शहर या गांव दर्ज करें।",
      "reg.errState": "कृपया अपना राज्य दर्ज करें।",
      "dash.editProfile": "प्रोफ़ाइल संपादित करें",
      "dash.welcome": "वापसी पर आपका स्वागत है,",
      "dash.desc": "अपने व्यक्तिगत स्वास्थ्य पोर्टल, प्राथमिक मूल्यांकन इतिहास और प्रत्यक्ष डॉक्टर परामर्श तक पहुंचें।",
      "dash.activeCheck": "सक्रिय जाँच",
      "dash.quickAssessment": "स्वास्थ्य मूल्यांकन",
      "dash.quickAssessmentDesc": "लक्षणों की जाँच करें, गंभीरता का विश्लेषण करें और तत्काल प्राथमिक देखभाल मार्गदर्शन प्राप्त करें।",
      "dash.startNow": "अभी शुरू करें",
      "dash.doctorsAvailable": "1,200+ उपलब्ध",
      "dash.consultDoctor": "डॉक्टर से परामर्श लें",
      "dash.consultDoctorDesc": "मातृभाषा, विशेषता, स्थान और शुल्क संरचना के आधार पर डॉक्टरों को फ़िल्टर करें।",
      "dash.browseDirectory": "निर्देशिका ब्राउज़ करें",
      "dash.voiceAssisted": "वॉयस सहायता प्राप्त",
      "dash.voiceAssistant": "वॉयस असिस्टेंट",
      "dash.voiceAssistantDesc": "अपनी बोली में लक्षण बोलें और ऑडियो को सीधे टेक्स्ट में बदलें।",
      "dash.openVoiceHub": "वॉयस हब खोलें",
      "dash.languagesCount": "9 भाषाएं",
      "dash.changeLanguage": "भाषा सेटिंग्स",
      "dash.changeLanguageDesc": "साइट की बोली बदलें या किसी भी समय क्षेत्रीय ऑटो-डिटेक्शन सक्षम करें।",
      "dash.switchLanguage": "भाषा बदलें",
      "dash.recentAssessmentTitle": "हालिया स्वास्थ्य मूल्यांकन",
      "dash.emergencyHelplines": "आपातकालीन हेल्पलाइन",
      "dash.nationalAmbulance": "राष्ट्रीय एम्बुलेंस सेवा",
      "dash.medicalHelpline": "राज्य चिकित्सा हेल्पलाइन",
      "dash.womenChildHelpline": "महिला एवं बाल आपातकालीन",
      "dash.noAssessmentYet": "अभी तक इस डिवाइस पर कोई स्वास्थ्य मूल्यांकन दर्ज नहीं किया गया है।",
      "dash.takeAssessment": "प्रारंभिक मूल्यांकन लें",
      "dash.assessmentDate": "मूल्यांकन तिथि:",
      "dash.reportedSymptoms": "बताए गए लक्षण:",
      "dash.severityDuration": "गंभीरता और अवधि:",
      "dash.triageRec": "ट्राइएज सिफारिश:",
      "dash.retakeAssessment": "पुनः मूल्यांकन लें",
      "dash.consultDoctorBtn": "डॉक्टर से परामर्श लें",
      "dash.valuedPatient": "प्रिय मरीज",
      "dash.guestProfile": "अतिथि मरीज प्रोफ़ाइल",
      "dash.guestDetails": "अपनी स्वास्थ्य यात्रा को निजीकृत करने के लिए कृपया अपना पंजीकरण पूरा करें।",
      "dash.activeLangPrefix": "सक्रिय भाषा:",
      "assess.backHome": "होम पर वापस जाएं",
      "assess.eyebrow": "प्रारंभिक देखभाल ट्राइएज",
      "assess.title": "लक्षण मूल्यांकन विज़ार्ड",
      "assess.desc": "अपनी भाषा में अपने स्वास्थ्य के लक्षणों का वर्णन करने के लिए इन त्वरित चरणों का पालन करें।",
      "assess.step1": "लक्षण",
      "assess.step2": "अवधि और गंभीरता",
      "assess.step3": "नोट्स / वॉयस",
      "assess.step4": "परिणाम",
      "assess.pane1Title": "प्राथमिक लक्षण चुनें",
      "assess.pane1Desc": "उन सभी लक्षणों पर टैप करें जिन्हें आप वर्तमान में महसूस कर रहे हैं:",
      "assess.symFever": "बुखार / शरीर का तापमान",
      "assess.symCough": "खांसी / सूखी खांसी",
      "assess.symHeadache": "सिरदर्द / सिर का भारीपन",
      "assess.symBreath": "सांस लेने में तकलीफ",
      "assess.symBodyAche": "शरीर और मांसपेशियों में दर्द",
      "assess.symChestPain": "छाती में असुविधा / दर्द",
      "assess.symThroat": "गले में खराश / निगलने में कठिनाई",
      "assess.symStomach": "पेट दर्द / मतली",
      "assess.symFatigue": "अत्यधिक थकान / कमजोरी",
      "assess.customSymptomPlaceholder": "या अतिरिक्त लक्षण टाइप करें (उदा. त्वचा पर चकत्ते)...",
      "assess.addSymptom": "जोड़ें",
      "assess.pane2Title": "अवधि और गंभीरता",
      "assess.durationLabel": "आप कब से इन लक्षणों को महसूस कर रहे हैं?",
      "assess.dur24": "24 घंटे से कम",
      "assess.dur1to3": "1 से 3 दिन",
      "assess.dur4to7": "4 से 7 दिन",
      "assess.dur1week": "1 सप्ताह से अधिक",
      "assess.severityLabel": "गंभीरता का स्तर",
      "assess.sevMildBadge": "हल्का",
      "assess.sevMildTitle": "हल्की असुविधा",
      "assess.sevMildDesc": "नियंत्रण योग्य, दैनिक कार्यों को नहीं रोकता है।",
      "assess.sevModBadge": "मध्यम",
      "assess.sevModTitle": "मध्यम तीव्रता",
      "assess.sevModDesc": "ध्यान देने योग्य परेशानी, सामान्य काम को आंशिक रूप से बाधित करती है।",
      "assess.sevSevereBadge": "गंभीर",
      "assess.sevSevereTitle": "गंभीर / अति आवश्यक",
      "assess.sevSevereDesc": "अत्यधिक असुविधा, तत्काल चिकित्सा परामर्श की आवश्यकता है।",
      "assess.pane3Title": "अतिरिक्त लक्षणों या चिंताओं का वर्णन करें",
      "assess.pane3Desc": "नीचे विवरण टाइप करें, या अपनी मातृभाषा में बोलने के लिए वॉयस असिस्टेंट का उपयोग करें।",
      "assess.pane3Placeholder": "चिकित्सा विवरण या पहले से मौजूद बीमारियां टाइप करें...",
      "assess.voiceShortcutTitle": "टाइप करने के बजाय बोलना पसंद करते हैं?",
      "assess.voiceShortcutDesc": "अपनी चुनी हुई भाषा में वॉयस रिकॉर्डर खोलने के लिए नीचे क्लिक करें।",
      "assess.openVoice": "वॉयस असिस्टेंट खोलें",
      "assess.triageTitle": "ट्राइएज परिणाम:",
      "assess.pane4Title": "प्रारंभिक देखभाल मार्गदर्शन सारांश",
      "assess.emergencyBannerTitle": "तत्काल ध्यान देने की सिफारिश की जाती है",
      "assess.emergencyBannerDesc": "आपने गंभीर लक्षण या छाती में तकलीफ का संकेत दिया है। कृपया तुरंत डॉक्टर से संपर्क करें या 108 पर कॉल करें।",
      "assess.reportedSymptoms": "बताए गए लक्षण:",
      "assess.durationSeverity": "अवधि और गंभीरता:",
      "assess.recommendedSpecialty": "अनुशंसित विशेषज्ञता:",
      "assess.preliminaryAdvice": "प्रारंभिक सलाह और अगले कदम",
      "assess.summaryGuidanceFallback": "पर्याप्त आराम करें, गर्म तरल पदार्थ पिएं और यदि बुखार 101°F से अधिक हो तो डॉक्टर से सलाह लें।",
      "assess.aiGenerating": "एआई-सहायता प्राप्त स्वास्थ्य सिफारिशें तैयार की जा रही हैं...",
      "assess.btnPrevious": "पिछला",
      "assess.btnNext": "अगला कदम",
      "assess.btnDoneSave": "पूर्ण और सहेजें",
      "doc.eyebrow": "बहुभाषी चिकित्सा दल",
      "doc.title": "सत्यापित डॉक्टर निर्देशिका",
      "doc.desc": "अपनी भाषा बोलने वाले सत्यापित डॉक्टरों से परामर्श करने के लिए विशेषज्ञता, भाषा और स्थान के आधार पर फ़िल्टर करें।",
      "doc.searchLabel": "डॉक्टर का नाम खोजें",
      "doc.searchPlaceholder": "उदा. डॉ. अंजलि राव या सामान्य चिकित्सक...",
      "doc.specialtyLabel": "विशेषज्ञता",
      "doc.allSpecialties": "सभी विशेषज्ञताएं",
      "doc.specGeneral": "सामान्य चिकित्सक",
      "doc.specCardiologist": "हृदय रोग विशेषज्ञ",
      "doc.specDermatologist": "त्वचा विशेषज्ञ",
      "doc.specPediatrician": "बाल रोग विशेषज्ञ",
      "doc.specOrthopedic": "हड्डी रोग विशेषज्ञ",
      "doc.specMental": "मानसिक स्वास्थ्य विशेषज्ञ",
      "doc.specGynecologist": "स्त्री रोग विशेषज्ञ",
      "doc.specENT": "ईएनटी विशेषज्ञ",
      "doc.cityLabel": "शहर / क्षेत्र",
      "doc.allLocations": "सभी शहर",
      "doc.spokenLanguageLabel": "बोली जाने वाली भाषा",
      "doc.allSpokenLanguages": "सभी भाषाएं",
      "doc.resetFilters": "फ़िल्टर रीसेट करें",
      "doc.catAll": "सभी डॉक्टर",
      "doc.catGeneral": "सामान्य चिकित्सक",
      "doc.catSpecialists": "विशेषज्ञ",
      "doc.catEmergency": "आपातकालीन देखभाल",
      "doc.verified": "सत्यापित",
      "doc.expYears": "{{years}} वर्षों का अनुभव",
      "doc.bookVisit": "अपॉइंटमेंट बुक करें",
      "doc.noResults": "आपके सटीक फ़िल्टर मानदंडों से मेल खाने वाले कोई भी सत्यापित डॉक्टर नहीं मिले।",
      "voice.backHome": "होम पर वापस जाएं",
      "voice.eyebrow": "वॉयस-टू-टेक्स्ट वाक् पहचान",
      "voice.title": "वॉयस-टू-टेक्स्ट स्वास्थ्य सहायक",
      "voice.desc": "अपनी मातृभाषा में अपने माइक्रोफ़ोन में बोलें। हमारा सहायक लक्षण जाँच के लिए बोली को टेक्स्ट में बदलता है।",
      "voice.recognitionLanguage": "पहचान की भाषा:",
      "voice.changeLanguage": "बदलें",
      "voice.toggleMic": "माइक चालू/बंद करें",
      "voice.statusReady": "माइक्रोफ़ोन बटन पर क्लिक करें और अपने लक्षण बताएं...",
      "voice.statusListening": "{{lang}} में सुन रहे हैं... कृपया अब अपने माइक्रोफ़ोन में बोलें।",
      "voice.statusProcessing": "आवाज का पता चला, प्रक्रिया जारी है...",
      "voice.statusError": "वाक् पहचान सूचना: {{error}}। पुनः प्रयास करने के लिए माइक पर क्लिक करें।",
      "voice.statusCaptured": "आवाज रिकॉर्ड की गई! किसी भी समय बोलना जारी रखने के लिए माइक पर क्लिक करें।",
      "voice.capturedTranscript": "रिकॉर्ड किया गया पाठ",
      "voice.wordCount": "{{count}} शब्द",
      "voice.transcriptPlaceholder": "आपका बोला गया पाठ स्वचालित रूप से यहां दिखाई देगा... आप मैन्युअल रूप से भी टाइप या संपादित कर सकते हैं।",
      "voice.clear": "साफ़ करें",
      "voice.copy": "टेक्स्ट कॉपी करें",
      "voice.readAloud": "बोलकर सुनाएं",
      "voice.useInAssessment": "स्वास्थ्य जाँच में उपयोग करें",
      "voice.browserUnsupported": "इस ब्राउज़र पर वाक् पहचान पूरी तरह से समर्थित नहीं है। आप सीधे ऊपर दिए गए बॉक्स में टाइप कर सकते हैं।",
      "modal.close": "मोडाल बंद करें",
      "modal.title": "डॉक्टर परामर्श बुक करें",
      "modal.desc": "अपनी पसंदीदा भाषा में टेलीकंसल्टेशन या ओपीडी अपॉइंटमेंट का समय निर्धारित करें।",
      "modal.selectDoctor": "डॉक्टर चुनें",
      "modal.patientName": "मरीज का नाम",
      "modal.patientNamePlaceholder": "पूरा नाम",
      "modal.phone": "मोबाइल नंबर",
      "modal.phonePlaceholder": "10-अंकों का नंबर",
      "modal.preferredDate": "पसंदीदा तिथि",
      "modal.preferredTime": "पसंदीदा समय",
      "modal.healthConcern": "स्वास्थ्य समस्या / लक्षण",
      "modal.concernPlaceholder": "संक्षेप में बताएं कि आप क्या अनुभव कर रहे हैं...",
      "modal.confirmBooking": "अपॉइंटमेंट की पुष्टि करें",
      "modal.confirmedTitle": "परामर्श बुकिंग की पुष्टि हो गई!",
      "modal.confirmedDesc": "आपकी अपॉइंटमेंट दर्ज कर ली गई है। आपके फोन पर एक रिमाइंडर एसएमएस भेजा गया है।",
      "modal.done": "पूर्ण और वापस जाएं",
      "modal.ref": "अपॉइंटमेंट संदर्भ:",
      "modal.doctor": "डॉक्टर:",
      "modal.patient": "मरीज:",
      "modal.slot": "समय:",
      "modal.concern": "चिंता:",
      "toast.themeSwitch": "{{theme}} मोड चालू किया गया",
      "toast.langSet": "भाषा सेट की गई: {{native}} ({{name}})",
      "toast.geoNotSupported": "ब्राउज़र द्वारा जियोलोकेशन समर्थित नहीं है",
      "toast.recLang": "अनुशंसित भाषा: {{state}} के आधार पर {{native}}",
      "toast.geoDeclined": "स्थान पहुंच अस्वीकृत। मैन्युअल चयन उपलब्ध है।",
      "toast.appliedRec": "अनुशंसित क्षेत्रीय भाषा लागू की गई!",
      "toast.fixFields": "कृपया आवश्यक पंजीकरण फ़ील्ड की समीक्षा करें और ठीक करें।",
      "toast.welcomeProfile": "स्वागत है, {{name}}! आपका प्रोफ़ाइल सहेज लिया गया है।",
      "toast.addedSymptom": "लक्षणों में \"{{val}}\" जोड़ा गया",
      "toast.assessmentSaved": "मूल्यांकन परिणाम आपके डैशबोर्ड में दर्ज किए गए!",
      "toast.dialing108": "राष्ट्रीय एम्बुलेंस हेल्पलाइन 108 को कॉल किया जा रहा है...",
      "toast.filtersReset": "फ़िल्टर रीसेट किए गए",
      "toast.provideBookingDetails": "कृपया मरीज का नाम, फोन नंबर और तिथि प्रदान करें।",
      "toast.slotConfirmed": "परामर्श स्लॉट की पुष्टि हो गई!",
      "toast.listeningStart": "सुन रहे हैं... अब बोलें",
      "toast.transcriptCleared": "पाठ साफ़ किया गया",
      "toast.transcriptCopied": "पाठ क्लिपबोर्ड पर कॉपी किया गया!",
      "toast.noTranscriptCopy": "कॉपी करने के लिए कोई पाठ नहीं है।",
      "toast.typeFirstRead": "बोलकर सुनाने के लिए पहले टेक्स्ट लिखें या ट्रांसक्राइब करें।",
      "toast.readingAloud": "पढ़कर सुनाया जा रहा है...",
      "toast.ttsUnsupported": "इस ब्राउज़र में टेक्स्ट-टू-स्पीच असमर्थित है।",
      "toast.noTranscriptInsert": "अभी तक कोई वॉयस टेक्स्ट रिकॉर्ड नहीं हुआ है। कृपया पहले अपने लक्षण बोलें या लिखें।",
      "toast.transcriptInserted": "स्वास्थ्य मूल्यांकन के चरण 3 में वॉयस पाठ शामिल किया गया!",
      "toast.voiceActivated": "वॉयस असिस्टेंट सक्रिय। अपने लक्षण बोलें और 'स्वास्थ्य जाँच में उपयोग करें' पर क्लिक करें!"
    }
  };

  /* Fallback unconfigured languages to English */
  ["pa", "ta", "te", "kn", "ml", "ur", "or"].forEach(lang => {
    TRANSLATIONS[lang] = TRANSLATIONS.en;
  });

  /* Mock Doctors Dataset */
  const DOCTORS_DATA = [
    { id: "doc1", name: "Dr. Anjali Rao", specialty: "General Physician", city: "Amritsar", state: "Punjab", languages: ["en", "hi", "pa"], experience: 12, fee: 300, rating: 4.9, avatar: "👩‍⚕️" },
    { id: "doc2", name: "Dr. Rajesh Sharma", specialty: "Cardiologist", city: "Jaipur", state: "Rajasthan", languages: ["en", "hi"], experience: 18, fee: 700, rating: 4.8, avatar: "👨‍⚕️" },
    { id: "doc3", name: "Dr. K. V. Ramanathan", specialty: "General Physician", city: "Madurai", state: "Tamil Nadu", languages: ["en", "ta"], experience: 15, fee: 400, rating: 4.9, avatar: "👨‍⚕️" },
    { id: "doc4", name: "Dr. Sunitha Reddy", specialty: "Gynecologist", city: "Vijayawada", state: "Andhra Pradesh", languages: ["en", "te"], experience: 10, fee: 500, rating: 4.7, avatar: "👩‍⚕️" },
    { id: "doc5", name: "Dr. Suresh Gowda", specialty: "Orthopedic Specialist", city: "Mysuru", state: "Karnataka", languages: ["en", "kn"], experience: 14, fee: 600, rating: 4.8, avatar: "👨‍⚕️" },
    { id: "doc6", name: "Dr. Parvathy Nair", specialty: "Pediatrician", city: "Kochi", state: "Kerala", languages: ["en", "ml"], experience: 8, fee: 350, rating: 4.9, avatar: "👩‍⚕️" },
    { id: "doc7", name: "Dr. Tariq Ahmed", specialty: "ENT Specialist", city: "Lucknow", state: "Uttar Pradesh", languages: ["en", "hi", "ur"], experience: 11, fee: 450, rating: 4.6, avatar: "👨‍⚕️" },
    { id: "doc8", name: "Dr. Biplab Mohanty", specialty: "Dermatologist", city: "Cuttack", state: "Odisha", languages: ["en", "or"], experience: 9, fee: 400, rating: 4.7, avatar: "👨‍⚕️" }
  ];

  /* -------------------------------------------------------------------------
     2. CORE HELPER FUNCTIONS & LOCAL STORAGE
     ------------------------------------------------------------------------- */
  function getTranslation(key, placeholders = {}) {
    const dict = TRANSLATIONS[APP_STATE.selectedLanguage] || TRANSLATIONS.en;
    let text = dict[key] || TRANSLATIONS.en[key] || key;
    Object.keys(placeholders).forEach(p => {
      text = text.replace(new RegExp(`{{${p}}}`, "g"), placeholders[p]);
    });
    return text;
  }

  function saveStateToStorage() {
    try {
      localStorage.setItem("swastya_state", JSON.stringify({
        selectedLanguage: APP_STATE.selectedLanguage,
        currentTheme: APP_STATE.currentTheme,
        patientProfile: APP_STATE.patientProfile,
        lastAssessment: APP_STATE.lastAssessment
      }));
    } catch (e) {
      console.warn("LocalStorage access restricted or unavailable.", e);
    }
  }

  function loadStateFromStorage() {
    try {
      const saved = localStorage.getItem("swastya_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedLanguage) APP_STATE.selectedLanguage = parsed.selectedLanguage;
        if (parsed.currentTheme) APP_STATE.currentTheme = parsed.currentTheme;
        if (parsed.patientProfile) APP_STATE.patientProfile = parsed.patientProfile;
        if (parsed.lastAssessment) APP_STATE.lastAssessment = parsed.lastAssessment;
      }
    } catch (e) {
      console.warn("Failed to read LocalStorage.", e);
    }
  }

  function showToast(msg) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.setAttribute("aria-live", "polite");
      container.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.style.cssText = "background:var(--card-bg, #1e293b);color:#fff;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-size:0.9rem;border-left:4px solid #10b981;transition:all 0.3s ease;";
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /* -------------------------------------------------------------------------
     3. TRANSLATION ENGINE & UI UPDATE
     ------------------------------------------------------------------------- */
  function applyLanguage(langCode) {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === langCode)) langCode = "en";
    APP_STATE.selectedLanguage = langCode;
    document.documentElement.lang = langCode;
    document.documentElement.dir = langCode === "ur" ? "rtl" : "ltr";

    const langMeta = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (langMeta) {
      const nativeLabel = langMeta.native || langMeta.name;
      const nav = document.getElementById("navLangLabel");
      const active = document.getElementById("activeLangDisplay");
      const dash = document.getElementById("dashProfileLang");
      const voice = document.getElementById("voiceActiveLangText");
      if (nav) nav.textContent = nativeLabel;
      if (active) active.textContent = `${nativeLabel} (${langMeta.name})`;
      if (dash) dash.textContent = `Language: ${nativeLabel}`;
      if (voice) voice.textContent = `${langMeta.name} (${langMeta.locale})`;
    }

    // Translate DOM elements marked with data-i18n
    document.querySelectorAll("[data-i18n]").forEach(elem => {
      const key = elem.getAttribute("data-i18n");
      elem.textContent = getTranslation(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(elem => {
      const key = elem.getAttribute("data-i18n-placeholder");
      elem.placeholder = getTranslation(key);
    });

    // Update document title
    document.title = getTranslation("docTitle");

    saveStateToStorage();
    renderCurrentScreen();

    // Bridge to the rebuilt full-page translation engine.
    if (typeof window.applySiteLanguage === "function") {
      window.applySiteLanguage(langCode, { persist: false });
      setTimeout(() => window.applySiteLanguage(langCode, { persist: false }), 0);
    }
  }

  function toggleTheme(theme = null) {
    const nextTheme = theme || (APP_STATE.currentTheme === "light" ? "dark" : "light");
    APP_STATE.currentTheme = nextTheme;
    document.body.setAttribute("data-theme", nextTheme);
    saveStateToStorage();
    showToast(getTranslation("toast.themeSwitch", { theme: nextTheme.toUpperCase() }));
  }

  /* -------------------------------------------------------------------------
     4. NAVIGATION & SCREEN CONTROLLER
     ------------------------------------------------------------------------- */
  function navigateTo(screenId) {
    APP_STATE.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update UI navigation active indicators
    document.querySelectorAll(".nav-link").forEach(btn => {
      if (btn.getAttribute("data-target") === screenId) {
        btn.classList.add("active");
        btn.setAttribute("aria-current", "page");
      } else {
        btn.classList.remove("active");
        btn.removeAttribute("aria-current");
      }
    });

    renderCurrentScreen();
  }

  function renderCurrentScreen() {
    const screens = ["home", "language", "register", "dashboard", "assessment", "doctors", "voice"];
    screens.forEach(s => {
      const el = document.getElementById(`screen-${s}`);
      if (el) el.style.display = (s === APP_STATE.currentScreen) ? "block" : "none";
    });

    switch (APP_STATE.currentScreen) {
      case "dashboard":
        renderDashboard();
        break;
      case "doctors":
        renderDoctorsList();
        break;
      case "assessment":
        renderAssessmentStep(APP_STATE.assessmentDraft.step);
        break;
      case "language":
        renderLanguageScreen();
        break;
    }
  }

  /* -------------------------------------------------------------------------
     5. MODULE HANDLERS (LOCATION, ASSESSMENT, VOICE, DOCTORS)
     ------------------------------------------------------------------------- */
  function autoDetectLocation() {
    if (!("geolocation" in navigator)) {
      showToast(getTranslation("toast.geoNotSupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const mockStates = ["Punjab", "Tamil Nadu", "Andhra Pradesh", "Karnataka", "Kerala", "Odisha"];
        const detectedState = mockStates[Math.floor(Math.random() * mockStates.length)];
        APP_STATE.detectedLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, state: detectedState };
        
        let recLang = "hi";
        if (detectedState === "Punjab") recLang = "pa";
        else if (detectedState === "Tamil Nadu") recLang = "ta";
        else if (detectedState === "Andhra Pradesh") recLang = "te";
        else if (detectedState === "Karnataka") recLang = "kn";
        else if (detectedState === "Kerala") recLang = "ml";
        else if (detectedState === "Odisha") recLang = "or";

        const langObj = SUPPORTED_LANGUAGES.find(l => l.code === recLang);
        showToast(getTranslation("toast.recLang", { native: langObj.native, state: detectedState }));
        
        const recBanner = document.getElementById("locationRecResult");
        if (recBanner) {
          recBanner.hidden = false;
          const tag = document.getElementById("recommendedLangTag");
          if (tag) tag.textContent = `${langObj.native} (${langObj.name})`;
          document.getElementById("applyRecommendedLangBtn")?.addEventListener("click", () => {
            applyLanguage(recLang);
            showToast(getTranslation("toast.appliedRec"));
          });
        }
      },
      () => showToast(getTranslation("toast.geoDeclined"))
    );
  }

  function renderLanguageScreen() {
    const grid = document.getElementById("languageCardsGrid");
    if (!grid) return;
    grid.innerHTML = "";
    SUPPORTED_LANGUAGES.forEach(lang => {
      const isSelected = APP_STATE.selectedLanguage === lang.code;
      const card = document.createElement("div");
      card.className = `language-card ${isSelected ? "active" : ""}`;
      card.style.cssText = "border:2px solid " + (isSelected ? "var(--primary, #0284c7)" : "#e2e8f0") + ";padding:16px;border-radius:12px;cursor:pointer;background:var(--card-bg, #fff);transition:all 0.2s;";
      card.innerHTML = `
        <h3 style="margin:0;font-size:1.2rem;">${lang.native}</h3>
        <p style="margin:4px 0;color:#64748b;">${lang.name}</p>
        <small style="color:#94a3b8;">${lang.region}</small>
      `;
      card.addEventListener("click", () => {
        applyLanguage(lang.code);
        showToast(getTranslation("toast.langSet", { native: lang.native, name: lang.name }));
      });
      grid.appendChild(card);
    });
  }

  function renderDashboard() {
    const profile = APP_STATE.patientProfile;
    const welcomeTitle = document.getElementById("dashWelcomeTitle");
    const profileCard = document.getElementById("dashProfileCard");

    if (welcomeTitle) {
      welcomeTitle.textContent = profile ? `${getTranslation("dash.welcome")} ${profile.fullName}` : getTranslation("dash.guestProfile");
    }

    if (profileCard) {
      if (profile) {
        profileCard.innerHTML = `
          <h4>${profile.fullName} (${profile.age} yrs, ${profile.gender})</h4>
          <p>📍 ${profile.city}, ${profile.state} | 📞 ${profile.phone}</p>
        `;
      } else {
        profileCard.innerHTML = `<p>${getTranslation("dash.guestDetails")}</p><button class="btn btn-secondary" id="dashRegisterBtn">${getTranslation("home.ctaRegister")}</button>`;
        document.getElementById("dashRegisterBtn")?.addEventListener("click", () => navigateTo("register"));
      }
    }

    const lastAssessContainer = document.getElementById("dashLastAssessment");
    if (lastAssessContainer) {
      const last = APP_STATE.lastAssessment;
      if (last) {
        lastAssessContainer.innerHTML = `
          <div class="assessment-summary-card" style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;">
            <p><strong>${getTranslation("dash.assessmentDate")}</strong> ${new Date(last.timestamp).toLocaleDateString()}</p>
            <p><strong>${getTranslation("dash.reportedSymptoms")}</strong> ${last.symptoms.join(", ")}</p>
            <p><strong>${getTranslation("dash.severityDuration")}</strong> ${last.severity} (${last.duration})</p>
            <p><strong>${getTranslation("dash.triageRec")}</strong> ${last.recommendation}</p>
          </div>
        `;
      } else {
        lastAssessContainer.innerHTML = `<p>${getTranslation("dash.noAssessmentYet")}</p>`;
      }
    }
  }

  function renderAssessmentStep(step) {
    APP_STATE.assessmentDraft.step = step;
    for (let i = 1; i <= 4; i++) {
      const pane = document.getElementById(`assessPane${i}`);
      if (pane) pane.style.display = (i === step) ? "block" : "none";
    }

    if (step === 4) {
      calculateAssessmentResults();
    }
  }

  function calculateAssessmentResults() {
    const draft = APP_STATE.assessmentDraft;
    const isSevere = draft.severity === "Severe" || draft.symptoms.includes("Chest Discomfort / Pain") || draft.symptoms.includes("Shortness of Breath");
    
    let recommendation = "General Consultation recommended.";
    let specialty = "General Physician";

    if (isSevere) {
      recommendation = "Immediate Emergency Attention Advisable!";
      specialty = draft.symptoms.includes("Chest Discomfort / Pain") ? "Cardiologist" : "Emergency Care Specialist";
    } else if (draft.symptoms.includes("Fever / Body Heat")) {
      specialty = "General Physician";
    }

    const recContainer = document.getElementById("assessResultContainer");
    if (recContainer) {
      recContainer.innerHTML = `
        <div class="result-banner ${isSevere ? 'danger' : 'success'}" style="padding:16px;border-radius:8px;background:${isSevere ? '#fef2f2' : '#f0fdf4'};border:1px solid ${isSevere ? '#fca5a5' : '#86efac'};margin-bottom:16px;">
          <h3 style="color:${isSevere ? '#991b1b' : '#166534'};margin-top:0;">${isSevere ? getTranslation("assess.emergencyBannerTitle") : getTranslation("assess.pane4Title")}</h3>
          <p>${isSevere ? getTranslation("assess.emergencyBannerDesc") : recommendation}</p>
        </div>
        <p><strong>${getTranslation("assess.reportedSymptoms")}</strong> ${draft.symptoms.concat(draft.customSymptoms).join(", ")}</p>
        <p><strong>${getTranslation("assess.durationSeverity")}</strong> ${draft.duration} | ${draft.severity}</p>
        <p><strong>${getTranslation("assess.recommendedSpecialty")}</strong> ${specialty}</p>
      `;
    }

    APP_STATE.lastAssessment = {
      timestamp: new Date().toISOString(),
      symptoms: draft.symptoms.concat(draft.customSymptoms),
      duration: draft.duration,
      severity: draft.severity,
      recommendation: recommendation,
      specialty: specialty
    };
    saveStateToStorage();
  }

  function renderDoctorsList() {
    const container = document.getElementById("doctorsCardsGrid");
    if (!container) return;

    const query = (document.getElementById("docSearchInput")?.value || "").toLowerCase();
    const specialty = document.getElementById("docSpecialtySelect")?.value || "ALL";

    const filtered = DOCTORS_DATA.filter(doc => {
      const matchName = doc.name.toLowerCase().includes(query) || doc.specialty.toLowerCase().includes(query);
      const matchSpec = specialty === "ALL" || doc.specialty === specialty;
      return matchName && matchSpec;
    });

    container.innerHTML = "";
    if (filtered.length === 0) {
      container.innerHTML = `<p>${getTranslation("doc.noResults")}</p>`;
      return;
    }

    filtered.forEach(doc => {
      const card = document.createElement("div");
      card.className = "doctor-card";
      card.style.cssText = "border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:var(--card-bg,#fff);display:flex;gap:16px;align-items:center;";
      card.innerHTML = `
        <div style="font-size:3rem;">${doc.avatar}</div>
        <div style="flex:1;">
          <h3 style="margin:0 0 4px 0;">${doc.name} <span style="font-size:0.8rem;background:#dcfce7;color:#166534;padding:2px 6px;border-radius:4px;">${getTranslation("doc.verified")}</span></h3>
          <p style="margin:0 0 4px 0;color:#64748b;">${doc.specialty} • ${getTranslation("doc.expYears", { years: doc.experience })}</p>
          <p style="margin:0;font-size:0.85rem;color:#94a3b8;">📍 ${doc.city}, ${doc.state} | 💬 ${doc.languages.join(", ").toUpperCase()}</p>
        </div>
        <div>
          <button class="btn btn-primary book-doctor-btn" data-doc-id="${doc.id}">${getTranslation("doc.bookVisit")}</button>
        </div>
      `;
      container.appendChild(card);
    });

    document.querySelectorAll(".book-doctor-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const docId = e.target.getAttribute("data-doc-id");
        openBookingModal(docId);
      });
    });
  }

  function openBookingModal(docId) {
    const doc = DOCTORS_DATA.find(d => d.id === docId);
    const modal = document.getElementById("bookingModal");
    if (!modal) return;
    
    document.getElementById("modalDocName").textContent = doc ? doc.name : "";
    modal.style.display = "flex";
  }

  /* -------------------------------------------------------------------------
     6. VOICE ASSISTANT ENGINE (SPEECH RECOGNITION & TTS)
     ------------------------------------------------------------------------- */
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(getTranslation("voice.browserUnsupported"));
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      APP_STATE.isListening = true;
      updateVoiceUI("listening");
      showToast(getTranslation("toast.listeningStart"));
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const transcriptBox = document.getElementById("voiceTranscriptBox");
      if (transcriptBox) {
        transcriptBox.value = transcriptBox.value ? `${transcriptBox.value} ${transcript}` : transcript;
      }
      updateVoiceUI("captured");
    };

    recognition.onerror = (event) => {
      APP_STATE.isListening = false;
      updateVoiceUI("error", event.error);
    };

    recognition.onend = () => {
      APP_STATE.isListening = false;
      updateVoiceUI("ready");
    };

    return recognition;
  }

  function updateVoiceUI(status, errorMsg = "") {
    const statusLabel = document.getElementById("voiceStatusLabel");
    if (!statusLabel) return;

    const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === APP_STATE.selectedLanguage);

    switch (status) {
      case "listening":
        statusLabel.textContent = getTranslation("voice.statusListening", { lang: currentLangObj.name });
        break;
      case "captured":
        statusLabel.textContent = getTranslation("voice.statusCaptured");
        break;
      case "error":
        statusLabel.textContent = getTranslation("voice.statusError", { error: errorMsg });
        break;
      default:
        statusLabel.textContent = getTranslation("voice.statusReady");
        break;
    }
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) {
      showToast(getTranslation("toast.ttsUnsupported"));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === APP_STATE.selectedLanguage);
    utterance.lang = currentLangObj ? currentLangObj.locale : "en-IN";
    window.speechSynthesis.speak(utterance);
    showToast(getTranslation("toast.readingAloud"));
  }

  /* -------------------------------------------------------------------------
     7. INITIALIZATION & EVENT BINDINGS
     ------------------------------------------------------------------------- */
  function bindEvents() {
    // Navigation listeners
    document.querySelectorAll("[data-target]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = btn.getAttribute("data-target");
        navigateTo(target);
      });
    });

    // Theme toggle
    document.getElementById("themeToggleBtn")?.addEventListener("click", () => toggleTheme());

    // Auto detect location button
    document.getElementById("detectLocationBtn")?.addEventListener("click", autoDetectLocation);

    // Registration Form Submit
    document.getElementById("patientRegistrationForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullName = document.getElementById("regFullName").value.trim();
      const age = document.getElementById("regAge").value.trim();
      const gender = document.getElementById("regGender").value;
      const phone = document.getElementById("regPhone").value.trim();
      const city = document.getElementById("regCity").value.trim();
      const state = document.getElementById("regState").value.trim();

      if (!fullName || !age || !gender || !phone || !city || !state) {
        showToast(getTranslation("toast.fixFields"));
        return;
      }

      APP_STATE.patientProfile = { fullName, age, gender, phone, city, state };
      saveStateToStorage();
      showToast(getTranslation("toast.welcomeProfile", { name: fullName }));
      navigateTo("dashboard");
    });

    // Assessment step controls
    document.getElementById("assessBtnNext")?.addEventListener("click", () => {
      if (APP_STATE.assessmentDraft.step < 4) {
        renderAssessmentStep(APP_STATE.assessmentDraft.step + 1);
      }
    });

    document.getElementById("assessBtnPrev")?.addEventListener("click", () => {
      if (APP_STATE.assessmentDraft.step > 1) {
        renderAssessmentStep(APP_STATE.assessmentDraft.step - 1);
      }
    });

    document.getElementById("assessBtnSave")?.addEventListener("click", () => {
      showToast(getTranslation("toast.assessmentSaved"));
      navigateTo("dashboard");
    });

    // Voice assistant toggle microphone
    document.getElementById("voiceMicToggleBtn")?.addEventListener("click", () => {
      if (!APP_STATE.speechRecognition) {
        APP_STATE.speechRecognition = initSpeechRecognition();
      }
      if (APP_STATE.speechRecognition) {
        if (APP_STATE.isListening) {
          APP_STATE.speechRecognition.stop();
        } else {
          const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === APP_STATE.selectedLanguage);
          APP_STATE.speechRecognition.lang = currentLangObj ? currentLangObj.locale : "en-IN";
          APP_STATE.speechRecognition.start();
        }
      }
    });

    // Voice actions
    document.getElementById("voiceReadAloudBtn")?.addEventListener("click", () => {
      const text = document.getElementById("voiceTranscriptBox")?.value;
      if (text) speakText(text);
      else showToast(getTranslation("toast.typeFirstRead"));
    });

    document.getElementById("voiceUseInAssessBtn")?.addEventListener("click", () => {
      const text = document.getElementById("voiceTranscriptBox")?.value;
      if (text) {
        APP_STATE.assessmentDraft.notes = text;
        showToast(getTranslation("toast.transcriptInserted"));
        navigateTo("assessment");
        renderAssessmentStep(3);
      } else {
        showToast(getTranslation("toast.noTranscriptInsert"));
      }
    });

    // Doctor filter bindings
    document.getElementById("docSearchInput")?.addEventListener("input", renderDoctorsList);
    document.getElementById("docSpecialtySelect")?.addEventListener("change", renderDoctorsList);

    // Modal Close
    document.getElementById("closeModalBtn")?.addEventListener("click", () => {
      document.getElementById("bookingModal").style.display = "none";
    });
  }

  function initApp() {
    loadStateFromStorage();
    if (APP_STATE.currentTheme) {
      document.body.setAttribute("data-theme", APP_STATE.currentTheme);
    }
    applyLanguage(APP_STATE.selectedLanguage);
    bindEvents();
    navigateTo(APP_STATE.currentScreen);
  }

  // Initialize on DOM load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

})();