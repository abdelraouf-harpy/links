
function safeEscape(str) {
  if (typeof window.escapeHtml === 'function') return window.escapeHtml(str);
  if (typeof Store !== 'undefined' && typeof Store.escapeHtml === 'function') return Store.escapeHtml(str);
  return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
// ═══════════════════════════════════════════════════════════
// HarpyOrder — Settings, Identity, Theme Presets & Delivery Zones
// ═══════════════════════════════════════════════════════════

let logoImageUploader = null;
let coverImageUploader = null;
let portfolioBgImageUploader = null;

// ── Settings & Identity Studio ─────────────────────────────
function setupSettingsForm() {
  logoImageUploader = bindDeviceImageUploader({
    dropzoneId: 'logo-dropzone',
    fileInputId: 'set-logo-file',
    promptId: 'logo-prompt',
    previewWrapId: 'logo-preview-wrap',
    previewImgId: 'logo-preview-img',
    removeBtnId: 'btn-remove-logo',
    hiddenUrlInputId: 'set-logo-url',
    directUrlInputId: 'set-logo-url-direct'
  });

  coverImageUploader = bindDeviceImageUploader({
    dropzoneId: 'cover-dropzone',
    fileInputId: 'set-cover-file',
    promptId: 'cover-prompt',
    previewWrapId: 'cover-preview-wrap',
    previewImgId: 'cover-preview-img',
    removeBtnId: 'btn-remove-cover',
    hiddenUrlInputId: 'set-cover-url',
    directUrlInputId: 'set-cover-url-direct'
  });




  if (adminElements.setStoreName) {
    adminElements.setStoreName.addEventListener('input', (e) => {
      const val = (e.target.value || '').trim();
      if (val && typeof window.updateAllBrandHeadings === 'function') {
        window.updateAllBrandHeadings(val);
      }
    });
  }

  if (adminElements.btnAddPromoCode) {
    adminElements.btnAddPromoCode.addEventListener('click', async () => {
      const code = (adminElements.newPromoCode?.value || '').trim().toUpperCase();
      const type = adminElements.newPromoType?.value || 'percent';
      const val = parseFloat(adminElements.newPromoVal?.value) || 0;

      if (!code || val <= 0) {
        showToastNotification("يرجى إدخال كود وقيمة صحيحة للكوبون", "error");
        return;
      }

      const settings = Store.getSettings();
      settings.promoCodes = settings.promoCodes || [];
      settings.promoCodes.push({ code, type, value: val, desc: `خصم ${val}${type === 'percent' ? '%' : ' ج.م'}` });
      await Store.saveSettings(settings);

      if (adminElements.newPromoCode) adminElements.newPromoCode.value = '';
      if (adminElements.newPromoVal) adminElements.newPromoVal.value = '';
      if (adminElements.newPromoType) adminElements.newPromoType.value = 'percent';
      if (window.setSegmentedValue) window.setSegmentedValue('seg-new-promo-type', 'percent');
      renderPromoCodesList(settings.promoCodes);
      showToastNotification("تمت إضافة كود الخصم بنجاح!", "success");
    });
  }

  // Setup Multi-Branch Management
  const btnAddBranch = document.getElementById('btn-add-new-branch');
  if (btnAddBranch) {
    btnAddBranch.addEventListener('click', addAdminBranch);
  }
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('admin-branch-switcher-wrap');
    const dropdown = document.getElementById('admin-branch-dropdown');
    if (wrap && dropdown && !wrap.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // Setup Tables Management
  const btnAddTable = document.getElementById('btn-add-new-table');
  if (btnAddTable) {
    btnAddTable.addEventListener('click', addAdminTable);
  }
  const inputNewTable = document.getElementById('new-table-name-input');
  if (inputNewTable) {
    inputNewTable.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addAdminTable();
      }
    });
  }
  const btnDownloadQR = document.getElementById('btn-download-table-qr');
  if (btnDownloadQR) {
    btnDownloadQR.addEventListener('click', downloadTableQRPNG);
  }
  const btnCopyLink = document.getElementById('btn-copy-table-link');
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', copyTableLink);
  }

  if (adminElements.btnAddDeliveryZone) {
    adminElements.btnAddDeliveryZone.addEventListener('click', async () => {
      const name = (adminElements.newZoneName?.value || '').trim();
      const rawKeywords = (adminElements.newZoneKeywords?.value || '').trim();
      const fee = parseFloat(adminElements.newZoneFee?.value);

      if (!name) {
        showToastNotification("يرجى كتابة اسم المنطقة أو النطاق", "error");
        adminElements.newZoneName?.focus();
        return;
      }
      if (isNaN(fee) || fee < 0) {
        showToastNotification("يرجى تحديد سعر توصيل صحيح للمنطقة", "error");
        adminElements.newZoneFee?.focus();
        return;
      }

      // Support separating keywords with commas, Arabic commas, hyphens/dashes, slashes, or newlines
      const keywords = rawKeywords
        ? rawKeywords.split(/[,،\-\/\|—–\n\r;]+/).map(k => k.trim()).filter(Boolean)
        : [name];

      // Ensure zone name itself is included in matching keywords
      if (!keywords.includes(name)) {
        keywords.unshift(name);
      }

      const settings = Store.getSettings();
      settings.deliverySettings = settings.deliverySettings || { defaultFee: 15, customZones: [] };
      settings.deliverySettings.customZones = settings.deliverySettings.customZones || [];
      settings.deliverySettings.customZones.push({
        name,
        keywords,
        fee
      });

      await Store.saveSettings(settings);

      if (adminElements.newZoneName) adminElements.newZoneName.value = '';
      if (adminElements.newZoneKeywords) adminElements.newZoneKeywords.value = '';
      if (adminElements.newZoneFee) adminElements.newZoneFee.value = '';

      renderDeliveryZonesList(settings.deliverySettings.customZones);
      showToastNotification(`تمت إضافة نطاق "${name}" بسعر ${fee} ج.م بنجاح!`, "success");
    });
  }

  if (adminElements.settingsForm) {
    adminElements.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsFromForm();
    });
  }
}

