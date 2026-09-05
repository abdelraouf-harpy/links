// ═══════════════════════════════════════════════════════════
// HarpyOrder — Admin Dashboard Controller (Production Grade)
// ═══════════════════════════════════════════════════════════

let isAuthenticated = false;
let currentTab = 'tab-products';
let currentEditingProductId = null;
let currentEditingStoryId = null;

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
  prodDesc: document.getElementById('prod-desc'),
  prodImgUrl: document.getElementById('prod-img-url'),
  prodImgFile: document.getElementById('prod-img-file'),
  prodImgStatus: document.getElementById('prod-img-status'),
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

  // Settings Tab
  settingsForm: document.getElementById('settings-form'),
  setStoreName: document.getElementById('set-store-name'),
  setStoreTagline: document.getElementById('set-store-tagline'),
  setCurrency: document.getElementById('set-currency'),
  setWhatsapp: document.getElementById('set-whatsapp'),
  setWalletNumber: document.getElementById('set-wallet-number'),
  setWalletName: document.getElementById('set-wallet-name'),
  setLogoUrl: document.getElementById('set-logo-url'),
  setImgbbKey: document.getElementById('set-imgbb-key'),
  themePresetsGrid: document.getElementById('theme-presets-grid'),
  pickerBg: document.getElementById('picker-bg'),
  pickerSurface: document.getElementById('picker-surface'),
  pickerPrimary: document.getElementById('picker-primary'),
  pickerText: document.getElementById('picker-text'),
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
  adminThemeToggleBtn: document.getElementById('admin-theme-toggle-btn'),
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

// ── Multi-Tenant Auth Gate with Safe Subscriptions ─────────
function setupAuth() {
  const slug = Store.getRestaurantSlug();
  let syncUnsubscribe = null;
  let ordersUnsubscribe = null;

  const unlockDashboard = async () => {
    isAuthenticated = true;
    document.documentElement.classList.remove('admin-locked');
    document.documentElement.classList.add('admin-unlocked');
    if (adminElements.loginModal) adminElements.loginModal.classList.remove('open');
    if (adminElements.loginBackdrop) adminElements.loginBackdrop.classList.remove('open');
    if (adminElements.btnAdminLogout) adminElements.btnAdminLogout.style.display = 'inline-flex';
    
    // Fast-resolve preloaded cloud data before rendering to eliminate flash on refresh
    if (window.__harpyPreloadPromise) {
      try {
        const preloadData = await Promise.race([
          window.__harpyPreloadPromise,
          new Promise(r => setTimeout(() => r(null), 350))
        ]);
        if (preloadData && typeof preloadData === 'object') {
          Store.applySnapshotData(preloadData);
        }
      } catch(e) {}
    }

    loadAllDashboardData();

    // Dismiss native splash shield smoothly with instant complete reveal
    const splash = document.getElementById('admin-splash-shield');
    if (splash) {
      requestAnimationFrame(() => {
        splash.classList.add('fade-out');
        setTimeout(() => { try { splash.remove(); } catch(e) {} }, 240);
      });
    }

    // Clean up previous listeners
    if (typeof syncUnsubscribe === 'function') syncUnsubscribe();
    if (typeof ordersUnsubscribe === 'function') ordersUnsubscribe();

    // Subscribe to real-time cloud changes with stale-snapshot protection
    syncUnsubscribe = Store.syncFromCloud(slug, (status) => {
      if (status && status.hasData && !Store.saveLocks.settings && !Store.saveLocks.products) {
        renderCatalog();
        renderCategoriesList();
        renderStoriesList();
        loadSettingsIntoForm();
      }
    });

    // Subscribe to real-time incoming orders
    ordersUnsubscribe = Store.syncOrdersFromCloud(slug, (orders) => {
      renderOrdersList(orders);
      renderInvoicesArchive(orders);
    });

    listenToSessionRevocation();
  };

  const listenToSessionRevocation = () => {
    if (typeof db === 'undefined' || !db) return;
    const slug = Store.getRestaurantSlug();
    const localAuth = Store.safeGetItem(`harpy_admin_auth_${slug}`);
    if (!localAuth) return;
    let session = null;
    try { session = JSON.parse(localAuth); } catch(e) { return; }
    if (!session || !session.sessionVersion) return;

    db.ref(`restaurants/${slug}/meta/sessionVersion`).on('value', (snap) => {
      const liveVersion = snap.val();
      if (liveVersion && session.sessionVersion && liveVersion > session.sessionVersion) {
        db.ref(`restaurants/${slug}/meta/sessionVersion`).off();
        showToastNotification("تم تغيير كلمة مرور هذا المطعم وتم إنهاء جلستك من كافة الأجهزة.", "error");
        setTimeout(async () => {
          await Store.logoutAdmin();
          window.location.reload();
        }, 1200);
      }
    });
  };

  const lockDashboard = () => {
    isAuthenticated = false;
    document.documentElement.classList.remove('admin-unlocked');
    document.documentElement.classList.add('admin-locked');
    const splash = document.getElementById('admin-splash-shield');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => { try { splash.remove(); } catch(e) {} }, 150);
    }
    if (typeof syncUnsubscribe === 'function') syncUnsubscribe();
    if (typeof ordersUnsubscribe === 'function') ordersUnsubscribe();
    if (adminElements.loginModal) adminElements.loginModal.classList.add('open');
    if (adminElements.loginBackdrop) adminElements.loginBackdrop.classList.add('open');
    if (adminElements.btnAdminLogout) adminElements.btnAdminLogout.style.display = 'none';

    // Populate restaurant identity in login modal
    const modalTitle = document.getElementById('login-modal-restaurant-name');
    const modalSub = document.getElementById('login-modal-subtitle');
    const storeSettings = Store.getSettings ? Store.getSettings(slug) : null;
    const storeName = (storeSettings && storeSettings.name) ? storeSettings.name : (slug === 'saj' ? 'مطعم صاج' : slug);
    if (modalTitle) modalTitle.textContent = `إدارة: ${storeName}`;
    if (modalSub) modalSub.textContent = 'أدخل كلمة مرور الإدارة للدخول المباشر إلى لوحة التحكم';
    if (adminElements.adminEmailInput && !adminElements.adminEmailInput.value) {
      adminElements.adminEmailInput.value = slug;
    }
  };

  // Check URL for direct login query params (?p=... or ?pass=...)
  const checkUrlAutoAuth = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pass = urlParams.get('p') || urlParams.get('pass') || urlParams.get('password');
    if (pass) {
      try {
        await Store.loginAdmin(slug, pass);
        unlockDashboard();
        return true;
      } catch(e) {}
    }
    return false;
  };

  // Check active session on load
  if (Store.isAdminAuthenticated(slug)) {
    unlockDashboard();
  } else {
    checkUrlAutoAuth().then(autoSuccess => {
      if (!autoSuccess && !isAuthenticated) {
        lockDashboard();
      }
    });
  }

  // Listen to Firebase Auth state
  Store.onAuthStateChanged(async (user) => {
    if (user) {
      const isOwner = await Store.verifyTenantOwnership(slug, user.uid);
      if (isOwner) {
        if (!isAuthenticated) {
          unlockDashboard();
        }
      } else if (!Store.isAdminAuthenticated(slug)) {
        if (adminElements.loginErrorMsg) {
          adminElements.loginErrorMsg.textContent = "عفواً، هذا الحساب ليس لديه صلاحية إدارة هذا المطعم.";
          adminElements.loginErrorMsg.style.display = 'block';
        }
        await Store.logoutAdmin();
      }
    }
  });

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    const identifier = (adminElements.adminEmailInput?.value || '').trim();
    const password = (adminElements.adminPasswordInput?.value || '').trim();

    if (!password) {
      if (adminElements.loginErrorMsg) {
        adminElements.loginErrorMsg.textContent = "يرجى إدخال كلمة مرور الإدارة";
        adminElements.loginErrorMsg.style.display = 'block';
      }
      return;
    }

    if (adminElements.btnLogin) {
      adminElements.btnLogin.disabled = true;
      adminElements.btnLogin.textContent = "...جاري التحقق والدخول";
    }
    if (adminElements.loginErrorMsg) {
      adminElements.loginErrorMsg.style.display = 'none';
    }

    try {
      await Store.loginAdmin(identifier || slug, password);
      unlockDashboard();
    } catch (err) {
      console.warn("[Admin] Login failed:", err);
      let msg = "كلمة المرور غير صحيحة لهذا المطعم. يرجى التأكد والمحاولة مجدداً.";
      if (err.code === 'auth/too-many-requests') {
        msg = "تم تجاوز عدد المحاولات المسموح به. يرجى المحاولة لاحقاً.";
      }
      if (adminElements.loginErrorMsg) {
        adminElements.loginErrorMsg.textContent = msg;
        adminElements.loginErrorMsg.style.display = 'block';
      }
    } finally {
      if (adminElements.btnLogin) {
        adminElements.btnLogin.disabled = false;
        adminElements.btnLogin.textContent = "دخول لوحة التحكم 🚀";
      }
    }
  };

  if (adminElements.adminLoginForm) {
    adminElements.adminLoginForm.addEventListener('submit', handleLoginSubmit);
  }
  if (adminElements.btnLogin) {
    adminElements.btnLogin.addEventListener('click', handleLoginSubmit);
  }

  // Handle Logout
  if (adminElements.btnAdminLogout) {
    adminElements.btnAdminLogout.addEventListener('click', async () => {
      const confirmed = await showCustomConfirm({
        title: "تسجيل الخروج",
        message: "هل تود تسجيل الخروج من لوحة التحكم؟",
        icon: "🚪",
        confirmText: "تسجيل الخروج",
        cancelText: "إلغاء",
        isDanger: false
      });
      if (confirmed) {
        await Store.logoutAdmin();
      }
    });
  }
}

function setupRestaurantHub() {
  const btnCopy = document.getElementById('btn-copy-restaurant-link');

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const linkEl = document.getElementById('tenant-share-link');
      if (!linkEl) return;
      const text = linkEl.href || linkEl.textContent;
      navigator.clipboard.writeText(text);
      
      const copyText = document.getElementById('copy-store-link-text');
      if (copyText) copyText.textContent = "تم النسخ ✓";
      btnCopy.classList.add('btn-primary');
      btnCopy.classList.remove('btn-ghost');

      setTimeout(() => {
        if (copyText) copyText.textContent = "نسخ رابط المنيو";
        btnCopy.classList.remove('btn-primary');
        btnCopy.classList.add('btn-ghost');
      }, 2500);
    });
  }

  window.addEventListener('harpy_restaurant_changed', () => {
    renderRestaurantHub();
    loadAllDashboardData();
  });
}

function renderRestaurantHub() {
  const slug = Store.getRestaurantSlug();
  const settings = Store.getSettings();
  const activeTitle = document.getElementById('active-restaurant-title');
  const shareLink = document.getElementById('tenant-share-link');
  const previewBtn = document.getElementById('btn-live-preview');

  if (activeTitle) {
    activeTitle.textContent = settings.storeName || `مطعم ${slug}`;
  }

  const isFile = window.location.protocol === 'file:';
  const cleanPath = window.location.pathname.replace('admin.html', '').replace(/\/admin\/?$/, '').replace(/\/$/, '');
  const targetUrl = isFile
    ? window.location.href.replace('admin.html', 'index.html').split('?')[0] + `?m=${slug}`
    : (window.location.hostname.includes('harpymenu.com') 
        ? `https://harpymenu.com/${slug}` 
        : window.location.origin + cleanPath + `/?m=${slug}`);

  if (shareLink) {
    shareLink.textContent = targetUrl.replace(/^https?:\/\//, '');
    shareLink.href = targetUrl;
  }
  if (previewBtn) {
    previewBtn.href = isFile ? `./index.html?m=${slug}` : targetUrl;
  }
}

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
}

function checkOnboardingSetup() {
  const settings = Store.getSettings();
  const existingBanner = document.getElementById('onboarding-setup-banner');
  const isIncomplete = !settings.storeName || !settings.whatsappNumber;

  if (isIncomplete) {
    if (!existingBanner) {
      const banner = document.createElement('div');
      banner.id = 'onboarding-setup-banner';
      banner.style.cssText = `
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.25);
        color: var(--text-main);
        padding: 16px 20px;
        border-radius: var(--radius-md, 12px);
        margin-bottom: 20px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        font-size: 0.88rem;
        line-height: 1.6;
      `;
      banner.innerHTML = `
        <svg style="width:26px;height:26px;flex-shrink:0;color:#f59e0b;margin-top:2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <div style="font-weight:900; font-size:0.95rem; color:#f59e0b; margin-bottom:4px;">إعداد المطعم في انتظار الاستكمال</div>
          <div style="font-size:0.84rem; color:var(--text-muted);">يرجى ضبط اسم المطعم ورقم الواتساب لاستقبال طلبات الزبائن مباشرة:</div>
          <ul style="margin:6px 0 0 0; padding-right:18px; font-size:0.82rem; color:var(--text-main);">
            ${!settings.storeName ? '<li>اسم المطعم مطلوب</li>' : ''}
            ${!settings.whatsappNumber ? '<li>رقم واتساب استقبال الطلبات مطلوب</li>' : ''}
          </ul>
          <div style="margin-top:10px;">
            <button onclick="document.querySelector('[data-tab=tab-settings]').click();" class="btn btn-primary btn-sm" style="font-weight:800; padding:6px 14px; font-size:0.82rem;">
              استكمال الإعدادات الآن ←
            </button>
          </div>
        </div>
      `;
      const container = document.querySelector('main.container') || document.body;
      container.insertBefore(banner, container.firstChild);
    }
  } else {
    if (existingBanner) existingBanner.remove();
  }
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

  let initialTab = 'tab-products';
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
  hiddenUrlInputId
}) {
  const dropzone = document.getElementById(dropzoneId);
  const fileInput = document.getElementById(fileInputId);
  const prompt = document.getElementById(promptId);
  const previewWrap = document.getElementById(previewWrapId);
  const previewImg = document.getElementById(previewImgId);
  const removeBtn = document.getElementById(removeBtnId);
  const hiddenUrl = document.getElementById(hiddenUrlInputId);

  if (!fileInput || !dropzone) return null;

  const showPreview = (src) => {
    if (previewImg && previewWrap && prompt) {
      previewImg.src = src;
      previewWrap.style.display = 'block';
      prompt.style.display = 'none';
      if (hiddenUrl) hiddenUrl.value = src;
    }
  };

  const clearPreview = () => {
    if (previewImg && previewWrap && prompt) {
      previewImg.src = '';
      previewWrap.style.display = 'none';
      prompt.style.display = 'flex';
      fileInput.value = '';
      if (hiddenUrl) hiddenUrl.value = '';
    }
  };

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (prompt) prompt.innerHTML = '<span style="font-size:12px; color:var(--primary); font-weight:800;">جاري معالجة وضغط الصورة... ⏳</span>';
    const compressed = await Store.uploadImage(file);
    if (compressed) {
      showPreview(compressed);
    }
  });

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
      const compressed = await Store.uploadImage(file);
      if (compressed) {
        showPreview(compressed);
      }
    }
  });

  return { showPreview, clearPreview };
}

let prodImageUploader = null;
let storyImageUploader = null;
let logoImageUploader = null;
let coverImageUploader = null;

// ── Visual Product Catalog ─────────────────────────────────
function setupProductManagement() {
  prodImageUploader = bindDeviceImageUploader({
    dropzoneId: 'prod-image-dropzone',
    fileInputId: 'prod-img-file',
    promptId: 'prod-image-prompt',
    previewWrapId: 'prod-preview-wrap',
    previewImgId: 'prod-preview-img',
    removeBtnId: 'btn-remove-prod-img',
    hiddenUrlInputId: 'prod-img-url'
  });

  if (adminElements.btnOpenAddProduct) {
    adminElements.btnOpenAddProduct.addEventListener('click', () => openProductModal(null));
  }
  if (adminElements.btnCloseProductModal) {
    adminElements.btnCloseProductModal.addEventListener('click', closeProductModal);
  }
  if (adminElements.btnCancelProduct) {
    adminElements.btnCancelProduct.addEventListener('click', closeProductModal);
  }
  if (adminElements.productModalBackdrop) {
    adminElements.productModalBackdrop.addEventListener('click', closeProductModal);
  }

  if (adminElements.btnAddSizeRow) {
    adminElements.btnAddSizeRow.addEventListener('click', () => addSizeRow('', 0));
  }
  if (adminElements.btnAddAddonRow) {
    adminElements.btnAddAddonRow.addEventListener('click', () => addAddonRow('', 10));
  }

  if (adminElements.productForm) {
    adminElements.productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProductForm();
    });
  }
}

