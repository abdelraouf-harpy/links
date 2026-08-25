// ═══════════════════════════════════════════════════════════
// HarpyOrder — Storefront & Contextual Discovery Engine
// ═══════════════════════════════════════════════════════════

let activeCategory = "all";
let activeDiscovery = "all"; // "all", "featured", "fast", "favorites"
let searchQuery = "";
let selectedPaymentMethod = "cod"; // "cod" or "wallet"
let uploadedReceiptUrl = null;
let currentCheckoutStep = 1; // 1: Items, 2: Customer Info, 3: Payment

// DOM Elements Cache
const elements = {
  storeName: document.getElementById('store-name'),
  storeTagline: document.getElementById('store-tagline'),
  storeLogo: document.getElementById('store-logo'),
  storeWhatsAppLink: document.getElementById('store-whatsapp-link'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIconDark: document.getElementById('theme-icon-dark'),
  themeIconLight: document.getElementById('theme-icon-light'),

  // Announcement Bar
  announcementBar: document.getElementById('announcement-bar'),
  announcementText: document.getElementById('announcement-text'),
  deliveryTimeBadge: document.getElementById('delivery-time-badge'),
  
  // Last Order
  lastOrderBanner: document.getElementById('last-order-banner'),
  lastOrderSummary: document.getElementById('last-order-summary'),
  btnReorder: document.getElementById('btn-reorder'),

  // Discovery & Categories
  discoveryScroll: document.getElementById('discovery-scroll'),
  categoryStrip: document.getElementById('category-strip'),
  searchInput: document.getElementById('search-input'),

  // Feed & Products
  heroSection: document.getElementById('hero-section'),
  productsContainer: document.getElementById('products-container'),
  emptyState: document.getElementById('empty-state'),
  
  // Floating Ledger Bar
  floatingLedger: document.getElementById('floating-ledger'),
  ledgerCounterBadge: document.getElementById('ledger-counter-badge'),
  ledgerTotalPrice: document.getElementById('ledger-total-price'),
  
  // Drawer & Checkout Steps
  modalBackdrop: document.getElementById('modal-backdrop'),
  cartDrawer: document.getElementById('cart-drawer'),
  drawerItemsList: document.getElementById('drawer-items-list'),
  drawerEmptyState: document.getElementById('drawer-empty-state'),
  drawerSubtotal: document.getElementById('drawer-subtotal'),
  
  // Step Sections in Drawer
  drawerStep1: document.getElementById('drawer-step-1'),
  drawerStep2: document.getElementById('drawer-step-2'),
  drawerStep3: document.getElementById('drawer-step-3'),
  stepNavBtns: document.querySelectorAll('.step-nav-btn'),
  btnGoToStep2: document.getElementById('btn-goto-step-2'),
  btnBackToStep1: document.getElementById('btn-back-step-1'),
  btnGoToStep3: document.getElementById('btn-goto-step-3'),
  btnBackToStep2: document.getElementById('btn-back-step-2'),

  // Customer Form
  custName: document.getElementById('cust-name'),
  custPhone: document.getElementById('cust-phone'),
  custAddress: document.getElementById('cust-address'),
  custNotes: document.getElementById('cust-notes'),
  
  // Payment Options
  payCodOption: document.getElementById('pay-cod-option'),
  payWalletOption: document.getElementById('pay-wallet-option'),
  walletPanel: document.getElementById('wallet-panel'),
  walletNumDisplay: document.getElementById('wallet-num-display'),
  walletNameDisplay: document.getElementById('wallet-name-display'),
  btnCopyNum: document.getElementById('btn-copy-num'),
  receiptInput: document.getElementById('receipt-input'),
  receiptPreview: document.getElementById('receipt-preview'),
  receiptStatus: document.getElementById('receipt-status'),
  
  btnSendWhatsApp: document.getElementById('btn-send-whatsapp'),
  
  // Quick Preview Modal
  previewModal: document.getElementById('preview-modal'),
  previewImg: document.getElementById('preview-img'),
  previewTitle: document.getElementById('preview-title'),
  previewBadge: document.getElementById('preview-badge'),
  previewPrepTime: document.getElementById('preview-prep-time'),
  previewDesc: document.getElementById('preview-desc'),
  previewPrice: document.getElementById('preview-price'),
  previewActionArea: document.getElementById('preview-action-area'),
  previewFavBtn: document.getElementById('preview-fav-btn'),
  btnClosePreview: document.getElementById('btn-close-preview'),

  toastContainer: document.getElementById('toast-container')
};

// ── Toast Notification ─────────────────────────────────────
function showToast(message, type = "success") {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ── App Initialization ─────────────────────────────────────
function initApp() {
  Store.initTheme();
  updateThemeToggleIcons();
  renderStoreInfo();
  renderAnnouncement();
  renderLastOrderRecall();
  renderDiscoveryRibbon();
  renderCategories();
  renderProducts();
  updateLedgerUI();
  setupEventListeners();
}

// ── Day / Night Theme Mode Controls ────────────────────────
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
  showToast(newMode === 'light' ? 'تم تفعيل الوضع النهاري' : 'تم تفعيل الوضع الليلي', 'info');
}

// ── Announcement Bar ───────────────────────────────────────
function renderAnnouncement() {
  if (!elements.announcementBar) return;
  const s = Store.getSettings();
  if (s.showAnnouncement && s.announcementText) {
    elements.announcementBar.style.display = 'flex';
    if (elements.announcementText) elements.announcementText.textContent = s.announcementText;
    if (elements.deliveryTimeBadge) {
      elements.deliveryTimeBadge.textContent = `⏱️ ${s.deliveryTime || '30-45 دقيقة'}`;
    }
  } else {
    elements.announcementBar.style.display = 'none';
  }
}

// ── Render Store Branding ──────────────────────────────────
function renderStoreInfo() {
  const s = Store.getSettings();
  if (elements.storeName) elements.storeName.textContent = s.storeName;
  if (elements.storeTagline) elements.storeTagline.textContent = s.storeTagline;
  if (elements.storeLogo) elements.storeLogo.src = s.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120';
  
  if (elements.storeWhatsAppLink) {
    const cleanPhone = (s.whatsappNumber || '').replace(/\D/g, '');
    elements.storeWhatsAppLink.href = `https://wa.me/${cleanPhone}`;
  }
  
  if (elements.walletNumDisplay) elements.walletNumDisplay.textContent = s.walletNumber || '01000000000';
  if (elements.walletNameDisplay) elements.walletNameDisplay.textContent = s.walletName || 'محفظة كاش';
}

// ── Last Order Quick Recall ────────────────────────────────
function renderLastOrderRecall() {
  if (!elements.lastOrderBanner) return;
  const lastOrder = Store.getLastOrder();
  if (lastOrder && lastOrder.items && lastOrder.items.length > 0) {
    const s = Store.getSettings();
    const currency = s.currency || "ج.م";
    const total = lastOrder.items.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const count = lastOrder.items.reduce((acc, i) => acc + i.qty, 0);

    if (elements.lastOrderSummary) {
      elements.lastOrderSummary.textContent = `طلبك السابق: ${count} أصناف بقيمة ${total} ${currency}`;
    }
    elements.lastOrderBanner.style.display = 'flex';
  } else {
    elements.lastOrderBanner.style.display = 'none';
  }
}

function handleReorderPrevious() {
  const lastOrder = Store.getLastOrder();
  if (!lastOrder || !lastOrder.items) return;

  Store.saveCart(lastOrder.items);
  if (lastOrder.customer) {
    if (elements.custName) elements.custName.value = lastOrder.customer.name || '';
    if (elements.custPhone) elements.custPhone.value = lastOrder.customer.phone || '';
    if (elements.custAddress) elements.custAddress.value = lastOrder.customer.address || '';
  }
  updateLedgerUI();
  renderProducts();
  openCartDrawer();
  goToCheckoutStep(1);
  showToast("تمت استعادة طلبك السابق بنجاح");
}

// ── Contextual Discovery Ribbon ────────────────────────────
function renderDiscoveryRibbon() {
  if (!elements.discoveryScroll) return;
  const favs = Store.getFavorites();

  const discoveryItems = [
    { id: "all", label: "جميع الأصناف", icon: '<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>', count: null },
    { id: "featured", label: "الأكثر طلباً", icon: '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>', count: null },
    { id: "fast", label: "تحضير سريع", icon: '<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', count: null },
    { id: "favorites", label: "المفضلة", icon: '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>', count: favs.length > 0 ? favs.length : null }
  ];

  elements.discoveryScroll.innerHTML = discoveryItems.map(item => `
    <button class="discovery-chip ${activeDiscovery === item.id ? 'active' : ''}" data-discovery="${item.id}">
      ${item.icon || ''} <span>${item.label}</span>
      ${item.count ? `<span class="chip-count font-num">${item.count}</span>` : ''}
    </button>
  `).join('');

  elements.discoveryScroll.querySelectorAll('.discovery-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDiscovery = btn.dataset.discovery;
      renderDiscoveryRibbon();
      renderProducts();
    });
  });
}

