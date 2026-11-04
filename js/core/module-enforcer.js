/**
 * Harpy Order — Dynamic Module Enforcer & Global Broadcast Receiver
 * Autonomously controls feature visibility based on SaaS Master permissions
 * and renders global system announcements across restaurant screens.
 * Zero Emojis — Instant Clean Eradication
 */
(function() {
  'use strict';

  const ModuleEnforcer = {
    modules: {},
    currentSlug: null,
    fbBase: 'https://harpy-order-default-rtdb.firebaseio.com',

    init() {
      // 1. Detect active restaurant slug
      this.currentSlug = this.detectSlug();
      if (!this.currentSlug) return;

      // 2. Initial check from cached settings
      this.applyFromCache();

      // 3. Listen to settings updates from Store or Cloud
      this.watchSettings();

      // 4. Setup Global Broadcast listener for Admin screens
      if (window.location.pathname.includes('/admin') || document.querySelector('.admin-drawer-nav')) {
        this.initBroadcastReceiver();
      }

      // 5. Enforce Realtime License / Suspension Gate & Module Permissions
      this.checkSubscriptionGate();
    },

    checkSubscriptionGate() {
      if (!this.currentSlug || this.currentSlug === 'demo') return;
      const fetchLicense = () => {
        fetch(`${this.fbBase}/licenses/${this.currentSlug}.json`)
          .then(r => r.ok ? r.json() : null)
          .then(lic => {
            if (!lic) return;
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
          })
          .catch(() => {});
      };

      fetchLicense();
      setInterval(fetchLicense, 10000);
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

    watchSettings() {
      // Hook into Store if available
      if (window.Store && typeof window.Store.on === 'function') {
        window.Store.on('settings', (st) => {
          if (st && st.modules) this.enforce(st.modules);
        });
      }

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

      // Direct RTDB fetch
      if (this.currentSlug) {
        fetch(`${this.fbBase}/restaurants/${this.currentSlug}/settings/modules.json`)
          .then(r => r.ok ? r.json() : null)
          .then(mods => {
            if (mods && typeof mods === 'object') {
              this.enforce(mods);
            }
          })
          .catch(() => {});
      }
    },

    enforce(modules) {
      if (!modules || typeof modules !== 'object') return;
      this.modules = modules;

      // ── Synchronous Body Data Attributes ──
      const root = document.documentElement;
      const b = document.body;
      if (root && b) {
        Object.keys(modules).forEach(k => {
          const isEnabled = modules[k] !== false;
          root.dataset[`mod${k.charAt(0).toUpperCase() + k.slice(1)}`] = String(isEnabled);
          b.dataset[`mod${k.charAt(0).toUpperCase() + k.slice(1)}`] = String(isEnabled);
        });
      }

      // ── 1. POS / Cashier Module ──
      const posTabBtn = document.querySelector('button[data-tab="tab-pos"]');
      const posPane = document.getElementById('tab-pos');
      if (modules.pos === false) {
        if (posTabBtn) posTabBtn.style.setProperty('display', 'none', 'important');
        if (posPane) posPane.style.setProperty('display', 'none', 'important');
        if (posTabBtn && posTabBtn.classList.contains('active')) {
          const ordersBtn = document.querySelector('button[data-tab="tab-orders"]');
          if (ordersBtn) ordersBtn.click();
        }
      } else {
        if (posTabBtn) posTabBtn.style.removeProperty('display');
      }

      // ── 2. Inventory / Raw Materials Module ──
      const invTabBtn = document.querySelector('button[data-tab="tab-inventory"]');
      const invPane = document.getElementById('tab-inventory');
      const recipeBtns = document.querySelectorAll('.btn-recipe-modal, [data-action="manage-recipe"], .recipe-builder-trigger');
      const lowStockBadge = document.getElementById('inventory-low-stock-badge');
      if (modules.inventory === false) {
        if (invTabBtn) invTabBtn.style.setProperty('display', 'none', 'important');
        if (invPane) invPane.style.setProperty('display', 'none', 'important');
        if (lowStockBadge) lowStockBadge.style.setProperty('display', 'none', 'important');
        recipeBtns.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (invTabBtn && invTabBtn.classList.contains('active')) {
          const prodBtn = document.querySelector('button[data-tab="tab-products"]');
          if (prodBtn) prodBtn.click();
        }
      } else {
        if (invTabBtn) invTabBtn.style.removeProperty('display');
        recipeBtns.forEach(el => el.style.removeProperty('display'));
      }

      // ── 3. Stories Module ──
      const storiesTabBtn = document.querySelector('button[data-tab="tab-stories"]');
      const storiesPane = document.getElementById('tab-stories');
      const cardStorySettings = document.getElementById('card-story-management');
      const clientStoriesSection = document.getElementById('stories-section');
      const clientStoriesBackdrop = document.getElementById('story-modal-backdrop');
      const clientStoriesModal = document.getElementById('story-viewer-modal');
      if (modules.stories === false) {
        if (storiesTabBtn) storiesTabBtn.style.setProperty('display', 'none', 'important');
        if (storiesPane) storiesPane.style.setProperty('display', 'none', 'important');
        if (cardStorySettings) cardStorySettings.style.setProperty('display', 'none', 'important');
        if (clientStoriesSection) {
          clientStoriesSection.style.setProperty('display', 'none', 'important');
          clientStoriesSection.innerHTML = '';
        }
        if (clientStoriesBackdrop) clientStoriesBackdrop.style.setProperty('display', 'none', 'important');
        if (clientStoriesModal) clientStoriesModal.style.setProperty('display', 'none', 'important');
        if (storiesTabBtn && storiesTabBtn.classList.contains('active')) {
          const ordersBtn = document.querySelector('button[data-tab="tab-orders"]');
          if (ordersBtn) ordersBtn.click();
        }
      } else {
        if (storiesTabBtn) storiesTabBtn.style.removeProperty('display');
        if (cardStorySettings) cardStorySettings.style.removeProperty('display');
      }

      // ── 4. Smart Tables / Dine-in QR Module ──
      const dineInTab = document.querySelector('.fulfillment-tab[data-type="dinein"]');
      const dineInField = document.getElementById('cust-table-number-section');
      const cardTablesSettings = document.getElementById('card-tables-management');
      const heroDineInPill = document.getElementById('hero-dinein-pill');
      const isTablesDisabled = modules.tables === false || modules.smartTables === false;

      if (isTablesDisabled) {
        if (dineInTab) dineInTab.style.setProperty('display', 'none', 'important');
        if (dineInField) dineInField.style.setProperty('display', 'none', 'important');
        if (cardTablesSettings) cardTablesSettings.style.setProperty('display', 'none', 'important');
        if (heroDineInPill) heroDineInPill.style.setProperty('display', 'none', 'important');
        if (window.currentFulfillmentType === 'dinein') {
          if (typeof window.setFulfillmentType === 'function') {
            window.setFulfillmentType(modules.delivery !== false ? 'delivery' : (modules.takeaway !== false ? 'takeaway' : 'none'));
          }
        }
      } else {
        if (dineInTab) dineInTab.style.removeProperty('display');
        if (cardTablesSettings) cardTablesSettings.style.removeProperty('display');
      }

      // ── 5. Delivery Module ──
      const deliveryTab = document.querySelector('.fulfillment-tab[data-type="delivery"]');
      const deliveryZoneRow = document.getElementById('delivery-zone-feedback-row');
      const deliveryFeeRow = document.getElementById('delivery-fee-row');
      const cardDeliverySettings = document.getElementById('card-delivery-management');
      const deliveryPills = document.querySelectorAll('.pill-delivery, #hero-delivery-time, #portfolio-delivery-time, #portfolio-delivery-time-badge');

      if (modules.delivery === false) {
        if (deliveryTab) deliveryTab.style.setProperty('display', 'none', 'important');
        if (deliveryZoneRow) deliveryZoneRow.style.setProperty('display', 'none', 'important');
        if (deliveryFeeRow) deliveryFeeRow.style.setProperty('display', 'none', 'important');
        if (cardDeliverySettings) cardDeliverySettings.style.setProperty('display', 'none', 'important');
        deliveryPills.forEach(p => p.style.setProperty('display', 'none', 'important'));
        if (window.currentFulfillmentType === 'delivery') {
          if (typeof window.setFulfillmentType === 'function') {
            window.setFulfillmentType(!isTablesDisabled ? 'dinein' : (modules.takeaway !== false ? 'takeaway' : 'none'));
          }
        }
      } else {
        if (deliveryTab) deliveryTab.style.removeProperty('display');
        if (cardDeliverySettings) cardDeliverySettings.style.removeProperty('display');
      }

      // ── 6. Takeaway / Pickup Module ──
      const takeawayTabs = document.querySelectorAll('.fulfillment-tab[data-type="takeaway"], [data-fulfillment="takeaway"]');
      const takeawayBanner = document.getElementById('fulfillment-takeaway-banner');
      if (modules.takeaway === false) {
        takeawayTabs.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (takeawayBanner) takeawayBanner.style.setProperty('display', 'none', 'important');
        if (window.currentFulfillmentType === 'takeaway') {
          if (typeof window.setFulfillmentType === 'function') {
            window.setFulfillmentType(modules.delivery !== false ? 'delivery' : (!isTablesDisabled ? 'dinein' : 'none'));
          }
        }
      } else {
        takeawayTabs.forEach(el => el.style.removeProperty('display'));
      }

      // ── All Fulfillments Gate ──
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

      // ── 7. Online Payments Module ──
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

      // ── 8. Sales Archive Module ──
      const archiveTabBtn = document.querySelector('button[data-tab="tab-archive"]');
      const archivePane = document.getElementById('tab-archive');
      const archiveBadge = document.getElementById('archive-badge-count');
      if (modules.archive === false) {
        if (archiveTabBtn) archiveTabBtn.style.setProperty('display', 'none', 'important');
        if (archivePane) archivePane.style.setProperty('display', 'none', 'important');
        if (archiveBadge) archiveBadge.style.setProperty('display', 'none', 'important');
        if (archiveTabBtn && archiveTabBtn.classList.contains('active')) {
          const ordersBtn = document.querySelector('button[data-tab="tab-orders"]');
          if (ordersBtn) ordersBtn.click();
        }
      } else {
        if (archiveTabBtn) archiveTabBtn.style.removeProperty('display');
      }

      // ── 9. Discount Coupons Module ──
      const couponBoxes = document.querySelectorAll('#coupon-section, .coupon-section, #coupon-box, .cart-coupon-row, .coupon-trigger-btn, #promo-box-wrap, #promo-input-container, #promo-deal-card, #promo-discount-row, #promo-discount-row-s1');
      const cardPromotionsSettings = document.getElementById('card-promotions-management');
      if (modules.coupons === false) {
        couponBoxes.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (cardPromotionsSettings) cardPromotionsSettings.style.setProperty('display', 'none', 'important');
      } else {
        couponBoxes.forEach(el => el.style.removeProperty('display'));
        if (cardPromotionsSettings) cardPromotionsSettings.style.removeProperty('display');
      }

      // ── 10. Customer Reviews Module ──
      const reviewBoxes = document.querySelectorAll('#reviews-section, .reviews-section, #ratings-modal, .customer-reviews-wrap, #hero-chip-rating, .pill-rating, .highlight-rating, [data-i18n="portfolio_rating_label"]');
      if (modules.reviews === false) {
        reviewBoxes.forEach(el => el.style.setProperty('display', 'none', 'important'));
      } else {
        reviewBoxes.forEach(el => el.style.removeProperty('display'));
      }
    },

    // ── Global Broadcast Announcement Receiver ──
    initBroadcastReceiver() {
      const fetchBroadcast = () => {
        fetch(`${this.fbBase}/announcements/global.json`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            this.renderBroadcastBanner(data);
          })
          .catch(() => {});
      };

      fetchBroadcast();
      setInterval(fetchBroadcast, 45000);
    },

    renderBroadcastBanner(data) {
      let banner = document.getElementById('harpy-global-announcement-bar');

      if (!data || !data.active || !data.message) {
        if (banner) banner.remove();
        return;
      }

      const dismissed = sessionStorage.getItem('dismissed_broadcast_' + data.createdAt);
      if (dismissed) {
        if (banner) banner.remove();
        return;
      }

      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'harpy-global-announcement-bar';
        document.body.prepend(banner);
      }

      let bg = '#1E3A8A';
      let border = '#38BDF8';
      let iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>';

      if (data.type === 'warning') {
        bg = '#78350F';
        border = '#F59E0B';
        iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      } else if (data.type === 'danger') {
        bg = '#7F1D1D';
        border = '#EF4444';
        iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
      } else if (data.type === 'success') {
        bg = '#064E3B';
        border = '#10B981';
        iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      }

      banner.style.cssText = `
        background: ${bg};
        border-bottom: 2px solid ${border};
        color: #FFFFFF;
        padding: 9px 14px;
        font-family: 'Cairo', system-ui, sans-serif;
        font-size: 13px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        position: sticky;
        top: 0;
        z-index: 999999;
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
      `;

      banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="display:inline-flex; align-items:center; justify-content:center;">${iconSvg}</span>
          <span>${data.message}</span>
        </div>
        <button type="button" onclick="sessionStorage.setItem('dismissed_broadcast_${data.createdAt}', 'true'); this.parentElement.remove();" style="background:transparent; border:none; color:#FFF; cursor:pointer; padding:2px; display:inline-flex; align-items:center; justify-content:center;" title="إغلاق">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;
    }
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ModuleEnforcer.init());
  } else {
    ModuleEnforcer.init();
  }

  window.ModuleEnforcer = ModuleEnforcer;
})();
