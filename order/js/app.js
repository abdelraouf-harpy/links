// ═══════════════════════════════════════════════════════════
// HarpyOrder — Client Front-End & Food Delivery Ordering Engine
// ═══════════════════════════════════════════════════════════

let activeCategoryFilter = 'all';
let activeDiscoveryFilter = 'all';
let searchDebounceTimer = null;
let currentPreviewProductId = null;
let currentCheckoutStep = 1;
let selectedPaymentMethod = 'cod';
let uploadedReceiptUrl = null;

// Stories state
let currentStoryIndex = 0;
let storyProgress = 0;
let storyInterval = null;
let isStoryPaused = false;

// Customizer state
let customizerProduct = null;
let customizerSelectedSize = null;
let customizerSelectedAddons = [];
let customizerQty = 1;

// ── Web Audio FX Engine ────────────────────────────────────
const SoundFX = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },
  playPop() {
    if (!Store.getSoundEnabled()) return;
    try {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);

      if (navigator.vibrate) navigator.vibrate(20);
    } catch (e) {}
  },
  playChime() {
    if (!Store.getSoundEnabled()) return;
    try {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + (idx * 0.05));
        
        gain.gain.setValueAtTime(0.12, now + (idx * 0.05));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.05) + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + (idx * 0.05));
        osc.stop(now + (idx * 0.05) + 0.26);
      });

      if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
    } catch (e) {}
  },
  playCash() {
    if (!Store.getSoundEnabled()) return;
    try {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [880, 1318.51, 1760].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (idx * 0.07));
        
        gain.gain.setValueAtTime(0.18, now + (idx * 0.07));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.07) + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + (idx * 0.07));
        osc.stop(now + (idx * 0.07) + 0.36);
      });

      if (navigator.vibrate) navigator.vibrate([30, 40, 50]);
    } catch (e) {}
  }
};

const elements = {
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
  btnProceedToStep2: document.getElementById('btn-proceed-to-step2'),

  custName: document.getElementById('cust-name'),
  custPhone: document.getElementById('cust-phone'),
  custAddress: document.getElementById('cust-address'),
  custNotes: document.getElementById('cust-notes'),
  btnBackToStep1: document.getElementById('btn-back-to-step1'),
  btnProceedToStep3: document.getElementById('btn-proceed-to-step3'),

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
  btnBackToStep2: document.getElementById('btn-back-to-step2'),
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

async function initApp() {
  Store.initTheme();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  updateThemeToggleIcons();
  updateSoundToggleIcon();
  initViewMode();

  const slug = Store.getRestaurantSlug();

  // 1. Fast-resolve preloaded cloud data from head fetch (0ms UI delay)
  if (window.__harpyPreloadPromise) {
    try {
      const preloadData = await window.__harpyPreloadPromise;
      if (preloadData && typeof preloadData === 'object') {
        Store.applySnapshotData(preloadData);
      }
    } catch(e) {}
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
      if (img.complete) return Promise.resolve();
      if (typeof img.decode === 'function') return img.decode().catch(() => {});
      return new Promise(r => { img.onload = r; img.onerror = r; });
    });
    await Promise.race([
      Promise.allSettled(decodePromises),
      new Promise(r => setTimeout(r, 180))
    ]);
  }

  // 4. Dismiss native splash shield smoothly with instant complete reveal
  const splash = document.getElementById('app-splash-shield');
  if (splash) {
    requestAnimationFrame(() => {
      splash.classList.add('fade-out');
      setTimeout(() => { try { splash.remove(); } catch(e) {} }, 220);
    });
  }

  // 5. Connect real-time cloud data sync from Firebase Realtime Database
  Store.syncFromCloud(slug, (status) => {
    if (status && status.hasData) {
      renderStoreInfo();
      renderAnnouncement();
      renderStories();
      renderCategories();
      renderProducts(true);
      updateLedgerUI();
    }
  });
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

