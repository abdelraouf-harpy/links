// ═══════════════════════════════════════════════════════════
// HarpyOrder — Client Core Engine (Navigation, Themes & Bootstrap)
// ═══════════════════════════════════════════════════════════

// ── Web Audio FX Engine (Decoupled to js/core/sound-effects.js) ──
var SoundFX = (typeof window !== 'undefined' && window.SoundFX) ? window.SoundFX : {
  init: () => {},
  playPop: () => {},
  playChime: () => {},
  playCash: () => {}
};

var esc = (s) => (typeof window.escapeHtml === 'function' ? window.escapeHtml(s) : String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])));

var elements = {
  soundToggleBtn: document.getElementById('clean-sound-toggle-btn') || document.getElementById('sound-toggle-btn'),
  soundIconOn: null,
  soundIconOff: null,

  themeToggleBtn: document.getElementById('clean-theme-toggle-btn') || document.getElementById('theme-toggle-btn'),
  themeIconDark: null,
  themeIconLight: null,

  storeName: document.getElementById('hero-store-name') || document.getElementById('portfolio-store-name'),
  storeTagline: document.getElementById('hero-store-tagline') || document.getElementById('portfolio-store-tagline'),
  storeLogo: document.getElementById('hero-store-logo') || document.getElementById('portfolio-store-logo'),
  storeWhatsAppLink: null,

  storiesSection: document.getElementById('stories-section'),
  storiesTrack: document.getElementById('stories-track'),

  announcementBar: null,
  announcementText: null,
  deliveryTimeBadge: null,

  lastOrderBanner: null,
  lastOrderSummary: null,
  btnReorder: null,

  discoveryContainer: null,
  searchInput: document.getElementById('search-input'),
  viewModeCycleBtn: document.getElementById('view-mode-cycle-btn'),
  viewToggleGrid: null,
  viewToggleList: null,

  categoriesContainer: document.getElementById('categories-container'),
  heroShowcaseContainer: document.getElementById('hero-showcase-container'),
  productsContainer: document.getElementById('products-container'),

  // Quick Preview Modal
  previewModal: document.getElementById('preview-modal'),
  previewModalBackdrop: document.getElementById('preview-modal-backdrop'),
  previewImg: document.getElementById('preview-img'),
  previewBadge: document.getElementById('preview-badge'),
  previewTitle: document.getElementById('preview-title'),
  previewCategory: document.getElementById('preview-category'),
  previewPrepTime: document.getElementById('preview-preptime'),
  previewPrice: document.getElementById('preview-price'),
  previewDesc: document.getElementById('preview-desc'),
  previewActionWrap: document.getElementById('preview-action-wrap'),
  btnClosePreview: document.getElementById('btn-close-preview'),

  // Customizer Modal
  customizerBackdrop: document.getElementById('customizer-backdrop'),
  customizerModal: document.getElementById('customizer-modal'),
  btnCloseCustomizer: document.getElementById('btn-close-customizer'),
  customizerTitle: document.getElementById('customizer-title'),
  customizerDesc: document.getElementById('customizer-desc'),
  customizerImg: document.getElementById('customizer-img'),
  customizerBasePrice: document.getElementById('customizer-base-price'),
  customizerSizesSection: document.getElementById('customizer-sizes-section'),
  customizerSizesList: document.getElementById('customizer-sizes-list'),
  customizerAddonsSection: document.getElementById('customizer-addons-section'),
  customizerAddonsList: document.getElementById('customizer-addons-list'),
  customizerNotes: document.getElementById('customizer-notes'),
  btnCustomizerQtyMinus: document.getElementById('btn-customizer-qty-minus'),
  btnCustomizerQtyPlus: document.getElementById('btn-customizer-qty-plus'),
  customizerQtyVal: document.getElementById('customizer-qty-val'),
  customizerTotalPrice: document.getElementById('customizer-total-price'),
  btnAddCustomizedCart: document.getElementById('btn-add-customized-cart'),

  // Cart Drawer
  cartDrawer: document.getElementById('cart-drawer'),
  cartDrawerBackdrop: document.getElementById('cart-drawer-backdrop'),
  btnCloseCartDrawer: document.getElementById('btn-close-cart-drawer'),
  stepNavBtns: document.querySelectorAll('.step-nav-btn'),
  checkoutSteps: document.querySelectorAll('.checkout-step'),

  spendTierCard: document.getElementById('spend-tier-card'),
  spendTierMsg: document.getElementById('spend-tier-msg'),
  spendTierPercent: document.getElementById('spend-tier-percent'),
  spendTierFill: document.getElementById('spend-tier-fill'),

  cartSmartPairing: document.getElementById('cart-smart-pairing'),
  pairingItemsList: document.getElementById('pairing-items-list'),

  cartDrawerItems: document.getElementById('cart-drawer-items'),
  promoCodeInput: document.getElementById('promo-code-input'),
  btnApplyPromo: document.getElementById('btn-apply-promo'),
  promoAppliedBadge: document.getElementById('promo-applied-badge'),
  promoAppliedText: document.getElementById('promo-applied-text'),
  btnRemovePromo: document.getElementById('btn-remove-promo'),

  subtotalSummaryRow: document.getElementById('subtotal-summary-row'),
  subtotalValDisplay: document.getElementById('subtotal-val-display'),
  spendTierDiscountRow: document.getElementById('spend-tier-discount-row'),
  spendTierBadge: document.getElementById('spend-tier-badge'),
  spendTierDiscountVal: document.getElementById('spend-tier-discount-val'),
  promoDiscountRow: document.getElementById('promo-discount-row'),
  promoNameBadge: document.getElementById('promo-name-badge'),
  promoDiscountVal: document.getElementById('promo-discount-val'),
  walletDiscountRow: document.getElementById('wallet-discount-row'),
  walletDiscountBadge: document.getElementById('wallet-discount-badge'),
  walletDiscountVal: document.getElementById('wallet-discount-val'),

  cartOriginalStrikethrough: document.getElementById('cart-original-strikethrough'),
  cartTotalPrice: document.getElementById('cart-total-price'),

  custName: document.getElementById('cust-name'),
  custPhone: document.getElementById('cust-phone'),
  custAddress: document.getElementById('cust-address'),
  custNotes: document.getElementById('cust-notes'),
  deliveryFeeRow: document.getElementById('delivery-fee-row'),
  deliveryFeeVal: document.getElementById('delivery-fee-val'),

  payCodOption: document.getElementById('pay-cod-option'),
  payWalletOption: document.getElementById('pay-wallet-option'),
  walletDetailsBox: document.getElementById('wallet-details-box'),
  walletNameDisplay: document.getElementById('wallet-name-display'),
  walletNumDisplay: document.getElementById('wallet-num-display'),
  btnCopyNum: document.getElementById('btn-copy-num'),
  copyBtnText: document.getElementById('copy-btn-text'),
  walletAmountReminder: document.getElementById('wallet-amount-reminder'),
  receiptInput: document.getElementById('receipt-input'),
  dropzonePrompt: document.getElementById('dropzone-prompt'),
  receiptPreviewWrap: document.getElementById('receipt-preview-wrap'),
  receiptPreview: document.getElementById('receipt-preview'),
  btnRemoveReceipt: document.getElementById('btn-remove-receipt'),
  receiptStatus: document.getElementById('receipt-status'),
  btnConfirmOrderDirect: document.getElementById('btn-confirm-order-direct'),
  btnSendWhatsApp: document.getElementById('btn-send-whatsapp'),

  // Live Order Tracker Modal
  trackerModal: document.getElementById('tracker-modal'),
  trackerModalBackdrop: document.getElementById('tracker-modal-backdrop'),
  btnCloseTracker: document.getElementById('btn-close-tracker'),
  btnTrackerNewOrder: document.getElementById('btn-tracker-new-order'),
  btnTrackerWhatsapp: document.getElementById('btn-tracker-whatsapp'),
  trackOrderId: document.getElementById('track-order-id'),
  trackOrderEta: document.getElementById('track-order-eta'),
  trackOrderTotal: document.getElementById('track-order-total'),
  trackerItemsList: document.getElementById('tracker-items-list'),

  // Stories Modal
  storyModalBackdrop: document.getElementById('story-modal-backdrop'),
  storyViewerModal: document.getElementById('story-viewer-modal'),
  storyProgressWrap: document.getElementById('story-progress-wrap'),
  storyHeaderLogo: document.getElementById('story-header-logo'),
  storyViewerTitle: document.getElementById('story-viewer-title'),
  storyViewerTime: document.getElementById('story-viewer-time'),
  btnCloseStory: document.getElementById('btn-close-story'),
  storyViewerImg: document.getElementById('story-viewer-img'),
  storyViewerBadge: document.getElementById('story-viewer-badge'),
  storyViewerHeadline: document.getElementById('story-viewer-headline'),
  storyViewerDesc: document.getElementById('story-viewer-desc'),
  btnStoryCta: document.getElementById('btn-story-cta'),
  storyTouchPrev: document.getElementById('story-touch-prev'),
  storyTouchNext: document.getElementById('story-touch-next')
};


// Expose elements globally for all client submodules
window.clientElements = elements;

// ── Mobile Back-Button & Modal History Navigation Controller ──
function pushNavState(type, data = {}) {
  try {
    history.pushState({ harpyNav: type, ...data }, '');
  } catch(e) {}
}

function handlePopStateNavigation(event) {
  // 1. Story Viewer
  if (elements.storyViewerModal && elements.storyViewerModal.classList.contains('active')) {
    closeStoryViewer(false);
    return;
  }
  // 2. Live Order Tracker
  if (elements.trackerModal && elements.trackerModal.classList.contains('open')) {
    closeLiveOrderTracker(false);
    return;
  }
  // 3. Item Customizer
  if (elements.customizerModal && elements.customizerModal.classList.contains('open')) {
    closeCustomizer(false);
    return;
  }
  // 4. Quick Preview
  if (elements.previewModal && elements.previewModal.classList.contains('open')) {
    closeQuickPreview(false);
    return;
  }
  // 5. Cart Drawer & Multi-Step Checkout
  if (elements.cartDrawer && elements.cartDrawer.classList.contains('open')) {
    if (currentCheckoutStep === 3) {
      goToCheckoutStep(2, false);
      return;
    } else if (currentCheckoutStep === 2) {
      goToCheckoutStep(1, false);
      return;
    } else {
      closeCartDrawer(false);
      return;
    }
  }
  // 6. My Account Drawer
  const accountDrawer = document.getElementById('my-account-drawer');
  if (accountDrawer && accountDrawer.classList.contains('open')) {
    closeMyAccountDrawer(false);
    return;
  }
  // 7. QR Code Modal
  const qrModal = document.getElementById('qr-code-modal');
  if (qrModal && qrModal.classList.contains('open')) {
    closeQrModal(false);
    return;
  }
  // 8. Onboard Modal
  const onboardModal = document.getElementById('customer-onboard-modal');
  if (onboardModal && onboardModal.classList.contains('open')) {
    closeCustomerOnboardModal(true, false);
    return;
  }
  // 9. Language Picker Modal
  const langPicker = document.getElementById('lang-picker-modal');
  if (langPicker && langPicker.classList.contains('open')) {
    closeLanguagePickerModal(false);
    return;
  }
}

window.addEventListener('popstate', handlePopStateNavigation);


async function initApp() {
  if (window.__isPortfolio) return;
  Store.initTheme();
  updateThemeToggleIcons();
  updateSoundToggleIcon();
  initViewMode();
  renderCleanProfileUI();

  // Dynamic Dine-in Table Auto-Detection from QR Code
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = (urlParams.get('table') || urlParams.get('t') || sessionStorage.getItem('harpy_dinein_table') || '').trim();
    if (tableParam) {
      sessionStorage.setItem('harpy_dinein_table', tableParam);
      window.__harpyDineInTable = tableParam;
      window.__harpyInStoreDineIn = true;
      if (typeof window.setFulfillmentType === 'function') {
        window.setFulfillmentType('dinein');
      }
      if (typeof window.syncTableNumber === 'function') {
        window.syncTableNumber(tableParam);
      }
    }
  } catch(e) {}

  const slug = Store.getRestaurantSlug();
  const isDemo = (slug === 'demo');
  if (isDemo) {
    const curProds = Store.getProducts();
    if (!curProds || curProds.length === 0) {
      if (typeof window !== 'undefined' && window.DEFAULT_PRODUCTS) {
        Store._memoryCache.products = window.DEFAULT_PRODUCTS;
      }
    }
  }
  const curProds = Store.getProducts();
  const hasRealCachedProducts = Array.isArray(curProds) && curProds.length > 0;
  const hasLocalCache = (Store.hasCachedData(slug) && hasRealCachedProducts) || isDemo;

  // 1. Intelligent Dual-Speed Hydration Engine
  // On device with real cached products or demo, wait at most 80ms for instant paint
  // On cold start / fresh device, wait at most 550ms for critical menu trio, then reveal UI with skeletons if still pending
  if (window.__harpyPreloadPromise) {
    const maxWaitTime = hasLocalCache ? 80 : 550;
    try {
      const preloadData = await Promise.race([
        window.__harpyPreloadPromise,
        new Promise(r => setTimeout(() => r(null), maxWaitTime))
      ]);
      if (preloadData && typeof preloadData === 'object') {
        Store.applySnapshotData(preloadData);
      }
    } catch(e) {}

    // Non-blocking background receiver: updates UI only if data actually changed
    window.__harpyPreloadPromise.then(freshData => {
      if (freshData && typeof freshData === 'object' && (!Store.saveLocks || !Store.saveLocks.products)) {
        const changed = Store.applySnapshotData(freshData);
        if (changed) {
          Store.applyTheme();
          renderStoreInfo();
          renderAnnouncement();
          renderDiscoveryRibbon();
          renderCategories();
          renderProducts(true);
        }
        if (freshData.settings) {
          if (typeof window.updatePwaBranding === 'function') {
            window.updatePwaBranding(freshData.settings);
          }
        }
      }
    }).catch(() => {});
  }

  // Decoupled Background Stories Stream: Never delays the critical menu or splash dismissal
  if (window.__harpyStoriesPromise) {
    window.__harpyStoriesPromise.then(storiesData => {
      if (storiesData && (!Store.saveLocks || !Store.saveLocks.stories)) {
        const changed = Store.applySnapshotData({ stories: storiesData });
        if (changed || !Store.getStories() || Store.getStories().length === 0) {
          renderStories();
        }
      }
    }).catch(() => {});
  }

  // 2. Render initial UI with preloaded or cached data
  renderStoreInfo();
  renderStories();
  renderAnnouncement();
  renderLastOrderRecall();
  renderDiscoveryRibbon();
  renderCategories();
  renderProducts(true);
  updateLedgerUI();
  setupEventListeners();
  initCustomizerEvents();
  setupSubscriptionWatcher();
  if (typeof window.initBackgroundOrderTracking === 'function') {
    window.initBackgroundOrderTracking();
  } else if (typeof initBackgroundOrderTracking === 'function') {
    initBackgroundOrderTracking();
  }
  updateAccountDrawerProfileUI();
  checkCustomerOnboarding();
  if (typeof window.checkMultiBranchSelection === 'function') {
    window.checkMultiBranchSelection();
  }

  // 2b. Store status is already rendered in renderStoreInfo() without blocking browsing

  // 3. Pre-decode above-the-fold images so there is zero pop-in when splash disappears
  const topImgs = Array.from(document.querySelectorAll('.food-item-img')).slice(0, 6);
  if (topImgs.length > 0) {
    const decodePromises = topImgs.map(img => {
      if (img.complete) {
        img.classList.add('loaded');
        return Promise.resolve();
      }
      if (typeof img.decode === 'function') {
        return img.decode().then(() => { img.classList.add('loaded'); }).catch(() => {});
      }
      return new Promise(r => {
        img.onload = () => { img.classList.add('loaded'); r(); };
        img.onerror = () => { img.classList.add('loaded'); r(); };
      });
    });
    const maxImageWait = hasLocalCache ? 25 : 100;
    await Promise.race([
      Promise.allSettled(decodePromises),
      new Promise(r => setTimeout(r, maxImageWait))
    ]);
  }

  // 4. Dismiss native splash shield smoothly with instant complete reveal
  const dismissSplash = () => {
    const splash = document.getElementById('app-splash-shield');
    if (splash && !splash.classList.contains('fade-out')) {
      requestAnimationFrame(() => {
        splash.classList.add('fade-out');
        setTimeout(() => { try { splash.remove(); } catch(e) {} }, 220);
      });
    }
  };

  const hasNowProducts = (Store.getProducts() || []).length > 0;
  if (hasLocalCache || hasNowProducts) {
    dismissSplash();
  } else if (window.__harpyPreloadPromise) {
    window.__harpyPreloadPromise.finally(() => {
      dismissSplash();
    });
    setTimeout(dismissSplash, 3800);
  } else {
    dismissSplash();
  }

  // 5. Connect real-time cloud data sync from Firebase Realtime Database
  Store.syncFromCloud(slug, (status) => {
    if (status && status.hasData && status.hasChanges !== false) {
      Store.applyTheme();
      renderStoreInfo();
      renderAnnouncement();
      renderStories();
      renderCategories();
      scheduleRenderProducts(false);
      updateLedgerUI();
      const currentSettings = Store.getSettings();
      if (typeof window.updatePwaBranding === 'function') {
        window.updatePwaBranding(currentSettings);
      }
      // Re-check ordering paused on live data update (handles real-time freeze/unfreeze)
      if (currentSettings.isOrderingPaused) {
        applyOrderingPausedUI(currentSettings);
      } else {
        removeOrderingPausedUI();
      }
    }
  });

  // 6. Setup Offline Outbox background queue & auto-retry engine
  setupOutboxSync();

  // 7. Weak-network watchdog: If after 4200ms products container is still empty or displaying skeletons, provide friendly retry UI
  setTimeout(() => {
    const curP = Store.getProducts();
    if (!curP || curP.length === 0) {
      const isCloudReady = typeof Store !== 'undefined' && Store.isCloudDataLoaded && Store.isCloudDataLoaded();
      if (!isCloudReady && elements.productsContainer) {
        elements.productsContainer.innerHTML = `
          <div class="weak-network-fallback-card" style="grid-column: 1 / -1; text-align: center; padding: 45px 20px; background: var(--surface-raised, rgba(255,255,255,0.03)); border: 1px dashed var(--border); border-radius: 16px; margin: 15px 0;">
            <div style="font-size: 34px; margin-bottom: 12px; line-height: 1;">📶</div>
            <h3 style="font-size: 1.05rem; margin-bottom: 6px; color: var(--text-main); font-weight:800;">الاتصال بالإنترنت ضعيف أو بطيء</h3>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 280px; margin: 0 auto 16px; line-height: 1.5;">جارٍ محاولة الاتصال وتحديث قائمة الطعام تلقائياً. يمكنك الضغط أدناه لإعادة المحاولة.</p>
            <button type="button" class="btn btn-primary btn-sm" onclick="location.reload()" style="padding: 8px 22px; font-weight: 700; border-radius: 10px;">
              تحديث القائمة
            </button>
          </div>
        `;
      }
    }
  }, 4200);
}