// ── Render Category Pills ──────────────────────────────────
function renderCategories() {
  if (!elements.categoryStrip) return;
  const categories = Store.getCategories();
  
  let html = `<button class="cat-pill ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">جميع الأقسام</button>`;
  categories.forEach(cat => {
    html += `<button class="cat-pill ${activeCategory === cat ? 'active' : ''}" data-cat="${cat}">${cat}</button>`;
  });
  
  elements.categoryStrip.innerHTML = html;
  
  elements.categoryStrip.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      elements.categoryStrip.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
    });
  });
}

// ── Filter Products Helper ─────────────────────────────────
function getFilteredProducts() {
  const products = Store.getProducts().filter(p => p.visible !== false);
  const favs = Store.getFavorites();

  return products.filter(p => {
    // 1. Search filter
    const matchSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Category filter
    const matchCat = activeCategory === "all" || p.category === activeCategory;

    // 3. Discovery mode filter
    let matchDiscovery = true;
    if (activeDiscovery === "featured") {
      matchDiscovery = p.isFeatured === true || (p.badge && p.badge.includes('طلب'));
    } else if (activeDiscovery === "fast") {
      const mins = parseInt(p.prepTime) || 15;
      matchDiscovery = mins <= 10;
    } else if (activeDiscovery === "favorites") {
      matchDiscovery = favs.includes(p.id);
    }

    return matchSearch && matchCat && matchDiscovery;
  });
}

