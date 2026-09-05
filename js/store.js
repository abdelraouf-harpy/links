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
  storeName: "سوبر برجر | Super Burger 🍔🔥",
  storeTagline: "أشهى المأكولات الطازجة",
  whatsappNumber: "01019971508",
  walletNumber: "01019971508",
  walletName: "فودافون كاش / إنستاباي",
  currency: "ج.م",
  adminPin: "1234",
  logo: "https://images.unsplash.com/photo-1586190848861-99aa4a171e9c?w=200&auto=format&fit=crop&q=80",
  cover: "https://images.unsplash.com/photo-1568901346375-23c9450c58c9?w=1200&auto=format&fit=crop&q=80",
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

  announcementText: "خصم 15% على جميع الوجبات لفترة محدودة 🔥",
  showAnnouncement: true,
  deliveryTime: "25 - 40 دقيقة",
  minOrder: 0,
  deliverySettings: {
    defaultFee: 15,
    customZones: []
  },
  isOrderingPaused: false,
  orderingPausedMessage: "المطعم متوقف حالياً عن استقبال الطلبات. مواعيد العمل يومياً من 12 ظهراً حتى 2 صباحاً. نسعد بخدمتكم قريباً!"
};

const BLANK_SETTINGS = {
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
  orderingPausedMessage: "المطعم متوقف حالياً عن استقبال الطلبات."
};

