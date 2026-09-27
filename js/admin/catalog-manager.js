// ═══════════════════════════════════════════════════════════
// HarpyOrder — Visual Product Catalog & Item Modifier Engine
// ═══════════════════════════════════════════════════════════

let prodImageUploader = null;
let currentEditingProductId = null;

function setupProductManagement() {
  prodImageUploader = bindDeviceImageUploader({
    dropzoneId: 'prod-image-dropzone',
    fileInputId: 'prod-img-file',
    promptId: 'prod-image-prompt',
    previewWrapId: 'prod-preview-wrap',
    previewImgId: 'prod-preview-img',
    removeBtnId: 'btn-remove-prod-img',
    hiddenUrlInputId: 'prod-img-url'
  });

  if (adminElements.btnOpenAddProduct) {
    adminElements.btnOpenAddProduct.addEventListener('click', () => openProductModal(null));
  }
  if (adminElements.btnCloseProductModal) {
    adminElements.btnCloseProductModal.addEventListener('click', closeProductModal);
  }
  if (adminElements.btnCancelProduct) {
    adminElements.btnCancelProduct.addEventListener('click', closeProductModal);
  }
  if (adminElements.productModalBackdrop) {
    adminElements.productModalBackdrop.addEventListener('click', closeProductModal);
  }

  if (adminElements.btnAddSizeRow) {
    adminElements.btnAddSizeRow.addEventListener('click', () => addSizeRow('', 0));
  }
  if (adminElements.btnAddAddonRow) {
    adminElements.btnAddAddonRow.addEventListener('click', () => addAddonRow('', 10));
  }

  if (adminElements.productForm) {
    adminElements.productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProductForm();
    });
  }
}

function renderCatalog() {
  if (!adminElements.catalogContainer) return;
  const prods = Store.getProducts();
  const currency = Store.getSettings().currency || "ج.م";

  if (prods.length === 0) {
    if (Store.isCloudDataLoaded && !Store.isCloudDataLoaded()) {
      adminElements.catalogContainer.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:45px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-md);">
          <div style="width:28px; height:28px; border:3px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px;"></div>
          <div style="font-size:14px; font-weight:700; color:var(--text-muted);">جاري تحميل أصناف المنيو...</div>
        </div>
      `;
      return;
    }

    adminElements.catalogContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:45px 20px; background:var(--surface); border:1px dashed var(--border-strong); border-radius:var(--radius-md);">
        <div style="font-size:38px; margin-bottom:12px;">🍽️</div>
        <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:6px;">لا توجد أصناف في المنيو بعد</div>
        <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:20px; max-width:320px; margin-left:auto; margin-right:auto;">
          ابدأ بإضافة أول صنف أو وجبة في منيو مطعمك وحدد السعر والصورة والأقسام بسهولة
        </div>
        <button type="button" class="btn btn-primary" onclick="openProductModal(null)" style="padding:10px 22px; font-weight:800; font-size:0.9rem;">
          + إضافة أول صنف الآن
        </button>
      </div>
    `;
    return;
  }

  adminElements.catalogContainer.innerHTML = prods.map(p => `
    <div class="admin-product-card ${p.visible === false ? 'hidden-item' : ''}" data-id="${p.id}" style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden; display:flex; flex-direction:column;">
      <div style="position:relative; width:100%; height:140px; background:var(--bg);">
        <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" style="width:100%; height:100%; object-fit:cover;">
        ${p.badge ? `<span style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.75); color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">${p.badge}</span>` : ''}
        ${p.isFeatured ? `<span style="position:absolute; top:8px; left:8px; background:var(--primary); color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">👑 هيرو</span>` : ''}
      </div>

      <div style="padding:12px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="font-size:11px; color:var(--text-muted); margin-bottom:2px;">${p.category}</div>
          <div style="font-size:14px; font-weight:800; color:var(--text-main); line-height:1.3; margin-bottom:6px;">${p.name}</div>
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
            <input type="number" class="form-input font-num" value="${p.price}" step="0.5" style="padding:4px 8px; font-size:13px; font-weight:800; max-width:80px;" onchange="updateProductPriceFast('${p.id}', this.value)">
            <span class="font-num" style="font-size:12px; font-weight:700; color:var(--primary);">${currency}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:10px; margin-top:8px; gap:8px;">
          <button class="btn btn-ghost btn-sm btn-admin-action btn-visibility-toggle ${p.visible === false ? 'btn-hidden-state' : ''}" onclick="toggleProductVisibilityFast('${p.id}', this)" title="${p.visible === false ? 'إظهار الصنف في المنيو' : 'إخفاء الصنف من المنيو'}" style="display:inline-flex; align-items:center; gap:5px; font-weight:700; font-size:12px; padding:5px 9px;">
            ${p.visible === false 
              ? `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg><span>مخفي</span>`
              : `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#22c55e;"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><span>ظاهر</span>`
            }
          </button>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="btn btn-ghost btn-sm btn-admin-action" onclick="openProductModal('${p.id}')" title="تعديل بيانات الصنف" style="display:inline-flex; align-items:center; gap:5px; font-weight:700; font-size:12px; padding:5px 10px;">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              <span>تعديل</span>
            </button>
            <button class="btn btn-ghost btn-sm btn-admin-action btn-admin-delete" onclick="deleteProductFast('${p.id}')" title="حذف الصنف نهائياً" style="color:var(--danger); padding:5px 8px; border-radius:6px;">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

window.updateProductPriceFast = async function(id, newPrice) {
  const num = parseFloat(newPrice);
  if (isNaN(num) || num < 0) return;
  await Store.updateProduct(id, { price: num });
};

window.toggleProductVisibilityFast = async function(id, btnElement) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === id);
  if (!p) return;

  const newVis = p.visible === false;
  
  // Instant DOM update on the specific product card (0ms latency, single click)
  const card = document.querySelector(`.admin-product-card[data-id="${id}"]`);
  const btn = btnElement || (card ? card.querySelector('.btn-visibility-toggle') : null);

  if (card) {
    card.classList.toggle('hidden-item', !newVis);
  }
  if (btn) {
    btn.classList.toggle('btn-hidden-state', !newVis);
    btn.title = newVis ? 'إخفاء الصنف من المنيو' : 'إظهار الصنف في المنيو';
    btn.innerHTML = newVis 
      ? `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#22c55e;"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><span>ظاهر</span>`
      : `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg><span>مخفي</span>`;
  }

  await Store.updateProduct(id, { visible: newVis });
};