let lastKnownOrderCount = null;

function playKitchenOrderChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    
    const now = ctx.currentTime;
    
    // Note 1: High bell
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Note 2: Lower bell
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.15);
    gain2.gain.setValueAtTime(0.35, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.9);
  } catch (e) {}
}

function showAdminOrderNotification(newOrder) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      const title = `🔔 طلب جديد ${newOrder.orderId}`;
      const options = {
        body: `العميل: ${newOrder.customer?.name || 'عميل'} | المبلغ: ${newOrder.finalTotal} ج.م`,
        icon: './manifest.json',
        tag: newOrder.orderId
      };
      try {
        new Notification(title, options);
      } catch (e) {}
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
}

// ── Luxury Status Picker Sheet Handlers ─────────────────────
let currentEditingOrderId = null;

window.openStatusSheet = function(orderId, passedStatus = null) {
  if (!orderId || orderId === 'undefined') {
    const orders = Store.getOrders();
    const firstOrder = orders.find(o => o.orderId === orderId || !o.orderId || o.orderId === 'undefined');
    if (firstOrder) orderId = firstOrder.orderId || firstOrder._fbKey || firstOrder.id || 'ORD-UNKNOWN';
  }
  currentEditingOrderId = orderId;
  const sheet = document.getElementById('status-sheet');
  const backdrop = document.getElementById('status-sheet-backdrop');
  const orderIdSpan = document.getElementById('status-sheet-order-id');

  if (orderIdSpan) orderIdSpan.textContent = orderId;

  // Always lookup real current status from memory to prevent any stale param
  const orders = Store.getOrders();
  const cleanId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');
  const currentOrder = orders.find(o => 
    o.orderId === orderId || 
    o.orderId === `#${cleanId}` || 
    o._fbKey === orderId || 
    o.id === orderId ||
    (o.orderId && String(o.orderId).replace(/[^a-zA-Z0-9_-]/g, '') === cleanId)
  );
  const currentStatus = currentOrder?.status || passedStatus || 'pending';

  // Highlight active tile
  document.querySelectorAll('.status-option-tile').forEach(tile => {
    if (tile.dataset.status === currentStatus) {
      tile.classList.add('active');
    } else {
      tile.classList.remove('active');
    }
  });

  if (sheet) sheet.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
};

window.closeStatusSheet = function() {
  currentEditingOrderId = null;
  const sheet = document.getElementById('status-sheet');
  const backdrop = document.getElementById('status-sheet-backdrop');
  if (sheet) sheet.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
};

window.selectOrderStatus = async function(newStatus) {
  if (!currentEditingOrderId) return;
  const orderId = currentEditingOrderId;
  closeStatusSheet();

  // 1. Optimistic in-place DOM update (0ms)
  const statusBadgeMap = {
    pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب 📥' },
    preparing: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', text: '2. المطبخ يجهز 👨‍🍳' },
    out_for_delivery: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)', text: '3. في الطريق إليك 🛵' },
    delivered: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)', text: '4. تم التسليم ✅' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', text: 'تم الإلغاء ✕' }
  };
  const badgeInfo = statusBadgeMap[newStatus] || statusBadgeMap.pending;

  const card = document.querySelector(`.order-card-pro[data-order-id="${orderId}"]`);
  if (card) {
    const triggerBtn = card.querySelector('.order-status-trigger-btn');
    if (triggerBtn) {
      triggerBtn.style.background = badgeInfo.bg;
      triggerBtn.style.color = badgeInfo.color;
      triggerBtn.style.borderColor = badgeInfo.borderColor;
      triggerBtn.innerHTML = `<span>${badgeInfo.text}</span><span style="font-size:10px; margin-right:2px; opacity:0.8;">▾</span>`;
      triggerBtn.setAttribute('onclick', `openStatusSheet('${orderId}', '${newStatus}')`);
    }
  }

  // 2. Persist to Store and Firebase
  await Store.updateOrderStatus(orderId, newStatus);
  renderOrdersList();
  renderInvoicesArchive();
};

window.updateOrderStatusFast = async function(orderId, newStatus) {
  await Store.updateOrderStatus(orderId, newStatus);
  renderOrdersList();
  renderInvoicesArchive();
};

// ── Screen Wake Lock Engine (Keep Kitchen Display Awake) ─────────
let wakeLockSentinel = null;
let isWakeLockRequested = false;

window.initKitchenWakeLock = async function() {
  const savedState = localStorage.getItem('harpy_kitchen_wake_lock');
  if (savedState === 'true') {
    isWakeLockRequested = true;
    await requestKitchenWakeLock(false);
  } else {
    updateWakeLockUI(false);
  }

  // Handle visibility change (re-acquire lock when returning to the tab)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isWakeLockRequested) {
      await requestKitchenWakeLock(false);
    }
  });
};

window.requestKitchenWakeLock = async function(showToast = true) {
  if (!('wakeLock' in navigator)) {
    if (showToast) {
      showToastNotification('خاصية إبقاء الشاشة مضاءة غير مدعومة في هذا المتصفح', 'info');
    }
    updateWakeLockUI(false);
    return false;
  }

  try {
    if (wakeLockSentinel) {
      try { await wakeLockSentinel.release(); } catch(e) {}
      wakeLockSentinel = null;
    }

    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      if (document.visibilityState !== 'visible' && isWakeLockRequested) {
        updateWakeLockUI(false);
      }
    });

    isWakeLockRequested = true;
    localStorage.setItem('harpy_kitchen_wake_lock', 'true');
    updateWakeLockUI(true);
    if (showToast) {
      showToastNotification('تم تفعيل إبقاء الشاشة مضاءة دائماً 💡', 'success');
    }
    return true;
  } catch (err) {
    console.warn('[WakeLock] Request failed:', err);
    updateWakeLockUI(false);
    if (showToast) {
      showToastNotification('تعذر قفل إضاءة الشاشة (تحقق من وضع توفير الطاقة)', 'error');
    }
    return false;
  }
};

window.releaseKitchenWakeLock = async function(showToast = true) {
  isWakeLockRequested = false;
  localStorage.setItem('harpy_kitchen_wake_lock', 'false');
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch(e) {}
    wakeLockSentinel = null;
  }
  updateWakeLockUI(false);
  if (showToast) {
    showToastNotification('تم إيقاف إبقاء الشاشة مضاءة (الوضع التلقائي)', 'info');
  }
};

window.toggleKitchenWakeLock = async function() {
  if (isWakeLockRequested && wakeLockSentinel) {
    await releaseKitchenWakeLock(true);
  } else {
    await requestKitchenWakeLock(true);
  }
};

function updateWakeLockUI(isActive) {
  const btn = document.getElementById('btn-toggle-wake-lock');
  const label = document.getElementById('wake-lock-label');
  const dot = document.getElementById('wake-lock-status-dot');
  if (!btn) return;

  if (isActive) {
    btn.classList.add('active');
    if (label) label.textContent = 'الشاشة مضاءة دائماً';
    if (dot) dot.style.background = '#22c55e';
  } else {
    btn.classList.remove('active');
    if (label) label.textContent = 'إبقاء الشاشة مضاءة';
    if (dot) dot.style.background = 'transparent';
  }
}

// ── Luxury Branded Custom Confirm Dialog Engine ─────────────
let customConfirmResolve = null;

window.showCustomConfirm = function({ title, message, icon = '🗑️', confirmText = 'تأكيد الحذف 🗑️', cancelText = 'إلغاء', isDanger = true }) {
  return new Promise((resolve) => {
    customConfirmResolve = resolve;
    const modal = document.getElementById('custom-confirm-modal');
    const backdrop = document.getElementById('custom-confirm-backdrop');
    const titleEl = document.getElementById('custom-confirm-title');
    const msgEl = document.getElementById('custom-confirm-msg');
    const iconEl = document.getElementById('custom-confirm-icon');
    const acceptBtn = document.getElementById('btn-custom-confirm-accept');

    if (titleEl) titleEl.textContent = title || "تأكيد الإجراء";
    if (msgEl) msgEl.innerHTML = message || "";
    if (iconEl) iconEl.textContent = icon || "🗑️";
    if (acceptBtn) {
      acceptBtn.textContent = confirmText;
      acceptBtn.style.background = isDanger ? 'var(--danger)' : 'var(--primary)';
      acceptBtn.onclick = () => window.closeCustomConfirm(true);
    }

    if (modal) modal.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  });
};

window.closeCustomConfirm = function(result = false) {
  const modal = document.getElementById('custom-confirm-modal');
  const backdrop = document.getElementById('custom-confirm-backdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');

  if (typeof customConfirmResolve === 'function') {
    const res = customConfirmResolve;
    customConfirmResolve = null;
    res(result);
  }
};

let pendingDeleteOrderId = null;

window.closeArchivePwdModal = function() {
  const modal = document.getElementById('archive-pwd-modal');
  const backdrop = document.getElementById('archive-pwd-backdrop');
  const input = document.getElementById('archive-delete-password-input');
  const err = document.getElementById('archive-pwd-error-msg');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  if (input) input.value = '';
  if (err) err.style.display = 'none';
  pendingDeleteOrderId = null;
};

window.confirmDeleteOrder = function(orderId) {
  if (!orderId) return;
  pendingDeleteOrderId = orderId;
  const modal = document.getElementById('archive-pwd-modal');
  const backdrop = document.getElementById('archive-pwd-backdrop');
  const input = document.getElementById('archive-delete-password-input');
  const err = document.getElementById('archive-pwd-error-msg');
  if (err) err.style.display = 'none';
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 150);
  }
  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
};

