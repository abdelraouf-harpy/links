// ===================================================================
// Order PWA Engine — Native App Experience & Smart Update System
// Version 31.0 — Chic In-App Updates, Instant Branding & WebAPK Integrity
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

  const getActiveSlug = () => {
    return (window.__harpySlug || (new URLSearchParams(window.location.search)).get('m') || 'king').toLowerCase().trim();
  };
  let slug = getActiveSlug();

  // Resolve Store Branding for Native App Identity
  let storeName = '';
  let storeLogo = '';
  try {
    const cached = localStorage.getItem('harpy_' + slug + '_settings');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed) {
        if (parsed.storeName) storeName = parsed.storeName;
        if (!storeName && parsed.name) storeName = parsed.name;
        if (parsed.logo) storeLogo = parsed.logo;
      }
    }
  } catch(e) {}

  let appName = isAdmin ? (storeName ? `إدارة ${storeName}` : 'Order Admin') : (storeName || 'Order');
  let appDisplayName = isAdmin 
    ? (storeName ? `لوحة تحكم: ${storeName}` : 'تطبيق إدارة أوردر') 
    : (storeName ? `منيو: ${storeName}` : 'تطبيق أوردر للمطاعم');
  const fallbackIcon = isAdmin ? 'admin_pwa_icon.png?v=31.0' : 'pwa_icon.png?v=31.0';
  let appIcon = storeLogo || fallbackIcon;
  const storageKey = 'pwa_installed_' + (isAdmin ? ('admin_' + slug) : ('menu_' + slug));

  // ── CSS Keyframe Animations Injection ────────────────────────
  function ensurePwaStyles() {
    if (document.getElementById('harpy-pwa-animations')) return;
    const style = document.createElement('style');
    style.id = 'harpy-pwa-animations';
    style.textContent = `
      @keyframes pwaSlideUp {
        0% { transform: translateX(-50%) translateY(140%); opacity: 0; }
        100% { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes pwaSlideDown {
        0% { transform: translateX(-50%) translateY(0); opacity: 1; }
        100% { transform: translateX(-50%) translateY(160%); opacity: 0; }
      }
      @keyframes pwaUpdateFadeIn {
        0% { transform: translateX(-50%) translateY(-24px) scale(0.96); opacity: 0; }
        100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
      }
      @keyframes pwaUpdateFadeOut {
        0% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
        100% { transform: translateX(-50%) translateY(-24px) scale(0.96); opacity: 0; }
      }
      @keyframes harpyPulseGlow {
        0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px #f97316; }
        50% { opacity: 0.55; transform: scale(0.88); box-shadow: 0 0 4px #ea580c; }
      }
    `;
    document.head.appendChild(style);
  }
  ensurePwaStyles();

  // ── 1. Real-Time PWA Branding Engine ────────────────────────
  // Updates in-app banner, iOS Touch Icon, and page branding dynamically
  // Ensures <link rel="manifest"> points to authentic HTTPS file so WebAPK mints without Chrome badge
  function updatePwaBranding(customSettings = null) {
    try {
      slug = getActiveSlug();
      if (customSettings) {
        if (customSettings.storeName || customSettings.name) {
          storeName = customSettings.storeName || customSettings.name;
          appName = isAdmin ? `إدارة ${storeName}` : storeName;
          appDisplayName = isAdmin ? `لوحة تحكم: ${storeName}` : `منيو: ${storeName}`;
        }
        if (customSettings.logo) {
          storeLogo = customSettings.logo;
          appIcon = storeLogo;
        }
      }

      // Update in-app install banner UI in real-time
      const bannerTitle = document.getElementById('pwa-banner-title');
      const bannerImg = document.getElementById('pwa-banner-img');
      if (bannerTitle && appDisplayName) bannerTitle.textContent = appDisplayName;
      if (bannerImg && appIcon) {
        bannerImg.src = appIcon;
        bannerImg.onerror = function() { this.src = fallbackIcon; };
      }

      // Ensure manifest link points to authentic server file so Google Play WebAPK builds natively
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        const authenticHref = isAdmin ? 'admin-manifest.json' : 'manifest.json';
        if (manifestLink.getAttribute('href') !== authenticHref) {
          manifestLink.setAttribute('href', authenticHref);
        }
      }

      // Update Apple iOS Safari home screen icon & title dynamically
      if (storeLogo) {
        try {
          let appleTouch = document.querySelector('link[rel="apple-touch-icon"]');
          if (!appleTouch) {
            appleTouch = document.createElement('link');
            appleTouch.rel = 'apple-touch-icon';
            document.head.appendChild(appleTouch);
          }
          appleTouch.href = storeLogo;
        } catch(e) {}
      }
      if (storeName) {
        try {
          let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
          if (appleTitle) appleTitle.content = appName;
        } catch(e) {}
      }
    } catch (err) {
      console.warn('[PWA] Branding update error:', err);
    }
  }
  updatePwaBranding();

  // ── 2. Chic In-App Update Engine ("رسالة تحديث شيك") ─────────
  // Automatically detects when store branding or system updates are published,
  // presenting an elegant floating card for instant one-click sync.

  function getStoredIdentity(currentSlug) {
    try {
      const key = 'harpy_pwa_identity_' + (isAdmin ? 'admin_' : 'menu_') + currentSlug;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return null;
  }

  function saveStoredIdentity(currentSlug, data) {
    try {
      const key = 'harpy_pwa_identity_' + (isAdmin ? 'admin_' : 'menu_') + currentSlug;
      localStorage.setItem(key, JSON.stringify({
        storeName: (data.storeName || data.name || '').trim(),
        logo: (data.logo || data.logoUrl || '').trim(),
        updatedAt: Date.now()
      }));
    } catch(e) {}
  }

  function checkForPwaUpdates(freshSettings) {
    if (!freshSettings || typeof freshSettings !== 'object') return;
    const currentSlug = getActiveSlug();
    const freshName = (freshSettings.storeName || freshSettings.name || '').trim();
    const freshLogo = (freshSettings.logo || freshSettings.logoUrl || '').trim();

    if (!freshName && !freshLogo) return;

    // Check if dismissed recently (within 15 minutes)
    const dismissKey = 'harpy_update_dismissed_' + (isAdmin ? 'admin_' : 'menu_') + currentSlug;
    const dismissedAt = sessionStorage.getItem(dismissKey);
    if (dismissedAt && (Date.now() - parseInt(dismissedAt, 10) < 15 * 60 * 1000)) {
      return;
    }

    const recorded = getStoredIdentity(currentSlug);

    // If no recorded identity yet:
    if (!recorded) {
      const hasExistingCache = localStorage.getItem('harpy_' + currentSlug + '_settings') !== null;
      const isInstalled = isAppInstalled();

      if (isInstalled || hasExistingCache) {
        // Compare with old cached settings
        let oldName = '';
        let oldLogo = '';
        try {
          const cs = JSON.parse(localStorage.getItem('harpy_' + currentSlug + '_settings') || '{}');
          oldName = (cs.storeName || cs.name || '').trim();
          oldLogo = (cs.logo || cs.logoUrl || '').trim();
        } catch(e) {}

        const nameDiffers = oldName && freshName && (oldName !== freshName);
        const logoDiffers = oldLogo && freshLogo && (oldLogo !== freshLogo);

        if (nameDiffers || logoDiffers) {
          showUpdateNotification({
            slug: currentSlug,
            oldName: oldName,
            newName: freshName || oldName,
            oldLogo: oldLogo || fallbackIcon,
            newLogo: freshLogo || oldLogo || fallbackIcon,
            settings: freshSettings
          });
          return;
        }
      }
      // Record current identity as baseline
      saveStoredIdentity(currentSlug, { storeName: freshName, logo: freshLogo });
      return;
    }

    // Check if identity changed
    const nameChanged = freshName && recorded.storeName && (freshName !== recorded.storeName);
    const logoChanged = freshLogo && recorded.logo && (freshLogo !== recorded.logo);

    if (nameChanged || logoChanged) {
      showUpdateNotification({
        slug: currentSlug,
        oldName: recorded.storeName,
        newName: freshName || recorded.storeName,
        oldLogo: recorded.logo || fallbackIcon,
        newLogo: freshLogo || recorded.logo || fallbackIcon,
        settings: freshSettings
      });
    }
  }

  function showUpdateNotification(updateData) {
    if (document.getElementById('harpy-pwa-update-modal')) return;
    ensurePwaStyles();

    const currentSlug = updateData.slug || getActiveSlug();
    const displayLogo = updateData.newLogo || storeLogo || fallbackIcon;
    const targetName = updateData.newName || storeName || (isAdmin ? 'لوحة التحكم' : 'المطعم');
    const headline = isAdmin 
      ? `تحديث لوحة تحكم: ${targetName}` 
      : `تحديث تطبيق: ${targetName}`;

    const backdrop = document.createElement('div');
    backdrop.id = 'harpy-pwa-update-backdrop';
    backdrop.style.cssText = 'position: fixed; inset: 0; z-index: 999998; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.3s ease;';

    const card = document.createElement('div');
    card.id = 'harpy-pwa-update-modal';
    card.style.cssText = `
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      width: calc(100% - 28px);
      max-width: 440px;
      background: linear-gradient(145deg, rgba(28,24,21,0.97), rgba(18,14,12,0.98));
      border: 1.5px solid rgba(234, 88, 12, 0.55);
      border-radius: 20px;
      padding: 16px 18px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.7), 0 0 28px rgba(234,88,12,0.25);
      color: #ffffff;
      direction: rtl;
      font-family: inherit;
      box-sizing: border-box;
      animation: pwaUpdateFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    card.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(234,88,12,0.18); border:1px solid rgba(234,88,12,0.4); padding:4px 11px; border-radius:20px; font-size:12px; font-weight:800; color:#fb923c;">
          <span style="width:7px; height:7px; border-radius:50%; background:#f97316; display:inline-block; animation: harpyPulseGlow 1.5s infinite;"></span>
          ${updateData.isSystemUpdate ? 'تحديث جديد للمنصة 🚀' : 'تحديث جديد متوفر ✨'}
        </div>
        <button id="btn-update-card-close" style="background:transparent; border:none; color:#a8a29e; cursor:pointer; font-size:17px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:8px;" title="إغلاق">✕</button>
      </div>
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
        <div style="position:relative; width:48px; height:48px; border-radius:14px; overflow:hidden; flex-shrink:0; background:#120e0c; border:1.5px solid rgba(249,115,22,0.45); box-shadow:0 4px 14px rgba(0,0,0,0.45);">
          <img src="${displayLogo}" alt="${targetName}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.src='${fallbackIcon}'">
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:14.5px; font-weight:800; color:#ffffff; line-height:1.35; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${headline}
          </div>
          <div style="font-size:11.5px; color:#d6d3d1; font-weight:500; margin-top:3px; line-height:1.4;">
            ${updateData.isSystemUpdate 
              ? 'يتوفر إصدار أحدث لتحسين استقرار وسرعة التطبيق.' 
              : 'تم تحديث هوية وبيانات المطعم. اضغط للتحديث الفوري.'}
          </div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button id="btn-update-apply-now" style="flex:1; background:linear-gradient(135deg, #ea580c, #f97316); color:#fff; border:none; border-radius:12px; padding:10px 16px; font-size:13px; font-weight:800; cursor:pointer; font-family:inherit; box-shadow:0 4px 16px rgba(234,88,12,0.38); display:flex; align-items:center; justify-content:center; gap:6px;">
          <span>تحديث التطبيق الآن</span>
          <span style="font-size:14px;">⚡</span>
        </button>
        <button id="btn-update-dismiss" style="background:rgba(255,255,255,0.06); color:#a8a29e; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px 16px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:inherit;">
          لاحقاً
        </button>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(card);
    requestAnimationFrame(() => { backdrop.style.opacity = '1'; });

    const dismissHandler = () => {
      const dismissKey = 'harpy_update_dismissed_' + (isAdmin ? 'admin_' : 'menu_') + currentSlug;
      sessionStorage.setItem(dismissKey, Date.now().toString());
      card.style.animation = 'pwaUpdateFadeOut 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      backdrop.style.opacity = '0';
      setTimeout(() => {
        try { card.remove(); backdrop.remove(); } catch(e) {}
      }, 300);
    };

    document.getElementById('btn-update-card-close').addEventListener('click', dismissHandler);
    document.getElementById('btn-update-dismiss').addEventListener('click', dismissHandler);
    backdrop.addEventListener('click', dismissHandler);

    document.getElementById('btn-update-apply-now').addEventListener('click', async () => {
      const applyBtn = document.getElementById('btn-update-apply-now');
      if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.innerHTML = `<span>جاري التحديث...</span> ⏳`;
      }

      // 1. Record fresh branding as current applied baseline
      saveStoredIdentity(currentSlug, {
        storeName: updateData.newName,
        logo: updateData.newLogo
      });

      // 2. Persist fresh settings locally if provided
      if (updateData.settings) {
        try {
          localStorage.setItem('harpy_' + currentSlug + '_settings', JSON.stringify(updateData.settings));
        } catch(e) {}
      }

      // 3. Update PWA branding, banners, and iOS icons immediately
      updatePwaBranding(updateData.settings || { storeName: updateData.newName, logo: updateData.newLogo });

      // 4. Command Service Worker to activate immediately and clear old caches
      if ('serviceWorker' in navigator) {
        try {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHES' });
          }
        } catch(e) {}
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) {
            if (r.waiting) r.waiting.postMessage({ type: 'SKIP_WAITING' });
            r.update().catch(() => {});
          }
        } catch(e) {}
      }

      // 5. Dismiss modal smoothly and reload window
      showToast(`🎉 تم تحديث بيانات وهوية ${targetName} بنجاح!`);
      card.style.animation = 'pwaUpdateFadeOut 0.25s forwards';
      backdrop.style.opacity = '0';
      setTimeout(() => {
        try { card.remove(); backdrop.remove(); } catch(e) {}
        window.location.reload();
      }, 400);
    });
  }

  // ── 3. Listen for Store Settings Live Updates ────────────────
  window.addEventListener('harpy_settings_updated', (e) => {
    if (e && e.detail) {
      updatePwaBranding(e.detail);
      checkForPwaUpdates(e.detail);
    }
  });
  window.addEventListener('store_settings_updated', () => {
    try {
      const s = JSON.parse(localStorage.getItem('harpy_' + getActiveSlug() + '_settings') || '{}');
      if (s) {
        updatePwaBranding(s);
        checkForPwaUpdates(s);
      }
    } catch(e) {}
  });

  window.updatePwaBranding = updatePwaBranding;
  window.updateDynamicManifest = updatePwaBranding;
  window.checkForPwaUpdates = checkForPwaUpdates;

  // ── 4. App Installation State Verification ───────────────────
  function isAppInstalled() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://');
    if (isStandalone) {
      try {
        localStorage.setItem(storageKey, 'true');
        localStorage.setItem('pwa_installed_' + appName, 'true');
        if (isAdmin) {
          localStorage.setItem('harpy_admin_active_slug', slug);
        } else {
          localStorage.setItem('harpy_customer_installed_slug', slug);
        }
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

  function markAppAsInstalled() {
    try {
      localStorage.setItem(storageKey, 'true');
      localStorage.setItem('pwa_installed_' + appName, 'true');
      if (isAdmin) {
        localStorage.setItem('harpy_admin_active_slug', slug);
      } else {
        localStorage.setItem('harpy_customer_installed_slug', slug);
      }
      saveStoredIdentity(slug, { storeName: storeName, logo: storeLogo });
    } catch (e) {}
    const banner = document.getElementById('order-pwa-banner');
    if (banner) {
      banner.style.animation = 'pwaSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => banner.remove(), 350);
    }
  }

  // ── 5. Register Service Worker with Instant Update Engine ─────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = './sw.js?v=31.0';
      navigator.serviceWorker.register(swUrl)
        .then(reg => {
          window.__swRegistration = reg;
          try { reg.update(); } catch(e) {}

          if (reg.waiting) {
            showUpdateNotification({
              slug: getActiveSlug(),
              newName: storeName || 'Order',
              newLogo: storeLogo || fallbackIcon,
              isSystemUpdate: true
            });
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showUpdateNotification({
                    slug: getActiveSlug(),
                    newName: storeName || 'Order',
                    newLogo: storeLogo || fallbackIcon,
                    isSystemUpdate: true
                  });
                }
              });
            }
          });
        })
        .catch(() => {});
    });
  }

  // ── 6. Capture Android / Desktop Install Prompt ──────────────
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
    ensurePwaStyles();

    const banner = document.createElement('div');
    banner.id = 'order-pwa-banner';
    banner.style.cssText = 'position: fixed; bottom: 16px; left: 50%; z-index: 99999; background: var(--surface-raised, #1e1814); color: var(--text-main, #ffffff); border: 1.5px solid var(--border-strong, rgba(234, 88, 12, 0.45)); box-shadow: 0 12px 32px rgba(0,0,0,0.6), 0 0 16px rgba(234,88,12,0.25); border-radius: 16px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; width: calc(100% - 24px); max-width: 480px; box-sizing: border-box; animation: pwaSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards; direction: rtl; font-family: inherit;';

    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
        <div style="position:relative; width:42px; height:42px; border-radius:12px; overflow:hidden; flex-shrink:0; background:#120e0c; border:1px solid rgba(255,255,255,0.14); box-shadow:0 4px 10px rgba(0,0,0,0.3);">
          <img id="pwa-banner-img" src="${appIcon}" alt="${appDisplayName}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.src='${fallbackIcon}'">
        </div>
        <div style="flex:1; min-width:0;">
          <div id="pwa-banner-title" style="font-size:13.5px; font-weight:800; color:var(--text-main, #fff); line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
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

  // ── 7. Direct Native App Install Trigger ─────────────────────
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

    // 2. Apple iOS Safari Guidance
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

  // Auto-init on DOM ready
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
