// ═══════════════════════════════════════════════════════════
// HarpyOrder — Kitchen KDS, Orders & Invoice Archive Manager
// ═══════════════════════════════════════════════════════════

let lastKnownOrderCount = null;

function playKitchenOrderChime() {
  if (typeof window !== 'undefined' && window.SoundFX && typeof window.SoundFX.playKitchenChime === 'function') {
    window.SoundFX.playKitchenChime();
    return;
  }
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);
  } catch (e) {}
}

function showAdminOrderNotification(newOrder) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      const title = `🔔 طلب جديد ${newOrder.orderId}`;
      const options = {
        body: `العميل: ${newOrder.customer?.name || 'عميل'} | المبلغ: ${newOrder.finalTotal} ج.م`,
        icon: './manifest.json',
        tag: newOrder.orderId
      };
      try {
        new Notification(title, options);
      } catch (e) {}
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
}

// ── Luxury Status Picker Sheet Handlers ─────────────────────
let currentEditingOrderId = null;

window.openStatusSheet = function(orderId, passedStatus = null) {
  if (!orderId || orderId === 'undefined') {
    const orders = Store.getOrders();
    const firstOrder = orders.find(o => o.orderId === orderId || !o.orderId || o.orderId === 'undefined');
    if (firstOrder) orderId = firstOrder.orderId || firstOrder._fbKey || firstOrder.id || 'ORD-UNKNOWN';
  }
  currentEditingOrderId = orderId;
  const sheet = document.getElementById('status-sheet');
  const backdrop = document.getElementById('status-sheet-backdrop');
  const orderIdSpan = document.getElementById('status-sheet-order-id');

  if (orderIdSpan) orderIdSpan.textContent = orderId;

  // Always lookup real current status from memory to prevent any stale param
  const orders = Store.getOrders();
  const cleanId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');
  const currentOrder = orders.find(o => 
    o.orderId === orderId || 
    o.orderId === `#${cleanId}` || 
    o._fbKey === orderId || 
    o.id === orderId ||
    (o.orderId && String(o.orderId).replace(/[^a-zA-Z0-9_-]/g, '') === cleanId)
  );
  const currentStatus = currentOrder?.status || passedStatus || 'pending';

  // Highlight active tile
  document.querySelectorAll('.status-option-tile').forEach(tile => {
    if (tile.dataset.status === currentStatus) {
      tile.classList.add('active');
    } else {
      tile.classList.remove('active');
    }
  });

  if (sheet) sheet.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
};

window.closeStatusSheet = function() {
  currentEditingOrderId = null;
  const sheet = document.getElementById('status-sheet');
  const backdrop = document.getElementById('status-sheet-backdrop');
  if (sheet) sheet.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
};

window.selectOrderStatus = async function(newStatus) {
  if (!currentEditingOrderId) return;
  const orderId = currentEditingOrderId;
  closeStatusSheet();

  // 1. Optimistic in-place DOM update (0ms)
  const statusBadgeMap = {
    pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب 📥' },
    preparing: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', text: '2. المطبخ يجهز 👨‍🍳' },
    out_for_delivery: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)', text: '3. في الطريق إليك 🛵' },
    delivered: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)', text: '4. تم التسليم ✅' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', text: 'تم الإلغاء ✕' }
  };
  const badgeInfo = statusBadgeMap[newStatus] || statusBadgeMap.pending;

  const card = document.querySelector(`.order-card-pro[data-order-id="${orderId}"]`);
  if (card) {
    const triggerBtn = card.querySelector('.order-status-trigger-btn');
    if (triggerBtn) {
      triggerBtn.style.background = badgeInfo.bg;
      triggerBtn.style.color = badgeInfo.color;
      triggerBtn.style.borderColor = badgeInfo.borderColor;
      triggerBtn.innerHTML = `<span>${badgeInfo.text}</span><span style="font-size:10px; margin-right:2px; opacity:0.8;">▾</span>`;
      triggerBtn.setAttribute('onclick', `openStatusSheet('${orderId}', '${newStatus}')`);
    }
  }

  // 2. Persist to Store and Firebase
  await Store.updateOrderStatus(orderId, newStatus);
  renderOrdersList();
  renderInvoicesArchive();
};

// ── Screen Wake Lock Engine (Keep Kitchen Display Awake) ─────────
let wakeLockSentinel = null;
let isWakeLockRequested = false;

window.initKitchenWakeLock = async function() {
  const savedState = localStorage.getItem('harpy_kitchen_wake_lock');
  if (savedState === 'true') {
    isWakeLockRequested = true;
    await requestKitchenWakeLock(false);
  } else {
    updateWakeLockUI(false);
  }

  // Handle visibility change (re-acquire lock when returning to the tab)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isWakeLockRequested) {
      await requestKitchenWakeLock(false);
    }
  });
};

window.requestKitchenWakeLock = async function(showToast = true) {
  if (!('wakeLock' in navigator)) {
    if (showToast) {
      showToastNotification('خاصية إبقاء الشاشة مضاءة غير مدعومة في هذا المتصفح', 'info');
    }
    updateWakeLockUI(false);
    return false;
  }

  try {
    if (wakeLockSentinel) {
      try { await wakeLockSentinel.release(); } catch(e) {}
      wakeLockSentinel = null;
    }

    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      if (document.visibilityState !== 'visible' && isWakeLockRequested) {
        updateWakeLockUI(false);
      }
    });

    isWakeLockRequested = true;
    localStorage.setItem('harpy_kitchen_wake_lock', 'true');
    updateWakeLockUI(true);
    if (showToast) {
      showToastNotification('تم تفعيل إبقاء الشاشة مضاءة دائماً 💡', 'success');
    }
    return true;
  } catch (err) {
    console.warn('[WakeLock] Request failed:', err);
    updateWakeLockUI(false);
    if (showToast) {
      showToastNotification('تعذر قفل إضاءة الشاشة (تحقق من وضع توفير الطاقة)', 'error');
    }
    return false;
  }
};

window.releaseKitchenWakeLock = async function(showToast = true) {
  isWakeLockRequested = false;
  localStorage.setItem('harpy_kitchen_wake_lock', 'false');
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch(e) {}
    wakeLockSentinel = null;
  }
  updateWakeLockUI(false);
  if (showToast) {
    showToastNotification('تم إيقاف إبقاء الشاشة مضاءة (الوضع التلقائي)', 'info');
  }
};

window.toggleKitchenWakeLock = async function() {
  if (isWakeLockRequested && wakeLockSentinel) {
    await releaseKitchenWakeLock(true);
  } else {
    await requestKitchenWakeLock(true);
  }
};

function updateWakeLockUI(isActive) {
  const btn = document.getElementById('btn-toggle-wake-lock');
  const label = document.getElementById('wake-lock-label');
  const dot = document.getElementById('wake-lock-status-dot');
  if (!btn) return;

  if (isActive) {
    btn.classList.add('active');
    if (label) label.textContent = 'الشاشة مضاءة دائماً';
    if (dot) dot.style.background = '#22c55e';
  } else {
    btn.classList.remove('active');
    if (label) label.textContent = 'إبقاء الشاشة مضاءة';
    if (dot) dot.style.background = 'transparent';
  }
}

// ── Luxury Branded Custom Confirm Dialog Engine ─────────────
let customConfirmResolve = null;

window.showCustomConfirm = function({ title, message, icon = '🗑️', confirmText = 'تأكيد الحذف 🗑️', cancelText = 'إلغاء', isDanger = true }) {
  return new Promise((resolve) => {
    customConfirmResolve = resolve;
    const modal = document.getElementById('custom-confirm-modal');
    const backdrop = document.getElementById('custom-confirm-backdrop');
    const titleEl = document.getElementById('custom-confirm-title');
    const msgEl = document.getElementById('custom-confirm-msg');
    const iconEl = document.getElementById('custom-confirm-icon');
    const acceptBtn = document.getElementById('btn-custom-confirm-accept');

    if (titleEl) titleEl.textContent = title || "تأكيد الإجراء";
    if (msgEl) msgEl.innerHTML = message || "";
    if (iconEl) iconEl.textContent = icon || "🗑️";
    if (acceptBtn) {
      acceptBtn.textContent = confirmText;
      acceptBtn.style.background = isDanger ? 'var(--danger)' : 'var(--primary)';
      acceptBtn.onclick = () => window.closeCustomConfirm(true);
    }

    if (modal) modal.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  });
};