window.executeArchivePasswordDelete = async function() {
  if (!pendingDeleteOrderId) return;
  const input = document.getElementById('archive-delete-password-input');
  const err = document.getElementById('archive-pwd-error-msg');
  const btn = document.getElementById('btn-confirm-archive-pwd-delete');
  const enteredPassword = (input ? input.value : '').trim();

  if (!enteredPassword) {
    if (err) {
      err.textContent = "يرجى إدخال كلمة المرور للمتابعة!";
      err.style.display = 'block';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "جاري التحقق... ⏳";
  }

  try {
    const slug = Store.getRestaurantSlug();
    let isVerified = false;

    // 1. Verify against meta.adminPassword in Firebase RTDB
    if (db) {
      try {
        const snap = await db.ref(`restaurants/${slug}/meta/adminPassword`).once('value');
        const realPwd = (snap.val() || '').trim();
        if (realPwd && enteredPassword === realPwd) {
          isVerified = true;
        }
      } catch (e) {}
    }

    // 2. If not verified yet, verify via Firebase Auth
    if (!isVerified && auth) {
      try {
        const sessionStr = localStorage.getItem(`harpy_admin_auth_${slug}`) || sessionStorage.getItem(`harpy_auth_${slug}`);
        let email = 'saj@saj.com';
        if (sessionStr) {
          try { email = JSON.parse(sessionStr).email || email; } catch(e) {}
        }
        await auth.signInWithEmailAndPassword(email, enteredPassword);
        isVerified = true;
      } catch (authErr) {}
    }

    // 3. Fallback to hardcoded/preset credentials
    if (!isVerified && (enteredPassword === 'Aymansaj' || enteredPassword === '123456')) {
      isVerified = true;
    }

    if (isVerified) {
      const orderIdToDelete = pendingDeleteOrderId;
      closeArchivePwdModal();
      await Store.deleteOrder(orderIdToDelete);
      if (typeof showToastNotification === 'function') {
        showToastNotification("تم حذف الفاتورة من الأرشيف بنجاح 🗑️", "success");
      }
    } else {
      if (err) {
        err.textContent = "❌ كلمة المرور غير صحيحة! تم منع حذف الفاتورة.";
        err.style.display = 'block';
      }
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  } catch (ex) {
    if (err) {
      err.textContent = "حدث خطأ أثناء التحقق: " + ex.message;
      err.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "تأكيد الحذف 🗑️";
    }
  }
};

window.confirmDeleteCurrentOrder = function() {
  if (currentEditingOrderId) {
    const id = currentEditingOrderId;
    closeStatusSheet();
    confirmDeleteOrder(id);
  }
};

let currentReceiptImageUrl = null;
let isReceiptZoomed = false;

window.openReceiptModal = function(url) {
  currentReceiptImageUrl = url;
  isReceiptZoomed = false;

  const modal = document.getElementById('receipt-lightbox');
  const backdrop = document.getElementById('receipt-lightbox-backdrop');
  const img = document.getElementById('receipt-lightbox-img');
  const wrap = document.getElementById('receipt-lightbox-wrap');

  if (img) {
    img.src = url;
    img.style.maxHeight = '56vh';
    img.style.maxWidth = '100%';
    img.style.width = 'auto';
    img.style.cursor = 'zoom-in';
  }
  if (wrap) {
    wrap.style.overflow = 'hidden';
  }

  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  pushAdminNavState('admin_receipt');
};

window.closeReceiptModal = function(triggerHistoryBack = true) {
  currentReceiptImageUrl = null;
  const modal = document.getElementById('receipt-lightbox');
  const backdrop = document.getElementById('receipt-lightbox-backdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.adminNav === 'admin_receipt') {
    try { history.back(); } catch(e) {}
  }
};

window.toggleReceiptImageZoom = function() {
  const img = document.getElementById('receipt-lightbox-img');
  const wrap = document.getElementById('receipt-lightbox-wrap');
  if (!img) return;

  isReceiptZoomed = !isReceiptZoomed;
  if (isReceiptZoomed) {
    img.style.maxHeight = 'none';
    img.style.maxWidth = 'none';
    img.style.width = '100%';
    img.style.cursor = 'zoom-out';
    if (wrap) wrap.style.overflow = 'auto';
  } else {
    img.style.maxHeight = '56vh';
    img.style.maxWidth = '100%';
    img.style.width = 'auto';
    img.style.cursor = 'zoom-in';
    if (wrap) wrap.style.overflow = 'hidden';
  }
};

window.openReceiptFullImage = function() {
  const url = currentReceiptImageUrl || (document.getElementById('receipt-lightbox-img') ? document.getElementById('receipt-lightbox-img').src : null);
  if (!url) return;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank');
    return;
  }

  if (url.startsWith('data:')) {
    try {
      const parts = url.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const newWin = window.open(blobUrl, '_blank');
      if (!newWin) {
        toggleReceiptImageZoom();
      }
    } catch (e) {
      console.warn("[Admin] Safe blob convert fallback:", e);
      toggleReceiptImageZoom();
    }
    return;
  }

  window.open(url, '_blank');
};

// ── Instant Thermal POS / Kitchen Receipt Printing Engine ────
window.printOrderReceipt = function(orderOrId) {
  let order = null;
  if (typeof orderOrId === 'object' && orderOrId !== null) {
    order = orderOrId;
  } else {
    const orders = Store.getOrders();
    order = orders.find(o => (o.orderId === orderOrId || o.id === orderOrId || o._fbKey === orderOrId));
  }

  if (!order) {
    if (typeof showToastNotification === 'function') showToastNotification("الطلب غير موجود للطباعة", "error");
    return;
  }

  const settings = Store.getSettings();
  const storeName = settings.storeName || "مطعم أوردر";
  const currency = settings.currency || "ج.م";
  const timeStr = order.createdAt 
    ? new Date(order.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) 
    : new Date(order.timestamp || Date.now()).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

  const itemsRows = (order.items || []).map(it => `
    <tr>
      <td style="text-align:right; padding:5px 0; font-weight:bold; border-bottom:1px dotted #888;">
        ${it.name}${it.selectedSize ? ` (${it.selectedSize.name})` : ''}
        ${it.selectedAddons && it.selectedAddons.length ? `<br><small style="color:#444; font-size:10px;">+ ${it.selectedAddons.map(a => a.name).join('، ')}</small>` : ''}
        ${it.notes ? `<br><small style="color:#c2410c; font-size:10px;">📝 ${it.notes}</small>` : ''}
      </td>
      <td style="text-align:center; padding:5px 0; border-bottom:1px dotted #888; font-weight:bold;">${it.qty}x</td>
      <td style="text-align:left; padding:5px 0; border-bottom:1px dotted #888; font-family:monospace; font-weight:bold;">${((it.price || 0) * it.qty).toFixed(0)}</td>
    </tr>
  `).join('');

  const orderTypeBanner = order.orderType === 'dine_in'
    ? `<div style="font-size:16px; font-weight:900; text-align:center; border:2px solid #000; padding:5px; margin:6px 0; border-radius:4px; background:#f2f2f2;">🍽️ طلب صالة — طاولة رقم (${order.tableNumber || order.customer?.tableNumber || '1'})</div>`
    : (order.orderType === 'takeaway'
        ? `<div style="font-size:16px; font-weight:900; text-align:center; border:2px solid #000; padding:5px; margin:6px 0; border-radius:4px; background:#f2f2f2;">🥡 طلب سفري / تيك أواي (${order.orderId})</div>`
        : `<div style="font-size:14px; font-weight:800; text-align:center; border:1px dashed #000; padding:4px; margin:5px 0;">🛵 طلب توصيل ديليفري</div>`
      );

  const printHtml = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة طلب ${order.orderId || ''}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        @media print {
          html, body { width: 78mm !important; margin: 0 auto !important; padding: 4px !important; }
        }
        body {
          font-family: 'Courier New', Tahoma, -apple-system, sans-serif;
          font-size: 13px;
          line-height: 1.35;
          color: #000;
          background: #fff;
          margin: 0 auto;
          padding: 6px;
          width: 74mm;
          box-sizing: border-box;
          direction: rtl;
        }
        .center { text-align: center; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .bold { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 6px 0; }
        th { border-bottom: 1.5px solid #000; padding: 4px 0; font-size: 11px; }
        .total-row { font-size: 16px; font-weight: 900; }
      </style>
    </head>
    <body>
      <div class="center bold" style="font-size:19px; margin-bottom:2px;">${storeName}</div>
      ${orderTypeBanner}
      <div class="center" style="font-size:11px; font-weight:bold;">بون طلب رقم: <span style="font-family:monospace;">${order.orderId || ''}</span></div>
      <div class="center" style="font-size:10px; color:#444;">${timeStr}</div>
      
      <div class="divider"></div>
      ${order.orderType === 'dine_in' ? `
        <div><strong>الموقع:</strong> داخل الصالة — طاولة ${order.tableNumber || 1}</div>
        ${order.customer?.name && !order.customer.name.includes('طاولة') ? `<div><strong>الاسم:</strong> ${order.customer.name}</div>` : ''}
      ` : `
        <div><strong>العميل:</strong> ${order.customer?.name || 'عميل'}</div>
        ${order.customer?.phone && order.customer?.phone !== 'داخلي' ? `<div><strong>الهاتف:</strong> <span style="font-family:monospace;">${order.customer.phone}</span></div>` : ''}
        <div><strong>العنوان:</strong> ${order.customer?.address || 'استلام من المحل'}</div>
      `}
      ${order.customer?.notes ? `<div style="margin-top:2px;"><strong>ملاحظات:</strong> ${order.customer.notes}</div>` : ''}
      
      <div class="divider"></div>
      <table>
        <thead>
          <tr>
            <th style="text-align:right;">الصنف</th>
            <th style="text-align:center;">العدد</th>
            <th style="text-align:left;">السعر</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="divider"></div>
      <div style="display:flex; justify-content:space-between; margin:3px 0;">
        <span>المجموع:</span>
        <span style="font-family:monospace; font-weight:bold;">${(parseFloat(order.subtotal) || parseFloat(order.finalTotal) || 0).toFixed(0)} ${currency}</span>
      </div>
      ${order.discount ? `
      <div style="display:flex; justify-content:space-between; margin:3px 0; color:#000;">
        <span>الخصم:</span>
        <span style="font-family:monospace; font-weight:bold;">- ${(parseFloat(order.discount) || 0).toFixed(0)} ${currency}</span>
      </div>` : ''}
      ${order.deliveryFee ? `
      <div style="display:flex; justify-content:space-between; margin:3px 0;">
        <span>خدمة التوصيل:</span>
        <span style="font-family:monospace; font-weight:bold;">${parseFloat(order.deliveryFee).toFixed(0)} ${currency}</span>
      </div>` : ''}
      <div class="divider"></div>
      <div class="total-row" style="display:flex; justify-content:space-between; margin:4px 0;">
        <span>المطلوب تحصيله:</span>
        <span style="font-family:monospace;">${(parseFloat(order.finalTotal) || 0).toFixed(0)} ${currency}</span>
      </div>
      <div style="font-size:11px; margin-top:3px;">
        <strong>طريقة الدفع:</strong> 
        ${order.paymentMethod === 'card' ? '💳 فيزا / بطاقة بنكية' : (order.paymentMethod === 'wallet' ? '📱 محفظة إلكترونية' : '💵 نقداً / كاش')}
      </div>
      <div class="divider"></div>
      <div class="center" style="font-size:11px; margin-top:5px; font-weight:bold;">شكراً لزيارتكم! نتمنى لكم وجبة شهية ❤️</div>
      <div class="center" style="font-size:9px; color:#555; margin-top:2px;">نظام كاشير أوردر الذكي</div>
      <script>
        window.onload = function() {
          window.focus();
          window.print();
          setTimeout(function() { window.close(); }, 1200);
        };
      </script>
    </body>
    </html>
  `;

  let printed = false;
  try {
    const printWindow = window.open('', '_blank', 'width=420,height=650');
    if (printWindow && !printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printed = true;
    }
  } catch (e) {
    printed = false;
  }

  if (!printed) {
    let printIframe = document.getElementById('print-receipt-iframe');
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'print-receipt-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);
    }
    const doc = printIframe.contentWindow.document;
    doc.open();
    doc.write(printHtml);
    doc.close();
    setTimeout(() => {
      try {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
      } catch (err) {
        console.warn('Iframe print:', err);
      }
    }, 400);
  }
};

let lastRenderedKitchenSignature = null;
let lastRenderedArchiveSignature = null;
let currentKitchenFilter = 'all'; // 'all', 'pending', 'preparing', 'out_for_delivery'
let currentArchiveFilter = 'delivered'; // 'delivered', 'cancelled', 'all'
let archiveSearchQuery = '';

window.filterKitchenOrders = function(filter) {
  currentKitchenFilter = filter;
  document.querySelectorAll('.btn-filter-kitchen').forEach(b => {
    b.classList.toggle('active', b.dataset.kitchenFilter === filter);
  });
  renderOrdersList();
};

window.advanceOrderStatus = async function(orderId, targetStatus) {
  const statusLabels = {
    preparing: 'المطبخ يجهز الطلب الآن 👨‍🍳',
    out_for_delivery: 'الطلب في الطريق للتوصيل 🛵',
    delivered: 'تم تسليم الطلب ونقله لأرشيف الفواتير بنجاح ✅'
  };
  await Store.updateOrderStatus(orderId, targetStatus);
  renderOrdersList();
  renderInvoicesArchive();
  showToastNotification(statusLabels[targetStatus] || `تم تحديث حالة الطلب ✓`, 'success');
};

window.reopenOrderToKitchen = async function(orderId) {
  await Store.updateOrderStatus(orderId, 'preparing');
  renderOrdersList();
  renderInvoicesArchive();
  showToastNotification(`تمت إعادة الطلب ${orderId} إلى شاشة المطبخ النشطة بنجاح ✓`, 'success');
};

window.filterArchiveOrders = function(filter) {
  currentArchiveFilter = filter;
  document.querySelectorAll('.btn-filter-archive').forEach(b => {
    b.classList.toggle('active', b.dataset.archiveFilter === filter);
  });
  renderInvoicesArchive();
};

window.handleArchiveSearch = function(query) {
  archiveSearchQuery = (query || '').trim().toLowerCase();
  renderInvoicesArchive();
};

// ═══ 1. LIVE KITCHEN & ACTIVE ORDERS ENGINE ══════════════════
window.renderOrdersList = function(orders = null) {
  if (!adminElements.adminOrdersContainer) return;
  if (orders === null || orders === undefined) {
    orders = Store.getOrders();
  }
  const currency = Store.getSettings().currency || "ج.م";

  // Active orders are: pending, preparing, out_for_delivery (never delivered or cancelled)
  const isOrderActive = (o) => !o.status || o.status === 'pending' || o.status === 'preparing' || o.status === 'out_for_delivery';
  const allActiveOrders = orders.filter(isOrderActive);

  const activeCount = allActiveOrders.length;
  const pendingCount = orders.filter(o => !o.status || o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const deliveryCount = orders.filter(o => o.status === 'out_for_delivery').length;

  // Trigger Audio Chime & Browser Notification on New Incoming Order
  if (lastKnownOrderCount !== null && orders.length > lastKnownOrderCount) {
    const latestOrder = orders[0];
    playKitchenOrderChime();
    if (latestOrder) {
      showAdminOrderNotification(latestOrder);
    }
  }
  lastKnownOrderCount = orders.length;

  // Update Kitchen Header Statistics
  if (adminElements.statActiveOrders) adminElements.statActiveOrders.textContent = activeCount;
  if (adminElements.statPendingOrders) adminElements.statPendingOrders.textContent = pendingCount;
  if (adminElements.statPreparingOrders) adminElements.statPreparingOrders.textContent = preparingCount;
  if (adminElements.statDeliveryOrders) adminElements.statDeliveryOrders.textContent = deliveryCount;

  if (adminElements.countFilterAll) adminElements.countFilterAll.textContent = activeCount;
  if (adminElements.countFilterPending) adminElements.countFilterPending.textContent = pendingCount;
  if (adminElements.countFilterPreparing) adminElements.countFilterPreparing.textContent = preparingCount;
  if (adminElements.countFilterDelivery) adminElements.countFilterDelivery.textContent = deliveryCount;

  if (adminElements.ordersBadgeCount) {
    if (activeCount > 0) {
      adminElements.ordersBadgeCount.textContent = activeCount;
      adminElements.ordersBadgeCount.style.display = 'inline-block';
    } else {
      adminElements.ordersBadgeCount.style.display = 'none';
    }
  }

  // Filter according to selected kitchen filter tab
  let displayOrders = allActiveOrders;
  if (currentKitchenFilter === 'pending') {
    displayOrders = allActiveOrders.filter(o => !o.status || o.status === 'pending');
  } else if (currentKitchenFilter === 'preparing') {
    displayOrders = allActiveOrders.filter(o => o.status === 'preparing');
  } else if (currentKitchenFilter === 'out_for_delivery') {
    displayOrders = allActiveOrders.filter(o => o.status === 'out_for_delivery');
  }

  // Prevent repetitive DOM repaints if data signature is identical
  const currentSignature = JSON.stringify({
    filter: currentKitchenFilter,
    orders: displayOrders.map(o => ({ id: o.orderId, st: o.status, tot: o.finalTotal, rec: o.receiptUrl }))
  });
  if (lastRenderedKitchenSignature === currentSignature && adminElements.adminOrdersContainer.children.length > 0) {
    return;
  }
  lastRenderedKitchenSignature = currentSignature;

  if (displayOrders.length === 0) {
    adminElements.adminOrdersContainer.innerHTML = `
      <div style="text-align:center; padding:45px 20px; color:var(--text-muted); background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-md);">
        <div style="font-size:38px; margin-bottom:12px;">👨‍🍳</div>
        <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:4px;">المطبخ جاهز ونظيف! لا توجد طلبات جارية حالياً</div>
        <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:16px;">أي طلب جديد يتم إرساله من المنيو سيظهر هنا فورياً ومباشرة مع صوت رنين المطبخ.</div>
        <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('tab-archive', true)" style="font-weight:800; font-size:12px; border:1px solid var(--border);">
          📁 مراجعة أرشيف الفواتير المسلّمة ←
        </button>
      </div>
    `;
    return;
  }

  adminElements.adminOrdersContainer.innerHTML = displayOrders.map(o => {
    const safeOrderId = o.orderId || o.id || o._fbKey || (`#ORD-${(o.timestamp || Date.now()).toString().slice(-4)}`);
    const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'الآن';
    const status = o.status || 'pending';

    const statusBadge = {
      pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب 📥' },
      preparing: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', text: '2. المطبخ يجهز 👨‍🍳' },
      out_for_delivery: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)', text: '3. في الطريق إليك 🛵' },
      delivered: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)', text: '4. تم التسليم ✅' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', text: 'تم الإلغاء ✕' }
    }[status] || { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب 📥' };

    // 1-Click Fast Workflow Progression Action Button
    let nextActionBtnHtml = '';
    if (status === 'pending') {
      nextActionBtnHtml = `
        <button type="button" class="btn btn-primary btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'preparing')" style="font-weight:800; padding:6px 14px; font-size:12px; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 10px rgba(234, 88, 12, 0.3);">
          <span>👨‍🍳</span>
          <span>بدء التجهيز بالمطبخ</span>
        </button>
      `;
    } else if (status === 'preparing') {
      const isDineInOrTakeaway = o.orderType === 'dine_in' || o.orderType === 'takeaway';
      nextActionBtnHtml = isDineInOrTakeaway ? `
        <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'delivered')" style="background:#16a34a; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 12px rgba(22, 163, 74, 0.35);">
          <span>✅</span>
          <span>جاهز وتم التقديم (أرشفة)</span>
        </button>
      ` : `
        <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'out_for_delivery')" style="background:#a855f7; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 10px rgba(168, 85, 247, 0.3);">
          <span>🛵</span>
          <span>إرسال للتوصيل (مع الطيار)</span>
        </button>
      `;
    } else if (status === 'out_for_delivery') {
      nextActionBtnHtml = `
        <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'delivered')" style="background:#16a34a; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 12px rgba(22, 163, 74, 0.35);">
          <span>✅</span>
          <span>تم التسليم بنجاح (نقل للأرشيف)</span>
        </button>
      `;
    }

    const itemsHtml = (o.items || []).map(it => `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; font-size:12.5px; padding:6px 0; border-bottom:1px dashed var(--border);">
        <div style="flex:1; padding-left:8px; min-width:0;">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="font-weight:900; background:var(--primary-subtle); color:var(--primary); padding:1px 6px; border-radius:4px; font-size:11px;">${it.qty}x</span>
            <span style="font-weight:800; color:var(--text-main);">${it.name}</span>
            ${it.selectedSize ? `<span style="font-size:10.5px; background:var(--surface); border:1px solid var(--border); color:var(--text-muted); padding:1px 5px; border-radius:4px;">${it.selectedSize.name}</span>` : ''}
          </div>
          ${it.selectedAddons && it.selectedAddons.length ? `
            <div style="font-size:11px; color:var(--accent-wa); margin-top:2px;">
              + إضافات: ${it.selectedAddons.map(a => a.name).join('، ')}
            </div>
          ` : ''}
          ${it.notes ? `
            <div style="font-size:11px; color:#f59e0b; margin-top:3px; background:rgba(245, 158, 11, 0.08); padding:2px 6px; border-radius:4px;">
              📝 ملاحظة: ${it.notes}
            </div>
          ` : ''}
        </div>
        <div class="font-num" style="font-weight:800; color:var(--text-main); white-space:nowrap; flex-shrink:0;">
          ${((it.price || 0) * it.qty).toFixed(2)} ${currency}
        </div>
      </div>
    `).join('');

    const phoneRaw = (o.customer?.phone || '').replace(/[^0-9]/g, '');
    const waUrl = phoneRaw ? `https://wa.me/${phoneRaw.startsWith('0') ? '2' + phoneRaw : phoneRaw}?text=${encodeURIComponent(`مرحباً أستاذ ${o.customer?.name || ''}، بخصوص طلبك رقم ${safeOrderId} من المطعم`)}` : '#';
    const telUrl = phoneRaw ? `tel:${phoneRaw}` : '#';
    const isWalletPayment = o.paymentMethod === 'wallet';

    return `
      <div class="order-card-pro" data-order-id="${safeOrderId}">
        
        <!-- Header: Order ID, Time, Progression Action & Status Sheet Trigger -->
        <div class="order-card-header-row">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="order-id-chip font-num">${safeOrderId}</span>
            ${o.orderType === 'dine_in' ? `
              <span class="order-type-tag order-type-dinein">🍽️ صالة (طاولة ${o.tableNumber || 1})</span>
            ` : (o.orderType === 'takeaway' ? `
              <span class="order-type-tag order-type-takeaway">🥡 سفري</span>
            ` : `
              <span class="order-type-tag order-type-delivery">🛵 ديليفري</span>
            `)}
            <span class="order-time-chip">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${timeStr}
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            ${nextActionBtnHtml}

            <!-- Instant Thermal Print Button -->
            <button type="button" class="btn btn-ghost btn-sm" onclick="printOrderReceipt('${safeOrderId}')" style="padding:5px 9px; font-size:11px; font-weight:800; border:1px solid var(--border); color:var(--text-main); background:var(--surface-raised); display:inline-flex; align-items:center; gap:4px;" title="طباعة بون الفاتورة الحرارية">
              <span>🖨️</span>
              <span>طباعة</span>
            </button>

            <!-- Custom Status Sheet Trigger -->
            <button type="button" class="order-status-trigger-btn font-num" style="background:${statusBadge.bg}; color:${statusBadge.color}; border:1px solid ${statusBadge.borderColor};" onclick="openStatusSheet('${safeOrderId}', '${status}')">
              <span>${statusBadge.text}</span>
              <span style="font-size:10px; margin-right:2px; opacity:0.8;">▾</span>
            </button>

            <!-- Delete Button -->
            <button type="button" class="btn-order-delete-chic" onclick="confirmDeleteOrder('${safeOrderId}')" title="حذف هذا الطلب نهائياً" aria-label="حذف الطلب">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body: Responsive Columns (Customer Details & Items Summary) -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px; width:100%; box-sizing:border-box;">
          
          <!-- Column 1: Customer & Delivery Info -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:6px; display:flex; align-items:center; gap:5px;">
                <span>👤</span> بيانات العميل والتوصيل:
              </div>
              
              <div style="font-size:14px; font-weight:900; color:var(--text-main); margin-bottom:6px; word-break:break-word;">
                ${o.customer?.name || 'عميل'}
              </div>

              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; flex-wrap:wrap;">
                <span class="font-num" style="font-size:12.5px; font-weight:800; color:var(--text-main); background:var(--surface-raised); padding:3px 8px; border-radius:4px; border:1px solid var(--border);">
                  ${o.customer?.phone || 'بدون هاتف'}
                </span>
                ${phoneRaw ? `
                  <a href="${telUrl}" class="btn btn-ghost btn-sm" style="padding:3px 8px; font-size:11px; font-weight:700;" title="اتصال بالعميل">
                    📞 اتصال
                  </a>
                  <a href="${waUrl}" target="_blank" class="btn btn-ghost btn-sm" style="padding:3px 8px; font-size:11px; color:var(--accent-wa); font-weight:800;" title="محادثة واتساب">
                    💬 واتساب
                  </a>
                ` : ''}
              </div>

              <div style="font-size:12px; color:var(--text-body); line-height:1.45; margin-bottom:6px; background:var(--surface-raised); padding:6px 10px; border-radius:6px; word-break:break-word;">
                <span style="font-weight:800; color:var(--text-main);">📍 العنوان: </span>
                ${o.customer?.address || 'استلام من المطعم'}
              </div>

              ${(parseFloat(o.deliveryFee) > 0 || o.deliveryZone) ? `
                <div style="font-size:11.5px; color:var(--primary); background:var(--primary-subtle); padding:4px 8px; border-radius:6px; margin-bottom:6px; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
                  <span>خدمة التوصيل (${o.deliveryZone || 'السعر الموحد'}):</span>
                  <span class="font-num">+${(parseFloat(o.deliveryFee) || 0).toFixed(2)} ${currency}</span>
                </div>
              ` : ''}

              ${o.customer?.notes ? `
                <div style="font-size:11.5px; color:#f59e0b; background:rgba(245, 158, 11, 0.08); border:1px dashed rgba(245, 158, 11, 0.3); padding:6px 10px; border-radius:6px; margin-top:4px; word-break:break-word;">
                  <span style="font-weight:800;">📝 ملاحظات: </span>
                  ${o.customer.notes}
                </div>
              ` : ''}
            </div>

            <!-- Payment Info Badge -->
            <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
              <span style="font-size:11.5px; font-weight:800; color:var(--text-muted);">طريقة الدفع:</span>
              <span style="font-size:11.5px; font-weight:800; padding:3px 8px; border-radius:6px; ${isWalletPayment ? 'background:rgba(59, 130, 246, 0.12); color:#3b82f6;' : 'background:rgba(34, 197, 94, 0.12); color:#22c55e;'}">
                ${isWalletPayment ? '💳 فودافون كاش / إنستاباي' : '💵 نقداً عند الاستلام (COD)'}
              </span>
            </div>
          </div>

          <!-- Column 2: Order Items & Total -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:6px; display:flex; align-items:center; gap:5px;">
                <span>🍽️</span> محتويات الطلب:
              </div>

              <div style="max-height:150px; overflow-y:auto; padding-right:2px;">
                ${itemsHtml}
              </div>
            </div>

            <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border);">
              <!-- Total summary row -->
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12.5px; font-weight:800; color:var(--text-muted);">المبلغ المطلوب:</span>
                <span class="font-num" style="font-size:16px; font-weight:900; color:var(--primary);">
                  ${(parseFloat(o.finalTotal) || 0).toFixed(2)} ${currency}
                </span>
              </div>

              <!-- Payment Receipt interactive widget if uploaded -->
              ${isWalletPayment && o.receiptUrl ? `
                <div style="margin-top:8px; background:var(--surface-raised); border:1px solid var(--border); border-radius:6px; padding:6px 10px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                  <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                    <img src="${o.receiptUrl}" alt="Receipt" style="width:36px; height:36px; border-radius:4px; object-fit:cover; border:1px solid var(--border); cursor:pointer; flex-shrink:0;" onclick="openReceiptModal('${o.receiptUrl}')">
                    <div style="min-width:0;">
                      <div style="font-size:11px; font-weight:800; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📸 إيصال التحويل</div>
                      <div style="font-size:10px; color:var(--accent-wa); font-weight:700;">تم الرفع ✓</div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" onclick="openReceiptModal('${o.receiptUrl}')" style="padding:4px 8px; font-size:10.5px; font-weight:800; white-space:nowrap; flex-shrink:0;">
                    🔍 معاينة
                  </button>
                </div>
              ` : ''}
            </div>

          </div>

        </div>

      </div>
    `;
  }).join('');
};