window.handleThemeToggle = function() {
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

function handleSoundToggle() {
  const enabled = Store.getSoundEnabled();
  Store.setSoundEnabled(!enabled);
  updateSoundToggleIcon();
  if (!enabled) SoundFX.playPop();
}

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
    if (settings.logo) {
      elements.storeLogo.src = settings.logo;
      elements.storeLogo.style.display = 'inline-block';
    } else {
      elements.storeLogo.style.display = 'none';
    }
  }

  // Cover image as Hero Header Background
  const header = document.querySelector('.app-header');
  if (header) {
    if (settings.cover) {
      header.classList.add('has-cover');
      header.style.backgroundImage = `linear-gradient(180deg, rgba(12, 10, 9, 0.52) 0%, rgba(12, 10, 9, 0.88) 100%), url("${settings.cover}")`;
    } else {
      header.classList.remove('has-cover');
      header.style.backgroundImage = '';
    }
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

// ── Stories Highlights Engine ──────────────────────────────
function renderStories() {
  if (!elements.storiesTrack) return;
  const stories = Store.getStories();
  if (!stories || stories.length === 0) {
    if (elements.storiesSection) elements.storiesSection.style.display = 'none';
    return;
  }
  if (elements.storiesSection) elements.storiesSection.style.display = 'block';

  elements.storiesTrack.innerHTML = stories.map((s, idx) => `
    <div class="story-circle-item" onclick="openStoryViewer(${idx})">
      <div class="story-ring-wrap">
        <img src="${s.image}" alt="${s.title}" class="story-avatar-img" loading="lazy">
      </div>
      <span class="story-circle-label">${s.title}</span>
    </div>
  `).join('');
}

window.openStoryViewer = function(index) {
  const stories = Store.getStories();
  if (!stories || stories.length === 0) return;
  
  currentStoryIndex = Math.max(0, Math.min(index, stories.length - 1));
  const settings = Store.getSettings();

  if (elements.storyHeaderLogo) elements.storyHeaderLogo.src = settings.logo || stories[0].image;
  if (elements.storyModalBackdrop) elements.storyModalBackdrop.classList.add('active');
  if (elements.storyViewerModal) elements.storyViewerModal.classList.add('active');

  SoundFX.playPop();
  loadCurrentStory();
};

function loadCurrentStory() {
  const stories = Store.getStories();
  const s = stories[currentStoryIndex];
  if (!s) return;

  if (elements.storyViewerTitle) elements.storyViewerTitle.textContent = s.title;
  if (elements.storyViewerTime) elements.storyViewerTime.textContent = s.tagline || 'عرض مميز';
  if (elements.storyViewerImg) elements.storyViewerImg.src = s.image;
  if (elements.storyViewerBadge) elements.storyViewerBadge.textContent = s.badge || 'حصري';
  if (elements.storyViewerHeadline) elements.storyViewerHeadline.textContent = s.title;
  if (elements.storyViewerDesc) elements.storyViewerDesc.textContent = s.desc || s.tagline || '';

  if (elements.storyProgressWrap) {
    elements.storyProgressWrap.innerHTML = stories.map((_, idx) => `
      <div class="story-bar-segment">
        <div class="story-bar-fill ${idx < currentStoryIndex ? 'finished' : ''}" id="story-fill-${idx}"></div>
      </div>
    `).join('');
  }

  if (elements.btnStoryCta) {
    elements.btnStoryCta.onclick = () => {
      if (s.productId) {
        handleQuickAddItem(s.productId);
        closeStoryViewer();
        openCartDrawer();
      }
    };
  }

  startStoryTimer();
}

function startStoryTimer() {
  clearInterval(storyInterval);
  storyProgress = 0;
  const currentFill = document.getElementById(`story-fill-${currentStoryIndex}`);
  
  const step = 50;
  const totalDuration = 4500;
  const increment = (step / totalDuration) * 100;

  storyInterval = setInterval(() => {
    if (isStoryPaused) return;
    storyProgress += increment;
    if (currentFill) currentFill.style.width = `${Math.min(100, storyProgress)}%`;

    if (storyProgress >= 100) {
      clearInterval(storyInterval);
      nextStory();
    }
  }, step);
}

function nextStory() {
  const stories = Store.getStories();
  if (currentStoryIndex < stories.length - 1) {
    currentStoryIndex++;
    loadCurrentStory();
  } else {
    closeStoryViewer();
  }
}

function prevStory() {
  if (currentStoryIndex > 0) {
    currentStoryIndex--;
    loadCurrentStory();
  }
}

function closeStoryViewer() {
  clearInterval(storyInterval);
  if (elements.storyModalBackdrop) elements.storyModalBackdrop.classList.remove('active');
  if (elements.storyViewerModal) elements.storyViewerModal.classList.remove('active');
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
  if (elements.announcementBar) {
    const hasAnnouncement = settings.showAnnouncement && settings.announcementText;
    const hasDeliveryTime = settings.deliveryTime;

    if (hasAnnouncement || hasDeliveryTime) {
      elements.announcementBar.style.display = 'flex';
      if (elements.announcementText) {
        elements.announcementText.textContent = hasAnnouncement ? settings.announcementText : '';
        elements.announcementText.style.display = hasAnnouncement ? '' : 'none';
      }
      if (elements.deliveryTimeBadge) {
        if (hasDeliveryTime) {
          elements.deliveryTimeBadge.style.display = '';
          elements.deliveryTimeBadge.innerHTML = `
            <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${settings.deliveryTime}
          `;
        } else {
          elements.deliveryTimeBadge.style.display = 'none';
        }
      }
    } else {
      elements.announcementBar.style.display = 'none';
    }
  }
}

window.openLastOrderTracker = function() {
  const lastOrder = Store.getLastOrder();
  if (lastOrder && lastOrder.orderId) {
    openLiveOrderTracker(lastOrder.orderId, lastOrder);
  }
};

function renderLastOrderRecall() {
  const lastOrder = Store.getLastOrder();
  const headerTrackerBtn = document.getElementById('btn-header-tracker');
  const headerTrackerText = document.getElementById('header-tracker-text');
  const statusBadge = document.getElementById('last-order-status-badge');

  if (lastOrder && !lastOrder.archived && lastOrder.items && lastOrder.items.length > 0 && lastOrder.orderId) {
    if (elements.lastOrderBanner) elements.lastOrderBanner.style.display = 'flex';
    if (elements.lastOrderSummary) {
      const itemNames = lastOrder.items.map(i => `${i.qty}x ${i.name}`).join('، ');
      elements.lastOrderSummary.textContent = `${lastOrder.orderId}: ${itemNames}`;
    }

    if (headerTrackerBtn) {
      headerTrackerBtn.style.display = 'inline-flex';
      if (headerTrackerText) {
        headerTrackerText.textContent = `تتبع ${lastOrder.orderId}`;
      }
    }

    const st = lastOrder.status || 'pending';
    const statusMap = {
      pending: { text: '1. استلام الطلب 📥', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
      preparing: { text: '2. المطبخ يجهز 👨‍🍳', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
      out_for_delivery: { text: '3. في الطريق إليك 🛵', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
      delivered: { text: '4. تم التسليم بنجاح ✅', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
      cancelled: { text: 'تم الإلغاء ✕', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }
    };
    const sInfo = statusMap[st] || statusMap.pending;
    if (statusBadge) {
      statusBadge.textContent = sInfo.text;
      statusBadge.style.color = sInfo.color;
      statusBadge.style.background = sInfo.bg;
    }
  } else {
    if (elements.lastOrderBanner) elements.lastOrderBanner.style.display = 'none';
    if (headerTrackerBtn) headerTrackerBtn.style.display = 'none';
  }
}

function handleReorderClick() {
  const lastOrder = Store.getLastOrder();
  if (!lastOrder || !lastOrder.items) return;

  Store.saveCart([...lastOrder.items]);
  if (lastOrder.customer) {
    if (elements.custName) elements.custName.value = lastOrder.customer.name || '';
    if (elements.custPhone) elements.custPhone.value = lastOrder.customer.phone || '';
    if (elements.custAddress) elements.custAddress.value = lastOrder.customer.address || '';
  }
  updateLedgerUI();
  renderProducts();
  SoundFX.playChime();
  openCartDrawer();
}

function renderDiscoveryRibbon() {
  if (!elements.discoveryContainer) return;
  const favorites = Store.getFavorites();

  const discoveryTags = [
    { 
      id: 'all', 
      label: `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg><span>جميع الأصناف</span>`, 
      count: null 
    },
    { 
      id: 'fav', 
      label: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg><span>المفضلة</span> <span class="chip-count font-num">${favorites.length}</span>`, 
      count: favorites.length 
    }
  ];

  elements.discoveryContainer.innerHTML = discoveryTags.map(tag => `
    <button class="discovery-chip ${activeDiscoveryFilter === tag.id ? 'active' : ''}" onclick="handleDiscoveryFilter('${tag.id}')">
      ${tag.label}
    </button>
  `).join('');
}

window.handleDiscoveryFilter = function(filterId) {
  activeDiscoveryFilter = filterId;
  activeCategoryFilter = 'all';
  renderDiscoveryRibbon();
  renderCategories();
  renderProducts();
  SoundFX.playPop();

  if (elements.discoveryContainer) {
    const activeBtn = elements.discoveryContainer.querySelector('.discovery-chip.active');
    if (activeBtn) {
      scrollPillToCenter(elements.discoveryContainer, activeBtn);
    }
  }
};

let lastRenderedCategoriesSignature = '';

function renderCategories() {
  if (!elements.categoriesContainer) return;
  const categories = Store.getCategories();
  const currentSig = JSON.stringify(categories);

  // Only re-build DOM if the list of categories actually changed!
  if (lastRenderedCategoriesSignature !== currentSig) {
    lastRenderedCategoriesSignature = currentSig;
    let html = `
      <button class="cat-pill ${activeCategoryFilter === 'all' && activeDiscoveryFilter === 'all' ? 'active' : ''}" data-cat="all" onclick="handleCategoryFilter('all')">
        كل القائمة
      </button>
    `;

    html += categories.map(cat => {
      const isSelected = (activeCategoryFilter === cat);
      const safeEscaped = cat.replace(/'/g, "\\'");
      return `
        <button class="cat-pill ${isSelected ? 'active' : ''}" data-cat="${encodeURIComponent(cat)}" onclick="handleCategoryFilter('${safeEscaped}')">
          ${cat}
        </button>
      `;
    }).join('');

    elements.categoriesContainer.innerHTML = html;
  } else {
    // Fast in-place class toggle with 0 DOM reconstruction
    updateCategoryPillsActiveState();
  }
}

function updateCategoryPillsActiveState() {
  if (!elements.categoriesContainer) return;
  const pills = elements.categoriesContainer.querySelectorAll('.cat-pill');
  pills.forEach(pill => {
    const rawCat = pill.dataset.cat;
    const isMatch = (activeCategoryFilter === 'all' && activeDiscoveryFilter === 'all' && rawCat === 'all') ||
                    (rawCat !== 'all' && decodeURIComponent(rawCat) === activeCategoryFilter);
    pill.classList.toggle('active', isMatch);
  });
}

function scrollPillToCenter(container, pillEl) {
  if (!container || !pillEl) return;
  const containerWidth = container.clientWidth;
  const pillLeft = pillEl.offsetLeft;
  const pillWidth = pillEl.offsetWidth;
  const targetScroll = pillLeft - (containerWidth / 2) + (pillWidth / 2);
  container.scrollTo({
    left: targetScroll,
    behavior: 'smooth'
  });
}

window.handleCategoryFilter = function(cat) {
  if (activeCategoryFilter === cat && activeDiscoveryFilter === 'all') {
    return; // Already active, avoid redundant operations
  }

  activeCategoryFilter = cat;
  activeDiscoveryFilter = 'all';

  // 1. Instant in-place UI active state update (0ms, 0 DOM recreation)
  updateCategoryPillsActiveState();

  // 2. Smoothly center selected pill in horizontal strip
  if (elements.categoriesContainer) {
    const activeBtn = elements.categoriesContainer.querySelector('.cat-pill.active');
    if (activeBtn) {
      scrollPillToCenter(elements.categoriesContainer, activeBtn);
    }
  }

  // 3. Fast discovery ribbon sync
  if (elements.discoveryContainer) {
    elements.discoveryContainer.querySelectorAll('.discovery-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('onclick')?.includes("'all'"));
    });
  }

  // 4. Instant 0ms product filtering (CSS display toggle)
  renderProducts();

  // 5. Sound feedback
  SoundFX.playPop();
};

let lastRenderedProductsSignature = '';

function renderProducts(forceRebuild = false) {
  if (!elements.productsContainer) return;

  const allProds = Store.getProducts().filter(p => p.visible !== false);
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";
  const favorites = Store.getFavorites();
  const cart = Store.getCart();
  const searchQuery = (elements.searchInput && elements.searchInput.value || '').trim().toLowerCase();

  // Fast content signature to detect real product data changes
  const currentSig = allProds.map(p => `${p.id}_${p.price}_${p.originalPrice || 0}_${p.name}_${p.category}_${p.isFeatured ? 1 : 0}_${p.badge || ''}_${(p.sizes || []).length}_${(p.addons || []).length}`).join('|');

  const existingCards = elements.productsContainer.querySelectorAll('.food-item-card');
  const needsFullBuild = forceRebuild || existingCards.length === 0 || currentSig !== lastRenderedProductsSignature || allProds.length !== existingCards.length;

  if (needsFullBuild) {
    lastRenderedProductsSignature = currentSig;

    // Priority Sorting: Favorited products appear at the top
    let sortedProds = [...allProds];
    if (favorites.length > 0) {
      sortedProds.sort((a, b) => {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
      });
    }

    if (sortedProds.length === 0) {
      elements.productsContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 60px 20px;">
          <svg class="empty-icon" viewBox="0 0 24 24" style="width:64px;height:64px;opacity:0.3;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <div class="empty-title" style="font-size:1.1rem;">المنيو قيد الإعداد</div>
          <p style="font-size:13px; color:var(--text-muted); max-width:260px; margin: 8px auto 0;">يقوم المطعم حالياً بإضافة قائمة الأصناف. ارجع قريباً!</p>
        </div>
      `;
    } else {
      elements.productsContainer.innerHTML = sortedProds.map((p, idx) => renderProductCard(p, currency, idx)).join('');
    }
  }

  // 0ms Fast In-Place Visibility Filtering & In-Place Stepper Updates
  let visibleCount = 0;
  const cards = elements.productsContainer.querySelectorAll('.food-item-card');
  cards.forEach(card => {
    const pid = card.dataset.productId;
    const p = allProds.find(item => item.id === pid);
    if (!p) {
      card.style.display = 'none';
      return;
    }

    const isFav = favorites.includes(p.id);
    const catMatch = (activeDiscoveryFilter === 'fav')
      ? isFav
      : (activeCategoryFilter === 'all' || p.category === activeCategoryFilter);

    const searchMatch = !searchQuery || (
      p.name.toLowerCase().includes(searchQuery) ||
      (p.desc && p.desc.toLowerCase().includes(searchQuery)) ||
      (p.category && p.category.toLowerCase().includes(searchQuery)) ||
      (p.badge && p.badge.toLowerCase().includes(searchQuery))
    );

    if (catMatch && searchMatch) {
      card.style.display = '';
      visibleCount++;

      // In-place button stepper update
      const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);
      if (!hasOptions) {
        const cartItem = cart.find(i => (i.productId === p.id || i.id === p.id) && !i.selectedSize && (!i.selectedAddons || i.selectedAddons.length === 0));
        const qty = cartItem ? cartItem.qty : 0;
        const btnContainer = card.querySelector('.food-item-footer > div:last-child');
        if (btnContainer) {
          const stepperValEl = btnContainer.querySelector('.qty-stepper-val');
          const currentRenderedQty = stepperValEl ? parseInt(stepperValEl.textContent) : 0;
          if (currentRenderedQty !== qty) {
            btnContainer.innerHTML = renderCardActionButton(p, qty);
          }
        }
      }

      // In-place heart icon active state sync
      const favBtnTop = card.querySelector('.card-top-actions .btn-fav-toggle');
      if (favBtnTop) {
        favBtnTop.classList.toggle('active', isFav);
        const svg = favBtnTop.querySelector('svg');
        if (svg) svg.style.fill = isFav ? 'currentColor' : 'none';
      }
      const favBtnInline = card.querySelector('.btn-fav-inline');
      if (favBtnInline) {
        favBtnInline.classList.toggle('active', isFav);
        const svg = favBtnInline.querySelector('svg');
        if (svg) svg.style.fill = isFav ? 'currentColor' : 'none';
      }
    } else {
      card.style.display = 'none';
    }
  });

  // Handle Search / Filter Empty State Overlay
  let emptyOverlay = elements.productsContainer.querySelector('.dynamic-empty-filter-state');
  if (visibleCount === 0 && allProds.length > 0) {
    if (!emptyOverlay) {
      emptyOverlay = document.createElement('div');
      emptyOverlay.className = 'empty-state dynamic-empty-filter-state';
      emptyOverlay.style.gridColumn = '1 / -1';
      emptyOverlay.innerHTML = `
        <svg class="empty-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <div class="empty-title">لا توجد أصناف مطابقة</div>
        <p style="font-size:12px; color:var(--text-muted);">جرب البحث بكلمة أخرى أو تصفح باقي الأقسام</p>
      `;
      elements.productsContainer.appendChild(emptyOverlay);
    }
    emptyOverlay.style.display = 'block';
  } else if (emptyOverlay) {
    emptyOverlay.style.display = 'none';
  }

  // Hero Featured
  const featured = allProds.find(p => p.isFeatured);
  if (elements.heroShowcaseContainer) {
    if (featured && activeCategoryFilter === 'all' && activeDiscoveryFilter === 'all' && !searchQuery) {
      elements.heroShowcaseContainer.style.display = 'block';
      elements.heroShowcaseContainer.innerHTML = renderHeroShowcase(featured, currency);
    } else {
      elements.heroShowcaseContainer.style.display = 'none';
    }
  }
}

function renderHeroShowcase(p, currency) {
  const isFav = Store.isFavorite(p.id);
  const cart = Store.getCart();
  const cartItem = cart.find(i => (i.productId === p.id || i.id === p.id) && !i.selectedSize && (!i.selectedAddons || i.selectedAddons.length === 0));
  const qty = cartItem ? cartItem.qty : 0;
  const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);

  return `
    <div class="hero-product-card">
      <div class="hero-product-img-wrap" onclick="openQuickPreview('${p.id}')">
        <img src="${p.image}" class="hero-product-img" alt="${p.name}" loading="eager" fetchpriority="high" decoding="async">
        <span class="hero-badge-tag">${p.badge || '👑 اختيار الشيف'}</span>
      </div>
      <div class="hero-product-content">
        <div>
          <div class="hero-meta-row">
            <span class="meta-chip">${p.category}</span>
            <span class="meta-chip"><svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${p.prepTime || '15 دقيقة'}</span>
          </div>
          <h2 class="hero-product-title" onclick="openQuickPreview('${p.id}')" style="cursor:pointer;">${p.name}</h2>
          <p class="hero-product-desc">${p.desc}</p>
        </div>
        <div class="hero-product-footer">
          <div class="hero-price font-num">
            ${p.originalPrice && p.originalPrice > p.price ? `<span class="price-crossed" style="font-size:14px;">${p.originalPrice} ${currency}</span>` : ''}
            ${p.price} <span>${currency}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn-fav-toggle ${isFav ? 'active' : ''}" onclick="handleToggleFav('${p.id}')" title="إضافة للمفضلة">
              <svg class="icon" viewBox="0 0 24 24" style="fill: ${isFav ? 'currentColor' : 'none'};"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            ${hasOptions ? `
              <button class="btn-quick-add" onclick="event.stopPropagation(); openCustomizer('${p.id}')">
                <span>تخصيص +</span>
              </button>
            ` : renderCardActionButton(p, qty)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProductCard(p, currency, index = 0) {
  const isFav = Store.isFavorite(p.id);
  const cart = Store.getCart();
  const cartItem = cart.find(i => (i.productId === p.id || i.id === p.id) && !i.selectedSize && (!i.selectedAddons || i.selectedAddons.length === 0));
  const qty = cartItem ? cartItem.qty : 0;
  const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);
  const isAboveFold = index < 6;

  return `
    <div class="food-item-card" data-product-id="${p.id}">
      <div class="food-item-media" onclick="openQuickPreview('${p.id}')">
        <img src="${p.image}" class="food-item-img" alt="${p.name}" ${isAboveFold ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        <div class="card-top-actions">
          ${p.badge ? `<span class="card-badge">${p.badge}</span>` : '<span></span>'}
          <button class="btn-fav-toggle ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); handleToggleFav('${p.id}')" title="إضافة للمفضلة">
            <svg class="icon" viewBox="0 0 24 24" style="fill: ${isFav ? 'currentColor' : 'none'};"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>
      </div>

      <div class="food-item-body">
        <div class="item-meta-tags">
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="item-prep-time">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${p.prepTime || '15 دقيقة'}</span>
            </span>
            <span style="font-size:11.5px; color:var(--text-muted);">• ${p.category}</span>
          </div>
          <button class="btn-fav-inline ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); handleToggleFav('${p.id}')" title="إضافة للمفضلة">
            <svg class="icon icon-sm" viewBox="0 0 24 24" style="fill: ${isFav ? 'currentColor' : 'none'};"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>

        <h3 class="food-item-title" onclick="openQuickPreview('${p.id}')">${p.name}</h3>
        <p class="food-item-desc">${p.desc}</p>

        <div class="food-item-footer">
          <div class="food-item-price font-num">
            ${p.originalPrice && p.originalPrice > p.price ? `<span class="price-crossed">${p.originalPrice} ${currency}</span>` : ''}
            ${p.price} <span>${currency}</span>
          </div>
          <div>
            ${hasOptions ? `
              <button class="btn-quick-add" onclick="event.stopPropagation(); openCustomizer('${p.id}')">
                <span>تخصيص +</span>
              </button>
            ` : renderCardActionButton(p, qty)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCardActionButton(product, qty) {
  if (qty > 0) {
    return `
      <div class="qty-stepper">
        <button class="qty-stepper-btn" onclick="event.stopPropagation(); handleUpdateItemQty('${product.id}', -1)" title="تقليل">
          ${qty === 1 ? '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>' : '−'}
        </button>
        <span class="qty-stepper-val font-num">${qty}</span>
        <button class="qty-stepper-btn" onclick="event.stopPropagation(); handleUpdateItemQty('${product.id}', 1)" title="زيادة">+</button>
      </div>
    `;
  } else {
    return `
      <button class="btn-quick-add" onclick="event.stopPropagation(); handleQuickAddItem('${product.id}', this)">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>إضافة</span>
      </button>
    `;
  }
}

window.handleToggleFav = function(productId) {
  Store.toggleFavorite(productId);
  SoundFX.playPop();
  renderDiscoveryRibbon();
  renderProducts(true);
};

window.handleQuickAddItem = function(productId, triggerElement) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);
  if (hasOptions) {
    openCustomizer(productId);
    return;
  }

  const cart = Store.getCart();
  const existing = cart.find(i => i.productId === productId && !i.selectedSize && (!i.selectedAddons || i.selectedAddons.length === 0));
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: 'c_' + p.id + '_' + Date.now(),
      productId: p.id,
      name: p.name,
      basePrice: p.price,
      price: p.price,
      image: p.image,
      category: p.category,
      qty: 1
    });
  }
  Store.saveCart(cart);
  SoundFX.playPop();

  if (triggerElement) {
    animateFlyToCart(triggerElement, p.image);
  }

  updateLedgerUI();
  renderProducts();
};
window.handleQuickAddToCart = window.handleQuickAddItem;

window.handleUpdateItemQty = function(cartItemId, change) {
  let cart = Store.getCart();
  const existing = cart.find(i => i.id === cartItemId || i.productId === cartItemId);
  if (!existing) return;

  existing.qty += change;
  if (existing.qty <= 0) {
    cart = cart.filter(i => i.id !== existing.id);
  }
  Store.saveCart(cart);
  SoundFX.playPop();
  updateLedgerUI();
  renderProducts();

  if (currentPreviewProductId === cartItemId) {
    updatePreviewModalActions(cartItemId);
  }
};

window.openQuickPreview = function(productId) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  currentPreviewProductId = productId;
  const s = Store.getSettings();
  const currency = s.currency || "ج.م";

  if (elements.previewImg) elements.previewImg.src = p.image;
  if (elements.previewBadge) {
    elements.previewBadge.textContent = p.badge || 'مميز';
    elements.previewBadge.style.display = p.badge ? 'inline-block' : 'none';
  }
  if (elements.previewTitle) elements.previewTitle.textContent = p.name;
  if (elements.previewCategory) elements.previewCategory.textContent = p.category;
  if (elements.previewPrepTime) elements.previewPrepTime.textContent = p.prepTime || '15 دقيقة';
  if (elements.previewPrice) {
    elements.previewPrice.innerHTML = `
      ${p.originalPrice && p.originalPrice > p.price ? `<span class="price-crossed" style="font-size:13px;">${p.originalPrice} ${currency}</span>` : ''}
      ${p.price} <span>${currency}</span>
    `;
  }
  if (elements.previewDesc) elements.previewDesc.textContent = p.desc;

  updatePreviewModalActions(productId);

  if (elements.previewModal) elements.previewModal.classList.add('open');
  if (elements.previewModalBackdrop) elements.previewModalBackdrop.classList.add('open');
  SoundFX.playPop();
};

