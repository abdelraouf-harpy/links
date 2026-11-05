/**
 * Harpy Order — Dynamic Module Enforcer & Realtime SaaS Synchronization
 * Instantaneous, sub-50ms enforcement across Admin and Client screens.
 * Zero Emojis — Precision SVG only.
 */
(function() {
  'use strict';

  const ModuleEnforcer = {
    modules: {},
    currentSlug: null,
    fbBase: 'https://harpy-order-default-rtdb.firebaseio.com',
    eventSource: null,
    dbListenersAttached: false,
    styleElement: null,

    init() {
      // 1. Identify active restaurant slug
      this.currentSlug = this.detectSlug();
      if (!this.currentSlug) return;

      // 2. Initial synchronous read from cache
      this.applyFromCache();

      // 3. Setup injected dynamic stylesheet
      this.setupStyleSheet();

      // 4. Attach Real-Time Listeners (Firebase WebSocket + SSE Stream)
      this.initRealtimeListeners();

      // 5. Watch local store events
      this.watchLocalEvents();

      // 6. Global Broadcast Receiver for Admin screens
      if (window.location.pathname.includes('/admin') || document.querySelector('.admin-drawer-nav')) {
        this.initBroadcastReceiver();
      }

      // 7. License & Subscription Status Gate
      this.checkSubscriptionGate();
    },

    detectSlug() {
      const params = new URLSearchParams(window.location.search);
      let s = params.get('m') || params.get('slug');
      if (s) return s.toLowerCase().trim();

      if (window.Store && typeof window.Store.getRestaurantSlug === 'function') {
        const storeSlug = window.Store.getRestaurantSlug();
        if (storeSlug) return storeSlug.toLowerCase().trim();
      }

      s = localStorage.getItem('harpy_admin_active_slug') ||
          localStorage.getItem('harpy_active_slug') ||
          localStorage.getItem('harpy_last_visited_slug') ||
          sessionStorage.getItem('harpy_active_slug');
      return s ? s.toLowerCase().trim() : null;
    },

    setupStyleSheet() {
      if (!this.styleElement) {
        this.styleElement = document.getElementById('harpy-module-enforcer-styles');
        if (!this.styleElement) {
          this.styleElement = document.createElement('style');
          this.styleElement.id = 'harpy-module-enforcer-styles';
          document.head.appendChild(this.styleElement);
        }
      }
    },

    applyFromCache() {
      if (!this.currentSlug) return;
      try {
        if (window.Store && typeof window.Store.getSettings === 'function') {
          const st = window.Store.getSettings();
          if (st && st.modules) {
            this.enforce(st.modules);
            return;
          }
        }
        const raw = localStorage.getItem(`harpy_${this.currentSlug}_settings`);
        if (raw) {
          const s = JSON.parse(raw);
          if (s && s.modules) {
            this.enforce(s.modules);
          }
        }
      } catch(e) {}
    },

    initRealtimeListeners() {
      if (!this.currentSlug || this.currentSlug === 'demo') return;
      const slug = this.currentSlug;

      // ── Method A: Firebase RTDB WebSocket (Sub-50ms latency) ──
      const attachFirebaseListeners = () => {
        if (this.dbListenersAttached) return;
        if (window.firebase && typeof window.firebase.database === 'function') {
          try {
            const db = window.firebase.database();

            // 1. Listen to restaurants/{slug}/settings/modules
            const modRef = db.ref(`restaurants/${slug}/settings/modules`);
            modRef.on('value', (snap) => {
              const mods = snap ? snap.val() : null;
              if (mods && typeof mods === 'object') {
                this.enforce(mods);
              }
            });

            // 2. Listen to licenses/{slug}/modules
            const licModRef = db.ref(`licenses/${slug}/modules`);
            licModRef.on('value', (snap) => {
              const mods = snap ? snap.val() : null;
              if (mods && typeof mods === 'object') {
                this.enforce(mods);
              }
            });

            // 3. Listen to licenses/{slug} for instant freeze/suspension
            const licRef = db.ref(`licenses/${slug}`);
            licRef.on('value', (snap) => {
              const lic = snap ? snap.val() : null;
              if (lic && typeof lic === 'object') {
                this.applyLicense(lic);
              }
            });

            this.dbListenersAttached = true;
          } catch(e) {}
        }
      };

      attachFirebaseListeners();
      if (!this.dbListenersAttached) {
        let attempts = 0;
        const retryTimer = setInterval(() => {
          attempts++;
          attachFirebaseListeners();
          if (this.dbListenersAttached || attempts > 25) clearInterval(retryTimer);
        }, 400);
      }

      // ── Method B: Native Server-Sent Events (SSE) Stream ──
      // Instant push redundancy from Firebase RTDB over HTTP
      try {
        if (typeof EventSource !== 'undefined') {
          if (this.eventSource) {
            try { this.eventSource.close(); } catch(e) {}
          }
          const sseUrl = `${this.fbBase}/restaurants/${slug}/settings/modules.json`;
          this.eventSource = new EventSource(sseUrl);
          this.eventSource.addEventListener('put', (e) => {
            try {
              const payload = JSON.parse(e.data);
              if (payload && payload.data && typeof payload.data === 'object') {
                this.enforce(payload.data);
              }
            } catch(err) {}
          });
          this.eventSource.addEventListener('patch', (e) => {
            try {
              const payload = JSON.parse(e.data);
              if (payload && payload.data && typeof payload.data === 'object') {
                this.enforce(Object.assign({}, this.modules, payload.data));
              }
            } catch(err) {}
          });
        }
      } catch(e) {}

      // ── Method C: Fast REST Fetch on Startup ──
      fetch(`${this.fbBase}/restaurants/${slug}/settings/modules.json?cb=${Date.now()}`)
        .then(r => r.ok ? r.json() : null)
        .then(mods => {
          if (mods && typeof mods === 'object') this.enforce(mods);
        })
        .catch(() => {});
    },

    watchLocalEvents() {
      // 1. Hook into Store
      if (window.Store && typeof window.Store.on === 'function') {
        window.Store.on('settings', (st) => {
          if (st && st.modules) this.enforce(st.modules);
        });
      }

      // 2. Listen to custom window store events
      window.addEventListener('store_settings_updated', () => {
        if (window.Store && typeof window.Store.getSettings === 'function') {
          const st = window.Store.getSettings();
          if (st && st.modules) this.enforce(st.modules);
        }
      });

      window.addEventListener('store_stories_updated', () => {
        if (this.modules && this.modules.stories === false) {
          const s = document.getElementById('stories-section');
          if (s) {
            s.style.setProperty('display', 'none', 'important');
            s.innerHTML = '';
          }
        }
      });
    },

    checkSubscriptionGate() {
      if (!this.currentSlug || this.currentSlug === 'demo') return;
      const fetchLicense = () => {
        fetch(`${this.fbBase}/licenses/${this.currentSlug}.json?cb=${Date.now()}`)
          .then(r => r.ok ? r.json() : null)
          .then(lic => {
            if (!lic) return;
            this.applyLicense(lic);
          })
          .catch(() => {});
      };

      fetchLicense();
      setInterval(fetchLicense, 10000);
    },

    applyLicense(lic) {
      if (!lic || typeof lic !== 'object') return;
      if (lic.modules && typeof lic.modules === 'object') {
        this.enforce(lic.modules);
      }
      const expTime = lic.expiresAt ? (typeof lic.expiresAt === 'number' ? (lic.expiresAt < 10000000000 ? lic.expiresAt * 1000 : lic.expiresAt) : new Date(lic.expiresAt).getTime()) : 0;
      const isExpired = expTime > 0 && Date.now() > expTime;
      const isSuspended = lic.active === false || lic.suspended === true || lic.status === 'suspended' || lic.status === 'expired' || isExpired;
      const overlay = document.getElementById('subscription-suspended-overlay');
      const backdrop = document.getElementById('subscription-suspended-backdrop');
      if (isSuspended) {
        if (overlay) {
          overlay.classList.add('active');
          overlay.style.setProperty('display', 'block', 'important');
        }
        if (backdrop) {
          backdrop.classList.add('active');
          backdrop.style.setProperty('display', 'block', 'important');
        }
        document.body.classList.add('harpy-account-locked');
      } else {
        if (overlay && !overlay.dataset.expired) {
          overlay.classList.remove('active');
          overlay.style.removeProperty('display');
        }
        if (backdrop && !backdrop.dataset.expired) {
          backdrop.classList.remove('active');
          backdrop.style.removeProperty('display');
        }
        document.body.classList.remove('harpy-account-locked');
      }
    },

    enforce(modules) {
      if (!modules || typeof modules !== 'object') return;
      this.modules = Object.assign({}, this.modules, modules);
      const modHash = JSON.stringify(this.modules);
      if (this._lastEnforcedHash === modHash && this._hasInitiallyEnforced) return;
      this._lastEnforcedHash = modHash;
      this._hasInitiallyEnforced = true;

      const root = document.documentElement;
      const b = document.body;

      // ── 1. Synchronous Root & Body Dataset Flags ──
      const setFlag = (name, val) => {
        const str = String(val !== false);
        root.setAttribute(`data-mod-${name}`, str);
        if (b) b.setAttribute(`data-mod-${name}`, str);
      };

      setFlag('ordering', modules.ordering);
      setFlag('pos', modules.pos);
      setFlag('inventory', modules.inventory);
      setFlag('stories', modules.stories);
      setFlag('tables', modules.smartTables);
      setFlag('delivery', modules.delivery);
      setFlag('takeaway', modules.takeaway);
      setFlag('payments', modules.onlinePayment);
      setFlag('archive', modules.archive);
      setFlag('coupons', modules.coupons);
      setFlag('cart-discount', modules.cartDiscount);
      setFlag('announcement', modules.announcementBar);
      setFlag('branches', modules.branches);
      setFlag('reviews', modules.reviews);

      // ── 2. Inject Dynamic CSS Rules for Zero-Latency DOM Suppression ──
      this.setupStyleSheet();
      let cssRules = [];

      if (modules.ordering === false) {
        // Client: Suppress all ordering, cart, checkout, call-waiter elements
        cssRules.push('#nav-tab-cart, .nav-tab-cart, #desktop-nav-cart, #desktop-cart-badge, #cart-drawer, #cart-drawer-backdrop, .btn-quick-add, .qty-stepper, #btn-add-customized-cart, .btn-add-cart, [data-action="add-to-cart"], #bottom-cart-bar, #floating-cart-btn, .customizer-footer-action, #cart-flow-fulfillment, .cart-flow-section, #table-call-waiter, .product-card-counter, .cart-float, #btn-open-cart, .cart-counter, .cart-dock, .order-action-btn, #cart-bar { display: none !important; }');
        // Client: Suppress orders tab, account tab, and customer onboarding modal in digital menu mode
        cssRules.push('#nav-tab-orders, #nav-tab-account, #desktop-nav-orders, #desktop-nav-account, #customer-onboard-modal, #customer-onboard-backdrop { display: none !important; }');
        // Client: Refine bottom nav bar for 2 tabs (الرئيسية and المنيو)
        cssRules.push('.bottom-nav-bar { justify-content: space-evenly !important; max-width: 360px !important; margin-inline: auto !important; border-radius: 20px 20px 0 0 !important; }');
        cssRules.push('.bottom-nav-bar #nav-tab-menu { flex: 1 1 0 !important; width: auto !important; height: 100% !important; min-width: 0 !important; border-radius: 12px !important; margin: 0 !important; transform: none !important; box-shadow: none !important; background: transparent !important; color: var(--text-muted, #78716c) !important; padding: 6px 0 4px !important; }');
        cssRules.push('.bottom-nav-bar #nav-tab-menu .nav-tab-icon { width: auto !important; height: auto !important; }');
        cssRules.push('.bottom-nav-bar #nav-tab-menu .nav-tab-icon svg { stroke: currentColor !important; width: 20px !important; height: 20px !important; }');
        cssRules.push('.bottom-nav-bar #nav-tab-menu .nav-tab-label { color: inherit !important; font-size: 11px !important; font-weight: 700 !important; }');
        cssRules.push('.bottom-nav-bar #nav-tab-menu.active { color: var(--primary, #ea580c) !important; font-weight: 800 !important; }');
        cssRules.push('.bottom-nav-bar #nav-tab-home.active { color: var(--primary, #ea580c) !important; font-weight: 800 !important; }');

        // Admin: Suppress kitchen orders, POS cashier, archive, and operational group header
        cssRules.push('button[data-tab="tab-orders"], #drawer-nav-orders, #tab-orders, button[data-tab="tab-pos"], #drawer-nav-pos, #tab-pos, button[data-tab="tab-archive"], #drawer-nav-archive, #tab-archive, .drawer-nav-group-title:first-of-type { display: none !important; }');

        // Admin Menu-Only mode: hide settings and backup unless explicitly enabled
        if (modules.settings === false || modules.settings === undefined) {
          cssRules.push('button[data-tab="tab-settings"], #tab-settings { display: none !important; }');
        }
        if (modules.backup === false || modules.backup === undefined) {
          cssRules.push('button[data-tab="tab-backup"], #tab-backup { display: none !important; }');
        }
        if ((modules.settings === false || modules.settings === undefined) && (modules.backup === false || modules.backup === undefined)) {
          cssRules.push('.drawer-nav-group-title:last-of-type { display: none !important; }');
        }
        if (modules.inventory === false && modules.stories === false) {
          cssRules.push('.drawer-nav-group-title:nth-of-type(2) { display: none !important; }');
        }
      }

      if (modules.pos === false) {
        cssRules.push('button[data-tab="tab-pos"], [data-nav="pos"], #drawer-nav-pos, #tab-pos { display: none !important; }');
      }
      if (modules.inventory === false) {
        cssRules.push('button[data-tab="tab-inventory"], [data-nav="inventory"], #drawer-nav-inventory, #tab-inventory { display: none !important; }');
      }
      if (modules.stories === false) {
        cssRules.push('button[data-tab="tab-stories"], [data-nav="stories"], #drawer-nav-stories, #tab-stories, #card-story-management, #stories-section, .stories-container, #stories-modal, .story-bubble, .story-ring { display: none !important; }');
      }
      const isTablesDisabled = (modules.smartTables === false || modules.tables === false);
      if (isTablesDisabled) {
        cssRules.push('#card-tables-management, #btn-add-new-table, #admin-tables-list, #fulfillment-tab-dinein, [data-type="dinein"], #dinein-table-box, #table-number-input, .table-picker-modal, #table-indicator-pill { display: none !important; }');
      }
      if (modules.delivery === false) {
        cssRules.push('#card-delivery-management, #fulfillment-tab-delivery, [data-type="delivery"], #delivery-address-box, #delivery-zone-select, #hero-chip-delivery, .delivery-badge, #delivery-fee-row { display: none !important; }');
      }
      if (modules.takeaway === false) {
        cssRules.push('#fulfillment-tab-takeaway, [data-type="takeaway"], #takeaway-time-box { display: none !important; }');
      }
      if (modules.onlinePayment === false) {
        cssRules.push('#card-wallets-management, #pay-wallet-option, .payment-option-online, [data-payment-method="online"], #wallet-transfer-box, #wallet-details-box, #wallet-discount-row { display: none !important; }');
      }
      if (modules.archive === false) {
        cssRules.push('button[data-tab="tab-archive"], [data-nav="archive"], #drawer-nav-archive, #tab-archive, #archive-badge-count { display: none !important; }');
      }
      if (modules.coupons === false) {
        cssRules.push('#box-promo-codes-settings, #promo-box-wrap, #promo-input-container, .coupon-section, #coupon-box, .cart-coupon-row, .coupon-trigger-btn, #promo-discount-row { display: none !important; }');
      }
      if (modules.cartDiscount === false) {
        cssRules.push('#box-spend-tier-settings, #spend-tier-card, #spend-tier-progress-card, #spend-tier-discount-row, .cart-tier-discount-row { display: none !important; }');
      }
      if (modules.announcementBar === false) {
        cssRules.push('#box-announcement-settings, #promo-deal-card, .promo-announcement-bar, #announcement-bar, .promo-banner-ticker, #hero-announcement { display: none !important; }');
      }
      if (modules.coupons === false && modules.cartDiscount === false && modules.announcementBar === false) {
        cssRules.push('#card-promotions-management { display: none !important; }');
      }
      if (modules.branches === false) {
        cssRules.push('#card-branches-management, #drawer-branches-widget, #drawer-branches-toggle-btn, #header-branch-pill, #account-branch-item, #branch-picker-backdrop, #branch-picker-modal, #takeaway-branch-address { display: none !important; }');
      }
      if (modules.reviews === false) {
        cssRules.push('#reviews-section, .reviews-section, #ratings-modal, .customer-reviews-wrap, #hero-chip-rating, .pill-rating, .highlight-rating, [data-i18n="portfolio_rating_label"] { display: none !important; }');
      }
      if (modules.delivery === false && modules.takeaway === false && isTablesDisabled) {
        cssRules.push('#cart-flow-fulfillment, #fulfillment-segmented-control { display: none !important; }');
      }

      if (this.styleElement) {
        this.styleElement.textContent = cssRules.join('\n');
      }

      // ── 3. Direct Inline DOM Manipulation (Fail-safe) ──

      // Ordering Module (Zero-Ordering / View-Only Digital Menu Mode)
      if (modules.ordering === false) {
        document.querySelectorAll('#nav-tab-cart, .nav-tab-cart, #desktop-nav-cart, #desktop-cart-badge, #bottom-cart-bar, #floating-cart-btn, #nav-tab-orders, #nav-tab-account, #desktop-nav-orders, #desktop-nav-account').forEach(el => {
          el.style.setProperty('display', 'none', 'important');
        });
        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
          cartDrawer.classList.remove('open');
          cartDrawer.style.setProperty('display', 'none', 'important');
        }
        const cartBackdrop = document.getElementById('cart-drawer-backdrop');
        if (cartBackdrop) {
          cartBackdrop.classList.remove('open');
          cartBackdrop.style.setProperty('display', 'none', 'important');
        }
        document.body.classList.remove('cart-drawer-open');

        // Dismiss client onboarding modal if open
        if (typeof window.closeCustomerOnboardModal === 'function') {
          window.closeCustomerOnboardModal(false, false);
        }

        // Admin: Switch to tab-products if currently on an operational/disabled tab
        if (typeof window.switchTab === 'function') {
          const disabledTabs = ['tab-orders', 'tab-pos', 'tab-archive'];
          if (modules.inventory === false) disabledTabs.push('tab-inventory');
          if (modules.stories === false) disabledTabs.push('tab-stories');
          if (modules.settings === false || modules.settings === undefined) disabledTabs.push('tab-settings');
          if (modules.backup === false || modules.backup === undefined) disabledTabs.push('tab-backup');
          if (disabledTabs.includes(window.currentTab) || !window.currentTab) {
            window.switchTab('tab-products', false);
          }
        }
      }

      // POS Module (Nav triggers separated from pane to prevent pane leak)
      const posNavElements = document.querySelectorAll('button[data-tab="tab-pos"], [data-nav="pos"], #drawer-nav-pos');
      const posPane = document.getElementById('tab-pos');
      if (modules.pos === false) {
        posNavElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (posPane) {
          posPane.style.setProperty('display', 'none', 'important');
          posPane.classList.remove('active');
        }
        const activePosBtn = document.querySelector('button[data-tab="tab-pos"].active');
        if (activePosBtn) {
          const ordersBtn = document.querySelector('button[data-tab="tab-orders"]');
          if (ordersBtn) ordersBtn.click();
        }
      } else {
        posNavElements.forEach(el => el.style.removeProperty('display'));
        if (posPane && (!window.currentTab || window.currentTab !== 'tab-pos')) {
          posPane.style.setProperty('display', 'none', 'important');
          posPane.classList.remove('active');
        }
      }

      // Inventory Module (Nav triggers separated from pane to prevent pane leak)
      const invNavElements = document.querySelectorAll('button[data-tab="tab-inventory"], [data-nav="inventory"], #drawer-nav-inventory');
      const invPane = document.getElementById('tab-inventory');
      if (modules.inventory === false) {
        invNavElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (invPane) {
          invPane.style.setProperty('display', 'none', 'important');
          invPane.classList.remove('active');
        }
        const activeInvBtn = document.querySelector('button[data-tab="tab-inventory"].active');
        if (activeInvBtn) {
          const ordersBtn = document.querySelector('button[data-tab="tab-orders"]');
          if (ordersBtn) ordersBtn.click();
        }
      } else {
        invNavElements.forEach(el => el.style.removeProperty('display'));
        if (invPane && (!window.currentTab || window.currentTab !== 'tab-inventory')) {
          invPane.style.setProperty('display', 'none', 'important');
          invPane.classList.remove('active');
        }
      }

      // Stories Module (Nav triggers separated from pane to prevent pane leak)
      const storiesNavElements = document.querySelectorAll('button[data-tab="tab-stories"], [data-nav="stories"], #drawer-nav-stories, #card-story-management');
      const storiesPane = document.getElementById('tab-stories');
      const storiesClientWrap = document.getElementById('stories-section');
      if (modules.stories === false) {
        storiesNavElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (storiesPane) {
          storiesPane.style.setProperty('display', 'none', 'important');
          storiesPane.classList.remove('active');
        }
        if (storiesClientWrap) {
          storiesClientWrap.style.setProperty('display', 'none', 'important');
          storiesClientWrap.innerHTML = '';
        }
        const activeStoriesBtn = document.querySelector('button[data-tab="tab-stories"].active');
        if (activeStoriesBtn) {
          const ordersBtn = document.querySelector('button[data-tab="tab-orders"]');
          if (ordersBtn) ordersBtn.click();
        }
      } else {
        storiesNavElements.forEach(el => el.style.removeProperty('display'));
        if (storiesPane && (!window.currentTab || window.currentTab !== 'tab-stories')) {
          storiesPane.style.setProperty('display', 'none', 'important');
          storiesPane.classList.remove('active');
        }
      }

      // Smart Tables Module
      const tableTabs = document.querySelectorAll('#fulfillment-tab-dinein, [data-type="dinein"], #dinein-table-box, #table-number-input, .table-picker-modal, #table-indicator-pill');
      const cardTablesSettings = document.getElementById('card-tables-management');
      if (isTablesDisabled) {
        tableTabs.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (cardTablesSettings) cardTablesSettings.style.setProperty('display', 'none', 'important');
        if (window.currentFulfillmentType === 'dinein' && typeof window.setFulfillmentType === 'function') {
          window.setFulfillmentType(modules.delivery !== false ? 'delivery' : (modules.takeaway !== false ? 'takeaway' : 'none'));
        }
      } else {
        tableTabs.forEach(el => el.style.removeProperty('display'));
        if (cardTablesSettings) cardTablesSettings.style.removeProperty('display');
      }

      // Delivery Module
      const deliveryTabs = document.querySelectorAll('#fulfillment-tab-delivery, [data-type="delivery"], #delivery-address-box, #delivery-zone-select, #hero-chip-delivery, .delivery-badge, #delivery-fee-row');
      const cardDeliverySettings = document.getElementById('card-delivery-management');
      if (modules.delivery === false) {
        deliveryTabs.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (cardDeliverySettings) cardDeliverySettings.style.setProperty('display', 'none', 'important');
        if (window.currentFulfillmentType === 'delivery' && typeof window.setFulfillmentType === 'function') {
          window.setFulfillmentType(modules.takeaway !== false ? 'takeaway' : (!isTablesDisabled ? 'dinein' : 'none'));
        }
      } else {
        deliveryTabs.forEach(el => el.style.removeProperty('display'));
        if (cardDeliverySettings) cardDeliverySettings.style.removeProperty('display');
      }

      // Takeaway Module
      const takeawayTabs = document.querySelectorAll('#fulfillment-tab-takeaway, [data-type="takeaway"], #takeaway-time-box');
      if (modules.takeaway === false) {
        takeawayTabs.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (window.currentFulfillmentType === 'takeaway' && typeof window.setFulfillmentType === 'function') {
          window.setFulfillmentType(modules.delivery !== false ? 'delivery' : (!isTablesDisabled ? 'dinein' : 'none'));
        }
      } else {
        takeawayTabs.forEach(el => el.style.removeProperty('display'));
      }

      // All Fulfillments Gate
      const allFulfillmentsDisabled = modules.delivery === false && modules.takeaway === false && isTablesDisabled;
      const cartFulfillmentWrap = document.getElementById('cart-flow-fulfillment');
      const fulfillmentControl = document.getElementById('fulfillment-segmented-control');
      if (allFulfillmentsDisabled) {
        if (cartFulfillmentWrap) cartFulfillmentWrap.style.setProperty('display', 'none', 'important');
        if (fulfillmentControl) fulfillmentControl.style.setProperty('display', 'none', 'important');
      } else {
        if (cartFulfillmentWrap) cartFulfillmentWrap.style.removeProperty('display');
        if (fulfillmentControl) fulfillmentControl.style.removeProperty('display');
      }

      // Online Payment Module
      const onlinePayWraps = document.querySelectorAll('.payment-option-online, [data-payment-method="online"], #wallet-transfer-box, #pay-wallet-option, #wallet-details-box, #wallet-discount-row');
      const cardWalletsSettings = document.getElementById('card-wallets-management');
      const payCodOption = document.getElementById('pay-cod-option');
      if (modules.onlinePayment === false) {
        onlinePayWraps.forEach(w => w.style.setProperty('display', 'none', 'important'));
        if (cardWalletsSettings) cardWalletsSettings.style.setProperty('display', 'none', 'important');
        if (payCodOption && !payCodOption.classList.contains('selected')) {
          payCodOption.classList.add('selected');
          if (typeof window.setPaymentOption === 'function') window.setPaymentOption('cod');
        }
      } else {
        onlinePayWraps.forEach(w => w.style.removeProperty('display'));
        if (cardWalletsSettings) cardWalletsSettings.style.removeProperty('display');
      }

      // Sales Archive Module
      const archiveTabBtn = document.querySelector('button[data-tab="tab-archive"]');
      const archivePane = document.getElementById('tab-archive');
      const archiveBadge = document.getElementById('archive-badge-count');
      if (modules.archive === false) {
        if (archiveTabBtn) archiveTabBtn.style.setProperty('display', 'none', 'important');
        if (archivePane) {
          archivePane.style.setProperty('display', 'none', 'important');
          archivePane.classList.remove('active');
        }
        if (archiveBadge) archiveBadge.style.setProperty('display', 'none', 'important');
        if (archiveTabBtn && archiveTabBtn.classList.contains('active')) {
          const ordersBtn = document.querySelector('button[data-tab="tab-orders"]');
          if (ordersBtn) ordersBtn.click();
        }
      } else {
        if (archiveTabBtn) archiveTabBtn.style.removeProperty('display');
        if (archivePane && (!window.currentTab || window.currentTab !== 'tab-archive')) {
          archivePane.style.setProperty('display', 'none', 'important');
          archivePane.classList.remove('active');
        }
      }

      // Coupons Module
      const couponBoxes = document.querySelectorAll('#coupon-section, .coupon-section, #coupon-box, .cart-coupon-row, .coupon-trigger-btn, #promo-box-wrap, #promo-input-container, #promo-discount-row');
      const boxPromoSettings = document.getElementById('box-promo-codes-settings');
      if (modules.coupons === false) {
        couponBoxes.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (boxPromoSettings) boxPromoSettings.style.setProperty('display', 'none', 'important');
      } else {
        couponBoxes.forEach(el => el.style.removeProperty('display'));
        if (boxPromoSettings) boxPromoSettings.style.removeProperty('display');
      }

      // Cart Discount Module (Spend Tier)
      const cartDiscountElements = document.querySelectorAll('#spend-tier-card, #spend-tier-progress-card, #spend-tier-discount-row, .cart-tier-discount-row');
      const boxSpendTierSettings = document.getElementById('box-spend-tier-settings');
      if (modules.cartDiscount === false) {
        cartDiscountElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (boxSpendTierSettings) boxSpendTierSettings.style.setProperty('display', 'none', 'important');
      } else {
        cartDiscountElements.forEach(el => el.style.removeProperty('display'));
        if (boxSpendTierSettings) boxSpendTierSettings.style.removeProperty('display');
      }

      // Announcement Bar Module
      const announcementElements = document.querySelectorAll('#promo-deal-card, .promo-announcement-bar, #announcement-bar, .promo-banner-ticker, #hero-announcement');
      const boxAnnouncementSettings = document.getElementById('box-announcement-settings');
      if (modules.announcementBar === false) {
        announcementElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (boxAnnouncementSettings) boxAnnouncementSettings.style.setProperty('display', 'none', 'important');
      } else {
        announcementElements.forEach(el => el.style.removeProperty('display'));
        if (boxAnnouncementSettings) boxAnnouncementSettings.style.removeProperty('display');
      }

      // Card 5 Gate: Promotions, Announcements & Coupons
      const cardPromotionsSettings = document.getElementById('card-promotions-management');
      if (cardPromotionsSettings) {
        if (modules.coupons === false && modules.cartDiscount === false && modules.announcementBar === false) {
          cardPromotionsSettings.style.setProperty('display', 'none', 'important');
        } else {
          cardPromotionsSettings.style.removeProperty('display');
        }
      }

      // Multi-Branch Network Module
      const branchElements = document.querySelectorAll('#drawer-branches-widget, #drawer-branches-toggle-btn, #header-branch-pill, #account-branch-item, #branch-picker-backdrop, #branch-picker-modal, #takeaway-branch-address');
      const cardBranchesSettings = document.getElementById('card-branches-management');
      if (modules.branches === false) {
        branchElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (cardBranchesSettings) cardBranchesSettings.style.setProperty('display', 'none', 'important');
      } else {
        branchElements.forEach(el => el.style.removeProperty('display'));
        if (cardBranchesSettings) cardBranchesSettings.style.removeProperty('display');
      }

      // Customer Reviews Module
      const reviewBoxes = document.querySelectorAll('#reviews-section, .reviews-section, #ratings-modal, .customer-reviews-wrap, #hero-chip-rating, .pill-rating, .highlight-rating, [data-i18n="portfolio_rating_label"]');
      if (modules.reviews === false) {
        reviewBoxes.forEach(el => el.style.setProperty('display', 'none', 'important'));
      } else {
        reviewBoxes.forEach(el => el.style.removeProperty('display'));
      }

      // ── 4. Dispatch Instant Notification to Client Engines ──
      window.dispatchEvent(new CustomEvent('harpy_modules_changed', { detail: this.modules }));
    },

    // ── Global Broadcast Receiver for Admin Dashboard ──
    initBroadcastReceiver() {
      const fetchBroadcast = () => {
        fetch(`${this.fbBase}/systemBroadcast.json?cb=${Date.now()}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data && data.active && data.message) {
              this.renderBroadcastBanner(data);
            } else {
              const existing = document.getElementById('harpy-global-broadcast-banner');
              if (existing) existing.remove();
            }
          })
          .catch(() => {});
      };

      fetchBroadcast();
      setInterval(fetchBroadcast, 45000);
    },

    renderBroadcastBanner(data) {
      let banner = document.getElementById('harpy-global-broadcast-banner');
      if (!data || !data.active || !data.message) {
        if (banner) banner.remove();
        return;
      }

      const dismissed = sessionStorage.getItem('dismissed_broadcast_' + data.createdAt);
      if (dismissed) {
        if (banner) banner.remove();
        return;
      }

      const type = data.type || 'info';
      const colors = {
        urgent: { bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.4)', text: 'var(--danger, #ef4444)' },
        maintenance: { bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.4)', text: 'var(--warning, #f59e0b)' },
        feature: { bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.4)', text: 'var(--success, #10b981)' },
        info: { bg: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.4)', text: 'var(--primary, #3b82f6)' }
      }[type] || { bg: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.4)', text: 'var(--primary, #3b82f6)' };

      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'harpy-global-broadcast-banner';
        banner.style.cssText = `
          position: sticky;
          top: 0;
          z-index: 99999;
          width: 100%;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.4;
          box-sizing: border-box;
          direction: rtl;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.25s ease;
        `;
        const adminApp = document.querySelector('.admin-app') || document.body;
        adminApp.insertBefore(banner, adminApp.firstChild);
      }

      banner.style.backgroundColor = colors.bg;
      banner.style.borderBottom = `1px solid ${colors.border}`;
      banner.style.color = colors.text;

      banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${data.message}</span>
        </div>
        <button type="button" id="dismiss-broadcast-btn" style="background:transparent; border:none; color:inherit; cursor:pointer; padding:4px; display:flex; align-items:center; opacity:0.8; margin-right:8px;" aria-label="Dismiss">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      const dismissBtn = banner.querySelector('#dismiss-broadcast-btn');
      if (dismissBtn) {
        dismissBtn.onclick = () => {
          sessionStorage.setItem('dismissed_broadcast_' + data.createdAt, 'true');
          banner.remove();
        };
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.ModuleEnforcer = ModuleEnforcer;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => ModuleEnforcer.init());
    } else {
      ModuleEnforcer.init();
    }
  }
})();
