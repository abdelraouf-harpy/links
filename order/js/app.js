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
  btnSendWhatsApp: document.getElementById('btn-send-whatsapp'),

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

function initApp() {
  Store.initTheme();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  updateThemeToggleIcons();
  updateSoundToggleIcon();
  initViewMode();
  renderStoreInfo();
  renderStories();
  renderAnnouncement();
  renderLastOrderRecall();
  renderDiscoveryRibbon();
  renderCategories();
  renderProducts();
  updateLedgerUI();
  setupEventListeners();
  initCustomizerEvents();
}

function updateThemeToggleIcons() {
  const currentMode = Store.getThemeMode();
  if (elements.themeIconDark && elements.themeIconLight) {
    if (currentMode === 'light') {
      elements.themeIconDark.style.display = 'none';
      elements.themeIconLight.style.display = 'inline-block';
    } else {
      elements.themeIconDark.style.display = 'inline-block';
      elements.themeIconLight.style.display = 'none';
    }
  }
}

function handleThemeToggle() {
  const currentMode = Store.getThemeMode();
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  Store.setThemeMode(newMode);
  updateThemeToggleIcons();
}

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
    if (settings.showAnnouncement && settings.announcementText) {
      elements.announcementBar.style.display = 'flex';
      if (elements.announcementText) elements.announcementText.textContent = settings.announcementText;
      if (elements.deliveryTimeBadge) elements.deliveryTimeBadge.textContent = `⏱️ ${settings.deliveryTime || '30-45 دقيقة'}`;
    } else {
      elements.announcementBar.style.display = 'none';
    }
  }
}

