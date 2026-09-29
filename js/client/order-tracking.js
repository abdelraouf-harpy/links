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
    showToastNotification("السلة فارغة، أضف بعض الوجبات أولاً 🛒", "error");
    return;
  }

  // If user is on Step 1, advance to Step 2
  if (currentCheckoutStep === 1) {
    goToCheckoutStep(2);
    if (elements.custName) elements.custName.focus();
    return;
  }

  const name = (elements.custName?.value || '').trim();
  const phone = (elements.custPhone?.value || '').trim();
  const address = (elements.custAddress?.value || '').trim();
  const notes = (elements.custNotes?.value || '').trim();

  // If user is on Step 2, validate and advance to Step 3
  if (currentCheckoutStep === 2) {
    if (!name || name.length < 2) {
      showToastNotification("يرجى كتابة الاسم بشكل صحيح (حرفين على الأقل)", "error");
      if (elements.custName) elements.custName.focus();
      return;
    }
    if (!phone) {
      showToastNotification("يرجى كتابة رقم الهاتف للتواصل", "error");
      if (elements.custPhone) elements.custPhone.focus();
      return;
    }
    const phoneDigits = phone.replace(/[\s\-\+]/g, '');
    const egyptianMobile = /^(01[0-9]{9})$/.test(phoneDigits);
    const internationalMobile = /^(20[0-9]{10}|[0-9]{10,15})$/.test(phoneDigits);
    if (!egyptianMobile && !internationalMobile) {
      showToastNotification("يرجى كتابة رقم هاتف صحيح (مثال: 01012345678)", "error");
      if (elements.custPhone) elements.custPhone.focus();
      return;
    }
    if (!address || address.length < 5) {
      showToastNotification("يرجى كتابة عنوان التوصيل بالتفصيل", "error");
      if (elements.custAddress) elements.custAddress.focus();
      return;
    }
    goToCheckoutStep(3);
    return;
  }

  // If user is on Step 3, ensure fields are complete before sending
  if (!name || !phone || !address) {
    showToastNotification("يرجى استكمال بيانات التوصيل أولاً", "error");
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
    // If a file was selected but not yet finished processing/uploading, upload it now
    if (!uploadedReceiptUrl && elements.receiptInput?.files?.length > 0) {
      const file = elements.receiptInput.files[0];
      if (file) {
        showToastNotification("⏳ جاري تجهيز صورة الإيصال... يرجى الانتظار", "info");
        try {
          uploadedReceiptUrl = await Store.compressImage(file, 900, 900, 0.78);
        } catch (e) {
          console.warn("[Checkout] Receipt upload fallback:", e);
        }
      }
    }

    // If still no receipt image provided, block submission and prompt user with luxury alert
    if (!uploadedReceiptUrl) {
      showToastNotification("📸 يرجى إرفاق صورة إيصال التحويل لتأكيد الطلب عبر فودافون كاش / إنستاباي", "warning");
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
  const deliveryInfo = detectDeliveryZone(address, settings);
  const deliveryFee = deliveryInfo.fee;
  const finalTotal = Math.max(0, subtotal - totalDiscounts) + deliveryFee;
  const orderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const orderData = {
    orderId,
    items: cart,
    customer: { name, phone, address, notes },
    subtotal,
    discount: totalDiscounts,
    discounts: {
      spendTier: spendTierDiscountAmount,
      promo: couponDiscountAmount,
      promoCode: appliedCoupon ? appliedCoupon.code : null,
      wallet: walletDiscountAmount
    },
    deliveryFee: deliveryFee,
    deliveryZone: deliveryInfo.zoneName,
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
    b.innerHTML = '⏳ جارٍ تأكيد الطلب...';
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

  if (isDelivered) {
    // 3. Confirmed Cloud Success: save, sound, clear cart, close drawer
    Store.saveLastOrder(orderData);
    SoundFX.playCash();
    showToastNotification("تم إرسال واستلام طلبك بنجاح! جاري التجهيز 👨‍🍳🔥", "success");
    Store.clearCart();
    closeCartDrawer();
    goToCheckoutStep(1);
    updateLedgerUI();
    renderProducts();
    renderLastOrderRecall();
  } else {
    // 4. Offline / Network Outage: Queue in Outbox, PRESERVE cart, notify customer honestly
    Store.addToOutbox(orderData);
    Store.saveLastOrder(orderData);
    showToastNotification("⚠️ تعذر الاتصال بالخادم حالياً. تم حفظ طلبك في قائمة الانتظار وسنرسله تلقائياً فور عودة الشبكة 📡", "warning");
    closeCartDrawer();
    renderLastOrderRecall();
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

    let message = `*طلب دليفري جديد من موقع ${settings.storeName}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `🔖 *رقم الطلب:* ${orderId}\n`;
    message += `👤 *العميل:* ${name}\n`;
    message += `📞 *الهاتف:* ${phone}\n`;
    message += `📍 *عنوان التوصيل:* ${address}\n`;
    if (notes) message += `📝 *ملاحظات:* ${notes}\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `🛒 *تفاصيل الأصناف:*\n${itemsText}\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    if (deliveryFee > 0) {
      message += `*خدمة التوصيل:* ${deliveryFee.toFixed(2)} ${currency}\n`;
    }
    message += `💰 *المبلغ الإجمالي المطلوب:* ${finalTotal.toFixed(2)} ${currency}\n`;
    message += `💳 *طريقة الدفع:* ${paymentText}\n`;
    if (isWallet && uploadedReceiptUrl) {
      if (uploadedReceiptUrl.startsWith('http')) {
        message += `📸 *رابط إيصال التحويل:* ${uploadedReceiptUrl}\n`;
      } else {
        message += `📸 *إيصال التحويل:* تم إرفاق صورة الإيصال ومحفوظة في لوحة إدارة المطعم (طلب رقم ${orderId})\n`;
      }
    }

    const cleanWhatsApp = (settings.whatsappNumber || '').replace(/\D/g, '');
    if (cleanWhatsApp) {
      const encodedUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`;
      window.open(encodedUrl, '_blank');
    }
  }

  // 5. Immediately open the Live Order Tracker Screen
  openLiveOrderTracker(orderId, orderData);
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
    const newStatus = updatedOrder.status || 'pending';
    const prevStatus = lastKnownBackgroundStatus;
    lastKnownBackgroundStatus = newStatus;

    const currentStored = Store.getLastOrder();
    if (currentStored && !currentStored.archived) {
      const merged = { ...currentStored, ...updatedOrder };
      Store.saveLastOrder(merged);
      renderLastOrderRecall();

      // If tracker modal is open, update UI in real-time
      if (elements.trackerModal && elements.trackerModal.classList.contains('open')) {
        const settings = Store.getSettings();
        const currency = settings.currency || "ج.م";
        renderTrackerOrderData(merged, currency);
        updateTrackerStepper(newStatus);
      }

      // Audio chime and toast notification on status transition even when modal is closed!
      if (prevStatus && prevStatus !== newStatus) {
        const statusAlerts = {
          pending: { text: "📥 تم استلام وتأكيد طلبك في المطعم!", sound: 'pop' },
          preparing: { text: "👨‍🍳 بدأ المطبخ في تجهيز وطهي طلبك الآن!", sound: 'pop' },
          out_for_delivery: { text: "🛵 طلبك استلمه الكابتن وهو في الطريق إليك الآن!", sound: 'chime' },
          delivered: { text: "🎉 تم تسليم طلبك بنجاح! بالهناء والشفاء", sound: 'cash' },
          cancelled: { text: "✕ تم إلغاء الطلب من قِبل المطعم", sound: 'pop' }
        };
        const alertInfo = statusAlerts[newStatus] || statusAlerts.pending;
        if (alertInfo.sound === 'chime') SoundFX.playChime();
        else if (alertInfo.sound === 'cash') SoundFX.playCash();
        else SoundFX.playPop();

        showToastNotification(alertInfo.text, newStatus === 'delivered' ? 'success' : 'info');
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
      pending: { title: '📥 تم استلام طلبك بنجاح!', body: 'طلبك وصل المطعم وهو قيد المراجعة والتأكيد الآن.' },
      preparing: { title: '👨‍🍳 المطبخ يجهز طلبك الآن!', body: 'بدأ طهاة المطعم في تجهيز وطهي وجباتك الطازجة.' },
      out_for_delivery: { title: '🛵 الطلب في الطريق إليك!', body: 'الكابتن استلم الأوردر وهو في طريقه إليك الآن.' },
      delivered: { title: '✅ تم تسليم الطلب بالهناء والشفاء!', body: 'شكراً لطلبك من مطعمنا ونرجو لك وجبة شهية.' }
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
