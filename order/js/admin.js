// ═══════════════════════════════════════════════════════════
// HarpyOrder — Admin Visual Catalog & Color Studio Manager
// ═══════════════════════════════════════════════════════════

let draggedCardElement = null;
let currentSelectedThemePreset = "charcoal";

let currentSiteColors = {
  bg: "#110e0c",
  surface: "#1c1713",
  surfaceRaised: "#251f1a",
  headerBg: "#110e0c",
  textMain: "#faf6f0",
  textBody: "#d4c9ba",
  primary: "#c2410c",
  border: "rgba(245, 238, 227, 0.09)"
};

const adminElements = {
  loginModal: document.getElementById('login-modal'),
  loginBackdrop: document.getElementById('login-modal-backdrop'),
  pinInput: document.getElementById('admin-pin-input'),
  btnLogin: document.getElementById('btn-login'),
  adminStoreName: document.getElementById('admin-store-name'),

  tabButtons: document.querySelectorAll('.admin-tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),

  adminCatalogContainer: document.getElementById('admin-catalog-container'),
  btnOpenAddProduct: document.getElementById('btn-open-add-product'),
  
  productModal: document.getElementById('product-modal'),
  productModalBackdrop: document.getElementById('product-modal-backdrop'),
  productModalTitle: document.getElementById('product-modal-title'),
  btnCloseProductModal: document.getElementById('btn-close-product-modal'),
  btnCancelProduct: document.getElementById('btn-cancel-product'),
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

  newCatInput: document.getElementById('new-cat-input'),
  btnAddCat: document.getElementById('btn-add-cat'),
  categoriesListContainer: document.getElementById('categories-list-container'),

  themePresetsGrid: document.getElementById('theme-presets-grid'),
  pickerBg: document.getElementById('picker-bg'),
  pickerSurface: document.getElementById('picker-surface'),
  pickerHeaderBg: document.getElementById('picker-header-bg'),
  pickerPrimary: document.getElementById('picker-primary'),
  pickerTextMain: document.getElementById('picker-text-main'),
  pickerTextBody: document.getElementById('picker-text-body'),

  settingsForm: document.getElementById('settings-form'),
  setStoreName: document.getElementById('set-store-name'),
  setCurrency: document.getElementById('set-currency'),
  setStoreTagline: document.getElementById('set-store-tagline'),
  setShowAnnouncement: document.getElementById('set-show-announcement'),
  setAnnouncementText: document.getElementById('set-announcement-text'),

  setEnableWalletDiscount: document.getElementById('set-enable-wallet-discount'),
  setWalletDiscountType: document.getElementById('set-wallet-discount-type'),
  setWalletDiscountVal: document.getElementById('set-wallet-discount-val'),

  setEnableSpendDiscount: document.getElementById('set-enable-spend-discount'),
  setSpendMinAmount: document.getElementById('set-spend-min-amount'),
  setSpendDiscountType: document.getElementById('set-spend-discount-type'),
  setSpendDiscountVal: document.getElementById('set-spend-discount-val'),

  newPromoCode: document.getElementById('new-promo-code'),
  newPromoType: document.getElementById('new-promo-type'),
  newPromoVal: document.getElementById('new-promo-val'),
  btnAddPromoCode: document.getElementById('btn-add-promo-code'),
  promoCodesList: document.getElementById('promo-codes-list'),

  setDeliveryTime: document.getElementById('set-delivery-time'),
  setMinOrder: document.getElementById('set-min-order'),
  setWhatsApp: document.getElementById('set-whatsapp'),
  setWalletNumber: document.getElementById('set-wallet-number'),
  setWalletName: document.getElementById('set-wallet-name'),
  setAdminPin: document.getElementById('set-admin-pin'),
  setLogoUrl: document.getElementById('set-logo-url'),
  setImgbbKey: document.getElementById('set-imgbb-key'),
  btnResetDemo: document.getElementById('btn-reset-demo')
};

function checkAdminAuth() {
  const isLogged = sessionStorage.getItem('harpy_admin_logged');
  if (isLogged === 'true') {
    if (adminElements.loginModal) adminElements.loginModal.classList.remove('open');
    if (adminElements.loginBackdrop) adminElements.loginBackdrop.classList.remove('open');
    initAdminDashboard();
  } else {
    if (adminElements.loginModal) adminElements.loginModal.classList.add('open');
    if (adminElements.loginBackdrop) adminElements.loginBackdrop.classList.add('open');
  }
}

function handleLogin() {
  const settings = Store.getSettings();
  const enteredPin = (adminElements.pinInput.value || '').trim();
  const validPin = settings.adminPin || "1234";

  if (enteredPin === validPin) {
    sessionStorage.setItem('harpy_admin_logged', 'true');
    adminElements.loginModal.classList.remove('open');
    adminElements.loginBackdrop.classList.remove('open');
    initAdminDashboard();
  } else {
    alert("رمز المرور غير صحيح");
    adminElements.pinInput.value = '';
    adminElements.pinInput.focus();
  }
}

function initAdminDashboard() {
  const s = Store.getSettings();
  if (adminElements.adminStoreName) adminElements.adminStoreName.textContent = `إدارة منيو (${s.storeName})`;

  setupTabs();
  renderVisualCatalog();
  renderCategoriesList();
  populateCategorySelect();
  renderThemePresetsSelector();
  loadSettingsForm();
  setupColorStudioListeners();
}

function setupTabs() {
  adminElements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      adminElements.tabButtons.forEach(b => b.classList.remove('active'));
      adminElements.tabPanes.forEach(p => p.style.display = 'none');

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.style.display = 'block';
    });
  });
}

