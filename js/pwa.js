// ===================================================================
// Order PWA Engine - Native App Experience & Installation (Android / iOS / PC)
// ===================================================================

(function() {
  'use strict';

  let deferredPrompt = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true || 
                       document.referrer.includes('android-app://');

  const isAdmin = window.location.pathname.includes('admin') || document.title.includes('Admin') || document.title.includes('إدارة');
  const appName = isAdmin ? 'Order Admin' : 'Order';
  const appIcon = isAdmin ? 'admin_pwa_icon.png?v=23.0' : 'pwa_icon.png?v=23.0';

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = window.location.pathname.includes('/order') ? './sw.js?v=23.0' : '/sw.js?v=23.0';
      navigator.serviceWorker.register(swUrl)
        .then(reg => {
          try { reg.update(); } catch(e) {}
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version ready.');
                }
              });
            }
          });
        })
        .catch(err => console.warn('[PWA] SW register failed:', err));
    });
  }

  // 2. Capture Android / Desktop Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.__deferredPWAInstallPrompt = e;

    if (!isStandalone) {
      showInstallTriggers();
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.__deferredPWAInstallPrompt = null;
    hideInstallTriggers();
    showToast(`🎉 تم تثبيت تطبيق ${appName} بنجاح! تجده الآن على جهازك كبرنامج مستقل.`);
  });

  function showInstallTriggers() {
    document.querySelectorAll('.btn-pwa-install').forEach(btn => {
      btn.style.display = 'inline-flex';
    });

    if (!sessionStorage.getItem('order_pwa_banner_dismissed') && !document.getElementById('order-pwa-banner')) {
      setTimeout(renderInstallBanner, 2000);
    }
  }

  function hideInstallTriggers() {
    document.querySelectorAll('.btn-pwa-install').forEach(btn => {
      btn.style.display = 'none';
    });
    const banner = document.getElementById('order-pwa-banner');
    if (banner) banner.remove();
  }

  function renderInstallBanner() {
    if (isStandalone || document.getElementById('order-pwa-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'order-pwa-banner';
    banner.style.cssText = 'position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(120%); z-index: 9999; background: var(--surface-raised, #1e1814); color: var(--text-main, #ffffff); border: 1px solid var(--border-strong, rgba(234, 88, 12, 0.4)); box-shadow: 0 16px 36px rgba(0,0,0,0.5), 0 0 20px rgba(234,88,12,0.2); border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; max-width: 92vw; width: 420px; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); direction: rtl; font-family: inherit;';

    banner.innerHTML = `
      <div style="position:relative; width:44px; height:44px; border-radius:11px; overflow:hidden; flex-shrink:0; background:#120e0c; border:1px solid rgba(255,255,255,0.1);">
        <img src="${appIcon}" alt="${appName}" style="width:100%; height:100%; object-fit:cover;">
      </div>
      <div style="flex:1; min-width:0;">
        <div style="font-size:13.5px; font-weight:800; color:var(--text-main, #fff); line-height:1.3;">تثبيت تطبيق ${appName} 💻📱</div>
        <div style="font-size:11.5px; color:var(--text-muted, #a8a29e); margin-top:2px;">يعمل كبرنامج أصلي بدون متصفح وبدون علامة كروم</div>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <button id="btn-pwa-banner-install" style="background:linear-gradient(135deg, #ea580c, #f97316); color:#fff; border:none; border-radius:10px; padding:7px 14px; font-size:12px; font-weight:800; cursor:pointer; font-family:inherit; white-space:nowrap;">
          تثبيت الآن
        </button>
        <button id="btn-pwa-banner-close" style="background:transparent; color:var(--text-muted, #888); border:none; border-radius:8px; width:28px; height:28px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center;" title="إغلاق">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(banner);
    requestAnimationFrame(() => {
      banner.style.transform = 'translateX(-50%) translateY(0)';
    });

    document.getElementById('btn-pwa-banner-install').addEventListener('click', () => {
      window.triggerPWAInstall();
    });

    document.getElementById('btn-pwa-banner-close').addEventListener('click', () => {
      banner.style.transform = 'translateX(-50%) translateY(140%)';
      setTimeout(() => banner.remove(), 400);
      sessionStorage.setItem('order_pwa_banner_dismissed', 'true');
    });
  }

  // 3. Global Install Trigger
  window.triggerPWAInstall = async function() {
    if (isStandalone) {
      showToast(`🚀 تطبيق ${appName} مثبت بالفعل ويعمل كبرنامج مستقل!`);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        deferredPrompt = null;
        window.__deferredPWAInstallPrompt = null;
        hideInstallTriggers();
      }
      return;
    }

    if (isIOS) {
      showIOSInstallModal();
      return;
    }

    showFallbackInstallModal();
  };

  function showIOSInstallModal() {
    let modal = document.getElementById('ios-pwa-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ios-pwa-modal';
      modal.style.cssText = 'position: fixed; inset: 0; z-index: 100000; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 24px; direction: rtl; font-family: inherit;';
      modal.innerHTML = `
        <div style="background:var(--surface, #1c1714); border:1px solid var(--border-strong, #ea580c); border-radius:20px; padding:22px; max-width:92vw; width:380px; box-shadow:0 20px 40px rgba(0,0,0,0.6); color:var(--text-main, #fff);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${appIcon}" style="width:38px; height:38px; border-radius:10px; object-fit:cover;">
              <div style="font-weight:800; font-size:15px;">تثبيت ${appName} على iPhone / iPad</div>
            </div>
            <button onclick="document.getElementById('ios-pwa-modal').remove()" style="background:transparent; border:none; color:#888; font-size:18px; cursor:pointer;">✕</button>
          </div>
          <div style="font-size:13px; color:var(--text-body, #ddd); line-height:1.7;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
              <span style="background:rgba(234,88,12,0.15); color:#ea580c; border-radius:50%; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:12px;">1</span>
              <span>اضغط على أيقونة المشاركة <b>(Share) ⎋</b> في شريط متصفح سفاري بالأسفل.</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
              <span style="background:rgba(234,88,12,0.15); color:#ea580c; border-radius:50%; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:12px;">2</span>
              <span>مرر لأسفل واختر <b>'إضافة إلى الصفحة الرئيسية ➕'</b> (Add to Home Screen).</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="background:rgba(234,88,12,0.15); color:#ea580c; border-radius:50%; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:12px;">3</span>
              <span>اضغط <b>'إضافة' (Add)</b> أعلى اليمين وسيعمل التطبيق كبرنامج مستقل بدون متصفح.</span>
            </div>
          </div>
          <button onclick="document.getElementById('ios-pwa-modal').remove()" style="width:100%; margin-top:16px; background:linear-gradient(135deg, #ea580c, #f97316); color:#fff; border:none; padding:10px; border-radius:12px; font-weight:800; font-size:13.5px; cursor:pointer;">فهمت ذلك</button>
        </div>
      `;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
      document.body.appendChild(modal);
    }
  }

  function showFallbackInstallModal() {
    let modal = document.getElementById('fallback-pwa-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'fallback-pwa-modal';
      modal.style.cssText = 'position: fixed; inset: 0; z-index: 100000; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px; direction: rtl; font-family: inherit;';
      modal.innerHTML = `
        <div style="background:var(--surface, #1c1714); border:1px solid var(--border-strong, #ea580c); border-radius:20px; padding:24px; max-width:92vw; width:430px; box-shadow:0 20px 40px rgba(0,0,0,0.6); color:var(--text-main, #fff); text-align:center;">
          <div style="width:56px; height:56px; border-radius:14px; margin:0 auto 12px; overflow:hidden; background:#120e0c; border:1px solid rgba(255,255,255,0.1);">
            <img src="${appIcon}" style="width:100%; height:100%; object-fit:cover;">
          </div>
          <div style="font-weight:800; font-size:16.5px; margin-bottom:8px;">تثبيت ${appName} كبرنامج مستقل</div>
          <div style="font-size:13px; color:var(--text-muted, #aaa); margin-bottom:18px; line-height:1.7; text-align:right; background:rgba(0,0,0,0.25); padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0 0 10px 0;"><b>💻 على الكمبيوتر (Windows / Mac):</b><br>
            ستجد أيقونة التثبيت <b>(⊕ أو 💻)</b> في شريط عنوان المتصفح أعلى اليمين (بجانب زر الإشارة المرجعية ⭐).<br>
            أو اضغط على قائمة المتصفح <b>(الثلاث نقاط ⋮)</b> ثم اختر <b>"تثبيت ${appName}"</b>.</p>
            <p style="margin:0;"><b>📱 على الهاتف (Android):</b><br>من قائمة المتصفح <b>(الـ 3 نقاط ⋮ أعلى الشاشة)</b>، اختر <b>"تثبيت التطبيق" (Install app)</b>.</p>
          </div>
          <button onclick="document.getElementById('fallback-pwa-modal').remove()" style="background:linear-gradient(135deg, #ea580c, #f97316); color:#fff; border:none; padding:10px 28px; border-radius:12px; font-weight:800; font-size:13.5px; cursor:pointer;">حسناً، فهمت</button>
        </div>
      `;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
      document.body.appendChild(modal);
    }
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; top: 24px; left: 50%; transform: translateX(-50%); z-index: 100000; background: #1e1814; color: #fff; border: 1px solid #ea580c; padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; direction: rtl; box-shadow: 0 10px 30px rgba(0,0,0,0.5);';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Auto-init on DOM ready
  function initInstallState() {
    if (!isStandalone) {
      setTimeout(showInstallTriggers, 1500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstallState);
  } else {
    initInstallState();
  }
})();
