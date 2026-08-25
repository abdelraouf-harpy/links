// ═══════════════════════════════════════════════════════════
// HarpyOrder — Client Front-End & Smart Order Engine
// ═══════════════════════════════════════════════════════════

let activeCategoryFilter = 'all';
let activeDiscoveryFilter = 'all';
let searchDebounceTimer = null;
let currentPreviewProductId = null;
let currentCheckoutStep = 1;
let selectedPaymentMethod = 'cod';
let uploadedReceiptUrl = null;

const elements = {
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIconDark: document.getElementById('theme-icon-dark'),
  themeIconLight: document.getElementById('theme-icon-light'),

  storeName: document.getElementById('store-name'),
  storeTagline: document.getElementById('store-tagline'),
  storeLogo: document.getElementById('store-logo'),
  storeWhatsAppLink: document.getElementById('store-whatsapp-link'),

  announcementBar: document.getElementById('announcement-bar'),
  announcementText: document.getElementById('announcement-text'),
  deliveryTimeBadge: document.getElementById('delivery-time-badge'),

  lastOrderBanner: document.getElementById('last-order-banner'),
  lastOrderSummary: document.getElementById('last-order-summary'),
  btnReorder: document.getElementById('btn-reorder'),

  discoveryContainer: document.getElementById('discovery-container'),
  searchInput: document.getElementById('search-input'),
  categoriesContainer: document.getElementById('categories-container'),
  heroShowcaseContainer: document.getElementById('hero-showcase-container'),
  productsContainer: document.getElementById('products-container'),

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

  floatingLedger: document.getElementById('floating-ledger'),
  ledgerCountBadge: document.getElementById('ledger-count-badge'),
  ledgerFloatingTotal: document.getElementById('ledger-floating-total'),

  cartDrawer: document.getElementById('cart-drawer'),
  cartDrawerBackdrop: document.getElementById('cart-drawer-backdrop'),
  btnCloseCartDrawer: document.getElementById('btn-close-cart-drawer'),
  stepNavBtns: document.querySelectorAll('.step-nav-btn'),
  checkoutSteps: document.querySelectorAll('.checkout-step'),

  spendTierCard: document.getElementById('spend-tier-card'),
  spendTierMsg: document.getElementById('spend-tier-msg'),
  spendTierPercent: document.getElementById('spend-tier-percent'),
  spendTierFill: document.getElementById('spend-tier-fill'),

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
  walletAmountReminder: document.getElementById('wallet-amount-reminder'),
  walletTransferAmount: document.getElementById('wallet-transfer-amount'),
  receiptInput: document.getElementById('receipt-input'),
  receiptPreview: document.getElementById('receipt-preview'),
  receiptStatus: document.getElementById('receipt-status'),
  btnBackToStep2: document.getElementById('btn-back-to-step2'),
  btnSendWhatsApp: document.getElementById('btn-send-whatsapp')
};

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

function renderAnnouncement() {
  if (!elements.announcementBar) return;
  const s = Store.getSettings();
  if (s.showAnnouncement && s.announcementText) {
    elements.announcementBar.style.display = 'flex';
    if (elements.announcementText) elements.announcementText.textContent = s.announcementText;
    if (elements.deliveryTimeBadge) {
      elements.deliveryTimeBadge.innerHTML = `<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${s.deliveryTime || '30-45 دقيقة'}`;
    }
  } else {
    elements.announcementBar.style.display = 'none';
  }
}

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

function renderLastOrderRecall() {
  if (!elements.lastOrderBanner) return;
  const lastOrder = Store.getLastOrder();
  if (!lastOrder || !lastOrder.items || lastOrder.items.length === 0) {
    elements.lastOrderBanner.style.display = 'none';
    return;
  }

  const s = Store.getSettings();
  const currency = s.currency || "ج.م";
  const itemsSummary = lastOrder.items.map(i => `${i.qty}x ${i.name}`).join('، ');
  const totalPrice = lastOrder.items.reduce((sum, i) => sum + (i.price * i.qty), 0);

  elements.lastOrderSummary.textContent = `${itemsSummary} (${totalPrice.toFixed(2)} ${currency})`;
  elements.lastOrderBanner.style.display = 'flex';
}

function handleReorderClick() {
  const lastOrder = Store.getLastOrder();
  if (lastOrder && lastOrder.items) {
    Store.saveCart(lastOrder.items);
    if (lastOrder.customer) {
      if (elements.custName) elements.custName.value = lastOrder.customer.name || '';
      if (elements.custPhone) elements.custPhone.value = lastOrder.customer.phone || '';
      if (elements.custAddress) elements.custAddress.value = lastOrder.customer.address || '';
    }
    updateLedgerUI();
    openCartDrawer();
  }
}