function updateThemePresetCardsUI() {}
window.applyPresetToPickers = function() {};

function loadSettingsIntoForm() {
  const s = Store.getSettings();
  if (typeof window.updateAllBrandHeadings === 'function') {
    window.updateAllBrandHeadings(s.storeName);
  } else {
    if (adminElements.adminStoreName) adminElements.adminStoreName.textContent = `إدارة: ${s.storeName || "منيو المطعم"}`;
    if (adminElements.setStoreName) adminElements.setStoreName.value = s.storeName || '';
  }
  if (adminElements.setStoreTagline) adminElements.setStoreTagline.value = s.storeTagline || '';
  if (adminElements.setPrinterPaperSize) {
    adminElements.setPrinterPaperSize.value = s.printerPaperSize || '80mm';
    if (window.setSegmentedValue) window.setSegmentedValue('seg-printer-paper-size', s.printerPaperSize || '80mm');
  }
  document.documentElement.setAttribute('data-paper-size', s.printerPaperSize || '80mm');
  document.body.setAttribute('data-paper-size', s.printerPaperSize || '80mm');
  if (adminElements.setCurrency) adminElements.setCurrency.value = s.currency || 'ج.م';
  if (adminElements.setWhatsapp) adminElements.setWhatsapp.value = s.whatsappNumber || '';
  if (adminElements.setWalletNumber) adminElements.setWalletNumber.value = s.walletNumber || '';
  if (adminElements.setWalletName) adminElements.setWalletName.value = s.walletName || '';
  
  const logoInput = document.getElementById('set-logo-url');
  if (logoInput) logoInput.value = s.logo || '';
  const logoDirectInput = document.getElementById('set-logo-url-direct');
  if (logoDirectInput) logoDirectInput.value = (s.logo && s.logo.startsWith('http')) ? s.logo : '';
  if (logoImageUploader) {
    if (s.logo) logoImageUploader.showPreview(s.logo);
    else logoImageUploader.clearPreview();
  }

  const coverInput = document.getElementById('set-cover-url');
  if (coverInput) coverInput.value = s.cover || '';
  const coverDirectInput = document.getElementById('set-cover-url-direct');
  if (coverDirectInput) coverDirectInput.value = (s.cover && s.cover.startsWith('http')) ? s.cover : '';
  if (coverImageUploader) {
    if (s.cover) coverImageUploader.showPreview(s.cover);
    else coverImageUploader.clearPreview();
  }

  if (adminElements.setEnableWalletDiscount) adminElements.setEnableWalletDiscount.checked = s.enableWalletDiscount !== false;
  if (adminElements.setWalletDiscountType) {
    adminElements.setWalletDiscountType.value = s.walletDiscountType || 'percent';
    if (window.setSegmentedValue) window.setSegmentedValue('seg-wallet-discount-type', s.walletDiscountType || 'percent');
  }
  if (adminElements.setWalletDiscountVal) adminElements.setWalletDiscountVal.value = s.walletDiscountValue !== undefined ? s.walletDiscountValue : 10;

  if (adminElements.setEnableSpendTier) adminElements.setEnableSpendTier.checked = s.enableSpendTierDiscount !== false;
  if (adminElements.setSpendMinAmount) adminElements.setSpendMinAmount.value = s.spendTierMinAmount || 300;
  if (adminElements.setSpendDiscountType) {
    adminElements.setSpendDiscountType.value = s.spendTierDiscountType || 'percent';
    if (window.setSegmentedValue) window.setSegmentedValue('seg-spend-discount-type', s.spendTierDiscountType || 'percent');
  }
  if (adminElements.setSpendDiscountVal) adminElements.setSpendDiscountVal.value = s.spendTierDiscountValue || 15;

  if (adminElements.setDeliveryTime) adminElements.setDeliveryTime.value = s.deliveryTime || '';
  if (adminElements.setShowAnnouncement) adminElements.setShowAnnouncement.checked = s.showAnnouncement === true;
  if (adminElements.setAnnouncementText) adminElements.setAnnouncementText.value = s.announcementText || '';
  if (adminElements.setOrderingPaused) adminElements.setOrderingPaused.checked = s.isOrderingPaused === true;
  if (adminElements.setOrderingPausedMsg) adminElements.setOrderingPausedMsg.value = s.orderingPausedMessage || '';

  const aboutInput = document.getElementById('set-about-text');
  if (aboutInput) aboutInput.value = s.aboutText || '';
  const phoneInput = document.getElementById('set-phone');
  if (phoneInput) phoneInput.value = s.phone || '';
  const addrInput = document.getElementById('set-address');
  if (addrInput) addrInput.value = s.address || '';
  const locInput = document.getElementById('set-location-url');
  if (locInput) locInput.value = s.locationUrl || '';

  const fbInput = document.getElementById('set-facebook-url');
  if (fbInput) fbInput.value = s.facebookUrl || '';
  const igInput = document.getElementById('set-instagram-url');
  if (igInput) igInput.value = s.instagramUrl || '';
  const ttInput = document.getElementById('set-tiktok-url');
  if (ttInput) ttInput.value = s.tiktokUrl || '';

  const ds = s.deliverySettings || { defaultFee: (s.deliveryFee !== undefined ? s.deliveryFee : 15), customZones: [] };
  if (adminElements.setDefaultDeliveryFee) {
    adminElements.setDefaultDeliveryFee.value = ds.defaultFee !== undefined ? ds.defaultFee : 15;
  }
  renderDeliveryZonesList(ds.customZones || []);

  renderPromoCodesList(s.promoCodes || []);
  updateThemePresetCardsUI(s.themePreset);
  renderAdminTablesList();
  renderAdminBranchesList();
  updateAdminBranchHeaderSwitcher();
}

