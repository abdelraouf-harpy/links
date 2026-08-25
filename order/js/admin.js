// -----------------------------------------------------------
// HarpyOrder � Admin Visual Catalog & Menu Manager
// -----------------------------------------------------------

let draggedCardElement = null;

const adminElements = {
  loginModal: document.getElementById('login-modal'),
  loginBackdrop: document.getElementById('login-modal-backdrop'),
  pinInput: document.getElementById('admin-pin-input'),
  btnLogin: document.getElementById('btn-login'),
  adminStoreName: document.getElementById('admin-store-name'),

  // Tabs
  tabButtons: document.querySelectorAll('.admin-tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),

  // Catalog
  adminCatalogContainer: document.getElementById('admin-catalog-container'),
  btnOpenAddProduct: document.getElementById('btn-open-add-product'),
  
  // Product Modal
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
  prodPrepTime: document.getElementById('prod-preptime'),
  prodBadge: document.getElementById('prod-badge'),
  prodFeatured: document.getElementById('prod-featured'),
  prodDesc: document.getElementById('prod-desc'),
  prodImgUrl: document.getElementById('prod-img-url'),
  prodImgFile: document.getElementById('prod-img-file'),
  prodImgStatus: document.getElementById('prod-img-status'),

  // Categories
  newCatInput: document.getElementById('new-cat-input'),
  btnAddCat: document.getElementById('btn-add-cat'),
  categoriesListContainer: document.getElementById('categories-list-container'),

  // Settings
  settingsForm: document.getElementById('settings-form'),
  setStoreName: document.getElementById('set-store-name'),
  setCurrency: document.getElementById('set-currency'),
  setStoreTagline: document.getElementById('set-store-tagline'),
  setWhatsApp: document.getElementById('set-whatsapp'),
  setWalletNumber: document.getElementById('set-wallet-number'),
  setWalletName: document.getElementById('set-wallet-name'),
  setAdminPin: document.getElementById('set-admin-pin'),
  setLogoUrl: document.getElementById('set-logo-url'),
  setImgbbKey: document.getElementById('set-imgbb-key'),
  btnResetDemo: document.getElementById('btn-reset-demo'),

  toastContainer: document.getElementById('toast-container')
};

// -- Toast Notification -------------------------------------
function showAdminToast(message, type = "success") {
  if (!adminElements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  adminElements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// -- Authentication Check -----------------------------------
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
    showAdminToast("????? ??! ?? ????? ?????? ?????");
  } else {
    showAdminToast("??? ?????? ??? ????", "error");
    adminElements.pinInput.value = '';
    adminElements.pinInput.focus();
  }
}

// -- Init Dashboard -----------------------------------------
function initAdminDashboard() {
  const s = Store.getSettings();
  if (adminElements.adminStoreName) adminElements.adminStoreName.textContent = `????? ???? (${s.storeName})`;

  setupTabs();
  renderVisualCatalog();
  renderCategoriesList();
  populateCategorySelect();
  loadSettingsForm();
}

// -- Tab Management -----------------------------------------
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

// -- Render Visual Product Catalog (Drag & Drop + Mobile Arrows + Inline) --
function renderVisualCatalog() {
  if (!adminElements.adminCatalogContainer) return;
  const prods = Store.getProducts();
  const settings = Store.getSettings();
  const currency = settings.currency || "?.?";

  if (prods.length === 0) {
    adminElements.adminCatalogContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--text-faint);">
        ?? ???? ?? ????? ??????. ???? ??? "+ ????? ??? ????" ?????.
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
        
        <!-- Header Row (Drag Handle + Mobile Arrows + Category + Visibility Toggle) -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div style="display:flex; align-items:center; gap:4px;">
            <span class="admin-drag-handle" title="???? ?????? ???????">?</span>
            <button type="button" class="reorder-mobile-btn" onclick="moveProductUp('${p.id}')" title="????? ?????" ${index === 0 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>?</button>
            <button type="button" class="reorder-mobile-btn" onclick="moveProductDown('${p.id}')" title="????? ?????" ${index === prods.length - 1 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>?</button>
            <span style="font-size:11px; font-weight:800; color:var(--text-muted); background:var(--surface); padding:2px 8px; border-radius:var(--radius-xs); margin-right:4px;">
              ${p.category}
            </span>
          </div>
          <button type="button" 
                  class="btn btn-ghost btn-sm" 
                  style="font-size:11px; padding:3px 8px; color:${isVisible ? 'var(--accent-wa)' : 'var(--danger)'};"
                  onclick="handleToggleVisibility('${p.id}')"
                  title="????? ???? ?????? ???????">
            ${isVisible ? '??? ?????' : '?? ????'}
          </button>
        </div>

        <!-- Body Row (Thumb + Title & Desc) -->
        <div style="display:flex; gap:12px; align-items:center;">
          <img src="${p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}" 
               style="width:56px; height:56px; border-radius:var(--radius-xs); object-fit:cover; background:var(--surface);" 
               alt="${p.name}">
          <div style="flex:1; min-width:0;">
            <div style="font-weight:900; font-size:14px; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${p.name}
            </div>
            <div style="font-size:11px; color:var(--text-faint); margin-top:2px;">
              ?? ${p.prepTime || '15 ?????'} ${p.badge ? `� ??? ${p.badge}` : ''}
            </div>
          </div>
        </div>

        <!-- Footer Row (Inline Price Edit + Full Edit & Delete Actions) -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding-top:10px; border-top:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:4px;">
            <span style="font-size:11px; color:var(--text-muted); font-weight:700;">?????:</span>
            <input type="number" 
                   class="inline-price-input font-num" 
                   value="${p.price}" 
                   step="0.5"
                   onchange="handleInlinePriceChange('${p.id}', this.value)"
                   onkeypress="if(event.key === 'Enter') this.blur();">
            <span style="font-size:11px; color:var(--primary); font-weight:800;">${currency}</span>
          </div>

          <div style="display:flex; gap:6px;">
            <button class="btn btn-ghost btn-sm" onclick="openEditProductModal('${p.id}')" title="????? ????">
              ?? ?????
            </button>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteProduct('${p.id}')" title="??? ?????">
              ???
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setupDragAndDrop();
}

// -- Mobile Reordering Arrows -------------------------------
window.moveProductUp = function(id) {
  const prods = Store.getProducts();
  const idx = prods.findIndex(p => p.id === id);
  if (idx > 0) {
    const temp = prods[idx];
    prods[idx] = prods[idx - 1];
    prods[idx - 1] = temp;
    Store.saveProducts(prods);
    renderVisualCatalog();
    showAdminToast("?? ????? ????? ?????? ?");
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
    showAdminToast("?? ????? ????? ?????? ?");
  }
};

// -- Quick Inline Price Update ------------------------------
window.handleInlinePriceChange = function(id, newPrice) {
  const price = parseFloat(newPrice) || 0;
  Store.quickUpdatePrice(id, price);
  showAdminToast(`?? ????? ????? ??? ${price} ?`);
};

// -- Quick Visibility Toggle --------------------------------
window.handleToggleVisibility = function(id) {
  const isNowVisible = Store.toggleProductVisibility(id);
  renderVisualCatalog();
  showAdminToast(isNowVisible ? "?? ????? ????? ?? ?????? ???" : "?? ????? ????? ?? ?????? ??", "info");
};

// -- Drag and Drop Reordering Setup -------------------------
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

        // Save reordered IDs
        const newOrderedCards = Array.from(parent.querySelectorAll('.admin-catalog-item'));
        const newIds = newOrderedCards.map(c => c.dataset.productId);
        Store.reorderProducts(newIds);
        showAdminToast("?? ??? ??????? ?????? ?????? ?");
      }
    });
  });
}

