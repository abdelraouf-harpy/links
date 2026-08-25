// ═══════════════════════════════════════════════════════════
// HarpyOrder — Store & Data Manager (Rock-Solid Multi-Tenant Engine)
// ═══════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  SETTINGS: 'harpy_order_settings',
  CATEGORIES: 'harpy_order_categories',
  PRODUCTS: 'harpy_order_products',
  CART: 'harpy_order_cart',
  FAVORITES: 'harpy_order_favorites',
  LAST_ORDER: 'harpy_order_last_order',
  THEME_MODE: 'harpy_theme_mode',
  APPLIED_COUPON: 'harpy_applied_coupon'
};

const THEME_PRESETS = {
  charcoal: {
    id: "charcoal",
    name: "دفتر الفحم الدافئ",
    badge: "فحم وخشب داكن",
    bg: "#110e0c",
    surface: "#1c1713",
    surfaceRaised: "#251f1a",
    headerBg: "#110e0c",
    textMain: "#faf6f0",
    textBody: "#d4c9ba",
    primary: "#c2410c",
    border: "rgba(245, 238, 227, 0.09)"
  },
  cream: {
    id: "cream",
    name: "الورق العاجي الفاتح",
    badge: "نهاري راقي وكافيهات",
    bg: "#faf7f2",
    surface: "#ffffff",
    surfaceRaised: "#f5eedf",
    headerBg: "#faf7f2",
    textMain: "#1c1815",
    textBody: "#4a4035",
    primary: "#9a3412",
    border: "rgba(60, 45, 30, 0.09)"
  },
  olive: {
    id: "olive",
    name: "الزيتوني الريفي والروستيك",
    badge: "طبيعي ومزارع خضراء",
    bg: "#0d1410",
    surface: "#1a2720",
    surfaceRaised: "#23352c",
    headerBg: "#0d1410",
    textMain: "#f0f7f2",
    textBody: "#c8ded0",
    primary: "#15803d",
    border: "rgba(230, 245, 235, 0.09)"
  },
  midnight: {
    id: "midnight",
    name: "الأسود والذهب الملكي",
    badge: "فخامة لاونج وستيك",
    bg: "#0a0a0a",
    surface: "#181818",
    surfaceRaised: "#242424",
    headerBg: "#0a0a0a",
    textMain: "#ffffff",
    textBody: "#d4d4d4",
    primary: "#d97706",
    border: "rgba(217, 119, 6, 0.25)"
  },
  indigo: {
    id: "indigo",
    name: "الأزرق النيلي العصري",
    badge: "سي فود وشبابي عصري",
    bg: "#0b1120",
    surface: "#16223f",
    surfaceRaised: "#1e2e54",
    headerBg: "#0b1120",
    textMain: "#f8faff",
    textBody: "#cbd8f0",
    primary: "#2563eb",
    border: "rgba(224, 236, 255, 0.09)"
  },
  bordeaux: {
    id: "bordeaux",
    name: "العنابي الفاخر والبوردو",
    badge: "مشويات وشاعري دافئ",
    bg: "#150a0d",
    surface: "#28151b",
    surfaceRaised: "#361d24",
    headerBg: "#150a0d",
    textMain: "#fff5f7",
    textBody: "#ecc8d0",
    primary: "#be123c",
    border: "rgba(255, 230, 236, 0.09)"
  },
  sunset: {
    id: "sunset",
    name: "البرتقالي المنعش والفاير",
    badge: "برجر وفاست فود",
    bg: "#140e08",
    surface: "#24180d",
    surfaceRaised: "#332212",
    headerBg: "#140e08",
    textMain: "#fffaf0",
    textBody: "#e8d5bf",
    primary: "#ea580c",
    border: "rgba(234, 88, 12, 0.18)"
  }
};