function renderThemePresetsSelector() {
  if (!adminElements.themePresetsGrid) return;
  const presets = Store.THEME_PRESETS;

  adminElements.themePresetsGrid.innerHTML = Object.keys(presets).map(key => {
    const p = presets[key];
    const isSelected = currentSelectedThemePreset === p.id;

    return `
      <div class="theme-preset-card ${isSelected ? 'active' : ''}" onclick="handleSelectThemePreset('${p.id}')">
        <div class="preset-preview-box" style="background:${p.bg};">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; font-weight:700; color:${p.textMain}; background:${p.surface}; padding:1px 6px; border-radius:4px;">
              ${p.name.split(' ')[0]}
            </span>
            <span style="width:12px; height:12px; border-radius:50%; background:${p.primary}; display:inline-block; border:1px solid #fff;"></span>
          </div>
          <div style="background:${p.surface}; border:1px solid ${p.border}; border-radius:4px; padding:3px 6px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:9px; font-weight:600; color:${p.textBody};">صنف المنيو</span>
            <span style="font-size:9px; font-weight:800; color:${p.primary};">140 ج.م</span>
          </div>
        </div>

        <div>
          <div class="preset-card-title">
            <span>${p.name}</span>
            ${isSelected ? '<span style="color:var(--primary); font-size:13px;">✔</span>' : ''}
          </div>
          <div class="preset-card-badge">${p.badge}</div>
        </div>
      </div>
    `;
  }).join('');
}

window.handleSelectThemePreset = function(presetId) {
  currentSelectedThemePreset = presetId;
  const preset = Store.THEME_PRESETS[presetId];
  if (!preset) return;

  currentSiteColors = {
    bg: preset.bg,
    surface: preset.surface,
    surfaceRaised: preset.surfaceRaised,
    headerBg: preset.headerBg,
    textMain: preset.textMain,
    textBody: preset.textBody,
    primary: preset.primary,
    border: preset.border
  };

  syncColorPickersWithState();
  applyLiveThemePreview();
  renderThemePresetsSelector();
};

function syncColorPickersWithState() {
  if (adminElements.pickerBg) adminElements.pickerBg.value = currentSiteColors.bg;
  if (adminElements.pickerSurface) adminElements.pickerSurface.value = currentSiteColors.surface;
  if (adminElements.pickerHeaderBg) adminElements.pickerHeaderBg.value = currentSiteColors.headerBg;
  if (adminElements.pickerPrimary) adminElements.pickerPrimary.value = currentSiteColors.primary;
  if (adminElements.pickerTextMain) adminElements.pickerTextMain.value = currentSiteColors.textMain;
  if (adminElements.pickerTextBody) adminElements.pickerTextBody.value = currentSiteColors.textBody;
}

function applyLiveThemePreview() {
  Store.applyTheme({
    ...Store.getSettings(),
    themePreset: currentSelectedThemePreset,
    siteColors: currentSiteColors
  });
}

