import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  doc, setDoc, getDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const IMGBB_KEY = '9716f16445d36094b2e16dd8682fc0c1';

export const Services = {
  // ─── Authentication Services ───
  onAuth(callback) {
    return onAuthStateChanged(auth, callback);
  },

  async login(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (e) {
      const errorMap = {
        'auth/invalid-credential':   'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        'auth/user-not-found':       'لا يوجد حساب بهذا البريد الإلكتروني',
        'auth/wrong-password':       'كلمة المرور غير صحيحة',
        'auth/invalid-email':        'البريد الإلكتروني غير صحيح',
        'auth/too-many-requests':    'محاولات كثيرة خاطئة، يرجى المحاولة لاحقاً',
      };
      throw new Error(errorMap[e.code] || 'حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة ثانية');
    }
  },

  async registerUser(name, username, email, password, code) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanCode = code.trim().toUpperCase();

    // 1. Verify activation code
    const codeSnap = await getDoc(doc(db, 'activationCodes', cleanCode));
    if (!codeSnap.exists()) {
      throw new Error('كود التفعيل غير صحيح');
    }
    const codeData = codeSnap.data();
    if (codeData.isUsed === true) {
      throw new Error('كود التفعيل مستخدم من قبل');
    }

    // 2. Verify username uniqueness
    const takenSnap = await getDoc(doc(db, 'usernames', cleanUsername));
    if (takenSnap.exists()) {
      throw new Error('اسم المستخدم مأخوذ بالفعل، يرجى اختيار اسم آخر');
    }

    // 3. Create Auth user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    try {
      // 4. Update activation code
      await setDoc(doc(db, 'activationCodes', cleanCode), {
        isUsed: true,
        usedBy: uid,
        usedAt: new Date().toISOString()
      }, { merge: true });

      // 5. Create user document
      const defaultProfile = {
        uid,
        username: cleanUsername,
        name,
        email,
        photo: '',
        title: '',
        company: '',
        bio: '',
        mobile: '',
        whatsapp: '',
        publicEmail: '',
        location: '',
        website: '',
        instagram: '',
        linkedin: '',
        tiktok: '',
        twitter: '',
        snapchat: '',
        youtube: '',
        theme: '#7c3aed',
        lang: 'ar',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', uid), defaultProfile);

      // 6. Map username to uid
      await setDoc(doc(db, 'usernames', cleanUsername), { uid });

      return cred.user;
    } catch (dbError) {
      console.error("Firestore initialization error:", dbError);
      throw new Error("تم إنشاء الحساب ولكن حدث خطأ أثناء إعداد مستندات البيانات.");
    }
  },

  async logout() {
    await signOut(auth);
  },

  // ─── User Profile Services ───
  async getUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data();
  },

  async saveUserProfile(uid, data) {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  },

  // ─── Username Mapping ───
  async getUidByUsername(username) {
    const snap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
    if (!snap.exists()) return null;
    return snap.data().uid;
  },

  async reserveUsername(username, uid) {
    const cleanUsername = username.trim().toLowerCase();
    const takenSnap = await getDoc(doc(db, 'usernames', cleanUsername));
    if (takenSnap.exists()) {
      throw new Error('اسم المستخدم مأخوذ بالفعل');
    }
    await setDoc(doc(db, 'usernames', cleanUsername), { uid });
    await setDoc(doc(db, 'users', uid), { username: cleanUsername }, { merge: true });
  },

  // ─── Image Upload Services (ImgBB) ───
  async uploadImage(file) {
    if (!file) throw new Error('يرجى اختيار ملف صورة');
    
    const fd = new FormData();
    fd.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { 
      method: 'POST', 
      body: fd 
    });
    
    const data = await res.json();
    if (!data.success) {
      throw new Error('فشل رفع الصورة من خادم رفع الصور');
    }
    
    return data.data.display_url;
  },

  // ─── Formatting Helpers ───
  formatEgyptianWhatsApp(num) {
    let clean = num.replace(/\D/g, '');
    if (clean.startsWith('0') && clean.length === 11) {
      clean = '20' + clean.substring(1);
    }
    return clean;
  }
};
