// ═══════════════════════════════════════════════════════════
// HarpyOrder — Order Tracking, Direct Submission & Live Stepper
// ═══════════════════════════════════════════════════════════

var uploadedReceiptUrl = null;

// ── Direct In-App Ordering & Live Tracker Engine ────────────

async function handleDirectOrderSubmit(openWhatsApp = false) {
  if (checkOrderingPaused()) return;
  if (Store.isSubscriptionSuspended()) {
    showToastNotification("عفواً، الخدمة متوقفة مؤقتاً لهذا المطعم.", "error");
    const backdrop = document.getElementById('subscription-suspended-backdrop');
    const overlay = document.getElementById('subscription-suspended-overlay');
    if (backdrop) backdrop.classList.add('active');
    if (overlay) overlay.classList.add('active');
    return;
  }

  const cart = Store.getCart();
  if (cart.length === 0) {
    showToastNotification("السلة فارغة، تصفح المنيو واختر وجباتك المفضلة", "warning");
    return;
  }

  // If user is on Step 1, advance to Step 2
  if (currentCheckoutStep === 1) {
    goToCheckoutStep(2);
    if (elements.custName) elements.custName.focus();
    return;
  }

  const fType = window.currentFulfillmentType || 'delivery';
  const tableNum = (document.getElementById('cust-table-number')?.value || '').trim();
  const name = (elements.custName?.value || '').trim();
  const phone = (elements.custPhone?.value || '').trim();
  const address = (elements.custAddress?.value || '').trim();
  const notes = (elements.custNotes?.value || '').trim();

  // If user is on Step 2, validate and advance to Step 3
  if (currentCheckoutStep === 2) {
    if (typeof validateDeliveryStep === 'function') {
      if (!validateDeliveryStep()) return;
    } else {
      if (!name || name.length < 2) {
        showToastNotification("يرجى كتابة الاسم لتسهيل التواصل ومتابعة الطلب", "warning");
        if (elements.custName) elements.custName.focus();
        return;
      }
      if (!phone) {
        showToastNotification("يرجى كتابة رقم الهاتف للتواصل بخصوص الطلب", "warning");
        if (elements.custPhone) elements.custPhone.focus();
        return;
      }
      if (fType === 'delivery' && (!address || address.length < 5)) {
        showToastNotification("يرجى كتابة عنوان التوصيل بالتفصيل لضمان سرعة الوصول", "warning");
        if (elements.custAddress) elements.custAddress.focus();
        return;
      }
      if (fType === 'dinein' && !tableNum) {
        showToastNotification("يرجى إدخال رقم الطاولة لخدمتك داخل المطعم", "warning");
        const tInput = document.getElementById('cust-table-number');
        if (tInput) tInput.focus();
        return;
      }
    }
    goToCheckoutStep(3);
    return;
  }

  // If user is on Step 3, ensure fields are complete before sending
  if (!name || !phone) {
    showToastNotification("يرجى إكمال بيانات التوصيل للمتابعة", "warning");
    goToCheckoutStep(2);
    return;
  }
  if (fType === 'delivery' && (!address || address.length < 5)) {
    showToastNotification("يرجى كتابة عنوان التوصيل بالتفصيل لضمان سرعة الوصول", "warning");
    goToCheckoutStep(2);
    return;
  }
  if (fType === 'dinein' && !tableNum) {
    showToastNotification("يرجى كتابة رقم الطاولة لخدمتك داخل المطعم", "warning");
    goToCheckoutStep(2);
    return;
  }

  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (settings.minOrder > 0 && subtotal < settings.minOrder) {
    showToastNotification(`الحد الأدنى للطلب هو ${settings.minOrder} ${currency}`, "error");
    return;
  }

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

  // ── Mandatory Receipt Validation for Digital Wallet Payments ──
  if (isWallet) {
    if (!uploadedReceiptUrl && elements.receiptInput?.files?.length > 0) {
      const file = elements.receiptInput.files[0];
      if (file) {
        showToastNotification("جاري تجهيز صورة الإيصال، يرجى الانتظار", "info");
        try {
          uploadedReceiptUrl = await Store.compressImage(file, 900, 900, 0.78);
        } catch (e) {
          console.warn("[Checkout] Receipt upload fallback:", e);
        }
      }
    }

    if (!uploadedReceiptUrl) {
      showToastNotification("يرجى إرفاق صورة إيصال التحويل لتأكيد الطلب عبر فودافون كاش / إنستاباي", "warning");
      const dropzone = document.querySelector('.receipt-luxury-dropzone') || elements.dropzonePrompt;
      if (dropzone) {
        dropzone.classList.add('dropzone-highlight-required');
        dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => dropzone.classList.remove('dropzone-highlight-required'), 3000);
      }
      return;
    }
  }

  let walletDiscountAmount = 0;
  if (isWallet && settings.enableWalletDiscount !== false && subtotalAfterBase > 0) {
    const isPercent = settings.walletDiscountType !== 'fixed';
    const val = settings.walletDiscountValue !== undefined ? settings.walletDiscountValue : 10;
    walletDiscountAmount = isPercent ? (subtotalAfterBase * (val / 100)) : val;
  }

  const totalDiscounts = spendTierDiscountAmount + couponDiscountAmount + walletDiscountAmount;

  // Fulfillment-aware delivery fee & zone calculation
  let deliveryFee = 0;
  let deliveryZone = 'توصيل دليفري';
  let formattedAddress = address;

  if (fType === 'delivery') {
    const deliveryInfo = detectDeliveryZone(address, settings);
    deliveryFee = deliveryInfo.fee;
    deliveryZone = deliveryInfo.zoneName;
  } else if (fType === 'dinein') {
    deliveryFee = 0;
    deliveryZone = `داخل المطعم (طاولة ${tableNum})`;
    formattedAddress = `صالة - طاولة رقم ${tableNum}`;
  } else {
    deliveryFee = 0;
    deliveryZone = 'استلام من الفرع (تيك أواي)';
    formattedAddress = 'استلام من الفرع';
  }

  const finalTotal = Math.max(0, subtotal - totalDiscounts) + deliveryFee;
  const orderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const orderData = {
    orderId,
    fulfillmentType: fType,
    orderType: (fType === 'dinein' ? 'dine_in' : fType),
    tableNumber: fType === 'dinein' ? tableNum : null,
    items: cart,
    customer: { name, phone, address: formattedAddress, notes },
    subtotal,
    discount: totalDiscounts,
    discounts: {
      spendTier: spendTierDiscountAmount,
      promo: couponDiscountAmount,
      promoCode: appliedCoupon ? appliedCoupon.code : null,
      wallet: walletDiscountAmount
    },
    deliveryFee: deliveryFee,
    deliveryZone: deliveryZone,
    finalTotal,
    paymentMethod: selectedPaymentMethod,
    receiptUrl: uploadedReceiptUrl || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    timestamp: Date.now()
  };

  // 1. Show transient loading state on submit buttons
  const submitBtns = document.querySelectorAll('#btn-confirm-order, #btn-confirm-order-whatsapp, .btn-confirm-checkout');
  submitBtns.forEach(b => {
    b.dataset.origText = b.innerHTML;
    b.disabled = true;
    b.innerHTML = 'جارٍ تأكيد الطلب';
  });

  // 2. Await verified cloud push
  let isDelivered = false;
  try {
    isDelivered = await Store.pushOrderToCloud(orderData);
  } catch (pushErr) {
    console.warn("[Checkout] Cloud delivery error:", pushErr);
  }

  // Restore button states
  submitBtns.forEach(b => {
    if (b.dataset.origText) b.innerHTML = b.dataset.origText;
    b.disabled = false;
  });

  // 3. Save order to Store (active order + persistent history)
  Store.saveLastOrder(orderData);
  if (typeof Store.addOrderToHistory === 'function') {
    Store.addOrderToHistory(orderData);
  }

  if (isDelivered) {
    SoundFX.playCash();
    showToastNotification("تم إرسال واستلام طلبك بنجاح! بدأ المطعم بالتجهيز", "success");
    Store.clearCart();
    closeCartDrawer();
    goToCheckoutStep(1);
    updateLedgerUI();
    renderProducts();
  } else {
    // Offline Queue
    Store.addToOutbox(orderData);
    showToastNotification("تم حفظ طلبك بنجاح وسيتأكد تلقائياً فور عودة الاتصال بالإنترنت", "warning");
    closeCartDrawer();
  }

  // 4. Open WhatsApp if requested
  if (openWhatsApp) {
    const itemsText = cart.map(item => {
      let line = `• ${item.qty}x ${item.name}`;
      if (item.selectedSize) line += ` [${item.selectedSize.name}]`;
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        line += ` (+ ${item.selectedAddons.map(a => a.name).join(', ')})`;
      }
      if (item.notes) line += ` (ملاحظة: ${item.notes})`;
      line += ` = ${(item.price * item.qty).toFixed(2)} ${currency}`;
      return line;
    }).join('\n');

    const paymentText = isWallet 
      ? `تحويل محفظة إلكترونية (${settings.walletName || 'كاش'})`
      : `دفع نقدي عند الاستلام (COD)`;

    let fulfillmentLabel = 'توصيل دليفري';
    if (fType === 'takeaway') fulfillmentLabel = 'استلام من الفرع (تيك أواي)';
    else if (fType === 'dinein') fulfillmentLabel = `طلب صالة (داخل المطعم)`;

    let message = `*طلب جديد من موقع ${settings.storeName}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `*رقم الطلب:* ${orderId}\n`;
    message += `*نوع الطلب:* ${fulfillmentLabel}\n`;
    message += `*العميل:* ${name}\n`;
    message += `*الهاتف:* ${phone}\n`;
    if (fType === 'delivery') {
      message += `*عنوان التوصيل:* ${address}\n`;
    } else if (fType === 'dinein') {
      message += `*رقم الطاولة:* ${tableNum}\n`;
    }
    if (notes) message += `*ملاحظات:* ${notes}\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `*تفاصيل الأصناف:*\n${itemsText}\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    if (deliveryFee > 0) {
      message += `*خدمة التوصيل:* ${deliveryFee.toFixed(2)} ${currency}\n`;
    }
    message += `*المبلغ الإجمالي المطلوب:* ${finalTotal.toFixed(2)} ${currency}\n`;
    message += `*طريقة الدفع:* ${paymentText}\n`;
    if (isWallet && uploadedReceiptUrl) {
      if (uploadedReceiptUrl.startsWith('http')) {
        message += `*رابط إيصال التحويل:* ${uploadedReceiptUrl}\n`;
      } else {
        message += `*إيصال التحويل:* تم إرفاق صورة الإيصال ومحفوظة في لوحة إدارة المطعم (طلب رقم ${orderId})\n`;
      }
    }

    const cleanWhatsApp = (settings.whatsappNumber || '').replace(/\D/g, '');
    if (cleanWhatsApp) {
      const encodedUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`;
      window.open(encodedUrl, '_blank');
    }
  }

  // 5. Trigger professional pulsing glow on bottom bar "طلباتي" tab
  if (typeof window.triggerOrdersTabPulse === 'function') {
    window.triggerOrdersTabPulse();
  }

  // 6. Update #view-orders and start background tracking
  if (typeof window.renderOrdersView === 'function') {
    window.renderOrdersView();
  }
  initBackgroundOrderTracking();
}