// ── Render Products & Hero Showcase ────────────────────────
function renderProducts() {
  if (!elements.productsContainer) return;
  const filtered = getFilteredProducts();
  const cart = Store.getCart();
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";

  if (filtered.length === 0) {
    elements.productsContainer.innerHTML = '';
    if (elements.heroSection) elements.heroSection.style.display = 'none';
    if (elements.emptyState) {
      elements.emptyState.style.display = 'block';
      if (activeDiscovery === 'favorites') {
        elements.emptyState.querySelector('.empty-title').textContent = 'قائمة المفضلة فارغة';
        elements.emptyState.querySelector('p').textContent = 'اضغط على رمز ❤️ بجانب أي وجبة لإضافتها لمفضلاتك';
      } else {
        elements.emptyState.querySelector('.empty-title').textContent = 'لا توجد أصناف مطابقة';
        elements.emptyState.querySelector('p').textContent = 'جرّب البحث باسم وجبة أخرى أو اختر قسماً مختلفاً';
      }
    }
    return;
  }

  if (elements.emptyState) elements.emptyState.style.display = 'none';

  // Hero Section (Featured Highlight)
  // Show when browsing all categories with no search query
  let showcaseItem = null;
  let remainingProducts = filtered;

  if (activeCategory === "all" && !searchQuery && activeDiscovery === "all") {
    showcaseItem = filtered.find(p => p.isFeatured) || filtered[0];
    remainingProducts = filtered.filter(p => p.id !== showcaseItem.id);
  }

  if (showcaseItem && elements.heroSection) {
    const heroCartItem = cart.find(i => i.id === showcaseItem.id);
    const heroQty = heroCartItem ? heroCartItem.qty : 0;
    const isHeroFav = Store.isFavorite(showcaseItem.id);

    elements.heroSection.style.display = 'block';
    elements.heroSection.innerHTML = `
      <div class="hero-product-card">
        <div class="hero-product-img-wrap" onclick="openProductPreview('${showcaseItem.id}')">
          <img src="${showcaseItem.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'}" alt="${showcaseItem.name}" class="hero-product-img" loading="lazy">
          <span class="hero-badge-tag">${showcaseItem.badge || 'اختيار الشيف'}</span>
        </div>
        <div class="hero-product-content">
          <div>
            <div class="hero-meta-row">
              <span class="meta-chip">🏷️ ${showcaseItem.category}</span>
              <span class="meta-chip">⏱️ ${showcaseItem.prepTime || '15 دقيقة'}</span>
            </div>
            <h2 class="hero-product-title" onclick="openProductPreview('${showcaseItem.id}')" style="cursor:pointer;">${showcaseItem.name}</h2>
            <p class="hero-product-desc">${showcaseItem.desc || ''}</p>
          </div>
          <div class="hero-product-footer">
            <div class="hero-price font-num">${showcaseItem.price} <span>${currency}</span></div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-fav-toggle ${isHeroFav ? 'active' : ''}" onclick="handleToggleFavorite(event, '${showcaseItem.id}')" title="إضافة للمفضلة">
                <svg class="icon icon-sm" viewBox="0 0 24 24" ${isHeroFav ? 'fill="currentColor"' : ''}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </button>
              ${renderCartButtonHtml(showcaseItem.id, heroQty)}
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (elements.heroSection) {
    elements.heroSection.style.display = 'none';
  }

  // Render Catalog Grid
  elements.productsContainer.innerHTML = remainingProducts.map(p => {
    const cartItem = cart.find(item => item.id === p.id);
    const inCartQty = cartItem ? cartItem.qty : 0;
    const isFav = Store.isFavorite(p.id);

    return `
      <div class="food-item-card" data-product-id="${p.id}">
        <div class="food-item-media" onclick="openProductPreview('${p.id}')">
          <img src="${p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}" alt="${p.name}" class="food-item-img" loading="lazy">
          <div class="card-top-actions">
            <span class="card-badge">${p.badge || p.category}</span>
            <button class="btn-fav-toggle ${isFav ? 'active' : ''}" onclick="handleToggleFavorite(event, '${p.id}')" title="المفضلة">
              <svg class="icon icon-sm" viewBox="0 0 24 24" ${isFav ? 'fill="currentColor"' : ''}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
          </div>
        </div>
        <div class="food-item-body">
          <div class="item-meta-tags">
            <span class="item-prep-time">⏱️ ${p.prepTime || '10-15 دقيقة'}</span>
          </div>
          <h3 class="food-item-title" onclick="openProductPreview('${p.id}')">${p.name}</h3>
          <p class="food-item-desc">${p.desc || ''}</p>
          <div class="food-item-footer">
            <div class="food-item-price font-num">${p.price} <span>${currency}</span></div>
            <div>${renderCartButtonHtml(p.id, inCartQty)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Cart Button Helper ─────────────────────────────────────
function renderCartButtonHtml(productId, qty) {
  if (qty > 0) {
    return `
      <div class="qty-stepper">
        <button class="qty-stepper-btn ${qty === 1 ? 'danger' : ''}" onclick="handleDecreaseQty('${productId}')">${qty === 1 ? '🗑️' : '-'}</button>
        <span class="qty-stepper-val font-num">${qty}</span>
        <button class="qty-stepper-btn" onclick="handleIncreaseQty('${productId}')">+</button>
      </div>
    `;
  }
  return `
    <button class="btn-quick-add" onclick="handleAddToCart('${productId}')">
      <svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      أضف للطلب
    </button>
  `;
}

// ── Quick Preview Modal ────────────────────────────────────
window.openProductPreview = function(productId) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  const cart = Store.getCart();
  const cartItem = cart.find(item => item.id === p.id);
  const qty = cartItem ? cartItem.qty : 0;
  const isFav = Store.isFavorite(p.id);
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";

  if (elements.previewImg) elements.previewImg.src = p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
  if (elements.previewTitle) elements.previewTitle.textContent = p.name;
  if (elements.previewBadge) elements.previewBadge.textContent = p.badge || p.category;
  if (elements.previewPrepTime) elements.previewPrepTime.textContent = `⏱️ وقت التحضير المقدر: ${p.prepTime || '10-15 دقيقة'}`;
  if (elements.previewDesc) elements.previewDesc.textContent = p.desc || 'لا يوجد وصف مضاف لهذا الصنف.';
  if (elements.previewPrice) elements.previewPrice.innerHTML = `${p.price} <span>${currency}</span>`;
  
  if (elements.previewFavBtn) {
    elements.previewFavBtn.className = `btn-fav-toggle ${isFav ? 'active' : ''}`;
    elements.previewFavBtn.onclick = (e) => handleToggleFavorite(e, p.id);
  }

  if (elements.previewActionArea) {
    elements.previewActionArea.innerHTML = renderCartButtonHtml(p.id, qty);
  }

  if (elements.modalBackdrop) elements.modalBackdrop.classList.add('open');
  if (elements.previewModal) elements.previewModal.classList.add('open');
};

function closeProductPreview() {
  if (elements.previewModal) elements.previewModal.classList.remove('open');
  if (!elements.cartDrawer || !elements.cartDrawer.classList.contains('open')) {
    if (elements.modalBackdrop) elements.modalBackdrop.classList.remove('open');
  }
}

// ── Favorites Toggle ───────────────────────────────────────
window.handleToggleFavorite = function(e, productId) {
  e.stopPropagation();
  const isNowFav = Store.toggleFavorite(productId);
  renderDiscoveryRibbon();
  renderProducts();
  
  // Also update preview modal if open
  if (elements.previewFavBtn) {
    elements.previewFavBtn.className = `btn-fav-toggle ${isNowFav ? 'active' : ''}`;
  }

  showToast(isNowFav ? "تمت إضافة الصنف لمفضلاتك" : "تمت إزالة الصنف من المفضلة", "info");
};

// ── Cart State Modifiers ───────────────────────────────────
window.handleAddToCart = function(productId) {
  const products = Store.getProducts();
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  const cart = Store.getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  Store.saveCart(cart);
  updateLedgerUI();
  renderProducts();
  
  // Update preview modal button if open
  if (elements.previewActionArea && elements.previewModal.classList.contains('open')) {
    elements.previewActionArea.innerHTML = renderCartButtonHtml(prod.id, existing ? existing.qty : 1);
  }

  // Micro-animation pulse on badge
  if (elements.ledgerCounterBadge) {
    elements.ledgerCounterBadge.classList.add('pulse');
    setTimeout(() => elements.ledgerCounterBadge.classList.remove('pulse'), 250);
  }

  showToast(`تمت إضافة "${prod.name}" للطلب`);
};

window.handleIncreaseQty = function(productId) {
  const cart = Store.getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty += 1;
    Store.saveCart(cart);
    updateLedgerUI();
    renderProducts();
    if (elements.previewActionArea && elements.previewModal.classList.contains('open')) {
      elements.previewActionArea.innerHTML = renderCartButtonHtml(productId, item.qty);
    }
  }
};

window.handleDecreaseQty = function(productId) {
  let cart = Store.getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty -= 1;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }
    Store.saveCart(cart);
    updateLedgerUI();
    renderProducts();
    if (elements.previewActionArea && elements.previewModal.classList.contains('open')) {
      const remaining = cart.find(i => i.id === productId);
      elements.previewActionArea.innerHTML = renderCartButtonHtml(productId, remaining ? remaining.qty : 0);
    }
  }
};

