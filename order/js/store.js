// ═══════════════════════════════════════════════════════════
// HarpyOrder — Store & Data Manager (Rock-Solid Multi-Tenant Engine)
// ═══════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAhDjumVbNoRCp6bDSeqrnVgakAQ2pu0ww",
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
    }
  }
} catch (e) {
  console.warn("Firebase Init:", e);
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
  STORIES: 'harpy_order_stories',
  TABLE_NUM: 'harpy_order_table_num'
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
    border: "rgba(22, 163, 74, 0.16)"
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

const DEFAULT_SETTINGS = {
  storeName: "",
  storeTagline: "",
  whatsappNumber: "",
  walletNumber: "",
  walletName: "فودافون كاش / إنستاباي",
  currency: "ج.م",
  adminPin: "1234",
  logo: "",
  cover: "",
  imgbbApiKey: "",
  
  themePreset: "charcoal",
  siteColors: {
    bg: "#110e0c",
    surface: "#1c1713",
    surfaceRaised: "#251f1a",
    headerBg: "#110e0c",
    textMain: "#faf6f0",
    textBody: "#d4c9ba",
    primary: "#c2410c",
    border: "rgba(245, 238, 227, 0.09)"
  },

  // Discounts
  enableWalletDiscount: true,
  walletDiscountType: "percent",
  walletDiscountValue: 10,

  enableSpendTierDiscount: true,
  spendTierMinAmount: 300,
  spendTierDiscountType: "percent",
  spendTierDiscountValue: 15,

  promoCodes: [],

  announcementText: "",
  showAnnouncement: false,
  deliveryTime: "30-45 دقيقة",
  minOrder: 0
};

const DEFAULT_CATEGORIES = [];
const DEFAULT_PRODUCTS = [];
const DEFAULT_STORIES = [];

const Store = {
  // ── Multi-Tenant Admin Authentication Engine ─────────────
  async loginAdmin(email, password) {
    const slug = this.getRestaurantSlug();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    // 1. Try Firebase Auth (if API key is working)
    if (auth) {
      try {
        const userCred = await auth.signInWithEmailAndPassword(cleanEmail, cleanPassword);
        sessionStorage.setItem(`harpy_auth_${slug}`, JSON.stringify({ email: cleanEmail, uid: userCred.user.uid, authenticated: true, timestamp: Date.now() }));
        return userCred;
      } catch (authErr) {
        console.warn("Firebase Auth attempt:", authErr.code || authErr.message);
      }
    }

    // 2. Direct Cloud Tenant Authentication (Verified against restaurants/{slug}/meta)
    if (db && slug) {
      try {
        const metaSnap = await db.ref(`restaurants/${slug}/meta`).once('value');
        const meta = metaSnap.val();
        if (meta && meta.ownerEmail) {
          const expectedEmail = meta.ownerEmail.toLowerCase().trim();
          const expectedPassword = (meta.adminPassword || '').trim();
          
          if (cleanEmail === expectedEmail) {
            // If password matches or is first-time registered password
            if (!expectedPassword || cleanPassword === expectedPassword) {
              if (!expectedPassword) {
                // Save the password on first login
                await db.ref(`restaurants/${slug}/meta/adminPassword`).set(cleanPassword);
              }
              const session = { email: cleanEmail, authenticated: true, slug, timestamp: Date.now() };
              sessionStorage.setItem(`harpy_auth_${slug}`, JSON.stringify(session));
              return session;
            }
          }
        }
      } catch (dbErr) {
        console.warn("DB meta auth check error:", dbErr);
      }
    }

    throw new Error("auth/invalid-credentials");
  },

  async logoutAdmin() {
    const slug = this.getRestaurantSlug();
    sessionStorage.removeItem(`harpy_auth_${slug}`);
    if (auth) {
      try { await auth.signOut(); } catch(e) {}
    }
  },

  isAdminAuthenticated(slug) {
    const activeSlug = slug || this.getRestaurantSlug();
    const sessionStr = sessionStorage.getItem(`harpy_auth_${activeSlug}`);
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.authenticated !== false) return true;
      } catch(e) {}
    }
    return auth && auth.currentUser ? true : false;
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

  // ── Cloud Sync Engine (Firebase Realtime DB) ───────────────
  syncFromCloud(slug, onUpdate) {
    if (!db || !slug) return;
    try {
      const restaurantRef = db.ref(`restaurants/${slug}`);
      restaurantRef.on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
          if (data.settings) {
            localStorage.setItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(data.settings));
            this.applyTheme();
            window.dispatchEvent(new Event('store_settings_updated'));
          }
          if (data.categories) {
            localStorage.setItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(data.categories));
            window.dispatchEvent(new Event('store_categories_updated'));
          }
          if (data.products) {
            localStorage.setItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(data.products));
            window.dispatchEvent(new Event('store_products_updated'));
          }
          if (data.stories) {
            localStorage.setItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(data.stories));
            window.dispatchEvent(new Event('store_stories_updated'));
          }
        }
        if (typeof onUpdate === 'function') {
          onUpdate({ success: true, hasData: !!data, data });
        }
      }, err => {
        console.warn("Cloud sync read error:", err);
      });
    } catch (err) {
      console.warn("Cloud sync init error:", err);
    }
  },

  async pushToCloud(subPath, data) {
    const slug = this.getRestaurantSlug();
    if (!db || !slug) return false;
    try {
      const path = subPath ? `restaurants/${slug}/${subPath}` : `restaurants/${slug}`;
      await db.ref(path).set(data);
      return true;
    } catch (err) {
      console.warn(`Error pushing ${subPath} to cloud:`, err);
      return false;
    }
  },

  async pushOrderToCloud(orderData) {
    const slug = this.getRestaurantSlug();
    if (!db || !slug || !orderData || !orderData.orderId) return false;
    try {
      const cleanId = orderData.orderId.replace(/[^a-zA-Z0-9_-]/g, '');
      await db.ref(`restaurants/${slug}/orders/${cleanId}`).set(orderData);
      return true;
    } catch (err) {
      console.warn("Error pushing order to cloud:", err);
      return false;
    }
  },

  syncOrdersFromCloud(slug, onOrdersUpdate) {
    if (!db || !slug) return () => {};
    try {
      const ordersRef = db.ref(`restaurants/${slug}/orders`);
      ordersRef.on('value', snapshot => {
        const data = snapshot.val() || {};
        const ordersList = Object.values(data).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        if (typeof onOrdersUpdate === 'function') {
          onOrdersUpdate(ordersList);
        }
      }, err => {
        console.warn("Sync orders error:", err);
      });
      return () => ordersRef.off();
    } catch (err) {
      console.warn("Orders listener init error:", err);
      return () => {};
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    const slug = this.getRestaurantSlug();
    if (!db || !slug || !orderId) return false;
    try {
      const cleanId = orderId.replace(/[^a-zA-Z0-9_-]/g, '');
      await db.ref(`restaurants/${slug}/orders/${cleanId}/status`).set(newStatus);
      return true;
    } catch (err) {
      console.warn("Update order status error:", err);
      return false;
    }
  },

  subscribeToOrder(slug, orderId, onUpdate) {
    if (!db || !slug || !orderId) return () => {};
    try {
      const cleanId = orderId.replace(/[^a-zA-Z0-9_-]/g, '');
      const orderRef = db.ref(`restaurants/${slug}/orders/${cleanId}`);
      orderRef.on('value', snap => {
        const data = snap.val();
        if (data && typeof onUpdate === 'function') {
          onUpdate(data);
        }
      });
      return () => orderRef.off();
    } catch (err) {
      console.warn("Subscribe to order error:", err);
      return () => {};
    }
  },

  async initTenantMeta(slug, userUid) {
    if (!db || !slug || !userUid) return false;
    try {
      const metaRef = db.ref(`restaurants/${slug}/meta`);
      const snap = await metaRef.once('value');
      if (!snap.exists()) {
        await metaRef.set({
          ownerUid: userUid,
          createdAt: new Date().toISOString()
        });
      }
      return true;
    } catch (err) {
      console.warn("Init tenant meta error:", err);
      return false;
    }
  },

  async verifyTenantOwnership(slug, userUid) {
    if (!db || !slug || !userUid) return false;
    try {
      const metaRef = db.ref(`restaurants/${slug}/meta`);
      const snap = await metaRef.once('value');
      if (!snap.exists()) {
        // Auto-claim first login if unclaimed
        await metaRef.set({
          ownerUid: userUid,
          createdAt: new Date().toISOString()
        });
        return true;
      }
      const meta = snap.val() || {};
      if (!meta.ownerUid) {
        await metaRef.child('ownerUid').set(userUid);
        return true;
      }
      return meta.ownerUid === userUid;
    } catch (err) {
      console.warn("Verify ownership error:", err);
      return false;
    }
  },

  // ── Multi-Tenant Restaurant Engine ────────────────────────
  getRestaurantSlug() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSlug = params.get('m') || params.get('restaurant') || params.get('store') || params.get('slug');
      if (urlSlug) {
        const clean = urlSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        if (clean) {
          localStorage.setItem('harpy_active_slug', clean);
          this.registerRestaurant(clean);
          return clean;
        }
      }
    } catch {}
    return localStorage.getItem('harpy_active_slug') || 'hermel';
  },

  setRestaurantSlug(slug) {
    const clean = (slug || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (clean) {
      localStorage.setItem('harpy_active_slug', clean);
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
      localStorage.setItem('harpy_restaurants_list', JSON.stringify(list));
    } else if (customName && existing.name !== customName) {
      existing.name = customName;
      localStorage.setItem('harpy_restaurants_list', JSON.stringify(list));
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
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.SETTINGS));
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },
  saveSettings(settings) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(settings));
    if (settings.storeName) {
      this.registerRestaurant(this.getRestaurantSlug(), settings.storeName);
    }
    this.applyTheme();
    this.pushToCloud('settings', settings);
    window.dispatchEvent(new Event('store_settings_updated'));
  },

  applyTheme() {
    const s = this.getSettings();
    const mode = this.getThemeMode();
    const root = document.documentElement;

    root.setAttribute('data-theme', mode);

    // Clean up stale inline color overrides
    root.style.removeProperty('--bg');
    root.style.removeProperty('--bg-subtle');
    root.style.removeProperty('--surface');
    root.style.removeProperty('--surface-raised');
    root.style.removeProperty('--surface-hover');
    root.style.removeProperty('--header-bg');
    root.style.removeProperty('--text-main');
    root.style.removeProperty('--text-body');
    root.style.removeProperty('--border');
    root.style.removeProperty('--border-strong');

    let colors = s.siteColors;
    if (!colors && s.themePreset && THEME_PRESETS[s.themePreset]) {
      colors = THEME_PRESETS[s.themePreset];
    }
    if (!colors) colors = THEME_PRESETS.charcoal;

    if (mode === 'dark') {
      if (s.themePreset && s.themePreset !== 'charcoal' && s.themePreset !== 'cream' && THEME_PRESETS[s.themePreset]) {
        const p = THEME_PRESETS[s.themePreset];
        root.style.setProperty('--bg', p.bg);
        root.style.setProperty('--surface', p.surface);
        root.style.setProperty('--surface-raised', p.surfaceRaised);
        root.style.setProperty('--header-bg', p.bg);
        root.style.setProperty('--text-main', p.textMain);
        root.style.setProperty('--text-body', p.textBody);
        root.style.setProperty('--border', p.border);
        root.style.setProperty('--border-strong', p.border);
      } else if (colors && colors.bg && colors.surface && s.themePreset !== 'cream') {
        root.style.setProperty('--bg', colors.bg);
        root.style.setProperty('--surface', colors.surface);
        root.style.setProperty('--surface-raised', colors.surfaceRaised || colors.surface);
        root.style.setProperty('--header-bg', colors.headerBg || colors.bg);
        root.style.setProperty('--text-main', colors.textMain || '#faf6f0');
        root.style.setProperty('--text-body', colors.textBody || '#d4c9ba');
        root.style.setProperty('--border', colors.border || 'rgba(245, 238, 227, 0.09)');
      }
    }

    const primaryColor = colors?.primary || (mode === 'light' ? '#c2410c' : '#ea580c');
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-glow', `${primaryColor}44`);
    root.style.setProperty('--primary-subtle', `${primaryColor}22`);
  },

  getCategories() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CATEGORIES));
    if (!raw) return DEFAULT_CATEGORIES;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },
  saveCategories(cats) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(cats));
    localStorage.setItem('harpy_last_sync', Date.now().toString());
    this.pushToCloud('categories', cats);
    window.dispatchEvent(new Event('store_categories_updated'));
  },

  getProducts() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.PRODUCTS));
    if (!raw) return DEFAULT_PRODUCTS;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PRODUCTS;
    }
  },
  saveProducts(prods) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(prods));
    localStorage.setItem('harpy_last_sync', Date.now().toString());
    this.pushToCloud('products', prods);
    window.dispatchEvent(new Event('store_products_updated'));
  },
  addProduct(prod) {
    const prods = this.getProducts();
    prods.unshift(prod);
    this.saveProducts(prods);
  },
  updateProduct(id, updatedProd) {
    const prods = this.getProducts().map(p => p.id === id ? { ...p, ...updatedProd } : p);
    this.saveProducts(prods);
  },
  deleteProduct(id) {
    const prods = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(prods);
  },

  getCart() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CART));
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveCart(cart) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.CART), JSON.stringify(cart));
    window.dispatchEvent(new Event('store_cart_updated'));
  },
  clearCart() {
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
      localStorage.setItem(this.getKey(STORAGE_KEYS.APPLIED_COUPON), JSON.stringify(coupon));
    } else {
      localStorage.removeItem(this.getKey(STORAGE_KEYS.APPLIED_COUPON));
    }
    window.dispatchEvent(new Event('store_coupon_updated'));
  },

  getFavorites() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.FAVORITES));
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
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
    localStorage.setItem(this.getKey(STORAGE_KEYS.FAVORITES), JSON.stringify(favs));
    window.dispatchEvent(new Event('store_favorites_updated'));
    return favs.includes(productId);
  },
  isFavorite(productId) {
    return this.getFavorites().includes(productId);
  },

  getLastOrder() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.LAST_ORDER));
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  saveLastOrder(orderData) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.LAST_ORDER), JSON.stringify(orderData));
    window.dispatchEvent(new Event('store_last_order_updated'));
  },

  getThemeMode() {
    return localStorage.getItem(this.getKey(STORAGE_KEYS.THEME_MODE)) || 'dark';
  },
  setThemeMode(mode) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.THEME_MODE), mode);
    this.applyTheme();
    window.dispatchEvent(new CustomEvent('theme_mode_changed', { detail: mode }));
  },
  initTheme() {
    this.applyTheme();
  },

  getStories() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.STORIES));
    if (!raw) return DEFAULT_STORIES;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_STORIES;
    }
  },
  saveStories(stories) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(stories));
    this.pushToCloud('stories', stories);
    window.dispatchEvent(new Event('store_stories_updated'));
  },
  addStory(story) {
    const stories = this.getStories();
    stories.push(story);
    this.saveStories(stories);
  },
  updateStory(id, storyData) {
    const stories = this.getStories().map(s => s.id === id ? { ...s, ...storyData } : s);
    this.saveStories(stories);
  },
  deleteStory(id) {
    const stories = this.getStories().filter(s => s.id !== id);
    this.saveStories(stories);
  },

  getSoundEnabled() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.SOUND_ENABLED));
    return raw === null ? true : raw === 'true';
  },
  setSoundEnabled(enabled) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.SOUND_ENABLED), String(enabled));
    window.dispatchEvent(new CustomEvent('store_sound_changed', { detail: enabled }));
  },

  getViewMode() {
    return localStorage.getItem(this.getKey(STORAGE_KEYS.VIEW_MODE)) || 'grid';
  },
  setViewMode(mode) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.VIEW_MODE), mode);
    window.dispatchEvent(new CustomEvent('store_view_mode_changed', { detail: mode }));
  },

  getActiveTable() {
    return sessionStorage.getItem(STORAGE_KEYS.TABLE_NUM) || null;
  },
  setActiveTable(tableNum) {
    if (tableNum) {
      sessionStorage.setItem(STORAGE_KEYS.TABLE_NUM, String(tableNum));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.TABLE_NUM);
    }
  },

  // ── Backup & Restore JSON Engine ───────────────────────────
  exportAllDataJSON() {
    const data = {
      version: "2.0",
      timestamp: new Date().toISOString(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      products: this.getProducts(),
      stories: this.getStories()
    };
    return JSON.stringify(data, null, 2);
  },

  importAllDataJSON(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!data || !data.products || !data.categories) {
        throw new Error("ملف النسخة الاحتياطية غير صالح أو ناقص");
      }
      if (data.settings) this.saveSettings(data.settings);
      if (data.categories) this.saveCategories(data.categories);
      if (data.products) this.saveProducts(data.products);
      if (data.stories) this.saveStories(data.stories);
      return true;
    } catch (err) {
      console.error("Import error:", err);
      throw err;
    }
  },

  resetAllDataToDefault() {
    // ✅ Remove local cache keys
    localStorage.removeItem(this.getKey(STORAGE_KEYS.SETTINGS));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.CATEGORIES));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.PRODUCTS));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.STORIES));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.CART));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.APPLIED_COUPON));
    localStorage.removeItem(this.getKey(STORAGE_KEYS.THEME_MODE));
    this.initTheme();

    // Reset cloud data to clean defaults while preserving owner metadata and license
    this.pushToCloud('settings', DEFAULT_SETTINGS);
    this.pushToCloud('categories', []);
    this.pushToCloud('products', []);
    this.pushToCloud('stories', []);

    window.dispatchEvent(new Event('store_settings_updated'));
    window.dispatchEvent(new Event('store_categories_updated'));
    window.dispatchEvent(new Event('store_products_updated'));
    window.dispatchEvent(new Event('store_stories_updated'));
  },

  async uploadImage(file) {
    if (!file) return null;
    const settings = this.getSettings();
    const apiKey = settings.imgbbApiKey; // ⚠️ No fallback — each restaurant must set their own key

    if (apiKey) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        });
        const json = await response.json();
        if (json && json.success && json.data && json.data.url) {
          return json.data.url;
        }
      } catch (err) {
        console.warn('ImgBB upload network error:', err);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  },

  startSubscriptionWatcher(onStatusChange) {
    const slug = this.getRestaurantSlug();
    if (!db || !slug) return;

    try {
      db.ref(`licenses/${slug}`).on('value', snap => {
        const lic = snap.val();
        if (!lic) return;

        const isBlocked = lic.status === 'blocked' || lic.status === 'suspended';
        const isExpired = lic.expiresAt && (Date.now() > new Date(lic.expiresAt).getTime());

        if (isBlocked || isExpired) {
          if (typeof onStatusChange === 'function') {
            onStatusChange({ active: false, reason: isBlocked ? 'blocked' : 'expired', lic });
          }
        } else {
          if (typeof onStatusChange === 'function') {
            onStatusChange({ active: true, lic });
          }
        }
      });
    } catch (err) {
      console.warn("Firebase license watcher:", err);
    }
  }
};

if (typeof window !== 'undefined') {
  window.Store = Store;
}

if (typeof document !== 'undefined') {
  Store.initTheme();
}