const DEFAULT_SETTINGS = {
  storeName: "شاورما وبيرجر الهرمل",
  storeTagline: "أشهى السندوتشات والوجبات السريعة طازجة يومياً على الحطب",
  whatsappNumber: "201012345678",
  walletNumber: "01012345678",
  walletName: "فودافون كاش / إنستاباي",
  currency: "ج.م",
  adminPin: "1234",
  logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=60",
  cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
  imgbbApiKey: "9716f16445d36094b2e16dd8682fc0c1",
  
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

  promoCodes: [
    { code: "HERMEL10", type: "percent", value: 10, desc: "خصم 10%" },
    { code: "BURGER50", type: "fixed", value: 50, desc: "خصم 50 ج.م" }
  ],

  announcementText: "خصم 10% عند الدفع بفودافون كاش أو إنستاباي • وخصم 15% للطلبات فوق 300 ج.م",
  showAnnouncement: true,
  deliveryTime: "30-45 دقيقة",
  minOrder: 0
};

const DEFAULT_CATEGORIES = [
  "سندوتشات بيرجر",
  "شاورما وسوري",
  "وجبات ومقبلات",
  "مشروبات منعشة"
];

const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    name: "جراند بيرجر لحم دبل",
    category: "سندوتشات بيرجر",
    price: 140,
    originalPrice: 160,
    desc: "شريحتين لحم بقري أنجوس مشوي على اللهب، جبن شيدر سايح، خس مقرمش، طماطم، وصوص خاص مع خبز بريوش طازج",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    prepTime: "15 دقيقة",
    visible: true,
    isFeatured: true,
    badge: "عرض خاص"
  },
  {
    id: "p2",
    name: "بيرجر كريسبي دجاج حار",
    category: "سندوتشات بيرجر",
    price: 115,
    originalPrice: 0,
    desc: "صدر دجاج كريسبي مقرمش بتتبيلة حارة، صوص هالبينو كريمي، جبنة شيدر، سلطة كول سلو منعشة",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
    prepTime: "12 دقيقة",
    visible: true,
    isFeatured: true,
    badge: "سبايسي"
  },
  {
    id: "p3",
    name: "شاورما عربي دجاج دبل",
    category: "شاورما وسوري",
    price: 110,
    originalPrice: 125,
    desc: "شاورما دجاج متبلة على السيخ، ثومية كريمية، مخلل خيار، بطاطس ذهبية مقرمشة في خبز الصاج السوري المحمص",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    prepTime: "10 دقائق",
    visible: true,
    isFeatured: false,
    badge: "وجبة شيف"
  },
  {
    id: "p4",
    name: "صاروخ شاورما لحم بلدي",
    category: "شاورما وسوري",
    price: 125,
    originalPrice: 0,
    desc: "شاورما لحم بلدي متبل مع بقدونس طازج، بصل متبل بالسماق، وطحينة سمسم فاخرة داخل رغيف صاج كبير",
    image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&auto=format&fit=crop&q=80",
    prepTime: "12 دقيقة",
    visible: true,
    isFeatured: false,
    badge: "لحم بلدي"
  },
  {
    id: "p5",
    name: "بطاطس بالجبن والهلابينو",
    category: "وجبات ومقبلات",
    price: 55,
    originalPrice: 0,
    desc: "بطاطس ويدجز ذهبية مقرمشة مغطاة بصوص جبن الشيدر الغني وشرائح الهالبينو المكسيكي الحار",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
    prepTime: "8 دقائق",
    visible: true,
    isFeatured: false,
    badge: "سناكس"
  },
  {
    id: "p6",
    name: "أصابع موزاريلا مقرمشة",
    category: "وجبات ومقبلات",
    price: 65,
    originalPrice: 75,
    desc: "5 أصابع جبن موزاريلا إيطالية مقلية ذهبية تقدم مع صوص المارينارا العشبي اللذيذ",
    image: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&auto=format&fit=crop&q=80",
    prepTime: "8 دقائق",
    visible: true,
    isFeatured: false,
    badge: "مقرمش"
  },
  {
    id: "p7",
    name: "عصير برتقال فريش",
    category: "مشروبات منعشة",
    price: 35,
    originalPrice: 0,
    desc: "عصير برتقال طبيعي معصور طازج 100% بدون أي سكر مضاف أو مواد حافظة",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80",
    prepTime: "5 دقائق",
    visible: true,
    isFeatured: false,
    badge: "طبيعي 100%"
  },
  {
    id: "p8",
    name: "بيبسي كانز 330 مل",
    category: "مشروبات منعشة",
    price: 20,
    originalPrice: 0,
    desc: "مشروب غازي كلاسيكي بارد ومنعش يقدم مثلجاً",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop&q=80",
    prepTime: "دقيقة",
    visible: true,
    isFeatured: false,
    badge: "بارد"
  }
];

