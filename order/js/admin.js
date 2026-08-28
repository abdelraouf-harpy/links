// ═══════════════════════════════════════════════════════════
// HarpyOrder — Admin Dashboard Controller
// ═══════════════════════════════════════════════════════════

let isAuthenticated = false;
let currentTab = 'tab-products';
let currentEditingProductId = null;
let currentEditingStoryId = null;

const adminElements = {
  loginModal: document.getElementById('login-modal'),
  loginBackdrop: document.getElementById('login-modal-backdrop'),
  adminPinInput: document.getElementById('admin-pin-input'),
  btnLogin: document.getElementById('btn-login'),

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
  setAdminPin: document.getElementById('set-admin-pin'),
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
  // New settings fields
  setDeliveryTime: document.getElementById('set-delivery-time'),
  setMinOrder: document.getElementById('set-min-order'),
  setShowAnnouncement: document.getElementById('set-show-announcement'),
  setAnnouncementText: document.getElementById('set-announcement-text')
};

function initAdmin() {
  Store.initTheme();
  setupAdminThemeToggle();
  setupAuth();
  setupRestaurantHub();
  setupTabNavigation();
  setupProductManagement();
  setupCategoryManagement();
  setupStoriesManagement();
  setupBackupAndRestore();
  setupSettingsForm();
}

function setupAdminThemeToggle() {
  if (adminElements.adminThemeToggleBtn) {
    adminElements.adminThemeToggleBtn.addEventListener('click', () => {
      const current = Store.getThemeMode();
      const next = current === 'light' ? 'dark' : 'light';
      Store.setThemeMode(next);
    });
  }
}

// ── Auth Gate ──────────────────────────────────────────────
function setupAuth() {
  let attempts = parseInt(sessionStorage.getItem('harpy_pin_attempts') || '0');
  let lockedUntil = parseInt(sessionStorage.getItem('harpy_pin_locked_until') || '0');

  const checkPin = () => {
    // Lockout check
    if (Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      alert(`تم تجاوز عدد المحاولات المسموح به. حاول مرة أخرى بعد ${remaining} ثانية.`);
      return;
    }

    const entered = (adminElements.adminPinInput.value || '').trim();
    const settings = Store.getSettings();
    const pin = settings.adminPin || "1234";

    if (entered === pin) {
      isAuthenticated = true;
      sessionStorage.removeItem('harpy_pin_attempts');
      sessionStorage.removeItem('harpy_pin_locked_until');
      if (adminElements.loginModal) adminElements.loginModal.classList.remove('open');
      if (adminElements.loginBackdrop) adminElements.loginBackdrop.classList.remove('open');
      loadAllDashboardData();
      // Warn if still using default PIN
      if (pin === '1234') {
        setTimeout(() => {
          const existing = document.getElementById('default-pin-warning');
          if (!existing) {
            const warn = document.createElement('div');
            warn.id = 'default-pin-warning';
            warn.style.cssText = `
              background: #7c2d12; color: #fff; padding: 14px 18px; border-radius: 10px;
              margin-bottom: 16px; font-size: 0.88rem; font-weight: 700; display: flex;
              align-items: center; gap: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            `;
            warn.innerHTML = `
              <span style="font-size:1.4rem;">🔐</span>
              <div>
                <div style="font-size:0.95rem; margin-bottom:4px;">رمز المرور لا يزال الافتراضي (1234) — يجب تغييره فوراً!</div>
                <div style="font-weight:500; opacity:0.85;">اذهب إلى إعدادات → رمز مرور لوحة الإدارة وعيّن رمزاً سرياً خاصاً بك.</div>
              </div>
              <button onclick="this.parentElement.remove()" style="margin-right:auto; background:transparent; border:none; color:#fff; font-size:1.2rem; cursor:pointer;">✕</button>
            `;
            const container = document.querySelector('main.container') || document.body;
            container.insertBefore(warn, container.firstChild);
          }
        }, 400);
      }
    } else {
      attempts++;
      sessionStorage.setItem('harpy_pin_attempts', attempts.toString());
      if (attempts >= 5) {
        const lockDuration = 60 * 1000; // 60 seconds
        const lockEnd = Date.now() + lockDuration;
        sessionStorage.setItem('harpy_pin_locked_until', lockEnd.toString());
        sessionStorage.setItem('harpy_pin_attempts', '0');
        alert('تم إدخال رمز خاطئ 5 مرات. سيتم الإغلاق لمدة دقيقة واحدة.');
      } else {
        alert(`رمز المرور غير صحيح. المحاولات المتبقية: ${5 - attempts}`);
      }
      adminElements.adminPinInput.value = '';
      adminElements.adminPinInput.focus();
    }
  };

  if (adminElements.btnLogin) adminElements.btnLogin.addEventListener('click', checkPin);
  if (adminElements.adminPinInput) {
    adminElements.adminPinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkPin();
    });
  }
}