// ── Persistent Background Order Tracking & Audio Alerts Engine ──
let backgroundOrderWatcherUnsub = null;
let lastKnownBackgroundStatus = null;

function initBackgroundOrderTracking() {
  const slug = Store.getRestaurantSlug();
  const lastOrder = Store.getLastOrder();
  if (!slug || !lastOrder || !lastOrder.orderId || lastOrder.archived) {
    if (backgroundOrderWatcherUnsub) {
      backgroundOrderWatcherUnsub();
      backgroundOrderWatcherUnsub = null;
    }
    return;
  }

  if (lastKnownBackgroundStatus === null) {
    lastKnownBackgroundStatus = lastOrder.status || 'pending';
  }

  if (backgroundOrderWatcherUnsub) {
    backgroundOrderWatcherUnsub();
    backgroundOrderWatcherUnsub = null;
  }

  backgroundOrderWatcherUnsub = Store.subscribeToOrder(slug, lastOrder.orderId, (updatedOrder) => {
    if (!updatedOrder) return;
    if (updatedOrder.deleted || updatedOrder.status === 'deleted') {
      Store.saveLastOrder(null);
      if (typeof window.renderOrdersView === 'function') {
        window.renderOrdersView();
      }
      if (elements.trackerModal && elements.trackerModal.classList.contains('open')) {
        if (typeof closeOrderTracker === 'function') closeOrderTracker();
      }
      return;
    }
    const statusRank = { pending: 1, preparing: 2, out_for_delivery: 3, delivered: 4, cancelled: 5 };
    const currentStored = Store.getLastOrder();

    if (currentStored && (statusRank[currentStored.status] || 1) > (statusRank[updatedOrder.status] || 1)) {
      updatedOrder.status = currentStored.status;
    }

    const newStatus = updatedOrder.status || 'pending';
    const prevStatus = lastKnownBackgroundStatus;
    lastKnownBackgroundStatus = newStatus;

    if (currentStored) {
      const merged = { ...currentStored, ...updatedOrder };
      Store.saveLastOrder(merged);
      renderLastOrderRecall();

      // Instantly update live tracking board in #view-orders
      if (typeof window.renderOrdersView === 'function') {
        window.renderOrdersView();
      }
      if (typeof window.updateOrdersStepperUI === 'function') {
        window.updateOrdersStepperUI(newStatus, merged);
      }

      // If tracker modal is open, update UI in real-time
      if (elements.trackerModal && elements.trackerModal.classList.contains('open')) {
        const settings = Store.getSettings();
        const currency = settings.currency || "ج.م";
        renderTrackerOrderData(merged, currency);
        updateTrackerStepper(newStatus);
      }

      // Audio chime and clean toast notification on status transition
      if (prevStatus && prevStatus !== newStatus) {
        const isDineIn = merged.fulfillmentType === 'dinein' || merged.orderType === 'dine_in' || String(merged.customer?.address || '').includes('صالة');
        const isTakeaway = merged.fulfillmentType === 'takeaway' || String(merged.customer?.address || '').includes('استلام');
        
        let alertText = "تم تحديث حالة طلبك";
        if (newStatus === 'pending') alertText = "تم استلام طلبك ومراجعته في المطعم";
        else if (newStatus === 'preparing') alertText = isDineIn ? "بدأ طهاة المطعم في تحضير وجباتك الآن" : (isTakeaway ? "جاري تحضير وتغليف طلبك للاستلام من الفرع" : "بدأ طهاة المطعم في تحضير وجباتك الآن");
        else if (newStatus === 'out_for_delivery') alertText = isDineIn ? "وجبتك جاهزة ويتم تقديمها لطاولتك الآن" : (isTakeaway ? "طلبك جاهز للاستلام على كاونتر الفرع" : "طلبك مع الكابتن وفي الطريق إليك الآن");
        else if (newStatus === 'delivered') alertText = isDineIn ? "بالهناء والشفاء! نتمنى لك تجربة طعام مميزة" : (isTakeaway ? "تم استلام الطلب بالفرع بنجاح، بالهناء والشفاء" : "تم تسليم الطلب بنجاح، بالهناء والشفاء");
        else if (newStatus === 'cancelled') alertText = "تم إلغاء الطلب من قِبل إدارة المطعم";

        if (newStatus === 'delivered') SoundFX.playCash();
        else SoundFX.playChime();

        if (typeof window.triggerOrdersTabPulse === 'function') {
          const viewOrders = document.getElementById('view-orders');
          if (!viewOrders || viewOrders.style.display === 'none') {
            window.triggerOrdersTabPulse();
          }
        }

        showToastNotification(alertText, newStatus === 'delivered' ? 'success' : 'info');
        notifyCustomerOrderStatus(newStatus);
      }
    }
  });
}

