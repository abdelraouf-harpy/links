// =====================================================
// ⚠️  Firebase Configuration — Placeholder
// =====================================================
// بعد ما تعمل Firebase Project جديد:
// 1. روح Firebase Console → Project Settings
// 2. Your apps → Add app (Web)
// 3. انسخ الـ config والصقه هنا
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAAkFTOK9_qYBjENYg5jkpstwMo0I5IWo4",
  authDomain: "harpy-cards.firebaseapp.com",
  projectId: "harpy-cards",
  storageBucket: "harpy-cards.firebasestorage.app",
  messagingSenderId: "33866295550",
  appId: "1:33866295550:web:279151efc02a3d698cddaf"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