function renderDeliveryZonesList(zones = []) {
  if (!adminElements.deliveryZonesList) return;
  if (!zones || zones.length === 0) {
    adminElements.deliveryZonesList.innerHTML = `
      <div style="font-size:11.5px; color:var(--text-muted); padding:6px 0;">
        لا توجد نطاقات مخصصة مضافة حالياً. (يطبق السعر الموحد على كافة الأماكن)
      </div>
    `;
    return;
  }
  adminElements.deliveryZonesList.innerHTML = zones.map((z, idx) => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-raised); border:1px solid var(--border); padding:8px 12px; border-radius:6px; font-size:12px; gap:8px;">
      <div style="min-width:0;">
        <div style="font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span>${z.name}</span>
          <span class="font-num" style="color:var(--primary); font-weight:900;">${parseFloat(z.fee).toFixed(0)} ج.م</span>
        </div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
          الكلمات: <span style="color:var(--text-body); font-weight:600;">${(z.keywords || []).join('، ')}</span>
        </div>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px; font-weight:800; flex-shrink:0;" onclick="deleteDeliveryZoneFast(${idx})">حذف</button>
    </div>
  `).join('');
}

window.deleteDeliveryZoneFast = async function(index) {
  const settings = Store.getSettings();
  settings.deliverySettings = settings.deliverySettings || { defaultFee: 15, customZones: [] };
  settings.deliverySettings.customZones = settings.deliverySettings.customZones || [];
  settings.deliverySettings.customZones.splice(index, 1);
  await Store.saveSettings(settings);
  renderDeliveryZonesList(settings.deliverySettings.customZones);
  showToastNotification("تم حذف النطاق السعري بنجاح", "success");
};

function renderPromoCodesList(promos) {
  if (!adminElements.promoCodesList) return;
  adminElements.promoCodesList.innerHTML = promos.map((p, idx) => `
    <div style="display:flex; align-items:center; gap:6px; background:var(--surface); border:1px solid var(--border); padding:4px 10px; border-radius:4px; font-size:12px;">
      <span class="font-num" style="font-weight:800; color:var(--primary);">${p.code}</span>
      <span style="color:var(--text-muted);">(${p.value}${p.type === 'percent' ? '%' : ' ج.م'})</span>
      <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:0 4px; display:inline-flex; align-items:center;" onclick="deletePromoFast(${idx})"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
    </div>
  `).join('');
}

window.deletePromoFast = async function(index) {
  const settings = Store.getSettings();
  settings.promoCodes.splice(index, 1);
  await Store.saveSettings(settings);
  renderPromoCodesList(settings.promoCodes);
  showToastNotification("تم حذف كود الخصم", "success");
};

async function saveSettingsFromForm() {
  const submitBtn = adminElements.settingsForm ? adminElements.settingsForm.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

  const newWhatsApp = (adminElements.setWhatsapp?.value || '').replace(/\D/g, '');
  if (newWhatsApp && newWhatsApp.length < 10) {
    showToastNotification('رقم الواتساب غير صحيح — يجب أن يكون 10 أرقام على الأقل', 'error');
    adminElements.setWhatsapp?.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري حفظ الإعدادات';
  }

  try {
    const current = Store.getSettings();

    let cleanLogo = (document.getElementById('set-logo-url')?.value || '').trim();
    if (!cleanLogo && document.getElementById('set-logo-url-direct')) {
      cleanLogo = (document.getElementById('set-logo-url-direct').value || '').trim();
    }
    if (cleanLogo && cleanLogo.startsWith('data:image/')) {
      try {
        if (submitBtn) submitBtn.innerHTML = 'جاري رفع الشعار إلى سحابة الصور';
        const cdnUrl = await Store.uploadImage(cleanLogo);
        if (cdnUrl && cdnUrl.startsWith('http')) {
          cleanLogo = cdnUrl;
          if (document.getElementById('set-logo-url')) document.getElementById('set-logo-url').value = cdnUrl;
          if (document.getElementById('set-logo-url-direct')) document.getElementById('set-logo-url-direct').value = cdnUrl;
        }
      } catch (err) {
        console.warn('[Admin] CDN logo upload error on save:', err);
      }
    }

    const updated = {
      ...current,
      storeName: (adminElements.setStoreName?.value || '').trim(),
      storeTagline: (adminElements.setStoreTagline?.value || '').trim(),
      currency: (adminElements.setCurrency?.value || '').trim() || 'ج.م',
      whatsappNumber: (adminElements.setWhatsapp?.value || '').trim(),
      walletNumber: (adminElements.setWalletNumber?.value || '').trim(),
      walletName: (adminElements.setWalletName?.value || '').trim(),
      logo: cleanLogo,
      cover: (document.getElementById('set-cover-url')?.value || '').trim(),

      deliveryTime: (adminElements.setDeliveryTime?.value || '').trim() || '25 - 35 دقيقة',
      showAnnouncement: adminElements.setShowAnnouncement?.checked === true,
      announcementText: (adminElements.setAnnouncementText?.value || '').trim(),
      isOrderingPaused: adminElements.setOrderingPaused?.checked === true,
      orderingPausedMessage: (adminElements.setOrderingPausedMsg?.value || '').trim(),

      aboutText: (document.getElementById('set-about-text')?.value || '').trim(),
      phone: (document.getElementById('set-phone')?.value || '').trim(),
      address: (document.getElementById('set-address')?.value || '').trim(),
      locationUrl: (document.getElementById('set-location-url')?.value || '').trim(),
      facebookUrl: (document.getElementById('set-facebook-url')?.value || '').trim(),
      instagramUrl: (document.getElementById('set-instagram-url')?.value || '').trim(),
      tiktokUrl: (document.getElementById('set-tiktok-url')?.value || '').trim(),

      printerPaperSize: (adminElements.setPrinterPaperSize?.value || '80mm'),

      deliverySettings: {
        defaultFee: isNaN(parseFloat(adminElements.setDefaultDeliveryFee?.value)) ? 15 : parseFloat(adminElements.setDefaultDeliveryFee?.value),
        customZones: (current.deliverySettings && current.deliverySettings.customZones) ? current.deliverySettings.customZones : []
      },
      deliveryFee: isNaN(parseFloat(adminElements.setDefaultDeliveryFee?.value)) ? 15 : parseFloat(adminElements.setDefaultDeliveryFee?.value),

      enableWalletDiscount: adminElements.setEnableWalletDiscount?.checked === true,
      walletDiscountType: adminElements.setWalletDiscountType?.value || 'percent',
      walletDiscountValue: parseFloat(adminElements.setWalletDiscountVal?.value) || 0,

      enableSpendTierDiscount: adminElements.setEnableSpendTier?.checked === true,
      spendTierMinAmount: parseFloat(adminElements.setSpendMinAmount?.value) || 0,
      spendTierDiscountType: adminElements.setSpendDiscountType?.value || 'percent',
      spendTierDiscountValue: parseFloat(adminElements.setSpendDiscountVal?.value) || 0
    };

    // Ensure legacy security keys are never stored in public settings
    delete updated.adminPin;
    delete updated.imgbbApiKey;

    const res = await Store.saveSettings(updated);
    if (res && res.success) {
      showToastNotification("تم حفظ وتحديث كافة الإعدادات بنجاح!", "success");
    } else {
      showToastNotification("تم حفظ وتحديث الإعدادات بنجاح!", "success");
    }
    loadSettingsIntoForm();
    checkOnboardingSetup();
    renderRestaurantHub();
    if (typeof window.updateDynamicManifest === 'function') {
      window.updateDynamicManifest(updated);
    }
    if (typeof window.updatePwaBranding === 'function') {
      window.updatePwaBranding(updated);
    }
    if (typeof window.showInstallNowModal === 'function') {
      window.showInstallNowModal({
        name: 'Admin',
        logo: './assets/icons/admin-icon-512.png',
        isAdmin: true
      });
    }
  } catch (err) {
    console.error("[Admin] Settings save error:", err);
    showToastNotification("حدث خطأ أثناء الحفظ: " + (err.message || 'فشل الاتصال'), "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

window.setupSettingsForm = setupSettingsForm;
window.loadSettingsIntoForm = loadSettingsIntoForm;
window.saveSettingsFromForm = saveSettingsFromForm;
window.updateThemePresetCardsUI = updateThemePresetCardsUI;
window.renderDeliveryZonesList = renderDeliveryZonesList;
window.renderPromoCodesList = renderPromoCodesList;


// ═══════════════════════════════════════════════════════════
// Dine-in Tables & Stand QR Generation Studio
// ═══════════════════════════════════════════════════════════
let currentActiveQRTable = null;

function renderAdminTablesList() {
  const container = document.getElementById('admin-tables-list');
  const countBadge = document.getElementById('tables-count-badge');
  const btnClearAll = document.getElementById('btn-clear-all-tables');
  if (!container) return;

  const tables = (typeof Store !== 'undefined' && Store.getTables) ? Store.getTables() : [];
  if (countBadge) {
    countBadge.textContent = `${tables.length} طاولات مسجلة`;
  }
  if (btnClearAll) {
    btnClearAll.style.display = (tables && tables.length > 0) ? 'inline-flex' : 'none';
  }

  if (!tables || tables.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-muted); background:var(--surface); border-radius:var(--radius-xs); border:1px dashed var(--border);">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" style="margin:0 auto 8px; display:block; opacity:0.6;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <div style="font-size:12.5px; font-weight:700;">لا توجد طاولات مضافة حالياً</div>
        <div style="font-size:11px; margin-top:4px;">أضف أول طاولة لصالتك بالاسم أو الرقم لتوليد كود الـ QR الخاص بها فوراً</div>
      </div>
    `;
    return;
  }

  let html = '';
  tables.forEach((tbl, idx) => {
    const displayName = (tbl.name || `طاولة ${idx + 1}`).trim();
    html += `
      <div class="admin-table-card" style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-xs); padding:12px 14px; display:flex; flex-direction:column; justify-content:space-between; gap:10px; transition:border-color 0.2s;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:32px; height:32px; border-radius:8px; background:var(--primary-subtle); color:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:12.5px; flex-shrink:0;">
              ${idx + 1}
            </div>
            <div>
              <div style="font-size:13px; font-weight:800; color:var(--text-main);">${safeEscape(displayName)}</div>
              <div style="font-size:10.5px; color:var(--text-muted);">المعرّف: #${tbl.id}</div>
            </div>
          </div>
          <button type="button" class="btn-icon" onclick="deleteAdminTable('${tbl.id}')" title="حذف الطاولة" style="color:var(--danger, #ef4444); padding:4px; border-radius:6px; background:transparent; border:none; cursor:pointer;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>

        <div style="display:flex; gap:6px;">
          <button type="button" class="btn btn-secondary" onclick="openTableQRModal('${tbl.id}', '${safeEscape(displayName)}')" style="flex:1; padding:6px 10px; font-size:11.5px; font-weight:800; display:inline-flex; align-items:center; justify-content:center; gap:5px; border-radius:6px;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>كود QR الطاولة</span>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function addAdminTable() {
  const inp = document.getElementById('new-table-name-input');
  const rawName = (inp?.value || '').trim();
  const tables = (typeof Store !== 'undefined' && Store.getTables) ? Store.getTables() : [];
  
  const nextNum = tables.length + 1;
  const name = rawName || `طاولة ${nextNum}`;
  const newId = String(Date.now().toString(36) + Math.random().toString(36).substr(2, 4));

  tables.push({
    id: newId,
    number: nextNum,
    name: name,
    createdAt: Date.now()
  });

  await Store.saveTables(tables);
  if (inp) inp.value = '';
  renderAdminTablesList();
  if (typeof window.renderPOSTables === 'function') {
    window.renderPOSTables();
  }
  showToastNotification(`تمت إضافة "${name}" بنجاح!`, "success");
}

async function deleteAdminTable(tableId) {
  let tables = (typeof Store !== 'undefined' && Store.getTables) ? Store.getTables() : [];
  const tbl = tables.find(t => String(t.id) === String(tableId));
  const tName = tbl ? tbl.name : 'الطاولة';

  if (!confirm(`هل أنت متأكد من حذف ${tName}؟ لن يتمكن الزبائن من مسح كود الـ QR الخاص بها.`)) {
    return;
  }

  tables = tables.filter(t => String(t.id) !== String(tableId));
  await Store.saveTables(tables);
  renderAdminTablesList();
  if (typeof window.renderPOSTables === 'function') {
    window.renderPOSTables();
  }
  showToastNotification(`تم حذف ${tName}`, "info");
}

function getTableDirectUrl(tableId) {
  const slug = Store.getRestaurantSlug();
  const loc = window.location;
  let baseOrigin = loc.origin;
  let path = loc.pathname;
  if (path.includes('/admin')) {
    path = path.replace(/\/admin(\/.*)?$/, '/order/');
  } else {
    path = '/order/';
  }
  if (!path.endsWith('/')) path += '/';
  return `${baseOrigin}${path}?m=${encodeURIComponent(slug)}&table=${encodeURIComponent(tableId)}`;
}

window.openTableQRModal = function(tableId, tableName) {
  currentActiveQRTable = { id: tableId, name: tableName };
  const modal = document.getElementById('table-qr-modal');
  const backdrop = document.getElementById('table-qr-modal-backdrop');
  const brandEl = document.getElementById('table-qr-brand-name');
  const badgeEl = document.getElementById('table-qr-badge-label');
  const holder = document.getElementById('table-qr-canvas-holder');
  const titleEl = document.getElementById('table-qr-modal-title');

  const settings = Store.getSettings() || {};
  if (brandEl) brandEl.textContent = settings.storeName || 'Harpy Order';
  if (badgeEl) badgeEl.textContent = tableName || `طاولة ${tableId}`;
  if (titleEl) titleEl.textContent = `كود QR — ${tableName}`;

  const tableUrl = getTableDirectUrl(tableId);

  if (holder) {
    holder.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      try {
        new QRCode(holder, {
          text: tableUrl,
          width: 190,
          height: 190,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      } catch(e) {
        const encoded = encodeURIComponent(tableUrl);
        holder.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encoded}" alt="QR" width="190" height="190" style="display:block; border-radius:8px;">`;
      }
    } else {
      const encoded = encodeURIComponent(tableUrl);
      holder.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encoded}" alt="QR" width="190" height="190" style="display:block; border-radius:8px;">`;
    }
  }

  if (modal) modal.style.display = 'block';
  if (backdrop) backdrop.style.display = 'block';
};