function updatePreviewModalActions(productId) {
  if (!elements.previewActionWrap) return;
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);
  if (hasOptions) {
    elements.previewActionWrap.innerHTML = `
      <button class="btn btn-primary" onclick="closeQuickPreview(); openCustomizer('${p.id}');" style="padding:8px 20px;">
        <span>تخصيص وإضافة +</span>
      </button>
    `;
    return;
  }

  const cart = Store.getCart();
  const cartItem = cart.find(i => i.productId === productId || i.id === productId);
  const qty = cartItem ? cartItem.qty : 0;

  elements.previewActionWrap.innerHTML = renderCardActionButton(p, qty);
}

function closeQuickPreview() {
  currentPreviewProductId = null;
  if (elements.previewModal) elements.previewModal.classList.remove('open');
  if (elements.previewModalBackdrop) elements.previewModalBackdrop.classList.remove('open');
}

// ── Advanced Item Customizer Modal ─────────────────────────
window.openCustomizer = function(productId) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  customizerProduct = p;
  customizerSelectedSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : null;
  customizerSelectedAddons = [];
  customizerQty = 1;

  const currency = Store.getSettings().currency || "ج.م";

  if (elements.customizerTitle) elements.customizerTitle.textContent = p.name;
  if (elements.customizerDesc) elements.customizerDesc.textContent = p.desc;
  if (elements.customizerImg) elements.customizerImg.src = p.image;
  if (elements.customizerBasePrice) elements.customizerBasePrice.textContent = `${p.price} ${currency}`;
  if (elements.customizerNotes) elements.customizerNotes.value = '';
  if (elements.customizerQtyVal) elements.customizerQtyVal.textContent = '1';

  // Render Sizes
  if (p.sizes && p.sizes.length > 0) {
    if (elements.customizerSizesSection) elements.customizerSizesSection.style.display = 'block';
    if (elements.customizerSizesList) {
      elements.customizerSizesList.innerHTML = p.sizes.map((s, idx) => `
        <div class="customizer-option-card ${idx === 0 ? 'selected' : ''}" onclick="selectCustomizerSize('${s.id}')" data-size-id="${s.id}">
          <div class="option-left-wrap">
            <div class="custom-radio-circle"></div>
            <span class="option-name">${s.name}</span>
          </div>
          <span class="option-price-extra font-num">${s.price > 0 ? `+${s.price} ${currency}` : 'السعر الأساسي'}</span>
        </div>
      `).join('');
    }
  } else {
    if (elements.customizerSizesSection) elements.customizerSizesSection.style.display = 'none';
  }

  // Render Add-ons
  if (p.addons && p.addons.length > 0) {
    if (elements.customizerAddonsSection) elements.customizerAddonsSection.style.display = 'block';
    if (elements.customizerAddonsList) {
      elements.customizerAddonsList.innerHTML = p.addons.map(a => `
        <div class="customizer-option-card" onclick="toggleCustomizerAddon('${a.id}')" data-addon-id="${a.id}">
          <div class="option-left-wrap">
            <div class="custom-check-box"></div>
            <span class="option-name">${a.name}</span>
          </div>
          <span class="option-price-extra font-num">+${a.price} ${currency}</span>
        </div>
      `).join('');
    }
  } else {
    if (elements.customizerAddonsSection) elements.customizerAddonsSection.style.display = 'none';
  }

  calculateCustomizerTotal();

  if (elements.customizerBackdrop) elements.customizerBackdrop.classList.add('open');
  if (elements.customizerModal) elements.customizerModal.classList.add('open');
  SoundFX.playPop();
};

