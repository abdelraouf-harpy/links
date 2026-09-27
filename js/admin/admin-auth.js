// ═══════════════════════════════════════════════════════════
// HarpyOrder — Multi-Tenant Auth Gate & Subscription Watcher
// ═══════════════════════════════════════════════════════════

// ── Multi-Tenant Auth Gate with Safe Subscriptions ─────────
function setupAuth() {
  const slug = Store.getRestaurantSlug();
  let syncUnsubscribe = null;
  let ordersUnsubscribe = null;

  const unlockDashboard = async () => {
    isAuthenticated = true;
    document.documentElement.classList.remove('admin-locked');
    document.documentElement.classList.add('admin-unlocked');
    if (adminElements.loginModal) adminElements.loginModal.classList.remove('open');
    if (adminElements.loginBackdrop) adminElements.loginBackdrop.classList.remove('open');
    if (adminElements.btnAdminLogout) adminElements.btnAdminLogout.style.display = 'inline-flex';
    
    // Fast-resolve preloaded cloud data before rendering to eliminate flash on refresh
    if (window.__harpyPreloadPromise) {
      try {
        const hasCachedSettings = !!(Store.getSettings() && Store.getSettings().storeName);
        const maxWaitMs = hasCachedSettings ? 350 : 1200;
        const preloadData = await Promise.race([
          window.__harpyPreloadPromise,
          new Promise(r => setTimeout(() => r(null), maxWaitMs))
        ]);
        if (preloadData && typeof preloadData === 'object') {
          Store.applySnapshotData(preloadData);
        }
      } catch(e) {}
    }

    loadAllDashboardData();

    // Dismiss native splash shield smoothly with instant complete reveal
    const splash = document.getElementById('admin-splash-shield');
    if (splash) {
      requestAnimationFrame(() => {
        splash.classList.add('fade-out');
        setTimeout(() => { try { splash.remove(); } catch(e) {} }, 240);
      });
    }

    // Clean up previous listeners
    if (typeof syncUnsubscribe === 'function') syncUnsubscribe();
    if (typeof ordersUnsubscribe === 'function') ordersUnsubscribe();

    // Subscribe to real-time cloud changes with stale-snapshot protection
    syncUnsubscribe = Store.syncFromCloud(slug, (status) => {
      if (status && status.hasData && !Store.saveLocks.settings && !Store.saveLocks.products) {
        renderCatalog();
        renderCategoriesList();
        renderStoriesList();
        if (typeof renderPOSCategories === 'function') renderPOSCategories();
        if (typeof renderPOSProducts === 'function') renderPOSProducts();
        loadSettingsIntoForm();
        renderRestaurantHub();
        checkOnboardingSetup();
        const curSettings = Store.getSettings();
        if (typeof window.updateAllBrandHeadings === 'function') {
          window.updateAllBrandHeadings(curSettings.storeName);
        }
        if (typeof window.updatePwaBranding === 'function') {
          window.updatePwaBranding(curSettings);
        }
      }
    });

    // Subscribe to real-time incoming orders
    ordersUnsubscribe = Store.syncOrdersFromCloud(slug, (orders) => {
      renderOrdersList(orders);
      renderInvoicesArchive(orders);
    });

    listenToSessionRevocation();
  };

  const listenToSessionRevocation = () => {
    if (typeof db === 'undefined' || !db) return;
    const slug = Store.getRestaurantSlug();
    const localAuth = Store.safeGetItem(`harpy_admin_auth_${slug}`);
    if (!localAuth) return;
    let session = null;
    try { session = JSON.parse(localAuth); } catch(e) { return; }
    if (!session || !session.sessionVersion) return;

    db.ref(`restaurants/${slug}/meta/sessionVersion`).on('value', (snap) => {
      const liveVersion = snap.val();
      if (liveVersion && session.sessionVersion && liveVersion > session.sessionVersion) {
        db.ref(`restaurants/${slug}/meta/sessionVersion`).off();
        showToastNotification("تم تغيير كلمة مرور هذا المطعم وتم إنهاء جلستك من كافة الأجهزة.", "error");
        setTimeout(async () => {
          await Store.logoutAdmin();
          window.location.reload();
        }, 1200);
      }
    });
  };

  const lockDashboard = () => {
    isAuthenticated = false;
    document.documentElement.classList.remove('admin-unlocked');
    document.documentElement.classList.add('admin-locked');
    const splash = document.getElementById('admin-splash-shield');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => { try { splash.remove(); } catch(e) {} }, 150);
    }
    if (typeof syncUnsubscribe === 'function') syncUnsubscribe();
    if (typeof ordersUnsubscribe === 'function') ordersUnsubscribe();
    if (adminElements.loginModal) adminElements.loginModal.classList.add('open');
    if (adminElements.loginBackdrop) adminElements.loginBackdrop.classList.add('open');
    if (adminElements.btnAdminLogout) adminElements.btnAdminLogout.style.display = 'none';

    // Populate restaurant identity in login modal
    const modalTitle = document.getElementById('login-modal-restaurant-name');
    const modalSub = document.getElementById('login-modal-subtitle');
    const storeSettings = Store.getSettings ? Store.getSettings(slug) : null;
    const storeName = (storeSettings && storeSettings.name) ? storeSettings.name : (slug === 'saj' ? 'مطعم صاج' : slug);
    if (modalTitle) modalTitle.textContent = `إدارة: ${storeName}`;
    if (modalSub) modalSub.textContent = 'أدخل كلمة مرور الإدارة للدخول المباشر إلى لوحة التحكم';
    if (adminElements.adminEmailInput && !adminElements.adminEmailInput.value) {
      adminElements.adminEmailInput.value = slug;
    }
  };

  // Check URL for direct login query params (?p=... or ?pass=...)
  const checkUrlAutoAuth = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pass = urlParams.get('p') || urlParams.get('pass') || urlParams.get('password');
    if (pass) {
      try {
        await Store.loginAdmin(slug, pass);
        unlockDashboard();
        return true;
      } catch(e) {}
    }
    return false;
  };

  // Check active session on load
  if (Store.isAdminAuthenticated(slug)) {
    unlockDashboard();
  } else {
    checkUrlAutoAuth().then(autoSuccess => {
      if (!autoSuccess && !isAuthenticated) {
        lockDashboard();
      }
    });
  }

  // Listen to Firebase Auth state
  Store.onAuthStateChanged(async (user) => {
    if (user) {
      // Strict Guard: If local session for this tenant does not exist (e.g. user logged out),
      // do NOT auto-unlock even if Firebase Auth still has a cached user!
      if (!Store.isAdminAuthenticated(slug)) {
        console.warn(`[Admin] Firebase Auth user (${user.email}) present but local session for ${slug} is absent. Keeping dashboard locked.`);
        lockDashboard();
        return;
      }

      const authCheck = await Store.verifyTenantOwnership(slug, user.uid);
      const isOwner = (authCheck && typeof authCheck === 'object') ? authCheck.isOwner : !!authCheck;
      const mismatchConfirmed = (authCheck && typeof authCheck === 'object') ? authCheck.mismatchConfirmed : false;

      if (isOwner) {
        if (!isAuthenticated) {
          unlockDashboard();
        } else {
          // Re-sync orders now that Firebase Auth identity is confirmed
          if (typeof ordersUnsubscribe === 'function') ordersUnsubscribe();
          ordersUnsubscribe = Store.syncOrdersFromCloud(slug, (orders) => {
            renderOrdersList(orders);
            renderInvoicesArchive(orders);
          });
        }
      } else if (mismatchConfirmed) {
        // Logged-in Firebase user does not belong to this restaurant (e.g. switched from another tenant)
        console.warn(`[Admin] Active Firebase user (${user.email}) does not own ${slug}. Logging out mismatched session.`);
        await Store.logoutAdmin();
        lockDashboard();
        if (adminElements.loginErrorMsg) {
          adminElements.loginErrorMsg.textContent = "يرجى تسجيل الدخول بكلمة مرور هذا المطعم لتفعيل المزامنة.";
          adminElements.loginErrorMsg.style.display = 'block';
        }
      } else {
        // Network timeout or transient verification failure on mobile - preserve authenticated state
        console.warn(`[Admin] Could not verify ownership due to transient network state for ${user.email}. Preserving active session.`);
        if (Store.isAdminAuthenticated(slug) && !isAuthenticated) {
          unlockDashboard();
        }
      }
    } else {
      // User is not authenticated in Firebase Auth (user == null)
      if (!Store.isAdminAuthenticated(slug)) {
        lockDashboard();
      } else {
        // Local/DB authenticated session exists (e.g. authenticated via DB meta adminPassword)
        if (!isAuthenticated) {
          unlockDashboard();
        }
      }
    }
  });

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    const identifier = (adminElements.adminEmailInput?.value || '').trim();
    const password = (adminElements.adminPasswordInput?.value || '').trim();

    if (!password) {
      if (adminElements.loginErrorMsg) {
        adminElements.loginErrorMsg.textContent = "يرجى إدخال كلمة مرور الإدارة";
        adminElements.loginErrorMsg.style.display = 'block';
      }
      return;
    }

    if (adminElements.btnLogin) {
      adminElements.btnLogin.disabled = true;
      adminElements.btnLogin.textContent = "...جاري التحقق والدخول";
    }
    if (adminElements.loginErrorMsg) {
      adminElements.loginErrorMsg.style.display = 'none';
    }

    try {
      await Store.loginAdmin(identifier || slug, password);
      unlockDashboard();
    } catch (err) {
      console.warn("[Admin] Login failed:", err);
      let msg = "كلمة المرور غير صحيحة لهذا المطعم. يرجى التأكد والمحاولة مجدداً.";
      if (err.code === 'auth/too-many-requests') {
        msg = "تم تجاوز عدد المحاولات المسموح به. يرجى المحاولة لاحقاً.";
      }
      if (adminElements.loginErrorMsg) {
        adminElements.loginErrorMsg.textContent = msg;
        adminElements.loginErrorMsg.style.display = 'block';
      }
    } finally {
      if (adminElements.btnLogin) {
        adminElements.btnLogin.disabled = false;
        adminElements.btnLogin.textContent = "دخول لوحة التحكم 🚀";
      }
    }
  };

  if (adminElements.adminLoginForm) {
    adminElements.adminLoginForm.addEventListener('submit', handleLoginSubmit);
  }
  if (adminElements.btnLogin) {
    adminElements.btnLogin.addEventListener('click', handleLoginSubmit);
  }

  // Handle Logout
  if (adminElements.btnAdminLogout) {
    adminElements.btnAdminLogout.addEventListener('click', async () => {
      const confirmed = await showCustomConfirm({
        title: "تسجيل الخروج",
        message: "هل تود تسجيل الخروج من لوحة التحكم؟",
        icon: "🚪",
        confirmText: "تسجيل الخروج",
        cancelText: "إلغاء",
        isDanger: false
      });
      if (confirmed) {
        // 1. Immediately lock dashboard in UI and cancel active real-time listeners
        lockDashboard();
        // 2. Clear input fields and error messages
        if (adminElements.adminPasswordInput) adminElements.adminPasswordInput.value = '';
        if (adminElements.loginErrorMsg) adminElements.loginErrorMsg.style.display = 'none';
        // 3. Perform clean logout in Store (wiping storage & signing out of Firebase)
        await Store.logoutAdmin();
        showToastNotification("تم تسجيل الخروج بنجاح", "info");
      }
    });
  }
}