// -- Product Add / Edit Modal -------------------------------
function populateCategorySelect() {
  if (!adminElements.prodCategory) return;
  const categories = Store.getCategories();
  adminElements.prodCategory.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function openAddProductModal() {
  adminElements.productModalTitle.textContent = "????? ??? ???? ????? ??????";
  adminElements.prodId.value = '';
  adminElements.prodName.value = '';
  populateCategorySelect();
  adminElements.prodPrice.value = '';
  adminElements.prodPrepTime.value = '15 ?????';
  adminElements.prodBadge.value = '';
  adminElements.prodFeatured.checked = false;
  adminElements.prodDesc.value = '';
  adminElements.prodImgUrl.value = '';
  adminElements.prodImgStatus.style.display = 'none';

  adminElements.productModal.classList.add('open');
  adminElements.productModalBackdrop.classList.add('open');
}

window.openEditProductModal = function(id) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === id);
  if (!p) return;

  adminElements.productModalTitle.textContent = "????? ?????? ?????";
  adminElements.prodId.value = p.id;
  adminElements.prodName.value = p.name;
  populateCategorySelect();
  adminElements.prodCategory.value = p.category;
  adminElements.prodPrice.value = p.price;
  adminElements.prodPrepTime.value = p.prepTime || '15 ?????';
  adminElements.prodBadge.value = p.badge || '';
  adminElements.prodFeatured.checked = p.isFeatured === true;
  adminElements.prodDesc.value = p.desc || '';
  adminElements.prodImgUrl.value = p.image || '';
  adminElements.prodImgStatus.style.display = 'none';

  adminElements.productModal.classList.add('open');
  adminElements.productModalBackdrop.classList.add('open');
};