function openLiveOrderTracker(orderOrId, initialData = null) {
  let orderId = '';
  let currentOrder = null;

  if (typeof orderOrId === 'object' && orderOrId !== null) {
    currentOrder = orderOrId;
    orderId = orderOrId.orderId || orderOrId.id || 'ORD-NEW';
  } else {
    orderId = orderOrId;
    currentOrder = initialData || Store.getLastOrder();
  }

  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";

  if (elements.trackOrderId) elements.trackOrderId.textContent = orderId;
  if (elements.trackOrderEta) elements.trackOrderEta.textContent = settings.deliveryTime || "30-45 دقيقة";

  if (elements.btnTrackerWhatsapp) {
    const cleanWa = (settings.whatsappNumber || '').replace(/\D/g, '');
    elements.btnTrackerWhatsapp.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً، أستفسر عن طلبي رقم ${orderId}`)}`;
  }

  if (currentOrder) {
    renderTrackerOrderData(currentOrder, currency);
    updateTrackerStepper(currentOrder.status || 'pending');
  }

  if (elements.trackerModal) elements.trackerModal.classList.add('open');
  if (elements.trackerModalBackdrop) elements.trackerModalBackdrop.classList.add('open');

  pushNavState('tracker', { orderId });
  initBackgroundOrderTracking();
}

