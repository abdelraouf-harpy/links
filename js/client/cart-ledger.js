// ═══════════════════════════════════════════════════════════
// HarpyOrder — Cart Ledger, Smart Upselling & Checkout Drawer
// ═══════════════════════════════════════════════════════════

var esc = (s) => (typeof window.escapeHtml === 'function' ? window.escapeHtml(s) : String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])));
var roundCurrency = (val) => {
  const n = Number(val || 0);
  return Math.sign(n) * (Math.round(Math.abs(n) * 100 + 1e-6) / 100);
};

var currentCheckoutStep = 1;
var selectedPaymentMethod = 'cod';
var currentFulfillmentType = 'delivery';
window.currentFulfillmentType = 'delivery';
var uploadedReceiptUrl = window.uploadedReceiptUrl || null;
window.uploadedReceiptUrl = window.uploadedReceiptUrl || null;

window.setFulfillmentType = function(type) {
  currentFulfillmentType = type;
  window.currentFulfillmentType = type;

  const tabs = document.querySelectorAll('.fulfillment-tab');
  tabs.forEach(t => {
    t.classList.toggle('active', t.dataset.type === type);
  });

  const badge = document.getElementById('fulfillment-badge-indicator');
  const groupAddress = document.getElementById('group-cust-address');
  const groupTable = document.getElementById('group-table-number');
  const takeawayBanner = document.getElementById('fulfillment-takeaway-banner');
  const customerInfoLabel = document.getElementById('customer-info-section-label');
  const addressInp = document.getElementById('cust-address');

  if (type === 'delivery') {
    if (badge) badge.textContent = typeof window.t === 'function' ? window.t('fulfillment_delivery', 'توصيل دليفري') : 'توصيل دليفري';
    if (customerInfoLabel) customerInfoLabel.textContent = typeof window.t === 'function' ? window.t('cust_info_heading', 'بيانات التوصيل والتواصل:') : 'بيانات التوصيل والتواصل:';
    if (takeawayBanner) takeawayBanner.style.display = 'none';
    if (groupAddress) groupAddress.style.display = 'block';
    if (groupTable) groupTable.style.display = 'none';
    if (addressInp) addressInp.required = true;
  } else if (type === 'takeaway') {
    if (badge) badge.textContent = typeof window.t === 'function' ? window.t('fulfillment_takeaway', 'استلام من الفرع') : 'استلام من الفرع';
    if (customerInfoLabel) customerInfoLabel.textContent = typeof window.t === 'function' ? window.t('cust_info_heading', 'بيانات المستلم والتواصل:') : 'بيانات المستلم والتواصل:';
    if (takeawayBanner) takeawayBanner.style.display = 'flex';
    if (groupAddress) groupAddress.style.display = 'none';
    if (groupTable) groupTable.style.display = 'none';
    if (addressInp) addressInp.required = false;
  } else if (type === 'dinein') {
    if (badge) badge.textContent = typeof window.t === 'function' ? window.t('fulfillment_dinein', 'في الصالة') : 'في الصالة';
    if (customerInfoLabel) customerInfoLabel.textContent = typeof window.t === 'function' ? window.t('cust_info_heading', 'بيانات الطاولة والطلب:') : 'بيانات الطاولة والطلب:';
    if (takeawayBanner) takeawayBanner.style.display = 'none';
    if (groupAddress) groupAddress.style.display = 'none';
    if (groupTable) groupTable.style.display = 'block';
    if (addressInp) addressInp.required = false;

    // Check if table is auto-detected from QR
    const lockedTbl = sessionStorage.getItem('harpy_dinein_table') || window.__harpyDineInTable;
    if (lockedTbl) {
      const step1Inp = document.getElementById('cust-table-number-step1');
      const hiddenInp = document.getElementById('cust-table-number');
      if (step1Inp) {
        step1Inp.value = lockedTbl;
        step1Inp.readOnly = true;
        step1Inp.style.backgroundColor = 'var(--primary-subtle)';
        step1Inp.style.color = 'var(--primary)';
        step1Inp.style.fontWeight = '900';
        step1Inp.style.borderColor = 'var(--primary-glow)';
      }
      if (hiddenInp) hiddenInp.value = lockedTbl;
      const step1Label = document.querySelector('label[for="cust-table-number-step1"]');
      if (step1Label && !step1Label.dataset.locked) {
        step1Label.dataset.locked = "true";
        step1Label.innerHTML = `رقم الطاولة <span style="color:var(--primary); font-size:11px; font-weight:800;">(محددة تلقائياً عبر الباركود: ${lockedTbl})</span>`;
      }
    }
  }

  if (typeof window.updateCartSavedProfileCard === 'function') {
    window.updateCartSavedProfileCard();
  }

  if (typeof updateLedgerUI === 'function') updateLedgerUI();
};

window.syncTableNumber = function(val) {
  const hiddenInp = document.getElementById('cust-table-number');
  if (hiddenInp) hiddenInp.value = val;
  const step1Inp = document.getElementById('cust-table-number-step1');
  if (step1Inp && step1Inp.value !== val) step1Inp.value = val;
};

window.togglePromoInput = function() {
  const container = document.getElementById('promo-input-container');
  const icon = document.getElementById('promo-toggle-icon');
  if (!container) return;
  const isHidden = container.style.display === 'none' || !container.style.display;
  container.style.display = isHidden ? 'flex' : 'none';
  if (icon) icon.textContent = isHidden ? '✕ إغلاق' : '+ إضافة كود';
  if (isHidden) {
    const inp = document.getElementById('promo-code-input');
    if (inp) inp.focus();
  }
};

window.openLastOrderTracker = function() {
  const lastOrder = Store.getLastOrder();
  if (lastOrder && lastOrder.orderId) {
    if (typeof handleNavTabClick === 'function') {
      handleNavTabClick('orders');
    }
  }
};

function renderLastOrderRecall() {
  const lastOrder = Store.getLastOrder();
  if (elements.lastOrderBanner) elements.lastOrderBanner.style.display = 'none';

  if (lastOrder && !lastOrder.archived && lastOrder.items && lastOrder.items.length > 0 && lastOrder.orderId) {
    if (typeof triggerOrdersTabPulse === 'function') {
      triggerOrdersTabPulse();
    }
  } else {
    if (typeof clearOrdersTabPulse === 'function') {
      clearOrdersTabPulse();
    }
  }
}