function isCorrupted(str) {
  if (typeof str !== 'string') return false;
  return /\?{3,}/.test(str);
}

const Store = {
  THEME_PRESETS,

  getSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (isCorrupted(parsed.storeName) || isCorrupted(parsed.storeTagline)) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed,
        promoCodes: parsed.promoCodes || DEFAULT_SETTINGS.promoCodes,
        siteColors: { ...DEFAULT_SETTINGS.siteColors, ...(parsed.siteColors || {}) }
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.applyTheme(settings);
    window.dispatchEvent(new Event('store_settings_updated'));
  },

  applyTheme(settings) {
    const s = settings || this.getSettings();
    const mode = this.getThemeMode();
    const root = document.documentElement;

    root.setAttribute('data-theme', mode);

    if (mode === 'light') {
      root.style.setProperty('--bg', '#faf7f2');
      root.style.setProperty('--bg-subtle', '#f2ece1');
      root.style.setProperty('--surface', '#ffffff');
      root.style.setProperty('--surface-raised', '#f5eedf');
      root.style.setProperty('--surface-hover', '#eae1d0');
      root.style.setProperty('--header-bg', '#faf7f2');
      root.style.setProperty('--text-main', '#1c1815');
      root.style.setProperty('--text-body', '#4a4035');
      root.style.setProperty('--text-muted', '#7d7060');
      root.style.setProperty('--border', 'rgba(60, 45, 30, 0.09)');
      root.style.setProperty('--border-strong', 'rgba(60, 45, 30, 0.16)');
    } else {
      const colors = s.siteColors || DEFAULT_SETTINGS.siteColors;
      root.style.setProperty('--bg', colors.bg || "#110e0c");
      root.style.setProperty('--bg-subtle', colors.bg || "#110e0c");
      root.style.setProperty('--surface', colors.surface || "#1c1713");
      root.style.setProperty('--surface-raised', colors.surfaceRaised || "#251f1a");
      root.style.setProperty('--surface-hover', colors.surfaceRaised || "#251f1a");
      root.style.setProperty('--header-bg', colors.headerBg || colors.bg || "#110e0c");
      root.style.setProperty('--text-main', colors.textMain || "#faf6f0");
      root.style.setProperty('--text-body', colors.textBody || "#d4c9ba");
      root.style.setProperty('--text-muted', "#968a7a");
      root.style.setProperty('--border', colors.border || "rgba(245, 238, 227, 0.09)");
      root.style.setProperty('--border-strong', colors.border || "rgba(245, 238, 227, 0.16)");
    }

    const primary = (s.siteColors && s.siteColors.primary) || s.primaryColor || "#c2410c";
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-hover', primary);
    root.style.setProperty('--primary-subtle', primary + '22');
    root.style.setProperty('--primary-glow', primary + '40');
    root.style.setProperty('--border-focus', primary);
  },

  getCategories() {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      this.saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some(isCorrupted)) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return parsed;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },
  saveCategories(cats) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
    window.dispatchEvent(new Event('store_categories_updated'));
  },

  getProducts() {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      this.saveProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some(p => isCorrupted(p.name) || isCorrupted(p.category))) {
        this.saveProducts(DEFAULT_PRODUCTS);
        return DEFAULT_PRODUCTS;
      }
      return parsed.map(p => ({
        ...p,
        visible: p.visible !== false,
        price: parseFloat(p.price) || 0,
        originalPrice: parseFloat(p.originalPrice) || 0,
        prepTime: p.prepTime || "10-15 دقيقة",
        badge: p.badge || ""
      }));
    } catch {
      return DEFAULT_PRODUCTS;
    }
  },
  saveProducts(prods) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
    window.dispatchEvent(new Event('store_products_updated'));
  },

  addProduct(product) {
    const prods = this.getProducts();
    const newProd = {
      id: 'p_' + Date.now(),
      visible: true,
      price: parseFloat(product.price) || 0,
      originalPrice: parseFloat(product.originalPrice) || 0,
      prepTime: product.prepTime || "10-15 دقيقة",
      badge: product.badge || "",
      ...product
    };
    prods.unshift(newProd);
    this.saveProducts(prods);
    return newProd;
  },
  updateProduct(id, updatedData) {
    const prods = this.getProducts();
    const idx = prods.findIndex(p => p.id === id);
    if (idx !== -1) {
      prods[idx] = { 
        ...prods[idx], 
        ...updatedData,
        price: parseFloat(updatedData.price !== undefined ? updatedData.price : prods[idx].price) || 0,
        originalPrice: parseFloat(updatedData.originalPrice !== undefined ? updatedData.originalPrice : prods[idx].originalPrice) || 0
      };
      this.saveProducts(prods);
      return prods[idx];
    }
    return null;
  },
  deleteProduct(id) {
    let prods = this.getProducts();
    prods = prods.filter(p => p.id !== id);
    this.saveProducts(prods);
  },
  toggleProductVisibility(id) {
    const prods = this.getProducts();
    const item = prods.find(p => p.id === id);
    if (item) {
      item.visible = item.visible === false ? true : false;
      this.saveProducts(prods);
      return item.visible;
    }
    return true;
  },
  quickUpdatePrice(id, newPrice) {
    const prods = this.getProducts();
    const item = prods.find(p => p.id === id);
    if (item) {
      item.price = parseFloat(newPrice) || 0;
      this.saveProducts(prods);
      return item.price;
    }
    return 0;
  },
  reorderProducts(newOrderedIds) {
    const prods = this.getProducts();
    const reordered = [];
    newOrderedIds.forEach(id => {
      const found = prods.find(p => p.id === id);
      if (found) reordered.push(found);
    });
    prods.forEach(p => {
      if (!reordered.some(r => r.id === p.id)) {
        reordered.push(p);
      }
    });
    this.saveProducts(reordered);
  },

  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.LAST_ORDER);
    localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON);
    this.getSettings();
    this.getCategories();
    this.saveProducts(DEFAULT_PRODUCTS);
  },

  getCart() {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    window.dispatchEvent(new Event('store_cart_updated'));
  },
  clearCart() {
    this.saveCart([]);
    this.setAppliedCoupon(null);
  },

  getAppliedCoupon() {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLIED_COUPON);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setAppliedCoupon(coupon) {
    if (coupon) {
      localStorage.setItem(STORAGE_KEYS.APPLIED_COUPON, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON);
    }
    window.dispatchEvent(new Event('store_coupon_updated'));
  },

  getFavorites() {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
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
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    window.dispatchEvent(new Event('store_favorites_updated'));
    return favs.includes(productId);
  },
  isFavorite(productId) {
    return this.getFavorites().includes(productId);
  },

  getLastOrder() {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_ORDER);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  saveLastOrder(orderData) {
    localStorage.setItem(STORAGE_KEYS.LAST_ORDER, JSON.stringify(orderData));
    window.dispatchEvent(new Event('store_last_order_updated'));
  },

  getThemeMode() {
    return localStorage.getItem(STORAGE_KEYS.THEME_MODE) || 'dark';
  },
  setThemeMode(mode) {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    this.applyTheme();
    window.dispatchEvent(new CustomEvent('theme_mode_changed', { detail: mode }));
  },
  initTheme() {
    this.applyTheme();
  },

  async uploadImage(file) {
    if (!file) return null;
    const settings = this.getSettings();
    const apiKey = settings.imgbbApiKey || "9716f16445d36094b2e16dd8682fc0c1";

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
  }
};

if (typeof document !== 'undefined') {
  Store.initTheme();
}