function closeProductModal() {
  adminElements.productModal.classList.remove('open');
  adminElements.productModalBackdrop.classList.remove('open');
}

window.handleDeleteProduct = function(id) {
  if (confirm("?? ??? ????? ?? ??? ??? ????? ????????")) {
    Store.deleteProduct(id);
    renderVisualCatalog();
    showAdminToast("?? ??? ????? ?? ???????", "info");
  }
};

// -- Categories Management ----------------------------------
function renderCategoriesList() {
  if (!adminElements.categoriesListContainer) return;
  const cats = Store.getCategories();

  adminElements.categoriesListContainer.innerHTML = cats.map(c => `
    <div style="background:var(--surface-raised); border:1px solid var(--border); padding:8px 14px; border-radius:var(--radius-full); display:flex; align-items:center; gap:8px; font-weight:800; font-size:13px;">
      <span>${c}</span>
      <button onclick="handleDeleteCategory('${c}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:13px;" title="??? ?????">?</button>
    </div>
  `).join('');
}

function handleAddCategory() {
  const newCat = (adminElements.newCatInput.value || '').trim();
  if (!newCat) {
    showAdminToast("???? ??? ????? ?????", "error");
    return;
  }
  const cats = Store.getCategories();
  if (cats.includes(newCat)) {
    showAdminToast("????? ????? ??????", "error");
    return;
  }
  cats.push(newCat);
  Store.saveCategories(cats);
  adminElements.newCatInput.value = '';
  renderCategoriesList();
  populateCategorySelect();
  showAdminToast(`??? ????? ??? "${newCat}" ?????`);
}

window.handleDeleteCategory = function(catName) {
  let cats = Store.getCategories();
  if (cats.length <= 1) {
    showAdminToast("??? ??????? ??? ??? ???? ??? ?????", "error");
    return;
  }
  if (confirm(`??? ??? "${catName}"?`)) {
    cats = cats.filter(c => c !== catName);
    Store.saveCategories(cats);
    renderCategoriesList();
    populateCategorySelect();
    showAdminToast(`?? ??? ??? "${catName}"`, "info");
  }
};

// -- Settings Management ------------------------------------
function loadSettingsForm() {
  const s = Store.getSettings();
  adminElements.setStoreName.value = s.storeName || '';
  adminElements.setCurrency.value = s.currency || '?.?';
  adminElements.setStoreTagline.value = s.storeTagline || '';
  adminElements.setWhatsApp.value = s.whatsappNumber || '';
  adminElements.setWalletNumber.value = s.walletNumber || '';
  adminElements.setWalletName.value = s.walletName || '';
  adminElements.setAdminPin.value = s.adminPin || '1234';
  adminElements.setLogoUrl.value = s.logo || '';
  if (adminElements.setImgbbKey) adminElements.setImgbbKey.value = s.imgbbApiKey || '';
}