function handleReorderClick() {
  if (checkOrderingPaused()) return;
  const lastOrder = Store.getLastOrder();
  if (!lastOrder || !lastOrder.items) return;

  Store.saveCart([...lastOrder.items]);
  if (lastOrder.customer) {
    if (elements.custName) elements.custName.value = lastOrder.customer.name || '';
    if (elements.custPhone) elements.custPhone.value = lastOrder.customer.phone || '';
    if (elements.custAddress) elements.custAddress.value = lastOrder.customer.address || '';
  }
  updateLedgerUI();
  renderProducts();
  SoundFX.playChime();
  openCartDrawer();
}


// ── Smart Upselling / Pairing Engine ───────────────────────
function renderSmartPairing(cart, prods, currency) {
  if (!elements.cartSmartPairing || !elements.pairingItemsList) return;
  if (cart.length === 0 || cart.length >= 4) {
    elements.cartSmartPairing.style.display = 'none';
    return;
  }

  const cartIds = cart.map(i => i.productId || i.id);
  const cartAvgPrice = cart.reduce((s, i) => s + (i.price || 0), 0) / (cart.length || 1);
  // Suggest items not in cart: prefer lower-priced items (< 60% of cart avg), fallback to any non-cart visible items
  let suggestions = prods.filter(p => p.visible !== false && !cartIds.includes(p.id) && p.price <= cartAvgPrice * 0.6);
  if (suggestions.length < 2) {
    // Fallback: any visible item not in cart
    suggestions = prods.filter(p => p.visible !== false && !cartIds.includes(p.id));
  }
  suggestions = suggestions.slice(0, 4);

  if (suggestions.length === 0) {
    elements.cartSmartPairing.style.display = 'none';
    return;
  }

  elements.cartSmartPairing.style.display = 'block';
  elements.pairingItemsList.innerHTML = suggestions.map(p => `
    <div class="pairing-chip-card" onclick="handleQuickAddItem('${p.id}')">
      <img src="${p.image}" class="pairing-thumb" alt="${p.name}">
      <div>
        <div class="pairing-title">${p.name}</div>
        <div class="pairing-price font-num">${p.price} ${currency}</div>
      </div>
      <button class="pairing-btn-add" title="إضافة">+</button>
    </div>
  `).join('');
}