// ═══ 2. INVOICES & DELIVERED ORDERS ARCHIVE ENGINE ═══════════
window.renderInvoicesArchive = function(orders = null) {
  if (!adminElements.adminArchiveContainer) return;
  if (orders === null || orders === undefined) {
    orders = Store.getOrders();
  }
  const currency = Store.getSettings().currency || "ج.م";

  // Archived orders are delivered or cancelled
  const isOrderArchived = (o) => o.status === 'delivered' || o.status === 'cancelled';
  const allArchived = orders.filter(isOrderArchived);

  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (parseFloat(o.finalTotal) || 0), 0);

  // Update Archive Header Statistics
  if (adminElements.statArchivedOrders) adminElements.statArchivedOrders.textContent = deliveredOrders.length;
  if (adminElements.statArchivedRevenue) adminElements.statArchivedRevenue.textContent = `${deliveredRevenue.toFixed(0)} ${currency}`;
  if (adminElements.statCancelledOrders) adminElements.statCancelledOrders.textContent = cancelledOrders.length;

  if (adminElements.archiveBadgeCount) {
    if (allArchived.length > 0) {
      adminElements.archiveBadgeCount.textContent = allArchived.length;
      adminElements.archiveBadgeCount.style.display = 'inline-block';
    } else {
      adminElements.archiveBadgeCount.style.display = 'none';
    }
  }

  // Filter according to status chip
  let displayArchived = allArchived;
  if (currentArchiveFilter === 'delivered') {
    displayArchived = deliveredOrders;
  } else if (currentArchiveFilter === 'cancelled') {
    displayArchived = cancelledOrders;
  } else if (currentArchiveFilter === 'dine_in') {
    displayArchived = allArchived.filter(o => o.orderType === 'dine_in');
  } else if (currentArchiveFilter === 'takeaway') {
    displayArchived = allArchived.filter(o => o.orderType === 'takeaway');
  } else if (currentArchiveFilter === 'delivery') {
    displayArchived = allArchived.filter(o => !o.orderType || o.orderType === 'delivery');
  }

  // Filter according to search query
  if (archiveSearchQuery) {
    displayArchived = displayArchived.filter(o => {
      const id = String(o.orderId || o.id || o._fbKey || '').toLowerCase();
      const name = String(o.customer?.name || '').toLowerCase();
      const phone = String(o.customer?.phone || '').replace(/[^0-9]/g, '');
      const addr = String(o.customer?.address || '').toLowerCase();
      return id.includes(archiveSearchQuery) || name.includes(archiveSearchQuery) || phone.includes(archiveSearchQuery) || addr.includes(archiveSearchQuery);
    });
  }

  // Signature check
  const currentArchiveSig = JSON.stringify({
    filter: currentArchiveFilter,
    query: archiveSearchQuery,
    orders: displayArchived.map(o => ({ id: o.orderId, st: o.status, tot: o.finalTotal, rec: o.receiptUrl }))
  });
  if (lastRenderedArchiveSignature === currentArchiveSig && adminElements.adminArchiveContainer.children.length > 0) {
    return;
  }
  lastRenderedArchiveSignature = currentArchiveSig;

  if (displayArchived.length === 0) {
    adminElements.adminArchiveContainer.innerHTML = `
      <div style="text-align:center; padding:45px 20px; color:var(--text-muted); background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-md);">
        <div style="font-size:38px; margin-bottom:12px;">📁</div>
        <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:4px;">لا توجد فواتير مطابقة في الأرشيف</div>
        <div style="font-size:12.5px; color:var(--text-muted);">كافة الطلبات التي تكتمل وتصل لحالة (تم التسليم) أو تُلغى ستُحفظ هنا تلقائياً.</div>
      </div>
    `;
    return;
  }

  adminElements.adminArchiveContainer.innerHTML = displayArchived.map(o => {
    const safeOrderId = o.orderId || o.id || o._fbKey || (`#ORD-${(o.timestamp || Date.now()).toString().slice(-4)}`);
    const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'الآن';
    const isDelivered = o.status === 'delivered';

    const itemsHtml = (o.items || []).map(it => `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; font-size:12px; padding:5px 0; border-bottom:1px dashed var(--border);">
        <div style="flex:1; padding-left:8px; min-width:0;">
          <span style="font-weight:900; background:var(--primary-subtle); color:var(--primary); padding:1px 5px; border-radius:4px; font-size:10.5px;">${it.qty}x</span>
          <span style="font-weight:800; color:var(--text-main);">${it.name}</span>
          ${it.selectedSize ? `<span style="font-size:10px; color:var(--text-muted);">(${it.selectedSize.name})</span>` : ''}
          ${it.selectedAddons && it.selectedAddons.length ? `<span style="font-size:10px; color:var(--accent-wa);">+ ${it.selectedAddons.map(a => a.name).join('، ')}</span>` : ''}
        </div>
        <div class="font-num" style="font-weight:800; color:var(--text-main); white-space:nowrap; flex-shrink:0;">
          ${((it.price || 0) * it.qty).toFixed(2)} ${currency}
        </div>
      </div>
    `).join('');

    const phoneRaw = (o.customer?.phone || '').replace(/[^0-9]/g, '');
    const waUrl = phoneRaw ? `https://wa.me/${phoneRaw.startsWith('0') ? '2' + phoneRaw : phoneRaw}?text=${encodeURIComponent(`مرحباً أستاذ ${o.customer?.name || ''}، بخصوص فاتورتك رقم ${safeOrderId} من المطعم`)}` : '#';
    const telUrl = phoneRaw ? `tel:${phoneRaw}` : '#';
    const isWalletPayment = o.paymentMethod === 'wallet';

    return `
      <div class="order-card-pro" data-order-id="${safeOrderId}" style="opacity:${isDelivered ? '1' : '0.85'}; border-color:${isDelivered ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'};">
        
        <!-- Header: Order ID, Time, Archive Badge, Reprint & Reopen Actions -->
        <div class="order-card-header-row">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="order-id-chip font-num">${safeOrderId}</span>
            ${o.orderType === 'dine_in' ? `
              <span class="order-type-tag order-type-dinein">🍽️ صالة (طاولة ${o.tableNumber || 1})</span>
            ` : (o.orderType === 'takeaway' ? `
              <span class="order-type-tag order-type-takeaway">🥡 سفري</span>
            ` : `
              <span class="order-type-tag order-type-delivery">🛵 ديليفري</span>
            `)}
            <span class="order-time-chip">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${timeStr}
            </span>
            <span style="font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px; ${isDelivered ? 'background:rgba(34, 197, 94, 0.12); color:#22c55e; border:1px solid rgba(34, 197, 94, 0.3);' : 'background:rgba(239, 68, 68, 0.12); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.3);'}">
              ${isDelivered ? 'تم التسليم بنجاح ✅' : 'ملغي ✕'}
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <!-- Instant Thermal Print Button -->
            <button type="button" class="btn btn-ghost btn-sm" onclick="printOrderReceipt('${safeOrderId}')" style="padding:5px 9px; font-size:11px; font-weight:800; border:1px solid var(--border); color:var(--text-main); background:var(--surface-raised); display:inline-flex; align-items:center; gap:4px;" title="إعادة طباعة بون الفاتورة الحرارية">
              <span>🖨️</span>
              <span>طباعة الفاتورة</span>
            </button>

            <!-- Reopen to Kitchen Button -->
            <button type="button" class="btn btn-ghost btn-sm" onclick="reopenOrderToKitchen('${safeOrderId}')" style="padding:5px 9px; font-size:11px; font-weight:800; border:1px solid var(--border); color:var(--text-main); background:var(--surface-raised); display:inline-flex; align-items:center; gap:4px;" title="إعادة فتح الطلب وإرجاعه لشاشة المطبخ النشطة">
              <span>↩️</span>
              <span>إعادة للمطبخ</span>
            </button>

            <!-- Delete Button -->
            <button type="button" class="btn-order-delete-chic" onclick="confirmDeleteOrder('${safeOrderId}')" title="حذف الفاتورة نهائياً من الأرشيف" aria-label="حذف الفاتورة">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body: Responsive Columns -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px; width:100%; box-sizing:border-box;">
          
          <!-- Column 1: Customer & Delivery Info -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:6px;">
                <span>👤</span> العميل: <span style="font-size:13.5px; font-weight:900; color:var(--text-main);">${o.customer?.name || 'عميل'}</span>
              </div>

              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; flex-wrap:wrap;">
                <span class="font-num" style="font-size:12px; font-weight:800; color:var(--text-main); background:var(--surface-raised); padding:2px 7px; border-radius:4px; border:1px solid var(--border);">
                  ${o.customer?.phone || 'بدون هاتف'}
                </span>
                ${phoneRaw ? `
                  <a href="${telUrl}" class="btn btn-ghost btn-sm" style="padding:2px 6px; font-size:10.5px; font-weight:700;">📞 اتصال</a>
                  <a href="${waUrl}" target="_blank" class="btn btn-ghost btn-sm" style="padding:2px 6px; font-size:10.5px; color:var(--accent-wa); font-weight:800;">💬 واتساب</a>
                ` : ''}
              </div>

              <div style="font-size:11.5px; color:var(--text-body); line-height:1.4; margin-bottom:6px; background:var(--surface-raised); padding:5px 8px; border-radius:6px;">
                <span style="font-weight:800; color:var(--text-main);">📍 العنوان: </span>
                ${o.customer?.address || 'استلام من المطعم'}
              </div>

              ${(parseFloat(o.deliveryFee) > 0 || o.deliveryZone) ? `
                <div style="font-size:11px; color:var(--primary); background:var(--primary-subtle); padding:3px 7px; border-radius:5px; margin-bottom:4px; font-weight:800; display:flex; justify-content:space-between;">
                  <span>خدمة التوصيل (${o.deliveryZone || 'السعر الموحد'}):</span>
                  <span class="font-num">+${(parseFloat(o.deliveryFee) || 0).toFixed(2)} ${currency}</span>
                </div>
              ` : ''}
            </div>

            <div style="margin-top:8px; padding-top:6px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted);">
              <span>طريقة الدفع:</span>
              <span style="font-weight:800; color:var(--text-main);">${isWalletPayment ? '💳 إلكتروني (محفظة)' : '💵 نقداً (COD)'}</span>
            </div>
          </div>

          <!-- Column 2: Items & Financial Total -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:5px;">🍽️ الأصناف:</div>
              <div style="max-height:130px; overflow-y:auto; padding-right:2px;">
                ${itemsHtml}
              </div>
            </div>

            <div style="margin-top:8px; padding-top:6px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:800; color:var(--text-muted);">إجمالي الفاتورة:</span>
              <span class="font-num" style="font-size:16px; font-weight:900; color:${isDelivered ? '#16a34a' : 'var(--danger)'};">
                ${(parseFloat(o.finalTotal) || 0).toFixed(2)} ${currency}
              </span>
            </div>
          </div>

        </div>

      </div>
    `;
  }).join('');
};