window.selectCustomizerSize = function(sizeId) {
  if (!customizerProduct || !customizerProduct.sizes) return;
  customizerSelectedSize = customizerProduct.sizes.find(s => s.id === sizeId);
  
  const cards = document.querySelectorAll('#customizer-sizes-list .customizer-option-card');
  cards.forEach(card => {
    card.classList.toggle('selected', card.dataset.sizeId === sizeId);
  });

  SoundFX.playPop();
  calculateCustomizerTotal();
};

window.toggleCustomizerAddon = function(addonId) {
  if (!customizerProduct || !customizerProduct.addons) return;
  const addon = customizerProduct.addons.find(a => a.id === addonId);
  if (!addon) return;

  const exists = customizerSelectedAddons.find(a => a.id === addonId);
  if (exists) {
    customizerSelectedAddons = customizerSelectedAddons.filter(a => a.id !== addonId);
  } else {
    customizerSelectedAddons.push(addon);
  }

  const card = document.querySelector(`#customizer-addons-list .customizer-option-card[data-addon-id="${addonId}"]`);
  if (card) {
    card.classList.toggle('selected', !exists);
  }

  SoundFX.playPop();
  calculateCustomizerTotal();
};

function calculateCustomizerTotal() {
  if (!customizerProduct) return;
  const currency = Store.getSettings().currency || "ج.م";
  let unitPrice = customizerProduct.price;

  if (customizerSelectedSize && customizerSelectedSize.price) {
    unitPrice += customizerSelectedSize.price;
  }

  customizerSelectedAddons.forEach(a => {
    unitPrice += (a.price || 0);
  });

  const total = unitPrice * customizerQty;
  if (elements.customizerTotalPrice) {
    elements.customizerTotalPrice.textContent = `${total.toFixed(2)} ${currency}`;
  }
}

function initCustomizerEvents() {
  if (elements.btnCloseCustomizer) {
    elements.btnCloseCustomizer.addEventListener('click', closeCustomizer);
  }
  if (elements.customizerBackdrop) {
    elements.customizerBackdrop.addEventListener('click', closeCustomizer);
  }

  if (elements.btnCustomizerQtyMinus) {
    elements.btnCustomizerQtyMinus.addEventListener('click', () => {
      if (customizerQty > 1) {
        customizerQty--;
        if (elements.customizerQtyVal) elements.customizerQtyVal.textContent = customizerQty;
        calculateCustomizerTotal();
        SoundFX.playPop();
      }
    });
  }

  if (elements.btnCustomizerQtyPlus) {
    elements.btnCustomizerQtyPlus.addEventListener('click', () => {
      customizerQty++;
      if (elements.customizerQtyVal) elements.customizerQtyVal.textContent = customizerQty;
      calculateCustomizerTotal();
      SoundFX.playPop();
    });
  }

  if (elements.btnAddCustomizedCart) {
    elements.btnAddCustomizedCart.addEventListener('click', () => {
      if (!customizerProduct) return;

      let unitPrice = customizerProduct.price;
      if (customizerSelectedSize && customizerSelectedSize.price) {
        unitPrice += customizerSelectedSize.price;
      }
      customizerSelectedAddons.forEach(a => {
        unitPrice += (a.price || 0);
      });

      const notes = (elements.customizerNotes && elements.customizerNotes.value || '').trim();

      const cartItem = {
        id: 'c_' + customizerProduct.id + '_' + Date.now(),
        productId: customizerProduct.id,
        name: customizerProduct.name,
        basePrice: customizerProduct.price,
        price: unitPrice,
        image: customizerProduct.image,
        category: customizerProduct.category,
        selectedSize: customizerSelectedSize ? { ...customizerSelectedSize } : null,
        selectedAddons: customizerSelectedAddons.map(a => ({ ...a })),
        notes: notes,
        qty: customizerQty
      };

      const cart = Store.getCart();
      cart.push(cartItem);
      Store.saveCart(cart);

      SoundFX.playPop();
      closeCustomizer();
      updateLedgerUI();
      renderProducts();
    });
  }
}

function closeCustomizer() {
  customizerProduct = null;
  if (elements.customizerBackdrop) elements.customizerBackdrop.classList.remove('open');
  if (elements.customizerModal) elements.customizerModal.classList.remove('open');
}

// ── Smart Upselling / Pairing Engine ───────────────────────
function renderSmartPairing(cart, prods, currency) {
  if (!elements.cartSmartPairing || !elements.pairingItemsList) return;
  if (cart.length === 0) {
    elements.cartSmartPairing.style.display = 'none';
    return;
  }

  const cartIds = cart.map(i => i.productId || i.id);
  const cartAvgPrice = cart.reduce((s, i) => s + (i.price || 0), 0) / (cart.length || 1);
  // Suggest items not in cart: prefer lower-priced items (< 60% of cart avg), fallback to any non-cart visible items
  let suggestions = prods.filter(p => p.visible !== false && !cartIds.includes(p.id) && p.price <= cartAvgPrice * 0.6);
  if (suggestions.length < 2) {
    // Fallback: any visible item not in cart
    suggestions = prods.filter(p => p.visible !== false && !cartIds.includes(p.id));
  }
  suggestions = suggestions.slice(0, 4);

  if (suggestions.length === 0) {
    elements.cartSmartPairing.style.display = 'none';
    return;
  }

  elements.cartSmartPairing.style.display = 'block';
  elements.pairingItemsList.innerHTML = suggestions.map(p => `
    <div class="pairing-chip-card" onclick="handleQuickAddItem('${p.id}')">
      <img src="${p.image}" class="pairing-thumb" alt="${p.name}">
      <div>
        <div class="pairing-title">${p.name}</div>
        <div class="pairing-price font-num">${p.price} ${currency}</div>
      </div>
      <button class="pairing-btn-add" title="إضافة">+</button>
    </div>
  `).join('');
}

