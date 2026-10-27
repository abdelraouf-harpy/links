// ═══════════════════════════════════════════════════════════
// HarpyOrder — High-Performance i18n Translation Engine (5 Languages)
// Arabic (ar), English (en), French (fr), Russian (ru), Italian (it)
// ═══════════════════════════════════════════════════════════

(function(window) {
  'use strict';

  const SUPPORTED_LANGS = {
    ar: { code: 'ar', name: 'العربية', englishName: 'Arabic', flag: '🇪🇬', dir: 'rtl', fontClass: 'font-ar' },
    en: { code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧', dir: 'ltr', fontClass: 'font-en' }
  };

  const COMMON_TERMS = {
    "صوص رانش": {"en":"Ranch Sauce","fr":"Sauce Ranch","ru":"Соус Ранч","it":"Salsa Ranch"},
    "صوص باربيكيو": {"en":"BBQ Sauce","fr":"Sauce BBQ","ru":"Соус барбекю","it":"Salsa BBQ"},
    "صوص شيدر": {"en":"Cheddar Sauce","fr":"Sauce Cheddar","ru":"Сырный соус","it":"Salsa Cheddar"},
    "بيبروني": {"en":"Pepperoni","fr":"Pepperoni","ru":"Пепперони","it":"Pepperoni"},
    "بيتزا بيبروني": {"en":"Pepperoni Pizza","fr":"Pizza Pepperoni","ru":"Пицца Пепперони","it":"Pizza Pepperoni"},
    "سوري شاورما لحمة": {"en":"Syrian Beef Shawarma Wrap","fr":"Wrap Chawarma Bœuf","ru":"Сирийский рап с мясной шаурмой","it":"Wrap Shawarma di Manzo"},
    "سوري شاورما لحم": {"en":"Syrian Beef Shawarma Wrap","fr":"Wrap Chawarma Bœuf","ru":"Сирийский рап с мясной шаурмой","it":"Wrap Shawarma di Manzo"},
    "سوري شاورما فراخ": {"en":"Syrian Chicken Shawarma Wrap","fr":"Wrap Chawarma Poulet","ru":"Сирийский рап с куриной шаурмой","it":"Wrap Shawarma di Pollo"},
    "سوري شاورما دجاج": {"en":"Syrian Chicken Shawarma Wrap","fr":"Wrap Chawarma Poulet","ru":"Сирийский рап с куриной шаурмой","it":"Wrap Shawarma di Pollo"},
    "ج.م": {"en":"EGP","fr":"EGP","ru":"EGP","it":"EGP"},
    "جنيه": {"en":"EGP","fr":"EGP","ru":"EGP","it":"EGP"},
    "ر.س": {"en":"SAR","fr":"SAR","ru":"SAR","it":"SAR"},
    "د.إ": {"en":"AED","fr":"AED","ru":"AED","it":"AED"},
    "صغير": {"en":"Small","fr":"Petit","ru":"Маленький","it":"Piccolo"},
    "صغيرة": {"en":"Small","fr":"Petite","ru":"Маленькая","it":"Piccola"},
    "حجم صغير": {"en":"Small Size","fr":"Petite Taille","ru":"Маленький размер","it":"Taglia Piccola"},
    "وسط": {"en":"Medium","fr":"Moyen","ru":"Средний","it":"Medio"},
    "متوسط": {"en":"Medium","fr":"Moyen","ru":"Средний","it":"Medio"},
    "متوسطة": {"en":"Medium","fr":"Moyenne","ru":"Средняя","it":"Media"},
    "حجم وسط": {"en":"Medium Size","fr":"Taille Moyenne","ru":"Средний размер","it":"Taglia Media"},
    "كبير": {"en":"Large","fr":"Grand","ru":"Большой","it":"Grande"},
    "كبيرة": {"en":"Large","fr":"Grande","ru":"Большая","it":"Grande"},
    "حجم كبير": {"en":"Large Size","fr":"Grande Taille","ru":"Большой размер","it":"Taglia Grande"},
    "عائلي": {"en":"Family","fr":"Familial","ru":"Семейный","it":"Famiglia"},
    "عائلية": {"en":"Family","fr":"Familiale","ru":"Семейная","it":"Famiglia"},
    "حجم عائلي": {"en":"Family Size","fr":"Taille Familiale","ru":"Семейный размер","it":"Formato Famiglia"},
    "جامبو": {"en":"Jumbo","fr":"Jumbo","ru":"Джамбо","it":"Jumbo"},
    "حجم جامبو": {"en":"Jumbo Size","fr":"Taille Jumbo","ru":"Размер Джамбо","it":"Taglia Jumbo"},
    "سوبر": {"en":"Super","fr":"Super","ru":"Супер","it":"Super"},
    "سنجل": {"en":"Single","fr":"Simple","ru":"Одинарный","it":"Singolo"},
    "سينجل": {"en":"Single","fr":"Simple","ru":"Одинарный","it":"Singolo"},
    "دبل": {"en":"Double","fr":"Double","ru":"Двойной","it":"Doppio"},
    "تربل": {"en":"Triple","fr":"Triple","ru":"Тройной","it":"Triplo"},
    "تريبل": {"en":"Triple","fr":"Triple","ru":"Тройной","it":"Triplo"},
    "كواترو": {"en":"Quattro","fr":"Quattro","ru":"Кватро","it":"Quattro"},
    "كومبو": {"en":"Combo","fr":"Combo","ru":"Комбо","it":"Combo"},
    "صاروخ": {"en":"Mega Wrap","fr":"Méga Wrap","ru":"Мега рап","it":"Mega Wrap"},
    "عادي": {"en":"Regular","fr":"Régulier","ru":"Обычный","it":"Regolare"},
    "سمول": {"en":"Small","fr":"Small","ru":"Смол","it":"Small"},
    "ميديم": {"en":"Medium","fr":"Medium","ru":"Медиум","it":"Medium"},
    "لارج": {"en":"Large","fr":"Large","ru":"Лардж","it":"Large"},
    "كيدز": {"en":"Kids","fr":"Enfants","ru":"Детский","it":"Bambini"},
    "أطفال": {"en":"Kids","fr":"Enfants","ru":"Детский","it":"Bambini"},
    "اطفال": {"en":"Kids","fr":"Enfants","ru":"Детский","it":"Bambini"},
    "قطعة": {"en":"1 Piece","fr":"1 Pièce","ru":"1 кусок","it":"1 Pezzo"},
    "قطعه": {"en":"1 Piece","fr":"1 Pièce","ru":"1 кусок","it":"1 Pezzo"},
    "قطعتين": {"en":"2 Pieces","fr":"2 Pièces","ru":"2 куска","it":"2 Pezzi"},
    "3 قطع": {"en":"3 Pieces","fr":"3 Pièces","ru":"3 куска","it":"3 Pezzi"},
    "4 قطع": {"en":"4 Pieces","fr":"4 Pièces","ru":"4 куска","it":"4 Pezzi"},
    "5 قطع": {"en":"5 Pieces","fr":"5 Pièces","ru":"5 кусков","it":"5 Pezzi"},
    "6 قطع": {"en":"6 Pieces","fr":"6 Pièces","ru":"6 кусков","it":"6 Pezzi"},
    "8 قطع": {"en":"8 Pieces","fr":"8 Pièces","ru":"8 кусков","it":"8 Pezzi"},
    "9 قطع": {"en":"9 Pieces","fr":"9 Pièces","ru":"9 кусков","it":"9 Pezzi"},
    "10 قطع": {"en":"10 Pieces","fr":"10 Pièces","ru":"10 кусков","it":"10 Pezzi"},
    "12 قطعة": {"en":"12 Pieces","fr":"12 Pièces","ru":"12 кусков","it":"12 Pezzi"},
    "12 قطعه": {"en":"12 Pieces","fr":"12 Pièces","ru":"12 кусков","it":"12 Pezzi"},
    "اكسترا جبنة": {"en":"Extra Cheese","fr":"Supplément Fromage","ru":"Экстра сыр","it":"Formaggio Extra"},
    "إكسترا جبنة": {"en":"Extra Cheese","fr":"Supplément Fromage","ru":"Экстра сыр","it":"Formaggio Extra"},
    "اضافة جبنة": {"en":"Extra Cheese","fr":"Supplément Fromage","ru":"Экстра сыр","it":"Formaggio Extra"},
    "إضافة جبنة": {"en":"Extra Cheese","fr":"Supplément Fromage","ru":"Экстра сыр","it":"Formaggio Extra"},
    "زيادة جبنة": {"en":"Extra Cheese","fr":"Supplément Fromage","ru":"Экстра сыр","it":"Formaggio Extra"},
    "جبنة موتزاريلا": {"en":"Mozzarella Cheese","fr":"Fromage Mozzarella","ru":"Сыр Моцарелла","it":"Mozzarella"},
    "جبنة موزاريلا": {"en":"Mozzarella Cheese","fr":"Fromage Mozzarella","ru":"Сыр Моцарелла","it":"Mozzarella"},
    "موتزاريلا": {"en":"Mozzarella","fr":"Mozzarella","ru":"Моцарелла","it":"Mozzarella"},
    "موزاريلا": {"en":"Mozzarella","fr":"Mozzarella","ru":"Моцарелла","it":"Mozzarella"},
    "جبنة شيدر": {"en":"Cheddar Cheese","fr":"Fromage Cheddar","ru":"Сыр Чеддер","it":"Formaggio Cheddar"},
    "شيدر": {"en":"Cheddar","fr":"Cheddar","ru":"Чеддер","it":"Cheddar"},
    "جبنة رومي": {"en":"Romi Cheese","fr":"Fromage Roumi","ru":"Сыр Руми","it":"Formaggio Roumi"},
    "رومي": {"en":"Romi","fr":"Roumi","ru":"Руми","it":"Roumi"},
    "جبنة كيري": {"en":"Kiri Cheese","fr":"Fromage Kiri","ru":"Сыр Кири","it":"Formaggio Kiri"},
    "جبنة فيتا": {"en":"Feta Cheese","fr":"Fromage Féta","ru":"Сыр Фета","it":"Formaggio Feta"},
    "جبنة": {"en":"Cheese","fr":"Fromage","ru":"Сыр","it":"Formaggio"},
    "جبن": {"en":"Cheese","fr":"Fromage","ru":"Сыр","it":"Formaggio"},
    "بدون بصل": {"en":"No Onions","fr":"Sans Oignons","ru":"Без лука","it":"Senza Cipolla"},
    "بدون طماطم": {"en":"No Tomatoes","fr":"Sans Tomates","ru":"Без помидоров","it":"Senza Pomodori"},
    "بدون مخلل": {"en":"No Pickles","fr":"Sans Cornichons","ru":"Без солений","it":"Senza Cetriolini"},
    "بدون خيار": {"en":"No Cucumbers","fr":"Sans Concombres","ru":"Без огурцов","it":"Senza Cetrioli"},
    "بدون مايونيز": {"en":"No Mayo","fr":"Sans Mayo","ru":"Без майонеза","it":"Senza Maionese"},
    "بدون صوص": {"en":"No Sauce","fr":"Sans Sauce","ru":"Без соуса","it":"Senza Salsa"},
    "بدون شطة": {"en":"No Chili","fr":"Sans Piment","ru":"Без перца","it":"Senza Peperoncino"},
    "سبايسي": {"en":"Spicy","fr":"Épicé","ru":"Острый","it":"Piccante"},
    "حار": {"en":"Spicy","fr":"Piquant","ru":"Острый","it":"Piccante"},
    "حارة": {"en":"Spicy","fr":"Piquante","ru":"Острая","it":"Piccante"},
    "بارد": {"en":"Mild","fr":"Doux","ru":"Неострый","it":"Delicato"},
    "اكسترا صوص": {"en":"Extra Sauce","fr":"Sauce Supplémentaire","ru":"Экстра соус","it":"Salsa Extra"},
    "إكسترا صوص": {"en":"Extra Sauce","fr":"Sauce Supplémentaire","ru":"Экстра соус","it":"Salsa Extra"},
    "زيادة صوص": {"en":"Extra Sauce","fr":"Sauce Supplémentaire","ru":"Экстра соус","it":"Salsa Extra"},
    "بطاطس إضافية": {"en":"Extra Fries","fr":"Frites Supplémentaires","ru":"Экстра картофель фри","it":"Patatine Extra"},
    "بطاطس اضافية": {"en":"Extra Fries","fr":"Frites Supplémentaires","ru":"Экстра картофель фри","it":"Patatine Extra"},
    "زيادة بطاطس": {"en":"Extra Fries","fr":"Frites Supplémentaires","ru":"Экстра картофель фри","it":"Patatine Extra"},
    "عيش إضافي": {"en":"Extra Bread","fr":"Pain Supplémentaire","ru":"Экстра хлеб","it":"Pane Extra"},
    "عيش اضافي": {"en":"Extra Bread","fr":"Pain Supplémentaire","ru":"Экстра хлеб","it":"Pane Extra"},
    "زيادة عيش": {"en":"Extra Bread","fr":"Pain Supplémentaire","ru":"Экстра хлеб","it":"Pane Extra"},
    "هالبينو": {"en":"Jalapeño","fr":"Jalapeño","ru":"Халапеньо","it":"Jalapeño"},
    "هلابينو": {"en":"Jalapeño","fr":"Jalapeño","ru":"Халапеньо","it":"Jalapeño"},
    "مشروم": {"en":"Mushroom","fr":"Champignons","ru":"Грибы","it":"Funghi"},
    "فطر": {"en":"Mushroom","fr":"Champignons","ru":"Грибы","it":"Funghi"},
    "بيكون": {"en":"Bacon","fr":"Bacon","ru":"Бекон","it":"Bacon"},
    "بيكون بقري": {"en":"Beef Bacon","fr":"Bacon de Bœuf","ru":"Говяжий бекон","it":"Bacon di Manzo"},
    "زيتون": {"en":"Olives","fr":"Olives","ru":"Оливки","it":"Olive"},
    "زيتون أسود": {"en":"Black Olives","fr":"Olives Noires","ru":"Черные оливки","it":"Olive Nere"},
    "زيتون اخضر": {"en":"Green Olives","fr":"Olives Vertes","ru":"Зеленые оливки","it":"Olive Verdi"},
    "حشو أطراف": {"en":"Stuffed Crust","fr":"Croûte Farcie","ru":"Сырный бортик","it":"Bordo Ripieno"},
    "حشو اطراف": {"en":"Stuffed Crust","fr":"Croûte Farcie","ru":"Сырный бортик","it":"Bordo Ripieno"},
    "أطراف جبنة": {"en":"Cheese Stuffed Crust","fr":"Croûte au Fromage","ru":"Сырный бортик","it":"Bordo al Formaggio"},
    "اطراف جبنة": {"en":"Cheese Stuffed Crust","fr":"Croûte au Fromage","ru":"Сырный бортик","it":"Bordo al Formaggio"},
    "أطراف سوسيس": {"en":"Hot Dog Stuffed Crust","fr":"Croûte Saucisse","ru":"Бортик с сосиской","it":"Bordo Wurstel"},
    "اطراف سوسيس": {"en":"Hot Dog Stuffed Crust","fr":"Croûte Saucisse","ru":"Бортик с сосиской","it":"Bordo Wurstel"},
    "السعر الأساسي": {"en":"Base Price","fr":"Prix de base","ru":"Базовая цена","it":"Prezzo base"},
    "شامل الوجبة": {"en":"Included in meal","fr":"Inclus dans le menu","ru":"Включено в блюдо","it":"Incluso nel menu"},
    "الأكثر مبيعاً": {"en":"Best Seller","fr":"Meilleure Vente","ru":"Хит продаж","it":"Più Venduto"},
    "الأكثر مبيعا": {"en":"Best Seller","fr":"Meilleure Vente","ru":"Хит продаж","it":"Più Venduto"},
    "الأكثر طلباً": {"en":"Most Popular","fr":"Le Plus Demandé","ru":"Самое популярное","it":"Più Richiesto"},
    "الأكثر طلبا": {"en":"Most Popular","fr":"Le Plus Demandé","ru":"Самое популярное","it":"Più Richiesto"},
    "مميز": {"en":"Featured","fr":"En Vedette","ru":"Рекомендуем","it":"In Evidenza"},
    "جديد": {"en":"New","fr":"Nouveau","ru":"Новинка","it":"Nuovo"},
    "عرض خاص": {"en":"Special Offer","fr":"Offre Spéciale","ru":"Спецпредложение","it":"Offerta Speciale"},
    "خصم خاص": {"en":"Special Discount","fr":"Remise Spéciale","ru":"Специальная скидка","it":"Sconto Speciale"},
    "توفير": {"en":"Value Deal","fr":"Bon Plan","ru":"Выгодно","it":"Offerta Conveniente"},
    "سوبر توفير": {"en":"Super Value","fr":"Super Économie","ru":"Супер выгода","it":"Super Risparmio"},
    "بوكس التوفير": {"en":"Savings Box","fr":"Box Économique","ru":"Эконом бокс","it":"Box Risparmio"},
    "سوبر بوكس": {"en":"Super Box","fr":"Super Box","ru":"Супер бокс","it":"Super Box"},
    "اختيار الشيف": {"en":"Chef's Choice","fr":"Choix du Chef","ru":"Выбор шефа","it":"Scelta dello Chef"},
    "حصري": {"en":"Exclusive","fr":"Exclusif","ru":"Эксклюзив","it":"Esclusivo"},
    "وجبة عائلية": {"en":"Family Meal","fr":"Menu Familial","ru":"Семейный обед","it":"Menu Famiglia"},
    "وجبه عائلية": {"en":"Family Meal","fr":"Menu Familial","ru":"Семейный обед","it":"Menu Famiglia"},
    "وجبة كومبو": {"en":"Combo Meal","fr":"Menu Combo","ru":"Комбо обед","it":"Menu Combo"},
    "وجبه كومبو": {"en":"Combo Meal","fr":"Menu Combo","ru":"Комбо обед","it":"Menu Combo"},
    "وجبة توفير": {"en":"Savings Meal","fr":"Menu Éco","ru":"Эконом обед","it":"Menu Risparmio"},
    "وجبه توفير": {"en":"Savings Meal","fr":"Menu Éco","ru":"Эконом обед","it":"Menu Risparmio"},
    "وجبة أطفال": {"en":"Kids Meal","fr":"Menu Enfants","ru":"Детский обед","it":"Menu Bambini"},
    "وجبة كيدز": {"en":"Kids Meal","fr":"Menu Enfants","ru":"Детский обед","it":"Menu Bambini"},
    "برجر زنجر دبل": {"en":"Double Zinger Burger","fr":"Double Zinger Burger","ru":"Двойной Зингер Бургер","it":"Double Zinger Burger"},
    "برجر زنجر": {"en":"Zinger Burger","fr":"Zinger Burger","ru":"Зингер Бургер","it":"Zinger Burger"},
    "سماش برجر": {"en":"Smash Burger","fr":"Smash Burger","ru":"Смэш Бургер","it":"Smash Burger"},
    "دبل سماش برجر": {"en":"Double Smash Burger","fr":"Double Smash Burger","ru":"Двойной Смэш Бургер","it":"Double Smash Burger"},
    "كريب شاورما فراخ": {"en":"Chicken Shawarma Crepe","fr":"Crêpe Chawarma Poulet","ru":"Креп с куриной шаурмой","it":"Crepe Shawarma Pollo"},
    "كريب شاورما دجاج": {"en":"Chicken Shawarma Crepe","fr":"Crêpe Chawarma Poulet","ru":"Креп с куриной шаурмой","it":"Crepe Shawarma Pollo"},
    "كريب شاورما لحمة": {"en":"Beef Shawarma Crepe","fr":"Crêpe Chawarma Bœuf","ru":"Креп с мясной шаурмой","it":"Crepe Shawarma Manzo"},
    "كريب شاورما لحم": {"en":"Beef Shawarma Crepe","fr":"Crêpe Chawarma Bœuf","ru":"Креп с мясной шаурмой","it":"Crepe Shawarma Manzo"},
    "كريب زنجر": {"en":"Spicy Zinger Crepe","fr":"Crêpe Zinger","ru":"Креп Зингер","it":"Crepe Zinger"},
    "كريب بانيه": {"en":"Pane Crepe","fr":"Crêpe Pané","ru":"Креп с панированным филе","it":"Crepe Panato"},
    "كريب هوت دوج": {"en":"Hot Dog Crepe","fr":"Crêpe Hot-Dog","ru":"Креп с сосисками","it":"Crepe Hot Dog"},
    "كريب كوردون بلو": {"en":"Cordon Bleu Crepe","fr":"Crêpe Cordon Bleu","ru":"Креп Кордон Блю","it":"Crepe Cordon Bleu"},
    "كريب فاهيتا فراخ": {"en":"Chicken Fajita Crepe","fr":"Crêpe Fajita Poulet","ru":"Креп фахита с курицей","it":"Crepe Fajita Pollo"},
    "كريب فاهيتا لحمة": {"en":"Beef Fajita Crepe","fr":"Crêpe Fajita Bœuf","ru":"Креп фахита с говядиной","it":"Crepe Fajita Manzo"},
    "كريب نوتيلا": {"en":"Nutella Crepe","fr":"Crêpe Nutella","ru":"Креп с Нутеллой","it":"Crepe Nutella"},
    "كريب لوتس": {"en":"Lotus Biscoff Crepe","fr":"Crêpe Lotus","ru":"Креп с Лотусом","it":"Crepe Lotus"},
    "كريب شوكولاتة": {"en":"Chocolate Crepe","fr":"Crêpe au Chocolat","ru":"Шоколадный креп","it":"Crepe al Cioccolato"},
    "بيتزا فراخ باربيكيو": {"en":"BBQ Chicken Pizza","fr":"Pizza Poulet BBQ","ru":"Пицца Чикен Барбекю","it":"Pizza Pollo BBQ"},
    "بيتزا سي فود": {"en":"Seafood Pizza","fr":"Pizza Fruits de Mer","ru":"Пицца с морепродуктами","it":"Pizza ai Frutti di Mare"},
    "بيتزا تونة": {"en":"Tuna Pizza","fr":"Pizza au Thon","ru":"Пицца с тунцом","it":"Pizza al Tonno"},
    "بيتزا تونه": {"en":"Tuna Pizza","fr":"Pizza au Thon","ru":"Пицца с тунцом","it":"Pizza al Tonno"},
    "بيتزا بسطرمة": {"en":"Pastrami Pizza","fr":"Pizza Pastrami","ru":"Пицца с пастромой","it":"Pizza Pastrami"},
    "بيتزا كواترو فورماجيو": {"en":"Quattro Formaggi Pizza","fr":"Pizza Quatre Fromages","ru":"Пицца Четыре сыра","it":"Pizza Quattro Formaggi"},
    "شاورما صاج": {"en":"Saj Shawarma","fr":"Chawarma Saj","ru":"Шаурма на садже","it":"Shawarma Saj"},
    "فتة شاورما": {"en":"Shawarma Fattah","fr":"Fattah Chawarma","ru":"Фаттах с шаурмой","it":"Fattah Shawarma"},
    "فتة شاورما فراخ": {"en":"Chicken Shawarma Fattah","fr":"Fattah Poulet","ru":"Фаттах с курицей","it":"Fattah Pollo"},
    "فتة شاورما لحمة": {"en":"Beef Shawarma Fattah","fr":"Fattah Bœuf","ru":"Фаттах с говядиной","it":"Fattah Manzo"},
    "حواوشي اسكندراني": {"en":"Alexandrian Hawawshi","fr":"Hawawshi Alexandrin","ru":"Хававши по-александрийски","it":"Hawawshi all'Alessandrina"},
    "حواوشي فراخ": {"en":"Chicken Hawawshi","fr":"Hawawshi Poulet","ru":"Хававши с курицей","it":"Hawawshi di Pollo"},
    "حواوشي بسطرمة": {"en":"Pastrami Hawawshi","fr":"Hawawshi Pastrami","ru":"Хававши с пастромой","it":"Hawawshi Pastrami"},
    "حواوشي سجق": {"en":"Sausage Hawawshi","fr":"Hawawshi Saucisse","ru":"Хававши с колбасками","it":"Hawawshi con Salsiccia"},
    "طاجن مكرونة بشاميل": {"en":"Béchamel Pasta Casserole","fr":"Gratin de Pâtes Béchamel","ru":"Паста бешамель в таджине","it":"Pasta al Forno Besciamella"},
    "مكرونة بشاميل": {"en":"Béchamel Pasta","fr":"Pâtes Béchamel","ru":"Паста бешамель","it":"Pasta Besciamella"},
    "طاجن نجرسكو": {"en":"Negresco Pasta Casserole","fr":"Gratin Négresco","ru":"Негреско в таджине","it":"Pasta Negresco"},
    "مكرونة نجرسكو": {"en":"Negresco Pasta","fr":"Pâtes Négresco","ru":"Паста Негреско","it":"Pasta Negresco"},
    "طاجن سجق": {"en":"Sausage Casserole","fr":"Cassolette de Saucisse","ru":"Колбаски в таджине","it":"Casseruola di Salsiccia"},
    "طاجن كبدة": {"en":"Liver Casserole","fr":"Cassolette de Foie","ru":"Печень в таджине","it":"Casseruola di Fegato"},
    "طاجن لحمة": {"en":"Beef Casserole","fr":"Cassolette de Bœuf","ru":"Мясо в таджине","it":"Casseruola di Manzo"},
    "كباب حلة": {"en":"Kebab Hala Beef Stew","fr":"Ragoût Kebab Hala","ru":"Кебаб хала тушеная говядина","it":"Stufato Kebab Hala"},
    "كباب وكفتة": {"en":"Kebab & Kofta","fr":"Kebab & Kofta","ru":"Кебаб и люля-кебаб","it":"Kebab e Kofta"},
    "ميكس جريل": {"en":"Mixed Grill","fr":"Mix Grillade","ru":"Мясное ассорти гриль","it":"Grigliata Mista"},
    "مكس جريل": {"en":"Mixed Grill","fr":"Mix Grillade","ru":"Мясное ассорти гриль","it":"Grigliata Mista"},
    "فرخة مشوية": {"en":"Whole Grilled Chicken","fr":"Poulet Grillé Entier","ru":"Целая курица гриль","it":"Pollo Intero Grigliato"},
    "نصف فرخة": {"en":"Half Grilled Chicken","fr":"Demi-Poulet Grillé","ru":"Половина курицы гриль","it":"Mezzo Pollo Grigliato"},
    "نص فرخة": {"en":"Half Grilled Chicken","fr":"Demi-Poulet Grillé","ru":"Половина курицы гриль","it":"Mezzo Pollo Grigliato"},
    "ربع فرخة": {"en":"Quarter Chicken","fr":"Quart de Poulet","ru":"Четверть курицы","it":"Quarto di Pollo"},
    "صدور دجاج": {"en":"Chicken Breasts","fr":"Blancs de Poulet","ru":"Куриные грудки","it":"Petti di Pollo"},
    "شيش طاووق": {"en":"Shish Tawook","fr":"Chich Taouk","ru":"Шиш-таук","it":"Shish Taouk"},
    "فاهيتا دجاج": {"en":"Chicken Fajita","fr":"Fajita Poulet","ru":"Фахита с курицей","it":"Fajita di Pollo"},
    "فاهيتا لحم": {"en":"Beef Fajita","fr":"Fajita Bœuf","ru":"Фахита с говядиной","it":"Fajita di Manzo"},
    "كوردون بلو": {"en":"Cordon Bleu","fr":"Cordon Bleu","ru":"Кордон Блю","it":"Cordon Bleu"},
    "ساندوتش كبدة": {"en":"Liver Sandwich","fr":"Sandwich au Foie","ru":"Сэндвич с печенью","it":"Panino con Fegato"},
    "ساندوتش سجق": {"en":"Sausage Sandwich","fr":"Sandwich Saucisse","ru":"Сэндвич с колбаской","it":"Panino con Salsiccia"},
    "ساندوتش جمبري": {"en":"Shrimp Sandwich","fr":"Sandwich Crevettes","ru":"Сэндвич с креветками","it":"Panino con Gamberi"},
    "بطاطس ويدجز": {"en":"Potato Wedges","fr":"Potatoes","ru":"Картофельные дольки","it":"Patate Spicchi"},
    "حلقات بصل": {"en":"Onion Rings","fr":"Rondelles d'Oignon","ru":"Луковые кольца","it":"Anelli di Cipolla"},
    "أصابع موتزاريلا": {"en":"Mozzarella Sticks","fr":"Bâtonnets de Mozzarella","ru":"Сырные палочки моцарелла","it":"Bastoncini di Mozzarella"},
    "اصابع موتزاريلا": {"en":"Mozzarella Sticks","fr":"Bâtonnets de Mozzarella","ru":"Сырные палочки моцарелла","it":"Bastoncini di Mozzarella"},
    "تشيكن وينجز": {"en":"Chicken Wings","fr":"Ailes de Poulet","ru":"Куриные крылышки","it":"Alette di Pollo"},
    "أجنحة دجاج": {"en":"Chicken Wings","fr":"Ailes de Poulet","ru":"Куриные крылышки","it":"Alette di Pollo"},
    "تومية": {"en":"Garlic Dip (Toum)","fr":"Sauce Toum","ru":"Чесночный соус Тум","it":"Salsa all'Aglio"},
    "توميه": {"en":"Garlic Dip (Toum)","fr":"Sauce Toum","ru":"Чесночный соус Тум","it":"Salsa all'Aglio"},
    "طحينة": {"en":"Tahini Dip","fr":"Sauce Tahina","ru":"Соус Тахини","it":"Salsa Tahina"},
    "طحينه": {"en":"Tahini Dip","fr":"Sauce Tahina","ru":"Соус Тахини","it":"Salsa Tahina"},
    "سلطة خضراء": {"en":"Green Salad","fr":"Salade Verte","ru":"Зеленый салат","it":"Insalata Verde"},
    "سلطة سيزر": {"en":"Caesar Salad","fr":"Salade César","ru":"Салат Цезарь","it":"Insalata Caesar"},
    "سلطة زبادي": {"en":"Yogurt Salad","fr":"Salade de Yaourt","ru":"Йогуртовый салат","it":"Insalata allo Yogurt"},
    "عصير مانجو": {"en":"Fresh Mango Juice","fr":"Jus de Mangue Frais","ru":"Свежий сок манго","it":"Succo di Mango Fresco"},
    "عصير فراولة": {"en":"Fresh Strawberry Juice","fr":"Jus de Fraise Frais","ru":"Свежий клубничный сок","it":"Succo di Fragola Fresco"},
    "عصير برتقال": {"en":"Fresh Orange Juice","fr":"Jus d'Orange Frais","ru":"Свежевыжатый апельсиновый сок","it":"Spremuta d'Arancia"},
    "عصير جوافة": {"en":"Fresh Guava Juice","fr":"Jus de Goyave","ru":"Сок гуавы","it":"Succo di Guava"},
    "عصير ليمون نعناع": {"en":"Lemon Mint Juice","fr":"Jus Citron Menthe","ru":"Лимонад с мятой","it":"Limonata con Menta"},
    "ليمون بالنعناع": {"en":"Lemon with Mint","fr":"Citron à la Menthe","ru":"Лимон с мятой","it":"Limone e Menta"},
    "موهيتو": {"en":"Mojito","fr":"Mojito","ru":"Мохито","it":"Mojito"},
    "موهيتو بلوبيري": {"en":"Blueberry Mojito","fr":"Mojito Myrtille","ru":"Черничный мохито","it":"Mojito ai Mirtilli"},
    "ميلك شيك": {"en":"Milkshake","fr":"Milkshake","ru":"Милкшейк","it":"Milkshake"},
    "أوريو شيك": {"en":"Oreo Shake","fr":"Oreo Shake","ru":"Орео шейк","it":"Oreo Shake"},
    "اوريو شيك": {"en":"Oreo Shake","fr":"Oreo Shake","ru":"Орео шейк","it":"Oreo Shake"},
    "لوتس شيك": {"en":"Lotus Shake","fr":"Lotus Shake","ru":"Лотус шейк","it":"Lotus Shake"},
    "أم علي": {"en":"Om Ali Dessert","fr":"Dessert Om Ali","ru":"Десерт Умм Али","it":"Dolce Om Ali"},
    "ام علي": {"en":"Om Ali Dessert","fr":"Dessert Om Ali","ru":"Десерт Умм Али","it":"Dolce Om Ali"},
    "أرز باللبن": {"en":"Rice Pudding","fr":"Riz au Lait","ru":"Рисовый пудинг","it":"Riso al Latte"},
    "ارز باللبن": {"en":"Rice Pudding","fr":"Riz au Lait","ru":"Рисовый пудинг","it":"Riso al Latte"},
    "رز باللبن": {"en":"Rice Pudding","fr":"Riz au Lait","ru":"Рисовый пудинг","it":"Riso al Latte"},
    "تشيز كيك": {"en":"Cheesecake","fr":"Cheesecake","ru":"Чизкейк","it":"Cheesecake"},
    "وافل": {"en":"Waffle","fr":"Gaufre","ru":"Вафли","it":"Waffle"},
    "وافل نوتيلا": {"en":"Nutella Waffle","fr":"Gaufre Nutella","ru":"Вафли с Нутеллой","it":"Waffle con Nutella"},
    "براونيز": {"en":"Chocolate Brownies","fr":"Brownies au Chocolat","ru":"Шоколадный брауни","it":"Brownie al Cioccolato"},
    "مياه معدنية": {"en":"Mineral Water","fr":"Eau Minérale","ru":"Минеральная вода","it":"Acqua Minerale"},
    "مياه": {"en":"Mineral Water","fr":"Eau Minérale","ru":"Минеральная вода","it":"Acqua Minerale"},
    "كانز": {"en":"Soda Can","fr":"Canette","ru":"Банка газировки","it":"Lattina"},
    "مع": {"en":"with","fr":"avec","ru":"с","it":"con"},
    "و": {"en":"and","fr":"et","ru":"и","it":"e"},
    "أو": {"en":"or","fr":"ou","ru":"или","it":"o"},
    "او": {"en":"or","fr":"ou","ru":"или","it":"o"},
    "يقدم مع": {"en":"served with","fr":"servi avec","ru":"подается с","it":"servito con"},
    "قطع": {"en":"pieces of","fr":"morceaux de","ru":"кусочки","it":"pezzi di"},
    "شرائح": {"en":"slices of","fr":"tranches de","ru":"ломтики","it":"fette di"},
    "طازج": {"en":"fresh","fr":"frais","ru":"свежий","it":"fresco"},
    "طازجة": {"en":"fresh","fr":"fraîche","ru":"свежая","it":"fresca"},
    "فريش": {"en":"fresh","fr":"frais","ru":"свежий","it":"fresco"},
    "لذيذ": {"en":"delicious","fr":"délicieux","ru":"вкусный","it":"delizioso"},
    "لذيذة": {"en":"delicious","fr":"délicieuse","ru":"вкусная","it":"deliziosa"},
    "شهي": {"en":"delicious","fr":"savoureux","ru":"аппетитный","it":"squisito"},
    "شهية": {"en":"delicious","fr":"savoureuse","ru":"аппетитная","it":"squisita"},
    "أرز": {"en":"Rice","fr":"Riz","ru":"Рис","it":"Riso"},
    "ارز": {"en":"Rice","fr":"Riz","ru":"Рис","it":"Riso"},
    "رز": {"en":"Rice","fr":"Riz","ru":"Рис","it":"Riso"},
    "عيش": {"en":"Bread","fr":"Pain","ru":"Хлеб","it":"Pane"},
    "خبز": {"en":"Bread","fr":"Pain","ru":"Хлеб","it":"Pane"},
    "بطاطس": {"en":"French Fries","fr":"Frites","ru":"Картофель фри","it":"Patatine fritte"},
    "فرايز": {"en":"French Fries","fr":"Frites","ru":"Картофель фри","it":"Patatine fritte"},
    "دجاج": {"en":"Chicken","fr":"Poulet","ru":"Курица","it":"Pollo"},
    "فراخ": {"en":"Chicken","fr":"Poulet","ru":"Курица","it":"Pollo"},
    "لحم": {"en":"Beef","fr":"Bœuf","ru":"Говядина","it":"Manzo"},
    "لحمة": {"en":"Beef","fr":"Bœuf","ru":"Говядина","it":"Manzo"},
    "لحمه": {"en":"Beef","fr":"Bœuf","ru":"Говядина","it":"Manzo"},
    "بيف": {"en":"Beef","fr":"Bœuf","ru":"Говядина","it":"Manzo"},
    "الـبـيـتزا": { "en": "Pizza", "fr": "Pizza", "ru": "Пицца", "it": "Pizza" },
    "البيتزا": { "en": "Pizza", "fr": "Pizza", "ru": "Пицца", "it": "Pizza" },
    "الكريبات": { "en": "Crepes", "fr": "Crêpes", "ru": "Крепы", "it": "Crepes" },
    "كريبات": { "en": "Crepes", "fr": "Crêpes", "ru": "Крепы", "it": "Crepes" },
    "الكريبات اللذيذه": { "en": "Delicious Crepes", "fr": "Crêpes Délicieuses", "ru": "Вкусные крепы", "it": "Crepes Deliziose" },
    "الساندوتشات": { "en": "Sandwiches", "fr": "Sandwichs", "ru": "Сэндвичи", "it": "Panini" },
    "السندوتشات": { "en": "Sandwiches", "fr": "Sandwichs", "ru": "Сэндвичи", "it": "Panini" },
    "الحواوشي": { "en": "Hawawshi", "fr": "Hawawshi", "ru": "Хававши", "it": "Hawawshi" },
    "حواوشي": { "en": "Hawawshi", "fr": "Hawawshi", "ru": "Хававши", "it": "Hawawshi" },
    "الريزو": { "en": "Rizo Bowls", "fr": "Bols Rizo", "ru": "Боулы Ризо", "it": "Ciotole Rizo" },
    "ريزو": { "en": "Rizo Bowls", "fr": "Bols Rizo", "ru": "Боулы Ризо", "it": "Ciotole Rizo" },
    "السوري": { "en": "Syrian Wraps", "fr": "Wraps Syriens", "ru": "Сирийские блюда", "it": "Wrap Siriani" },
    "سوري": { "en": "Syrian Wrap", "fr": "Wrap Syrien", "ru": "Сирийский рап", "it": "Wrap Siriano" },
    "الإضافات": { "en": "Extras & Sides", "fr": "Suppléments", "ru": "Добавки и гарниры", "it": "Contorni ed Extra" },
    "الاضافات": { "en": "Extras & Sides", "fr": "Suppléments", "ru": "Добавки и гарниры", "it": "Contorni ed Extra" },
    "مشويات وطواجن ملوكية": { "en": "Royal Grills & Casseroles", "fr": "Grillades & Plats Royaux", "ru": "Королевский гриль и таджины", "it": "Grigliate e Casseruole Reali" },
    "برجر وسندوتشات فاخرة": { "en": "Gourmet Burgers & Sandwiches", "fr": "Burgers & Sandwichs Gourmets", "ru": "Бургеры и премиум сэндвичи", "it": "Burger e Panini Gourmet" },
    "بيتزا إيطالية على الحطب": { "en": "Wood-Fired Italian Pizza", "fr": "Pizza Italienne au Feu de Bois", "ru": "Итальянская пицца на дровах", "it": "Pizza Italiana al Forno a Legna" },
    "مقبلات وصوصات كينج": { "en": "King Sides & Sauces", "fr": "Accompagnements & Sauces King", "ru": "Закуски и соусы Кинг", "it": "Contorni e Salse King" },
    "حلويات وعصائر فريش": { "en": "Fresh Desserts & Juices", "fr": "Desserts & Jus Frais", "ru": "Десерты и свежие соки", "it": "Dolci e Succhi Freschi" },
    "سـوبر كرانشي": { "en": "Super Crunchy", "fr": "Super Croustillant", "ru": "Супер Кранчи", "it": "Super Croccante" },
    "سوبر كرانشي": { "en": "Super Crunchy", "fr": "Super Croustillant", "ru": "Супер Кранчи", "it": "Super Croccante" },
    "مارجريتا": { "en": "Margherita Pizza", "fr": "Pizza Margherita", "ru": "Пицца Маргарита", "it": "Pizza Margherita" },
    "تشيكن رانش": { "en": "Chicken Ranch Pizza", "fr": "Pizza Poulet Ranch", "ru": "Пицца Чикен Ранч", "it": "Pizza Pollo Ranch" },
    "تشيكن باربيكيو": { "en": "Chicken BBQ Pizza", "fr": "Pizza Poulet BBQ", "ru": "Пицца Чикен Барбекю", "it": "Pizza Pollo BBQ" },
    "لحمه مفرومه": { "en": "Minced Meat Pizza", "fr": "Pizza Viande Hachée", "ru": "Пицца с мясным фаршем", "it": "Pizza con Carne Macinata" },
    "لحمة مفرومة": { "en": "Minced Meat Pizza", "fr": "Pizza Viande Hachée", "ru": "Пицца с мясным фаршем", "it": "Pizza con Carne Macinata" },
    "سجق": { "en": "Oriental Sausage", "fr": "Saucisse Orientale", "ru": "Восточные колбаски", "it": "Salsiccia Orientale" },
    "هوت دوج": { "en": "Hot Dog", "fr": "Hot-Dog", "ru": "Хот-дог", "it": "Hot Dog" },
    "ميكس جبن": { "en": "Mix Cheese", "fr": "Mélange de Fromages", "ru": "Сырный микс", "it": "Formaggi Misti" },
    "مكس جبن": { "en": "Mix Cheese", "fr": "Mélange de Fromages", "ru": "Сырный микс", "it": "Formaggi Misti" },
    "مكس لحوم": { "en": "Meat Lovers Mix", "fr": "Mélange de Viandes", "ru": "Мясное ассорти", "it": "Misto Carne" },
    "ميكس لحوم": { "en": "Meat Lovers Mix", "fr": "Mélange de Viandes", "ru": "Мясное ассорти", "it": "Misto Carne" },
    "ببرونى": { "en": "Pepperoni Pizza", "fr": "Pizza Pepperoni", "ru": "Пицца Пепперони", "it": "Pizza Pepperoni" },
    "ببروني": { "en": "Pepperoni Pizza", "fr": "Pizza Pepperoni", "ru": "Пицца Пепперони", "it": "Pizza Pepperoni" },
    "خضار": { "en": "Vegetarian Pizza", "fr": "Pizza Végétarienne", "ru": "Вегетарианская пицца", "it": "Pizza Vegetariana" },
    "كريب شاورما": { "en": "Shawarma Crepe", "fr": "Crêpe Chawarma", "ru": "Креп с шаурмой", "it": "Crepe Shawarma" },
    "كريب استربس": { "en": "Strips Crepe", "fr": "Crêpe Tenders", "ru": "Креп со стрипсами", "it": "Crepe Strips" },
    "كريب شيش": { "en": "Shish Tawook Crepe", "fr": "Crêpe Chich Taouk", "ru": "Креп с шиш-тауком", "it": "Crepe Shish Taouk" },
    "كريب كفته": { "en": "Kofta Crepe", "fr": "Crêpe Kofta", "ru": "Креп с люля-кебабом", "it": "Crepe Kofta" },
    "كريب كفتة": { "en": "Kofta Crepe", "fr": "Crêpe Kofta", "ru": "Креп с люля-кебабом", "it": "Crepe Kofta" },
    "كريب مكس فراخ": { "en": "Chicken Mix Crepe", "fr": "Crêpe Poulet Mixte", "ru": "Креп куриный микс", "it": "Crepe Misto Pollo" },
    "كريب سجق": { "en": "Sausage Crepe", "fr": "Crêpe Saucisse", "ru": "Креп с колбасками", "it": "Crepe Salsiccia" },
    "كريب سوسيس": { "en": "Hot Dog Crepe", "fr": "Crêpe Saucisse Hot-dog", "ru": "Креп с сосисками", "it": "Crepe Wurstel" },
    "كريب ميكس جبن": { "en": "Four Cheese Crepe", "fr": "Crêpe Quatre Fromages", "ru": "Креп сырный микс", "it": "Crepe Ai Formaggi" },
    "كريب سوبر صاج": { "en": "Super Saj Crepe", "fr": "Crêpe Super Saj", "ru": "Креп Супер Садж", "it": "Crepe Super Saj" },
    "كفته": { "en": "Grilled Kofta", "fr": "Kofta Grillée", "ru": "Люля-кебаб на гриле", "it": "Kofta Grigliata" },
    "كفتة": { "en": "Grilled Kofta", "fr": "Kofta Grillée", "ru": "Люля-кебаб на гриле", "it": "Kofta Grigliata" },
    "شيش": { "en": "Shish Tawook", "fr": "Chich Taouk", "ru": "Шиш-таук", "it": "Shish Taouk" },
    "كبده رده": { "en": "Bran Fried Liver", "fr": "Foie Pané au Son", "ru": "Печень в отрубях", "it": "Fegato con Crusca" },
    "كبدة ردة": { "en": "Bran Fried Liver", "fr": "Foie Pané au Son", "ru": "Печень в отрубях", "it": "Fegato con Crusca" },
    "كبده اسكندراني": { "en": "Alexandrian Liver", "fr": "Foie Alexandrin", "ru": "Печень по-александрийски", "it": "Fegato all'Alessandrina" },
    "كبدة اسكندراني": { "en": "Alexandrian Liver", "fr": "Foie Alexandrin", "ru": "Печень по-александрийски", "it": "Fegato all'Alessandrina" },
    "سجق اسكندراني": { "en": "Alexandrian Sausage", "fr": "Saucisse Alexandrine", "ru": "Колбаски по-александрийски", "it": "Salsiccia all'Alessandrina" },
    "استربس": { "en": "Chicken Strips", "fr": "Tenders de Poulet", "ru": "Куриные стрипсы", "it": "Strips di Pollo" },
    "تشيكن تشيز": { "en": "Chicken Cheese Sandwich", "fr": "Sandwich Poulet Fromage", "ru": "Чикен Чиз сэндвич", "it": "Panino Pollo e Formaggio" },
    "ستيك برجر سنجل": { "en": "Single Steak Burger", "fr": "Steak Burger Simple", "ru": "Стейк Бургер одинарный", "it": "Single Steak Burger" },
    "ستيك برجر دبل": { "en": "Double Steak Burger", "fr": "Steak Burger Double", "ru": "Стейк Бургер двойной", "it": "Double Steak Burger" },
    "حواوشي لحمه": { "en": "Beef Hawawshi", "fr": "Hawawshi à la Viande", "ru": "Хававши с мясом", "it": "Hawawshi di Carne" },
    "حواوشي لحمة": { "en": "Beef Hawawshi", "fr": "Hawawshi à la Viande", "ru": "Хававши с мясом", "it": "Hawawshi di Carne" },
    "حواوشي موتزاريلا": { "en": "Mozzarella Hawawshi", "fr": "Hawawshi Mozzarella", "ru": "Хававши с моцареллой", "it": "Hawawshi con Mozzarella" },
    "حواوشي ميكس جبن": { "en": "Mix Cheese Hawawshi", "fr": "Hawawshi Fromages Mixtes", "ru": "Хававши с сырным миксом", "it": "Hawawshi Formaggi Misti" },
    "ريزو شاورما": { "en": "Shawarma Rizo Bowl", "fr": "Bol Rizo Chawarma", "ru": "Ризо боул с шаурмой", "it": "Rizo Bowl Shawarma" },
    "ريزو تشيكن": { "en": "Chicken Rizo Bowl", "fr": "Bol Rizo Poulet", "ru": "Ризо боул с курицей", "it": "Rizo Bowl Pollo" },
    "ريزو بيف": { "en": "Beef Rizo Bowl", "fr": "Bol Rizo Bœuf", "ru": "Ризо боул с говядиной", "it": "Rizo Bowl Manzo" },
    "سوري شاورما": { "en": "Syrian Shawarma Wrap", "fr": "Wrap Chawarma Syrien", "ru": "Сирийский рап с шаурмой", "it": "Wrap Shawarma Siriano" },
    "سوري كفته": { "en": "Syrian Kofta Wrap", "fr": "Wrap Kofta Syrien", "ru": "Сирийский рап с люля", "it": "Wrap Kofta Siriano" },
    "سوري كفتة": { "en": "Syrian Kofta Wrap", "fr": "Wrap Kofta Syrien", "ru": "Сирийский рап с люля", "it": "Wrap Kofta Siriano" },
    "سوري بانية بلدي": { "en": "Syrian Pane Wrap", "fr": "Wrap Pané Syrien", "ru": "Сирийский рап с панированным филе", "it": "Wrap Panato Siriano" },
    "سوري بانيه بلدي": { "en": "Syrian Pane Wrap", "fr": "Wrap Pané Syrien", "ru": "Сирийский рап с панированным филе", "it": "Wrap Panato Siriano" },
    "سوري شيش": { "en": "Syrian Shish Wrap", "fr": "Wrap Chich Syrien", "ru": "Сирийский рап с шиш-тауком", "it": "Wrap Shish Siriano" },
    "سوري بطاطس": { "en": "Syrian Fries Wrap", "fr": "Wrap Frites Syrien", "ru": "Сирийский рап с картофелем", "it": "Wrap Patatine Siriano" },
    "بطاطس صغير": { "en": "Small French Fries", "fr": "Petite Portion de Frites", "ru": "Маленький картофель фри", "it": "Patatine Fritte Piccole" },
    "بطاطس كبير": { "en": "Large French Fries", "fr": "Grande Portion de Frites", "ru": "Большой картофель фри", "it": "Patatine Fritte Grandi" },
    "حشو اطراف بيتزا": { "en": "Stuffed Crust Edge", "fr": "Croûte Farcie", "ru": "Сырный бортик", "it": "Bordo Ripieno" },
    "تشيكن فرايز": { "en": "Chicken Fries", "fr": "Frites au Poulet", "ru": "Куриные палочки фри", "it": "Chicken Fries" },
    "برجر فرايز": { "en": "Burger Fries Box", "fr": "Frites Burger", "ru": "Картофель фри с бургером", "it": "Burger Fries" },
    "تشيز فرايز صوص": { "en": "Cheese Fries with Sauce", "fr": "Frites Sauce Fromage", "ru": "Картофель фри с сырным соусом", "it": "Patatine al Formaggio" },
    "برجر إضافي": { "en": "Extra Burger Patty", "fr": "Steak Haché Supplémentaire", "ru": "Дополнительная котлета", "it": "Patty Burger Extra" },
    "برجر اضافي": { "en": "Extra Burger Patty", "fr": "Steak Haché Supplémentaire", "ru": "Дополнительная котлета", "it": "Patty Burger Extra" },
    "فراخ استربس (إضافة)": { "en": "Extra Chicken Strips", "fr": "Tenders Supplémentaires", "ru": "Дополнительные стрипсы", "it": "Strips di Pollo Extra" },
    "فراخ استربس": { "en": "Chicken Strips", "fr": "Tenders de Poulet", "ru": "Куриные стрипсы", "it": "Strips di Pollo" },
    "بيف مدخن": { "en": "Smoked Beef", "fr": "Bœuf Fumé", "ru": "Копченая говядина", "it": "Manzo Affumicato" },
    "أرز ريزو": { "en": "Rizo Rice", "fr": "Riz Rizo", "ru": "Рис Ризо", "it": "Riso Rizo" },
    "ارز ريزو": { "en": "Rizo Rice", "fr": "Riz Rizo", "ru": "Рис Ризо", "it": "Riso Rizo" },
    "عيش فرنساوي": { "en": "French Baguette Bread", "fr": "Pain Baguette Française", "ru": "Французский багет", "it": "Baguette Francese" },
    "عيش بلدي": { "en": "Baladi Pita Bread", "fr": "Pain Pita Baladi", "ru": "Традиционная лепешка", "it": "Pane Pita Baladi" },
    "وجبه عربي": { "en": "Arabic Meal", "fr": "Menu Arabe", "ru": "Арабский обед", "it": "Pasto Arabo" },
    "وجبة عربي": { "en": "Arabic Meal", "fr": "Menu Arabe", "ru": "Арабский обед", "it": "Pasto Arabo" },
    "وجبه فرايد تشكن": { "en": "Fried Chicken Meal", "fr": "Menu Poulet Frit", "ru": "Обед с жареной курицей", "it": "Pasto Pollo Fritto" },
    "وجبة فرايد تشيكن": { "en": "Fried Chicken Meal", "fr": "Menu Poulet Frit", "ru": "Обед с жареной курицей", "it": "Pasto Pollo Fritto" },
    "وجبه مسحب": { "en": "Musahab Chicken Meal", "fr": "Menu Poulet Musahab", "ru": "Обед Мусахаб", "it": "Pasto Pollo Musahab" },
    "وجبة مسحب": { "en": "Musahab Chicken Meal", "fr": "Menu Poulet Musahab", "ru": "Обед Мусахаб", "it": "Pasto Pollo Musahab" },
    "سموكيد برجر": { "en": "Smoked Burger", "fr": "Burger Fumé", "ru": "Копченый бургер", "it": "Burger Affumicato" },
    "خصم 15% على جميع الوجبات لفترة محدودة": { "en": "15% off all meals for a limited time", "fr": "15% de réduction sur tous les repas pour une durée limitée", "ru": "Скидка 15% на все блюда на ограниченное время", "it": "15% di sconto su tutti i piatti per un periodo limitato" },
    "صوص رانش فاخر": { "en": "Ranch Sauce", "fr": "Sauce Ranch", "ru": "Соус Ранч", "it": "Salsa Ranch" },
    "صوص فاير حار وسبايسي": { "en": "Fire Spicy Sauce", "fr": "Sauce Épicée Fire", "ru": "Огненно-острый соус", "it": "Salsa Piccante Fire" },
    "صوص باربيكيو مدخن": { "en": "Smoky BBQ Sauce", "fr": "Sauce BBQ Fumée", "ru": "Копченый соус барбекю", "it": "Salsa BBQ Affumicata" },
    "صوص البيج تيستي الشهير": { "en": "Famous Big Tasty Sauce", "fr": "Célèbre Sauce Big Tasty", "ru": "Знаменитый соус Биг Тейсти", "it": "Famosa Salsa Big Tasty" },
    "صوص ثاوزند آيلاند (ألف جزيرة)": { "en": "Thousand Island Sauce", "fr": "Sauce Thousand Island", "ru": "Соус Тысяча островов", "it": "Salsa Thousand Island" },
    "مايونيز كريمي": { "en": "Creamy Mayonnaise", "fr": "Mayonnaise Crémeuse", "ru": "Сливочный майонез", "it": "Maionese Cremosa" },
    "كاتشب طماطم": { "en": "Tomato Ketchup", "fr": "Ketchup de Tomates", "ru": "Томатный кетчуп", "it": "Ketchup di Pomodoro" },
    "تومية سورية كلاسيك": { "en": "Classic Syrian Garlic Sauce", "fr": "Crème d'Ail Syrienne Classique", "ru": "Классический чесночный соус", "it": "Salsa all'Aglio Siriana" },
    "تومية سبايسي حارة": { "en": "Spicy Syrian Garlic Sauce", "fr": "Crème d'Ail Épicée", "ru": "Острый чесночный соус", "it": "Salsa all'Aglio Piccante" },
    "سلطة كول سلو منعشة": { "en": "Fresh Coleslaw Salad", "fr": "Salade Coleslaw Fraîche", "ru": "Свежий салат коулслоу", "it": "Insalata Coleslaw Fresca" },
    "بيبسي كانز بارد": { "en": "Chilled Pepsi Can", "fr": "Canette Pepsi Fraîche", "ru": "Холодная банка Пепси", "it": "Lattina Pepsi Fredda" },
    "ماكسي كولا": { "en": "Maxi Cola", "fr": "Maxi Cola", "ru": "Макси Кола", "it": "Maxi Cola" },
    "في كولا (V-Cola)": { "en": "V-Cola", "fr": "V-Cola", "ru": "V-Кола", "it": "V-Cola" },
    "ستينج باور إنيرجي": { "en": "Sting Energy Drink", "fr": "Boisson Énergisante Sting", "ru": "Энергетик Sting", "it": "Energy Drink Sting" },
    "فيوري بارد": { "en": "Chilled Fury", "fr": "Fury Frais", "ru": "Холодный Fury", "it": "Fury Freddo" },
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
    "search_results_for": {"ar":"نتائج البحث عن","en":"Search results for"},
    "sec_featured_items": {"ar":"الأكثر مبيعاً","en":"Best Sellers"},
    "search_no_results": {"ar":"لا توجد أصناف مطابقة","en":"No matching items found"},
    "search_try_other": {"ar":"جرب البحث بكلمة أخرى أو تصفح باقي الأقسام","en":"Try searching with other keywords or browse categories"},
    "badge_featured": {"ar":"مميز","en":"Featured"},
    "val_base_price": {
        "ar": "السعر الأساسي",
        "en": "Base Price",
        "fr": "Prix de base",
        "ru": "Базовая цена",
        "it": "Prezzo base"
    },
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
        "ar": "تخصيص",
        "en": "Customize",
        "fr": "Personnaliser",
        "ru": "Настроить",
        "it": "Personalizza"
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
    "cart_empty_title": { "ar": "سلتك فارغة حالياً", "en": "Your cart is empty" },
    "menu_sound": { "ar": "المؤثرات الصوتية", "en": "Sound Effects" },
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
        "account_qr_title": {
        "ar": "رمز الاستجابة السريعة (QR)",
        "en": "QR Menu Code",
        "fr": "Code QR du Menu",
        "ru": "QR-код меню",
        "it": "Codice QR del Menu"
    },
    "account_qr_sub": {
        "ar": "عرض ومسح كود المنيو مع الشيف هاربي",
        "en": "View and scan menu with Chef Harpy",
        "fr": "Afficher et scanner avec Chef Harpy",
        "ru": "Посмотреть и отсканировать меню",
        "it": "Visualizza e scansiona il menu con Chef Harpy"
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
    },
    // ── Header & Live Status ──
    "status_open_now": {
        "ar": "مفتوح الآن",
        "en": "Open Now"
    },
    "status_closed_now": {
        "ar": "مغلق الآن",
        "en": "Closed Now"
    },
    "status_open_banner": {
        "ar": "نستقبل طلباتكم الآن بكل حب",
        "en": "We are happily taking your orders now"
    },
    "status_closed_banner": {
        "ar": "المطعم مغلق حالياً عن استقبال الطلبات",
        "en": "The restaurant is currently closed for orders"
    },
    "search_input_ph": {
        "ar": "ابحث في المنيو (مثال: برجر، وجبات، صوص)",
        "en": "Search menu (e.g. burger, meal, sauce)"
    },

    // ── Section 2: Portfolio / About ──
    "portfolio_rating_label": {
        "ar": "تقييم العملاء",
        "en": "Customer Rating"
    },
    "portfolio_eta_label": {
        "ar": "الوقت المتوقع للتوصيل",
        "en": "Estimated Delivery"
    },
    "portfolio_about_title": {
        "ar": "عن المطعم",
        "en": "About Restaurant"
    },
    "portfolio_about_default": {
        "ar": "في مطعمنا بنقدملك طعم أصيل ووصفات مميزة بأجود المكونات وبدون أي تنازلات على الجودة. كل وجبة بتحكي قصة نكهة من قلب المطبخ.",
        "en": "We offer authentic flavors and special recipes crafted with the finest ingredients, with zero compromise on quality."
    },
    "portfolio_fresh_title": {
        "ar": "طازج يوميًا",
        "en": "Fresh Daily"
    },
    "portfolio_fresh_sub": {
        "ar": "بمكونات عالية الجودة",
        "en": "Finest quality ingredients"
    },
    "portfolio_rating_stat": {
        "ar": "تقييم 4.8",
        "en": "4.8 Rating"
    },
    "portfolio_rating_sub": {
        "ar": "من عملائنا الكرام",
        "en": "From our valued guests"
    },
    "portfolio_call_btn": {
        "ar": "اتصال",
        "en": "Call Us"
    },
    "portfolio_call_sub": {
        "ar": "للاستفسار والحجز",
        "en": "Inquiries & Reservations"
    },
    "portfolio_wa_btn": {
        "ar": "تواصل عبر واتساب",
        "en": "WhatsApp Us"
    },
    "portfolio_wa_sub": {
        "ar": "رد سريع خلال دقائق",
        "en": "Fast reply in minutes"
    },
    "portfolio_address_default": {
        "ar": "العنوان متاح عبر خدمة التوصيل والاستلام من الفرع",
        "en": "Address available for delivery & branch pickup"
    },
    "portfolio_social_follow": {
        "ar": "تابعنا على السوشيال ميديا",
        "en": "Follow us on social media"
    },
    "portfolio_order_now": {
        "ar": "تصفح القائمة واطلب الآن",
        "en": "Browse Menu & Order Now"
    },
    "social_facebook": {
        "ar": "فيسبوك",
        "en": "Facebook"
    },
    "social_instagram": {
        "ar": "انستجرام",
        "en": "Instagram"
    },
    "social_tiktok": {
        "ar": "تيك توك",
        "en": "TikTok"
    },

    // ── Section 3: Orders / Tracking ──
    "orders_main_title": {
        "ar": "طلباتي والتتبع",
        "en": "My Orders & Tracking"
    },
    "orders_main_sub": {
        "ar": "متابعة حالة طلبك الحالية وسجل طلباتك السابقة",
        "en": "Live order tracking and past orders history"
    },
    "orders_badge_live": {
        "ar": "طلبك قيد التنفيذ",
        "en": "Order in Progress"
    },
    "orders_cancel_tooltip": {
        "ar": "إخفاء ومسح الطلب من هاتفي",
        "en": "Dismiss active order from my phone"
    },
    "orders_eta_title": {
        "ar": "الوقت التقديري للوصول",
        "en": "Estimated Arrival Time"
    },
    "orders_items_heading": {
        "ar": "تفاصيل الأصناف:",
        "en": "Order Items:"
    },
    "orders_total_due": {
        "ar": "المبلغ الإجمالي المطلوب:",
        "en": "Total Amount Due:"
    },
    "orders_wa_support": {
        "ar": "تواصل مع المطعم عبر واتساب",
        "en": "Contact Restaurant on WhatsApp"
    },
    "btn_call": {
        "ar": "اتصال",
        "en": "Call"
    },
    "orders_history_title": {
        "ar": "سجل طلباتك السابقة",
        "en": "Previous Orders"
    },
    "orders_history_hint": {
        "ar": "يمكنك إعادة طلب نفس الوجبة بنقرة واحدة!",
        "en": "Reorder your favorites in one click!"
    },
    "btn_browse_menu_order": {
        "ar": "تصفح المنيو واطلب الآن",
        "en": "Browse Menu & Order Now"
    },
    "eta_title_dinein": {
        "ar": "خدمة الصالة والمائدة",
        "en": "Dine-In Table Service"
    },
    "eta_title_takeaway": {
        "ar": "وقت التجهيز للاستلام",
        "en": "Estimated Pickup Time"
    },
    "eta_title_delivery": {
        "ar": "الوقت التقديري للوصول",
        "en": "Estimated Arrival Time"
    },
    "service_location": {
        "ar": "مكان الخدمة",
        "en": "Service Location"
    },
    "pickup_location": {
        "ar": "مكان الاستلام",
        "en": "Pickup Location"
    },
    "pickup_counter": {
        "ar": "كاونتر فرع المطعم الرئيسي مباشرة",
        "en": "Directly at restaurant main counter"
    },
    "delivery_address_label": {
        "ar": "عنوان التوصيل",
        "en": "Delivery Address"
    },
    "table_number_prefix": {
        "ar": "طاولة رقم",
        "en": "Table #"
    },
    "default_address": {
        "ar": "العنوان المسجل للطلب",
        "en": "Registered Order Address"
    },
    "past_order": {
        "ar": "طلب سابق",
        "en": "Past Order"
    },
    "desc_pending_dinein": {
        "ar": "تم تسجيل طلبك وتوجيهه إلى مطبخ الصالة، جاري التأكيد.",
        "en": "Your order has been recorded and sent to the kitchen."
    },
    "desc_pending_takeaway": {
        "ar": "تم تسجيل طلبك للاستلام من الفرع، وسنبدأ تحضيره طازجاً فوراً.",
        "en": "Your order is received and preparation for pickup will begin shortly."
    },
    "desc_pending_delivery": {
        "ar": "تم استلام طلبك بنجاح وهو قيد المراجعة في المطعم الآن.",
        "en": "Your order has been received and is being reviewed by the restaurant."
    },
    "desc_prep_dinein": {
        "ar": "طهاة المطعم يجهزون وجبتك الساخنة الآن لتقديمها لطاولتك.",
        "en": "Chefs are preparing your hot meal to serve at your table."
    },
    "desc_prep_takeaway": {
        "ar": "جاري تحضير طلبك وتعليبه بعناية ليكون ساخناً وجاهزاً فور وصولك.",
        "en": "Your order is being carefully prepared and packaged for pickup."
    },
    "desc_prep_delivery": {
        "ar": "طهاة المطعم يجهزون وجبتك الطازجة الآن بأعلى معايير الجودة.",
        "en": "Chefs are preparing your fresh meal with top quality standards."
    },
    "desc_out_dinein": {
        "ar": "وجبتك جاهزة تماماً! طاقم الخدمة يقدمها الآن إلى طاولتك.",
        "en": "Your meal is ready! Staff is now serving it to your table."
    },
    "desc_out_takeaway": {
        "ar": "طلبك جاهز تماماً الآن على كاونتر الاستلام بالفرع، تفضل بالاستلام.",
        "en": "Your order is ready at the branch counter! Please pick it up."
    },
    "desc_out_delivery": {
        "ar": "الكابتن استلم وجبتك وهو في الطريق إلى عنوانك الآن.",
        "en": "The courier picked up your order and is on the way to you."
    },
    "desc_done_dinein": {
        "ar": "بالهناء والشفاء! نتمنى لك تجربة طعام رائعة في ضيافتنا.",
        "en": "Enjoy your meal! We hope you have a wonderful dining experience."
    },
    "desc_done_takeaway": {
        "ar": "تم تسليمك الطلب بالفرع بنجاح، بالهناء والشفاء وسعداء بزيارتك.",
        "en": "Order picked up successfully! Enjoy your meal, happy to serve you."
    },
    "desc_done_delivery": {
        "ar": "تم تسليم الطلب بنجاح إلى باب منزلك! بالهناء والشفاء.",
        "en": "Order delivered successfully to your doorstep! Enjoy your meal."
    },
    "desc_cancelled": {
        "ar": "تم إلغاء هذا الطلب من قِبل إدارة المطعم.",
        "en": "This order was cancelled by the restaurant management."
    },

    // ── Section 4: Cart & Checkout Drawer ──
    "cart_subtotal_now": {
        "ar": "المجموع الحالي:",
        "en": "Current Subtotal:"
    },
    "cart_proceed_step2": {
        "ar": "متابعة لاختيار الاستلام والدفع",
        "en": "Proceed to Details & Payment"
    },
    "cart_back_btn": {
        "ar": "العودة لتعديل الأصناف والسلة",
        "en": "Back to edit cart items"
    },
    "fulfillment_heading": {
        "ar": "طريقة استلام الطلب:",
        "en": "Fulfillment Method:"
    },
    "btn_collapse_save": {
        "ar": "حفظ وإغلاق ✓",
        "en": "Save & Close ✓"
    },
    "field_name_short": {
        "ar": "الاسم",
        "en": "Name"
    },
    "field_name_short_placeholder": {
        "ar": "اسمك",
        "en": "Your Name"
    },
    "field_phone_short": {
        "ar": "رقم الهاتف",
        "en": "Phone"
    },
    "field_address_detailed": {
        "ar": "عنوان التوصيل بالتفصيل",
        "en": "Detailed Delivery Address"
    },
    "field_address_detailed_ph": {
        "ar": "المنطقة، اسم الشارع، رقم العمارة والشقة أو علامة مميزة",
        "en": "Area, street name, building & apartment or landmark"
    },
    "takeaway_banner_title": {
        "ar": "استلام من فرع المطعم (بدون رسوم توصيل)",
        "en": "Branch Pickup (No Delivery Fee)"
    },
    "takeaway_banner_desc": {
        "ar": "تجهيز طازج لتستلمه فور وصولك.",
        "en": "Freshly prepared for you to pick up upon arrival."
    },
    "wallet_details_title": {
        "ar": "بيانات تحويل المبلغ",
        "en": "Transfer Details"
    },
    "wallet_copy_btn": {
        "ar": "نسخ الرقم",
        "en": "Copy Number"
    },
    "wallet_copied": {
        "ar": "تم النسخ!",
        "en": "Copied!"
    },
    "wallet_amount_label": {
        "ar": "المبلغ المطلوب تحويله:",
        "en": "Amount to transfer:"
    },
    "receipt_dropzone_title": {
        "ar": "إرفاق إيصال / سكرين شوت التحويل",
        "en": "Attach Transfer Receipt / Screenshot"
    },
    "receipt_required_tag": {
        "ar": "مطلوب لتأكيد الدفع",
        "en": "Required for payment"
    },
    "receipt_dropzone_desc": {
        "ar": "انقر هنا لرفع أو تصوير إيصال فودافون كاش / إنستاباي",
        "en": "Tap here to upload or capture payment receipt"
    },
    "summary_items_total": {
        "ar": "إجمالي الأصناف:",
        "en": "Items Total:"
    },
    "summary_spend_discount": {
        "ar": "خصم طلب مميز",
        "en": "Special Order Discount"
    },
    "summary_promo_discount": {
        "ar": "كوبون الخصم",
        "en": "Coupon Discount"
    },
    "summary_wallet_discount": {
        "ar": "خصم الدفع الإلكتروني",
        "en": "Online Payment Discount"
    },
    "summary_delivery_fee": {
        "ar": "خدمة التوصيل:",
        "en": "Delivery Fee:"
    },
    "btn_checkout": {
        "ar": "تأكيد وإرسال الطلب",
        "en": "Confirm & Send Order"
    },

    // ── Section 5: Account View & Drawer ──
    "account_guest_title": {
        "ar": "عميلنا العزيز",
        "en": "Dear Guest"
    },
    "account_guest_phone": {
        "ar": "لم تسجل رقم هاتفك بعد",
        "en": "Phone not registered yet"
    },
    "account_btn_save": {
        "ar": "حفظ التعديلات",
        "en": "Save Changes"
    },
    "account_btn_cancel": {
        "ar": "إلغاء",
        "en": "Cancel"
    },
    "account_theme_light": {
        "ar": "الوضع النهاري (Light Mode)",
        "en": "Light Mode"
    },
    "account_theme_dark": {
        "ar": "الوضع الداكن (Dark Mode)",
        "en": "Dark Mode"
    },
    "account_theme_btn_dark": {
        "ar": "تفعيل الداكن",
        "en": "Enable Dark"
    },
    "account_theme_btn_light": {
        "ar": "تفعيل الفاتح",
        "en": "Enable Light"
    },
    "account_sound_sub": {
        "ar": "أصوات التفاعل والإشعارات الحية",
        "en": "Interactive sounds & live alerts"
    },
    "account_sound_on": {
        "ar": "صوت مفعل",
        "en": "Sound On"
    },
    "account_sound_off": {
        "ar": "صوت مكتوم",
        "en": "Sound Muted"
    },
    "account_wa_sub": {
        "ar": "تواصل مع إدارة المطعم مباشرة عبر واتساب",
        "en": "Contact restaurant management directly on WhatsApp"
    },
    "account_share_sub": {
        "ar": "إرسال رابط منيو المطعم عبر تطبيقات التواصل",
        "en": "Share menu link via social apps"
    },
    "account_drawer_title": {
        "ar": "حسابي ومعلوماتي",
        "en": "My Account & Info"
    },
    "account_menu_last_order": {
        "ar": "متابعة طلبك الأخير",
        "en": "Track Last Order"
    },
    "account_menu_last_order_sub": {
        "ar": "عرض حالة التوصيل والتفاصيل",
        "en": "View delivery status & details"
    },
    "account_menu_fav": {
        "ar": "الأصناف المفضلة لديك",
        "en": "Your Favorite Items"
    },
    "account_menu_fav_saved": {
        "ar": "أصناف محفوظة",
        "en": "saved items"
    },
    "account_menu_branch": {
        "ar": "تغيير فرع المطعم",
        "en": "Change Restaurant Branch"
    },
    "account_menu_install": {
        "ar": "تثبيت التطبيق على جهازك",
        "en": "Install App on Device"
    },
    "account_menu_install_sub": {
        "ar": "وصول أسرع وتصفح يشبه التطبيقات الأصلية",
        "en": "Faster access and native app feel"
    },

    // ── Modals & Overlays ──
    "qr_modal_title": {
        "ar": "رمز المنيو الرقمي (QR)",
        "en": "Digital Menu QR Code"
    },
    "qr_modal_desc": {
        "ar": "امسح رمز الـ QR بكاميرا الهاتف لفتح المنيو ومشاركته مع الأصدقاء فوراً",
        "en": "Scan this QR code with your phone camera to open and share menu instantly"
    },
    "qr_share_btn": {
        "ar": "مشاركة رابط المنيو",
        "en": "Share Menu Link"
    },
    "qr_copy_btn": {
        "ar": "نسخ الرابط إلى الحافظة",
        "en": "Copy Link to Clipboard"
    },
    "branch_picker_title": {
        "ar": "اختر الفرع الأقرب إليك",
        "en": "Select Nearest Branch"
    },
    "branch_picker_sub": {
        "ar": "يرجى تحديد فرع المطعم لطلب الوجبات واستلامها أو توصيلها بأسرع وقت",
        "en": "Please choose a branch for fastest delivery or takeaway"
    },
    "customizer_title": {
        "ar": "تخصيص الوجبة",
        "en": "Customize Meal"
    },
    "customizer_desc": {
        "ar": "اختر الحجم والإضافات المفضلة",
        "en": "Choose size & favorite add-ons"
    },
    "customizer_size_title": {
        "ar": "الحجم / الكمية",
        "en": "Size / Portion"
    },
    "badge_required": {
        "ar": "إجباري",
        "en": "Required"
    },
    "customizer_addons_title": {
        "ar": "إضافات مميزة",
        "en": "Special Add-ons"
    },
    "badge_optional": {
        "ar": "اختياري",
        "en": "Optional"
    },
    "customizer_notes_title": {
        "ar": "ملاحظات خاصة للشيف",
        "en": "Special Notes for the Chef"
    },
    "customizer_notes_ph": {
        "ar": "مثال: بدون بصل، صوص زيادة، حار جداً",
        "en": "e.g. No onion, extra sauce, very spicy"
    },
    "story_cta": {
        "ar": "اطلب هذا العرض الآن",
        "en": "Order This Offer Now"
    },
    "confirm_dismiss_title": {
        "ar": "مسح الطلب من السجل",
        "en": "Dismiss Order from History"
    },
    "confirm_dismiss_msg": {
        "ar": "هل تريد إخفاء ومسح هذا الطلب من هاتفك؟\n* لن يتم حذفه من سجل المطعم.",
        "en": "Do you want to dismiss this order from your device?\n* It will remain in restaurant records."
    },
    "confirm_dismiss_accept": {
        "ar": "مسح من هاتفي",
        "en": "Dismiss from phone"
    },
    "confirm_dismiss_cancel": {
        "ar": "إلغاء وتراجع",
        "en": "Cancel"
    },
    "store_closed_title": {
        "ar": "المطعم متوقف حالياً عن استقبال الطلبات",
        "en": "The restaurant is currently closed for orders"
    },
    "store_closed_msg": {
        "ar": "عذراً، المطعم لا يستقبل طلبات جديدة في الوقت الحالي. يمكنك تصفح قائمة الطعام والأسعار بحرية، وسنعاود استقبال الطلبات قريباً!",
        "en": "Sorry, we are not taking new orders right now. You can freely browse our menu and prices. We will reopen shortly!"
    },
    "store_closed_browse": {
        "ar": "تصفح قائمة الطعام والأسعار",
        "en": "Browse Menu & Prices"
    },
    "store_closed_wa": {
        "ar": "تواصل مع المطعم عبر الواتساب",
        "en": "Contact Restaurant on WhatsApp"
    },
    "sub_suspended_title": {
        "ar": "عفواً، الخدمة متوقفة مؤقتاً",
        "en": "Service Temporarily Unavailable"
    },
    "sub_suspended_desc": {
        "ar": "قائمة هذا المطعم غير متاحة حالياً لتلقي طلبات الأونلاين أو جاري تجديد الاشتراك.",
        "en": "This restaurant menu is currently unavailable for online ordering or undergoing subscription renewal."
    },
    "sub_suspended_contact": {
        "ar": "تواصل مع المطعم عبر الواتساب",
        "en": "Contact Restaurant on WhatsApp"
    }

};


  function normalizeArabicText(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/[\u064B-\u065F\u0640]/g, '') // strip tashkeel + tatweel
      .replace(/[إأآا]/g, 'ا')
      .replace(/[ةه]/g, 'ه')
      .replace(/[يى]/g, 'ي')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

    function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

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

      if (!this._transCache) this._transCache = {};
      const cacheKey = curLang + ':' + text;
      if (this._transCache[cacheKey]) return this._transCache[cacheKey];

      // Extract emojis and clean text
      const emojiMatch = text.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu);
      const clean = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, '').trim();

      if (!clean) return text;

      // 1. Direct exact match
      if (COMMON_TERMS[clean] && COMMON_TERMS[clean][curLang]) {
        const res = COMMON_TERMS[clean][curLang] + (emojiMatch ? ' ' + emojiMatch.join('') : '');
        this._transCache[cacheKey] = res;
        return res;
      }

      // 2. Case-insensitive exact match
      const lower = clean.toLowerCase();
      for (const [k, v] of Object.entries(COMMON_TERMS)) {
        if (k.toLowerCase() === lower && v[curLang]) {
          const res = v[curLang] + (emojiMatch ? ' ' + emojiMatch.join('') : '');
          this._transCache[cacheKey] = res;
          return res;
        }
      }

      // 3. Normalized Arabic match (handles tatweel, diacritics, alef/yeh/teh variants)
      if (!this._normMap) {
        this._normMap = new Map();
        for (const [k, v] of Object.entries(COMMON_TERMS)) {
          this._normMap.set(normalizeArabicText(k), v);
        }
      }

      const cleanNorm = normalizeArabicText(clean);
      if (this._normMap.has(cleanNorm) && this._normMap.get(cleanNorm)[curLang]) {
        const res = this._normMap.get(cleanNorm)[curLang] + (emojiMatch ? ' ' + emojiMatch.join('') : '');
        this._transCache[cacheKey] = res;
        return res;
      }

      // 4. Definite article strip ("ال")
      if (cleanNorm.startsWith('ال') && cleanNorm.length > 3) {
        const strippedNorm = cleanNorm.slice(2);
        if (this._normMap.has(strippedNorm) && this._normMap.get(strippedNorm)[curLang]) {
          const res = this._normMap.get(strippedNorm)[curLang] + (emojiMatch ? ' ' + emojiMatch.join('') : '');
          this._transCache[cacheKey] = res;
          return res;
        }
      }

      // 5. Intelligent Multi-phrase & Token Replacer
      if (!this._sortedTermsList) {
        this._sortedTermsList = Object.keys(COMMON_TERMS)
          .filter(k => k.trim().length >= 2)
          .sort((a, b) => b.length - a.length);
      }

      let remaining = clean;
      let tokenCounter = 0;
      const tokenMap = new Map();

      for (const phrase of this._sortedTermsList) {
        const v = COMMON_TERMS[phrase];
        if (!v || !v[curLang]) continue;

        const escPhrase = escapeRegExp(phrase);
        const regex = new RegExp('(^|[\\s+،,/\\-])' + escPhrase + '($|[\\s+،,/\\-])', 'gi');
        if (regex.test(remaining)) {
          const placeholder = `__HTOK${tokenCounter++}__`;
          tokenMap.set(placeholder, v[curLang]);
          remaining = remaining.replace(regex, (m, p1, p2) => (p1 || '') + placeholder + (p2 || ''));
        }
      }

      // Process individual remaining words for common Arabic prefixes: "وال", "بال", "و", "ب", "ال"
      const words = remaining.split(/\s+/);
      let anyPrefixMatched = false;
      const processedWords = words.map(w => {
        if (w.startsWith('__HTOK') && w.endsWith('__')) return w;
        const wNorm = normalizeArabicText(w);

        // "وال" (and the)
        if (wNorm.startsWith('وال') && wNorm.length > 4) {
          const sub = wNorm.slice(3);
          if (this._normMap.has(sub) && this._normMap.get(sub)[curLang]) {
            anyPrefixMatched = true;
            return 'and ' + this._normMap.get(sub)[curLang];
          }
        }

        // "بال" (with the)
        if (wNorm.startsWith('بال') && wNorm.length > 4) {
          const sub = wNorm.slice(3);
          if (this._normMap.has(sub) && this._normMap.get(sub)[curLang]) {
            anyPrefixMatched = true;
            return 'with ' + this._normMap.get(sub)[curLang];
          }
        }

        // "و" (and)
        if (wNorm.startsWith('و') && wNorm.length > 3) {
          const sub = wNorm.slice(1);
          if (this._normMap.has(sub) && this._normMap.get(sub)[curLang]) {
            anyPrefixMatched = true;
            return 'and ' + this._normMap.get(sub)[curLang];
          }
        }

        // "ب" (with)
        if (wNorm.startsWith('ب') && wNorm.length > 3) {
          const sub = wNorm.slice(1);
          if (this._normMap.has(sub) && this._normMap.get(sub)[curLang]) {
            anyPrefixMatched = true;
            return 'with ' + this._normMap.get(sub)[curLang];
          }
        }

        // "ال" (the)
        if (wNorm.startsWith('ال') && wNorm.length > 3) {
          const sub = wNorm.slice(2);
          if (this._normMap.has(sub) && this._normMap.get(sub)[curLang]) {
            anyPrefixMatched = true;
            return this._normMap.get(sub)[curLang];
          }
        }

        if (this._normMap.has(wNorm) && this._normMap.get(wNorm)[curLang]) {
          anyPrefixMatched = true;
          return this._normMap.get(wNorm)[curLang];
        }

        return w;
      });

      if (tokenCounter > 0 || anyPrefixMatched) {
        remaining = processedWords.join(' ');
        tokenMap.forEach((enVal, placeholder) => {
          remaining = remaining.split(placeholder).join(enVal);
        });

        let res = remaining
          .replace(/\s*([+،,/\\-])\s*/g, ' $1 ')
          .replace(/،/g, ', ')
          .replace(/\s+/g, ' ')
          .trim();

        res = res.replace(/\bwith\s+with\b/gi, 'with')
                 .replace(/\band\s+and\b/gi, 'and');

        if (emojiMatch) res += ' ' + emojiMatch.join('');
        this._transCache[cacheKey] = res;
        return res;
      }

      // Fallback: preserve original text safely
      this._transCache[cacheKey] = text;
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

      // 6. Update clean-language-toggle-btn to show next quick switch option
      const cleanLangBtn = document.getElementById('clean-language-toggle-btn');
      if (cleanLangBtn) {
        if (lang === 'ar') {
          cleanLangBtn.innerHTML = '<span>English 🇬🇧</span>';
        } else {
          cleanLangBtn.innerHTML = '<span>العربية 🇪🇬</span>';
        }
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
  window.t = function(key, fallback) { 
    if (key === 'currency') {
      return window.getCurrency ? window.getCurrency(fallback) : (I18n.getLanguage() === 'en' ? 'EGP' : (fallback || 'ج.م'));
    }
    return I18n.t(key, fallback); 
  };
  window.tr = function(text) { return I18n.translate(text); };

  // ── Universal Restaurant Dynamic Data Helpers ───────────────
  window.getCurrency = function(rawCurrency, lang) {
    const l = lang || (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar');
    const cur = rawCurrency || (typeof Store !== 'undefined' && Store.getSettings ? Store.getSettings().currency : '') || 'ج.م';
    if (l === 'en') {
      if (cur === 'ج.م' || cur === 'جنيه' || cur.includes('ج') || !cur.trim()) return 'EGP';
      if (cur === 'ر.س') return 'SAR';
      if (cur === 'د.إ') return 'AED';
      if (cur === 'د.ك') return 'KWD';
      return cur;
    }
    return cur;
  };

  window.getProductName = function(p, lang) {
    if (!p) return '';
    const l = lang || (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar');
    if (l === 'ar') return p.name || '';
    if (p.name_en && p.name_en.trim()) return p.name_en.trim();
    return p.name ? I18n.translate(p.name) : '';
  };

  window.getProductDesc = function(p, lang) {
    if (!p) return '';
    const l = lang || (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar');
    const rawDesc = p.desc || p.description || '';
    if (l === 'ar') return rawDesc;
    if (p.desc_en && p.desc_en.trim()) return p.desc_en.trim();
    return rawDesc ? I18n.translate(rawDesc) : '';
  };

  window.getProductCategory = function(p, lang) {
    if (!p) return '';
    const l = lang || (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar');
    const rawCat = (typeof p === 'string') ? p : (p.category || '');
    if (l === 'ar') return rawCat;
    if (typeof p === 'object' && p.category_en && p.category_en.trim()) return p.category_en.trim();
    return rawCat ? I18n.translate(rawCat) : '';
  };

  window.getProductBadge = function(p, lang) {
    if (!p) return '';
    const l = lang || (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar');
    const rawBadge = (typeof p === 'string') ? p : (p.badge || '');
    if (l === 'ar') return rawBadge;
    if (typeof p === 'object' && p.badge_en && p.badge_en.trim()) return p.badge_en.trim();
    return rawBadge ? I18n.translate(rawBadge) : '';
  };

  window.getSizeName = function(s, lang) {
    if (!s) return '';
    const l = lang || (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar');
    const rawName = (typeof s === 'string') ? s : (s.name || '');
    if (l === 'ar') return rawName;
    if (typeof s === 'object' && s.name_en && s.name_en.trim()) return s.name_en.trim();
    return rawName ? I18n.translate(rawName) : '';
  };

  window.getAddonName = function(a, lang) {
    if (!a) return '';
    const l = lang || (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar');
    const rawName = (typeof a === 'string') ? a : (a.name || '');
    if (l === 'ar') return rawName;
    if (typeof a === 'object' && a.name_en && a.name_en.trim()) return a.name_en.trim();
    return rawName ? I18n.translate(rawName) : '';
  };

  I18n.init();

})(typeof window !== 'undefined' ? window : this);