function renderDiscoveryRibbon() {
  if (!elements.discoveryContainer) return;
  const favs = Store.getFavorites();

  const discoveryItems = [
    { id: "all", label: "جميع الأصناف", icon: '<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>', count: null },
    { id: "featured", label: "الأكثر طلباً", icon: '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>', count: null },
    { id: "fast", label: "تحضير سريع", icon: '<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', count: null },
    { id: "favorites", label: "المفضلة", icon: '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>', count: favs.length > 0 ? favs.length : null }
  ];

  elements.discoveryContainer.innerHTML = discoveryItems.map(item => `
    <button class="discovery-chip ${activeDiscoveryFilter === item.id ? 'active' : ''}" onclick="handleDiscoveryFilterClick('${item.id}')">
      ${item.icon || ''}
      <span>${item.label}</span>
      ${item.count !== null ? `<span class="chip-count font-num">${item.count}</span>` : ''}
    </button>
  `).join('');
}

window.handleDiscoveryFilterClick = function(id) {
  activeDiscoveryFilter = id;
  renderDiscoveryRibbon();
  renderProducts();
};

function renderCategories() {
  if (!elements.categoriesContainer) return;
  const cats = Store.getCategories();
  
  const allHtml = `
    <button class="cat-pill ${activeCategoryFilter === 'all' ? 'active' : ''}" onclick="handleCategoryFilterClick('all')">
      الكل
    </button>
  `;

  const itemsHtml = cats.map(c => `
    <button class="cat-pill ${activeCategoryFilter === c ? 'active' : ''}" onclick="handleCategoryFilterClick('${c}')">
      ${c}
    </button>
  `).join('');

  elements.categoriesContainer.innerHTML = allHtml + itemsHtml;
}

window.handleCategoryFilterClick = function(cat) {
  activeCategoryFilter = cat;
  renderCategories();
  renderProducts();
};

function getFilteredProducts() {
  let prods = Store.getProducts().filter(p => p.visible !== false);
  const searchTerm = (elements.searchInput ? elements.searchInput.value : '').trim().toLowerCase();

  if (activeCategoryFilter !== 'all') {
    prods = prods.filter(p => p.category === activeCategoryFilter);
  }

  if (activeDiscoveryFilter === 'featured') {
    prods = prods.filter(p => p.isFeatured || (p.badge && p.badge.includes('طلب')));
  } else if (activeDiscoveryFilter === 'fast') {
    prods = prods.filter(p => {
      const minutes = parseInt(p.prepTime) || 15;
      return minutes <= 10;
    });
  } else if (activeDiscoveryFilter === 'favorites') {
    const favs = Store.getFavorites();
    prods = prods.filter(p => favs.includes(p.id));
  }

  if (searchTerm) {
    prods = prods.filter(p => {
      const nameMatch = (p.name || '').toLowerCase().includes(searchTerm);
      const descMatch = (p.desc || '').toLowerCase().includes(searchTerm);
      const catMatch = (p.category || '').toLowerCase().includes(searchTerm);
      return nameMatch || descMatch || catMatch;
    });
  }

  return prods;
}

function renderProducts() {
  if (!elements.productsContainer) return;
  const prods = getFilteredProducts();
  const s = Store.getSettings();
  const currency = s.currency || "ج.م";

  if (elements.heroShowcaseContainer) {
    if (activeDiscoveryFilter === 'all' && activeCategoryFilter === 'all' && !elements.searchInput.value.trim()) {
      const showcaseItem = Store.getProducts().find(p => p.visible !== false && p.isFeatured) || prods[0];
      if (showcaseItem) {
        elements.heroShowcaseContainer.style.display = 'block';
        elements.heroShowcaseContainer.innerHTML = renderHeroShowcase(showcaseItem, currency);
      } else {
        elements.heroShowcaseContainer.style.display = 'none';
      }
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
  const cartItem = cart.find(i => i.id === p.id);
  const qty = cartItem ? cartItem.qty : 0;

  return `
    <div class="hero-product-card">
      <div class="hero-product-img-wrap" onclick="openQuickPreview('${p.id}')">
        <img src="${p.image}" class="hero-product-img" alt="${p.name}" loading="lazy">
        <span class="hero-badge-tag">${p.badge || 'اختيار الشيف'}</span>
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
            ${renderCardActionButton(p, qty)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProductCard(p, currency) {
  const isFav = Store.isFavorite(p.id);
  const cart = Store.getCart();
  const cartItem = cart.find(i => i.id === p.id);
  const qty = cartItem ? cartItem.qty : 0;

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
          <span class="item-prep-time">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${p.prepTime || '15 دقيقة'}</span>
          </span>
          <span style="font-size:11px; color:var(--text-faint);">• ${p.category}</span>
        </div>

        <h3 class="food-item-title" onclick="openQuickPreview('${p.id}')">${p.name}</h3>
        <p class="food-item-desc">${p.desc}</p>

        <div class="food-item-footer">
          <div class="food-item-price font-num">
            ${p.originalPrice && p.originalPrice > p.price ? `<span class="price-crossed">${p.originalPrice} ${currency}</span>` : ''}
            ${p.price} <span>${currency}</span>
          </div>
          <div>
            ${renderCardActionButton(p, qty)}
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
      <button class="btn-quick-add" onclick="event.stopPropagation(); handleQuickAddItem('${product.id}')">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>إضافة</span>
      </button>
    `;
  }
}

window.handleToggleFav = function(productId) {
  Store.toggleFavorite(productId);
  renderDiscoveryRibbon();
  renderProducts();
};

window.handleQuickAddItem = function(productId) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  const cart = Store.getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
      qty: 1
    });
  }
  Store.saveCart(cart);
  updateLedgerUI();
  renderProducts();
};

