// ═══════════════════════════════════════════════════════════
// HarpyOrder — Stories Studio & Product Picker Engine
// ═══════════════════════════════════════════════════════════

let storyImageUploader = null;
let currentEditingStoryId = null;
let storyProductPickerActiveCategory = 'all';
let storyProductPickerSelectedId = null;

// ── Stories Management ─────────────────────────────────────
function setupStoriesManagement() {
  storyImageUploader = bindDeviceImageUploader({
    dropzoneId: 'story-image-dropzone',
    fileInputId: 'story-img-file',
    promptId: 'story-image-prompt',
    previewWrapId: 'story-preview-wrap',
    previewImgId: 'story-preview-img',
    removeBtnId: 'btn-remove-story-img',
    hiddenUrlInputId: 'story-img-url'
  });

  if (adminElements.btnOpenAddStory) {
    adminElements.btnOpenAddStory.addEventListener('click', () => openStoryModal(null));
  }
  if (adminElements.btnCloseStoryModal) {
    adminElements.btnCloseStoryModal.addEventListener('click', closeStoryModal);
  }
  if (adminElements.btnCancelStory) {
    adminElements.btnCancelStory.addEventListener('click', closeStoryModal);
  }
  if (adminElements.storyModalBackdrop) {
    adminElements.storyModalBackdrop.addEventListener('click', closeStoryModal);
  }

  if (adminElements.storyForm) {
    adminElements.storyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveStoryForm();
    });
  }
}

