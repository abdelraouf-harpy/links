// ═══════════════════════════════════════════════════════════
// firebase.js — Firebase Configuration
// ═══════════════════════════════════════════════════════════
// 🔥 للإعداد:
// 1. افتح https://console.firebase.google.com
// 2. أنشئ Project جديد
// 3. أضف Web App
// 4. انسخ الـ config وضعه هنا بدل القيم الموجودة
// 5. فعّل: Authentication > Email/Password
// 6. فعّل: Firestore Database
// 7. فعّل: Storage
// ═══════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }     from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ⚠️ ضع بيانات Firebase Project بتاعك هنا:
const firebaseConfig = {
  apiKey:            "AIzaSyD8Tbp6IcZTOvMB6y9HBScyGlVYrgwdyIk",
  authDomain:        "harpymenu.firebaseapp.com",
  projectId:         "harpymenu",
  storageBucket:     "harpymenu.firebasestorage.app",
  messagingSenderId: "972571790786",
  appId:             "1:972571790786:web:5f295a4b6e0c2b11939a5b",
  measurementId:     "G-LCWLTVSP5C"
};

// ⚠️ ضع مفتاح ImgBB المجاني هنا لرفع الصور بدون الحاجة لفيزا كارد وجوجل ستورج:
const imgbbApiKey = "9716f16445d36094b2e16dd8682fc0c1"; 

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig, imgbbApiKey };
