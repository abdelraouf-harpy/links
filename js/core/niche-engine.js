/**
 * Harpy Order — Dual-Mode SaaS Engine (Restaurant/Cafe + E-Commerce Store)
 * Handles: Business Type Presets, Custom Domain Mapping, Adaptive Terminology,
 * Strict Piece Stock Helpers, Timed Flash Offers, and Bulk Price Adjustment + Undo.
 */
(function(window) {
  'use strict';

  const PLATFORM_HOSTS = ['harpymenu.com', 'www.harpymenu.com', 'localhost', '127.0.0.1'];

  const BUSINESS_TYPES = {
    restaurant: {
      id: 'restaurant',
      labelAr: 'مطعم / كافيه',
      labelEn: 'Restaurant / Cafe',
      badgeBg: 'rgba(234, 88, 12, 0.14)',
      badgeColor: '#fb923c',
      badgeBorder: 'rgba(234, 88, 12, 0.32)'
    },
    store: {
      id: 'store',
      labelAr: 'متجر إلكتروني / براند',
      labelEn: 'E-Commerce Store / Brand',
      badgeBg: 'rgba(59, 130, 246, 0.14)',
      badgeColor: '#60a5fa',
      badgeBorder: 'rgba(59, 130, 246, 0.32)'
    }
  };

  function getPresetModules(businessType) {
    const isStore = (businessType === 'store');
    if (isStore) {
      return {
        // Core shared
        ordering: true,
        pos: false,
        inventory: false,
        stories: true,
        smartTables: false,
        delivery: true,
        takeaway: false,
        onlinePayment: true,
        archive: true,
        shifts: true,
        coupons: true,
        cartDiscount: true,
        announcementBar: true,
        branches: false,
        reviews: true,
        settings: true,
        backup: true,
        // Niche & Pricing extensions
        bulkPricing: true,
        ageGate18: false,
        store24_7: true,
        pieceStock: true,
        multiImageGallery: true,
        catalogFilters: true,
        bulkImport: true,
        returnPolicy: true,
        nutritionInfo: false,
        workingHoursGate: false
      };
    }
    return {
      // Restaurant default (100% backward compatible)
      ordering: true,
      pos: true,
      inventory: true,
      stories: true,
      smartTables: true,
      delivery: true,
      takeaway: true,
      onlinePayment: true,
      archive: true,
      shifts: true,
      coupons: true,
      cartDiscount: true,
      announcementBar: true,
      branches: true,
      reviews: true,
      settings: true,
      backup: true,
      // Niche & Pricing extensions
      bulkPricing: true,
      ageGate18: false,
      store24_7: false,
      pieceStock: false,
      multiImageGallery: false,
      catalogFilters: false,
      bulkImport: false,
      returnPolicy: false,
      nutritionInfo: true,
      workingHoursGate: true
    };
  }

  function normalizeModules(rawModules, businessType) {
    const base = getPresetModules(businessType === 'store' ? 'store' : 'restaurant');
    if (!rawModules || typeof rawModules !== 'object') return base;
    const merged = Object.assign({}, base, rawModules);
    if (typeof rawModules.tables === 'boolean' && typeof rawModules.smartTables !== 'boolean') {
      merged.smartTables = rawModules.tables;
    }
    return merged;
  }

  // ── Custom Domain Helpers ───────────────────────────────────
  function normalizeDomain(raw) {
    if (!raw || typeof raw !== 'string') return '';
    return raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .split('?')[0]
      .split('#')[0]
      .split(':')[0]
      .replace(/[^a-z0-9.-]/g, '')
      .replace(/^\.+|\.+$/g, '');
  }

  function domainToFirebaseKey(domain) {
    const clean = normalizeDomain(domain);
    return clean ? clean.replace(/\./g, '_') : '';
  }

  function isPlatformHost(hostname) {
    const h = String(hostname || (typeof window !== 'undefined' && window.location ? window.location.hostname : '') || '').toLowerCase();
    if (!h) return true;
    if (PLATFORM_HOSTS.includes(h)) return true;
    if (h.endsWith('.harpymenu.com') || h.endsWith('.github.io') || h.endsWith('.firebaseapp.com') || h.endsWith('.web.app')) {
      return true;
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return true;
    return false;
  }

  function getCachedDomainSlug(hostname) {
    try {
      const clean = normalizeDomain(hostname || (typeof window !== 'undefined' && window.location ? window.location.hostname : ''));
      if (!clean || isPlatformHost(clean)) return null;
      return localStorage.getItem('harpy_domain_slug_' + clean) || null;
    } catch (e) {
      return null;
    }
  }

  function setCachedDomainSlug(hostname, slug) {
    try {
      const clean = normalizeDomain(hostname || '');
      if (!clean || !slug) return;
      localStorage.setItem('harpy_domain_slug_' + clean, String(slug).toLowerCase().trim());
    } catch (e) {}
  }

  async function resolveDomainSlug(hostname) {
    const clean = normalizeDomain(hostname || (typeof window !== 'undefined' && window.location ? window.location.hostname : ''));
    if (!clean || isPlatformHost(clean)) return null;
    const key = domainToFirebaseKey(clean);
    if (!key) return null;

    // 1. Try Firebase /domains/{key}.json (requires public read rule or open cache)
    try {
      const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/domains/${key}.json?cb=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const val = await res.json();
        const resolved = typeof val === 'string' ? val : (val && val.slug ? val.slug : null);
        if (resolved) {
          setCachedDomainSlug(clean, resolved);
          return resolved;
        }
      }
    } catch (e) {}

    // 2. Static generated fallback map (/js/domain-map.json)
    try {
      const basePrefix = (typeof window !== 'undefined' && /\/(order|admin)(\/|$)/i.test(window.location.pathname)) ? '../' : './';
      const r2 = await fetch(`${basePrefix}js/domain-map.json?cb=${Date.now()}`, { cache: 'no-store' });
      if (r2.ok) {
        const map = await r2.json();
        if (map && (map[clean] || map[key])) {
          const found = map[clean] || map[key];
          const slug = typeof found === 'string' ? found : found.slug;
          if (slug) {
            setCachedDomainSlug(clean, slug);
            return slug;
          }
        }
      }
    } catch (e) {}

    return getCachedDomainSlug(clean);
  }

  // ── Timed Flash Offers & Effective Pricing ──────────────────
  function hasTimedOfferExpired(product, now) {
    if (!product || typeof product !== 'object') return false;
    const tNow = now || Date.now();
    const endsAt = Number(product.offerEndsAt || 0);
    return endsAt > 0 && tNow >= endsAt;
  }

  function isOfferActive(product, now) {
    if (!product || typeof product !== 'object') return false;
    const tNow = now || Date.now();
    const endsAt = Number(product.offerEndsAt || 0);
    const price = Number(product.price || 0);
    const orig = Number(product.originalPrice || 0);
    if (endsAt > 0) {
      return tNow < endsAt && orig > price && price > 0;
    }
    return orig > price && price > 0;
  }

  function isTimedOfferActive(product, now) {
    if (!product || typeof product !== 'object') return false;
    const tNow = now || Date.now();
    const endsAt = Number(product.offerEndsAt || 0);
    const price = Number(product.price || 0);
    const orig = Number(product.originalPrice || 0);
    return endsAt > 0 && tNow < endsAt && orig > price && price > 0;
  }

  function getEffectiveProductPrice(product, now) {
    if (!product || typeof product !== 'object') return 0;
    if (hasTimedOfferExpired(product, now)) {
      const orig = Number(product.originalPrice || 0);
      return orig > 0 ? orig : (Number(product.price) || 0);
    }
    return Number(product.price) || 0;
  }

  function getEffectiveProductOriginalPrice(product, now) {
    if (!product || typeof product !== 'object') return 0;
    if (hasTimedOfferExpired(product, now)) return 0;
    const effPrice = getEffectiveProductPrice(product, now);
    const orig = Number(product.originalPrice || 0);
    return orig > effPrice ? orig : 0;
  }

  function getEffectiveSizePrice(product, sizeObj, now) {
    if (!sizeObj || typeof sizeObj !== 'object') return 0;
    if (product && hasTimedOfferExpired(product, now) && Number(sizeObj.originalPrice || 0) > 0) {
      return Number(sizeObj.originalPrice);
    }
    return Number(sizeObj.price) || 0;
  }

  function getDiscountPercent(product, now) {
    const eff = getEffectiveProductPrice(product, now);
    const orig = getEffectiveProductOriginalPrice(product, now);
    if (!orig || orig <= eff || eff <= 0) return 0;
    return Math.round(((orig - eff) / orig) * 100);
  }

  function formatCountdown(remainingMs, lang) {
    const ms = Math.max(0, Number(remainingMs || 0));
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    const isEn = (lang === 'en');
    const isUrgent = ms > 0 && ms <= 7200000; // <= 2 hours

    let text = '';
    if (days > 0) {
      text = isEn
        ? `${days}d : ${pad(hours)}h : ${pad(mins)}m : ${pad(secs)}s`
        : `${days}ي : ${pad(hours)}س : ${pad(mins)}د : ${pad(secs)}ث`;
    } else {
      text = isEn
        ? `${pad(hours)}h : ${pad(mins)}m : ${pad(secs)}s`
        : `${pad(hours)}س : ${pad(mins)}د : ${pad(secs)}ث`;
    }
    return { text, isUrgent, totalSec };
  }

  let _countdownInterval = null;
  function startCountdownLoop(onExpireCallback) {
    if (typeof document === 'undefined') return;
    if (_countdownInterval) clearInterval(_countdownInterval);

    const tick = () => {
      const nodes = document.querySelectorAll('[data-offer-ends]');
      if (!nodes || nodes.length === 0) return;
      const now = Date.now();
      const lang = (window.I18n && typeof window.I18n.getLanguage === 'function') ? window.I18n.getLanguage() : 'ar';
      let expiredAny = false;

      nodes.forEach(el => {
        const endsAt = Number(el.getAttribute('data-offer-ends') || 0);
        if (!endsAt) return;
        const rem = endsAt - now;
        if (rem <= 0) {
          expiredAny = true;
          el.style.display = 'none';
          return;
        }
        const fmt = formatCountdown(rem, lang);
        const timerSpan = el.querySelector('.offer-timer-digits');
        if (timerSpan) {
          timerSpan.textContent = fmt.text;
        } else {
          el.textContent = fmt.text;
        }
        el.classList.toggle('urgent', fmt.isUrgent);
      });

      if (expiredAny && typeof onExpireCallback === 'function') {
        onExpireCallback();
      }
    };

    tick();
    _countdownInterval = setInterval(tick, 1000);
  }

  // ── Bulk Price Adjustment & Undo Engine ─────────────────────
  function roundAdjustedPrice(val, rounding) {
    const n = Number(val);
    if (!isFinite(n)) return 1;
    let out = n;
    if (rounding === 'round1') {
      out = Math.round(n);
    } else if (rounding === 'round5') {
      out = Math.round(n / 5) * 5;
    } else {
      out = Math.round(n * 100) / 100;
    }
    return Math.max(1, out);
  }

  function computeSingleAdjustment(baseVal, direction, valueType, amount, rounding) {
    const base = Number(baseVal || 0);
    if (base <= 0) return base;
    const amt = Math.max(0, Number(amount || 0));
    const sign = (direction === 'decrease') ? -1 : 1;
    let next = base;
    if (valueType === 'percent') {
      next = base * (1 + (sign * amt / 100));
    } else {
      next = base + (sign * amt);
    }
    return roundAdjustedPrice(next, rounding);
  }

  function getTargetedProducts(products, options) {
    const list = Array.isArray(products) ? products : [];
    const scope = (options && options.scope) || 'all';
    if (scope === 'categories') {
      const catSet = new Set(Array.isArray(options.categoryNames) ? options.categoryNames : []);
      return list.filter(p => p && catSet.has(p.category));
    }
    if (scope === 'selected') {
      const idSet = new Set(Array.isArray(options.productIds) ? options.productIds : []);
      return list.filter(p => p && idSet.has(p.id));
    }
    return list.filter(Boolean);
  }

  function buildBulkPricePlan(products, options) {
    const opts = options || {};
    const direction = (opts.direction === 'decrease') ? 'decrease' : 'increase';
    const valueType = (opts.valueType === 'fixed') ? 'fixed' : 'percent';
    const amount = Math.max(0, Number(opts.amount || 0));
    const rounding = opts.rounding || 'round1';
    const includeVariants = (opts.includeVariants !== false);
    const mode = (opts.mode === 'timed' && direction === 'decrease') ? 'timed' : 'permanent';
    const offerEndsAt = (mode === 'timed') ? Number(opts.offerEndsAt || 0) : 0;
    const offerLabel = (mode === 'timed') ? String(opts.offerLabel || '').trim() : '';

    const targeted = getTargetedProducts(products, opts);
    const targetIds = new Set(targeted.map(p => p.id));
    const now = Date.now();
    const changes = [];
    const snapshotItems = [];

    const updatedProducts = (Array.isArray(products) ? products : []).map(prod => {
      if (!prod || !targetIds.has(prod.id)) return prod;

      // Preserve original snapshot before editing
      snapshotItems.push({
        id: prod.id,
        price: prod.price,
        originalPrice: prod.originalPrice || 0,
        offerEndsAt: prod.offerEndsAt || 0,
        offerLabel: prod.offerLabel || '',
        sizes: Array.isArray(prod.sizes) ? prod.sizes.map(s => Object.assign({}, s)) : []
      });

      const clone = Object.assign({}, prod);
      // Use true active base price (if timed offer already exists, revert to its base price before stacking or calculating)
      const trueBasePrice = hasTimedOfferExpired(prod, now)
        ? (Number(prod.originalPrice) || Number(prod.price) || 0)
        : (mode === 'timed' && Number(prod.originalPrice) > Number(prod.price)
            ? Number(prod.originalPrice)
            : Number(prod.price) || 0);

      const currentVisiblePrice = getEffectiveProductPrice(prod, now);
      const nextPrice = computeSingleAdjustment(trueBasePrice, direction, valueType, amount, rounding);

      if (mode === 'timed') {
        clone.originalPrice = trueBasePrice;
        clone.price = Math.min(nextPrice, Math.max(1, trueBasePrice - 0.5));
        if (nextPrice >= trueBasePrice) {
          clone.price = nextPrice;
        }
        clone.offerEndsAt = offerEndsAt;
        clone.offerLabel = offerLabel;
      } else {
        clone.price = nextPrice;
        clone.originalPrice = 0;
        clone.offerEndsAt = 0;
        clone.offerLabel = '';
      }

      let changedVariants = 0;
      if (includeVariants && Array.isArray(prod.sizes) && prod.sizes.length > 0) {
        clone.sizes = prod.sizes.map(sz => {
          const sClone = Object.assign({}, sz);
          const sRaw = Number(sz.price || 0);
          if (sRaw > 0) {
            const sBase = hasTimedOfferExpired(prod, now) && Number(sz.originalPrice || 0) > 0
              ? Number(sz.originalPrice)
              : (mode === 'timed' && Number(sz.originalPrice || 0) > sRaw ? Number(sz.originalPrice) : sRaw);
            const sNext = computeSingleAdjustment(sBase, direction, valueType, amount, rounding);
            if (mode === 'timed') {
              sClone.originalPrice = sBase;
              sClone.price = sNext;
            } else {
              sClone.price = sNext;
              delete sClone.originalPrice;
            }
            changedVariants++;
          }
          return sClone;
        });
      }

      changes.push({
        id: prod.id,
        name: prod.name,
        category: prod.category,
        oldPrice: currentVisiblePrice,
        basePrice: trueBasePrice,
        newPrice: clone.price,
        changedVariants,
        isTimed: (mode === 'timed'),
        offerEndsAt
      });

      return clone;
    });

    const snapshot = {
      createdAt: now,
      label: `${direction === 'decrease' ? 'خصم' : 'زيادة'} ${amount}${valueType === 'percent' ? '%' : ' ج.م'} (${changes.length} منتج)`,
      items: snapshotItems
    };

    return { updatedProducts, changes, snapshot };
  }

  function applyUndoSnapshot(products, snapshot) {
    if (!snapshot || !Array.isArray(snapshot.items)) return products;
    const map = new Map(snapshot.items.map(it => [it.id, it]));
    return (Array.isArray(products) ? products : []).map(prod => {
      if (!prod || !map.has(prod.id)) return prod;
      const prev = map.get(prod.id);
      const restored = Object.assign({}, prod, {
        price: prev.price,
        originalPrice: prev.originalPrice || 0,
        offerEndsAt: prev.offerEndsAt || 0,
        offerLabel: prev.offerLabel || ''
      });
      if (Array.isArray(prev.sizes)) {
        restored.sizes = prev.sizes.map(s => Object.assign({}, s));
      }
      return restored;
    });
  }

  // ── Adaptive Terminology Engine (Restaurant <-> Store) ──────
  const STORE_TERMINOLOGY = {
    ar: {
      nav_menu: 'المتجر',
      nav_home: 'الرئيسية',
      hero_browse_btn: 'تصفح المنتجات',
      section_menu_title: 'كتالوج المنتجات',
      tab_catalog: 'إدارة المنتجات',
      tab_orders: 'الطلبات الواردة',
      orders_header: 'إدارة الطلبات والشحنات',
      status_pending: 'طلب جديد',
      status_preparing: 'جاري التجهيز والتغليف',
      status_out_for_delivery: 'تم الشحن / مع المندوب',
      status_delivered: 'تم التسليم',
      fulfillment_takeaway: 'استلام من الفرع',
      fulfillment_delivery: 'شحن وتوصيل',
      add_product: 'إضافة منتج جديد',
      edit_product: 'تعديل المنتج',
      product_name: 'اسم المنتج',
      item_singular: 'منتج',
      items_plural: 'منتجات',
      store_open_now: 'المتجر متاح للطلب',
      store_open_247: 'مفتوح 24 ساعة لاستقبال الطلبات',
      store_open_banner: 'نستقبل طلباتكم الآن ونشحن بسرعة وأمان',
      store_closed_now: 'متوقف مؤقتاً',
      store_closed_banner: 'المتجر متوقف حالياً عن استقبال الطلبات',
      empty_cart: 'سلة التسوق فارغة',
      empty_cart_sub: 'تصفح المنتجات وأضف ما يناسبك للسلة',
      search_placeholder: 'ابحث عن أي منتج أو قسم...',
      prep_time_placeholder: 'مثال: شحن خلال 24 ساعة',
      customizer_notes_placeholder: 'أضف أي ملاحظات خاصة بالتغليف أو الطلب...',
      splash_subtitle: 'جاري تجهيز المتجر...'
    },
    en: {
      nav_menu: 'Store',
      nav_home: 'Home',
      hero_browse_btn: 'Browse Products',
      section_menu_title: 'Product Catalog',
      tab_catalog: 'Products Manager',
      tab_orders: 'Incoming Orders',
      orders_header: 'Orders & Fulfillment Queue',
      status_pending: 'New Order',
      status_preparing: 'Packing & Processing',
      status_out_for_delivery: 'Out for Delivery',
      status_delivered: 'Delivered',
      fulfillment_takeaway: 'Store Pickup',
      fulfillment_delivery: 'Shipping & Delivery',
      add_product: 'Add New Product',
      edit_product: 'Edit Product',
      product_name: 'Product Name',
      item_singular: 'Product',
      items_plural: 'Products',
      store_open_now: 'Store Open',
      store_open_247: 'Open 24/7 for Orders',
      store_open_banner: 'We are accepting orders now with fast shipping',
      store_closed_now: 'Paused',
      store_closed_banner: 'Store is currently paused for orders',
      empty_cart: 'Your shopping cart is empty',
      empty_cart_sub: 'Browse products and add items to your bag',
      search_placeholder: 'Search products or categories...',
      prep_time_placeholder: 'e.g. Ships within 24h',
      customizer_notes_placeholder: 'Add packing or delivery notes...',
      splash_subtitle: 'Loading storefront...'
    }
  };

  function getBusinessType(settings) {
    const s = settings || (window.Store && typeof window.Store.getSettings === 'function' ? window.Store.getSettings() : {}) || {};
    return (s.businessType === 'store') ? 'store' : 'restaurant';
  }

  function isStoreMode(settings) {
    return getBusinessType(settings) === 'store';
  }

  function getTerm(key, lang, settings) {
    const l = lang || (window.I18n && typeof window.I18n.getLanguage === 'function' ? window.I18n.getLanguage() : 'ar');
    if (isStoreMode(settings)) {
      const dict = STORE_TERMINOLOGY[l === 'en' ? 'en' : 'ar'];
      if (dict && dict[key]) return dict[key];
    }
    return null;
  }

  function getStatusLabel(status, settings, lang) {
    const isStore = isStoreMode(settings);
    const l = (lang === 'en') ? 'en' : 'ar';
    if (isStore) {
      const key = 'status_' + status;
      if (STORE_TERMINOLOGY[l][key]) return STORE_TERMINOLOGY[l][key];
    }
    const restMap = {
      ar: { pending: 'جديد', preparing: 'جاري التحضير', out_for_delivery: 'جاري التوصيل', delivered: 'تم التسليم', cancelled: 'ملغي' },
      en: { pending: 'New', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' }
    };
    return (restMap[l] && restMap[l][status]) || status;
  }

  function applyTerminology(settings) {
    if (typeof document === 'undefined') return;
    const s = settings || (window.Store && typeof window.Store.getSettings === 'function' ? window.Store.getSettings() : {}) || {};
    const bType = getBusinessType(s);
    const isStore = (bType === 'store');
    const lang = (window.I18n && typeof window.I18n.getLanguage === 'function') ? window.I18n.getLanguage() : 'ar';

    document.documentElement.setAttribute('data-business-type', bType);

    if (!isStore) return;

    // 1. Update data-i18n elements with store terminology where applicable
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      const term = getTerm(k, lang, s);
      if (term) el.textContent = term;
    });

    // 2. Targeted selector text adaptations (works cleanly even on static Arabic elements without breaking event listeners)
    const replacePairs = [
      ['قائمة الطعام', 'المنتجات'],
      ['المنيو الإلكتروني', 'المتجر الإلكتروني'],
      ['تصفح المنيو', 'تصفح المنتجات'],
      ['المطبخ والطلبات', 'إدارة الطلبات والشحن'],
      ['شاشة المطبخ', 'الطلبات الواردة'],
      ['طلبات المطبخ', 'الطلبات الواردة'],
      ['الوجبات والمنيو', 'المنتجات والأقسام'],
      ['الوجبات والمشروبات', 'المنتجات'],
      ['الوجبات', 'المنتجات'],
      ['صنف جديد', 'منتج جديد'],
      ['إضافة صنف جديد', 'إضافة منتج جديد'],
      ['تعديل الصنف', 'تعديل المنتج'],
      ['اسم الصنف', 'اسم المنتج'],
      ['وقت التحضير', 'مدة التجهيز / الشحن'],
      ['المطعم مغلق', 'المتجر متوقف'],
      ['المطعم مفتوح', 'المتجر متاح'],
      ['جاري فتح المنيو...', 'جاري فتح المتجر...'],
      ['ابحث في المنيو', 'ابحث في المنتجات']
    ];

    const selectiveContainers = [
      '#nav-tab-menu .nav-tab-label',
      '#desktop-nav-menu',
      '#drawer-nav-orders .drawer-nav-label',
      '#drawer-nav-catalog .drawer-nav-label',
      '.admin-tab-btn[data-tab="tab-orders"] span',
      '.admin-tab-btn[data-tab="tab-catalog"] span',
      '#btn-hero-browse-menu',
      '#menu-section-title',
      '#search-input',
      '#prod-notes-input',
      '#splash-subtitle',
      '#fulfillment-tab-takeaway span',
      '[data-type="takeaway"] span'
    ];

    // Direct safe replacements on known semantic labels
    const searchEl = document.getElementById('search-input');
    if (searchEl && searchEl.placeholder && searchEl.placeholder.includes('المنيو')) {
      searchEl.placeholder = getTerm('search_placeholder', lang, s);
    }
    const navMenuLabel = document.querySelector('#nav-tab-menu .nav-tab-label');
    if (navMenuLabel) navMenuLabel.textContent = getTerm('nav_menu', lang, s);
    const deskNavMenu = document.getElementById('desktop-nav-menu');
    if (deskNavMenu) {
      const sp = deskNavMenu.querySelector('span') || deskNavMenu;
      if (sp.childNodes.length === 1 && sp.childNodes[0].nodeType === 3) sp.textContent = getTerm('nav_menu', lang, s);
    }

    // Walk text nodes inside targeted UI headers & buttons (fast & non-destructive)
    const adminOrClientLabels = document.querySelectorAll(
      '.admin-tab-btn, .drawer-nav-btn, .section-heading, .section-title, .card-title, .btn, label.form-label, .form-toggle-chip span, .cart-empty-state h3, .cart-empty-state p, .step-title, .fulfillment-tab, .sheet-header-title'
    );
    adminOrClientLabels.forEach(el => {
      el.childNodes.forEach(node => {
        if (node.nodeType === 3 && node.nodeValue && node.nodeValue.trim()) {
          let txt = node.nodeValue;
          let changed = false;
          for (let i = 0; i < replacePairs.length; i++) {
            if (txt.includes(replacePairs[i][0])) {
              txt = txt.split(replacePairs[i][0]).join(replacePairs[i][1]);
              changed = true;
            }
          }
          if (changed) node.nodeValue = txt;
        }
      });
    });

    // Replace takeaway label cleanly
    document.querySelectorAll('#fulfillment-tab-takeaway, [data-type="takeaway"]').forEach(el => {
      el.childNodes.forEach(n => {
        if (n.nodeType === 3 && /تيك\s*أواي|الاستلام\s*من\s*المطعم/i.test(n.nodeValue)) {
          n.nodeValue = ' ' + getTerm('fulfillment_takeaway', lang, s) + ' ';
        }
      });
    });

    // Update page <title> if it still contains "منيو" or "Harpy Order" on custom domain
    try {
      const storeName = (s.storeName || s.name || '').split('|')[0].trim();
      const onCustomDomain = !isPlatformHost(window.location.hostname);
      if (storeName) {
        if (document.title && (document.title.includes('منيو') || onCustomDomain)) {
          const isAdmin = /\/admin(\/|$|\.html)/i.test(window.location.pathname || '');
          document.title = isAdmin ? `لوحة الإدارة — ${storeName}` : `${storeName} — ${getTerm('nav_menu', lang, s)}`;
        }
      }
    } catch (e) {}

    // Swap culinary cloche icon in splash screen to clean shopping bag icon when in store mode
    const splashLogoFallback = document.getElementById('splash-brand-bag-fallback');
    if (splashLogoFallback) splashLogoFallback.style.display = 'inline-flex';
  }

  window.NicheEngine = {
    BUSINESS_TYPES,
    getPresetModules,
    normalizeModules,
    normalizeDomain,
    domainToFirebaseKey,
    isPlatformHost,
    getCachedDomainSlug,
    setCachedDomainSlug,
    resolveDomainSlug,
    hasTimedOfferExpired,
    isOfferActive,
    isTimedOfferActive,
    getEffectiveProductPrice,
    getEffectiveProductOriginalPrice,
    getEffectiveSizePrice,
    getDiscountPercent,
    formatCountdown,
    startCountdownLoop,
    roundAdjustedPrice,
    buildBulkPricePlan,
    applyUndoSnapshot,
    getBusinessType,
    isStoreMode,
    getTerm,
    getStatusLabel,
    applyTerminology
  };
})(window);