function renderLastOrderRecall() {
  const lastOrder = Store.getLastOrder();
  if (elements.lastOrderBanner) {
    if (lastOrder && lastOrder.items && lastOrder.items.length > 0) {
      elements.lastOrderBanner.style.display = 'flex';
      if (elements.lastOrderSummary) {
        const itemNames = lastOrder.items.map(i => `${i.qty}x ${i.name}`).join('، ');
        elements.lastOrderSummary.textContent = `طلبك السابق: ${itemNames}`;
      }
    } else {
      elements.lastOrderBanner.style.display = 'none';
    }
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
};

function renderCategories() {
  if (!elements.categoriesContainer) return;
  const categories = Store.getCategories();

  let html = `
    <button class="cat-pill ${activeCategoryFilter === 'all' && activeDiscoveryFilter === 'all' ? 'active' : ''}" onclick="handleCategoryFilter('all')">
      كل القائمة
    </button>
  `;

  html += categories.map(cat => `
    <button class="cat-pill ${activeCategoryFilter === cat ? 'active' : ''}" onclick="handleCategoryFilter('${cat}')">
      ${cat}
    </button>
  `).join('');

  elements.categoriesContainer.innerHTML = html;
}

window.handleCategoryFilter = function(cat) {
  activeCategoryFilter = cat;
  activeDiscoveryFilter = 'all';
  renderCategories();
  renderDiscoveryRibbon();
  renderProducts();
  SoundFX.playPop();
};

function renderProducts() {
  if (!elements.productsContainer) return;

  const allProds = Store.getProducts().filter(p => p.visible !== false);
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";
  const favorites = Store.getFavorites();
  const searchQuery = (elements.searchInput && elements.searchInput.value || '').trim().toLowerCase();

  let prods = allProds;

  if (activeDiscoveryFilter === 'fav') {
    prods = prods.filter(p => favorites.includes(p.id));
  } else if (activeCategoryFilter !== 'all') {
    prods = prods.filter(p => p.category === activeCategoryFilter);
  }

  if (searchQuery) {
    prods = prods.filter(p => 
      p.name.toLowerCase().includes(searchQuery) ||
      (p.desc && p.desc.toLowerCase().includes(searchQuery)) ||
      (p.category && p.category.toLowerCase().includes(searchQuery)) ||
      (p.badge && p.badge.toLowerCase().includes(searchQuery))
    );
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

  if (prods.length === 0) {
    elements.productsContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg class="empty-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <div class="empty-title">لا توجد أصناف مطابقة</div>
        <p style="font-size:12px; color:var(--text-muted);">جرب البحث بكلمة أخرى أو تصفح باقي الأقسام</p>
      </div>
    `;
    return;
  }

  elements.productsContainer.innerHTML = prods.map(p => renderProductCard(p, currency)).join('');
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
        <img src="${p.image}" class="hero-product-img" alt="${p.name}" loading="lazy">
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

function renderProductCard(p, currency) {
  const isFav = Store.isFavorite(p.id);
  const cart = Store.getCart();
  const cartItem = cart.find(i => (i.productId === p.id || i.id === p.id) && !i.selectedSize && (!i.selectedAddons || i.selectedAddons.length === 0));
  const qty = cartItem ? cartItem.qty : 0;
  const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);

  return `
    <div class="food-item-card" data-product-id="${p.id}">
      <div class="food-item-media" onclick="openQuickPreview('${p.id}')">
        <img src="${p.image}" class="food-item-img" alt="${p.name}" loading="lazy">
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
  renderProducts();
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
  const suggestions = prods.filter(p => !cartIds.includes(p.id) && (
    (p.category || '').includes('مقبلات') || 
    (p.category || '').includes('مشروبات') || 
    p.price < 70
  )).slice(0, 4);

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

      if (!name) {
        alert("يرجى كتابة الاسم");
        elements.custName.focus();
        return;
      }
      if (!phone) {
        alert("يرجى كتابة رقم الهاتف");
        elements.custPhone.focus();
        return;
      }
      if (!address) {
        alert("يرجى كتابة عنوان التوصيل بالتفصيل (المنطقة، الشارع، العمارة، الشقة)");
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
        alert("يرجى كتابة كود الخصم");
        return;
      }
      const settings = Store.getSettings();
      const validPromo = (settings.promoCodes || []).find(p => p.code.toUpperCase() === code);
      if (validPromo) {
        Store.setAppliedCoupon(validPromo);
        elements.promoCodeInput.value = '';
        SoundFX.playChime();
        updateLedgerUI();
      } else {
        alert("كود الخصم غير صحيح أو منتهي");
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
      elements.btnSendWhatsApp.disabled = true;

      try {
        uploadedReceiptUrl = await Store.uploadImage(file);
        if (elements.receiptStatus) {
          elements.receiptStatus.textContent = "تم تجهيز الإيصال بنجاح ✓";
          elements.receiptStatus.className = "upload-status-chip success";
        }
        SoundFX.playChime();
      } catch (err) {
        if (elements.receiptStatus) {
          elements.receiptStatus.textContent = "سيتم إرسال الطلب، ويمكنك إرفاق الصورة بالواتساب";
          elements.receiptStatus.className = "upload-status-chip";
        }
      } finally {
        elements.btnSendWhatsApp.disabled = false;
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

  if (elements.btnSendWhatsApp) {
    elements.btnSendWhatsApp.addEventListener('click', handleWhatsAppOrder);
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

// ── WhatsApp Order & Digital Boarding Pass Ticket ──────────
function handleWhatsAppOrder() {
  const cart = Store.getCart();
  if (cart.length === 0) {
    alert("السلة فارغة، أضف بعض المنتجات أولاً");
    return;
  }

  const name = (elements.custName.value || '').trim();
  const phone = (elements.custPhone.value || '').trim();
  const address = (elements.custAddress.value || '').trim();
  const notes = (elements.custNotes.value || '').trim();

  if (!name || !phone || !address) {
    alert("يرجى استكمال بيانات التوصيل");
    goToCheckoutStep(2);
    return;
  }

  if (selectedPaymentMethod === 'wallet' && !uploadedReceiptUrl) {
    const confirmSend = confirm("لم تقم بإرفاق سكرين التحويل. هل تود فتح الواتساب وإرسال السكرين مباشرة للمطعم؟");
    if (!confirmSend) return;
  }

  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

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
  let walletDiscountAmount = 0;
  if (isWallet && settings.enableWalletDiscount !== false && subtotalAfterBase > 0) {
    const isPercent = settings.walletDiscountType !== 'fixed';
    const val = settings.walletDiscountValue !== undefined ? settings.walletDiscountValue : 10;
    walletDiscountAmount = isPercent ? (subtotalAfterBase * (val / 100)) : val;
  }

  const totalDiscounts = spendTierDiscountAmount + couponDiscountAmount + walletDiscountAmount;
  const finalTotal = Math.max(0, subtotal - totalDiscounts);
  const orderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  Store.saveLastOrder({
    orderId,
    items: cart,
    customer: { name, phone, address, notes },
    finalTotal,
    timestamp: Date.now()
  });

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
  if (notes) {
    message += `📝 *ملاحظات:* ${notes}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `🛒 *تفاصيل الأصناف والخيارات:*\n${itemsText}\n`;
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  
  if (totalDiscounts > 0) {
    message += `💵 *إجمالي الأصناف:* ${subtotal.toFixed(2)} ${currency}\n`;
    if (spendTierDiscountAmount > 0) {
      message += `🎁 *خصم طلب مميز (> ${settings.spendTierMinAmount} ${currency}):* -${spendTierDiscountAmount.toFixed(2)} ${currency}\n`;
    }
    if (couponDiscountAmount > 0 && appliedCoupon) {
      message += `🏷️ *كوبون خصم (${appliedCoupon.code}):* -${couponDiscountAmount.toFixed(2)} ${currency}\n`;
    }
    if (walletDiscountAmount > 0) {
      message += `⚡ *خصم الدفع الإلكتروني:* -${walletDiscountAmount.toFixed(2)} ${currency}\n`;
    }
    message += `💰 *المبلغ النهائي المطلوب:* ${finalTotal.toFixed(2)} ${currency}\n`;
  } else {
    message += `💰 *المبلغ المطلوب:* ${finalTotal.toFixed(2)} ${currency}\n`;
  }

  message += `💳 *طريقة الدفع:* ${paymentText}\n`;

  if (isWallet && uploadedReceiptUrl) {
    message += `📸 *رابط سكرين التحويل:* ${uploadedReceiptUrl}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `تم إرسال الطلب بنجاح.`;

  const cleanWhatsApp = (settings.whatsappNumber || '').replace(/\D/g, '');
  const encodedUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`;

  SoundFX.playCash();
  window.open(encodedUrl, '_blank');

  Store.clearCart();
  closeCartDrawer();
  goToCheckoutStep(1);
  updateLedgerUI();
  renderProducts();
  renderLastOrderRecall();

  elements.custName.value = '';
  elements.custPhone.value = '';
  elements.custAddress.value = '';
  elements.custNotes.value = '';
  if (elements.receiptPreview) elements.receiptPreview.style.display = 'none';
  if (elements.receiptStatus) elements.receiptStatus.style.display = 'none';
  uploadedReceiptUrl = null;
}

document.addEventListener('DOMContentLoaded', initApp);
