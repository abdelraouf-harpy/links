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
  VIEW_MODE: 'harpy_view_mode',
  STORIES: 'harpy_order_stories'
};

const THEME_PRESETS = {
  charcoal: {
    id: "charcoal",
    name: "دفتر الفحم الدافئ (ليلي أساسي)",
    badge: "فحم وخشب داكن",
    bg: "#120e0c",
    surface: "#1e1814",
    surfaceRaised: "#28201a",
    headerBg: "#120e0c",
    textMain: "#faf6f0",
    textBody: "#d4c9ba",
    primary: "#ea580c",
    border: "rgba(245, 238, 227, 0.09)"
  },
  cream: {
    id: "cream",
    name: "الورق العاجي الفاخر (نهاري أساسي)",
    badge: "نهاري راقي ومقاهي",
    bg: "#f8f6f0",
    surface: "#ffffff",
    surfaceRaised: "#f3ede2",
    headerBg: "#f8f6f0",
    textMain: "#18130f",
    textBody: "#3d332a",
    primary: "#c2410c",
    border: "rgba(45, 35, 25, 0.10)"
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
      printerPaperSize: "80mm"
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
  imgbbApiKey: "",
  
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
const Store = {
  // ── High-Speed In-Memory State Cache ───────────────────────
  _memoryCache: {
    slug: null,
    products: null,
    categories: null,
    settings: null,
    stories: null,
    cart: null,
    favorites: null,
    lastOrder: null,
    orders: null
  },

  clearMemoryCache() {
    this._memoryCache = {
      slug: null,
      products: null,
      categories: null,
      settings: null,
      stories: null,
      cart: null,
      favorites: null,
      lastOrder: null,
      orders: null
    };
  },

  _isCloudDataLoaded: false,
  isCloudDataLoaded() {
    if (this._isCloudDataLoaded) return true;
    const s = (this._memoryCache && this._memoryCache.settings) || (this.getSettings ? this.getSettings() : null);
    if (s && s.storeName) return true;
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
    stories: false
  },
  lastSaveTimestamps: {
    settings: 0,
    categories: 0,
    products: 0,
    stories: 0
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

    // 3. Platform High-Speed Cloud Host for Authentic WebAPK Manifest URLs
    if (compressedData && compressedData.startsWith('data:image')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);
        const base64Clean = compressedData.split(',')[1];
        const form = new URLSearchParams();
        form.append('key', '6d207e02198a847aa98d0a2a901485a5');
        form.append('action', 'upload');
        form.append('source', base64Clean);

        const response = await fetch('https://freeimage.host/api/1/upload', {
          method: 'POST',
          body: form,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const json = await response.json();
        if (json && json.image && json.image.url) {
          return json.image.url;
        }
      } catch (err) {
        console.warn('[Store] Platform CDN image upload fallback:', err.message);
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

    // 2. Direct Cloud Tenant Authentication (Verified against Realtime Database)
    if (db) {
      try {
        let activeSlug = slug;
        let metaSnap = activeSlug ? await db.ref(`restaurants/${activeSlug}/meta`).once('value') : null;
        let meta = metaSnap ? metaSnap.val() : null;

        // Check if password matches the current active restaurant
        if (meta && meta.adminPassword) {
          const expectedPassword = (meta.adminPassword || '').trim();
          const expectedEmail = (meta.ownerEmail || '').toLowerCase().trim();

          if (cleanPassword === expectedPassword) {
            let userUid = (meta && meta.ownerUid) || `admin_${activeSlug}`;
            if (auth && !auth.currentUser) {
              try {
                const anonCred = await auth.signInAnonymously();
                if (anonCred && anonCred.user) userUid = anonCred.user.uid;
              } catch(e) {}
            }
            const session = { 
              email: expectedEmail || cleanId || `${activeSlug}@harpy.com`, 
              authenticated: true, 
              slug: activeSlug, 
              uid: userUid,
              sessionVersion: meta.sessionVersion || 1,
              timestamp: Date.now() 
            };
            this.safeSetItem(`harpy_admin_auth_${activeSlug}`, JSON.stringify(session));
            sessionStorage.setItem(`harpy_auth_${activeSlug}`, JSON.stringify(session));
            this.safeSetItem('harpy_admin_active_slug', activeSlug);
            return session;
          }
        }

        // 3. Fallback: Search across all restaurants to auto-detect tenant
        try {
          const allSnap = await db.ref('restaurants').once('value');
          const allRestaurants = allSnap.val() || {};
          for (const [rSlug, rData] of Object.entries(allRestaurants)) {
            if (!rData || !rData.meta) continue;
            const rMeta = rData.meta;
            const rEmail = (rMeta.ownerEmail || '').toLowerCase().trim();
            const rPass = (rMeta.adminPassword || '').trim();
            const rPhone = (rMeta.phone || '').trim();

            const passMatches = (cleanPassword === rPass);
            const idMatches = (!cleanId || cleanId === rSlug || cleanId === rEmail || (rPhone && cleanId === rPhone));

            if (passMatches && (idMatches || cleanPassword.length >= 5)) {
              activeSlug = rSlug;
              if (activeSlug !== slug) {
                this.setRestaurantSlug(activeSlug);
              }
              let userUid = (rMeta && rMeta.ownerUid) || `admin_${activeSlug}`;
              if (auth && !auth.currentUser) {
                try {
                  const anonCred = await auth.signInAnonymously();
                  if (anonCred && anonCred.user) userUid = anonCred.user.uid;
                } catch(e) {}
              }
              const session = { 
                email: rEmail || `${activeSlug}@harpy.com`, 
                authenticated: true, 
                slug: activeSlug, 
                uid: userUid,
                sessionVersion: rMeta.sessionVersion || 1,
                timestamp: Date.now() 
              };
              this.safeSetItem(`harpy_admin_auth_${activeSlug}`, JSON.stringify(session));
              sessionStorage.setItem(`harpy_auth_${activeSlug}`, JSON.stringify(session));
              this.safeSetItem('harpy_admin_active_slug', activeSlug);
              return session;
            }
          }
        } catch(e) {}
      } catch (dbErr) {
        console.warn("[Store] DB meta auth check error:", dbErr);
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

    const updates = {
      adminPassword: cleanPassword,
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
    if (this.isSubscriptionSuspended(activeSlug)) {
      return false;
    }
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
      if (!isDemo && data === null) {
        this.purgeRestaurantCache(slug);
        try { localStorage.setItem(`harpy_${slug}_sub_status`, 'deleted'); } catch(e) {}
        window.dispatchEvent(new CustomEvent('harpy_subscription_status', { 
          detail: { active: false, reason: 'deleted', lic: null } 
        }));
      }
      return false;
    }

    this._isCloudDataLoaded = true;
    const now = Date.now();
    let hasChanges = false;
    const defaults = isDemo ? DEFAULT_SETTINGS : BLANK_SETTINGS;

    // Cache tenant meta if provided
    if (data.meta && typeof data.meta === 'object') {
      try {
        localStorage.setItem(`harpy_${slug}_meta`, JSON.stringify(data.meta));
      } catch(e) {}
    }

    let meta = data.meta || null;
    if (!meta) {
      try {
        const rawMeta = localStorage.getItem(`harpy_${slug}_meta`);
        if (rawMeta) meta = JSON.parse(rawMeta);
      } catch(e) {}
    }

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
        if (!mergedSettings.storeName && meta && meta.restaurantName) {
          mergedSettings.storeName = meta.restaurantName;
        }
        if (!mergedSettings.whatsappNumber && meta && meta.phone) {
          mergedSettings.whatsappNumber = meta.phone;
        }
        this._memoryCache.settings = mergedSettings;
        this.safeSetItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(mergedSettings));
        this.applyTheme();
        hasChanges = true;
      } else if (!isDemo && meta && meta.restaurantName) {
        const cur = this._memoryCache.settings || { ...BLANK_SETTINGS };
        if (!cur.storeName) {
          cur.storeName = meta.restaurantName;
          if (!cur.whatsappNumber && meta.phone) cur.whatsappNumber = meta.phone;
          this._memoryCache.settings = cur;
          this.safeSetItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(cur));
          hasChanges = true;
        }
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
        hasChanges = true;
      } else if (isDemo && (!this._memoryCache.products || this._memoryCache.products.length === 0)) {
        this._memoryCache.products = DEFAULT_PRODUCTS;
        this.safeSetItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(DEFAULT_PRODUCTS));
        hasChanges = true;
      }
    }

    if (!this.saveLocks.stories && (now - this.lastSaveTimestamps.stories > 2500)) {
      if (data.stories !== undefined && data.stories !== null) {
        let storyArray = Array.isArray(data.stories) ? data.stories : Object.values(data.stories);
        if (isDemo && (!storyArray || storyArray.length === 0)) {
          storyArray = DEFAULT_STORIES;
        }
        this._memoryCache.stories = storyArray;
        this.safeSetItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(storyArray));
        hasChanges = true;
      } else if (isDemo && (!this._memoryCache.stories || this._memoryCache.stories.length === 0)) {
        this._memoryCache.stories = DEFAULT_STORIES;
        this.safeSetItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(DEFAULT_STORIES));
        hasChanges = true;
      }
    }

    return hasChanges;
  },

  syncFromCloud(slug, onUpdate) {
    if (!slug) return () => {};
    let isDestroyed = false;
    let lastKnownDataHash = '';

    // Initialize with current local cache hash to prevent initial re-render flicker
    try {
      const curSettings = localStorage.getItem(this.getKey(STORAGE_KEYS.SETTINGS));
      const curCats = localStorage.getItem(this.getKey(STORAGE_KEYS.CATEGORIES));
      const curProds = localStorage.getItem(this.getKey(STORAGE_KEYS.PRODUCTS));
      const curStories = localStorage.getItem(this.getKey(STORAGE_KEYS.STORIES));
      if (curSettings || curProds) {
        lastKnownDataHash = JSON.stringify({
          s: curSettings ? JSON.parse(curSettings) : null,
          c: curCats ? JSON.parse(curCats) : null,
          p: curProds ? JSON.parse(curProds) : null,
          st: curStories ? JSON.parse(curStories) : null
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
      }
      const currentDataHash = JSON.stringify({
        s: data.settings,
        c: data.categories,
        p: data.products,
        st: data.stories
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
          stories: db.ref(`restaurants/${slug}/stories`),
          meta: db.ref(`restaurants/${slug}/meta`)
        };

        const currentAgg = {
          settings: this.getSettings ? this.getSettings() : (isDemo ? DEFAULT_SETTINGS : null),
          categories: this.getCategories ? this.getCategories() : (isDemo ? DEFAULT_CATEGORIES : null),
          products: this.getProducts ? this.getProducts() : (isDemo ? DEFAULT_PRODUCTS : null),
          stories: this.getStories ? this.getStories() : (isDemo ? DEFAULT_STORIES : null),
          meta: null
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

    // 2. High-Speed REST Initial Accelerator (Decoupled Parallel Subpaths)
    (async () => {
      try {
        const baseUrl = `https://harpy-order-default-rtdb.firebaseio.com/restaurants/${encodeURIComponent(slug)}`;
        const fOpt = { cache: 'no-store' };
        const [sRes, cRes, pRes, stRes, mRes] = await Promise.all([
          fetch(`${baseUrl}/settings.json`, fOpt).catch(() => null),
          fetch(`${baseUrl}/categories.json`, fOpt).catch(() => null),
          fetch(`${baseUrl}/products.json`, fOpt).catch(() => null),
          fetch(`${baseUrl}/stories.json`, fOpt).catch(() => null),
          fetch(`${baseUrl}/meta.json`, fOpt).catch(() => null)
        ]);

        let settings = sRes && sRes.ok ? await sRes.json().catch(() => null) : null;
        let categories = cRes && cRes.ok ? await cRes.json().catch(() => null) : null;
        let products = pRes && pRes.ok ? await pRes.json().catch(() => null) : null;
        let stories = stRes && stRes.ok ? await stRes.json().catch(() => null) : null;
        const meta = mRes && mRes.ok ? await mRes.json().catch(() => null) : null;

        if (isDemo) {
          if (!settings || (typeof settings === 'object' && Object.keys(settings).length === 0)) settings = DEFAULT_SETTINGS;
          if (!categories || (Array.isArray(categories) && categories.length === 0)) categories = DEFAULT_CATEGORIES;
          if (!products || (Array.isArray(products) && products.length === 0)) products = DEFAULT_PRODUCTS;
          if (!stories || (typeof stories === 'object' && Object.keys(stories).length === 0)) stories = DEFAULT_STORIES;
        }

        if (settings !== null || categories !== null || products !== null || meta !== null) {
          processSnapshotData({
            settings: settings,
            categories: categories,
            products: products,
            stories: stories,
            meta: meta
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

    try {
      const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      });
      if (res && res.ok) {
        success = true;
      }
    } catch (e) {
      console.warn(`[Store] REST cloud push error for ${subPath}:`, e);
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
      const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/${path}.json`, {
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

  getOrders() {
    if (this._memoryCache.orders !== null) {
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

        const resolvedId = o.orderId || o.id || (fbKey !== 'undefined' ? fbKey : `#ORD-${Math.floor(1000 + Math.random() * 9000)}`);
        const cid = resolvedId.replace(/[^a-zA-Z0-9_-]/g, '');
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
      if (ordersRef && wsCallback) {
        try { ordersRef.off('value', wsCallback); } catch(e) {}
      }
      try {
        ordersRef = db.ref(`restaurants/${slug}/orders`).limitToLast(100);
        wsCallback = snapshot => {
          handleOrdersPayload(snapshot.val() || {});
        };
        ordersRef.on('value', wsCallback, err => {
          console.warn("[Store] Orders WS listener notice:", err ? (err.message || err.code || err) : err);
        });
        this.activeListeners.orders = { ref: ordersRef, callback: wsCallback };
      } catch (e) {
        console.warn("[Store] Failed to attach orders WS listener:", e);
      }
    };

    setupWsListener();

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

    // 2. High-Frequency REST Heartbeat Pulse (Every 4.0 seconds fallback)
    const fetchOrdersFast = async () => {
      if (isDestroyed) return;
      try {
        let authParam = '';
        try {
          if (window.firebase && firebase.auth && firebase.auth().currentUser) {
            const idToken = await firebase.auth().currentUser.getIdToken();
            if (idToken) authParam = `&auth=${idToken}`;
          }
        } catch(e) {}
        if (!authParam) {
          // Without an active auth token, secured RTDB orders endpoint will reject; avoid unnecessary 401 spam
          return;
        }
        const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders.json?orderBy="$key"&limitToLast=100${authParam}`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            handleOrdersPayload(data);
          }
        } else if (res.status === 401 && window.firebase && firebase.auth && firebase.auth().currentUser) {
          try { await firebase.auth().currentUser.getIdToken(true); } catch(e) {}
        }
      } catch (e) {}
    };

    fetchOrdersFast();
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
      const cached = this.getOrders();
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
      }
    } catch(e) {}

    const patchPayload = {
      status: newStatus,
      updatedAt: nowIso,
      timestampUpdated: nowTs
    };

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

    // 1. Remove from local cache immediately
    let targetFbKey = cleanId;
    try {
      const cached = this.getOrders();
      const target = cached.find(o => 
        o.orderId === orderId || 
        o.orderId === `#${cleanId}` || 
        o.id === orderId || 
        o._fbKey === orderId || 
        (o.orderId && String(o.orderId).replace(/[^a-zA-Z0-9_-]/g, '') === cleanId) ||
        (orderId === 'undefined' && (!o.orderId || o.orderId === 'undefined'))
      );
      if (target && target._fbKey) targetFbKey = target._fbKey;

      const updated = cached.filter(o => 
        (target ? o !== target : true) &&
        o.id !== orderId &&
        o.orderId !== orderId && 
        o.orderId !== `#${cleanId}` && 
        o._fbKey !== orderId && 
        o._fbKey !== targetFbKey && 
        !(orderId === 'undefined' && (!o.orderId || o.orderId === 'undefined'))
      );
      this.saveOrders(updated);
    } catch(e) {}

    // 2. Parallel cloud delete
    const keysToDelete = new Set([cleanId, targetFbKey]);
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

    const lastOrder = this.getLastOrder();
    if (lastOrder && (lastOrder.orderId === orderId || lastOrder.orderId === `#${cleanId}`)) {
      this.saveLastOrder(null);
    }

    return true;
  },

  subscribeToOrder(slug, orderId, onUpdate) {
    if (!slug || !orderId) return () => {};
    let isDestroyed = false;
    let pollTimer = null;
    const cleanId = orderId.replace(/[^a-zA-Z0-9_-]/g, '');
    let lastKnownOrderHash = '';

    const handleOrderPayload = (data) => {
      if (isDestroyed || !data) return;
      const hash = JSON.stringify({ st: data.status, upd: data.updatedAt || data.timestampUpdated, tot: data.finalTotal });
      if (hash !== lastKnownOrderHash) {
        lastKnownOrderHash = hash;
        if (typeof onUpdate === 'function') {
          onUpdate(data);
        }
      }
    };

    // 1. WebSocket Listener (Primary)
    let orderRef = null;
    let wsCallback = null;
    try {
      if (db) {
        orderRef = db.ref(`restaurants/${slug}/orders/${cleanId}`);
        wsCallback = snap => {
          handleOrderPayload(snap.val());
        };
        orderRef.on('value', wsCallback);
      }
    } catch (e) {}

    // 2. High-Frequency Fast REST Tracker Pulse (3.5s fallback)
    const fetchOrderFast = async () => {
      if (isDestroyed) return;
      try {
        const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${cleanId}.json`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            handleOrderPayload(data);
          }
        }
      } catch (e) {}
    };

    fetchOrderFast();
    pollTimer = setInterval(fetchOrderFast, 3500);

    return () => {
      isDestroyed = true;
      if (pollTimer) clearInterval(pollTimer);
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

      // 2. Clean Path-based Resolution (e.g. harpymenu.com/king or harpymenu.com/order/king)
      if (!urlSlug && typeof window !== 'undefined' && window.location && window.location.pathname) {
        const pathParts = window.location.pathname.split('/').filter(p => p && !p.endsWith('.html') && p !== 'admin' && p !== 'order');
        if (pathParts.length > 0) {
          const firstPart = pathParts[0].toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
          const reservedNames = ['css', 'js', 'assets', 'api', 'admin', 'manifest', 'sw', 'favicon', 'icons', 'products', 'portfolio', 'order'];
          if (firstPart && !reservedNames.includes(firstPart)) {
            urlSlug = firstPart;
          }
        }
      }

      // 4. Subdomain Resolution Fallback (e.g. king.harpymenu.com)
      if (!urlSlug && typeof window !== 'undefined' && window.location && window.location.hostname) {
        const host = window.location.hostname.toLowerCase();
        if (host.includes('harpymenu.com') && !host.startsWith('www.') && host !== 'harpymenu.com') {
          const subdomain = host.split('.')[0].trim().replace(/[^a-z0-9_-]/g, '');
          if (subdomain && subdomain !== 'www' && subdomain !== 'order' && subdomain !== 'api') {
            urlSlug = subdomain;
          }
        }
      }

      // 5. Standalone PWA Installed App Recovery (Only when running as an installed app)
      if (!urlSlug && typeof window !== 'undefined' && window.localStorage) {
        const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
                             (window.navigator && window.navigator.standalone === true);
        if (isStandalone) {
          urlSlug = localStorage.getItem('harpy_customer_installed_slug') ||
                    localStorage.getItem('harpy_admin_installed_slug');
        }
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

    const fallbackSlug = 'demo';
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

    // Resolve tenant metadata if storeName is not yet set in settings
    let meta = null;
    try {
      const rawMeta = localStorage.getItem(`harpy_${slug}_meta`);
      if (rawMeta) meta = JSON.parse(rawMeta);
    } catch(e) {}

    if (!parsed.storeName) {
      if (meta && meta.restaurantName) {
        parsed.storeName = meta.restaurantName;
      } else if (!isDemo && slug) {
        parsed.storeName = `مطعم ${slug}`;
      }
    }
    if (!parsed.whatsappNumber && meta && meta.phone) {
      parsed.whatsappNumber = meta.phone;
    }
    if (!parsed.printerPaperSize) parsed.printerPaperSize = "80mm";

    this._memoryCache.settings = parsed;
    return parsed;
  },

  async saveSettings(settings) {
    if (this._memoryCache.settings?.subscription && !settings.subscription) {
      settings.subscription = this._memoryCache.settings.subscription;
    }
    this._memoryCache.settings = settings;
    this.saveLocks.settings = true;
    this.safeSetItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(settings));
    if (settings.storeName) {
      this.registerRestaurant(this.getRestaurantSlug(), settings.storeName);
    }
    this.applyTheme();
    window.dispatchEvent(new Event('store_settings_updated'));

    const cloudSuccess = await this.pushToCloud('settings', settings);
    this.lastSaveTimestamps.settings = Date.now();
    this.saveLocks.settings = false;

    return { success: cloudSuccess, localSaved: true };
  },

  applyTheme() {
    const s = this.getSettings();
    const mode = this.getThemeMode();
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', mode);
    if (body) body.setAttribute('data-theme', mode);

    const themeProps = [
      '--bg', '--bg-subtle', '--surface', '--surface-raised', '--surface-hover',
      '--header-bg', '--text-main', '--text-body', '--text-muted', '--text-faint',
      '--border', '--border-strong', '--primary', '--primary-hover', '--primary-subtle', '--primary-glow', '--border-focus'
    ];
    themeProps.forEach(p => {
      root.style.removeProperty(p);
      if (body) body.style.removeProperty(p);
    });

    const primaryColor = s.siteColors?.primary || (mode === 'light' ? '#c2410c' : '#ea580c');
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
      const c = s.siteColors;

      let isDarkPalette = true;
      if (c.id === 'cream') {
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
      // In light mode with a dark preset, DO NOT override with dark bg/surfaces!
      // Let :root[data-theme="light"] provide the clean luxury daylight background!
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
    const isDemo = (this.getRestaurantSlug() === 'demo');
    const defaultCategories = isDemo ? DEFAULT_CATEGORIES : [];
    if (this._memoryCache.categories !== null) {
      if (isDemo && (!this._memoryCache.categories || this._memoryCache.categories.length === 0)) {
        this._memoryCache.categories = defaultCategories;
      }
      return this._memoryCache.categories;
    }
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CATEGORIES));
    if (!raw) {
      this._memoryCache.categories = defaultCategories;
      return defaultCategories;
    }
    try {
      const parsed = JSON.parse(raw);
      let res = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultCategories);
      if (isDemo && (!res || res.length === 0)) {
        res = defaultCategories;
      }
      this._memoryCache.categories = res;
      return res;
    } catch {
      this._memoryCache.categories = defaultCategories;
      return defaultCategories;
    }
  },

  async saveCategories(cats) {
    this._memoryCache.categories = cats;
    this.saveLocks.categories = true;
    this.safeSetItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(cats));
    window.dispatchEvent(new Event('store_categories_updated'));

    const cloudSuccess = await this.pushToCloud('categories', cats);
    this.lastSaveTimestamps.categories = Date.now();
    this.saveLocks.categories = false;

    return { success: cloudSuccess, localSaved: true };
  },

  getProducts() {
    const isDemo = (this.getRestaurantSlug() === 'demo');
    const defaultProducts = isDemo ? DEFAULT_PRODUCTS : [];
    if (this._memoryCache.products !== null) {
      if (isDemo && (!this._memoryCache.products || this._memoryCache.products.length === 0)) {
        this._memoryCache.products = defaultProducts;
      }
      return this._memoryCache.products;
    }
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.PRODUCTS));
    if (!raw) {
      this._memoryCache.products = defaultProducts;
      return defaultProducts;
    }
    try {
      const parsed = JSON.parse(raw);
      let res = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultProducts);
      if (isDemo && (!res || res.length === 0)) {
        res = defaultProducts;
      }
      this._memoryCache.products = res;
      return res;
    } catch {
      this._memoryCache.products = defaultProducts;
      return defaultProducts;
    }
  },

  async saveProducts(prods) {
    this._memoryCache.products = prods;
    this.saveLocks.products = true;
    this.safeSetItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(prods));
    window.dispatchEvent(new Event('store_products_updated'));

    const cloudSuccess = await this.pushToCloud('products', prods);
    this.lastSaveTimestamps.products = Date.now();
    this.saveLocks.products = false;

    return { success: cloudSuccess, localSaved: true };
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

  getLastOrder() {
    if (this._memoryCache.lastOrder !== null) {
      return this._memoryCache.lastOrder;
    }
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.LAST_ORDER));
    try {
      const res = raw ? JSON.parse(raw) : null;
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
      this.safeSetItem(this.getKey(STORAGE_KEYS.LAST_ORDER), JSON.stringify(orderData));
    } else {
      localStorage.removeItem(this.getKey(STORAGE_KEYS.LAST_ORDER));
    }
    window.dispatchEvent(new Event('store_last_order_updated'));
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
    window.dispatchEvent(new Event('store_stories_updated'));

    const cloudSuccess = await this.pushToCloud('stories', stories);
    this.lastSaveTimestamps.stories = Date.now();
    this.saveLocks.stories = false;

    return { success: cloudSuccess, localSaved: true };
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
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.SOUND_ENABLED));
    return raw === null ? true : raw === 'true';
  },
  setSoundEnabled(enabled) {
    this.safeSetItem(this.getKey(STORAGE_KEYS.SOUND_ENABLED), String(enabled));
    window.dispatchEvent(new CustomEvent('store_sound_changed', { detail: enabled }));
  },

  getViewMode() {
    return localStorage.getItem(this.getKey(STORAGE_KEYS.VIEW_MODE)) || 'grid';
  },
  setViewMode(mode) {
    this.safeSetItem(this.getKey(STORAGE_KEYS.VIEW_MODE), mode);
    window.dispatchEvent(new CustomEvent('store_view_mode_changed', { detail: mode }));
  },

  // ── Backup & Restore JSON Engine ───────────────────────────
  exportAllDataJSON() {
    const data = {
      version: "2.0",
      timestamp: new Date().toISOString(),
      slug: this.getRestaurantSlug(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      products: this.getProducts(),
      stories: this.getStories()
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

    window.dispatchEvent(new Event('store_settings_updated'));
    window.dispatchEvent(new Event('store_categories_updated'));
    window.dispatchEvent(new Event('store_products_updated'));
    window.dispatchEvent(new Event('store_stories_updated'));

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

      if (!isDemo && (lic === null || lic === undefined)) {
        isDeleted = true;
        isBlocked = true;
        reason = 'deleted';
      } else if (lic) {
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

      if (subSettings && (subSettings.status === 'suspended' || subSettings.status === 'blocked' || subSettings.status === 'deleted')) {
        isBlocked = true;
        if (subSettings.status === 'deleted') {
          isDeleted = true;
          reason = 'deleted';
        } else if (reason === 'active') {
          reason = 'blocked';
        }
      }

      if (meta && (meta.status === 'suspended' || meta.status === 'blocked' || meta.status === 'deleted')) {
        isBlocked = true;
        if (meta.status === 'deleted') {
          isDeleted = true;
          reason = 'deleted';
        } else if (reason === 'active') {
          reason = 'blocked';
        }
      }

      const active = !isBlocked && !isExpired && !isDeleted;
      if (!active) {
        if (!reason || reason === 'active') {
          reason = isDeleted ? 'deleted' : (isBlocked ? 'blocked' : 'expired');
        }
        try { localStorage.setItem(`harpy_${slug}_sub_status`, reason); } catch(e) {}
        if (isDeleted) {
          this.purgeRestaurantCache(slug);
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
          evaluateLicense(snap.val());
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
        const [licRes, metaRes] = await Promise.allSettled([
          fetch(`https://harpy-order-default-rtdb.firebaseio.com/licenses/${slug}.json`, { cache: 'no-store' }),
          fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/meta.json`, { cache: 'no-store' })
        ]);

        let licData = null;
        let metaData = null;
        if (licRes.status === 'fulfilled' && licRes.value.ok) {
          licData = await licRes.value.json();
        }
        if (metaRes.status === 'fulfilled' && metaRes.value.ok) {
          metaData = await metaRes.value.json();
        }

        evaluateLicense(licData, null, metaData);
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
}

if (typeof document !== 'undefined') {
  Store.initTheme();
}