window.closeTableQRModal = function() {
  const modal = document.getElementById('table-qr-modal');
  const backdrop = document.getElementById('table-qr-modal-backdrop');
  if (modal) modal.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
};

window.downloadTableQRPNG = function() {
  if (!currentActiveQRTable) return;
  const holder = document.getElementById('table-qr-canvas-holder');
  const qrCanvas = holder ? holder.querySelector('canvas') : null;
  const qrImg = holder ? holder.querySelector('img') : null;

  const settings = Store.getSettings() || {};
  const brandName = settings.storeName || 'Harpy Order';
  const tableName = currentActiveQRTable.name || `طاولة ${currentActiveQRTable.id}`;

  const cardW = 800;
  const cardH = 1000;
  const outCanvas = document.createElement('canvas');
  outCanvas.width = cardW;
  outCanvas.height = cardH;
  const ctx = outCanvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cardW, cardH);

  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, cardW - 40, cardH - 40);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 44px Cairo, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(brandName, cardW / 2, 130);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 24px Cairo, Arial, sans-serif';
  ctx.fillText('منيو رقمي وطلب مباشر من الطاولة', cardW / 2, 180);

  const qrSize = 480;
  const qrX = (cardW - qrSize) / 2;
  const qrY = 240;

  if (qrCanvas) {
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    finalizeDownload();
  } else if (qrImg) {
    if (qrImg.complete) {
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      finalizeDownload();
    } else {
      qrImg.onload = () => {
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        finalizeDownload();
      };
    }
  }

  function finalizeDownload() {
    const pillY = 780;
    ctx.fillStyle = '#fff7ed';
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 4;
    const pillW = 340;
    const pillH = 72;
    const pillX = (cardW - pillW) / 2;
    
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(pillX, pillY, pillW, pillH, 36);
    } else {
      ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 36px Cairo, Arial, sans-serif';
    ctx.fillText(tableName, cardW / 2, pillY + 49);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 22px Cairo, Arial, sans-serif';
    ctx.fillText('امسح الكود بكاميرا الموبايل واطلب بدون انتظار ويتر', cardW / 2, 905);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px Cairo, Arial, sans-serif';
    ctx.fillText('Powered by Harpy Order — harpymenu.com', cardW / 2, 955);

    const cleanFileName = `QR_${brandName.replace(/\s+/g, '_')}_${tableName.replace(/\s+/g, '_')}.png`;
    const link = document.createElement('a');
    link.download = cleanFileName;
    link.href = outCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToastNotification(`تم تحميل كود ${tableName} بنجاح!`, 'success');
  }
};

