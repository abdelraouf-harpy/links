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
try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    db = firebase.database();
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
  storeName: "شاورما وبيرجر الهرمل",
  storeTagline: "أشهى السندوتشات والوجبات السريعة طازجة يومياً على الحطب",
  whatsappNumber: "201012345678",
  walletNumber: "01012345678",
  walletName: "فودافون كاش / إنستاباي",
  currency: "ج.م",
  adminPin: "1234",
  logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=60",
  cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
  imgbbApiKey: "", // User can add their own ImgBB API key from admin settings
  
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
    badge: "عرض خاص",
    sizes: [
      { id: "s-reg", name: "سنجل عادي", price: 0 },
      { id: "s-dbl", name: "دبل لارج (+35 ج.م)", price: 35 },
      { id: "s-trp", name: "تربل عملاق (+60 ج.م)", price: 60 }
    ],
    addons: [
      { id: "a-chz", name: "شريحة جبنة شيدر إضافية", price: 15 },
      { id: "a-sauce", name: "صوص سموكي باربكيو", price: 10 },
      { id: "a-jal", name: "قطع هلابينو حار", price: 10 }
    ]
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
    badge: "سبايسي",
    sizes: [
      { id: "s-reg", name: "حجم عادي", price: 0 },
      { id: "s-lrg", name: "حجم سوبر لارج (+25 ج.م)", price: 25 }
    ],
    addons: [
      { id: "a-chz", name: "جبنة سايحة دوبل", price: 15 },
      { id: "a-turk", name: "شريحة تركي مدخن", price: 20 }
    ]
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
    badge: "وجبة شيف",
    sizes: [
      { id: "s-reg", name: "وجبة فردية (1 رول)", price: 0 },
      { id: "s-dbl", name: "وجبة دبل (2 رول + بطاطس) (+45 ج.م)", price: 45 }
    ],
    addons: [
      { id: "a-garlic", name: "علبة ثومية زيادة", price: 10 },
      { id: "a-pickles", name: "مخلل خيار متبل", price: 8 }
    ]
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
    badge: "لحم بلدي",
    addons: [
      { id: "a-tahina", name: "طحينة سمسم فاخرة إضافية", price: 10 }
    ]
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
  }
];

const DEFAULT_STORIES = [
  {
    id: "s1",
    title: "عرض اليوم الحصري",
    tagline: "خصم 20% لفترة محدودة",
    desc: "جراند بيرجر لحم دبل مشوي على اللهب مع بطاطس بالجبن ومشروب منعش بخصم حصري اليوم فقط!",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    productId: "p1",
    badge: "خصم 20%"
  },
  {
    id: "s2",
    title: "شاورما الصاج المحمص",
    tagline: "طعم لا يقاوم",
    desc: "شاورما دجاج ولحم بالصاج السوري المقرمش مع الثومية الخاصة وسلطة المخلل اللذيذة.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    productId: "p3",
    badge: "الأكثر طلباً"
  },
  {
    id: "s3",
    title: "سناكس ومقبلات مقرمشة",
    tagline: "كمل وجبتك",
    desc: "أصابع الموزاريلا الغنية وبطاطس الهلابينو بالجبنة الشيدر الساخنة لتجربة طعام متكاملة.",
    image: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&auto=format&fit=crop&q=80",
    productId: "p6",
    badge: "قرمشة شيدر"
  }
];

const Store = {
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
      const name = customName || (slug === 'hermel' ? 'شاورما وبيرجر الهرمل' : `مطعم ${slug}`);
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
      return raw ? JSON.parse(raw) : [{ slug: 'hermel', name: 'شاورما وبيرجر الهرمل' }];
    } catch {
      return [{ slug: 'hermel', name: 'شاورما وبيرجر الهرمل' }];
    }
  },

  getKey(baseKey) {
    const slug = this.getRestaurantSlug();
    return `harpy_${slug}_${baseKey}`;
  },

  getSettings() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.SETTINGS));
    if (!raw) {
      // If default hermel or custom store with no settings yet
      const slug = this.getRestaurantSlug();
      if (slug !== 'hermel') {
        return { ...DEFAULT_SETTINGS, storeName: `مطعم ${slug}` };
      }
      return DEFAULT_SETTINGS;
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings(settings) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(settings));
    if (settings.storeName) {
      this.registerRestaurant(this.getRestaurantSlug(), settings.storeName);
    }
    this.applyTheme();
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
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CATEGORIES)) || localStorage.getItem(STORAGE_KEYS.CATEGORIES);
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
    window.dispatchEvent(new Event('store_categories_updated'));
  },

  getProducts() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.PRODUCTS)) || localStorage.getItem(STORAGE_KEYS.PRODUCTS);
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

  getStories() {
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.STORIES));
    try {
      return raw ? JSON.parse(raw) : DEFAULT_STORIES;
    } catch {
      return DEFAULT_STORIES;
    }
  },
  saveStories(stories) {
    localStorage.setItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(stories));
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
    const raw = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return raw === null ? true : raw === 'true';
  },
  setSoundEnabled(enabled) {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
    window.dispatchEvent(new CustomEvent('store_sound_changed', { detail: enabled }));
  },

  getViewMode() {
    return localStorage.getItem(STORAGE_KEYS.VIEW_MODE) || 'grid';
  },
  setViewMode(mode) {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
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
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.STORIES);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON);
    this.initTheme();
    window.dispatchEvent(new Event('store_settings_updated'));
    window.dispatchEvent(new Event('store_categories_updated'));
    window.dispatchEvent(new Event('store_products_updated'));
    window.dispatchEvent(new Event('store_stories_updated'));
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

if (typeof document !== 'undefined') {
  Store.initTheme();
}
