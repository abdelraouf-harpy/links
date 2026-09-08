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
    return (
      window.__harpySlug ||
      (new URLSearchParams(window.location.search)).get('m') ||
      localStorage.getItem('harpy_active_slug') ||
      localStorage.getItem('harpy_admin_active_slug') ||
      localStorage.getItem('harpy_customer_installed_slug') ||
      'king'
    ).toLowerCase().trim();
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

  const MENU_ICON_URL = 'https://iili.io/n3HVHX4.jpg';
  const ADMIN_ICON_URL = 'https://iili.io/n3rYXyu.png';

  let appName = isAdmin ? 'Admin' : 'Order';
  let appDisplayName = appName;
  let appIcon = isAdmin ? ADMIN_ICON_URL : MENU_ICON_URL;
  const storageKey = 'pwa_installed_' + (isAdmin ? ('admin_' + slug) : ('menu_' + slug));

  // ── Branding Validation (Standard Platform Branding Always Valid) ──
  function hasValidBranding() {
    return true;
  }

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
  // Ensures authentic HTTPS manifest is ALWAYS used so Google Play WebAPK builds natively WITHOUT any Chrome badge
  function updatePwaBranding(customSettings = null) {
    try {
      slug = getActiveSlug();
      if (customSettings) {
        if ('storeName' in customSettings || 'name' in customSettings) {
          storeName = (customSettings.storeName || customSettings.name || '').trim();
        }
        if ('logo' in customSettings) {
          storeLogo = (customSettings.logo || '').trim();
        }
      }

      appName = isAdmin ? 'Admin' : 'Order';
      appDisplayName = appName;
      appIcon = isAdmin ? ADMIN_ICON_URL : MENU_ICON_URL;

      // Update in-app install banner UI in real-time
      const bannerTitle = document.getElementById('pwa-banner-title');
      const bannerImg = document.getElementById('pwa-banner-img');
      if (bannerTitle && appDisplayName) bannerTitle.textContent = appDisplayName;
      if (bannerImg && appIcon) {
        bannerImg.src = appIcon;
      }

      // Dynamic manifest resolution with authentic standardized identity
      const manifestObj = {
        id: `harpy-${isAdmin ? 'admin' : 'order'}-${slug}-v38`,
        name: appName,
        short_name: appName,
        description: isAdmin ? `Order Admin — Dashboard & Kitchen` : `Order — Smart Digital Menu`,
        start_url: isAdmin ? `./admin.html?m=${slug}` : `./index.html?m=${slug}`,
        scope: isAdmin ? `./admin.html` : `./`,
        display: "standalone",
        background_color: "#120e0c",
        theme_color: "#ea580c",
        orientation: "portrait",
        icons: [
          {
            src: appIcon,
            sizes: "512x512",
            type: isAdmin ? "image/png" : "image/jpeg",
            purpose: "any"
          },
          {
            src: appIcon,
            sizes: "192x192",
            type: isAdmin ? "image/png" : "image/jpeg",
            purpose: "any"
          },
          {
            src: appIcon,
            sizes: "512x512",
            type: isAdmin ? "image/png" : "image/jpeg",
            purpose: "maskable"
          }
        ]
      };

      const authenticHref = isAdmin 
        ? `admin-manifest-${slug}.json?v=38.0` 
        : `manifest-${slug}.json?v=38.0`;

      let manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = authenticHref;
        document.head.appendChild(manifestLink);
      } else if (manifestLink.getAttribute('href') !== authenticHref) {
        manifestLink.setAttribute('href', authenticHref);
      }

      if (navigator.serviceWorker) {
        const sendMsg = (worker) => {
          try {
            if (worker) {
              worker.postMessage({
                type: 'SET_DYNAMIC_MANIFEST',
                slug: slug,
                isAdmin: isAdmin,
                manifest: manifestObj
              });
            }
          } catch(e) {}
        };
        if (navigator.serviceWorker.controller) {
          sendMsg(navigator.serviceWorker.controller);
        } else if (navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(reg => {
            if (reg && reg.active) sendMsg(reg.active);
          }).catch(() => {});
        }
      }

      // Update Apple iOS Safari home screen icon, favicon & titles dynamically
      try {
        let appleTouch = document.querySelector('link[rel="apple-touch-icon"]');
        if (!appleTouch) {
          appleTouch = document.createElement('link');
          appleTouch.rel = 'apple-touch-icon';
          document.head.appendChild(appleTouch);
        }
        appleTouch.href = appIcon;
        let favicon = document.querySelector('link[rel="icon"]');
        if (favicon) favicon.href = appIcon;
      } catch(e) {}

      if (storeName) {
        try {
          document.title = isAdmin ? `لوحة تحكم: ${storeName}` : `منيو: ${storeName}`;
          let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
          if (appleTitle) appleTitle.content = appName;
          let appMeta = document.querySelector('meta[name="application-name"]');
          if (appMeta) appMeta.content = appName;
        } catch(e) {}
      }

      // Sync install UI buttons and banner with updated branding
      if (typeof updateInstallUI === 'function') {
        updateInstallUI();
      }
    } catch (err) {
      console.warn('[PWA] Branding update error:', err);
    }
  }
  updatePwaBranding();

  // ── 2. Clean Update Engine ("متظهرش تاني طالما مفيش تحديث وطالما الشخص حدّث") ───
  const CURRENT_PWA_BUILD = 'v38.0';

  function isUpdateAlreadyHandled() {
    try {
      const applied = localStorage.getItem('harpy_pwa_build_applied');
      const dismissed = localStorage.getItem('harpy_pwa_build_dismissed');
      return (applied === CURRENT_PWA_BUILD || dismissed === CURRENT_PWA_BUILD);
    } catch(e) {
      return false;
    }
  }

  function showUpdateNotification(updateData = {}) {
    // If already applied or dismissed for this build, NEVER show
    if (isUpdateAlreadyHandled()) return;
    if (document.getElementById('harpy-pwa-update-modal')) return;
    ensurePwaStyles();

    const currentSlug = updateData.slug || getActiveSlug();
    const displayLogo = isAdmin ? ADMIN_ICON_URL : MENU_ICON_URL;
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
          تحديث جديد متوفر 🚀
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
            يتوفر إصدار أحدث لتحسين استقرار وسرعة التطبيق.
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
      // Save permanently for this build so it NEVER shows again
      try { localStorage.setItem('harpy_pwa_build_dismissed', CURRENT_PWA_BUILD); } catch(e) {}
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

      // 1. Mark permanently as applied in localStorage so it NEVER shows again!
      try {
        localStorage.setItem('harpy_pwa_build_applied', CURRENT_PWA_BUILD);
      } catch(e) {}

      // 2. Command Service Worker to activate immediately and clear old caches
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

      // 3. Dismiss modal smoothly and reload window
      showToast(`🎉 تم تحديث التطبيق بنجاح!`);
      card.style.animation = 'pwaUpdateFadeOut 0.25s forwards';
      backdrop.style.opacity = '0';
      setTimeout(() => {
        try { card.remove(); backdrop.remove(); } catch(e) {}
        window.location.reload();
      }, 400);
    });
  }

  // ── 3. Listen for Store Settings Live Updates (DOM updates only, NO popups) ──
  window.addEventListener('harpy_settings_updated', (e) => {
    if (e && e.detail) {
      updatePwaBranding(e.detail);
    }
  });
  window.addEventListener('store_settings_updated', () => {
    try {
      const s = JSON.parse(localStorage.getItem('harpy_' + getActiveSlug() + '_settings') || '{}');
      if (s) {
        updatePwaBranding(s);
      }
    } catch(e) {}
  });

  window.updatePwaBranding = updatePwaBranding;
  window.updateDynamicManifest = updatePwaBranding;
  window.checkForPwaUpdates = function() {}; // Prevent any external false alarms

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

  function saveStoredIdentity(targetSlug, data) {
    try {
      if (targetSlug && data) {
        localStorage.setItem('harpy_installed_identity_' + targetSlug, JSON.stringify(data));
      }
    } catch(e) {}
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

  // ── 5. Register Service Worker with Clean Update Engine ───────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = './sw.js?v=38.0';
      navigator.serviceWorker.register(swUrl)
        .then(reg => {
          window.__swRegistration = reg;
          try { reg.update(); } catch(e) {}

          // If user already updated or dismissed this build, NEVER show
          if (isUpdateAlreadyHandled()) return;

          if (reg.waiting && navigator.serviceWorker.controller) {
            showUpdateNotification({
              slug: getActiveSlug(),
              newName: storeName || 'Order',
              newLogo: isAdmin ? ADMIN_ICON_URL : MENU_ICON_URL,
              isSystemUpdate: true
            });
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (!isUpdateAlreadyHandled()) {
                    showUpdateNotification({
                      slug: getActiveSlug(),
                      newName: storeName || 'Order',
                      newLogo: isAdmin ? ADMIN_ICON_URL : MENU_ICON_URL,
                      isSystemUpdate: true
                    });
                  }
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
    updateInstallUI();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.__deferredPWAInstallPrompt = null;
    markAppAsInstalled();
    updateInstallUI();
    showToast(`🎉 تم تثبيت ${appDisplayName} بنجاح كبرنامج مستقل على جهازك.`);
  });

  // ── 7. Smart Install UI Controller (Header Buttons + Bottom Banner) ──
  function updateInstallUI() {
    const installed = isAppInstalled();
    const valid = hasValidBranding();

    const adminBtn = document.getElementById('btn-admin-install-app');
    const menuBtn = document.getElementById('btn-menu-install-app');
    const banner = document.getElementById('order-pwa-banner');

    if (installed || !valid) {
      if (adminBtn) adminBtn.style.display = 'none';
      if (menuBtn) menuBtn.style.display = 'none';
      if (banner) banner.remove();
      return;
    }

    // App is NOT installed AND Branding IS Valid:
    if (adminBtn && isAdmin) {
      adminBtn.style.display = 'inline-flex';
      const btnText = document.getElementById('btn-admin-install-text');
      if (btnText) btnText.textContent = 'تثبيت تطبيق Admin';
    }
    if (menuBtn && !isAdmin) {
      menuBtn.style.display = 'inline-flex';
      const btnText = document.getElementById('btn-menu-install-text');
      if (btnText) btnText.textContent = 'تثبيت تطبيق Order';
    }

    renderInstallBanner();
  }

  // ── 8. Render In-App Floating Install Banner ─────────────────
  function renderInstallBanner() {
    if (isAppInstalled() || !hasValidBranding()) {
      const existing = document.getElementById('order-pwa-banner');
      if (existing) existing.remove();
      return;
    }
    if (document.getElementById('order-pwa-banner')) {
      const bannerTitle = document.getElementById('pwa-banner-title');
      const bannerImg = document.getElementById('pwa-banner-img');
      if (bannerTitle && appDisplayName) bannerTitle.textContent = appDisplayName;
      if (bannerImg && appIcon) bannerImg.src = appIcon;
      return;
    }
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
            تثبيت مباشر وسريع كـ Application مستقل
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

  // ── 9. Celebratory Install Modal Immediately After Saving Settings ───
  function showInstallNowModal(opts = {}) {
    if (isAppInstalled()) return;
    const targetName = (opts.name || storeName || '').trim();
    const targetLogo = isAdmin ? ADMIN_ICON_URL : MENU_ICON_URL;
    if (!hasValidBranding()) return;

    if (document.getElementById('harpy-pwa-install-modal')) return;
    ensurePwaStyles();

    const displayTitle = isAdmin ? 'تطبيق Admin' : 'تطبيق Order';

    const backdrop = document.createElement('div');
    backdrop.id = 'harpy-pwa-install-backdrop';
    backdrop.style.cssText = 'position: fixed; inset: 0; z-index: 999998; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); opacity: 0; transition: opacity 0.3s ease;';

    const card = document.createElement('div');
    card.id = 'harpy-pwa-install-modal';
    card.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.94);
      z-index: 999999;
      width: calc(100% - 32px);
      max-width: 430px;
      background: linear-gradient(145deg, #1c1815, #120e0c);
      border: 1.5px solid rgba(234, 88, 12, 0.65);
      border-radius: 22px;
      padding: 24px 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(234,88,12,0.35);
      color: #ffffff;
      direction: rtl;
      font-family: inherit;
      box-sizing: border-box;
      text-align: center;
      transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    card.innerHTML = `
      <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(234,88,12,0.18); border:1px solid rgba(234,88,12,0.45); padding:6px 14px; border-radius:30px; font-size:12.5px; font-weight:800; color:#fb923c; margin-bottom:16px;">
        <span style="width:8px; height:8px; border-radius:50%; background:#f97316; display:inline-block; animation: harpyPulseGlow 1.5s infinite;"></span>
        🎉 تم حفظ هوية المطعم بنجاح!
      </div>

      <div style="position:relative; width:84px; height:84px; border-radius:22px; overflow:hidden; margin:0 auto 14px auto; background:#120e0c; border:2.5px solid rgba(249,115,22,0.6); box-shadow:0 8px 25px rgba(0,0,0,0.6);">
        <img src="${targetLogo}" alt="${displayTitle}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.src='${fallbackIcon}'">
      </div>

      <h3 style="font-size:19px; font-weight:900; color:#ffffff; margin:0 0 6px 0; line-height:1.3;">
        ${displayTitle}
      </h3>
      <p style="font-size:13px; color:#d6d3d1; margin:0 0 20px 0; line-height:1.5;">
        يمكنك الآن تثبيت ${isAdmin ? 'لوحة التحكم' : 'تطبيق المنيو'} كـ <strong style="color:#f97316;">Application مستقل</strong> على هاتفك أو جهازك لسرعة الوصول وإدارة الطلبات 📲
      </p>

      <div style="display:flex; flex-direction:column; gap:10px;">
        <button id="btn-modal-install-now" style="width:100%; background:linear-gradient(135deg, #ea580c, #f97316); color:#fff; border:none; border-radius:14px; padding:13px 18px; font-size:14.5px; font-weight:800; cursor:pointer; font-family:inherit; box-shadow:0 6px 22px rgba(234,88,12,0.45); display:flex; align-items:center; justify-content:center; gap:8px;">
          <span>📲 تثبيت التطبيق الآن</span>
        </button>
        <button id="btn-modal-install-dismiss" style="width:100%; background:rgba(255,255,255,0.06); color:#a8a29e; border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:11px 16px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit;">
          لاحقاً
        </button>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(card);
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      card.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    const closeHandler = () => {
      backdrop.style.opacity = '0';
      card.style.transform = 'translate(-50%, -50%) scale(0.92)';
      card.style.opacity = '0';
      setTimeout(() => {
        try { card.remove(); backdrop.remove(); } catch(e) {}
      }, 300);
    };

    document.getElementById('btn-modal-install-dismiss').addEventListener('click', closeHandler);
    backdrop.addEventListener('click', closeHandler);

    document.getElementById('btn-modal-install-now').addEventListener('click', () => {
      closeHandler();
      setTimeout(() => {
        window.triggerPWAInstall();
      }, 150);
    });
  }

  // ── 10. Direct Native App Install Trigger ────────────────────
  window.triggerPWAInstall = async function() {
    const installBtn = document.getElementById('btn-pwa-banner-install');
    const origText = installBtn ? installBtn.textContent : 'تثبيت الآن';

    // Fast-wait for deferredPrompt if user clicked immediately
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
        }, 1500);
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
          updateInstallUI();
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
    if (isAppInstalled()) {
      showToast(`✅ ${appDisplayName} مثبت بالفعل كـ Application على جهازك!`);
      return;
    }

    // 4. Fallback for in-app browsers (Facebook, Instagram, etc.)
    showToast(`💡 لتثبيت التطبيق: اضغط على قائمة المتصفح (⋮) واختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية 📲".`);
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
  window.hasValidBranding = hasValidBranding;
  window.updateInstallUI = updateInstallUI;
  window.showInstallNowModal = showInstallNowModal;
  window.renderInstallBanner = renderInstallBanner;
  window.markAppAsInstalled = markAppAsInstalled;
  window.isAppInstalled = isAppInstalled;
  window.updatePwaBranding = updatePwaBranding;
  window.updateDynamicManifest = updatePwaBranding;

  // Auto-init on DOM ready
  async function initInstallState() {
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const apps = await navigator.getInstalledRelatedApps();
        if (apps && apps.length > 0) {
          markAppAsInstalled();
          updateInstallUI();
          return;
        }
      } catch (e) {}
    }
    updateInstallUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initInstallState, 250);
    });
  } else {
    setTimeout(initInstallState, 250);
  }
})();