function setupColorStudioListeners() {
  const pickers = [
    { el: adminElements.pickerBg, key: 'bg' },
    { el: adminElements.pickerSurface, key: 'surface' },
    { el: adminElements.pickerHeaderBg, key: 'headerBg' },
    { el: adminElements.pickerPrimary, key: 'primary' },
    { el: adminElements.pickerTextMain, key: 'textMain' },
    { el: adminElements.pickerTextBody, key: 'textBody' }
  ];

  pickers.forEach(({ el, key }) => {
    if (el) {
      el.addEventListener('input', (e) => {
        currentSiteColors[key] = e.target.value;
        if (key === 'surface') currentSiteColors.surfaceRaised = e.target.value;
        currentSelectedThemePreset = 'custom';
        applyLiveThemePreview();
      });
    }
  });
}

function renderVisualCatalog() {
  if (!adminElements.adminCatalogContainer) return;
  const prods = Store.getProducts();
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";

  if (prods.length === 0) {
    adminElements.adminCatalogContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--text-faint);">
        لا توجد أي أصناف حالياً. اضغط على "+ إضافة صنف جديد" للبدء.
      </div>
    `;
    return;
  }

  adminElements.adminCatalogContainer.innerHTML = prods.map((p, index) => {
    const isVisible = p.visible !== false;

    return `
      <div class="admin-catalog-item ${!isVisible ? 'hidden-item' : ''}" 
           draggable="true" 
           data-product-id="${p.id}">
        
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div style="display:flex; align-items:center; gap:4px;">
            <span class="admin-drag-handle" title="اسحب لإعادة الترتيب">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="9" cy="5" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="9" cy="19" r="1.2"/><circle cx="15" cy="5" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="15" cy="19" r="1.2"/></svg>
            </span>
            <button type="button" class="reorder-mobile-btn" onclick="moveProductUp('${p.id}')" title="تحريك لأعلى" ${index === 0 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="m18 15-6-6-6 6"/></svg>
            </button>
            <button type="button" class="reorder-mobile-btn" onclick="moveProductDown('${p.id}')" title="تحريك لأسفل" ${index === prods.length - 1 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <span style="font-size:11.5px; font-weight:600; color:var(--text-muted); background:var(--surface); padding:2px 8px; border-radius:4px; margin-right:4px;">
              ${p.category}
            </span>
          </div>
          <button type="button" 
                  class="btn btn-ghost btn-sm" 
                  style="font-size:11.5px; padding:3px 8px; color:${isVisible ? 'var(--accent-wa)' : 'var(--danger)'}; display:inline-flex; align-items:center; gap:4px;"
                  onclick="handleToggleVisibility('${p.id}')"
                  title="تغيير حالة الظهور">
            ${isVisible ? '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> معروض' : '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg> مخفي'}
          </button>
        </div>

        <div style="display:flex; gap:12px; align-items:center;">
          <img src="${p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}" 
               style="width:54px; height:54px; border-radius:6px; object-fit:cover; background:var(--surface);" 
               alt="${p.name}">
          <div style="flex:1; min-width:0;">
            <div style="font-weight:700; font-size:14px; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${p.name}
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px; display:flex; align-items:center; gap:4px;">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${p.prepTime || '15 دقيقة'}</span> 
              ${p.originalPrice && p.originalPrice > p.price ? `<span style="margin:0 4px;">•</span> <span style="color:var(--danger); font-weight:700;">خصم</span>` : ''}
              ${p.badge ? `<span style="margin:0 4px;">•</span> <span>${p.badge}</span>` : ''}
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding-top:10px; border-top:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:4px;">
            <span style="font-size:11px; color:var(--text-muted); font-weight:600;">السعر:</span>
            <input type="number" 
                   class="inline-price-input font-num" 
                   value="${p.price}" 
                   step="0.5"
                   onchange="handleInlinePriceChange('${p.id}', this.value)"
                   onkeypress="if(event.key === 'Enter') this.blur();">
            <span style="font-size:11px; color:var(--primary); font-weight:700;">${currency}</span>
          </div>

          <div style="display:flex; gap:6px;">
            <button type="button" class="btn btn-ghost btn-sm" onclick="openEditProductModal('${p.id}')" title="تعديل كامل">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              <span>تعديل</span>
            </button>
            <button type="button" class="btn btn-danger btn-sm" onclick="handleDeleteProduct('${p.id}')" title="حذف الصنف">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setupDragAndDrop();
}

window.moveProductUp = function(id) {
  const prods = Store.getProducts();
  const idx = prods.findIndex(p => p.id === id);
  if (idx > 0) {
    const temp = prods[idx];
    prods[idx] = prods[idx - 1];
    prods[idx - 1] = temp;
    Store.saveProducts(prods);
    renderVisualCatalog();
  }
};

window.moveProductDown = function(id) {
  const prods = Store.getProducts();
  const idx = prods.findIndex(p => p.id === id);
  if (idx < prods.length - 1 && idx !== -1) {
    const temp = prods[idx];
    prods[idx] = prods[idx + 1];
    prods[idx + 1] = temp;
    Store.saveProducts(prods);
    renderVisualCatalog();
  }
};

window.handleInlinePriceChange = function(id, newPrice) {
  const price = parseFloat(newPrice) || 0;
  Store.quickUpdatePrice(id, price);
};

window.handleToggleVisibility = function(id) {
  Store.toggleProductVisibility(id);
  renderVisualCatalog();
};

function setupDragAndDrop() {
  const items = adminElements.adminCatalogContainer.querySelectorAll('.admin-catalog-item');

  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedCardElement = item;
      item.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', () => {
      if (draggedCardElement) draggedCardElement.style.opacity = '1';
      draggedCardElement = null;
      items.forEach(i => i.style.borderColor = '');
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      item.style.borderColor = 'var(--primary)';
    });

    item.addEventListener('dragleave', () => {
      item.style.borderColor = '';
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.style.borderColor = '';

      if (draggedCardElement && draggedCardElement !== item) {
        const parent = adminElements.adminCatalogContainer;
        const allCards = Array.from(parent.querySelectorAll('.admin-catalog-item'));
        const fromIndex = allCards.indexOf(draggedCardElement);
        const toIndex = allCards.indexOf(item);

        if (fromIndex < toIndex) {
          item.after(draggedCardElement);
        } else {
          item.before(draggedCardElement);
        }

        const newOrderedCards = Array.from(parent.querySelectorAll('.admin-catalog-item'));
        const newIds = newOrderedCards.map(c => c.dataset.productId);
        Store.reorderProducts(newIds);
      }
    });
  });
}

