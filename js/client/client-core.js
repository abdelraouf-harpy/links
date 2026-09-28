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

var elements = {
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIconOn: document.getElementById('sound-icon-on'),
  soundIconOff: document.getElementById('sound-icon-off'),

  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIconDark: document.getElementById('theme-icon-dark'),
  themeIconLight: document.getElementById('theme-icon-light'),

  storeName: document.getElementById('store-name'),
  storeTagline: document.getElementById('store-tagline'),
  storeLogo: document.getElementById('store-logo'),
  storeWhatsAppLink: document.getElementById('store-whatsapp-link'),

  storiesSection: document.getElementById('stories-section'),
  storiesTrack: document.getElementById('stories-track'),

  announcementBar: document.getElementById('announcement-bar'),
  announcementText: document.getElementById('announcement-text'),
  deliveryTimeBadge: document.getElementById('delivery-time-badge'),

  lastOrderBanner: document.getElementById('last-order-banner'),
  lastOrderSummary: document.getElementById('last-order-summary'),
  btnReorder: document.getElementById('btn-reorder'),

  discoveryContainer: document.getElementById('discovery-container'),
  searchInput: document.getElementById('search-input'),
  viewToggleGrid: document.getElementById('view-toggle-grid'),
  viewToggleList: document.getElementById('view-toggle-list'),

  categoriesContainer: document.getElementById('categories-container'),
  heroShowcaseContainer: document.getElementById('hero-showcase-container'),
  productsContainer: document.getElementById('products-container'),

  // Dynamic Island
  dynamicIslandCart: document.getElementById('dynamic-island-cart'),
  islandAvatarStack: document.getElementById('island-avatar-stack'),
  islandItemCount: document.getElementById('island-item-count'),
  islandSubText: document.getElementById('island-sub-text'),
  islandPriceDisplay: document.getElementById('island-price-display'),
  islandProgressFill: document.getElementById('island-progress-fill'),

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
}

window.addEventListener('popstate', handlePopStateNavigation);


async function initApp() {
  if (window.__isPortfolio) return;
  Store.initTheme();
  updateThemeToggleIcons();
  updateSoundToggleIcon();
  initViewMode();

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
  const hasLocalCache = Store.hasCachedData(slug) || isDemo;

  // 1. Intelligent Dual-Speed Hydration Engine
  // On device with cache or demo tenant, wait at most 120ms so cached UI opens instantly
  // On uncached tenant, wait up to 550ms for cloud data before revealing UI smoothly
  if (window.__harpyPreloadPromise) {
    const maxWaitTime = hasLocalCache ? 120 : 550;
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
          renderStoreInfo();
          renderStories();
          renderAnnouncement();
          renderDiscoveryRibbon();
          renderCategories();
          renderProducts();
        }
        if (freshData.settings) {
          if (typeof window.updatePwaBranding === 'function') {
            window.updatePwaBranding(freshData.settings);
          }
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
  initBackgroundOrderTracking();

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
    // On new phone give images up to 450ms to decode; on cached phone 30ms
    const maxImageWait = hasLocalCache ? 30 : 180;
    await Promise.race([
      Promise.allSettled(decodePromises),
      new Promise(r => setTimeout(r, maxImageWait))
    ]);
  }

  // 4. Dismiss native splash shield smoothly with instant complete reveal
  const splash = document.getElementById('app-splash-shield');
  if (splash) {
    requestAnimationFrame(() => {
      splash.classList.add('fade-out');
      setTimeout(() => { try { splash.remove(); } catch(e) {} }, 240);
    });
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
    }
  });

  // 6. Setup Offline Outbox background queue & auto-retry engine
  setupOutboxSync();
}