window.closeCustomConfirm = function(result = false) {
  const modal = document.getElementById('custom-confirm-modal');
  const backdrop = document.getElementById('custom-confirm-backdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');

  if (typeof customConfirmResolve === 'function') {
    const res = customConfirmResolve;
    customConfirmResolve = null;
    res(result);
  }
};

let pendingDeleteOrderId = null;

window.closeArchivePwdModal = function() {
  const modal = document.getElementById('archive-pwd-modal');
  const backdrop = document.getElementById('archive-pwd-backdrop');
  const input = document.getElementById('archive-delete-password-input');
  const err = document.getElementById('archive-pwd-error-msg');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  if (input) input.value = '';
  if (err) err.style.display = 'none';
  pendingDeleteOrderId = null;
};

window.confirmDeleteOrder = function(orderId) {
  if (!orderId) return;
  pendingDeleteOrderId = orderId;
  const modal = document.getElementById('archive-pwd-modal');
  const backdrop = document.getElementById('archive-pwd-backdrop');
  const input = document.getElementById('archive-delete-password-input');
  const err = document.getElementById('archive-pwd-error-msg');
  if (err) err.style.display = 'none';
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 150);
  }
  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
};


window.executeArchivePasswordDelete = async function() {
  if (!pendingDeleteOrderId) return;
  const input = document.getElementById('archive-delete-password-input');
  const err = document.getElementById('archive-pwd-error-msg');
  const btn = document.getElementById('btn-confirm-archive-pwd-delete');
  const enteredPassword = (input ? input.value : '').trim();

  if (!enteredPassword) {
    if (err) {
      err.textContent = "يرجى إدخال كلمة المرور للمتابعة!";
      err.style.display = 'block';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "جاري التحقق... ⏳";
  }

  try {
    const slug = Store.getRestaurantSlug();
    const isVerified = await window.verifyAdminCredentials(enteredPassword, slug);

    if (isVerified) {
      const orderIdToDelete = pendingDeleteOrderId;
      closeArchivePwdModal();
      await Store.deleteOrder(orderIdToDelete);
      if (typeof showToastNotification === 'function') {
        showToastNotification("تم حذف الفاتورة من الأرشيف بنجاح 🗑️", "success");
      }
    } else {
      if (err) {
        err.textContent = "❌ كلمة المرور غير صحيحة! تم منع حذف الفاتورة.";
        err.style.display = 'block';
      }
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  } catch (ex) {
    if (err) {
      err.textContent = "حدث خطأ أثناء التحقق: " + ex.message;
      err.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "تأكيد الحذف 🗑️";
    }
  }
};

let currentReceiptImageUrl = null;
let isReceiptZoomed = false;

window.openReceiptModal = function(urlOrOrderId) {
  let url = urlOrOrderId;
  if (url && !url.startsWith('http') && !url.startsWith('data:')) {
    const orders = Store.getOrders();
    const order = orders.find(o => (o.orderId === urlOrOrderId || o.id === urlOrOrderId || o._fbKey === urlOrOrderId));
    if (order && order.receiptUrl) {
      url = order.receiptUrl;
    }
  }
  if (!url) return;
  currentReceiptImageUrl = url;
  isReceiptZoomed = false;

  const modal = document.getElementById('receipt-lightbox');
  const backdrop = document.getElementById('receipt-lightbox-backdrop');
  const img = document.getElementById('receipt-lightbox-img');
  const wrap = document.getElementById('receipt-lightbox-wrap');

  if (img) {
    img.src = url;
    img.style.maxHeight = '56vh';
    img.style.maxWidth = '100%';
    img.style.width = 'auto';
    img.style.cursor = 'zoom-in';
  }
  if (wrap) {
    wrap.style.overflow = 'hidden';
  }

  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  pushAdminNavState('admin_receipt');
};

window.openReceiptModalByOrderId = function(orderId) {
  window.openReceiptModal(orderId);
};

window.closeReceiptModal = function(triggerHistoryBack = true) {
  currentReceiptImageUrl = null;
  const modal = document.getElementById('receipt-lightbox');
  const backdrop = document.getElementById('receipt-lightbox-backdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.adminNav === 'admin_receipt') {
    try { history.back(); } catch(e) {}
  }
};

window.toggleReceiptImageZoom = function() {
  const img = document.getElementById('receipt-lightbox-img');
  const wrap = document.getElementById('receipt-lightbox-wrap');
  if (!img) return;

  isReceiptZoomed = !isReceiptZoomed;
  if (isReceiptZoomed) {
    img.style.maxHeight = 'none';
    img.style.maxWidth = 'none';
    img.style.width = '100%';
    img.style.cursor = 'zoom-out';
    if (wrap) wrap.style.overflow = 'auto';
  } else {
    img.style.maxHeight = '56vh';
    img.style.maxWidth = '100%';
    img.style.width = 'auto';
    img.style.cursor = 'zoom-in';
    if (wrap) wrap.style.overflow = 'hidden';
  }
};

window.openReceiptFullImage = function() {
  const url = currentReceiptImageUrl || (document.getElementById('receipt-lightbox-img') ? document.getElementById('receipt-lightbox-img').src : null);
  if (!url) return;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank');
    return;
  }

  if (url.startsWith('data:')) {
    try {
      const parts = url.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const newWin = window.open(blobUrl, '_blank');
      if (!newWin) {
        toggleReceiptImageZoom();
      }
    } catch (e) {
      console.warn("[Admin] Safe blob convert fallback:", e);
      toggleReceiptImageZoom();
    }
    return;
  }

  window.open(url, '_blank');
};

// ── Instant Thermal POS / Kitchen Receipt Printing Engine ────
let currentInvoiceOrder = null;

// ── Instant Elegant Invoice Modal Engine (Like Products, Zero Emojis) ────
window.openOrderInvoiceModal = function(orderOrId) {
  let order = null;
  if (typeof orderOrId === 'object' && orderOrId !== null) {
    order = orderOrId;
  } else {
    const orders = Store.getOrders() || [];
    order = orders.find(o => (o.orderId === orderOrId || o.id === orderOrId || o._fbKey === orderOrId));
  }

  if (!order) {
    if (typeof showToastNotification === 'function') showToastNotification("الطلب غير موجود للمعاينة", "error");
    return;
  }

  currentInvoiceOrder = order;

  const settings = Store.getSettings() || {};
  const storeName = (order && order.storeName) || settings.storeName || settings.name || "مطعم أوردر";
  const currency = settings.currency || "ج.م";
  const timeStr = order.createdAt 
    ? new Date(order.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) 
    : new Date(order.timestamp || Date.now()).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

  const totalDiscount = parseFloat(order.discount) || (order.discounts ? ((parseFloat(order.discounts.spendTier) || 0) + (parseFloat(order.discounts.promo) || 0) + (parseFloat(order.discounts.wallet) || 0)) : 0);

  const modalEl = document.getElementById('invModal');
  const storeNameEl = document.getElementById('invModalStoreName');
  const bodyEl = document.getElementById('invModalBody');

  if (storeNameEl) storeNameEl.textContent = storeName;

  // Order Type Banner (ZERO emojis)
  const orderTypeTitle = order.orderType === 'dine_in'
    ? `طلب صالة — طاولة رقم (${order.tableNumber || order.customer?.tableNumber || '1'})`
    : (order.orderType === 'takeaway'
        ? `طلب سفري (تيك أواي) — استلام من الفرع`
        : `طلب توصيل منزلي`);

  let customerInfoBlock = '';
  if (order.orderType === 'dine_in') {
    if (order.customer?.name && !order.customer.name.includes('طاولة')) {
      customerInfoBlock = `<div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>اسم العميل:</strong> ${order.customer.name}</div>`;
    }
  } else {
    customerInfoBlock = `
      <div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>العميل:</strong> ${order.customer?.name || 'عميل نقدي'}</div>
      ${order.customer?.phone && order.customer?.phone !== 'داخلي' ? `<div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>الهاتف:</strong> <span style="direction:ltr; display:inline-block;">${order.customer.phone}</span></div>` : ''}
      ${order.customer?.address ? `<div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>العنوان:</strong> ${order.customer.address}</div>` : ''}
    `;
  }
  if (order.customer?.notes) {
    customerInfoBlock += `<div style="font-size:12px; margin-top:3px; color:#b45309;"><strong>ملاحظات:</strong> ${order.customer.notes}</div>`;
  }

  // Items Rows (ZERO emojis)
  const itemsRows = (order.items || []).map(it => `
    <tr>
      <td style="text-align:right; padding:6px 0; border-bottom:1px dotted #e5e7eb; vertical-align:top;">
        <div style="font-weight:800; font-size:12.5px; color:#111827;">
          ${it.name}${it.selectedSize ? ` <span style="font-weight:600; font-size:11px; color:#6b7280;">(${it.selectedSize.name})</span>` : ''}
        </div>
        ${it.selectedAddons && it.selectedAddons.length ? `<div style="color:#4b5563; font-size:10.5px; font-weight:600; margin-top:2px;">+ ${it.selectedAddons.map(a => a.name).join('، ')}</div>` : ''}
        ${it.notes ? `<div style="color:#b45309; font-weight:600; font-size:10.5px; margin-top:2px;">ملاحظة: ${it.notes}</div>` : ''}
      </td>
      <td style="text-align:center; padding:6px 4px; border-bottom:1px dotted #e5e7eb; font-weight:800; vertical-align:top; font-size:13px; font-variant-numeric:tabular-nums;">${it.qty}</td>
      <td style="text-align:left; padding:6px 0; border-bottom:1px dotted #e5e7eb; font-weight:800; vertical-align:top; white-space:nowrap; font-size:13px; font-variant-numeric:tabular-nums;">${((it.price || 0) * it.qty).toFixed(0)}</td>
    </tr>
  `).join('');

  const paymentTitle = order.paymentMethod === 'card' 
    ? 'بطاقة بنكية (فيزا)' 
    : (order.paymentMethod === 'wallet' ? 'محفظة إلكترونية' : 'نقداً (كاش)');

  const previewHtml = `
    <div style="font-family:'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; direction:rtl; text-align:right; color:#111827;">
      <!-- Store Header -->
      <div style="text-align:center; padding-bottom:4px; margin-bottom:6px;">
        <div style="font-size:18px; font-weight:900; line-height:1.2; color:#111827;">${storeName}</div>
        ${settings.phone ? `<div style="font-size:11px; color:#4b5563; margin-top:2px;">هاتف: ${settings.phone}</div>` : ''}
      </div>

      <!-- Order Type Banner -->
      <div style="font-size:12.5px; font-weight:800; text-align:center; border:1.5px solid #111827; padding:4px 8px; margin:8px 0; border-radius:6px; background:#f9fafb; color:#111827;">
        ${orderTypeTitle}
      </div>

      <!-- Order Metadata -->
      <div style="display:flex; justify-content:space-between; font-size:11.5px; font-weight:700; margin:3px 0;">
        <span style="color:#6b7280;">رقم الفاتورة:</span>
        <span style="font-weight:900; font-variant-numeric:tabular-nums;">#${order.orderId || ''}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#6b7280; margin-bottom:4px;">
        <span>التاريخ والوقت:</span>
        <span style="font-variant-numeric:tabular-nums;">${timeStr}</span>
      </div>

      ${customerInfoBlock ? `
        <div style="border-top:1px dashed #d1d5db; margin:6px 0;"></div>
        ${customerInfoBlock}
      ` : ''}

      <div style="border-top:1.5px dashed #111827; margin:8px 0;"></div>

      <!-- Items Table -->
      <table style="width:100%; border-collapse:collapse; margin:6px 0; font-size:12px;">
        <thead>
          <tr style="border-bottom:1.5px solid #111827;">
            <th style="text-align:right; padding:4px 0; font-weight:800; font-size:11.5px;">الصنف</th>
            <th style="text-align:center; width:32px; padding:4px 0; font-weight:800; font-size:11.5px;">العدد</th>
            <th style="text-align:left; width:54px; padding:4px 0; font-weight:800; font-size:11.5px;">السعر</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="border-top:1.5px dashed #111827; margin:8px 0;"></div>

      <!-- Totals Breakdown -->
      <div style="font-size:12px;">
        <div style="display:flex; justify-content:space-between; margin:3px 0; color:#374151;">
          <span>المجموع الفرعي:</span>
          <span style="font-weight:800; font-variant-numeric:tabular-nums;">${(parseFloat(order.subtotal) || parseFloat(order.finalTotal) || 0).toFixed(0)} ${currency}</span>
        </div>
        ${totalDiscount > 0 ? `
        <div style="display:flex; justify-content:space-between; margin:3px 0; color:#dc2626;">
          <span>الخصم:</span>
          <span style="font-weight:800; font-variant-numeric:tabular-nums;">- ${totalDiscount.toFixed(0)} ${currency}</span>
        </div>` : ''}
        ${order.deliveryFee ? `
        <div style="display:flex; justify-content:space-between; margin:3px 0; color:#374151;">
          <span>خدمة التوصيل:</span>
          <span style="font-weight:800; font-variant-numeric:tabular-nums;">${parseFloat(order.deliveryFee).toFixed(0)} ${currency}</span>
        </div>` : ''}
      </div>

      <!-- Grand Total Double-Line Box -->
      <div style="border-top:2px solid #111827; border-bottom:2px solid #111827; margin:8px 0; padding:6px 4px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:14px; font-weight:900;">المطلوب تحصيله:</span>
        <span style="font-size:17px; font-weight:900; font-variant-numeric:tabular-nums; color:#ea580c;">${(parseFloat(order.finalTotal) || 0).toFixed(0)} ${currency}</span>
      </div>

      <!-- Payment Method -->
      <div style="display:flex; justify-content:space-between; font-size:11.5px; margin:4px 0; color:#374151;">
        <span style="font-weight:700;">طريقة الدفع:</span>
        <span style="font-weight:800;">${paymentTitle}</span>
      </div>

      <div style="border-top:1px dashed #9ca3af; margin:10px 0 6px 0;"></div>

      <!-- Formal Footer -->
      <div style="text-align:center; font-size:11px; font-weight:800; color:#111827; margin-top:4px;">
        شكراً لزيارتكم! نتمنى لكم يوماً سعيداً.
      </div>
      <div style="text-align:center; font-size:9.5px; color:#6b7280; margin-top:2px;">
        نظام إدارة الطلبات — Harpy Order
      </div>
    </div>
  `;

  if (bodyEl) bodyEl.innerHTML = previewHtml;
  if (modalEl) modalEl.classList.add('open');
};

window.closeInvModal = function() {
  const modalEl = document.getElementById('invModal');
  if (modalEl) modalEl.classList.remove('open');
};

window.triggerThermalPrint = function() {
  if (!currentInvoiceOrder) return;
  executePrintReceipt(currentInvoiceOrder, 'thermal');
};

window.triggerStandardPrint = function() {
  if (!currentInvoiceOrder) return;
  executePrintReceipt(currentInvoiceOrder, 'standard');
};

// Main Print Bridge Function: Opens the sleek preview modal first!
window.printOrderReceipt = function(orderOrId) {
  window.openOrderInvoiceModal(orderOrId);
};

// ── Background Print Generator (Zero Emojis, Clean Thermal & Standard) ──
function executePrintReceipt(order, mode) {
  const settings = Store.getSettings() || {};
  const paperSize = mode === 'standard' ? 'A4' : (settings.printerPaperSize === '58mm' ? '58mm' : '80mm');
  const is58mm = paperSize === '58mm';
  const isStandard = mode === 'standard';
  const storeName = (order && order.storeName) || settings.storeName || settings.name || "مطعم أوردر";
  const currency = settings.currency || "ج.م";
  const timeStr = order.createdAt 
    ? new Date(order.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) 
    : new Date(order.timestamp || Date.now()).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

  const totalDiscount = parseFloat(order.discount) || (order.discounts ? ((parseFloat(order.discounts.spendTier) || 0) + (parseFloat(order.discounts.promo) || 0) + (parseFloat(order.discounts.wallet) || 0)) : 0);

  const orderTypeTitle = order.orderType === 'dine_in'
    ? `طلب صالة — طاولة رقم (${order.tableNumber || order.customer?.tableNumber || '1'})`
    : (order.orderType === 'takeaway'
        ? `طلب سفري (تيك أواي) — استلام من الفرع`
        : `طلب توصيل منزلي`);

  let customerInfoBlock = '';
  if (order.orderType === 'dine_in') {
    if (order.customer?.name && !order.customer.name.includes('طاولة')) {
      customerInfoBlock = `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>اسم العميل:</strong> ${order.customer.name}</div>`;
    }
  } else {
    customerInfoBlock = `
      <div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>العميل:</strong> ${order.customer?.name || 'عميل نقدي'}</div>
      ${order.customer?.phone && order.customer?.phone !== 'داخلي' ? `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>الهاتف:</strong> ${order.customer.phone}</div>` : ''}
      ${order.customer?.address ? `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>العنوان:</strong> ${order.customer.address}</div>` : ''}
    `;
  }
  if (order.customer?.notes) {
    customerInfoBlock += `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-top:2px;"><strong>ملاحظات الطلب:</strong> ${order.customer.notes}</div>`;
  }

  const itemsRows = (order.items || []).map(it => `
    <tr>
      <td style="text-align:right; padding:${is58mm ? '3px 0' : '4px 0'}; border-bottom:1px dotted #ccc; vertical-align:top; word-break:break-word;">
        <div style="font-weight:800; font-size:${is58mm ? '11px' : '12px'}; line-height:1.3;">
          ${it.name}${it.selectedSize ? ` <span style="font-weight:600; font-size:${is58mm ? '9.5px' : '10.5px'};">(${it.selectedSize.name})</span>` : ''}
        </div>
        ${it.selectedAddons && it.selectedAddons.length ? `<div style="color:#333; font-size:${is58mm ? '9px' : '10px'}; font-weight:600;">+ ${it.selectedAddons.map(a => a.name).join('، ')}</div>` : ''}
        ${it.notes ? `<div style="color:#000; font-weight:600; font-size:${is58mm ? '9px' : '10px'}; margin-top:2px;">ملاحظة: ${it.notes}</div>` : ''}
      </td>
      <td style="text-align:center; padding:${is58mm ? '3px 2px' : '4px 2px'}; border-bottom:1px dotted #ccc; font-weight:800; vertical-align:top; font-size:${is58mm ? '11px' : '12px'}; font-variant-numeric:tabular-nums;">${it.qty}</td>
      <td style="text-align:left; padding:${is58mm ? '3px 0' : '4px 0'}; border-bottom:1px dotted #ccc; font-weight:800; vertical-align:top; white-space:nowrap; font-size:${is58mm ? '11px' : '12px'}; font-variant-numeric:tabular-nums;">${((it.price || 0) * it.qty).toFixed(0)}</td>
    </tr>
  `).join('');

  const paymentTitle = order.paymentMethod === 'card' 
    ? 'بطاقة بنكية (فيزا)' 
    : (order.paymentMethod === 'wallet' ? 'محفظة إلكترونية' : 'نقداً (كاش)');

  const printHtml = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة طلب ${order.orderId || ''}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        @page {
          size: ${isStandard ? 'A4' : (is58mm ? '58mm auto' : '80mm auto')};
          margin: ${isStandard ? '15mm' : '0'};
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        html, body {
          width: ${isStandard ? '100%' : (is58mm ? '50mm' : '74mm')} !important;
          max-width: ${isStandard ? '700px' : '100%'};
          margin: 0 auto !important;
          padding: 0 !important;
          background: #fff !important;
          color: #000 !important;
        }
        body {
          font-family: 'Cairo', 'Segoe UI', Tahoma, -apple-system, Arial, sans-serif;
          font-size: ${is58mm ? '11px' : (isStandard ? '13px' : '12.5px')};
          line-height: 1.35;
          padding: ${isStandard ? '10px' : (is58mm ? '4px 2px 20px 2px' : '8px 4px 26px 4px')} !important;
          direction: rtl;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .center { text-align: center; }
        .divider { border-top: 1.5px dashed #000; margin: ${is58mm ? '5px 0' : '7px 0'}; }
        .divider-thin { border-top: 1px dashed #777; margin: ${is58mm ? '4px 0' : '6px 0'}; }
        .bold { font-weight: 800; }
        table { width: 100%; border-collapse: collapse; margin: ${is58mm ? '4px 0' : '6px 0'}; }
        th { border-bottom: 1.5px solid #000; padding: ${is58mm ? '3px 0' : '4px 0'}; font-size: ${is58mm ? '10px' : '11.5px'}; font-weight: 800; }
      </style>
    </head>
    <body>
      <!-- Store Header -->
      <div class="center bold" style="font-size:${is58mm ? '16px' : (isStandard ? '22px' : '20px')}; line-height:1.2; margin-bottom:2px;">${storeName}</div>
      ${settings.phone ? `<div class="center" style="font-size:${is58mm ? '9px' : '10.5px'}; color:#444;">هاتف: ${settings.phone}</div>` : ''}

      <!-- Order Type -->
      <div style="font-size:${is58mm ? '12px' : '14px'}; font-weight:900; text-align:center; border:2px solid #000; padding:${is58mm ? '3px 4px' : '5px 8px'}; margin:${is58mm ? '4px 0' : '6px 0'}; border-radius:4px; background:#f4f4f4;">
        ${orderTypeTitle}
      </div>

      <!-- Order Meta -->
      <div style="display:flex; justify-content:space-between; font-size:${is58mm ? '10px' : '11.5px'}; font-weight:700; margin:2px 0;">
        <span>رقم الفاتورة:</span>
        <span style="font-weight:900;">#${order.orderId || ''}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:${is58mm ? '9px' : '10.5px'}; color:#444; margin-bottom:3px;">
        <span>التاريخ والوقت:</span>
        <span>${timeStr}</span>
      </div>

      ${customerInfoBlock ? `
        <div class="divider-thin"></div>
        ${customerInfoBlock}
      ` : ''}

      <div class="divider"></div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th style="text-align:right;">الصنف</th>
            <th style="text-align:center; width:${is58mm ? '24px' : '30px'};">العدد</th>
            <th style="text-align:left; width:${is58mm ? '44px' : '52px'};">السعر</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="divider"></div>

      <!-- Totals Breakdown -->
      <div style="font-size:${is58mm ? '10.5px' : '12px'};">
        <div style="display:flex; justify-content:space-between; margin:${is58mm ? '2px 0' : '3px 0'};">
          <span>المجموع الفرعي:</span>
          <span style="font-weight:800;">${(parseFloat(order.subtotal) || parseFloat(order.finalTotal) || 0).toFixed(0)} ${currency}</span>
        </div>
        ${totalDiscount > 0 ? `
        <div style="display:flex; justify-content:space-between; margin:${is58mm ? '2px 0' : '3px 0'};">
          <span>الخصم:</span>
          <span style="font-weight:800;">- ${totalDiscount.toFixed(0)} ${currency}</span>
        </div>` : ''}
        ${order.deliveryFee ? `
        <div style="display:flex; justify-content:space-between; margin:${is58mm ? '2px 0' : '3px 0'};">
          <span>خدمة التوصيل:</span>
          <span style="font-weight:800;">${parseFloat(order.deliveryFee).toFixed(0)} ${currency}</span>
        </div>` : ''}
      </div>

      <!-- Grand Total Double-Line Box -->
      <div style="border-top:2px solid #000; border-bottom:2px solid #000; margin:${is58mm ? '5px 0' : '7px 0'}; padding:${is58mm ? '4px 2px' : '6px 4px'}; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:${is58mm ? '13px' : '15px'}; font-weight:900;">المطلوب تحصيله:</span>
        <span style="font-size:${is58mm ? '15px' : '18px'}; font-weight:900;">${(parseFloat(order.finalTotal) || 0).toFixed(0)} ${currency}</span>
      </div>

      <!-- Payment Method -->
      <div style="display:flex; justify-content:space-between; font-size:${is58mm ? '10px' : '11.5px'}; margin:3px 0;">
        <span style="font-weight:700;">طريقة الدفع:</span>
        <span style="font-weight:800;">${paymentTitle}</span>
      </div>

      <div class="divider-thin"></div>

      <!-- Formal Footer -->
      <div class="center bold" style="font-size:${is58mm ? '10px' : '11.5px'}; margin-top:${is58mm ? '4px' : '6px'};">
        شكراً لزيارتكم! نتمنى لكم يوماً سعيداً.
      </div>
      <div class="center" style="font-size:${is58mm ? '8.5px' : '9.5px'}; color:#555; margin-top:2px;">
        نظام إدارة الطلبات — Harpy Order
      </div>

      ${!isStandard ? `<div style="height:${is58mm ? '20px' : '26px'};"></div>` : ''}

      <script>
        window.onload = function() {
          window.focus();
          setTimeout(function() {
            window.print();
            setTimeout(function() { window.close(); }, 1500);
          }, 250);
        };
      </script>
    </body>
    </html>
  `;

  let printIframe = document.getElementById('print-receipt-iframe');
  if (!printIframe) {
    printIframe = document.createElement('iframe');
    printIframe.id = 'print-receipt-iframe';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    printIframe.style.visibility = 'hidden';
    document.body.appendChild(printIframe);
  }
  const doc = printIframe.contentWindow.document;
  doc.open();
  doc.write(printHtml);
  doc.close();
  setTimeout(() => {
    try {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
    } catch (err) {
      console.warn('Iframe print error, falling back to window.open:', err);
      const w = window.open('', '_blank', 'width=420,height=650');
      if (w) {
        w.document.open();
        w.document.write(printHtml);
        w.document.close();
      }
    }
  }, 400);
}


let lastRenderedKitchenSignature = null;
let lastRenderedArchiveSignature = null;
let currentKitchenFilter = 'all'; // 'all', 'pending', 'preparing', 'out_for_delivery'
let currentArchiveFilter = 'delivered'; // 'delivered', 'cancelled', 'all'
let archiveSearchQuery = '';

window.filterKitchenOrders = function(filter) {
  currentKitchenFilter = filter;
  document.querySelectorAll('.btn-filter-kitchen').forEach(b => {
    b.classList.toggle('active', b.dataset.kitchenFilter === filter);
  });
  renderOrdersList();
};

window.advanceOrderStatus = async function(orderId, targetStatus) {
  const statusLabels = {
    preparing: 'المطبخ يجهز الطلب الآن 👨‍🍳',
    out_for_delivery: 'الطلب في الطريق للتوصيل 🛵',
    delivered: 'تم تسليم الطلب ونقله لأرشيف الفواتير بنجاح ✅'
  };
  await Store.updateOrderStatus(orderId, targetStatus);
  renderOrdersList();
  renderInvoicesArchive();
  showToastNotification(statusLabels[targetStatus] || `تم تحديث حالة الطلب ✓`, 'success');
};

window.reopenOrderToKitchen = async function(orderId) {
  await Store.updateOrderStatus(orderId, 'preparing');
  renderOrdersList();
  renderInvoicesArchive();
  showToastNotification(`تمت إعادة الطلب ${orderId} إلى شاشة المطبخ النشطة بنجاح ✓`, 'success');
};

window.filterArchiveOrders = function(filter) {
  currentArchiveFilter = filter;
  document.querySelectorAll('.btn-filter-archive').forEach(b => {
    b.classList.toggle('active', b.dataset.archiveFilter === filter);
  });
  renderInvoicesArchive();
};

window.handleArchiveSearch = function(query) {
  archiveSearchQuery = (query || '').trim().toLowerCase();
  renderInvoicesArchive();
};

// ═══ 1. LIVE KITCHEN & ACTIVE ORDERS ENGINE ══════════════════
window.renderOrdersList = function(orders = null) {
  if (!adminElements.adminOrdersContainer) return;
  if (orders === null || orders === undefined) {
    orders = Store.getOrders();
  }
  const currency = Store.getSettings().currency || "ج.م";

  // Active orders are: pending, preparing, out_for_delivery (never delivered or cancelled)
  const isOrderActive = (o) => !o.status || o.status === 'pending' || o.status === 'preparing' || o.status === 'out_for_delivery';
  const allActiveOrders = orders.filter(isOrderActive);

  const activeCount = allActiveOrders.length;
  const pendingCount = orders.filter(o => !o.status || o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const deliveryCount = orders.filter(o => o.status === 'out_for_delivery').length;

  // Trigger Audio Chime & Browser Notification on New Incoming Order
  if (lastKnownOrderCount !== null && orders.length > lastKnownOrderCount) {
    const latestOrder = orders[0];
    playKitchenOrderChime();
    if (latestOrder) {
      showAdminOrderNotification(latestOrder);
    }
  }
  lastKnownOrderCount = orders.length;

  // Update Kitchen Header Statistics
  if (adminElements.statActiveOrders) adminElements.statActiveOrders.textContent = activeCount;
  if (adminElements.statPendingOrders) adminElements.statPendingOrders.textContent = pendingCount;
  if (adminElements.statPreparingOrders) adminElements.statPreparingOrders.textContent = preparingCount;
  if (adminElements.statDeliveryOrders) adminElements.statDeliveryOrders.textContent = deliveryCount;

  if (adminElements.countFilterAll) adminElements.countFilterAll.textContent = activeCount;
  if (adminElements.countFilterPending) adminElements.countFilterPending.textContent = pendingCount;
  if (adminElements.countFilterPreparing) adminElements.countFilterPreparing.textContent = preparingCount;
  if (adminElements.countFilterDelivery) adminElements.countFilterDelivery.textContent = deliveryCount;

  if (adminElements.ordersBadgeCount) {
    if (activeCount > 0) {
      adminElements.ordersBadgeCount.textContent = activeCount;
      adminElements.ordersBadgeCount.style.display = 'inline-block';
    } else {
      adminElements.ordersBadgeCount.style.display = 'none';
    }
  }

  // Filter according to selected kitchen filter tab
  let displayOrders = allActiveOrders;
  if (currentKitchenFilter === 'pending') {
    displayOrders = allActiveOrders.filter(o => !o.status || o.status === 'pending');
  } else if (currentKitchenFilter === 'preparing') {
    displayOrders = allActiveOrders.filter(o => o.status === 'preparing');
  } else if (currentKitchenFilter === 'out_for_delivery') {
    displayOrders = allActiveOrders.filter(o => o.status === 'out_for_delivery');
  }

  // Prevent repetitive DOM repaints if data signature is identical
  const currentSignature = JSON.stringify({
    filter: currentKitchenFilter,
    orders: displayOrders.map(o => ({ id: o.orderId, st: o.status, tot: o.finalTotal, rec: o.receiptUrl }))
  });
  if (lastRenderedKitchenSignature === currentSignature && adminElements.adminOrdersContainer.children.length > 0) {
    return;
  }
  lastRenderedKitchenSignature = currentSignature;

  if (displayOrders.length === 0) {
    adminElements.adminOrdersContainer.innerHTML = `
      <div style="text-align:center; padding:45px 20px; color:var(--text-muted); background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-md);">
        <div style="font-size:38px; margin-bottom:12px;">👨‍🍳</div>
        <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:4px;">المطبخ جاهز ونظيف! لا توجد طلبات جارية حالياً</div>
        <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:16px;">أي طلب جديد يتم إرساله من المنيو سيظهر هنا فورياً ومباشرة مع صوت رنين المطبخ.</div>
        <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('tab-archive', true)" style="font-weight:800; font-size:12px; border:1px solid var(--border);">
          📁 مراجعة أرشيف الفواتير المسلّمة ←
        </button>
      </div>
    `;
    return;
  }

  adminElements.adminOrdersContainer.innerHTML = displayOrders.map(o => {
    const safeOrderId = o.orderId || o.id || o._fbKey || (`#ORD-${(o.timestamp || Date.now()).toString().slice(-4)}`);
    const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'الآن';
    const status = o.status || 'pending';

    const statusBadge = {
      pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب 📥' },
      preparing: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', text: '2. المطبخ يجهز 👨‍🍳' },
      out_for_delivery: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)', text: '3. في الطريق إليك 🛵' },
      delivered: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)', text: '4. تم التسليم ✅' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', text: 'تم الإلغاء ✕' }
    }[status] || { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب 📥' };

    // 1-Click Fast Workflow Progression Action Button
    let nextActionBtnHtml = '';
    if (status === 'pending') {
      nextActionBtnHtml = `
        <button type="button" class="btn btn-primary btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'preparing')" style="font-weight:800; padding:6px 14px; font-size:12px; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 10px rgba(234, 88, 12, 0.3);">
          <span>👨‍🍳</span>
          <span>بدء التجهيز بالمطبخ</span>
        </button>
      `;
    } else if (status === 'preparing') {
      const isDineInOrTakeaway = o.orderType === 'dine_in' || o.orderType === 'takeaway';
      nextActionBtnHtml = isDineInOrTakeaway ? `
        <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'delivered')" style="background:#16a34a; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 12px rgba(22, 163, 74, 0.35);">
          <span>✅</span>
          <span>جاهز وتم التقديم (أرشفة)</span>
        </button>
      ` : `
        <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'out_for_delivery')" style="background:#a855f7; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 10px rgba(168, 85, 247, 0.3);">
          <span>🛵</span>
          <span>إرسال للتوصيل (مع الطيار)</span>
        </button>
      `;
    } else if (status === 'out_for_delivery') {
      nextActionBtnHtml = `
        <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'delivered')" style="background:#16a34a; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 12px rgba(22, 163, 74, 0.35);">
          <span>✅</span>
          <span>تم التسليم بنجاح (نقل للأرشيف)</span>
        </button>
      `;
    }

    const itemsHtml = (o.items || []).map(it => `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; font-size:12.5px; padding:6px 0; border-bottom:1px dashed var(--border);">
        <div style="flex:1; padding-left:8px; min-width:0;">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="font-weight:900; background:var(--primary-subtle); color:var(--primary); padding:1px 6px; border-radius:4px; font-size:11px;">${it.qty}x</span>
            <span style="font-weight:800; color:var(--text-main);">${it.name}</span>
            ${it.selectedSize ? `<span style="font-size:10.5px; background:var(--surface); border:1px solid var(--border); color:var(--text-muted); padding:1px 5px; border-radius:4px;">${it.selectedSize.name}</span>` : ''}
          </div>
          ${it.selectedAddons && it.selectedAddons.length ? `
            <div style="font-size:11px; color:var(--accent-wa); margin-top:2px;">
              + إضافات: ${it.selectedAddons.map(a => a.name).join('، ')}
            </div>
          ` : ''}
          ${it.notes ? `
            <div style="font-size:11px; color:#f59e0b; margin-top:3px; background:rgba(245, 158, 11, 0.08); padding:2px 6px; border-radius:4px;">
              📝 ملاحظة: ${it.notes}
            </div>
          ` : ''}
        </div>
        <div class="font-num" style="font-weight:800; color:var(--text-main); white-space:nowrap; flex-shrink:0;">
          ${((it.price || 0) * it.qty).toFixed(2)} ${currency}
        </div>
      </div>
    `).join('');

    const phoneRaw = (o.customer?.phone || '').replace(/[^0-9]/g, '');
    const waUrl = phoneRaw ? `https://wa.me/${phoneRaw.startsWith('0') ? '2' + phoneRaw : phoneRaw}?text=${encodeURIComponent(`مرحباً أستاذ ${o.customer?.name || ''}، بخصوص طلبك رقم ${safeOrderId} من المطعم`)}` : '#';
    const telUrl = phoneRaw ? `tel:${phoneRaw}` : '#';
    const isWalletPayment = o.paymentMethod === 'wallet';

    return `
      <div class="order-card-pro" data-order-id="${safeOrderId}">
        
        <!-- Header: Order ID, Time, Progression Action & Status Sheet Trigger -->
        <div class="order-card-header-row">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="order-id-chip font-num">${safeOrderId}</span>
            ${o.orderType === 'dine_in' ? `
              <span class="order-type-tag order-type-dinein">🍽️ صالة (طاولة ${o.tableNumber || 1})</span>
            ` : (o.orderType === 'takeaway' ? `
              <span class="order-type-tag order-type-takeaway">🥡 سفري</span>
            ` : `
              <span class="order-type-tag order-type-delivery">🛵 ديليفري</span>
            `)}
            <span class="order-time-chip">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${timeStr}
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            ${nextActionBtnHtml}

            <!-- Instant Thermal Print Button -->
            <button type="button" class="btn btn-ghost btn-sm" onclick="printOrderReceipt('${safeOrderId}')" style="padding:5px 9px; font-size:11px; font-weight:800; border:1px solid var(--border); color:var(--text-main); background:var(--surface-raised); display:inline-flex; align-items:center; gap:4px;" title="طباعة بون الفاتورة الحرارية">
              <span>🖨️</span>
              <span>طباعة</span>
            </button>

            <!-- Custom Status Sheet Trigger -->
            <button type="button" class="order-status-trigger-btn font-num" style="background:${statusBadge.bg}; color:${statusBadge.color}; border:1px solid ${statusBadge.borderColor};" onclick="openStatusSheet('${safeOrderId}', '${status}')">
              <span>${statusBadge.text}</span>
              <span style="font-size:10px; margin-right:2px; opacity:0.8;">▾</span>
            </button>

            <!-- Delete Button -->
            <button type="button" class="btn-order-delete-chic" onclick="confirmDeleteOrder('${safeOrderId}')" title="حذف هذا الطلب نهائياً" aria-label="حذف الطلب">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body: Responsive Columns (Customer Details & Items Summary) -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px; width:100%; box-sizing:border-box;">
          
          <!-- Column 1: Customer & Delivery Info -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:6px; display:flex; align-items:center; gap:5px;">
                <span>👤</span> بيانات العميل والتوصيل:
              </div>
              
              <div style="font-size:14px; font-weight:900; color:var(--text-main); margin-bottom:6px; word-break:break-word;">
                ${o.customer?.name || 'عميل'}
              </div>

              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; flex-wrap:wrap;">
                <span class="font-num" style="font-size:12.5px; font-weight:800; color:var(--text-main); background:var(--surface-raised); padding:3px 8px; border-radius:4px; border:1px solid var(--border);">
                  ${o.customer?.phone || 'بدون هاتف'}
                </span>
                ${phoneRaw ? `
                  <a href="${telUrl}" class="btn btn-ghost btn-sm" style="padding:3px 8px; font-size:11px; font-weight:700;" title="اتصال بالعميل">
                    📞 اتصال
                  </a>
                  <a href="${waUrl}" target="_blank" class="btn btn-ghost btn-sm" style="padding:3px 8px; font-size:11px; color:var(--accent-wa); font-weight:800;" title="محادثة واتساب">
                    💬 واتساب
                  </a>
                ` : ''}
              </div>

              <div style="font-size:12px; color:var(--text-body); line-height:1.45; margin-bottom:6px; background:var(--surface-raised); padding:6px 10px; border-radius:6px; word-break:break-word;">
                <span style="font-weight:800; color:var(--text-main);">📍 العنوان: </span>
                ${o.customer?.address || 'استلام من المطعم'}
              </div>

              ${(parseFloat(o.deliveryFee) > 0 || o.deliveryZone) ? `
                <div style="font-size:11.5px; color:var(--primary); background:var(--primary-subtle); padding:4px 8px; border-radius:6px; margin-bottom:6px; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
                  <span>خدمة التوصيل (${o.deliveryZone || 'السعر الموحد'}):</span>
                  <span class="font-num">+${(parseFloat(o.deliveryFee) || 0).toFixed(2)} ${currency}</span>
                </div>
              ` : ''}

              ${o.customer?.notes ? `
                <div style="font-size:11.5px; color:#f59e0b; background:rgba(245, 158, 11, 0.08); border:1px dashed rgba(245, 158, 11, 0.3); padding:6px 10px; border-radius:6px; margin-top:4px; word-break:break-word;">
                  <span style="font-weight:800;">📝 ملاحظات: </span>
                  ${o.customer.notes}
                </div>
              ` : ''}
            </div>

            <!-- Payment Info Badge -->
            <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
              <span style="font-size:11.5px; font-weight:800; color:var(--text-muted);">طريقة الدفع:</span>
              <span style="font-size:11.5px; font-weight:800; padding:3px 8px; border-radius:6px; ${isWalletPayment ? 'background:rgba(59, 130, 246, 0.12); color:#3b82f6;' : 'background:rgba(34, 197, 94, 0.12); color:#22c55e;'}">
                ${isWalletPayment ? '💳 فودافون كاش / إنستاباي' : '💵 نقداً عند الاستلام (COD)'}
              </span>
            </div>
          </div>

          <!-- Column 2: Order Items & Total -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:6px; display:flex; align-items:center; gap:5px;">
                <span>🍽️</span> محتويات الطلب:
              </div>

              <div style="max-height:150px; overflow-y:auto; padding-right:2px;">
                ${itemsHtml}
              </div>
            </div>

            <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border);">
              <!-- Total summary row -->
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12.5px; font-weight:800; color:var(--text-muted);">المبلغ المطلوب:</span>
                <span class="font-num" style="font-size:16px; font-weight:900; color:var(--primary);">
                  ${(parseFloat(o.finalTotal) || 0).toFixed(2)} ${currency}
                </span>
              </div>

              <!-- Payment Receipt interactive widget if uploaded -->
              ${o.receiptUrl ? `
                <div style="margin-top:8px; background:var(--surface-raised); border:1px solid var(--border); border-radius:6px; padding:6px 10px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                  <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                    <img src="${o.receiptUrl}" alt="Receipt" style="width:36px; height:36px; border-radius:4px; object-fit:cover; border:1px solid var(--border); cursor:pointer; flex-shrink:0;" onclick="openReceiptModalByOrderId('${o.id || o.orderId}')">
                    <div style="min-width:0;">
                      <div style="font-size:11px; font-weight:800; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📸 إيصال التحويل</div>
                      <div style="font-size:10px; color:var(--accent-wa); font-weight:700;">تم الرفع ✓</div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" onclick="openReceiptModalByOrderId('${o.id || o.orderId}')" style="padding:4px 8px; font-size:10.5px; font-weight:800; white-space:nowrap; flex-shrink:0;">
                    🔍 معاينة
                  </button>
                </div>
              ` : ''}
            </div>

          </div>

        </div>

      </div>
    `;
  }).join('');
};

// ═══ 2. INVOICES & DELIVERED ORDERS ARCHIVE ENGINE ═══════════
window.renderInvoicesArchive = function(orders = null) {
  if (!adminElements.adminArchiveContainer) return;
  if (orders === null || orders === undefined) {
    orders = Store.getOrders();
  }
  const currency = Store.getSettings().currency || "ج.م";

  // Archived orders are delivered or cancelled
  const isOrderArchived = (o) => o.status === 'delivered' || o.status === 'cancelled';
  const allArchived = orders.filter(isOrderArchived);

  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (parseFloat(o.finalTotal) || 0), 0);

  // Update Archive Header Statistics
  if (adminElements.statArchivedOrders) adminElements.statArchivedOrders.textContent = deliveredOrders.length;
  if (adminElements.statArchivedRevenue) adminElements.statArchivedRevenue.textContent = `${deliveredRevenue.toFixed(0)} ${currency}`;
  if (adminElements.statCancelledOrders) adminElements.statCancelledOrders.textContent = cancelledOrders.length;

  if (adminElements.archiveBadgeCount) {
    if (allArchived.length > 0) {
      adminElements.archiveBadgeCount.textContent = allArchived.length;
      adminElements.archiveBadgeCount.style.display = 'inline-block';
    } else {
      adminElements.archiveBadgeCount.style.display = 'none';
    }
  }

  // Filter according to status chip
  let displayArchived = allArchived;
  if (currentArchiveFilter === 'delivered') {
    displayArchived = deliveredOrders;
  } else if (currentArchiveFilter === 'cancelled') {
    displayArchived = cancelledOrders;
  } else if (currentArchiveFilter === 'dine_in') {
    displayArchived = allArchived.filter(o => o.orderType === 'dine_in');
  } else if (currentArchiveFilter === 'takeaway') {
    displayArchived = allArchived.filter(o => o.orderType === 'takeaway');
  } else if (currentArchiveFilter === 'delivery') {
    displayArchived = allArchived.filter(o => !o.orderType || o.orderType === 'delivery');
  }

  // Filter according to search query
  if (archiveSearchQuery) {
    displayArchived = displayArchived.filter(o => {
      const id = String(o.orderId || o.id || o._fbKey || '').toLowerCase();
      const name = String(o.customer?.name || '').toLowerCase();
      const phone = String(o.customer?.phone || '').replace(/[^0-9]/g, '');
      const addr = String(o.customer?.address || '').toLowerCase();
      return id.includes(archiveSearchQuery) || name.includes(archiveSearchQuery) || phone.includes(archiveSearchQuery) || addr.includes(archiveSearchQuery);
    });
  }

  // Signature check
  const currentArchiveSig = JSON.stringify({
    filter: currentArchiveFilter,
    query: archiveSearchQuery,
    orders: displayArchived.map(o => ({ id: o.orderId, st: o.status, tot: o.finalTotal, rec: o.receiptUrl }))
  });
  if (lastRenderedArchiveSignature === currentArchiveSig && adminElements.adminArchiveContainer.children.length > 0) {
    return;
  }
  lastRenderedArchiveSignature = currentArchiveSig;

  if (displayArchived.length === 0) {
    adminElements.adminArchiveContainer.innerHTML = `
      <div style="text-align:center; padding:45px 20px; color:var(--text-muted); background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-md);">
        <div style="font-size:38px; margin-bottom:12px;">📁</div>
        <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:4px;">لا توجد فواتير مطابقة في الأرشيف</div>
        <div style="font-size:12.5px; color:var(--text-muted);">كافة الطلبات التي تكتمل وتصل لحالة (تم التسليم) أو تُلغى ستُحفظ هنا تلقائياً.</div>
      </div>
    `;
    return;
  }

  adminElements.adminArchiveContainer.innerHTML = displayArchived.map(o => {
    const safeOrderId = o.orderId || o.id || o._fbKey || (`#ORD-${(o.timestamp || Date.now()).toString().slice(-4)}`);
    const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'الآن';
    const isDelivered = o.status === 'delivered';

    const itemsHtml = (o.items || []).map(it => `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; font-size:12px; padding:5px 0; border-bottom:1px dashed var(--border);">
        <div style="flex:1; padding-left:8px; min-width:0;">
          <span style="font-weight:900; background:var(--primary-subtle); color:var(--primary); padding:1px 5px; border-radius:4px; font-size:10.5px;">${it.qty}x</span>
          <span style="font-weight:800; color:var(--text-main);">${it.name}</span>
          ${it.selectedSize ? `<span style="font-size:10px; color:var(--text-muted);">(${it.selectedSize.name})</span>` : ''}
          ${it.selectedAddons && it.selectedAddons.length ? `<span style="font-size:10px; color:var(--accent-wa);">+ ${it.selectedAddons.map(a => a.name).join('، ')}</span>` : ''}
        </div>
        <div class="font-num" style="font-weight:800; color:var(--text-main); white-space:nowrap; flex-shrink:0;">
          ${((it.price || 0) * it.qty).toFixed(2)} ${currency}
        </div>
      </div>
    `).join('');

    const phoneRaw = (o.customer?.phone || '').replace(/[^0-9]/g, '');
    const waUrl = phoneRaw ? `https://wa.me/${phoneRaw.startsWith('0') ? '2' + phoneRaw : phoneRaw}?text=${encodeURIComponent(`مرحباً أستاذ ${o.customer?.name || ''}، بخصوص فاتورتك رقم ${safeOrderId} من المطعم`)}` : '#';
    const telUrl = phoneRaw ? `tel:${phoneRaw}` : '#';
    const isWalletPayment = o.paymentMethod === 'wallet';

    return `
      <div class="order-card-pro" data-order-id="${safeOrderId}" style="opacity:${isDelivered ? '1' : '0.85'}; border-color:${isDelivered ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'};">
        
        <!-- Header: Order ID, Time, Archive Badge, Reprint & Reopen Actions -->
        <div class="order-card-header-row">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="order-id-chip font-num">${safeOrderId}</span>
            ${o.orderType === 'dine_in' ? `
              <span class="order-type-tag order-type-dinein">🍽️ صالة (طاولة ${o.tableNumber || 1})</span>
            ` : (o.orderType === 'takeaway' ? `
              <span class="order-type-tag order-type-takeaway">🥡 سفري</span>
            ` : `
              <span class="order-type-tag order-type-delivery">🛵 ديليفري</span>
            `)}
            <span class="order-time-chip">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${timeStr}
            </span>
            <span style="font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px; ${isDelivered ? 'background:rgba(34, 197, 94, 0.12); color:#22c55e; border:1px solid rgba(34, 197, 94, 0.3);' : 'background:rgba(239, 68, 68, 0.12); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.3);'}">
              ${isDelivered ? 'تم التسليم بنجاح ✅' : 'ملغي ✕'}
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <!-- Instant Thermal Print Button -->
            <button type="button" class="btn btn-ghost btn-sm" onclick="printOrderReceipt('${safeOrderId}')" style="padding:5px 9px; font-size:11px; font-weight:800; border:1px solid var(--border); color:var(--text-main); background:var(--surface-raised); display:inline-flex; align-items:center; gap:4px;" title="إعادة طباعة بون الفاتورة الحرارية">
              <span>🖨️</span>
              <span>طباعة الفاتورة</span>
            </button>

            <!-- Reopen to Kitchen Button -->
            <button type="button" class="btn btn-ghost btn-sm" onclick="reopenOrderToKitchen('${safeOrderId}')" style="padding:5px 9px; font-size:11px; font-weight:800; border:1px solid var(--border); color:var(--text-main); background:var(--surface-raised); display:inline-flex; align-items:center; gap:4px;" title="إعادة فتح الطلب وإرجاعه لشاشة المطبخ النشطة">
              <span>↩️</span>
              <span>إعادة للمطبخ</span>
            </button>

            <!-- Delete Button -->
            <button type="button" class="btn-order-delete-chic" onclick="confirmDeleteOrder('${safeOrderId}')" title="حذف الفاتورة نهائياً من الأرشيف" aria-label="حذف الفاتورة">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body: Responsive Columns -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px; width:100%; box-sizing:border-box;">
          
          <!-- Column 1: Customer & Delivery Info -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:6px;">
                <span>👤</span> العميل: <span style="font-size:13.5px; font-weight:900; color:var(--text-main);">${o.customer?.name || 'عميل'}</span>
              </div>

              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; flex-wrap:wrap;">
                <span class="font-num" style="font-size:12px; font-weight:800; color:var(--text-main); background:var(--surface-raised); padding:2px 7px; border-radius:4px; border:1px solid var(--border);">
                  ${o.customer?.phone || 'بدون هاتف'}
                </span>
                ${phoneRaw ? `
                  <a href="${telUrl}" class="btn btn-ghost btn-sm" style="padding:2px 6px; font-size:10.5px; font-weight:700;">📞 اتصال</a>
                  <a href="${waUrl}" target="_blank" class="btn btn-ghost btn-sm" style="padding:2px 6px; font-size:10.5px; color:var(--accent-wa); font-weight:800;">💬 واتساب</a>
                ` : ''}
              </div>

              <div style="font-size:11.5px; color:var(--text-body); line-height:1.4; margin-bottom:6px; background:var(--surface-raised); padding:5px 8px; border-radius:6px;">
                <span style="font-weight:800; color:var(--text-main);">📍 العنوان: </span>
                ${o.customer?.address || 'استلام من المطعم'}
              </div>

              ${(parseFloat(o.deliveryFee) > 0 || o.deliveryZone) ? `
                <div style="font-size:11px; color:var(--primary); background:var(--primary-subtle); padding:3px 7px; border-radius:5px; margin-bottom:4px; font-weight:800; display:flex; justify-content:space-between;">
                  <span>خدمة التوصيل (${o.deliveryZone || 'السعر الموحد'}):</span>
                  <span class="font-num">+${(parseFloat(o.deliveryFee) || 0).toFixed(2)} ${currency}</span>
                </div>
              ` : ''}
            </div>

            <div style="margin-top:8px; padding-top:6px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted);">
              <span>طريقة الدفع:</span>
              <span style="font-weight:800; color:var(--text-main);">${isWalletPayment ? '💳 إلكتروني (محفظة)' : '💵 نقداً (COD)'}</span>
            </div>

            <!-- Payment Receipt interactive widget in Archive if uploaded -->
            ${o.receiptUrl ? `
              <div style="margin-top:8px; background:var(--surface-raised); border:1px solid var(--border); border-radius:6px; padding:6px 10px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                  <img src="${o.receiptUrl}" alt="Receipt" style="width:36px; height:36px; border-radius:4px; object-fit:cover; border:1px solid var(--border); cursor:pointer; flex-shrink:0;" onclick="openReceiptModalByOrderId('${o.id || o.orderId}')">
                  <div style="min-width:0;">
                    <div style="font-size:11px; font-weight:800; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📸 إيصال التحويل</div>
                    <div style="font-size:10px; color:var(--accent-wa); font-weight:700;">مرفق مع الطلب ✓</div>
                  </div>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="openReceiptModalByOrderId('${o.id || o.orderId}')" style="padding:4px 8px; font-size:10.5px; font-weight:800; white-space:nowrap; flex-shrink:0;">
                  🔍 معاينة
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Column 2: Items & Financial Total -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:5px;">🍽️ الأصناف:</div>
              <div style="max-height:130px; overflow-y:auto; padding-right:2px;">
                ${itemsHtml}
              </div>
            </div>

            <div style="margin-top:8px; padding-top:6px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:800; color:var(--text-muted);">إجمالي الفاتورة:</span>
              <span class="font-num" style="font-size:16px; font-weight:900; color:${isDelivered ? '#16a34a' : 'var(--danger)'};">
                ${(parseFloat(o.finalTotal) || 0).toFixed(2)} ${currency}
              </span>
            </div>
          </div>

        </div>

      </div>
    `;
  }).join('');
};

window.playKitchenOrderChime = playKitchenOrderChime;
window.showAdminOrderNotification = showAdminOrderNotification;
