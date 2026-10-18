// ═══════════════════════════════════════════════════════════
// HarpyOrder — Store & Data Manager (Rock-Solid Multi-Tenant Engine)
// ═══════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAhDjUmVBnoRCp6bDSeqrmVgakAQ2pu0ww",
  authDomain: "harpy-order.firebaseapp.com",
  databaseURL: "https://harpy-order-default-rtdb.firebaseio.com",
  projectId: "harpy-order",
  storageBucket: "harpy-order.firebasestorage.app",
  messagingSenderId: "785040786034",
  appId: "1:785040786034:web:2af6b418c70e4ecf8938eb"
};

let db = null;
let auth = null;
try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    db = firebase.database();
    if (firebase.auth) {
      auth = firebase.auth();
      try {
        if (firebase.auth.Auth && firebase.auth.Auth.Persistence) {
          auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
        }
      } catch(e) {}
    }
  }
} catch (e) {
  console.warn("[Store] Firebase Init Warning:", e);
}

const STORAGE_KEYS = {
  SETTINGS: 'harpy_order_settings',
  CATEGORIES: 'harpy_order_categories',
  PRODUCTS: 'harpy_order_products',
  CART: 'harpy_order_cart',
  FAVORITES: 'harpy_order_favorites',
  LAST_ORDER: 'harpy_order_last_order',
  THEME_MODE: 'harpy_theme_mode',
  APPLIED_COUPON: 'harpy_applied_coupon',
  SOUND_ENABLED: 'harpy_sound_enabled',
  VIEW_MODE: 'harpy_view_mode_v2',
  STORIES: 'harpy_order_stories',
  RAW_MATERIALS: 'harpy_order_raw_materials'
};

const THEME_PRESETS = {
  charcoal: {
    id: "charcoal",
    name: "الأسود الليلي العصري (ليلي أساسي)",
    badge: "كحلي مسائي وأسود ملكي",
    bg: "#070B13",
    surface: "#0E1726",
    surfaceRaised: "#142034",
    headerBg: "#070B13",
    textMain: "#ffffff",
    textBody: "#e2e8f0",
    primary: "#FF6A00",
    border: "rgba(255, 255, 255, 0.08)"
  },
  cream: {
    id: "cream",
    name: "النهاري الناصع العصري (نهاري أساسي)",
    badge: "أبيض ناصع ومقاهي",
    bg: "#F8FAFC",
    surface: "#ffffff",
    surfaceRaised: "#F8FAFC",
    headerBg: "#ffffff",
    textMain: "#0F172A",
    textBody: "#334155",
    primary: "#FF6A00",
    border: "#E2E8F0"
  },
  midnight: {
    id: "midnight",
    name: "الأسود والذهب الملكي",
    badge: "فخامة لاونج وستيك",
    bg: "#0d0d0e",
    surface: "#18181b",
    surfaceRaised: "#242428",
    headerBg: "#0d0d0e",
    textMain: "#ffffff",
    textBody: "#d4d4d8",
    primary: "#d97706",
    border: "rgba(217, 119, 6, 0.20)"
  },
  sunset: {
    id: "sunset",
    name: "البرتقالي الناري الحيوي",
    badge: "برجر وفاست فود",
    bg: "#140e0a",
    surface: "#221812",
    surfaceRaised: "#2e2119",
    headerBg: "#140e0a",
    textMain: "#fffaf5",
    textBody: "#e8d8cb",
    primary: "#f97316",
    border: "rgba(249, 115, 22, 0.16)"
  },
  olive: {
    id: "olive",
    name: "الزيتوني الريفي والطبيعي",
    badge: "طبيعي ومزارع خضراء",
    bg: "#0d1410",
    surface: "#18241d",
    surfaceRaised: "#223329",
    headerBg: "#0d1410",
    textMain: "#f0f7f2",
    textBody: "#c8ded0",
    primary: "#16a34a",
    border: "rgba(225, 163, 74, 0.16)"
  },
  indigo: {
    id: "indigo",
    name: "الأزرق النيلي والبحري",
    badge: "سي فود وشبابي عصري",
    bg: "#0b1120",
    surface: "#141d33",
    surfaceRaised: "#1c2847",
    headerBg: "#0b1120",
    textMain: "#f8faff",
    textBody: "#cbd8f0",
    primary: "#3b82f6",
    border: "rgba(59, 130, 246, 0.16)"
  },
  bordeaux: {
    id: "bordeaux",
    name: "العنابي والمشويات الفاخرة",
    badge: "مشويات وشاعري دافئ",
    bg: "#140a0e",
    surface: "#24141a",
    surfaceRaised: "#321b24",
    headerBg: "#140a0e",
    textMain: "#fff5f7",
    textBody: "#ecc8d0",
    primary: "#e11d48",
    border: "rgba(225, 29, 72, 0.16)"
  }
};
if (typeof window !== 'undefined') window.THEME_PRESETS = THEME_PRESETS;

// ── Demo Settings Fallback (Decoupled to js/core/demo-seed-data.js) ──
const DEFAULT_SETTINGS = (typeof window !== 'undefined' && window.HARPY_DEMO_SEED && window.HARPY_DEMO_SEED.DEFAULT_SETTINGS)
  ? window.HARPY_DEMO_SEED.DEFAULT_SETTINGS
  : {
      storeName: "سوبر برجر | Super Burger",
      storeTagline: "أشهى المأكولات الطازجة",
      whatsappNumber: "01019971508",
      walletNumber: "01019971508",
      walletName: "فودافون كاش / إنستاباي",
      currency: "ج.م",
      logo: "assets/portfolio/logo.png",
      cover: "assets/portfolio/order_restaurant_showcase.jpg",
      themePreset: "charcoal",
      deliveryTime: "30 - 45 دقيقة",
      minOrder: 50,
      deliverySettings: { defaultFee: 15, customZones: [] },
      isOrderingPaused: false,
      orderingPausedMessage: "المطعم متوقف حالياً عن استقبال الطلبات.",
      printerPaperSize: "80mm",
      aboutText: "نقدم لكم أشهى وألذ المأكولات المحضرة يومياً بأعلى معايير الجودة والنظافة، بأيدي أمهر الطهاة لتستمتعوا بتجربة طعام استثنائية لا تُنسى.",
      workingHours: "يومياً من 11:00 صباحاً حتى 2:00 صباحاً",
      address: "خدمة التوصيل والاستلام متوفرة",
      phone: "01019971508",
      locationUrl: "https://maps.google.com",
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: ""
    };
const BLANK_SETTINGS = {
  storeName: "",
  storeTagline: "",
  whatsappNumber: "",
  walletNumber: "",
  walletName: "فودافون كاش / إنستاباي",
  currency: "ج.م",
  logo: "",
  cover: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  
  themePreset: "cream",
  siteColors: {
    bg: "#f8f6f0",
    surface: "#ffffff",
    surfaceRaised: "#f3ede2",
    headerBg: "#f8f6f0",
    textMain: "#18130f",
    textBody: "#3d332a",
    primary: "#c2410c",
    border: "rgba(45, 35, 25, 0.10)"
  },

  // Discounts
  enableWalletDiscount: false,
  walletDiscountType: "percent",
  walletDiscountValue: 0,

  enableSpendTierDiscount: false,
  spendTierMinAmount: 0,
  spendTierDiscountType: "percent",
  spendTierDiscountValue: 0,

  promoCodes: [],

  announcementText: "",
  showAnnouncement: false,
  deliveryTime: "30 - 45 دقيقة",
  minOrder: 0,
  deliverySettings: {
    defaultFee: 15,
    customZones: []
  },
  isOrderingPaused: false,
  orderingPausedMessage: "المطعم متوقف حالياً عن استقبال الطلبات.",
  printerPaperSize: "80mm"
};