window.copyTableLink = function() {
  if (!currentActiveQRTable) return;
  const url = getTableDirectUrl(currentActiveQRTable.id);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToastNotification('تم نسخ رابط الطاولة المباشر!', 'success');
    }).catch(() => {
      prompt('رابط الطاولة:', url);
    });
  } else {
    prompt('رابط الطاولة:', url);
  }
};

window.clearAllAdminTables = async function() {
  const tables = (typeof Store !== 'undefined' && Store.getTables) ? Store.getTables() : [];
  if (!tables || tables.length === 0) return;
  if (!confirm(`هل أنت متأكد من حذف كافة الطاولات (${tables.length} طاولة) من الصالة؟`)) {
    return;
  }
  await Store.saveTables([]);
  renderAdminTablesList();
  if (typeof window.renderPOSTables === 'function') {
    window.renderPOSTables();
  }
  showToastNotification("تم مسح كافة الطاولات بنجاح", "info");
};

window.clearAllAdminTables = clearAllAdminTables;
window.renderAdminTablesList = renderAdminTablesList;
window.addAdminTable = addAdminTable;
window.deleteAdminTable = deleteAdminTable;


// ═══════════════════════════════════════════════════════════
// Multi-Branch Network Management Studio
// ═══════════════════════════════════════════════════════════
function updateAdminBranchHeaderSwitcher() {
  const wrap = document.getElementById('admin-branch-switcher-wrap');
  const label = document.getElementById('admin-current-branch-name');
  const dropdown = document.getElementById('admin-branch-dropdown');
  if (!wrap || !dropdown) return;

  const branches = (typeof Store !== 'undefined' && Store.getBranches) ? Store.getBranches() : [];
  const currentSlug = Store.getRestaurantSlug();

  // If 2+ branches configured, reveal the header switcher!
  if (branches.length > 1) {
    wrap.style.display = 'inline-block';
    const activeB = branches.find(b => b.slug === currentSlug) || branches[0];
    if (label) label.textContent = activeB ? activeB.name : 'الفرع';

    dropdown.innerHTML = branches.map(b => {
      const isCur = (b.slug === currentSlug);
      return `
        <button type="button" class="btn ${isCur ? 'btn-primary' : 'btn-ghost'}" onclick="switchAdminBranch('${b.slug}')" style="width:100%; text-align:right; padding:8px 10px; font-size:12px; font-weight:800; display:flex; justify-content:space-between; align-items:center; border-radius:6px;">
          <span>${safeEscape(b.name)}</span>
          ${isCur ? '<span style="font-size:10px; background:rgba(255,255,255,0.25); padding:1px 6px; border-radius:4px;">الحالي</span>' : ''}
        </button>
      `;
    }).join('');
  } else {
    wrap.style.display = 'none';
  }
}