function setupOutboxSync() {
  if (typeof Store === 'undefined' || !Store.processOutbox) return;

  // Process any pending outbox orders on startup if online
  if (navigator.onLine) {
    Store.processOutbox().then(count => {
      if (count > 0) {
        showToastNotification(`تم بنجاح إرسال وتأكيد ${count} طلب كان في قائمة الانتظار!`, "success");
        renderLastOrderRecall();
        if (typeof renderOrdersView === 'function') renderOrdersView();
        if (typeof initBackgroundOrderTracking === 'function') initBackgroundOrderTracking();
      }
    }).catch(() => {});
  }

  // Auto-retry when connection is restored
  window.addEventListener('online', async () => {
    const settings = Store.getSettings();
    if (settings && settings.isOrderingPaused) {
      showToastNotification("عاد الاتصال بالإنترنت، ولكن استقبال الطلبات متوقف حالياً لدى المطعم.", "warning");
      return;
    }
    showToastNotification("عاد الاتصال بالإنترنت! جارٍ محاولة إرسال الطلبات المعلقة", "info");
    const count = await Store.processOutbox();
    if (count > 0) {
      if (typeof SoundFX !== 'undefined' && SoundFX.playCash) SoundFX.playCash();
      showToastNotification(`تم بنجاح إرسال وتأكيد ${count} طلب كان معلقاً!`, "success");
      Store.clearCart();
      updateLedgerUI();
      renderLastOrderRecall();
      if (typeof renderOrdersView === 'function') renderOrdersView();
      if (typeof initBackgroundOrderTracking === 'function') initBackgroundOrderTracking();
    }
  });

  // Background heartbeat retry every 15 seconds
  setInterval(async () => {
    if (navigator.onLine) {
      const outbox = Store.getOutbox();
      if (outbox && outbox.length > 0) {
        const count = await Store.processOutbox();
        if (count > 0) {
          if (typeof SoundFX !== 'undefined' && SoundFX.playCash) SoundFX.playCash();
          showToastNotification(`تم بنجاح إرسال وتأكيد ${count} طلب كان في قائمة الانتظار!`, "success");
          Store.clearCart();
          updateLedgerUI();
          renderLastOrderRecall();
          if (typeof renderOrdersView === 'function') renderOrdersView();
          if (typeof initBackgroundOrderTracking === 'function') initBackgroundOrderTracking();
        }
      }
    }
  }, 15000);
}

function showToastNotification(message, type = 'success') {
  const existing = document.getElementById('harpy-app-toast');
  if (existing) existing.remove();

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else if (type === 'info') {
    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  } else {
    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  }

  const toast = document.createElement('div');
  toast.id = 'harpy-app-toast';
  toast.className = `admin-toast-pill toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      ${iconSvg}
    </div>
    <div class="toast-text">${message}</div>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

function updateThemeToggleIcons() {
  const currentMode = Store.getThemeMode();
  const iconDark = elements.themeIconDark || document.getElementById('theme-icon-dark');
  const iconLight = elements.themeIconLight || document.getElementById('theme-icon-light');

  if (iconDark && iconLight) {
    if (currentMode === 'light') {
      iconDark.style.display = 'inline-block';
      iconLight.style.display = 'none';
    } else {
      iconDark.style.display = 'none';
      iconLight.style.display = 'inline-block';
    }
  }

  // Update Account View ("حسابي") theme row
  const themeStatusText = document.getElementById('clean-theme-status-text');
  const themeToggleLabel = document.getElementById('clean-theme-toggle-label');
  const themeToggleBtn = document.getElementById('clean-theme-toggle-btn');
  const isDark = (currentMode === 'dark');
  if (themeStatusText) {
    themeStatusText.textContent = isDark ? 'الوضع الداكن (Night Mode)' : 'الوضع النهاري (Light Mode)';
  }
  if (themeToggleLabel) {
    themeToggleLabel.textContent = isDark ? 'تفعيل النهاري' : 'تفعيل الداكن';
  }
  if (themeToggleBtn) {
    themeToggleBtn.classList.toggle('active', isDark);
  }
}

let lastThemeToggleTimestamp = 0;
window.handleThemeToggle = function() {
  const now = Date.now();
  if (now - lastThemeToggleTimestamp < 250) return;
  lastThemeToggleTimestamp = now;

  const currentMode = Store.getThemeMode();
  const newMode = (currentMode === 'light') ? 'dark' : 'light';

  // Instant DOM synchronization
  const root = document.documentElement;
  const body = document.body;
  root.setAttribute('data-theme', newMode);
  if (body) body.setAttribute('data-theme', newMode);

  const s = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};
  const newPreset = (newMode === 'light') ? 'cream' : ((s.themePreset && s.themePreset !== 'cream') ? s.themePreset : 'charcoal');
  root.setAttribute('data-theme-preset', newPreset);
  if (body) body.setAttribute('data-theme-preset', newPreset);

  Store.setThemeMode(newMode);
  updateThemeToggleIcons();
  if (typeof renderCleanProfileUI === 'function') renderCleanProfileUI();
  if (typeof SoundFX !== 'undefined' && SoundFX.playPop) SoundFX.playPop();
};
window.toggleTheme = window.handleThemeToggle;

function updateSoundToggleIcon() {
  const enabled = Store.getSoundEnabled();
  if (elements.soundIconOn && elements.soundIconOff) {
    if (enabled) {
      elements.soundIconOn.style.display = 'inline-block';
      elements.soundIconOff.style.display = 'none';
      if (elements.soundToggleBtn) elements.soundToggleBtn.classList.remove('muted');
    } else {
      elements.soundIconOn.style.display = 'none';
      elements.soundIconOff.style.display = 'inline-block';
      if (elements.soundToggleBtn) elements.soundToggleBtn.classList.add('muted');
    }
  }

  // Update Account View ("حسابي") sound row
  const soundToggleLabel = document.getElementById('clean-sound-toggle-label');
  const soundToggleBtn = document.getElementById('clean-sound-toggle-btn');
  if (soundToggleLabel) {
    soundToggleLabel.textContent = enabled ? 'صوت مفعل' : 'صوت صامت';
  }
  if (soundToggleBtn) {
    soundToggleBtn.classList.toggle('active', enabled);
  }
}

let lastSoundToggleTimestamp = 0;
window.handleSoundToggle = function() {
  const now = Date.now();
  if (now - lastSoundToggleTimestamp < 250) return;
  lastSoundToggleTimestamp = now;
  const prevEnabled = Store.getSoundEnabled();
  const nextEnabled = !prevEnabled;
  Store.setSoundEnabled(nextEnabled);
  updateSoundToggleIcon();
  if (typeof renderCleanProfileUI === 'function') renderCleanProfileUI();
  if (nextEnabled) {
    if (typeof SoundFX !== 'undefined' && SoundFX.playPop) SoundFX.playPop();
  }
};
window.toggleSound = window.handleSoundToggle;

// ── 3-Dots More Options Menu (Hero Navigation) ────────────
window.toggleHeroMoreMenu = function(e) {
  if (e) {
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
    if (typeof e.preventDefault === 'function') e.preventDefault();
  }
  const dropdown = document.getElementById('hero-more-dropdown');
  const triggerBtn = document.getElementById('btn-hero-more-menu');
  if (!dropdown) return;
  const isOpen = dropdown.classList.contains('show') || dropdown.style.display === 'flex';
  if (isOpen) {
    closeHeroMoreMenu();
  } else {
    dropdown.style.display = 'flex';
    requestAnimationFrame(() => {
      dropdown.classList.add('show');
    });
    if (triggerBtn) triggerBtn.classList.add('active');
  }
};

window.closeHeroMoreMenu = function() {
  const dropdown = document.getElementById('hero-more-dropdown');
  const triggerBtn = document.getElementById('btn-hero-more-menu');
  if (!dropdown) return;
  dropdown.classList.remove('show');
  setTimeout(() => {
    if (!dropdown.classList.contains('show')) {
      dropdown.style.display = 'none';
    }
  }, 200);
  if (triggerBtn) triggerBtn.classList.remove('active');
};

document.addEventListener('click', function(e) {
  const wrapper = document.querySelector('.hero-more-menu-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeHeroMoreMenu();
  }
});


const VIEW_MODE_ICONS = {
  dual: `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
  large: `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="18" height="8" x="3" y="3" rx="1.5"/><rect width="18" height="8" x="3" y="13" rx="1.5"/></svg>`,
  list: `<svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`
};

const VIEW_MODE_TITLES = {
  dual: 'طريقة العرض: صنفين بجانب بعض (انقر للتغيير)',
  large: 'طريقة العرض: بطاقة كبيرة (انقر للتغيير)',
  list: 'طريقة العرض: قائمة سريعة (انقر للتغيير)'
};

function initViewMode() {
  const mode = Store.getViewMode();
  applyViewMode(mode);
}

function applyViewMode(mode) {
  const validModes = ['dual', 'large', 'list'];
  const activeMode = validModes.includes(mode) ? mode : 'dual';

  const container = elements.productsContainer || document.getElementById('products-container');
  if (container) {
    container.classList.remove('view-mode-grid', 'view-mode-list', 'view-mode-dual', 'view-mode-large');
    container.classList.add(`view-mode-${activeMode}`);
  }

  const cycleBtn = elements.viewModeCycleBtn || document.getElementById('view-mode-cycle-btn');
  if (cycleBtn) {
    cycleBtn.innerHTML = VIEW_MODE_ICONS[activeMode] || VIEW_MODE_ICONS.dual;
    cycleBtn.title = VIEW_MODE_TITLES[activeMode] || '';
    cycleBtn.setAttribute('data-mode', activeMode);
    cycleBtn.classList.add('active');
  }

  if (elements.viewToggleGrid) elements.viewToggleGrid.classList.toggle('active', activeMode === 'dual' || activeMode === 'large');
  if (elements.viewToggleList) elements.viewToggleList.classList.toggle('active', activeMode === 'list');
}

function cycleViewMode() {
  const currentMode = Store.getViewMode();
  let nextMode = 'dual';
  if (currentMode === 'dual') {
    nextMode = 'large';
  } else if (currentMode === 'large') {
    nextMode = 'list';
  } else {
    nextMode = 'dual';
  }
  handleViewModeChange(nextMode);
}

function handleViewModeChange(mode) {
  Store.setViewMode(mode);
  applyViewMode(mode);

  const cycleBtn = elements.viewModeCycleBtn || document.getElementById('view-mode-cycle-btn');
  if (cycleBtn) {
    cycleBtn.classList.add('anim-rotate-pop');
    setTimeout(() => {
      if (cycleBtn) cycleBtn.classList.remove('anim-rotate-pop');
    }, 260);
  }
}

