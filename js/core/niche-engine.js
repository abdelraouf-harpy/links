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
    const totalHours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    const isUrgent = ms > 0 && ms <= 7200000; // <= 2 hours

    const h = pad(totalHours);
    const m = pad(mins);
    const s = pad(secs);
    const text = `${h} ${m} ${s}`;
    return { text, h, m, s, isUrgent, totalSec };
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
          const hEl = timerSpan.querySelector('.cd-h');
          const mEl = timerSpan.querySelector('.cd-m');
          const sEl = timerSpan.querySelector('.cd-s');
          if (hEl && mEl && sEl) {
            if (hEl.textContent !== fmt.h) hEl.textContent = fmt.h;
            if (mEl.textContent !== fmt.m) mEl.textContent = fmt.m;
            if (sEl.textContent !== fmt.s) sEl.textContent = fmt.s;
          } else {
            timerSpan.innerHTML = `<span class="cd-seg cd-h">${fmt.h}</span><span class="cd-seg cd-m">${fmt.m}</span><span class="cd-seg cd-s">${fmt.s}</span>`;
          }
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
      nav_cart: 'السلة',
      nav_orders: 'طلباتي',
      nav_account: 'حسابي',
      nav_search: 'البحث',
      hero_browse_btn: 'تصفح المنتجات',
      section_menu_title: 'كتالوج المنتجات',
      tab_catalog: 'إدارة المنتجات',
      tab_orders: 'الطلبات الواردة',
      orders_header: 'إدارة الطلبات والشحنات',
      status_pending: 'طلب جديد',
      status_preparing: 'جاري التجهيز والتغليف',
      status_out_for_delivery: 'تم الشحن / مع المندوب',
      status_delivered: 'تم التسليم',
      fulfillment_takeaway: 'استلام من المتجر',
      fulfillment_delivery: 'شحن وتوصيل',
      takeaway_banner_title: 'استلام مباشر من المتجر (بدون رسوم توصيل)',
      ful_takeaway_desc: 'استلام طلبك مباشرة من مقر المتجر بدون رسوم شحن',
      add_product: 'إضافة منتج جديد',
      edit_product: 'تعديل المنتج',
      product_name: 'اسم المنتج',
      item_singular: 'منتج',
      items_plural: 'منتجات',
      store_open_now: 'المتجر متاح للطلب',
      store_open_247: 'مفتوح 24 ساعة لاستقبال الطلبات',
      store_open_banner: 'نستقبل طلباتكم الآن ونشحن بسرعة وأمان',
      store_closed_now: 'متوقف مؤقتاً',
      store_closed_title: 'المتجر متوقف حالياً عن استقبال الطلبات',
      store_closed_msg: 'عذراً، المتجر لا يستقبل طلبات جديدة حالياً. يمكنك تصفح المنتجات والأسعار بحرية وسنعاود الاستقبال قريباً.',
      store_closed_banner: 'المتجر متوقف حالياً عن استقبال الطلبات',
      empty_cart: 'سلة التسوق فارغة',
      empty_cart_sub: 'تصفح المنتجات وأضف ما يناسبك للسلة',
      cart_empty_title: 'سلتك فارغة حالياً',
      cart_empty_sub: 'لم تقم بإضافة أي منتجات بعد. تصفح متجرنا واختر ما يناسبك لتبدأ طلبك.',
      cart_title: 'سلة المشتريات',
      cart_smart_pairing_title: 'خيارات ومكملات مقترحة مع المنتج:',
      summary_items_total: 'إجمالي المنتجات:',
      cart_subtotal_now: 'المجموع الحالي:',
      cart_back_btn: 'العودة لتعديل المنتجات والسلة',
      btn_browse_menu_order: 'تصفح المنتجات واطلب الآن',
      btn_customize: 'خيارات',
      btn_add: 'إضافة',
      add_to_cart: 'إضافة إلى السلة',
      search_placeholder: 'ابحث عن منتج، ماركة، أو قسم...',
      search_input_ph: 'ابحث عن منتج، ماركة، أو قسم...',
      prep_time_placeholder: 'مثال: شحن خلال 24 ساعة',
      customizer_title: 'تفاصيل واختيارات المنتج',
      customizer_desc: 'اختر المقاس والمواصفات المطلوبة',
      customizer_size_title: 'المقاس / الخيارات',
      customizer_addons_title: 'خيارات إضافية ومكملات',
      customizer_notes_title: 'ملاحظات خاصة على الطلب',
      customizer_notes_placeholder: 'أضف أي ملاحظات خاصة بالتغليف أو الطلب...',
      customizer_notes_ph: 'أضف أي ملاحظات خاصة بالتغليف أو الطلب...',
      cust_notes_placeholder: 'أي تفاصيل خاصة بالتغليف أو التوصيل (اختياري)...',
      order_stepper_step1: 'استلام الطلب',
      order_stepper_step2: 'جاري التغليف',
      order_stepper_step3: 'تم الشحن / مع المندوب',
      order_stepper_step4: 'تم التسليم',
      order_btn_send: 'تأكيد وإرسال الطلب للمتجر',
      menu_language: 'لغة المتجر / Language',
      account_menu_fav: 'المنتجات المفضلة لديك',
      account_whatsapp_title: 'محادثة المتجر عبر الواتساب',
      account_wa_sub: 'تواصل مع خدمة عملاء المتجر مباشرة عبر واتساب',
      account_qr_sub: 'عرض ومسح كود المتجر المميز',
      account_menu_share_sub: 'إرسال رابط المتجر عبر تطبيقات التواصل',
      account_menu_branch: 'تغيير فرع المتجر',
      account_menu_last_order: 'متابعة شحنتك الأخيرة',
      account_menu_last_order_sub: 'عرض حالة الشحن والتفاصيل',
      portfolio_about_title: 'عن المتجر',
      portfolio_about_body: 'نوفر لك تشكيلة مختارة من المنتجات الأصلية بأعلى جودة وأفضل سعر، مع تجهيز وتغليف احترافي وشحن سريع لباب بيتك.',
      portfolio_fresh_title: 'أصلي ومضمون',
      portfolio_fresh_sub: 'بأعلى معايير الجودة',
      portfolio_eta_label: 'مدة الشحن المتوقعة',
      cust_info_heading: 'بيانات التواصل والشحن:',
      orders_wa_support: 'تواصل مع المتجر عبر واتساب',
      orders_history_hint: 'يمكنك إعادة طلب نفس المنتجات بنقرة واحدة!',
      onboard_title: 'أهلاً بك في متجرنا!',
      onboard_save_btn: 'حفظ ومتابعة التسوق',
      qr_modal_title: 'رمز المتجر الرقمي (QR)',
      qr_modal_desc: 'امسح رمز الـ QR بكاميرا الهاتف لفتح المتجر ومشاركته مع الأصدقاء فوراً',
      qr_share_btn: 'مشاركة رابط المتجر',
      branch_picker_desc: 'يرجى تحديد فرع المتجر القريب منك لتجهيز وشحن طلبك بأسرع وقت',
      splash_subtitle: 'جاري تجهيز المتجر...'
    },
    en: {
      nav_menu: 'Store',
      nav_home: 'Home',
      nav_cart: 'Cart',
      nav_orders: 'Orders',
      nav_account: 'Account',
      nav_search: 'Search',
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
      takeaway_banner_title: 'Direct Store Pickup (No Delivery Fee)',
      ful_takeaway_desc: 'Pick up your order directly from our store location',
      add_product: 'Add New Product',
      edit_product: 'Edit Product',
      product_name: 'Product Name',
      item_singular: 'Product',
      items_plural: 'Products',
      store_open_now: 'Store Open',
      store_open_247: 'Open 24/7 for Orders',
      store_open_banner: 'We are accepting orders now with fast shipping',
      store_closed_now: 'Paused',
      store_closed_title: 'Store is Currently Paused',
      store_closed_msg: 'Sorry, we are not accepting new orders right now. Feel free to browse our catalog.',
      store_closed_banner: 'Store is currently paused for orders',
      empty_cart: 'Your shopping cart is empty',
      empty_cart_sub: 'Browse products and add items to your bag',
      cart_empty_title: 'Your cart is empty',
      cart_empty_sub: 'No products added yet. Browse our catalog and choose what you need.',
      cart_title: 'Shopping Bag',
      cart_smart_pairing_title: 'Recommended Additions with Product:',
      summary_items_total: 'Products Total:',
      cart_subtotal_now: 'Current Total:',
      cart_back_btn: 'Back to Edit Products & Bag',
      btn_browse_menu_order: 'Browse Store & Order Now',
      btn_customize: 'Options',
      btn_add: 'Add',
      add_to_cart: 'Add to Cart',
      search_placeholder: 'Search products, brands, or categories...',
      search_input_ph: 'Search products, brands, or categories...',
      prep_time_placeholder: 'e.g. Ships within 24h',
      customizer_title: 'Product Options',
      customizer_desc: 'Choose size and product options',
      customizer_size_title: 'Size / Options',
      customizer_addons_title: 'Additional Options',
      customizer_notes_title: 'Order & Packing Notes',
      customizer_notes_placeholder: 'Add packing or delivery notes...',
      customizer_notes_ph: 'Add packing or delivery notes...',
      cust_notes_placeholder: 'Packing or delivery instructions (optional)...',
      order_stepper_step1: 'Order Received',
      order_stepper_step2: 'Packing Order',
      order_stepper_step3: 'Out for Delivery',
      order_stepper_step4: 'Delivered',
      order_btn_send: 'Confirm & Place Order',
      menu_language: 'Store Language / اللغة',
      account_menu_fav: 'Your Favorite Products',
      account_whatsapp_title: 'Chat with Store on WhatsApp',
      account_wa_sub: 'Contact store support directly on WhatsApp',
      account_qr_sub: 'View and scan our store QR code',
      account_menu_share_sub: 'Share our store link via social apps',
      account_menu_branch: 'Change Store Branch',
      account_menu_last_order: 'Track Your Last Shipment',
      account_menu_last_order_sub: 'View delivery status & details',
      portfolio_about_title: 'About Our Store',
      portfolio_about_body: 'Carefully curated authentic products at great value with secure packaging and fast delivery.',
      portfolio_fresh_title: '100% Authentic',
      portfolio_fresh_sub: 'Highest Quality Standards',
      portfolio_eta_label: 'Estimated Shipping Time',
      cust_info_heading: 'Contact & Shipping Info:',
      orders_wa_support: 'Contact Store on WhatsApp',
      orders_history_hint: 'Reorder the exact same items in one tap!',
      onboard_title: 'Welcome to Our Store!',
      onboard_save_btn: 'Save & Start Shopping',
      qr_modal_title: 'Digital Store QR Code',
      qr_modal_desc: 'Scan this QR code with your phone camera to open and share our store',
      qr_share_btn: 'Share Store Link',
      branch_picker_desc: 'Select your nearest store branch for fast shipping or pickup',
      splash_subtitle: 'Loading storefront...'
    }
  };

  // Ordered longest-first replacements so phrases never partially collide
  const AR_STORE_REPLACEMENTS = [
    ['في مطعمنا بنقدملك طعم أصيل ووصفات مميزة بأجود المكونات وبدون أي تنازلات على الجودة. كل وجبة بتحكي قصة نكهة من قلب المطبخ.', 'نوفر لك تشكيلة مختارة من المنتجات الأصلية بأعلى جودة وأفضل سعر، مع تجهيز وتغليف احترافي وشحن سريع لباب بيتك.'],
    ['طهاة المطعم يجهزون وجبتك الساخنة الآن لتقديمها لطاولتك.', 'فريق المتجر يراجع ويجهز طلبك الآن بعناية.'],
    ['طهاة المطعم يجهزون وجبتك الطازجة الآن بأعلى معايير الجودة.', 'فريق المتجر يجهز ويغلف منتجاتك الآن بأعلى عناية.'],
    ['طهاة المطعم بدأوا في تجهيز وطهي الوجبات', 'فريق المتجر بدأ في تجهيز وتغليف المنتجات'],
    ['طلبك وصل إلى طهاة المطعم وبدأوا بتجهيزه الآن', 'طلبك وصل لفريق المتجر وبدأنا تجهيزه وتغليفه الآن'],
    ['عذراً، المطعم لا يستقبل طلبات جديدة في الوقت الحالي. يمكنك تصفح قائمة الطعام والأسعار بحرية، وسنعاود استقبال الطلبات قريباً!', 'عذراً، المتجر لا يستقبل طلبات جديدة في الوقت الحالي. يمكنك تصفح المنتجات والأسعار بحرية، وسنعاود الاستقبال قريباً!'],
    ['تصفح قائمة الطعام والوجبات أونلاين، واطلب مباشرة بكل سهولة عبر واتساب مع خدمة التوصيل والاستلام.', 'تصفح المنتجات والعروض أونلاين، واطلب مباشرة بكل سهولة مع خدمة الشحن والاستلام.'],
    ['تصفح قائمة الطعام والوجبات أونلاين واطلب مباشرة عبر واتساب.', 'تصفح المنتجات أونلاين واطلب مباشرة بكل سهولة.'],
    ['تظهر هذه النبذة للعملاء في تبويب "الرئيسية" لتعريف الزبائن بالمطعم وجودة المأكولات.', 'تظهر هذه النبذة للعملاء في تبويب "الرئيسية" لتعريف العملاء بالمتجر وجودة المنتجات.'],
    ['لم تقم بإضافة أي وجبات بعد. تصفح قائمتنا الشهية واختر ما تشتهيه لتبدأ طلبك.', 'لم تقم بإضافة أي منتجات بعد. تصفح متجرنا واختر ما يناسبك لتبدأ طلبك.'],
    ['شكراً لطلبك من مطعمنا ونرجو لك وجبة شهية', 'شكراً لتسوقك من متجرنا ونتمنى لك تجربة رائعة'],
    ['بالهناء والشفاء! نتمنى لك تجربة طعام رائعة في ضيافتنا.', 'تم تسليم طلبك بنجاح! شكراً لثقتك في متجرنا.'],
    ['ابدأ بإضافة أول صنف أو وجبة في منيو مطعمك وحدد السعر والصورة والأقسام بسهولة', 'ابدأ بإضافة أول منتج في متجرك وحدد السعر والكمية والصورة والقسم بسهولة'],
    ['بحث سريع عن وجبة، صنف، أو مشروب', 'بحث سريع عن منتج، ماركة، أو قسم...'],
    ['ابحث في المنيو (مثال: برجر، وجبات، صوص)', 'ابحث عن منتج، ماركة، أو قسم...'],
    ['ملاحظة للمطبخ (اختياري: بدون بصل، شطة زيادة...)', 'ملاحظة على الطلب أو التغليف (اختياري)...'],
    ['ملاحظات خاصة للشيف (اختياري)...', 'ملاحظات خاصة بالطلب أو التغليف (اختياري)...'],
    ['يكمل وجبتك (إضافات ومشروبات مقترحة):', 'خيارات ومكملات مقترحة مع المنتج:'],
    ['مكونات الطبق وملاحظات المطبخ', 'وصف ومواصفات المنتج'],
    ['وصف ومكونات الصنف', 'وصف ومواصفات المنتج'],
    ['اكتب تفاصيل المكونات والنكهات', 'اكتب مواصفات وتفاصيل المنتج'],
    ['تكلفة الخامات (المطبخ)', 'تكلفة البضاعة'],
    ['تكلفة الخامات (COGS)', 'تكلفة البضاعة'],
    ['تكلفة استهلاك الخامات (COGS):', 'تكلفة البضاعة المباعة:'],
    ['المطبخ جاهز ونظيف! لا توجد طلبات', 'لا توجد طلبات واردة حالياً'],
    ['← العودة لاختيار أصناف أخرى من المنيو', '← العودة لاختيار منتجات أخرى'],
    ['حفظ وإرسال للمطبخ وطباعة', 'تأكيد الفاتورة وطباعة'],
    ['تم تسليم الوجبات بنجاح وتحصيل الحساب', 'تم تسليم المنتجات بنجاح وتحصيل الحساب'],
    ['تم التسليم بالهناء والشفاء', 'تم تسليم الطلب بنجاح'],
    ['يتم طهي وتغليف الوجبات الطازجة لك', 'يتم تجهيز وتغليف المنتجات المطلوبة لك'],
    ['المطبخ يجهز طلبك الآن', 'جاري تجهيز وتغليف طلبك الآن'],
    ['بدء التجهيز بالمطبخ', 'بدء التجهيز والتغليف'],
    ['طلبات المطبخ والتجهيز', 'الطلبات الواردة والتجهيز'],
    ['كاشير الصالة والسفري (POS)', 'كاشير المبيعات (POS)'],
    ['كاشير الصالة والسفري', 'كاشير المبيعات المباشر'],
    ['إدارة المنيو والأصناف', 'إدارة المنتجات والكتالوج'],
    ['أقسام وتصنيفات المنيو', 'أقسام وتصنيفات المتجر'],
    ['تنظيم وترتيب مجموعات الوجبات والأصناف داخل منيو المطعم', 'تنظيم وترتيب أقسام المنتجات داخل المتجر'],
    ['ربط القصة بصنف من المنيو', 'ربط القصة بمنتج من المتجر'],
    ['اضغط لاختيار صنف من المنيو (بدون ربط حالياً)', 'اضغط لاختيار منتج من المتجر (بدون ربط حالياً)'],
    ['ابحث عن صنف بالاسم أو الوصف', 'ابحث عن منتج بالاسم أو الماركة'],
    ['بحث باسم الصنف أو الوصف', 'بحث باسم المنتج أو الوصف'],
    ['ظهور الصنف في المنيو (متاح للزبائن)', 'ظهور المنتج في المتجر (متاح للعملاء)'],
    ['إبراز هذا الصنف كاختيار رئيسي (Hero)', 'إبراز هذا المنتج كمنتج مميز (Hero)'],
    ['تشغيل المطعم، مواعيد العمل والطباعة الحرارية', 'تشغيل المتجر، الشحن والطباعة الحرارية'],
    ['التحكم في فتح وإغلاق استقبال الطلبات، أوقات العمل التقديرية، وإعدادات طابعات فواتير الكاشير والمطبخ.', 'التحكم في فتح وإغلاق استقبال الطلبات، مدة الشحن، سياسة الاسترجاع، وإعدادات طابعات الفواتير.'],
    ['إيقاف استقبال الطلبات مؤقتاً (المطعم مغلق حالياً)', 'إيقاف استقبال الطلبات مؤقتاً (المتجر متوقف حالياً)'],
    ['المطعم متوقف حالياً عن استقبال الطلبات', 'المتجر متوقف حالياً عن استقبال الطلبات'],
    ['إعداد المطعم في انتظار الاستكمال', 'إعداد المتجر في انتظار الاستكمال'],
    ['يرجى ضبط اسم المطعم ورقم الواتساب لاستقبال طلبات الزبائن مباشرة:', 'يرجى ضبط اسم المتجر ورقم الواتساب لاستقبال طلبات العملاء مباشرة:'],
    ['انتهت صلاحية اشتراك هذا المطعم', 'انتهت صلاحية اشتراك هذا المتجر'],
    ['حساب المطعم مجمّد / موقوف مؤقتاً', 'حساب المتجر مجمّد / موقوف مؤقتاً'],
    ['استعادة المنيو الافتراضي الأولي', 'استعادة بيانات المتجر الافتراضية'],
    ['أشهى المشويات، البرجر الفاخر', 'براند متخصص في تقديم أفضل المنتجات'],
    ['فروع المطاعم المتصلة', 'فروع المتجر المتصلة'],
    ['هوية المطعم والشعار وصور الواجهة', 'هوية المتجر والشعار وصور الواجهة'],
    ['عن المطعم وقصتنا (تظهر في الرئيسية)', 'عن المتجر وقصتنا (تظهر في الرئيسية)'],
    ['عن المطعم وقصتنا', 'عن المتجر وقصتنا'],
    ['سجّل فروع مطعمك المختلفة لتتيح للزبائن في الديلفري اختيار أقرب فرع', 'سجّل فروع متجرك المختلفة لتتيح للعملاء اختيار أقرب فرع'],
    ['التوصيل والطاولات والفروع', 'الشحن والتوصيل والفروع'],
    ['معاينة المنيو للزبائن', 'معاينة المتجر للعملاء'],
    ['معاينة المنيو', 'معاينة المتجر'],
    ['استلام من فرع المطعم', 'استلام من المتجر'],
    ['استلام من كاونتر المطعم', 'استلام من مقر المتجر'],
    ['سفري (تيك أواي)', 'استلام من المتجر'],
    ['طلب سفري (تيك أواي) — استلام من الفرع', 'استلام مباشر من المتجر'],
    ['إعادة للمطبخ', 'إعادة للطلبات النشطة'],
    ['المنيو والمخزون', 'المنتجات والأقسام'],
    ['المنيو الإلكتروني', 'المتجر الإلكتروني'],
    ['قائمة الطعام والوجبات', 'المنتجات والكتالوج'],
    ['قائمة الطعام والطلبات', 'المتجر والطلبات'],
    ['قائمة الطعام', 'قائمة المنتجات'],
    ['تصفح المنيو', 'تصفح المنتجات'],
    ['في المطبخ', 'جاري التغليف'],
    ['ملاحظات خاصة للشيف', 'ملاحظات خاصة للطلب'],
    ['أهلاً بك في مطعمنا!', 'أهلاً بك في متجرنا!'],
    ['طازج يوميًا', 'أصلي ومضمون'],
    ['بمكونات عالية الجودة', 'بأعلى معايير الجودة'],
    ['الوقت المتوقع للتوصيل', 'مدة الشحن المتوقعة'],
    ['تصفح قائمة الطعام والأسعار', 'تصفح المنتجات والأسعار'],
    ['تصفح قائمة الطعام والوجبات', 'تصفح المنتجات والعروض'],
    ['تصفح قائمة الطعام', 'تصفح المنتجات'],
    ['تم إرسال الطلب وإخطار كاشير المطعم فوراً', 'تم إرسال الطلب وإخطار فريق المتجر فوراً'],
    ['إعادة فتح الطلب وإرجاعه لشاشة المطبخ النشطة', 'إعادة فتح الطلب وإرجاعه لقائمة الطلبات النشطة'],
    ['تمت إعادة الطلب إلى شاشة المطبخ النشطة', 'تمت إعادة الطلب إلى قائمة الطلبات النشطة'],
    ['شاشة المطبخ النشطة', 'قائمة الطلبات النشطة'],
    ['إبقاء الشاشة مضاءة أثناء العمل في المطبخ', 'إبقاء الشاشة مضاءة أثناء العمل وتجهيز الطلبات'],
    ['اسم الوجبة', 'اسم المنتج'],
    ['تخصيص الوجبة', 'تفاصيل المنتج'],
    ['وجبتك المفضلة', 'منتجك المفضّل'],
    ['اسم المطعم الحالي:', 'اسم المتجر الحالي:'],
    ['اسم المطعم مطلوب', 'اسم المتجر مطلوب'],
    ['اسم المطعم', 'اسم المتجر'],
    ['شعار المطعم', 'شعار المتجر'],
    ['غلاف المطعم', 'غلاف المتجر'],
    ['عن المطعم', 'عن المتجر'],
    ['فرع المطعم', 'فرع المتجر'],
    ['تواصل مع المطعم', 'تواصل مع المتجر'],
    ['محادثة المطعم', 'محادثة المتجر'],
    ['إدارة المطعم', 'إدارة المتجر'],
    ['المطعم مفتوح', 'المتجر متاح'],
    ['المطعم مغلق', 'المتجر متوقف'],
    ['فتح المنيو', 'فتح المتجر'],
    ['نسخ رابط المنيو', 'نسخ رابط المتجر'],
    ['كود المنيو', 'كود المتجر'],
    ['رابط المنيو', 'رابط المتجر'],
    ['أقسام المنيو', 'أقسام المتجر'],
    ['صنف من المنيو', 'منتج من المتجر'],
    ['حذف صنف من المنيو', 'حذف منتج من المتجر'],
    ['إضافة صنف جديد', 'إضافة منتج جديد'],
    ['تعديل الصنف', 'تعديل المنتج'],
    ['اسم الصنف', 'اسم المنتج'],
    ['إظهار الصنف في المنيو', 'إظهار المنتج في المتجر'],
    ['إخفاء الصنف من المنيو', 'إخفاء المنتج من المتجر'],
    ['صنف جديد', 'منتج جديد'],
    ['الأصناف المختارة', 'المنتجات المختارة'],
    ['الأصناف والأقسام', 'المنتجات والأقسام'],
    ['الأصناف', 'المنتجات'],
    ['الصنف', 'المنتج'],
    ['0 صنف', '0 منتج'],
    ['اضغط على أي صنف', 'اضغط على أي منتج'],
    ['وجبات', 'منتجات'],
    ['وجبة', 'منتج'],
    ['مطبخنا', 'متجرنا'],
    ['مطعمنا', 'متجرنا'],
    ['مطعمك', 'متجرك'],
    ['المطعم', 'المتجر'],
    ['مطعم', 'متجر'],
    ['المنيو قيد الإعداد', 'المتجر قيد الإعداد'],
    ['لغة المنيو', 'لغة المتجر'],
    ['المنيو', 'المتجر'],
    ['منيو', 'المتجر'],
    ['المطبخ', 'قسم التجهيز'],
    ['مطبخ', 'تجهيز']
  ];

  const EN_STORE_REPLACEMENTS = [
    ['Our Kitchen', 'Our Store'],
    ['In Kitchen', 'Packing Order'],
    ['Restaurant Menu', 'Online Store'],
    ['Browse Menu', 'Browse Products'],
    ['Menu', 'Store'],
    ['Kitchen', 'Fulfillment'],
    ['Meal', 'Product'],
    ['Meals', 'Products'],
    ['Restaurant', 'Store']
  ];

  function getBusinessType(settings) {
    const s = settings || (typeof window.Store !== 'undefined' && window.Store && typeof window.Store.getSettings === 'function' ? window.Store.getSettings() : {}) || {};
    if (s.businessType === 'store') return 'store';
    if (typeof document !== 'undefined' && document.documentElement && document.documentElement.getAttribute('data-business-type') === 'store') return 'store';
    return 'restaurant';
  }

  function isStoreMode(settings) {
    return getBusinessType(settings) === 'store';
  }

  function getTerm(key, lang, settings) {
    if (!isStoreMode(settings)) return null;
    const isEn = (lang === 'en') || (typeof lang === 'undefined' && window.I18n && typeof window.I18n.getLanguage === 'function' && window.I18n.getLanguage() === 'en');
    const dict = isEn ? STORE_TERMINOLOGY.en : STORE_TERMINOLOGY.ar;
    return dict[key] || null;
  }

  function getStatusLabel(statusKey, lang, settings) {
    return getTerm('status_' + statusKey, lang, settings);
  }

  function adaptText(text, lang, settings) {
    if (!text || typeof text !== 'string') return text;
    if (!isStoreMode(settings)) return text;
    const isEn = (lang === 'en') || (typeof lang === 'undefined' && window.I18n && typeof window.I18n.getLanguage === 'function' && window.I18n.getLanguage() === 'en');
    const pairs = isEn ? EN_STORE_REPLACEMENTS : AR_STORE_REPLACEMENTS;
    let out = text;
    for (let i = 0; i < pairs.length; i++) {
      if (out.includes(pairs[i][0])) {
        out = out.split(pairs[i][0]).join(pairs[i][1]);
      }
    }
    return out;
  }

  let _applyingTerminology = false;
  let _termObserverAttached = false;
  let _termTimer = null;

  function applyTerminology(settings) {
    if (typeof document === 'undefined' || _applyingTerminology) return;
    const s = settings || (window.Store && typeof window.Store.getSettings === 'function' ? window.Store.getSettings() : {}) || {};
    const bType = getBusinessType(s);
    const isStore = (bType === 'store');
    const lang = (window.I18n && typeof window.I18n.getLanguage === 'function') ? window.I18n.getLanguage() : 'ar';

    document.documentElement.setAttribute('data-business-type', bType);
    if (document.body) document.body.setAttribute('data-business-type', bType);

    if (!isStore) return;

    _applyingTerminology = true;
    try {
      // 1. Update data-i18n / data-i18n-placeholder / data-i18n-title elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        const term = getTerm(k, lang, s);
        if (term) el.textContent = term;
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const k = el.getAttribute('data-i18n-placeholder');
        const term = getTerm(k, lang, s);
        if (term) el.setAttribute('placeholder', term);
      });
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const k = el.getAttribute('data-i18n-title');
        const term = getTerm(k, lang, s);
        if (term) {
          el.setAttribute('title', term);
          el.setAttribute('aria-label', term);
        }
      });

      // 2. Replace restaurant showcase cover image if no custom store cover was uploaded
      const coverImg = document.getElementById('portfolio-cover-img');
      if (coverImg && coverImg.getAttribute('src') && coverImg.getAttribute('src').includes('order_restaurant_showcase.jpg') && !s.coverImage && !s.coverUrl) {
        coverImg.style.display = 'none';
        if (coverImg.parentElement) coverImg.parentElement.classList.add('store-default-cover');
      }

      // 3. Whole-DOM safe TreeWalker pass over text nodes & interactive attributes
      if (document.body && typeof document.createTreeWalker === 'function') {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            const p = node.parentElement;
            if (!p) return NodeFilter.FILTER_REJECT;
            const tag = p.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
            if (p.closest('#set-store-name, #set-store-tagline, #set-about-text, .food-item-title, .food-item-desc')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        });
        let node;
        while ((node = walker.nextNode())) {
          const next = adaptText(node.nodeValue, lang, s);
          if (next !== node.nodeValue) node.nodeValue = next;
        }

        // Adapt placeholder, title, alt, aria-label attributes
        document.querySelectorAll('[placeholder], [title], [alt], [aria-label]').forEach(el => {
          ['placeholder', 'title', 'alt', 'aria-label'].forEach(attr => {
            const val = el.getAttribute(attr);
            if (!val) return;
            const adapted = adaptText(val, lang, s);
            if (adapted !== val) el.setAttribute(attr, adapted);
          });
        });
      }

      // 4. Update page <title> & meta descriptions
      try {
        const storeName = (s.storeName || s.name || '').split('|')[0].trim();
        const onCustomDomain = !isPlatformHost(window.location.hostname);
        if (storeName) {
          if (document.title && (document.title.includes('منيو') || document.title.includes('طعام') || document.title.includes('مطعم') || onCustomDomain)) {
            const isAdmin = /\/admin(\/|$|\.html)/i.test(window.location.pathname || '');
            document.title = isAdmin ? `لوحة إدارة ${storeName}` : `${storeName} — ${getTerm('nav_menu', lang, s)}`;
          }
        }
      } catch (e) {}

      // 5. Update bottom nav menu tab & live preview button attributes
      try {
        const navMenuBtn = document.getElementById('nav-tab-menu');
        if (navMenuBtn) {
          navMenuBtn.setAttribute('title', (lang === 'en') ? 'Browse Store' : 'تصفح المتجر والمنتجات');
          navMenuBtn.setAttribute('aria-label', (lang === 'en') ? 'Store' : 'المتجر');
        }
        const livePrev = document.getElementById('btn-live-preview');
        if (livePrev) {
          const pLbl = livePrev.querySelector('.preview-btn-label');
          livePrev.setAttribute('title', (lang === 'en') ? 'Preview Live Store' : 'معاينة المتجر الحي');
          if (pLbl) pLbl.textContent = (lang === 'en') ? 'Store Preview' : 'معاينة المتجر';
        }
      } catch (e) {}

      const splashLogoFallback = document.getElementById('splash-brand-bag-fallback');
      if (splashLogoFallback) splashLogoFallback.style.display = 'inline-flex';
    } finally {
      _applyingTerminology = false;
    }

    // 5. Watch future dynamic renders (throttled) so late modals/cards never flash restaurant words
    if (!_termObserverAttached && document.body && typeof MutationObserver === 'function') {
      _termObserverAttached = true;
      const obs = new MutationObserver(() => {
        if (_applyingTerminology) return;
        if (_termTimer) clearTimeout(_termTimer);
        _termTimer = setTimeout(() => {
          applyTerminology();
        }, 60);
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
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
    adaptText,
    getStatusLabel,
    applyTerminology
  };
})(window);