// ── Dynamic Island & Cart UI Updates ───────────────────────
function updateLedgerUI() {
  const cart = Store.getCart();
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";
  const prods = Store.getProducts();

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Spend Tier Discount
  let spendTierDiscountAmount = 0;
  let spendTierProgress = 0;
  if (settings.enableSpendTierDiscount && settings.spendTierMinAmount > 0 && subtotal > 0) {
    const minSpend = settings.spendTierMinAmount;
    const tierValue = settings.spendTierDiscountValue || 15;
    const isPercent = settings.spendTierDiscountType !== 'fixed';

    if (subtotal >= minSpend) {
      spendTierDiscountAmount = isPercent ? (subtotal * (tierValue / 100)) : tierValue;
      spendTierProgress = 100;
      if (elements.spendTierCard) {
        elements.spendTierCard.style.display = 'block';
        if (elements.spendTierMsg) elements.spendTierMsg.textContent = `مبروك! حصلت على خصم ${tierValue}${isPercent ? '%' : ' ' + currency} على طلبك`;
        if (elements.spendTierPercent) elements.spendTierPercent.textContent = `${tierValue}${isPercent ? '%' : ' ج.م'} خصم`;
        if (elements.spendTierFill) elements.spendTierFill.style.width = '100%';
      }
    } else {
      const remaining = minSpend - subtotal;
      spendTierProgress = Math.min(100, Math.round((subtotal / minSpend) * 100));
      if (elements.spendTierCard) {
        elements.spendTierCard.style.display = 'block';
        if (elements.spendTierMsg) elements.spendTierMsg.textContent = `أضف بـ ${remaining.toFixed(0)} ${currency} أخرى لتحصل على خصم ${tierValue}${isPercent ? '%' : ' ' + currency}`;
        if (elements.spendTierPercent) elements.spendTierPercent.textContent = `متبقي ${remaining.toFixed(0)} ${currency}`;
        if (elements.spendTierFill) elements.spendTierFill.style.width = `${spendTierProgress}%`;
      }
    }
  } else {
    if (elements.spendTierCard) elements.spendTierCard.style.display = 'none';
  }

  // Promo Code Discount
  const appliedCoupon = Store.getAppliedCoupon();
  let couponDiscountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.type === 'percent') {
      couponDiscountAmount = subtotal * (appliedCoupon.value / 100);
    } else {
      couponDiscountAmount = appliedCoupon.value;
    }
    if (elements.promoAppliedBadge) {
      elements.promoAppliedBadge.style.display = 'flex';
      if (elements.promoAppliedText) elements.promoAppliedText.textContent = `كود ${appliedCoupon.code} (${appliedCoupon.desc || 'مفعل'})`;
    }
  } else {
    if (elements.promoAppliedBadge) elements.promoAppliedBadge.style.display = 'none';
  }

  const subtotalAfterBasePromos = Math.max(0, subtotal - spendTierDiscountAmount - couponDiscountAmount);

  // Digital Wallet Discount
  const isWallet = selectedPaymentMethod === 'wallet';
  let walletDiscountAmount = 0;
  if (isWallet && settings.enableWalletDiscount !== false && subtotalAfterBasePromos > 0) {
    const isPercent = settings.walletDiscountType !== 'fixed';
    const val = settings.walletDiscountValue !== undefined ? settings.walletDiscountValue : 10;
    walletDiscountAmount = isPercent ? (subtotalAfterBasePromos * (val / 100)) : val;
  }

  const totalDiscounts = spendTierDiscountAmount + couponDiscountAmount + walletDiscountAmount;
  const finalTotal = Math.max(0, subtotal - totalDiscounts);

  // Update Dynamic Island
  if (elements.dynamicIslandCart) {
    if (totalItemsCount > 0) {
      elements.dynamicIslandCart.classList.add('active');
      if (elements.islandItemCount) {
        elements.islandItemCount.textContent = `${totalItemsCount} ${totalItemsCount === 1 ? 'صنف بالسلة' : 'أصناف بالسلة'}`;
      }
      if (elements.islandPriceDisplay) {
        elements.islandPriceDisplay.textContent = `${finalTotal.toFixed(2)} ${currency}`;
      }
      if (elements.islandProgressFill) {
        elements.islandProgressFill.style.width = `${spendTierProgress}%`;
      }
      if (elements.islandAvatarStack) {
        const topAvatars = cart.slice(0, 3);
        elements.islandAvatarStack.innerHTML = topAvatars.map(i => `
          <img src="${i.image}" class="island-avatar-thumb" alt="${i.name}">
        `).join('');
      }
    } else {
      elements.dynamicIslandCart.classList.remove('active');
    }
  }

  if (elements.cartTotalPrice) {
    elements.cartTotalPrice.innerHTML = `${finalTotal.toFixed(2)} <span>${currency}</span>`;
  }

  if (elements.cartOriginalStrikethrough) {
    if (totalDiscounts > 0 && subtotal > 0) {
      elements.cartOriginalStrikethrough.style.display = 'inline-block';
      elements.cartOriginalStrikethrough.textContent = `${subtotal.toFixed(2)} ${currency}`;
    } else {
      elements.cartOriginalStrikethrough.style.display = 'none';
    }
  }

  if (elements.subtotalSummaryRow) {
    elements.subtotalSummaryRow.style.display = (totalDiscounts > 0 && subtotal > 0) ? 'flex' : 'none';
    if (elements.subtotalValDisplay) elements.subtotalValDisplay.textContent = `${subtotal.toFixed(2)} ${currency}`;
  }

  if (elements.spendTierDiscountRow) {
    elements.spendTierDiscountRow.style.display = spendTierDiscountAmount > 0 ? 'flex' : 'none';
    if (elements.spendTierBadge) elements.spendTierBadge.textContent = `${settings.spendTierDiscountValue}${settings.spendTierDiscountType === 'fixed' ? ' ج.م' : '%'}`;
    if (elements.spendTierDiscountVal) elements.spendTierDiscountVal.textContent = `-${spendTierDiscountAmount.toFixed(2)} ${currency}`;
  }

  if (elements.promoDiscountRow) {
    elements.promoDiscountRow.style.display = couponDiscountAmount > 0 ? 'flex' : 'none';
    if (elements.promoNameBadge && appliedCoupon) elements.promoNameBadge.textContent = appliedCoupon.code;
    if (elements.promoDiscountVal) elements.promoDiscountVal.textContent = `-${couponDiscountAmount.toFixed(2)} ${currency}`;
  }

  if (elements.walletDiscountRow) {
    elements.walletDiscountRow.style.display = (isWallet && walletDiscountAmount > 0) ? 'flex' : 'none';
    if (elements.walletDiscountBadge) {
      const val = settings.walletDiscountValue !== undefined ? settings.walletDiscountValue : 10;
      elements.walletDiscountBadge.textContent = `${val}${settings.walletDiscountType === 'fixed' ? ' ج.م' : '%'}`;
    }
    if (elements.walletDiscountVal) elements.walletDiscountVal.textContent = `-${walletDiscountAmount.toFixed(2)} ${currency}`;
  }

  if (elements.walletAmountReminder) {
    elements.walletAmountReminder.textContent = `${finalTotal.toFixed(2)} ${currency}`;
  }

  const minOrder = settings.minOrder || 0;
  if (elements.btnProceedToStep2) {
    if (subtotal < minOrder && totalItemsCount > 0) {
      elements.btnProceedToStep2.disabled = true;
      elements.btnProceedToStep2.innerHTML = `<span>الحد الأدنى للطلب ${minOrder} ${currency}</span>`;
    } else {
      elements.btnProceedToStep2.disabled = totalItemsCount === 0;
      elements.btnProceedToStep2.innerHTML = `<span>متابعة لبيانات التوصيل ←</span>`;
    }
  }

  renderSmartPairing(cart, prods, currency);
  renderCartDrawerItems();
}

function renderCartDrawerItems() {
  if (!elements.cartDrawerItems) return;
  const cart = Store.getCart();
  const s = Store.getSettings();
  const currency = s.currency || "ج.م";

  if (cart.length === 0) {
    elements.cartDrawerItems.innerHTML = `
      <div style="text-align:center; padding:36px 12px; color:var(--text-faint);">
        <svg class="icon" style="width:40px; height:40px; margin-bottom:8px; opacity:0.4;" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        <div style="font-size:13.5px; font-weight:700; color:var(--text-muted);">السلة فارغة حالياً</div>
        <p style="font-size:11.5px; margin-top:2px;">اختر بعض الأطباق الشهية من المنيو للبدء</p>
      </div>
    `;
    return;
  }

  elements.cartDrawerItems.innerHTML = cart.map(item => {
    const sizeText = item.selectedSize ? `<span style="display:inline-block; background:var(--surface-hover); color:var(--text-muted); font-size:10.5px; padding:1px 6px; border-radius:4px; margin-top:2px;">${item.selectedSize.name}</span>` : '';
    const addonsText = item.selectedAddons && item.selectedAddons.length > 0 
      ? `<div style="font-size:10px; color:var(--primary); margin-top:2px;">+ ${item.selectedAddons.map(a => a.name).join('، ')}</div>` 
      : '';
    const notesText = item.notes ? `<div style="font-size:10px; color:var(--text-faint); font-style:italic;">ملاحظة: ${item.notes}</div>` : '';

    return `
      <div class="cart-ledger-item">
        <img src="${item.image}" class="cart-ledger-img" alt="${item.name}">
        <div class="cart-ledger-details">
          <div class="cart-ledger-name">${item.name}</div>
          ${sizeText}
          ${addonsText}
          ${notesText}
          <div class="cart-ledger-price font-num" style="margin-top:4px;">${(item.price * item.qty).toFixed(2)} ${currency}</div>
        </div>
        <div class="qty-stepper" style="padding:1px;">
          <button class="qty-stepper-btn" onclick="handleUpdateItemQty('${item.id}', -1)">
            ${item.qty === 1 ? '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>' : '−'}
          </button>
          <span class="qty-stepper-val font-num" style="min-width:18px; font-size:12.5px;">${item.qty}</span>
          <button class="qty-stepper-btn" onclick="handleUpdateItemQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `;
  }).join('');
}