const DEFAULT_CATEGORIES = [
  "برجر وفرايد تشيكن 🍔",
  "الكريبات اللذيذة 🌯",
  "ساندوتشات سوري (راب) 🥖",
  "فرايز بوكس 🍟",
  "إضافات ومقبلات 🧀",
  "الصوصات المميزة 🥣",
  "السلطات والمشهيات 🥗",
  "المشروبات الغازية 🥤"
];
const DEFAULT_PRODUCTS = [
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "الأكثر طلباً 🔥",
    "calories": "950 سعرة",
    "category": "برجر وفرايد تشيكن 🍔",
    "desc": "ساندوتش الملوك الأسطوري! قطعة بيف برجر مشوي على الفحم + قطعة فرايد تشيكن كرسبي + تشيكن برجر، مغطى بصوص الشيدر والخضار الطازج مع باكيت بطاطس بصوص الشيدر مجاناً.",
    "id": "prod-super-burger-triple",
    "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
    "isChefMood": true,
    "isFeatured": false,
    "isPopular": true,
    "name": "سوبر برجر الثلاثي",
    "originalPrice": 0,
    "prepTime": "15-20 دقيقة",
    "price": 220,
    "visible": false
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "سبيشيال ⭐",
    "calories": "780 سعرة",
    "category": "برجر وفرايد تشيكن 🍔",
    "desc": "مكس الجبابرة! قطعة بيف برجر لحم صافي + قطعة فرايد تشيكن كرسبي ذهبي مع الجبنة الذائبة، يقدم مع باكيت بطاطس بصوص الشيدر.",
    "id": "prod-mix-burger-double",
    "image": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "isPopular": true,
    "name": "مكس برجر دبل",
    "originalPrice": 0,
    "prepTime": "15 دقيقة",
    "price": 160,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "مقرمش ذهبي ✨",
    "calories": "620 سعرة",
    "category": "برجر وفرايد تشيكن 🍔",
    "desc": "صدور دجاج مقرمشة بتتبيلة سرية خاصة مع خس وطماطم وصوصات سوبر برجر، يقدم مع باكيت بطاطس بصوص الشيدر.",
    "id": "prod-fried-chicken-burger",
    "image": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "فرايد تشيكن",
    "originalPrice": 0,
    "prepTime": "12-15 دقيقة",
    "price": 105,
    "sizes": [
      {
        "id": "s_0",
        "name": "سنجل Single (قطعة واحدة)",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "دبل Double (قطعتين)",
        "price": 55
      },
      {
        "id": "s_2",
        "name": "تريبل Triple (3 قطع)",
        "price": 115
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "مشوي فحم 🔥",
    "calories": "580 سعرة",
    "category": "برجر وفرايد تشيكن 🍔",
    "desc": "برجر لحم بلدي مشوي على الفحم بنكهة الشواء الغنية مع صوص خاص، يقدم مع باكيت بطاطس بصوص الشيدر.",
    "id": "prod-beef-burger",
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "بيف برجر",
    "originalPrice": 0,
    "prepTime": "15 دقيقة",
    "price": 105,
    "sizes": [
      {
        "id": "s_0",
        "name": "سنجل Single",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "دبل Double",
        "price": 55
      },
      {
        "id": "s_2",
        "name": "تريبل Triple",
        "price": 115
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "خفيف ولذيذ",
    "calories": "510 سعرة",
    "category": "برجر وفرايد تشيكن 🍔",
    "desc": "برجر دجاج مفروم بتتبيلة شهية مع صوص ومايونيز وجبنة، يقدم مع باكيت بطاطس بصوص الشيدر.",
    "id": "prod-chicken-burger",
    "image": "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "تشيكن برجر",
    "originalPrice": 0,
    "prepTime": "12 دقيقة",
    "price": 95,
    "sizes": [
      {
        "id": "s_0",
        "name": "سنجل Single",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "دبل Double",
        "price": 45
      },
      {
        "id": "s_2",
        "name": "تريبل Triple",
        "price": 105
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "سبيشيال سوبر ⭐",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "كريب هرمي مقرمش محشو شيش طاووق + ستريبس دجاج مقرمش + قطع بيف برجر مع صوص سوبر برجر الخاص .",
    "id": "prod-crepe-super-burger",
    "image": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "isPopular": true,
    "name": "كريب سوبر برجر الخاص",
    "originalPrice": 0,
    "prepTime": "12-15 دقيقة",
    "price": 145,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "مكس تشيكن ⚡",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "مكس الدجاج الفاخر في عجينة كريب مقرمشة: قطع شيش طاووق متبل مع دجاج كرسبي وصوص رانش وموتزريلا غنية.",
    "id": "prod-crepe-mix-chicken",
    "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب مكس تشيكن",
    "originalPrice": 0,
    "prepTime": "12 دقيقة",
    "price": 140,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "لحوم مشوية 🔥",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "عشاق اللحوم: كفتة مشوية على الفحم مع قطع بيف برجر وصوص باربيكيو وموتزريلا شهية في كريب طازج.",
    "id": "prod-crepe-mix-beef",
    "image": "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب مكس بيف",
    "originalPrice": 0,
    "prepTime": "12 دقيقة",
    "price": 140,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "حار وسبايسي 🌶️",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "قطع دجاج كرسبي حار ومقرمش مع موتزريلا وصوص فاير حار، للمحبين الحقيقيين للسبايسي.",
    "id": "prod-crepe-crispy-spicy",
    "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب كرسبي سبايسي",
    "originalPrice": 0,
    "prepTime": "10-12 دقيقة",
    "price": 130,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "مقرمش",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "أصابع دجاج ستريبس كرسبي ذهبية مع خضار وموتزريلا وصوص مايونيز وكاتشب في كريب محمص.",
    "id": "prod-crepe-strips",
    "image": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب ستريبس دجاج",
    "originalPrice": 0,
    "prepTime": "10 دقيقة",
    "price": 130,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "تتبيلة شرقية",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "شيش طاووق متبل على الطريقة الشرقية مع فلفل وزيتون وموتزريلا في عجينة كريب طازجة.",
    "id": "prod-crepe-shish",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب شيش طاووق",
    "originalPrice": 0,
    "prepTime": "12 دقيقة",
    "price": 130,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "مشوي فحم",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "كفتة لحم بلدي مشوية على الفحم مع طحينة وموتزريلا في كريب محمص مقرمش.",
    "id": "prod-crepe-kofta",
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب كفتة فحم",
    "originalPrice": 0,
    "prepTime": "12 دقيقة",
    "price": 135,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "شاورما فراخ",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "شاورما دجاج متبلة ومقلية مع تومية وخيار مخلل وموتزريلا داخل كريب ساخن.",
    "id": "prod-crepe-shawarma-chicken",
    "image": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب شاورما فراخ",
    "originalPrice": 0,
    "prepTime": "10 دقيقة",
    "price": 125,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "شاورما لحمة",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "شاورما لحم بلدي مع بقدونس وبصل وطماطم وصوص طحينة وموتزريلا في كريب شهي.",
    "id": "prod-crepe-shawarma-meat",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب شاورما لحمة",
    "originalPrice": 0,
    "prepTime": "12 دقيقة",
    "price": 135,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "كلاسيك",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "قطع هوت دوج مدخن مع صوص باربيكيو وموتزريلا وخضار مشكل في كريب محمص.",
    "id": "prod-crepe-hotdog",
    "image": "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب هوت دوج",
    "originalPrice": 0,
    "prepTime": "10 دقيقة",
    "price": 105,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "اقتصادي ولذيذ",
    "category": "الكريبات اللذيذة 🌯",
    "desc": "بطاطس مقرمشة ذهبية مع صوص الشيدر وموتزريلا وكاتشب داخل كريب خفيف ومقرمش.",
    "id": "prod-crepe-fries",
    "image": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "كريب بطاطس",
    "originalPrice": 0,
    "prepTime": "8 دقائق",
    "price": 85,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "ميكس سوري 👑",
    "category": "ساندوتشات سوري (راب) 🥖",
    "desc": "عيش صاج سوري محمص ومقرمش محشو شاورما فراخ ولحمة مع تومية وخيار مخلل.",
    "id": "prod-wrap-shawarma-mix",
    "image": "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "راب شاورما ميكس",
    "originalPrice": 0,
    "prepTime": "10 دقائق",
    "price": 140,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "شامي أصيل",
    "category": "ساندوتشات سوري (راب) 🥖",
    "desc": "شاورما فراخ بتتبيلة شامية مميزة مع تومية كريمية وبطاطس في عيش صاج محمص على الجريل.",
    "id": "prod-wrap-shawarma-chicken",
    "image": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "راب شاورما فراخ",
    "originalPrice": 0,
    "prepTime": "8-10 دقائق",
    "price": 90,
    "sizes": [
      {
        "id": "s_0",
        "name": "حجم صغير Small (S)",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "حجم كبير Large (L)",
        "price": 50
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "لحم بلدي",
    "category": "ساندوتشات سوري (راب) 🥖",
    "desc": "شاورما لحمة غنية مع طحينة وبصل وسماق في عيش سوري محمص ومقرمش.",
    "id": "prod-wrap-shawarma-meat",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "راب شاورما لحمة",
    "originalPrice": 0,
    "prepTime": "10 دقائق",
    "price": 95,
    "sizes": [
      {
        "id": "s_0",
        "name": "حجم صغير Small (S)",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "حجم كبير Large (L)",
        "price": 50
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "كرسبي ذهبي",
    "category": "ساندوتشات سوري (راب) 🥖",
    "desc": "ستريبس دجاج مقرمش ذهبي مع صوص مايونيز وخس في عيش صاج محمص ومقرمش.",
    "id": "prod-wrap-strips",
    "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "راب ستريبس كرسبي",
    "originalPrice": 0,
    "prepTime": "8 دقائق",
    "price": 90,
    "sizes": [
      {
        "id": "s_0",
        "name": "حجم صغير Small (S)",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "حجم كبير Large (L)",
        "price": 50
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "شيش مشوي",
    "category": "ساندوتشات سوري (راب) 🥖",
    "desc": "مكعبات دجاج مشوية بتتبيلة الأعشاب مع تومية وخضار في عيش صاج مقرمش.",
    "id": "prod-wrap-shish",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "راب شيش طاووق",
    "originalPrice": 0,
    "prepTime": "10 دقائق",
    "price": 90,
    "sizes": [
      {
        "id": "s_0",
        "name": "حجم صغير Small (S)",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "حجم كبير Large (L)",
        "price": 50
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "هوت دوج",
    "category": "ساندوتشات سوري (راب) 🥖",
    "desc": "هوت دوج مدخن مع مخلل وصوصات في عيش سوري مقرمش.",
    "id": "prod-wrap-hotdog",
    "image": "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "راب هوت دوج",
    "originalPrice": 0,
    "prepTime": "8 دقائق",
    "price": 85,
    "sizes": [
      {
        "id": "s_0",
        "name": "حجم صغير Small (S)",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "حجم كبير Large (L)",
        "price": 45
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "سبيشيال",
    "category": "ساندوتشات سوري (راب) 🥖",
    "desc": "خلطة سوبر برجر السريعة والمميزة في عيش صاج شامي محمص.",
    "id": "prod-wrap-special",
    "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "راب سبيشيال",
    "originalPrice": 0,
    "prepTime": "8 دقائق",
    "price": 70,
    "sizes": [
      {
        "id": "s_0",
        "name": "حجم صغير Small (S)",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "حجم كبير Large (L)",
        "price": 30
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "توفير ولذيذ",
    "category": "ساندوتشات سوري (راب) 🥖",
    "desc": "بطاطس مقلية محشوة تومية ومخلل في عيش صاج سوري مقرمش.",
    "id": "prod-wrap-fries",
    "image": "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "راب بطاطس",
    "originalPrice": 0,
    "prepTime": "6 دقائق",
    "price": 60,
    "sizes": [
      {
        "id": "s_0",
        "name": "حجم صغير Small (S)",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "حجم كبير Large (L)",
        "price": 30
      }
    ],
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "بوكس سبايسي 🔥",
    "category": "فرايز بوكس 🍟",
    "desc": "بوكس بطاطس مقرمشة مغطاة بقطع دجاج كرسبي حار مع صوص الشيدر السايح وهالبينو.",
    "id": "prod-box-crispy",
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "isPopular": true,
    "name": "كرسبي فرايز بوكس سبايسي",
    "originalPrice": 0,
    "prepTime": "10 دقائق",
    "price": 110,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "رانش وشيدر 🧀",
    "category": "فرايز بوكس 🍟",
    "desc": "بوكس بطاطس ذهبية مغطاة بقطع دجاج ستريبس وصوص الرانش وصوص الجبنة الشيدر السايح.",
    "id": "prod-box-strips",
    "image": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "ستريبس فرايز بوكس",
    "originalPrice": 0,
    "prepTime": "10 دقائق",
    "price": 110,
    "visible": true
  },
  {
    "addons": [
      {
        "id": "a_0",
        "name": "باكيت بطاطس عادي",
        "price": 15
      },
      {
        "id": "a_1",
        "name": "باكيت بطاطس صوص شيدر",
        "price": 25
      },
      {
        "id": "a_2",
        "name": "بيف بيكون مقرمش",
        "price": 15
      },
      {
        "id": "a_3",
        "name": "روز بيف مدخن",
        "price": 15
      },
      {
        "id": "a_4",
        "name": "تركي مدخن",
        "price": 15
      },
      {
        "id": "a_5",
        "name": "موتزريلا ستيك (1 قطعة)",
        "price": 15
      },
      {
        "id": "a_6",
        "name": "موتزريلا ستيك (2 قطعة)",
        "price": 25
      },
      {
        "id": "a_7",
        "name": "حلقات بصل مقرمشة",
        "price": 10
      },
      {
        "id": "a_8",
        "name": "إضافة صوص شيدر سايح",
        "price": 15
      },
      {
        "id": "a_9",
        "name": "إضافة صوص فاير سبايسي 🌶️",
        "price": 15
      },
      {
        "id": "a_10",
        "name": "قطع هالبينو حار 🌶️",
        "price": 10
      }
    ],
    "badge": "لعشاق البرجر 🍔",
    "category": "فرايز بوكس 🍟",
    "desc": "بوكس بطاطس مقلية محملة بقطع بيف برجر مشوي مع صوص الشيدر وصوص البيج تيستي.",
    "id": "prod-box-burger",
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "برجر فرايز بوكس",
    "originalPrice": 0,
    "prepTime": "10 دقائق",
    "price": 110,
    "visible": true
  },
  {
    "badge": "مقبلات",
    "category": "إضافات ومقبلات 🧀",
    "desc": "بطاطس مقلية مقرمشة ومملحة طازجة.",
    "id": "prod-add-fries-reg-box",
    "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "باكيت بطاطس عادي",
    "originalPrice": 0,
    "prepTime": "5 دقائق",
    "price": 15,
    "visible": true
  },
  {
    "badge": "شيدر غني 🧀",
    "category": "إضافات ومقبلات 🧀",
    "desc": "بطاطس مقلية مقرمشة مغطاة بطبقة غنية من صوص الشيدر السايح.",
    "id": "prod-add-fries-cheddar-box",
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "باكيت بطاطس بصوص الشيدر",
    "originalPrice": 0,
    "prepTime": "5 دقائق",
    "price": 25,
    "visible": true
  },
  {
    "badge": "مطة جبنة",
    "category": "إضافات ومقبلات 🧀",
    "desc": "أصابع جبنة موتزريلا مقلية ذات قشرة ذهبية ومطة لذيذة.",
    "id": "prod-add-mozzarella-sticks",
    "image": "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "موتزريلا ستيك",
    "originalPrice": 0,
    "prepTime": "6 دقائق",
    "price": 15,
    "sizes": [
      {
        "id": "s_0",
        "name": "قطعة واحدة (1 Pc)",
        "price": 0
      },
      {
        "id": "s_1",
        "name": "قطعتين (2 Pcs)",
        "price": 10
      }
    ],
    "visible": true
  },
  {
    "badge": "مقرمشات",
    "category": "إضافات ومقبلات 🧀",
    "desc": "حلقات بصل طازجة مغلفة بخلطة مقرمشة ومقلية بلون ذهبي شهي.",
    "id": "prod-add-onion-rings",
    "image": "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "حلقات بصل",
    "originalPrice": 0,
    "prepTime": "5 دقائق",
    "price": 10,
    "visible": true
  },
  {
    "badge": "شيدر",
    "category": "الصوصات المميزة 🥣",
    "desc": "صوص شيدر ساخن وغني بالنكهة الأمريكية الأصلية.",
    "id": "prod-sauce-cheddar",
    "image": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
    "isFeatured": false,
    "name": "صوص جبنة شيدر",
    "originalPrice": 0,
    "prepTime": "1 دقيقة",
    "price": 15,
    "visible": true
  },
  {
    "badge": "رانش",
    "category": "الصوصات المميزة 🥣",
    "desc": "صوص رانش بالأعشاب والزبادي بنكهة منعشة ولذيذة.",
    "id": "prod-sauce-ranch",
    "image": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
    "name": "صوص رانش فاخر 🥣",
    "prepTime": "1 دقيقة",
    "price": 15
  },
  {
    "badge": "سبايسي 🔥",
    "category": "الصوصات المميزة 🥣",
    "desc": "صوص حار لاذع بنكهة الشطة والباربيكيو الحار لعشاق الإثارة.",
    "id": "prod-sauce-fire",
    "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    "name": "صوص فاير حار وسبايسي 🌶️🔥",
    "prepTime": "1 دقيقة",
    "price": 15
  },
  {
    "badge": "مدخن",
    "category": "الصوصات المميزة 🥣",
    "desc": "صوص باربيكيو بنكهة خشب الحطب ونفحة حلاوة متوازنة.",
    "id": "prod-sauce-bbq",
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80",
    "name": "صوص باربيكيو مدخن 🍯",
    "prepTime": "1 دقيقة",
    "price": 15
  },
  {
    "badge": "بيج تيستي",
    "category": "الصوصات المميزة 🥣",
    "desc": "الصوص الأسطوري الخاص بالسندوتشات الكلاسيكية.",
    "id": "prod-sauce-bigtasty",
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    "name": "صوص البيج تيستي الشهير 🍔",
    "prepTime": "1 دقيقة",
    "price": 15
  },
  {
    "badge": "ألف جزيرة",
    "category": "الصوصات المميزة 🥣",
    "desc": "مزيج المايونيز والكاتشب وقطع المخلل الخفيفة.",
    "id": "prod-sauce-thousand",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "name": "صوص ثاوزند آيلاند (ألف جزيرة) 🥗",
    "prepTime": "1 دقيقة",
    "price": 15
  },
  {
    "badge": "مايونيز",
    "category": "الصوصات المميزة 🥣",
    "desc": "مايونيز ناعم ولذيذ.",
    "id": "prod-sauce-mayo",
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    "name": "مايونيز كريمي 🥚",
    "prepTime": "1 دقيقة",
    "price": 10
  },
  {
    "badge": "كاتشب",
    "category": "الصوصات المميزة 🥣",
    "desc": "كاتشب طماطم مركز بنكهة طبيعية.",
    "id": "prod-sauce-ketchup",
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    "name": "كاتشب طماطم 🍅",
    "prepTime": "1 دقيقة",
    "price": 10
  },
  {
    "badge": "تومية أصلي",
    "category": "السلطات والمشهيات 🥗",
    "desc": "تومية شامي ناعمة وكريمية على أصولها.",
    "id": "prod-salad-toum",
    "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "name": "تومية سورية كلاسيك 🧄",
    "prepTime": "1 دقيقة",
    "price": 15
  },
  {
    "badge": "حار 🌶️",
    "category": "السلطات والمشهيات 🥗",
    "desc": "تومية شامي مضاف إليها شطة حمراء حارة.",
    "id": "prod-salad-toum-spicy",
    "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "name": "تومية سبايسي حارة 🌶️🧄",
    "prepTime": "1 دقيقة",
    "price": 15
  },
  {
    "badge": "كول سلو",
    "category": "السلطات والمشهيات 🥗",
    "desc": "كرنب وجزر مبشور مع دريسنج المايونيز والعسل المنعش.",
    "id": "prod-salad-coleslaw",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "name": "سلطة كول سلو منعشة 🥗",
    "prepTime": "1 دقيقة",
    "price": 20
  },
  {
    "badge": "مثلج ❄️",
    "category": "المشروبات الغازية 🥤",
    "desc": "مشروب غازي بيبسي منعش ومثلج.",
    "id": "prod-drink-pepsi",
    "image": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80",
    "name": "بيبسي كانز بارد 🥤",
    "prepTime": "1 دقيقة",
    "price": 20
  },
  {
    "badge": "كولا",
    "category": "المشروبات الغازية 🥤",
    "desc": "مشروب ماكسي كولا الغازي البارد.",
    "id": "prod-drink-maxi-cola",
    "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80",
    "name": "ماكسي كولا 🥤",
    "prepTime": "1 دقيقة",
    "price": 15
  },
  {
    "badge": "V Cola",
    "category": "المشروبات الغازية 🥤",
    "desc": "مشروب في كولا اللذيذ المثلج.",
    "id": "prod-drink-vcola",
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    "name": "في كولا (V-Cola) 🥤",
    "prepTime": "1 دقيقة",
    "price": 25
  },
  {
    "badge": "طاقة وإنيرجي ⚡",
    "category": "المشروبات الغازية 🥤",
    "desc": "مشروب الطاقة ستينج بنكهة الفراولة المنعشة.",
    "id": "prod-drink-sting",
    "image": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80",
    "name": "ستينج باور إنيرجي ⚡🥤",
    "prepTime": "1 دقيقة",
    "price": 25
  },
  {
    "badge": "فيوري",
    "category": "المشروبات الغازية 🥤",
    "desc": "مشروب فيوري المنعش بنكهات الفواكه المثلجة.",
    "id": "prod-drink-fiory",
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    "name": "فيوري بارد 🍹",
    "prepTime": "1 دقيقة",
    "price": 30
  }
];
const DEFAULT_STORIES = [
  {
    id: "st-1",
    title: "سوبر برجر 👑",
    tagline: "عرض خاص ومميز",
    badge: "الأكثر طلباً",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58c9?w=800&auto=format&fit=crop&q=80",
    desc: "برجر بقري صافي مع الجبنة الذائبة والصوص السري"
  },
  {
    id: "st-2",
    title: "كريب سوبر 🌯",
    tagline: "طازج ومقرمش",
    badge: "جديدنا",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",
    desc: "أشهى أنواع الكريب المحشو بقطع الفراخ المقرمشة والجبن"
  },
  {
    id: "st-3",
    title: "فرايز بوكس 🍟",
    tagline: "مقرمش وساخن",
    badge: "سناكس",
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80",
    desc: "بطاطس ذهبية متبلة بأشهى البهارات"
  },
  {
    id: "st-4",
    title: "راب سوري 🥙",
    tagline: "على أصوله",
    badge: "طعم أصيل",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&auto=format&fit=crop&q=80",
    desc: "شاورما دجاج متبلة بالثومية والخيار المخلل"
  }
];

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
    const settings = this.getSettings();
    const apiKey = (settings.imgbbApiKey || '').trim() || "d7ca1954546a16ca4d732890632b5bdf";

    // 1. Fast background compression to ensure upload payload is small (< 100KB)
    let compressedData = null;
    try {
      compressedData = await this.compressImage(file, 1200, 1200, 0.80);
    } catch (e) {}

    // 2. Direct upload to ImgBB for short public URL
    if (apiKey) {
      const formData = new FormData();
      if (compressedData && compressedData.startsWith('data:')) {
        const base64Content = compressedData.split(',')[1];
        formData.append('image', base64Content);
      } else {
        formData.append('image', file);
      }

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

    return compressedData || await this.compressImage(file, 800, 800, 0.72);
  },

  // ── Multi-Tenant Admin Authentication Engine ─────────────
  async loginAdmin(identifier, password) {
    const slug = this.getRestaurantSlug();
    const cleanId = (identifier || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    if (!cleanPassword) {
      throw new Error("auth/missing-password");
    }

    // 1. Try Firebase Auth (if identifier contains '@' and auth is initialized)
    if (auth && cleanId.includes('@')) {
      try {
        const userCred = await auth.signInWithEmailAndPassword(cleanId, cleanPassword);
        const session = { email: cleanId, uid: userCred.user.uid, authenticated: true, slug, timestamp: Date.now() };
        this.safeSetItem(`harpy_admin_auth_${slug}`, JSON.stringify(session));
        sessionStorage.setItem(`harpy_auth_${slug}`, JSON.stringify(session));
        return userCred;
      } catch (authErr) {
        console.warn("[Store] Firebase Auth attempt:", authErr.code || authErr.message);
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
            const session = { 
              email: expectedEmail || cleanId || `${activeSlug}@harpy.com`, 
              authenticated: true, 
              slug: activeSlug, 
              sessionVersion: meta.sessionVersion || 1,
              timestamp: Date.now() 
            };
            this.safeSetItem(`harpy_admin_auth_${activeSlug}`, JSON.stringify(session));
            sessionStorage.setItem(`harpy_auth_${activeSlug}`, JSON.stringify(session));
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
              const session = { 
                email: rEmail || `${activeSlug}@harpy.com`, 
                authenticated: true, 
                slug: activeSlug, 
                sessionVersion: rMeta.sessionVersion || 1,
                timestamp: Date.now() 
              };
              this.safeSetItem(`harpy_admin_auth_${activeSlug}`, JSON.stringify(session));
              sessionStorage.setItem(`harpy_auth_${activeSlug}`, JSON.stringify(session));
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
  applySnapshotData(data) {
    if (!data || typeof data !== 'object') return false;

    const now = Date.now();
    let hasChanges = false;
    const isDemo = (this.getRestaurantSlug() === 'king');
    const defaults = isDemo ? DEFAULT_SETTINGS : BLANK_SETTINGS;

    if (!this.saveLocks.settings && (now - this.lastSaveTimestamps.settings > 2500)) {
      if (data.settings) {
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
        this._memoryCache.settings = mergedSettings;
        this.safeSetItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(mergedSettings));
        this.applyTheme();
        hasChanges = true;
      } else if (!isDemo) {
        if (!this._memoryCache.settings) {
          this._memoryCache.settings = { ...BLANK_SETTINGS };
          this.safeSetItem(this.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(BLANK_SETTINGS));
          this.applyTheme();
          hasChanges = true;
        }
      }
    }

    if (!this.saveLocks.categories && (now - this.lastSaveTimestamps.categories > 2500)) {
      if (data.categories) {
        let catArray = Array.isArray(data.categories) ? data.categories : Object.values(data.categories);
        if (!isDemo && Array.isArray(catArray) && catArray.length === DEFAULT_CATEGORIES.length && catArray[0] === DEFAULT_CATEGORIES[0]) {
          catArray = [];
        }
        this._memoryCache.categories = catArray;
        this.safeSetItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(catArray));
        hasChanges = true;
      } else if (!isDemo) {
        if (this._memoryCache.categories === null || (this._memoryCache.categories && this._memoryCache.categories.length > 0)) {
          this._memoryCache.categories = [];
          this.safeSetItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify([]));
          hasChanges = true;
        }
      }
    }

    if (!this.saveLocks.products && (now - this.lastSaveTimestamps.products > 2500)) {
      if (data.products) {
        let prodArray = Array.isArray(data.products) ? data.products : Object.values(data.products);
        if (!isDemo && Array.isArray(prodArray) && prodArray.length > 0) {
          const isDemoData = prodArray.some(p => p && (p.id === 'p1' || p.id === 'prod-mix-burger-double' || (p.name && p.name.includes('سوبر سنجل برجر'))));
          if (isDemoData) {
            prodArray = [];
          }
        }
        this._memoryCache.products = prodArray;
        this.safeSetItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(prodArray));
        hasChanges = true;
      } else if (!isDemo) {
        if (this._memoryCache.products === null || (this._memoryCache.products && this._memoryCache.products.length > 0)) {
          this._memoryCache.products = [];
          this.safeSetItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify([]));
          hasChanges = true;
        }
      }
    }

    if (!this.saveLocks.stories && (now - this.lastSaveTimestamps.stories > 2500)) {
      if (data.stories) {
        let storyArray = Array.isArray(data.stories) ? data.stories : Object.values(data.stories);
        if (!isDemo && Array.isArray(storyArray) && storyArray.length === DEFAULT_STORIES.length && storyArray[0]?.id === DEFAULT_STORIES[0]?.id) {
          storyArray = [];
        }
        this._memoryCache.stories = storyArray;
        this.safeSetItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify(storyArray));
        hasChanges = true;
      } else if (!isDemo) {
        if (this._memoryCache.stories === null || (this._memoryCache.stories && this._memoryCache.stories.length > 0)) {
          this._memoryCache.stories = [];
          this.safeSetItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify([]));
          hasChanges = true;
        }
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

      this.applySnapshotData(data);
      window.dispatchEvent(new Event('store_settings_updated'));
      window.dispatchEvent(new Event('store_categories_updated'));
      window.dispatchEvent(new Event('store_products_updated'));
      window.dispatchEvent(new Event('store_stories_updated'));

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

    // 2. High-Frequency REST Heartbeat Pulse (Every 4.0 seconds fallback)
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
    pollTimer = setInterval(fetchOrdersFast, 4000);

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
      fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${cleanId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchPayload),
        keepalive: true
      }).catch(() => {});

      if (targetFbKey && targetFbKey !== cleanId) {
        fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${targetFbKey}.json`, {
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
        fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${slug}/orders/${k}.json`, {
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
        const pathParts = window.location.pathname.split('/').filter(p => p && p !== 'index.html' && p !== 'admin.html' && p !== 'admin' && p !== 'order');
        if (pathParts.length > 0) {
          const firstPart = pathParts[0].toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
          const reservedNames = ['css', 'js', 'assets', 'api', 'admin', 'manifest', 'sw', 'favicon', 'icons'];
          if (firstPart && !reservedNames.includes(firstPart)) {
            urlSlug = firstPart;
          }
        }
      }

      // 3. Subdomain Resolution Fallback (e.g. king.harpymenu.com)
      if (!urlSlug && typeof window !== 'undefined' && window.location && window.location.hostname) {
        const host = window.location.hostname.toLowerCase();
        if (host.includes('harpymenu.com') && !host.startsWith('www.') && host !== 'harpymenu.com') {
          const subdomain = host.split('.')[0].trim().replace(/[^a-z0-9_-]/g, '');
          if (subdomain && subdomain !== 'www' && subdomain !== 'order' && subdomain !== 'api') {
            urlSlug = subdomain;
          }
        }
      }

      if (urlSlug) {
        const clean = urlSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        if (clean) {
          this.safeSetItem('harpy_active_slug', clean);
          this.registerRestaurant(clean);
          return clean;
        }
      }
    } catch {}

    const fallbackSlug = 'king';
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
    const isDemo = (this.getRestaurantSlug() === 'king');
    const defaults = isDemo ? DEFAULT_SETTINGS : BLANK_SETTINGS;
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.SETTINGS));
    if (!raw) {
      this._memoryCache.settings = { ...defaults };
      return { ...defaults };
    }
    try {
      const parsed = { ...defaults, ...JSON.parse(raw) };
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
      this._memoryCache.settings = parsed;
      return parsed;
    } catch {
      this._memoryCache.settings = { ...defaults };
      return { ...defaults };
    }
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

    root.setAttribute('data-theme', mode);

    const themeProps = [
      '--bg', '--bg-subtle', '--surface', '--surface-raised', '--surface-hover',
      '--header-bg', '--text-main', '--text-body', '--text-muted', '--text-faint',
      '--border', '--border-strong', '--primary', '--primary-hover', '--primary-subtle', '--primary-glow', '--border-focus'
    ];
    themeProps.forEach(p => root.style.removeProperty(p));

    const primaryColor = s.siteColors?.primary || (mode === 'light' ? '#c2410c' : '#ea580c');
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-hover', primaryColor);
    root.style.setProperty('--border-focus', primaryColor);
    root.style.setProperty('--primary-glow', `${primaryColor}44`);
    root.style.setProperty('--primary-subtle', `${primaryColor}22`);

    if (s.siteColors) {
      const c = s.siteColors;
      const isDarkPreset = c.id === 'charcoal' || c.id === 'midnight' || c.id === 'sunset' || c.id === 'olive' || c.id === 'indigo';
      const shouldApplyFull = (mode === 'dark' && isDarkPreset) || (mode === 'light' && !isDarkPreset) || !c.id;
      if (shouldApplyFull) {
        if (c.bg) {
          root.style.setProperty('--bg', c.bg);
          root.style.setProperty('--header-bg', c.headerBg || c.bg);
        }
        if (c.surface) {
          root.style.setProperty('--surface', c.surface);
          root.style.setProperty('--surface-raised', c.surfaceRaised || c.surface);
        }
        if (c.textMain) {
          root.style.setProperty('--text-main', c.textMain);
        }
        if (c.textBody) {
          root.style.setProperty('--text-body', c.textBody);
        }
        if (c.border) {
          root.style.setProperty('--border', c.border);
        }
      }
    }
  },

  getCategories() {
    if (this._memoryCache.categories !== null) {
      return this._memoryCache.categories;
    }
    const isDemo = (this.getRestaurantSlug() === 'king');
    const defaultCategories = isDemo ? DEFAULT_CATEGORIES : [];
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CATEGORIES));
    if (!raw) {
      this._memoryCache.categories = defaultCategories;
      return defaultCategories;
    }
    try {
      const parsed = JSON.parse(raw);
      let res = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultCategories);
      if (!isDemo && Array.isArray(res) && res.length === DEFAULT_CATEGORIES.length && res[0] === DEFAULT_CATEGORIES[0]) {
        res = [];
        this.safeSetItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify([]));
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
    if (this._memoryCache.products !== null) {
      return this._memoryCache.products;
    }
    const isDemo = (this.getRestaurantSlug() === 'king');
    const defaultProducts = isDemo ? DEFAULT_PRODUCTS : [];
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.PRODUCTS));
    if (!raw) {
      this._memoryCache.products = defaultProducts;
      return defaultProducts;
    }
    try {
      const parsed = JSON.parse(raw);
      let res = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultProducts);
      if (!isDemo && Array.isArray(res) && res.length > 0) {
        const isDemoData = res.some(p => p && (p.id === 'p1' || p.id === 'prod-mix-burger-double' || (p.name && p.name.includes('سوبر سنجل برجر'))));
        if (isDemoData) {
          res = [];
          this.safeSetItem(this.getKey(STORAGE_KEYS.PRODUCTS), JSON.stringify([]));
        }
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
    if (this._memoryCache.stories !== null) {
      return this._memoryCache.stories;
    }
    const isDemo = (this.getRestaurantSlug() === 'king');
    const defaultStories = isDemo ? DEFAULT_STORIES : [];
    const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.STORIES));
    if (!raw) {
      this._memoryCache.stories = defaultStories;
      return defaultStories;
    }
    try {
      const parsed = JSON.parse(raw);
      let res = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultStories);
      if (!isDemo && Array.isArray(res) && res.length === DEFAULT_STORIES.length && res[0]?.id === DEFAULT_STORIES[0]?.id) {
        res = [];
        this.safeSetItem(this.getKey(STORAGE_KEYS.STORIES), JSON.stringify([]));
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
    this.clearMemoryCache();
    this.initTheme();

    const isDemo = (currentSlug === 'king');
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