// ── Update Floating Ledger Bar & Drawer Items ──────────────
function updateLedgerUI() {
  const cart = Store.getCart();
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Floating Ledger Bar
  if (elements.floatingLedger) {
    if (totalCount > 0) {
      elements.floatingLedger.classList.add('visible');
      if (elements.ledgerCounterBadge) elements.ledgerCounterBadge.textContent = totalCount;
      if (elements.ledgerTotalPrice) elements.ledgerTotalPrice.textContent = `${totalPrice} ${currency}`;
    } else {
      elements.floatingLedger.classList.remove('visible');
    }
  }

  // Drawer Cart Items
  if (elements.drawerItemsList) {
    if (cart.length === 0) {
      elements.drawerItemsList.innerHTML = '';
      if (elements.drawerEmptyState) elements.drawerEmptyState.style.display = 'block';
      if (elements.btnGoToStep2) elements.btnGoToStep2.disabled = true;
      if (elements.btnSendWhatsApp) elements.btnSendWhatsApp.disabled = true;
    } else {
      if (elements.drawerEmptyState) elements.drawerEmptyState.style.display = 'none';
      if (elements.btnGoToStep2) elements.btnGoToStep2.disabled = false;
      if (elements.btnSendWhatsApp) elements.btnSendWhatsApp.disabled = false;

      elements.drawerItemsList.innerHTML = cart.map(item => `
        <div class="cart-ledger-item">
          <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}" class="cart-ledger-img" alt="${item.name}">
          <div class="cart-ledger-details">
            <div class="cart-ledger-name">${item.name}</div>
            <div class="cart-ledger-price font-num">${item.price * item.qty} <span>${currency}</span> (${item.price} × ${item.qty})</div>
          </div>
          <div class="qty-stepper">
            <button class="qty-stepper-btn ${item.qty === 1 ? 'danger' : ''}" onclick="handleDecreaseQty('${item.id}')">${item.qty === 1 ? '🗑️' : '-'}</button>
            <span class="qty-stepper-val font-num">${item.qty}</span>
            <button class="qty-stepper-btn" onclick="handleIncreaseQty('${item.id}')">+</button>
          </div>
        </div>
      `).join('');
    }
  }

  if (elements.drawerSubtotal) {
    elements.drawerSubtotal.innerHTML = `${totalPrice} <span>${currency}</span>`;
  }
}