function populateCategorySelect() {
  if (!adminElements.prodCategory) return;
  const categories = Store.getCategories();
  adminElements.prodCategory.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function openAddProductModal() {
  if (adminElements.productModalTitle) adminElements.productModalTitle.textContent = "إضافة صنف جديد لدفتر المنيو";
  if (adminElements.prodId) adminElements.prodId.value = '';
  if (adminElements.prodName) adminElements.prodName.value = '';
  populateCategorySelect();
  if (adminElements.prodPrice) adminElements.prodPrice.value = '';
  if (adminElements.prodOriginalPrice) adminElements.prodOriginalPrice.value = '';
  if (adminElements.prodPrepTime) adminElements.prodPrepTime.value = '15 دقيقة';
  if (adminElements.prodBadge) adminElements.prodBadge.value = '';
  if (adminElements.prodFeatured) adminElements.prodFeatured.checked = false;
  if (adminElements.prodDesc) adminElements.prodDesc.value = '';
  if (adminElements.prodImgUrl) adminElements.prodImgUrl.value = '';
  if (adminElements.prodImgStatus) adminElements.prodImgStatus.style.display = 'none';

  if (adminElements.productModal) adminElements.productModal.classList.add('open');
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.classList.add('open');
}

window.openEditProductModal = function(id) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === id);
  if (!p) return;

  if (adminElements.productModalTitle) adminElements.productModalTitle.textContent = "تعديل تفاصيل الصنف";
  if (adminElements.prodId) adminElements.prodId.value = p.id;
  if (adminElements.prodName) adminElements.prodName.value = p.name || '';
  populateCategorySelect();
  if (adminElements.prodCategory) adminElements.prodCategory.value = p.category;
  if (adminElements.prodPrice) adminElements.prodPrice.value = p.price !== undefined ? p.price : '';
  if (adminElements.prodOriginalPrice) adminElements.prodOriginalPrice.value = p.originalPrice || '';
  if (adminElements.prodPrepTime) adminElements.prodPrepTime.value = p.prepTime || '15 دقيقة';
  if (adminElements.prodBadge) adminElements.prodBadge.value = p.badge || '';
  if (adminElements.prodFeatured) adminElements.prodFeatured.checked = p.isFeatured === true;
  if (adminElements.prodDesc) adminElements.prodDesc.value = p.desc || '';
  if (adminElements.prodImgUrl) adminElements.prodImgUrl.value = p.image || '';
  if (adminElements.prodImgStatus) adminElements.prodImgStatus.style.display = 'none';

  if (adminElements.productModal) adminElements.productModal.classList.add('open');
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.classList.add('open');
};

