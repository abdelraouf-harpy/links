// ══════════════════════════════════════════════════════════════════
// HarpyOrder — Seed Demo Data for 'king' Restaurant
// Decoupled from store.js for high-speed multi-tenant modularity
// ══════════════════════════════════════════════════════════════════

(function() {
  'use strict';

const DEFAULT_SETTINGS = {
  storeName: "سوبر برجر | Super Burger 🍔🔥",
  storeTagline: "أشهى المأكولات الطازجة",
  whatsappNumber: "01019971508",
  walletNumber: "01019971508",
  walletName: "فودافون كاش / إنستاباي",
  currency: "ج.م",
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
  orderingPausedMessage: "المطعم متوقف حالياً عن استقبال الطلبات. مواعيد العمل يومياً من 12 ظهراً حتى 2 صباحاً. نسعد بخدمتكم قريباً!",
  printerPaperSize: "80mm"
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


  const HARPY_DEMO_SEED = {
    DEFAULT_SETTINGS,
    DEFAULT_CATEGORIES,
    DEFAULT_PRODUCTS,
    DEFAULT_STORIES
  };

  if (typeof window !== 'undefined') {
    window.HARPY_DEMO_SEED = HARPY_DEMO_SEED;
    window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
    window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
    window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
    window.DEFAULT_STORIES = DEFAULT_STORIES;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HARPY_DEMO_SEED;
  }
})();
