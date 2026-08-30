// ═══════════════════════════════════════════════════════════
// HarpyOrder — Admin Dashboard Controller (Production Grade)
// ═══════════════════════════════════════════════════════════

let isAuthenticated = false;
let currentTab = 'tab-products';
let currentEditingProductId = null;
let currentEditingStoryId = null;

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

  // Orders Tab
  adminOrdersContainer: document.getElementById('admin-orders-container'),
  statTotalOrders: document.getElementById('stat-total-orders'),
  statPendingOrders: document.getElementById('stat-pending-orders'),
  statTotalRevenue: document.getElementById('stat-total-revenue'),
  ordersBadgeCount: document.getElementById('orders-badge-count'),

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
  setShowAnnouncement: document.getElementById('set-show-announcement'),
  setAnnouncementText: document.getElementById('set-announcement-text')
};

function initAdmin() {
  Store.initTheme();
  setupAdminThemeToggle();
  setupAuth();
  setupSubscriptionWatcher();
  setupRestaurantHub();
  setupTabNavigation();
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
      darkIcon.style.display = 'none';
      lightIcon.style.display = 'block';
    } else {
      darkIcon.style.display = 'block';
      lightIcon.style.display = 'none';
    }
  }
}

function setupAdminThemeToggle() {
  updateAdminThemeToggleIcons();
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = Store.getThemeMode();
      const next = current === 'light' ? 'dark' : 'light';
      Store.setThemeMode(next);
      updateAdminThemeToggleIcons();
    });
  }
}