function setupOutboxSync() {
  if (typeof Store === 'undefined' || !Store.processOutbox) return;

  // Process any pending outbox orders on startup if online
  if (navigator.onLine) {
    Store.processOutbox().then(count => {
      if (count > 0) {
        showToastNotification(`✅ تم بنجاح إرسال وتأكيد ${count} طلب كان في قائمة الانتظار!`, "success");
        renderLastOrderRecall();
      }
    }).catch(() => {});
  }

  // Auto-retry when connection is restored
  window.addEventListener('online', async () => {
    showToastNotification("📡 عاد الاتصال بالإنترنت! جارٍ محاولة إرسال الطلبات المعلقة...", "info");
    const count = await Store.processOutbox();
    if (count > 0) {
      if (typeof SoundFX !== 'undefined' && SoundFX.playCash) SoundFX.playCash();
      showToastNotification(`✅ تم بنجاح إرسال وتأكيد ${count} طلب كان معلقاً!`, "success");
      Store.clearCart();
      updateLedgerUI();
      renderLastOrderRecall();
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
          showToastNotification(`✅ تم بنجاح إرسال وتأكيد ${count} طلب كان في قائمة الانتظار!`, "success");
          Store.clearCart();
          updateLedgerUI();
          renderLastOrderRecall();
        }
      }
    }
  }, 15000);
}