window.deleteProductFast = async function(id) {
  const p = Store.getProducts().find(item => item.id === id);
  const name = p ? p.name : 'هذا الصنف';
  const confirmed = await showCustomConfirm({
    title: "حذف صنف من المنيو",
    message: `هل أنت متأكد من رغبتك في حذف الصنف "<strong>${name}</strong>" نهائياً من المنيو؟`,
    icon: "🍔",
    confirmText: "حذف الصنف 🗑️",
    cancelText: "إلغاء",
    isDanger: true
  });
  if (confirmed) {
    await Store.deleteProduct(id);
    renderCatalog();
    showToastNotification("تم حذف الصنف بنجاح ✓", "success");
  }
};

function openProductModal(productId) {
  currentEditingProductId = productId;
  const cats = Store.getCategories();
  let editingProd = null;
  if (productId) {
    editingProd = Store.getProducts().find(i => i.id === productId);
  }

  if (adminElements.prodCategory) {
    let opts = [...cats];
    if (editingProd && editingProd.category && !opts.includes(editingProd.category)) {
      opts.unshift(editingProd.category);
    }
    if (opts.length === 0) opts.push('عام');
    adminElements.prodCategory.innerHTML = opts.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  if (adminElements.prodSizesList) adminElements.prodSizesList.innerHTML = '';
  if (adminElements.prodAddonsList) adminElements.prodAddonsList.innerHTML = '';

  if (productId) {
    const p = editingProd;
    if (!p) return;
    if (adminElements.productModalTitle) adminElements.productModalTitle.textContent = "تعديل الصنف";
    if (adminElements.prodId) adminElements.prodId.value = p.id;
    if (adminElements.prodName) adminElements.prodName.value = p.name || '';
    if (adminElements.prodCategory) adminElements.prodCategory.value = p.category || (cats.length > 0 ? cats[0] : 'عام');
    if (adminElements.prodPrice) adminElements.prodPrice.value = p.price || 0;
    if (adminElements.prodOriginalPrice) adminElements.prodOriginalPrice.value = p.originalPrice || '';
    if (adminElements.prodPrepTime) adminElements.prodPrepTime.value = p.prepTime || '';
    if (adminElements.prodBadge) adminElements.prodBadge.value = p.badge || '';
    if (adminElements.prodFeatured) adminElements.prodFeatured.checked = !!p.isFeatured;
    if (adminElements.prodVisible) adminElements.prodVisible.checked = (p.visible !== false);
    if (adminElements.prodDesc) adminElements.prodDesc.value = p.desc || '';
    if (adminElements.prodImgUrl) adminElements.prodImgUrl.value = p.image || '';

    if (p.sizes && p.sizes.length > 0) {
      p.sizes.forEach(s => addSizeRow(s.name, s.price));
    }
    if (p.addons && p.addons.length > 0) {
      p.addons.forEach(a => addAddonRow(a.name, a.price));
    }

    if (prodImageUploader) {
      if (p.image) prodImageUploader.showPreview(p.image);
      else prodImageUploader.clearPreview();
    }
  } else {
    if (adminElements.productModalTitle) adminElements.productModalTitle.textContent = "إضافة صنف جديد";
    if (adminElements.productForm) adminElements.productForm.reset();
    if (adminElements.prodId) adminElements.prodId.value = '';
    if (adminElements.prodFeatured) adminElements.prodFeatured.checked = false;
    if (adminElements.prodVisible) adminElements.prodVisible.checked = true;
    if (prodImageUploader) prodImageUploader.clearPreview();
  }

  if (adminElements.productModal) adminElements.productModal.classList.add('open');
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.classList.add('open');
  pushAdminNavState('admin_product');
}

function closeProductModal(triggerHistoryBack = true) {
  currentEditingProductId = null;
  if (adminElements.productModal) adminElements.productModal.classList.remove('open');
  if (adminElements.productModalBackdrop) adminElements.productModalBackdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.adminNav === 'admin_product') {
    try { history.back(); } catch(e) {}
  }
}

