
// ── Luxury Admin Side Drawer Controller ─────────────────────
window.openAdminDrawer = function() {
  if (typeof updateHeaderShiftCockpit === 'function') {
    try { updateHeaderShiftCockpit(); } catch(e) {}
  }
  if (typeof updateAdminBranchDrawerSwitcher === 'function') {
    try { updateAdminBranchDrawerSwitcher(); } catch(e) {}
  }
  const drawer = document.getElementById('admin-drawer');
  const backdrop = document.getElementById('admin-drawer-backdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.classList.add('admin-drawer-open');
};

window.closeAdminDrawer = function() {
  const drawer = document.getElementById('admin-drawer');
  const backdrop = document.getElementById('admin-drawer-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.classList.remove('admin-drawer-open');
};

window.toggleAdminDrawer = function() {
  const drawer = document.getElementById('admin-drawer');
  if (drawer && drawer.classList.contains('open')) {
    window.closeAdminDrawer();
  } else {
    if (typeof updateHeaderShiftCockpit === 'function') {
      try { updateHeaderShiftCockpit(); } catch(e) {}
    }
    window.openAdminDrawer();
  }
};

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
  btnAdminLogout: document.getElementById('btn-admin-drawer-logout') || document.getElementById('btn-admin-logout'),

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


// ═══════════════════════════════════════════════════════════
// LUXURY UI CONTROLLERS: SEGMENTED CONTROLS & OPTION PICKER
// Eliminates all primitive OS native select pickers
// ═══════════════════════════════════════════════════════════

let currentPickerOnSelect = null;
let currentPickerItems = [];

window.openOptionPickerSheet = function({ title = 'اختر', iconSvg = '', items = [], selectedValue = '', onSelect = null }) {
  const sheet = document.getElementById('custom-picker-sheet');
  const titleEl = document.getElementById('custom-picker-title-text');
  const iconWrap = document.getElementById('custom-picker-icon-wrap');
  const searchWrap = document.getElementById('custom-picker-search-wrap');
  const searchInput = document.getElementById('custom-picker-search-input');
  const listEl = document.getElementById('custom-picker-items-list');

  if (!sheet || !listEl) return;

  currentPickerOnSelect = onSelect;
  currentPickerItems = items || [];

  if (titleEl) titleEl.textContent = title;
  if (iconWrap) iconWrap.innerHTML = iconSvg || '';

  if (searchInput) {
    searchInput.value = '';
    if (searchWrap) searchWrap.style.display = currentPickerItems.length > 5 ? 'block' : 'none';
  }

  function renderList(filteredItems) {
    if (!filteredItems || filteredItems.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:28px 12px; color:var(--text-muted); font-size:13px; font-weight:700;">
          لا توجد عناصر مطابقة لبحثك
        </div>
      `;
      return;
    }

    listEl.innerHTML = filteredItems.map(item => {
      const isSelected = String(item.id) === String(selectedValue);
      return `
        <div class="custom-picker-item ${isSelected ? 'selected' : ''}" data-item-id="${Store.escapeHtml(item.id)}">
          <div class="item-meta">
            ${item.icon ? `<span style="display:inline-flex; align-items:center;">${item.icon}</span>` : ''}
            <div>
              <div style="font-weight:800; font-size:13.5px; color:${isSelected ? 'var(--primary)' : 'var(--text-main)'};">${Store.escapeHtml(item.label || item.name || '')}</div>
              ${item.sublabel ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${Store.escapeHtml(item.sublabel)}</div>` : ''}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            ${item.badge ? `<span class="item-badge">${Store.escapeHtml(item.badge)}</span>` : ''}
            ${isSelected ? `
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.custom-picker-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-item-id');
        const chosen = currentPickerItems.find(i => String(i.id) === String(id));
        if (typeof currentPickerOnSelect === 'function' && chosen) {
          currentPickerOnSelect(chosen);
        }
        window.closeOptionPickerSheet();
      });
    });
  }

  renderList(currentPickerItems);

  if (searchInput) {
    searchInput.oninput = (e) => {
      const q = (e.target.value || '').trim().toLowerCase();
      if (!q) {
        renderList(currentPickerItems);
      } else {
        const filtered = currentPickerItems.filter(i =>
          (i.label || i.name || '').toLowerCase().includes(q) ||
          (i.sublabel || '').toLowerCase().includes(q) ||
          (i.badge || '').toLowerCase().includes(q)
        );
        renderList(filtered);
      }
    };
  }

  sheet.classList.add('open');
  if (searchInput && currentPickerItems.length > 5) {
    setTimeout(() => searchInput.focus(), 150);
  }
};