// ── Smart Delivery Zone & Address Keyword Matching Engine ──
function normalizeArabic(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function matchKeywordInAddress(normAddress, kw) {
  const normKw = normalizeArabic(kw);
  if (!normKw || normKw.length < 2) return false;

  // 1. Direct standard include
  if (normAddress.includes(normKw)) return true;

  // 2. Space-insensitive match (handles 'ابو خصير' vs 'ابوخصير', 'عبد الرحمن' vs 'عبدالرحمن')
  const noSpaceAddress = normAddress.replace(/\s+/g, '');
  const noSpaceKw = normKw.replace(/\s+/g, '');
  if (noSpaceKw.length >= 3 && noSpaceAddress.includes(noSpaceKw)) return true;

  return false;
}

function detectDeliveryZone(addressText, settings) {
  const ds = (settings && settings.deliverySettings) ? settings.deliverySettings : {};
  let defaultFee = 15;
  if (typeof ds.defaultFee === 'number') defaultFee = ds.defaultFee;
  else if (typeof settings.deliveryFee === 'number') defaultFee = settings.deliveryFee;
  else if (ds.defaultFee !== undefined) defaultFee = parseFloat(ds.defaultFee) || 0;

  const customZones = Array.isArray(ds.customZones) ? ds.customZones : [];
  const normAddress = normalizeArabic(addressText);

  if (!normAddress || normAddress.length < 2) {
    return {
      fee: defaultFee,
      zoneName: 'السعر الموحد',
      isCustom: false
    };
  }

  for (const zone of customZones) {
    if (!zone) continue;
    let rawKws = [];
    if (Array.isArray(zone.keywords)) {
      rawKws = [...zone.keywords];
    } else if (zone.keywords) {
      rawKws = [zone.keywords];
    }
    if (zone.name) rawKws.push(zone.name);

    // Expand & split any keywords containing dashes, hyphens, commas, slashes, pipes, newlines
    const expandedKeywords = [];
    for (const rk of rawKws) {
      if (typeof rk === 'string') {
        rk.split(/[,،\-\/\|—–\n\r;]+/).forEach(piece => {
          const clean = piece.trim();
          if (clean) expandedKeywords.push(clean);
        });
      }
    }

    for (const kw of expandedKeywords) {
      if (matchKeywordInAddress(normAddress, kw)) {
        const fee = typeof zone.fee === 'number' ? zone.fee : (parseFloat(zone.fee) || 0);
        return {
          fee,
          zoneName: zone.name || kw,
          isCustom: true,
          matchedKeyword: kw
        };
      }
    }
  }

  return {
    fee: defaultFee,
    zoneName: 'السعر الموحد',
    isCustom: false
  };
}

function updateDeliveryFeedbackUI() {
  // Zone badge hidden from customer view as per privacy & anti-manipulation requirements
}

// ── Dynamic Island & Cart UI Updates ───────────────────────
function updateLedgerUI() {
  const cart = Store.getCart();
  const settings = Store.getSettings();
  const currency = (typeof window.t === 'function' ? window.t('currency', settings.currency || "ج.م") : (settings.currency || "ج.م"));
  const prods = Store.getProducts();

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Spend Tier Discount
  let spendTierDiscountAmount = 0;
  let spendTierProgress = 0;
  if (settings.enableSpendTierDiscount && settings.spendTierMinAmount > 0 && subtotal > 0) {
    const minSpend = settings.spendTierMinAmount;
    const tierValue = settings.spendTierDiscountValue || 15;
    const isPercent = settings.spendTierDiscountType !== 'fixed';

    if (subtotal >= minSpend) {
      spendTierDiscountAmount = roundCurrency(isPercent ? (subtotal * (tierValue / 100)) : tierValue);
      spendTierProgress = 100;
      if (elements.spendTierCard) {
        elements.spendTierCard.style.display = 'block';
        if (elements.spendTierMsg) elements.spendTierMsg.textContent = `مبروك! حصلت على خصم ${tierValue}${isPercent ? '%' : ' ' + currency} على طلبك`;
        if (elements.spendTierPercent) elements.spendTierPercent.textContent = `${tierValue}${isPercent ? '%' : ' ' + currency} خصم`;
        if (elements.spendTierFill) elements.spendTierFill.style.width = '100%';
      }
    } else {
      const remaining = minSpend - subtotal;
      spendTierProgress = Math.min(100, Math.round((subtotal / minSpend) * 100));
      if (elements.spendTierCard) {
        elements.spendTierCard.style.display = 'block';
        if (elements.spendTierMsg) elements.spendTierMsg.textContent = `أضف بـ ${remaining.toFixed(0)} ${currency} أخرى لتحصل على خصم ${tierValue}${isPercent ? '%' : ' ' + currency}`;
        if (elements.spendTierPercent) elements.spendTierPercent.textContent = `متبقي ${remaining.toFixed(0)} ${currency}`;
        if (elements.spendTierFill) elements.spendTierFill.style.width = `${spendTierProgress}%`;
      }
    }
  } else {
    if (elements.spendTierCard) elements.spendTierCard.style.display = 'none';
  }

  // Promo Code Discount
  const appliedCoupon = Store.getAppliedCoupon();
  let couponDiscountAmount = 0;
  const promoInputContainer = document.getElementById('promo-input-container');
  const promoBoxWrap = document.getElementById('promo-box-wrap') || document.querySelector('.promo-box-wrap');

  // Hide coupon box completely when cart is empty per user requirement
  if (promoBoxWrap) {
    promoBoxWrap.style.display = (cart.length > 0) ? 'block' : 'none';
  }

  if (appliedCoupon && subtotal > 0 && cart.length > 0) {
    if (appliedCoupon.type === 'percent') {
      couponDiscountAmount = roundCurrency(subtotal * (appliedCoupon.value / 100));
    } else {
      couponDiscountAmount = roundCurrency(appliedCoupon.value);
    }
    if (elements.promoAppliedBadge) {
      elements.promoAppliedBadge.style.display = 'flex';
      if (elements.promoAppliedText) elements.promoAppliedText.textContent = `كود ${appliedCoupon.code} (${appliedCoupon.desc || 'مفعل'})`;
    }
    if (promoInputContainer) promoInputContainer.style.display = 'none';
  } else {
    if (elements.promoAppliedBadge) elements.promoAppliedBadge.style.display = 'none';
    if (promoInputContainer) promoInputContainer.style.display = (cart.length > 0) ? 'flex' : 'none';
  }

  const subtotalAfterBasePromos = Math.max(0, subtotal - spendTierDiscountAmount - couponDiscountAmount);

  // Digital Wallet Discount
  const isWallet = selectedPaymentMethod === 'wallet';
  let walletDiscountAmount = 0;
  if (isWallet && settings.enableWalletDiscount !== false && subtotalAfterBasePromos > 0) {
    const isPercent = settings.walletDiscountType !== 'fixed';
    const val = settings.walletDiscountValue !== undefined ? settings.walletDiscountValue : 10;
    walletDiscountAmount = roundCurrency(isPercent ? (subtotalAfterBasePromos * (val / 100)) : val);
  }

  const totalDiscounts = roundCurrency(spendTierDiscountAmount + couponDiscountAmount + walletDiscountAmount);
  
  // Delivery Calculation: Live calculation when Delivery is selected
  const isDelivery = (window.currentFulfillmentType === 'delivery');
  const deliveryInfo = isDelivery ? detectDeliveryZone(elements.custAddress?.value || '', settings) : { fee: 0, zoneName: (window.currentFulfillmentType === 'dinein' ? 'صالة' : 'استلام') };
  const deliveryFee = (cart.length > 0 && isDelivery) ? roundCurrency(deliveryInfo.fee) : 0;
  const finalTotal = roundCurrency(Math.max(0, subtotal - totalDiscounts) + deliveryFee);

  // Sync Fixed Bottom Navigation Bar & Desktop Navigation Cart Badges
  const bottomCartBadge = document.getElementById('bottom-cart-badge');
  const desktopCartBadge = document.getElementById('desktop-cart-badge');
  [bottomCartBadge, desktopCartBadge].forEach(b => {
    if (b) {
      if (totalItemsCount > 0) {
        b.textContent = totalItemsCount;
        b.style.display = 'flex';
      } else {
        b.style.display = 'none';
      }
    }
  });

  if (elements.cartTotalPrice) {
    elements.cartTotalPrice.innerHTML = `${finalTotal.toFixed(2)} <span>${currency}</span>`;
  }
  const step1Total = roundCurrency(Math.max(0, subtotal - spendTierDiscountAmount - couponDiscountAmount));
  const cartTotalPriceS1 = document.getElementById('cart-total-price-s1');
  if (cartTotalPriceS1) {
    cartTotalPriceS1.innerHTML = `${step1Total.toFixed(2)} <span>${currency}</span>`;
  }

  if (elements.cartOriginalStrikethrough) {
    if (totalDiscounts > 0 && subtotal > 0) {
      elements.cartOriginalStrikethrough.style.display = 'inline-block';
      elements.cartOriginalStrikethrough.textContent = `${subtotal.toFixed(2)} ${currency}`;
    } else {
      elements.cartOriginalStrikethrough.style.display = 'none';
    }
  }
  const cartOriginalStrikethroughS1 = document.getElementById('cart-original-strikethrough-s1');
  if (cartOriginalStrikethroughS1) {
    if (totalDiscounts > 0 && subtotal > 0) {
      cartOriginalStrikethroughS1.style.display = 'inline-block';
      cartOriginalStrikethroughS1.textContent = `${subtotal.toFixed(2)} ${currency}`;
    } else {
      cartOriginalStrikethroughS1.style.display = 'none';
    }
  }

  if (elements.subtotalSummaryRow) {
    elements.subtotalSummaryRow.style.display = (totalDiscounts > 0 && subtotal > 0) ? 'flex' : 'none';
    if (elements.subtotalValDisplay) elements.subtotalValDisplay.textContent = `${subtotal.toFixed(2)} ${currency}`;
  }
  const subtotalSummaryRowS1 = document.getElementById('subtotal-summary-row-s1');
  const subtotalValDisplayS1 = document.getElementById('subtotal-val-display-s1');
  if (subtotalSummaryRowS1) {
    subtotalSummaryRowS1.style.display = (totalDiscounts > 0 && subtotal > 0) ? 'flex' : 'none';
    if (subtotalValDisplayS1) subtotalValDisplayS1.textContent = `${subtotal.toFixed(2)} ${currency}`;
  }

  if (elements.spendTierDiscountRow) {
    elements.spendTierDiscountRow.style.display = spendTierDiscountAmount > 0 ? 'flex' : 'none';
    if (elements.spendTierBadge) elements.spendTierBadge.textContent = `${settings.spendTierDiscountValue}${settings.spendTierDiscountType === 'fixed' ? ' ' + currency : '%'}`;
    if (elements.spendTierDiscountVal) elements.spendTierDiscountVal.textContent = `-${spendTierDiscountAmount.toFixed(2)} ${currency}`;
  }

  if (elements.promoDiscountRow) {
    elements.promoDiscountRow.style.display = couponDiscountAmount > 0 ? 'flex' : 'none';
    if (elements.promoNameBadge && appliedCoupon) elements.promoNameBadge.textContent = appliedCoupon.code;
    if (elements.promoDiscountVal) elements.promoDiscountVal.textContent = `-${couponDiscountAmount.toFixed(2)} ${currency}`;
  }
  const promoDiscountRowS1 = document.getElementById('promo-discount-row-s1');
  const promoDiscountValS1 = document.getElementById('promo-discount-val-s1');
  if (promoDiscountRowS1) {
    promoDiscountRowS1.style.display = couponDiscountAmount > 0 ? 'flex' : 'none';
    if (promoDiscountValS1) promoDiscountValS1.textContent = `-${couponDiscountAmount.toFixed(2)} ${currency}`;
  }

  if (elements.walletDiscountRow) {
    elements.walletDiscountRow.style.display = (isWallet && walletDiscountAmount > 0) ? 'flex' : 'none';
    if (elements.walletDiscountBadge) {
      const val = settings.walletDiscountValue !== undefined ? settings.walletDiscountValue : 10;
      elements.walletDiscountBadge.textContent = `${val}${settings.walletDiscountType === 'fixed' ? ' ' + currency : '%'}`;
    }
    if (elements.walletDiscountVal) elements.walletDiscountVal.textContent = `-${walletDiscountAmount.toFixed(2)} ${currency}`;
  }

  if (elements.deliveryFeeRow) {
    if (cart.length > 0 && isDelivery) {
      elements.deliveryFeeRow.style.display = 'flex';
      if (elements.deliveryFeeVal) {
        elements.deliveryFeeVal.textContent = deliveryFee > 0 ? `+${deliveryFee.toFixed(2)} ${currency}` : (typeof window.t === 'function' ? window.t('val_free', 'مجاني') : 'مجاني');
      }
    } else {
      elements.deliveryFeeRow.style.display = 'none';
    }
  }

  if (elements.walletAmountReminder) {
    elements.walletAmountReminder.textContent = `${finalTotal.toFixed(2)} ${currency}`;
  }

  // Handle Empty State vs Step View Visibility
  const emptyView = document.getElementById('cart-empty-view');
  const step1View = document.getElementById('drawer-step-1');
  const step2View = document.getElementById('drawer-step-2');
  const titleText = document.getElementById('cart-drawer-title-text');
  const countBadge = document.getElementById('cart-drawer-items-count-badge');

  if (cart.length === 0) {
    if (emptyView) emptyView.style.display = 'flex';
    if (step1View) step1View.style.display = 'none';
    if (step2View) step2View.style.display = 'none';
    if (titleText) titleText.textContent = (typeof window.t === 'function' ? window.t('cart_title', "سلة الطلبات") : "سلة الطلبات");
    if (countBadge) countBadge.style.display = 'none';
  } else {
    if (emptyView) emptyView.style.display = 'none';
    if (currentCheckoutStep === 2) {
      if (step1View) step1View.style.display = 'none';
      if (step2View) step2View.style.display = 'flex';
      if (titleText) titleText.textContent = (typeof window.t === 'function' ? window.t('fulfillment_title', "الاستلام والدفع") : "الاستلام والدفع");
      if (countBadge) countBadge.style.display = 'none';
    } else {
      if (step1View) step1View.style.display = 'flex';
      if (step2View) step2View.style.display = 'none';
      if (titleText) titleText.textContent = (typeof window.t === 'function' ? window.t('cart_title', "سلة الطلبات") : "سلة الطلبات");
      if (countBadge) {
        countBadge.textContent = totalItemsCount;
        countBadge.style.display = 'inline-block';
      }
    }
  }

  renderSmartPairing(cart, prods, currency);
  renderCartDrawerItems();
}

function renderCartDrawerItems() {
  if (!elements.cartDrawerItems) return;
  const cart = Store.getCart();
  const s = Store.getSettings();
  const currency = (typeof window.t === 'function' ? window.t('currency', s.currency || "ج.م") : (s.currency || "ج.م"));

  if (cart.length === 0) {
    elements.cartDrawerItems.innerHTML = '';
    return;
  }

  elements.cartDrawerItems.innerHTML = cart.map(item => {
    const rawId = item.id || '';
    const cleanId = String(rawId).replace(/[^a-zA-Z0-9#\-_]/g, '');
    const safeImage = (item.image && typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('data:') || item.image.startsWith('/') || item.image.startsWith('./'))) ? esc(item.image) : '';
    const safeName = esc(typeof window.tr === 'function' ? window.tr(item.name || '') : (item.name || ''));
    const sizeText = item.selectedSize ? `<span style="display:inline-block; background:var(--surface-hover); color:var(--text-muted); font-size:10.5px; padding:1px 6px; border-radius:4px; margin-top:2px;">${esc(typeof window.tr === 'function' ? window.tr(item.selectedSize.name) : item.selectedSize.name)}</span>` : '';
    const addonsText = item.selectedAddons && item.selectedAddons.length > 0 
      ? `<div style="font-size:10px; color:var(--primary); margin-top:2px;">+ ${item.selectedAddons.map(a => esc(typeof window.tr === 'function' ? window.tr(a.name) : a.name)).join('، ')}</div>` 
      : '';
    const notesLabel = (typeof window.t === 'function' ? window.t('lbl_notes', 'ملاحظة') : 'ملاحظة');
    const notesText = item.notes ? `<div style="font-size:10px; color:var(--text-faint); font-style:italic;">${notesLabel}: ${esc(item.notes)}</div>` : '';

    return `
      <div class="cart-ledger-item">
        ${safeImage ? `<img src="${safeImage}" class="cart-ledger-img" alt="${safeName}">` : ''}
        <div class="cart-ledger-details">
          <div class="cart-ledger-name">${safeName}</div>
          ${sizeText}
          ${addonsText}
          ${notesText}
          <div class="cart-ledger-price font-num" style="margin-top:4px;">${((item.price || 0) * (item.qty || 1)).toFixed(2)} ${currency}</div>
        </div>
        <div class="qty-stepper" style="padding:1px;">
          <button class="qty-stepper-btn" onclick="handleUpdateItemQty('${cleanId}', -1)">
            ${item.qty === 1 ? '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>' : '−'}
          </button>
          <span class="qty-stepper-val font-num" style="min-width:18px; font-size:12.5px;">${esc(item.qty)}</span>
          <button class="qty-stepper-btn" onclick="handleUpdateItemQty('${cleanId}', 1)">+</button>
        </div>
      </div>
    `;
  }).join('');
}

window.openCartDrawer = function() {
  document.body.classList.add('cart-drawer-open');
  if (elements.cartDrawer) elements.cartDrawer.classList.add('open');
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.classList.add('open');

  // Highlight cart tab in bottom bar
  const navTabs = document.querySelectorAll('.bottom-nav-bar .nav-tab-btn');
  navTabs.forEach(t => t.classList.remove('active'));
  const navCartTab = document.getElementById('nav-tab-cart');
  if (navCartTab) navCartTab.classList.add('active');

  // Pre-fill profile if available
  const profile = (typeof window.getCustomerProfile === 'function') ? window.getCustomerProfile() : null;
  if (profile) {
    if (elements.custName && !elements.custName.value && profile.name) elements.custName.value = profile.name;
    if (elements.custPhone && !elements.custPhone.value && profile.phone) elements.custPhone.value = profile.phone;
    if (elements.custAddress && !elements.custAddress.value && profile.address) elements.custAddress.value = profile.address;
  }
  if (typeof window.updateCartSavedProfileCard === 'function') {
    window.updateCartSavedProfileCard();
  }

  pushNavState('cart_step_1', { step: 1 });
  goToCheckoutStep(1, false);
  SoundFX.playPop();
};

window.closeCartDrawer = function(triggerHistoryBack = true) {
  document.body.classList.remove('cart-drawer-open');
  if (elements.cartDrawer) elements.cartDrawer.classList.remove('open');
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.harpyNav && window.history.state.harpyNav.startsWith('cart_step')) {
    try { history.back(); } catch(e) {}
  }

  // Restore active highlight to currently visible app view tab
  const viewHome = document.getElementById('view-portfolio');
  const viewMenu = document.getElementById('view-menu');
  const viewOrders = document.getElementById('view-orders');
  const viewAccount = document.getElementById('view-account');
  const navTabs = document.querySelectorAll('.bottom-nav-bar .nav-tab-btn');
  navTabs.forEach(t => t.classList.remove('active'));
  if (viewHome && viewHome.style.display !== 'none') {
    document.getElementById('nav-tab-home')?.classList.add('active');
  } else if (viewOrders && viewOrders.style.display !== 'none') {
    document.getElementById('nav-tab-orders')?.classList.add('active');
  } else if (viewAccount && viewAccount.style.display !== 'none') {
    document.getElementById('nav-tab-account')?.classList.add('active');
  } else {
    document.getElementById('nav-tab-menu')?.classList.add('active');
  }
};

window.scrollToMenu = function() {
  const target = document.getElementById('categories-container') || document.querySelector('.category-strip') || document.querySelector('.menu-grid');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 250, behavior: 'smooth' });
  }
};