function setupRestaurantHub() {
  const btnCopy = document.getElementById('btn-copy-restaurant-link');

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const linkEl = document.getElementById('tenant-share-link');
      if (!linkEl) return;
      const text = linkEl.href || linkEl.textContent;
      navigator.clipboard.writeText(text);
      
      const copyText = document.getElementById('copy-store-link-text');
      if (copyText) copyText.textContent = "تم النسخ ✓";
      btnCopy.classList.add('btn-primary');
      btnCopy.classList.remove('btn-ghost');

      setTimeout(() => {
        if (copyText) copyText.textContent = "نسخ رابط المنيو";
        btnCopy.classList.remove('btn-primary');
        btnCopy.classList.add('btn-ghost');
      }, 2500);
    });
  }

  window.addEventListener('harpy_restaurant_changed', () => {
    renderRestaurantHub();
    loadAllDashboardData();
  });
}

function updateAllBrandHeadings(customName = null) {
  const slug = Store.getRestaurantSlug();
  const settings = Store.getSettings();
  const brandName = (customName || settings.storeName || '').trim() || `مطعم ${slug}`;

  const adminStoreName = document.getElementById('admin-store-name');
  if (adminStoreName) adminStoreName.textContent = `إدارة: ${brandName}`;

  const activeTitle = document.getElementById('active-restaurant-title');
  if (activeTitle) activeTitle.textContent = brandName;

  const setStoreName = document.getElementById('set-store-name');
  if (setStoreName && !setStoreName.matches(':focus') && brandName !== `مطعم ${slug}`) {
    setStoreName.value = brandName;
  }
}
window.updateAllBrandHeadings = updateAllBrandHeadings;