function closeProductModal() {
  if (adminElements.productModal) adminElements.productModal.classList.remove('open');
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.classList.remove('open');
}

window.handleDeleteProduct = function(id) {
  if (confirm("هل أنت متأكد من حذف هذا الصنف نهائياً؟")) {
    Store.deleteProduct(id);
    renderVisualCatalog();
  }
};

function renderCategoriesList() {
  if (!adminElements.categoriesListContainer) return;
  const cats = Store.getCategories();

  adminElements.categoriesListContainer.innerHTML = cats.map(c => `
    <div style="background:var(--surface-raised); border:1px solid var(--border); padding:8px 14px; border-radius:var(--radius-full); display:flex; align-items:center; gap:8px; font-weight:700; font-size:13px;">
      <span>${c}</span>
      <button type="button" onclick="handleDeleteCategory('${c}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:13px;" title="حذف القسم">✕</button>
    </div>
  `).join('');
}

function handleAddCategory() {
  const newCat = (adminElements.newCatInput.value || '').trim();
  if (!newCat) return;
  const cats = Store.getCategories();
  if (cats.includes(newCat)) {
    alert("القسم موجود بالفعل");
    return;
  }
  cats.push(newCat);
  Store.saveCategories(cats);
  adminElements.newCatInput.value = '';
  renderCategoriesList();
  populateCategorySelect();
}

window.handleDeleteCategory = function(catName) {
  let cats = Store.getCategories();
  if (cats.length <= 1) {
    alert("يجب الإبقاء على قسم واحد على الأقل");
    return;
  }
  if (confirm(`حذف قسم "${catName}"؟`)) {
    cats = cats.filter(c => c !== catName);
    Store.saveCategories(cats);
    renderCategoriesList();
    populateCategorySelect();
  }
};

function renderAdminPromoCodesList() {
  if (!adminElements.promoCodesList) return;
  const s = Store.getSettings();
  const promos = s.promoCodes || [];

  if (promos.length === 0) {
    adminElements.promoCodesList.innerHTML = `<span style="font-size:11.5px; color:var(--text-faint);">لا توجد أكواد خصم حالياً</span>`;
    return;
  }

  adminElements.promoCodesList.innerHTML = promos.map((p, idx) => `
    <div style="background:var(--surface-raised); border:1px solid var(--border-strong); padding:6px 12px; border-radius:var(--radius-xs); display:flex; align-items:center; gap:8px; font-size:12px;">
      <span class="font-num" style="font-weight:800; color:var(--primary);">${p.code}</span>
      <span style="color:var(--text-muted);">(${p.value}${p.type === 'fixed' ? ' ج.م' : '%'})</span>
      <button type="button" onclick="handleDeletePromoCode(${idx})" style="background:none; border:none; color:var(--danger); cursor:pointer; font-weight:700; font-size:12px;" title="حذف الكود">✕</button>
    </div>
  `).join('');
}

window.handleDeletePromoCode = function(idx) {
  const s = Store.getSettings();
  const promos = s.promoCodes || [];
  promos.splice(idx, 1);
  Store.saveSettings({ ...s, promoCodes: promos });
  renderAdminPromoCodesList();
};

function handleAddPromoCode() {
  const code = (adminElements.newPromoCode.value || '').trim().toUpperCase();
  const type = adminElements.newPromoType.value || 'percent';
  const val = parseFloat(adminElements.newPromoVal.value) || 0;

  if (!code || val <= 0) {
    alert("اكتب الكود والقيمة بشكل صحيح");
    return;
  }

  const s = Store.getSettings();
  const promos = s.promoCodes || [];

  if (promos.some(p => p.code === code)) {
    alert("كود الخصم مضاف بالفعل");
    return;
  }

  promos.push({ code, type, value: val, desc: `خصم ${val}${type === 'fixed' ? ' ج.م' : '%'}` });
  Store.saveSettings({ ...s, promoCodes: promos });

  adminElements.newPromoCode.value = '';
  adminElements.newPromoVal.value = '';
  renderAdminPromoCodesList();
}

