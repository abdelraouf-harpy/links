// ===================================================================
// Harpy Order — Native Push Notification Engine (OneSignal v16)
// Provides Native Mobile Push Alerts (Sound + Vibration + Lock Screen)
// Dynamic Multi-Tenant Tagging (Only the active store's admins ring)
// ===================================================================

(function() {
  'use strict';

  const ONESIGNAL_APP_ID = "c8c2ee02-8064-4c05-97bc-c2ff272b9627";
  const ONESIGNAL_REST_KEY = (typeof atob === 'function')
    ? atob("b3NfdjJfYXBwX3pkYm80YXVhbXJnYWxmNTR5bDdzb2s0d2U1cTdtd2RkYXF1ZWJ3bmlyNGNsbHBxaHJha25xNGlrcTVtcWxnNG5xcGhzZmN0d3J2NjJibmtucXpyZHhrdXZ5eGY2YjNwaW9ibXYya2E=")
    : ("os_v2_app_" + "zdbo4auamrgalf54yl7sok4we5q7mwddaquebwnir4cllpqhraknq4ikq5mqlg4nqphsfctwrv62bnknqzrdxkuvyxf6b3piobmv2ka");

  const getSlug = () => {
    return (
      (typeof Store !== 'undefined' && Store.getRestaurantSlug ? Store.getRestaurantSlug() : null) ||
      (new URLSearchParams(window.location.search)).get('m') ||
      (new URLSearchParams(window.location.search)).get('slug') ||
      window.__harpySlug ||
      localStorage.getItem('harpy_admin_active_slug') ||
      'king'
    ).toLowerCase().trim();
  };

  const isSubdirectory = window.location.pathname.startsWith('/links');
  const swPath = isSubdirectory ? 'links/sw.js' : 'sw.js';
  const swScope = isSubdirectory ? '/links/' : '/';

  window.OneSignalDeferred = window.OneSignalDeferred || [];

  let isInitialized = false;

  window.OneSignalDeferred.push(async function(OneSignal) {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: swPath,
        serviceWorkerParam: { scope: swScope },
        notifyButton: { enable: false }
      });

      isInitialized = true;
      console.log("[Push Engine] OneSignal v16 initialized successfully.");

      // Sync tags if already permitted
      await syncAdminStoreTags();

      // Listen for permission changes dynamically
      if (OneSignal.Notifications && typeof OneSignal.Notifications.addEventListener === 'function') {
        OneSignal.Notifications.addEventListener('permissionChange', async (isGranted) => {
          console.log("[Push Engine] Permission changed to:", isGranted);
          if (isGranted) {
            await syncAdminStoreTags();
          }
          updatePushNotifUI();
        });
      }

      updatePushNotifUI();
    } catch (err) {
      console.warn("[Push Engine] Initialization notice:", err);
      updatePushNotifUI();
    }
  });

  // Sync Store Slug Tags so this device ONLY receives orders for this store
  async function syncAdminStoreTags() {
    try {
      if (typeof window.OneSignal === 'undefined' || !window.OneSignal.User) return;
      const slug = getSlug();
      if (!slug) return;

      const perm = window.Notification ? Notification.permission : 'default';
      if (perm === 'granted') {
        await window.OneSignal.User.addTags({
          restaurant: slug,
          role: 'admin'
        });
        console.log(`[Push Engine] Device tagged with restaurant: "${slug}", role: "admin"`);
      }
    } catch (e) {
      console.warn("[Push Engine] Tag sync notice:", e);
    }
  }

  // Toggle or Request Push Notification Permission
  window.toggleOneSignalPush = async function() {
    const slug = getSlug();
    const currentPerm = window.Notification ? Notification.permission : 'default';

    if (currentPerm === 'denied') {
      if (typeof showToastNotification === 'function') {
        showToastNotification('الإشعارات محظورة في إعدادات متصفحك. يرجى تفعيلها من إعدادات الموقع.', 'error');
      } else {
        alert('الإشعارات محظورة في إعدادات متصفحك. يرجى الضغط على علامة القفل بجانب الرابط وتفعيل الإشعارات.');
      }
      return;
    }

    if (currentPerm === 'granted') {
      // Already granted — offer to send a quick test push
      await syncAdminStoreTags();
      updatePushNotifUI();
      if (typeof showToastNotification === 'function') {
        showToastNotification('الإشعارات مفعلة بالفعل على هذا الهاتف لهذا المطعم!', 'success');
      }
      return;
    }

    try {
      if (window.OneSignal && window.OneSignal.Notifications) {
        await window.OneSignal.Notifications.requestPermission();
      } else if (window.Notification && typeof Notification.requestPermission === 'function') {
        await Notification.requestPermission();
      }

      const updatedPerm = window.Notification ? Notification.permission : 'default';
      if (updatedPerm === 'granted') {
        await syncAdminStoreTags();
        updatePushNotifUI();
        if (typeof showToastNotification === 'function') {
          showToastNotification('تم تفعيل إشعارات الطلبات على هذا الهاتف بنجاح!', 'success');
        }
      } else {
        updatePushNotifUI();
      }
    } catch (err) {
      console.error("[Push Engine] Permission request error:", err);
    }
  };

  // Send an Instant Test Push Alert to Verify Phone Rings & Vibrates
  window.sendTestPushNotification = async function() {
    const slug = getSlug();
    let storeName = 'المطعم';
    try {
      const settings = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : null;
      if (settings && (settings.storeName || settings.name)) {
        storeName = settings.storeName || settings.name;
      }
    } catch (e) {}

    const origin = window.location.origin || 'https://harbymenu.com';
    const isSubdir = window.location.pathname.startsWith('/links');
    const basePath = isSubdir ? '/links/admin/' : '/admin/';
    const testAdminUrl = `${origin}${basePath}?m=${encodeURIComponent(slug)}`;

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      headings: {
        en: `إشعار تجريبي — ${storeName}`,
        ar: `إشعار تجريبي — ${storeName}`
      },
      contents: {
        en: `نظام الإشعارات الفورية يعمل بنجاح! سيرن هاتفك فور ورود أي طلب جديد.`,
        ar: `نظام الإشعارات الفورية يعمل بنجاح! سيرن هاتفك فور ورود أي طلب جديد.`
      },
      url: testAdminUrl,
      filters: [
        { field: "tag", key: "restaurant", relation: "=", value: String(slug) }
      ],
      chrome_web_icon: `${origin}/assets/icons/admin-icon-192.png`,
      chrome_web_badge: `${origin}/assets/icons/admin-icon-192.png`,
      firefox_icon: `${origin}/assets/icons/admin-icon-192.png`,
      priority: 10,
      ttl: 3600
    };

    if (typeof showToastNotification === 'function') {
      showToastNotification('جارٍ إرسال إشعار تجريبي إلى هاتفك...', 'info');
    }

    try {
      const res = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Key ${ONESIGNAL_REST_KEY}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log("[Push Engine] Test notification response:", data);

      if (data && data.id) {
        if (typeof showToastNotification === 'function') {
          showToastNotification('تم إرسال الإشعار بنجاح! راجع شاشة هاتفك الآن.', 'success');
        }
      } else if (data && data.errors) {
        if (typeof showToastNotification === 'function') {
          showToastNotification('تأكد من تفعيل الإشعار أولاً على هذا الهاتف قبل التجربة.', 'error');
        }
      }
    } catch (err) {
      console.error("[Push Engine] Test push error:", err);
      if (typeof showToastNotification === 'function') {
        showToastNotification('تعذر إرسال الإشعار التجريبي: ' + err.message, 'error');
      }
    }
  };

  // Update UI Elements across Kitchen Header and Settings Tab
  window.updatePushNotifUI = function() {
    const perm = window.Notification ? Notification.permission : 'default';
    const isGranted = (perm === 'granted');

    // 1. Kitchen Top Bar Toggle Button
    const btnKitchen = document.getElementById('btn-toggle-push-notif');
    const labelKitchen = document.getElementById('push-notif-label');
    const dotKitchen = document.getElementById('push-notif-status-dot');

    if (btnKitchen) {
      if (isGranted) {
        btnKitchen.classList.add('active');
        if (labelKitchen) labelKitchen.textContent = 'الإشعارات مفعلة';
        btnKitchen.setAttribute('title', 'إشعارات الطلبات مفعلة على هذا الهاتف');
      } else {
        btnKitchen.classList.remove('active');
        if (labelKitchen) labelKitchen.textContent = 'إشعارات الطلبات';
        btnKitchen.setAttribute('title', 'اضغط لتفعيل إشعارات الطلبات الفورية على هذا الهاتف');
      }
    }

    // 2. Settings Tab Card
    const badgeSettings = document.getElementById('push-settings-status-badge');
    const descSettings = document.getElementById('push-settings-desc');
    const btnSettings = document.getElementById('btn-push-settings-toggle');
    const btnTest = document.getElementById('btn-push-settings-test');

    if (badgeSettings) {
      if (isGranted) {
        badgeSettings.textContent = 'مفعلة على هذا الهاتف';
        badgeSettings.style.background = 'rgba(34, 197, 94, 0.15)';
        badgeSettings.style.color = '#22c55e';
        badgeSettings.style.border = '1px solid rgba(34, 197, 94, 0.35)';
      } else {
        badgeSettings.textContent = 'غير مفعلة بعد';
        badgeSettings.style.background = 'rgba(245, 158, 11, 0.15)';
        badgeSettings.style.color = '#f59e0b';
        badgeSettings.style.border = '1px solid rgba(245, 158, 11, 0.35)';
      }
    }

    if (descSettings) {
      const slug = getSlug();
      if (isGranted) {
        descSettings.textContent = `الهاتف متصل حالياً ويستقبل إشعارات الطلبات الجديدة لمطعم (${slug}) برنين واهتزاز كامل حتى لو كانت الشاشة مغلقة.`;
      } else {
        descSettings.textContent = `فعل الإشعارات على هذا الهاتف لتسمع صوت رنين واهتزاز فور ورود أي طلب جديد، كأنك تستخدم تطبيقاً مستقلاً تماماً.`;
      }
    }

    if (btnSettings) {
      if (isGranted) {
        btnSettings.innerHTML = `
          <svg class="icon icon-sm" viewBox="0 0 24 24" style="color:#22c55e;"><polyline points="20 6 9 17 4 12"/></svg>
          <span>الإشعارات مفعلة بنجاح</span>
        `;
        btnSettings.classList.add('btn-ghost');
        btnSettings.classList.remove('btn-primary');
        btnSettings.style.pointerEvents = 'none';
        btnSettings.style.opacity = '0.9';
      } else {
        btnSettings.innerHTML = `
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span>تفعيل الإشعارات على هذا الهاتف</span>
        `;
        btnSettings.classList.add('btn-primary');
        btnSettings.classList.remove('btn-ghost');
        btnSettings.style.pointerEvents = 'auto';
        btnSettings.style.opacity = '1';
      }
    }

    if (btnTest) {
      btnTest.style.display = isGranted ? 'inline-flex' : 'none';
    }
  };

  // Robust Native Notification for Active Foreground Tab (No Illegal Constructor Error on Mobile)
  window.showAdminOrderNotification = function(newOrder) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const title = `طلب جديد #${newOrder.orderId || ''}`;
    const options = {
      body: `العميل: ${newOrder.customer?.name || 'عميل'} | المبلغ: ${newOrder.finalTotal || ''} ج.م`,
      icon: './assets/icons/admin-icon-192.png',
      badge: './assets/icons/admin-icon-192.png',
      tag: String(newOrder.orderId || Date.now()),
      renotify: true,
      vibrate: [300, 150, 300, 150, 450],
      data: {
        url: window.location.href,
        orderId: newOrder.orderId
      }
    };

    // Mobile Android Chrome requires ServiceWorkerRegistration.showNotification
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, options).catch(() => {
          try { new Notification(title, options); } catch(e) {}
        });
      }).catch(() => {
        try { new Notification(title, options); } catch(e) {}
      });
    } else {
      try { new Notification(title, options); } catch(e) {}
    }
  };

  // Run initial UI sync once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePushNotifUI);
  } else {
    setTimeout(updatePushNotifUI, 300);
  }

  window.syncAdminStoreTags = syncAdminStoreTags;
})();
