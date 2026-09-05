// ===================================================================
// Order PWA Engine - Native App Experience & Installation (Android / iOS / PC)
// Version 26.0 - Guaranteed Install Banner & Button for All Accounts
// ===================================================================

(function() {
  'use strict';

  let deferredPrompt = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const isAdmin = window.location.pathname.includes('admin') || 
                  window.location.search.includes('admin') || 
                  window.location.href.includes('admin') || 
                  document.title.includes('Admin') || 
                  document.title.includes('إدارة');
  const appName = isAdmin ? 'Order Admin' : 'Order';
  const appDisplayName = isAdmin ? 'تثبيت تطبيق Order Admin' : 'تثبيت تطبيق Order';
  const appIcon = isAdmin ? 'admin_pwa_icon.png?v=26.0' : 'pwa_icon.png?v=26.0';

  // 1. Register Service Worker with instant update
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = './sw.js?v=26.0';
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
        .catch(() => {});
    });
  }

  // 2. Capture Android / Desktop Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.__deferredPWAInstallPrompt = e;
    showInstallTriggers();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.__deferredPWAInstallPrompt = null;
    showToast(`🎉 تم تثبيت تطبيق ${appName} بنجاح! تجده الآن على جهازك كبرنامج مستقل.`);
    const banner = document.getElementById('order-pwa-banner');
    if (banner) banner.remove();
  });

  function showInstallTriggers() {
    document.querySelectorAll('.btn-pwa-install').forEach(btn => {
      btn.style.setProperty('display', 'inline-flex', 'important');
    });
    renderInstallBanner();
  }

  function renderInstallBanner() {
    if (document.getElementById('order-pwa-banner')) return;

    // Ensure CSS keyframe animations are present
    if (!document.getElementById('pwa-slide-anim')) {
      const style = document.createElement('style');
      style.id = 'pwa-slide-anim';
      style.textContent = `
        @keyframes pwaSlideUp {
          0% { transform: translateX(-50%) translateY(140%); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes pwaSlideDown {
          0% { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(160%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const banner = document.createElement('div');
    banner.id = 'order-pwa-banner';
    banner.style.cssText = 'position: fixed; bottom: 14px; left: 50%; z-index: 99999; background: var(--surface-raised, #1e1814); color: var(--text-main, #ffffff); border: 1.5px solid var(--border-strong, rgba(234, 88, 12, 0.45)); box-shadow: 0 12px 32px rgba(0,0,0,0.6), 0 0 16px rgba(234,88,12,0.25); border-radius: 16px; padding: 9px 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: calc(100% - 20px); max-width: 480px; box-sizing: border-box; animation: pwaSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards; direction: rtl; font-family: inherit;';

    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:9px; flex:1; min-width:0;">
        <div style="position:relative; width:40px; height:40px; border-radius:10px; overflow:hidden; flex-shrink:0; background:#120e0c; border:1px solid rgba(255,255,255,0.12);">
          <img src="${appIcon}" alt="${appDisplayName}" style="width:100%; height:100%; object-fit:cover; display:block;">
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:13px; font-weight:800; color:var(--text-main, #fff); line-height:1.25; word-break:break-word;">
            ${appDisplayName}
          </div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
        <button id="btn-pwa-banner-install" style="background:linear-gradient(135deg, #ea580c, #f97316); color:#fff; border:none; border-radius:9px; padding:7px 13px; font-size:12px; font-weight:800; cursor:pointer; font-family:inherit; white-space:nowrap; box-shadow:0 4px 12px rgba(234,88,12,0.35);">
          تثبيت الآن
        </button>
        <button id="btn-pwa-banner-close" style="background:transparent; color:var(--text-muted, #a8a29e); border:none; border-radius:8px; width:26px; height:26px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0;" title="إغلاق">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('btn-pwa-banner-install').addEventListener('click', () => {
      window.triggerPWAInstall();
    });

    document.getElementById('btn-pwa-banner-close').addEventListener('click', () => {
      banner.style.animation = 'pwaSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => banner.remove(), 350);
    });
  }

  // 3. Global Install Trigger
  window.triggerPWAInstall = async function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        deferredPrompt = null;
        window.__deferredPWAInstallPrompt = null;
        const banner = document.getElementById('order-pwa-banner');
        if (banner) banner.remove();
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
            <p style="margin:0;"><b>📱 على الهاتف (Android):</b><br>من قائمة المتصفح <b>(الـ 3 نقاط ⋮ أعلى الشاشة)</b>، اختر <b>"تثبيت التطبيق" (Install app)</b> أو <b>"إضافة إلى الشاشة الرئيسية"</b>.</p>
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

  // Expose global methods
  window.renderInstallBanner = renderInstallBanner;

  // Auto-init on DOM ready - guaranteed execution for new & returning visitors on any account
  function initInstallState() {
    showInstallTriggers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initInstallState, 250);
    });
  } else {
    setTimeout(initInstallState, 250);
  }
})();