function renderTrackerOrderData(order, currency) {
  if (elements.trackOrderTotal) {
    elements.trackOrderTotal.textContent = `${(parseFloat(order.finalTotal) || 0).toFixed(2)} ${currency}`;
  }

  if (elements.trackerItemsList && order.items) {
    elements.trackerItemsList.innerHTML = order.items.map(it => `
      <div style="display:flex; justify-content:space-between; font-size:11.5px; padding:2px 0;">
        <span><b style="color:var(--primary);">${it.qty}x</b> ${it.name} ${it.selectedSize ? `[${it.selectedSize.name}]` : ''}</span>
        <span class="font-num" style="font-weight:700;">${((it.price || 0) * it.qty).toFixed(2)} ${currency}</span>
      </div>
    `).join('');
  }
}

function notifyCustomerOrderStatus(status) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
    return;
  }
  if (Notification.permission === 'granted') {
    const statusMessages = {
      pending: { title: 'تم استلام طلبك بنجاح', body: 'طلبك وصل المطعم وهو قيد المراجعة والتأكيد الآن.' },
      preparing: { title: 'المطبخ يجهز طلبك الآن', body: 'بدأ طهاة المطعم في تجهيز وطهي وجباتك الطازجة.' },
      out_for_delivery: { title: 'الطلب في الطريق إليك', body: 'الكابتن استلم الطلب وهو في طريقه إليك الآن.' },
      delivered: { title: 'تم تسليم الطلب بالهناء والشفاء', body: 'شكراً لطلبك من مطعمنا ونرجو لك وجبة شهية.' }
    };
    const info = statusMessages[status];
    if (info) {
      try {
        const _iconUrl = (typeof Store !== 'undefined' && Store.getSettings) ? (Store.getSettings().logo || './assets/portfolio/logo.png') : './assets/portfolio/logo.png';
        new Notification(info.title, { body: info.body, icon: _iconUrl });
      } catch (e) {}
    }
  }
}

