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

  const DICTIONARY = {
    // ══════ General & Brand ══════
    currency: {
      ar: 'ج.م',
      en: 'EGP',
      fr: 'EGP',
      ru: 'EGP',
      it: 'EGP'
    },
    mins: {
      ar: 'دقيقة',
      en: 'mins',
      fr: 'mins',
      ru: 'мин',
      it: 'min'
    },
    status_open: {
      ar: 'مفتوح للطلبات',
      en: 'Open for Orders',
      fr: 'Ouvert aux commandes',
      ru: 'Открыто для заказов',
      it: 'Aperto per ordini'
    },
    status_closed: {
      ar: 'مغلق حالياً',
      en: 'Currently Closed',
      fr: 'Actuellement fermé',
      ru: 'Сейчас закрыто',
      it: 'Attualmente chiuso'
    },
    branch_current: {
      ar: 'الفرع:',
      en: 'Branch:',
      fr: 'Succursale :',
      ru: 'Филиал:',
      it: 'Filiale:'
    },
    search_placeholder: {
      ar: 'ابحث عن وجبتك المفضلة...',
      en: 'Search for your favorite food...',
      fr: 'Recherchez votre plat préféré...',
      ru: 'Поиск любимого блюда...',
      it: 'Cerca il tuo piatto preferito...'
    },

    // ══════ Bottom Nav ══════
    nav_menu: {
      ar: 'المنيو',
      en: 'Menu',
      fr: 'Menu',
      ru: 'Меню',
      it: 'Menu'
    },
    nav_cart: {
      ar: 'السلة',
      en: 'Cart',
      fr: 'Panier',
      ru: 'Корзина',
      it: 'Carrello'
    },
    nav_orders: {
      ar: 'الطلبات',
      en: 'Orders',
      fr: 'Commandes',
      ru: 'Заказы',
      it: 'Ordini'
    },
    nav_account: {
      ar: 'حسابي',
      en: 'Account',
      fr: 'Compte',
      ru: 'Профиль',
      it: 'Profilo'
    },

    // ══════ Category & Discovery Chips ══════
    chip_all: {
      ar: 'كل الأصناف',
      en: 'All Items',
      fr: 'Tous les plats',
      ru: 'Все блюда',
      it: 'Tutti i piatti'
    },
    chip_popular: {
      ar: 'الأكثر طلباً',
      en: 'Popular',
      fr: 'Populaire',
      ru: 'Популярное',
      it: 'Più venduti'
    },
    chip_offers: {
      ar: 'العروض',
      en: 'Offers',
      fr: 'Offres',
      ru: 'Акции',
      it: 'Offerte'
    },
    chip_favorites: {
      ar: 'المفضلة',
      en: 'Favorites',
      fr: 'Favoris',
      ru: 'Избранное',
      it: 'Preferiti'
    },

    // ══════ Product Cards ══════
    btn_add: {
      ar: 'إضافة',
      en: 'Add',
      fr: 'Ajouter',
      ru: 'Добавить',
      it: 'Aggiungi'
    },
    btn_customize: {
      ar: 'تخصيص',
      en: 'Customize',
      fr: 'Personnaliser',
      ru: 'Настроить',
      it: 'Personalizza'
    },
    sold_out: {
      ar: 'نفد مؤقتاً',
      en: 'Sold Out',
      fr: 'Épuisé',
      ru: 'Распродано',
      it: 'Esaurito'
    },
    price_starts_from: {
      ar: 'يبدأ من',
      en: 'Starts from',
      fr: 'À partir de',
      ru: 'От',
      it: 'A partire da'
    },

    // ══════ Customizer Modal ══════
    customizer_title: {
      ar: 'تخصيص الوجبة',
      en: 'Customize Meal',
      fr: 'Personnaliser le plat',
      ru: 'Настройка блюда',
      it: 'Personalizza piatto'
    },
    customizer_size: {
      ar: 'اختر الحجم:',
      en: 'Choose Size:',
      fr: 'Choisir la taille :',
      ru: 'Выберите размер:',
      it: 'Scegli dimensione:'
    },
    customizer_addons: {
      ar: 'إضافات ومكونات إضافية:',
      en: 'Add-ons & Extras:',
      fr: 'Suppléments & Extras :',
      ru: 'Добавки и экстра:',
      it: 'Extra e ingredienti:'
    },
    customizer_notes: {
      ar: 'ملاحظات خاصة للمطبخ:',
      en: 'Special Kitchen Notes:',
      fr: 'Instructions pour la cuisine :',
      ru: 'Особые пожелания кухне:',
      it: 'Note speciali per la cucina:'
    },
    customizer_notes_placeholder: {
      ar: 'مثال: بدون بصل، صوص خارجي، تسوية زيادة...',
      en: 'e.g. No onion, sauce on the side, well done...',
      fr: 'ex. Sans oignon, sauce à part, bien cuit...',
      ru: 'напр. Без лука, соус отдельно, хорошо прожарить...',
      it: 'es. Senza cipolla, salsa a parte, ben cotto...'
    },
    customizer_add_btn: {
      ar: 'إضافة إلى السلة',
      en: 'Add to Cart',
      fr: 'Ajouter au panier',
      ru: 'Добавить в корзину',
      it: 'Aggiungi al carrello'
    },

    // ══════ Floating Pill & Cart Drawer ══════
    pill_view_cart: {
      ar: 'عرض السلة وإتمام الطلب',
      en: 'View Cart & Checkout',
      fr: 'Voir le panier & Commander',
      ru: 'Корзина и оформление',
      it: 'Vedi carrello e ordina'
    },
    pill_items: {
      ar: 'أصناف',
      en: 'items',
      fr: 'articles',
      ru: 'товаров',
      it: 'articoli'
    },
    cart_title: {
      ar: 'سلة طلباتك',
      en: 'Your Cart',
      fr: 'Votre Panier',
      ru: 'Ваша корзина',
      it: 'Il tuo carrello'
    },
    cart_empty_title: {
      ar: 'سلتك فارغة حالياً',
      en: 'Your cart is empty',
      fr: 'Votre panier est vide',
      ru: 'Ваша корзина пуста',
      it: 'Il tuo carrello è vuoto'
    },
    cart_empty_sub: {
      ar: 'اختر وجباتك اللذيذة من المنيو وابدأ طلبك الآن!',
      en: 'Choose delicious meals from the menu and start your order!',
      fr: 'Choisissez vos plats préférés sur le menu et commandez !',
      ru: 'Выберите вкусные блюда из меню и начните заказ!',
      it: 'Scegli i piatti dal menu e inizia il tuo ordine!'
    },
    type_delivery: {
      ar: 'توصيل منزلي',
      en: 'Delivery',
      fr: 'Livraison',
      ru: 'Доставка',
      it: 'Consegna'
    },
    type_takeaway: {
      ar: 'استلام سفري',
      en: 'Takeaway',
      fr: 'À emporter',
      ru: 'Самовывоз',
      it: 'Da asporto'
    },
    type_dinein: {
      ar: 'صالة (طاولة)',
      en: 'Dine-in (Table)',
      fr: 'Sur place (Table)',
      ru: 'В зале (Стол)',
      it: 'Al tavolo'
    },
    field_name: {
      ar: 'الاسم بالكامل',
      en: 'Full Name',
      fr: 'Nom complet',
      ru: 'Полное имя',
      it: 'Nome completo'
    },
    field_name_placeholder: {
      ar: 'اكتب اسمك الكريم',
      en: 'Enter your name',
      fr: 'Entrez votre nom',
      ru: 'Введите ваше имя',
      it: 'Inserisci il tuo nome'
    },
    field_phone: {
      ar: 'رقم الموبايل للتواصل',
      en: 'Phone Number',
      fr: 'Numéro de téléphone',
      ru: 'Номер телефона',
      it: 'Numero di telefono'
    },
    field_phone_placeholder: {
      ar: '01012345678',
      en: 'Phone number',
      fr: 'Numéro de téléphone',
      ru: 'Номер телефона',
      it: 'Numero di telefono'
    },
    field_address: {
      ar: 'عنوان التوصيل بالتفصيل',
      en: 'Detailed Delivery Address',
      fr: 'Adresse de livraison détaillée',
      ru: 'Подробный адрес доставки',
      it: 'Indirizzo di consegna dettagliato'
    },
    field_address_placeholder: {
      ar: 'المنطقة، الشارع، رقم العمارة والشقة',
      en: 'Area, street, building & apt number',
      fr: 'Quartier, rue, bâtiment et appartement',
      ru: 'Район, улица, дом, квартира',
      it: 'Zona, via, edificio e interno'
    },
    field_table: {
      ar: 'رقم الطاولة',
      en: 'Table Number',
      fr: 'Numéro de table',
      ru: 'Номер стола',
      it: 'Numero del tavolo'
    },
    field_table_placeholder: {
      ar: 'مثال: طاولة 5',
      en: 'e.g. Table 5',
      fr: 'ex. Table 5',
      ru: 'напр. Стол 5',
      it: 'es. Tavolo 5'
    },
    field_notes: {
      ar: 'ملاحظات إضافية للطلب',
      en: 'Order Notes',
      fr: 'Remarques sur la commande',
      ru: 'Примечания к заказу',
      it: 'Note sull\'ordine'
    },
    field_notes_placeholder: {
      ar: 'أي تفاصيل تحب توضحها لمطعمنا...',
      en: 'Any special instructions for the restaurant...',
      fr: 'Instructions particulières pour le restaurant...',
      ru: 'Дополнительные пожелания ресторану...',
      it: 'Eventuali istruzioni speciali per il ristorante...'
    },
    coupon_label: {
      ar: 'كوبون الخصم:',
      en: 'Promo Code:',
      fr: 'Code promo :',
      ru: 'Промокод:',
      it: 'Codice promo:'
    },
    coupon_placeholder: {
      ar: 'أدخل رمز الكوبون',
      en: 'Enter promo code',
      fr: 'Entrez le code promo',
      ru: 'Введите промокод',
      it: 'Inserisci codice promo'
    },
    coupon_apply: {
      ar: 'تطبيق',
      en: 'Apply',
      fr: 'Appliquer',
      ru: 'Применить',
      it: 'Applica'
    },
    summary_subtotal: {
      ar: 'المجموع:',
      en: 'Subtotal:',
      fr: 'Sous-total :',
      ru: 'Подытог:',
      it: 'Subtotale:'
    },
    summary_delivery: {
      ar: 'رسوم التوصيل:',
      en: 'Delivery Fee:',
      fr: 'Frais de livraison :',
      ru: 'Стоимость доставки:',
      it: 'Costi di consegna:'
    },
    summary_discount: {
      ar: 'قيمة الخصم:',
      en: 'Discount:',
      fr: 'Remise :',
      ru: 'Скидка:',
      it: 'Sconto:'
    },
    summary_total: {
      ar: 'المبلغ الإجمالي:',
      en: 'Grand Total:',
      fr: 'Total à payer :',
      ru: 'Итого к оплате:',
      it: 'Totale complessivo:'
    },
    btn_checkout: {
      ar: 'تأكيد وإرسال الطلب الآن',
      en: 'Confirm & Place Order',
      fr: 'Confirmer et commander',
      ru: 'Оформить заказ сейчас',
      it: 'Conferma e invia ordine'
    },

    // ══════ Onboarding Modal ══════
    onboard_title: {
      ar: 'أهلاً بك في مطعمنا!',
      en: 'Welcome to our Restaurant!',
      fr: 'Bienvenue dans notre restaurant !',
      ru: 'Добро пожаловать в наш ресторан!',
      it: 'Benvenuto nel nostro ristorante!'
    },
    onboard_subtitle: {
      ar: 'اختر لغتك المفضلة وسجّل بياناتك مرة واحدة لتسريع تأكيد طلباتك:',
      en: 'Choose your language and save your details for a fast ordering experience:',
      fr: 'Choisissez votre langue et enregistrez vos coordonnées pour commander plus vite :',
      ru: 'Выберите язык и сохраните данные для быстрого оформления заказов:',
      it: 'Scegli la tua lingua e salva i tuoi dati per ordinare più velocemente:'
    },
    onboard_lang_select: {
      ar: 'لغة المنيو والتطبيق:',
      en: 'Menu & App Language:',
      fr: 'Langue du menu et de l\'application :',
      ru: 'Язык меню и приложения:',
      it: 'Lingua del menu e dell\'app:'
    },
    onboard_save_btn: {
      ar: 'حفظ ومتابعة المنيو',
      en: 'Save & Continue to Menu',
      fr: 'Enregistrer et voir le menu',
      ru: 'Сохранить и открыть меню',
      it: 'Salva e continua al menu'
    },
    onboard_skip_btn: {
      ar: 'تخطي الآن وتصفح القائمة',
      en: 'Skip & Browse Menu',
      fr: 'Passer et parcourir le menu',
      ru: 'Пропустить и смотреть меню',
      it: 'Salta e sfoglia il menu'
    },

    // ══════ My Account Drawer ══════
    account_title: {
      ar: 'حسابي ومعلوماتي',
      en: 'My Profile & Account',
      fr: 'Mon Profil & Compte',
      ru: 'Мой профиль и аккаунт',
      it: 'Il mio profilo e account'
    },
    account_default_user: {
      ar: 'عميلنا العزيز',
      en: 'Valued Guest',
      fr: 'Cher Client',
      ru: 'Уважаемый Гость',
      it: 'Gentile Cliente'
    },
    account_no_phone: {
      ar: 'لم يتم تسجيل الهاتف',
      en: 'Phone not registered',
      fr: 'Téléphone non enregistré',
      ru: 'Телефон не указан',
      it: 'Telefono non registrato'
    },
    account_edit_btn: {
      ar: 'تعديل',
      en: 'Edit',
      fr: 'Modifier',
      ru: 'Изменить',
      it: 'Modifica'
    },
    account_save_btn: {
      ar: 'حفظ البيانات',
      en: 'Save Info',
      fr: 'Enregistrer',
      ru: 'Сохранить',
      it: 'Salva'
    },
    account_cancel_btn: {
      ar: 'إلغاء',
      en: 'Cancel',
      fr: 'Annuler',
      ru: 'Отмена',
      it: 'Annulla'
    },
    menu_track_order: {
      ar: 'متابعة طلبك الأخير',
      en: 'Track Your Last Order',
      fr: 'Suivre votre dernière commande',
      ru: 'Отследить последний заказ',
      it: 'Traccia il tuo ultimo ordine'
    },
    menu_track_order_sub: {
      ar: 'عرض حالة التوصيل والتفاصيل المباشرة',
      en: 'View live delivery status & details',
      fr: 'Voir le statut et les détails en direct',
      ru: 'Статус доставки и детали в реальном времени',
      it: 'Stato di consegna e dettagli in tempo reale'
    },
    menu_favorites: {
      ar: 'الأصناف المفضلة لديك',
      en: 'Favorite Dishes',
      fr: 'Plats favoris',
      ru: 'Избранные блюда',
      it: 'Piatti preferiti'
    },
    menu_favorites_sub: {
      ar: 'أصناف محفوظة لسهولة الوصول',
      en: 'Saved dishes for quick access',
      fr: 'Plats enregistrés pour un accès rapide',
      ru: 'Сохраненные блюда для быстрого заказа',
      it: 'Piatti salvati per un accesso rapido'
    },
    menu_whatsapp: {
      ar: 'محادثة المطعم عبر الواتساب',
      en: 'Chat with Store on WhatsApp',
      fr: 'Discuter avec le restaurant sur WhatsApp',
      ru: 'Связаться с рестораном в WhatsApp',
      it: 'Chatta con il ristorante su WhatsApp'
    },
    menu_whatsapp_sub: {
      ar: 'خدمة العملاء والاستفسارات المباشرة',
      en: 'Customer support & instant inquiries',
      fr: 'Service client et demandes directes',
      ru: 'Служба поддержки и вопросы',
      it: 'Assistenza clienti e richieste dirette'
    },
    menu_theme: {
      ar: 'المظهر (ليلي / نهاري)',
      en: 'Appearance (Dark / Light)',
      fr: 'Apparence (Sombre / Clair)',
      ru: 'Тема (Темная / Светлая)',
      it: 'Tema (Scuro / Chiaro)'
    },
    menu_theme_sub: {
      ar: 'تبديل وضع الإضاءة المفضل',
      en: 'Toggle your preferred lighting mode',
      fr: 'Basculez entre le mode clair et sombre',
      ru: 'Переключение темной и светлой темы',
      it: 'Cambia la modalità di visualizzazione'
    },
    menu_sound: {
      ar: 'المؤثرات الصوتية',
      en: 'Sound Effects',
      fr: 'Effets sonores',
      ru: 'Звуковые эффекты',
      it: 'Effetti sonori'
    },
    menu_language: {
      ar: 'لغة المنيو / Language',
      en: 'Language / لغة المنيو',
      fr: 'Langue / Language',
      ru: 'Язык / Language',
      it: 'Lingua / Language'
    },
    menu_change_branch: {
      ar: 'تغيير فرع المطعم',
      en: 'Change Restaurant Branch',
      fr: 'Changer de succursale',
      ru: 'Сменить филиал ресторана',
      it: 'Cambia filiale del ristorante'
    },
    menu_install_app: {
      ar: 'تثبيت التطبيق على جهازك',
      en: 'Install App on Your Device',
      fr: 'Installer l\'application',
      ru: 'Установить приложение',
      it: 'Installa l\'app sul dispositivo'
    },
    menu_install_app_sub: {
      ar: 'وصول أسرع وتصفح يشبه التطبيقات الأصلية',
      en: 'Faster access & native app experience',
      fr: 'Accès plus rapide et expérience native',
      ru: 'Быстрый доступ и удобство приложения',
      it: 'Accesso rapido ed esperienza da app nativa'
    },

    // ══════ Live Order Tracker ══════
    track_modal_title: {
      ar: 'متابعة حالة الطلب مباشرة',
      en: 'Live Order Tracker',
      fr: 'Suivi de commande en direct',
      ru: 'Отслеживание заказа онлайн',
      it: 'Tracciamento ordine in tempo reale'
    },
    track_order_num: {
      ar: 'رقم الطلب:',
      en: 'Order #:',
      fr: 'Commande n° :',
      ru: 'Заказ №:',
      it: 'Ordine n°:'
    },
    step_received_title: {
      ar: 'تم استلام الطلب بنجاح',
      en: 'Order Received',
      fr: 'Commande reçue',
      ru: 'Заказ успешно принят',
      it: 'Ordine ricevuto con successo'
    },
    step_received_desc: {
      ar: 'تم إرسال الطلب وإخطار كاشير المطعم فوراً',
      en: 'Order placed & cashier notified instantly',
      fr: 'Commande passée et caisse notifiée',
      ru: 'Заказ отправлен на кассу ресторана',
      it: 'Ordine inviato e notificato alla cassa'
    },
    step_preparing_title: {
      ar: 'المطبخ يجهز طلبك الآن',
      en: 'Kitchen is Preparing',
      fr: 'Cuisine en préparation',
      ru: 'Кухня готовит ваш заказ',
      it: 'La cucina sta preparando il tuo ordine'
    },
    step_preparing_desc: {
      ar: 'يتم طهي وتغليف الوجبات الطازجة لك',
      en: 'Fresh meals are being cooked & packed',
      fr: 'Plats frais en cours de cuisson et d\'emballage',
      ru: 'Блюда готовятся и упаковываются для вас',
      it: 'I piatti freschi vengono preparati e confezionati'
    },
    step_out_title: {
      ar: 'الطلب في الطريق إليك',
      en: 'Out for Delivery',
      fr: 'En cours de livraison',
      ru: 'Заказ в пути к вам',
      it: 'Ordine in consegna'
    },
    step_out_desc: {
      ar: 'الكابتن في طريقه لتسليم الطلب لعنوانك',
      en: 'Courier is on the way to your location',
      fr: 'Le livreur est en route vers votre adresse',
      ru: 'Курьер уже везет заказ по вашему адресу',
      it: 'Il corriere è in viaggio verso il tuo indirizzo'
    },
    step_delivered_title: {
      ar: 'تم التسليم بالهناء والشفاء!',
      en: 'Delivered — Enjoy your meal!',
      fr: 'Livré — Bon appétit !',
      ru: 'Доставлено — Приятного аппетита!',
      it: 'Consegnato — Buon appetito!'
    },
    step_delivered_desc: {
      ar: 'شكراً لطلبك من مطعمنا ونرجو لك وجبة شهية',
      en: 'Thank you for ordering with us!',
      fr: 'Merci pour votre commande et bon appétit !',
      ru: 'Спасибо за заказ в нашем ресторане!',
      it: 'Grazie per aver ordinato con noi!'
    },
    track_summary_head: {
      ar: 'ملخص الأصناف:',
      en: 'Order Summary:',
      fr: 'Résumé de la commande :',
      ru: 'Содержимое заказа:',
      it: 'Riepilogo ordine:'
    },
    track_total_label: {
      ar: 'المبلغ المطلوب:',
      en: 'Amount Due:',
      fr: 'Montant dû :',
      ru: 'Сумма к оплате:',
      it: 'Importo dovuto:'
    },
    track_btn_whatsapp: {
      ar: 'محادثة المطعم',
      en: 'Chat on WhatsApp',
      fr: 'Discuter sur WhatsApp',
      ru: 'Чат в WhatsApp',
      it: 'Chatta su WhatsApp'
    },
    track_btn_back_menu: {
      ar: 'الرجوع للمنيو',
      en: 'Back to Menu',
      fr: 'Retour au menu',
      ru: 'Вернуться в меню',
      it: 'Torna al menu'
    },

    // ══════ Toasts & Alerts ══════
    toast_item_added: {
      ar: 'تمت إضافة الوجبة إلى السلة بنجاح',
      en: 'Item added to your cart',
      fr: 'Plat ajouté au panier',
      ru: 'Блюдо добавлено в корзину',
      it: 'Piatto aggiunto al carrello'
    },
    toast_order_success: {
      ar: 'تم إرسال طلبك بنجاح للمطعم!',
      en: 'Your order was placed successfully!',
      fr: 'Votre commande a été envoyée avec succès !',
      ru: 'Ваш заказ успешно отправлен в ресторан!',
      it: 'Il tuo ordine è stato inviato con successo!'
    },
    toast_profile_saved: {
      ar: 'تم حفظ بياناتك بنجاح',
      en: 'Your profile has been saved successfully',
      fr: 'Vos coordonnées ont été enregistrées avec succès',
      ru: 'Ваши данные успешно сохранены',
      it: 'I tuoi dati sono stati salvati con successo'
    },
    toast_lang_changed: {
      ar: 'تم تغيير لغة التطبيق بنجاح',
      en: 'Language updated successfully',
      fr: 'Langue mise à jour avec succès',
      ru: 'Язык успешно изменен',
      it: 'Lingua aggiornata con successo'
    }
  };

  const I18n = {
    supportedLanguages: SUPPORTED_LANGS,
    dictionary: DICTIONARY,

    getLanguage() {
      try {
        const saved = localStorage.getItem('harpy_customer_lang');
        if (saved && SUPPORTED_LANGS[saved]) return saved;
        // Fallback to customer profile
        const profRaw = localStorage.getItem('harpy_customer_profile');
        if (profRaw) {
          const prof = JSON.parse(profRaw);
          if (prof && prof.lang && SUPPORTED_LANGS[prof.lang]) return prof.lang;
        }
      } catch (e) {}
      return 'ar'; // Default native language
    },

    setLanguage(langCode, triggerRender = true) {
      if (!SUPPORTED_LANGS[langCode]) langCode = 'ar';
      const langConfig = SUPPORTED_LANGS[langCode];

      try {
        localStorage.setItem('harpy_customer_lang', langCode);
        // Also update profile if present
        const profRaw = localStorage.getItem('harpy_customer_profile');
        if (profRaw) {
          const prof = JSON.parse(profRaw);
          prof.lang = langCode;
          localStorage.setItem('harpy_customer_profile', JSON.stringify(prof));
        }
      } catch (e) {}

      // Update HTML root attributes
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

      // Apply translations to all tagged DOM elements
      this.applyDOMTranslations(langCode);

      // Dispatch global event for other components to re-render
      window.dispatchEvent(new CustomEvent('harpy_language_changed', {
        detail: { lang: langCode, config: langConfig }
      }));

      if (triggerRender) {
        try {
          if (typeof window.renderStoreInfo === 'function') window.renderStoreInfo();
          if (typeof window.renderDiscoveryBar === 'function') window.renderDiscoveryBar();
          if (typeof window.renderMenuItems === 'function') window.renderMenuItems();
          if (typeof window.renderCartDrawerUI === 'function') window.renderCartDrawerUI();
          if (typeof window.updateFloatingCartPill === 'function') window.updateFloatingCartPill();
          if (typeof window.updateAccountDrawerProfileUI === 'function') window.updateAccountDrawerProfileUI();
        } catch (err) {}
      }

      return langCode;
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

      // 4. Update language indicator subtitle in "My Account"
      const accountLangSub = document.getElementById('account-language-sub');
      if (accountLangSub && SUPPORTED_LANGS[lang]) {
        accountLangSub.textContent = `${SUPPORTED_LANGS[lang].flag} ${SUPPORTED_LANGS[lang].name} (${SUPPORTED_LANGS[lang].englishName})`;
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
        document.addEventListener('DOMContentLoaded', () => this.applyDOMTranslations(initialLang));
      } else {
        this.applyDOMTranslations(initialLang);
      }
    }
  };

  // Expose globally
  window.I18n = I18n;
  window.t = function(key, fallback) { return I18n.t(key, fallback); };

  // Auto-init immediately
  I18n.init();

})(typeof window !== 'undefined' ? window : this);
