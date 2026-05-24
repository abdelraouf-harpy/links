// =====================================================
// Firebase Configuration - Compat Interface
// =====================================================
const firebaseConfig = {
  apiKey: "AIzaSyAAkFTOK9_qYBjENYg5jkpstwMo0I5IWo4",
  authDomain: "harpy-cards.firebaseapp.com",
  projectId: "harpy-cards",
  storageBucket: "harpy-cards.firebasestorage.app",
  messagingSenderId: "33866295550",
  appId: "1:33866295550:web:279151efc02a3d698cddaf"
};

// Initialize Firebase if it hasn't been initialized yet
if (!window.firebase.apps.length) {
  window.firebase.initializeApp(firebaseConfig);
}

export const auth = window.firebase.auth();
export const db   = window.firebase.firestore();
