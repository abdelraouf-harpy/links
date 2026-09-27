// ═══════════════════════════════════════════════════════════
// HarpyOrder — Admin Core Engine (State, Nav, Toast & Bootstrap)
// ═══════════════════════════════════════════════════════════

window.isAuthenticated = false;
window.currentTab = 'tab-products';

// ── Mobile Back-Button Navigation in Admin Dashboard ──────────
function pushAdminNavState(type) {
  try {
    history.pushState({ adminNav: type }, '');
  } catch(e) {}
}

window.addEventListener('popstate', () => {
  if (adminElements.productModal && adminElements.productModal.classList.contains('open')) {
    closeProductModal(false);
    return;
  }
  if (adminElements.storyModal && adminElements.storyModal.classList.contains('open')) {
    closeStoryModal(false);
    return;
  }
  const receiptModal = document.getElementById('receipt-lightbox');
  if (receiptModal && receiptModal.classList.contains('open')) {
    window.closeReceiptModal(false);
    return;
  }

  // Handle Tab Back Navigation from Hash
  const hash = (window.location.hash || '').replace('#', '').trim();
  if (hash && document.getElementById('tab-' + hash)) {
    window.switchTab('tab-' + hash, false);
  } else {
    window.switchTab('tab-products', false);
  }
});