function renderCatalog() {
  if (!adminElements.catalogContainer) return;
  const prods = Store.getProducts();
  const currency = Store.getSettings().currency || "ج.م";

  if (prods.length === 0) {
    adminElements.catalogContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:45px 20px; background:var(--surface); border:1px dashed var(--border-strong); border-radius:var(--radius-md);">
        <div style="font-size:38px; margin-bottom:12px;">🍽️</div>
        <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:6px;">لا توجد أصناف في المنيو بعد</div>
        <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:20px; max-width:320px; margin-left:auto; margin-right:auto;">
          ابدأ بإضافة أول صنف أو وجبة في منيو مطعمك وحدد السعر والصورة والأقسام بسهولة
        </div>
        <button type="button" class="btn btn-primary" onclick="openProductModal(null)" style="padding:10px 22px; font-weight:800; font-size:0.9rem;">
          + إضافة أول صنف الآن
        </button>
      </div>
    `;
    return;
  }

  adminElements.catalogContainer.innerHTML = prods.map(p => `
    <div class="admin-product-card ${p.visible === false ? 'hidden-item' : ''}" data-id="${p.id}" style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden; display:flex; flex-direction:column;">
      <div style="position:relative; width:100%; height:140px; background:var(--bg);">
        <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" style="width:100%; height:100%; object-fit:cover;">
        ${p.badge ? `<span style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.75); color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">${p.badge}</span>` : ''}
        ${p.isFeatured ? `<span style="position:absolute; top:8px; left:8px; background:var(--primary); color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">👑 هيرو</span>` : ''}
      </div>

      <div style="padding:12px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="font-size:11px; color:var(--text-muted); margin-bottom:2px;">${p.category}</div>
          <div style="font-size:14px; font-weight:800; color:var(--text-main); line-height:1.3; margin-bottom:6px;">${p.name}</div>
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
            <input type="number" class="form-input font-num" value="${p.price}" step="0.5" style="padding:4px 8px; font-size:13px; font-weight:800; max-width:80px;" onchange="updateProductPriceFast('${p.id}', this.value)">
            <span class="font-num" style="font-size:12px; font-weight:700; color:var(--primary);">${currency}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:10px; margin-top:8px; gap:8px;">
          <button class="btn btn-ghost btn-sm btn-admin-action btn-visibility-toggle ${p.visible === false ? 'btn-hidden-state' : ''}" onclick="toggleProductVisibilityFast('${p.id}', this)" title="${p.visible === false ? 'إظهار الصنف في المنيو' : 'إخفاء الصنف من المنيو'}" style="display:inline-flex; align-items:center; gap:5px; font-weight:700; font-size:12px; padding:5px 9px;">
            ${p.visible === false 
              ? `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg><span>مخفي</span>`
              : `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#22c55e;"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><span>ظاهر</span>`
            }
          </button>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="btn btn-ghost btn-sm btn-admin-action" onclick="openProductModal('${p.id}')" title="تعديل بيانات الصنف" style="display:inline-flex; align-items:center; gap:5px; font-weight:700; font-size:12px; padding:5px 10px;">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              <span>تعديل</span>
            </button>
            <button class="btn btn-ghost btn-sm btn-admin-action btn-admin-delete" onclick="deleteProductFast('${p.id}')" title="حذف الصنف نهائياً" style="color:var(--danger); padding:5px 8px; border-radius:6px;">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

window.updateProductPriceFast = async function(id, newPrice) {
  const num = parseFloat(newPrice);
  if (isNaN(num) || num < 0) return;
  await Store.updateProduct(id, { price: num });
};

window.toggleProductVisibilityFast = async function(id, btnElement) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === id);
  if (!p) return;

  const newVis = p.visible === false;
  
  // Instant DOM update on the specific product card (0ms latency, single click)
  const card = document.querySelector(`.admin-product-card[data-id="${id}"]`);
  const btn = btnElement || (card ? card.querySelector('.btn-visibility-toggle') : null);

  if (card) {
    card.classList.toggle('hidden-item', !newVis);
  }
  if (btn) {
    btn.classList.toggle('btn-hidden-state', !newVis);
    btn.title = newVis ? 'إخفاء الصنف من المنيو' : 'إظهار الصنف في المنيو';
    btn.innerHTML = newVis 
      ? `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#22c55e;"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><span>ظاهر</span>`
      : `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg><span>مخفي</span>`;
  }

  await Store.updateProduct(id, { visible: newVis });
};

window.deleteProductFast = async function(id) {
  const p = Store.getProducts().find(item => item.id === id);
  const name = p ? p.name : 'هذا الصنف';
  const confirmed = await showCustomConfirm({
    title: "حذف صنف من المنيو",
    message: `هل أنت متأكد من رغبتك في حذف الصنف "<strong>${name}</strong>" نهائياً من المنيو؟`,
    icon: "🍔",
    confirmText: "حذف الصنف 🗑️",
    cancelText: "إلغاء",
    isDanger: true
  });
  if (confirmed) {
    await Store.deleteProduct(id);
    renderCatalog();
    showToastNotification("تم حذف الصنف بنجاح ✓", "success");
  }
};

function openProductModal(productId) {
  currentEditingProductId = productId;
  const cats = Store.getCategories();

  if (adminElements.prodCategory) {
    adminElements.prodCategory.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  if (adminElements.prodSizesList) adminElements.prodSizesList.innerHTML = '';
  if (adminElements.prodAddonsList) adminElements.prodAddonsList.innerHTML = '';

  if (productId) {
    const p = Store.getProducts().find(i => i.id === productId);
    if (!p) return;
    if (adminElements.productModalTitle) adminElements.productModalTitle.textContent = "تعديل الصنف";
    if (adminElements.prodId) adminElements.prodId.value = p.id;
    if (adminElements.prodName) adminElements.prodName.value = p.name || '';
    if (adminElements.prodCategory) adminElements.prodCategory.value = p.category || cats[0];
    if (adminElements.prodPrice) adminElements.prodPrice.value = p.price || 0;
    if (adminElements.prodOriginalPrice) adminElements.prodOriginalPrice.value = p.originalPrice || '';
    if (adminElements.prodPrepTime) adminElements.prodPrepTime.value = p.prepTime || '';
    if (adminElements.prodBadge) adminElements.prodBadge.value = p.badge || '';
    if (adminElements.prodFeatured) adminElements.prodFeatured.checked = !!p.isFeatured;
    if (adminElements.prodDesc) adminElements.prodDesc.value = p.desc || '';
    if (adminElements.prodImgUrl) adminElements.prodImgUrl.value = p.image || '';

    if (p.sizes && p.sizes.length > 0) {
      p.sizes.forEach(s => addSizeRow(s.name, s.price));
    }
    if (p.addons && p.addons.length > 0) {
      p.addons.forEach(a => addAddonRow(a.name, a.price));
    }

    if (prodImageUploader) {
      if (p.image) prodImageUploader.showPreview(p.image);
      else prodImageUploader.clearPreview();
    }
  } else {
    if (adminElements.productModalTitle) adminElements.productModalTitle.textContent = "إضافة صنف جديد";
    if (adminElements.productForm) adminElements.productForm.reset();
    if (adminElements.prodId) adminElements.prodId.value = '';
    if (adminElements.prodFeatured) adminElements.prodFeatured.checked = false;
    if (prodImageUploader) prodImageUploader.clearPreview();
  }

  if (adminElements.productModal) adminElements.productModal.classList.add('open');
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.classList.add('open');
  pushAdminNavState('admin_product');
}

function closeProductModal(triggerHistoryBack = true) {
  currentEditingProductId = null;
  if (adminElements.productModal) adminElements.productModal.classList.remove('open');
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.adminNav === 'admin_product') {
    try { history.back(); } catch(e) {}
  }
}

function addSizeRow(name = '', price = 0) {
  if (!adminElements.prodSizesList) return;
  const div = document.createElement('div');
  div.className = 'size-row-item';
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-input size-name-input" placeholder="اسم الحجم (مثال: سنجل / لارج)" value="${name}" style="flex:1; padding:6px 10px; font-size:12px;">
    <input type="number" class="form-input font-num size-price-input" placeholder="+السعر" value="${price}" step="0.5" style="width:80px; padding:6px 8px; font-size:12px;">
    <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px;" onclick="this.parentElement.remove()">✕</button>
  `;
  adminElements.prodSizesList.appendChild(div);
}

function addAddonRow(name = '', price = 10) {
  if (!adminElements.prodAddonsList) return;
  const div = document.createElement('div');
  div.className = 'addon-row-item';
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-input addon-name-input" placeholder="اسم الإضافة (مثال: جبنة زيادة)" value="${name}" style="flex:1; padding:6px 10px; font-size:12px;">
    <input type="number" class="form-input font-num addon-price-input" placeholder="السعر" value="${price}" step="0.5" style="width:80px; padding:6px 8px; font-size:12px;">
    <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px;" onclick="this.parentElement.remove()">✕</button>
  `;
  adminElements.prodAddonsList.appendChild(div);
}

async function saveProductForm() {
  const submitBtn = adminElements.productForm ? adminElements.productForm.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

  const id = adminElements.prodId?.value || ('p_' + Date.now());
  const name = (adminElements.prodName?.value || '').trim();
  const category = adminElements.prodCategory?.value || 'عام';
  const price = parseFloat(adminElements.prodPrice?.value) || 0;
  const originalPrice = parseFloat(adminElements.prodOriginalPrice?.value) || 0;
  const prepTime = (adminElements.prodPrepTime?.value || '').trim();
  const badge = (adminElements.prodBadge?.value || '').trim();
  const isFeatured = adminElements.prodFeatured?.checked === true;
  const desc = (adminElements.prodDesc?.value || '').trim();
  const image = (adminElements.prodImgUrl?.value || '').trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";

  if (!name) {
    showToastNotification("يرجى كتابة اسم الصنف أولاً", "error");
    if (adminElements.prodName) adminElements.prodName.focus();
    return;
  }

  // Collect sizes
  const sizes = [];
  document.querySelectorAll('.size-row-item').forEach((row, idx) => {
    const sName = (row.querySelector('.size-name-input')?.value || '').trim();
    const sPrice = parseFloat(row.querySelector('.size-price-input')?.value) || 0;
    if (sName) {
      sizes.push({ id: 's_' + idx, name: sName, price: sPrice });
    }
  });

  // Collect addons
  const addons = [];
  document.querySelectorAll('.addon-row-item').forEach((row, idx) => {
    const aName = (row.querySelector('.addon-name-input')?.value || '').trim();
    const aPrice = parseFloat(row.querySelector('.addon-price-input')?.value) || 0;
    if (aName) {
      addons.push({ id: 'a_' + idx, name: aName, price: aPrice });
    }
  });

  const productData = {
    id,
    name,
    category,
    price,
    originalPrice,
    prepTime,
    badge,
    isFeatured,
    desc,
    image,
    sizes,
    addons,
    visible: true
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري الحفظ... ⏳';
  }

  try {
    if (currentEditingProductId) {
      await Store.updateProduct(currentEditingProductId, productData);
      showToastNotification("تم حفظ وتحديث بيانات الصنف بنجاح! ✓", "success");
    } else {
      await Store.addProduct(productData);
      showToastNotification("تمت إضافة الصنف الجديد بنجاح! ✓", "success");
    }
    closeProductModal();
    renderCatalog();
  } catch (err) {
    console.error("[Admin] Product save error:", err);
    showToastNotification("حدث خطأ أثناء حفظ الصنف: " + err.message, "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// ── Categories Management ──────────────────────────────────
function setupCategoryManagement() {
  if (adminElements.btnAddCat) {
    adminElements.btnAddCat.addEventListener('click', async () => {
      const val = (adminElements.newCatInput.value || '').trim();
      if (!val) return;
      const cats = Store.getCategories();
      if (!cats.includes(val)) {
        cats.push(val);
        adminElements.btnAddCat.disabled = true;
        await Store.saveCategories(cats);
        adminElements.btnAddCat.disabled = false;
        adminElements.newCatInput.value = '';
        renderCategoriesList();
        showToastNotification("تمت إضافة القسم الجديد بنجاح! ✓", "success");
      }
    });
  }
}

function renderCategoriesList() {
  if (!adminElements.categoriesListContainer) return;
  const cats = Store.getCategories();
  const prods = Store.getProducts();

  if (cats.length === 0) {
    adminElements.categoriesListContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-muted);">
        لا توجد أقسام مسجلة بعد. أضف أول قسم في الأعلى!
      </div>
    `;
    return;
  }

  adminElements.categoriesListContainer.innerHTML = cats.map(cat => {
    const count = prods.filter(p => p.category === cat).length;
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface-raised); border:1px solid var(--border); padding:12px 16px; border-radius:var(--radius-sm); min-height:52px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:14px; font-weight:800; color:var(--text-main);">${cat}</span>
          <span style="font-size:11px; background:var(--primary-subtle); color:var(--primary); padding:2px 8px; border-radius:10px; font-weight:700;">${count} صنف</span>
        </div>
        <button class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px; border-radius:6px;" onclick="deleteCategoryFast('${cat}')" title="حذف القسم">
          <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    `;
  }).join('');
}

window.deleteCategoryFast = async function(cat) {
  const confirmed = await showCustomConfirm({
    title: "حذف قسم من المنيو",
    message: `هل أنت متأكد من رغبتك في حذف قسم "<strong>${cat}</strong>"؟`,
    icon: "📂",
    confirmText: "حذف القسم 🗑️",
    cancelText: "إلغاء",
    isDanger: true
  });
  if (confirmed) {
    const cats = Store.getCategories().filter(c => c !== cat);
    await Store.saveCategories(cats);
    renderCategoriesList();
    showToastNotification("تم حذف القسم بنجاح ✓", "success");
  }
};

// ── Stories Management ─────────────────────────────────────
function setupStoriesManagement() {
  storyImageUploader = bindDeviceImageUploader({
    dropzoneId: 'story-image-dropzone',
    fileInputId: 'story-img-file',
    promptId: 'story-image-prompt',
    previewWrapId: 'story-preview-wrap',
    previewImgId: 'story-preview-img',
    removeBtnId: 'btn-remove-story-img',
    hiddenUrlInputId: 'story-img-url'
  });

  if (adminElements.btnOpenAddStory) {
    adminElements.btnOpenAddStory.addEventListener('click', () => openStoryModal(null));
  }
  if (adminElements.btnCloseStoryModal) {
    adminElements.btnCloseStoryModal.addEventListener('click', closeStoryModal);
  }
  if (adminElements.btnCancelStory) {
    adminElements.btnCancelStory.addEventListener('click', closeStoryModal);
  }
  if (adminElements.storyModalBackdrop) {
    adminElements.storyModalBackdrop.addEventListener('click', closeStoryModal);
  }

  if (adminElements.storyForm) {
    adminElements.storyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveStoryForm();
    });
  }
}