window.goToCheckoutStep = function(stepNumber, pushHistory = true) {
  const cart = Store.getCart();
  const emptyView = document.getElementById('cart-empty-view');
  const step1View = document.getElementById('drawer-step-1');
  const step2View = document.getElementById('drawer-step-2');
  const titleText = document.getElementById('cart-drawer-title-text');
  const countBadge = document.getElementById('cart-drawer-items-count-badge');

  if (cart.length === 0) {
    currentCheckoutStep = 1;
    if (emptyView) emptyView.style.display = 'flex';
    if (step1View) step1View.style.display = 'none';
    if (step2View) step2View.style.display = 'none';
    if (titleText) titleText.textContent = "سلة الطلبات";
    if (countBadge) countBadge.style.display = 'none';
    return;
  }

  if (emptyView) emptyView.style.display = 'none';

  if (stepNumber === 2) {
    if (checkOrderingPaused()) return;
    currentCheckoutStep = 2;
    if (step1View) step1View.style.display = 'none';
    if (step2View) {
      step2View.style.display = 'flex';
      const body2 = step2View.querySelector('.drawer-body');
      if (body2) body2.scrollTop = 0;
    }
    if (titleText) titleText.textContent = (typeof window.t === 'function' ? window.t('fulfillment_title', "الاستلام والدفع") : "الاستلام والدفع");
    if (countBadge) countBadge.style.display = 'none';

    if (typeof window.updateCartSavedProfileCard === 'function') {
      window.updateCartSavedProfileCard();
    }
    if (pushHistory) pushNavState('cart_step_2', { step: 2 });
  } else {
    currentCheckoutStep = 1;
    if (step2View) step2View.style.display = 'none';
    if (step1View) {
      step1View.style.display = 'flex';
      const body1 = step1View.querySelector('.drawer-body');
      if (body1) body1.scrollTop = 0;
    }
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (titleText) titleText.textContent = "سلة الطلبات";
    if (countBadge) {
      countBadge.textContent = totalQty;
      countBadge.style.display = 'inline-block';
    }
    if (pushHistory) pushNavState('cart_step_1', { step: 1 });
  }

  updateLedgerUI();
};