function showToastNotification(message, type = 'success') {
  const existing = document.getElementById('harpy-app-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'harpy-app-toast';
  toast.className = `admin-toast-pill toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      ${type === 'success' 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
      }
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
  }, 3500);
}

function updateThemeToggleIcons() {
  const currentMode = Store.getThemeMode();
  const iconDark = elements.themeIconDark || document.getElementById('theme-icon-dark');
  const iconLight = elements.themeIconLight || document.getElementById('theme-icon-light');

  if (iconDark && iconLight) {
    if (currentMode === 'light') {
      // In light mode: Show Moon icon (clicking switches to dark mode)
      iconDark.style.display = 'inline-block';
      iconLight.style.display = 'none';
    } else {
      // In dark mode: Show Sun icon (clicking switches to light mode)
      iconDark.style.display = 'none';
      iconLight.style.display = 'inline-block';
    }
  }
}

let lastThemeToggleTimestamp = 0;
window.handleThemeToggle = function() {
  const now = Date.now();
  if (now - lastThemeToggleTimestamp < 350) return; // Prevent double-trigger from multiple bindings
  lastThemeToggleTimestamp = now;

  const currentMode = Store.getThemeMode();
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  Store.setThemeMode(newMode);
  updateThemeToggleIcons();
  SoundFX.playPop();
};

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
}

let lastSoundToggleTimestamp = 0;
function handleSoundToggle() {
  const now = Date.now();
  if (now - lastSoundToggleTimestamp < 350) return;
  lastSoundToggleTimestamp = now;
  const enabled = Store.getSoundEnabled();
  Store.setSoundEnabled(!enabled);
  updateSoundToggleIcon();
  if (!enabled) SoundFX.playPop();
}

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


function initViewMode() {
  const mode = Store.getViewMode();
  applyViewMode(mode);
}

function applyViewMode(mode) {
  if (elements.productsContainer) {
    elements.productsContainer.classList.remove('view-mode-grid', 'view-mode-list');
    elements.productsContainer.classList.add(mode === 'list' ? 'view-mode-list' : 'view-mode-grid');
  }
  if (elements.viewToggleGrid && elements.viewToggleList) {
    elements.viewToggleGrid.classList.toggle('active', mode === 'grid');
    elements.viewToggleList.classList.toggle('active', mode === 'list');
  }
}

function handleViewModeChange(mode) {
  Store.setViewMode(mode);
  applyViewMode(mode);
  SoundFX.playPop();
}

function renderStoreInfo() {
  const settings = Store.getSettings();
  if (elements.storeName) elements.storeName.textContent = settings.storeName || "منيو المطعم";
  if (elements.storeTagline) elements.storeTagline.textContent = settings.storeTagline || "أشهى المأكولات الطازجة";
  
  if (elements.storeLogo) {
    if (settings.logo && settings.logo.trim() && settings.logo !== 'null') {
      elements.storeLogo.src = settings.logo;
      elements.storeLogo.style.display = 'block';
    } else {
      elements.storeLogo.src = 'assets/portfolio/logo.png';
      elements.storeLogo.style.display = 'block';
    }
  }

  // Update PWA install banner & branding with restaurant name & logo
  if (typeof window.updatePwaBranding === 'function') {
    window.updatePwaBranding(settings);
  }

  // Hero Cover Image
  const heroCoverImg = document.getElementById('hero-cover-img');
  if (heroCoverImg) {
    if (settings.cover && settings.cover.trim() && settings.cover !== 'null') {
      heroCoverImg.src = settings.cover;
    } else {
      heroCoverImg.src = "assets/portfolio/order_restaurant_showcase.jpg";
    }
  }

  // Hero Delivery Time
  const heroDelivery = document.getElementById('hero-delivery-time');
  if (heroDelivery) {
    heroDelivery.textContent = settings.deliveryTime || '30-45 دقيقة';
  }

  // Hero Open/Closed Status
  const heroStatusChip = document.getElementById('hero-status-chip');
  const heroStatusText = document.getElementById('hero-status-text');
  if (heroStatusChip && heroStatusText) {
    if (settings.isOrderingPaused) {
      heroStatusChip.classList.remove('open');
      heroStatusChip.classList.add('closed');
      heroStatusText.textContent = 'مغلق حالياً';
    } else {
      heroStatusChip.classList.remove('closed');
      heroStatusChip.classList.add('open');
      heroStatusText.textContent = 'مفتوح الآن';
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
    const cleanNum = (settings.whatsappNumber || '').replace(/\D/g, '');
    elements.storeWhatsAppLink.href = `https://wa.me/${cleanNum}`;
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
  if (!sourceElement || !elements.dynamicIslandCart) return;

  const rect = sourceElement.getBoundingClientRect();
  const targetRect = elements.dynamicIslandCart.getBoundingClientRect();

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
    if (elements.dynamicIslandCart) {
      elements.dynamicIslandCart.animate([
        { transform: 'translateX(-50%) translateY(0) scale(1)' },
        { transform: 'translateX(-50%) translateY(-6px) scale(1.06)' },
        { transform: 'translateX(-50%) translateY(0) scale(1)' }
      ], { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
    }
  }, 650);
}

function renderAnnouncement() {
  const settings = Store.getSettings();
  const promoCard = document.getElementById('promo-deal-card');
  const promoTitle = document.getElementById('promo-deal-title');
  const promoSubtitle = document.getElementById('promo-deal-subtitle');
  const promoImg = document.getElementById('promo-deal-img');

  if (promoImg) {
    const prods = (Store.getProducts && typeof Store.getProducts === 'function') ? Store.getProducts() : [];
    const featured = prods.find(p => p.isFeatured && p.image) || prods.find(p => p.image);
    if (featured && featured.image) {
      promoImg.src = featured.image;
    } else if (settings.cover && settings.cover.trim() && settings.cover !== 'null') {
      promoImg.src = settings.cover;
    } else {
      promoImg.src = "assets/portfolio/order_restaurant_showcase.jpg";
    }
  }

  if (promoCard) {
    if (settings.isOrderingPaused) {
      promoCard.style.display = 'flex';
      if (promoTitle) promoTitle.textContent = '🛑 المطعم متوقف حالياً عن استقبال الطلبات';
      if (promoSubtitle) promoSubtitle.textContent = 'وضع تصفح واستعراض قائمة الطعام فقط';
    } else {
      const hasAnnouncement = settings.showAnnouncement && settings.announcementText;
      const spendDiscount = settings.spendDiscount && settings.spendDiscount.enabled;
      const walletDiscount = settings.walletDiscount && settings.walletDiscount.enabled;

      if (hasAnnouncement) {
        promoCard.style.display = 'flex';
        if (promoTitle) promoTitle.textContent = settings.announcementText;
        if (promoSubtitle) promoSubtitle.textContent = settings.deliveryTime ? `وقت التوصيل التقديري: ${settings.deliveryTime}` : 'العرض متاح للطلب الفوري أونلاين';
      } else if (spendDiscount) {
        promoCard.style.display = 'flex';
        const valStr = settings.spendDiscount.type === 'percent' ? `${settings.spendDiscount.value}%` : `${settings.spendDiscount.value} ج.م`;
        if (promoTitle) promoTitle.textContent = `خصم ${valStr} على الطلبات الأكثر من ${settings.spendDiscount.minSpend} ج.م 🔥`;
        if (promoSubtitle) promoSubtitle.textContent = 'يطبق الخصم تلقائياً في السلة وعند الدفع';
      } else if (walletDiscount) {
        promoCard.style.display = 'flex';
        const valStr = settings.walletDiscount.type === 'percent' ? `${settings.walletDiscount.value}%` : `${settings.walletDiscount.value} ج.م`;
        if (promoTitle) promoTitle.textContent = `خصم ${valStr} عند الدفع بالمحفظة الإلكترونية ⚡`;
        if (promoSubtitle) promoSubtitle.textContent = 'فودافون كاش، إنستاباي والمحافظ البنكية';
      } else {
        promoCard.style.display = 'flex';
        if (promoTitle) promoTitle.textContent = 'خصم 15% على جميع الطلبات 🔥';
        if (promoSubtitle) promoSubtitle.textContent = 'العرض متاح اليوم فقط عند الطلب عبر المنيو';
      }
    }
  }

  if (elements.announcementBar) {
    elements.announcementBar.style.display = 'none';
  }
}


// ── Store Ordering Paused (Closed Mode) Handler ─────────────
function checkOrderingPaused() {
  const s = Store.getSettings();
  if (s.isOrderingPaused === true) {
    openOrderingPausedModal(s.orderingPausedMessage);
    return true;
  }
  return false;
}

window.openOrderingPausedModal = function(customMsg) {
  const modal = document.getElementById('ordering-paused-modal');
  const backdrop = document.getElementById('ordering-paused-backdrop');
  const msgEl = document.getElementById('ordering-paused-modal-msg');
  if (msgEl) {
    msgEl.textContent = customMsg || "المطعم متوقف حالياً عن استقبال الطلبات. مواعيد العمل يومياً من 12 ظهراً حتى 2 صباحاً. نسعد بخدمتكم قريباً!";
  }
  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  SoundFX.playPop();
};

window.closeOrderingPausedModal = function() {
  const modal = document.getElementById('ordering-paused-modal');
  const backdrop = document.getElementById('ordering-paused-backdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
};

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
      if (iconEl) iconEl.textContent = '🗑️';
      if (titleEl) titleEl.textContent = 'المطعم غير موجود أو تم حذفه نهائياً';
      if (descEl) descEl.textContent = 'تم إيقاف هذا الرابط وحذف بيانات هذا المطعم بالكامل من منصة هاربي.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201019971508?text=${encodeURIComponent(`مرحباً إدارة منصة هاربي، أود الاستفسار عن رابط المطعم (${slug})`)}`;
        contactBtn.textContent = '💬 تواصل مع إدارة منصة هاربي';
      }
    } else if (statusReason === 'expired') {
      if (iconEl) iconEl.textContent = '⏳';
      if (titleEl) titleEl.textContent = 'انتهت صلاحية اشتراك هذا المطعم';
      if (descEl) descEl.textContent = 'قائمة هذا المطعم متوقفة مؤقتاً لانتهاء الباقة. يرجى التجديد للاستمرار.';
      if (contactBtn) {
        const settings = Store.getSettings();
        const cleanWa = (settings.whatsappNumber || '').replace(/\D/g, '');
        contactBtn.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن تجديد اشتراك منيو ${settings.storeName || slug}`)}`;
        contactBtn.textContent = '💬 تواصل مع المطعم لتجديد الاشتراك';
      }
    } else {
      if (iconEl) iconEl.textContent = '❄️';
      if (titleEl) titleEl.textContent = 'عفواً، الخدمة متوقفة مؤقتاً';
      if (descEl) descEl.textContent = 'قائمة هذا المطعم غير متاحة حالياً لتلقي طلبات الأونلاين أو جاري تجديد الاشتراك.';
      if (contactBtn) {
        const settings = Store.getSettings();
        const cleanWa = (settings.whatsappNumber || '').replace(/\D/g, '');
        contactBtn.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن منيو ${settings.storeName || slug}`)}`;
        contactBtn.textContent = '💬 تواصل مع المطعم عبر الواتساب';
      }
    }
  };

  if (cachedStatus === 'suspended' || cachedStatus === 'blocked' || cachedStatus === 'expired' || cachedStatus === 'deleted') {
    applyStatusUI(cachedStatus);
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