function renderRestaurantHub() {
  const slug = Store.getRestaurantSlug();
  const settings = Store.getSettings();
  const shareLink = document.getElementById('tenant-share-link');
  const previewBtn = document.getElementById('btn-live-preview');

  updateAllBrandHeadings(settings.storeName);

  const isFile = window.location.protocol === 'file:';
  const cleanPath = window.location.pathname.replace('admin.html', '').replace(/\/admin\/?$/, '').replace(/\/$/, '');
  const targetUrl = isFile
    ? window.location.href.replace('admin.html', 'order.html').split('?')[0] + `?m=${slug}`
    : (window.location.hostname.includes('harpymenu.com') 
        ? `https://harpymenu.com/${slug}` 
        : window.location.origin + cleanPath + `/order.html?m=${slug}`);

  if (shareLink) {
    shareLink.textContent = targetUrl.replace(/^https?:\/\//, '');
    shareLink.href = targetUrl;
  }
  if (previewBtn) {
    previewBtn.href = isFile ? `./order.html?m=${slug}` : targetUrl;
  }
  const openStoreBtn = document.getElementById('btn-open-store-link');
  if (openStoreBtn) {
    openStoreBtn.href = isFile ? `./order.html?m=${slug}` : targetUrl;
  }
}

function checkOnboardingSetup() {
  if (Store.isCloudDataLoaded && !Store.isCloudDataLoaded()) {
    return;
  }
  const settings = Store.getSettings();
  const existingBanner = document.getElementById('onboarding-setup-banner');
  const isIncomplete = !settings.storeName || !settings.whatsappNumber;

  if (isIncomplete) {
    if (!existingBanner) {
      const banner = document.createElement('div');
      banner.id = 'onboarding-setup-banner';
      banner.style.cssText = `
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.25);
        color: var(--text-main);
        padding: 16px 20px;
        border-radius: var(--radius-md, 12px);
        margin-bottom: 20px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        font-size: 0.88rem;
        line-height: 1.6;
      `;
      banner.innerHTML = `
        <svg style="width:26px;height:26px;flex-shrink:0;color:#f59e0b;margin-top:2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <div style="font-weight:900; font-size:0.95rem; color:#f59e0b; margin-bottom:4px;">إعداد المطعم في انتظار الاستكمال</div>
          <div style="font-size:0.84rem; color:var(--text-muted);">يرجى ضبط اسم المطعم ورقم الواتساب لاستقبال طلبات الزبائن مباشرة:</div>
          <ul style="margin:6px 0 0 0; padding-right:18px; font-size:0.82rem; color:var(--text-main);">
            ${!settings.storeName ? '<li>اسم المطعم مطلوب</li>' : ''}
            ${!settings.whatsappNumber ? '<li>رقم واتساب استقبال الطلبات مطلوب</li>' : ''}
          </ul>
          <div style="margin-top:10px;">
            <button onclick="document.querySelector('[data-tab=tab-settings]').click();" class="btn btn-primary btn-sm" style="font-weight:800; padding:6px 14px; font-size:0.82rem;">
              استكمال الإعدادات الآن ←
            </button>
          </div>
        </div>
      `;
      const container = document.querySelector('main.container') || document.body;
      container.insertBefore(banner, container.firstChild);
    }
  } else {
    if (existingBanner) existingBanner.remove();
  }
}

window.verifyAdminCredentials = async function(enteredPassword, slug) {
  if (!enteredPassword) return false;
  slug = slug || (typeof Store !== 'undefined' ? Store.getRestaurantSlug() : 'saj');
  
  // 1. Verify against meta.adminPassword in Firebase RTDB
  if (typeof db !== 'undefined' && db) {
    try {
      const snap = await db.ref(`restaurants/${slug}/meta`).once('value');
      const meta = snap.val() || {};
      const realPwd = (meta.adminPassword || '').trim();
      if (realPwd && enteredPassword === realPwd) {
        try { localStorage.setItem(`harpy_${slug}_meta`, JSON.stringify(meta)); } catch(e) {}
        return true;
      }
    } catch (e) {}
  }

  // 2. If not verified yet, verify via Firebase Auth
  if (typeof auth !== 'undefined' && auth) {
    try {
      const sessionStr = localStorage.getItem(`harpy_admin_auth_${slug}`) || sessionStorage.getItem(`harpy_auth_${slug}`);
      let email = `${slug}@${slug}.com`;
      if (sessionStr) {
        try { email = JSON.parse(sessionStr).email || email; } catch(e) {}
      }
      await auth.signInWithEmailAndPassword(email, enteredPassword);
      return true;
    } catch (authErr) {}
  }

  return false;
};

function setupSubscriptionWatcher() {
  const suspendedBackdrop = document.getElementById('subscription-suspended-backdrop');
  const suspendedOverlay = document.getElementById('subscription-suspended-overlay');
  const contactBtn = document.getElementById('admin-sub-contact-btn');
  const msgEl = document.getElementById('admin-sub-suspended-msg');
  const titleEl = document.getElementById('admin-sub-suspended-title');
  const iconEl = document.getElementById('admin-sub-suspended-icon');

  const slug = Store.getRestaurantSlug();
  const cachedStatus = localStorage.getItem(`harpy_${slug}_sub_status`);

  const applyAdminStatusUI = (statusReason) => {
    document.body.classList.add('harpy-account-locked');
    if (suspendedBackdrop) suspendedBackdrop.classList.add('active');
    if (suspendedOverlay) suspendedOverlay.classList.add('active');

    if (statusReason === 'deleted') {
      if (iconEl) iconEl.textContent = '🗑️';
      if (titleEl) titleEl.textContent = 'تم حذف حساب هذا المطعم نهائياً';
      if (msgEl) msgEl.textContent = 'تم حذف بيانات وترخيص هذا المطعم نهائياً من المنصة، ولم يعد متاحاً.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201019971508?text=${encodeURIComponent(`مرحباً إدارة هاربي، أود الاستفسار عن إنشاء مطعم جديد بدلاً من (${slug})`)}`;
        contactBtn.textContent = '💬 تواصل مع الإدارة لإنشاء حساب جديد';
      }
    } else if (statusReason === 'expired') {
      if (iconEl) iconEl.textContent = '⏳';
      if (titleEl) titleEl.textContent = 'انتهت صلاحية اشتراك هذا المطعم';
      if (msgEl) msgEl.textContent = 'انتهت صلاحية اشتراك هذا المطعم. يرجى تجديد الباقة لاستئناف استقبال طلبات الزبائن وتعديل المنيو.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201019971508?text=${encodeURIComponent(`مرحباً إدارة هاربي، أود تجديد اشتراك مطعمي (${slug})`)}`;
        contactBtn.textContent = '💬 تواصل مع الإدارة لتجديد الاشتراك';
      }
    } else {
      if (iconEl) iconEl.textContent = '❄️';
      if (titleEl) titleEl.textContent = 'حساب المطعم مجمّد / موقوف مؤقتاً';
      if (msgEl) msgEl.textContent = 'تم تجميد وإيقاف اشتراك هذا المطعم مؤقتاً من قبل الإدارة. يرجى التواصل لإلغاء التجميد والتفعيل.';
      if (contactBtn) {
        contactBtn.href = `https://wa.me/201019971508?text=${encodeURIComponent(`مرحباً إدارة هاربي، أود تفعيل وإلغاء تجميد مطعمي (${slug})`)}`;
        contactBtn.textContent = '💬 تواصل مع الإدارة للتفعيل والتجديد';
      }
    }
  };

  if (cachedStatus === 'suspended' || cachedStatus === 'blocked' || cachedStatus === 'expired' || cachedStatus === 'deleted') {
    applyAdminStatusUI(cachedStatus);
  }

  Store.startSubscriptionWatcher((status) => {
    if (!status.active) {
      applyAdminStatusUI(status.reason);
      if (status.reason === 'deleted') {
        try { Store.logoutAdmin(slug); } catch(err) {}
      }
    } else {
      document.body.classList.remove('harpy-account-locked');
      if (suspendedBackdrop) suspendedBackdrop.classList.remove('active');
      if (suspendedOverlay) suspendedOverlay.classList.remove('active');
    }
  });

  window.addEventListener('harpy_subscription_status', (e) => {
    if (e && e.detail && !e.detail.active) {
      applyAdminStatusUI(e.detail.reason);
      if (e.detail.reason === 'deleted') {
        try { Store.logoutAdmin(slug); } catch(err) {}
      }
    }
  });
}


window.setupAuth = setupAuth;
window.setupRestaurantHub = setupRestaurantHub;
window.renderRestaurantHub = renderRestaurantHub;
window.checkOnboardingSetup = checkOnboardingSetup;
window.setupSubscriptionWatcher = setupSubscriptionWatcher;
