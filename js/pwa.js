// ===================================================================
// Order PWA Engine - Native App Experience & Installation (Android / iOS / PC)
// Version 28.0 - Native App Installation & Smart Persistence
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
  const appDisplayName = isAdmin ? 'تطبيق إدارة أوردر' : 'تطبيق أوردر للمطاعم';
  const appIcon = isAdmin ? 'admin_pwa_icon.png?v=28.0' : 'pwa_icon.png?v=28.0';
  const storageKey = 'pwa_installed_' + (isAdmin ? 'admin' : 'menu');

  // Check if app is installed (either standalone mode or marked installed)
  function isAppInstalled() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://');
    if (isStandalone) {
      try {
        localStorage.setItem(storageKey, 'true');
        localStorage.setItem('pwa_installed_' + appName, 'true');
      } catch (e) {}
      return true;
    }

    try {
      if (localStorage.getItem(storageKey) === 'true' || localStorage.getItem('pwa_installed_' + appName) === 'true') {
        return true;
      }
    } catch (e) {}

    return false;
  }

  // Mark app as installed permanently
  function markAppAsInstalled() {
    try {
      localStorage.setItem(storageKey, 'true');
      localStorage.setItem('pwa_installed_' + appName, 'true');
    } catch (e) {}
    const banner = document.getElementById('order-pwa-banner');
    if (banner) {
      banner.style.animation = 'pwaSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => banner.remove(), 350);
    }
  }

  // 1. Register Service Worker with instant update
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = './sw.js?v=30.0';
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
    if (!isAppInstalled()) {
      renderInstallBanner();
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.__deferredPWAInstallPrompt = null;
    markAppAsInstalled();
    showToast(`🎉 تم تثبيت ${appDisplayName} بنجاح كبرنامج مستقل على جهازك.`);
  });

  function renderInstallBanner() {
    if (isAppInstalled()) return;
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
    banner.style.cssText = 'position: fixed; bottom: 16px; left: 50%; z-index: 99999; background: var(--surface-raised, #1e1814); color: var(--text-main, #ffffff); border: 1.5px solid var(--border-strong, rgba(234, 88, 12, 0.45)); box-shadow: 0 12px 32px rgba(0,0,0,0.6), 0 0 16px rgba(234,88,12,0.25); border-radius: 16px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; width: calc(100% - 24px); max-width: 480px; box-sizing: border-box; animation: pwaSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards; direction: rtl; font-family: inherit;';

    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
        <div style="position:relative; width:42px; height:42px; border-radius:12px; overflow:hidden; flex-shrink:0; background:#120e0c; border:1px solid rgba(255,255,255,0.14); box-shadow:0 4px 10px rgba(0,0,0,0.3);">
          <img src="${appIcon}" alt="${appDisplayName}" style="width:100%; height:100%; object-fit:cover; display:block;">
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:13.5px; font-weight:800; color:var(--text-main, #fff); line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${appDisplayName}
          </div>
          <div style="font-size:11px; color:var(--text-muted, #a8a29e); font-weight:500; margin-top:2px;">
            تثبيت مباشر وسريع بدون متجر تطبيقات
          </div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
        <button id="btn-pwa-banner-install" style="background:linear-gradient(135deg, #ea580c, #f97316); color:#fff; border:none; border-radius:10px; padding:8px 14px; font-size:12.5px; font-weight:800; cursor:pointer; font-family:inherit; white-space:nowrap; box-shadow:0 4px 12px rgba(234,88,12,0.35);">
          تثبيت الآن
        </button>
        <button id="btn-pwa-banner-close" style="background:transparent; color:var(--text-muted, #a8a29e); border:none; border-radius:8px; width:28px; height:28px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0;" title="إغلاق">
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

  // 3. Direct Native App Install Trigger
  window.triggerPWAInstall = async function() {
    const installBtn = document.getElementById('btn-pwa-banner-install');
    const origText = installBtn ? installBtn.textContent : 'تثبيت الآن';

    // Fast-wait for deferredPrompt if user clicked immediately upon page load
    if (!deferredPrompt && !isIOS) {
      if (installBtn) {
        installBtn.textContent = 'جاري التثبيت...';
        installBtn.disabled = true;
      }
      await new Promise((resolve) => {
        let timer = null;
        const handler = (e) => {
          clearTimeout(timer);
          window.removeEventListener('beforeinstallprompt', handler);
          resolve(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        timer = setTimeout(() => {
          window.removeEventListener('beforeinstallprompt', handler);
          resolve(null);
        }, 1800);
      });
      if (installBtn) {
        installBtn.textContent = origText;
        installBtn.disabled = false;
      }
    }

    // 1. Direct Native Browser Prompt (Android / Windows Chrome & Edge / Mac Chrome)
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          markAppAsInstalled();
          showToast(`🎉 تم تثبيت ${appDisplayName} بنجاح كبرنامج مستقل.`);
        }
        deferredPrompt = null;
        window.__deferredPWAInstallPrompt = null;
      } catch (err) {
        console.warn('[PWA] Native prompt error:', err);
      }
      return;
    }

    // 2. Apple iOS Safari Guidance (Clean toast, zero blocking modal)
    if (isIOS) {
      showToast(`📲 لتثبيت ${appDisplayName} على iPhone: اضغط زر المشاركة (Share ⎋) أسفل المتصفح واختر "إضافة إلى الشاشة الرئيسية ➕".`);
      return;
    }

    // 3. Standalone mode or already installed check
    markAppAsInstalled();
    showToast(`✅ ${appDisplayName} مثبت بالفعل على جهازك! يمكنك فتحه مباشرة من قائمة برامج الويندوز أو من زر (Open in app 💻) أعلى المتصفح.`);
  };

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
  window.markAppAsInstalled = markAppAsInstalled;
  window.isAppInstalled = isAppInstalled;

  // Auto-init on DOM ready - guaranteed execution for new & returning visitors on any account
  async function initInstallState() {
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const apps = await navigator.getInstalledRelatedApps();
        if (apps && apps.length > 0) {
          markAppAsInstalled();
          return;
        }
      } catch (e) {}
    }
    if (!isAppInstalled()) {
      renderInstallBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initInstallState, 250);
    });
  } else {
    setTimeout(initInstallState, 250);
  }
})();