window.toggleAdminBranchMenu = function() {
  const dropdown = document.getElementById('admin-branch-dropdown');
  if (!dropdown) return;
  const isShown = dropdown.style.display === 'flex' || dropdown.style.display === 'block';
  dropdown.style.display = isShown ? 'none' : 'flex';
};

window.toggleBranchPassVisibility = function() {
  const inp = document.getElementById('new-branch-password-input');
  const icon = document.getElementById('branch-pass-icon');
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    if (icon) icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    inp.type = 'password';
    if (icon) icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
};

window.switchAdminBranch = function(branchSlug) {
  const currentSlug = (typeof Store !== 'undefined' && Store.getRestaurantSlug) ? Store.getRestaurantSlug() : '';
  if (currentSlug === branchSlug) {
    const dropdown = document.getElementById('admin-branch-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    return;
  }

  // Seamless Multi-Branch Admin Handover:
  // Propagate active authorized admin session so the target branch opens fully unlocked without prompts
  try {
    const curAuth = localStorage.getItem(`harpy_admin_auth_${currentSlug}`) || sessionStorage.getItem(`harpy_auth_${currentSlug}`);
    if (curAuth) {
      const sess = JSON.parse(curAuth);
      sess.slug = branchSlug;
      localStorage.setItem(`harpy_admin_auth_${branchSlug}`, JSON.stringify(sess));
      sessionStorage.setItem(`harpy_auth_${branchSlug}`, JSON.stringify(sess));
    }
    localStorage.setItem('harpy_admin_active_slug', branchSlug);
    sessionStorage.setItem('harpy_branch_authorized_switch', branchSlug);
  } catch(e) {}

  showToastNotification(`جاري الانتقال إلى لوحة تحكم ${branchSlug}...`, "info");

  setTimeout(() => {
    const loc = window.location;
    let pathname = loc.pathname;
    if (!pathname.endsWith('.html') && !pathname.endsWith('/')) {
      pathname += '/';
    }
    if (!pathname.includes('admin')) {
      pathname = pathname.replace(/\/?$/, '/admin/');
    }
    const adminUrl = `${loc.origin}${pathname}?m=${encodeURIComponent(branchSlug)}`;
    window.location.href = adminUrl;
  }, 300);
};

function renderAdminBranchesList() {
  const container = document.getElementById('admin-branches-list');
  const countBadge = document.getElementById('branches-count-badge');
  if (!container) return;

  const branches = (typeof Store !== 'undefined' && Store.getBranches) ? Store.getBranches() : [];
  if (countBadge) {
    countBadge.textContent = `${branches.length} فروع مسجلة`;
  }

  const currentSlug = Store.getRestaurantSlug();

  let html = '';
  branches.forEach((b, idx) => {
    const isCurrent = (b.slug === currentSlug);
    html += `
      <div class="admin-branch-card" style="background:var(--surface); border:1px solid ${isCurrent ? 'var(--primary-glow)' : 'var(--border)'}; border-radius:var(--radius-xs); padding:14px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
          <div>
            <div style="font-size:14px; font-weight:900; color:var(--text-main); display:flex; align-items:center; gap:6px;">
              <span>${safeEscape(b.name)}</span>
              ${isCurrent ? '<span style="font-size:10px; background:var(--primary-subtle); color:var(--primary); padding:1px 6px; border-radius:4px; font-weight:900;">أنت هنا</span>' : ''}
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:3px; font-family:monospace;">الرابط: ?m=${safeEscape(b.slug)}</div>
            ${b.address ? `<div style="font-size:11px; color:var(--text-body); margin-top:3px;">📍 ${safeEscape(b.address)}</div>` : ''}
            ${b.phone ? `<div style="font-size:11px; color:var(--text-body); margin-top:2px;">📞 ${safeEscape(b.phone)}</div>` : ''}
          </div>
          ${!isCurrent ? `
            <button type="button" class="btn-icon" onclick="deleteAdminBranch('${b.id || b.slug}')" title="حذف الفرع" style="color:var(--danger, #ef4444); padding:4px; border-radius:6px; background:transparent; border:none; cursor:pointer;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          ` : ''}
        </div>

        <div style="display:flex; gap:6px; margin-top:4px;">
          ${!isCurrent ? `
            <button type="button" class="btn btn-primary" onclick="switchAdminBranch('${b.slug}')" style="flex:1; padding:7px 10px; font-size:11.5px; font-weight:800; display:inline-flex; align-items:center; justify-content:center; gap:5px; border-radius:6px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span>إدارة هذا الفرع</span>
            </button>
          ` : `
            <div style="flex:1; text-align:center; padding:6px; font-size:11px; font-weight:800; color:var(--primary); background:var(--primary-subtle); border-radius:6px;">
              ✓ الفرع النشط حالياً في لوحة التحكم
            </div>
          `}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function addAdminBranch() {
  const nameInp = document.getElementById('new-branch-name-input');
  const slugInp = document.getElementById('new-branch-slug-input');
  const passInp = document.getElementById('new-branch-password-input');
  const phoneInp = document.getElementById('new-branch-phone-input');
  const addrInp = document.getElementById('new-branch-address-input');
  const addBtn = document.getElementById('btn-add-new-branch');
  const btnText = document.getElementById('btn-add-branch-text');

  const name = (nameInp?.value || '').trim();
  let slug = (slugInp?.value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const password = (passInp?.value || '').trim();
  const phone = (phoneInp?.value || '').trim();
  const address = (addrInp?.value || '').trim();

  if (!name) {
    showToastNotification("يرجى كتابة اسم الفرع (مثال: فرع سوبر برجر)", "error");
    if (nameInp) nameInp.focus();
    return;
  }

  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]/g, '') || `branch-${Date.now().toString(36)}`;
  }

  if (!password) {
    showToastNotification("يرجى إدخال كلمة مرور أمان الفرع للتحقق من ملكيتك له", "error");
    if (passInp) passInp.focus();
    return;
  }

  const branches = (typeof Store !== 'undefined' && Store.getBranches) ? Store.getBranches() : [];

  if (branches.some(b => b.slug === slug)) {
    showToastNotification("معرّف الفرع (Slug) موجود بالفعل في شبكة الفروع", "error");
    if (slugInp) slugInp.focus();
    return;
  }

  if (addBtn) addBtn.disabled = true;
  if (btnText) btnText.textContent = "جاري التحقق الأمني...";

  try {
    const authCheck = (Store.verifyBranchCredentials) 
      ? await Store.verifyBranchCredentials(slug, password)
      : { success: true };

    if (!authCheck.success) {
      showToastNotification("❌ كلمة مرور أمان الفرع غير صحيحة! لا يمكنك إضافة هذا الفرع دون التحقق من ملكيته.", "error");
      if (passInp) {
        passInp.focus();
        passInp.select();
      }
      return;
    }

    branches.push({
      id: slug,
      slug: slug,
      name: name,
      phone: phone,
      address: address,
      createdAt: Date.now()
    });

    await Store.saveBranches(branches);

    // Automatically clone catalog to new branch so its menu is populated and ready immediately
    const currentSlug = Store.getRestaurantSlug();
    if (typeof Store.cloneCatalogToBranch === 'function') {
      await Store.cloneCatalogToBranch(currentSlug, slug, name);
    }

    if (nameInp) nameInp.value = '';
    if (slugInp) slugInp.value = '';
    if (passInp) passInp.value = '';
    if (phoneInp) phoneInp.value = '';
    if (addrInp) addrInp.value = '';

    renderAdminBranchesList();
    updateAdminBranchHeaderSwitcher();
    showToastNotification(`✅ تم التحقق من ملكية فرع "${name}" وإضافته بنجاح إلى شبكة فروعك!`, "success");
  } catch (err) {
    console.error("[Add Branch Error]", err);
    showToastNotification("حدث خطأ أثناء إضافة الفرع: " + (err.message || "يرجى المحاولة مجدداً"), "error");
  } finally {
    if (addBtn) addBtn.disabled = false;
    if (btnText) btnText.textContent = "التحقق وإضافة الفرع";
  }
}

async function deleteAdminBranch(branchId) {
  let branches = (typeof Store !== 'undefined' && Store.getBranches) ? Store.getBranches() : [];
  const target = branches.find(b => (b.id === branchId || b.slug === branchId));
  if (!target) return;

  if (branches.length <= 1) {
    showToastNotification("لا يمكن حذف الفرع الوحيد للمطعم", "warning");
    return;
  }

  if (!confirm(`هل أنت متأكد من حذف ${target.name} من شبكة الفروع؟`)) {
    return;
  }

  branches = branches.filter(b => b.id !== branchId && b.slug !== branchId);
  await Store.saveBranches(branches);
  renderAdminBranchesList();
  updateAdminBranchHeaderSwitcher();
  showToastNotification(`تم حذف ${target.name}`, "info");
}

window.renderAdminBranchesList = renderAdminBranchesList;
window.addAdminBranch = addAdminBranch;
window.deleteAdminBranch = deleteAdminBranch;
window.updateAdminBranchHeaderSwitcher = updateAdminBranchHeaderSwitcher;