function setupRestaurantHub() {
  const btnCopy = document.getElementById('btn-copy-restaurant-link');
  const btnSwitch = document.getElementById('btn-switch-restaurant');

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const linkEl = document.getElementById('tenant-share-link');
      if (!linkEl) return;
      const text = linkEl.textContent;
      navigator.clipboard.writeText(text);
      
      const copyText = document.getElementById('copy-store-link-text');
      if (copyText) copyText.textContent = "تم النسخ ✓";
      btnCopy.classList.add('btn-primary');
      btnCopy.classList.remove('btn-ghost');

      setTimeout(() => {
        if (copyText) copyText.textContent = "نسخ الرابط";
        btnCopy.classList.remove('btn-primary');
        btnCopy.classList.add('btn-ghost');
      }, 2500);
    });
  }

  if (btnSwitch) {
    btnSwitch.addEventListener('click', () => {
      const restaurants = Store.getAllRestaurants();
      const currentSlug = Store.getRestaurantSlug();

      let promptMsg = `المطاعم المسجلة حالياً:\n` + 
        restaurants.map((r, i) => `${i + 1}. [${r.slug}] — ${r.name}`).join('\n') + 
        `\n\nاكتب المعرف (Slug) للمطعم الذي تريد التبديل إليه، أو اكتب اسماً إنجليزياً جديداً لإنشاء مطعم جديد:\n(مثال: omda أو burger-house)`;

      const chosenSlug = prompt(promptMsg, currentSlug);
      if (chosenSlug && chosenSlug.trim()) {
        const clean = chosenSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        if (clean) {
          Store.setRestaurantSlug(clean);
          renderRestaurantHub();
          loadAllDashboardData();
          alert(`تم التبديل بنجاح إلى مطعم: ${clean}`);
        }
      }
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
    shareLink.textContent = targetUrl;
  }
  if (previewBtn) {
    previewBtn.href = `./index.html?m=${slug}`;
  }
}

function loadAllDashboardData() {
  renderRestaurantHub();
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
        background: linear-gradient(135deg, #7c2d12, #c2410c);
        color: #fff;
        padding: 16px 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        font-size: 0.88rem;
        line-height: 1.6;
        box-shadow: 0 4px 20px rgba(194,65,12,0.4);
      `;
      banner.innerHTML = `
        <svg style="width:28px;height:28px;flex-shrink:0;margin-top:2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <div style="font-weight:900; font-size:1rem; margin-bottom:6px;">⚠️ إعداد المطعم غير مكتمل — لا تشارك الرابط بعد!</div>
          <div>يجب إكمال الإعدادات الأساسية قبل مشاركة رابط المنيو مع العملاء:</div>
          <ul style="margin:8px 0 0 0; padding-right:18px;">
            ${!settings.storeName ? '<li>اسم المطعم مطلوب</li>' : ''}
            ${!settings.whatsappNumber ? '<li>رقم واتساب استقبال الطلبات مطلوب</li>' : ''}
          </ul>
          <div style="margin-top:10px;">
            <button onclick="document.querySelector('[data-tab=tab-settings]').click(); this.closest('#onboarding-setup-banner').style.display='none';"
              style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.4); padding:7px 16px; border-radius:8px; cursor:pointer; font-weight:800; font-size:0.85rem;">
              اذهب إلى الإعدادات الآن ←
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

// ── Navigation Tabs ────────────────────────────────────────
function setupTabNavigation() {
  adminElements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      currentTab = targetTab;

      adminElements.tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      adminElements.tabPanes.forEach(pane => {
        pane.style.display = pane.id === targetTab ? 'block' : 'none';
      });

      if (targetTab === 'tab-products') renderCatalog();
      else if (targetTab === 'tab-categories') renderCategoriesList();
      else if (targetTab === 'tab-stories') renderStoriesList();
    });
  });
}

