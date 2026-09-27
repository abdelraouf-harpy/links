// ═══════════════════════════════════════════════════════════
// HarpyOrder — POS Cashier & In-House Terminal Engine
// ═══════════════════════════════════════════════════════════

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
      <div id="pos-empty-state" style="text-align:center; padding:10px 8px; color:var(--text-muted); font-size:11.5px;">
        <div style="font-size:18px; margin-bottom:2px;">🛒</div>
        الفاتورة فارغة (اضغط على أي صنف لإضافته)
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

let posDiscountPercent = 0;
let posDiscountType = 'none';

window.applyPOSDiscountPercent = function(pct) {
  posDiscountPercent = pct;
  posDiscountType = pct > 0 ? 'percent' : 'none';

  document.querySelectorAll('.pos-disc-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.disc == pct);
  });

  const customWrap = document.getElementById('pos-custom-disc-wrap');
  if (customWrap) customWrap.style.display = 'none';

  const subtotal = posCart.reduce((s, it) => s + (it.price * it.qty), 0);
  const discountVal = Math.round(subtotal * (pct / 100));

  const discountInput = document.getElementById('pos-discount-input');
  if (discountInput) discountInput.value = discountVal;

  updatePOSCalculations();
};

window.openPOSCustomDiscount = function() {
  posDiscountType = 'custom';
  posDiscountPercent = 'custom';

  document.querySelectorAll('.pos-disc-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.disc === 'custom');
  });

  const customWrap = document.getElementById('pos-custom-disc-wrap');
  if (customWrap) {
    customWrap.style.display = 'flex';
    const discountInput = document.getElementById('pos-discount-input');
    if (discountInput) {
      discountInput.focus();
      discountInput.select();
    }
  }
};

window.onPOSCustomDiscountInput = function() {
  posDiscountType = 'custom';
  posDiscountPercent = 'custom';
  document.querySelectorAll('.pos-disc-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.disc === 'custom');
  });
  updatePOSCalculations();
};

window.updatePOSCalculations = function() {
  const currency = Store.getSettings().currency || "ج.م";
  const subtotal = posCart.reduce((s, it) => s + (it.price * it.qty), 0);
  const discountInput = document.getElementById('pos-discount-input');

  if (posDiscountType === 'percent' && typeof posDiscountPercent === 'number' && posDiscountPercent > 0) {
    const computedDiscount = Math.round(subtotal * (posDiscountPercent / 100));
    if (discountInput) discountInput.value = computedDiscount;
  }

  const discount = Math.max(0, parseFloat(discountInput?.value) || 0);
  const finalTotal = Math.max(0, subtotal - discount);

  const subtotalEl = document.getElementById('pos-subtotal');
  const finalTotalEl = document.getElementById('pos-final-total');
  const discLineEl = document.getElementById('pos-discount-display-line');
  const discAmountEl = document.getElementById('pos-discount-amount');
  const discTagEl = document.getElementById('pos-discount-tag');

  if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(0)} ${currency}`;
  if (finalTotalEl) finalTotalEl.textContent = `${finalTotal.toFixed(0)} ${currency}`;

  // Display discount amount in green row
  if (discLineEl && discAmountEl) {
    if (discount > 0) {
      discLineEl.style.display = 'flex';
      let tagText = `-${discount.toFixed(0)} ${currency}`;
      if (posDiscountType === 'percent' && posDiscountPercent > 0) {
        tagText += ` (خصم ${posDiscountPercent}%)`;
      }
      discAmountEl.textContent = tagText;
    } else {
      discLineEl.style.display = 'none';
    }
  }

  // Update discount tag badge
  if (discTagEl) {
    if (discount > 0) {
      discTagEl.style.display = 'inline-block';
      discTagEl.textContent = posDiscountType === 'percent' ? `خصم ${posDiscountPercent}%` : `خصم ${discount.toFixed(0)} ${currency}`;
    } else {
      discTagEl.style.display = 'none';
    }
  }

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
};

window.setPOSPayMethod = function(method) {
  posPayMethod = method;
  document.querySelectorAll('.pos-pay-method-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.pay === method);
  });
};

window.updatePOSChange = function() {
  // Cash calculator removed per user request
};

window.resetPOSCart = function(ask = false) {
  if (ask && posCart.length > 0) {
    openPOSClearModal();
    return;
  }
  posCart = [];
  posDiscountPercent = 0;
  posDiscountType = 'none';

  document.querySelectorAll('.pos-disc-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.disc == 0);
  });

  const customWrap = document.getElementById('pos-custom-disc-wrap');
  if (customWrap) customWrap.style.display = 'none';

  const discountInput = document.getElementById('pos-discount-input');
  const noteInput = document.getElementById('pos-order-note');
  const takeawayInput = document.getElementById('pos-takeaway-name');

  if (discountInput) discountInput.value = '0';
  if (noteInput) noteInput.value = '';
  if (takeawayInput) takeawayInput.value = '';

  updatePOSCartUI();
  if (window.innerWidth <= 980 && typeof switchPOSMobileTab === 'function') {
    switchPOSMobileTab('menu');
  }
};

window.openPOSClearModal = function() {
  const modal = document.getElementById('pos-clear-confirm-modal');
  const backdrop = document.getElementById('pos-clear-confirm-backdrop');
  if (modal) modal.classList.add('open', 'show');
  if (backdrop) backdrop.classList.add('open', 'show');
};

window.closePOSClearModal = function(confirmed = false) {
  const modal = document.getElementById('pos-clear-confirm-modal');
  const backdrop = document.getElementById('pos-clear-confirm-backdrop');
  if (modal) modal.classList.remove('open', 'show');
  if (backdrop) backdrop.classList.remove('open', 'show');
  if (confirmed) {
    resetPOSCart(false);
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

// ── Reactive POS Store Synchronization ──────────────────
window.addEventListener('store_products_updated', () => {
  if (typeof renderPOSProducts === 'function') renderPOSProducts();
});
window.addEventListener('store_categories_updated', () => {
  if (typeof renderPOSCategories === 'function') renderPOSCategories();
  if (typeof renderPOSProducts === 'function') renderPOSProducts();
});
window.addEventListener('store_settings_updated', () => {
  if (typeof renderPOSProducts === 'function') renderPOSProducts();
  if (typeof updatePOSCartUI === 'function') updatePOSCartUI();
});