const adminElements = {
  loginModal: document.getElementById('login-modal'),
  loginBackdrop: document.getElementById('login-modal-backdrop'),
  adminLoginForm: document.getElementById('admin-login-form'),
  adminEmailInput: document.getElementById('admin-email-input'),
  adminPasswordInput: document.getElementById('admin-password-input'),
  loginErrorMsg: document.getElementById('login-error-msg'),
  btnLogin: document.getElementById('btn-login'),
  btnAdminLogout: document.getElementById('btn-admin-logout'),

  adminStoreName: document.getElementById('admin-store-name'),
  tabBtns: document.querySelectorAll('.admin-tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),

  // Products Tab
  btnOpenAddProduct: document.getElementById('btn-open-add-product'),
  catalogContainer: document.getElementById('admin-catalog-container'),
  productModal: document.getElementById('product-modal'),
  productModalBackdrop: document.getElementById('product-modal-backdrop'),
  productModalTitle: document.getElementById('product-modal-title'),
  productForm: document.getElementById('product-form'),
  prodId: document.getElementById('prod-id'),
  prodName: document.getElementById('prod-name'),
  prodCategory: document.getElementById('prod-category'),
  prodPrice: document.getElementById('prod-price'),
  prodOriginalPrice: document.getElementById('prod-original-price'),
  prodPrepTime: document.getElementById('prod-preptime'),
  prodBadge: document.getElementById('prod-badge'),
  prodFeatured: document.getElementById('prod-featured'),
  prodVisible: document.getElementById('prod-visible'),
  prodDesc: document.getElementById('prod-desc'),
  prodImgUrl: document.getElementById('prod-img-url'),
  prodImgFile: document.getElementById('prod-img-file'),
  prodSizesList: document.getElementById('prod-sizes-list'),
  btnAddSizeRow: document.getElementById('btn-add-size-row'),
  prodAddonsList: document.getElementById('prod-addons-list'),
  btnAddAddonRow: document.getElementById('btn-add-addon-row'),
  btnCloseProductModal: document.getElementById('btn-close-product-modal'),
  btnCancelProduct: document.getElementById('btn-cancel-product'),

  // Kitchen & Active Orders Tab
  adminOrdersContainer: document.getElementById('admin-orders-container'),
  statActiveOrders: document.getElementById('stat-active-orders'),
  statPendingOrders: document.getElementById('stat-pending-orders'),
  statPreparingOrders: document.getElementById('stat-preparing-orders'),
  statDeliveryOrders: document.getElementById('stat-delivery-orders'),
  ordersBadgeCount: document.getElementById('orders-badge-count'),
  countFilterAll: document.getElementById('count-filter-all'),
  countFilterPending: document.getElementById('count-filter-pending'),
  countFilterPreparing: document.getElementById('count-filter-preparing'),
  countFilterDelivery: document.getElementById('count-filter-delivery'),

  // Invoices Archive Tab
  adminArchiveContainer: document.getElementById('admin-archive-container'),
  statArchivedOrders: document.getElementById('stat-archived-orders'),
  statArchivedRevenue: document.getElementById('stat-archived-revenue'),
  statCancelledOrders: document.getElementById('stat-cancelled-orders'),
  archiveBadgeCount: document.getElementById('archive-badge-count'),
  archiveSearchInput: document.getElementById('archive-search-input'),

  // Categories Tab
  newCatInput: document.getElementById('new-cat-input'),
  btnAddCat: document.getElementById('btn-add-cat'),
  categoriesListContainer: document.getElementById('categories-list-container'),

  // Stories Tab
  adminStoriesContainer: document.getElementById('admin-stories-container'),
  btnOpenAddStory: document.getElementById('btn-open-add-story'),
  storyModal: document.getElementById('story-modal'),
  storyModalBackdrop: document.getElementById('story-modal-backdrop'),
  storyModalTitle: document.getElementById('story-modal-title'),
  storyForm: document.getElementById('story-form'),
  storyId: document.getElementById('story-id'),
  storyTitleInput: document.getElementById('story-title-input'),
  storyTaglineInput: document.getElementById('story-tagline-input'),
  storyBadgeInput: document.getElementById('story-badge-input'),
  storyProductSelect: document.getElementById('story-product-select'),
  storyDescInput: document.getElementById('story-desc-input'),
  storyImgUrl: document.getElementById('story-img-url'),
  storyImgFile: document.getElementById('story-img-file'),
  btnCloseStoryModal: document.getElementById('btn-close-story-modal'),
  btnCancelStory: document.getElementById('btn-cancel-story'),

  // Backup & Restore Tab
  btnExportBackup: document.getElementById('btn-export-backup'),
  importFileInput: document.getElementById('import-file-input'),
  btnFactoryReset: document.getElementById('btn-factory-reset'),
  factoryResetPwdModal: document.getElementById('factory-reset-pwd-modal'),
  factoryResetPwdBackdrop: document.getElementById('factory-reset-pwd-backdrop'),
  factoryResetPasswordInput: document.getElementById('factory-reset-password-input'),
  factoryResetPwdErrorMsg: document.getElementById('factory-reset-pwd-error-msg'),
  btnConfirmFactoryResetPwd: document.getElementById('btn-confirm-factory-reset-pwd'),

  // Settings Tab
  settingsForm: document.getElementById('settings-form'),
  setPrinterPaperSize: document.getElementById('set-printer-paper-size'),
  setStoreName: document.getElementById('set-store-name'),
  setStoreTagline: document.getElementById('set-store-tagline'),
  setCurrency: document.getElementById('set-currency'),
  setWhatsapp: document.getElementById('set-whatsapp'),
  setWalletNumber: document.getElementById('set-wallet-number'),
  setWalletName: document.getElementById('set-wallet-name'),
  setLogoUrl: document.getElementById('set-logo-url'),
  themePresetsGrid: document.getElementById('theme-presets-grid'),
  setEnableWalletDiscount: document.getElementById('set-enable-wallet-discount'),
  setWalletDiscountType: document.getElementById('set-wallet-discount-type'),
  setWalletDiscountVal: document.getElementById('set-wallet-discount-val'),
  setEnableSpendTier: document.getElementById('set-enable-spend-tier'),
  setSpendMinAmount: document.getElementById('set-spend-min-amount'),
  setSpendDiscountType: document.getElementById('set-spend-discount-type'),
  setSpendDiscountVal: document.getElementById('set-spend-discount-val'),
  newPromoCode: document.getElementById('new-promo-code'),
  newPromoType: document.getElementById('new-promo-type'),
  newPromoVal: document.getElementById('new-promo-val'),
  btnAddPromoCode: document.getElementById('btn-add-promo-code'),
  promoCodesList: document.getElementById('promo-codes-list'),
  adminThemeToggleBtn: document.getElementById('theme-toggle-btn') || document.getElementById('admin-theme-toggle-btn'),
  // Operational settings
  setDeliveryTime: document.getElementById('set-delivery-time'),
  setDefaultDeliveryFee: document.getElementById('set-default-delivery-fee'),
  newZoneName: document.getElementById('new-zone-name'),
  newZoneKeywords: document.getElementById('new-zone-keywords'),
  newZoneFee: document.getElementById('new-zone-fee'),
  btnAddDeliveryZone: document.getElementById('btn-add-delivery-zone'),
  deliveryZonesList: document.getElementById('delivery-zones-list'),
  setShowAnnouncement: document.getElementById('set-show-announcement'),
  setAnnouncementText: document.getElementById('set-announcement-text'),
  btnToggleWakeLock: document.getElementById('btn-toggle-wake-lock'),
  setOrderingPaused: document.getElementById('set-ordering-paused'),
  setOrderingPausedMsg: document.getElementById('set-ordering-paused-msg')
};


// Expose adminElements globally so all modules can share cached DOM
window.adminElements = adminElements;

function initAdmin() {
  Store.initTheme();
  setupAdminThemeToggle();
  setupAuth();
  setupSubscriptionWatcher();
  setupRestaurantHub();
  setupTabNavigation();
  initKitchenWakeLock();
  setupProductManagement();
  setupCategoryManagement();
  setupStoriesManagement();
  setupBackupAndRestore();
  setupSettingsForm();
}

function updateAdminThemeToggleIcons() {
  const mode = Store.getThemeMode();
  const darkIcon = document.getElementById('theme-icon-dark');
  const lightIcon = document.getElementById('theme-icon-light');
  if (darkIcon && lightIcon) {
    if (mode === 'light') {
      // In light mode: Show Moon icon (clicking switches to dark mode)
      darkIcon.style.display = 'block';
      lightIcon.style.display = 'none';
    } else {
      // In dark mode: Show Sun icon (clicking switches to light mode)
      darkIcon.style.display = 'none';
      lightIcon.style.display = 'block';
    }
  }
}

let lastAdminThemeToggleTime = 0;
window.handleThemeToggle = function() {
  const now = Date.now();
  if (now - lastAdminThemeToggleTime < 350) return;
  lastAdminThemeToggleTime = now;

  const current = Store.getThemeMode();
  const next = current === 'light' ? 'dark' : 'light';
  Store.setThemeMode(next);
  updateAdminThemeToggleIcons();
};

function setupAdminThemeToggle() {
  updateAdminThemeToggleIcons();
}

// ── Navigation Tabs with State Persistence & Zero-Latency Routing ────
window.switchTab = function(targetTabId, updateHash = true) {
  if (!targetTabId) targetTabId = 'tab-products';
  if (!targetTabId.startsWith('tab-')) targetTabId = 'tab-' + targetTabId;

  const targetPane = document.getElementById(targetTabId);
  if (!targetPane) targetTabId = 'tab-products';

  currentTab = targetTabId;

  // 1. Update Tab Buttons
  adminElements.tabBtns.forEach(b => {
    if (b.dataset.tab === targetTabId) {
      b.classList.add('active');
      try {
        b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } catch(e) {}
    } else {
      b.classList.remove('active');
    }
  });

  // 2. Update Tab Panes
  adminElements.tabPanes.forEach(pane => {
    pane.style.display = pane.id === targetTabId ? 'block' : 'none';
  });

  // 3. Save Active Tab to Storage
  try {
    const slug = Store.getRestaurantSlug();
    localStorage.setItem(`harpy_${slug}_admin_active_tab`, targetTabId);
  } catch(e) {}

  // 4. Update URL Hash with History Navigation (Preserves pathname & query so <base href> never strips admin.html)
  if (updateHash) {
    const shortHash = targetTabId.replace('tab-', '');
    if (window.location.hash !== '#' + shortHash) {
      try {
        const url = new URL(window.location.href);
        url.hash = shortHash;
        history.pushState({ adminTab: targetTabId }, '', url.pathname + url.search + url.hash);
      } catch(e) {
        window.location.hash = shortHash;
      }
    }
  }

  // Toggle POS active state on body for specialized responsive layout
  document.body.classList.toggle('tab-pos-active', targetTabId === 'tab-pos');

  // 5. Instantly render the active tab's cached data
  if (targetTabId === 'tab-products') {
    renderCatalog();
  } else if (targetTabId === 'tab-pos') {
    initPOS();
  } else if (targetTabId === 'tab-orders') {
    renderOrdersList(Store.getOrders());
  } else if (targetTabId === 'tab-archive') {
    renderInvoicesArchive(Store.getOrders());
  } else if (targetTabId === 'tab-categories') {
    renderCategoriesList();
  } else if (targetTabId === 'tab-stories') {
    renderStoriesList();
  } else if (targetTabId === 'tab-settings') {
    loadSettingsIntoForm();
  }
};

function setupTabNavigation() {
  // Bind click event to tab buttons
  adminElements.tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.switchTab(btn.dataset.tab, true);
    });
  });

  // Listen for hash changes (e.g. browser back/forward buttons)
  window.addEventListener('hashchange', () => {
    const hash = (window.location.hash || '').replace('#', '').trim();
    if (hash && document.getElementById('tab-' + hash)) {
      window.switchTab('tab-' + hash, false);
    }
  });

  // Listen for popstate (e.g. browser history back/forward navigation)
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.adminTab && document.getElementById(e.state.adminTab)) {
      window.switchTab(e.state.adminTab, false);
    } else {
      const hash = (window.location.hash || '').replace('#', '').trim();
      if (hash && document.getElementById('tab-' + hash)) {
        window.switchTab('tab-' + hash, false);
      }
    }
  });

  // Determine initial tab from Hash, or LocalStorage, or Default
  const hash = (window.location.hash || '').replace('#', '').trim();
  const slug = Store.getRestaurantSlug();
  const savedTab = localStorage.getItem(`harpy_${slug}_admin_active_tab`);

  let initialTab = 'tab-orders';
  if (hash && document.getElementById('tab-' + hash)) {
    initialTab = 'tab-' + hash;
  } else if (savedTab && document.getElementById(savedTab)) {
    initialTab = savedTab;
  }

  // Switch to initial tab immediately
  window.switchTab(initialTab, false);

  // Synchronize URL hash with initialTab without stripping pathname or search params
  try {
    const shortHash = initialTab.replace('tab-', '');
    const url = new URL(window.location.href);
    if (url.hash !== '#' + shortHash) {
      url.hash = shortHash;
      history.replaceState({ adminTab: initialTab }, '', url.pathname + url.search + url.hash);
    }
  } catch(e) {}
}