function handleSaveSettings(e) {
  e.preventDefault();
  const current = Store.getSettings();
  const updated = {
    ...current,
    storeName: adminElements.setStoreName.value.trim(),
    currency: adminElements.setCurrency.value.trim() || '?.?',
    storeTagline: adminElements.setStoreTagline.value.trim(),
    whatsappNumber: adminElements.setWhatsApp.value.trim(),
    walletNumber: adminElements.setWalletNumber.value.trim(),
    walletName: adminElements.setWalletName.value.trim(),
    adminPin: adminElements.setAdminPin.value.trim() || '1234',
    logo: adminElements.setLogoUrl.value.trim(),
    imgbbApiKey: adminElements.setImgbbKey ? adminElements.setImgbbKey.value.trim() : current.imgbbApiKey
  };

  Store.saveSettings(updated);
  if (adminElements.adminStoreName) adminElements.adminStoreName.textContent = `????? ???? (${updated.storeName})`;
  showAdminToast("?? ??? ???? ????????? ????? ?");
}

function handleResetDemo() {
  if (confirm("?????: ???? ??????? ???? ??????? ???????? ?????????? ??????????. ?? ???? ?????????")) {
    Store.resetAll();
    initAdminDashboard();
    showAdminToast("??? ??????? ???????? ?????????? ?????");
  }
}

// -- Event Listeners Setup ----------------------------------
function setupAdminEventListeners() {
  // Login
  if (adminElements.btnLogin) adminElements.btnLogin.addEventListener('click', handleLogin);
  if (adminElements.pinInput) {
    adminElements.pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  // Modals
  if (adminElements.btnOpenAddProduct) adminElements.btnOpenAddProduct.addEventListener('click', openAddProductModal);
  if (adminElements.btnCloseProductModal) adminElements.btnCloseProductModal.addEventListener('click', closeProductModal);
  if (adminElements.btnCancelProduct) adminElements.btnCancelProduct.addEventListener('click', closeProductModal);
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.addEventListener('click', closeProductModal);

  // File Upload
  if (adminElements.prodImgFile) {
    adminElements.prodImgFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      adminElements.prodImgStatus.textContent = "???? ??? ??????...";
      adminElements.prodImgStatus.style.display = "block";

      try {
        const url = await Store.uploadImage(file);
        adminElements.prodImgUrl.value = url;
        adminElements.prodImgStatus.textContent = "? ?? ????? ???? ?????? ?????!";
      } catch (err) {
        adminElements.prodImgStatus.textContent = "?? ???? ????? ???????? ???? ??? ???? ??????";
      }
    });
  }

  // Product Form Submit
  if (adminElements.productForm) {
    adminElements.productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = adminElements.prodId.value;
      const productData = {
        name: adminElements.prodName.value.trim(),
        category: adminElements.prodCategory.value,
        price: parseFloat(adminElements.prodPrice.value) || 0,
        prepTime: (adminElements.prodPrepTime.value || '15 ?????').trim(),
        badge: (adminElements.prodBadge.value || '').trim(),
        isFeatured: adminElements.prodFeatured.checked,
        desc: adminElements.prodDesc.value.trim(),
        image: adminElements.prodImgUrl.value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'
      };

      if (id) {
        Store.updateProduct(id, productData);
        showAdminToast(`?? ????? "${productData.name}" ?????`);
      } else {
        Store.addProduct(productData);
        showAdminToast(`??? ????? "${productData.name}" ?????`);
      }

      closeProductModal();
      renderVisualCatalog();
    });
  }

  // Categories
  if (adminElements.btnAddCat) adminElements.btnAddCat.addEventListener('click', handleAddCategory);
  if (adminElements.newCatInput) {
    adminElements.newCatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAddCategory();
    });
  }

  // Settings
  if (adminElements.settingsForm) adminElements.settingsForm.addEventListener('submit', handleSaveSettings);
  if (adminElements.btnResetDemo) adminElements.btnResetDemo.addEventListener('click', handleResetDemo);
}

// Start
document.addEventListener('DOMContentLoaded', () => {
  setupAdminEventListeners();
  checkAdminAuth();
});
