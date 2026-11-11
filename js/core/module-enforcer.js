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
              } else if (lic === null && slug !== 'demo') {
                fetch(`${this.fbBase}/licenses/${slug}.json?cb=${Date.now()}`, { cache: 'no-store' })
                  .then(r => r.ok ? r.json().then(d => ({ ok: true, d })) : { ok: false })
                  .then(res => {
                    if (res.ok && res.d === null) {
                      this.applyLicense({ status: 'deleted', active: false, suspended: true });
                    } else if (res.ok && res.d && typeof res.d === 'object') {
                      this.applyLicense(res.d);
                    }
                  }).catch(() => {});
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

      // ── Method B: Native Server-Sent Events (SSE) Stream (Fallback only) ──
      const setupSseFallback = () => {
        if (this.dbListenersAttached || this.eventSource) return;
        try {
          if (typeof EventSource !== 'undefined') {
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
      };

      if (!this.dbListenersAttached) {
        setTimeout(setupSseFallback, 3000);
      }

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
      let lastLicFetch = 0;
      const fetchLicense = () => {
        if (typeof document !== 'undefined' && document.hidden) return;
        lastLicFetch = Date.now();
        fetch(`${this.fbBase}/licenses/${this.currentSlug}.json?cb=${Date.now()}`, { cache: 'no-store' })
          .then(r => r.ok ? r.json().then(lic => ({ ok: true, lic })) : { ok: false, lic: null })
          .then(({ ok, lic }) => {
            if (!ok) return;
            if (lic && typeof lic === 'object') {
              this.applyLicense(lic);
            } else if (lic === null && this.currentSlug !== 'demo') {
              this.applyLicense({ status: 'deleted', active: false, suspended: true });
            }
          })
          .catch(() => {});
      };

      fetchLicense();
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden && (Date.now() - lastLicFetch > 60000)) {
            fetchLicense();
          }
        });
      }
      setInterval(fetchLicense, 120000);
    },

    applyLicense(lic) {
      if (!lic || typeof lic !== 'object') return;
      if (lic.modules && typeof lic.modules === 'object') {
        this.enforce(lic.modules);
      }
      let expTime = 0;
      if (lic.expiresAt !== undefined && lic.expiresAt !== null && lic.expiresAt !== 0 && lic.expiresAt !== '0' && lic.expiresAt !== '') {
        if (typeof lic.expiresAt === 'number') {
          expTime = lic.expiresAt < 10000000000 ? lic.expiresAt * 1000 : lic.expiresAt;
        } else if (/^\d+$/.test(String(lic.expiresAt).trim())) {
          const num = Number(lic.expiresAt);
          expTime = num < 10000000000 ? num * 1000 : num;
        } else {
          const parsed = new Date(lic.expiresAt).getTime();
          expTime = isNaN(parsed) ? 0 : parsed;
        }
      }
      const st = String(lic.status || '').toLowerCase();
      const isExpired = (st === 'expired') || (expTime > 0 && Date.now() > expTime);
      const isDeleted = (st === 'deleted');
      const isSuspended = isDeleted || isExpired || lic.active === false || lic.suspended === true || ['suspended', 'blocked', 'inactive'].includes(st);
      const reason = isDeleted ? 'deleted' : (isExpired ? 'expired' : (isSuspended ? 'blocked' : 'active'));

      if (this.currentSlug) {
        try { localStorage.setItem(`harpy_${this.currentSlug}_sub_status`, reason); } catch(e) {}
      }

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
        document.documentElement.classList.add('harpy-account-locked');
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
        document.documentElement.classList.remove('harpy-account-locked');
        document.body.classList.remove('harpy-account-locked');
      }

      try {
        window.dispatchEvent(new CustomEvent('harpy_subscription_status', {
          detail: { active: !isSuspended, reason, lic }
        }));
      } catch(e) {}
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
      setFlag('shifts', modules.shifts);
      setFlag('coupons', modules.coupons);
      setFlag('cart-discount', modules.cartDiscount);
      setFlag('announcement', modules.announcementBar);
      setFlag('branches', modules.branches);
      setFlag('reviews', modules.reviews);
      setFlag('settings', modules.settings);
      setFlag('backup', modules.backup);

      // ── 2. Inject Dynamic CSS Rules for Zero-Latency DOM Suppression ──
      this.setupStyleSheet();
      let cssRules = [];

      if (modules.ordering === false) {
        // Client: Suppress all ordering, cart, checkout, call-waiter elements
        cssRules.push('#nav-tab-cart, .nav-tab-cart, #desktop-nav-cart, #desktop-cart-badge, #cart-drawer, #cart-drawer-backdrop, .btn-quick-add, .qty-stepper, #btn-add-customized-cart, .btn-add-cart, [data-action="add-to-cart"], #bottom-cart-bar, #floating-cart-btn, .customizer-footer-action, #cart-flow-fulfillment, .cart-flow-section, #table-call-waiter, .product-card-counter, .cart-float, #btn-open-cart, .cart-counter, .cart-dock, .order-action-btn, #cart-bar { display: none !important; }');
        // Client: Suppress orders tab, account tab, and customer onboarding modal in digital menu mode
        cssRules.push('#nav-tab-orders, #nav-tab-account, #desktop-nav-orders, #desktop-nav-account, #customer-onboard-modal, #customer-onboard-backdrop { display: none !important; }');
        // Client: Attached Solid Full-Width Bottom Bar for 2 tabs (الرئيسية and المنيو)
        cssRules.push('.bottom-nav-bar { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; max-width: 100% !important; height: calc(56px + env(safe-area-inset-bottom, 0px)) !important; padding: 0 16px env(safe-area-inset-bottom, 0px) 16px !important; border-radius: 0 !important; margin: 0 !important; background: rgba(255, 255, 255, 0.98) !important; backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important; border-top: 1px solid var(--border) !important; box-shadow: 0 -2px 14px rgba(0, 0, 0, 0.05) !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 12px !important; z-index: 1260 !important; transform: none !important; transition: transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.22s ease !important; }');
        cssRules.push('[data-theme="dark"] .bottom-nav-bar { background: rgba(11, 15, 23, 0.98) !important; border-top: 1px solid rgba(255, 255, 255, 0.08) !important; box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.5) !important; }');
        cssRules.push('.bottom-nav-bar .nav-tab-btn { flex: 1 1 0 !important; max-width: 180px !important; height: 42px !important; min-height: 42px !important; min-width: 0 !important; width: auto !important; margin: 0 !important; padding: 0 14px !important; border-radius: 9999px !important; display: inline-flex !important; flex-direction: row !important; align-items: center !important; justify-content: center !important; gap: 8px !important; background: var(--surface-raised, #f1f5f9) !important; color: var(--text-muted, #64748b) !important; box-shadow: none !important; transform: none !important; transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important; cursor: pointer !important; border: none !important; }');
        cssRules.push('[data-theme="dark"] .bottom-nav-bar .nav-tab-btn { background: rgba(255, 255, 255, 0.07) !important; color: #94a3b8 !important; }');
        cssRules.push('.bottom-nav-bar .nav-tab-btn .nav-tab-icon { width: 18px !important; height: 18px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; }');
        cssRules.push('.bottom-nav-bar .nav-tab-btn .nav-tab-icon svg { width: 18px !important; height: 18px !important; stroke: currentColor !important; stroke-width: 2.2 !important; fill: none !important; }');
        cssRules.push('.bottom-nav-bar .nav-tab-btn .nav-tab-label { font-size: 0.9rem !important; font-weight: 700 !important; color: inherit !important; line-height: 1 !important; }');
        cssRules.push('.bottom-nav-bar .nav-tab-btn.active { background: linear-gradient(135deg, #FF6A00 0%, #EA580C 100%) !important; color: #FFFFFF !important; box-shadow: 0 3px 12px rgba(234, 88, 12, 0.32) !important; }');
        cssRules.push('.bottom-nav-bar .nav-tab-btn.active .nav-tab-icon svg { stroke: #FFFFFF !important; }');
        cssRules.push('.bottom-nav-bar .nav-tab-btn.active .nav-tab-label { color: #FFFFFF !important; font-weight: 800 !important; }');

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
        cssRules.push('button[data-tab="tab-inventory"], [data-nav="inventory"], #drawer-nav-inventory, #tab-inventory, #product-recipe-section { display: none !important; }');
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
      if (modules.shifts === false) {
        cssRules.push('.archive-subtabs-wrap, #subtab-btn-shifts, #archive-subtab-shifts-view, .archive-period-item[data-preset="shift"], #shift-close-modal, #shift-close-backdrop { display: none !important; }');
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
      if (modules.ordering !== false) {
        if (modules.settings === false) {
          cssRules.push('button[data-tab="tab-settings"], #drawer-nav-settings, #tab-settings { display: none !important; }');
        }
        if (modules.backup === false) {
          cssRules.push('button[data-tab="tab-backup"], #drawer-nav-backup, #tab-backup { display: none !important; }');
        }
        if (modules.settings === false && modules.backup === false) {
          cssRules.push('.drawer-nav-group-title:last-of-type { display: none !important; }');
        }
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
      const onlinePayWraps = document.querySelectorAll('.payment-option-online, [data-payment-method="online"], #wallet-transfer-box, #pay-wallet-option, #wallet-discount-row');
      const cardWalletsSettings = document.getElementById('card-wallets-management');
      const payCodOption = document.getElementById('pay-cod-option');
      if (modules.onlinePayment === false) {
        onlinePayWraps.forEach(w => w.style.setProperty('display', 'none', 'important'));
        const walletDetailsBox = document.getElementById('wallet-details-box');
        if (walletDetailsBox) walletDetailsBox.style.setProperty('display', 'none', 'important');
        if (cardWalletsSettings) cardWalletsSettings.style.setProperty('display', 'none', 'important');
        if (payCodOption && !payCodOption.classList.contains('selected')) {
          payCodOption.classList.add('selected');
          if (typeof window.setPaymentOption === 'function') window.setPaymentOption('cod');
        }
      } else {
        onlinePayWraps.forEach(w => w.style.removeProperty('display'));
        if (cardWalletsSettings) cardWalletsSettings.style.removeProperty('display');
        const walletDetailsBox = document.getElementById('wallet-details-box');
        if (walletDetailsBox) {
          walletDetailsBox.style.removeProperty('display');
          const currentMethod = window.selectedPaymentMethod || (typeof selectedPaymentMethod !== 'undefined' ? selectedPaymentMethod : 'cod');
          walletDetailsBox.style.display = (currentMethod === 'wallet') ? 'block' : 'none';
        }
      }

      // Sales Archive & Shifts Module
      const archiveTabBtn = document.querySelector('button[data-tab="tab-archive"]');
      const archivePane = document.getElementById('tab-archive');
      const archiveBadge = document.getElementById('archive-badge-count');
      const shiftsDisabled = (modules.shifts === false);
      const archiveLabelText = shiftsDisabled ? 'أرشيف الفواتير' : 'أرشيف الفواتير والورديات';
      document.querySelectorAll('button[data-tab="tab-archive"] .tab-label, #drawer-nav-archive .tab-label').forEach(lbl => {
        lbl.textContent = archiveLabelText;
      });
      const adminPageTitle = document.getElementById('admin-page-title');
      if (adminPageTitle && archiveTabBtn && archiveTabBtn.classList.contains('active')) {
        adminPageTitle.textContent = archiveLabelText;
      }

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
        const subtabsWrap = document.querySelector('#tab-archive .archive-subtabs-wrap');
        const shiftsView = document.getElementById('archive-subtab-shifts-view');
        const shiftPeriodItem = document.querySelector('.archive-period-item[data-preset="shift"]');
        const periodSelect = document.getElementById('archive-period-select');
        if (shiftsDisabled) {
          if (subtabsWrap) subtabsWrap.style.setProperty('display', 'none', 'important');
          if (shiftsView) shiftsView.style.setProperty('display', 'none', 'important');
          if (shiftPeriodItem) shiftPeriodItem.style.setProperty('display', 'none', 'important');
          if (typeof window.switchArchiveSubtab === 'function') {
            window.switchArchiveSubtab('invoices');
          }
          if (periodSelect && periodSelect.value === 'shift' && typeof window.setArchiveDatePreset === 'function') {
            window.setArchiveDatePreset('today');
          }
        } else {
          if (subtabsWrap) subtabsWrap.style.removeProperty('display');
          if (shiftPeriodItem) shiftPeriodItem.style.removeProperty('display');
        }
      }

      // Inventory Recipe Gate inside Product Modal
      const prodRecipeSection = document.getElementById('product-recipe-section');
      if (prodRecipeSection) {
        if (modules.inventory === false) {
          prodRecipeSection.style.setProperty('display', 'none', 'important');
        } else {
          prodRecipeSection.style.removeProperty('display');
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

      const type = data.type || data.level || 'info';
      const colors = {
        urgent: { bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.4)', text: 'var(--danger, #ef4444)' },
        danger: { bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.4)', text: 'var(--danger, #ef4444)' },
        maintenance: { bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.4)', text: 'var(--warning, #f59e0b)' },
        warning: { bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.4)', text: 'var(--warning, #f59e0b)' },
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

      const safeMsg = String(data.message || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${safeMsg}</span>
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