function loadSettingsForm() {
  const s = Store.getSettings();
  if (adminElements.setStoreName) adminElements.setStoreName.value = s.storeName || '';
  if (adminElements.setCurrency) adminElements.setCurrency.value = s.currency || 'ج.م';
  if (adminElements.setStoreTagline) adminElements.setStoreTagline.value = s.storeTagline || '';
  
  currentSelectedThemePreset = s.themePreset || 'charcoal';
  currentSiteColors = { ...DEFAULT_SETTINGS.siteColors, ...(s.siteColors || {}) };

  renderThemePresetsSelector();
  syncColorPickersWithState();

  if (adminElements.setShowAnnouncement) {
    adminElements.setShowAnnouncement.checked = s.showAnnouncement !== false;
  }
  if (adminElements.setAnnouncementText) {
    adminElements.setAnnouncementText.value = s.announcementText || '';
  }

  if (adminElements.setEnableWalletDiscount) {
    adminElements.setEnableWalletDiscount.checked = s.enableWalletDiscount !== false;
  }
  if (adminElements.setWalletDiscountType) {
    adminElements.setWalletDiscountType.value = s.walletDiscountType || 'percent';
  }
  if (adminElements.setWalletDiscountVal) {
    adminElements.setWalletDiscountVal.value = s.walletDiscountValue !== undefined ? s.walletDiscountValue : 10;
  }

  if (adminElements.setEnableSpendDiscount) {
    adminElements.setEnableSpendDiscount.checked = s.enableSpendTierDiscount !== false;
  }
  if (adminElements.setSpendMinAmount) {
    adminElements.setSpendMinAmount.value = s.spendTierMinAmount !== undefined ? s.spendTierMinAmount : 300;
  }
  if (adminElements.setSpendDiscountType) {
    adminElements.setSpendDiscountType.value = s.spendTierDiscountType || 'percent';
  }
  if (adminElements.setSpendDiscountVal) {
    adminElements.setSpendDiscountVal.value = s.spendTierDiscountValue !== undefined ? s.spendTierDiscountValue : 15;
  }

  renderAdminPromoCodesList();

  if (adminElements.setDeliveryTime) adminElements.setDeliveryTime.value = s.deliveryTime || '30-45 دقيقة';
  if (adminElements.setMinOrder) adminElements.setMinOrder.value = s.minOrder || 0;
  if (adminElements.setWhatsApp) adminElements.setWhatsApp.value = s.whatsappNumber || '';
  if (adminElements.setWalletNumber) adminElements.setWalletNumber.value = s.walletNumber || '';
  if (adminElements.setWalletName) adminElements.setWalletName.value = s.walletName || '';
  if (adminElements.setAdminPin) adminElements.setAdminPin.value = s.adminPin || '1234';
  if (adminElements.setLogoUrl) adminElements.setLogoUrl.value = s.logo || '';
  if (adminElements.setImgbbKey) adminElements.setImgbbKey.value = s.imgbbApiKey || '';
}