// ── High-Efficiency Auto-Compressing Image Dropzone ─────────
function bindDeviceImageUploader({
  dropzoneId,
  fileInputId,
  promptId,
  previewWrapId,
  previewImgId,
  removeBtnId,
  hiddenUrlInputId,
  directUrlInputId
}) {
  const dropzone = document.getElementById(dropzoneId);
  const fileInput = document.getElementById(fileInputId);
  const prompt = document.getElementById(promptId);
  const previewWrap = document.getElementById(previewWrapId);
  const previewImg = document.getElementById(previewImgId);
  const removeBtn = document.getElementById(removeBtnId);
  const hiddenUrl = document.getElementById(hiddenUrlInputId);
  const directUrlInput = directUrlInputId ? document.getElementById(directUrlInputId) : null;

  if (!fileInput || !dropzone) return null;

  const origPromptHtml = prompt ? prompt.innerHTML : '';

  const showPreview = (src) => {
    if (previewImg && previewWrap && prompt) {
      previewImg.src = src;
      previewWrap.style.display = 'block';
      prompt.style.display = 'none';
      if (hiddenUrl) hiddenUrl.value = src;
      if (directUrlInput && (src.startsWith('http://') || src.startsWith('https://'))) {
        directUrlInput.value = src;
      }
    }
  };

  const clearPreview = () => {
    if (previewImg && previewWrap && prompt) {
      previewImg.src = '';
      previewWrap.style.display = 'none';
      prompt.style.display = 'flex';
      prompt.innerHTML = origPromptHtml;
      fileInput.value = '';
      if (hiddenUrl) hiddenUrl.value = '';
      if (directUrlInput) directUrlInput.value = '';
    }
  };

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (prompt) prompt.innerHTML = '<span style="font-size:12px; color:var(--primary); font-weight:800;">جاري معالجة وضغط الصورة... ⏳</span>';
    try {
      const compressed = await Store.uploadImage(file);
      if (compressed) {
        showPreview(compressed);
        if (directUrlInput && !compressed.startsWith('http')) directUrlInput.value = '';
      } else {
        clearPreview();
      }
    } catch (err) {
      console.warn('[Uploader] Error:', err);
      clearPreview();
    }
  });

  if (directUrlInput) {
    directUrlInput.addEventListener('input', (e) => {
      const val = (e.target.value || '').trim();
      if (val && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'))) {
        showPreview(val);
      } else if (!val) {
        clearPreview();
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearPreview();
    });
  }

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--primary)';
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '';
  });
  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (prompt) prompt.innerHTML = '<span style="font-size:12px; color:var(--primary); font-weight:800;">جاري معالجة وضغط الصورة... ⏳</span>';
      try {
        const compressed = await Store.uploadImage(file);
        if (compressed) {
          showPreview(compressed);
          if (directUrlInput && !compressed.startsWith('http')) directUrlInput.value = '';
        } else {
          clearPreview();
        }
      } catch (err) {
        console.warn('[Uploader] Error:', err);
        clearPreview();
      }
    }
  });

  return { showPreview, clearPreview };
}

function showToastNotification(message, type = 'success') {
  const existing = document.getElementById('harpy-admin-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'harpy-admin-toast';
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

// Global Dashboard Data Orchestrator
function loadAllDashboardData() {
  renderRestaurantHub();
  renderOrdersList(Store.getOrders());
  renderInvoicesArchive(Store.getOrders());
  renderCatalog();
  renderCategoriesList();
  renderStoriesList();
  if (typeof initPOS === 'function') initPOS();
  loadSettingsIntoForm();
  checkOnboardingSetup();

  const currentSettings = Store.getSettings();
  if (typeof window.updatePwaBranding === 'function') {
    window.updatePwaBranding(currentSettings);
  }
}
window.loadAllDashboardData = loadAllDashboardData;
window.initAdmin = initAdmin;