function openCartDrawer() {
  document.body.classList.add('cart-drawer-open');
  if (elements.dynamicIslandCart) elements.dynamicIslandCart.classList.add('hidden-during-drawer');
  if (elements.cartDrawer) elements.cartDrawer.classList.add('open');
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.classList.add('open');
  goToCheckoutStep(1);
  SoundFX.playPop();
}

function closeCartDrawer() {
  document.body.classList.remove('cart-drawer-open');
  if (elements.dynamicIslandCart) elements.dynamicIslandCart.classList.remove('hidden-during-drawer');
  if (elements.cartDrawer) elements.cartDrawer.classList.remove('open');
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.classList.remove('open');
}

function goToCheckoutStep(stepNumber) {
  currentCheckoutStep = stepNumber;
  elements.checkoutSteps.forEach(step => {
    const sNum = parseInt(step.dataset.step);
    step.style.display = sNum === stepNumber ? 'block' : 'none';
  });

  elements.stepNavBtns.forEach(btn => {
    const sNum = parseInt(btn.dataset.step);
    btn.classList.remove('active', 'completed');
    if (sNum === stepNumber) {
      btn.classList.add('active');
    } else if (sNum < stepNumber) {
      btn.classList.add('completed');
    }
  });

  // Dynamic drawer footer button label according to current step
  if (elements.btnConfirmOrderDirect) {
    const labelSpan = elements.btnConfirmOrderDirect.querySelector('span');
    if (labelSpan) {
      if (stepNumber === 1) {
        labelSpan.textContent = "متابعة لبيانات التوصيل ←";
      } else if (stepNumber === 2) {
        labelSpan.textContent = "متابعة لاختيار طريقة الدفع ←";
      } else {
        labelSpan.textContent = "تأكيد وإرسال الطلب مباشرة ⚡";
      }
    }
  }

  updateLedgerUI();
}

function setPaymentOption(opt) {
  selectedPaymentMethod = opt;
  if (opt === 'cod') {
    if (elements.payCodOption) elements.payCodOption.classList.add('selected');
    if (elements.payWalletOption) elements.payWalletOption.classList.remove('selected');
    if (elements.walletDetailsBox) elements.walletDetailsBox.style.display = 'none';
  } else {
    if (elements.payCodOption) elements.payCodOption.classList.remove('selected');
    if (elements.payWalletOption) elements.payWalletOption.classList.add('selected');
    if (elements.walletDetailsBox) elements.walletDetailsBox.style.display = 'block';
  }
  SoundFX.playPop();
  updateLedgerUI();
}

function setupEventListeners() {
  if (elements.soundToggleBtn) {
    elements.soundToggleBtn.addEventListener('click', handleSoundToggle);
  }

  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', handleThemeToggle);
  }

  if (elements.btnReorder) {
    elements.btnReorder.addEventListener('click', handleReorderClick);
  }

  // View Mode Switcher
  if (elements.viewToggleGrid) elements.viewToggleGrid.addEventListener('click', () => handleViewModeChange('grid'));
  if (elements.viewToggleList) elements.viewToggleList.addEventListener('click', () => handleViewModeChange('list'));

  // Stories Touch / Navigation
  if (elements.storyTouchPrev) elements.storyTouchPrev.addEventListener('click', prevStory);
  if (elements.storyTouchNext) elements.storyTouchNext.addEventListener('click', nextStory);
  if (elements.btnCloseStory) elements.btnCloseStory.addEventListener('click', closeStoryViewer);
  if (elements.storyModalBackdrop) elements.storyModalBackdrop.addEventListener('click', closeStoryViewer);

  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        renderProducts();
      }, 150);
    });
  }

  if (elements.btnClosePreview) elements.btnClosePreview.addEventListener('click', closeQuickPreview);
  if (elements.previewModalBackdrop) elements.previewModalBackdrop.addEventListener('click', closeQuickPreview);

  if (elements.dynamicIslandCart) elements.dynamicIslandCart.addEventListener('click', openCartDrawer);
  if (elements.btnCloseCartDrawer) elements.btnCloseCartDrawer.addEventListener('click', closeCartDrawer);
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.addEventListener('click', closeCartDrawer);

  if (elements.btnProceedToStep2) {
    elements.btnProceedToStep2.addEventListener('click', () => {
      const cart = Store.getCart();
      if (cart.length > 0) goToCheckoutStep(2);
    });
  }
  if (elements.btnBackToStep1) elements.btnBackToStep1.addEventListener('click', () => goToCheckoutStep(1));

  if (elements.btnProceedToStep3) {
    elements.btnProceedToStep3.addEventListener('click', () => {
      const name = (elements.custName.value || '').trim();
      const phone = (elements.custPhone.value || '').trim();
      const address = (elements.custAddress.value || '').trim();

      if (!name || name.length < 2) {
        showToastNotification("يرجى كتابة الاسم بشكل صحيح (حرفين على الأقل)", "error");
        elements.custName.focus();
        return;
      }
      if (!phone) {
        showToastNotification("يرجى كتابة رقم الهاتف للتواصل", "error");
        elements.custPhone.focus();
        return;
      }
      // Validate phone: Egyptian mobile (01x) or international (+20x / 20x) — digits only, 10-15 digits
      const phoneDigits = phone.replace(/[\s\-\+]/g, '');
      const egyptianMobile = /^(01[0-9]{9})$/.test(phoneDigits);
      const internationalMobile = /^(20[0-9]{10}|[0-9]{10,15})$/.test(phoneDigits);
      if (!egyptianMobile && !internationalMobile) {
        showToastNotification("يرجى كتابة رقم هاتف صحيح (مثال: 01012345678)", "error");
        elements.custPhone.focus();
        return;
      }
      if (!address || address.length < 5) {
        showToastNotification("يرجى كتابة عنوان التوصيل بالتفصيل (المنطقة، الشارع)", "error");
        elements.custAddress.focus();
        return;
      }
      goToCheckoutStep(3);
    });
  }
  if (elements.btnBackToStep2) elements.btnBackToStep2.addEventListener('click', () => goToCheckoutStep(2));

  elements.stepNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.dataset.step);
      if (targetStep === 1) goToCheckoutStep(1);
      else if (targetStep === 2) {
        const cart = Store.getCart();
        if (cart.length > 0) goToCheckoutStep(2);
      } else if (targetStep === 3) {
        if (elements.custName.value && elements.custPhone.value && elements.custAddress.value) {
          goToCheckoutStep(3);
        }
      }
    });
  });

  if (elements.btnApplyPromo) {
    elements.btnApplyPromo.addEventListener('click', () => {
      const code = (elements.promoCodeInput.value || '').trim().toUpperCase();
      if (!code) {
        showToastNotification("يرجى إدخال كود الخصم أولاً", "error");
        return;
      }
      const settings = Store.getSettings();
      const validPromo = (settings.promoCodes || []).find(p => p.code.toUpperCase() === code);
      if (validPromo) {
        Store.setAppliedCoupon(validPromo);
        elements.promoCodeInput.value = '';
        SoundFX.playChime();
        showToastNotification(`تم تفعيل خصم الكوبون بنجاح (${validPromo.code})! 🎉`, "success");
        updateLedgerUI();
      } else {
        showToastNotification("كود الخصم غير صحيح أو غير متاح", "error");
      }
    });
  }

  if (elements.btnRemovePromo) {
    elements.btnRemovePromo.addEventListener('click', () => {
      Store.setAppliedCoupon(null);
      SoundFX.playPop();
      updateLedgerUI();
    });
  }

  if (elements.payCodOption) elements.payCodOption.addEventListener('click', () => setPaymentOption('cod'));
  if (elements.payWalletOption) elements.payWalletOption.addEventListener('click', () => setPaymentOption('wallet'));

  if (elements.btnCopyNum) {
    elements.btnCopyNum.addEventListener('click', () => {
      const num = (elements.walletNumDisplay.textContent || '').trim();
      navigator.clipboard.writeText(num);
      SoundFX.playPop();

      if (elements.copyBtnText) elements.copyBtnText.textContent = "تم النسخ ✓";
      elements.btnCopyNum.classList.add('copied');

      setTimeout(() => {
        if (elements.copyBtnText) elements.copyBtnText.textContent = "نسخ الرقم";
        elements.btnCopyNum.classList.remove('copied');
      }, 2500);
    });
  }

  if (elements.receiptInput) {
    elements.receiptInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (elements.receiptPreview) elements.receiptPreview.src = ev.target.result;
        if (elements.receiptPreviewWrap) elements.receiptPreviewWrap.style.display = 'block';
        if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'none';
      };
      reader.readAsDataURL(file);

      if (elements.receiptStatus) {
        elements.receiptStatus.textContent = "جاري رفع الإيصال...";
        elements.receiptStatus.className = "upload-status-chip loading";
        elements.receiptStatus.style.display = "inline-block";
      }

      try {
        uploadedReceiptUrl = await Store.uploadImage(file);
        if (elements.receiptStatus) {
          elements.receiptStatus.textContent = "تم تجهيز الإيصال بنجاح ✓";
          elements.receiptStatus.className = "upload-status-chip success";
        }
      } catch (err) {
        if (elements.receiptStatus) {
          elements.receiptStatus.textContent = "تعذر الرفع، سيتم الإرسال لاحقاً";
          elements.receiptStatus.className = "upload-status-chip error";
        }
      }
    });
  }

  if (elements.btnRemoveReceipt) {
    elements.btnRemoveReceipt.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadedReceiptUrl = null;
      if (elements.receiptInput) elements.receiptInput.value = '';
      if (elements.receiptPreview) elements.receiptPreview.src = '';
      if (elements.receiptPreviewWrap) elements.receiptPreviewWrap.style.display = 'none';
      if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'flex';
      if (elements.receiptStatus) elements.receiptStatus.style.display = 'none';
      SoundFX.playPop();
    });
  }

  if (elements.btnConfirmOrderDirect) {
    elements.btnConfirmOrderDirect.addEventListener('click', () => handleDirectOrderSubmit(false));
  }

  if (elements.btnSendWhatsApp) {
    elements.btnSendWhatsApp.addEventListener('click', () => handleDirectOrderSubmit(true));
  }

  if (elements.btnCloseTracker) {
    elements.btnCloseTracker.addEventListener('click', closeLiveOrderTracker);
  }
  if (elements.btnTrackerNewOrder) {
    elements.btnTrackerNewOrder.addEventListener('click', closeLiveOrderTracker);
  }
  if (elements.trackerModalBackdrop) {
    elements.trackerModalBackdrop.addEventListener('click', closeLiveOrderTracker);
  }

  window.addEventListener('store_settings_updated', () => {
    Store.initTheme();
    renderStoreInfo();
    renderAnnouncement();
    renderStories();
    renderProducts();
    updateLedgerUI();
  });
  window.addEventListener('store_categories_updated', () => {
    renderCategories();
    renderProducts();
  });
  window.addEventListener('store_products_updated', () => {
    renderProducts();
    updateLedgerUI();
  });
  window.addEventListener('store_stories_updated', () => {
    renderStories();
  });
  window.addEventListener('store_favorites_updated', () => {
    renderDiscoveryRibbon();
    renderProducts();
  });
  window.addEventListener('harpy_restaurant_changed', () => {
    Store.initTheme();
    renderStoreInfo();
    renderAnnouncement();
    renderStories();
    renderCategories();
    renderProducts();
    updateLedgerUI();
  });

  // Real-Time Cross-Tab Synchronization (When changes occur in admin.html)
  window.addEventListener('storage', () => {
    Store.initTheme();
    renderStoreInfo();
    renderAnnouncement();
    renderStories();
    renderCategories();
    renderProducts();
    updateLedgerUI();
  });
}

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
}