window.handleUpdateItemQty = function(productId, change) {
  let cart = Store.getCart();
  const existing = cart.find(i => i.id === productId);
  if (!existing) return;

  existing.qty += change;
  if (existing.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  Store.saveCart(cart);
  updateLedgerUI();
  renderProducts();

  if (currentPreviewProductId === productId) {
    updatePreviewModalActions(productId);
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
};

function updatePreviewModalActions(productId) {
  if (!elements.previewActionWrap) return;
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  const cart = Store.getCart();
  const cartItem = cart.find(i => i.id === productId);
  const qty = cartItem ? cartItem.qty : 0;

  elements.previewActionWrap.innerHTML = renderCardActionButton(p, qty);
}

function closeQuickPreview() {
  currentPreviewProductId = null;
  if (elements.previewModal) elements.previewModal.classList.remove('open');
  if (elements.previewModalBackdrop) elements.previewModalBackdrop.classList.remove('open');
}

function updateLedgerUI() {
  const cart = Store.getCart();
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Spend Tier Discount
  let spendTierDiscountAmount = 0;
  if (settings.enableSpendTierDiscount && settings.spendTierMinAmount > 0 && subtotal > 0) {
    const minSpend = settings.spendTierMinAmount;
    const tierValue = settings.spendTierDiscountValue || 15;
    const isPercent = settings.spendTierDiscountType !== 'fixed';

    if (subtotal >= minSpend) {
      spendTierDiscountAmount = isPercent ? (subtotal * (tierValue / 100)) : tierValue;
      if (elements.spendTierCard) {
        elements.spendTierCard.style.display = 'block';
        if (elements.spendTierMsg) elements.spendTierMsg.textContent = `مبروك! حصلت على خصم ${tierValue}${isPercent ? '%' : ' ' + currency} على طلبك`;
        if (elements.spendTierPercent) elements.spendTierPercent.textContent = `${tierValue}${isPercent ? '%' : ' ج.م'} خصم`;
        if (elements.spendTierFill) elements.spendTierFill.style.width = '100%';
      }
    } else {
      const remaining = minSpend - subtotal;
      const progressPercent = Math.min(100, Math.round((subtotal / minSpend) * 100));
      if (elements.spendTierCard) {
        elements.spendTierCard.style.display = 'block';
        if (elements.spendTierMsg) elements.spendTierMsg.textContent = `أضف بـ ${remaining.toFixed(0)} ${currency} أخرى لتحصل على خصم ${tierValue}${isPercent ? '%' : ' ' + currency}`;
        if (elements.spendTierPercent) elements.spendTierPercent.textContent = `متبقي ${remaining.toFixed(0)} ${currency}`;
        if (elements.spendTierFill) elements.spendTierFill.style.width = `${progressPercent}%`;
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

  if (elements.floatingLedger) {
    if (totalItemsCount > 0) {
      elements.floatingLedger.classList.add('visible');
      if (elements.ledgerCountBadge) elements.ledgerCountBadge.textContent = totalItemsCount;
      if (elements.ledgerFloatingTotal) {
        elements.ledgerFloatingTotal.textContent = `${finalTotal.toFixed(2)} ${currency}`;
      }
    } else {
      elements.floatingLedger.classList.remove('visible');
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

  if (elements.walletTransferAmount) {
    elements.walletTransferAmount.textContent = `${finalTotal.toFixed(2)} ${currency}`;
  }

  const minOrder = settings.minOrder || 0;
  if (elements.btnProceedToStep2) {
    if (subtotal < minOrder && totalItemsCount > 0) {
      elements.btnProceedToStep2.disabled = true;
      elements.btnProceedToStep2.innerHTML = `<span>الحد الأدنى للطلب ${minOrder} ${currency}</span>`;
    } else {
      elements.btnProceedToStep2.disabled = totalItemsCount === 0;
      elements.btnProceedToStep2.innerHTML = `<span>متابعة الطلب</span> <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>`;
    }
  }

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

  elements.cartDrawerItems.innerHTML = cart.map(item => `
    <div class="cart-ledger-item">
      <img src="${item.image}" class="cart-ledger-img" alt="${item.name}">
      <div class="cart-ledger-details">
        <div class="cart-ledger-name">${item.name}</div>
        <div class="cart-ledger-price font-num">${(item.price * item.qty).toFixed(2)} ${currency}</div>
      </div>
      <div class="qty-stepper" style="padding:1px;">
        <button class="qty-stepper-btn" onclick="handleUpdateItemQty('${item.id}', -1)">
          ${item.qty === 1 ? '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>' : '−'}
        </button>
        <span class="qty-stepper-val font-num" style="min-width:18px; font-size:12.5px;">${item.qty}</span>
        <button class="qty-stepper-btn" onclick="handleUpdateItemQty('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

function openCartDrawer() {
  if (elements.cartDrawer) elements.cartDrawer.classList.add('open');
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.classList.add('open');
  goToCheckoutStep(1);
}

function closeCartDrawer() {
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
    if (elements.payCodOption) elements.payCodOption.classList.add('active');
    if (elements.payWalletOption) elements.payWalletOption.classList.remove('active');
    if (elements.walletDetailsBox) elements.walletDetailsBox.style.display = 'none';
  } else {
    if (elements.payCodOption) elements.payCodOption.classList.remove('active');
    if (elements.payWalletOption) elements.payWalletOption.classList.add('active');
    if (elements.walletDetailsBox) elements.walletDetailsBox.style.display = 'block';
  }
  updateLedgerUI();
}

function setupEventListeners() {
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', handleThemeToggle);
  }

  if (elements.btnReorder) {
    elements.btnReorder.addEventListener('click', handleReorderClick);
  }

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

  if (elements.floatingLedger) elements.floatingLedger.addEventListener('click', openCartDrawer);
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
        alert("يرجى كتابة عنوان التوصيل");
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
        updateLedgerUI();
      } else {
        alert("كود الخصم غير صحيح أو منتهي");
      }
    });
  }

  if (elements.btnRemovePromo) {
    elements.btnRemovePromo.addEventListener('click', () => {
      Store.setAppliedCoupon(null);
      updateLedgerUI();
    });
  }

  if (elements.payCodOption) elements.payCodOption.addEventListener('click', () => setPaymentOption('cod'));
  if (elements.payWalletOption) elements.payWalletOption.addEventListener('click', () => setPaymentOption('wallet'));

  if (elements.btnCopyNum) {
    elements.btnCopyNum.addEventListener('click', () => {
      const num = elements.walletNumDisplay.textContent;
      navigator.clipboard.writeText(num);
      alert("تم نسخ رقم المحفظة");
    });
  }

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
        elements.receiptStatus.textContent = "تم تجهيز الإيصال بنجاح";
        elements.receiptStatus.className = "upload-status success";
      } catch (err) {
        elements.receiptStatus.textContent = "تعذر الرفع، سيتم إرسال الطلب بدون رابط";
        elements.receiptStatus.className = "upload-status error";
      } finally {
        elements.btnSendWhatsApp.disabled = false;
      }
    });
  }

  if (elements.btnSendWhatsApp) {
    elements.btnSendWhatsApp.addEventListener('click', handleWhatsAppOrder);
  }

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

  Store.saveLastOrder({
    items: cart,
    customer: { name, phone, address },
    timestamp: Date.now()
  });

  const itemsText = cart.map(item => `• ${item.qty}x ${item.name} (${(item.price * item.qty).toFixed(2)} ${currency})`).join('\n');

  const paymentText = isWallet 
    ? `تحويل محفظة إلكترونية (${settings.walletName || 'كاش'})`
    : `دفع نقدي عند الاستلام (COD)`;

  let message = `*طلب جديد من موقع ${settings.storeName}*\n`;
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
    message += `💰 *المبلغ النهائي المطلوب دفعه:* ${finalTotal.toFixed(2)} ${currency}\n`;
  } else {
    message += `💰 *المبلغ المطلوب دفعه:* ${finalTotal.toFixed(2)} ${currency}\n`;
  }

  message += `💳 *طريقة الدفع:* ${paymentText}\n`;

  if (isWallet && uploadedReceiptUrl) {
    message += `📸 *رابط سكرين التحويل:* ${uploadedReceiptUrl}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `تم إرسال الطلب بنجاح.`;

  const cleanWhatsApp = (settings.whatsappNumber || '').replace(/\D/g, '');
  const encodedUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`;

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
  elements.receiptPreview.style.display = 'none';
  elements.receiptStatus.style.display = 'none';
  uploadedReceiptUrl = null;
}

document.addEventListener('DOMContentLoaded', initApp);
