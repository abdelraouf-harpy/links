// ===================================================================
// Harpy Order — Native Kitchen Notifications Engine (100% Zero-Bloat)
// Clean Web Notification API + Local Chime + Vibration
// ===================================================================

(function() {
  'use strict';

  function updatePushNotifUI() {
    const isGranted = (typeof window.Notification !== 'undefined' && Notification.permission === 'granted');
    const isDenied = (typeof window.Notification !== 'undefined' && Notification.permission === 'denied');

    const quickBtn = document.getElementById('btn-toggle-push-notif');
    const settingsBtn = document.getElementById('btn-push-settings-toggle');
    const statusDot = document.getElementById('push-notif-status-dot') || document.getElementById('push-status-dot');
    const labelEl = document.getElementById('push-notif-label');

    if (quickBtn) {
      if (isGranted) {
        quickBtn.classList.add('active');
        quickBtn.setAttribute('title', 'إشعارات الطلبات مفعلة');
        if (labelEl) labelEl.textContent = 'الإشعارات مفعلة';
      } else {
        quickBtn.classList.remove('active');
        quickBtn.setAttribute('title', isDenied ? 'تم حظر الإشعارات من إعدادات المتصفح' : 'اضغط لتفعيل إشعارات الطلبات');
        if (labelEl) labelEl.textContent = 'إشعارات الطلبات';
      }
    }

    if (settingsBtn) {
      if (isGranted) {
        settingsBtn.textContent = 'الإشعارات مفعلة';
        settingsBtn.classList.add('btn-success');
        settingsBtn.classList.remove('btn-primary');
      } else {
        settingsBtn.textContent = 'تفعيل الإشعارات';
        settingsBtn.classList.remove('btn-success');
        settingsBtn.classList.add('btn-primary');
      }
    }

    if (statusDot) {
      statusDot.style.background = isGranted ? '#10b981' : (isDenied ? '#ef4444' : 'rgba(255,255,255,0.2)');
    }
  }

  window.toggleKitchenNotifications = async function() {
    if (!('Notification' in window)) {
      if (typeof showToastNotification === 'function') {
        showToastNotification('متصفحك لا يدعم الإشعارات المباشرة', 'error');
      } else {
        alert('متصفحك لا يدعم الإشعارات المباشرة');
      }
      return;
    }

    if (Notification.permission === 'denied') {
      if (typeof showToastNotification === 'function') {
        showToastNotification('الإشعارات محظورة من إعدادات المتصفح. يرجى السماح بها من رمز القفل بجانب الرابط.', 'error');
      } else {
        alert('الإشعارات محظورة من إعدادات المتصفح. يرجى السماح بها من رمز القفل.');
      }
      return;
    }

    if (Notification.permission === 'granted') {
      updatePushNotifUI();
      if (typeof showToastNotification === 'function') {
        showToastNotification('إشعارات الطلبات مفعلة وتعمل بنجاح', 'success');
      }
      if (typeof playKitchenOrderChime === 'function') playKitchenOrderChime();
      return;
    }

    try {
      const res = await Notification.requestPermission();
      updatePushNotifUI();
      if (res === 'granted') {
        if (typeof showToastNotification === 'function') {
          showToastNotification('تم تفعيل إشعارات الطلبات بنجاح', 'success');
        }
        if (typeof playKitchenOrderChime === 'function') playKitchenOrderChime();
      } else {
        if (typeof showToastNotification === 'function') {
          showToastNotification('لم يتم تفعيل الإشعارات', 'warning');
        }
      }
    } catch (e) {
      console.warn('[Notification] Permission error:', e);
    }
  };

  // Backwards compatibility alias
  window.toggleOneSignalPush = window.toggleKitchenNotifications;
  window.updatePushNotifUI = updatePushNotifUI;

  // Initialize UI on ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(updatePushNotifUI, 300));
  } else {
    setTimeout(updatePushNotifUI, 300);
  }
})();
