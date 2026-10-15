// ═══════════════════════════════════════════════════════════
// HarpyOrder — Kitchen KDS, Orders & Invoice Archive Manager
// ═══════════════════════════════════════════════════════════

let lastKnownOrderIds = null;

const esc = (str) => {
  if (typeof window.escapeHtml === 'function') return window.escapeHtml(str);
  if (typeof Store !== 'undefined' && typeof Store.escapeHtml === 'function') return Store.escapeHtml(str);
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

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
      const title = `طلب جديد ${newOrder.orderId}`;
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

  // Lookup real current order and fulfillment details
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
  const fInfo = parseOrderFulfillment(currentOrder);

  // Dynamically update tile labels & descriptions to match fulfillment type
  const tilePending = document.querySelector('.status-option-tile[data-status="pending"]');
  if (tilePending) {
    const nameEl = tilePending.querySelector('.status-option-name');
    const descEl = tilePending.querySelector('.status-option-desc');
    if (nameEl) nameEl.textContent = fInfo.isDineIn ? '1. استلام وتسجيل الطلب' : (fInfo.isTakeaway ? '1. استلام الطلب بالفرع' : '1. استلام وتأكيد الطلب');
    if (descEl) descEl.textContent = fInfo.isDineIn ? `الطلب وصل لمطبخ الصالة لطاولة (${fInfo.tableNumber || '1'})` : (fInfo.isTakeaway ? 'الطلب مسجل للاستلام المباشر من الكاونتر' : 'الطلب وصل المطعم وقيد المراجعة');
  }

  const tilePrep = document.querySelector('.status-option-tile[data-status="preparing"]');
  if (tilePrep) {
    const nameEl = tilePrep.querySelector('.status-option-name');
    const descEl = tilePrep.querySelector('.status-option-desc');
    if (nameEl) nameEl.textContent = fInfo.isDineIn ? '2. قيد الطهي والتحضير بالمطبخ' : (fInfo.isTakeaway ? '2. تجهيز وتعليب الوجبات' : '2. قيد التجهيز في المطبخ');
    if (descEl) descEl.textContent = fInfo.isDineIn ? 'طهاة المطعم يجهزون وجبات الطاولة الآن' : (fInfo.isTakeaway ? 'جاري تحضير وتغليف الطلب طازجاً بعناية' : 'طهاة المطعم بدأوا في تجهيز وطهي الوجبات');
  }

  const tileDelivery = document.querySelector('.status-option-tile[data-status="out_for_delivery"]');
  if (tileDelivery) {
    const nameEl = tileDelivery.querySelector('.status-option-name');
    const descEl = tileDelivery.querySelector('.status-option-desc');
    if (nameEl) nameEl.textContent = fInfo.isDineIn ? `3. تقديم لطاولة ${fInfo.tableNumber || '1'}` : (fInfo.isTakeaway ? '3. جاهز للاستلام بالفرع' : '3. مع الكابتن في الطريق');
    if (descEl) descEl.textContent = fInfo.isDineIn ? `الوجبات جاهزة ويتم تقديمها لطاولة رقم ${fInfo.tableNumber || '1'}` : (fInfo.isTakeaway ? 'الطلب جاهز على كاونتر الاستلام بانتظار العميل' : 'الكابتن استلم الطلب وهو في الطريق لعنوان العميل');
  }

  const tileDelivered = document.querySelector('.status-option-tile[data-status="delivered"]');
  if (tileDelivered) {
    const nameEl = tileDelivered.querySelector('.status-option-name');
    const descEl = tileDelivered.querySelector('.status-option-desc');
    if (nameEl) nameEl.textContent = fInfo.isDineIn ? '4. تم التقديم بالهناء والشفاء' : (fInfo.isTakeaway ? '4. تم الاستلام بالفرع' : '4. تم التوصيل بنجاح');
    if (descEl) descEl.textContent = fInfo.isDineIn ? 'تم إنهاء الخدمة وتقديم الطلب بالكامل للزبون' : (fInfo.isTakeaway ? 'قام العميل باستلام طلبه بنجاح من الفرع' : 'تم تسليم الوجبات بنجاح إلى باب العميل');
  }

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

  const orders = Store.getOrders();
  const cleanId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');
  const currentOrder = orders.find(o => 
    o.orderId === orderId || 
    o.orderId === `#${cleanId}` || 
    o._fbKey === orderId || 
    o.id === orderId ||
    (o.orderId && String(o.orderId).replace(/[^a-zA-Z0-9_-]/g, '') === cleanId)
  );
  const fInfo = parseOrderFulfillment(currentOrder);

  // 1. Optimistic in-place DOM update (0ms)
  let stage3Text = '3. في الطريق إليك';
  if (fInfo.isDineIn) stage3Text = '3. تقديم للطاولة';
  else if (fInfo.isTakeaway) stage3Text = '3. جاهز بالفرع';

  const statusBadgeMap = {
    pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب' },
    preparing: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', text: '2. قيد التجهيز' },
    out_for_delivery: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)', text: stage3Text },
    delivered: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)', text: '4. تم التسليم' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', text: 'تم الإلغاء' }
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
      showToastNotification('تم تفعيل إبقاء الشاشة مضاءة دائماً', 'success');
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
    await releaseKitchenWakeLock(false);
  } else {
    await requestKitchenWakeLock(false);
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

window.showCustomConfirm = function({ title, message, icon = '', confirmText = 'تأكيد الحذف', cancelText = 'إلغاء', isDanger = true }) {
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
    if (iconEl) if (icon) iconEl.textContent = icon; else iconEl.innerHTML = '<svg class="icon" viewBox="0 0 24 24" style="width:28px; height:28px;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>';
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
    btn.textContent = "جاري التحقق";
  }

  try {
    const slug = Store.getRestaurantSlug();
    const isVerified = await window.verifyAdminCredentials(enteredPassword, slug);

    if (isVerified) {
      const orderIdToDelete = pendingDeleteOrderId;
      const cleanId = String(orderIdToDelete).replace(/[^a-zA-Z0-9_-]/g, '');

      // 1. Instant 0ms Visual Removal from DOM
      const cards = document.querySelectorAll(
        `[data-order-id="${orderIdToDelete}"], [data-order-id="${cleanId}"], [data-order-id="#${cleanId}"]`
      );
      cards.forEach(card => {
        card.style.transition = 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.92)';
        setTimeout(() => { if (card.parentNode) card.remove(); }, 180);
      });

      // 2. Close modal immediately (0ms)
      closeArchivePwdModal();

      // 3. Instant local store purge & background cloud delete
      Store.deleteOrder(orderIdToDelete);

      // 4. Instant UI re-render
      renderOrdersList();
      renderInvoicesArchive();

      if (typeof showToastNotification === 'function') {
        showToastNotification("تم حذف الطلب نهائياً وبشكل فوري", "success");
      }
    } else {
      if (err) {
        err.textContent = "كلمة المرور غير صحيحة! تم منع حذف الفاتورة.";
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
      btn.textContent = "تأكيد الحذف";
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

// ── Fulfillment Type Parser & Normalizer Engine ──────────────
function parseOrderFulfillment(o) {
  if (!o) return { type: 'delivery', tableNumber: null, badgeText: 'توصيل دليفري', tagClass: 'order-type-delivery', isDineIn: false, isTakeaway: false, isDelivery: true };

  const fType = String(o.fulfillmentType || o.orderType || '').toLowerCase();
  const addr = String(o.customer?.address || '').toLowerCase();
  const zone = String(o.deliveryZone || '').toLowerCase();

  let tableNumber = o.tableNumber || o.customer?.tableNumber || null;
  if (!tableNumber) {
    const match = (addr + ' ' + zone).match(/(?:طاولة|طاولة رقم|table)\s*([0-9A-Za-z\u0660-\u0669]+)/i);
    if (match) tableNumber = match[1];
  }

  const isDineIn = fType === 'dinein' || fType === 'dine_in' || addr.includes('صالة') || addr.includes('طاولة') || zone.includes('طاولة') || zone.includes('صالة');
  const isTakeaway = !isDineIn && (fType === 'takeaway' || addr.includes('استلام') || addr.includes('تيك أواي') || addr.includes('سفري') || zone.includes('استلام') || zone.includes('تيك أواي'));
  const isDelivery = !isDineIn && !isTakeaway;

  if (isDineIn) {
    const tblDisplay = tableNumber ? `طاولة ${tableNumber}` : 'صالة';
    return {
      type: 'dine_in',
      tableNumber: tableNumber || '1',
      badgeText: `داخل المطعم (${tblDisplay})`,
      tagClass: 'order-type-dinein',
      isDineIn: true,
      isTakeaway: false,
      isDelivery: false
    };
  }

  if (isTakeaway) {
    return {
      type: 'takeaway',
      tableNumber: null,
      badgeText: 'استلام من الفرع (تيك أواي)',
      tagClass: 'order-type-takeaway',
      isDineIn: false,
      isTakeaway: true,
      isDelivery: false
    };
  }

  return {
    type: 'delivery',
    tableNumber: null,
    badgeText: 'توصيل دليفري',
    tagClass: 'order-type-delivery',
    isDineIn: false,
    isTakeaway: false,
    isDelivery: true
  };
}
window.parseOrderFulfillment = parseOrderFulfillment;

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
  const fInfo = parseOrderFulfillment(order);
  const orderTypeTitle = fInfo.isDineIn
    ? `طلب صالة — طاولة رقم (${fInfo.tableNumber})`
    : (fInfo.isTakeaway
        ? `طلب سفري (تيك أواي) — استلام من الفرع`
        : `طلب توصيل منزلي (دليفري)`);

  let customerInfoBlock = '';
  if (fInfo.isDineIn) {
    customerInfoBlock = `
      <div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>نوع الطلب:</strong> صالة — طاولة رقم (${esc(fInfo.tableNumber)})</div>
      ${order.customer?.name ? `<div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>اسم العميل:</strong> ${esc(order.customer.name)}</div>` : ''}
      ${order.customer?.phone && order.customer?.phone !== 'داخلي' ? `<div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>الهاتف:</strong> <span style="direction:ltr; display:inline-block;">${esc(order.customer.phone)}</span></div>` : ''}
    `;
  } else if (fInfo.isTakeaway) {
    customerInfoBlock = `
      <div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>نوع الطلب:</strong> سفري (استلام من الفرع)</div>
      <div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>العميل:</strong> ${esc(order.customer?.name || 'عميل نقدي')}</div>
      ${order.customer?.phone && order.customer?.phone !== 'داخلي' ? `<div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>الهاتف:</strong> <span style="direction:ltr; display:inline-block;">${esc(order.customer.phone)}</span></div>` : ''}
    `;
  } else {
    customerInfoBlock = `
      <div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>نوع الطلب:</strong> توصيل منزلي (دليفري)</div>
      <div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>العميل:</strong> ${esc(order.customer?.name || 'عميل نقدي')}</div>
      ${order.customer?.phone && order.customer?.phone !== 'داخلي' ? `<div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>الهاتف:</strong> <span style="direction:ltr; display:inline-block;">${esc(order.customer.phone)}</span></div>` : ''}
      ${order.customer?.address ? `<div style="font-size:12px; margin-bottom:3px; color:#374151;"><strong>العنوان:</strong> ${esc(order.customer.address)}</div>` : ''}
    `;
  }
  if (order.customer?.notes) {
    customerInfoBlock += `<div style="font-size:12px; margin-top:3px; color:#b45309;"><strong>ملاحظات:</strong> ${esc(order.customer.notes)}</div>`;
  }

  // Items Rows (ZERO emojis)
  const itemsRows = (order.items || []).map(it => `
    <tr>
      <td style="text-align:right; padding:6px 0; border-bottom:1px dotted #e5e7eb; vertical-align:top;">
        <div style="font-weight:800; font-size:12.5px; color:#111827;">
          ${esc(it.name)}${it.selectedSize ? ` <span style="font-weight:600; font-size:11px; color:#6b7280;">(${esc(it.selectedSize.name)})</span>` : ''}
        </div>
        ${it.selectedAddons && it.selectedAddons.length ? `<div style="color:#4b5563; font-size:10.5px; font-weight:600; margin-top:2px;">+ ${it.selectedAddons.map(a => esc(a.name)).join('، ')}</div>` : ''}
        ${it.notes ? `<div style="color:#b45309; font-weight:600; font-size:10.5px; margin-top:2px;">ملاحظة: ${esc(it.notes)}</div>` : ''}
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

  const fInfo = parseOrderFulfillment(order);
  const orderTypeTitle = fInfo.isDineIn
    ? `طلب صالة — طاولة رقم (${fInfo.tableNumber})`
    : (fInfo.isTakeaway
        ? `طلب سفري (تيك أواي) — استلام من الفرع`
        : `طلب توصيل منزلي (دليفري)`);

  let customerInfoBlock = '';
  if (fInfo.isDineIn) {
    customerInfoBlock = `
      <div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>نوع الطلب:</strong> صالة — طاولة رقم (${esc(fInfo.tableNumber)})</div>
      ${order.customer?.name ? `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>اسم العميل:</strong> ${esc(order.customer.name)}</div>` : ''}
      ${order.customer?.phone && order.customer?.phone !== 'داخلي' ? `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>الهاتف:</strong> ${esc(order.customer.phone)}</div>` : ''}
    `;
  } else if (fInfo.isTakeaway) {
    customerInfoBlock = `
      <div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>نوع الطلب:</strong> سفري (استلام من الفرع)</div>
      <div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>العميل:</strong> ${esc(order.customer?.name || 'عميل نقدي')}</div>
      ${order.customer?.phone && order.customer?.phone !== 'داخلي' ? `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>الهاتف:</strong> ${esc(order.customer.phone)}</div>` : ''}
    `;
  } else {
    customerInfoBlock = `
      <div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>نوع الطلب:</strong> توصيل منزلي (دليفري)</div>
      <div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>العميل:</strong> ${esc(order.customer?.name || 'عميل نقدي')}</div>
      ${order.customer?.phone && order.customer?.phone !== 'داخلي' ? `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>الهاتف:</strong> ${esc(order.customer.phone)}</div>` : ''}
      ${order.customer?.address ? `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-bottom:2px;"><strong>العنوان:</strong> ${esc(order.customer.address)}</div>` : ''}
    `;
  }
  if (order.customer?.notes) {
    customerInfoBlock += `<div style="font-size:${is58mm ? '9.5px' : '11px'}; margin-top:2px;"><strong>ملاحظات الطلب:</strong> ${esc(order.customer.notes)}</div>`;
  }

  const itemsRows = (order.items || []).map(it => `
    <tr>
      <td style="text-align:right; padding:${is58mm ? '3px 0' : '4px 0'}; border-bottom:1px dotted #ccc; vertical-align:top; word-break:break-word;">
        <div style="font-weight:800; font-size:${is58mm ? '11px' : '12px'}; line-height:1.3;">
          ${esc(it.name)}${it.selectedSize ? ` <span style="font-weight:600; font-size:${is58mm ? '9.5px' : '10.5px'};">(${esc(it.selectedSize.name)})</span>` : ''}
        </div>
        ${it.selectedAddons && it.selectedAddons.length ? `<div style="color:#333; font-size:${is58mm ? '9px' : '10px'}; font-weight:600;">+ ${it.selectedAddons.map(a => esc(a.name)).join('، ')}</div>` : ''}
        ${it.notes ? `<div style="color:#000; font-weight:600; font-size:${is58mm ? '9px' : '10px'}; margin-top:2px;">ملاحظة: ${esc(it.notes)}</div>` : ''}
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
        <span style="font-weight:900;">${esc(String(order.orderId || '').startsWith('#') ? order.orderId : '#' + (order.orderId || ''))}</span>
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
let currentArchiveDatePreset = 'today'; // 'today', 'yesterday', 'week', 'month', 'custom', 'all'
let archiveCustomStartDate = null;
let archiveCustomEndDate = null;

function getOrderTimestamp(o) {
  if (!o) return 0;
  if (typeof o.timestamp === 'number' && !isNaN(o.timestamp)) return o.timestamp;
  if (o.createdAt) {
    const t = new Date(o.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

function isOrderInArchiveDateRange(o) {
  if (currentArchiveDatePreset === 'all') return true;

  const t = getOrderTimestamp(o);
  if (!t) return false;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  if (currentArchiveDatePreset === 'today') {
    return t >= todayStart && t <= todayEnd;
  }

  if (currentArchiveDatePreset === 'yesterday') {
    const yStart = todayStart - 86400000;
    const yEnd = todayStart - 1;
    return t >= yStart && t <= yEnd;
  }

  if (currentArchiveDatePreset === 'week') {
    const weekStart = todayStart - (6 * 86400000);
    return t >= weekStart && t <= todayEnd;
  }

  if (currentArchiveDatePreset === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
    return t >= monthStart && t <= todayEnd;
  }

  if (currentArchiveDatePreset === 'custom') {
    let fromMs = 0;
    let toMs = Infinity;
    if (archiveCustomStartDate) {
      const p = archiveCustomStartDate.split('-');
      if (p.length === 3) {
        fromMs = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]), 0, 0, 0, 0).getTime();
      }
    }
    if (archiveCustomEndDate) {
      const p = archiveCustomEndDate.split('-');
      if (p.length === 3) {
        toMs = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]), 23, 59, 59, 999).getTime();
      }
    }
    return t >= fromMs && t <= toMs;
  }

  return true;
}

window.setArchiveDatePreset = function(preset) {
  currentArchiveDatePreset = preset;

  const customBox = document.getElementById('archive-custom-date-box');
  if (customBox) {
    customBox.style.display = preset === 'custom' ? 'block' : 'none';
  }

  document.querySelectorAll('.btn-date-preset').forEach(b => {
    b.classList.toggle('active', b.dataset.preset === preset);
  });

  updateArchiveDateRangeLabel();
  renderInvoicesArchive();
};

window.toggleArchiveCustomDates = function() {
  const customBox = document.getElementById('archive-custom-date-box');
  if (!customBox) return;
  const isHidden = customBox.style.display === 'none' || !customBox.style.display;
  if (isHidden) {
    window.setArchiveDatePreset('custom');
  } else {
    window.setArchiveDatePreset('today');
  }
};

window.applyCustomArchiveDateRange = function() {
  const startInput = document.getElementById('archive-custom-start');
  const endInput = document.getElementById('archive-custom-end');
  archiveCustomStartDate = startInput ? startInput.value : null;
  archiveCustomEndDate = endInput ? endInput.value : null;

  if (!archiveCustomStartDate && !archiveCustomEndDate) {
    showToastNotification("يرجى اختيار تاريخ للبحث", "warning");
    return;
  }

  currentArchiveDatePreset = 'custom';
  document.querySelectorAll('.btn-date-preset').forEach(b => {
    b.classList.toggle('active', b.dataset.preset === 'custom');
  });

  updateArchiveDateRangeLabel();
  renderInvoicesArchive();
  showToastNotification("تم تطبيق فلترة الفترة المحددة", "success");
};

function updateArchiveDateRangeLabel() {
  const label = document.getElementById('archive-date-range-label');
  if (!label) return;

  const now = new Date();
  const dateOptions = { day: 'numeric', month: 'short' };

  if (currentArchiveDatePreset === 'today') {
    label.textContent = `اليوم (${now.toLocaleDateString('ar-EG', dateOptions)})`;
  } else if (currentArchiveDatePreset === 'yesterday') {
    const yDate = new Date(Date.now() - 86400000);
    label.textContent = `أمس (${yDate.toLocaleDateString('ar-EG', dateOptions)})`;
  } else if (currentArchiveDatePreset === 'week') {
    const wDate = new Date(Date.now() - (6 * 86400000));
    label.textContent = `آخر 7 أيام (من ${wDate.toLocaleDateString('ar-EG', dateOptions)})`;
  } else if (currentArchiveDatePreset === 'month') {
    label.textContent = `هذا الشهر (${now.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })})`;
  } else if (currentArchiveDatePreset === 'custom') {
    if (archiveCustomStartDate && archiveCustomEndDate) {
      label.textContent = `من ${archiveCustomStartDate} إلى ${archiveCustomEndDate}`;
    } else if (archiveCustomStartDate) {
      label.textContent = `منذ ${archiveCustomStartDate}`;
    } else if (archiveCustomEndDate) {
      label.textContent = `حتى ${archiveCustomEndDate}`;
    } else {
      label.textContent = 'فترة مخصصة';
    }
  } else if (currentArchiveDatePreset === 'all') {
    label.textContent = 'جميع الأوقات (كامل الأرشيف)';
  }
}

window.filterKitchenOrders = function(filter) {
  currentKitchenFilter = filter;
  document.querySelectorAll('.btn-filter-kitchen').forEach(b => {
    b.classList.toggle('active', b.dataset.kitchenFilter === filter);
  });
  renderOrdersList();
};

window.advanceOrderStatus = async function(orderId, targetStatus) {
  const statusLabels = {
    preparing: 'المطبخ يجهز الطلب الآن',
    out_for_delivery: 'تم تحديث حالة الطلب إلى المرحلة التالية',
    delivered: 'تم إنهاء الطلب ونقله لأرشيف الفواتير بنجاح'
  };
  await Store.updateOrderStatus(orderId, targetStatus);
  renderOrdersList();
  renderInvoicesArchive();
  showToastNotification(statusLabels[targetStatus] || `تم تحديث حالة الطلب`, 'success');
};

window.reopenOrderToKitchen = async function(orderId) {
  await Store.updateOrderStatus(orderId, 'preparing');
  renderOrdersList();
  renderInvoicesArchive();
  showToastNotification(`تمت إعادة الطلب ${orderId} إلى شاشة المطبخ النشطة بنجاح`, 'success');
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
  if (lastKnownOrderIds !== null) {
    const newIncoming = orders.find(o => (!o.status || o.status === 'pending') && !lastKnownOrderIds.has(o.orderId));
    if (newIncoming) {
      playKitchenOrderChime();
      showAdminOrderNotification(newIncoming);
    }
  }
  lastKnownOrderIds = new Set(orders.map(o => o.orderId));

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
        <div style="margin-bottom:12px; color:var(--text-muted); display:flex; justify-content:center;">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M2 15h10M2 2v6a4 4 0 0 0 4 4v8M10 2v6a4 4 0 0 1-4 4"/></svg>
        </div>
        <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:4px;">المطبخ جاهز ونظيف! لا توجد طلبات جارية حالياً</div>
        <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:16px;">أي طلب جديد يتم إرساله من المنيو سيظهر هنا فورياً ومباشرة مع صوت رنين المطبخ.</div>
        <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('tab-archive', true)" style="font-weight:800; font-size:12px; border:1px solid var(--border);">
          مراجعة أرشيف الفواتير المسلّمة ←
        </button>
      </div>
    `;
    return;
  }

  adminElements.adminOrdersContainer.innerHTML = displayOrders.map(o => {
    const safeOrderId = o.orderId || o.id || o._fbKey || (`#ORD-${(o.timestamp || Date.now()).toString().slice(-4)}`);
    const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'الآن';
    const status = o.status || 'pending';
    const fInfo = parseOrderFulfillment(o);

    let stage3Text = '3. في الطريق إليك';
    if (fInfo.isDineIn) stage3Text = '3. تقديم للطاولة';
    else if (fInfo.isTakeaway) stage3Text = '3. جاهز بالفرع';

    const statusBadge = {
      pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب' },
      preparing: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', text: '2. قيد التجهيز' },
      out_for_delivery: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)', text: stage3Text },
      delivered: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)', text: '4. تم التسليم' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', text: 'تم الإلغاء' }
    }[status] || { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', text: '1. استلام الطلب' };

    // 1-Click Fast Workflow Progression Action Button
    let nextActionBtnHtml = '';
    if (status === 'pending') {
      nextActionBtnHtml = `
        <button type="button" class="btn btn-primary btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'preparing')" style="font-weight:800; padding:6px 14px; font-size:12px; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 10px rgba(234, 88, 12, 0.3);">
          <span>${fInfo.isTakeaway ? 'بدء التجهيز والتعليب' : 'بدء التجهيز بالمطبخ'}</span>
        </button>
      `;
    } else if (status === 'preparing') {
      if (fInfo.isDineIn) {
        nextActionBtnHtml = `
          <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'out_for_delivery')" style="background:#a855f7; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 12px rgba(168, 85, 247, 0.35);">
            <span>جاهز للتقديم لطاولة ${fInfo.tableNumber}</span>
          </button>
        `;
      } else if (fInfo.isTakeaway) {
        nextActionBtnHtml = `
          <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'out_for_delivery')" style="background:#a855f7; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 12px rgba(168, 85, 247, 0.35);">
            <span>جاهز للاستلام بالفرع (على الكاونتر)</span>
          </button>
        `;
      } else {
        nextActionBtnHtml = `
          <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'out_for_delivery')" style="background:#a855f7; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 10px rgba(168, 85, 247, 0.3);">
            <span>إرسال للتوصيل (مع الكابتن)</span>
          </button>
        `;
      }
    } else if (status === 'out_for_delivery') {
      let label = 'تم التوصيل بنجاح (نقل للأرشيف)';
      if (fInfo.isDineIn) label = 'تم التقديم للزبون (نقل للأرشيف)';
      else if (fInfo.isTakeaway) label = 'تم تسليم الطلب بالفرع (نقل للأرشيف)';

      nextActionBtnHtml = `
        <button type="button" class="btn btn-sm" onclick="advanceOrderStatus('${safeOrderId}', 'delivered')" style="background:#16a34a; color:#fff; font-weight:800; padding:6px 14px; font-size:12px; border:none; border-radius:var(--radius-xs); display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 12px rgba(22, 163, 74, 0.35);">
          <span>${label}</span>
        </button>
      `;
    }

    const itemsHtml = (o.items || []).map(it => `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; font-size:12.5px; padding:6px 0; border-bottom:1px dashed var(--border);">
        <div style="flex:1; padding-left:8px; min-width:0;">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="font-weight:900; background:var(--primary-subtle); color:var(--primary); padding:1px 6px; border-radius:4px; font-size:11px;">${it.qty}x</span>
            <span style="font-weight:800; color:var(--text-main);">${esc(it.name)}</span>
            ${it.selectedSize ? `<span style="font-size:10.5px; background:var(--surface); border:1px solid var(--border); color:var(--text-muted); padding:1px 5px; border-radius:4px;">${esc(it.selectedSize.name)}</span>` : ''}
          </div>
          ${it.selectedAddons && it.selectedAddons.length ? `
            <div style="font-size:11px; color:var(--accent-wa); margin-top:2px;">
              + إضافات: ${it.selectedAddons.map(a => esc(a.name)).join('، ')}
            </div>
          ` : ''}
          ${it.notes ? `
            <div style="font-size:11px; color:#f59e0b; margin-top:3px; background:rgba(245, 158, 11, 0.08); padding:2px 6px; border-radius:4px;">
              ملاحظة: ${esc(it.notes)}
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
      <div class="order-card-pro" data-order-id="${esc(safeOrderId)}">
        
        <!-- Header: Order ID, Time, Progression Action & Status Sheet Trigger -->
        <div class="order-card-header-row">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="order-id-chip font-num">${esc(safeOrderId)}</span>
            <span class="order-type-tag ${fInfo.tagClass}">${fInfo.badgeText}</span>
            <span class="order-time-chip">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${timeStr}
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            ${nextActionBtnHtml}

            <!-- Instant Thermal Print Button -->
            <button type="button" class="btn btn-ghost btn-sm" onclick="printOrderReceipt('${safeOrderId}')" style="padding:5px 9px; font-size:11px; font-weight:800; border:1px solid var(--border); color:var(--text-main); background:var(--surface-raised); display:inline-flex; align-items:center; gap:4px;" title="طباعة بون الفاتورة الحرارية">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
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
                بيانات العميل والتوصيل:
              </div>
              
              <div style="font-size:14px; font-weight:900; color:var(--text-main); margin-bottom:6px; word-break:break-word;">
                ${esc(o.customer?.name || 'عميل')}
              </div>

              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; flex-wrap:wrap;">
                <span class="font-num" style="font-size:12.5px; font-weight:800; color:var(--text-main); background:var(--surface-raised); padding:3px 8px; border-radius:4px; border:1px solid var(--border);">
                  ${esc(o.customer?.phone || 'بدون هاتف')}
                </span>
                ${phoneRaw ? `
                  <a href="${telUrl}" class="btn btn-ghost btn-sm" style="padding:3px 8px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px;" title="اتصال بالعميل">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    اتصال
                  </a>
                  <a href="${waUrl}" target="_blank" class="btn btn-ghost btn-sm" style="padding:3px 8px; font-size:11px; color:var(--accent-wa); font-weight:800; display:inline-flex; align-items:center; gap:4px;" title="محادثة واتساب">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    واتساب
                  </a>
                ` : ''}
              </div>

              <div style="font-size:12px; color:var(--text-body); line-height:1.45; margin-bottom:6px; background:var(--surface-raised); padding:6px 10px; border-radius:6px; word-break:break-word;">
                <span style="font-weight:800; color:var(--text-main);">العنوان: </span>
                ${esc(o.customer?.address || 'استلام من المطعم')}
              </div>

              ${(parseFloat(o.deliveryFee) > 0 || o.deliveryZone) ? `
                <div style="font-size:11.5px; color:var(--primary); background:var(--primary-subtle); padding:4px 8px; border-radius:6px; margin-bottom:6px; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
                  <span>خدمة التوصيل (${esc(o.deliveryZone || 'السعر الموحد')}):</span>
                  <span class="font-num">+${(parseFloat(o.deliveryFee) || 0).toFixed(2)} ${currency}</span>
                </div>
              ` : ''}

              ${o.customer?.notes ? `
                <div style="font-size:11.5px; color:#f59e0b; background:rgba(245, 158, 11, 0.08); border:1px dashed rgba(245, 158, 11, 0.3); padding:6px 10px; border-radius:6px; margin-top:4px; word-break:break-word;">
                  <span style="font-weight:800;">ملاحظات: </span>
                  ${esc(o.customer.notes)}
                </div>
              ` : ''}
            </div>

            <!-- Payment Info Badge -->
            <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
              <span style="font-size:11.5px; font-weight:800; color:var(--text-muted);">طريقة الدفع:</span>
              <span style="font-size:11.5px; font-weight:800; padding:3px 8px; border-radius:6px; ${isWalletPayment ? 'background:rgba(59, 130, 246, 0.12); color:#3b82f6;' : 'background:rgba(34, 197, 94, 0.12); color:#22c55e;'}">
                ${isWalletPayment ? 'فودافون كاش / إنستاباي' : 'نقداً عند الاستلام (COD)'}
              </span>
            </div>
          </div>

          <!-- Column 2: Order Items & Total -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:6px; display:flex; align-items:center; gap:5px;">
                محتويات الطلب:
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
                      <div style="font-size:11px; font-weight:800; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">إيصال التحويل</div>
                      <div style="font-size:10px; color:var(--accent-wa); font-weight:700;">تم الرفع</div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" onclick="openReceiptModalByOrderId('${o.id || o.orderId}')" style="padding:4px 8px; font-size:10.5px; font-weight:800; white-space:nowrap; flex-shrink:0;">
                    معاينة
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

  // 1. Filter by Date Range (Default: 'today')
  const dateFiltered = allArchived.filter(o => isOrderInArchiveDateRange(o));

  const deliveredOrders = dateFiltered.filter(o => o.status === 'delivered');
  const cancelledOrders = dateFiltered.filter(o => o.status === 'cancelled');
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (parseFloat(o.finalTotal) || 0), 0);

  // Update Archive Header Statistics for Selected Date Range
  if (adminElements.statArchivedOrders) adminElements.statArchivedOrders.textContent = deliveredOrders.length;
  if (adminElements.statArchivedRevenue) adminElements.statArchivedRevenue.textContent = `${deliveredRevenue.toFixed(0)} ${currency}`;
  if (adminElements.statCancelledOrders) adminElements.statCancelledOrders.textContent = cancelledOrders.length;

  if (adminElements.archiveBadgeCount) {
    if (dateFiltered.length > 0) {
      adminElements.archiveBadgeCount.textContent = dateFiltered.length;
      adminElements.archiveBadgeCount.style.display = 'inline-block';
    } else {
      adminElements.archiveBadgeCount.style.display = 'none';
    }
  }

  // Update date range header label
  if (typeof updateArchiveDateRangeLabel === 'function') {
    updateArchiveDateRangeLabel();
  }

  // Filter according to status chip
  let displayArchived = dateFiltered;
  if (currentArchiveFilter === 'delivered') {
    displayArchived = deliveredOrders;
  } else if (currentArchiveFilter === 'cancelled') {
    displayArchived = cancelledOrders;
  } else if (currentArchiveFilter === 'dine_in') {
    displayArchived = dateFiltered.filter(o => parseOrderFulfillment(o).isDineIn);
  } else if (currentArchiveFilter === 'takeaway') {
    displayArchived = dateFiltered.filter(o => parseOrderFulfillment(o).isTakeaway);
  } else if (currentArchiveFilter === 'delivery') {
    displayArchived = dateFiltered.filter(o => parseOrderFulfillment(o).isDelivery);
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

  // Signature check (includes date preset & custom bounds)
  const currentArchiveSig = JSON.stringify({
    datePreset: currentArchiveDatePreset,
    customStart: archiveCustomStartDate,
    customEnd: archiveCustomEndDate,
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
        <div style="margin-bottom:12px;"><svg class="icon" viewBox="0 0 24 24" style="width:38px; height:38px; color:var(--text-muted);"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
        <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:4px;">لا توجد فواتير في هذه الفترة</div>
        <div style="font-size:12.5px; color:var(--text-muted);">يمكنك اختيار فترة زمنية أخرى أو الضغط على (كل الأوقات) لمراجعة كامل فواتير المطعم.</div>
      </div>
    `;
    return;
  }

  adminElements.adminArchiveContainer.innerHTML = displayArchived.map(o => {
    const rawId = o.orderId || o.id || o._fbKey || (`#ORD-${(o.timestamp || Date.now()).toString().slice(-4)}`);
    const cleanId = String(rawId).replace(/[^a-zA-Z0-9#\-_]/g, '');
    const safeOrderId = cleanId || ('#ORD-' + (o.timestamp || Date.now()).toString().slice(-4));
    const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'الآن';
    const isDelivered = o.status === 'delivered';
    const fInfo = parseOrderFulfillment(o);

    const itemsHtml = (o.items || []).map(it => `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; font-size:12px; padding:5px 0; border-bottom:1px dashed var(--border);">
        <div style="flex:1; padding-left:8px; min-width:0;">
          <span style="font-weight:900; background:var(--primary-subtle); color:var(--primary); padding:1px 5px; border-radius:4px; font-size:10.5px;">${esc(it.qty)}x</span>
          <span style="font-weight:800; color:var(--text-main);">${esc(it.name)}</span>
          ${it.selectedSize ? `<span style="font-size:10px; color:var(--text-muted);">(${esc(it.selectedSize.name)})</span>` : ''}
          ${it.selectedAddons && it.selectedAddons.length ? `<span style="font-size:10px; color:var(--accent-wa);">+ ${it.selectedAddons.map(a => esc(a.name)).join('، ')}</span>` : ''}
        </div>
        <div class="font-num" style="font-weight:800; color:var(--text-main); white-space:nowrap; flex-shrink:0;">
          ${((it.price || 0) * it.qty).toFixed(2)} ${currency}
        </div>
      </div>
    `).join('');

    const phoneRaw = (o.customer?.phone || '').replace(/[^0-9]/g, '');
    const custName = esc(o.customer?.name || 'عميل');
    const custPhone = esc(o.customer?.phone || 'بدون هاتف');
    const custAddress = esc(o.customer?.address || 'استلام من المطعم');
    const deliveryZone = esc(o.deliveryZone || 'السعر الموحد');
    const safeReceiptUrl = (o.receiptUrl && typeof o.receiptUrl === 'string' && o.receiptUrl.startsWith('http')) ? esc(o.receiptUrl) : '';
    const waUrl = phoneRaw ? `https://wa.me/${phoneRaw.startsWith('0') ? '2' + phoneRaw : phoneRaw}?text=${encodeURIComponent(`مرحباً أستاذ ${o.customer?.name || ''}، بخصوص فاتورتك رقم ${safeOrderId} من المطعم`)}` : '#';
    const telUrl = phoneRaw ? `tel:${phoneRaw}` : '#';
    const isWalletPayment = o.paymentMethod === 'wallet';

    return `
      <div class="order-card-pro" data-order-id="${safeOrderId}" style="opacity:${isDelivered ? '1' : '0.85'}; border-color:${isDelivered ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'};">
        
        <!-- Header: Order ID, Time, Archive Badge, Reprint & Reopen Actions -->
        <div class="order-card-header-row">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="order-id-chip font-num">${safeOrderId}</span>
            <span class="order-type-tag ${fInfo.tagClass}">${fInfo.badgeText}</span>
            <span class="order-time-chip">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${timeStr}
            </span>
            <span style="font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px; ${isDelivered ? 'background:rgba(34, 197, 94, 0.12); color:#22c55e; border:1px solid rgba(34, 197, 94, 0.3);' : 'background:rgba(239, 68, 68, 0.12); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.3);'}">
              ${isDelivered ? 'تم التسليم بنجاح' : 'ملغي'}
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <!-- Instant Thermal Print Button -->
            <button type="button" class="btn btn-ghost btn-sm" onclick="printOrderReceipt('${cleanId}')" style="padding:5px 9px; font-size:11px; font-weight:800; border:1px solid var(--border); color:var(--text-main); background:var(--surface-raised); display:inline-flex; align-items:center; gap:4px;" title="إعادة طباعة بون الفاتورة الحرارية">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              <span>طباعة الفاتورة</span>
            </button>

            <!-- Reopen to Kitchen Button -->
            <button type="button" class="btn btn-ghost btn-sm" onclick="reopenOrderToKitchen('${cleanId}')" style="padding:5px 9px; font-size:11px; font-weight:800; border:1px solid var(--border); color:var(--text-main); background:var(--surface-raised); display:inline-flex; align-items:center; gap:4px;" title="إعادة فتح الطلب وإرجاعه لشاشة المطبخ النشطة">
              <span>↩️</span>
              <span>إعادة للمطبخ</span>
            </button>

            <!-- Delete Button -->
            <button type="button" class="btn-order-delete-chic" onclick="confirmDeleteOrder('${cleanId}')" title="حذف الفاتورة نهائياً من الأرشيف" aria-label="حذف الفاتورة">
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
                العميل: <span style="font-size:13.5px; font-weight:900; color:var(--text-main);">${custName}</span>
              </div>

              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; flex-wrap:wrap;">
                <span class="font-num" style="font-size:12px; font-weight:800; color:var(--text-main); background:var(--surface-raised); padding:2px 7px; border-radius:4px; border:1px solid var(--border);">
                  ${custPhone}
                </span>
                ${phoneRaw ? `
                  <a href="${telUrl}" class="btn btn-ghost btn-sm" style="padding:2px 6px; font-size:10.5px; font-weight:700;">اتصال</a>
                  <a href="${waUrl}" target="_blank" class="btn btn-ghost btn-sm" style="padding:2px 6px; font-size:10.5px; color:var(--accent-wa); font-weight:800;">واتساب</a>
                ` : ''}
              </div>

              <div style="font-size:11.5px; color:var(--text-body); line-height:1.4; margin-bottom:6px; background:var(--surface-raised); padding:5px 8px; border-radius:6px;">
                <span style="font-weight:800; color:var(--text-main);">العنوان: </span>
                ${custAddress}
              </div>

              ${(parseFloat(o.deliveryFee) > 0 || o.deliveryZone) ? `
                <div style="font-size:11px; color:var(--primary); background:var(--primary-subtle); padding:3px 7px; border-radius:5px; margin-bottom:4px; font-weight:800; display:flex; justify-content:space-between;">
                  <span>خدمة التوصيل (${deliveryZone}):</span>
                  <span class="font-num">+${(parseFloat(o.deliveryFee) || 0).toFixed(2)} ${currency}</span>
                </div>
              ` : ''}
            </div>

            <div style="margin-top:8px; padding-top:6px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted);">
              <span>طريقة الدفع:</span>
              <span style="font-weight:800; color:var(--text-main);">${isWalletPayment ? 'إلكتروني (محفظة)' : 'نقداً (COD)'}</span>
            </div>

            <!-- Payment Receipt interactive widget in Archive if uploaded -->
            ${safeReceiptUrl ? `
              <div style="margin-top:8px; background:var(--surface-raised); border:1px solid var(--border); border-radius:6px; padding:6px 10px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                  <img src="${safeReceiptUrl}" alt="Receipt" style="width:36px; height:36px; border-radius:4px; object-fit:cover; border:1px solid var(--border); cursor:pointer; flex-shrink:0;" onclick="openReceiptModalByOrderId('${cleanId}')">
                  <div style="min-width:0;">
                    <div style="font-size:11px; font-weight:800; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">إيصال التحويل</div>
                    <div style="font-size:10px; color:var(--accent-wa); font-weight:700;">مرفق مع الطلب</div>
                  </div>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="openReceiptModalByOrderId('${cleanId}')" style="padding:4px 8px; font-size:10.5px; font-weight:800; white-space:nowrap; flex-shrink:0;">
                  معاينة
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Column 2: Items & Financial Total -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); margin-bottom:5px;">الأصناف:</div>
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

// Instant Reactive Repaint on Store Orders Update Event
window.addEventListener('store_orders_updated', (e) => {
  const orders = (e && e.detail) ? e.detail : (typeof Store !== 'undefined' ? Store.getOrders() : null);
  if (typeof window.renderOrdersList === 'function') window.renderOrdersList(orders);
  if (typeof window.renderInvoicesArchive === 'function') window.renderInvoicesArchive(orders);
});

function initArchiveDateInputs() {
  try {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${day}`;
    const s = document.getElementById('archive-custom-start');
    const e = document.getElementById('archive-custom-end');
    if (s && !s.value) s.value = todayStr;
    if (e && !e.value) e.value = todayStr;
    if (typeof updateArchiveDateRangeLabel === 'function') updateArchiveDateRangeLabel();
  } catch(err) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArchiveDateInputs);
} else {
  initArchiveDateInputs();
}
