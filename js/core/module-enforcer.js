/**
 * Harpy Order — Dynamic Module Enforcer & Global Broadcast Receiver
 * Autonomously controls feature visibility based on SaaS Master permissions
 * and renders global system announcements across restaurant screens.
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
    },

    detectSlug() {
      const params = new URLSearchParams(window.location.search);
      let s = params.get('m') || params.get('slug');
      if (s) return s.toLowerCase().trim();

      s = localStorage.getItem('harpy_admin_active_slug') ||
          localStorage.getItem('harpy_active_slug') ||
          localStorage.getItem('harpy_last_visited_slug');
      return s ? s.toLowerCase().trim() : null;
    },

    applyFromCache() {
      if (!this.currentSlug) return;
      try {
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

      // Also fetch directly from RTDB to ensure fresh flags
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

      // ── 1. POS / Cashier Module ──
      const posTabBtn = document.querySelector('button[data-tab="tab-pos"]');
      const posPane = document.getElementById('tab-pos');
      if (modules.pos === false) {
        if (posTabBtn) posTabBtn.style.setProperty('display', 'none', 'important');
        if (posPane) posPane.style.setProperty('display', 'none', 'important');
        // If current tab is pos, auto switch to orders
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
      if (modules.inventory === false) {
        if (invTabBtn) invTabBtn.style.setProperty('display', 'none', 'important');
        if (invPane) invPane.style.setProperty('display', 'none', 'important');
        recipeBtns.forEach(b => b.style.setProperty('display', 'none', 'important'));
        if (invTabBtn && invTabBtn.classList.contains('active')) {
          const prodBtn = document.querySelector('button[data-tab="tab-products"]');
          if (prodBtn) prodBtn.click();
        }
      } else {
        if (invTabBtn) invTabBtn.style.removeProperty('display');
        recipeBtns.forEach(b => b.style.removeProperty('display'));
      }

      // ── 3. Stories Module ──
      const storiesTabBtn = document.querySelector('button[data-tab="tab-stories"]');
      const storiesPane = document.getElementById('tab-stories');
      const clientStoriesSection = document.getElementById('stories-section');
      const clientStoriesBackdrop = document.getElementById('story-modal-backdrop');
      if (modules.stories === false) {
        if (storiesTabBtn) storiesTabBtn.style.setProperty('display', 'none', 'important');
        if (storiesPane) storiesPane.style.setProperty('display', 'none', 'important');
        if (clientStoriesSection) clientStoriesSection.style.setProperty('display', 'none', 'important');
        if (clientStoriesBackdrop) clientStoriesBackdrop.style.setProperty('display', 'none', 'important');
        if (storiesTabBtn && storiesTabBtn.classList.contains('active')) {
          const ordersBtn = document.querySelector('button[data-tab="tab-orders"]');
          if (ordersBtn) ordersBtn.click();
        }
      } else {
        if (storiesTabBtn) storiesTabBtn.style.removeProperty('display');
        // Let normal stories logic control display on client
      }

      // ── 4. Smart Tables / Dine-in QR Module ──
      const dineInTab = document.querySelector('.fulfillment-tab[data-type="dinein"]');
      const dineInField = document.getElementById('cust-table-number-section');
      if (modules.tables === false) {
        if (dineInTab) dineInTab.style.setProperty('display', 'none', 'important');
        if (dineInField) dineInField.style.setProperty('display', 'none', 'important');
        if (window.currentFulfillmentType === 'dinein') {
          if (typeof window.setFulfillmentType === 'function') {
            window.setFulfillmentType(modules.delivery !== false ? 'delivery' : 'takeaway');
          }
        }
      } else {
        if (dineInTab) dineInTab.style.removeProperty('display');
      }

      // ── 5. Delivery Module ──
      const deliveryTab = document.querySelector('.fulfillment-tab[data-type="delivery"]');
      const deliveryZoneRow = document.getElementById('delivery-zone-feedback-row');
      const deliveryFeeRow = document.getElementById('delivery-fee-row');
      if (modules.delivery === false) {
        if (deliveryTab) deliveryTab.style.setProperty('display', 'none', 'important');
        if (deliveryZoneRow) deliveryZoneRow.style.setProperty('display', 'none', 'important');
        if (deliveryFeeRow) deliveryFeeRow.style.setProperty('display', 'none', 'important');
        if (window.currentFulfillmentType === 'delivery') {
          if (typeof window.setFulfillmentType === 'function') {
            window.setFulfillmentType(modules.tables !== false ? 'dinein' : 'takeaway');
          }
        }
      } else {
        if (deliveryTab) deliveryTab.style.removeProperty('display');
      }

      // ── 6. Online Payments Module ──
      const onlinePayWraps = document.querySelectorAll('.payment-option-online, [data-payment-method="online"], #wallet-transfer-box');
      if (modules.onlinePayment === false) {
        onlinePayWraps.forEach(w => w.style.setProperty('display', 'none', 'important'));
      } else {
        onlinePayWraps.forEach(w => w.style.removeProperty('display'));
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
      // Poll broadcast every 45s for fresh messages
      setInterval(fetchBroadcast, 45000);
    },

    renderBroadcastBanner(data) {
      let banner = document.getElementById('harpy-global-announcement-bar');

      if (!data || !data.active || !data.message) {
        if (banner) banner.remove();
        return;
      }

      // Check if dismissed in this session
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
      let icon = '📢';

      if (data.type === 'warning') {
        bg = '#78350F';
        border = '#F59E0B';
        icon = '⚠️';
      } else if (data.type === 'danger') {
        bg = '#7F1D1D';
        border = '#EF4444';
        icon = '🚨';
      } else if (data.type === 'success') {
        bg = '#064E3B';
        border = '#10B981';
        icon = '🎉';
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
          <span style="font-size:16px;">${icon}</span>
          <span>${data.message}</span>
        </div>
        <button type="button" onclick="sessionStorage.setItem('dismissed_broadcast_${data.createdAt}', 'true'); this.parentElement.remove();" style="background:transparent; border:none; color:#FFF; font-size:16px; cursor:pointer; padding:0 4px; line-height:1;" title="إغلاق">✕</button>
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