// ── Multi-Step Checkout Navigation ────────────────────────
function goToCheckoutStep(step) {
  currentCheckoutStep = step;

  // Toggle step panes
  if (elements.drawerStep1) elements.drawerStep1.style.display = step === 1 ? 'block' : 'none';
  if (elements.drawerStep2) elements.drawerStep2.style.display = step === 2 ? 'block' : 'none';
  if (elements.drawerStep3) elements.drawerStep3.style.display = step === 3 ? 'block' : 'none';

  // Toggle step navigation highlights
  elements.stepNavBtns.forEach(btn => {
    const s = parseInt(btn.dataset.step);
    btn.classList.remove('active', 'completed');
    if (s === step) {
      btn.classList.add('active');
    } else if (s < step) {
      btn.classList.add('completed');
    }
  });
}

function openCartDrawer() {
  closeProductPreview();
  if (elements.modalBackdrop) elements.modalBackdrop.classList.add('open');
  if (elements.cartDrawer) elements.cartDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  if (elements.modalBackdrop) elements.modalBackdrop.classList.remove('open');
  if (elements.cartDrawer) elements.cartDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Payment Method Switcher ────────────────────────────────
function setPaymentOption(method) {
  selectedPaymentMethod = method;
  if (method === 'wallet') {
    elements.payWalletOption.classList.add('active');
    elements.payCodOption.classList.remove('active');
    elements.walletPanel.style.display = 'block';
  } else {
    elements.payCodOption.classList.add('active');
    elements.payWalletOption.classList.remove('active');
    elements.walletPanel.style.display = 'none';
  }
}

// ── Event Listeners ────────────────────────────────────────
function setupEventListeners() {
  // Theme Toggle (Day / Night)
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', handleThemeToggle);
  }

  // Live Search
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  // Reorder Last Order
  if (elements.btnReorder) {
    elements.btnReorder.addEventListener('click', handleReorderPrevious);
  }

  // Drawer toggles
  if (elements.floatingLedger) elements.floatingLedger.addEventListener('click', openCartDrawer);
  if (elements.modalBackdrop) elements.modalBackdrop.addEventListener('click', () => {
    closeCartDrawer();
    closeProductPreview();
  });
  document.querySelectorAll('.btn-close-drawer').forEach(b => b.addEventListener('click', closeCartDrawer));
  if (elements.btnClosePreview) elements.btnClosePreview.addEventListener('click', closeProductPreview);

  // Step Navigations
  if (elements.btnGoToStep2) {
    elements.btnGoToStep2.addEventListener('click', () => {
      const cart = Store.getCart();
      if (cart.length === 0) {
        showToast("أضف بعض الأصناف للسلة أولاً", "error");
        return;
      }
      goToCheckoutStep(2);
    });
  }
  if (elements.btnBackToStep1) elements.btnBackToStep1.addEventListener('click', () => goToCheckoutStep(1));
  if (elements.btnGoToStep3) {
    elements.btnGoToStep3.addEventListener('click', () => {
      const name = (elements.custName.value || '').trim();
      const phone = (elements.custPhone.value || '').trim();
      const address = (elements.custAddress.value || '').trim();

      if (!name) {
        showToast("يرجى كتابة اسم العميل", "error");
        elements.custName.focus();
        return;
      }
      if (!phone) {
        showToast("يرجى كتابة رقم الهاتف للتواصل", "error");
        elements.custPhone.focus();
        return;
      }
      if (!address) {
        showToast("يرجى كتابة العنوان بالتفصيل", "error");
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

  // Payment Options
  if (elements.payCodOption) elements.payCodOption.addEventListener('click', () => setPaymentOption('cod'));
  if (elements.payWalletOption) elements.payWalletOption.addEventListener('click', () => setPaymentOption('wallet'));

  // Copy wallet number
  if (elements.btnCopyNum) {
    elements.btnCopyNum.addEventListener('click', () => {
      const num = elements.walletNumDisplay.textContent;
      navigator.clipboard.writeText(num);
      showToast("تم نسخ رقم المحفظة 📋");
    });
  }

  // Screenshot upload
  if (elements.receiptInput) {
    elements.receiptInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        elements.receiptPreview.src = ev.target.result;
        elements.receiptPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);

      elements.receiptStatus.textContent = "جاري رفع الإيصال وتجهيزه...";
      elements.receiptStatus.className = "upload-status loading";
      elements.receiptStatus.style.display = "block";
      elements.btnSendWhatsApp.disabled = true;

      try {
        uploadedReceiptUrl = await Store.uploadImage(file);
        elements.receiptStatus.textContent = "✅ تم تجهيز الإيصال بنجاح!";
        elements.receiptStatus.className = "upload-status success";
      } catch (err) {
        elements.receiptStatus.textContent = "⚠️ تعذر الرفع، سيتم إرسال الطلب بدون رابط";
        elements.receiptStatus.className = "upload-status error";
      } finally {
        elements.btnSendWhatsApp.disabled = false;
      }
    });
  }

  // Submit via WhatsApp
  if (elements.btnSendWhatsApp) {
    elements.btnSendWhatsApp.addEventListener('click', handleWhatsAppOrder);
  }

  // Store update listeners
  window.addEventListener('store_settings_updated', () => {
    Store.initTheme();
    renderStoreInfo();
    renderAnnouncement();
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
}

// ── WhatsApp Order Sender ──────────────────────────────────
function handleWhatsAppOrder() {
  const cart = Store.getCart();
  if (cart.length === 0) {
    showToast("السلة فارغة، أضف بعض المنتجات أولاً", "error");
    return;
  }

  const name = (elements.custName.value || '').trim();
  const phone = (elements.custPhone.value || '').trim();
  const address = (elements.custAddress.value || '').trim();
  const notes = (elements.custNotes.value || '').trim();

  if (!name || !phone || !address) {
    showToast("يرجى استكمال بيانات التوصيل", "error");
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
  const isWallet = selectedPaymentMethod === 'wallet';
  const hasDiscount = isWallet && settings.enableWalletDiscount !== false && (settings.walletDiscountPercent > 0);
  const discountPercent = hasDiscount ? (settings.walletDiscountPercent || 10) : 0;
  const discountAmount = hasDiscount ? Math.round((subtotal * (discountPercent / 100)) * 100) / 100 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Save Last Order for quick recall
  Store.saveLastOrder({
    items: cart,
    customer: { name, phone, address },
    timestamp: Date.now()
  });

  // Format Items List
  const itemsText = cart.map(item => `• ${item.qty}x ${item.name} (${(item.price * item.qty).toFixed(2)} ${currency})`).join('\n');

  const paymentText = isWallet 
    ? `تحويل محفظة إلكترونية (${settings.walletName || 'كاش'})`
    : `دفع نقدي عند الاستلام (COD)`;

  let message = `*طلب جديد من موقع ${settings.storeName}* 🛍️\n`;
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `👤 *العميل:* ${name}\n`;
  message += `📞 *الهاتف:* ${phone}\n`;
  message += `📍 *العنوان:* ${address}\n`;
  if (notes) {
    message += `📝 *ملاحظات:* ${notes}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `🛒 *تفاصيل الأصناف:*\n${itemsText}\n`;
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  
  if (hasDiscount) {
    message += `💵 *إجمالي الأصناف:* ${subtotal.toFixed(2)} ${currency}\n`;
    message += `🎁 *خصم الدفع الإلكتروني (${discountPercent}%):* -${discountAmount.toFixed(2)} ${currency}\n`;
    message += `💰 *المبلغ النهائي المطلوب دفعه:* ${finalTotal.toFixed(2)} ${currency}\n`;
  } else {
    message += `💰 *المبلغ المطلوب دفعه:* ${finalTotal.toFixed(2)} ${currency}\n`;
  }

  message += `💳 *طريقة الدفع:* ${paymentText}\n`;

  if (isWallet && uploadedReceiptUrl) {
    message += `📸 *رابط سكرين التحويل:* ${uploadedReceiptUrl}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `⏰ تم إرسال الطلب عبر المنصة بنجاح.`;

  const cleanWhatsApp = (settings.whatsappNumber || '').replace(/\D/g, '');
  const encodedUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`;

  // Open WhatsApp
  window.open(encodedUrl, '_blank');

  // Clear cart and close drawer
  Store.clearCart();
  closeCartDrawer();
  goToCheckoutStep(1);
  updateLedgerUI();
  renderProducts();
  renderLastOrderRecall();

  // Reset form inputs
  elements.custName.value = '';
  elements.custPhone.value = '';
  elements.custAddress.value = '';
  elements.custNotes.value = '';
  elements.receiptPreview.style.display = 'none';
  elements.receiptStatus.style.display = 'none';
  uploadedReceiptUrl = null;

  showToast("جاري تحويل طلبك إلى الواتساب");
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
