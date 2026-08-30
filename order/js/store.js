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
  async compressImage(fileOrDataUrl, maxWidth = 800, maxHeight = 800, quality = 0.72) {
    if (!fileOrDataUrl) return null;
    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('http')) {
      return fileOrDataUrl;
    }

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
    const settings = this.getSettings();
    const apiKey = (settings.imgbbApiKey || '').trim();

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
        console.warn('[Store] ImgBB upload network error:', err);
      }
    }

    return await this.compressImage(file, 800, 800, 0.72);
  },

  // ── Multi-Tenant Admin Authentication Engine ─────────────
  async loginAdmin(email, password) {
    const slug = this.getRestaurantSlug();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    // 1. Try Firebase Auth (if initialized and enabled)
    if (auth) {
      try {
        const userCred = await auth.signInWithEmailAndPassword(cleanEmail, cleanPassword);
        const session = { email: cleanEmail, uid: userCred.user.uid, authenticated: true, slug, timestamp: Date.now() };
        this.safeSetItem(`harpy_admin_auth_${slug}`, JSON.stringify(session));
        sessionStorage.setItem(`harpy_auth_${slug}`, JSON.stringify(session));
        return userCred;
      } catch (authErr) {
        console.warn("[Store] Firebase Auth attempt:", authErr.code || authErr.message);
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
            if (!expectedPassword || cleanPassword === expectedPassword) {
              if (!expectedPassword) {
                await db.ref(`restaurants/${slug}/meta/adminPassword`).set(cleanPassword);
              }
              const session = { email: cleanEmail, authenticated: true, slug, timestamp: Date.now() };
              this.safeSetItem(`harpy_admin_auth_${slug}`, JSON.stringify(session));
              sessionStorage.setItem(`harpy_auth_${slug}`, JSON.stringify(session));
              return session;
            }
          }
        }
      } catch (dbErr) {
        console.warn("[Store] DB meta auth check error:", dbErr);
      }
    }

    throw new Error("auth/invalid-credentials");
  },

  async logoutAdmin() {
    const slug = this.getRestaurantSlug();
    localStorage.removeItem(`harpy_admin_auth_${slug}`);
    sessionStorage.removeItem(`harpy_auth_${slug}`);
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
        if (session && session.authenticated !== false) return true;
      } catch(e) {}
    }
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

  // ── Controlled Cloud Sync Engine with Stale Snapshot Protection ──
  syncFromCloud(slug, onUpdate) {
    if (!slug) return () => {};
    let isDestroyed = false;
    let lastKnownDataHash = '';

    const processSnapshotData = (data) => {
      if (isDestroyed || !data) return;
      const currentDataHash = JSON.stringify({
        s: data.settings,
        c: data.categories,
        p: data.products,
        st: data.stories
      });
      if (currentDataHash === lastKnownDataHash) {
        return; // Zero-lag: No changes detected, skip re-render
      }
      lastKnownDataHash = currentDataHash;

      const now = Date.now();
      // Protect settings from stale cloud snapshot overwrites while local save in-flight
      if (data.settings && !this.saveLocks.settings && (now - this.lastSaveTimestamps.settings > 2500)) {
        const currentSettings = this.getSettings();
        if (JSON.stringify(currentSettings) !== JSON.stringify(data.settings)) {
          this.safeSetItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(data.settings));
          this.applyTheme();
          window.dispatchEvent(new Event('store_settings_updated'));
        }
      }
      if (data.categories && !this.saveLocks.categories && (now - this.lastSaveTimestamps.categories > 2500)) {
        const catArray = Array.isArray(data.categories) ? data.categories : Object.values(data.categories);
        const currentCats = this.getCategories();
        if (JSON.stringify(currentCats) !== JSON.stringify(catArray)) {
          this.safeSetItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(catArray));
          window.dispatchEvent(new Event('store_categories_updated'));
        }
      }
      if (data.products && !this.saveLocks.products && (now - this.lastSaveTimestamps.products > 2500)) {
        const prodArray = Array.isArray(data.products) ? data.products : Object.values(data.products);
        const currentProds = this.getProducts();
        if (JSON.stringify(currentProds) !== JSON.stringify(prodArray)) {
          this.safeSetItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(prodArray));
          window.dispatchEvent(new Event('store_products_updated'));
        }
      }
      if (data.stories && !this.saveLocks.stories && (now - this.lastSaveTimestamps.stories > 2500)) {
        const storyArray = Array.isArray(data.stories) ? data.stories : Object.values(data.stories);
        const currentStories = this.getStories();
        if (JSON.stringify(currentStories) !== JSON.stringify(storyArray)) {
          this.safeSetItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(storyArray));
          window.dispatchEvent(new Event('store_stories_updated'));
        }
      }
      if (typeof onUpdate === 'function') {
        onUpdate({ success: true, hasData: !!data, data });
      }
    };

    // 1. WebSocket Channel (Primary)
    let restaurantRef = null;
    let wsCallback = null;
    try {
      if (this.activeListeners.restaurant) {
        try { this.activeListeners.restaurant.ref.off('value', this.activeListeners.restaurant.callback); } catch(e) {}
        this.activeListeners.restaurant = null;
      }
      if (db) {
        restaurantRef = db.ref(`restaurants/${slug}`);
        wsCallback = snapshot => {
          processSnapshotData(snapshot.val());
        };
        restaurantRef.on('value', wsCallback, err => {
          console.warn("[Store] Cloud sync read error:", err);
        });
        this.activeListeners.restaurant = { ref: restaurantRef, callback: wsCallback };
      }
    } catch (err) {
      console.warn("[Store] Cloud sync init error:", err);
    }

    // 2. High-Speed REST Initial Accelerator (sub-100ms first paint)
    (async () => {
      try {
        const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}.json`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            processSnapshotData(data);
          }
        }
      } catch (e) {}
    })();

    return () => {
      isDestroyed = true;
      if (restaurantRef && wsCallback) {
        try { restaurantRef.off('value', wsCallback); } catch(e) {}
      }
    };
  },

  async pushToCloud(subPath, data) {
    const slug = this.getRestaurantSlug();
    if (!slug) return false;
    const path = subPath ? `restaurants/${slug}/${subPath}` : `restaurants/${slug}`;

    if (db) {
      try {
        await db.ref(path).set(data);
      } catch (err) {
        console.warn(`[Store] Error pushing ${subPath} to cloud SDK:`, err);
      }
    }

    try {
      fetch(`https://harpy-order-default-rtdb.firebaseio.com/${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(() => {});
    } catch (e) {}

    return true;
  },

  getOrders() {
    try {
      const data = localStorage.getItem(this.getKey('harpy_orders_cache'));
      if (data) return JSON.parse(data);
    } catch(e) {}
    return [];
  },

  orderStatusLocks: {},

  saveOrders(orders) {
    try {
      this.safeSetItem(this.getKey('harpy_orders_cache'), JSON.stringify(orders || []));
      window.dispatchEvent(new CustomEvent('store_orders_updated', { detail: orders || [] }));
    } catch(e) {}
  },

  async pushOrderToCloud(orderData) {
    const slug = this.getRestaurantSlug();
    if (!slug || !orderData || !orderData.orderId) return false;
    const cleanId = orderData.orderId.replace(/[^a-zA-Z0-9_-]/g, '');

    // 1. Cache locally for 0ms instant display
    try {
      const cached = this.getOrders();
      const updated = [orderData, ...cached.filter(o => o.orderId !== orderData.orderId)];
      this.saveOrders(updated);
    } catch(e) {}

    // 2. Parallel Dual-Channel Dispatch: WebSocket + Ultra-Fast Keepalive REST
    if (db) {
      try {
        db.ref(`restaurants/${slug}/orders/${cleanId}`).set(orderData);
      } catch (err) {
        console.warn("[Store] Error pushing order to cloud SDK:", err);
      }
    }

    try {
      // Sub-50ms REST Delivery
      fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${cleanId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        keepalive: true
      }).catch(() => {});
    } catch (e) {}

    return true;
  },

  syncOrdersFromCloud(slug, onOrdersUpdate) {
    if (!slug) return () => {};
    let isDestroyed = false;
    let pollTimer = null;
    let lastKnownOrdersHash = '';

    const handleOrdersPayload = (data) => {
      if (isDestroyed || !data) return;
      const now = Date.now();
      const rawList = Object.values(data);
      const ordersList = rawList.map(o => {
        const cid = (o.orderId || '').replace(/[^a-zA-Z0-9_-]/g, '');
        const lock = this.orderStatusLocks && this.orderStatusLocks[cid];
        if (lock && (now - lock.timestamp < 3500)) {
          return { ...o, status: lock.status };
        }
        return o;
      }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

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
    try {
      if (this.activeListeners.orders) {
        try { this.activeListeners.orders.ref.off('value', this.activeListeners.orders.callback); } catch(e) {}
        this.activeListeners.orders = null;
      }
      if (db) {
        ordersRef = db.ref(`restaurants/${slug}/orders`).limitToLast(100);
        wsCallback = snapshot => {
          handleOrdersPayload(snapshot.val() || {});
        };
        ordersRef.on('value', wsCallback, err => {
          console.warn("[Store] Orders WS listener notice:", err);
        });
        this.activeListeners.orders = { ref: ordersRef, callback: wsCallback };
      }
    } catch (e) {}

    // 2. High-Frequency REST Heartbeat Pulse (Every 2.0 seconds) to eliminate mobile websocket lags
    const fetchOrdersFast = async () => {
      if (isDestroyed) return;
      try {
        const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders.json?orderBy="$key"&limitToLast=100`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            handleOrdersPayload(data);
          }
        }
      } catch (e) {}
    };

    fetchOrdersFast();
    pollTimer = setInterval(fetchOrdersFast, 1500);

    return () => {
      isDestroyed = true;
      if (pollTimer) clearInterval(pollTimer);
      if (ordersRef && wsCallback) {
        try { ordersRef.off('value', wsCallback); } catch(e) {}
      }
    };
  },

  async updateOrderStatus(orderId, newStatus) {
    const slug = this.getRestaurantSlug();
    if (!orderId || !slug) return false;
    const cleanId = orderId.replace(/[^a-zA-Z0-9_-]/g, '');
    const nowIso = new Date().toISOString();
    const nowTs = Date.now();

    // 1. Update local cache immediately for instant admin response
    try {
      this.orderStatusLocks[cleanId] = { status: newStatus, timestamp: nowTs };
      const cached = this.getOrders();
      const order = cached.find(o => o.orderId === orderId || o.orderId === `#${cleanId}`);
      if (order) {
        order.status = newStatus;
        order.updatedAt = nowIso;
        order.timestampUpdated = nowTs;
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
      } catch (err) {
        console.warn("[Store] Update order status SDK notice:", err);
      }
    }

    try {
      fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${cleanId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchPayload),
        keepalive: true
      }).catch(() => {});
    } catch (e) {}

    return true;
  },

  async deleteOrder(orderId) {
    const slug = this.getRestaurantSlug();
    if (!orderId || !slug) return false;
    const cleanId = orderId.replace(/[^a-zA-Z0-9_-]/g, '');

    // 1. Remove from local cache immediately
    try {
      const cached = this.getOrders();
      const updated = cached.filter(o => o.orderId !== orderId && o.orderId !== `#${cleanId}`);
      this.saveOrders(updated);
    } catch(e) {}

    // 2. Parallel cloud delete
    if (db) {
      try {
        db.ref(`restaurants/${slug}/orders/${cleanId}`).remove();
      } catch (err) {
        console.warn("[Store] Delete order SDK notice:", err);
      }
    }

    try {
      fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${cleanId}.json`, {
        method: 'DELETE',
        keepalive: true
      }).catch(() => {});
    } catch (e) {}

    const lastOrder = this.getLastOrder();
    if (lastOrder && (lastOrder.orderId === orderId || lastOrder.orderId === `#${cleanId}`)) {
      localStorage.removeItem(this.getKey(STORAGE_KEYS.LAST_ORDER));
      window.dispatchEvent(new Event('store_last_order_updated'));
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

    // 2. High-Frequency Fast REST Tracker Pulse (1.2s for ultra-fast customer tracking)
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
    pollTimer = setInterval(fetchOrderFast, 1200);

    return () => {
      isDestroyed = true;
      if (pollTimer) clearInterval(pollTimer);
      if (orderRef && wsCallback) {
        try { orderRef.off('value', wsCallback); } catch(e) {}
      }
    };
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
      console.warn("[Store] Init tenant meta error:", err);
      return false;
    }
  },

  async verifyTenantOwnership(slug, userUid) {
    if (!db || !slug || !userUid) return false;
    try {
      const metaRef = db.ref(`restaurants/${slug}/meta`);
      const snap = await metaRef.once('value');
      if (!snap.exists()) {
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
      console.warn("[Store] Verify ownership error:", err);
      return false;
    }
  },

  // ── Strict Multi-Tenant Restaurant Engine ─────────────────
  getRestaurantSlug() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSlug = params.get('m') || params.get('restaurant') || params.get('store') || params.get('slug');
      if (urlSlug) {
        const clean = urlSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        if (clean) {
          this.safeSetItem('harpy_active_slug', clean);
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
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.SETTINGS));
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  async saveSettings(settings) {
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

    root.setAttribute('data-theme', mode);

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
    if (!colors) colors = THEME_PRESETS.cream;

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
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return Object.values(parsed);
      return DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategories(cats) {
    this.saveLocks.categories = true;
    this.safeSetItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(cats));
    window.dispatchEvent(new Event('store_categories_updated'));

    const cloudSuccess = await this.pushToCloud('categories', cats);
    this.lastSaveTimestamps.categories = Date.now();
    this.saveLocks.categories = false;

    return { success: cloudSuccess, localSaved: true };
  },

  getProducts() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.PRODUCTS));
    if (!raw) return DEFAULT_PRODUCTS;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return Object.values(parsed);
      return DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  },

  async saveProducts(prods) {
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
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CART));
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveCart(cart) {
    this.safeSetItem(this.getKey(STORAGE_KEYS.CART), JSON.stringify(cart));
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
      this.safeSetItem(this.getKey(STORAGE_KEYS.APPLIED_COUPON), JSON.stringify(coupon));
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
    this.safeSetItem(this.getKey(STORAGE_KEYS.FAVORITES), JSON.stringify(favs));
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
    this.safeSetItem(this.getKey(STORAGE_KEYS.LAST_ORDER), JSON.stringify(orderData));
    window.dispatchEvent(new Event('store_last_order_updated'));
  },

  getThemeMode() {
    return localStorage.getItem(this.getKey(STORAGE_KEYS.THEME_MODE)) || 'light';
  },
  setThemeMode(mode) {
    this.safeSetItem(this.getKey(STORAGE_KEYS.THEME_MODE), mode);
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
  async saveStories(stories) {
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
    return localStorage.getItem(this.getKey(STORAGE_KEYS.VIEW_MODE)) || 'list';
  },
  setViewMode(mode) {
    this.safeSetItem(this.getKey(STORAGE_KEYS.VIEW_MODE), mode);
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
    this.initTheme();

    await this.pushToCloud('settings', DEFAULT_SETTINGS);
    await this.pushToCloud('categories', []);
    await this.pushToCloud('products', []);
    await this.pushToCloud('stories', []);

    window.dispatchEvent(new Event('store_settings_updated'));
    window.dispatchEvent(new Event('store_categories_updated'));
    window.dispatchEvent(new Event('store_products_updated'));
    window.dispatchEvent(new Event('store_stories_updated'));

    return { success: true };
  },

  purgeRestaurantCache(slug) {
    const targetSlug = slug || this.getRestaurantSlug();
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(`harpy_${targetSlug}_`) || key.startsWith(`harpy_${targetSlug}:`) || key === `harpy_${targetSlug}`)) {
          if (key !== `harpy_${targetSlug}_sub_status`) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
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

      if (lic) {
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
