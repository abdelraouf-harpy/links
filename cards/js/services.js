import { auth, db } from "./firebase-config.js";

const IMGBB_KEY = '9716f16445d36094b2e16dd8682fc0c1';

export const Services = {
  // ─── Authentication Services ───
  onAuth(callback) {
    return auth.onAuthStateChanged(callback);
  },

  async login(email, password) {
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
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
    const codeSnap = await db.collection('activationCodes').doc(cleanCode).get();
    if (!codeSnap.exists) {
      throw new Error('كود التفعيل غير صحيح');
    }
    const codeData = codeSnap.data();
    if (codeData.isUsed === true) {
      throw new Error('كود التفعيل مستخدم من قبل');
    }

    // 2. Verify username uniqueness
    const takenSnap = await db.collection('usernames').doc(cleanUsername).get();
    if (takenSnap.exists) {
      throw new Error('اسم المستخدم مأخوذ بالفعل، يرجى اختيار اسم آخر');
    }

    // 3. Create Auth user
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    try {
      // 4. Update activation code
      await db.collection('activationCodes').doc(cleanCode).set({
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
        facebook: '',
        linkedin: '',
        tiktok: '',
        twitter: '',
        snapchat: '',
        youtube: '',
        theme: '#7c3aed',
        lang: 'ar',
        createdAt: new Date().toISOString()
      };
      await db.collection('users').doc(uid).set(defaultProfile);

      // 6. Map username to uid and store initial profile
      await db.collection('usernames').doc(cleanUsername).set({
        ...defaultProfile,
        uid
      });

      return cred.user;
    } catch (dbError) {
      console.error("Firestore initialization error:", dbError);
      throw new Error("تم إنشاء الحساب ولكن حدث خطأ أثناء إعداد مستندات البيانات.");
    }
  },

  async logout() {
    await auth.signOut();
  },

  // ─── User Profile Services ───
  async getUserProfile(uid) {
    const snap = await db.collection('users').doc(uid).get();
    if (!snap.exists) return null;
    return snap.data();
  },

  async saveUserProfile(uid, data, username) {
    await db.collection('users').doc(uid).set(data, { merge: true });
    if (username) {
      const snap = await db.collection('users').doc(uid).get();
      if (snap.exists) {
        const fullData = snap.data();
        await db.collection('usernames').doc(username.toLowerCase()).set({
          ...fullData,
          uid
        });
      } else {
        await db.collection('usernames').doc(username.toLowerCase()).set({
          ...data,
          uid
        }, { merge: true });
      }
    }
  },

  // ─── Username Mapping ───
  async getUidByUsername(username) {
    const snap = await db.collection('usernames').doc(username.toLowerCase()).get();
    if (!snap.exists) return null;
    return snap.data().uid;
  },

  async getUsernameDoc(username) {
    const snap = await db.collection('usernames').doc(username.toLowerCase()).get();
    if (!snap.exists) return null;
    return snap.data();
  },

  async reserveUsername(username, uid) {
    const cleanUsername = username.trim().toLowerCase();
    const takenSnap = await db.collection('usernames').doc(cleanUsername).get();
    if (takenSnap.exists) {
      throw new Error('اسم المستخدم مأخوذ بالفعل');
    }
    await db.collection('usernames').doc(cleanUsername).set({ uid });
    await db.collection('users').doc(uid).set({ username: cleanUsername }, { merge: true });
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
