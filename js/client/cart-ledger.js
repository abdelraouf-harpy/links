// ═══════════════════════════════════════════════════════════
// HarpyOrder — Cart Ledger, Smart Upselling & Checkout Drawer
// ═══════════════════════════════════════════════════════════

var currentCheckoutStep = 1;
var selectedPaymentMethod = 'cod';

window.openLastOrderTracker = function() {
  const lastOrder = Store.getLastOrder();
  if (lastOrder && lastOrder.orderId) {
    openLiveOrderTracker(lastOrder.orderId, lastOrder);
  }
};

function renderLastOrderRecall() {
  const lastOrder = Store.getLastOrder();
  const headerTrackerBtn = document.getElementById('btn-header-tracker');
  const headerTrackerText = document.getElementById('header-tracker-text');
  const statusBadge = document.getElementById('last-order-status-badge');

  if (lastOrder && !lastOrder.archived && lastOrder.items && lastOrder.items.length > 0 && lastOrder.orderId) {
    if (elements.lastOrderBanner) elements.lastOrderBanner.style.display = 'flex';
    if (elements.lastOrderSummary) {
      const itemNames = lastOrder.items.map(i => `${i.qty}x ${i.name}`).join('، ');
      elements.lastOrderSummary.textContent = `${lastOrder.orderId}: ${itemNames}`;
    }

    if (headerTrackerBtn) {
      headerTrackerBtn.style.display = 'inline-flex';
      if (headerTrackerText) {
        headerTrackerText.textContent = `تتبع ${lastOrder.orderId}`;
      }
    }

    const st = lastOrder.status || 'pending';
    const statusMap = {
      pending: { text: '1. استلام الطلب 📥', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
      preparing: { text: '2. المطبخ يجهز 👨‍🍳', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
      out_for_delivery: { text: '3. في الطريق إليك 🛵', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
      delivered: { text: '4. تم التسليم بنجاح ✅', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
      cancelled: { text: 'تم الإلغاء ✕', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }
    };
    const sInfo = statusMap[st] || statusMap.pending;
    if (statusBadge) {
      statusBadge.textContent = sInfo.text;
      statusBadge.style.color = sInfo.color;
      statusBadge.style.background = sInfo.bg;
    }
  } else {
    if (elements.lastOrderBanner) elements.lastOrderBanner.style.display = 'none';
    if (headerTrackerBtn) headerTrackerBtn.style.display = 'none';
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
  const currency = settings.currency || "ج.م";
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
      spendTierDiscountAmount = isPercent ? (subtotal * (tierValue / 100)) : tierValue;
      spendTierProgress = 100;
      if (elements.spendTierCard) {
        elements.spendTierCard.style.display = 'block';
        if (elements.spendTierMsg) elements.spendTierMsg.textContent = `مبروك! حصلت على خصم ${tierValue}${isPercent ? '%' : ' ' + currency} على طلبك`;
        if (elements.spendTierPercent) elements.spendTierPercent.textContent = `${tierValue}${isPercent ? '%' : ' ج.م'} خصم`;
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
    if (promoInputContainer) promoInputContainer.style.display = 'none';
  } else {
    if (elements.promoAppliedBadge) elements.promoAppliedBadge.style.display = 'none';
    if (promoInputContainer) promoInputContainer.style.display = 'flex';
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
  
  // Smart Delivery Calculation: Only reveal and calculate at Step 3 (Payment stage)
  const isPaymentStep = (currentCheckoutStep === 3);
  const deliveryInfo = detectDeliveryZone(elements.custAddress?.value || '', settings);
  const deliveryFee = (cart.length > 0 && isPaymentStep) ? deliveryInfo.fee : 0;
  const finalTotal = Math.max(0, subtotal - totalDiscounts) + deliveryFee;

  // Update Dynamic Island
  if (elements.dynamicIslandCart) {
    if (totalItemsCount > 0) {
      elements.dynamicIslandCart.classList.add('active');
      if (elements.islandItemCount) {
        elements.islandItemCount.textContent = `${totalItemsCount} ${totalItemsCount === 1 ? 'صنف بالسلة' : 'أصناف بالسلة'}`;
      }
      if (elements.islandPriceDisplay) {
        elements.islandPriceDisplay.textContent = `${finalTotal.toFixed(2)} ${currency}`;
      }
      if (elements.islandProgressFill) {
        elements.islandProgressFill.style.width = `${spendTierProgress}%`;
      }
      if (elements.islandAvatarStack) {
        const topAvatars = cart.slice(0, 3);
        elements.islandAvatarStack.innerHTML = topAvatars.map(i => `
          <img src="${i.image}" class="island-avatar-thumb" alt="${i.name}">
        `).join('');
      }
    } else {
      elements.dynamicIslandCart.classList.remove('active');
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

  if (elements.deliveryFeeRow) {
    if (isPaymentStep && deliveryFee > 0 && cart.length > 0) {
      elements.deliveryFeeRow.style.display = 'flex';
      if (elements.deliveryFeeVal) elements.deliveryFeeVal.textContent = `+${deliveryFee.toFixed(2)} ${currency}`;
    } else {
      elements.deliveryFeeRow.style.display = 'none';
    }
  }

  if (elements.walletAmountReminder) {
    elements.walletAmountReminder.textContent = `${finalTotal.toFixed(2)} ${currency}`;
  }

  renderSmartPairing(cart, prods, currency);
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

  elements.cartDrawerItems.innerHTML = cart.map(item => {
    const sizeText = item.selectedSize ? `<span style="display:inline-block; background:var(--surface-hover); color:var(--text-muted); font-size:10.5px; padding:1px 6px; border-radius:4px; margin-top:2px;">${item.selectedSize.name}</span>` : '';
    const addonsText = item.selectedAddons && item.selectedAddons.length > 0 
      ? `<div style="font-size:10px; color:var(--primary); margin-top:2px;">+ ${item.selectedAddons.map(a => a.name).join('، ')}</div>` 
      : '';
    const notesText = item.notes ? `<div style="font-size:10px; color:var(--text-faint); font-style:italic;">ملاحظة: ${item.notes}</div>` : '';

    return `
      <div class="cart-ledger-item">
        <img src="${item.image}" class="cart-ledger-img" alt="${item.name}">
        <div class="cart-ledger-details">
          <div class="cart-ledger-name">${item.name}</div>
          ${sizeText}
          ${addonsText}
          ${notesText}
          <div class="cart-ledger-price font-num" style="margin-top:4px;">${(item.price * item.qty).toFixed(2)} ${currency}</div>
        </div>
        <div class="qty-stepper" style="padding:1px;">
          <button class="qty-stepper-btn" onclick="handleUpdateItemQty('${item.id}', -1)">
            ${item.qty === 1 ? '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>' : '−'}
          </button>
          <span class="qty-stepper-val font-num" style="min-width:18px; font-size:12.5px;">${item.qty}</span>
          <button class="qty-stepper-btn" onclick="handleUpdateItemQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `;
  }).join('');
}

window.openCartDrawer = function() {
  document.body.classList.add('cart-drawer-open');
  if (elements.dynamicIslandCart) elements.dynamicIslandCart.classList.add('hidden-during-drawer');
  if (elements.cartDrawer) elements.cartDrawer.classList.add('open');
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.classList.add('open');
  pushNavState('cart_step_1', { step: 1 });
  goToCheckoutStep(1, false);
  SoundFX.playPop();
};

window.closeCartDrawer = function(triggerHistoryBack = true) {
  document.body.classList.remove('cart-drawer-open');
  if (elements.dynamicIslandCart) elements.dynamicIslandCart.classList.remove('hidden-during-drawer');
  if (elements.cartDrawer) elements.cartDrawer.classList.remove('open');
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.harpyNav && window.history.state.harpyNav.startsWith('cart_step')) {
    try { history.back(); } catch(e) {}
  }
};

window.goToCheckoutStep = function(stepNumber, pushHistory = true) {
  if (stepNumber > 1 && checkOrderingPaused()) return;
  const prevStep = currentCheckoutStep;
  currentCheckoutStep = stepNumber;

  if (pushHistory && stepNumber > prevStep) {
    pushNavState('cart_step_' + stepNumber, { step: stepNumber });
  }

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

  // Dynamic drawer footer button label according to current step
  if (elements.btnConfirmOrderDirect) {
    const labelSpan = elements.btnConfirmOrderDirect.querySelector('span');
    if (labelSpan) {
      if (stepNumber === 1) {
        labelSpan.textContent = "متابعة لبيانات التوصيل ←";
      } else if (stepNumber === 2) {
        labelSpan.textContent = "متابعة لاختيار طريقة الدفع ←";
      } else {
        labelSpan.textContent = "تأكيد وإرسال الطلب مباشرة ⚡";
      }
    }
  }

  if (elements.cartDrawer) {
    elements.cartDrawer.scrollTop = 0;
  }

  if (stepNumber === 2) {
    updateDeliveryFeedbackUI();
  }

  updateLedgerUI();
}

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
  if (elements.viewToggleGrid) elements.viewToggleGrid.addEventListener('click', () => handleViewModeChange('grid'));
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

  if (elements.dynamicIslandCart) elements.dynamicIslandCart.addEventListener('click', openCartDrawer);
  if (elements.btnCloseCartDrawer) elements.btnCloseCartDrawer.addEventListener('click', closeCartDrawer);
  if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.addEventListener('click', closeCartDrawer);

  if (elements.custAddress) {
    elements.custAddress.addEventListener('input', () => {
      updateDeliveryFeedbackUI();
      updateLedgerUI();
    });
  }

  function validateDeliveryStep() {
    const name = (elements.custName?.value || '').trim();
    const phone = (elements.custPhone?.value || '').trim();
    const address = (elements.custAddress?.value || '').trim();

    if (!name || name.length < 2) {
      showToastNotification("يرجى كتابة الاسم بشكل صحيح (حرفين على الأقل)", "error");
      if (elements.custName) elements.custName.focus();
      return false;
    }
    if (!phone) {
      showToastNotification("يرجى كتابة رقم الهاتف للتواصل", "error");
      if (elements.custPhone) elements.custPhone.focus();
      return false;
    }
    // Validate phone: Egyptian mobile (01x) or international (+20x / 20x) — digits only, 10-15 digits
    const phoneDigits = phone.replace(/[\s\-\+]/g, '');
    const egyptianMobile = /^(01[0-9]{9})$/.test(phoneDigits);
    const internationalMobile = /^(20[0-9]{10}|[0-9]{10,15})$/.test(phoneDigits);
    if (!egyptianMobile && !internationalMobile) {
      showToastNotification("يرجى كتابة رقم هاتف صحيح (مثال: 01012345678)", "error");
      if (elements.custPhone) elements.custPhone.focus();
      return false;
    }
    if (!address || address.length < 5) {
      showToastNotification("يرجى كتابة عنوان التوصيل بالتفصيل (المنطقة، الشارع)", "error");
      if (elements.custAddress) elements.custAddress.focus();
      return false;
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
          showToastNotification("السلة فارغة، أضف بعض الوجبات أولاً 🛒", "warning");
          return;
        }
        goToCheckoutStep(2);
      } else if (targetStep === 3) {
        if (cart.length === 0) {
          showToastNotification("السلة فارغة، أضف بعض الوجبات أولاً 🛒", "warning");
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
        showToastNotification("يرجى إدخال كود الخصم أولاً", "error");
        return;
      }
      const settings = Store.getSettings();
      const validPromo = (settings.promoCodes || []).find(p => p.code.toUpperCase() === code);
      if (validPromo) {
        Store.setAppliedCoupon(validPromo);
        elements.promoCodeInput.value = '';
        SoundFX.playChime();
        showToastNotification(`تم تفعيل خصم الكوبون بنجاح (${validPromo.code})! 🎉`, "success");
        updateLedgerUI();
      } else {
        showToastNotification("كود الخصم غير صحيح أو غير متاح", "error");
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
        if (elements.copyBtnText) elements.copyBtnText.textContent = "تم النسخ ✓";
        elements.btnCopyNum.classList.add('copied');
        showToastNotification("تم نسخ رقم المحفظة بنجاح ✓", "success");
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

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (elements.receiptPreview) elements.receiptPreview.src = ev.target.result;
        if (elements.receiptPreviewWrap) elements.receiptPreviewWrap.style.display = 'block';
        if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'none';
      };
      reader.readAsDataURL(file);

      if (elements.receiptStatus) {
        elements.receiptStatus.textContent = "جاري معالجة الإيصال... ⏳";
        elements.receiptStatus.className = "upload-status-chip loading";
        elements.receiptStatus.style.display = "inline-block";
      }

      try {
        const compressed = await Store.compressImage(file, 900, 900, 0.78);
        if (compressed) {
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
      } catch (err) {
        console.warn("[Receipt] Fast canvas compression fallback:", err);
        const reader = new FileReader();
        reader.onload = (ev) => {
          uploadedReceiptUrl = ev.target.result;
          if (elements.receiptPreview) elements.receiptPreview.src = uploadedReceiptUrl;
          if (elements.receiptPreviewWrap) elements.receiptPreviewWrap.style.display = 'block';
          if (elements.dropzonePrompt) elements.dropzonePrompt.style.display = 'none';
          if (elements.receiptStatus) {
            elements.receiptStatus.textContent = "تم تجهيز الإيصال بنجاح ✓";
            elements.receiptStatus.className = "upload-status-chip success";
          }
        };
        reader.onerror = () => {
          if (elements.receiptStatus) {
            elements.receiptStatus.textContent = "تعذر قراءة الصورة، يرجى المحاولة ثانية";
            elements.receiptStatus.className = "upload-status-chip error";
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (elements.btnRemoveReceipt) {
    elements.btnRemoveReceipt.addEventListener('click', (e) => {
      e.stopPropagation();
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
    elements.btnConfirmOrderDirect.addEventListener('click', () => handleDirectOrderSubmit(false));
  }

  if (elements.btnSendWhatsApp) {
    elements.btnSendWhatsApp.addEventListener('click', () => handleDirectOrderSubmit(true));
  }

  if (elements.btnCloseTracker) {
    elements.btnCloseTracker.addEventListener('click', closeLiveOrderTracker);
  }
  if (elements.btnTrackerNewOrder) {
    elements.btnTrackerNewOrder.addEventListener('click', closeLiveOrderTracker);
  }
  if (elements.trackerModalBackdrop) {
    elements.trackerModalBackdrop.addEventListener('click', closeLiveOrderTracker);
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