function renderStoriesList() {
  if (!adminElements.adminStoriesContainer) return;
  const stories = Store.getStories();

  if (stories.length === 0) {
    adminElements.adminStoriesContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-muted);">لا توجد قصص مسجلة حالياً.</div>`;
    return;
  }

  adminElements.adminStoriesContainer.innerHTML = stories.map(s => `
    <div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; display:flex; gap:12px; align-items:center;">
      <img src="${s.image}" alt="${s.title}" loading="lazy" decoding="async" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);">
      <div style="flex:1;">
        <div style="font-size:13.5px; font-weight:800; color:var(--text-main);">${s.title}</div>
        <div style="font-size:11.5px; color:var(--text-muted);">${s.tagline || 'بدون نص ترويجي'}</div>
        ${s.badge ? `<span style="font-size:10px; background:var(--primary-subtle); color:var(--primary); padding:1px 6px; border-radius:4px; font-weight:700;">${s.badge}</span>` : ''}
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <button class="btn btn-ghost btn-sm" onclick="openStoryModal('${s.id}')">✏️</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="deleteStoryFast('${s.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openStoryModal(storyId) {
  currentEditingStoryId = storyId;
  const prods = Store.getProducts();

  if (adminElements.storyProductSelect) {
    adminElements.storyProductSelect.innerHTML = `<option value="">-- بدون ربط بمنتج --</option>` +
      prods.map(p => `<option value="${p.id}">${p.name} (${p.price} ج.م)</option>`).join('');
  }

  if (storyId) {
    const s = Store.getStories().find(i => i.id === storyId);
    if (!s) return;
    if (adminElements.storyModalTitle) adminElements.storyModalTitle.textContent = "تعديل القصة / العرض";
    if (adminElements.storyId) adminElements.storyId.value = s.id;
    if (adminElements.storyTitleInput) adminElements.storyTitleInput.value = s.title || '';
    if (adminElements.storyTaglineInput) adminElements.storyTaglineInput.value = s.tagline || '';
    if (adminElements.storyBadgeInput) adminElements.storyBadgeInput.value = s.badge || '';
    if (adminElements.storyProductSelect) adminElements.storyProductSelect.value = s.productId || '';
    if (adminElements.storyDescInput) adminElements.storyDescInput.value = s.desc || '';
    if (adminElements.storyImgUrl) adminElements.storyImgUrl.value = s.image || '';

    if (storyImageUploader) {
      if (s.image) storyImageUploader.showPreview(s.image);
      else storyImageUploader.clearPreview();
    }
  } else {
    if (adminElements.storyModalTitle) adminElements.storyModalTitle.textContent = "إضافة قصة / عرض جديد";
    if (adminElements.storyForm) adminElements.storyForm.reset();
    if (adminElements.storyId) adminElements.storyId.value = '';
    if (storyImageUploader) storyImageUploader.clearPreview();
  }

  if (adminElements.storyModal) adminElements.storyModal.classList.add('open');
  if (adminElements.storyModalBackdrop) adminElements.storyModalBackdrop.classList.add('open');
  pushAdminNavState('admin_story');
}

function closeStoryModal(triggerHistoryBack = true) {
  currentEditingStoryId = null;
  if (adminElements.storyModal) adminElements.storyModal.classList.remove('open');
  if (adminElements.storyModalBackdrop) adminElements.storyModalBackdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.adminNav === 'admin_story') {
    try { history.back(); } catch(e) {}
  }
}

async function saveStoryForm() {
  const submitBtn = adminElements.storyForm ? adminElements.storyForm.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

  const id = adminElements.storyId?.value || ('s_' + Date.now());
  const title = (adminElements.storyTitleInput?.value || '').trim();
  const tagline = (adminElements.storyTaglineInput?.value || '').trim();
  const badge = (adminElements.storyBadgeInput?.value || '').trim();
  const productId = adminElements.storyProductSelect?.value || '';
  const desc = (adminElements.storyDescInput?.value || '').trim();
  const image = (adminElements.storyImgUrl?.value || '').trim();

  if (!title) {
    showToastNotification("يرجى كتابة عنوان القصة", "error");
    return;
  }

  const storyData = { id, title, tagline, badge, productId, desc, image };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري الحفظ... ⏳';
  }

  try {
    if (currentEditingStoryId) {
      await Store.updateStory(currentEditingStoryId, storyData);
      showToastNotification("تم تحديث القصة بنجاح! ✓", "success");
    } else {
      await Store.addStory(storyData);
      showToastNotification("تمت إضافة القصة بنجاح! ✓", "success");
    }
    closeStoryModal();
    renderStoriesList();
  } catch (err) {
    showToastNotification("حدث خطأ أثناء حفظ القصة", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

window.deleteStoryFast = async function(id) {
  const confirmed = await showCustomConfirm({
    title: "حذف القصة / العرض",
    message: "هل أنت متأكد من رغبتك في حذف هذه القصة أو العرض الترويجي؟",
    icon: "⭐",
    confirmText: "حذف القصة 🗑️",
    cancelText: "إلغاء",
    isDanger: true
  });
  if (confirmed) {
    await Store.deleteStory(id);
    renderStoriesList();
    showToastNotification("تم حذف القصة بنجاح ✓", "success");
  }
};

// ── Backup & Restore JSON ──────────────────────────────────
function setupBackupAndRestore() {
  if (adminElements.btnExportBackup) {
    adminElements.btnExportBackup.addEventListener('click', () => {
      const json = Store.exportAllDataJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harpy_order_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (adminElements.importFileInput) {
    adminElements.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          await Store.importAllDataJSON(ev.target.result);
          showToastNotification("تم استرجاع كافة بيانات المنيو بنجاح! 📦", "success");
          loadAllDashboardData();
        } catch (err) {
          showToastNotification("حدث خطأ أثناء استرجاع الملف: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    });
  }

  if (adminElements.btnFactoryReset) {
    adminElements.btnFactoryReset.addEventListener('click', async () => {
      const slug = Store.getRestaurantSlug();
      const promptVal = prompt(`تحذير أمني: سيتم مسح كافة التعديلات واستعادة المنيو الافتراضي للمطعم (${slug}).
لتأكيد العملية، يرجى كتابة اسم معرف المطعم (${slug}):`);
      if (promptVal === slug) {
        try {
          await Store.resetAllDataToDefault(slug);
          showToastNotification("تمت استعادة إعدادات المصنع بنجاح!", "success");
          loadAllDashboardData();
        } catch (err) {
          showToastNotification("فشل إعادة التعيين: " + err.message, "error");
        }
      } else if (promptVal !== null) {
        showToastNotification("معرف المطعم غير مطابق. تم إلغاء العملية بأمان.", "warning");
      }
    });
  }
}

// ── Settings & Identity Studio ─────────────────────────────
function setupSettingsForm() {
  logoImageUploader = bindDeviceImageUploader({
    dropzoneId: 'logo-dropzone',
    fileInputId: 'set-logo-file',
    promptId: 'logo-prompt',
    previewWrapId: 'logo-preview-wrap',
    previewImgId: 'logo-preview-img',
    removeBtnId: 'btn-remove-logo',
    hiddenUrlInputId: 'set-logo-url'
  });

  coverImageUploader = bindDeviceImageUploader({
    dropzoneId: 'cover-dropzone',
    fileInputId: 'set-cover-file',
    promptId: 'cover-prompt',
    previewWrapId: 'cover-preview-wrap',
    previewImgId: 'cover-preview-img',
    removeBtnId: 'btn-remove-cover',
    hiddenUrlInputId: 'set-cover-url'
  });

  if (adminElements.themePresetsGrid) {
    adminElements.themePresetsGrid.innerHTML = Object.values(THEME_PRESETS).map(preset => `
      <div class="theme-preset-card" data-preset="${preset.id}" onclick="applyPresetToPickers('${preset.id}')" style="background:var(--surface); border:1px solid var(--border); padding:10px; border-radius:var(--radius-xs); cursor:pointer; transition:all 0.15s ease;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span style="width:14px; height:14px; border-radius:50%; background:${preset.primary};"></span>
          <span style="font-size:12px; font-weight:800; color:var(--text-main);">${preset.name}</span>
        </div>
        <div style="font-size:10.5px; color:var(--text-muted);">${preset.badge}</div>
      </div>
    `).join('');
    updateThemePresetCardsUI();
  }

  if (adminElements.btnAddPromoCode) {
    adminElements.btnAddPromoCode.addEventListener('click', async () => {
      const code = (adminElements.newPromoCode?.value || '').trim().toUpperCase();
      const type = adminElements.newPromoType?.value || 'percent';
      const val = parseFloat(adminElements.newPromoVal?.value) || 0;

      if (!code || val <= 0) {
        showToastNotification("يرجى إدخال كود وقيمة صحيحة للكوبون", "error");
        return;
      }

      const settings = Store.getSettings();
      settings.promoCodes = settings.promoCodes || [];
      settings.promoCodes.push({ code, type, value: val, desc: `خصم ${val}${type === 'percent' ? '%' : ' ج.م'}` });
      await Store.saveSettings(settings);

      if (adminElements.newPromoCode) adminElements.newPromoCode.value = '';
      if (adminElements.newPromoVal) adminElements.newPromoVal.value = '';
      renderPromoCodesList(settings.promoCodes);
      showToastNotification("تمت إضافة كود الخصم بنجاح! ✓", "success");
    });
  }

  if (adminElements.btnAddDeliveryZone) {
    adminElements.btnAddDeliveryZone.addEventListener('click', async () => {
      const name = (adminElements.newZoneName?.value || '').trim();
      const rawKeywords = (adminElements.newZoneKeywords?.value || '').trim();
      const fee = parseFloat(adminElements.newZoneFee?.value);

      if (!name) {
        showToastNotification("يرجى كتابة اسم المنطقة أو النطاق", "error");
        adminElements.newZoneName?.focus();
        return;
      }
      if (isNaN(fee) || fee < 0) {
        showToastNotification("يرجى تحديد سعر توصيل صحيح للمنطقة", "error");
        adminElements.newZoneFee?.focus();
        return;
      }

      // Support separating keywords with commas, Arabic commas, hyphens/dashes, slashes, or newlines
      const keywords = rawKeywords
        ? rawKeywords.split(/[,،\-\/\|—–\n\r;]+/).map(k => k.trim()).filter(Boolean)
        : [name];

      // Ensure zone name itself is included in matching keywords
      if (!keywords.includes(name)) {
        keywords.unshift(name);
      }

      const settings = Store.getSettings();
      settings.deliverySettings = settings.deliverySettings || { defaultFee: 15, customZones: [] };
      settings.deliverySettings.customZones = settings.deliverySettings.customZones || [];
      settings.deliverySettings.customZones.push({
        name,
        keywords,
        fee
      });

      await Store.saveSettings(settings);

      if (adminElements.newZoneName) adminElements.newZoneName.value = '';
      if (adminElements.newZoneKeywords) adminElements.newZoneKeywords.value = '';
      if (adminElements.newZoneFee) adminElements.newZoneFee.value = '';

      renderDeliveryZonesList(settings.deliverySettings.customZones);
      showToastNotification(`تمت إضافة نطاق "${name}" بسعر ${fee} ج.م بنجاح! ✓`, "success");
    });
  }

  if (adminElements.settingsForm) {
    adminElements.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsFromForm();
    });
  }
}

function updateThemePresetCardsUI(selectedPresetId) {
  const s = Store.getSettings();
  const currentId = selectedPresetId || s.themePreset || 'charcoal';
  const cards = document.querySelectorAll('.theme-preset-card');
  cards.forEach(card => {
    const isSelected = card.getAttribute('data-preset') === currentId;
    card.style.border = isSelected ? '2px solid var(--primary)' : '1px solid var(--border)';
    card.style.background = isSelected ? 'var(--surface-raised)' : 'var(--surface)';
    card.style.boxShadow = isSelected ? '0 0 10px var(--primary-glow)' : 'none';
  });
}

window.applyPresetToPickers = async function(presetId) {
  const p = THEME_PRESETS[presetId];
  if (!p) return;
  if (adminElements.pickerBg) adminElements.pickerBg.value = p.bg;
  if (adminElements.pickerSurface) adminElements.pickerSurface.value = p.surface;
  if (adminElements.pickerPrimary) adminElements.pickerPrimary.value = p.primary;
  if (adminElements.pickerText) adminElements.pickerText.value = p.textMain;

  const current = Store.getSettings();
  current.themePreset = presetId;
  current.siteColors = { ...p };
  await Store.saveSettings(current);
  updateThemePresetCardsUI(presetId);
  showToastNotification(`تم تطبيق ثيم "${p.name}" والمزامنة بنجاح ✓`, "success");
};

function loadSettingsIntoForm() {
  const s = Store.getSettings();
  if (adminElements.adminStoreName) adminElements.adminStoreName.textContent = `إدارة: ${s.storeName || "منيو المطعم"}`;

  if (adminElements.setStoreName) adminElements.setStoreName.value = s.storeName || '';
  if (adminElements.setStoreTagline) adminElements.setStoreTagline.value = s.storeTagline || '';
  if (adminElements.setCurrency) adminElements.setCurrency.value = s.currency || 'ج.م';
  if (adminElements.setWhatsapp) adminElements.setWhatsapp.value = s.whatsappNumber || '';
  if (adminElements.setWalletNumber) adminElements.setWalletNumber.value = s.walletNumber || '';
  if (adminElements.setWalletName) adminElements.setWalletName.value = s.walletName || '';
  if (adminElements.setImgbbKey) adminElements.setImgbbKey.value = s.imgbbApiKey || '';
  
  const logoInput = document.getElementById('set-logo-url');
  if (logoInput) logoInput.value = s.logo || '';
  if (logoImageUploader) {
    if (s.logo) logoImageUploader.showPreview(s.logo);
    else logoImageUploader.clearPreview();
  }

  const coverInput = document.getElementById('set-cover-url');
  if (coverInput) coverInput.value = s.cover || '';
  if (coverImageUploader) {
    if (s.cover) coverImageUploader.showPreview(s.cover);
    else coverImageUploader.clearPreview();
  }

  if (s.siteColors) {
    if (adminElements.pickerBg && s.siteColors.bg) adminElements.pickerBg.value = s.siteColors.bg;
    if (adminElements.pickerSurface && s.siteColors.surface) adminElements.pickerSurface.value = s.siteColors.surface;
    if (adminElements.pickerPrimary && s.siteColors.primary) adminElements.pickerPrimary.value = s.siteColors.primary;
    if (adminElements.pickerText && s.siteColors.textMain) adminElements.pickerText.value = s.siteColors.textMain;
  }

  if (adminElements.setEnableWalletDiscount) adminElements.setEnableWalletDiscount.checked = s.enableWalletDiscount !== false;
  if (adminElements.setWalletDiscountType) adminElements.setWalletDiscountType.value = s.walletDiscountType || 'percent';
  if (adminElements.setWalletDiscountVal) adminElements.setWalletDiscountVal.value = s.walletDiscountValue !== undefined ? s.walletDiscountValue : 10;

  if (adminElements.setEnableSpendTier) adminElements.setEnableSpendTier.checked = s.enableSpendTierDiscount !== false;
  if (adminElements.setSpendMinAmount) adminElements.setSpendMinAmount.value = s.spendTierMinAmount || 300;
  if (adminElements.setSpendDiscountType) adminElements.setSpendDiscountType.value = s.spendTierDiscountType || 'percent';
  if (adminElements.setSpendDiscountVal) adminElements.setSpendDiscountVal.value = s.spendTierDiscountValue || 15;

  if (adminElements.setDeliveryTime) adminElements.setDeliveryTime.value = s.deliveryTime || '';
  if (adminElements.setShowAnnouncement) adminElements.setShowAnnouncement.checked = s.showAnnouncement === true;
  if (adminElements.setAnnouncementText) adminElements.setAnnouncementText.value = s.announcementText || '';
  if (adminElements.setOrderingPaused) adminElements.setOrderingPaused.checked = s.isOrderingPaused === true;
  if (adminElements.setOrderingPausedMsg) adminElements.setOrderingPausedMsg.value = s.orderingPausedMessage || '';

  const ds = s.deliverySettings || { defaultFee: (s.deliveryFee !== undefined ? s.deliveryFee : 15), customZones: [] };
  if (adminElements.setDefaultDeliveryFee) {
    adminElements.setDefaultDeliveryFee.value = ds.defaultFee !== undefined ? ds.defaultFee : 15;
  }
  renderDeliveryZonesList(ds.customZones || []);

  renderPromoCodesList(s.promoCodes || []);
  updateThemePresetCardsUI(s.themePreset);
}

function renderDeliveryZonesList(zones = []) {
  if (!adminElements.deliveryZonesList) return;
  if (!zones || zones.length === 0) {
    adminElements.deliveryZonesList.innerHTML = `
      <div style="font-size:11.5px; color:var(--text-muted); padding:6px 0;">
        لا توجد نطاقات مخصصة مضافة حالياً. (يطبق السعر الموحد على كافة الأماكن)
      </div>
    `;
    return;
  }
  adminElements.deliveryZonesList.innerHTML = zones.map((z, idx) => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-raised); border:1px solid var(--border); padding:8px 12px; border-radius:6px; font-size:12px; gap:8px;">
      <div style="min-width:0;">
        <div style="font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span>${z.name}</span>
          <span class="font-num" style="color:var(--primary); font-weight:900;">${parseFloat(z.fee).toFixed(0)} ج.م</span>
        </div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
          الكلمات: <span style="color:var(--text-body); font-weight:600;">${(z.keywords || []).join('، ')}</span>
        </div>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px; font-weight:800; flex-shrink:0;" onclick="deleteDeliveryZoneFast(${idx})">✕ حذف</button>
    </div>
  `).join('');
}