function setPaymentOption(opt) {
  selectedPaymentMethod = opt;
  if (opt === 'cod') {
    if (elements.payCodOption) elements.payCodOption.classList.add('selected');
    if (elements.payWalletOption) elements.payWalletOption.classList.remove('selected');
    if (elements.walletDetailsBox) elements.walletDetailsBox.style.display = 'none';
  } else {
    if (elements.payCodOption) elements.payCodOption.classList.remove('selected');
    if (elements.payWalletOption) elements.payWalletOption.classList.add('selected');
    if (elements.walletDetailsBox) elements.walletDetailsBox.style.display = 'block';
  }
  SoundFX.playPop();
  updateLedgerUI();
}

function setupEventListeners() {
  if (elements.soundToggleBtn) {
    elements.soundToggleBtn.addEventListener('click', handleSoundToggle);
  }

  if (elements.btnReorder) {
    elements.btnReorder.addEventListener('click', handleReorderClick);
  }

  // View Mode Switcher
  const cycleBtn = elements.viewModeCycleBtn || document.getElementById('view-mode-cycle-btn');
  if (cycleBtn && !cycleBtn.hasAttribute('onclick')) {
    cycleBtn.addEventListener('click', () => {
      if (typeof cycleViewMode === 'function') cycleViewMode();
      else if (typeof window.cycleViewMode === 'function') window.cycleViewMode();
    });
  }
  if (elements.viewToggleGrid) elements.viewToggleGrid.addEventListener('click', () => handleViewModeChange('dual'));
  if (elements.viewToggleList) elements.viewToggleList.addEventListener('click', () => handleViewModeChange('list'));

  // Stories Touch / Navigation
  if (elements.storyTouchPrev) elements.storyTouchPrev.addEventListener('click', prevStory);
  if (elements.storyTouchNext) elements.storyTouchNext.addEventListener('click', nextStory);
  if (elements.btnCloseStory) elements.btnCloseStory.addEventListener('click', closeStoryViewer);
  if (elements.storyModalBackdrop) elements.storyModalBackdrop.addEventListener('click', closeStoryViewer);

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

  if (elements.btnCloseCartDrawer) elements.btnCloseCartDrawer.addEventListener('click', closeCartDrawer);
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.addEventListener('click', closeCartDrawer);

  if (elements.custAddress) {
    elements.custAddress.addEventListener('input', () => {
      updateDeliveryFeedbackUI();
      updateLedgerUI();
    });
  }

  function validateDeliveryStep() {
    const profile = (typeof window.getCustomerProfile === 'function') ? window.getCustomerProfile() : null;
    const name = (elements.custName?.value || profile?.name || '').trim();
    const phone = (elements.custPhone?.value || profile?.phone || '').trim();
    const address = (elements.custAddress?.value || profile?.address || '').trim();

    if (elements.custName && !elements.custName.value && name) elements.custName.value = name;
    if (elements.custPhone && !elements.custPhone.value && phone) elements.custPhone.value = phone;
    if (elements.custAddress && !elements.custAddress.value && address) elements.custAddress.value = address;

    if (!name || name.length < 2) {
      showToastNotification("يرجى كتابة الاسم لتسهيل التواصل ومتابعة الطلب", "warning");
      if (elements.custName) elements.custName.focus();
      return false;
    }
    if (!phone) {
      showToastNotification("يرجى كتابة رقم الهاتف للتواصل بخصوص الطلب", "warning");
      if (elements.custPhone) elements.custPhone.focus();
      return false;
    }
    // Validate phone: Egyptian mobile (01x) or international (+20x / 20x) — digits only, 10-15 digits
    const phoneDigits = phone.replace(/[\s\-\+]/g, '');
    const egyptianMobile = /^(01[0-9]{9})$/.test(phoneDigits);
    const internationalMobile = /^(20[0-9]{10}|[0-9]{10,15})$/.test(phoneDigits);
    if (!egyptianMobile && !internationalMobile) {
      showToastNotification("يرجى التأكد من صحة رقم الهاتف للتواصل (مثال: 01012345678)", "warning");
      if (elements.custPhone) elements.custPhone.focus();
      return false;
    }
    const fType = window.currentFulfillmentType || 'delivery';
    const tableStep1 = (document.getElementById('cust-table-number-step1')?.value || '').trim();
    const tableStep2 = (document.getElementById('cust-table-number')?.value || '').trim();
    const tableNum = tableStep2 || tableStep1;
    if (tableNum) {
      if (document.getElementById('cust-table-number') && !tableStep2) document.getElementById('cust-table-number').value = tableNum;
      if (document.getElementById('cust-table-number-step1') && !tableStep1) document.getElementById('cust-table-number-step1').value = tableNum;
    }

    if (fType === 'delivery') {
      if (!address || address.length < 5) {
        showToastNotification("يرجى كتابة عنوان التوصيل بالتفصيل لضمان سرعة الوصول", "warning");
        if (elements.custAddress) elements.custAddress.focus();
        return false;
      }
    } else if (fType === 'dinein') {
      if (!tableNum) {
        showToastNotification("يرجى إدخال رقم الطاولة لخدمتك داخل المطعم", "warning");
        const tbl = document.getElementById('cust-table-number') || document.getElementById('cust-table-number-step1');
        if (tbl) tbl.focus();
        return false;
      }
    }

    // Automatically persist or update customer profile
    if (typeof window.saveCustomerProfile === 'function') {
      window.saveCustomerProfile(name, phone, address);
    }

    return true;
  }

  elements.stepNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.dataset.step);
      const cart = Store.getCart();

      if (targetStep === 1) {
        goToCheckoutStep(1);
      } else if (targetStep === 2) {
        if (cart.length === 0) {
          showToastNotification("السلة فارغة، أضف بعض الوجبات أولاً", "warning");
          return;
        }
        goToCheckoutStep(2);
      } else if (targetStep === 3) {
        if (cart.length === 0) {
          showToastNotification("السلة فارغة، أضف بعض الوجبات أولاً", "warning");
          return;
        }
        // Strict Validation: Cannot jump to Step 3 without completing Step 2 delivery info!
        if (!validateDeliveryStep()) {
          if (currentCheckoutStep === 1) {
            goToCheckoutStep(2);
          }
          return;
        }
        goToCheckoutStep(3);
      }
    });
  });

  if (elements.btnApplyPromo) {
    elements.btnApplyPromo.addEventListener('click', () => {
      const code = (elements.promoCodeInput.value || '').trim().toUpperCase();
      if (!code) {
        showToastNotification("يرجى كتابة كود الخصم لتطبيقه", "warning");
        return;
      }
      const settings = Store.getSettings();
      const validPromo = (settings.promoCodes || []).find(p => p.code.toUpperCase() === code);
      if (validPromo) {
        Store.setAppliedCoupon(validPromo);
        elements.promoCodeInput.value = '';
        SoundFX.playChime();
        showToastNotification(`تم تفعيل خصم الكوبون بنجاح (${validPromo.code})`, "success");
        updateLedgerUI();
      } else {
        showToastNotification("عذراً، كود الخصم غير صحيح أو منتهي", "warning");
      }
    });
  }

  if (elements.btnRemovePromo) {
    elements.btnRemovePromo.addEventListener('click', () => {
      Store.setAppliedCoupon(null);
      SoundFX.playPop();
      updateLedgerUI();
    });
  }

  if (elements.payCodOption) elements.payCodOption.addEventListener('click', () => setPaymentOption('cod'));
  if (elements.payWalletOption) elements.payWalletOption.addEventListener('click', () => setPaymentOption('wallet'));

  if (elements.btnCopyNum) {
    elements.btnCopyNum.addEventListener('click', () => {
      const num = (elements.walletNumDisplay.textContent || '').trim();
      const doSuccessFeedback = () => {
        SoundFX.playPop();
        if (elements.copyBtnText) elements.copyBtnText.textContent = "تم النسخ";
        elements.btnCopyNum.classList.add('copied');
        showToastNotification("تم نسخ رقم المحفظة بنجاح", "success");
        setTimeout(() => {
          if (elements.copyBtnText) elements.copyBtnText.textContent = "نسخ الرقم";
          elements.btnCopyNum.classList.remove('copied');
        }, 2500);
      };

      const copyFallback = (str) => {
        const ta = document.createElement('textarea');
        ta.value = str;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch(e) {}
        document.body.removeChild(ta);
      };

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(num).then(doSuccessFeedback).catch(() => {
            copyFallback(num);
            doSuccessFeedback();
          });
        } else {
          copyFallback(num);
          doSuccessFeedback();
        }
      } catch(e) {
        copyFallback(num);
        doSuccessFeedback();
      }
    });
  }

  if (elements.receiptInput) {
    elements.receiptInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // 1. Instant local preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (elements.receiptPreview) elements.receiptPreview.src = ev.target.result;
        if (elements.receiptPreviewWrap) elements.receiptPreviewWrap.style.display = 'block';
        if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'none';
      };
      reader.readAsDataURL(file);

      if (elements.receiptStatus) {
        elements.receiptStatus.textContent = "جاري رفع الإيصال وتأمينه...";
        elements.receiptStatus.className = "upload-status-chip loading";
        elements.receiptStatus.style.display = "inline-block";
      }

      try {
        // 2. High-speed cloud upload (Cloudinary / ImgBB) with permanent HTTPS URL
        const uploadedUrl = await Store.uploadImage(file);
        if (uploadedUrl) {
          window.uploadedReceiptUrl = uploadedUrl;
          uploadedReceiptUrl = uploadedUrl;
          if (elements.receiptPreview) elements.receiptPreview.src = uploadedUrl;
          if (elements.receiptPreviewWrap) elements.receiptPreviewWrap.style.display = 'block';
          if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'none';

          if (elements.receiptStatus) {
            elements.receiptStatus.textContent = "تم تجهيز ورفع الإيصال بنجاح ✓";
            elements.receiptStatus.className = "upload-status-chip success";
          }
        } else {
          throw new Error("فشل رفع الصورة للسحابة");
        }
      } catch (err) {
        console.warn("[Receipt] Cloud upload fallback to local canvas compression:", err);
        try {
          const compressed = await Store.compressImage(file, 900, 900, 0.78);
          if (compressed) {
            window.uploadedReceiptUrl = compressed;
            uploadedReceiptUrl = compressed;
            if (elements.receiptPreview) elements.receiptPreview.src = compressed;
            if (elements.receiptPreviewWrap) elements.receiptPreviewWrap.style.display = 'block';
            if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'none';

            if (elements.receiptStatus) {
              elements.receiptStatus.textContent = "تم تجهيز الإيصال بنجاح ✓";
              elements.receiptStatus.className = "upload-status-chip success";
            }
          } else {
            throw new Error("فشل ضغط الصورة");
          }
        } catch (compErr) {
          console.warn("[Receipt] Canvas fallback error:", compErr);
          const r2 = new FileReader();
          r2.onload = (ev) => {
            window.uploadedReceiptUrl = ev.target.result;
            uploadedReceiptUrl = ev.target.result;
            if (elements.receiptPreview) elements.receiptPreview.src = ev.target.result;
            if (elements.receiptPreviewWrap) elements.receiptPreviewWrap.style.display = 'block';
            if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'none';
            if (elements.receiptStatus) {
              elements.receiptStatus.textContent = "تم تجهيز الإيصال بنجاح ✓";
              elements.receiptStatus.className = "upload-status-chip success";
            }
          };
          r2.onerror = () => {
            if (elements.receiptStatus) {
              elements.receiptStatus.textContent = "تعذر قراءة الصورة، يرجى المحاولة ثانية";
              elements.receiptStatus.className = "upload-status-chip error";
            }
          };
          r2.readAsDataURL(file);
        }
      }
    });
  }

  if (elements.btnRemoveReceipt) {
    elements.btnRemoveReceipt.addEventListener('click', (e) => {
      e.stopPropagation();
      window.uploadedReceiptUrl = null;
      uploadedReceiptUrl = null;
      if (elements.receiptInput) elements.receiptInput.value = '';
      if (elements.receiptPreview) elements.receiptPreview.src = '';
      if (elements.receiptPreviewWrap) elements.receiptPreviewWrap.style.display = 'none';
      if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'flex';
      if (elements.receiptStatus) elements.receiptStatus.style.display = 'none';
      SoundFX.playPop();
    });
  }

  if (elements.btnConfirmOrderDirect) {
    elements.btnConfirmOrderDirect.addEventListener('click', () => {
      if (typeof window.handleDirectOrderSubmit === 'function') {
        window.handleDirectOrderSubmit(false);
      } else if (typeof handleDirectOrderSubmit === 'function') {
        handleDirectOrderSubmit(false);
      }
    });
  }

  const btnProceedPayment = document.getElementById('btn-proceed-to-payment');
  if (btnProceedPayment) {
    btnProceedPayment.addEventListener('click', () => {
      window.goToCheckoutStep(2);
    });
  }

  if (elements.btnCloseTracker) {
    elements.btnCloseTracker.addEventListener('click', () => {
      if (typeof window.closeLiveOrderTracker === 'function') window.closeLiveOrderTracker();
      else if (typeof closeLiveOrderTracker === 'function') closeLiveOrderTracker();
    });
  }
  if (elements.btnTrackerNewOrder) {
    elements.btnTrackerNewOrder.addEventListener('click', () => {
      if (typeof window.closeLiveOrderTracker === 'function') window.closeLiveOrderTracker();
      else if (typeof closeLiveOrderTracker === 'function') closeLiveOrderTracker();
    });
  }
  if (elements.trackerModalBackdrop) {
    elements.trackerModalBackdrop.addEventListener('click', () => {
      if (typeof window.closeLiveOrderTracker === 'function') window.closeLiveOrderTracker();
      else if (typeof closeLiveOrderTracker === 'function') closeLiveOrderTracker();
    });
  }

  window.addEventListener('store_settings_updated', () => {
    Store.clearMemoryCache();
    Store.applyTheme();
    renderStoreInfo();
    renderAnnouncement();
    renderStories();
    scheduleRenderProducts();
    updateLedgerUI();
  });
  window.addEventListener('store_categories_updated', () => {
    Store.clearMemoryCache();
    renderCategories();
    scheduleRenderProducts();
  });
  window.addEventListener('store_products_updated', () => {
    Store.clearMemoryCache();
    scheduleRenderProducts();
    updateLedgerUI();
  });
  window.addEventListener('store_stories_updated', () => {
    Store.clearMemoryCache();
    renderStories();
  });
  window.addEventListener('store_favorites_updated', () => {
    renderDiscoveryRibbon();
    scheduleRenderProducts();
  });
  window.addEventListener('harpy_restaurant_changed', () => {
    Store.clearMemoryCache();
    Store.applyTheme();
    renderStoreInfo();
    renderAnnouncement();
    renderStories();
    renderCategories();
    scheduleRenderProducts(true);
    updateLedgerUI();
  });

  // Real-Time Cross-Tab Synchronization (When changes occur in admin.html)
  window.addEventListener('storage', () => {
    Store.clearMemoryCache();
    Store.applyTheme();
    renderStoreInfo();
    renderAnnouncement();
    renderStories();
    renderCategories();
    scheduleRenderProducts();
    updateLedgerUI();
  });
}