// ── Multi-Tenant Auth Gate with Safe Subscriptions ─────────
function setupAuth() {
  const slug = Store.getRestaurantSlug();
  let syncUnsubscribe = null;
  let ordersUnsubscribe = null;

  const unlockDashboard = () => {
    isAuthenticated = true;
    if (adminElements.loginModal) adminElements.loginModal.classList.remove('open');
    if (adminElements.loginBackdrop) adminElements.loginBackdrop.classList.remove('open');
    if (adminElements.btnAdminLogout) adminElements.btnAdminLogout.style.display = 'inline-flex';
    
    loadAllDashboardData();

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
    });
  };

  const lockDashboard = () => {
    isAuthenticated = false;
    if (typeof syncUnsubscribe === 'function') syncUnsubscribe();
    if (typeof ordersUnsubscribe === 'function') ordersUnsubscribe();
    if (adminElements.loginModal) adminElements.loginModal.classList.add('open');
    if (adminElements.loginBackdrop) adminElements.loginBackdrop.classList.add('open');
    if (adminElements.btnAdminLogout) adminElements.btnAdminLogout.style.display = 'none';
  };

  // Check active session on load
  if (Store.isAdminAuthenticated(slug)) {
    unlockDashboard();
  } else {
    lockDashboard();
  }

  // Listen to Firebase Auth state
  Store.onAuthStateChanged(async (user) => {
    if (user) {
      const isOwner = await Store.verifyTenantOwnership(slug, user.uid);
      if (isOwner) {
        unlockDashboard();
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
    const email = (adminElements.adminEmailInput?.value || '').trim();
    const password = (adminElements.adminPasswordInput?.value || '').trim();

    if (!email || !password) {
      if (adminElements.loginErrorMsg) {
        adminElements.loginErrorMsg.textContent = "يرجى إدخال البريد الإلكتروني وكلمة المرور";
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
      await Store.loginAdmin(email, password);
      unlockDashboard();
    } catch (err) {
      console.warn("[Admin] Login failed:", err);
      let msg = "فشل تسجيل الدخول. تأكد من صحة البريد الإلكتروني وكلمة المرور.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.message === 'auth/invalid-credentials') {
        msg = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "تم تجاوز عدد المحاولات المسموح به. يرجى المحاولة لاحقاً.";
      }
      if (adminElements.loginErrorMsg) {
        adminElements.loginErrorMsg.textContent = msg;
        adminElements.loginErrorMsg.style.display = 'block';
      }
    } finally {
      if (adminElements.btnLogin) {
        adminElements.btnLogin.disabled = false;
        adminElements.btnLogin.textContent = "دخول لوحة التحكم";
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
  const targetUrl = isFile
    ? window.location.href.replace('admin.html', 'index.html').split('?')[0] + `?m=${slug}`
    : window.location.origin + window.location.pathname.replace('admin.html', 'index.html').replace(/\/$/, '') + `?m=${slug}`;

  if (shareLink) {
    shareLink.textContent = targetUrl.replace(/^https?:\/\//, '');
    shareLink.href = targetUrl;
  }
  if (previewBtn) {
    previewBtn.href = `./index.html?m=${slug}`;
  }
}

function loadAllDashboardData() {
  renderRestaurantHub();
  renderOrdersList(Store.getOrders());
  renderCatalog();
  renderCategoriesList();
  renderStoriesList();
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

  // 4. Update URL Hash without Page Reload
  if (updateHash) {
    const shortHash = targetTabId.replace('tab-', '');
    if (window.location.hash !== '#' + shortHash) {
      history.replaceState(null, '', '#' + shortHash);
    }
  }

  // 5. Instantly render the active tab's cached data
  if (targetTabId === 'tab-products') {
    renderCatalog();
  } else if (targetTabId === 'tab-orders') {
    renderOrdersList(Store.getOrders());
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
    if (hash) {
      window.switchTab('tab-' + hash, false);
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

window.openStatusSheet = function(orderId, currentStatus) {
  currentEditingOrderId = orderId;
  const sheet = document.getElementById('status-sheet');
  const backdrop = document.getElementById('status-sheet-backdrop');
  const orderIdSpan = document.getElementById('status-sheet-order-id');

  if (orderIdSpan) orderIdSpan.textContent = orderId;

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
  await Store.updateOrderStatus(orderId, newStatus);
  showToastNotification("تم تحديث حالة الطلب سحابياً بنجاح ✓", "success");
};

window.updateOrderStatusFast = async function(orderId, newStatus) {
  await Store.updateOrderStatus(orderId, newStatus);
  showToastNotification("تم تحديث حالة الطلب سحابياً بنجاح ✓", "success");
};

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

window.confirmDeleteOrder = async function(orderId) {
  if (!orderId) return;
  const confirmed = await showCustomConfirm({
    title: `حذف الطلب ${orderId} نهائياً`,
    message: `هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟<br><br><span style="font-size:12px; color:var(--text-muted);">سيتم مسح بيانات الطلب وصورة الإيصال من السحابة بالكامل ولا يمكن التراجع.</span>`,
    icon: '🗑️',
    confirmText: 'نعم، احذف الطلب 🗑️',
    cancelText: 'إلغاء',
    isDanger: true
  });

  if (confirmed) {
    showToastNotification("جاري حذف الطلب سحابياً... ⏳", "info");
    const success = await Store.deleteOrder(orderId);
    if (success) {
      showToastNotification("تم مسح الطلب وبياناته نهائياً من السحابة ✓", "success");
    } else {
      showToastNotification("تم حذف الطلب محلياً بنجاح ✓", "success");
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
};

window.closeReceiptModal = function() {
  currentReceiptImageUrl = null;
  const modal = document.getElementById('receipt-lightbox');
  const backdrop = document.getElementById('receipt-lightbox-backdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
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

let lastRenderedOrdersSignature = null;

function renderOrdersList(orders = null) {
  if (!adminElements.adminOrdersContainer) return;
  if (orders === null || orders === undefined) {
    orders = Store.getOrders();
  }
  const currency = Store.getSettings().currency || "ج.م";

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => !o.status || o.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (parseFloat(o.finalTotal) || 0), 0);

  // Trigger Audio Chime & Browser Notification on New Incoming Order
  if (lastKnownOrderCount !== null && totalOrders > lastKnownOrderCount) {
    const latestOrder = orders[0];
    playKitchenOrderChime();
    if (latestOrder) {
      showAdminOrderNotification(latestOrder);
    }
  }
  lastKnownOrderCount = totalOrders;

  if (adminElements.statTotalOrders) adminElements.statTotalOrders.textContent = totalOrders;
  if (adminElements.statPendingOrders) adminElements.statPendingOrders.textContent = pendingOrders;
  if (adminElements.statTotalRevenue) adminElements.statTotalRevenue.textContent = `${totalRevenue.toFixed(0)} ${currency}`;

  if (adminElements.ordersBadgeCount) {
    if (pendingOrders > 0) {
      adminElements.ordersBadgeCount.textContent = pendingOrders;
      adminElements.ordersBadgeCount.style.display = 'inline-block';
    } else {
      adminElements.ordersBadgeCount.style.display = 'none';
    }
  }

  // Prevent repetitive DOM repaints if data signature is identical
  const currentSignature = JSON.stringify(orders.map(o => ({ id: o.orderId, st: o.status, tot: o.finalTotal, rec: o.receiptUrl })));
  if (lastRenderedOrdersSignature === currentSignature && adminElements.adminOrdersContainer.children.length > 0) {
    return;
  }
  lastRenderedOrdersSignature = currentSignature;

  if (orders.length === 0) {
    adminElements.adminOrdersContainer.innerHTML = `
      <div style="text-align:center; padding:45px 20px; color:var(--text-muted); background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-md);">
        <div style="font-size:36px; margin-bottom:10px;">📥</div>
        <div style="font-size:15px; font-weight:800; color:var(--text-main); margin-bottom:4px;">لا توجد طلبات واردة حتى الآن</div>
        <div style="font-size:12.5px;">أي طلب جديد يتم إرساله من المنيو سيظهر هنا فورياً ومباشرة مع صوت رنين المطبخ.</div>
      </div>
    `;
    return;
  }

  adminElements.adminOrdersContainer.innerHTML = orders.map(o => {
    const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'الآن';
    const status = o.status || 'pending';

    const statusBadge = {
      pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب 📥' },
      preparing: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', text: '2. المطبخ يجهز 👨‍🍳' },
      out_for_delivery: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)', text: '3. في الطريق إليك 🛵' },
      delivered: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)', text: '4. تم التسليم ✅' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', text: 'تم الإلغاء ✕' }
    }[status] || { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب 📥' };

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
    const waUrl = phoneRaw ? `https://wa.me/${phoneRaw.startsWith('0') ? '2' + phoneRaw : phoneRaw}?text=${encodeURIComponent(`مرحباً أستاذ ${o.customer?.name || ''}، بخصوص طلبك رقم ${o.orderId} من المطعم`)}` : '#';
    const telUrl = phoneRaw ? `tel:${phoneRaw}` : '#';

    const isWalletPayment = o.paymentMethod === 'wallet';

    return `
      <div class="order-card-pro">
        
        <!-- Header: Order ID, Time & Luxury Status Trigger Button -->
        <div class="order-card-header-row">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="order-id-chip font-num">${o.orderId}</span>
            <span class="order-time-chip">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${timeStr}
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <!-- Interactive Custom Status Sheet Trigger (No Native Select Dialog) -->
            <button type="button" class="order-status-trigger-btn font-num" style="background:${statusBadge.bg}; color:${statusBadge.color}; border:1px solid ${statusBadge.borderColor};" onclick="openStatusSheet('${o.orderId}', '${status}')">
              <span>${statusBadge.text}</span>
              <span style="font-size:10px; margin-right:2px; opacity:0.8;">▾</span>
            </button>

            <!-- Sleek Chic ✕ Delete Button -->
            <button type="button" class="btn-order-delete-chic" onclick="confirmDeleteOrder('${o.orderId}')" title="حذف هذا الطلب نهائياً" aria-label="حذف الطلب">
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
}

window.updateOrderStatusFast = async function(orderId, newStatus) {
  await Store.updateOrderStatus(orderId, newStatus);
  showToastNotification("تم تحديث حالة الطلب سحابياً ✓", "success");
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
        <img src="${p.image}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;">
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
          <button class="btn btn-ghost btn-sm btn-admin-action ${p.visible === false ? 'btn-hidden-state' : ''}" onclick="toggleProductVisibilityFast('${p.id}')" title="${p.visible === false ? 'إظهار الصنف في المنيو' : 'إخفاء الصنف من المنيو'}" style="display:inline-flex; align-items:center; gap:5px; font-weight:700; font-size:12px; padding:5px 9px;">
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
  showToastNotification("تم تحديث السعر سحابياً بنجاح ✓", "success");
};

window.toggleProductVisibilityFast = async function(id) {
  const p = Store.getProducts().find(item => item.id === id);
  if (!p) return;
  const newVis = p.visible === false ? true : false;
  await Store.updateProduct(id, { visible: newVis });
  renderCatalog();
  showToastNotification(newVis ? "تم إظهار الصنف في المنيو ✓" : "تم إخفاء الصنف من المنيو 👁️", "success");
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
}

function closeProductModal() {
  currentEditingProductId = null;
  if (adminElements.productModal) adminElements.productModal.classList.remove('open');
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.classList.remove('open');
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
    submitBtn.innerHTML = 'جاري الحفظ والمزامنة السحابية... ⏳';
  }

  try {
    if (currentEditingProductId) {
      await Store.updateProduct(currentEditingProductId, productData);
      showToastNotification("تم تحديث بيانات الصنف سحابياً بنجاح! ✓", "success");
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
      <img src="${s.image}" alt="${s.title}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);">
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
}

function closeStoryModal() {
  currentEditingStoryId = null;
  if (adminElements.storyModal) adminElements.storyModal.classList.remove('open');
  if (adminElements.storyModalBackdrop) adminElements.storyModalBackdrop.classList.remove('open');
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
      showToastNotification("تم تحديث القصة سحابياً بنجاح! ✓", "success");
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
          showToastNotification("تم استرجاع ومزامنة كافة بيانات المنيو سحابياً بنجاح! 📦", "success");
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
      <div class="theme-preset-card" onclick="applyPresetToPickers('${preset.id}')" style="background:var(--surface); border:1px solid var(--border); padding:10px; border-radius:var(--radius-xs); cursor:pointer;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span style="width:14px; height:14px; border-radius:50%; background:${preset.primary};"></span>
          <span style="font-size:12px; font-weight:800; color:var(--text-main);">${preset.name}</span>
        </div>
        <div style="font-size:10.5px; color:var(--text-muted);">${preset.badge}</div>
      </div>
    `).join('');
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

  if (adminElements.settingsForm) {
    adminElements.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsFromForm();
    });
  }
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
  showToastNotification(`تم تطبيق ثيم "${p.name}" بنجاح ✓`, "success");
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

  // Operational settings
  if (adminElements.setDeliveryTime) adminElements.setDeliveryTime.value = s.deliveryTime || '';
  if (adminElements.setShowAnnouncement) adminElements.setShowAnnouncement.checked = s.showAnnouncement === true;
  if (adminElements.setAnnouncementText) adminElements.setAnnouncementText.value = s.announcementText || '';

  renderPromoCodesList(s.promoCodes || []);
}

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
    submitBtn.innerHTML = 'جاري الحفظ والمزامنة السحابية... ⏳';
  }

  try {
    const current = Store.getSettings();
    const bg = adminElements.pickerBg?.value || '#f8f6f0';
    const surface = adminElements.pickerSurface?.value || '#ffffff';
    const primary = adminElements.pickerPrimary?.value || '#c2410c';
    const textMain = adminElements.pickerText?.value || '#18130f';

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

      siteColors: {
        bg,
        surface,
        surfaceRaised: surface,
        headerBg: bg,
        textMain,
        textBody: '#3d332a',
        primary,
        border: 'rgba(45, 35, 25, 0.10)'
      },

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
      showToastNotification("تم حفظ وتحديث كافة الإعدادات والمزامنة السحابية بنجاح! ✓", "success");
    } else {
      showToastNotification("تم الحفظ محلياً — جاري تأكيد المزامنة السحابية في الخلفية", "warning");
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
      if (msgEl) msgEl.textContent = 'تم حذف بيانات وترخيص هذا المطعم بالكامل من النظام السحابي، ولم يعد متاحاً.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201604040086?text=${encodeURIComponent(`مرحباً إدارة هاربي، أود الاستفسار عن إنشاء مطعم جديد بدلاً من (${slug})`)}`;
        contactBtn.textContent = '💬 تواصل مع الإدارة لإنشاء حساب جديد';
      }
    } else if (statusReason === 'expired') {
      if (iconEl) iconEl.textContent = '⏳';
      if (titleEl) titleEl.textContent = 'انتهت صلاحية اشتراك هذا المطعم';
      if (msgEl) msgEl.textContent = 'انتهت صلاحية اشتراك هذا المطعم. يرجى تجديد الباقة لاستئناف استقبال طلبات الزبائن وتعديل المنيو.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201604040086?text=${encodeURIComponent(`مرحباً إدارة هاربي، أود تجديد اشتراك مطعمي (${slug})`)}`;
        contactBtn.textContent = '💬 تواصل مع الإدارة لتجديد الاشتراك';
      }
    } else {
      if (iconEl) iconEl.textContent = '❄️';
      if (titleEl) titleEl.textContent = 'حساب المطعم مجمّد / موقوف مؤقتاً';
      if (msgEl) msgEl.textContent = 'تم تجميد وإيقاف اشتراك هذا المطعم مؤقتاً من قبل الإدارة. يرجى التواصل لإلغاء التجميد والتفعيل.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201604040086?text=${encodeURIComponent(`مرحباً إدارة هاربي، أود تفعيل وإلغاء تجميد مطعمي (${slug})`)}`;
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

document.addEventListener('DOMContentLoaded', initAdmin);