// ── Demo Seed Data Fallbacks (Decoupled to js/core/demo-seed-data.js) ──
const DEFAULT_CATEGORIES = (typeof window !== 'undefined' && window.HARPY_DEMO_SEED && window.HARPY_DEMO_SEED.DEFAULT_CATEGORIES) || [];
const DEFAULT_PRODUCTS = (typeof window !== 'undefined' && window.HARPY_DEMO_SEED && window.HARPY_DEMO_SEED.DEFAULT_PRODUCTS) || [];
const DEFAULT_STORIES = (typeof window !== 'undefined' && window.HARPY_DEMO_SEED && window.HARPY_DEMO_SEED.DEFAULT_STORIES) || [];
const DEFAULT_RAW_MATERIALS = [
  { id: 'mat_flour', name: 'دقيق فاخر', unit: 'g', stock: 25000, minAlert: 5000, costPerUnit: 0.03, updatedAt: new Date().toISOString() },
  { id: 'mat_mozzarella', name: 'جبنة موتزاريلا طبيعي', unit: 'g', stock: 15000, minAlert: 3000, costPerUnit: 0.25, updatedAt: new Date().toISOString() },
  { id: 'mat_sauce', name: 'صوص طماطم إيطالي', unit: 'g', stock: 10000, minAlert: 2000, costPerUnit: 0.08, updatedAt: new Date().toISOString() },
  { id: 'mat_beef', name: 'لحم بقري مفروم بلدي', unit: 'g', stock: 8000, minAlert: 2000, costPerUnit: 0.35, updatedAt: new Date().toISOString() },
  { id: 'mat_box_large', name: 'كرتونة بيتزا لارج', unit: 'pcs', stock: 120, minAlert: 30, costPerUnit: 4.5, updatedAt: new Date().toISOString() },
  { id: 'mat_can_coke', name: 'كانز كوكاكولا 330مل', unit: 'pcs', stock: 80, minAlert: 24, costPerUnit: 12, updatedAt: new Date().toISOString() }
];
const Store = {
  // ── High-Speed In-Memory State Cache ───────────────────────
  _memoryCache: {
    slug: null,
    products: null,
    categories: null,
    settings: null,
    stories: null,
    rawMaterials: null,
    cart: null,
    favorites: null,
    lastOrder: null,
    orders: null
  },

  // ── Bulletproof HTML Sanitizer (XSS Prevention) ───────────
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  clearMemoryCache() {
    this._memoryCache = {
      slug: null,
      products: null,
      categories: null,
      settings: null,
      stories: null,
      rawMaterials: null,
      cart: null,
      favorites: null,
      lastOrder: null,
      orders: null
    };
  },

  _isCloudDataLoaded: false,
  isCloudDataLoaded() {
    if (this._isCloudDataLoaded) return true;
    const prods = (this._memoryCache && this._memoryCache.products) || null;
    if (Array.isArray(prods) && prods.length > 0) return true;
    const slug = this.getRestaurantSlug();
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.PRODUCTS)) || (slug ? (localStorage.getItem(`harpy_${slug}_products`) || localStorage.getItem('harpy_products')) : null);
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p) && p.length > 0) return true;
      } catch(e) {}
    }
    return false;
  },
  setCloudDataLoaded(val = true) {
    this._isCloudDataLoaded = !!val;
  },

  // ── Save Locks & Listener Lifecycle State ────────────────
  saveLocks: {
    settings: false,
    categories: false,
    products: false,
    stories: false,
    rawMaterials: false
  },
  lastSaveTimestamps: {
    settings: 0,
    categories: 0,
    products: 0,
    stories: 0,
    rawMaterials: 0
  },
  activeListeners: {
    restaurant: null,
    orders: null,
    license: null
  },

  // Safe LocalStorage writer that prevents QuotaExceeded from aborting cloud writes
  safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.warn(`[Store] LocalStorage write failed for key "${key}":`, err.name || err.message);
      return false;
    }
  },

  safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn(`[Store] LocalStorage read failed for key "${key}":`, err.name || err.message);
      return null;
    }
  },

  // ── High-Efficiency HTML5 Canvas Image Compressor ────────
  async compressImage(fileOrDataUrl, maxWidth = 900, maxHeight = 900, quality = 0.76) {
    if (!fileOrDataUrl) return null;
    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('http')) {
      return fileOrDataUrl;
    }

    // 1. Asynchronous OffscreenCanvas Processing (Zero UI lag / background processing)
    try {
      if (typeof createImageBitmap !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
        let blob = null;
        if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
          blob = fileOrDataUrl;
        } else if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
          const res = await fetch(fileOrDataUrl);
          blob = await res.blob();
        }

        if (blob) {
          const bitmap = await createImageBitmap(blob);
          let width = bitmap.width;
          let height = bitmap.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const offscreen = new OffscreenCanvas(width, height);
          const ctx = offscreen.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(bitmap, 0, 0, width, height);
          bitmap.close();

          const compressedBlob = await offscreen.convertToBlob({ type: 'image/jpeg', quality });
          return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(compressedBlob);
          });
        }
      }
    } catch (workerErr) {
      // Fallback seamlessly to HTML5 Canvas
    }

    // 2. Resilient Main Thread HTML5 Canvas Fallback
    return new Promise((resolve) => {
      const processImg = (src) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          try {
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
          } catch (err) {
            resolve(src);
          }
        };
        img.onerror = () => resolve(src);
        img.src = src;
      };

      if (typeof fileOrDataUrl === 'string') {
        processImg(fileOrDataUrl);
      } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => processImg(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(fileOrDataUrl);
      } else {
        resolve(null);
      }
    });
  },

  async uploadImage(file) {
    if (!file) return null;
    const settings = this.getSettings() || {};

    // 1. Fast background compression (<50ms) to ensure small, crisp, high-performance payload
    let compressedData = null;
    try {
      compressedData = await this.compressImage(file, 800, 800, 0.82);
    } catch (e) {
      console.warn('[Store] Local compression error:', e);
    }

    if (!compressedData) {
      try {
        compressedData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      } catch (e) {}
    }

    // 2. Cloud Upload via ImgBB (Only if admin configured their own valid API key, with strict 3.5s timeout)
    const apiKey = (settings.imgbbApiKey || '').trim();
    if (apiKey && compressedData) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const formData = new FormData();
        if (compressedData.startsWith('data:')) {
          formData.append('image', compressedData.split(',')[1]);
        } else {
          formData.append('image', file);
        }
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const json = await response.json();
        if (json && json.success && json.data && json.data.url) {
          return json.data.url;
        }
      } catch (err) {
        console.warn('[Store] Cloud upload error or timeout:', err.message);
      }
    }

    // 3. Platform High-Speed Cloud Host via Cloudinary Unsigned Preset
    if (compressedData) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);
        const formData = new FormData();
        formData.append('file', compressedData);
        formData.append('upload_preset', 'harpy_order');

        const response = await fetch('https://api.cloudinary.com/v1_1/pq2pimug/image/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const json = await response.json();
        if (json && (json.secure_url || json.url)) {
          return json.secure_url || json.url;
        }
      } catch (err) {
        console.warn('[Store] Platform Cloudinary upload fallback:', err.message);
      }
    }

    // 4. Instant, reliable zero-hang return of compressed data
    return compressedData;
  },

  // ── Multi-Tenant Admin Authentication Engine ─────────────
  async loginAdmin(identifier, password) {
    const slug = this.getRestaurantSlug();
    const cleanId = (identifier || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    if (!cleanPassword) {
      throw new Error("auth/missing-password");
    }

    // 1. Try Firebase Auth (Primary Multi-Tenant Authentication)
    if (auth) {
      const candidateEmails = [];
      if (cleanId.includes('@')) {
        candidateEmails.push(cleanId);
      } else {
        if (cleanId === 'test_staging_tenant' || slug === 'test_staging_tenant') {
          candidateEmails.push('staging_test@harpymenu.com');
          candidateEmails.push('test@harpymenu.com');
        }
        if (cleanId) candidateEmails.push(`${cleanId}@harpymenu.com`);
        if (slug && slug !== cleanId) candidateEmails.push(`${slug}@harpymenu.com`);
      }

      for (const email of candidateEmails) {
        try {
          if (firebase.auth && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
            try { await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch(pErr) {}
          }
          const userCred = await auth.signInWithEmailAndPassword(email, cleanPassword);
          const session = { 
            email: email, 
            uid: userCred.user.uid, 
            authenticated: true, 
            slug: slug || cleanId, 
            timestamp: Date.now() 
          };
          this.safeSetItem(`harpy_admin_auth_${slug}`, JSON.stringify(session));
          sessionStorage.setItem(`harpy_auth_${slug}`, JSON.stringify(session));
          this.safeSetItem('harpy_admin_active_slug', slug);
          return userCred;
        } catch (authErr) {
          console.warn(`[Store] Firebase Auth attempt for ${email}:`, authErr.code || authErr.message);
        }
      }
    }

    throw new Error("auth/invalid-credentials");
  },

  async changeAdminPassword(newPassword, logoutAllDevices = false) {
    const slug = this.getRestaurantSlug();
    const cleanPassword = (newPassword || '').trim();
    if (!cleanPassword || cleanPassword.length < 5) {
      throw new Error("كلمة المرور يجب ألا تقل عن 5 أحرف أو أرقام");
    }

    if (!db) {
      throw new Error("قاعدة البيانات السحابية غير متصلة حالياً");
    }

    // 1. Update Firebase Auth User Password directly
    if (auth && auth.currentUser) {
      await auth.currentUser.updatePassword(cleanPassword);
    }

    // 2. Update session version & audit timestamp in meta (never store plaintext password)
    const updates = {
      lastPasswordChange: new Date().toISOString()
    };

    if (logoutAllDevices) {
      const newVersion = Date.now();
      updates.sessionVersion = newVersion;
      // Keep this current device session valid with the new version
      const localAuth = this.safeGetItem(`harpy_admin_auth_${slug}`);
      if (localAuth) {
        try {
          const session = JSON.parse(localAuth);
          session.sessionVersion = newVersion;
          this.safeSetItem(`harpy_admin_auth_${slug}`, JSON.stringify(session));
          sessionStorage.setItem(`harpy_auth_${slug}`, JSON.stringify(session));
        } catch(e) {}
      }
    }

    await db.ref(`restaurants/${slug}/meta`).update(updates);
    return true;
  },

  async logoutAdmin() {
    const slug = this.getRestaurantSlug();
    localStorage.removeItem(`harpy_admin_auth_${slug}`);
    sessionStorage.removeItem(`harpy_auth_${slug}`);
    localStorage.removeItem('harpy_admin_active_slug');
    localStorage.removeItem(`harpy_${slug}_admin_active_tab`);
    if (auth) {
      try { await auth.signOut(); } catch(e) {}
    }
  },

  isAdminAuthenticated(slug) {
    const activeSlug = slug || this.getRestaurantSlug();
    const localSession = localStorage.getItem(`harpy_admin_auth_${activeSlug}`);
    if (localSession) {
      try {
        const session = JSON.parse(localSession);
        if (session && session.authenticated === true && (!session.slug || session.slug === activeSlug)) return true;
      } catch(e) {}
    }
    const sessionStr = sessionStorage.getItem(`harpy_auth_${activeSlug}`);
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.authenticated === true && (!session.slug || session.slug === activeSlug)) return true;
      } catch(e) {}
    }
    return false;
  },

  getCurrentUser() {
    const slug = this.getRestaurantSlug();
    const sessionStr = sessionStorage.getItem(`harpy_auth_${slug}`);
    if (sessionStr) {
      try {
        return JSON.parse(sessionStr);
      } catch(e) {}
    }
    return auth ? auth.currentUser : null;
  },

  onAuthStateChanged(callback) {
    if (!auth) return () => {};
    return auth.onAuthStateChanged(callback);
  },

  // ── Controlled Cloud Sync Engine with Stale Snapshot Protection ──
  applySnapshotData(data) {
    const slug = this.getRestaurantSlug();
    const isDemo = (slug === 'demo');

    if (!data || typeof data !== 'object') {
      return false;
    }

    this._isCloudDataLoaded = true;
    const now = Date.now();
    let hasChanges = false;
    const defaults = isDemo ? DEFAULT_SETTINGS : BLANK_SETTINGS;

    // Cache tenant meta if provided
    if (!this.saveLocks.settings && (now - this.lastSaveTimestamps.settings > 2500)) {
      if (data.settings && typeof data.settings === 'object') {
        const mergedSettings = { ...defaults, ...data.settings };
        if (!isDemo) {
          if (mergedSettings.storeName === DEFAULT_SETTINGS.storeName) mergedSettings.storeName = "";
          if (mergedSettings.whatsappNumber === DEFAULT_SETTINGS.whatsappNumber) mergedSettings.whatsappNumber = "";
          if (mergedSettings.walletNumber === DEFAULT_SETTINGS.walletNumber) mergedSettings.walletNumber = "";
          if (mergedSettings.logo === DEFAULT_SETTINGS.logo) mergedSettings.logo = "";
          if (mergedSettings.cover === DEFAULT_SETTINGS.cover) mergedSettings.cover = "";
          if (mergedSettings.announcementText === DEFAULT_SETTINGS.announcementText) {
            mergedSettings.announcementText = "";
            mergedSettings.showAnnouncement = false;
          }
        }
        if (!mergedSettings.storeName && (data.settings.restaurantName || data.settings.name)) {
          mergedSettings.storeName = data.settings.restaurantName || data.settings.name;
        }
        if (!mergedSettings.whatsappNumber && data.settings.phone) {
          mergedSettings.whatsappNumber = data.settings.phone;
        }
        this._memoryCache.settings = mergedSettings;
        this.safeSetItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(mergedSettings));
        this.applyTheme();
        hasChanges = true;
      }
    }

    if (!this.saveLocks.categories && (now - this.lastSaveTimestamps.categories > 2500)) {
      if (data.categories !== undefined && data.categories !== null) {
        let catArray = Array.isArray(data.categories) ? data.categories : Object.values(data.categories);
        if (isDemo && (!catArray || catArray.length === 0)) {
          catArray = DEFAULT_CATEGORIES;
        }
        this._memoryCache.categories = catArray;
        this.safeSetItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(catArray));
        hasChanges = true;
      } else if (isDemo && (!this._memoryCache.categories || this._memoryCache.categories.length === 0)) {
        this._memoryCache.categories = DEFAULT_CATEGORIES;
        this.safeSetItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(DEFAULT_CATEGORIES));
        hasChanges = true;
      }
    }

    if (!this.saveLocks.products && (now - this.lastSaveTimestamps.products > 2500)) {
      if (data.products !== undefined && data.products !== null) {
        let prodArray = Array.isArray(data.products) ? data.products : Object.values(data.products);
        if (isDemo && (!prodArray || prodArray.length === 0)) {
          prodArray = DEFAULT_PRODUCTS;
        }
        this._memoryCache.products = prodArray;
        this.safeSetItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(prodArray));
        if (slug) this.safeSetItem(`harpy_${slug}_products`, JSON.stringify(prodArray));
        hasChanges = true;
      } else if (isDemo && (!this._memoryCache.products || this._memoryCache.products.length === 0)) {
        this._memoryCache.products = DEFAULT_PRODUCTS;
        this.safeSetItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(DEFAULT_PRODUCTS));
        if (slug) this.safeSetItem(`harpy_${slug}_products`, JSON.stringify(DEFAULT_PRODUCTS));
        hasChanges = true;
      }
    }

    if (!this.saveLocks.stories && (now - this.lastSaveTimestamps.stories > 2500)) {
      if (data.stories !== undefined && data.stories !== null) {
        let storyArray = Array.isArray(data.stories) ? data.stories : Object.values(data.stories);
        if (isDemo && (!storyArray || storyArray.length === 0)) {
          storyArray = DEFAULT_STORIES;
        }
        storyArray = storyArray.map(st => {
          if (!st || typeof st !== 'object') return st;
          const copy = { ...st };
          if (copy.title) copy.title = this.stripEmojiNoise(copy.title);
          if (copy.badge) copy.badge = this.stripEmojiNoise(copy.badge);
          if (copy.tagline) copy.tagline = this.stripEmojiNoise(copy.tagline);
          if (copy.ctaText) copy.ctaText = this.stripEmojiNoise(copy.ctaText);
          if (copy.headline) copy.headline = this.stripEmojiNoise(copy.headline);
          return copy;
        });
        this._memoryCache.stories = storyArray;
        this.safeSetItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(storyArray));
        if (slug) this.safeSetItem(`harpy_${slug}_stories`, JSON.stringify(storyArray));
        hasChanges = true;
      } else if (isDemo && (!this._memoryCache.stories || this._memoryCache.stories.length === 0)) {
        this._memoryCache.stories = DEFAULT_STORIES;
        this.safeSetItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(DEFAULT_STORIES));
        if (slug) this.safeSetItem(`harpy_${slug}_stories`, JSON.stringify(DEFAULT_STORIES));
        hasChanges = true;
      }
    }

    if (!this.saveLocks.rawMaterials && (now - this.lastSaveTimestamps.rawMaterials > 2500)) {
      if (data.rawMaterials !== undefined && data.rawMaterials !== null) {
        let matArray = Array.isArray(data.rawMaterials) ? data.rawMaterials : Object.values(data.rawMaterials);
        if (Array.isArray(matArray)) {
          matArray = matArray.filter(m => m && typeof m === 'object' && m.id && m.name);
        } else {
          matArray = [];
        }
        const existingLocal = this.getRawMaterials();
        if (matArray && matArray.length > 0) {
          this._memoryCache.rawMaterials = matArray;
          this.safeSetItem(this.getKey(STORAGE_KEYS.RAW_MATERIALS), JSON.stringify(matArray));
          if (slug) this.safeSetItem(`harpy_${slug}_raw_materials`, JSON.stringify(matArray));
          hasChanges = true;
        } else if (isDemo && (!existingLocal || existingLocal.length === 0)) {
          this._memoryCache.rawMaterials = DEFAULT_RAW_MATERIALS;
          this.safeSetItem(this.getKey(STORAGE_KEYS.RAW_MATERIALS), JSON.stringify(DEFAULT_RAW_MATERIALS));
          if (slug) this.safeSetItem(`harpy_${slug}_raw_materials`, JSON.stringify(DEFAULT_RAW_MATERIALS));
          hasChanges = true;
        }
      }
    }

    return hasChanges;
  },

  syncFromCloud(slug, onUpdate) {
    if (!slug) return () => {};
    const isDemo = (slug === 'demo');
    let isDestroyed = false;
    let lastKnownDataHash = '';

    // Initialize with current local cache hash to prevent initial re-render flicker
    try {
      const curSettings = localStorage.getItem(this.getKey(STORAGE_KEYS.SETTINGS));
      const curCats = localStorage.getItem(this.getKey(STORAGE_KEYS.CATEGORIES));
      const curProds = localStorage.getItem(this.getKey(STORAGE_KEYS.PRODUCTS));
      const curStories = localStorage.getItem(this.getKey(STORAGE_KEYS.STORIES));
      const curMats = localStorage.getItem(this.getKey(STORAGE_KEYS.RAW_MATERIALS));
      if (curSettings || curProds || curMats) {
        lastKnownDataHash = JSON.stringify({
          s: curSettings ? JSON.parse(curSettings) : null,
          c: curCats ? JSON.parse(curCats) : null,
          p: curProds ? JSON.parse(curProds) : null,
          st: curStories ? JSON.parse(curStories) : null,
          rm: curMats ? JSON.parse(curMats) : null
        });
      }
    } catch(e) {}

    const processSnapshotData = (data) => {
      this._isCloudDataLoaded = true;
      if (isDestroyed || !data) return;
      if (isDemo) {
        if (!data.categories || (Array.isArray(data.categories) && data.categories.length === 0)) data.categories = DEFAULT_CATEGORIES;
        if (!data.products || (Array.isArray(data.products) && data.products.length === 0)) data.products = DEFAULT_PRODUCTS;
        if (!data.stories || (typeof data.stories === 'object' && Object.keys(data.stories).length === 0)) data.stories = DEFAULT_STORIES;
        if (!data.settings || (typeof data.settings === 'object' && Object.keys(data.settings).length === 0)) data.settings = DEFAULT_SETTINGS;
        if (!data.rawMaterials || (Array.isArray(data.rawMaterials) && data.rawMaterials.length === 0)) data.rawMaterials = DEFAULT_RAW_MATERIALS;
      }
      const currentDataHash = JSON.stringify({
        s: data.settings,
        c: data.categories,
        p: data.products,
        st: data.stories,
        rm: data.rawMaterials
      });
      if (currentDataHash === lastKnownDataHash) {
        if (typeof onUpdate === 'function') {
          onUpdate({ success: true, hasData: !!data, data, hasChanges: false });
        }
        return; // Zero-lag: No changes detected, skip re-render
      }
      lastKnownDataHash = currentDataHash;

      this.applySnapshotData(data);
      window.dispatchEvent(new Event('store_settings_updated'));
      window.dispatchEvent(new Event('store_categories_updated'));
      window.dispatchEvent(new Event('store_products_updated'));
      window.dispatchEvent(new Event('store_stories_updated'));
      window.dispatchEvent(new Event('store_raw_materials_updated'));

      if (typeof onUpdate === 'function') {
        onUpdate({ success: true, hasData: !!data, data, hasChanges: true });
      }
    };

    // 1. WebSocket Channel (Primary - Decoupled Public Endpoints)
    let subRefs = null;
    let subCallbacks = null;
    try {
      if (this.activeListeners.restaurant) {
        if (typeof this.activeListeners.restaurant.offAll === 'function') {
          this.activeListeners.restaurant.offAll();
        } else if (this.activeListeners.restaurant.ref) {
          try { this.activeListeners.restaurant.ref.off('value', this.activeListeners.restaurant.callback); } catch(e) {}
        }
        this.activeListeners.restaurant = null;
      }
      if (db) {
        subRefs = {
          settings: db.ref(`restaurants/${slug}/settings`),
          categories: db.ref(`restaurants/${slug}/categories`),
          products: db.ref(`restaurants/${slug}/products`),
          stories: db.ref(`restaurants/${slug}/stories`)
        };

        const currentAgg = {
          settings: this.getSettings ? this.getSettings() : (isDemo ? DEFAULT_SETTINGS : null),
          categories: this.getCategories ? this.getCategories() : (isDemo ? DEFAULT_CATEGORIES : null),
          products: this.getProducts ? this.getProducts() : (isDemo ? DEFAULT_PRODUCTS : null),
          stories: this.getStories ? this.getStories() : (isDemo ? DEFAULT_STORIES : null),
          rawMaterials: this.getRawMaterials ? this.getRawMaterials() : (isDemo ? DEFAULT_RAW_MATERIALS : null)
        };

        subCallbacks = {};
        Object.keys(subRefs).forEach(k => {
          subCallbacks[k] = snap => {
            let val = snap ? snap.val() : null;
            if (isDemo) {
              if (k === 'products' && (!val || (Array.isArray(val) && val.length === 0))) val = DEFAULT_PRODUCTS;
              if (k === 'categories' && (!val || (Array.isArray(val) && val.length === 0))) val = DEFAULT_CATEGORIES;
              if (k === 'stories' && (!val || (typeof val === 'object' && Object.keys(val).length === 0))) val = DEFAULT_STORIES;
              if (k === 'settings' && (!val || (typeof val === 'object' && Object.keys(val).length === 0))) val = DEFAULT_SETTINGS;
            }
            currentAgg[k] = val;
            processSnapshotData(currentAgg);
          };
          subRefs[k].on('value', subCallbacks[k], err => {
            console.warn(`[Store] Cloud sync read error for ${k}:`, err);
          });
        });

        // Auth-Aware Realtime Raw Materials Subscriptions
        const attachRawMaterialsSub = () => {
          if (!db || isDestroyed) return;
          const user = (window.firebase && firebase.auth && firebase.auth().currentUser) || null;
          if (!user && !isDemo) return;
          try {
            if (subRefs.rawMaterials && subCallbacks.rawMaterials) {
              try { subRefs.rawMaterials.off('value', subCallbacks.rawMaterials); } catch(e) {}
            }
            subRefs.rawMaterials = db.ref(`restaurants/${slug}/rawMaterials`);
            subCallbacks.rawMaterials = snap => {
              let val = snap ? snap.val() : null;
              if (isDemo && (!val || (Array.isArray(val) && val.length === 0))) val = DEFAULT_RAW_MATERIALS;
              if (val) {
                currentAgg.rawMaterials = val;
                processSnapshotData(currentAgg);
              }
            };
            subRefs.rawMaterials.on('value', subCallbacks.rawMaterials, err => {
              console.warn("[Store] Cloud sync rawMaterials notice:", err ? (err.message || err) : err);
            });
          } catch(e) {}
        };

        if (isDemo || (window.firebase && firebase.auth && firebase.auth().currentUser)) {
          attachRawMaterialsSub();
        }
        if (window.firebase && firebase.auth) {
          try {
            firebase.auth().onAuthStateChanged(u => {
              if (u && !isDestroyed) {
                attachRawMaterialsSub();
              }
            });
          } catch(e) {}
        }

        const offAllFn = () => {
          Object.keys(subRefs).forEach(k => {
            try { subRefs[k].off('value', subCallbacks[k]); } catch(e) {}
          });
        };

        this.activeListeners.restaurant = { subRefs, subCallbacks, offAll: offAllFn };
      }
    } catch (err) {
      console.warn("[Store] Cloud sync init error:", err);
    }

    // 2. High-Speed REST Initial Accelerator (Reuses preload promise to eliminate redundant network fetches)
    (async () => {
      try {
        let preloadData = null;
        if (typeof window !== 'undefined' && window.__harpyPreloadPromise) {
          try {
            preloadData = await Promise.race([
              window.__harpyPreloadPromise,
              new Promise(r => setTimeout(() => r(null), 2500))
            ]);
          } catch(e) {}
        }

        // If preload promise already supplied menu data, process it and skip duplicate network requests
        if (preloadData && typeof preloadData === 'object' && (preloadData.settings || preloadData.products || preloadData.categories || preloadData.rawMaterials)) {
          if (typeof window !== 'undefined' && window.__harpyStoriesPromise && !preloadData.stories) {
            window.__harpyStoriesPromise.then(stories => {
              if (stories && !isDestroyed) {
                if (typeof currentAgg !== 'undefined') currentAgg.stories = stories;
                processSnapshotData({ ...preloadData, stories });
              }
            }).catch(() => {});
          }
          processSnapshotData(preloadData);
          return;
        }

        // Fallback: If preload was unavailable or failed, fetch REST directly with strict 3.2s timeout
        let idToken = '';
        if (typeof window !== 'undefined' && window.firebase && firebase.auth && firebase.auth().currentUser) {
          try { idToken = await firebase.auth().currentUser.getIdToken(); } catch(e) {}
        }
        const authParam = idToken ? `?auth=${idToken}` : '';
        const baseUrl = `https://harpy-order-default-rtdb.firebaseio.com/restaurants/${encodeURIComponent(slug)}`;
        const fetchRestWithTimeout = (endpointUrl) => {
          const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const tid = ctrl ? setTimeout(() => { try { ctrl.abort(); } catch(e){} }, 3200) : null;
          return fetch(endpointUrl, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
            .finally(() => { if (tid) clearTimeout(tid); })
            .catch(() => null);
        };
        const [sRes, cRes, pRes, stRes, rmRes] = await Promise.all([
          fetchRestWithTimeout(`${baseUrl}/settings.json${authParam}`),
          fetchRestWithTimeout(`${baseUrl}/categories.json${authParam}`),
          fetchRestWithTimeout(`${baseUrl}/products.json${authParam}`),
          fetchRestWithTimeout(`${baseUrl}/stories.json${authParam}`),
          fetchRestWithTimeout(`${baseUrl}/rawMaterials.json${authParam}`)
        ]);

        let settings = sRes && sRes.ok ? await sRes.json().catch(() => null) : null;
        let categories = cRes && cRes.ok ? await cRes.json().catch(() => null) : null;
        let products = pRes && pRes.ok ? await pRes.json().catch(() => null) : null;
        let stories = stRes && stRes.ok ? await stRes.json().catch(() => null) : null;
        let rawMaterials = rmRes && rmRes.ok ? await rmRes.json().catch(() => null) : null;

        if (isDemo) {
          if (!settings || (typeof settings === 'object' && Object.keys(settings).length === 0)) settings = DEFAULT_SETTINGS;
          if (!categories || (Array.isArray(categories) && categories.length === 0)) categories = DEFAULT_CATEGORIES;
          if (!products || (Array.isArray(products) && products.length === 0)) products = DEFAULT_PRODUCTS;
          if (!stories || (typeof stories === 'object' && Object.keys(stories).length === 0)) stories = DEFAULT_STORIES;
          if (!rawMaterials || (Array.isArray(rawMaterials) && rawMaterials.length === 0)) rawMaterials = DEFAULT_RAW_MATERIALS;
        }

        if (settings !== null || categories !== null || products !== null || rawMaterials !== null) {
          processSnapshotData({
            settings: settings,
            categories: categories,
            products: products,
            stories: stories,
            rawMaterials: rawMaterials
          });
        }
      } catch (e) {}
    })();

    return () => {
      isDestroyed = true;
      if (this.activeListeners.restaurant) {
        if (typeof this.activeListeners.restaurant.offAll === 'function') {
          this.activeListeners.restaurant.offAll();
        } else if (this.activeListeners.restaurant.ref) {
          try { this.activeListeners.restaurant.ref.off('value', this.activeListeners.restaurant.callback); } catch(e) {}
        }
        this.activeListeners.restaurant = null;
      }
    };
  },

  async pushToCloud(subPath, data) {
    const slug = this.getRestaurantSlug();
    if (!slug) return false;
    const path = subPath ? `restaurants/${slug}/${subPath}` : `restaurants/${slug}`;
    let success = false;

    if (db) {
      try {
        await db.ref(path).set(data);
        success = true;
      } catch (err) {
        console.warn(`[Store] Cloud SDK push error for ${subPath}:`, err);
      }
    }

    // Only fallback to REST PUT if SDK push was not successful or unavailable
    if (!success) {
      try {
        let authParam = '';
        if (typeof window !== 'undefined' && window.firebase && firebase.auth && firebase.auth().currentUser) {
          try {
            const token = await firebase.auth().currentUser.getIdToken();
            if (token) authParam = `?auth=${token}`;
          } catch(e) {}
        }
        const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const tid = ctrl ? setTimeout(() => { try { ctrl.abort(); } catch(e){} }, 3500) : null;
        const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/${path}.json${authParam}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: ctrl ? ctrl.signal : undefined,
          keepalive: true
        });
        if (tid) clearTimeout(tid);
        if (res && res.ok) {
          success = true;
        }
      } catch (e) {
        console.warn(`[Store] REST cloud push error for ${subPath}:`, e);
      }
    }

    return success;
  },

  async patchToCloud(subPath, partialData) {
    const slug = this.getRestaurantSlug();
    if (!slug || !partialData) return false;
    const path = subPath ? `restaurants/${slug}/${subPath}` : `restaurants/${slug}`;
    let success = false;

    if (db) {
      try {
        await db.ref(path).update(partialData);
        success = true;
      } catch (err) {
        console.warn(`[Store] Cloud SDK patch error for ${subPath}:`, err);
      }
    }

    try {
      let authParam = '';
      if (typeof window !== 'undefined' && window.firebase && firebase.auth && firebase.auth().currentUser) {
        try {
          const token = await firebase.auth().currentUser.getIdToken();
          if (token) authParam = `?auth=${token}`;
        } catch(e) {}
      }
      const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/${path}.json${authParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialData),
        keepalive: true
      });
      if (res && res.ok) {
        success = true;
      }
    } catch (e) {
      console.warn(`[Store] REST cloud patch error for ${subPath}:`, e);
    }

    return success;
  },

  async syncThemePresetToCloud(presetId, presetData) {
    const p = presetData || THEME_PRESETS[presetId];
    if (!p) return false;
    return await this.patchToCloud('settings', {
      themePreset: presetId,
      siteColors: { ...p }
    });
  },

  getDeletedOrderIds(slug = null) {
    const s = slug || this.getRestaurantSlug();
    if (!s) return new Set();
    try {
      const raw = localStorage.getItem(`harpy_${s}_deleted_order_ids`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch(e) {}
    return new Set();
  },

  addDeletedOrderId(slug = null, orderId) {
    const s = slug || this.getRestaurantSlug();
    if (!s || !orderId) return;
    const cleanId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');
    const set = this.getDeletedOrderIds(s);
    set.add(cleanId);
    set.add(orderId);
    if (!orderId.startsWith('#')) set.add(`#${cleanId}`);
    try {
      localStorage.setItem(`harpy_${s}_deleted_order_ids`, JSON.stringify(Array.from(set)));
    } catch(e) {}

    // Synchronize tombstone to cloud so all devices inherit the permanent deletion
    try {
      if (db) {
        db.ref(`restaurants/${s}/deletedOrderIds/${cleanId}`).set(Date.now());
      }
      fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${s}/deletedOrderIds/${cleanId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Date.now()),
        keepalive: true
      }).catch(() => {});
    } catch(e) {}
  },

  recordDeletedOrderId(slug = null, orderId) {
    return this.addDeletedOrderId(slug, orderId);
  },

  getOrders(forceRefresh = false) {
    const slug = this.getRestaurantSlug();
    const deletedIds = this.getDeletedOrderIds(slug);

    if (!forceRefresh && this._memoryCache.orders !== null) {
      if (deletedIds.size > 0) {
        return this._memoryCache.orders.filter(o => {
          if (!o) return false;
          const cid = String(o.orderId || o.id || o._fbKey || '').replace(/[^a-zA-Z0-9_-]/g, '');
          return !deletedIds.has(cid) && !deletedIds.has(o.orderId) && !deletedIds.has(o.id) && !deletedIds.has(o._fbKey);
        });
      }
      return this._memoryCache.orders;
    }
    try {
      const data = localStorage.getItem(this.getKey('harpy_orders_cache'));
      if (data) {
        const parsed = JSON.parse(data);
        const normalized = (Array.isArray(parsed) ? parsed : Object.values(parsed)).map(o => {
          if (!o || typeof o !== 'object') return null;
          if (!o.orderId || o.orderId === 'undefined') {
            o.orderId = o.id || o._fbKey || (`#ORD-${(o.timestamp || Date.now()).toString().slice(-4)}`);
          }
          const cid = String(o.orderId || o.id || o._fbKey || '').replace(/[^a-zA-Z0-9_-]/g, '');
          if (deletedIds.has(cid) || deletedIds.has(o.orderId) || deletedIds.has(o.id) || deletedIds.has(o._fbKey)) {
            return null; // Instantly purge deleted orders from ever rendering
          }
          return o;
        }).filter(Boolean);
        this._memoryCache.orders = normalized;
        return normalized;
      }
    } catch(e) {}
    this._memoryCache.orders = [];
    return [];
  },

  orderStatusLocks: {},

  saveOrders(orders) {
    const rawList = Array.isArray(orders) ? orders : Object.values(orders || {});
    const normalized = rawList.map(o => {
      if (!o || typeof o !== 'object') return null;
      if (!o.orderId || o.orderId === 'undefined') {
        o.orderId = o.id || o._fbKey || (`#ORD-${(o.timestamp || Date.now()).toString().slice(-4)}`);
      }
      return o;
    }).filter(Boolean);

    this._memoryCache.orders = normalized;
    try {
      this.safeSetItem(this.getKey('harpy_orders_cache'), JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent('store_orders_updated', { detail: normalized }));
    } catch(e) {}
  },

  async pushOrderToCloud(arg1, arg2) {
    let slug = this.getRestaurantSlug();
    let orderData = arg1;
    if (typeof arg1 === 'string' && arg2 && typeof arg2 === 'object') {
      slug = arg1;
      orderData = arg2;
    }
    if (!slug || !orderData || !orderData.orderId) return false;
    const cleanId = orderData.orderId.replace(/[^a-zA-Z0-9_-]/g, '');

    // 1. Cache locally for instant UI responsiveness
    try {
      const cached = this.getOrders();
      const updated = [orderData, ...cached.filter(o => o.orderId !== orderData.orderId)];
      this.saveOrders(updated);
    } catch(e) {}

    let isDelivered = false;

    // 2. Verified REST Delivery with status code validation and 9-second timeout
    let controller = null;
    let timeoutId = null;
    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 9000);
    }

    try {
      const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${cleanId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
      if (res && res.ok) {
        isDelivered = true;
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      console.warn("[Store] REST order push notice:", err.message);
    }

    // 3. Parallel WebSocket SDK broadcast when REST delivery confirmed
    if (db && isDelivered) {
      try {
        db.ref(`restaurants/${slug}/orders/${cleanId}`).set(orderData);
      } catch (err) {}
    }

    return isDelivered;
  },

  // ── Offline Outbox & Auto-Retry Queue System ────────────────
  getOutbox() {
    const slug = this.getRestaurantSlug();
    if (!slug) return [];
    try {
      const raw = localStorage.getItem(`harpy_outbox_${slug}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveOutbox(outbox) {
    const slug = this.getRestaurantSlug();
    if (!slug) return;
    try {
      localStorage.setItem(`harpy_outbox_${slug}`, JSON.stringify(outbox || []));
    } catch (e) {}
  },

  addToOutbox(orderData) {
    if (!orderData || !orderData.orderId) return;
    const current = this.getOutbox();
    if (!current.some(o => o.orderId === orderData.orderId)) {
      current.push({ ...orderData, queuedAt: Date.now() });
      this.saveOutbox(current);
      console.log(`[Store Outbox] Order ${orderData.orderId} queued for background delivery.`);
    }
  },

  removeFromOutbox(orderId) {
    if (!orderId) return;
    const current = this.getOutbox();
    const updated = current.filter(o => o.orderId !== orderId);
    this.saveOutbox(updated);
  },

  async processOutbox() {
    const outbox = this.getOutbox();
    if (!outbox || outbox.length === 0) return 0;

    // Safety guard: do not release queued orders if store has paused orders or subscription suspended
    const settings = this.getSettings();
    if (settings && settings.isOrderingPaused) {
      console.warn("[Store Outbox] Ordering is currently paused; holding queued orders in outbox.");
      return 0;
    }
    const slug = this.getRestaurantSlug();
    if (this.isSubscriptionSuspended(slug)) {
      console.warn("[Store Outbox] Subscription is suspended; holding queued orders in outbox.");
      return 0;
    }

    let syncedCount = 0;

    for (const order of [...outbox]) {
      try {
        const success = await this.pushOrderToCloud(order);
        if (success) {
          this.removeFromOutbox(order.orderId);
          syncedCount++;
          console.log(`[Store Outbox] Successfully delivered queued order ${order.orderId}`);
          window.dispatchEvent(new CustomEvent('harpy_outbox_synced', { detail: order }));
        }
      } catch (e) {
        console.warn(`[Store Outbox] Delivery attempt failed for ${order.orderId}:`, e);
      }
    }
    return syncedCount;
  },

  syncOrdersFromCloud(slug, onOrdersUpdate) {
    if (!slug) return () => {};
    let isDestroyed = false;
    let pollTimer = null;
    let lastKnownOrdersHash = '';

    // Initialize with cached orders hash to prevent redundant table wipe on startup
    try {
      const curOrders = this.getOrders();
      if (curOrders && curOrders.length > 0) {
        lastKnownOrdersHash = JSON.stringify(curOrders.map(o => ({ id: o.orderId, st: o.status, t: o.timestampUpdated || o.timestamp })));
      }
    } catch(e) {}

    const handleOrdersPayload = (data) => {
      if (isDestroyed || !data) return;
      const now = Date.now();
      const deletedIds = this.getDeletedOrderIds(slug);
      const entries = Object.entries(data);
      const ordersList = entries.map(([fbKey, o]) => {
        if (!o || typeof o !== 'object') return null;

        // Auto-clean: skip corrupt keys named "undefined" with empty data
        if (fbKey === 'undefined' && (!o.items || o.items.length === 0) && (!o.customer || !o.customer.phone)) {
          // Trigger async delete of ghost undefined record from cloud
          if (db) { try { db.ref(`restaurants/${slug}/orders/undefined`).remove(); } catch(e) {} }
          try { fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/undefined.json`, { method: 'DELETE', keepalive: true }).catch(() => {}); } catch(e) {}
          return null;
        }

        const resolvedId = o.orderId || o.id || (fbKey !== 'undefined' ? fbKey : `#ORD-${Date.now().toString().slice(-4)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
        const cid = resolvedId.replace(/[^a-zA-Z0-9_-]/g, '');

        // If order was marked as deleted, ensure cloud is cleaned and NEVER let it enter the UI
        if (deletedIds.has(cid) || deletedIds.has(resolvedId) || deletedIds.has(fbKey) || (o.id && deletedIds.has(o.id))) {
          if (db) { try { db.ref(`restaurants/${slug}/orders/${fbKey}`).remove(); } catch(e) {} }
          try { fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${fbKey}.json`, { method: 'DELETE', keepalive: true }).catch(() => {}); } catch(e) {}
          return null;
        }

        const lock = this.orderStatusLocks && (this.orderStatusLocks[cid] || this.orderStatusLocks[fbKey]);
        let finalStatus = o.status || 'pending';
        if (lock && (now - lock.timestamp < 3500)) {
          finalStatus = lock.status;
        }
        return {
          ...o,
          _fbKey: fbKey,
          orderId: resolvedId,
          status: finalStatus
        };
      }).filter(Boolean).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      const hash = JSON.stringify(ordersList.map(o => ({ id: o.orderId, st: o.status, t: o.timestampUpdated || o.timestamp })));
      if (hash !== lastKnownOrdersHash) {
        lastKnownOrdersHash = hash;
        this.saveOrders(ordersList);
        if (typeof onOrdersUpdate === 'function') {
          onOrdersUpdate(ordersList);
        }
      }
    };

    // 1. WebSocket Realtime Channel (Sub-50ms when active)
    let ordersRef = null;
    let wsCallback = null;

    const setupWsListener = () => {
      if (!db || isDestroyed) return;
      const currentUser = (window.firebase && firebase.auth && firebase.auth().currentUser) || null;
      if (!currentUser) {
        // Do not attach secured orders listener before Firebase Auth is ready to avoid PERMISSION_DENIED drop
        return;
      }
      if (ordersRef && wsCallback) {
        try { ordersRef.off('value', wsCallback); } catch(e) {}
      }
      try {
        ordersRef = db.ref(`restaurants/${slug}/orders`);
        wsCallback = snapshot => {
          handleOrdersPayload(snapshot.val() || {});
        };
        ordersRef.on('value', wsCallback, err => {
          console.warn("[Store] Orders WS listener notice:", err ? (err.message || err.code || err) : err);
          if (err && (err.code === 'PERMISSION_DENIED' || String(err).includes('permission_denied'))) {
            if (window.firebase && firebase.auth && firebase.auth().currentUser) {
              firebase.auth().currentUser.getIdToken(true).then(() => {
                if (!isDestroyed) {
                  setupWsListener();
                  fetchOrdersFast();
                }
              }).catch(() => {});
            }
          }
        });
        this.activeListeners.orders = { ref: ordersRef, callback: wsCallback };
      } catch (e) {
        console.warn("[Store] Failed to attach orders WS listener:", e);
      }
    };

    // 2. High-Frequency REST Heartbeat Pulse (Every 4.0 seconds fallback with token-aware burst)
    const fetchOrdersFast = async () => {
      if (isDestroyed) return;
      try {
        let authParam = '';
        try {
          if (window.firebase && firebase.auth && firebase.auth().currentUser) {
            const idToken = await firebase.auth().currentUser.getIdToken();
            if (idToken) authParam = `auth=${encodeURIComponent(idToken)}`;
          }
        } catch(e) {}
        if (!authParam) {
          // Without an active auth token, secured RTDB orders endpoint will reject; avoid unnecessary 401 spam
          return;
        }
        const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${encodeURIComponent(slug)}/orders.json?${authParam}`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            console.log(`[Store Orders REST] Success: received ${Object.keys(data).length} orders for ${slug}`);
            handleOrdersPayload(data);
          }
        } else {
          console.warn(`[Store Orders REST] Failed: HTTP ${res.status} for ${slug}`);
          if (res.status === 401 && window.firebase && firebase.auth && firebase.auth().currentUser) {
            try {
              await firebase.auth().currentUser.getIdToken(true);
              setTimeout(() => { if (!isDestroyed) fetchOrdersFast(); }, 400);
            } catch(e) {}
          }
        }
      } catch (e) {
        console.warn("[Store Orders REST] Exception:", e.message);
      }
    };

    // If currentUser is already present, attach and fetch immediately
    if (window.firebase && firebase.auth && firebase.auth().currentUser) {
      setupWsListener();
      fetchOrdersFast();
    }

    // Dynamically re-bind WebSocket listener as soon as Firebase Auth state changes
    let authUnsubscribe = null;
    if (window.firebase && firebase.auth) {
      try {
        authUnsubscribe = firebase.auth().onAuthStateChanged(user => {
          if (isDestroyed) return;
          if (user) {
            setupWsListener();
            fetchOrdersFast();
          }
        });
      } catch(e) {}
    }

    pollTimer = setInterval(fetchOrdersFast, 4000);

    return () => {
      isDestroyed = true;
      if (pollTimer) clearInterval(pollTimer);
      if (authUnsubscribe) { try { authUnsubscribe(); } catch(e) {} }
      if (ordersRef && wsCallback) {
        try { ordersRef.off('value', wsCallback); } catch(e) {}
      }
    };
  },

  async updateOrderStatus(orderId, newStatus) {
    const slug = this.getRestaurantSlug();
    if (!orderId || !slug) return false;
    const cleanId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');
    const nowIso = new Date().toISOString();
    const nowTs = Date.now();

    // 1. Update local cache immediately for instant admin response
    let targetFbKey = cleanId;
    try {
      this.orderStatusLocks[cleanId] = { status: newStatus, timestamp: nowTs };
      this._memoryCache.orders = null;
      const cached = this.getOrders(true);
      const order = cached.find(o => 
        o.orderId === orderId || 
        o.orderId === `#${cleanId}` || 
        o.id === orderId || 
        o._fbKey === orderId || 
        (o.orderId && String(o.orderId).replace(/[^a-zA-Z0-9_-]/g, '') === cleanId)
      );
      if (order) {
        order.status = newStatus;
        order.updatedAt = nowIso;
        order.timestampUpdated = nowTs;
        if (order._fbKey) targetFbKey = order._fbKey;
        this.saveOrders(cached);
        if (newStatus === 'preparing' || newStatus === 'out_for_delivery' || newStatus === 'delivered' || newStatus === 'completed') {
          try {
            this.depleteRawMaterialsForOrder(order).catch(e => console.warn('[Deplete]', e));
          } catch(e) {}
        }
      }

      // Update client's lastOrder across all known multi-tenant and fallback keys
      this._memoryCache.lastOrder = null;
      const lastOrder = this.getLastOrder(true);
      if (lastOrder) {
        const lastClean = String(lastOrder.orderId || lastOrder.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
        if (lastOrder.orderId === orderId || lastClean === cleanId || lastOrder.id === orderId) {
          lastOrder.status = newStatus;
          lastOrder.updatedAt = nowIso;
          lastOrder.timestampUpdated = nowTs;
          this.saveLastOrder(lastOrder);
        }
      }

      // Persist status lock and update all keys in localStorage containing last_order
      try {
        const lockJson = JSON.stringify({ status: newStatus, timestamp: nowTs });
        this.safeSetItem('harpy_status_lock_' + cleanId, lockJson);
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.includes('last_order')) {
            try {
              const item = JSON.parse(localStorage.getItem(k));
              if (item) {
                const itemClean = String(item.orderId || item.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
                if (item.orderId === orderId || itemClean === cleanId || item.id === orderId) {
                  item.status = newStatus;
                  item.updatedAt = nowIso;
                  item.timestampUpdated = nowTs;
                  localStorage.setItem(k, JSON.stringify(item));
                }
              }
            } catch(e) {}
          }
        }
      } catch(e) {}

      // Update order history if present
      const history = this.getOrderHistory();
      if (Array.isArray(history)) {
        let histChanged = false;
        history.forEach(h => {
          const hClean = String(h.orderId || h.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
          if (h.orderId === orderId || hClean === cleanId || h.id === orderId) {
            h.status = newStatus;
            h.updatedAt = nowIso;
            h.timestampUpdated = nowTs;
            histChanged = true;
          }
        });
        if (histChanged) {
          this.safeSetItem(this.getKey('harpy_order_history'), JSON.stringify(history));
          this.safeSetItem('harpy_demo_harpy_order_history', JSON.stringify(history));
          this.safeSetItem('harpy_order_history', JSON.stringify(history));
        }
      }

      // Instant local broadcast for cross-tab and cross-view syncing
      const broadcastData = { orderId, cleanId, status: newStatus, timestamp: nowTs };
      this.safeSetItem('harpy_order_status_broadcast', JSON.stringify(broadcastData));
      window.dispatchEvent(new CustomEvent('harpy_order_status_updated', { detail: broadcastData }));
    } catch(e) {}

    const patchPayload = {
      status: newStatus,
      updatedAt: nowIso,
      timestampUpdated: nowTs
    };
    try {
      const cachedOrders = this.getOrders(true);
      const matchedOrder = cachedOrders.find(o => (o.orderId || o.id) === orderId || (o.orderId && String(o.orderId).replace(/[^a-zA-Z0-9_-]/g, '') === cleanId));
      if (matchedOrder && matchedOrder.rawMaterialsDepleted) {
        patchPayload.rawMaterialsDepleted = true;
      }
    } catch(e) {}

    // 2. Instant Parallel Cloud Dispatch: SDK + REST PATCH
    if (db) {
      try {
        db.ref(`restaurants/${slug}/orders/${cleanId}`).update(patchPayload);
        if (targetFbKey && targetFbKey !== cleanId) {
          db.ref(`restaurants/${slug}/orders/${targetFbKey}`).update(patchPayload);
        }
      } catch (err) {
        console.warn("[Store] Update order status SDK notice:", err);
      }
    }

    try {
      let authQuery = '';
      try {
        if (window.firebase && firebase.auth && firebase.auth().currentUser) {
          const idToken = await firebase.auth().currentUser.getIdToken();
          if (idToken) authQuery = `?auth=${idToken}`;
        }
      } catch(e) {}

      fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${cleanId}.json${authQuery}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchPayload),
        keepalive: true
      }).catch(() => {});

      if (targetFbKey && targetFbKey !== cleanId) {
        fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${targetFbKey}.json${authQuery}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchPayload),
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {}

    return true;
  },

  async deleteOrder(orderId) {
    const slug = this.getRestaurantSlug();
    if (!orderId || !slug) return false;
    const cleanId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');

    // 1. Mark permanently in local and cloud tombstones (Blacklist)
    this.addDeletedOrderId(slug, cleanId);
    this.addDeletedOrderId(slug, orderId);

    // 2. Synchronously purge from memory and local cache immediately (0ms)
    let targetFbKey = cleanId;
    try {
      const cached = this.getOrders();
      const target = cached.find(o => {
        if (!o) return false;
        const oClean = String(o.orderId || o.id || o._fbKey || '').replace(/[^a-zA-Z0-9_-]/g, '');
        return oClean === cleanId || o.orderId === orderId || o.id === orderId || o._fbKey === orderId;
      });
      if (target && target._fbKey) targetFbKey = target._fbKey;

      const updated = cached.filter(o => {
        if (!o) return false;
        const oClean = String(o.orderId || o.id || o._fbKey || '').replace(/[^a-zA-Z0-9_-]/g, '');
        return (target ? o !== target : true) &&
               oClean !== cleanId &&
               o.id !== orderId &&
               o.orderId !== orderId && 
               o.orderId !== `#${cleanId}` && 
               o._fbKey !== orderId && 
               o._fbKey !== targetFbKey && 
               !(orderId === 'undefined' && (!o.orderId || o.orderId === 'undefined'));
      });
      this.saveOrders(updated);
    } catch(e) {}

    // 3. Purge from background offline Outbox
    try {
      this.removeFromOutbox(orderId);
      this.removeFromOutbox(cleanId);
      this.removeFromOutbox(`#${cleanId}`);
    } catch(e) {}

    // 4. Purge from customer Last Order & Re-order History
    try {
      const lastOrder = this.getLastOrder();
      if (lastOrder) {
        const lClean = String(lastOrder.orderId || lastOrder.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
        if (lClean === cleanId || lastOrder.orderId === orderId || lastOrder.id === orderId) {
          this.saveLastOrder(null);
        }
      }
      const history = this.getOrderHistory();
      if (Array.isArray(history) && history.length > 0) {
        const updatedHist = history.filter(h => {
          const hClean = String(h.orderId || h.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
          return hClean !== cleanId && h.orderId !== orderId && h.id !== orderId;
        });
        this.safeSetItem(this.getKey('harpy_order_history'), JSON.stringify(updatedHist));
      }
      localStorage.removeItem('harpy_status_lock_' + cleanId);
      localStorage.removeItem('harpy_status_lock_' + orderId);
    } catch(e) {}

    // 5. Broadcast instant deletion events
    window.dispatchEvent(new CustomEvent('harpy_order_deleted', { detail: { orderId, cleanId } }));
    window.dispatchEvent(new Event('store_last_order_updated'));

    // 6. Parallel cloud deletion across all key variants
    const keysToDelete = new Set([cleanId, targetFbKey, orderId, `#${cleanId}`]);
    if (orderId === 'undefined' || cleanId === 'undefined') {
      keysToDelete.add('undefined');
    }

    let authQuery = '';
    try {
      if (window.firebase && firebase.auth && firebase.auth().currentUser) {
        const idToken = await firebase.auth().currentUser.getIdToken();
        if (idToken) authQuery = `?auth=${idToken}`;
      }
    } catch(e) {}

    keysToDelete.forEach(k => {
      if (!k) return;
      if (db) {
        try {
          db.ref(`restaurants/${slug}/orders/${k}`).remove();
        } catch (err) {
          console.warn("[Store] Delete order SDK notice:", err);
        }
      }
      try {
        fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${k}.json${authQuery}`, {
          method: 'DELETE',
          keepalive: true
        }).catch(() => {});
      } catch (e) {}
    });

    return true;
  },

  subscribeToOrder(slug, orderId, onUpdate) {
    if (!slug || !orderId) return () => {};
    let isDestroyed = false;
    let pollTimer = null;
    const cleanId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');
    let lastKnownOrderHash = '';

    const STATUS_RANK = {
      pending: 1,
      preparing: 2,
      out_for_delivery: 3,
      delivered: 4,
      cancelled: 5
    };

    const handleOrderPayload = (data) => {
      if (isDestroyed || !data) return;

      // Monotonic guard: Never demote if local status lock or stored order is ahead
      const lockKey = 'harpy_status_lock_' + cleanId;
      try {
        const rawLock = localStorage.getItem(lockKey);
        if (rawLock) {
          const lock = JSON.parse(rawLock);
          if (lock && lock.status && (STATUS_RANK[lock.status] || 1) > (STATUS_RANK[data.status] || 1)) {
            data.status = lock.status;
            if (lock.timestamp) {
              data.updatedAt = new Date(lock.timestamp).toISOString();
              data.timestampUpdated = lock.timestamp;
            }
          }
        }
      } catch(e) {}

      try {
        const curLast = this.getLastOrder();
        if (curLast) {
          const curClean = String(curLast.orderId || curLast.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
          if ((curClean === cleanId || curLast.orderId === orderId) && (STATUS_RANK[curLast.status] || 1) > (STATUS_RANK[data.status] || 1)) {
            data.status = curLast.status;
            if (curLast.updatedAt) data.updatedAt = curLast.updatedAt;
            if (curLast.timestampUpdated) data.timestampUpdated = curLast.timestampUpdated;
          }
        }
      } catch(e) {}

      const hash = JSON.stringify({ st: data.status, upd: data.updatedAt || data.timestampUpdated, tot: data.finalTotal });
      if (hash !== lastKnownOrderHash) {
        lastKnownOrderHash = hash;
        if (typeof onUpdate === 'function') {
          onUpdate(data);
        }
      }
    };

    // 1. Instant Cross-Tab Storage Listener
    const storageHandler = (e) => {
      if (isDestroyed) return;
      if (!e.key || e.key.includes('last_order') || e.key.includes('orders') || e.key.includes('order_status_broadcast') || e.key.includes('order_history')) {
        this._memoryCache.lastOrder = null;
        this._memoryCache.orders = null;
        const lastOrder = this.getLastOrder(true);
        if (lastOrder && (lastOrder.orderId === orderId || String(lastOrder.orderId).replace(/[^a-zA-Z0-9_-]/g, '') === cleanId)) {
          handleOrderPayload(lastOrder);
          return;
        }
        const cached = this.getOrders(true);
        const found = cached.find(o => o.orderId === orderId || String(o.orderId || '').replace(/[^a-zA-Z0-9_-]/g, '') === cleanId);
        if (found) {
          handleOrderPayload(found);
        }
      }
    };
    window.addEventListener('storage', storageHandler);

    // 2. Same-Window Custom Event Listener
    const customEventHandler = (e) => {
      if (isDestroyed || !e.detail) return;
      if (e.detail.orderId === orderId || e.detail.cleanId === cleanId) {
        this._memoryCache.lastOrder = null;
        this._memoryCache.orders = null;
        const lastOrder = this.getLastOrder(true);
        if (lastOrder) handleOrderPayload(lastOrder);
      }
    };
    window.addEventListener('harpy_order_status_updated', customEventHandler);

    // 3. Local High-Frequency Poll (800ms) for instant local updates
    const localPollTimer = setInterval(() => {
      if (isDestroyed) return;
      this._memoryCache.lastOrder = null;
      const lastOrder = this.getLastOrder(true);
      if (lastOrder && (lastOrder.orderId === orderId || String(lastOrder.orderId).replace(/[^a-zA-Z0-9_-]/g, '') === cleanId)) {
        handleOrderPayload(lastOrder);
      }
    }, 800);

    // 4. WebSocket Listener (Primary Cloud)
    let orderRef = null;
    let wsCallback = null;
    try {
      if (db) {
        orderRef = db.ref(`restaurants/${slug}/orders/${cleanId}`);
        wsCallback = snap => {
          const val = snap.val();
          if (!val) {
            // Order was deleted in cloud!
            const delIds = this.getDeletedOrderIds(slug);
            delIds.add(cleanId);
            delIds.add(orderId);
            this.safeSetItem(`harpy_${slug}_deleted_order_ids`, JSON.stringify(Array.from(delIds)));
            this.saveLastOrder(null);
            if (typeof onUpdate === 'function') {
              onUpdate({ status: 'deleted', deleted: true, orderId: orderId });
            }
            return;
          }
          handleOrderPayload(val);
        };
        orderRef.on('value', wsCallback);
      }
    } catch (e) {}

    // 5. Cloud REST Tracker Pulse (3.5s fallback)
    const fetchOrderFast = async () => {
      if (isDestroyed) return;
      try {
        const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${cleanId}.json`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (!data) {
            const delIds = this.getDeletedOrderIds(slug);
            delIds.add(cleanId);
            delIds.add(orderId);
            this.safeSetItem(`harpy_${slug}_deleted_order_ids`, JSON.stringify(Array.from(delIds)));
            this.saveLastOrder(null);
            if (typeof onUpdate === 'function') {
              onUpdate({ status: 'deleted', deleted: true, orderId: orderId });
            }
            return;
          }
          handleOrderPayload(data);
        }
      } catch (e) {}
    };

    fetchOrderFast();
    pollTimer = setInterval(fetchOrderFast, 3500);

    return () => {
      isDestroyed = true;
      if (pollTimer) clearInterval(pollTimer);
      if (localPollTimer) clearInterval(localPollTimer);
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('harpy_order_status_updated', customEventHandler);
      if (orderRef && wsCallback) {
        try { orderRef.off('value', wsCallback); } catch(e) {}
      }
    };
  },

  async verifyTenantOwnership(slug, userUid) {
    if (!db || !slug || !userUid) return { isOwner: false, mismatchConfirmed: false };
    try {
      // 1. Try checking licenses node first
      try {
        const licSnap = await db.ref(`licenses/${slug}/ownerUid`).once('value');
        const licUid = licSnap.val();
        if (licUid && licUid === userUid) return { isOwner: true, mismatchConfirmed: false };
        if (licUid && licUid !== userUid) {
          return { isOwner: false, mismatchConfirmed: true, ownerUid: licUid };
        }
      } catch(licErr) {}

      // 2. Check meta node
      const metaRef = db.ref(`restaurants/${slug}/meta`);
      const snap = await metaRef.once('value');
      if (!snap.exists()) {
        try {
          await metaRef.set({
            ownerUid: userUid,
            createdAt: new Date().toISOString()
          });
        } catch(setErr) {}
        return { isOwner: true, mismatchConfirmed: false };
      }
      const meta = snap.val() || {};
      if (!meta.ownerUid) {
        try {
          await metaRef.child('ownerUid').set(userUid);
        } catch(setErr) {}
        return { isOwner: true, mismatchConfirmed: false };
      }
      if (meta.ownerUid === userUid) {
        return { isOwner: true, mismatchConfirmed: false };
      } else {
        return { isOwner: false, mismatchConfirmed: true, ownerUid: meta.ownerUid };
      }
    } catch (err) {
      console.warn("[Store] Verify ownership network/transient warning:", err);
      return { isOwner: false, mismatchConfirmed: false, error: err.message };
    }
  },

  // ── Strict Multi-Tenant Restaurant Engine (Path, Query & Domain Support) ──
  getRestaurantSlug() {
    try {
      if (typeof window !== 'undefined' && window.__harpySlug) {
        return window.__harpySlug;
      }

      // 1. Query Parameter Resolution (?m=slug or ?restaurant=slug)
      const params = new URLSearchParams(window.location.search);
      let urlSlug = params.get('m') || params.get('restaurant') || params.get('store') || params.get('slug');

      // 2. Clean Path-based Resolution (e.g. harpymenu.com/saj or harpymenu.com/order/saj)
      if (!urlSlug && typeof window !== 'undefined' && window.location && window.location.pathname && window.location.protocol.startsWith('http')) {
        const pathParts = window.location.pathname.split('/').filter(p => p && !p.endsWith('.html') && p !== 'admin' && p !== 'order' && p.length > 1 && !/^[a-zA-Z]:$/.test(p));
        if (pathParts.length > 0) {
          const firstPart = pathParts[0].toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
          const reservedNames = ['css', 'js', 'assets', 'api', 'admin', 'manifest', 'sw', 'favicon', 'icons', 'products', 'portfolio', 'order', 'links', 'github', 'io', 'c', 'd', 'e', 'users', 'desktop'];
          if (firstPart && firstPart.length > 1 && !reservedNames.includes(firstPart)) {
            urlSlug = firstPart;
          }
        }
      }

      // 4. Subdomain Resolution Fallback (e.g. saj.harpymenu.com)
      if (!urlSlug && typeof window !== 'undefined' && window.location && window.location.hostname) {
        const host = window.location.hostname.toLowerCase();
        if (host.includes('harpymenu.com') && !host.startsWith('www.') && host !== 'harpymenu.com') {
          const subdomain = host.split('.')[0].trim().replace(/[^a-z0-9_-]/g, '');
          if (subdomain && subdomain !== 'www' && subdomain !== 'order' && subdomain !== 'api') {
            urlSlug = subdomain;
          }
        }
      }

      // 5. Standalone PWA or LocalStorage Active Slug Recovery
      if (!urlSlug && typeof window !== 'undefined' && window.localStorage) {
        urlSlug = localStorage.getItem('harpy_active_slug') ||
                  localStorage.getItem('harpy_admin_active_slug') ||
                  localStorage.getItem('harpy_customer_installed_slug') ||
                  localStorage.getItem('harpy_admin_installed_slug') ||
                  localStorage.getItem('harpy_last_visited_slug');
      }

      if (urlSlug) {
        const clean = urlSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        if (clean) {
          if (typeof window !== 'undefined') window.__harpySlug = clean;
          this.safeSetItem('harpy_active_slug', clean);
          this.registerRestaurant(clean);
          return clean;
        }
      }
    } catch {}

    const fallbackSlug = 'saj';
    if (typeof window !== 'undefined') window.__harpySlug = fallbackSlug;
    return fallbackSlug;
  },

  setRestaurantSlug(slug) {
    const clean = (slug || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (clean) {
      this.clearMemoryCache();
      this.safeSetItem('harpy_active_slug', clean);
      this.registerRestaurant(clean);
      this.applyTheme();
      window.dispatchEvent(new CustomEvent('harpy_restaurant_changed', { detail: clean }));
    }
  },

  registerRestaurant(slug, customName = null) {
    let list = this.getAllRestaurants();
    const existing = list.find(r => r.slug === slug);
    if (!existing) {
      const name = customName || `مطعم ${slug}`;
      list.push({ slug, name });
      this.safeSetItem('harpy_restaurants_list', JSON.stringify(list));
    } else if (customName && existing.name !== customName) {
      existing.name = customName;
      this.safeSetItem('harpy_restaurants_list', JSON.stringify(list));
    }
  },

  getAllRestaurants() {
    const raw = localStorage.getItem('harpy_restaurants_list');
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getKey(baseKey) {
    const slug = this.getRestaurantSlug();
    return `harpy_${slug}_${baseKey}`;
  },

  stripEmojiNoise(text) {
    if (!text || typeof text !== 'string') return text || '';
    try {
      return text
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/[\uFE0E\uFE0F\u200D]/g, '')
        .replace(/[\u2B50\u2700-\u27BF\uE000-\uF8FF\u2600-\u26FF]/g, '')
        .replace(/^[•\s\-_–—]+/, '')
        .replace(/\s+/g, ' ')
        .trim();
    } catch(e) {
      return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uD000-\uDFFF]|\u2B50)/g, '').replace(/^[•\s\-_–—]+/, '').replace(/\s+/g, ' ').trim();
    }
  },

  getSettings() {
    if (this._memoryCache.settings !== null) {
      return this._memoryCache.settings;
    }
    const slug = this.getRestaurantSlug();
    const isDemo = (slug === 'demo');
    const defaults = isDemo ? DEFAULT_SETTINGS : BLANK_SETTINGS;
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.SETTINGS));
    let parsed = { ...defaults };
    if (raw) {
      try {
        parsed = { ...defaults, ...JSON.parse(raw) };
      } catch(e) {}
    }

    if (!isDemo) {
      if (parsed.storeName === DEFAULT_SETTINGS.storeName) parsed.storeName = "";
      if (parsed.whatsappNumber === DEFAULT_SETTINGS.whatsappNumber) parsed.whatsappNumber = "";
      if (parsed.walletNumber === DEFAULT_SETTINGS.walletNumber) parsed.walletNumber = "";
      if (parsed.logo === DEFAULT_SETTINGS.logo) parsed.logo = "";
      if (parsed.cover === DEFAULT_SETTINGS.cover) parsed.cover = "";
      if (parsed.announcementText === DEFAULT_SETTINGS.announcementText) {
        parsed.announcementText = "";
        parsed.showAnnouncement = false;
      }
    }

    if (!parsed.storeName) {
      if (parsed.restaurantName || parsed.name) {
        parsed.storeName = parsed.restaurantName || parsed.name;
      } else if (isDemo) {
        parsed.storeName = DEFAULT_SETTINGS.storeName;
      } else {
        parsed.storeName = "";
      }
    }
    if (!parsed.whatsappNumber && parsed.phone) {
      parsed.whatsappNumber = parsed.phone;
    }
    if (!parsed.printerPaperSize) parsed.printerPaperSize = "80mm";

    if (parsed.storeName) parsed.storeName = this.stripEmojiNoise(parsed.storeName);
    if (parsed.storeTagline) parsed.storeTagline = this.stripEmojiNoise(parsed.storeTagline);
    if (parsed.announcementText) parsed.announcementText = this.stripEmojiNoise(parsed.announcementText);

    this._memoryCache.settings = parsed;
    return parsed;
  },

  async saveSettings(settings) {
    if (this._memoryCache.settings?.subscription && !settings.subscription) {
      settings.subscription = this._memoryCache.settings.subscription;
    }
    // Security: never persist legacy adminPin or third-party api keys in public settings node
    delete settings.adminPin;
    delete settings.imgbbApiKey;
    this._memoryCache.settings = settings;
    this.saveLocks.settings = true;
    this.safeSetItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(settings));
    this.lastSaveTimestamps.settings = Date.now();
    if (settings.storeName) {
      this.registerRestaurant(this.getRestaurantSlug(), settings.storeName);
    }
    this.applyTheme();
    window.dispatchEvent(new Event('store_settings_updated'));

    // Ultra-Fast Optimistic Flow: Push to cloud in background without blocking UI
    this.pushToCloud('settings', settings).then(cloudSuccess => {
      this.lastSaveTimestamps.settings = Date.now();
      this.saveLocks.settings = false;
    }).catch(err => {
      this.saveLocks.settings = false;
    });

    return { success: true, localSaved: true };
  },

  applyTheme() {
    const s = this.getSettings();
    const mode = this.getThemeMode();
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', mode);
    if (body) body.setAttribute('data-theme', mode);

    let preset;
    if (mode === 'light') {
      // In daylight mode, preset is ALWAYS the crisp daylight preset
      preset = 'cream';
    } else {
      // In night mode, use tenant's chosen dark preset, or fallback to 'charcoal' if not set or if set to 'cream'
      preset = (s.themePreset && s.themePreset !== 'cream') ? s.themePreset : 'charcoal';
    }
    root.setAttribute('data-theme-preset', preset);
    if (body) body.setAttribute('data-theme-preset', preset);

    const themeProps = [
      '--bg', '--bg-subtle', '--surface', '--surface-raised', '--surface-hover',
      '--header-bg', '--text-main', '--text-body', '--text-muted', '--text-faint',
      '--border', '--border-strong', '--primary', '--primary-hover', '--primary-subtle', '--primary-glow', '--border-focus'
    ];
    themeProps.forEach(p => {
      root.style.removeProperty(p);
      if (body) body.style.removeProperty(p);
    });

    let primaryColor = s.siteColors?.primary;
    if (!primaryColor || primaryColor === '#ea580c' || primaryColor === '#c2410c') {
      if (mode === 'dark' && THEME_PRESETS[preset]?.primary) {
        primaryColor = THEME_PRESETS[preset].primary;
      } else {
        primaryColor = '#FF6A00';
      }
    }
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-hover', primaryColor);
    root.style.setProperty('--border-focus', primaryColor);

    // Dynamic clean RGBA derivations for subtle and glow
    let primaryGlow = `${primaryColor}44`;
    let primarySubtle = `${primaryColor}22`;
    if (primaryColor.startsWith('#') && primaryColor.length === 7) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        primaryGlow = `rgba(${r}, ${g}, ${b}, 0.28)`;
        primarySubtle = `rgba(${r}, ${g}, ${b}, 0.12)`;
      }
    }
    root.style.setProperty('--primary-glow', primaryGlow);
    root.style.setProperty('--primary-subtle', primarySubtle);

    if (s.siteColors) {
      const c = { ...s.siteColors };

      // Upgrade legacy brown/charcoal palette to modern obsidian mockup palette
      if (c.bg === '#120e0c') c.bg = '#070B13';
      if (c.surface === '#1e1814') c.surface = '#0E1726';
      if (c.surfaceRaised === '#28201a') c.surfaceRaised = '#142034';
      if (c.headerBg === '#120e0c') c.headerBg = '#070B13';
      if (c.textMain === '#faf6f0') c.textMain = '#ffffff';
      if (c.textBody === '#d4c9ba') c.textBody = '#e2e8f0';

      // Upgrade legacy warm cream to crisp modern daylight
      if (c.bg === '#f8f6f0') c.bg = '#F8FAFC';
      if (c.surfaceRaised === '#f3ede2') c.surfaceRaised = '#F8FAFC';
      if (c.textMain === '#18130f') c.textMain = '#0F172A';
      if (c.textBody === '#3d332a') c.textBody = '#334155';

      let isDarkPalette = true;
      if (c.id === 'cream' || c.bg === '#F8FAFC') {
        isDarkPalette = false;
      } else if (c.bg && c.bg.startsWith('#') && c.bg.length === 7) {
        const r = parseInt(c.bg.slice(1, 3), 16);
        const g = parseInt(c.bg.slice(3, 5), 16);
        const b = parseInt(c.bg.slice(5, 7), 16);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        isDarkPalette = (lum < 0.5);
      }

      // If in dark mode and palette is dark, OR in light mode and palette is light:
      // apply custom surfaces and backgrounds.
      const shouldApplyCustomSurfaces = (mode === 'dark' && isDarkPalette) || (mode === 'light' && !isDarkPalette);

      if (shouldApplyCustomSurfaces) {
        if (c.bg) {
          root.style.setProperty('--bg', c.bg);
          root.style.setProperty('--header-bg', c.headerBg || c.bg);
          root.style.setProperty('--bg-subtle', c.bgSubtle || c.surface || c.bg);
        }
        if (c.surface) {
          root.style.setProperty('--surface', c.surface);
          root.style.setProperty('--surface-raised', c.surfaceRaised || c.surface);
          root.style.setProperty('--surface-hover', c.surfaceHover || c.surfaceRaised || c.surface);
        }
        if (c.textMain) {
          root.style.setProperty('--text-main', c.textMain);
        }
        if (c.textBody) {
          root.style.setProperty('--text-body', c.textBody);
        }
        if (c.border) {
          root.style.setProperty('--border', c.border);
          root.style.setProperty('--border-strong', c.borderStrong || c.border);
        }
      }
    }
  },

  getCategories() {
    const slug = this.getRestaurantSlug();
    const isDemo = (slug === 'demo');
    const defaultCategories = isDemo ? DEFAULT_CATEGORIES : [];
    if (this._memoryCache.categories !== null) {
      if (isDemo && (!this._memoryCache.categories || this._memoryCache.categories.length === 0)) {
        this._memoryCache.categories = defaultCategories;
      }
      return this._memoryCache.categories;
    }
    let raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CATEGORIES));
    if (!raw && slug) {
      raw = localStorage.getItem(`harpy_${slug}_categories`) || localStorage.getItem('harpy_categories');
    }
    if (!raw) {
      if (isDemo) {
        this._memoryCache.categories = defaultCategories;
      }
      return defaultCategories;
    }
    try {
      const parsed = JSON.parse(raw);
      let res = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultCategories);
      if (isDemo && (!res || res.length === 0)) {
        res = defaultCategories;
      }
      res = res.map(c => this.stripEmojiNoise(typeof c === 'string' ? c : (c?.name || ''))).filter(Boolean);
      this._memoryCache.categories = res;
      return res;
    } catch {
      const cleanDefaults = defaultCategories.map(c => this.stripEmojiNoise(typeof c === 'string' ? c : (c?.name || ''))).filter(Boolean);
      if (isDemo) this._memoryCache.categories = cleanDefaults;
      return cleanDefaults;
    }
  },

  async saveCategories(cats) {
    const slug = this.getRestaurantSlug();
    this._memoryCache.categories = cats;
    this.saveLocks.categories = true;
    this.safeSetItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(cats));
    if (slug) this.safeSetItem(`harpy_${slug}_categories`, JSON.stringify(cats));
    this.lastSaveTimestamps.categories = Date.now();
    window.dispatchEvent(new Event('store_categories_updated'));

    // Ultra-Fast Optimistic Flow: Push to cloud in background without blocking UI
    this.pushToCloud('categories', cats).then(cloudSuccess => {
      this.lastSaveTimestamps.categories = Date.now();
      this.saveLocks.categories = false;
    }).catch(err => {
      this.saveLocks.categories = false;
    });

    return { success: true, localSaved: true };
  },

  getProducts() {
    const slug = this.getRestaurantSlug();
    const isDemo = (slug === 'demo');
    const defaultProducts = isDemo ? DEFAULT_PRODUCTS : [];
    if (this._memoryCache.products !== null) {
      if (isDemo && (!this._memoryCache.products || this._memoryCache.products.length === 0)) {
        this._memoryCache.products = defaultProducts;
      }
      return this._memoryCache.products;
    }
    let raw = localStorage.getItem(this.getKey(STORAGE_KEYS.PRODUCTS));
    if (!raw && slug) {
      raw = localStorage.getItem(`harpy_${slug}_products`) || localStorage.getItem('harpy_products');
    }
    if (!raw) {
      if (isDemo) {
        this._memoryCache.products = defaultProducts;
      }
      return defaultProducts;
    }
    try {
      const parsed = JSON.parse(raw);
      let res = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultProducts);
      if (isDemo && (!res || res.length === 0)) {
        res = defaultProducts;
      }
      res = res.map(p => {
        if (!p || typeof p !== 'object') return p;
        if (p.name) p.name = this.stripEmojiNoise(p.name);
        if (p.badge) p.badge = this.stripEmojiNoise(p.badge);
        if (p.category) p.category = this.stripEmojiNoise(p.category);
        return p;
      });
      this._memoryCache.products = res;
      return res;
    } catch {
      if (isDemo) this._memoryCache.products = defaultProducts;
      return defaultProducts;
    }
  },

  async saveProducts(prods) {
    const slug = this.getRestaurantSlug();
    this._memoryCache.products = prods;
    this.saveLocks.products = true;
    this.safeSetItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(prods));
    if (slug) this.safeSetItem(`harpy_${slug}_products`, JSON.stringify(prods));
    this.lastSaveTimestamps.products = Date.now();
    window.dispatchEvent(new Event('store_products_updated'));

    // Ultra-Fast Optimistic Flow: Push to cloud in background without blocking UI
    this.pushToCloud('products', prods).then(cloudSuccess => {
      this.lastSaveTimestamps.products = Date.now();
      this.saveLocks.products = false;
    }).catch(err => {
      this.saveLocks.products = false;
    });

    return { success: true, localSaved: true };
  },

  async addProduct(prod) {
    const prods = this.getProducts();
    prods.unshift(prod);
    return await this.saveProducts(prods);
  },

  async updateProduct(id, updatedProd) {
    const prods = this.getProducts().map(p => p.id === id ? { ...p, ...updatedProd } : p);
    return await this.saveProducts(prods);
  },

  async deleteProduct(id) {
    const prods = this.getProducts().filter(p => p.id !== id);
    return await this.saveProducts(prods);
  },

  // ═══════════════════════════════════════════════════════════
  // RAW MATERIALS & INVENTORY ENGINE
  // ═══════════════════════════════════════════════════════════
  getRawMaterials() {
    const slug = this.getRestaurantSlug();
    const isDemo = (slug === 'demo');
    const defaultMats = isDemo ? DEFAULT_RAW_MATERIALS : [];
    if (this._memoryCache.rawMaterials !== null) {
      if (isDemo && (!this._memoryCache.rawMaterials || this._memoryCache.rawMaterials.length === 0)) {
        this._memoryCache.rawMaterials = defaultMats;
      }
      return this._memoryCache.rawMaterials;
    }
    let raw = localStorage.getItem(this.getKey(STORAGE_KEYS.RAW_MATERIALS));
    if (!raw && slug) {
      raw = localStorage.getItem(`harpy_${slug}_raw_materials`);
    }
    if (!raw) {
      if (isDemo) {
        this._memoryCache.rawMaterials = defaultMats;
      }
      return defaultMats;
    }
    try {
      const parsed = JSON.parse(raw);
      let res = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultMats);
      if (isDemo && (!res || res.length === 0)) res = defaultMats;
      this._memoryCache.rawMaterials = res;
      return res;
    } catch {
      if (isDemo) this._memoryCache.rawMaterials = defaultMats;
      return defaultMats;
    }
  },

  async saveRawMaterials(materials) {
    const slug = this.getRestaurantSlug();
    this._memoryCache.rawMaterials = materials;
    this.saveLocks.rawMaterials = true;
    this.safeSetItem(this.getKey(STORAGE_KEYS.RAW_MATERIALS), JSON.stringify(materials));
    if (slug) this.safeSetItem(`harpy_${slug}_raw_materials`, JSON.stringify(materials));
    this.lastSaveTimestamps.rawMaterials = Date.now();
    window.dispatchEvent(new Event('store_raw_materials_updated'));

    // Ultra-Fast Optimistic Flow: Push to cloud in background without blocking UI
    this.pushToCloud('rawMaterials', materials).then(() => {
      this.lastSaveTimestamps.rawMaterials = Date.now();
      this.saveLocks.rawMaterials = false;
    }).catch(err => {
      this.saveLocks.rawMaterials = false;
    });

    return { success: true, localSaved: true };
  },

  async addRawMaterial(mat) {
    const mats = this.getRawMaterials();
    const stockVal = parseFloat(String(mat.stock || 0).replace(/,/g, '')) || 0;
    const alertVal = parseFloat(String(mat.minAlert || 0).replace(/,/g, '')) || 0;
    const costVal = parseFloat(String(mat.costPerUnit || 0).replace(/,/g, '')) || 0;
    const newMat = {
      id: mat.id || ('mat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
      name: (mat.name || '').trim(),
      unit: mat.unit || 'g', // g, kg, ml, L, pcs
      stock: stockVal,
      minAlert: alertVal,
      costPerUnit: costVal,
      updatedAt: new Date().toISOString()
    };
    mats.unshift(newMat);
    return await this.saveRawMaterials(mats);
  },

  async updateRawMaterial(id, updatedMat) {
    const mats = this.getRawMaterials().map(m => {
      if (m.id !== id) return m;
      const copy = { ...m, ...updatedMat };
      if ('stock' in updatedMat) copy.stock = parseFloat(String(updatedMat.stock).replace(/,/g, '')) || 0;
      if ('minAlert' in updatedMat) copy.minAlert = parseFloat(String(updatedMat.minAlert).replace(/,/g, '')) || 0;
      if ('costPerUnit' in updatedMat) copy.costPerUnit = parseFloat(String(updatedMat.costPerUnit).replace(/,/g, '')) || 0;
      copy.updatedAt = new Date().toISOString();
      return copy;
    });
    return await this.saveRawMaterials(mats);
  },

  async deleteRawMaterial(id) {
    const mats = this.getRawMaterials().filter(m => m.id !== id);
    return await this.saveRawMaterials(mats);
  },

  async restockRawMaterial(id, addedQuantity, note = '') {
    const qty = parseFloat(String(addedQuantity).replace(/,/g, ''));
    if (isNaN(qty) || qty <= 0) return { success: false, message: 'كمية التوريد غير صحيحة' };
    const mats = this.getRawMaterials();
    const target = mats.find(m => m.id === id);
    if (!target) return { success: false, message: 'المادة الخام غير موجودة' };
    target.stock = (parseFloat(String(target.stock).replace(/,/g, '')) || 0) + qty;
    target.updatedAt = new Date().toISOString();
    if (note) target.lastRestockNote = note;
    return await this.saveRawMaterials(mats);
  },

  // ── Smart Depletion Engine (Proportions per Size & Addon) ────
  _depletedOrderIds: null,
  getDepletedOrderIds() {
    if (this._depletedOrderIds) return this._depletedOrderIds;
    const slug = this.getRestaurantSlug();
    try {
      const raw = localStorage.getItem(`harpy_${slug}_depleted_order_ids`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          this._depletedOrderIds = new Set(arr);
          return this._depletedOrderIds;
        }
      }
    } catch (e) {}
    this._depletedOrderIds = new Set();
    return this._depletedOrderIds;
  },

  markOrderAsDepleted(orderId) {
    if (!orderId) return;
    const set = this.getDepletedOrderIds();
    set.add(orderId);
    const slug = this.getRestaurantSlug();
    try {
      const arr = Array.from(set).slice(-500);
      this.safeSetItem(`harpy_${slug}_depleted_order_ids`, JSON.stringify(arr));
    } catch(e) {}
  },

  async depleteRawMaterialsForOrder(order) {
    if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) return false;
    const orderId = order.orderId || order.id;
    if (!orderId) return false;

    // Strict double-depletion guard: only skip if order was already confirmed depleted
    if (order.rawMaterialsDepleted === true) {
      return false;
    }
    const depletedSet = this.getDepletedOrderIds();
    if (depletedSet.has(orderId) && order.rawMaterialsDepleted === true) {
      return false;
    }

    const mats = this.getRawMaterials();
    if (!mats || mats.length === 0) {
      // Materials not loaded yet - DO NOT add to depletedSet so it can be retried once materials sync!
      return false;
    }
    const matMap = new Map(mats.map(m => [String(m.id), m]));

    const allProducts = this.getProducts();
    const prodMap = new Map(allProducts.map(p => [String(p.id), p]));

    let anyDeducted = false;

    order.items.forEach(item => {
      const qty = parseInt(item.qty || item.quantity || 1, 10);
      if (qty <= 0) return;

      const prodId = String(item.productId || item.id || '');
      const itemName = String(item.name || '').trim().toLowerCase();
      // Match by ID or Name (case-insensitive & trimmed)
      const prod = prodMap.get(prodId) || allProducts.find(p => String(p.id) === prodId || String(p.name || '').trim().toLowerCase() === itemName);
      if (!prod || !prod.recipe) return;

      const recipe = prod.recipe;

      const deductMaterial = (materialId, amountVal) => {
        if (!materialId) return;
        const targetId = String(materialId);
        const mat = matMap.get(targetId) || mats.find(m => String(m.id) === targetId || String(m.name || '').trim().toLowerCase() === targetId.toLowerCase());
        if (mat) {
          const amt = parseFloat(String(amountVal).replace(/,/g, '').trim()) || 0;
          if (amt > 0) {
            const consumeAmount = amt * qty;
            const currentStock = parseFloat(String(mat.stock).replace(/,/g, '').trim()) || 0;
            const newStock = Math.max(0, Math.round((currentStock - consumeAmount) * 1000) / 1000);
            mat.stock = newStock;
            anyDeducted = true;
          }
        }
      };

      // 1. Base recipe items (deducted for all units of this product)
      if (Array.isArray(recipe.base)) {
        recipe.base.forEach(r => deductMaterial(r.materialId || r.matId || r.id, r.amount));
      }

      // 2. Per Size recipe items
      let selectedSizeName = '';
      if (item.selectedSize) {
        selectedSizeName = typeof item.selectedSize === 'object' ? (item.selectedSize.name || '') : String(item.selectedSize);
      } else if (item.size) {
        selectedSizeName = typeof item.size === 'object' ? (item.size.name || '') : String(item.size);
      }
      selectedSizeName = selectedSizeName.trim().toLowerCase();

      if (selectedSizeName && recipe.sizes && typeof recipe.sizes === 'object') {
        const sizeKey = Object.keys(recipe.sizes).find(k => k.trim().toLowerCase() === selectedSizeName);
        if (sizeKey && Array.isArray(recipe.sizes[sizeKey])) {
          recipe.sizes[sizeKey].forEach(r => deductMaterial(r.materialId || r.matId || r.id, r.amount));
        }
      }

      // 3. Per Addon recipe items
      const selectedAddons = item.selectedAddons || item.addons || [];
      if (Array.isArray(selectedAddons) && recipe.addons && typeof recipe.addons === 'object') {
        selectedAddons.forEach(addon => {
          const addonName = (typeof addon === 'string' ? addon : (addon.name || '')).trim().toLowerCase();
          if (!addonName) return;
          const addonKey = Object.keys(recipe.addons).find(k => k.trim().toLowerCase() === addonName);
          if (addonKey && Array.isArray(recipe.addons[addonKey])) {
            recipe.addons[addonKey].forEach(r => deductMaterial(r.materialId || r.matId || r.id, r.amount));
          }
        });
      }
    });

    if (anyDeducted) {
      order.rawMaterialsDepleted = true;
      depletedSet.add(orderId);
      this.markOrderAsDepleted(orderId);

      // Persist order status flag in orders cache
      try {
        const cached = this.getOrders(true);
        const target = cached.find(o => (o.orderId || o.id) === orderId);
        if (target) {
          target.rawMaterialsDepleted = true;
          this.safeSetItem(this.getKey('harpy_orders_cache'), JSON.stringify(cached));
        }
      } catch (e) {}

      await this.saveRawMaterials(Array.from(matMap.values()));
      return true;
    }
    return false;
  },

  getCart() {
    if (this._memoryCache.cart !== null) {
      return this._memoryCache.cart;
    }
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CART));
    try {
      const res = raw ? JSON.parse(raw) : [];
      this._memoryCache.cart = res;
      return res;
    } catch {
      this._memoryCache.cart = [];
      return [];
    }
  },
  saveCart(cart) {
    this._memoryCache.cart = cart || [];
    this.safeSetItem(this.getKey(STORAGE_KEYS.CART), JSON.stringify(cart || []));
    window.dispatchEvent(new Event('store_cart_updated'));
  },
  clearCart() {
    this._memoryCache.cart = [];
    localStorage.removeItem(this.getKey(STORAGE_KEYS.CART));
    window.dispatchEvent(new Event('store_cart_updated'));
  },

  getAppliedCoupon() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.APPLIED_COUPON));
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setAppliedCoupon(coupon) {
    if (coupon) {
      this.safeSetItem(this.getKey(STORAGE_KEYS.APPLIED_COUPON), JSON.stringify(coupon));
    } else {
      localStorage.removeItem(this.getKey(STORAGE_KEYS.APPLIED_COUPON));
    }
    window.dispatchEvent(new Event('store_coupon_updated'));
  },

  getFavorites() {
    if (this._memoryCache.favorites !== null) {
      return this._memoryCache.favorites;
    }
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.FAVORITES));
    try {
      const res = raw ? JSON.parse(raw) : [];
      this._memoryCache.favorites = res;
      return res;
    } catch {
      this._memoryCache.favorites = [];
      return [];
    }
  },
  toggleFavorite(productId) {
    let favs = this.getFavorites();
    if (favs.includes(productId)) {
      favs = favs.filter(id => id !== productId);
    } else {
      favs.push(productId);
    }
    this._memoryCache.favorites = favs;
    this.safeSetItem(this.getKey(STORAGE_KEYS.FAVORITES), JSON.stringify(favs));
    window.dispatchEvent(new Event('store_favorites_updated'));
    return favs.includes(productId);
  },
  isFavorite(productId) {
    return this.getFavorites().includes(productId);
  },

  getLastOrder(forceRefresh = false) {
    const slug = this.getRestaurantSlug();
    const delIds = this.getDeletedOrderIds(slug);

    if (!forceRefresh && this._memoryCache.lastOrder !== null) {
      const cur = this._memoryCache.lastOrder;
      const curCid = String(cur?.orderId || cur?.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
      if (cur && (delIds.has(curCid) || delIds.has(cur.orderId) || delIds.has(cur.id))) {
        this._memoryCache.lastOrder = null;
        this.saveLastOrder(null);
        return null;
      }
      return this._memoryCache.lastOrder;
    }
    let raw = localStorage.getItem(this.getKey(STORAGE_KEYS.LAST_ORDER));
    if (!raw) {
      raw = localStorage.getItem('harpy_last_order');
    }
    if (!raw && this.getRestaurantSlug() !== 'demo') {
      raw = localStorage.getItem('harpy_demo_harpy_order_last_order');
    }
    try {
      const res = raw ? JSON.parse(raw) : null;
      if (res && res.orderId) {
        const cleanId = String(res.orderId).replace(/[^a-zA-Z0-9_-]/g, '');
        if (delIds.has(cleanId) || delIds.has(res.orderId) || delIds.has(res.id)) {
          this._memoryCache.lastOrder = null;
          this.saveLastOrder(null);
          return null;
        }
        const lockRaw = localStorage.getItem('harpy_status_lock_' + cleanId);
        if (lockRaw) {
          try {
            const lock = JSON.parse(lockRaw);
            const statusRank = { pending: 1, preparing: 2, out_for_delivery: 3, delivered: 4, cancelled: 5 };
            if (lock && lock.status && (statusRank[lock.status] || 1) > (statusRank[res.status] || 1)) {
              res.status = lock.status;
              if (lock.timestamp) {
                res.updatedAt = new Date(lock.timestamp).toISOString();
                res.timestampUpdated = lock.timestamp;
              }
            }
          } catch(e) {}
        }
      }
      this._memoryCache.lastOrder = res;
      return res;
    } catch {
      this._memoryCache.lastOrder = null;
      return null;
    }
  },
  saveLastOrder(orderData) {
    this._memoryCache.lastOrder = orderData;
    if (orderData) {
      const json = JSON.stringify(orderData);
      this.safeSetItem(this.getKey(STORAGE_KEYS.LAST_ORDER), json);
      this.safeSetItem('harpy_last_order', json);
      this.safeSetItem('harpy_demo_harpy_order_last_order', json);
      this.addOrderToHistory(orderData);
    } else {
      localStorage.removeItem(this.getKey(STORAGE_KEYS.LAST_ORDER));
      localStorage.removeItem('harpy_last_order');
      localStorage.removeItem('harpy_demo_harpy_order_last_order');
    }
    window.dispatchEvent(new Event('store_last_order_updated'));
  },

  getOrderHistory() {
    const raw = localStorage.getItem(this.getKey('harpy_order_history'));
    try {
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        const slug = this.getRestaurantSlug();
        const delIds = this.getDeletedOrderIds(slug);
        if (delIds.size > 0) {
          return list.filter(o => {
            if (!o) return false;
            const cid = String(o.orderId || o.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
            return !delIds.has(cid) && !delIds.has(o.orderId) && !delIds.has(o.id);
          });
        }
        return list;
      }
      return [];
    } catch {
      return [];
    }
  },

  addOrderToHistory(orderData) {
    if (!orderData || !orderData.orderId) return;
    const history = this.getOrderHistory();
    const existingIdx = history.findIndex(o => o.orderId === orderData.orderId);
    if (existingIdx !== -1) {
      history[existingIdx] = orderData;
    } else {
      history.unshift(orderData);
    }
    const trimmed = history.slice(0, 20);
    this.safeSetItem(this.getKey('harpy_order_history'), JSON.stringify(trimmed));
  },

  removeOrderFromHistory(orderId) {
    if (!orderId) return;
    try {
      const slug = this.getRestaurantSlug();
      const cleanId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');
      const raw = localStorage.getItem(this.getKey('harpy_order_history')) || localStorage.getItem('harpy_order_history');
      const history = raw ? JSON.parse(raw) : [];
      if (Array.isArray(history)) {
        const updated = history.filter(o => {
          if (!o) return false;
          const cid = String(o.orderId || o.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
          return cid !== cleanId && o.orderId !== orderId && o.id !== orderId;
        });
        this.safeSetItem(this.getKey('harpy_order_history'), JSON.stringify(updated));
        this.safeSetItem('harpy_order_history', JSON.stringify(updated));
        this.safeSetItem('harpy_demo_harpy_order_history', JSON.stringify(updated));
      }
    } catch(e) {}
  },

  getThemeModeKey() {
    const slug = this.getRestaurantSlug();
    return `harpy_${slug}_theme_mode`;
  },
  getThemeMode() {
    return localStorage.getItem(this.getThemeModeKey()) || localStorage.getItem(this.getKey(STORAGE_KEYS.THEME_MODE)) || 'light';
  },
  setThemeMode(mode) {
    this.safeSetItem(this.getThemeModeKey(), mode);
    this.safeSetItem(this.getKey(STORAGE_KEYS.THEME_MODE), mode);
    this.applyTheme();
    window.dispatchEvent(new CustomEvent('theme_mode_changed', { detail: mode }));
  },
  initTheme() {
    this.applyTheme();
  },

  getStories() {
    const isDemo = (this.getRestaurantSlug() === 'demo');
    const defaultStories = isDemo ? DEFAULT_STORIES : [];
    if (this._memoryCache.stories !== null) {
      if (isDemo && (!this._memoryCache.stories || this._memoryCache.stories.length === 0)) {
        this._memoryCache.stories = defaultStories;
      }
      return this._memoryCache.stories;
    }
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.STORIES));
    if (!raw) {
      this._memoryCache.stories = defaultStories;
      return defaultStories;
    }
    try {
      const parsed = JSON.parse(raw);
      let res = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultStories);
      if (isDemo && (!res || res.length === 0)) {
        res = defaultStories;
      }
      if (Array.isArray(res)) {
        res = res.map(st => {
          if (!st || typeof st !== 'object') return st;
          const copy = { ...st };
          if (copy.title) copy.title = this.stripEmojiNoise(copy.title);
          if (copy.badge) copy.badge = this.stripEmojiNoise(copy.badge);
          if (copy.tagline) copy.tagline = this.stripEmojiNoise(copy.tagline);
          if (copy.ctaText) copy.ctaText = this.stripEmojiNoise(copy.ctaText);
          if (copy.headline) copy.headline = this.stripEmojiNoise(copy.headline);
          return copy;
        });
      }
      this._memoryCache.stories = res;
      return res;
    } catch {
      this._memoryCache.stories = defaultStories;
      return defaultStories;
    }
  },
  async saveStories(stories) {
    this._memoryCache.stories = stories;
    this.saveLocks.stories = true;
    this.safeSetItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(stories));
    this.lastSaveTimestamps.stories = Date.now();
    window.dispatchEvent(new Event('store_stories_updated'));

    // Ultra-Fast Optimistic Flow: Push to cloud in background without blocking UI
    this.pushToCloud('stories', stories).then(cloudSuccess => {
      this.lastSaveTimestamps.stories = Date.now();
      this.saveLocks.stories = false;
    }).catch(err => {
      this.saveLocks.stories = false;
    });

    return { success: true, localSaved: true };
  },
  async addStory(story) {
    const stories = this.getStories();
    stories.push(story);
    return await this.saveStories(stories);
  },
  async updateStory(id, storyData) {
    const stories = this.getStories().map(s => s.id === id ? { ...s, ...storyData } : s);
    return await this.saveStories(stories);
  },
  async deleteStory(id) {
    const stories = this.getStories().filter(s => s.id !== id);
    return await this.saveStories(stories);
  },

  getSoundEnabled() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.SOUND_ENABLED)) || localStorage.getItem('harpy_sound_enabled');
    return raw === null ? true : raw === 'true';
  },
  setSoundEnabled(enabled) {
    this.safeSetItem(this.getKey(STORAGE_KEYS.SOUND_ENABLED), String(enabled));
    this.safeSetItem('harpy_sound_enabled', String(enabled));
    window.dispatchEvent(new CustomEvent('store_sound_changed', { detail: enabled }));
  },

  getViewMode() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.VIEW_MODE));
    if (raw === 'dual' || raw === 'large' || raw === 'list') {
      return raw;
    }
    // Default mode for all users is dual (صنفين بجانب بعض)
    return 'dual';
  },
  setViewMode(mode) {
    const validModes = ['dual', 'large', 'list'];
    const chosen = validModes.includes(mode) ? mode : 'dual';
    this.safeSetItem(this.getKey(STORAGE_KEYS.VIEW_MODE), chosen);
    window.dispatchEvent(new CustomEvent('store_view_mode_changed', { detail: chosen }));
  },

  // ── Backup & Restore JSON Engine ───────────────────────────
  exportAllDataJSON() {
    let orderHistory = [];
    try {
      if (typeof this.getOrderHistory === 'function') {
        orderHistory = this.getOrderHistory();
      }
    } catch (e) {}

    const data = {
      version: "2.0",
      timestamp: new Date().toISOString(),
      slug: this.getRestaurantSlug(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      products: this.getProducts(),
      stories: this.getStories(),
      rawMaterials: this.getRawMaterials(),
      orders: orderHistory
    };
    return JSON.stringify(data, null, 2);
  },

  async importAllDataJSON(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!data || !data.products || !data.categories) {
        throw new Error("ملف النسخة الاحتياطية غير صالح أو ناقص");
      }
      if (data.settings) await this.saveSettings(data.settings);
      if (data.categories) await this.saveCategories(data.categories);
      if (data.products) await this.saveProducts(data.products);
      if (data.stories) await this.saveStories(data.stories);
      if (data.rawMaterials) await this.saveRawMaterials(data.rawMaterials);
      if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
        try {
          this.safeSetItem(this.getKey(STORAGE_KEYS.ORDER_HISTORY), JSON.stringify(data.orders));
        } catch (e) {}
      }
      return true;
    } catch (err) {
      console.error("[Store] Import error:", err);
      throw err;
    }
  },

  async resetAllDataToDefault(confirmedSlug) {
    const currentSlug = this.getRestaurantSlug();
    if (confirmedSlug !== currentSlug) {
      throw new Error(`يرجى كتابة معرّف المطعم "${currentSlug}" للتأكيد قبل مسح البيانات.`);
    }

    localStorage.removeItem(this.getKey(STORAGE_KEYS.SETTINGS));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.CATEGORIES));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.PRODUCTS));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.STORIES));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.RAW_MATERIALS));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.CART));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.APPLIED_COUPON));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.THEME_MODE));
    this.clearMemoryCache();
    this.initTheme();

    const isDemo = (currentSlug === 'demo');
    await this.pushToCloud('settings', isDemo ? DEFAULT_SETTINGS : BLANK_SETTINGS);
    await this.pushToCloud('categories', isDemo ? DEFAULT_CATEGORIES : []);
    await this.pushToCloud('products', isDemo ? DEFAULT_PRODUCTS : []);
    await this.pushToCloud('stories', isDemo ? DEFAULT_STORIES : []);
    await this.pushToCloud('rawMaterials', isDemo ? DEFAULT_RAW_MATERIALS : []);

    window.dispatchEvent(new Event('store_settings_updated'));
    window.dispatchEvent(new Event('store_categories_updated'));
    window.dispatchEvent(new Event('store_products_updated'));
    window.dispatchEvent(new Event('store_stories_updated'));
    window.dispatchEvent(new Event('store_raw_materials_updated'));

    return { success: true };
  },

  hasCachedData(slug) {
    const targetSlug = slug || this.getRestaurantSlug();
    try {
      const rawSettings = localStorage.getItem(`harpy_${targetSlug}_${STORAGE_KEYS.SETTINGS}`);
      const rawProds = localStorage.getItem(`harpy_${targetSlug}_${STORAGE_KEYS.PRODUCTS}`);
      return !!(rawSettings && rawProds);
    } catch {
      return false;
    }
  },

  purgeRestaurantCache(slug) {
    const targetSlug = (slug || this.getRestaurantSlug() || '').toLowerCase().trim();
    if (!targetSlug) return;
    try {
      this.clearMemoryCache();
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          if (
            key.startsWith(`harpy_${targetSlug}_`) ||
            key.startsWith(`harpy_${targetSlug}:`) ||
            key === `harpy_${targetSlug}` ||
            key === `harpy_admin_auth_${targetSlug}` ||
            key === `harpy_auth_${targetSlug}` ||
            key === `pwa_installed_admin_${targetSlug}` ||
            key === `pwa_installed_menu_${targetSlug}` ||
            key.includes(`_${targetSlug}`)
          ) {
            if (key !== `harpy_${targetSlug}_sub_status`) {
              keysToRemove.push(key);
            }
          }
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      sessionStorage.removeItem(`harpy_auth_${targetSlug}`);
      sessionStorage.removeItem(`harpy_admin_auth_${targetSlug}`);
      
      let list = this.getAllRestaurants().filter(r => r.slug !== targetSlug);
      this.safeSetItem('harpy_restaurants_list', JSON.stringify(list));
    } catch(e) {}
  },

  isSubscriptionSuspended(slug) {
    const activeSlug = slug || this.getRestaurantSlug();
    try {
      const cached = localStorage.getItem(`harpy_${activeSlug}_sub_status`);
      if (cached === 'suspended' || cached === 'blocked' || cached === 'expired' || cached === 'deleted') {
        return true;
      }
    } catch(e) {}
    return false;
  },

  startSubscriptionWatcher(onStatusChange) {
    if (this.activeListeners.license) {
      try {
        this.activeListeners.license.ref.off('value', this.activeListeners.license.callback);
      } catch(e) {}
      this.activeListeners.license = null;
    }

    const slug = this.getRestaurantSlug();
    if (!slug) return () => {};

    let isDestroyed = false;
    let pollTimer = null;
    let lastKnownStatusHash = '';

    const evaluateLicense = (lic, subSettings = null, meta = null) => {
      if (isDestroyed) return;

      let isBlocked = false;
      let isExpired = false;
      let isDeleted = false;
      let reason = 'active';
      const isDemo = (slug === 'demo');

      // Strict Guard: Only evaluate if an explicit license object is present; NEVER declare deleted on network null/transient state!
      if (lic && typeof lic === 'object') {
        if (lic.status === 'suspended' || lic.status === 'blocked' || lic.status === 'inactive') {
          isBlocked = true;
          reason = 'blocked';
        } else if (lic.status === 'deleted') {
          isDeleted = true;
          isBlocked = true;
          reason = 'deleted';
        }
        if (lic.expiresAt) {
          const expTime = new Date(lic.expiresAt).getTime();
          if (!isNaN(expTime) && Date.now() > expTime) {
            isExpired = true;
            if (!isBlocked) reason = 'expired';
          }
        }
      }

      if (subSettings && typeof subSettings === 'object') {
        if (subSettings.status === 'suspended' || subSettings.status === 'blocked') {
          isBlocked = true;
          if (reason === 'active') reason = 'blocked';
        } else if (subSettings.status === 'deleted') {
          isDeleted = true;
          reason = 'deleted';
        }
      }

      if (meta && typeof meta === 'object') {
        if (meta.status === 'suspended' || meta.status === 'blocked') {
          isBlocked = true;
          if (reason === 'active') reason = 'blocked';
        } else if (meta.status === 'deleted') {
          isDeleted = true;
          reason = 'deleted';
        }
      }

      const active = !isBlocked && !isExpired && !isDeleted;
      if (!active) {
        if (!reason || reason === 'active') {
          reason = isDeleted ? 'deleted' : (isBlocked ? 'blocked' : 'expired');
        }
        try { localStorage.setItem(`harpy_${slug}_sub_status`, reason); } catch(e) {}
        if (reason === 'deleted') {
          try { this.purgeRestaurantCache(slug); } catch(e) {}
        }
      } else {
        try { localStorage.setItem(`harpy_${slug}_sub_status`, 'active'); } catch(e) {}
      }

      const hash = `${active}_${reason}_${lic?.status || ''}`;
      if (hash !== lastKnownStatusHash) {
        lastKnownStatusHash = hash;
        if (typeof onStatusChange === 'function') {
          onStatusChange({ active, reason, lic });
        }
      }
    };

    // 1. WebSocket Listener (Primary, sub-50ms instant)
    let licRef = null;
    let wsCallback = null;
    try {
      if (db) {
        licRef = db.ref(`licenses/${slug}`);
        wsCallback = snap => {
          const val = snap ? snap.val() : null;
          if (val && typeof val === 'object') {
            evaluateLicense(val);
          } else if (val === null && slug !== 'demo') {
            fetchLicenseFast();
          }
        };
        licRef.on('value', wsCallback, err => {
          console.warn("[Store] License WS notice:", err);
        });
        this.activeListeners.license = { ref: licRef, callback: wsCallback };
      }
    } catch (err) {
      console.warn("[Store] Firebase license watcher init notice:", err);
    }

    // 2. Smooth REST Fallback (Every 30 seconds, zero CPU/memory pressure)
    const fetchLicenseFast = async () => {
      if (isDestroyed) return;
      try {
        const licRes = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/licenses/${slug}.json`, { cache: 'no-store' }).catch(() => null);

        if (licRes && licRes.ok) {
          const licData = await licRes.json();
          if (licData && typeof licData === 'object') {
            evaluateLicense(licData, null, null);
          } else if (licData === null && slug !== 'demo') {
            // Null license: verify if settings are also null to declare permanent deletion
            const setRes = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/settings.json?shallow=true`, { cache: 'no-store' }).catch(() => null);
            if (setRes && setRes.ok) {
              const setData = await setRes.json();
              if (setData === null) {
                evaluateLicense({ status: 'deleted', restaurantSlug: slug }, null, null);
              }
            }
          }
        }
      } catch (e) {}
    };

    fetchLicenseFast();
    pollTimer = setInterval(fetchLicenseFast, 30000);

    return () => {
      isDestroyed = true;
      if (pollTimer) clearInterval(pollTimer);
      if (licRef && wsCallback) {
        try { licRef.off('value', wsCallback); } catch(e) {}
      }
    };
  }
};

if (typeof window !== 'undefined') {
  window.Store = Store;
  window.escapeHtml = Store.escapeHtml;
}

if (typeof document !== 'undefined') {
  Store.initTheme();
}