function renderStoriesList() {
  if (!adminElements.adminStoriesContainer) return;
  const stories = Store.getStories();

  if (stories.length === 0) {
    adminElements.adminStoriesContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-muted);">لا توجد قصص مسجلة حالياً.</div>`;
    return;
  }

  adminElements.adminStoriesContainer.innerHTML = stories.map(s => `
    <div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; display:flex; gap:12px; align-items:center;">
      <img src="${s.image}" alt="${s.title}" loading="lazy" decoding="async" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);">
      <div style="flex:1;">
        <div style="font-size:13.5px; font-weight:800; color:var(--text-main);">${s.title}</div>
        <div style="font-size:11.5px; color:var(--text-muted);">${s.tagline || 'بدون نص ترويجي'}</div>
        ${s.badge ? `<span style="font-size:10px; background:var(--primary-subtle); color:var(--primary); padding:1px 6px; border-radius:4px; font-weight:700;">${s.badge}</span>` : ''}
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <button class="btn btn-ghost btn-sm" onclick="openStoryModal('${s.id}')">✏️</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="deleteStoryFast('${s.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openStoryModal(storyId) {
  currentEditingStoryId = storyId;
  const prods = Store.getProducts();

  if (adminElements.storyProductSelect) {
    adminElements.storyProductSelect.innerHTML = `<option value="">-- بدون ربط بمنتج --</option>` +
      prods.map(p => `<option value="${p.id}">${p.name} (${p.price} ج.م)</option>`).join('');
  }

  if (storyId) {
    const s = Store.getStories().find(i => i.id === storyId);
    if (!s) return;
    if (adminElements.storyModalTitle) adminElements.storyModalTitle.textContent = "تعديل القصة / العرض";
    if (adminElements.storyId) adminElements.storyId.value = s.id;
    if (adminElements.storyTitleInput) adminElements.storyTitleInput.value = s.title || '';
    if (adminElements.storyTaglineInput) adminElements.storyTaglineInput.value = s.tagline || '';
    if (adminElements.storyBadgeInput) adminElements.storyBadgeInput.value = s.badge || '';
    if (adminElements.storyProductSelect) adminElements.storyProductSelect.value = s.productId || '';
    updateStoryProductPickerUI(s.productId || '');
    if (adminElements.storyDescInput) adminElements.storyDescInput.value = s.desc || '';
    if (adminElements.storyImgUrl) adminElements.storyImgUrl.value = s.image || '';

    if (storyImageUploader) {
      if (s.image) storyImageUploader.showPreview(s.image);
      else storyImageUploader.clearPreview();
    }
  } else {
    if (adminElements.storyModalTitle) adminElements.storyModalTitle.textContent = "إضافة قصة / عرض جديد";
    if (adminElements.storyForm) adminElements.storyForm.reset();
    if (adminElements.storyId) adminElements.storyId.value = '';
    if (adminElements.storyProductSelect) adminElements.storyProductSelect.value = '';
    updateStoryProductPickerUI('');
    if (storyImageUploader) storyImageUploader.clearPreview();
  }

  if (adminElements.storyModal) adminElements.storyModal.classList.add('open');
  if (adminElements.storyModalBackdrop) adminElements.storyModalBackdrop.classList.add('open');
  pushAdminNavState('admin_story');
}

function closeStoryModal(triggerHistoryBack = true) {
  currentEditingStoryId = null;
  if (adminElements.storyModal) adminElements.storyModal.classList.remove('open');
  if (adminElements.storyModalBackdrop) adminElements.storyModalBackdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.adminNav === 'admin_story') {
    try { history.back(); } catch(e) {}
  }
}

async function saveStoryForm() {
  const submitBtn = adminElements.storyForm ? adminElements.storyForm.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

  const id = adminElements.storyId?.value || ('s_' + Date.now());
  const title = (adminElements.storyTitleInput?.value || '').trim();
  const tagline = (adminElements.storyTaglineInput?.value || '').trim();
  const badge = (adminElements.storyBadgeInput?.value || '').trim();
  const productId = adminElements.storyProductSelect?.value || '';
  const desc = (adminElements.storyDescInput?.value || '').trim();
  const image = (adminElements.storyImgUrl?.value || '').trim();

  if (!title) {
    showToastNotification("يرجى كتابة عنوان القصة", "error");
    return;
  }

  const storyData = { id, title, tagline, badge, productId, desc, image };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري الحفظ... ⏳';
  }

  try {
    if (currentEditingStoryId) {
      const oldStory = Store.getStories().find(s => s.id === currentEditingStoryId);
      await Store.updateStory(currentEditingStoryId, storyData);
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        if (oldStory && oldStory.image && oldStory.image !== storyData.image) {
          navigator.serviceWorker.controller.postMessage({ type: 'PURGE_IMAGE_URL', url: oldStory.image });
        }
        if (storyData.image) {
          navigator.serviceWorker.controller.postMessage({ type: 'PURGE_IMAGE_URL', url: storyData.image });
        }
      }
      showToastNotification("تم تحديث القصة بنجاح! ✓", "success");
    } else {
      await Store.addStory(storyData);
      showToastNotification("تمت إضافة القصة بنجاح! ✓", "success");
    }
    closeStoryModal();
    renderStoriesList();
  } catch (err) {
    showToastNotification("حدث خطأ أثناء حفظ القصة", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

window.deleteStoryFast = async function(id) {
  const confirmed = await showCustomConfirm({
    title: "حذف القصة / العرض",
    message: "هل أنت متأكد من رغبتك في حذف هذه القصة أو العرض الترويجي؟",
    icon: "⭐",
    confirmText: "حذف القصة 🗑️",
    cancelText: "إلغاء",
    isDanger: true
  });
  if (confirmed) {
    await Store.deleteStory(id);
    renderStoriesList();
    showToastNotification("تم حذف القصة بنجاح ✓", "success");
  }
};

// ── Custom Product Picker for Stories / Offers ─────────────
let pickerSelectedProductId = '';
let pickerActiveCategory = 'all';

window.openStoryProductPicker = function() {
  const modal = document.getElementById('story-product-picker-modal');
  const backdrop = document.getElementById('story-product-picker-backdrop');
  const searchInput = document.getElementById('picker-search-input');
  if (searchInput) searchInput.value = '';
  pickerActiveCategory = 'all';
  pickerSelectedProductId = adminElements.storyProductSelect?.value || '';

  renderPickerCategories();
  renderPickerProducts();

  if (modal) modal.classList.add('open', 'show');
  if (backdrop) backdrop.classList.add('open', 'show');
};

window.closeStoryProductPicker = function() {
  const modal = document.getElementById('story-product-picker-modal');
  const backdrop = document.getElementById('story-product-picker-backdrop');
  if (modal) modal.classList.remove('open', 'show');
  if (backdrop) backdrop.classList.remove('open', 'show');
};

function renderPickerCategories() {
  const catsContainer = document.getElementById('picker-cat-pills');
  if (!catsContainer) return;
  const cats = Store.getCategories();
  catsContainer.innerHTML = `
    <button type="button" class="cat-pill ${pickerActiveCategory === 'all' ? 'active' : ''}" onclick="setPickerCategory('all')" style="padding:4px 10px; font-size:11px; white-space:nowrap; border-radius:12px; cursor:pointer;">الكل</button>
  ` + cats.map(c => `
    <button type="button" class="cat-pill ${pickerActiveCategory === c ? 'active' : ''}" onclick="setPickerCategory('${c.replace(/'/g, "\\'")}')" style="padding:4px 10px; font-size:11px; white-space:nowrap; border-radius:12px; cursor:pointer;">${c}</button>
  `).join('');
}

window.setPickerCategory = function(cat) {
  pickerActiveCategory = cat;
  renderPickerCategories();
  renderPickerProducts();
};

window.filterPickerProducts = function() {
  renderPickerProducts();
};

function renderPickerProducts() {
  const grid = document.getElementById('picker-products-grid');
  if (!grid) return;
  const query = (document.getElementById('picker-search-input')?.value || '').trim().toLowerCase();
  const prods = Store.getProducts().filter(p => p.visible !== false);
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";

  const filtered = prods.filter(p => {
    const catMatch = pickerActiveCategory === 'all' || p.category === pickerActiveCategory;
    const searchMatch = !query || p.name.toLowerCase().includes(query) || (p.desc || '').toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query);
    return catMatch && searchMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:24px 10px; color:var(--text-muted); font-size:12px;">
        لا توجد أصناف مطابقة للبحث
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const isSel = p.id === pickerSelectedProductId;
    return `
      <div class="product-picker-card ${isSel ? 'selected' : ''}" onclick="selectPickerProduct('${p.id}')">
        <div class="product-picker-badge-check">✓</div>
        <img src="${p.image || ''}" class="product-picker-card-thumb" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><text y=%22.9em%22 font-size=%2232%22>🍽️</text></svg>'">
        <div style="flex:1; min-width:0;">
          <div style="font-weight:800; font-size:13px; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
          <div style="font-size:11px; color:var(--text-muted); margin:2px 0;">${p.category}</div>
          <div style="font-size:12px; font-weight:800; color:var(--primary); font-family:var(--font-num);">${p.price} ${currency}</div>
        </div>
      </div>
    `;
  }).join('');
}

window.selectPickerProduct = function(productId) {
  pickerSelectedProductId = productId;
  if (adminElements.storyProductSelect) {
    adminElements.storyProductSelect.value = productId;
  }
  updateStoryProductPickerUI(productId);
  closeStoryProductPicker();
};

function updateStoryProductPickerUI(productId) {
  const trigger = document.getElementById('story-product-picker-trigger');
  const info = document.getElementById('story-picker-selected-info');
  if (!trigger || !info) return;

  if (!productId) {
    trigger.classList.remove('has-selected');
    info.innerHTML = `
      <span style="font-size:13px; font-weight:700; color:var(--text-muted);">🔍 اضغط لاختيار صنف من المنيو (بدون ربط حالياً)</span>
    `;
  } else {
    const p = Store.getProducts().find(prod => prod.id === productId);
    if (!p) {
      trigger.classList.remove('has-selected');
      info.innerHTML = `
        <span style="font-size:13px; font-weight:700; color:var(--text-muted);">🔍 اضغط لاختيار صنف من المنيو (بدون ربط حالياً)</span>
      `;
      return;
    }
    const settings = Store.getSettings();
    const currency = settings.currency || "ج.م";
    trigger.classList.add('has-selected');
    info.innerHTML = `
      <img src="${p.image || ''}" class="product-picker-thumb" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><text y=%22.9em%22 font-size=%2232%22>🍽️</text></svg>'">
      <div style="flex:1; min-width:0;">
        <div style="font-weight:800; font-size:13px; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
        <div style="font-size:11px; color:var(--text-muted);">${p.category} • <b style="color:var(--primary); font-family:var(--font-num);">${p.price} ${currency}</b></div>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); selectPickerProduct('');" style="color:var(--danger); padding:4px 8px; border-radius:6px; font-size:11px; font-weight:800;" title="إلغاء الربط">✕ إزالة</button>
    `;
  }
}

window.setupStoriesManagement = setupStoriesManagement;
window.renderStoriesList = renderStoriesList;
window.openStoryModal = openStoryModal;
window.closeStoryModal = closeStoryModal;
window.saveStoryForm = saveStoryForm;
window.renderPickerCategories = renderPickerCategories;
window.renderPickerProducts = renderPickerProducts;
window.updateStoryProductPickerUI = updateStoryProductPickerUI;