function updateTrackerStepper(status = 'pending') {
  const nodePending = document.getElementById('step-node-pending');
  const nodePrep = document.getElementById('step-node-preparing');
  const nodeDelivery = document.getElementById('step-node-out_for_delivery');
  const nodeDelivered = document.getElementById('step-node-delivered');

  const line1 = document.getElementById('step-line-1');
  const line2 = document.getElementById('step-line-2');
  const line3 = document.getElementById('step-line-3');

  // Reset classes
  [nodePending, nodePrep, nodeDelivery, nodeDelivered].forEach(n => {
    if (n) { n.classList.remove('active', 'completed'); }
  });
  [line1, line2, line3].forEach(l => {
    if (l) { l.classList.remove('active'); }
  });

  if (status === 'pending') {
    if (nodePending) nodePending.classList.add('active');
  } else if (status === 'preparing') {
    if (nodePending) { nodePending.classList.add('completed'); }
    if (line1) line1.classList.add('active');
    if (nodePrep) nodePrep.classList.add('active');
  } else if (status === 'out_for_delivery') {
    if (nodePending) nodePending.classList.add('completed');
    if (nodePrep) nodePrep.classList.add('completed');
    if (line1) line1.classList.add('active');
    if (line2) line2.classList.add('active');
    if (nodeDelivery) nodeDelivery.classList.add('active');
  } else if (status === 'delivered') {
    if (nodePending) nodePending.classList.add('completed');
    if (nodePrep) nodePrep.classList.add('completed');
    if (nodeDelivery) nodeDelivery.classList.add('completed');
    if (nodeDelivered) nodeDelivered.classList.add('completed', 'active');
    if (line1) line1.classList.add('active');
    if (line2) line2.classList.add('active');
    if (line3) line3.classList.add('active');
  }
}

function closeLiveOrderTracker(triggerHistoryBack = true) {
  if (elements.trackerModal) elements.trackerModal.classList.remove('open');
  if (elements.trackerModalBackdrop) elements.trackerModalBackdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.harpyNav === 'tracker') {
    try { history.back(); } catch(e) {}
  }

  const lastOrder = Store.getLastOrder();
  // If order is delivered or cancelled, dismissing/closing modal archives the tracking badge so header is clean!
  if (lastOrder && (lastOrder.status === 'delivered' || lastOrder.status === 'cancelled')) {
    lastOrder.archived = true;
    Store.saveLastOrder(lastOrder);
    if (backgroundOrderWatcherUnsub) {
      backgroundOrderWatcherUnsub();
      backgroundOrderWatcherUnsub = null;
    }
    renderLastOrderRecall();
  }
}


window.handleDirectOrderSubmit = handleDirectOrderSubmit;
window.initBackgroundOrderTracking = initBackgroundOrderTracking;
window.openLiveOrderTracker = openLiveOrderTracker;
window.renderTrackerOrderData = renderTrackerOrderData;
window.notifyCustomerOrderStatus = notifyCustomerOrderStatus;
window.updateTrackerStepper = updateTrackerStepper;
window.closeLiveOrderTracker = closeLiveOrderTracker;