// ── Direct In-App Ordering & Live Tracker Engine ────────────
let activeTrackerUnsubscribe = null;

async function handleDirectOrderSubmit(openWhatsApp = false) {
  if (Store.isSubscriptionSuspended()) {
    showToastNotification("عفواً، الخدمة متوقفة مؤقتاً لهذا المطعم.", "error");
    const backdrop = document.getElementById('subscription-suspended-backdrop');
    const overlay = document.getElementById('subscription-suspended-overlay');
    if (backdrop) backdrop.classList.add('active');
    if (overlay) overlay.classList.add('active');
    return;
  }

  const cart = Store.getCart();
  if (cart.length === 0) {
    showToastNotification("السلة فارغة، أضف بعض الوجبات أولاً 🛒", "error");
    return;
  }

  // If user is on Step 1, advance to Step 2
  if (currentCheckoutStep === 1) {
    goToCheckoutStep(2);
    if (elements.custName) elements.custName.focus();
    return;
  }

  const name = (elements.custName?.value || '').trim();
  const phone = (elements.custPhone?.value || '').trim();
  const address = (elements.custAddress?.value || '').trim();
  const notes = (elements.custNotes?.value || '').trim();

  // If user is on Step 2, validate and advance to Step 3
  if (currentCheckoutStep === 2) {
    if (!name || name.length < 2) {
      showToastNotification("يرجى كتابة الاسم بشكل صحيح (حرفين على الأقل)", "error");
      if (elements.custName) elements.custName.focus();
      return;
    }
    if (!phone) {
      showToastNotification("يرجى كتابة رقم الهاتف للتواصل", "error");
      if (elements.custPhone) elements.custPhone.focus();
      return;
    }
    const phoneDigits = phone.replace(/[\s\-\+]/g, '');
    const egyptianMobile = /^(01[0-9]{9})$/.test(phoneDigits);
    const internationalMobile = /^(20[0-9]{10}|[0-9]{10,15})$/.test(phoneDigits);
    if (!egyptianMobile && !internationalMobile) {
      showToastNotification("يرجى كتابة رقم هاتف صحيح (مثال: 01012345678)", "error");
      if (elements.custPhone) elements.custPhone.focus();
      return;
    }
    if (!address || address.length < 5) {
      showToastNotification("يرجى كتابة عنوان التوصيل بالتفصيل", "error");
      if (elements.custAddress) elements.custAddress.focus();
      return;
    }
    goToCheckoutStep(3);
    return;
  }

  // If user is on Step 3, ensure fields are complete before sending
  if (!name || !phone || !address) {
    showToastNotification("يرجى استكمال بيانات التوصيل أولاً", "error");
    goToCheckoutStep(2);
    return;
  }

  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (settings.minOrder > 0 && subtotal < settings.minOrder) {
    showToastNotification(`الحد الأدنى للطلب هو ${settings.minOrder} ${currency}`, "error");
    return;
  }

  let spendTierDiscountAmount = 0;
  if (settings.enableSpendTierDiscount && settings.spendTierMinAmount > 0 && subtotal >= settings.spendTierMinAmount) {
    const tierValue = settings.spendTierDiscountValue || 15;
    spendTierDiscountAmount = settings.spendTierDiscountType !== 'fixed' ? (subtotal * (tierValue / 100)) : tierValue;
  }

  const appliedCoupon = Store.getAppliedCoupon();
  let couponDiscountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    couponDiscountAmount = appliedCoupon.type === 'percent' ? (subtotal * (appliedCoupon.value / 100)) : appliedCoupon.value;
  }

  const subtotalAfterBase = Math.max(0, subtotal - spendTierDiscountAmount - couponDiscountAmount);
  const isWallet = selectedPaymentMethod === 'wallet';

  // ── Mandatory Receipt Validation for Digital Wallet Payments ──
  if (isWallet) {
    // If a file was selected but not yet finished processing/uploading, upload it now
    if (!uploadedReceiptUrl && elements.receiptInput?.files?.length > 0) {
      const file = elements.receiptInput.files[0];
      if (file) {
        showToastNotification("⏳ جاري تجهيز صورة الإيصال... يرجى الانتظار", "info");
        try {
          uploadedReceiptUrl = await Store.uploadImage(file);
        } catch (e) {
          console.warn("[Checkout] Receipt upload fallback:", e);
        }
      }
    }

    // If still no receipt image provided, block submission and prompt user with luxury alert
    if (!uploadedReceiptUrl) {
      showToastNotification("📸 يرجى إرفاق صورة إيصال التحويل لتأكيد الطلب عبر فودافون كاش / إنستاباي", "warning");
      const dropzone = document.querySelector('.receipt-luxury-dropzone') || elements.dropzonePrompt;
      if (dropzone) {
        dropzone.classList.add('dropzone-highlight-required');
        dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => dropzone.classList.remove('dropzone-highlight-required'), 3000);
      }
      return;
    }
  }

  let walletDiscountAmount = 0;
  if (isWallet && settings.enableWalletDiscount !== false && subtotalAfterBase > 0) {
    const isPercent = settings.walletDiscountType !== 'fixed';
    const val = settings.walletDiscountValue !== undefined ? settings.walletDiscountValue : 10;
    walletDiscountAmount = isPercent ? (subtotalAfterBase * (val / 100)) : val;
  }

  const totalDiscounts = spendTierDiscountAmount + couponDiscountAmount + walletDiscountAmount;
  const finalTotal = Math.max(0, subtotal - totalDiscounts);
  const orderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const orderData = {
    orderId,
    items: cart,
    customer: { name, phone, address, notes },
    subtotal,
    discounts: {
      spendTier: spendTierDiscountAmount,
      promo: couponDiscountAmount,
      promoCode: appliedCoupon ? appliedCoupon.code : null,
      wallet: walletDiscountAmount
    },
    finalTotal,
    paymentMethod: selectedPaymentMethod,
    receiptUrl: uploadedReceiptUrl || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    timestamp: Date.now()
  };

  // 1. Instant Push to Cloud (Firebase Realtime DB + REST)
  Store.pushOrderToCloud(orderData);

  // 2. Save locally for recall
  Store.saveLastOrder(orderData);

  // 3. Audio & Success Toast
  SoundFX.playCash();
  showToastNotification("تم إرسال واستلام طلبك بنجاح! جاري التجهيز 👨‍🍳🔥", "success");
  Store.clearCart();
  closeCartDrawer();
  goToCheckoutStep(1);
  updateLedgerUI();
  renderProducts();
  renderLastOrderRecall();

  // 4. Open WhatsApp if requested
  if (openWhatsApp) {
    const itemsText = cart.map(item => {
      let line = `• ${item.qty}x ${item.name}`;
      if (item.selectedSize) line += ` [${item.selectedSize.name}]`;
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        line += ` (+ ${item.selectedAddons.map(a => a.name).join(', ')})`;
      }
      if (item.notes) line += ` (ملاحظة: ${item.notes})`;
      line += ` = ${(item.price * item.qty).toFixed(2)} ${currency}`;
      return line;
    }).join('\n');

    const paymentText = isWallet 
      ? `تحويل محفظة إلكترونية (${settings.walletName || 'كاش'})`
      : `دفع نقدي عند الاستلام (COD)`;

    let message = `*طلب دليفري جديد من موقع ${settings.storeName}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `🔖 *رقم الطلب:* ${orderId}\n`;
    message += `👤 *العميل:* ${name}\n`;
    message += `📞 *الهاتف:* ${phone}\n`;
    message += `📍 *عنوان التوصيل:* ${address}\n`;
    if (notes) message += `📝 *ملاحظات:* ${notes}\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `🛒 *تفاصيل الأصناف:*\n${itemsText}\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *المبلغ الإجمالي المطلوب:* ${finalTotal.toFixed(2)} ${currency}\n`;
    message += `💳 *طريقة الدفع:* ${paymentText}\n`;
    if (isWallet && uploadedReceiptUrl) {
      if (uploadedReceiptUrl.startsWith('http')) {
        message += `📸 *رابط إيصال التحويل:* ${uploadedReceiptUrl}\n`;
      } else {
        message += `📸 *إيصال التحويل:* تم إرفاق صورة الإيصال ومحفوظة في لوحة إدارة المطعم (طلب رقم ${orderId})\n`;
      }
    }

    const cleanWhatsApp = (settings.whatsappNumber || '').replace(/\D/g, '');
    if (cleanWhatsApp) {
      const encodedUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`;
      window.open(encodedUrl, '_blank');
    }
  }

  // 5. Immediately open the Live Order Tracker Screen
  openLiveOrderTracker(orderId, orderData);
}

// ── Persistent Background Order Tracking & Audio Alerts Engine ──
let backgroundOrderWatcherUnsub = null;
let lastKnownBackgroundStatus = null;

function initBackgroundOrderTracking() {
  const slug = Store.getRestaurantSlug();
  const lastOrder = Store.getLastOrder();
  if (!slug || !lastOrder || !lastOrder.orderId || lastOrder.archived) {
    if (backgroundOrderWatcherUnsub) {
      backgroundOrderWatcherUnsub();
      backgroundOrderWatcherUnsub = null;
    }
    return;
  }

  if (lastKnownBackgroundStatus === null) {
    lastKnownBackgroundStatus = lastOrder.status || 'pending';
  }

  if (backgroundOrderWatcherUnsub) {
    backgroundOrderWatcherUnsub();
    backgroundOrderWatcherUnsub = null;
  }

  backgroundOrderWatcherUnsub = Store.subscribeToOrder(slug, lastOrder.orderId, (updatedOrder) => {
    if (!updatedOrder) return;
    const newStatus = updatedOrder.status || 'pending';
    const prevStatus = lastKnownBackgroundStatus;
    lastKnownBackgroundStatus = newStatus;

    const currentStored = Store.getLastOrder();
    if (currentStored && !currentStored.archived) {
      const merged = { ...currentStored, ...updatedOrder };
      Store.saveLastOrder(merged);
      renderLastOrderRecall();

      // If tracker modal is open, update UI in real-time
      if (elements.trackerModal && elements.trackerModal.classList.contains('open')) {
        const settings = Store.getSettings();
        const currency = settings.currency || "ج.م";
        renderTrackerOrderData(merged, currency);
        updateTrackerStepper(newStatus);
      }

      // Audio chime and toast notification on status transition even when modal is closed!
      if (prevStatus && prevStatus !== newStatus) {
        const statusAlerts = {
          pending: { text: "📥 تم استلام وتأكيد طلبك في المطعم!", sound: 'pop' },
          preparing: { text: "👨‍🍳 بدأ المطبخ في تجهيز وطهي طلبك الآن!", sound: 'pop' },
          out_for_delivery: { text: "🛵 طلبك استلمه الكابتن وهو في الطريق إليك الآن!", sound: 'chime' },
          delivered: { text: "🎉 تم تسليم طلبك بنجاح! بالهناء والشفاء", sound: 'cash' },
          cancelled: { text: "✕ تم إلغاء الطلب من قِبل المطعم", sound: 'pop' }
        };
        const alertInfo = statusAlerts[newStatus] || statusAlerts.pending;
        if (alertInfo.sound === 'chime') SoundFX.playChime();
        else if (alertInfo.sound === 'cash') SoundFX.playCash();
        else SoundFX.playPop();

        showToastNotification(alertInfo.text, newStatus === 'delivered' ? 'success' : 'info');
        notifyCustomerOrderStatus(newStatus);
      }
    }
  });
}

function openLiveOrderTracker(orderOrId, initialData = null) {
  let orderId = '';
  let currentOrder = null;

  if (typeof orderOrId === 'object' && orderOrId !== null) {
    currentOrder = orderOrId;
    orderId = orderOrId.orderId || orderOrId.id || 'ORD-NEW';
  } else {
    orderId = orderOrId;
    currentOrder = initialData || Store.getLastOrder();
  }

  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";

  if (elements.trackOrderId) elements.trackOrderId.textContent = orderId;
  if (elements.trackOrderEta) elements.trackOrderEta.textContent = settings.deliveryTime || "30-45 دقيقة";

  if (elements.btnTrackerWhatsapp) {
    const cleanWa = (settings.whatsappNumber || '').replace(/\D/g, '');
    elements.btnTrackerWhatsapp.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً، أستفسر عن طلبي رقم ${orderId}`)}`;
  }

  if (currentOrder) {
    renderTrackerOrderData(currentOrder, currency);
    updateTrackerStepper(currentOrder.status || 'pending');
  }

  if (elements.trackerModal) elements.trackerModal.classList.add('open');
  if (elements.trackerModalBackdrop) elements.trackerModalBackdrop.classList.add('open');

  initBackgroundOrderTracking();
}

function renderTrackerOrderData(order, currency) {
  if (elements.trackOrderTotal) {
    elements.trackOrderTotal.textContent = `${(parseFloat(order.finalTotal) || 0).toFixed(2)} ${currency}`;
  }

  if (elements.trackerItemsList && order.items) {
    elements.trackerItemsList.innerHTML = order.items.map(it => `
      <div style="display:flex; justify-content:space-between; font-size:11.5px; padding:2px 0;">
        <span><b style="color:var(--primary);">${it.qty}x</b> ${it.name} ${it.selectedSize ? `[${it.selectedSize.name}]` : ''}</span>
        <span class="font-num" style="font-weight:700;">${((it.price || 0) * it.qty).toFixed(2)} ${currency}</span>
      </div>
    `).join('');
  }
}

function notifyCustomerOrderStatus(status) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
    return;
  }
  if (Notification.permission === 'granted') {
    const statusMessages = {
      pending: { title: '📥 تم استلام طلبك بنجاح!', body: 'طلبك وصل المطعم وهو قيد المراجعة والتأكيد الآن.' },
      preparing: { title: '👨‍🍳 المطبخ يجهز طلبك الآن!', body: 'بدأ طهاة المطعم في تجهيز وطهي وجباتك الطازجة.' },
      out_for_delivery: { title: '🛵 الطلب في الطريق إليك!', body: 'الكابتن استلم الأوردر وهو في طريقه إليك الآن.' },
      delivered: { title: '✅ تم تسليم الطلب بالهناء والشفاء!', body: 'شكراً لطلبك من مطعمنا ونرجو لك وجبة شهية.' }
    };
    const info = statusMessages[status];
    if (info) {
      try {
        new Notification(info.title, { body: info.body, icon: './manifest.json' });
      } catch (e) {}
    }
  }
}

function updateTrackerStepper(status = 'pending') {
  const nodePending = document.getElementById('step-node-pending');
  const nodePrep = document.getElementById('step-node-preparing');
  const nodeDelivery = document.getElementById('step-node-out_for_delivery');
  const nodeDelivered = document.getElementById('step-node-delivered');

  const line1 = document.getElementById('step-line-1');
  const line2 = document.getElementById('step-line-2');
  const line3 = document.getElementById('step-line-3');

  // Reset classes
  [nodePending, nodePrep, nodeDelivery, nodeDelivered].forEach(n => {
    if (n) { n.classList.remove('active', 'completed'); }
  });
  [line1, line2, line3].forEach(l => {
    if (l) { l.classList.remove('active'); }
  });

  if (status === 'pending') {
    if (nodePending) nodePending.classList.add('active');
  } else if (status === 'preparing') {
    if (nodePending) { nodePending.classList.add('completed'); }
    if (line1) line1.classList.add('active');
    if (nodePrep) nodePrep.classList.add('active');
  } else if (status === 'out_for_delivery') {
    if (nodePending) nodePending.classList.add('completed');
    if (nodePrep) nodePrep.classList.add('completed');
    if (line1) line1.classList.add('active');
    if (line2) line2.classList.add('active');
    if (nodeDelivery) nodeDelivery.classList.add('active');
  } else if (status === 'delivered') {
    if (nodePending) nodePending.classList.add('completed');
    if (nodePrep) nodePrep.classList.add('completed');
    if (nodeDelivery) nodeDelivery.classList.add('completed');
    if (nodeDelivered) nodeDelivered.classList.add('completed', 'active');
    if (line1) line1.classList.add('active');
    if (line2) line2.classList.add('active');
    if (line3) line3.classList.add('active');
  }
}

function closeLiveOrderTracker() {
  if (elements.trackerModal) elements.trackerModal.classList.remove('open');
  if (elements.trackerModalBackdrop) elements.trackerModalBackdrop.classList.remove('open');

  const lastOrder = Store.getLastOrder();
  // If order is delivered or cancelled, dismissing/closing modal archives the tracking badge so header is clean!
  if (lastOrder && (lastOrder.status === 'delivered' || lastOrder.status === 'cancelled')) {
    lastOrder.archived = true;
    Store.saveLastOrder(lastOrder);
    if (backgroundOrderWatcherUnsub) {
      backgroundOrderWatcherUnsub();
      backgroundOrderWatcherUnsub = null;
    }
    renderLastOrderRecall();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