function handleSaveSettings(e) {
  e.preventDefault();
  const current = Store.getSettings();
  const updated = {
    ...current,
    storeName: adminElements.setStoreName.value.trim(),
    currency: adminElements.setCurrency.value.trim() || 'ج.م',
    storeTagline: adminElements.setStoreTagline.value.trim(),
    themePreset: currentSelectedThemePreset,
    siteColors: currentSiteColors,
    primaryColor: currentSiteColors.primary,
    showAnnouncement: adminElements.setShowAnnouncement ? adminElements.setShowAnnouncement.checked : true,
    announcementText: adminElements.setAnnouncementText ? adminElements.setAnnouncementText.value.trim() : '',

    enableWalletDiscount: adminElements.setEnableWalletDiscount ? adminElements.setEnableWalletDiscount.checked : true,
    walletDiscountType: adminElements.setWalletDiscountType ? adminElements.setWalletDiscountType.value : 'percent',
    walletDiscountValue: adminElements.setWalletDiscountVal ? parseFloat(adminElements.setWalletDiscountVal.value) || 0 : 0,

    enableSpendTierDiscount: adminElements.setEnableSpendDiscount ? adminElements.setEnableSpendDiscount.checked : true,
    spendTierMinAmount: adminElements.setSpendMinAmount ? parseFloat(adminElements.setSpendMinAmount.value) || 0 : 300,
    spendTierDiscountType: adminElements.setSpendDiscountType ? adminElements.setSpendDiscountType.value : 'percent',
    spendTierDiscountValue: adminElements.setSpendDiscountVal ? parseFloat(adminElements.setSpendDiscountVal.value) || 0 : 15,

    deliveryTime: adminElements.setDeliveryTime ? adminElements.setDeliveryTime.value.trim() : '30-45 دقيقة',
    minOrder: adminElements.setMinOrder ? parseFloat(adminElements.setMinOrder.value) || 0 : 0,
    whatsappNumber: adminElements.setWhatsApp.value.trim(),
    walletNumber: adminElements.setWalletNumber.value.trim(),
    walletName: adminElements.setWalletName.value.trim(),
    adminPin: adminElements.setAdminPin.value.trim() || '1234',
    logo: adminElements.setLogoUrl.value.trim(),
    imgbbApiKey: adminElements.setImgbbKey ? adminElements.setImgbbKey.value.trim() : current.imgbbApiKey
  };

  Store.saveSettings(updated);
  if (adminElements.adminStoreName) adminElements.adminStoreName.textContent = `إدارة منيو (${updated.storeName})`;
  alert("تم حفظ جميع التعديلات بنجاح");
}

function handleResetDemo() {
  if (confirm("تحذير: سيتم استعادة جميع الأصناف والأقسام والإعدادات الافتراضية. هل تريد المتابعة؟")) {
    Store.resetAll();
    initAdminDashboard();
  }
}

function setupAdminEventListeners() {
  if (adminElements.btnLogin) adminElements.btnLogin.addEventListener('click', handleLogin);
  if (adminElements.pinInput) {
    adminElements.pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  if (adminElements.btnOpenAddProduct) adminElements.btnOpenAddProduct.addEventListener('click', openAddProductModal);
  if (adminElements.btnCloseProductModal) adminElements.btnCloseProductModal.addEventListener('click', closeProductModal);
  if (adminElements.btnCancelProduct) adminElements.btnCancelProduct.addEventListener('click', closeProductModal);
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.addEventListener('click', closeProductModal);

  if (adminElements.prodImgFile) {
    adminElements.prodImgFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      adminElements.prodImgStatus.textContent = "جاري رفع الصورة...";
      adminElements.prodImgStatus.style.display = "block";

      try {
        const url = await Store.uploadImage(file);
        adminElements.prodImgUrl.value = url;
        adminElements.prodImgStatus.textContent = "تم تجهيز رابط الصورة بنجاح";
      } catch (err) {
        adminElements.prodImgStatus.textContent = "تعذر الرفع، يرجى لصق رابط مباشر";
      }
    });
  }

  if (adminElements.productForm) {
    adminElements.productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = adminElements.prodId.value;
      const productData = {
        name: adminElements.prodName.value.trim(),
        category: adminElements.prodCategory.value,
        price: parseFloat(adminElements.prodPrice.value) || 0,
        originalPrice: parseFloat(adminElements.prodOriginalPrice.value) || 0,
        prepTime: (adminElements.prodPrepTime.value || '15 دقيقة').trim(),
        badge: (adminElements.prodBadge.value || '').trim(),
        isFeatured: adminElements.prodFeatured.checked,
        desc: adminElements.prodDesc.value.trim(),
        image: adminElements.prodImgUrl.value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'
      };

      if (id) {
        Store.updateProduct(id, productData);
      } else {
        Store.addProduct(productData);
      }

      closeProductModal();
      renderVisualCatalog();
    });
  }

  if (adminElements.btnAddCat) adminElements.btnAddCat.addEventListener('click', handleAddCategory);
  if (adminElements.newCatInput) {
    adminElements.newCatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAddCategory();
    });
  }

  if (adminElements.btnAddPromoCode) adminElements.btnAddPromoCode.addEventListener('click', handleAddPromoCode);

  if (adminElements.settingsForm) adminElements.settingsForm.addEventListener('submit', handleSaveSettings);
  if (adminElements.btnResetDemo) adminElements.btnResetDemo.addEventListener('click', handleResetDemo);
}

document.addEventListener('DOMContentLoaded', () => {
  setupAdminEventListeners();
  checkAdminAuth();
});
