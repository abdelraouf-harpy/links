// ═══════════════════════════════════════════════════════════
// HarpyOrder — Store & Data Manager (Multi-Tenant Ready Engine)
// ═══════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  SETTINGS: 'harpy_order_settings',
  CATEGORIES: 'harpy_order_categories',
  PRODUCTS: 'harpy_order_products',
  CART: 'harpy_order_cart',
  FAVORITES: 'harpy_order_favorites',
  LAST_ORDER: 'harpy_order_last_order',
  THEME_MODE: 'harpy_theme_mode'
};

// Default Sample Data with Full Restaurant Customization
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
  
  // Custom Visual Identity & Store Options
  primaryColor: "#c2410c", // Brand Accent
  announcementText: "🔥 خصم خاص 10% عند الدفع بالمحفظة الإلكترونية • توصيل سريع لباب البيت",
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
    desc: "شريحتين لحم بقري أنجوس مشوي على اللهب، جبن شيدر سايح، خس مقرمش، طماطم، وصوص خاص مع خبز بريوش طازج",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    prepTime: "15 دقيقة",
    visible: true,
    isFeatured: true,
    badge: "الأكثر طلباً"
  },
  {
    id: "p2",
    name: "بيرجر كريسبي دجاج حار",
    category: "سندوتشات بيرجر",
    price: 115,
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

// ── Store API ──────────────────────────────────────────────
const Store = {
  // Settings
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
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.applyBrandColor(settings.primaryColor);
    window.dispatchEvent(new Event('store_settings_updated'));
  },

  // Apply Brand Theme Color to CSS Variables
  applyBrandColor(color) {
    if (!color) color = "#c2410c";
    const root = document.documentElement;
    root.style.setProperty('--primary', color);
    root.style.setProperty('--primary-hover', color);
    root.style.setProperty('--primary-subtle', color + '24');
    root.style.setProperty('--primary-glow', color + '45');
    root.style.setProperty('--border-focus', color);
  },

  // Categories
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

  // Products
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

  // Product Actions
  addProduct(product) {
    const prods = this.getProducts();
    const newProd = {
      id: 'p_' + Date.now(),
      visible: true,
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
      prods[idx] = { ...prods[idx], ...updatedData };
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

  // Reset to default state
  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.LAST_ORDER);
    this.getSettings();
    this.getCategories();
    this.saveProducts(DEFAULT_PRODUCTS);
  },

  // Cart Management
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
  },

  // Favorites Management
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

  // Last Order Memory
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

  // Day/Night Theme Mode (Light / Dark)
  getThemeMode() {
    return localStorage.getItem(STORAGE_KEYS.THEME_MODE) || 'dark';
  },
  setThemeMode(mode) {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    document.documentElement.setAttribute('data-theme', mode);
    window.dispatchEvent(new CustomEvent('theme_mode_changed', { detail: mode }));
  },
  initTheme() {
    const mode = this.getThemeMode();
    document.documentElement.setAttribute('data-theme', mode);
    const settings = this.getSettings();
    this.applyBrandColor(settings.primaryColor);
  },

  // Image Upload via ImgBB
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

// Auto initialize brand color and theme on script load
if (typeof document !== 'undefined') {
  Store.initTheme();
}