window.closeOptionPickerSheet = function() {
  const sheet = document.getElementById('custom-picker-sheet');
  if (sheet) sheet.classList.remove('open');
  currentPickerOnSelect = null;
};

// Segmented Controls Controller
window.setupSegmentedControl = function(containerId, hiddenInputId, onValChange) {
  const container = document.getElementById(containerId);
  const hiddenInput = document.getElementById(hiddenInputId);
  if (!container || !hiddenInput) return;

  const btns = container.querySelectorAll('.segmented-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = btn.getAttribute('data-val');
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      hiddenInput.value = val;
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      if (typeof onValChange === 'function') onValChange(val);
    });
  });
};

window.setSegmentedValue = function(containerId, val) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const btns = container.querySelectorAll('.segmented-btn');
  btns.forEach(btn => {
    if (btn.getAttribute('data-val') === String(val)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
};

window.setupAllSegmentedControls = function() {
  // Printer paper size: 80mm vs 58mm
  setupSegmentedControl('seg-printer-paper-size', 'set-printer-paper-size', (val) => {
    document.documentElement.setAttribute('data-paper-size', val);
    document.body.setAttribute('data-paper-size', val);
  });

  // Wallet discount type: percent vs fixed
  setupSegmentedControl('seg-wallet-discount-type', 'set-wallet-discount-type');

  // Spend tier discount type: percent vs fixed
  setupSegmentedControl('seg-spend-discount-type', 'set-spend-discount-type');

  // Promo code discount type: percent vs fixed
  setupSegmentedControl('seg-new-promo-type', 'new-promo-type');
};

// Unit Pills Selector Controller (Raw Materials)
window.selectRawMaterialUnit = function(unit) {
  const targetUnit = unit || 'g';
  const hidden = document.getElementById('mat-unit');
  if (hidden) {
    hidden.value = targetUnit;
    hidden.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const container = document.getElementById('mat-unit-chips');
  if (container) {
    const btns = container.querySelectorAll('.unit-pill-btn');
    btns.forEach(b => {
      if (b.getAttribute('data-unit') === targetUnit) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }
};

// Expose adminElements globally so all modules can share cached DOM
window.adminElements = adminElements;

function initAdmin() {
  try { Store.initTheme(); } catch(e) { console.error("[initAdmin] initTheme error:", e); }
  try { setupAdminThemeToggle(); } catch(e) { console.error("[initAdmin] setupAdminThemeToggle error:", e); }
  try { setupTabNavigation(); } catch(e) { console.error("[initAdmin] setupTabNavigation error:", e); }
  try { setupAuth(); } catch(e) { console.error("[initAdmin] setupAuth error:", e); }
  try { setupSubscriptionWatcher(); } catch(e) { console.error("[initAdmin] setupSubscriptionWatcher error:", e); }
  try { setupRestaurantHub(); } catch(e) { console.error("[initAdmin] setupRestaurantHub error:", e); }
  try { initKitchenWakeLock(); } catch(e) { console.error("[initAdmin] initKitchenWakeLock error:", e); }
  try { setupProductManagement(); } catch(e) { console.error("[initAdmin] setupProductManagement error:", e); }
  try { setupCategoryManagement(); } catch(e) { console.error("[initAdmin] setupCategoryManagement error:", e); }
  try { if (typeof initInventoryManagement === 'function') initInventoryManagement(); } catch(e) { console.error("[initAdmin] initInventoryManagement error:", e); }
  try { setupStoriesManagement(); } catch(e) { console.error("[initAdmin] setupStoriesManagement error:", e); }
  try { setupBackupAndRestore(); } catch(e) { console.error("[initAdmin] setupBackupAndRestore error:", e); }
  try { setupSettingsForm(); } catch(e) { console.error("[initAdmin] setupSettingsForm error:", e); }
  try { setupAllSegmentedControls(); } catch(e) { console.error("[initAdmin] setupAllSegmentedControls error:", e); }
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

  // Instant DOM synchronization
  const root = document.documentElement;
  const body = document.body;
  root.setAttribute('data-theme', next);
  if (body) body.setAttribute('data-theme', next);

  const s = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};
  const nextPreset = (next === 'light') ? 'cream' : ((s.themePreset && s.themePreset !== 'cream') ? s.themePreset : 'charcoal');
  root.setAttribute('data-theme-preset', nextPreset);
  if (body) body.setAttribute('data-theme-preset', nextPreset);

  Store.setThemeMode(next);
  updateAdminThemeToggleIcons();
};

function setupAdminThemeToggle() {
  updateAdminThemeToggleIcons();
}

// ── Navigation Tabs with State Persistence & Zero-Latency Routing ────
window.switchTab = function(targetTabId, updateHash = true) {
  const TAB_TITLES = {
    'tab-orders': 'طلبات المطبخ والتجهيز',
    'tab-pos': 'كاشير الصالة والسفري (POS)',
    'tab-archive': 'أرشيف الفواتير والورديات',
    'tab-products': 'إدارة المنيو والأصناف',
    'tab-inventory': 'المخزون والمواد الخام',
    'tab-stories': 'قصص وعروض اليوم',
    'tab-settings': 'إعدادات المكان',
    'tab-backup': 'النسخ الاحتياطي والأمان'
  };
  const titleText = document.getElementById('active-tab-title-text');
  if (titleText && TAB_TITLES[targetTabId]) {
    titleText.textContent = TAB_TITLES[targetTabId];
  }
  const headerSectionTitle = document.getElementById('admin-header-section-title');
  if (headerSectionTitle && TAB_TITLES[targetTabId]) {
    headerSectionTitle.textContent = TAB_TITLES[targetTabId];
  }
  if (typeof window.closeAdminDrawer === 'function') {
    window.closeAdminDrawer();
  }
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
  try {
    if (targetTabId === 'tab-products') {
      if (typeof renderCatalog === 'function') renderCatalog();
    } else if (targetTabId === 'tab-pos') {
      if (typeof initPOS === 'function') initPOS();
    } else if (targetTabId === 'tab-orders') {
      if (typeof renderOrdersList === 'function') renderOrdersList(Store.getOrders());
    } else if (targetTabId === 'tab-archive') {
      if (typeof renderInvoicesArchive === 'function') renderInvoicesArchive(Store.getOrders());
    } else if (targetTabId === 'tab-categories') {
      if (typeof renderCategoriesList === 'function') renderCategoriesList();
    } else if (targetTabId === 'tab-inventory') {
      if (typeof renderInventory === 'function') renderInventory();
    } else if (targetTabId === 'tab-stories') {
      if (typeof renderStoriesList === 'function') renderStoriesList();
    } else if (targetTabId === 'tab-settings') {
      if (typeof loadSettingsIntoForm === 'function') loadSettingsIntoForm();
      if (typeof updatePushNotifUI === 'function') updatePushNotifUI();
    }
    if (typeof updatePushNotifUI === 'function') updatePushNotifUI();
  } catch(err) {
    console.error("[switchTab] Error rendering " + targetTabId + ":", err);
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

  // Determine initial tab from URL param, Hash, or LocalStorage, or Default
  const urlParams = new URLSearchParams(window.location.search);
  const targetOrderId = urlParams.get('orderId');
  const hash = (window.location.hash || '').replace('#', '').trim();
  const slug = Store.getRestaurantSlug();
  const savedTab = localStorage.getItem(`harpy_${slug}_admin_active_tab`);

  let initialTab = targetOrderId ? 'tab-orders' : 'tab-orders';
  if (targetOrderId) {
    initialTab = 'tab-orders';
  } else if (hash && document.getElementById('tab-' + hash)) {
    initialTab = 'tab-' + hash;
  } else if (savedTab && document.getElementById(savedTab)) {
    initialTab = savedTab;
  }

  // Switch to initial tab immediately
  window.switchTab(initialTab, false);

  // If opened directly from an order notification, automatically open that order's modal
  if (targetOrderId) {
    setTimeout(() => {
      if (typeof window.openOrderInvoiceModal === 'function') {
        window.openOrderInvoiceModal(targetOrderId);
      }
    }, 500);
  }

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
    if (prompt) prompt.innerHTML = '<span style="font-size:12px; color:var(--primary); font-weight:800;">جاري معالجة وضغط الصورة</span>';
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
      if (prompt) prompt.innerHTML = '<span style="font-size:12px; color:var(--primary); font-weight:800;">جاري معالجة وضغط الصورة</span>';
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
  try { if (typeof renderRestaurantHub === 'function') renderRestaurantHub(); } catch(e) { console.error("[loadAllDashboardData] renderRestaurantHub:", e); }
  try { if (typeof renderOrdersList === 'function') renderOrdersList(Store.getOrders()); } catch(e) { console.error("[loadAllDashboardData] renderOrdersList:", e); }
  try { if (typeof renderInvoicesArchive === 'function') renderInvoicesArchive(Store.getOrders()); } catch(e) { console.error("[loadAllDashboardData] renderInvoicesArchive:", e); }
  try { if (typeof renderCatalog === 'function') renderCatalog(); } catch(e) { console.error("[loadAllDashboardData] renderCatalog:", e); }
  try { if (typeof renderCategoriesList === 'function') renderCategoriesList(); } catch(e) { console.error("[loadAllDashboardData] renderCategoriesList:", e); }
  try { if (typeof renderInventory === 'function') renderInventory(); } catch(e) { console.error("[loadAllDashboardData] renderInventory:", e); }
  try { if (typeof renderStoriesList === 'function') renderStoriesList(); } catch(e) { console.error("[loadAllDashboardData] renderStoriesList:", e); }
  try { if (typeof initPOS === 'function') initPOS(); } catch(e) { console.error("[loadAllDashboardData] initPOS:", e); }
  try { if (typeof loadSettingsIntoForm === 'function') loadSettingsIntoForm(); } catch(e) { console.error("[loadAllDashboardData] loadSettingsIntoForm:", e); }
  try { if (typeof checkOnboardingSetup === 'function') checkOnboardingSetup(); } catch(e) { console.error("[loadAllDashboardData] checkOnboardingSetup:", e); }
  try { if (typeof updateAdminBranchDrawerSwitcher === 'function') updateAdminBranchDrawerSwitcher(); } catch(e) {}

  try {
    const currentSettings = Store.getSettings();
    if (typeof window.updatePwaBranding === 'function') {
      window.updatePwaBranding(currentSettings);
    }
  } catch(e) {}
}
window.loadAllDashboardData = loadAllDashboardData;
window.initAdmin = initAdmin;


  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && typeof window.closeAdminDrawer === 'function') {
      window.closeAdminDrawer();
    }
  });


window.switchAdminBranch = function(branchSlug) {
  if (!branchSlug) return;
  const currentSlug = (typeof Store !== 'undefined' && Store.getRestaurantSlug) ? Store.getRestaurantSlug() : '';
  if (currentSlug === branchSlug) {
    if (typeof closeAdminDrawer === 'function') closeAdminDrawer();
    return;
  }

  // 1. Snapshot current branch network before navigating
  const branches = (typeof Store !== 'undefined' && Store.getBranches) ? Store.getBranches() : [];

  // Guarantee both current slug and target slug are inside the network
  if (currentSlug && !branches.some(b => b.slug === currentSlug)) {
    branches.unshift({
      id: currentSlug,
      slug: currentSlug,
      name: (Store.getSettings()?.storeName) || currentSlug,
      isMain: true
    });
  }
  if (!branches.some(b => b.slug === branchSlug)) {
    branches.push({
      id: branchSlug,
      slug: branchSlug,
      name: branchSlug
    });
  }

  // 2. Persist network universally across localStorage & sessionStorage
  try {
    const netJson = JSON.stringify(branches);
    sessionStorage.setItem('harpy_verified_branches', netJson);
    localStorage.setItem(`harpy_branches_${branchSlug}`, netJson);
    if (currentSlug) localStorage.setItem(`harpy_branches_${currentSlug}`, netJson);

    // Inject branches directly into target branch's settings cache in localStorage
    const targetKey = `harpy_${branchSlug}_settings`;
    const targetRaw = localStorage.getItem(targetKey);
    const targetSettings = targetRaw ? JSON.parse(targetRaw) : {};
    targetSettings.branches = branches;
    localStorage.setItem(targetKey, JSON.stringify(targetSettings));

    // Also update current branch's cached settings
    if (currentSlug) {
      const curKey = `harpy_${currentSlug}_settings`;
      const curRaw = localStorage.getItem(curKey);
      const curSettings = curRaw ? JSON.parse(curRaw) : {};
      curSettings.branches = branches;
      localStorage.setItem(curKey, JSON.stringify(curSettings));
    }

    // Propagate admin session credentials to target branch so it opens unlocked
    const curAuth = localStorage.getItem(`harpy_admin_auth_${currentSlug}`) || sessionStorage.getItem(`harpy_auth_${currentSlug}`);
    if (curAuth) {
      const sess = JSON.parse(curAuth);
      sess.slug = branchSlug;
      localStorage.setItem(`harpy_admin_auth_${branchSlug}`, JSON.stringify(sess));
      sessionStorage.setItem(`harpy_auth_${branchSlug}`, JSON.stringify(sess));
    }
    localStorage.setItem('harpy_admin_active_slug', branchSlug);
    sessionStorage.setItem('harpy_branch_authorized_switch', branchSlug);
  } catch(e) {}

  // 3. Background cloud sync to Firebase RTDB for target and current branch
  try {
    if (typeof db !== 'undefined' && db && Array.isArray(branches)) {
      db.ref(`restaurants/${branchSlug}/settings/branches`).set(branches).catch(() => {});
      if (currentSlug) {
        db.ref(`restaurants/${currentSlug}/settings/branches`).set(branches).catch(() => {});
      }
    }
  } catch(e) {}

  if (typeof showToastNotification === 'function') {
    showToastNotification(`جاري الانتقال إلى لوحة تحكم ${branchSlug}...`, "info");
  }

  // 4. Clean navigation to target admin URL using URL object
  setTimeout(() => {
    try {
      const targetUrl = new URL(window.location.href);
      targetUrl.searchParams.set('m', branchSlug);
      targetUrl.searchParams.delete('restaurant');
      targetUrl.searchParams.delete('store');
      targetUrl.searchParams.delete('slug');
      window.location.href = targetUrl.toString();
    } catch(e) {
      window.location.href = `?m=${encodeURIComponent(branchSlug)}`;
    }
  }, 250);
};

window.updateAdminBranchDrawerSwitcher = function() {
  const widget = document.getElementById('drawer-branches-widget');
  const container = document.getElementById('drawer-branches-list');
  const countBadge = document.getElementById('drawer-branches-count');
  if (!widget || !container) return;

  const branches = (typeof Store !== 'undefined' && Store.getBranches) ? Store.getBranches() : [];
  const currentSlug = (typeof Store !== 'undefined' && Store.getRestaurantSlug) ? Store.getRestaurantSlug() : '';

  // Requirement: Do NOT show the branches widget if user has only 1 restaurant / no other branches!
  if (!branches || branches.length <= 1) {
    widget.style.display = 'none';
    return;
  }

  // 2+ restaurants exist: Show the open list!
  widget.style.display = 'block';

  if (countBadge) {
    countBadge.textContent = `${branches.length} فروع متصلة`;
  }

  const safeEscape = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  };

  let html = '';
  branches.forEach(b => {
    const isCurrent = (b.slug === currentSlug);
    const bName = safeEscape(b.name || (b.slug === 'demo' ? 'الفرع التجريبي (ديمو)' : b.slug));

    if (isCurrent) {
      html += `
        <div style="background:var(--primary-subtle); border:1px solid var(--primary); border-radius:8px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:7px; height:7px; border-radius:50%; background:var(--primary); display:inline-block; flex-shrink:0;"></span>
            <span style="font-size:12.5px; font-weight:900; color:var(--text-main);">${bName}</span>
          </div>
          <span style="font-size:10px; color:var(--primary); font-weight:800; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px;">✓ أنت هنا</span>
        </div>
      `;
    } else {
      html += `
        <button type="button" class="btn btn-ghost" onclick="switchAdminBranch('${b.slug}')" style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center; text-align:right; font-size:12px; font-weight:800; color:var(--text-body); background:var(--surface); cursor:pointer; transition:all 0.2s;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:7px; height:7px; border-radius:50%; background:var(--text-muted); opacity:0.5; display:inline-block; flex-shrink:0;"></span>
            <span>${bName}</span>
          </div>
          <span style="font-size:11px; color:var(--primary); font-weight:700;">انتقال لهذا الفرع ←</span>
        </button>
      `;
    }
  });

  container.innerHTML = html;
};

window.navigateToBranchSettings = function() {
  if (typeof closeAdminDrawer === 'function') closeAdminDrawer();
  const tabBtn = document.querySelector('[data-tab="tab-settings"]');
  if (tabBtn) tabBtn.click();
  setTimeout(() => {
    const card = document.getElementById('card-branches-management');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      card.style.outline = '2px solid var(--primary)';
      setTimeout(() => { card.style.outline = 'none'; }, 2000);
    }
  }, 250);
};

// Automatic realtime sync listener for drawer branch widget
window.addEventListener('store_settings_updated', () => {
  if (typeof window.updateAdminBranchDrawerSwitcher === 'function') {
    try { window.updateAdminBranchDrawerSwitcher(); } catch(e) {}
  }
});