window.deleteDeliveryZoneFast = async function(index) {
  const settings = Store.getSettings();
  settings.deliverySettings = settings.deliverySettings || { defaultFee: 15, customZones: [] };
  settings.deliverySettings.customZones = settings.deliverySettings.customZones || [];
  settings.deliverySettings.customZones.splice(index, 1);
  await Store.saveSettings(settings);
  renderDeliveryZonesList(settings.deliverySettings.customZones);
  showToastNotification("تم حذف النطاق السعري بنجاح ✓", "success");
};

function renderPromoCodesList(promos) {
  if (!adminElements.promoCodesList) return;
  adminElements.promoCodesList.innerHTML = promos.map((p, idx) => `
    <div style="display:flex; align-items:center; gap:6px; background:var(--surface); border:1px solid var(--border); padding:4px 10px; border-radius:4px; font-size:12px;">
      <span class="font-num" style="font-weight:800; color:var(--primary);">${p.code}</span>
      <span style="color:var(--text-muted);">(${p.value}${p.type === 'percent' ? '%' : ' ج.م'})</span>
      <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:0 4px;" onclick="deletePromoFast(${idx})">✕</button>
    </div>
  `).join('');
}

window.deletePromoFast = async function(index) {
  const settings = Store.getSettings();
  settings.promoCodes.splice(index, 1);
  await Store.saveSettings(settings);
  renderPromoCodesList(settings.promoCodes);
  showToastNotification("تم حذف كود الخصم ✓", "success");
};

async function saveSettingsFromForm() {
  const submitBtn = adminElements.settingsForm ? adminElements.settingsForm.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

  const newWhatsApp = (adminElements.setWhatsapp?.value || '').replace(/\D/g, '');
  if (newWhatsApp && newWhatsApp.length < 10) {
    showToastNotification('رقم الواتساب غير صحيح — يجب أن يكون 10 أرقام على الأقل', 'error');
    adminElements.setWhatsapp?.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري حفظ الإعدادات... ⏳';
  }

  try {
    const current = Store.getSettings();
    const activePresetId = current.themePreset || 'charcoal';
    const fallbackColors = THEME_PRESETS[activePresetId] || THEME_PRESETS.charcoal;
    const siteColors = current.siteColors ? { ...current.siteColors } : { ...fallbackColors };

    if (adminElements.pickerPrimary?.value) siteColors.primary = adminElements.pickerPrimary.value;
    if (adminElements.pickerBg?.value) siteColors.bg = adminElements.pickerBg.value;
    if (adminElements.pickerSurface?.value) siteColors.surface = adminElements.pickerSurface.value;
    if (adminElements.pickerText?.value) siteColors.textMain = adminElements.pickerText.value;

    const updated = {
      ...current,
      storeName: (adminElements.setStoreName?.value || '').trim(),
      storeTagline: (adminElements.setStoreTagline?.value || '').trim(),
      currency: (adminElements.setCurrency?.value || '').trim() || 'ج.م',
      whatsappNumber: (adminElements.setWhatsapp?.value || '').trim(),
      walletNumber: (adminElements.setWalletNumber?.value || '').trim(),
      walletName: (adminElements.setWalletName?.value || '').trim(),
      logo: (document.getElementById('set-logo-url')?.value || '').trim(),
      cover: (document.getElementById('set-cover-url')?.value || '').trim(),
      imgbbApiKey: (adminElements.setImgbbKey?.value || '').trim(),

      deliveryTime: (adminElements.setDeliveryTime?.value || '').trim() || '30-45 دقيقة',
      showAnnouncement: adminElements.setShowAnnouncement?.checked === true,
      announcementText: (adminElements.setAnnouncementText?.value || '').trim(),
      isOrderingPaused: adminElements.setOrderingPaused?.checked === true,
      orderingPausedMessage: (adminElements.setOrderingPausedMsg?.value || '').trim(),

      themePreset: activePresetId,
      siteColors: siteColors,

      deliverySettings: {
        defaultFee: isNaN(parseFloat(adminElements.setDefaultDeliveryFee?.value)) ? 15 : parseFloat(adminElements.setDefaultDeliveryFee?.value),
        customZones: (current.deliverySettings && current.deliverySettings.customZones) ? current.deliverySettings.customZones : []
      },
      deliveryFee: isNaN(parseFloat(adminElements.setDefaultDeliveryFee?.value)) ? 15 : parseFloat(adminElements.setDefaultDeliveryFee?.value),

      enableWalletDiscount: adminElements.setEnableWalletDiscount?.checked === true,
      walletDiscountType: adminElements.setWalletDiscountType?.value || 'percent',
      walletDiscountValue: parseFloat(adminElements.setWalletDiscountVal?.value) || 0,

      enableSpendTierDiscount: adminElements.setEnableSpendTier?.checked === true,
      spendTierMinAmount: parseFloat(adminElements.setSpendMinAmount?.value) || 0,
      spendTierDiscountType: adminElements.setSpendDiscountType?.value || 'percent',
      spendTierDiscountValue: parseFloat(adminElements.setSpendDiscountVal?.value) || 0
    };

    const res = await Store.saveSettings(updated);
    if (res && res.success) {
      showToastNotification("تم حفظ وتحديث كافة الإعدادات بنجاح! ✓", "success");
    } else {
      showToastNotification("تم حفظ وتحديث الإعدادات بنجاح! ✓", "success");
    }
    loadSettingsIntoForm();
    checkOnboardingSetup();
    renderRestaurantHub();
  } catch (err) {
    console.error("[Admin] Settings save error:", err);
    showToastNotification("حدث خطأ أثناء الحفظ: " + (err.message || 'فشل الاتصال'), "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
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

function setupSubscriptionWatcher() {
  const suspendedBackdrop = document.getElementById('subscription-suspended-backdrop');
  const suspendedOverlay = document.getElementById('subscription-suspended-overlay');
  const contactBtn = document.getElementById('admin-sub-contact-btn');
  const msgEl = document.getElementById('admin-sub-suspended-msg');
  const titleEl = document.getElementById('admin-sub-suspended-title');
  const iconEl = document.getElementById('admin-sub-suspended-icon');

  const slug = Store.getRestaurantSlug();
  const cachedStatus = localStorage.getItem(`harpy_${slug}_sub_status`);

  const applyAdminStatusUI = (statusReason) => {
    document.body.classList.add('harpy-account-locked');
    if (suspendedBackdrop) suspendedBackdrop.classList.add('active');
    if (suspendedOverlay) suspendedOverlay.classList.add('active');

    if (statusReason === 'deleted') {
      if (iconEl) iconEl.textContent = '🗑️';
      if (titleEl) titleEl.textContent = 'تم حذف حساب هذا المطعم نهائياً';
      if (msgEl) msgEl.textContent = 'تم حذف بيانات وترخيص هذا المطعم نهائياً من المنصة، ولم يعد متاحاً.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201019971508?text=${encodeURIComponent(`مرحباً إدارة هاربي، أود الاستفسار عن إنشاء مطعم جديد بدلاً من (${slug})`)}`;
        contactBtn.textContent = '💬 تواصل مع الإدارة لإنشاء حساب جديد';
      }
    } else if (statusReason === 'expired') {
      if (iconEl) iconEl.textContent = '⏳';
      if (titleEl) titleEl.textContent = 'انتهت صلاحية اشتراك هذا المطعم';
      if (msgEl) msgEl.textContent = 'انتهت صلاحية اشتراك هذا المطعم. يرجى تجديد الباقة لاستئناف استقبال طلبات الزبائن وتعديل المنيو.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201019971508?text=${encodeURIComponent(`مرحباً إدارة هاربي، أود تجديد اشتراك مطعمي (${slug})`)}`;
        contactBtn.textContent = '💬 تواصل مع الإدارة لتجديد الاشتراك';
      }
    } else {
      if (iconEl) iconEl.textContent = '❄️';
      if (titleEl) titleEl.textContent = 'حساب المطعم مجمّد / موقوف مؤقتاً';
      if (msgEl) msgEl.textContent = 'تم تجميد وإيقاف اشتراك هذا المطعم مؤقتاً من قبل الإدارة. يرجى التواصل لإلغاء التجميد والتفعيل.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201019971508?text=${encodeURIComponent(`مرحباً إدارة هاربي، أود تفعيل وإلغاء تجميد مطعمي (${slug})`)}`;
        contactBtn.textContent = '💬 تواصل مع الإدارة للتفعيل والتجديد';
      }
    }
  };

  if (cachedStatus === 'suspended' || cachedStatus === 'blocked' || cachedStatus === 'expired' || cachedStatus === 'deleted') {
    applyAdminStatusUI(cachedStatus);
  }

  Store.startSubscriptionWatcher((status) => {
    if (!status.active) {
      applyAdminStatusUI(status.reason);
    } else {
      document.body.classList.remove('harpy-account-locked');
      if (suspendedBackdrop) suspendedBackdrop.classList.remove('active');
      if (suspendedOverlay) suspendedOverlay.classList.remove('active');
    }
  });
}

// ════════════════════════════════════════════════════════════════
// ═══ POS IN-HOUSE & TAKEAWAY CASHIER ENGINE ═════════════════════
// ════════════════════════════════════════════════════════════════

let posCart = [];
let posOrderType = 'dine_in'; // 'dine_in' | 'takeaway'
let posTableNumber = 1;
let posPayMethod = 'cash'; // 'cash' | 'card' | 'wallet'
let posCurrentCategory = 'all';
let posSearchQuery = '';

// Temporary selection state for POS item customization modal
let posModalProduct = null;
let posModalSelectedSize = null;
let posModalSelectedAddons = [];

window.initPOS = function() {
  renderPOSCategories();
  renderPOSTables();
  renderPOSProducts();
  updatePOSCartUI();
  if (window.innerWidth <= 980 && typeof switchPOSMobileTab === 'function') {
    switchPOSMobileTab('menu');
  }
};

window.renderPOSCategories = function() {
  const container = document.getElementById('pos-categories-strip');
  if (!container) return;

  const cats = Store.getCategories() || [];
  let html = `
    <button type="button" class="pos-cat-pill ${posCurrentCategory === 'all' ? 'active' : ''}" onclick="setPOSCategory('all')">
      <span>🍽️</span>
      <span>الكل</span>
    </button>
  `;

  cats.forEach(c => {
    const catName = typeof c === 'string' ? c : (c.name || c.id || '');
    const catId = typeof c === 'string' ? c : (c.id || c.name || '');
    if (!catName) return;
    const isActive = posCurrentCategory === catId;
    const escapedCatId = encodeURIComponent(catId);
    html += `
      <button type="button" class="pos-cat-pill ${isActive ? 'active' : ''}" onclick="setPOSCategory(decodeURIComponent('${escapedCatId}'))">
        <span>${catName}</span>
      </button>
    `;
  });

  container.innerHTML = html;
};

window.setPOSCategory = function(catId) {
  posCurrentCategory = catId;
  renderPOSCategories();
  renderPOSProducts();
};

window.handlePOSSearch = function(query) {
  posSearchQuery = (query || '').trim().toLowerCase();
  renderPOSProducts();
};

window.renderPOSTables = function() {
  const container = document.getElementById('pos-tables-strip');
  const label = document.getElementById('pos-selected-table-label');
  if (label) label.textContent = `طاولة ${posTableNumber}`;
  if (!container) return;

  let html = '';
  for (let i = 1; i <= 12; i++) {
    html += `
      <button type="button" class="pos-table-pill ${posTableNumber === i ? 'active' : ''}" onclick="setPOSTable(${i})">
        طاولة ${i}
      </button>
    `;
  }
  container.innerHTML = html;
};

window.setPOSTable = function(tblNum) {
  posTableNumber = tblNum;
  renderPOSTables();
};

window.setPOSOrderType = function(type) {
  posOrderType = type;
  const dineInBtn = document.getElementById('pos-type-dinein-btn');
  const takeawayBtn = document.getElementById('pos-type-takeaway-btn');
  const tableWrap = document.getElementById('pos-table-selector-wrap');
  const takeawayWrap = document.getElementById('pos-takeaway-wrap');

  if (type === 'dine_in') {
    if (dineInBtn) dineInBtn.classList.add('active');
    if (takeawayBtn) takeawayBtn.classList.remove('active');
    if (tableWrap) tableWrap.style.display = 'block';
    if (takeawayWrap) takeawayWrap.style.display = 'none';
  } else {
    if (dineInBtn) dineInBtn.classList.remove('active');
    if (takeawayBtn) takeawayBtn.classList.add('active');
    if (tableWrap) tableWrap.style.display = 'none';
    if (takeawayWrap) takeawayWrap.style.display = 'block';
  }
};

