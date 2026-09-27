// ═══════════════════════════════════════════════════════════
// HarpyOrder — Settings, Identity, Theme Presets & Delivery Zones
// ═══════════════════════════════════════════════════════════

let logoImageUploader = null;
let coverImageUploader = null;

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

  if (adminElements.themePresetsGrid) {
    adminElements.themePresetsGrid.innerHTML = Object.values(THEME_PRESETS).map(preset => `
      <div class="theme-preset-card" data-preset="${preset.id}" onclick="applyPresetToPickers('${preset.id}')" style="background:var(--surface); border:1px solid var(--border); padding:10px; border-radius:var(--radius-xs); cursor:pointer; transition:all 0.15s ease;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span style="width:14px; height:14px; border-radius:50%; background:${preset.primary};"></span>
          <span style="font-size:12px; font-weight:800; color:var(--text-main);">${preset.name}</span>
        </div>
        <div style="font-size:10.5px; color:var(--text-muted);">${preset.badge}</div>
      </div>
    `).join('');
    updateThemePresetCardsUI();
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
      renderPromoCodesList(settings.promoCodes);
      showToastNotification("تمت إضافة كود الخصم بنجاح! ✓", "success");
    });
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
      showToastNotification(`تمت إضافة نطاق "${name}" بسعر ${fee} ج.م بنجاح! ✓`, "success");
    });
  }

  if (adminElements.settingsForm) {
    adminElements.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsFromForm();
    });
  }
}

function updateThemePresetCardsUI(selectedPresetId) {
  const s = Store.getSettings();
  const currentId = selectedPresetId || s.themePreset || 'charcoal';
  const cards = document.querySelectorAll('.theme-preset-card');
  cards.forEach(card => {
    const isSelected = card.getAttribute('data-preset') === currentId;
    card.style.border = isSelected ? '2px solid var(--primary)' : '1px solid var(--border)';
    card.style.background = isSelected ? 'var(--surface-raised)' : 'var(--surface)';
    card.style.boxShadow = isSelected ? '0 0 10px var(--primary-glow)' : 'none';
  });
}

window.applyPresetToPickers = async function(presetId) {
  const p = THEME_PRESETS[presetId];
  if (!p) return;


  // 1. Optimistic UI: Update settings in memory and apply theme to DOM immediately (0ms instant response)
  const current = Store.getSettings();
  current.themePreset = presetId;
  current.siteColors = { ...p };

  // Set mode appropriately for the preset
  const targetMode = (presetId === 'cream') ? 'light' : 'dark';
  Store.safeSetItem(Store.getThemeModeKey(), targetMode);
  Store.safeSetItem(Store.getKey(STORAGE_KEYS.THEME_MODE), targetMode);

  Store.applyTheme();
  updateThemePresetCardsUI(presetId);
  if (typeof updateAdminThemeToggleIcons === 'function') updateAdminThemeToggleIcons();

  // 2. Persist to localStorage immediately
  Store.safeSetItem(Store.getKey(STORAGE_KEYS.SETTINGS), JSON.stringify(current));
  window.dispatchEvent(new Event('store_settings_updated'));

  // 3. Sync to Cloud in background using PATCH (never blocks UI, never overwrites store metadata)
  Store.syncThemePresetToCloud(presetId, p).catch(err => {
    console.warn('[Admin] Cloud theme sync background error:', err);
  });
};