function renderStoreInfo() {
  const settings = Store.getSettings();
  const slug = Store.getRestaurantSlug();
  const isDemo = (slug === 'demo');

  const displayName = settings.storeName || (isDemo ? "سوبر برجر | Super Burger" : "مطعمنا المتميز");
  const displayTagline = settings.storeTagline || (isDemo ? "أشهى المأكولات الطازجة" : "أشهى وألذ المأكولات المحضرة يومياً");
  const displayLogo = (settings.logo && settings.logo.trim() && settings.logo !== 'null') ? settings.logo : (isDemo ? 'assets/portfolio/logo.png' : 'assets/portfolio/logo.png');
  const displayCover = (settings.cover && settings.cover.trim() && settings.cover !== 'null') ? settings.cover : (isDemo ? 'assets/portfolio/order_restaurant_showcase.jpg' : 'assets/portfolio/order_restaurant_showcase.jpg');
  const curLang = (typeof window.I18n !== 'undefined') ? window.I18n.getLanguage() : 'ar';
  const rawDelivery = settings.deliveryTime || '25 - 35 دقيقة';
  const displayDelivery = (curLang === 'en') ? rawDelivery.replace(/دقيقة|دقائق/g, 'mins') : rawDelivery;

  if (elements.storeName) elements.storeName.textContent = displayName;
  if (elements.storeTagline) elements.storeTagline.textContent = displayTagline;
  if (elements.storeLogo) elements.storeLogo.src = displayLogo;

  // Update Portfolio elements in #view-portfolio
  const pStoreName = document.getElementById('portfolio-store-name');
  if (pStoreName) pStoreName.textContent = displayName;

  const pStoreTagline = document.getElementById('portfolio-store-tagline');
  if (pStoreTagline) pStoreTagline.textContent = displayTagline;

  const pStoreLogo = document.getElementById('portfolio-store-logo');
  if (pStoreLogo) pStoreLogo.src = displayLogo;

  const pCoverImg = document.getElementById('portfolio-cover-img');
  if (pCoverImg) pCoverImg.src = displayCover;

  const pAboutText = document.getElementById('portfolio-about-text');
  if (pAboutText) {
    pAboutText.textContent = settings.aboutText || settings.storeTagline || (typeof window.t === 'function' ? window.t('portfolio_about_default', 'في مطعمنا بنقدملك طعم أصيل ووصفات مميزة بأجود المكونات وبدون أي تنازلات على الجودة. كل وجبة بتحكي قصة نكهة من قلب المطبخ.') : 'في مطعمنا بنقدملك طعم أصيل ووصفات مميزة بأجود المكونات وبدون أي تنازلات على الجودة. كل وجبة بتحكي قصة نكهة من قلب المطبخ.');
  }

  const pDeliveryTime = document.getElementById('portfolio-delivery-time');
  if (pDeliveryTime) {
    pDeliveryTime.textContent = displayDelivery;
  }
  const pDeliveryTimeBadge = document.getElementById('portfolio-delivery-time-badge');
  if (pDeliveryTimeBadge) {
    pDeliveryTimeBadge.textContent = displayDelivery;
  }

  const pAddressText = document.getElementById('portfolio-address-text');
  if (pAddressText) {
    pAddressText.textContent = settings.address || (typeof window.t === 'function' ? window.t('portfolio_address_default', 'العنوان متاح عبر خدمة التوصيل والاستلام من الفرع') : 'العنوان متاح عبر خدمة التوصيل والاستلام من الفرع');
  }

  const pMapLink = document.getElementById('portfolio-map-link');
  if (pMapLink) {
    pMapLink.href = settings.locationUrl || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(settings.address || displayName));
  }

  const cleanWaNum = (settings.whatsappNumber || '').replace(/\D/g, '');
  const pWaBtn = document.getElementById('portfolio-wa-btn');
  if (pWaBtn) {
    pWaBtn.href = `https://wa.me/${cleanWaNum}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن تفاصيل المنيو والطلبات ')}`;
  }

  const rawPhone = settings.phone || settings.whatsappNumber || '';
  const pPhoneBtn = document.getElementById('portfolio-phone-btn');
  if (pPhoneBtn) {
    pPhoneBtn.href = rawPhone ? `tel:${rawPhone.replace(/\s+/g, '')}` : '#';
  }

  // Bind Restaurant Social Media Channels (Facebook, Instagram, TikTok)
  const pSocialBrandName = document.getElementById('portfolio-social-brand-name');
  if (pSocialBrandName) pSocialBrandName.textContent = displayName;

  const pSocialCard = document.getElementById('portfolio-social-card');
  const pFbBtn = document.getElementById('portfolio-social-fb');
  const pIgBtn = document.getElementById('portfolio-social-ig');
  const pTtBtn = document.getElementById('portfolio-social-tt');

  const cleanFb = (settings.facebookUrl || '').trim();
  if (pFbBtn) {
    if (cleanFb) {
      pFbBtn.href = cleanFb;
      pFbBtn.style.opacity = '1';
      pFbBtn.style.pointerEvents = 'auto';
    } else {
      pFbBtn.href = `https://www.facebook.com/search/top?q=${encodeURIComponent(displayName)}`;
      pFbBtn.style.opacity = '0.75';
    }
  }

  const cleanIg = (settings.instagramUrl || '').trim();
  if (pIgBtn) {
    if (cleanIg) {
      pIgBtn.href = cleanIg;
      pIgBtn.style.opacity = '1';
      pIgBtn.style.pointerEvents = 'auto';
    } else {
      pIgBtn.href = `https://www.instagram.com/explore/tags/${encodeURIComponent(displayName.replace(/\s+/g, ''))}`;
      pIgBtn.style.opacity = '0.75';
    }
  }

  const cleanTt = (settings.tiktokUrl || '').trim();
  if (pTtBtn) {
    if (cleanTt) {
      pTtBtn.href = cleanTt;
      pTtBtn.style.opacity = '1';
      pTtBtn.style.pointerEvents = 'auto';
    } else {
      pTtBtn.href = `https://www.tiktok.com/search?q=${encodeURIComponent(displayName)}`;
      pTtBtn.style.opacity = '0.75';
    }
  }

  if (pSocialCard) {
    pSocialCard.style.display = 'block';
  }

  // Update PWA install banner & branding with restaurant name & logo
  if (typeof window.updatePwaBranding === 'function') {
    window.updatePwaBranding(settings);
  }

  // Menu Compact Header Brand bindings (Matching Mockup)
  const heroStoreName = document.getElementById('hero-store-name');
  if (heroStoreName) heroStoreName.textContent = displayName;

  const heroStoreTagline = document.getElementById('hero-store-tagline');
  if (heroStoreTagline) heroStoreTagline.textContent = displayTagline;

  const heroStoreLogo = document.getElementById('hero-store-logo');
  if (heroStoreLogo) heroStoreLogo.src = displayLogo;

  // Hero Cover Image in Menu view (if present)
  const heroCoverImg = document.getElementById('hero-cover-img');
  if (heroCoverImg) {
    heroCoverImg.src = displayCover;
    heroCoverImg.style.display = 'block';
  }

  // Hero Delivery Time in Menu view
  const heroDelivery = document.getElementById('hero-delivery-time');
  if (heroDelivery) {
    heroDelivery.textContent = displayDelivery;
  }

  // Hero Open/Closed Status Badge (Dynamic: مفتوح الآن / مغلق الآن)
  const heroStatusChip = document.getElementById('hero-status-chip');
  const heroStatusText = document.getElementById('hero-status-text');
  const pStatusChip = document.getElementById('portfolio-status-chip');
  const pStatusText = document.getElementById('portfolio-status-text');
  const pStatusBanner = document.getElementById('portfolio-current-status-banner');

  const isClosed = (settings.isOrderingPaused === true);

  if (heroStatusChip && heroStatusText) {
    if (isClosed) {
      heroStatusChip.classList.remove('open');
      heroStatusChip.classList.add('closed');
      heroStatusText.textContent = (typeof window.t === 'function') ? window.t('status_closed_now', 'مغلق الآن') : 'مغلق الآن';
    } else {
      heroStatusChip.classList.remove('closed');
      heroStatusChip.classList.add('open');
      heroStatusText.textContent = (typeof window.t === 'function') ? window.t('status_open_now', 'مفتوح الآن') : 'مفتوح الآن';
    }
  }

  if (pStatusChip && pStatusText) {
    if (isClosed) {
      pStatusChip.classList.remove('open');
      pStatusChip.classList.add('closed');
      pStatusText.textContent = (typeof window.t === 'function') ? window.t('status_closed_now', 'مغلق الآن') : 'مغلق الآن';
    } else {
      pStatusChip.classList.remove('closed');
      pStatusChip.classList.add('open');
      pStatusText.textContent = (typeof window.t === 'function') ? window.t('status_open_now', 'مفتوح الآن') : 'مفتوح الآن';
    }
  }

  if (pStatusBanner) {
    if (isClosed) {
      pStatusBanner.className = 'status-badge-inline closed';
      pStatusBanner.textContent = (typeof window.t === 'function') ? window.t('status_closed_banner', 'المطعم مغلق حالياً عن استقبال الطلبات') : 'المطعم مغلق حالياً عن استقبال الطلبات';
    } else {
      pStatusBanner.className = 'status-badge-inline open';
      pStatusBanner.textContent = (typeof window.t === 'function') ? window.t('status_open_banner', 'نستقبل طلباتكم الآن بكل حب') : 'نستقبل طلباتكم الآن بكل حب';
    }
  }

  // Sync favorites badge count in hero nav
  const heroFavBadge = document.getElementById('hero-fav-badge-count');
  if (heroFavBadge) {
    const favCount = (Store.getFavorites && typeof Store.getFavorites === 'function') ? Store.getFavorites().length : 0;
    heroFavBadge.textContent = favCount;
    heroFavBadge.style.display = favCount > 0 ? 'inline-block' : 'none';
  }

  if (elements.storeWhatsAppLink) {
    elements.storeWhatsAppLink.href = `https://wa.me/${cleanWaNum}`;
  }

  if (elements.walletNameDisplay) {
    elements.walletNameDisplay.textContent = settings.walletName || "فودافون كاش / إنستاباي";
  }
  if (elements.walletNumDisplay) {
    elements.walletNumDisplay.textContent = settings.walletNumber || "010xxxxxxxx";
  }

  // Subscription Status Gate (Telegram Bot & SaaS Control)
  const sub = settings.subscription;
  const overlay = document.getElementById('subscription-suspended-overlay');
  const backdrop = document.getElementById('subscription-suspended-backdrop');
  const contactBtn = document.getElementById('sub-suspended-contact-btn');

  if (sub && (sub.status === 'suspended' || (sub.expiresAt && new Date() > new Date(sub.expiresAt)))) {
    if (overlay) overlay.style.display = 'block';
    if (backdrop) backdrop.style.display = 'block';
    if (contactBtn && settings.whatsappNumber) {
      contactBtn.href = `https://wa.me/${(settings.whatsappNumber || '').replace(/\D/g, '')}`;
    }
  } else {
    if (overlay) overlay.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
  }
}


// ── Fly-to-Cart Particle Animation ─────────────────────────
function animateFlyToCart(sourceElement, imageUrl) {
  if (!sourceElement) return;
  const targetElement = document.getElementById('nav-tab-cart') || document.getElementById('desktop-nav-cart');
  if (!targetElement) return;

  const rect = sourceElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  if (targetRect.width === 0 && targetRect.height === 0) return;

  const particle = document.createElement('img');
  particle.src = imageUrl || '';
  particle.className = 'flying-dish-particle';
  particle.style.top = `${rect.top + rect.height / 2 - 24}px`;
  particle.style.left = `${rect.left + rect.width / 2 - 24}px`;
  document.body.appendChild(particle);

  requestAnimationFrame(() => {
    particle.style.transform = `translate(${targetRect.left + targetRect.width / 2 - (rect.left + rect.width / 2)}px, ${targetRect.top + targetRect.height / 2 - (rect.top + rect.height / 2)}px) scale(0.2)`;
    particle.style.opacity = '0.2';
  });

  setTimeout(() => {
    particle.remove();
    targetElement.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.25)' },
      { transform: 'scale(1)' }
    ], { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
  }, 650);
}

function renderAnnouncement() {
  const settings = Store.getSettings();
  const promoCard = document.getElementById('promo-deal-card');
  const promoTitle = document.getElementById('promo-deal-title');

  if (!promoCard) return;

  const isEnabled = (settings.showAnnouncement === true || settings.showAnnouncement === 'true');
  const hasText = !!(settings.announcementText && settings.announcementText.trim());
  const hasAnnouncement = isEnabled && hasText;

  if (hasAnnouncement) {
    promoCard.style.removeProperty('display');
    promoCard.style.display = 'flex';
    if (promoTitle) {
      const curLang = (typeof I18n !== 'undefined') ? I18n.getLanguage() : 'ar';
      promoTitle.textContent = (curLang !== 'ar' && typeof tr === 'function') 
        ? tr(settings.announcementText.trim()) 
        : settings.announcementText.trim();
    }
  } else {
    promoCard.style.setProperty('display', 'none', 'important');
  }

  if (elements.announcementBar) {
    elements.announcementBar.style.setProperty('display', 'none', 'important');
  }
}