window.renderPOSProducts = function() {
  const container = document.getElementById('pos-products-grid');
  if (!container) return;

  const prods = Store.getProducts() || [];
  const currency = Store.getSettings().currency || "ج.م";

  let filtered = prods.filter(p => p.visible !== false);
  if (posCurrentCategory !== 'all') {
    filtered = filtered.filter(p => {
      const pCat = typeof p.category === 'string' ? p.category : (p.category?.name || p.category?.id || '');
      return pCat === posCurrentCategory;
    });
  }
  if (posSearchQuery) {
    filtered = filtered.filter(p => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.desc || '').toLowerCase();
      return name.includes(posSearchQuery) || desc.includes(posSearchQuery);
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:35px 15px; color:var(--text-muted); font-size:13px;">
        لا توجد أصناف مطابقة للبحث أو القسم المحدد
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const hasMultipleSizes = p.sizes && p.sizes.length > 0;
    const basePrice = parseFloat(p.price) || (hasMultipleSizes ? parseFloat(p.sizes[0].price) || 0 : 0);
    const displayPrice = hasMultipleSizes ? `يبدأ من ${basePrice} ${currency}` : `${basePrice} ${currency}`;

    return `
      <div class="pos-card" onclick="handlePOSProductClick('${p.id}')">
        <div class="pos-card-img-wrap">
          ${p.image ? `
            <img src="${p.image}" class="pos-card-img" alt="${p.name}" loading="lazy">
          ` : `
            <div class="pos-card-img" style="display:flex; align-items:center; justify-content:center; font-size:26px; background:var(--surface);">🍽️</div>
          `}
          ${hasMultipleSizes ? `<span class="pos-card-size-badge">عدة أحجام</span>` : ''}
        </div>
        <div class="pos-card-body">
          <div class="pos-card-title">${p.name}</div>
          <div class="pos-card-footer">
            <span class="pos-card-price font-num">${displayPrice}</span>
            <span class="pos-card-add-btn" title="إضافة">+</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.handlePOSProductClick = function(productId) {
  const prods = Store.getProducts() || [];
  const prod = prods.find(p => p.id === productId);
  if (!prod) return;

  const hasSizes = prod.sizes && prod.sizes.length > 0;
  const hasAddons = prod.addons && prod.addons.length > 0;

  if (hasSizes || hasAddons) {
    openPOSItemModal(prod);
  } else {
    addPOSToCart({
      id: prod.id,
      name: prod.name,
      price: parseFloat(prod.price) || 0,
      qty: 1,
      selectedSize: null,
      selectedAddons: [],
      notes: ''
    });
  }
};

window.openPOSItemModal = function(prod) {
  posModalProduct = prod;
  posModalSelectedSize = (prod.sizes && prod.sizes.length > 0) ? prod.sizes[0] : null;
  posModalSelectedAddons = [];

  const modal = document.getElementById('pos-item-modal');
  const backdrop = document.getElementById('pos-item-backdrop');
  const title = document.getElementById('pos-item-modal-title');
  const body = document.getElementById('pos-item-modal-body');
  const currency = Store.getSettings().currency || "ج.م";
  const basePrice = parseFloat(prod.price) || 0;

  if (title) title.textContent = `تخصيص: ${prod.name}`;

  let html = '';

  // Sizes Section
  if (prod.sizes && prod.sizes.length > 0) {
    html += `
      <div style="margin-bottom:14px;">
        <div style="font-size:12px; font-weight:800; color:var(--text-main); margin-bottom:8px;">اختر الحجم:</div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:8px;">
          ${prod.sizes.map((s, idx) => {
            const sizeModifier = parseFloat(s.price) || 0;
            const sizeTotalPrice = basePrice > 0 ? (basePrice + sizeModifier) : sizeModifier;
            return `
              <div id="pos-size-opt-${idx}" onclick="selectPOSModalSize(${idx})" style="border:1.5px solid ${idx === 0 ? 'var(--primary)' : 'var(--border)'}; background:${idx === 0 ? 'var(--primary-subtle)' : 'var(--surface)'}; padding:8px 10px; border-radius:var(--radius-xs); cursor:pointer; text-align:center; transition:all 0.15s ease;">
                <div style="font-size:12px; font-weight:800; color:var(--text-main);">${s.name}</div>
                <div class="font-num" style="font-size:11.5px; font-weight:900; color:var(--primary);">${sizeTotalPrice} ${currency}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Addons Section
  if (prod.addons && prod.addons.length > 0) {
    html += `
      <div style="margin-bottom:14px;">
        <div style="font-size:12px; font-weight:800; color:var(--text-main); margin-bottom:8px;">إضافات اختيارية:</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${prod.addons.map((a, idx) => `
            <label style="display:flex; justify-content:space-between; align-items:center; background:var(--surface); border:1px solid var(--border); padding:8px 12px; border-radius:var(--radius-xs); cursor:pointer;">
              <span style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:700; color:var(--text-main);">
                <input type="checkbox" onchange="togglePOSModalAddon(${idx}, this.checked)">
                ${a.name}
              </span>
              <span class="font-num" style="font-size:11.5px; font-weight:800; color:var(--accent-wa);">+${a.price} ${currency}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Item Special Notes
  html += `
    <div>
      <div style="font-size:12px; font-weight:800; color:var(--text-main); margin-bottom:4px;">ملاحظة خاصة بالصنف:</div>
      <input type="text" id="pos-modal-item-note" class="form-input" placeholder="مثال: بدون مايونيز، تسوية جيدة..." style="font-size:12px; padding:7px 10px;">
    </div>
  `;

  if (body) body.innerHTML = html;
  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
};

window.closePOSItemModal = function() {
  const modal = document.getElementById('pos-item-modal');
  const backdrop = document.getElementById('pos-item-backdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  posModalProduct = null;
  posModalSelectedSize = null;
  posModalSelectedAddons = [];
};

window.selectPOSModalSize = function(sizeIdx) {
  if (!posModalProduct || !posModalProduct.sizes) return;
  posModalSelectedSize = posModalProduct.sizes[sizeIdx];

  posModalProduct.sizes.forEach((_, idx) => {
    const el = document.getElementById(`pos-size-opt-${idx}`);
    if (el) {
      if (idx === sizeIdx) {
        el.style.borderColor = 'var(--primary)';
        el.style.background = 'var(--primary-subtle)';
      } else {
        el.style.borderColor = 'var(--border)';
        el.style.background = 'var(--surface)';
      }
    }
  });
};

window.togglePOSModalAddon = function(addonIdx, isChecked) {
  if (!posModalProduct || !posModalProduct.addons) return;
  const addon = posModalProduct.addons[addonIdx];
  if (!addon) return;

  if (isChecked) {
    if (!posModalSelectedAddons.some(a => a.name === addon.name)) {
      posModalSelectedAddons.push(addon);
    }
  } else {
    posModalSelectedAddons = posModalSelectedAddons.filter(a => a.name !== addon.name);
  }
};

window.confirmPOSItemCustomization = function() {
  if (!posModalProduct) return;
  const note = (document.getElementById('pos-modal-item-note')?.value || '').trim();

  let finalPrice = parseFloat(posModalProduct.price) || 0;
  if (posModalSelectedSize) {
    finalPrice += (parseFloat(posModalSelectedSize.price) || 0);
  }
  posModalSelectedAddons.forEach(a => {
    finalPrice += (parseFloat(a.price) || 0);
  });

  addPOSToCart({
    id: posModalProduct.id,
    name: posModalProduct.name,
    price: finalPrice,
    qty: 1,
    selectedSize: posModalSelectedSize ? { ...posModalSelectedSize } : null,
    selectedAddons: [...posModalSelectedAddons],
    notes: note
  });

  closePOSItemModal();
};

window.addPOSToCart = function(item) {
  // Check if identical item already exists in ticket
  const existingIdx = posCart.findIndex(it => {
    if (it.id !== item.id) return false;
    const sizeMatch = (!it.selectedSize && !item.selectedSize) || (it.selectedSize?.name === item.selectedSize?.name);
    const itAddonNames = (it.selectedAddons || []).map(a => a.name).sort().join(',');
    const itemAddonNames = (item.selectedAddons || []).map(a => a.name).sort().join(',');
    const noteMatch = (it.notes || '') === (item.notes || '');
    return sizeMatch && itAddonNames === itemAddonNames && noteMatch;
  });

  if (existingIdx !== -1) {
    posCart[existingIdx].qty += 1;
  } else {
    posCart.push({
      ...item,
      cartItemId: Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    });
  }

  updatePOSCartUI();
};

window.changePOSItemQty = function(cartItemId, delta) {
  const idx = posCart.findIndex(it => it.cartItemId === cartItemId);
  if (idx === -1) return;

  posCart[idx].qty += delta;
  if (posCart[idx].qty <= 0) {
    posCart.splice(idx, 1);
  }
  updatePOSCartUI();
};

window.removePOSItem = function(cartItemId) {
  posCart = posCart.filter(it => it.cartItemId !== cartItemId);
  updatePOSCartUI();
};

window.posMobileCurrentTab = 'menu';

window.switchPOSMobileTab = function(tab) {
  window.posMobileCurrentTab = tab;
  const layout = document.querySelector('.pos-layout');
  const btnMenu = document.getElementById('btn-pos-tab-menu');
  const btnTicket = document.getElementById('btn-pos-tab-ticket');
  const mobileBar = document.getElementById('pos-mobile-cart-bar');

  if (layout) {
    if (tab === 'ticket') {
      layout.classList.remove('view-menu');
      layout.classList.add('view-ticket');
    } else {
      layout.classList.remove('view-ticket');
      layout.classList.add('view-menu');
    }
  }

  if (btnMenu) btnMenu.classList.toggle('active', tab === 'menu');
  if (btnTicket) btnTicket.classList.toggle('active', tab === 'ticket');

  if (mobileBar) {
    if (tab === 'ticket' || posCart.length === 0) {
      mobileBar.classList.remove('show');
    } else if (tab === 'menu' && posCart.length > 0) {
      mobileBar.classList.add('show');
    }
  }

  if (window.innerWidth <= 980) {
    const posSection = document.getElementById('tab-pos');
    if (posSection) {
      posSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

window.scrollPOSToTicket = function() {
  if (window.innerWidth <= 980) {
    switchPOSMobileTab('ticket');
  } else {
    const ticketCol = document.querySelector('.pos-ticket-col');
    if (ticketCol) {
      ticketCol.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

window.updatePOSCartUI = function() {
  const container = document.getElementById('pos-ticket-items');
  const countBadge = document.getElementById('pos-items-count-badge');
  const currency = Store.getSettings().currency || "ج.م";

  const totalItemCount = posCart.reduce((s, it) => s + it.qty, 0);
  if (countBadge) countBadge.textContent = `${totalItemCount} صنف`;

  if (!container) return;

  if (posCart.length === 0) {
    container.innerHTML = `
      <div id="pos-empty-state" style="text-align:center; padding:35px 10px; color:var(--text-muted); font-size:12px;">
        <div style="font-size:28px; margin-bottom:6px;">🛒</div>
        الفاتورة فارغة<br>اضغط على أي صنف لإضافته هنا
      </div>
    `;
  } else {
    container.innerHTML = posCart.map(it => `
      <div class="pos-ticket-row">
        <div class="pos-ticket-info">
          <div class="pos-ticket-title">
            ${it.name}
            ${it.selectedSize ? `<span style="font-size:10.5px; color:var(--text-muted); font-weight:normal;">(${it.selectedSize.name})</span>` : ''}
          </div>
          ${it.selectedAddons && it.selectedAddons.length ? `
            <div style="font-size:10px; color:var(--accent-wa);">+ ${it.selectedAddons.map(a => a.name).join('، ')}</div>
          ` : ''}
          ${it.notes ? `
            <div style="font-size:10px; color:#f59e0b;">📝 ${it.notes}</div>
          ` : ''}
          <div class="font-num" style="font-size:11.5px; font-weight:800; color:var(--primary); margin-top:2px;">
            ${(it.price * it.qty).toFixed(0)} ${currency}
          </div>
        </div>

        <div class="pos-ticket-qty-wrap">
          <button type="button" class="pos-qty-btn" onclick="changePOSItemQty('${it.cartItemId}', -1)">-</button>
          <span class="font-num" style="font-size:13px; font-weight:900; min-width:18px; text-align:center;">${it.qty}</span>
          <button type="button" class="pos-qty-btn" onclick="changePOSItemQty('${it.cartItemId}', 1)">+</button>
          <button type="button" class="pos-ticket-del" onclick="removePOSItem('${it.cartItemId}')" title="حذف">✕</button>
        </div>
      </div>
    `).join('');
  }

  updatePOSCalculations();
};

window.updatePOSCalculations = function() {
  const currency = Store.getSettings().currency || "ج.م";
  const subtotal = posCart.reduce((s, it) => s + (it.price * it.qty), 0);
  const discountInput = document.getElementById('pos-discount-input');
  const discount = Math.max(0, parseFloat(discountInput?.value) || 0);
  const finalTotal = Math.max(0, subtotal - discount);

  const subtotalEl = document.getElementById('pos-subtotal');
  const finalTotalEl = document.getElementById('pos-final-total');

  if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(0)} ${currency}`;
  if (finalTotalEl) finalTotalEl.textContent = `${finalTotal.toFixed(0)} ${currency}`;

  document.querySelectorAll('.pos-currency-symbol').forEach(el => el.textContent = currency);

  // Mobile segmented toggle badge
  const totalItemCount = posCart.reduce((s, it) => s + it.qty, 0);
  const posTabBadge = document.getElementById('pos-tab-badge');
  if (posTabBadge) {
    posTabBadge.textContent = totalItemCount;
  }

  // Mobile floating quick cart bar
  const mobileBar = document.getElementById('pos-mobile-cart-bar');
  const mobileItemsText = document.getElementById('pos-mobile-items-text');
  const mobileTotalPrice = document.getElementById('pos-mobile-total-price');

  if (mobileBar) {
    if (posCart.length > 0 && window.posMobileCurrentTab !== 'ticket') {
      mobileBar.classList.add('show');
      if (mobileItemsText) mobileItemsText.textContent = `${totalItemCount} صنف بالفاتورة`;
      if (mobileTotalPrice) mobileTotalPrice.textContent = `${finalTotal.toFixed(0)} ${currency}`;
    } else {
      mobileBar.classList.remove('show');
    }
  }

  updatePOSChange();
};

window.setPOSPayMethod = function(method) {
  posPayMethod = method;
  document.querySelectorAll('.pos-pay-method-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.pay === method);
  });

  const cashCalc = document.getElementById('pos-cash-calc');
  if (cashCalc) {
    cashCalc.style.display = method === 'cash' ? 'flex' : 'none';
  }
};

window.updatePOSChange = function() {
  const receivedInput = document.getElementById('pos-cash-received');
  const changeEl = document.getElementById('pos-cash-change');
  const currency = Store.getSettings().currency || "ج.م";

  if (!receivedInput || !changeEl) return;

  const subtotal = posCart.reduce((s, it) => s + (it.price * it.qty), 0);
  const discount = Math.max(0, parseFloat(document.getElementById('pos-discount-input')?.value) || 0);
  const finalTotal = Math.max(0, subtotal - discount);

  const received = parseFloat(receivedInput.value);
  if (isNaN(received) || received < finalTotal) {
    changeEl.textContent = `0 ${currency}`;
    changeEl.style.color = 'var(--text-muted)';
  } else {
    const change = received - finalTotal;
    changeEl.textContent = `${change.toFixed(0)} ${currency}`;
    changeEl.style.color = '#22c55e';
  }
};

window.resetPOSCart = function(ask = false) {
  if (ask && posCart.length > 0) {
    if (!confirm("هل أنت متأكد من تفريغ الفاتورة وبدء طلب جديد؟")) return;
  }
  posCart = [];
  const discountInput = document.getElementById('pos-discount-input');
  const noteInput = document.getElementById('pos-order-note');
  const takeawayInput = document.getElementById('pos-takeaway-name');
  const cashInput = document.getElementById('pos-cash-received');

  if (discountInput) discountInput.value = '0';
  if (noteInput) noteInput.value = '';
  if (takeawayInput) takeawayInput.value = '';
  if (cashInput) cashInput.value = '';

  updatePOSCartUI();
  if (window.innerWidth <= 980 && typeof switchPOSMobileTab === 'function') {
    switchPOSMobileTab('menu');
  }
};

window.submitPOSOrder = async function(printReceipt = true) {
  if (posCart.length === 0) {
    showToastNotification("يرجى اختيار صنف واحد على الأقل في الفاتورة!", "error");
    return;
  }

  const subtotal = posCart.reduce((s, it) => s + (it.price * it.qty), 0);
  const discount = Math.max(0, parseFloat(document.getElementById('pos-discount-input')?.value) || 0);
  const finalTotal = Math.max(0, subtotal - discount);
  const note = (document.getElementById('pos-order-note')?.value || '').trim();
  const takeawayName = (document.getElementById('pos-takeaway-name')?.value || '').trim();

  const orderNumber = Math.floor(1000 + Math.random() * 9000);
  const orderId = `#POS-${orderNumber}`;
  const now = new Date();

  const newOrder = {
    orderId: orderId,
    source: 'pos',
    orderType: posOrderType, // 'dine_in' | 'takeaway'
    tableNumber: posOrderType === 'dine_in' ? posTableNumber : null,
    status: 'preparing', // Direct to Kitchen Active Prep
    createdAt: now.toISOString(),
    timestamp: now.getTime(),
    paymentMethod: posPayMethod,
    isPaid: true,
    customer: {
      name: posOrderType === 'dine_in' ? `طاولة ${posTableNumber}` : (takeawayName || 'زبون سفري'),
      phone: 'داخلي',
      address: posOrderType === 'dine_in' ? `داخل المطعم - طاولة ${posTableNumber}` : 'استلام من الكاشير (سفري)',
      notes: note
    },
    items: JSON.parse(JSON.stringify(posCart)),
    subtotal: subtotal,
    discount: discount,
    deliveryFee: 0,
    finalTotal: finalTotal
  };

  // Lock buttons
  const printBtn = document.getElementById('btn-pos-submit-print');
  const submitOnlyBtn = document.getElementById('btn-pos-submit-only');
  if (printBtn) printBtn.disabled = true;
  if (submitOnlyBtn) submitOnlyBtn.disabled = true;

  try {
    await Store.pushOrderToCloud(newOrder);

    showToastNotification(`تم إرسال الطلب ${orderId} للمطبخ بنجاح! 👨‍🍳`, "success");

    if (printReceipt) {
      setTimeout(() => {
        printOrderReceipt(newOrder);
      }, 100);
    }

    // Reset ticket for next order
    resetPOSCart(false);

    // Refresh Kitchen and Archive views
    renderOrdersList();
    renderInvoicesArchive();
  } catch (err) {
    showToastNotification("حدث خطأ أثناء إرسال الطلب: " + (err.message || 'فشل الاتصال'), "error");
  } finally {
    if (printBtn) printBtn.disabled = false;
    if (submitOnlyBtn) submitOnlyBtn.disabled = false;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