function loadSettingsIntoForm() {
  const s = Store.getSettings();
  if (adminElements.adminStoreName) adminElements.adminStoreName.textContent = `إدارة: ${s.storeName || "منيو المطعم"}`;

  if (adminElements.setStoreName) adminElements.setStoreName.value = s.storeName || '';
  if (adminElements.setStoreTagline) adminElements.setStoreTagline.value = s.storeTagline || '';
  if (adminElements.setPrinterPaperSize) adminElements.setPrinterPaperSize.value = s.printerPaperSize || '80mm';
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
  if (adminElements.setWalletDiscountType) adminElements.setWalletDiscountType.value = s.walletDiscountType || 'percent';
  if (adminElements.setWalletDiscountVal) adminElements.setWalletDiscountVal.value = s.walletDiscountValue !== undefined ? s.walletDiscountValue : 10;

  if (adminElements.setEnableSpendTier) adminElements.setEnableSpendTier.checked = s.enableSpendTierDiscount !== false;
  if (adminElements.setSpendMinAmount) adminElements.setSpendMinAmount.value = s.spendTierMinAmount || 300;
  if (adminElements.setSpendDiscountType) adminElements.setSpendDiscountType.value = s.spendTierDiscountType || 'percent';
  if (adminElements.setSpendDiscountVal) adminElements.setSpendDiscountVal.value = s.spendTierDiscountValue || 15;

  if (adminElements.setDeliveryTime) adminElements.setDeliveryTime.value = s.deliveryTime || '';
  if (adminElements.setShowAnnouncement) adminElements.setShowAnnouncement.checked = s.showAnnouncement === true;
  if (adminElements.setAnnouncementText) adminElements.setAnnouncementText.value = s.announcementText || '';
  if (adminElements.setOrderingPaused) adminElements.setOrderingPaused.checked = s.isOrderingPaused === true;
  if (adminElements.setOrderingPausedMsg) adminElements.setOrderingPausedMsg.value = s.orderingPausedMessage || '';

  const ds = s.deliverySettings || { defaultFee: (s.deliveryFee !== undefined ? s.deliveryFee : 15), customZones: [] };
  if (adminElements.setDefaultDeliveryFee) {
    adminElements.setDefaultDeliveryFee.value = ds.defaultFee !== undefined ? ds.defaultFee : 15;
  }
  renderDeliveryZonesList(ds.customZones || []);

  renderPromoCodesList(s.promoCodes || []);
  updateThemePresetCardsUI(s.themePreset);
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
      <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px; font-weight:800; flex-shrink:0;" onclick="deleteDeliveryZoneFast(${idx})">✕ حذف</button>
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
  showToastNotification("تم حذف النطاق السعري بنجاح ✓", "success");
};

function renderPromoCodesList(promos) {
  if (!adminElements.promoCodesList) return;
  adminElements.promoCodesList.innerHTML = promos.map((p, idx) => `
    <div style="display:flex; align-items:center; gap:6px; background:var(--surface); border:1px solid var(--border); padding:4px 10px; border-radius:4px; font-size:12px;">
      <span class="font-num" style="font-weight:800; color:var(--primary);">${p.code}</span>
      <span style="color:var(--text-muted);">(${p.value}${p.type === 'percent' ? '%' : ' ج.م'})</span>
      <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:0 4px;" onclick="deletePromoFast(${idx})">✕</button>
    </div>
  `).join('');
}

window.deletePromoFast = async function(index) {
  const settings = Store.getSettings();
  settings.promoCodes.splice(index, 1);
  await Store.saveSettings(settings);
  renderPromoCodesList(settings.promoCodes);
  showToastNotification("تم حذف كود الخصم ✓", "success");
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
    submitBtn.innerHTML = 'جاري حفظ الإعدادات... ⏳';
  }

  try {
    const current = Store.getSettings();
    const activePresetId = current.themePreset || 'charcoal';
    const fallbackColors = THEME_PRESETS[activePresetId] || THEME_PRESETS.charcoal;
    const siteColors = current.siteColors ? { ...current.siteColors } : { ...fallbackColors };

    let cleanLogo = (document.getElementById('set-logo-url')?.value || '').trim();
    if (!cleanLogo && document.getElementById('set-logo-url-direct')) {
      cleanLogo = (document.getElementById('set-logo-url-direct').value || '').trim();
    }
    if (cleanLogo && cleanLogo.startsWith('data:image/')) {
      try {
        if (submitBtn) submitBtn.innerHTML = 'جاري رفع الشعار إلى سحابة الصور... ⏳';
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
      imgbbApiKey: current.imgbbApiKey || '',

      deliveryTime: (adminElements.setDeliveryTime?.value || '').trim() || '30-45 دقيقة',
      showAnnouncement: adminElements.setShowAnnouncement?.checked === true,
      announcementText: (adminElements.setAnnouncementText?.value || '').trim(),
      isOrderingPaused: adminElements.setOrderingPaused?.checked === true,
      orderingPausedMessage: (adminElements.setOrderingPausedMsg?.value || '').trim(),

      themePreset: activePresetId,
      siteColors: siteColors,
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

    const res = await Store.saveSettings(updated);
    if (res && res.success) {
      showToastNotification("تم حفظ وتحديث كافة الإعدادات بنجاح! ✓", "success");
    } else {
      showToastNotification("تم حفظ وتحديث الإعدادات بنجاح! ✓", "success");
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
        logo: 'https://iili.io/n3rYXyu.png',
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