window.updateCartSavedProfileCard = function() {
  const card = document.getElementById('cart-saved-profile-card');
  const editWrap = document.getElementById('cart-profile-edit-wrap');
  const titleEl = document.getElementById('saved-profile-title');
  const descEl = document.getElementById('saved-profile-desc');
  const collapseBtn = document.getElementById('btn-collapse-profile-edit');
  const fType = window.currentFulfillmentType || 'delivery';

  const profile = (typeof window.getCustomerProfile === 'function') ? window.getCustomerProfile() : null;
  const name = (elements.custName?.value || profile?.name || '').trim();
  const phone = (elements.custPhone?.value || profile?.phone || '').trim();
  const address = (elements.custAddress?.value || profile?.address || '').trim();
  const tableNum = (document.getElementById('cust-table-number')?.value || '').trim();

  // Populate inputs if currently empty
  if (elements.custName && !elements.custName.value && name) elements.custName.value = name;
  if (elements.custPhone && !elements.custPhone.value && phone) elements.custPhone.value = phone;
  if (elements.custAddress && !elements.custAddress.value && address) elements.custAddress.value = address;

  // Determine if all required info for current mode is present
  let isComplete = false;
  if (fType === 'delivery') {
    isComplete = (name.length >= 2 && phone.length >= 10 && address.length >= 5);
  } else if (fType === 'takeaway') {
    isComplete = (name.length >= 2 && phone.length >= 10);
  } else if (fType === 'dinein') {
    isComplete = (name.length >= 2 && phone.length >= 10 && tableNum.length >= 1);
  }

  const isManuallyOpened = editWrap && editWrap.dataset.manuallyOpened === 'true';

  if (isComplete && !isManuallyOpened) {
    if (card) {
      if (titleEl) titleEl.textContent = `${name} (${phone})`;
      if (descEl) {
        if (fType === 'delivery') descEl.textContent = `${address}`;
        else if (fType === 'takeaway') descEl.textContent = (typeof window.t === 'function' ? window.t('ful_takeaway_desc', 'استلام من كاونتر المطعم (بدون دليفري)') : 'استلام من كاونتر المطعم (بدون دليفري)');
        else if (fType === 'dinein') descEl.textContent = `🍽️ ${(typeof window.t === 'function' ? window.t('fulfillment_dinein', 'طلب صالة') : 'طلب صالة')} — ${(typeof window.t === 'function' ? window.t('field_table', 'طاولة') : 'طاولة')}: ${tableNum}`;
      }
      card.style.display = 'flex';
    }
    if (editWrap) editWrap.style.display = 'none';
  } else {
    if (card) card.style.display = 'none';
    if (editWrap) {
      editWrap.style.display = 'flex';
      if (collapseBtn) {
        collapseBtn.style.display = (name.length >= 2 && phone.length >= 10) ? 'inline-block' : 'none';
      }
    }
  }
};