// ── Store Ordering Paused (Friendly Non-Blocking Notice When Attempting to Order) ──
function showOrderingPausedNotice(customMsg) {
  const s = Store.getSettings();
  const backdrop = document.getElementById('ordering-paused-backdrop');
  const modal = document.getElementById('ordering-paused-modal');
  const msgEl = document.getElementById('ordering-paused-modal-msg');
  const titleEl = document.getElementById('ordering-paused-title');
  const iconEl = document.getElementById('ordering-paused-icon');
  const waBtn = document.getElementById('ordering-paused-wa-btn');

  if (msgEl) {
    msgEl.textContent = customMsg || (s && s.orderingPausedMessage)
      ? (customMsg || s.orderingPausedMessage)
      : 'عذراً، المطعم لا يستقبل طلبات جديدة في الوقت الحالي. يمكنك تصفح قائمة الطعام والأسعار بحرية، وسنعاود استقبال الطلبات قريباً! ';
  }
  if (titleEl) titleEl.textContent = 'المطعم متوقف حالياً عن استقبال الطلبات';
  if (iconEl) iconEl.innerHTML = '<svg class="icon" viewBox="0 0 24 24" style="width:32px; height:32px;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>';

  if (waBtn && s && s.whatsappNumber) {
    const cleanWa = String(s.whatsappNumber).replace(/\D/g, '');
    waBtn.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent('مرحباً، متى يبدأ استقبال الطلبات؟')}`;
    waBtn.style.display = 'inline-block';
  } else if (waBtn) {
    waBtn.style.display = 'none';
  }

  if (backdrop) backdrop.classList.add('active');
  if (modal) modal.classList.add('active');
}

function closeOrderingPausedNotice() {
  const backdrop = document.getElementById('ordering-paused-backdrop');
  const modal = document.getElementById('ordering-paused-modal');
  if (backdrop) backdrop.classList.remove('active');
  if (modal) modal.classList.remove('active');
}

function checkOrderingPaused() {
  const s = Store.getSettings();
  if (s.isOrderingPaused === true) {
    showOrderingPausedNotice(s.orderingPausedMessage);
    return true;
  }
  return false;
}

function applyOrderingPausedUI(settings) {
  renderStoreInfo();
}

function removeOrderingPausedUI() {
  closeOrderingPausedNotice();
  renderStoreInfo();
}

window.showOrderingPausedNotice = showOrderingPausedNotice;
window.closeOrderingPausedNotice = closeOrderingPausedNotice;
window.openOrderingPausedModal = showOrderingPausedNotice;
window.closeOrderingPausedModal = closeOrderingPausedNotice;

function setupSubscriptionWatcher() {
  const suspendedBackdrop = document.getElementById('subscription-suspended-backdrop');
  const suspendedOverlay = document.getElementById('subscription-suspended-overlay');
  const contactBtn = document.getElementById('sub-suspended-contact-btn');
  const titleEl = document.getElementById('sub-suspended-title');
  const descEl = document.getElementById('sub-suspended-desc');
  const iconEl = document.getElementById('sub-suspended-icon');

  const slug = Store.getRestaurantSlug();
  const cachedStatus = localStorage.getItem(`harpy_${slug}_sub_status`);

  const applyStatusUI = (statusReason) => {
    document.body.classList.add('harpy-account-locked');
    if (suspendedBackdrop) suspendedBackdrop.classList.add('active');
    if (suspendedOverlay) suspendedOverlay.classList.add('active');

    if (statusReason === 'deleted') {
      if (iconEl) iconEl.innerHTML = '<svg class="icon" viewBox="0 0 24 24" style="width:28px; height:28px;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>';
      if (titleEl) titleEl.textContent = 'المطعم غير موجود أو تم حذفه نهائياً';
      if (descEl) descEl.textContent = 'تم إيقاف هذا الرابط وحذف بيانات هذا المطعم بالكامل من منصة هاربي.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201019971508?text=${encodeURIComponent(`مرحباً إدارة منصة هاربي، أود الاستفسار عن رابط المطعم (${slug})`)}`;
        contactBtn.textContent = 'تواصل مع إدارة منصة هاربي';
      }
    } else if (statusReason === 'expired') {
      if (iconEl) iconEl.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
      if (titleEl) titleEl.textContent = 'انتهت صلاحية اشتراك هذا المطعم';
      if (descEl) descEl.textContent = 'قائمة هذا المطعم متوقفة مؤقتاً لانتهاء الباقة. يرجى التجديد للاستمرار.';
      if (contactBtn) {
        const settings = Store.getSettings();
        const cleanWa = (settings.whatsappNumber || '').replace(/\D/g, '');
        contactBtn.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن تجديد اشتراك منيو ${settings.storeName || slug}`)}`;
        contactBtn.textContent = 'تواصل مع المطعم لتجديد الاشتراك';
      }
    } else {
      if (iconEl) iconEl.innerHTML = '<svg class="icon" viewBox="0 0 24 24" style="width:28px; height:28px;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
      if (titleEl) titleEl.textContent = 'عفواً، الخدمة متوقفة مؤقتاً';
      if (descEl) descEl.textContent = 'قائمة هذا المطعم غير متاحة حالياً لتلقي طلبات الأونلاين أو جاري تجديد الاشتراك.';
      if (contactBtn) {
        const settings = Store.getSettings();
        const cleanWa = (settings.whatsappNumber || '').replace(/\D/g, '');
        contactBtn.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن منيو ${settings.storeName || slug}`)}`;
        contactBtn.textContent = 'تواصل مع المطعم عبر الواتساب';
      }
    }
  };

  // Apply cached suspended/deleted/blocked state immediately on page load to prevent flashing
  if (cachedStatus === 'suspended' || cachedStatus === 'blocked' || cachedStatus === 'expired' || cachedStatus === 'deleted') {
    applyStatusUI(cachedStatus);
    const _slug = slug;
    fetch(`https://harpy-order-default-rtdb.firebaseio.com/licenses/${_slug}.json`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(lic => {
        if (lic && lic.status === 'active' && (!lic.expiresAt || new Date() < new Date(lic.expiresAt))) {
          // Re-activated!
          try { localStorage.setItem(`harpy_${_slug}_sub_status`, 'active'); } catch(e) {}
          document.body.classList.remove('harpy-account-locked');
          if (suspendedBackdrop) suspendedBackdrop.classList.remove('active');
          if (suspendedOverlay) suspendedOverlay.classList.remove('active');
        } else if (lic && lic.status === 'deleted') {
          try { Store.purgeRestaurantCache(_slug); } catch(e) {}
          try { localStorage.setItem(`harpy_${_slug}_sub_status`, 'deleted'); } catch(e) {}
          applyStatusUI('deleted');
        } else if (lic && lic.status) {
          applyStatusUI(lic.status);
        } else if (lic === null && _slug !== 'demo') {
          // Verify with shallow settings check if restaurant was deleted
          fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${_slug}/settings.json?shallow=true`, { cache: 'no-store' })
            .then(sr => sr.ok ? sr.json() : null)
            .then(sData => {
              if (sData === null) {
                try { Store.purgeRestaurantCache(_slug); } catch(e) {}
                try { localStorage.setItem(`harpy_${_slug}_sub_status`, 'deleted'); } catch(e) {}
                applyStatusUI('deleted');
              }
            }).catch(() => {});
        }
      })
      .catch(() => {});
  }

  Store.startSubscriptionWatcher((status) => {
    if (!status.active) {
      applyStatusUI(status.reason);
    } else {
      document.body.classList.remove('harpy-account-locked');
      if (suspendedBackdrop) suspendedBackdrop.classList.remove('active');
      if (suspendedOverlay) suspendedOverlay.classList.remove('active');
    }
  });

  window.addEventListener('harpy_subscription_status', (e) => {
    if (e && e.detail && !e.detail.active) {
      applyStatusUI(e.detail.reason);
    }
  });
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER PROFILE & ONBOARDING ENGINE ("حسابي" & Auto-Fill)
// ═══════════════════════════════════════════════════════════

function getCustomerProfile() {
  try {
    const raw = localStorage.getItem('harpy_customer_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.name || parsed.phone || parsed.address)) return parsed;
    }
  } catch(e) {}
  // Legacy fallback: check past order fields
  try {
    const legacyName = localStorage.getItem('harpy_last_order_customer_name') || '';
    const legacyPhone = localStorage.getItem('harpy_last_order_customer_phone') || '';
    const legacyAddress = localStorage.getItem('harpy_last_order_customer_address') || '';
    if (legacyName || legacyPhone || legacyAddress) {
      const p = { name: legacyName.trim(), phone: legacyPhone.trim(), address: legacyAddress.trim(), updatedAt: Date.now() };
      localStorage.setItem('harpy_customer_profile', JSON.stringify(p));
      return p;
    }
  } catch(e) {}
  // Also check Store.getLastOrder() if available
  try {
    if (typeof Store !== 'undefined' && Store.getLastOrder) {
      const last = Store.getLastOrder();
      if (last && last.customer && (last.customer.name || last.customer.phone || last.customer.address)) {
        const p = {
          name: (last.customer.name || '').trim(),
          phone: (last.customer.phone || '').trim(),
          address: (last.customer.address || '').trim(),
          updatedAt: Date.now()
        };
        localStorage.setItem('harpy_customer_profile', JSON.stringify(p));
        return p;
      }
    }
  } catch(e) {}
  return null;
}

function saveCustomerProfile(name, phone, address = '', notes = '', lang = '') {
  if (!name && !phone && !address) return false;
  const current = getCustomerProfile() || {};
  const cleanName = (name !== undefined && name !== null ? String(name) : (current.name || '')).trim();
  const cleanPhone = (phone !== undefined && phone !== null ? String(phone) : (current.phone || '')).trim();
  const cleanAddress = (address !== undefined && address !== null ? String(address) : (current.address || '')).trim();
  const cleanNotes = (notes !== undefined && notes !== null ? String(notes) : (current.notes || '')).trim();
  const cleanLang = (lang !== undefined && lang !== null && lang !== '' ? String(lang) : (current.lang || (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar'))).trim();

  const profile = {
    name: cleanName,
    phone: cleanPhone,
    address: cleanAddress,
    notes: cleanNotes,
    lang: cleanLang,
    updatedAt: Date.now()
  };

  try {
    localStorage.setItem('harpy_customer_profile', JSON.stringify(profile));
    if (cleanName) localStorage.setItem('harpy_last_order_customer_name', cleanName);
    if (cleanPhone) localStorage.setItem('harpy_last_order_customer_phone', cleanPhone);
    if (cleanAddress) localStorage.setItem('harpy_last_order_customer_address', cleanAddress);
    if (cleanLang) localStorage.setItem('harpy_customer_lang', cleanLang);
  } catch(e) {}

  if (elements.custName && cleanName) elements.custName.value = cleanName;
  if (elements.custPhone && cleanPhone) elements.custPhone.value = cleanPhone;
  if (elements.custAddress && cleanAddress) elements.custAddress.value = cleanAddress;

  updateAccountDrawerProfileUI();
  if (typeof renderCleanProfileUI === 'function') renderCleanProfileUI();
  if (typeof window.updateCartSavedProfileBanner === 'function') window.updateCartSavedProfileBanner();
  return true;
}

function checkCustomerOnboarding() {
  const profile = getCustomerProfile();
  if (profile) {
    if (elements.custName && !elements.custName.value && profile.name) elements.custName.value = profile.name;
    if (elements.custPhone && !elements.custPhone.value && profile.phone) elements.custPhone.value = profile.phone;
    if (elements.custAddress && !elements.custAddress.value && profile.address) elements.custAddress.value = profile.address;
    if (profile.lang && typeof I18n !== 'undefined' && I18n.getLanguage() !== profile.lang) {
      I18n.setLanguage(profile.lang, false);
    }
    updateAccountDrawerProfileUI();
    if (typeof renderCleanProfileUI === 'function') renderCleanProfileUI();
  }

  // Check if visitor has completed or skipped Language & Profile Onboarding
  const hasOnboarded = localStorage.getItem('harpy_customer_lang_onboarded');
  const hasSkipped = sessionStorage.getItem('harpy_onboard_skipped');

  // Also check URL flag to force open for testing: ?onboard or ?lang
  const urlParams = new URLSearchParams(window.location.search);
  const forceOpen = urlParams.has('onboard') || urlParams.has('lang');

  if ((!hasOnboarded && !hasSkipped) || forceOpen) {
    setTimeout(() => {
      openCustomerOnboardModal();
    }, 450);
  }
}

function openCustomerOnboardModal() {
  const backdrop = document.getElementById('customer-onboard-backdrop');
  const modal = document.getElementById('customer-onboard-modal');
  if (backdrop && modal) {
    backdrop.classList.add('active', 'open', 'show');
    modal.classList.add('open', 'show');
    pushNavState('onboard_modal');
    const curLang = (typeof I18n !== 'undefined') ? I18n.getLanguage() : 'ar';
    if (typeof window.selectOnboardLanguage === 'function') {
      window.selectOnboardLanguage(curLang);
    }

    // Pre-populate input fields if profile already exists
    const profile = getCustomerProfile();
    const nameInput = document.getElementById('onboard-name');
    const phoneInput = document.getElementById('onboard-phone');
    const addressInput = document.getElementById('onboard-address');
    if (nameInput && profile && profile.name && !nameInput.value) nameInput.value = profile.name;
    if (phoneInput && profile && profile.phone && !phoneInput.value) phoneInput.value = profile.phone;
    if (addressInput && profile && profile.address && !addressInput.value) addressInput.value = profile.address;

    setTimeout(() => {
      if (nameInput && !nameInput.value) nameInput.focus();
    }, 300);
  }
}

window.selectOnboardLanguage = function(langCode) {
  if (typeof I18n === 'undefined') return;
  const langConfig = I18n.supportedLanguages[langCode] || I18n.supportedLanguages.ar;

  document.querySelectorAll('.onboard-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === langCode);
  });

  const modal = document.getElementById('customer-onboard-modal');
  if (modal) {
    modal.setAttribute('dir', langConfig.dir);
  }

  I18n.setLanguage(langCode, true);
};

function closeCustomerOnboardModal(skipped = false, updateHistory = true) {
  const backdrop = document.getElementById('customer-onboard-backdrop');
  const modal = document.getElementById('customer-onboard-modal');
  if (backdrop) backdrop.classList.remove('active', 'open', 'show');
  if (modal) modal.classList.remove('open', 'show');
  if (skipped) {
    sessionStorage.setItem('harpy_onboard_skipped', 'true');
    localStorage.setItem('harpy_customer_lang_onboarded', 'true');
  }
  if (updateHistory && history.state && history.state.harpyNav === 'onboard_modal') {
    history.back();
  }
}

function handleCustomerOnboardSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const nameInput = document.getElementById('onboard-name');
  const phoneInput = document.getElementById('onboard-phone');
  const addressInput = document.getElementById('onboard-address');
  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const address = addressInput ? addressInput.value.trim() : '';
  const activeBtn = document.querySelector('.onboard-lang-btn.active');
  const lang = activeBtn ? activeBtn.getAttribute('data-lang') : (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar');

  if (!name || name.length < 2) {
    const msg = (typeof t === 'function') ? t('field_name_placeholder') : "يرجى كتابة الاسم بشكل صحيح";
    showToastNotification(msg, "error");
    if (nameInput) nameInput.focus();
    return;
  }
  if (!phone || phone.length < 8) {
    const msg = (typeof t === 'function') ? t('field_phone_placeholder') : "يرجى كتابة رقم هاتف صحيح";
    showToastNotification(msg, "error");
    if (phoneInput) phoneInput.focus();
    return;
  }

  saveCustomerProfile(name, phone, address, '', lang);
  localStorage.setItem('harpy_customer_lang_onboarded', 'true');
  if (typeof I18n !== 'undefined') {
    I18n.setLanguage(lang, true);
  }
  closeCustomerOnboardModal(false, false);
  const toastText = (typeof t === 'function') ? t('toast_profile_saved') : "تم حفظ بياناتك بنجاح";
  showToastNotification(`${toastText} (${name})`, "success");
  if (typeof SoundFX !== 'undefined' && SoundFX.playPop) SoundFX.playPop();
}

window.openLanguagePickerModal = function() {
  const backdrop = document.getElementById('lang-picker-backdrop');
  const modal = document.getElementById('lang-picker-modal');
  const list = document.getElementById('lang-picker-options-list');
  if (!backdrop || !modal) return;

  const curLang = (typeof I18n !== 'undefined') ? I18n.getLanguage() : 'ar';
  const langs = (typeof I18n !== 'undefined') ? I18n.supportedLanguages : {};

  if (list) {
    list.innerHTML = Object.values(langs).map(l => {
      const isSelected = (l.code === curLang);
      return `
        <button type="button" onclick="selectLanguageOption('${l.code}')" style="width:100%; border:1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}; background:${isSelected ? 'var(--primary-subtle)' : 'var(--surface)'}; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; text-align:${l.dir === 'rtl' ? 'right' : 'left'}; font-family:inherit; transition:all 0.18s ease;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px; line-height:1;">${l.flag}</span>
            <div style="text-align:${l.dir === 'rtl' ? 'right' : 'left'};">
              <div style="font-size:14px; font-weight:900; color:var(--text-main); line-height:1.2;">${l.name}</div>
              <div style="font-size:11px; color:var(--text-muted); line-height:1.2; margin-top:2px;">${l.englishName}</div>
            </div>
          </div>
          ${isSelected ? `<span style="font-size:11px; font-weight:800; color:var(--primary); background:rgba(234,88,12,0.12); padding:3px 8px; border-radius:6px;">✓ ${l.code === 'ar' ? 'النشطة' : 'Active'}</span>` : ''}
        </button>
      `;
    }).join('');
  }

  backdrop.classList.add('active', 'open', 'show');
  modal.classList.add('open', 'show');
  pushNavState('lang_picker_modal');
};

window.closeLanguagePickerModal = function(updateHistory = true) {
  const backdrop = document.getElementById('lang-picker-backdrop');
  const modal = document.getElementById('lang-picker-modal');
  if (backdrop) backdrop.classList.remove('active', 'open', 'show');
  if (modal) modal.classList.remove('open', 'show');
  if (updateHistory && history.state && history.state.harpyNav === 'lang_picker_modal') {
    history.back();
  }
};

window.selectLanguageOption = function(langCode) {
  if (typeof I18n !== 'undefined') {
    I18n.setLanguage(langCode, true);
  }
  closeLanguagePickerModal(false);
  const langName = (I18n && I18n.supportedLanguages[langCode]) ? I18n.supportedLanguages[langCode].name : langCode;
  const msg = (typeof t === 'function') ? t('toast_lang_changed') : "تم تغيير لغة التطبيق بنجاح";
  showToastNotification(`${msg} (${langName})`, "success");
  if (typeof SoundFX !== 'undefined' && SoundFX.playPop) SoundFX.playPop();
};

window.toggleAppLanguage = function() {
  const cur = (typeof I18n !== 'undefined') ? I18n.getLanguage() : 'ar';
  const next = (cur === 'ar') ? 'en' : 'ar';
  if (typeof I18n !== 'undefined') {
    I18n.setLanguage(next, true);
  }
  const langName = (I18n && I18n.supportedLanguages[next]) ? I18n.supportedLanguages[next].name : next;
  const msg = (typeof t === 'function') ? t('toast_lang_changed') : "تم تغيير لغة التطبيق بنجاح";
  showToastNotification(`${msg} (${langName})`, "success");
  if (typeof SoundFX !== 'undefined' && SoundFX.playPop) SoundFX.playPop();
};

// ── MY ACCOUNT DRAWER ─────────────────────────────────────

function openMyAccountDrawer() {
  const backdrop = document.getElementById('my-account-backdrop');
  const drawer = document.getElementById('my-account-drawer');
  if (!drawer) return;

  updateAccountDrawerProfileUI();

  if (backdrop) backdrop.classList.add('active');
  drawer.classList.add('open');
  document.body.classList.add('cart-drawer-open');
  pushNavState('account_drawer');
  if (typeof SoundFX !== 'undefined' && SoundFX.playPop) SoundFX.playPop();
}

function closeMyAccountDrawer(updateHistory = true) {
  const backdrop = document.getElementById('my-account-backdrop');
  const drawer = document.getElementById('my-account-drawer');
  if (backdrop) backdrop.classList.remove('active');
  if (drawer) drawer.classList.remove('open');
  document.body.classList.remove('cart-drawer-open');
  toggleEditProfileForm(false);
  if (updateHistory && history.state && history.state.harpyNav === 'account_drawer') {
    history.back();
  }
}

function updateAccountDrawerProfileUI() {
  const profile = getCustomerProfile();
  const nameEl = document.getElementById('account-display-name');
  const phoneEl = document.getElementById('account-display-phone');
  const avatarChar = document.getElementById('account-avatar-char');
  const favCountEl = document.getElementById('account-fav-count');
  const soundStateEl = document.getElementById('account-sound-state');
  const lastOrderSub = document.getElementById('account-last-order-sub');
  const waLink = document.getElementById('account-whatsapp-link');

  if (profile) {
    if (nameEl) nameEl.textContent = profile.name;
    if (phoneEl) phoneEl.textContent = profile.phone;
    if (avatarChar) {
      avatarChar.textContent = profile.name.trim().charAt(0) || 'م';
    }
  } else {
    if (nameEl) nameEl.textContent = 'عميلنا العزيز';
    if (phoneEl) phoneEl.textContent = 'انقر تعديل لتسجيل بياناتك';
    if (avatarChar) avatarChar.innerHTML = '<svg class="icon" viewBox="0 0 24 24" style="width:24px; height:24px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  }

  if (favCountEl) {
    const favs = (Store.getFavorites && typeof Store.getFavorites === 'function') ? Store.getFavorites() : [];
    favCountEl.textContent = favs.length;
  }

  if (soundStateEl) {
    const soundOn = (Store.getSoundEnabled && typeof Store.getSoundEnabled === 'function') ? Store.getSoundEnabled() : true;
    soundStateEl.textContent = soundOn ? 'مفعلة' : 'مكتومة';
  }

  const lastOrderId = localStorage.getItem('harpy_last_order_id');
  if (lastOrderSub) {
    lastOrderSub.textContent = lastOrderId ? `طلب مسجل (${lastOrderId})` : 'لا توجد طلبات سابقة مسجلة';
  }

  const settings = Store.getSettings();
  if (waLink && settings && settings.whatsappNumber) {
    const cleanWa = String(settings.whatsappNumber).replace(/\D/g, '');
    waLink.href = `https://wa.me/${cleanWa}`;
    waLink.style.display = 'flex';
  }

  // Pre-fill edit inputs if form is rendered
  const editName = document.getElementById('edit-profile-name');
  const editPhone = document.getElementById('edit-profile-phone');
  const editAddress = document.getElementById('edit-profile-address');
  const addrEl = document.getElementById('account-display-address');
  if (profile) {
    if (editName && !editName.value) editName.value = profile.name || '';
    if (editPhone && !editPhone.value) editPhone.value = profile.phone || '';
    if (editAddress && !editAddress.value) editAddress.value = profile.address || '';
    if (addrEl) {
      if (profile.address) {
        addrEl.textContent = profile.address;
        addrEl.style.display = 'block';
      } else {
        addrEl.style.display = 'none';
      }
    }
  } else if (addrEl) {
    addrEl.style.display = 'none';
  }
}

function toggleEditProfileForm(show) {
  const form = document.getElementById('account-edit-form');
  if (!form) return;
  const isCurrentlyOpen = form.style.display === 'block';
  const shouldOpen = (typeof show === 'boolean') ? show : !isCurrentlyOpen;
  form.style.display = shouldOpen ? 'block' : 'none';
  if (shouldOpen) {
    const profile = getCustomerProfile();
    const editName = document.getElementById('edit-profile-name');
    const editPhone = document.getElementById('edit-profile-phone');
    const editAddress = document.getElementById('edit-profile-address');
    if (profile) {
      if (editName) editName.value = profile.name || '';
      if (editPhone) editPhone.value = profile.phone || '';
      if (editAddress) editAddress.value = profile.address || '';
    }
    if (editName) editName.focus();
  }
}

function handleAccountEditSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const cleanNameInput = document.getElementById('edit-profile-name-clean');
  const cleanPhoneInput = document.getElementById('edit-profile-phone-clean');
  const cleanAddressInput = document.getElementById('edit-profile-address-clean');
  const editName = cleanNameInput || document.getElementById('edit-profile-name');
  const editPhone = cleanPhoneInput || document.getElementById('edit-profile-phone');
  const editAddress = cleanAddressInput || document.getElementById('edit-profile-address');
  const name = editName ? editName.value.trim() : '';
  const phone = editPhone ? editPhone.value.trim() : '';
  const address = editAddress ? editAddress.value.trim() : '';

  if (!name || name.length < 2) {
    showToastNotification("يرجى إدخال اسم صحيح (حرفين على الأقل)", "error");
    return;
  }
  if (!phone || phone.length < 8) {
    showToastNotification("يرجى إدخال رقم هاتف صحيح", "error");
    return;
  }

  saveCustomerProfile(name, phone, address);
  toggleEditProfileForm(false);
  toggleCleanProfileEdit(false);
  renderCleanProfileUI();
  updateAccountDrawerProfileUI();

  // Auto-fill checkout fields if available
  if (elements.custName) elements.custName.value = name;
  if (elements.custPhone) elements.custPhone.value = phone;
  if (elements.custAddress && address) elements.custAddress.value = address;

  showToastNotification("تم حفظ وتحديث بياناتك بنجاح", "success");
}

// ── CLEAN PROFILE UI ("حسابي" Sleek View) ───────────────────

function renderCleanProfileUI() {
  const profile = getCustomerProfile();
  const nameEl = document.getElementById('clean-profile-name');
  const phoneEl = document.getElementById('clean-profile-phone');
  const avatarChar = document.getElementById('clean-avatar-char');
  const waLink = document.getElementById('clean-account-wa-link');
  const addrPill = document.getElementById('clean-profile-address');
  const addrText = document.getElementById('clean-profile-address-text');
  const addrStatusText = document.getElementById('clean-address-status-text');

  const defaultUserSvg = `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  if (profile && profile.name) {
    if (nameEl) nameEl.textContent = profile.name;
    if (phoneEl) phoneEl.textContent = profile.phone;
    if (avatarChar) avatarChar.textContent = profile.name.trim().charAt(0) || 'ع';
  } else {
    if (nameEl) nameEl.textContent = (typeof window.t === 'function' ? window.t('val_guest_user', 'عميلنا العزيز') : 'عميلنا العزيز');
    if (phoneEl) phoneEl.textContent = (typeof window.t === 'function' ? window.t('val_guest_hint', 'انقر على تعديل لحفظ اسمك ورقمك وعنوانك') : 'انقر على تعديل لحفظ اسمك ورقمك وعنوانك');
    if (avatarChar) avatarChar.innerHTML = defaultUserSvg;
  }

  if (profile && profile.address) {
    if (addrPill) addrPill.style.display = 'inline-flex';
    if (addrText) addrText.textContent = profile.address;
    if (addrStatusText) addrStatusText.textContent = profile.address;
  } else {
    if (addrPill) addrPill.style.display = 'none';
    if (addrStatusText) addrStatusText.textContent = (typeof window.t === 'function' ? window.t('val_no_address', 'لم تسجل عنواناً بعد — انقر للإضافة وتوفير الوقت في الطلبات') : 'لم تسجل عنواناً بعد — انقر للإضافة وتوفير الوقت في الطلبات');
  }

  // Update theme row info
  const isDark = (Store.getThemeMode() === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark');
  const themeStatusText = document.getElementById('clean-theme-status-text');
  const themeToggleLabel = document.getElementById('clean-theme-toggle-label');
  const themeToggleBtn = document.getElementById('clean-theme-toggle-btn');
  if (themeStatusText) themeStatusText.textContent = isDark ? (typeof window.t === 'function' ? window.t('account_theme_dark', 'الوضع الداكن (Night Mode)') : 'الوضع الداكن (Night Mode)') : (typeof window.t === 'function' ? window.t('account_theme_light', 'الوضع النهاري (Light Mode)') : 'الوضع النهاري (Light Mode)');
  if (themeToggleLabel) themeToggleLabel.textContent = isDark ? (typeof window.t === 'function' ? window.t('account_theme_btn_light', 'تفعيل الفاتح') : 'تفعيل الفاتح') : (typeof window.t === 'function' ? window.t('account_theme_btn_dark', 'تفعيل الداكن') : 'تفعيل الداكن');
  if (themeToggleBtn) themeToggleBtn.classList.toggle('active', isDark);

  // Update sound row info
  const soundEnabled = Store.getSoundEnabled();
  const soundToggleLabel = document.getElementById('clean-sound-toggle-label');
  const soundToggleBtn = document.getElementById('clean-sound-toggle-btn');
  if (soundToggleLabel) soundToggleLabel.textContent = soundEnabled ? (typeof window.t === 'function' ? window.t('account_sound_on', 'صوت مفعل') : 'صوت مفعل') : (typeof window.t === 'function' ? window.t('account_sound_off', 'صوت مكتوم') : 'صوت مكتوم');
  if (soundToggleBtn) soundToggleBtn.classList.toggle('active', soundEnabled);

  // Update language row status
  const curLang = (typeof I18n !== 'undefined') ? I18n.getLanguage() : 'ar';
  const cleanLangSub = document.getElementById('clean-language-status-text');
  if (cleanLangSub && typeof I18n !== 'undefined' && I18n.supportedLanguages[curLang]) {
    const l = I18n.supportedLanguages[curLang];
    cleanLangSub.textContent = `${l.flag} ${l.name} (${l.englishName})`;
  }

  // WhatsApp link
  const settings = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};
  if (waLink && settings.whatsappNumber) {
    const cleanWa = settings.whatsappNumber.replace(/\D/g, '');
    waLink.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent('مرحباً، أود التواصل مع خدمة العملاء')}`;
  }
}

function toggleCleanProfileEdit(show) {
  const form = document.getElementById('clean-profile-edit-form');
  if (!form) return;
  const isCurrentlyOpen = (form.style.display !== 'none');
  const shouldOpen = (typeof show === 'boolean') ? show : !isCurrentlyOpen;
  form.style.display = shouldOpen ? 'block' : 'none';
  if (shouldOpen) {
    const profile = getCustomerProfile();
    const editName = document.getElementById('edit-profile-name-clean');
    const editPhone = document.getElementById('edit-profile-phone-clean');
    const editAddress = document.getElementById('edit-profile-address-clean');
    if (profile) {
      if (editName) editName.value = profile.name || '';
      if (editPhone) editPhone.value = profile.phone || '';
      if (editAddress) editAddress.value = profile.address || '';
    }
    if (editName) editName.focus();
  }
}

// ── ORDERS VIEW & LIVE TRACKING TAB ("طلباتي") ──────────────

function triggerOrdersTabPulse() {
  const tabOrders = document.getElementById('nav-tab-orders');
  const desktopOrders = document.getElementById('desktop-nav-orders');
  const pulseDot = document.getElementById('order-pulse-dot');
  const desktopPulseDot = document.getElementById('desktop-order-pulse-dot');
  if (tabOrders) tabOrders.classList.add('order-pulsing');
  if (desktopOrders) desktopOrders.classList.add('order-pulsing');
  if (pulseDot) pulseDot.style.display = 'block';
  if (desktopPulseDot) desktopPulseDot.style.display = 'inline-block';
}

function clearOrdersTabPulse() {
  const tabOrders = document.getElementById('nav-tab-orders');
  const desktopOrders = document.getElementById('desktop-nav-orders');
  const pulseDot = document.getElementById('order-pulse-dot');
  const desktopPulseDot = document.getElementById('desktop-order-pulse-dot');
  if (tabOrders) tabOrders.classList.remove('order-pulsing');
  if (desktopOrders) desktopOrders.classList.remove('order-pulsing');
  if (pulseDot) pulseDot.style.display = 'none';
  if (desktopPulseDot) desktopPulseDot.style.display = 'none';
}

function renderOrdersView() {
  const lastOrder = (typeof Store !== 'undefined' && Store.getLastOrder) ? Store.getLastOrder() : null;
  const history = (typeof Store !== 'undefined' && Store.getOrderHistory) ? Store.getOrderHistory() : [];
  const settings = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};
  const currency = (typeof window.t === 'function' ? window.t('currency', settings.currency || 'ج.م') : (settings.currency || 'ج.م'));

  const cardActive = document.getElementById('active-order-tracking-card');
  const secPrevious = document.getElementById('previous-orders-section');
  const emptyState = document.getElementById('orders-empty-state');
  const prevList = document.getElementById('previous-orders-list');

  const slug = (typeof Store !== 'undefined' && Store.getRestaurantSlug) ? Store.getRestaurantSlug() : 'saj';
  const deletedIds = (typeof Store !== 'undefined' && Store.getDeletedOrderIds) ? Store.getDeletedOrderIds(slug) : new Set();
  
  let isLastOrderDeleted = false;
  if (lastOrder) {
    const lCid = String(lastOrder.orderId || lastOrder.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (deletedIds.has(lCid) || deletedIds.has(lastOrder.orderId) || deletedIds.has(lastOrder.id)) {
      isLastOrderDeleted = true;
      if (typeof Store !== 'undefined' && Store.saveLastOrder) Store.saveLastOrder(null);
    }
  }

  const cleanHistory = (history || []).filter(h => {
    if (!h) return false;
    const hCid = String(h.orderId || h.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    return !deletedIds.has(hCid) && !deletedIds.has(h.orderId) && !deletedIds.has(h.id);
  });

  const hasActiveOrder = !!(!isLastOrderDeleted && lastOrder && !lastOrder.archived && lastOrder.items && lastOrder.items.length > 0);
  const hasHistory = (cleanHistory && cleanHistory.length > 0);

  if (!hasActiveOrder && !hasHistory) {
    if (cardActive) cardActive.style.display = 'none';
    if (secPrevious) secPrevious.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // 1. Active Order Live Tracker Card
  if (hasActiveOrder) {
    if (cardActive) cardActive.style.display = 'block';

    const orderIdEl = document.getElementById('orders-active-id');
    if (orderIdEl) orderIdEl.textContent = lastOrder.orderId || '#ORD-NEW';

    const typePill = document.getElementById('orders-active-type-pill');
    if (typePill) {
      const addrLower = String(lastOrder.customer?.address || '').toLowerCase();
      const rawF = String(lastOrder.fulfillmentType || lastOrder.orderType || '').toLowerCase();
      let tbl = lastOrder.tableNumber;
      if (!tbl) {
        const m = addrLower.match(/(?:طاولة|طاولة رقم|table)\s*([0-9A-Za-z\u0660-\u0669]+)/i);
        if (m) tbl = m[1];
      }
      if (rawF === 'dinein' || rawF === 'dine_in' || addrLower.includes('صالة') || addrLower.includes('طاولة')) {
        typePill.textContent = `${typeof window.t === 'function' ? window.t('fulfillment_dinein', 'في الصالة') : 'في الصالة'} (${tbl ? (typeof window.t === 'function' ? window.t('field_table', 'طاولة') : 'طاولة') + ' ' + tbl : '1'})`;
      } else if (rawF === 'takeaway' || addrLower.includes('استلام') || addrLower.includes('تيك أواي') || addrLower.includes('سفري')) {
        typePill.textContent = (typeof window.t === 'function' ? window.t('fulfillment_takeaway', 'استلام من الفرع') : 'استلام من الفرع');
      } else {
        typePill.textContent = (typeof window.t === 'function' ? window.t('fulfillment_delivery', 'توصيل دليفري') : 'توصيل دليفري');
      }
    }

    // Update 4-stage stepper
    updateOrdersStepperUI(lastOrder.status || 'pending', lastOrder);

    // Items list
    const itemsList = document.getElementById('orders-active-items-list');
    if (itemsList && lastOrder.items) {
      itemsList.innerHTML = lastOrder.items.map(it => {
        const itName = esc(typeof window.getProductName === 'function' ? window.getProductName(it) : (typeof window.tr === 'function' ? window.tr(it.name) : it.name));
        const itSize = it.selectedSize ? `[${esc(typeof window.getSizeName === 'function' ? window.getSizeName(it.selectedSize) : (typeof window.tr === 'function' ? window.tr(it.selectedSize.name) : it.selectedSize.name))}]` : '';
        return `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:12.5px; padding:4px 0; border-bottom:1px dashed var(--border-subtle, rgba(0,0,0,0.06));">
          <span><b style="color:var(--primary); font-weight:800;">${esc(it.qty)}x</b> ${itName} ${itSize}</span>
          <span class="font-num" style="font-weight:700;">${((it.price || 0) * it.qty).toFixed(2)} ${currency}</span>
        </div>
      `;
      }).join('');
    }

    // Total
    const totalEl = document.getElementById('orders-active-total');
    if (totalEl) {
      totalEl.textContent = `${(parseFloat(lastOrder.finalTotal) || 0).toFixed(2)} ${currency}`;
    }

    // Direct WhatsApp & Phone contact
    const waBtn = document.getElementById('orders-active-wa-btn');
    if (waBtn && settings.whatsappNumber) {
      const cleanWa = settings.whatsappNumber.replace(/\D/g, '');
      waBtn.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً، أستفسر عن طلبي رقم ${lastOrder.orderId}`)}`;
    }
    const phoneBtn = document.getElementById('orders-active-phone-btn');
    if (phoneBtn && (settings.phone || settings.whatsappNumber)) {
      const rawP = (settings.phone || settings.whatsappNumber).replace(/\s+/g, '');
      phoneBtn.href = `tel:${rawP}`;
    }
  } else {
    if (cardActive) cardActive.style.display = 'none';
  }

  // 2. Previous Orders / Re-order Section
  if (hasHistory) {
    if (secPrevious) secPrevious.style.display = 'block';
    if (prevList) {
      prevList.innerHTML = cleanHistory.map(order => {
        const rawId = order.orderId || '#ORD';
        const cleanId = String(rawId).replace(/[^a-zA-Z0-9#\-_]/g, '');
        const safeOrderId = cleanId || '#ORD';
        const dateLocale = (typeof window.I18n !== 'undefined' && window.I18n.getLanguage() === 'en') ? 'en-US' : 'ar-EG';
        const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (typeof window.t === 'function' ? window.t('past_order', 'طلب سابق') : 'طلب سابق');
        const isEn = (typeof window.I18n !== 'undefined' && window.I18n.getLanguage() === 'en');
        const itemsSummary = (order.items || []).map(i => `${esc(i.qty)}x ${esc(typeof window.getProductName === 'function' ? window.getProductName(i) : (typeof window.tr === 'function' ? window.tr(i.name) : i.name))}`).join(isEn ? ', ' : '، ');
        let fulfillmentBadge = (typeof window.t === 'function' ? window.t('fulfillment_delivery', 'دليفري') : 'دليفري');
        if (order.fulfillmentType === 'takeaway') fulfillmentBadge = (typeof window.t === 'function' ? window.t('fulfillment_takeaway', 'تيك أواي') : 'تيك أواي');
        else if (order.fulfillmentType === 'dinein') fulfillmentBadge = `${typeof window.t === 'function' ? window.t('fulfillment_dinein', 'صالة') : 'صالة'} (${esc(order.tableNumber || '-')})`;

        const st = order.status || 'pending';
        let stBadge = (typeof window.t === 'function' ? window.t('order_status_pending', 'قيد المراجعة') : 'قيد المراجعة');
        let stColor = 'var(--primary)';
        let stBg = 'var(--primary-subtle, rgba(234,88,12,0.12))';
        if (st === 'preparing') {
          stBadge = (typeof window.t === 'function' ? window.t('order_status_preparing', 'جاري التجهيز') : 'جاري التجهيز');
          stColor = '#d97706';
          stBg = 'rgba(217, 119, 6, 0.12)';
        } else if (st === 'out_for_delivery') {
          stBadge = (order.fulfillmentType === 'takeaway' || order.orderType === 'takeaway') ? (typeof window.t === 'function' ? window.t('order_status_ready', 'جاهز للاستلام') : 'جاهز للاستلام') : (typeof window.t === 'function' ? window.t('order_status_out', 'في الطريق') : 'في الطريق');
          stColor = '#2563eb';
          stBg = 'rgba(37, 99, 235, 0.12)';
        } else if (st === 'delivered') {
          stBadge = (typeof window.t === 'function' ? window.t('order_status_delivered', 'تم التسليم') : 'تم التسليم');
          stColor = '#16a34a';
          stBg = 'rgba(22, 163, 74, 0.12)';
        } else if (st === 'cancelled') {
          stBadge = (typeof window.t === 'function' ? window.t('order_status_cancelled', 'ملغي') : 'ملغي');
          stColor = '#dc2626';
          stBg = 'rgba(220, 38, 38, 0.12)';
        }

        return `
          <div class="previous-order-card" style="background:var(--surface-raised, #ffffff); border:1px solid var(--border-strong, rgba(0,0,0,0.08)); border-radius:14px; padding:12px 14px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div>
                <strong class="font-num" style="color:var(--text-main); font-size:13.5px;">${esc(safeOrderId)}</strong>
                <span style="font-size:11px; color:var(--text-muted); margin-right:6px;">${dateStr}</span>
              </div>
              <div style="display:flex; gap:6px; align-items:center;">
                <span style="font-size:10.5px; padding:2px 7px; border-radius:6px; background:rgba(0,0,0,0.05); color:var(--text-muted); font-weight:700;">${fulfillmentBadge}</span>
                <span style="font-size:10.5px; padding:2px 7px; border-radius:6px; background:${stBg}; color:${stColor}; font-weight:800;">${stBadge}</span>
                <button type="button" class="btn-delete-history-order" onclick="window.deleteCustomerHistoryOrder && window.deleteCustomerHistoryOrder('${cleanId}')" title="مسح الطلب من السجل" aria-label="مسح الطلب">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
            <p style="font-size:12px; color:var(--text-body); margin:6px 0 10px 0; line-height:1.4; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${itemsSummary}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle, rgba(0,0,0,0.05)); padding-top:8px;">
              <span class="font-num" style="font-weight:800; font-size:13px; color:var(--text-main);">${(parseFloat(order.finalTotal) || 0).toFixed(2)} ${currency}</span>
              <button type="button" class="btn btn-primary btn-sm" onclick="window.reorderPreviousOrder && window.reorderPreviousOrder('${cleanId}')" style="font-size:11.5px; padding:5px 12px; border-radius:8px;">
                <span>${typeof window.t === 'function' ? window.t('btn_reorder', 'إعادة الطلب') : 'إعادة الطلب'}</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  } else {
    if (secPrevious) secPrevious.style.display = 'none';
  }
}

// ── HARPY PRO LUXURY CUSTOM CONFIRM MODAL ENGINE ─────────
let harpyConfirmResolve = null;

window.showHarpyConfirmModal = function({
  title = "مسح الطلب من السجل",
  message = "هل تريد إخفاء ومسح هذا الطلب من هاتفك؟ (لن يؤثر على سجل المطعم)",
  confirmText = "مسح من هاتفي",
  cancelText = "إلغاء وتراجع",
  isDanger = true
} = {}) {
  return new Promise((resolve) => {
    harpyConfirmResolve = resolve;
    const modal = document.getElementById('harpy-confirm-modal');
    const backdrop = document.getElementById('harpy-confirm-backdrop');
    const titleEl = document.getElementById('harpy-confirm-title');
    const msgEl = document.getElementById('harpy-confirm-msg');
    const acceptBtn = document.getElementById('btn-harpy-confirm-accept');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.innerHTML = message;
    if (acceptBtn) {
      acceptBtn.textContent = confirmText;
      acceptBtn.style.background = isDanger ? '#ef4444' : 'var(--primary, #ea580c)';
      acceptBtn.onclick = () => window.closeHarpyConfirmModal(true);
    }

    if (modal) modal.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  });
};

window.closeHarpyConfirmModal = function(result = false) {
  const modal = document.getElementById('harpy-confirm-modal');
  const backdrop = document.getElementById('harpy-confirm-backdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');

  if (typeof harpyConfirmResolve === 'function') {
    const res = harpyConfirmResolve;
    harpyConfirmResolve = null;
    res(result);
  }
};

window.cancelActiveCustomerOrder = async function() {
  const lastOrder = (typeof Store !== 'undefined' && Store.getLastOrder) ? Store.getLastOrder() : null;
  const orderId = (lastOrder && (lastOrder.orderId || lastOrder.id)) || (document.getElementById('orders-active-id')?.textContent || '').trim();
  
  const confirmed = await window.showHarpyConfirmModal({
    title: "إخفاء بطاقة المتابعة",
    message: "هل تريد إخفاء هذا الطلب من شاشة المتابعة بهاتفك؟<br><span style='font-size:0.82rem; opacity:0.8;'>* سيبقى الطلب مسجلاً لدى المطعم دون أي حذف من نظامهم.</span>",
    confirmText: "إخفاء من هاتفي",
    cancelText: "إلغاء وتراجع",
    isDanger: true
  });
  if (!confirmed) return;

  const card = document.getElementById('active-order-tracking-card');
  if (card) {
    card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.96)';
    setTimeout(() => { card.style.display = 'none'; }, 200);
  }

  try {
    if (typeof Store !== 'undefined') {
      Store.saveLastOrder(null);
      if (orderId && Store.removeOrderFromHistory) {
        Store.removeOrderFromHistory(orderId);
      }
    }
  } catch(e) {}

  if (typeof initBackgroundOrderTracking === 'function') {
    initBackgroundOrderTracking();
  }
  if (typeof renderOrdersView === 'function') {
    setTimeout(renderOrdersView, 220);
  }
  if (typeof renderLastOrderRecall === 'function') {
    renderLastOrderRecall();
  }
};

window.deleteCustomerHistoryOrder = async function(orderId) {
  if (!orderId) return;
  const confirmed = await window.showHarpyConfirmModal({
    title: "مسح الطلب من سجلك",
    message: "هل تريد مسح هذا الطلب من سجل طلباتك على هاتفك؟<br><span style='font-size:0.82rem; opacity:0.8;'>* سيبقى الطلب مسجلاً لدى المطعم دون أي حذف من نظامهم.</span>",
    confirmText: "مسح من هاتفي",
    cancelText: "إلغاء وتراجع",
    isDanger: true
  });
  if (!confirmed) return;

  try {
    if (typeof Store !== 'undefined') {
      if (Store.removeOrderFromHistory) {
        Store.removeOrderFromHistory(orderId);
      }
      const curLast = Store.getLastOrder();
      if (curLast) {
        const lCid = String(curLast.orderId || curLast.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
        const targetCid = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');
        if (lCid === targetCid || curLast.orderId === orderId || curLast.id === orderId) {
          Store.saveLastOrder(null);
        }
      }
    }
  } catch(e) {}

  if (typeof initBackgroundOrderTracking === 'function') {
    initBackgroundOrderTracking();
  }
  if (typeof renderOrdersView === 'function') {
    renderOrdersView();
  }
  if (typeof renderLastOrderRecall === 'function') {
    renderLastOrderRecall();
  }
};

function updateOrdersStepperUI(status = 'pending', order = null) {
  const step1 = document.getElementById('orders-step-1');
  const step2 = document.getElementById('orders-step-2');
  const step3 = document.getElementById('orders-step-3');
  const step4 = document.getElementById('orders-step-4');

  const step1Icon = document.getElementById('orders-step-1-icon');
  const step1Name = document.getElementById('orders-step-1-name');
  const step2Icon = document.getElementById('orders-step-2-icon');
  const step2Name = document.getElementById('orders-step-2-name');
  const step3Icon = document.getElementById('orders-step-3-icon');
  const step3Name = document.getElementById('orders-step-3-name');
  const step4Icon = document.getElementById('orders-step-4-icon');
  const step4Name = document.getElementById('orders-step-4-name');

  const fill = document.getElementById('orders-stepper-fill');
  const descEl = document.getElementById('orders-active-desc');
  const etaEl = document.getElementById('orders-active-eta');
  const etaIcon = document.getElementById('orders-active-eta-icon');
  const etaTitle = document.getElementById('orders-active-eta-title');
  const locBanner = document.getElementById('orders-active-location-banner');
  const locIcon = document.getElementById('orders-active-location-icon');
  const locText = document.getElementById('orders-active-location-text');

  const settings = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};

  // Detect fulfillment and table number robustly
  const rawType = String((order && (order.fulfillmentType || order.orderType)) || window.currentFulfillmentType || 'delivery').toLowerCase();
  const addr = String(order?.customer?.address || '').toLowerCase();
  let tableNumber = order?.tableNumber || null;
  if (!tableNumber) {
    const match = addr.match(/(?:طاولة|طاولة رقم|table)\s*([0-9A-Za-z\u0660-\u0669]+)/i);
    if (match) tableNumber = match[1];
  }

  const isDineIn = rawType === 'dinein' || rawType === 'dine_in' || addr.includes('صالة') || addr.includes('طاولة');
  const isTakeaway = !isDineIn && (rawType === 'takeaway' || addr.includes('استلام') || addr.includes('تيك أواي') || addr.includes('سفري'));
  const isDelivery = !isDineIn && !isTakeaway;

  // 1. Stage names tailored to fulfillment
  if (isDineIn) {
    if (step1Name) step1Name.textContent = (typeof window.t === 'function' ? window.t('step_dinein_1', 'تسجيل الطلب') : 'تسجيل الطلب');
    if (step2Name) step2Name.textContent = (typeof window.t === 'function' ? window.t('step_dinein_2', 'قيد الطهي') : 'قيد الطهي');
    if (step3Name) step3Name.textContent = (typeof window.t === 'function' ? window.t('step_dinein_3', 'تقديم للطاولة') : 'تقديم للطاولة');
    if (step4Name) step4Name.textContent = (typeof window.t === 'function' ? window.t('step_dinein_4', 'بالهناء والشفاء') : 'بالهناء والشفاء');

    if (etaTitle) etaTitle.textContent = (typeof window.t === 'function') ? window.t('eta_title_dinein', 'خدمة الصالة والمائدة') : 'خدمة الصالة والمائدة';
    if (etaEl) etaEl.textContent = `${typeof window.t === 'function' ? window.t('table_number_prefix', 'طاولة رقم') : 'طاولة رقم'} (${tableNumber || '1'})`;

    if (locBanner && locText) {
      locBanner.style.display = 'flex';
      locText.innerHTML = `${typeof window.t === 'function' ? window.t('service_location', 'مكان الخدمة') : 'مكان الخدمة'}: <strong>${typeof window.t === 'function' ? window.t('table_number_prefix', 'طاولة رقم') : 'طاولة رقم'} ${tableNumber || '1'} (${typeof window.t === 'function' ? window.t('fulfillment_dinein', 'في الصالة') : 'في الصالة'})</strong>`;
    }
  } else if (isTakeaway) {
    if (step1Name) step1Name.textContent = (typeof window.t === 'function' ? window.t('step_takeaway_1', 'استلام الطلب') : 'استلام الطلب');
    if (step2Name) step2Name.textContent = (typeof window.t === 'function' ? window.t('step_takeaway_2', 'تجهيز وتعليب') : 'تجهيز وتعليب');
    if (step3Name) step3Name.textContent = (typeof window.t === 'function' ? window.t('step_takeaway_3', 'جاهز بالفرع') : 'جاهز بالفرع');
    if (step4Name) step4Name.textContent = (typeof window.t === 'function' ? window.t('step_takeaway_4', 'تم الاستلام') : 'تم الاستلام');

    if (etaTitle) etaTitle.textContent = (typeof window.t === 'function') ? window.t('eta_title_takeaway', 'وقت التجهيز للاستلام') : 'وقت التجهيز للاستلام';
    if (etaEl) etaEl.textContent = `15 - 20 ${typeof window.t === 'function' ? window.t('mins', 'دقيقة') : 'دقيقة'}`;;

    if (locBanner && locText) {
      locBanner.style.display = 'flex';
      locText.innerHTML = `${typeof window.t === 'function' ? window.t('pickup_location', 'مكان الاستلام') : 'مكان الاستلام'}: <strong>${typeof window.t === 'function' ? window.t('pickup_counter', 'كاونتر فرع المطعم الرئيسي مباشرة') : 'كاونتر فرع المطعم الرئيسي مباشرة'}</strong>`;
    }
  } else {
    // Delivery
    if (step1Name) step1Name.textContent = (typeof window.t === 'function' ? window.t('order_stepper_step1', 'استلام الطلب') : 'استلام الطلب');
    if (step2Name) step2Name.textContent = (typeof window.t === 'function' ? window.t('order_stepper_step2', 'في المطبخ') : 'في المطبخ');
    if (step3Name) step3Name.textContent = (typeof window.t === 'function' ? window.t('order_stepper_step3', 'مع الكابتن') : 'مع الكابتن');
    if (step4Name) step4Name.textContent = (typeof window.t === 'function' ? window.t('order_stepper_step4', 'تم التوصيل') : 'تم التوصيل');

    if (etaTitle) etaTitle.textContent = (typeof window.t === 'function') ? window.t('eta_title_delivery', 'الوقت التقديري للوصول') : 'الوقت التقديري للوصول';
    if (etaEl) etaEl.textContent = settings.deliveryTime || '25 - 35 دقيقة';

    if (locBanner && locText) {
      locBanner.style.display = 'flex';
      locText.innerHTML = `${typeof window.t === 'function' ? window.t('delivery_address_label', 'عنوان التوصيل') : 'عنوان التوصيل'}: <strong>${order?.customer?.address || (typeof window.t === 'function' ? window.t('default_address', 'العنوان المسجل للطلب') : 'العنوان المسجل للطلب')}</strong>`;
    }
  }

  // 2. Stepper progression
  [step1, step2, step3, step4].forEach(s => {
    if (s) s.classList.remove('active', 'completed');
  });

  const checkSvg = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  if (step1Icon) step1Icon.textContent = '1';
  if (step2Icon) step2Icon.textContent = '2';
  if (step3Icon) step3Icon.textContent = '3';
  if (step4Icon) step4Icon.textContent = '4';

  if (status === 'pending') {
    if (step1) step1.classList.add('active');
    if (fill) fill.style.width = '25%';
    if (descEl) {
      if (isDineIn) descEl.textContent = `تم تسجيل طلبك وتوجيهه إلى مطبخ الصالة لطاولة (${tableNumber || '1'})، جاري التأكيد.`;
      else if (isTakeaway) descEl.textContent = 'تم تسجيل طلبك للاستلام من الفرع، وسنبدأ تحضيره طازجاً فوراً.';
      else descEl.textContent = 'تم استلام طلبك بنجاح وهو قيد المراجعة في المطعم الآن.';
    }
  } else if (status === 'preparing') {
    if (step1) { step1.classList.add('completed'); if (step1Icon) step1Icon.innerHTML = checkSvg; }
    if (step2) step2.classList.add('active');
    if (fill) fill.style.width = '50%';
    if (descEl) {
      if (isDineIn) descEl.textContent = `طهاة المطعم يجهزون وجبتك الساخنة الآن لتقديمها لطاولة (${tableNumber || '1'}).`;
      else if (isTakeaway) descEl.textContent = 'جاري تحضير طلبك وتعليبه بعناية ليكون ساخناً وجاهزاً فور وصولك للفرع.';
      else descEl.textContent = 'طهاة المطعم يجهزون وجبتك الطازجة الآن بأعلى معايير الجودة.';
    }
  } else if (status === 'out_for_delivery') {
    if (step1) { step1.classList.add('completed'); if (step1Icon) step1Icon.innerHTML = checkSvg; }
    if (step2) { step2.classList.add('completed'); if (step2Icon) step2Icon.innerHTML = checkSvg; }
    if (step3) step3.classList.add('active');
    if (fill) fill.style.width = '75%';
    if (descEl) {
      if (isDineIn) descEl.textContent = `وجبتك جاهزة تماماً! طاقم الخدمة يقدمها الآن إلى طاولة رقم (${tableNumber || '1'}).`;
      else if (isTakeaway) descEl.textContent = 'طلبك جاهز تماماً الآن على كاونتر الاستلام بالفرع، تفضل بالاستلام.';
      else descEl.textContent = 'الكابتن استلم وجبتك وهو في الطريق إلى عنوانك الآن.';
    }
  } else if (status === 'delivered') {
    if (step1) { step1.classList.add('completed'); if (step1Icon) step1Icon.innerHTML = checkSvg; }
    if (step2) { step2.classList.add('completed'); if (step2Icon) step2Icon.innerHTML = checkSvg; }
    if (step3) { step3.classList.add('completed'); if (step3Icon) step3Icon.innerHTML = checkSvg; }
    if (step4) { step4.classList.add('completed', 'active'); if (step4Icon) step4Icon.innerHTML = checkSvg; }
    if (fill) fill.style.width = '100%';
    if (descEl) {
      if (isDineIn) descEl.textContent = `بالهناء والشفاء! نتمنى لك تجربة طعام رائعة في ضيافتنا، أهلاً بك دائماً.`;
      else if (isTakeaway) descEl.textContent = 'تم تسليمك الطلب بالفرع بنجاح، بالهناء والشفاء وسعداء بزيارتك دائماً.';
      else descEl.textContent = 'تم تسليم الطلب بنجاح إلى باب منزلك! بالهناء والشفاء، سعداء بخدمتك دائماً.';
    }
  } else if (status === 'cancelled') {
    if (fill) fill.style.width = '0%';
    if (descEl) descEl.textContent = (typeof window.t === 'function' ? window.t('desc_cancelled') : 'تم إلغاء هذا الطلب من قِبل إدارة المطعم.');
  }
}

function reorderPreviousOrder(orderId) {
  if (checkOrderingPaused()) return;
  const history = (typeof Store !== 'undefined' && Store.getOrderHistory) ? Store.getOrderHistory() : [];
  const lastOrder = (typeof Store !== 'undefined' && Store.getLastOrder) ? Store.getLastOrder() : null;

  let found = history.find(o => o.orderId === orderId);
  if (!found && lastOrder && lastOrder.orderId === orderId) found = lastOrder;

  if (!found || !found.items || found.items.length === 0) {
    showToastNotification("تعذر العثور على أصناف هذا الطلب", "error");
    return;
  }

  // Refill cart with the exact items
  Store.saveCart([...found.items]);

  // Refill customer details & fulfillment if present
  if (found.customer) {
    if (elements.custName && found.customer.name) elements.custName.value = found.customer.name;
    if (elements.custPhone && found.customer.phone) elements.custPhone.value = found.customer.phone;
    if (elements.custAddress && found.customer.address && found.fulfillmentType === 'delivery') {
      elements.custAddress.value = found.customer.address;
    }
  }
  if (found.fulfillmentType && typeof window.setFulfillmentType === 'function') {
    window.setFulfillmentType(found.fulfillmentType);
  }
  if (found.tableNumber) {
    const tableInput = document.getElementById('cust-table-number');
    if (tableInput) tableInput.value = found.tableNumber;
  }

  updateLedgerUI();
  renderProducts();
  showToastNotification("تمت إضافة أصناف الطلب إلى سلتك بنجاح!", "success");
  if (typeof openCartDrawer === 'function') openCartDrawer();
}

// ── DIGITAL MENU QR CODE MODAL ────────────────────────────

let cachedClientHarpyImg = null;

function loadClientHarpyTemplate() {
  return new Promise((resolve) => {
    if (cachedClientHarpyImg && cachedClientHarpyImg.complete && cachedClientHarpyImg.naturalWidth > 0) {
      return resolve(cachedClientHarpyImg);
    }
    const candidates = [
      'assets/brand/chef_harpy_qr_template.png',
      '../assets/brand/chef_harpy_qr_template.png',
      '/order/assets/brand/chef_harpy_qr_template.png',
      './assets/brand/chef_harpy_qr_template.png'
    ];
    let idx = 0;
    function tryNext() {
      if (idx >= candidates.length) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { cachedClientHarpyImg = img; resolve(img); };
      img.onerror = () => { idx++; tryNext(); };
      img.src = candidates[idx];
    }
    tryNext();
  });
}

async function renderClientHarpyQR() {
  const canvas = document.getElementById('client-harpy-canvas');
  if (!canvas) return;
  const loading = document.getElementById('client-harpy-loading');
  const hiddenGen = document.getElementById('client-harpy-hidden-gen');
  const linkText = document.getElementById('client-qr-link-text');

  if (loading) loading.style.display = 'flex';

  const currentUrl = window.location.href;
  if (linkText) linkText.textContent = currentUrl;

  try {
    if (hiddenGen) hiddenGen.innerHTML = '';
    const container = hiddenGen || document.createElement('div');
    container.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      try {
        new QRCode(container, {
          text: currentUrl,
          width: 440,
          height: 440,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      } catch(e) {}
    }

    await new Promise(r => setTimeout(r, 60));
    let qrSource = container.querySelector('canvas');
    if (!qrSource || qrSource.width === 0) {
      qrSource = container.querySelector('img');
      if (qrSource && !qrSource.complete) {
        await new Promise(r => { qrSource.onload = r; qrSource.onerror = r; setTimeout(r, 300); });
      }
    }

    const templateImg = await loadClientHarpyTemplate();

    canvas.width = 1254;
    canvas.height = 1254;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1254, 1254);

    if (templateImg) {
      ctx.drawImage(templateImg, 0, 0, 1254, 1254);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1254, 1254);
    }

    // Exact inner acrylic sign dimensions and angle:
    // The acrylic sign held by Chef Harpy is naturally tilted at -7.8 degrees around (428, 818)
    const cx = 428;
    const cy = 818;
    const angleRad = (-7.8 * Math.PI) / 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);

    // In rotated local space, center is (0, 0):
    const cardW = 460;
    const cardH = 460;
    const cardRadius = 24;

    // Fill inner sign with pure white to cover dummy AI QR seamlessly
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, cardRadius);
    } else {
      ctx.beginPath();
      ctx.rect(-cardW / 2, -cardH / 2, cardW, cardH);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Draw real scannable QR Code centered in the rotated acrylic stand
    const qrSize = 410;
    if (qrSource) {
      ctx.drawImage(qrSource, -qrSize / 2, -qrSize / 2, qrSize, qrSize);
    }

    ctx.restore();
  } catch(err) {
    console.warn('Error in renderClientHarpyQR:', err);
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

function openQrModal() {
  const backdrop = document.getElementById('qr-modal-backdrop');
  const modal = document.getElementById('qr-code-modal');
  if (!modal) return;

  renderClientHarpyQR();

  if (backdrop) backdrop.classList.add('active');
  modal.classList.add('open');
  pushNavState('qr_modal');
}

function downloadClientHarpySticker() {
  const canvas = document.getElementById('client-harpy-canvas');
  if (!canvas) return;
  const settings = Store.getSettings() || {};
  const storeName = (settings.storeName || 'Restaurant').replace(/[\s\/\\]+/g, '_');
  const link = document.createElement('a');
  link.download = `Chef_Harpy_QR_${storeName}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (typeof showToastNotification === 'function') {
    showToastNotification('تم تحميل صورة الـ QR بنجاح!', 'success');
  }
}

window.downloadClientHarpySticker = downloadClientHarpySticker;

function closeQrModal(updateHistory = true) {
  const backdrop = document.getElementById('qr-modal-backdrop');
  const modal = document.getElementById('qr-code-modal');
  if (backdrop) backdrop.classList.remove('active');
  if (modal) modal.classList.remove('open');
  if (updateHistory && history.state && history.state.harpyNav === 'qr_modal') {
    history.back();
  }
}

function shareMenuLink() {
  const settings = Store.getSettings();
  const title = settings.storeName || 'منيو المطعم';
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: title,
      text: `تفضل بزيارة قائمة طعام ${title} والطلب أونلاين:`,
      url: url
    }).catch(() => {});
  } else {
    copyMenuLink();
  }
}

function copyMenuLink() {
  const url = window.location.href;
  const copyBtnText = document.getElementById('copy-menu-link-text');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      if (copyBtnText) copyBtnText.textContent = 'تم نسخ الرابط بنجاح!';
      showToastNotification("تم نسخ رابط المنيو إلى الحافظة", "success");
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'نسخ الرابط إلى الحافظة';
      }, 3000);
    }).catch(() => {
      showToastNotification("تعذر النسخ التلقائي، يمكنك نسخ الرابط من المتصفح", "info");
    });
  } else {
    showToastNotification("يمكنك نسخ الرابط من شريط عنوان المتصفح", "info");
  }
}

// ── BOTTOM NAVIGATION BAR CONTROLLER (5 Tabs RTL) ──────────

function handleNavTabClick(tabId) {
  const tabs = document.querySelectorAll('.bottom-nav-bar .nav-tab-btn');
  const desktopLinks = document.querySelectorAll('.desktop-header-nav .desktop-nav-link');
  const viewHome = document.getElementById('view-portfolio');
  const viewMenu = document.getElementById('view-menu');
  const viewOrders = document.getElementById('view-orders');
  const viewAccount = document.getElementById('view-account');

  // Helper to switch views cleanly
  function switchAppView(activeView) {
    [viewHome, viewMenu, viewOrders, viewAccount].forEach(v => {
      if (v) {
        v.style.display = 'none';
        v.classList.remove('active');
      }
    });
    if (activeView) {
      activeView.style.display = 'block';
      activeView.classList.add('active');
    }
    window.scrollTo(0, 0);
  }

  // Helper to sync active state across mobile & desktop navigation
  function setActiveNavTab(id) {
    tabs.forEach(t => t.classList.remove('active'));
    desktopLinks.forEach(l => l.classList.remove('active'));
    const clickedTab = document.getElementById('nav-tab-' + id);
    const clickedDesktop = document.getElementById('desktop-nav-' + id);
    if (clickedTab) clickedTab.classList.add('active');
    if (clickedDesktop) clickedDesktop.classList.add('active');
  }

  // If navigating away from cart, ensure cart drawer closes immediately!
  if (tabId !== 'cart') {
    if (typeof window.closeCartDrawer === 'function') {
      window.closeCartDrawer(false);
    }
  }

  if (tabId === 'home') {
    setActiveNavTab('home');
    switchAppView(viewHome);
  } else if (tabId === 'cart') {
    setActiveNavTab('cart');
    if (typeof openCartDrawer === 'function') {
      openCartDrawer();
    }
  } else if (tabId === 'menu') {
    setActiveNavTab('menu');
    switchAppView(viewMenu);
  } else if (tabId === 'orders') {
    setActiveNavTab('orders');
    clearOrdersTabPulse();
    switchAppView(viewOrders);
    renderOrdersView();
  } else if (tabId === 'account') {
    setActiveNavTab('account');
    switchAppView(viewAccount);
    renderCleanProfileUI();
  }
}


window.rerenderAllCustomerViews = function() {
  const lang = (typeof I18n !== 'undefined') ? I18n.getLanguage() : 'ar';
  
  // 1. Re-apply DOM translations to all static data-i18n tags
  if (typeof I18n !== 'undefined' && I18n.applyDOMTranslations) {
    I18n.applyDOMTranslations(lang);
  }

  // 2. Translate bottom nav labels
  const navHome = document.querySelector('#nav-tab-home .nav-tab-label');
  const navMenu = document.querySelector('#nav-tab-menu .nav-tab-label');
  const navSearch = document.querySelector('#nav-tab-search .nav-tab-label');
  const navCart = document.querySelector('#nav-tab-cart .nav-tab-label');
  const navOrders = document.querySelector('#nav-tab-orders .nav-tab-label');
  const navAccount = document.querySelector('#nav-tab-account .nav-tab-label');
  if (navHome) navHome.textContent = (typeof t === 'function') ? t('nav_home', 'الرئيسية') : 'الرئيسية';
  if (navMenu) navMenu.textContent = (typeof t === 'function') ? t('nav_menu', 'المنيو') : 'المنيو';
  if (navSearch) navSearch.textContent = (typeof t === 'function') ? t('nav_search', 'البحث') : 'البحث';
  if (navCart) navCart.textContent = (typeof t === 'function') ? t('nav_cart', 'السلة') : 'السلة';
  if (navOrders) navOrders.textContent = (typeof t === 'function') ? t('nav_orders', 'طلباتي') : 'طلباتي';
  if (navAccount) navAccount.textContent = (typeof t === 'function') ? t('nav_account', 'حسابي') : 'حسابي';

  // 3. Translate search bar placeholder
  const searchInput = document.getElementById('search-input');
  if (searchInput && typeof t === 'function') searchInput.placeholder = t('search_placeholder', 'ابحث عن وجبتك المفضلة...');

  // 4. Update language indicator in #view-account and drawer
  const cleanLangSub = document.getElementById('clean-language-status-text');
  if (cleanLangSub && typeof I18n !== 'undefined' && I18n.supportedLanguages[lang]) {
    const l = I18n.supportedLanguages[lang];
    cleanLangSub.textContent = `${l.flag} ${l.name} (${l.englishName})`;
  }
  const cleanLangBtn = document.getElementById('clean-language-toggle-btn');
  if (cleanLangBtn) {
    cleanLangBtn.innerHTML = (lang === 'ar') ? '<span>English 🇬🇧</span>' : '<span>العربية 🇪🇬</span>';
  }
  const accountLangSub = document.getElementById('account-language-sub');
  if (accountLangSub && typeof I18n !== 'undefined' && I18n.supportedLanguages[lang]) {
    const l = I18n.supportedLanguages[lang];
    accountLangSub.textContent = `${l.flag} ${l.name} (${l.englishName})`;
  }

  // 5. Invalidate category cache signature & re-render categories
  try {
    if (typeof window.invalidateCategorySignature === 'function') window.invalidateCategorySignature();
    if (typeof window.renderDiscoveryRibbon === 'function') window.renderDiscoveryRibbon();
    if (typeof window.renderCategories === 'function') window.renderCategories();
  } catch(e) {}

  // 6. Invalidate products signature & re-render products
  try {
    if (typeof window.invalidateProductSignature === 'function') window.invalidateProductSignature();
    if (typeof window.renderProducts === 'function') window.renderProducts(true);
  } catch(e) {}

  // 7. Store info & announcements
  try {
    if (typeof renderStoreInfo === 'function') renderStoreInfo();
    if (typeof renderAnnouncement === 'function') renderAnnouncement();
  } catch(e) {}

  // 8. Cart drawer & Ledger UI
  try {
    if (typeof updateLedgerUI === 'function') updateLedgerUI();
    if (typeof renderCartDrawerItems === 'function') renderCartDrawerItems();
  } catch(e) {}

  // 9. Orders view & Stepper
  try {
    if (typeof renderOrdersView === 'function') renderOrdersView();
  } catch(e) {}

  // 10. Profile UI
  try {
    if (typeof renderCleanProfileUI === 'function') renderCleanProfileUI();
    if (typeof updateAccountDrawerProfileUI === 'function') updateAccountDrawerProfileUI();
  } catch(e) {}

  // 11. Quick Preview Modal auto-refresh if open
  try {
    const previewModal = document.getElementById('quick-preview-modal');
    if (previewModal && previewModal.classList.contains('open') && window.currentPreviewProductId && typeof window.openQuickPreview === 'function') {
      window.openQuickPreview(window.currentPreviewProductId);
    }
  } catch(e) {}
};

window.pushNavState = pushNavState;
window.handlePopStateNavigation = handlePopStateNavigation;
window.showToastNotification = showToastNotification;
window.animateFlyToCart = animateFlyToCart;
window.checkOrderingPaused = checkOrderingPaused;
window.renderStoreInfo = renderStoreInfo;
window.renderAnnouncement = renderAnnouncement;
window.initApp = initApp;
window.setupSubscriptionWatcher = setupSubscriptionWatcher;
window.setupOutboxSync = setupOutboxSync;
window.updateThemeToggleIcons = updateThemeToggleIcons;
window.updateSoundToggleIcon = updateSoundToggleIcon;
window.handleSoundToggle = handleSoundToggle;
window.initViewMode = initViewMode;
window.applyViewMode = applyViewMode;
window.handleViewModeChange = handleViewModeChange;
window.cycleViewMode = cycleViewMode;

// Export New Customer & Bottom Bar Features Globally
window.getCustomerProfile = getCustomerProfile;
window.saveCustomerProfile = saveCustomerProfile;
window.checkCustomerOnboarding = checkCustomerOnboarding;
window.openCustomerOnboardModal = openCustomerOnboardModal;
window.closeCustomerOnboardModal = closeCustomerOnboardModal;
window.handleCustomerOnboardSubmit = handleCustomerOnboardSubmit;
window.openMyAccountDrawer = openMyAccountDrawer;
window.closeMyAccountDrawer = closeMyAccountDrawer;
window.updateAccountDrawerProfileUI = updateAccountDrawerProfileUI;
window.toggleEditProfileForm = toggleEditProfileForm;
window.handleAccountEditSubmit = handleAccountEditSubmit;
window.renderCleanProfileUI = renderCleanProfileUI;
window.toggleCleanProfileEdit = toggleCleanProfileEdit;
window.triggerOrdersTabPulse = triggerOrdersTabPulse;
window.clearOrdersTabPulse = clearOrdersTabPulse;
window.handleNavTabClick = handleNavTabClick;
window.renderOrdersView = renderOrdersView;
window.updateOrdersStepperUI = updateOrdersStepperUI;
window.reorderPreviousOrder = reorderPreviousOrder;
window.openQrModal = openQrModal;
window.closeQrModal = closeQrModal;
window.shareMenuLink = shareMenuLink;
window.copyMenuLink = copyMenuLink;
window.handleNavTabClick = handleNavTabClick;


// ═══════════════════════════════════════════════════════════
// Multi-Branch & Dine-In Table Storefront Engine
// ═══════════════════════════════════════════════════════════

function updateHeaderBranchPill() {
  const pill = document.getElementById('header-branch-pill');
  const text = document.getElementById('header-branch-pill-text');
  const icon = document.getElementById('header-branch-pill-icon');
  const arrow = document.getElementById('header-branch-pill-arrow');
  const accountBranchItem = document.getElementById('account-branch-item');
  const accountBranchSub = document.getElementById('account-branch-name-sub');

  const urlParams = new URLSearchParams(window.location.search);
  const dineInTable = (urlParams.get('table') || urlParams.get('t') || sessionStorage.getItem('harpy_dinein_table') || window.__harpyDineInTable || '').trim();

  if (dineInTable) {
    if (pill) {
      pill.style.display = 'inline-flex';
      pill.style.border = '1px solid var(--primary)';
      pill.style.background = 'var(--primary-subtle)';
      pill.style.color = 'var(--primary)';
      pill.style.cursor = 'default';
      if (icon) icon.textContent = '🍽️';
      if (text) text.textContent = `طاولة ${dineInTable} (صالة)`;
      if (arrow) arrow.style.display = 'none';
    }
    if (accountBranchItem) accountBranchItem.style.display = 'none';
    return;
  }

  const branches = (typeof Store !== 'undefined' && Store.getBranches) ? Store.getBranches() : [];
  if (branches.length > 1) {
    const curSlug = Store.getRestaurantSlug();
    const curB = branches.find(b => b.slug === curSlug);
    const branchName = curB ? curB.name : 'اختر الفرع';

    if (pill) {
      pill.style.display = 'inline-flex';
      pill.style.cursor = 'pointer';
      pill.style.border = '1px solid var(--border)';
      pill.style.background = 'var(--surface)';
      pill.style.color = 'var(--text-main)';
      if (arrow) arrow.style.display = 'inline';
      if (icon) icon.textContent = '📍';
      if (text) text.textContent = branchName;
    }

    if (accountBranchItem) {
      accountBranchItem.style.display = 'flex';
      if (accountBranchSub) accountBranchSub.textContent = `الفرع الحالي: ${branchName}`;
    }
  } else {
    if (pill) pill.style.display = 'none';
    if (accountBranchItem) accountBranchItem.style.display = 'none';
  }
}

function renderCustomerBranchCards(branches, currentSlug) {
  const safeStr = (s) => (s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  return branches.map(b => {
    const isCurrent = (b.slug === currentSlug);
    const bName = safeStr(b.name || b.slug);
    const bAddr = safeStr(b.address || 'خدمة صالة وتيك أواي وتوصيل منزلي');
    return `
      <div class="branch-picker-item ${isCurrent ? 'active' : ''}" onclick="selectStoreBranch('${safeStr(b.slug)}')">
        <div class="branch-picker-info">
          <div class="branch-picker-icon-box">
            ${isCurrent ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>'}
          </div>
          <div>
            <div class="branch-picker-name">${bName}</div>
            <div class="branch-picker-address">${bAddr}</div>
          </div>
        </div>
        <div class="branch-picker-pill">
          ${isCurrent ? 'الفرع الحالي' : 'طلب من هنا ←'}
        </div>
      </div>
    `;
  }).join('');
}

window.openBranchPickerFromHeader = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const isDineIn = urlParams.has('table') || urlParams.has('t') || sessionStorage.getItem('harpy_dinein_table');
  if (isDineIn) return; // Don't switch branch if seated at in-store table

  const modal = document.getElementById('branch-picker-modal');
  const backdrop = document.getElementById('branch-picker-backdrop');
  const list = document.getElementById('branch-picker-list');
  if (!modal || !list) return;

  const branches = (typeof Store !== 'undefined' && Store.getBranches) ? Store.getBranches() : [];
  if (branches.length <= 1) return;

  const currentSlug = Store.getRestaurantSlug();
  list.innerHTML = renderCustomerBranchCards(branches, currentSlug);

  modal.classList.add('open', 'show');
  modal.style.display = 'block';
  if (backdrop) {
    backdrop.classList.add('open', 'show');
    backdrop.style.display = 'block';
  }
};

window.closeBranchPickerModal = function() {
  sessionStorage.setItem('harpy_branch_picked', 'dismissed');
  const modal = document.getElementById('branch-picker-modal');
  const backdrop = document.getElementById('branch-picker-backdrop');
  if (modal) {
    modal.classList.remove('open', 'show');
    modal.style.display = 'none';
  }
  if (backdrop) {
    backdrop.classList.remove('open', 'show');
    backdrop.style.display = 'none';
  }
};

window.checkMultiBranchSelection = function() {
  updateHeaderBranchPill();

  const urlParams = new URLSearchParams(window.location.search);
  const isDineIn = urlParams.has('table') || urlParams.has('t') || sessionStorage.getItem('harpy_dinein_table');
  if (isDineIn) return; // In-Store Dine-in Exception: seated at a table, NEVER prompt!

  const settings = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};
  const branches = (Array.isArray(settings.branches) && settings.branches.length > 1) ? settings.branches : [];
  if (branches.length <= 1) return; // Single-branch restaurant: NEVER prompt!

  if (sessionStorage.getItem('harpy_branch_picked')) return;

  const modal = document.getElementById('branch-picker-modal');
  const backdrop = document.getElementById('branch-picker-backdrop');
  const list = document.getElementById('branch-picker-list');
  if (!modal || !list) return;

  const currentSlug = Store.getRestaurantSlug();
  list.innerHTML = renderCustomerBranchCards(branches, currentSlug);

  modal.classList.add('open', 'show');
  modal.style.display = 'block';
  if (backdrop) {
    backdrop.classList.add('open', 'show');
    backdrop.style.display = 'block';
  }
};

window.selectStoreBranch = function(slug) {
  sessionStorage.setItem('harpy_branch_picked', slug);
  const curSlug = Store.getRestaurantSlug();
  if (curSlug !== slug) {
    window.location.href = `?m=${encodeURIComponent(slug)}`;
  } else {
    window.closeBranchPickerModal();
    updateHeaderBranchPill();
  }
};

window.updateHeaderBranchPill = updateHeaderBranchPill;