function addSizeRow(name = '', price = 0) {
  if (!adminElements.prodSizesList) return;
  const div = document.createElement('div');
  div.className = 'size-row-item';
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-input size-name-input" placeholder="اسم الحجم (مثال: سنجل / لارج)" value="${name}" style="flex:1; padding:6px 10px; font-size:12px;">
    <input type="number" class="form-input font-num size-price-input" placeholder="+السعر" value="${price}" step="0.5" style="width:80px; padding:6px 8px; font-size:12px;">
    <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px;" onclick="this.parentElement.remove()">✕</button>
  `;
  adminElements.prodSizesList.appendChild(div);
}

function addAddonRow(name = '', price = 10) {
  if (!adminElements.prodAddonsList) return;
  const div = document.createElement('div');
  div.className = 'addon-row-item';
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-input addon-name-input" placeholder="اسم الإضافة (مثال: جبنة زيادة)" value="${name}" style="flex:1; padding:6px 10px; font-size:12px;">
    <input type="number" class="form-input font-num addon-price-input" placeholder="السعر" value="${price}" step="0.5" style="width:80px; padding:6px 8px; font-size:12px;">
    <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px;" onclick="this.parentElement.remove()">✕</button>
  `;
  adminElements.prodAddonsList.appendChild(div);
}

async function saveProductForm() {
  const submitBtn = adminElements.productForm ? adminElements.productForm.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

  const id = adminElements.prodId?.value || ('p_' + Date.now());
  const name = (adminElements.prodName?.value || '').trim();
  const category = adminElements.prodCategory?.value || 'عام';
  const price = parseFloat(adminElements.prodPrice?.value) || 0;
  const originalPrice = parseFloat(adminElements.prodOriginalPrice?.value) || 0;
  const prepTime = (adminElements.prodPrepTime?.value || '').trim();
  const badge = (adminElements.prodBadge?.value || '').trim();
  const isFeatured = adminElements.prodFeatured?.checked === true;
  let isVisible = true;
  if (adminElements.prodVisible) {
    isVisible = adminElements.prodVisible.checked === true;
  } else if (currentEditingProductId) {
    const existing = Store.getProducts().find(p => p.id === currentEditingProductId);
    isVisible = existing ? (existing.visible !== false) : true;
  }
  const desc = (adminElements.prodDesc?.value || '').trim();
  const image = (adminElements.prodImgUrl?.value || '').trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";

  if (!name) {
    showToastNotification("يرجى كتابة اسم الصنف أولاً", "error");
    if (adminElements.prodName) adminElements.prodName.focus();
    return;
  }

  // Collect sizes
  const sizes = [];
  document.querySelectorAll('.size-row-item').forEach((row, idx) => {
    const sName = (row.querySelector('.size-name-input')?.value || '').trim();
    const sPrice = parseFloat(row.querySelector('.size-price-input')?.value) || 0;
    if (sName) {
      sizes.push({ id: 's_' + idx, name: sName, price: sPrice });
    }
  });

  // Collect addons
  const addons = [];
  document.querySelectorAll('.addon-row-item').forEach((row, idx) => {
    const aName = (row.querySelector('.addon-name-input')?.value || '').trim();
    const aPrice = parseFloat(row.querySelector('.addon-price-input')?.value) || 0;
    if (aName) {
      addons.push({ id: 'a_' + idx, name: aName, price: aPrice });
    }
  });

  const productData = {
    id,
    name,
    category,
    price,
    originalPrice,
    prepTime,
    badge,
    isFeatured,
    desc,
    image,
    sizes,
    addons,
    visible: isVisible
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري الحفظ... ⏳';
  }

  try {
    if (currentEditingProductId) {
      const oldProd = Store.getProducts().find(p => p.id === currentEditingProductId);
      await Store.updateProduct(currentEditingProductId, productData);
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        if (oldProd && oldProd.image && oldProd.image !== productData.image) {
          navigator.serviceWorker.controller.postMessage({ type: 'PURGE_IMAGE_URL', url: oldProd.image });
        }
        if (productData.image) {
          navigator.serviceWorker.controller.postMessage({ type: 'PURGE_IMAGE_URL', url: productData.image });
        }
      }
      showToastNotification("تم حفظ وتحديث بيانات الصنف بنجاح! ✓", "success");
    } else {
      await Store.addProduct(productData);
      showToastNotification("تمت إضافة الصنف الجديد بنجاح! ✓", "success");
    }
    closeProductModal();
    renderCatalog();
  } catch (err) {
    console.error("[Admin] Product save error:", err);
    showToastNotification("حدث خطأ أثناء حفظ الصنف: " + err.message, "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// ── Categories Management ──────────────────────────────────

window.setupProductManagement = setupProductManagement;
window.renderCatalog = renderCatalog;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.addSizeRow = addSizeRow;
window.addAddonRow = addAddonRow;
window.saveProductForm = saveProductForm;