window.toggleCustomerProfileEdit = function(openEdit) {
  const card = document.getElementById('cart-saved-profile-card');
  const editWrap = document.getElementById('cart-profile-edit-wrap');
  const collapseBtn = document.getElementById('btn-collapse-profile-edit');
  if (!card || !editWrap) return;

  if (openEdit) {
    editWrap.dataset.manuallyOpened = 'true';
    card.style.display = 'none';
    editWrap.style.display = 'flex';
    if (collapseBtn) collapseBtn.style.display = 'inline-block';
    if (elements.custName && !elements.custName.value) elements.custName.focus();
    else if (elements.custAddress && !elements.custAddress.value && window.currentFulfillmentType === 'delivery') elements.custAddress.focus();
  } else {
    delete editWrap.dataset.manuallyOpened;
    const name = (elements.custName?.value || '').trim();
    const phone = (elements.custPhone?.value || '').trim();
    const address = (elements.custAddress?.value || '').trim();
    const notes = (elements.custNotes?.value || '').trim();
    if (name || phone || address) {
      if (typeof window.saveCustomerProfile === 'function') {
        window.saveCustomerProfile(name, phone, address, notes);
      }
    }
    window.updateCartSavedProfileCard();
    if (typeof updateLedgerUI === 'function') updateLedgerUI();
  }
};

window.renderLastOrderRecall = renderLastOrderRecall;
window.handleReorderClick = handleReorderClick;
window.renderSmartPairing = renderSmartPairing;
window.normalizeArabic = normalizeArabic;
window.matchKeywordInAddress = matchKeywordInAddress;
window.detectDeliveryZone = detectDeliveryZone;
window.updateDeliveryFeedbackUI = updateDeliveryFeedbackUI;
window.updateLedgerUI = updateLedgerUI;
window.renderCartDrawerItems = renderCartDrawerItems;
window.setPaymentOption = setPaymentOption;
window.setupEventListeners = setupEventListeners;