// ── Image Device Dropzone Binder ───────────────────────────
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

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      showPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
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
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        showPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
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

function renderCatalog() {
  if (!adminElements.catalogContainer) return;
  const prods = Store.getProducts();
  const currency = Store.getSettings().currency || "ج.م";

  if (prods.length === 0) {
    adminElements.catalogContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-muted);">لا توجد منتجات مسجلة. أضف أول صنف الآن!</div>`;
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

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:8px; margin-top:8px;">
          <button class="btn btn-ghost btn-sm" onclick="toggleProductVisibilityFast('${p.id}')" title="${p.visible === false ? 'إظهار الصنف' : 'إخفاء الصنف'}">
            ${p.visible === false ? '👁️ إظهار' : '🚫 إخفاء'}
          </button>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-ghost btn-sm" onclick="openProductModal('${p.id}')" title="تعديل">✏️ تعديل</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="deleteProductFast('${p.id}')" title="حذف">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

window.updateProductPriceFast = function(id, newPrice) {
  const num = parseFloat(newPrice);
  if (isNaN(num) || num < 0) return;
  Store.updateProduct(id, { price: num });
};

window.toggleProductVisibilityFast = function(id) {
  const p = Store.getProducts().find(item => item.id === id);
  if (!p) return;
  Store.updateProduct(id, { visible: p.visible === false ? true : false });
  renderCatalog();
};

window.deleteProductFast = function(id) {
  if (confirm("هل أنت متأكد من حذف هذا الصنف نهائياً؟")) {
    Store.deleteProduct(id);
    renderCatalog();
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

function saveProductForm() {
  const id = adminElements.prodId.value || ('p_' + Date.now());
  const name = (adminElements.prodName.value || '').trim();
  const category = adminElements.prodCategory.value;
  const price = parseFloat(adminElements.prodPrice.value) || 0;
  const originalPrice = parseFloat(adminElements.prodOriginalPrice.value) || 0;
  const prepTime = (adminElements.prodPrepTime.value || '').trim();
  const badge = (adminElements.prodBadge.value || '').trim();
  const isFeatured = adminElements.prodFeatured.checked;
  const desc = (adminElements.prodDesc.value || '').trim();
  const image = (adminElements.prodImgUrl.value || '').trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";

  // Collect sizes
  const sizes = [];
  document.querySelectorAll('.size-row-item').forEach((row, idx) => {
    const sName = (row.querySelector('.size-name-input').value || '').trim();
    const sPrice = parseFloat(row.querySelector('.size-price-input').value) || 0;
    if (sName) {
      sizes.push({ id: 's_' + idx, name: sName, price: sPrice });
    }
  });

  // Collect addons
  const addons = [];
  document.querySelectorAll('.addon-row-item').forEach((row, idx) => {
    const aName = (row.querySelector('.addon-name-input').value || '').trim();
    const aPrice = parseFloat(row.querySelector('.addon-price-input').value) || 0;
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

  if (currentEditingProductId) {
    Store.updateProduct(currentEditingProductId, productData);
    alert("تم تحديث بيانات الصنف بنجاح!");
  } else {
    Store.addProduct(productData);
    alert("تمت إضافة الصنف بنجاح إلى المنيو!");
  }

  closeProductModal();
  renderCatalog();
}

// ── Categories Management ──────────────────────────────────
function setupCategoryManagement() {
  if (adminElements.btnAddCat) {
    adminElements.btnAddCat.addEventListener('click', () => {
      const val = (adminElements.newCatInput.value || '').trim();
      if (!val) return;
      const cats = Store.getCategories();
      if (!cats.includes(val)) {
        cats.push(val);
        Store.saveCategories(cats);
        adminElements.newCatInput.value = '';
        renderCategoriesList();
      }
    });
  }
}

function renderCategoriesList() {
  if (!adminElements.categoriesListContainer) return;
  const cats = Store.getCategories();
  adminElements.categoriesListContainer.innerHTML = cats.map(cat => `
    <div style="display:flex; align-items:center; gap:8px; background:var(--surface-raised); border:1px solid var(--border); padding:8px 14px; border-radius:var(--radius-sm);">
      <span style="font-size:13px; font-weight:700; color:var(--text-main);">${cat}</span>
      <button class="btn btn-ghost btn-sm" style="color:var(--danger); padding:2px 4px;" onclick="deleteCategoryFast('${cat}')" title="حذف">✕</button>
    </div>
  `).join('');
}

window.deleteCategoryFast = function(cat) {
  if (confirm(`هل أنت متأكد من حذف قسم "${cat}"؟`)) {
    const cats = Store.getCategories().filter(c => c !== cat);
    Store.saveCategories(cats);
    renderCategoriesList();
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

function saveStoryForm() {
  const id = adminElements.storyId.value || ('s_' + Date.now());
  const title = (adminElements.storyTitleInput.value || '').trim();
  const tagline = (adminElements.storyTaglineInput.value || '').trim();
  const badge = (adminElements.storyBadgeInput.value || '').trim();
  const productId = adminElements.storyProductSelect.value;
  const desc = (adminElements.storyDescInput.value || '').trim();
  const image = (adminElements.storyImgUrl.value || '').trim();

  const storyData = { id, title, tagline, badge, productId, desc, image };

  if (currentEditingStoryId) {
    Store.updateStory(currentEditingStoryId, storyData);
  } else {
    Store.addStory(storyData);
  }

  closeStoryModal();
  renderStoriesList();
}

window.deleteStoryFast = function(id) {
  if (confirm("هل أنت متأكد من حذف هذه القصة؟")) {
    Store.deleteStory(id);
    renderStoriesList();
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
      reader.onload = (ev) => {
        try {
          Store.importAllDataJSON(ev.target.result);
          alert("تم استرجاع كافة بيانات المنيو بنجاح!");
          loadAllDashboardData();
        } catch (err) {
          alert("حدث خطأ أثناء استرجاع الملف: " + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  if (adminElements.btnFactoryReset) {
    adminElements.btnFactoryReset.addEventListener('click', () => {
      const ok = confirm("تحذير: سيتم مسح كافة التعديلات واستعادة المنيو الافتراضي الأولي. هل تود المتابعة؟");
      if (ok) {
        Store.resetAllDataToDefault();
        alert("تم استعادة إعدادات المصنع بنجاح!");
        loadAllDashboardData();
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
    adminElements.btnAddPromoCode.addEventListener('click', () => {
      const code = (adminElements.newPromoCode.value || '').trim().toUpperCase();
      const type = adminElements.newPromoType.value;
      const val = parseFloat(adminElements.newPromoVal.value) || 0;

      if (!code || val <= 0) {
        alert("يرجى إدخال كود وقيمة صحيحة");
        return;
      }

      const settings = Store.getSettings();
      settings.promoCodes = settings.promoCodes || [];
      settings.promoCodes.push({ code, type, value: val, desc: `خصم ${val}${type === 'percent' ? '%' : ' ج.م'}` });
      Store.saveSettings(settings);

      adminElements.newPromoCode.value = '';
      adminElements.newPromoVal.value = '';
      renderPromoCodesList(settings.promoCodes);
    });
  }

  if (adminElements.settingsForm) {
    adminElements.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsFromForm();
    });
  }
}

window.applyPresetToPickers = function(presetId) {
  const p = THEME_PRESETS[presetId];
  if (!p) return;
  if (adminElements.pickerBg) adminElements.pickerBg.value = p.bg;
  if (adminElements.pickerSurface) adminElements.pickerSurface.value = p.surface;
  if (adminElements.pickerPrimary) adminElements.pickerPrimary.value = p.primary;
  if (adminElements.pickerText) adminElements.pickerText.value = p.textMain;

  const current = Store.getSettings();
  current.themePreset = presetId;
  current.siteColors = { ...p };
  Store.saveSettings(current);
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
  if (adminElements.setAdminPin) adminElements.setAdminPin.value = s.adminPin || '1234';
  
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

  // New fields
  if (adminElements.setImgbbKey) adminElements.setImgbbKey.value = s.imgbbApiKey || '';
  if (adminElements.setDeliveryTime) adminElements.setDeliveryTime.value = s.deliveryTime || '';
  if (adminElements.setMinOrder) adminElements.setMinOrder.value = s.minOrder !== undefined ? s.minOrder : 0;
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

window.deletePromoFast = function(index) {
  const settings = Store.getSettings();
  settings.promoCodes.splice(index, 1);
  Store.saveSettings(settings);
  renderPromoCodesList(settings.promoCodes);
};

function saveSettingsFromForm() {
  const current = Store.getSettings();

  // Validate critical fields before saving
  const newPin = (adminElements.setAdminPin?.value || '').trim();
  if (newPin && (newPin.length < 4 || !/^\d+$/.test(newPin))) {
    alert('رمز المرور يجب أن يكون 4 أرقام على الأقل ويحتوي على أرقام فقط.');
    adminElements.setAdminPin?.focus();
    return;
  }
  const newWhatsApp = (adminElements.setWhatsapp?.value || '').replace(/\D/g, '');
  if (newWhatsApp && newWhatsApp.length < 10) {
    alert('رقم الواتساب غير صحيح — يجب أن يكون على الأقل 10 أرقام (مثال: 201012345678).');
    adminElements.setWhatsapp?.focus();
    return;
  }

  const bg = adminElements.pickerBg.value || '#120e0c';
  const surface = adminElements.pickerSurface.value || '#1e1814';
  const primary = adminElements.pickerPrimary.value || '#ea580c';
  const textMain = adminElements.pickerText.value || '#faf6f0';

  const updated = {
    ...current,
    storeName: (adminElements.setStoreName.value || '').trim(),
    storeTagline: (adminElements.setStoreTagline.value || '').trim(),
    currency: (adminElements.setCurrency.value || '').trim() || 'ج.م',
    whatsappNumber: (adminElements.setWhatsapp.value || '').trim(),
    walletNumber: (adminElements.setWalletNumber.value || '').trim(),
    walletName: (adminElements.setWalletName.value || '').trim(),
    adminPin: (adminElements.setAdminPin?.value || '').trim() || current.adminPin || '1234',
    logo: (document.getElementById('set-logo-url')?.value || '').trim(),
    cover: (document.getElementById('set-cover-url')?.value || '').trim(),

    // ImgBB and operational settings
    imgbbApiKey: (adminElements.setImgbbKey?.value || '').trim(),
    deliveryTime: (adminElements.setDeliveryTime?.value || '').trim() || '30-45 دقيقة',
    minOrder: parseFloat(adminElements.setMinOrder?.value) || 0,
    showAnnouncement: adminElements.setShowAnnouncement?.checked === true,
    announcementText: (adminElements.setAnnouncementText?.value || '').trim(),

    siteColors: {
      bg,
      surface,
      surfaceRaised: surface,
      headerBg: bg,
      textMain,
      textBody: '#d4c9ba',
      primary: adminElements.pickerPrimary.value,
      border: 'rgba(245, 238, 227, 0.09)'
    },

    enableWalletDiscount: adminElements.setEnableWalletDiscount.checked,
    walletDiscountType: adminElements.setWalletDiscountType.value,
    walletDiscountValue: parseFloat(adminElements.setWalletDiscountVal.value) || 0,

    enableSpendTierDiscount: adminElements.setEnableSpendTier.checked,
    spendTierMinAmount: parseFloat(adminElements.setSpendMinAmount.value) || 0,
    spendTierDiscountType: adminElements.setSpendDiscountType.value,
    spendTierDiscountValue: parseFloat(adminElements.setSpendDiscountVal.value) || 0
  };

  Store.saveSettings(updated);
  alert("تم حفظ كافة الإعدادات بنجاح!");
  loadSettingsIntoForm();
  checkOnboardingSetup();
  renderRestaurantHub();
}

document.addEventListener('DOMContentLoaded', initAdmin);
