// ═══════════════════════════════════════════════════════════
// HarpyOrder — High-Performance i18n Translation Engine (5 Languages)
// Arabic (ar), English (en), French (fr), Russian (ru), Italian (it)
// ═══════════════════════════════════════════════════════════

(function(window) {
  'use strict';

  const SUPPORTED_LANGS = {
    ar: { code: 'ar', name: 'العربية', englishName: 'Arabic', flag: '🇪🇬', dir: 'rtl', fontClass: 'font-ar' },
    en: { code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧', dir: 'ltr', fontClass: 'font-en' },
    fr: { code: 'fr', name: 'Français', englishName: 'French', flag: '🇫🇷', dir: 'ltr', fontClass: 'font-fr' },
    ru: { code: 'ru', name: 'Русский', englishName: 'Russian', flag: '🇷🇺', dir: 'ltr', fontClass: 'font-ru' },
    it: { code: 'it', name: 'Italiano', englishName: 'Italian', flag: '🇮🇹', dir: 'ltr', fontClass: 'font-it' }
  };

  const COMMON_TERMS = {
    "كل الأصناف": {
        "en": "All Items",
        "fr": "Tous les plats",
        "ru": "Все блюда",
        "it": "Tutti i piatti"
    },
    "جميع الأصناف": {
        "en": "All Items",
        "fr": "Tous les plats",
        "ru": "Все блюда",
        "it": "Tutti i piatti"
    },
    "الكل": {
        "en": "All",
        "fr": "Tous",
        "ru": "Все",
        "it": "Tutti"
    },
    "المفضلة": {
        "en": "Favorites",
        "fr": "Favoris",
        "ru": "Избранное",
        "it": "Preferiti"
    },
    "الأكثر طلباً": {
        "en": "Popular",
        "fr": "Populaires",
        "ru": "Популярное",
        "it": "Più venduti"
    },
    "عروض": {
        "en": "Special Offers",
        "fr": "Offres spéciales",
        "ru": "Акции",
        "it": "Offerte"
    },
    "عروض مميزة": {
        "en": "Special Offers",
        "fr": "Offres spéciales",
        "ru": "Спецпредложения",
        "it": "Offerte speciali"
    },
    "برجر وفرايد تشيكن": {
        "en": "Burgers & Fried Chicken",
        "fr": "Burgers & Poulet Frit",
        "ru": "Бургеры и жареная курица",
        "it": "Burger e Pollo Fritto"
    },
    "الكريبات اللذيذة": {
        "en": "Delicious Crepes",
        "fr": "Crêpes Délicieuses",
        "ru": "Вкусные блины (Крепы)",
        "it": "Crepes Deliziose"
    },
    "ساندوتشات سوري (راب)": {
        "en": "Syrian Wraps & Sandwiches",
        "fr": "Wraps & Sandwichs Syriens",
        "ru": "Сирийские шаурма-рапы",
        "it": "Wrap e Panini Siriani"
    },
    "فرايز بوكس": {
        "en": "Fries Boxes",
        "fr": "Box de Frites",
        "ru": "Боксы картофеля фри",
        "it": "Box Patatine"
    },
    "إضافات ومقبلات": {
        "en": "Sides & Extras",
        "fr": "Accompagnements & Extras",
        "ru": "Закуски и добавки",
        "it": "Contorni ed Extra"
    },
    "الصوصات المميزة": {
        "en": "Special Sauces",
        "fr": "Sauces Spéciales",
        "ru": "Фирменные соусы",
        "it": "Salse Speciali"
    },
    "السلطات والمشهيات": {
        "en": "Salads & Appetizers",
        "fr": "Salades & Entrées",
        "ru": "Салаты и закуски",
        "it": "Insalate e Antipasti"
    },
    "المشروبات الغازية": {
        "en": "Soft Drinks & Sodas",
        "fr": "Sodas & Boissons",
        "ru": "Газированные напитки",
        "it": "Bibite Gassate"
    },
    "سندوتشات": {
        "en": "Sandwiches",
        "fr": "Sandwichs",
        "ru": "Сэндвичи",
        "it": "Panini"
    },
    "ساندوتشات": {
        "en": "Sandwiches",
        "fr": "Sandwichs",
        "ru": "Сэндвичи",
        "it": "Panini"
    },
    "ساندوتش": {
        "en": "Sandwich",
        "fr": "Sandwich",
        "ru": "Сэндвич",
        "it": "Panino"
    },
    "برجر": {
        "en": "Burgers",
        "fr": "Burgers",
        "ru": "Бургеры",
        "it": "Burger"
    },
    "سوبر برجر": {
        "en": "Super Burger",
        "fr": "Super Burger",
        "ru": "Супер Бургер",
        "it": "Super Burger"
    },
    "برجر لحم": {
        "en": "Beef Burger",
        "fr": "Burger de bœuf",
        "ru": "Бургер с говядиной",
        "it": "Burger di manzo"
    },
    "برجر دجاج": {
        "en": "Chicken Burger",
        "fr": "Burger de poulet",
        "ru": "Куриный бургер",
        "it": "Burger di pollo"
    },
    "دجاج مقرمش": {
        "en": "Crispy Chicken",
        "fr": "Poulet croustillant",
        "ru": "Хрустящая курица",
        "it": "Pollo croccante"
    },
    "تشيز برجر": {
        "en": "Cheeseburger",
        "fr": "Cheeseburger",
        "ru": "Чизбургер",
        "it": "Cheeseburger"
    },
    "بيتزا": {
        "en": "Pizza",
        "fr": "Pizza",
        "ru": "Пицца",
        "it": "Pizza"
    },
    "كريب": {
        "en": "Crepes",
        "fr": "Crêpes",
        "ru": "Блины",
        "it": "Crepes"
    },
    "شاورما": {
        "en": "Shawarma",
        "fr": "Chawarma",
        "ru": "Шаурма",
        "it": "Shawarma"
    },
    "شاورما لحم": {
        "en": "Beef Shawarma",
        "fr": "Chawarma de bœuf",
        "ru": "Шаурма с говядиной",
        "it": "Shawarma di manzo"
    },
    "شاورما لحمة": {
        "en": "Beef Shawarma",
        "fr": "Chawarma de bœuf",
        "ru": "Шаурма с говядиной",
        "it": "Shawarma di manzo"
    },
    "شاورما دجاج": {
        "en": "Chicken Shawarma",
        "fr": "Chawarma de poulet",
        "ru": "Куриная шаурма",
        "it": "Shawarma di pollo"
    },
    "شاورما فراخ": {
        "en": "Chicken Shawarma",
        "fr": "Chawarma de poulet",
        "ru": "Куриная шаурма",
        "it": "Shawarma di pollo"
    },
    "مشويات": {
        "en": "Grills & BBQ",
        "fr": "Grillades",
        "ru": "Гриль",
        "it": "Grigliata"
    },
    "وجبات": {
        "en": "Meals",
        "fr": "Repas",
        "ru": "Блюда",
        "it": "Pasti"
    },
    "وجبة": {
        "en": "Meal",
        "fr": "Repas",
        "ru": "Блюдо",
        "it": "Pasto"
    },
    "وجبات عائلية": {
        "en": "Family Meals",
        "fr": "Menus familiaux",
        "ru": "Семейные обеды",
        "it": "Pasti famiglia"
    },
    "وجبات سريعة": {
        "en": "Fast Food",
        "fr": "Restauration rapide",
        "ru": "Фастфуд",
        "it": "Fast food"
    },
    "وجبات رئيسية": {
        "en": "Main Dishes",
        "fr": "Plats principaux",
        "ru": "Основные блюда",
        "it": "Piatti principali"
    },
    "مقبلات": {
        "en": "Appetizers & Sides",
        "fr": "Entrées",
        "ru": "Закуски",
        "it": "Antipasti"
    },
    "بطاطس": {
        "en": "French Fries",
        "fr": "Frites",
        "ru": "Картофель фри",
        "it": "Patatine fritte"
    },
    "بطاطس محمرة": {
        "en": "French Fries",
        "fr": "Frites",
        "ru": "Картофель фри",
        "it": "Patatine fritte"
    },
    "مشروبات": {
        "en": "Beverages & Drinks",
        "fr": "Boissons",
        "ru": "Напитки",
        "it": "Bevande"
    },
    "عصائر": {
        "en": "Fresh Juices",
        "fr": "Jus frais",
        "ru": "Свежие соки",
        "it": "Succhi freschi"
    },
    "مياه معدنية": {
        "en": "Mineral Water",
        "fr": "Eau minérale",
        "ru": "Минеральная вода",
        "it": "Acqua minerale"
    },
    "صوصات": {
        "en": "Sauces & Dips",
        "fr": "Sauces",
        "ru": "Соусы",
        "it": "Salse"
    },
    "إضافات": {
        "en": "Extras & Add-ons",
        "fr": "Suppléments",
        "ru": "Добавки",
        "it": "Ingredienti extra"
    },
    "حلويات": {
        "en": "Desserts",
        "fr": "Desserts",
        "ru": "Десерты",
        "it": "Dolci"
    },
    "سلطات": {
        "en": "Salads",
        "fr": "Salades",
        "ru": "Салаты",
        "it": "Insalate"
    },
    "باستا": {
        "en": "Pasta",
        "fr": "Pâtes",
        "ru": "Паста",
        "it": "Pasta"
    },
    "مكرونة": {
        "en": "Pasta",
        "fr": "Pâtes",
        "ru": "Паста",
        "it": "Pasta"
    },
    "سوبر برجر الثلاثي": {
        "en": "Super Burger Triple",
        "fr": "Super Burger Triple",
        "ru": "Супер Бургер Тройной",
        "it": "Super Burger Triplo"
    },
    "مكس برجر دبل": {
        "en": "Mix Burger Double",
        "fr": "Mix Burger Double",
        "ru": "Микс Бургер Двойной",
        "it": "Mix Burger Doppio"
    },
    "فرايد تشيكن": {
        "en": "Fried Chicken",
        "fr": "Poulet Frit",
        "ru": "Жареная курочка",
        "it": "Pollo Fritto"
    },
    "بيف برجر": {
        "en": "Beef Burger",
        "fr": "Burger de Bœuf",
        "ru": "Бургер с говядиной",
        "it": "Burger di Manzo"
    },
    "تشيكن برجر": {
        "en": "Chicken Burger",
        "fr": "Burger de Poulet",
        "ru": "Куриный бургер",
        "it": "Burger di Pollo"
    },
    "كريب سوبر برجر الخاص": {
        "en": "Super Burger Special Crepe",
        "fr": "Crêpe Spéciale Super Burger",
        "ru": "Фирменный креп Супер Бургер",
        "it": "Crepe Speciale Super Burger"
    },
    "كريب مكس تشيكن": {
        "en": "Mix Chicken Crepe",
        "fr": "Crêpe Mix Poulet",
        "ru": "Креп Микс Курица",
        "it": "Crepe Mix Pollo"
    },
    "كريب مكس بيف": {
        "en": "Mix Beef Crepe",
        "fr": "Crêpe Mix Bœuf",
        "ru": "Креп Микс Говядина",
        "it": "Crepe Mix Manzo"
    },
    "كريب كرسبي سبايسي": {
        "en": "Spicy Crispy Crepe",
        "fr": "Crêpe Crispy Épicée",
        "ru": "Острый хрустящий креп",
        "it": "Crepe Crispy Piccante"
    },
    "كريب ستريبس دجاج": {
        "en": "Chicken Strips Crepe",
        "fr": "Crêpe Strips de Poulet",
        "ru": "Креп с куриными стрипсами",
        "it": "Crepe Strips di Pollo"
    },
    "كريب شيش طاووق": {
        "en": "Shish Tawook Crepe",
        "fr": "Crêpe Chich Taouk",
        "ru": "Креп Шиш Таук",
        "it": "Crepe Shish Taouk"
    },
    "كريب كفتة فحم": {
        "en": "Grilled Kofta Crepe",
        "fr": "Crêpe Kefta Grillée",
        "ru": "Креп с кюфтой на углях",
        "it": "Crepe Kofta alla Griglia"
    },
    "كريب شاورما فراخ": {
        "en": "Chicken Shawarma Crepe",
        "fr": "Crêpe Chawarma Poulet",
        "ru": "Креп с куриной шаурмой",
        "it": "Crepe Shawarma Pollo"
    },
    "كريب شاورما لحمة": {
        "en": "Beef Shawarma Crepe",
        "fr": "Crêpe Chawarma Bœuf",
        "ru": "Креп с шаурмой из говядины",
        "it": "Crepe Shawarma Manzo"
    },
    "كريب هوت دوج": {
        "en": "Hot Dog Crepe",
        "fr": "Crêpe Hot-Dog",
        "ru": "Креп с хот-догом",
        "it": "Crepe Hot Dog"
    },
    "كريب بطاطس": {
        "en": "Fries Crepe",
        "fr": "Crêpe Frites",
        "ru": "Креп с картофелем фри",
        "it": "Crepe con Patatine"
    },
    "راب شاورما ميكس": {
        "en": "Mix Shawarma Wrap",
        "fr": "Wrap Chawarma Mix",
        "ru": "Микс шаурма-рап",
        "it": "Wrap Shawarma Misto"
    },
    "راب شاورما فراخ": {
        "en": "Chicken Shawarma Wrap",
        "fr": "Wrap Chawarma Poulet",
        "ru": "Куриный шаурма-рап",
        "it": "Wrap Shawarma Pollo"
    },
    "راب شاورما لحمة": {
        "en": "Beef Shawarma Wrap",
        "fr": "Wrap Chawarma Bœuf",
        "ru": "Шаурма-рап с говядиной",
        "it": "Wrap Shawarma Manzo"
    },
    "راب ستريبس كرسبي": {
        "en": "Crispy Strips Wrap",
        "fr": "Wrap Strips Croustillant",
        "ru": "Хрустящий стрипс-рап",
        "it": "Wrap Strips Croccante"
    },
    "راب شيش طاووق": {
        "en": "Shish Tawook Wrap",
        "fr": "Wrap Chich Taouk",
        "ru": "Рап Шиш Таук",
        "it": "Wrap Shish Taouk"
    },
    "راب هوت دوج": {
        "en": "Hot Dog Wrap",
        "fr": "Wrap Hot-Dog",
        "ru": "Рап с хот-догом",
        "it": "Wrap Hot Dog"
    },
    "راب سبيشيال": {
        "en": "Special Wrap",
        "fr": "Wrap Spécial",
        "ru": "Фирменный рап",
        "it": "Wrap Speciale"
    },
    "راب بطاطس": {
        "en": "Fries Wrap",
        "fr": "Wrap Frites",
        "ru": "Рап с картофелем фри",
        "it": "Wrap Patatine"
    },
    "كرسبي فرايز بوكس سبايسي": {
        "en": "Spicy Crispy Fries Box",
        "fr": "Box Frites Crispy Épicée",
        "ru": "Острый бокс картофеля фри",
        "it": "Box Patatine Crispy Piccanti"
    },
    "ستريبس فرايز بوكس": {
        "en": "Strips Fries Box",
        "fr": "Box Frites & Strips",
        "ru": "Бокс фри со стрипсами",
        "it": "Box Patatine e Strips"
    },
    "برجر فرايز بوكس": {
        "en": "Burger Fries Box",
        "fr": "Box Frites & Burger",
        "ru": "Бокс фри с бургером",
        "it": "Box Patatine e Burger"
    },
    "باكيت بطاطس عادي": {
        "en": "Regular Fries",
        "fr": "Portion de Frites",
        "ru": "Порция картофеля фри",
        "it": "Porzione Patatine Fritte"
    },
    "باكيت بطاطس صوص شيدر": {
        "en": "Cheddar Cheese Fries",
        "fr": "Frites Sauce Cheddar",
        "ru": "Картофель фри с чеддером",
        "it": "Patatine con Salsa Cheddar"
    },
    "باكيت بطاطس بصوص الشيدر": {
        "en": "Fries with Cheddar Sauce",
        "fr": "Frites avec Sauce Cheddar",
        "ru": "Картофель фри с сыром чеддер",
        "it": "Patatine con Salsa Cheddar"
    },
    "موتزريلا ستيك": {
        "en": "Mozzarella Sticks",
        "fr": "Sticks Mozzarella",
        "ru": "Сырные палочки моцарелла",
        "it": "Bastoncini di Mozzarella"
    },
    "موتزريلا ستيك (1 قطعة)": {
        "en": "Mozzarella Stick (1 Pc)",
        "fr": "Stick Mozzarella (1 Pc)",
        "ru": "Сырная палочка моцарелла (1 шт)",
        "it": "Bastoncino di Mozzarella (1 pz)"
    },
    "موتزريلا ستيك (2 قطعة)": {
        "en": "Mozzarella Sticks (2 Pcs)",
        "fr": "Sticks Mozzarella (2 Pcs)",
        "ru": "Сырные палочки моцарелла (2 шт)",
        "it": "Bastoncini di Mozzarella (2 pz)"
    },
    "حلقات بصل مقرمشة": {
        "en": "Crispy Onion Rings",
        "fr": "Rondelles d'Oignons Croustillantes",
        "ru": "Хрустящие луковые кольца",
        "it": "Anelli di Cipolla Croccanti"
    },
    "حلقات بصل": {
        "en": "Onion Rings",
        "fr": "Rondelles d'Oignons",
        "ru": "Луковые кольца",
        "it": "Anelli di Cipolla"
    },
    "صوص جبنة شيدر": {
        "en": "Cheddar Cheese Sauce",
        "fr": "Sauce Fromage Cheddar",
        "ru": "Сырный соус чеддер",
        "it": "Salsa Formaggio Cheddar"
    },
    "صوص رانش فاخر": {
        "en": "Premium Ranch Sauce",
        "fr": "Sauce Ranch Supérieure",
        "ru": "Премиум соус ранч",
        "it": "Salsa Ranch Gourmet"
    },
    "صوص فاير حار وسبايسي": {
        "en": "Fire Spicy Sauce",
        "fr": "Sauce Fire Épicée",
        "ru": "Огненный острый соус",
        "it": "Salsa Fire Piccante"
    },
    "صوص باربيكيو مدخن": {
        "en": "Smoked BBQ Sauce",
        "fr": "Sauce Barbecue Fumée",
        "ru": "Копченый соус барбекю",
        "it": "Salsa Barbecue Affumicata"
    },
    "صوص البيج تيستي الشهير": {
        "en": "Famous Big Tasty Sauce",
        "fr": "Sauce Big Tasty",
        "ru": "Знаменитый соус Биг Тейсти",
        "it": "Famosa Salsa Big Tasty"
    },
    "صوص ثاوزند آيلاند (ألف جزيرة)": {
        "en": "Thousand Island Sauce",
        "fr": "Sauce Mille-Îles",
        "ru": "Соус Тысяча островов",
        "it": "Salsa Thousand Island"
    },
    "مايونيز كريمي": {
        "en": "Creamy Mayonnaise",
        "fr": "Mayonnaise Crémeuse",
        "ru": "Кремовый майонез",
        "it": "Maionese Cremosa"
    },
    "كاتشب طماطم": {
        "en": "Tomato Ketchup",
        "fr": "Ketchup de Tomates",
        "ru": "Томатный кетчуп",
        "it": "Ketchup di Pomodoro"
    },
    "تومية سورية كلاسيك": {
        "en": "Classic Syrian Garlic Dip",
        "fr": "Sauce Toum Syrienne Classique",
        "ru": "Классический чесночный соус",
        "it": "Salsa all'Aglio Siriana"
    },
    "تومية سبايسي حارة": {
        "en": "Spicy Garlic Dip",
        "fr": "Sauce à l'Ail Épicée",
        "ru": "Острый чесночный соус",
        "it": "Salsa all'Aglio Piccante"
    },
    "سلطة كول سلو منعشة": {
        "en": "Fresh Coleslaw Salad",
        "fr": "Salade Coleslaw Fraîche",
        "ru": "Освежающий салат коулсло",
        "it": "Insalata Coleslaw Fresca"
    },
    "بيبسي كانز بارد": {
        "en": "Cold Pepsi Can",
        "fr": "Canette Pepsi Fraîche",
        "ru": "Холодная банка Пепси",
        "it": "Pepsi in Lattina Fredda"
    },
    "ماكسي كولا": {
        "en": "Maxi Cola",
        "fr": "Maxi Cola",
        "ru": "Макси Кола",
        "it": "Maxi Cola"
    },
    "في كولا (V-Cola)": {
        "en": "V-Cola",
        "fr": "V-Cola",
        "ru": "В-Кола",
        "it": "V-Cola"
    },
    "ستينج باور إنيرجي": {
        "en": "Sting Energy Drink",
        "fr": "Boisson Énergisante Sting",
        "ru": "Энергетик Стинг",
        "it": "Energy Drink Sting"
    },
    "فيوري بارد": {
        "en": "Cold Fury Drink",
        "fr": "Boisson Fury Glacée",
        "ru": "Холодный напиток Фьюри",
        "it": "Bevanda Fury Fredda"
    },
    "سنجل Single (قطعة واحدة)": {
        "en": "Single (1 Piece)",
        "fr": "Simple (1 Pièce)",
        "ru": "Одинарный (1 шт)",
        "it": "Singolo (1 Pezzo)"
    },
    "دبل Double (قطعتين)": {
        "en": "Double (2 Pieces)",
        "fr": "Double (2 Pièces)",
        "ru": "Двойной (2 шт)",
        "it": "Doppio (2 Pezzi)"
    },
    "تريبل Triple (3 قطع)": {
        "en": "Triple (3 Pieces)",
        "fr": "Triple (3 Pièces)",
        "ru": "Тройной (3 шт)",
        "it": "Triplo (3 Pezzi)"
    },
    "سنجل Single": {
        "en": "Single",
        "fr": "Simple",
        "ru": "Одинарный",
        "it": "Singolo"
    },
    "دبل Double": {
        "en": "Double",
        "fr": "Double",
        "ru": "Двойной",
        "it": "Doppio"
    },
    "تريبل Triple": {
        "en": "Triple",
        "fr": "Triple",
        "ru": "Тройной",
        "it": "Triplo"
    },
    "حجم صغير Small (S)": {
        "en": "Small Size (S)",
        "fr": "Petite Taille (S)",
        "ru": "Маленький (S)",
        "it": "Misura Piccola (S)"
    },
    "حجم كبير Large (L)": {
        "en": "Large Size (L)",
        "fr": "Grande Taille (L)",
        "ru": "Большой (L)",
        "it": "Misura Grande (L)"
    },
    "قطعة واحدة (1 Pc)": {
        "en": "1 Piece",
        "fr": "1 Pièce",
        "ru": "1 шт",
        "it": "1 Pezzo"
    },
    "قطعتين (2 Pcs)": {
        "en": "2 Pieces",
        "fr": "2 Pièces",
        "ru": "2 шт",
        "it": "2 Pezzi"
    },
    "إضافة صوص شيدر سايح": {
        "en": "Extra Melted Cheddar",
        "fr": "Supplément Cheddar Fondu",
        "ru": "Доп. сыр чеддер",
        "it": "Extra Cheddar Fuso"
    },
    "إضافة صوص فاير سبايسي": {
        "en": "Extra Fire Spicy Sauce",
        "fr": "Supplément Sauce Fire",
        "ru": "Доп. острый соус",
        "it": "Extra Salsa Fire"
    },
    "قطع هالبينو حار": {
        "en": "Spicy Jalapeño Slices",
        "fr": "Piments Jalapeños",
        "ru": "Острый халапеньо",
        "it": "Fette di Jalapeño"
    },
    "بيف بيكون مقرمش": {
        "en": "Crispy Beef Bacon",
        "fr": "Bacon de Bœuf Croustillant",
        "ru": "Хрустящий бекон",
        "it": "Bacon Croccante"
    },
    "روز بيف مدخن": {
        "en": "Smoked Roast Beef",
        "fr": "Rôti de Bœuf Fumé",
        "ru": "Копченый ростбиф",
        "it": "Roast Beef Affumicato"
    },
    "تركي مدخن": {
        "en": "Smoked Turkey",
        "fr": "Dinde Fumée",
        "ru": "Копченая индейка",
        "it": "Tacchino Affumicato"
    }
};

  const DICTIONARY = {
    "currency": {
        "ar": "ج.م",
        "en": "EGP",
        "fr": "EGP",
        "ru": "EGP",
        "it": "EGP"
    },
    "mins": {
        "ar": "دقيقة",
        "en": "mins",
        "fr": "mins",
        "ru": "мин",
        "it": "min"
    },
    "status_open": {
        "ar": "مفتوح للطلبات",
        "en": "Open for Orders",
        "fr": "Ouvert aux commandes",
        "ru": "Открыто для заказов",
        "it": "Aperto per ordini"
    },
    "status_closed": {
        "ar": "مغلق حالياً",
        "en": "Currently Closed",
        "fr": "Actuellement fermé",
        "ru": "Сейчас закрыто",
        "it": "Attualmente chiuso"
    },
    "branch_current": {
        "ar": "الفرع:",
        "en": "Branch:",
        "fr": "Succursale :",
        "ru": "Филиал:",
        "it": "Filiale:"
    },
    "search_placeholder": {
        "ar": "ابحث عن وجبتك المفضلة...",
        "en": "Search for your favorite food...",
        "fr": "Recherchez votre plat préféré...",
        "ru": "Поиск любимого блюда...",
        "it": "Cerca il tuo piatto preferito..."
    },
    "nav_home": {
        "ar": "الرئيسية",
        "en": "Home",
        "fr": "Accueil",
        "ru": "Главная",
        "it": "Home"
    },
    "nav_menu": {
        "ar": "المنيو",
        "en": "Menu",
        "fr": "Menu",
        "ru": "Меню",
        "it": "Menu"
    },
    "nav_search": {
        "ar": "البحث",
        "en": "Search",
        "fr": "Recherche",
        "ru": "Поиск",
        "it": "Cerca"
    },
    "nav_cart": {
        "ar": "السلة",
        "en": "Cart",
        "fr": "Panier",
        "ru": "Корзина",
        "it": "Carrello"
    },
    "nav_orders": {
        "ar": "طلباتي",
        "en": "Orders",
        "fr": "Commandes",
        "ru": "Заказы",
        "it": "Ordini"
    },
    "nav_account": {
        "ar": "حسابي",
        "en": "Account",
        "fr": "Compte",
        "ru": "Профиль",
        "it": "Profilo"
    },
    "chip_all": {
        "ar": "كل الأصناف",
        "en": "All Items",
        "fr": "Tous les plats",
        "ru": "Все блюда",
        "it": "Tutti i piatti"
    },
    "cat_all": {
        "ar": "كل الأصناف",
        "en": "All Items",
        "fr": "Tous les plats",
        "ru": "Все блюда",
        "it": "Tutti i piatti"
    },
    "chip_popular": {
        "ar": "الأكثر طلباً",
        "en": "Popular",
        "fr": "Populaire",
        "ru": "Популярное",
        "it": "Più venduti"
    },
    "chip_offers": {
        "ar": "العروض",
        "en": "Offers",
        "fr": "Offres",
        "ru": "Акции",
        "it": "Offerte"
    },
    "chip_favorites": {
        "ar": "المفضلة",
        "en": "Favorites",
        "fr": "Favoris",
        "ru": "Избранное",
        "it": "Preferiti"
    },
    "cat_fav": {
        "ar": "المفضلة",
        "en": "Favorites",
        "fr": "Favoris",
        "ru": "Избранное",
        "it": "Preferiti"
    },
    "btn_add": {
        "ar": "إضافة",
        "en": "Add",
        "fr": "Ajouter",
        "ru": "Добавить",
        "it": "Aggiungi"
    },
    "btn_customize": {
        "ar": "تخصيص +",
        "en": "Customize +",
        "fr": "Personnaliser +",
        "ru": "Настроить +",
        "it": "Personalizza +"
    },
    "sold_out": {
        "ar": "نفد مؤقتاً",
        "en": "Sold Out",
        "fr": "Épuisé",
        "ru": "Распродано",
        "it": "Esaurito"
    },
    "price_starts_from": {
        "ar": "يبدأ من",
        "en": "Starts from",
        "fr": "À partir de",
        "ru": "От",
        "it": "A partire da"
    },
    "view_mode_dual": {
        "ar": "عرض مزدوج",
        "en": "Dual Grid",
        "fr": "Grille double",
        "ru": "Двойная сетка",
        "it": "Griglia doppia"
    },
    "view_mode_large": {
        "ar": "عرض كبير",
        "en": "Large Cards",
        "fr": "Grandes cartes",
        "ru": "Крупные карточки",
        "it": "Schede grandi"
    },
    "view_mode_list": {
        "ar": "عرض قائمة",
        "en": "List View",
        "fr": "Vue en liste",
        "ru": "Список",
        "it": "Vista elenco"
    },
    "customizer_title": {
        "ar": "تخصيص الوجبة",
        "en": "Customize Meal",
        "fr": "Personnaliser le plat",
        "ru": "Настройка блюда",
        "it": "Personalizza piatto"
    },
    "customizer_size": {
        "ar": "اختر الحجم:",
        "en": "Choose Size:",
        "fr": "Choisir la taille :",
        "ru": "Выберите размер:",
        "it": "Scegli dimensione:"
    },
    "customizer_addons": {
        "ar": "إضافات ومكونات إضافية:",
        "en": "Add-ons & Extras:",
        "fr": "Suppléments & Extras :",
        "ru": "Добавки и экстра:",
        "it": "Extra e ingredienti:"
    },
    "customizer_notes": {
        "ar": "ملاحظات خاصة للمطبخ:",
        "en": "Special Kitchen Notes:",
        "fr": "Instructions pour la cuisine :",
        "ru": "Особые пожелания кухне:",
        "it": "Note speciali per la cucina:"
    },
    "customizer_notes_placeholder": {
        "ar": "مثال: بدون بصل، صوص خارجي، تسوية زيادة...",
        "en": "e.g. No onion, sauce on the side, well done...",
        "fr": "ex. Sans oignon, sauce à part, bien cuit...",
        "ru": "напр. Без лука, соус отдельно, хорошо прожарить...",
        "it": "es. Senza cipolla, salsa a parte, ben cotto..."
    },
    "customizer_add_btn": {
        "ar": "إضافة إلى السلة",
        "en": "Add to Cart",
        "fr": "Ajouter au panier",
        "ru": "Добавить в корзину",
        "it": "Aggiungi al carrello"
    },
    "pill_view_cart": {
        "ar": "عرض السلة وإتمام الطلب",
        "en": "View Cart & Checkout",
        "fr": "Voir le panier & Commander",
        "ru": "Корзина и оформление",
        "it": "Vedi carrello e ordina"
    },
    "pill_items": {
        "ar": "أصناف",
        "en": "items",
        "fr": "articles",
        "ru": "товаров",
        "it": "articoli"
    },
    "cart_title": {
        "ar": "محتويات السلة",
        "en": "Your Order Cart",
        "fr": "Votre Panier",
        "ru": "Ваша корзина",
        "it": "Il tuo carrello"
    },
    "cart_empty": {
        "ar": "سلتك فارغة حالياً",
        "en": "Your cart is empty",
        "fr": "Votre panier est vide",
        "ru": "Ваша корзина пуста",
        "it": "Il tuo carrello è vuoto"
    },
    "cart_empty_sub": {
        "ar": "تصفح القائمة وأضف وجباتك المفضلة وسنجهزها لك بكل حب وسرعة!",
        "en": "Explore our delicious menu and add your favorite dishes!",
        "fr": "Parcourez notre menu et ajoutez vos plats préférés !",
        "ru": "Выберите вкусные блюда из меню и оформите заказ!",
        "it": "Sfoglia il menu e aggiungi i tuoi piatti preferiti!"
    },
    "btn_browse_menu": {
        "ar": "تصفح المنيو الآن",
        "en": "Browse Menu Now",
        "fr": "Explorer le menu",
        "ru": "Перейти в меню",
        "it": "Sfoglia il menu ora"
    },
    "fulfillment_title": {
        "ar": "طريقة استلام الطلب:",
        "en": "Fulfillment Method:",
        "fr": "Mode de retrait :",
        "ru": "Способ получения:",
        "it": "Metodo di ritiro:"
    },
    "fulfillment_delivery": {
        "ar": "توصيل دليفري",
        "en": "Home Delivery",
        "fr": "Livraison à domicile",
        "ru": "Доставка курьером",
        "it": "Consegna a domicilio"
    },
    "fulfillment_takeaway": {
        "ar": "استلام من الفرع",
        "en": "Pick-up in Store",
        "fr": "À emporter",
        "ru": "Самовывоз из филиала",
        "it": "Ritiro in negozio"
    },
    "fulfillment_dinein": {
        "ar": "في الصالة",
        "en": "Dine-In",
        "fr": "Sur place",
        "ru": "В зале ресторана",
        "it": "Al tavolo"
    },
    "ful_takeaway_desc": {
        "ar": "استلام من كاونتر المطعم (بدون دليفري)",
        "en": "Pick up directly from restaurant counter (No delivery fee)",
        "fr": "Retrait au comptoir du restaurant",
        "ru": "Самовывоз у стойки ресторана",
        "it": "Ritiro al bancone del ristorante"
    },
    "cust_info_heading": {
        "ar": "بيانات التواصل والتوصيل:",
        "en": "Contact & Delivery Info:",
        "fr": "Coordonnées & Livraison :",
        "ru": "Контактные данные и адрес:",
        "it": "Dati di contatto e consegna:"
    },
    "field_name": {
        "ar": "الاسم بالكامل",
        "en": "Full Name",
        "fr": "Nom complet",
        "ru": "Ваше имя",
        "it": "Nome e Cognome"
    },
    "field_name_placeholder": {
        "ar": "اكتب اسمك الكريم",
        "en": "Enter your full name",
        "fr": "Entrez votre nom",
        "ru": "Введите ваше имя",
        "it": "Inserisci il tuo nome"
    },
    "field_phone": {
        "ar": "رقم الموبايل للتواصل",
        "en": "Phone / WhatsApp",
        "fr": "Numéro de téléphone",
        "ru": "Номер телефона",
        "it": "Numero di telefono"
    },
    "field_phone_placeholder": {
        "ar": "01012345678",
        "en": "e.g. 01012345678",
        "fr": "ex. 01012345678",
        "ru": "напр. 01012345678",
        "it": "es. 01012345678"
    },
    "field_address": {
        "ar": "عنوان التوصيل المعتاد",
        "en": "Delivery Address",
        "fr": "Adresse de livraison",
        "ru": "Адрес доставки",
        "it": "Indirizzo di consegna"
    },
    "field_address_placeholder": {
        "ar": "المنطقة، الشارع، رقم العمارة والشقة",
        "en": "Area, street, building and apartment number",
        "fr": "Quartier, rue, bâtiment et numéro d'appartement",
        "ru": "Район, улица, дом и квартира",
        "it": "Zona, via, numero civico e interno"
    },
    "field_table": {
        "ar": "رقم الطاولة في الصالة",
        "en": "Table Number",
        "fr": "Numéro de table",
        "ru": "Номер столика",
        "it": "Numero del tavolo"
    },
    "field_table_placeholder": {
        "ar": "اكتب رقم الطاولة المسجل عليها",
        "en": "Enter your table number",
        "fr": "Entrez votre numéro de table",
        "ru": "Введите номер столика",
        "it": "Inserisci il numero del tavolo"
    },
    "field_notes": {
        "ar": "ملاحظات إضافية على الطلب",
        "en": "Order Notes (Optional)",
        "fr": "Remarques sur la commande",
        "ru": "Пожелания к заказу",
        "it": "Note sull'ordine"
    },
    "field_notes_placeholder": {
        "ar": "أي تفاصيل خاصة ترغب بإبلاغ المطعم بها...",
        "en": "Any special instructions for the restaurant...",
        "fr": "Instructions spéciales pour le restaurant...",
        "ru": "Любые особые пожелания ресторану...",
        "it": "Eventuali istruzioni speciali per il ristorante..."
    },
    "lbl_notes": {
        "ar": "ملاحظة",
        "en": "Note",
        "fr": "Note",
        "ru": "Примечание",
        "it": "Nota"
    },
    "payment_heading": {
        "ar": "اختر طريقة الدفع:",
        "en": "Select Payment Method:",
        "fr": "Mode de paiement :",
        "ru": "Способ оплаты:",
        "it": "Metodo di pagamento:"
    },
    "pay_cod_headline": {
        "ar": "الدفع عند الاستلام (كاش)",
        "en": "Cash on Delivery (COD)",
        "fr": "Paiement à la livraison (Espèces)",
        "ru": "Оплата при получении (Наличные)",
        "it": "Pagamento alla consegna (Contanti)"
    },
    "pay_cod_sub": {
        "ar": "نقداً فور استلام الطلب",
        "en": "Cash upon delivery/receipt",
        "fr": "En espèces à réception",
        "ru": "Наличными курьеру",
        "it": "In contanti al ricevimento"
    },
    "pay_wallet_headline": {
        "ar": "فودافون كاش / إنستاباي",
        "en": "E-Wallet / InstaPay",
        "fr": "Portefeuille électronique / InstaPay",
        "ru": "Эл. кошелек / InstaPay",
        "it": "Portafoglio elettronico / InstaPay"
    },
    "pay_wallet_sub": {
        "ar": "تحويل إلكتروني سريع مع خصم مباشر",
        "en": "Fast online transfer with instant discount",
        "fr": "Virement rapide avec remise directe",
        "ru": "Быстрый перевод со скидкой",
        "it": "Bonifico rapido con sconto"
    },
    "summary_subtotal": {
        "ar": "المجموع الفرعي:",
        "en": "Subtotal:",
        "fr": "Sous-total :",
        "ru": "Сумма заказа:",
        "it": "Subtotale:"
    },
    "summary_discount": {
        "ar": "الخصم الإجمالي:",
        "en": "Total Discount:",
        "fr": "Remise totale :",
        "ru": "Скидка:",
        "it": "Sconto totale:"
    },
    "summary_delivery": {
        "ar": "رسوم التوصيل:",
        "en": "Delivery Fee:",
        "fr": "Frais de livraison :",
        "ru": "Стоимость доставки:",
        "it": "Spese di consegna:"
    },
    "summary_final_total": {
        "ar": "المبلغ النهائي المطلوب:",
        "en": "Final Amount Due:",
        "fr": "Montant final à payer :",
        "ru": "Итого к оплате:",
        "it": "Importo finale dovuto:"
    },
    "val_free": {
        "ar": "مجاني",
        "en": "Free",
        "fr": "Gratuit",
        "ru": "Бесплатно",
        "it": "Gratuito"
    },
    "btn_proceed_step2": {
        "ar": "متابعة بيانات التوصيل والدفع ←",
        "en": "Proceed to Details & Payment →",
        "fr": "Passer aux coordonnées & paiement →",
        "ru": "Перейти к оформлению заказа →",
        "it": "Procedi ai dettagli e pagamento →"
    },
    "btn_confirm_order": {
        "ar": "تأكيد وإرسال الطلب للمطعم ✓",
        "en": "Confirm & Send Order ✓",
        "fr": "Confirmer et envoyer la commande ✓",
        "ru": "Подтвердить и отправить заказ ✓",
        "it": "Conferma e invia l'ordine ✓"
    },
    "btn_reorder": {
        "ar": "إعادة الطلب",
        "en": "Reorder",
        "fr": "Commander à nouveau",
        "ru": "Повторить заказ",
        "it": "Riordina"
    },
    "orders_title": {
        "ar": "طلباتي والتتبع",
        "en": "My Orders & Tracking",
        "fr": "Mes Commandes",
        "ru": "Мои заказы",
        "it": "I miei ordini"
    },
    "orders_empty_title": {
        "ar": "لا توجد طلبات سابقة",
        "en": "No previous orders",
        "fr": "Aucune commande",
        "ru": "Нет предыдущих заказов",
        "it": "Nessun ordine precedente"
    },
    "orders_empty_sub": {
        "ar": "كل طلب تقوم بإتمامه سيظهر هنا تلقائياً مع تتبع مباشر لحالته خطوة بخطوة.",
        "en": "Orders you place will appear here with real-time tracking.",
        "fr": "Vos commandes apparaîtront ici avec un suivi en temps réel.",
        "ru": "Ваши заказы появятся здесь с отслеживанием в реальном времени.",
        "it": "I tuoi ordini appariranno qui con il monitoraggio in tempo reale."
    },
    "order_status_pending": {
        "ar": "قيد المراجعة",
        "en": "Pending",
        "fr": "En attente",
        "ru": "В ожидании",
        "it": "In attesa"
    },
    "order_status_preparing": {
        "ar": "جاري التجهيز",
        "en": "Preparing",
        "fr": "En préparation",
        "ru": "Готовится",
        "it": "In preparazione"
    },
    "order_status_out": {
        "ar": "في الطريق",
        "en": "On the way",
        "fr": "En route",
        "ru": "В пути",
        "it": "In consegna"
    },
    "order_status_ready": {
        "ar": "جاهز للاستلام",
        "en": "Ready for pickup",
        "fr": "Prêt à retirer",
        "ru": "Готов к выдаче",
        "it": "Pronto al ritiro"
    },
    "order_status_delivered": {
        "ar": "تم التسليم",
        "en": "Delivered",
        "fr": "Livré",
        "ru": "Доставлен",
        "it": "Consegnato"
    },
    "order_status_cancelled": {
        "ar": "ملغي",
        "en": "Cancelled",
        "fr": "Annulé",
        "ru": "Отменен",
        "it": "Annullato"
    },
    "order_stepper_step1": {
        "ar": "استلام الطلب",
        "en": "Order Received",
        "fr": "Commande reçue",
        "ru": "Заказ принят",
        "it": "Ordine ricevuto"
    },
    "order_stepper_step2": {
        "ar": "في المطبخ",
        "en": "In the Kitchen",
        "fr": "En cuisine",
        "ru": "На кухне",
        "it": "In cucina"
    },
    "order_stepper_step3": {
        "ar": "مع الكابتن",
        "en": "With Courier",
        "fr": "Avec le livreur",
        "ru": "У курьера",
        "it": "Con il corriere"
    },
    "order_stepper_step4": {
        "ar": "تم التوصيل",
        "en": "Delivered",
        "fr": "Livré",
        "ru": "Доставлен",
        "it": "Consegnato"
    },
    "step_dinein_1": {
        "ar": "تسجيل الطلب",
        "en": "Order Placed",
        "fr": "Commande enregistrée",
        "ru": "Заказ оформлен",
        "it": "Ordine registrato"
    },
    "step_dinein_2": {
        "ar": "قيد الطهي",
        "en": "Cooking",
        "fr": "En cuisson",
        "ru": "Готовится",
        "it": "In cottura"
    },
    "step_dinein_3": {
        "ar": "تقديم للطاولة",
        "en": "Serving Table",
        "fr": "Service à table",
        "ru": "Подача на стол",
        "it": "Al tavolo"
    },
    "step_dinein_4": {
        "ar": "بالهناء والشفاء",
        "en": "Enjoy your meal",
        "fr": "Bon appétit",
        "ru": "Приятного аппетита",
        "it": "Buon appetito"
    },
    "step_takeaway_1": {
        "ar": "استلام الطلب",
        "en": "Order Received",
        "fr": "Commande reçue",
        "ru": "Заказ принят",
        "it": "Ordine ricevuto"
    },
    "step_takeaway_2": {
        "ar": "تجهيز وتعليب",
        "en": "Packing Meal",
        "fr": "Emballage",
        "ru": "Упаковка",
        "it": "Confezionamento"
    },
    "step_takeaway_3": {
        "ar": "جاهز بالفرع",
        "en": "Ready at Counter",
        "fr": "Prêt au comptoir",
        "ru": "Готов к выдаче",
        "it": "Pronto al bancone"
    },
    "step_takeaway_4": {
        "ar": "تم الاستلام",
        "en": "Picked Up",
        "fr": "Récupéré",
        "ru": "Получен",
        "it": "Ritirato"
    },
    "menu_language": {
        "ar": "لغة المنيو / Language",
        "en": "Language / لغة المنيو",
        "fr": "Langue / Language",
        "ru": "Язык меню / Language",
        "it": "Lingua / Language"
    },
    "change_lang_btn": {
        "ar": "تغيير اللغة",
        "en": "Change Language",
        "fr": "Changer de langue",
        "ru": "Сменить язык",
        "it": "Cambia lingua"
    },
    "account_theme_title": {
        "ar": "مظهر التطبيق",
        "en": "App Appearance",
        "fr": "Apparence de l'application",
        "ru": "Тема оформления",
        "it": "Aspetto dell'app"
    },
    "account_sound_title": {
        "ar": "المؤثرات الصوتية",
        "en": "Sound Effects",
        "fr": "Effets sonores",
        "ru": "Звуковые эффекты",
        "it": "Effetti sonori"
    },
    "account_whatsapp_title": {
        "ar": "خدمة العملاء والدعم",
        "en": "Customer Support",
        "fr": "Service Client & Support",
        "ru": "Служба поддержки клиентов",
        "it": "Assistenza clienti"
    },
    "account_share_title": {
        "ar": "مشاركة المنيو مع الأصدقاء",
        "en": "Share Menu with Friends",
        "fr": "Partager le menu",
        "ru": "Поделиться меню с друзьями",
        "it": "Condividi il menu con amici"
    },
    "btn_edit": {
        "ar": "تعديل",
        "en": "Edit",
        "fr": "Modifier",
        "ru": "Изменить",
        "it": "Modifica"
    },
    "val_guest_user": {
        "ar": "عميلنا العزيز",
        "en": "Dear Guest",
        "fr": "Cher client",
        "ru": "Уважаемый гость",
        "it": "Gentile cliente"
    },
    "val_guest_hint": {
        "ar": "انقر على تعديل لحفظ اسمك ورقمك وعنوانك",
        "en": "Tap edit to save your name, phone & address",
        "fr": "Appuyez pour modifier votre profil",
        "ru": "Нажмите для сохранения имени и адреса",
        "it": "Tocca modifica per salvare nome e dati"
    },
    "val_no_address": {
        "ar": "لم تسجل عنواناً بعد — انقر للإضافة وتوفير الوقت في الطلبات",
        "en": "No address saved yet — tap to add for faster ordering",
        "fr": "Aucune adresse enregistrée",
        "ru": "Адрес еще не сохранен",
        "it": "Nessun indirizzo salvato"
    },
    "onboard_title": {
        "ar": "أهلاً بك في مطعمنا!",
        "en": "Welcome to our Restaurant!",
        "fr": "Bienvenue dans notre restaurant !",
        "ru": "Добро пожаловать в наш ресторан!",
        "it": "Benvenuto nel nostro ristorante!"
    },
    "onboard_subtitle": {
        "ar": "اختر لغتك المفضلة وسجّل بياناتك مرة واحدة لتسريع تأكيد طلباتك:",
        "en": "Select your language and save your details for faster ordering:",
        "fr": "Sélectionnez votre langue et enregistrez vos coordonnées :",
        "ru": "Выберите язык и сохраните данные для быстрого заказа:",
        "it": "Seleziona la tua lingua e salva i tuoi dati per ordini rapidi:"
    },
    "onboard_lang_select": {
        "ar": "لغة المنيو والتطبيق:",
        "en": "Menu & App Language:",
        "fr": "Langue du menu & de l'application :",
        "ru": "Язык меню и приложения:",
        "it": "Lingua del menu e dell'app:"
    },
    "onboard_save_btn": {
        "ar": "حفظ ومتابعة المنيو",
        "en": "Save & Browse Menu",
        "fr": "Enregistrer et voir le menu",
        "ru": "Сохранить и перейти в меню",
        "it": "Salva e sfoglia il menu"
    },
    "onboard_skip_btn": {
        "ar": "تخطي الآن وتصفح القائمة",
        "en": "Skip for now",
        "fr": "Passer pour l'instant",
        "ru": "Пропустить и перейти в меню",
        "it": "Salta per ora"
    },
    "toast_lang_changed": {
        "ar": "تم تغيير لغة التطبيق بنجاح",
        "en": "Language updated successfully",
        "fr": "Langue modifiée avec succès",
        "ru": "Язык успешно обновлен",
        "it": "Lingua aggiornata con successo"
    },
    "toast_profile_saved": {
        "ar": "تم حفظ بياناتك بنجاح",
        "en": "Profile saved successfully",
        "fr": "Profil enregistré avec succès",
        "ru": "Данные успешно сохранены",
        "it": "Profilo salvato con successo"
    }
};

  const I18n = {
    supportedLanguages: SUPPORTED_LANGS,
    dictionary: DICTIONARY,

    getLanguage() {
      try {
        const saved = localStorage.getItem('harpy_customer_lang');
        if (saved && SUPPORTED_LANGS[saved]) return saved;
        const profRaw = localStorage.getItem('harpy_customer_profile');
        if (profRaw) {
          const prof = JSON.parse(profRaw);
          if (prof && prof.lang && SUPPORTED_LANGS[prof.lang]) return prof.lang;
        }
      } catch (e) {}
      return 'ar';
    },

    setLanguage(langCode, triggerRender = true) {
      if (!SUPPORTED_LANGS[langCode]) langCode = 'ar';
      const langConfig = SUPPORTED_LANGS[langCode];

      try {
        localStorage.setItem('harpy_customer_lang', langCode);
        const profRaw = localStorage.getItem('harpy_customer_profile');
        if (profRaw) {
          const prof = JSON.parse(profRaw);
          prof.lang = langCode;
          localStorage.setItem('harpy_customer_profile', JSON.stringify(prof));
        }
      } catch (e) {}

      const root = document.documentElement;
      if (root) {
        root.setAttribute('lang', langCode);
        root.setAttribute('dir', langConfig.dir);
        root.setAttribute('data-lang', langCode);
      }
      if (document.body) {
        document.body.setAttribute('dir', langConfig.dir);
        document.body.setAttribute('data-lang', langCode);
      }

      this.applyDOMTranslations(langCode);

      window.dispatchEvent(new CustomEvent('harpy_language_changed', {
        detail: { lang: langCode, config: langConfig }
      }));

      if (triggerRender) {
        try {
          if (typeof window.rerenderAllCustomerViews === 'function') {
            window.rerenderAllCustomerViews();
          }
        } catch (err) {}
      }

      return langCode;
    },

    translate(text) {
      if (!text || typeof text !== 'string') return text || '';
      const curLang = this.getLanguage();
      if (curLang === 'ar') return text;
      
      const clean = text.trim();
      if (COMMON_TERMS[clean] && COMMON_TERMS[clean][curLang]) {
        return COMMON_TERMS[clean][curLang];
      }
      
      const lower = clean.toLowerCase();
      for (const [k, v] of Object.entries(COMMON_TERMS)) {
        if (k.toLowerCase() === lower && v[curLang]) return v[curLang];
      }
      
      for (const [k, v] of Object.entries(COMMON_TERMS)) {
        if (clean.includes(k) && v[curLang]) {
          return clean.replace(k, v[curLang]);
        }
      }
      return text;
    },

    t(key, fallback = '') {
      const curLang = this.getLanguage();
      const entry = DICTIONARY[key];
      if (!entry) return fallback || key;
      return entry[curLang] || entry['en'] || entry['ar'] || fallback || key;
    },

    applyDOMTranslations(langCode) {
      const lang = langCode || this.getLanguage();

      // 1. Regular text content
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && DICTIONARY[key]) {
          const text = DICTIONARY[key][lang] || DICTIONARY[key]['en'] || DICTIONARY[key]['ar'];
          if (text) el.textContent = text;
        }
      });

      // 2. Placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key && DICTIONARY[key]) {
          const text = DICTIONARY[key][lang] || DICTIONARY[key]['en'] || DICTIONARY[key]['ar'];
          if (text) el.setAttribute('placeholder', text);
        }
      });

      // 3. Titles / aria-labels
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (key && DICTIONARY[key]) {
          const text = DICTIONARY[key][lang] || DICTIONARY[key]['en'] || DICTIONARY[key]['ar'];
          if (text) {
            el.setAttribute('title', text);
            el.setAttribute('aria-label', text);
          }
        }
      });

      // 4. Update language indicator in "My Account" drawer
      const accountLangSub = document.getElementById('account-language-sub');
      if (accountLangSub && SUPPORTED_LANGS[lang]) {
        accountLangSub.textContent = `${SUPPORTED_LANGS[lang].flag} ${SUPPORTED_LANGS[lang].name} (${SUPPORTED_LANGS[lang].englishName})`;
      }

      // 5. Update language indicator in clean view (#view-account)
      const cleanLangSub = document.getElementById('clean-language-status-text');
      if (cleanLangSub && SUPPORTED_LANGS[lang]) {
        cleanLangSub.textContent = `${SUPPORTED_LANGS[lang].flag} ${SUPPORTED_LANGS[lang].name} (${SUPPORTED_LANGS[lang].englishName})`;
      }
    },

    init() {
      const initialLang = this.getLanguage();
      const langConfig = SUPPORTED_LANGS[initialLang] || SUPPORTED_LANGS.ar;

      const root = document.documentElement;
      if (root) {
        root.setAttribute('lang', initialLang);
        root.setAttribute('dir', langConfig.dir);
        root.setAttribute('data-lang', initialLang);
      }
      if (document.body) {
        document.body.setAttribute('dir', langConfig.dir);
        document.body.setAttribute('data-lang', initialLang);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.applyDOMTranslations(initialLang);
        });
      } else {
        this.applyDOMTranslations(initialLang);
      }
    }
  };

  window.I18n = I18n;
  window.t = function(key, fallback) { return I18n.t(key, fallback); };
  window.tr = function(text) { return I18n.translate(text); };

  I18n.init();

})(typeof window !== 'undefined' ? window : this);
