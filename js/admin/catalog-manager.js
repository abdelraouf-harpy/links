// ═══════════════════════════════════════════════════════════
// HarpyOrder — Unified Visual Menu & Item Modifier Engine
// ═══════════════════════════════════════════════════════════

let prodImageUploader = null;
let currentEditingProductId = null;
let currentCatalogCategoryFilter = 'all';
let currentCatalogSearch = '';

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
    adminElements.btnAddSizeRow.addEventListener('click', () => {
      addSizeRow('', 0);
      syncRecipeSizesUI();
    });
  }
  if (adminElements.btnAddAddonRow) {
    adminElements.btnAddAddonRow.addEventListener('click', () => {
      addAddonRow('', 10);
      syncRecipeAddonsUI();
    });
  }

  if (adminElements.productForm) {
    adminElements.productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProductForm();
    });
  }

  window.addEventListener('store_products_updated', () => renderCatalog());
  window.addEventListener('store_categories_updated', () => renderCatalog());
}

function handleCatalogSearch(val) {
  currentCatalogSearch = (val || '').trim().toLowerCase();
  renderCatalogItemsOnly();
}

function setCatalogCategoryFilter(cat) {
  currentCatalogCategoryFilter = cat;
  renderCatalog();
}

window.quickAddCategoryPrompt = async function() {
  const name = prompt("أدخل اسم القسم الجديد لترتيب الأصناف:");
  if (!name || !name.trim()) return;
  const cleanName = name.trim();
  const cats = Store.getCategories();
  if (cats.includes(cleanName)) {
    showToastNotification("هذا القسم مسجل بالفعل!", "error");
    return;
  }
  cats.push(cleanName);
  await Store.saveCategories(cats);
  currentCatalogCategoryFilter = cleanName;
  renderCatalog();
  if (typeof renderPOSCategories === 'function') renderPOSCategories();
  if (typeof renderCategoriesList === 'function') renderCategoriesList();
  showToastNotification(`تمت إضافة قسم "${cleanName}" بنجاح!`, "success");
};

function renderCatalogCategoryRail() {
  const rail = document.getElementById('catalog-category-rail');
  if (!rail) return;

  const cats = Store.getCategories();
  const prods = Store.getProducts();

  let html = `
    <button type="button" class="btn btn-sm btn-cat-chip ${currentCatalogCategoryFilter === 'all' ? 'active' : ''}" onclick="setCatalogCategoryFilter('all')" style="border-radius:999px; padding:6px 14px; font-weight:800; font-size:12px; white-space:nowrap; border:1px solid var(--border); background:${currentCatalogCategoryFilter === 'all' ? 'var(--primary)' : 'var(--surface)'}; color:${currentCatalogCategoryFilter === 'all' ? '#fff' : 'var(--text-main)'}; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
      <span>كل الأصناف</span>
      <span style="font-size:10px; background:${currentCatalogCategoryFilter === 'all' ? 'rgba(255,255,255,0.25)' : 'var(--surface-raised)'}; padding:1px 6px; border-radius:10px;">${prods.length}</span>
    </button>
  `;

  cats.forEach(c => {
    const count = prods.filter(p => p && p.category === c).length;
    const isActive = currentCatalogCategoryFilter === c;
    html += `
      <button type="button" class="btn btn-sm btn-cat-chip ${isActive ? 'active' : ''}" onclick="setCatalogCategoryFilter('${Store.escapeHtml(c)}')" style="border-radius:999px; padding:6px 14px; font-weight:800; font-size:12px; white-space:nowrap; border:1px solid var(--border); background:${isActive ? 'var(--primary)' : 'var(--surface)'}; color:${isActive ? '#fff' : 'var(--text-main)'}; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
        <span>${Store.escapeHtml(c)}</span>
        <span style="font-size:10px; background:${isActive ? 'rgba(255,255,255,0.25)' : 'var(--surface-raised)'}; padding:1px 6px; border-radius:10px;">${count}</span>
      </button>
    `;
  });

  rail.innerHTML = html;
}

function renderCatalog() {
  renderCatalogCategoryRail();
  renderCatalogItemsOnly();
}

function renderCatalogItemsOnly() {
  if (!adminElements.catalogContainer) return;
  const prods = Store.getProducts();
  const currency = Store.getSettings().currency || "ج.م";

  if (prods.length === 0) {
    if (Store.isCloudDataLoaded && !Store.isCloudDataLoaded()) {
      adminElements.catalogContainer.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:45px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-md);">
          <div style="width:28px; height:28px; border:3px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px;"></div>
          <div style="font-size:14px; font-weight:700; color:var(--text-muted);">جاري تحميل أصناف المنيو</div>
        </div>
      `;
      return;
    }

    adminElements.catalogContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:45px 20px; background:var(--surface); border:1px dashed var(--border-strong); border-radius:var(--radius-md);">
        <div style="margin-bottom:12px;"><svg class="icon" viewBox="0 0 24 24" style="width:38px; height:38px; color:var(--text-muted);"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M5 2v13a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2"/><path d="M7 2v6"/><path d="M8 17v5"/></svg></div>
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

  // Filter products by category & search
  let filtered = prods.filter(p => {
    if (currentCatalogCategoryFilter !== 'all' && p.category !== currentCatalogCategoryFilter) {
      return false;
    }
    if (currentCatalogSearch) {
      const matchName = (p.name || '').toLowerCase().includes(currentCatalogSearch);
      const matchDesc = (p.desc || '').toLowerCase().includes(currentCatalogSearch);
      const matchCat = (p.category || '').toLowerCase().includes(currentCatalogSearch);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    adminElements.catalogContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-md); color:var(--text-muted);">
        <div style="font-size:15px; font-weight:800; color:var(--text-main); margin-bottom:4px;">لا توجد أصناف مطابقة لبحثك</div>
        <div style="font-size:12px; margin-bottom:14px;">جرب تغيير كلمة البحث أو اختيار قسم آخر</div>
        ${currentCatalogCategoryFilter !== 'all' ? `
          <button type="button" class="btn btn-primary btn-sm" onclick="openProductModalForCategory('${Store.escapeHtml(currentCatalogCategoryFilter)}')" style="font-weight:800;">
            + إضافة صنف في قسم "${Store.escapeHtml(currentCatalogCategoryFilter)}"
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  adminElements.catalogContainer.innerHTML = filtered.map(p => {
    const hasRecipe = p.recipe && (
      (Array.isArray(p.recipe.base) && p.recipe.base.length > 0) ||
      (p.recipe.sizes && Object.keys(p.recipe.sizes).length > 0) ||
      (p.recipe.addons && Object.keys(p.recipe.addons).length > 0)
    );

    return `
      <div class="admin-product-card ${p.visible === false ? 'hidden-item' : ''}" data-id="${p.id}" style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden; display:flex; flex-direction:column;">
        <div style="position:relative; width:100%; height:140px; background:var(--bg);">
          <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" style="width:100%; height:100%; object-fit:cover;">
          ${p.badge ? `<span style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.75); color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">${p.badge}</span>` : ''}
          ${p.isFeatured ? `<span style="position:absolute; top:8px; left:8px; background:var(--primary); color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">هيرو</span>` : ''}
          ${hasRecipe ? `
            <span style="position:absolute; bottom:8px; right:8px; background:rgba(22,163,74,0.9); color:#fff; font-size:9.5px; font-weight:800; padding:2px 6px; border-radius:4px; display:inline-flex; align-items:center; gap:3px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              مربوط بالمخزون
            </span>
          ` : ''}
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
    `;
  }).join('');
}

window.openProductModalForCategory = function(catName) {
  openProductModal(null);
  if (adminElements.prodCategory && catName) {
    adminElements.prodCategory.value = catName;
  }
};

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
    confirmText: "حذف الصنف",
    cancelText: "إلغاء",
    isDanger: true
  });
  if (confirmed) {
    await Store.deleteProduct(id);
    renderCatalog();
    showToastNotification("تم حذف الصنف بنجاح", "success");
  }
};

// ═══════════════════════════════════════════════════════════
// RECIPE & RAW MATERIALS BUILDER (PER SIZE & PER ADDON)
// ═══════════════════════════════════════════════════════════

function getRawMaterialSelectOptions(selectedId = '') {
  const mats = (Store.getRawMaterials ? Store.getRawMaterials() : []) || [];
  if (mats.length === 0) {
    return `<option value="">(يرجى إضافة مواد خام أولاً في تاب المخزون)</option>`;
  }
  return `<option value="">-- اختر المادة الخام --</option>` + mats.map(m => `
    <option value="${m.id}" data-unit="${m.unit}" ${m.id === selectedId ? 'selected' : ''}>
      ${Store.escapeHtml(m.name)} (${m.unit})
    </option>
  `).join('');
}

window.addRecipeBaseRow = function(materialId = '', amount = '') {
  const list = document.getElementById('prod-recipe-base-list');
  if (!list) return;

  const div = document.createElement('div');
  div.className = 'recipe-base-row';
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <select class="form-select recipe-mat-select" style="flex:1; padding:6px 10px; font-size:12px;">
      ${getRawMaterialSelectOptions(materialId)}
    </select>
    <div style="display:flex; align-items:center; gap:4px; width:120px;">
      <input type="number" class="form-input font-num recipe-amount-input" placeholder="المقدار" value="${amount}" step="any" min="0" style="padding:6px 8px; font-size:12px; flex:1;">
      <span class="recipe-unit-label text-muted" style="font-size:11px; font-weight:700; min-width:26px;"></span>
    </div>
    <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px;" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  const sel = div.querySelector('.recipe-mat-select');
  const unitLabel = div.querySelector('.recipe-unit-label');
  const updateUnit = () => {
    const opt = sel.options[sel.selectedIndex];
    const u = opt ? opt.getAttribute('data-unit') : '';
    unitLabel.textContent = u || '';
  };
  sel.addEventListener('change', updateUnit);
  updateUnit();

  list.appendChild(div);
};

function syncRecipeSizesUI(savedSizesRecipe = null) {
  const container = document.getElementById('prod-recipe-sizes-list');
  if (!container) return;

  const sizeRows = document.querySelectorAll('#prod-sizes-list .size-row-item');
  if (sizeRows.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); font-style:italic;">لم يتم تحديد أحجام لهذا الصنف.</div>`;
    return;
  }

  // Preserve existing input values if any
  const currentValues = savedSizesRecipe || {};
  if (!savedSizesRecipe) {
    container.querySelectorAll('.recipe-size-block').forEach(block => {
      const sName = block.getAttribute('data-size-name');
      if (sName) {
        currentValues[sName] = [];
        block.querySelectorAll('.recipe-size-item-row').forEach(row => {
          const mId = row.querySelector('.recipe-mat-select')?.value;
          const amt = row.querySelector('.recipe-amount-input')?.value;
          if (mId && amt) {
            currentValues[sName].push({ materialId: mId, amount: parseFloat(amt) || 0 });
          }
        });
      }
    });
  }

  container.innerHTML = '';

  sizeRows.forEach(sr => {
    const name = (sr.querySelector('.size-name-input')?.value || '').trim();
    if (!name) return;

    const block = document.createElement('div');
    block.className = 'recipe-size-block';
    block.setAttribute('data-size-name', name);
    block.style.background = 'var(--surface)';
    block.style.border = '1px solid var(--border)';
    block.style.borderRadius = '8px';
    block.style.padding = '8px 10px';

    block.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-size:11.5px; font-weight:800; color:var(--text-main);">حجم: <strong>${Store.escapeHtml(name)}</strong></span>
        <button type="button" class="btn btn-ghost btn-sm" onclick="addRecipeSizeRow('${Store.escapeHtml(name)}')" style="font-size:11px; padding:2px 8px; border:1px solid var(--border);">+ مكون للحجم</button>
      </div>
      <div class="recipe-size-items-wrap" id="recipe-size-wrap-${encodeURIComponent(name)}" style="display:flex; flex-direction:column; gap:6px;"></div>
    `;

    container.appendChild(block);

    const itemsWrap = block.querySelector('.recipe-size-items-wrap');
    const existing = currentValues[name] || [];
    if (existing.length > 0) {
      existing.forEach(r => addRecipeSizeRow(name, r.materialId, r.amount));
    }
  });
}

window.addRecipeSizeRow = function(sizeName, materialId = '', amount = '') {
  const wrap = document.getElementById(`recipe-size-wrap-${encodeURIComponent(sizeName)}`);
  if (!wrap) return;

  const div = document.createElement('div');
  div.className = 'recipe-size-item-row';
  div.style.display = 'flex';
  div.style.gap = '6px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <select class="form-select recipe-mat-select" style="flex:1; padding:4px 8px; font-size:11.5px;">
      ${getRawMaterialSelectOptions(materialId)}
    </select>
    <div style="display:flex; align-items:center; gap:4px; width:110px;">
      <input type="number" class="form-input font-num recipe-amount-input" placeholder="المقدار" value="${amount}" step="any" min="0" style="padding:4px 6px; font-size:11.5px; flex:1;">
      <span class="recipe-unit-label text-muted" style="font-size:10.5px; font-weight:700; min-width:24px;"></span>
    </div>
    <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:2px 6px;" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  const sel = div.querySelector('.recipe-mat-select');
  const unitLabel = div.querySelector('.recipe-unit-label');
  const updateUnit = () => {
    const opt = sel.options[sel.selectedIndex];
    const u = opt ? opt.getAttribute('data-unit') : '';
    unitLabel.textContent = u || '';
  };
  sel.addEventListener('change', updateUnit);
  updateUnit();

  wrap.appendChild(div);
};

function syncRecipeAddonsUI(savedAddonsRecipe = null) {
  const container = document.getElementById('prod-recipe-addons-list');
  if (!container) return;

  const addonRows = document.querySelectorAll('#prod-addons-list .addon-row-item');
  if (addonRows.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); font-style:italic;">لم يتم تحديد إضافات لهذا الصنف.</div>`;
    return;
  }

  const currentValues = savedAddonsRecipe || {};
  if (!savedAddonsRecipe) {
    container.querySelectorAll('.recipe-addon-block').forEach(block => {
      const aName = block.getAttribute('data-addon-name');
      if (aName) {
        currentValues[aName] = [];
        block.querySelectorAll('.recipe-addon-item-row').forEach(row => {
          const mId = row.querySelector('.recipe-mat-select')?.value;
          const amt = row.querySelector('.recipe-amount-input')?.value;
          if (mId && amt) {
            currentValues[aName].push({ materialId: mId, amount: parseFloat(amt) || 0 });
          }
        });
      }
    });
  }

  container.innerHTML = '';

  addonRows.forEach(ar => {
    const name = (ar.querySelector('.addon-name-input')?.value || '').trim();
    if (!name) return;

    const block = document.createElement('div');
    block.className = 'recipe-addon-block';
    block.setAttribute('data-addon-name', name);
    block.style.background = 'var(--surface)';
    block.style.border = '1px solid var(--border)';
    block.style.borderRadius = '8px';
    block.style.padding = '8px 10px';

    block.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-size:11.5px; font-weight:800; color:var(--text-main);">إضافة: <strong>${Store.escapeHtml(name)}</strong></span>
        <button type="button" class="btn btn-ghost btn-sm" onclick="addRecipeAddonRow('${Store.escapeHtml(name)}')" style="font-size:11px; padding:2px 8px; border:1px solid var(--border);">+ مكون للإضافة</button>
      </div>
      <div class="recipe-addon-items-wrap" id="recipe-addon-wrap-${encodeURIComponent(name)}" style="display:flex; flex-direction:column; gap:6px;"></div>
    `;

    container.appendChild(block);

    const existing = currentValues[name] || [];
    if (existing.length > 0) {
      existing.forEach(r => addRecipeAddonRow(name, r.materialId, r.amount));
    }
  });
}

window.addRecipeAddonRow = function(addonName, materialId = '', amount = '') {
  const wrap = document.getElementById(`recipe-addon-wrap-${encodeURIComponent(addonName)}`);
  if (!wrap) return;

  const div = document.createElement('div');
  div.className = 'recipe-addon-item-row';
  div.style.display = 'flex';
  div.style.gap = '6px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <select class="form-select recipe-mat-select" style="flex:1; padding:4px 8px; font-size:11.5px;">
      ${getRawMaterialSelectOptions(materialId)}
    </select>
    <div style="display:flex; align-items:center; gap:4px; width:110px;">
      <input type="number" class="form-input font-num recipe-amount-input" placeholder="المقدار" value="${amount}" step="any" min="0" style="padding:4px 6px; font-size:11.5px; flex:1;">
      <span class="recipe-unit-label text-muted" style="font-size:10.5px; font-weight:700; min-width:24px;"></span>
    </div>
    <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:2px 6px;" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  const sel = div.querySelector('.recipe-mat-select');
  const unitLabel = div.querySelector('.recipe-unit-label');
  const updateUnit = () => {
    const opt = sel.options[sel.selectedIndex];
    const u = opt ? opt.getAttribute('data-unit') : '';
    unitLabel.textContent = u || '';
  };
  sel.addEventListener('change', updateUnit);
  updateUnit();

  wrap.appendChild(div);
};

// ═══════════════════════════════════════════════════════════
// PRODUCT MODAL OPERATIONS
// ═══════════════════════════════════════════════════════════

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
  
  const recipeBaseList = document.getElementById('prod-recipe-base-list');
  if (recipeBaseList) recipeBaseList.innerHTML = '';

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

    // Populate Recipe
    if (p.recipe) {
      if (Array.isArray(p.recipe.base)) {
        p.recipe.base.forEach(r => addRecipeBaseRow(r.materialId, r.amount));
      }
      syncRecipeSizesUI(p.recipe.sizes || null);
      syncRecipeAddonsUI(p.recipe.addons || null);
    } else {
      syncRecipeSizesUI(null);
      syncRecipeAddonsUI(null);
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

    syncRecipeSizesUI(null);
    syncRecipeAddonsUI(null);
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
    <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px; display:inline-flex; align-items:center;" onclick="this.parentElement.remove(); syncRecipeSizesUI();"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
  `;

  div.querySelector('.size-name-input').addEventListener('input', () => syncRecipeSizesUI());
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
    <button type="button" class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px; display:inline-flex; align-items:center;" onclick="this.parentElement.remove(); syncRecipeAddonsUI();"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
  `;

  div.querySelector('.addon-name-input').addEventListener('input', () => syncRecipeAddonsUI());
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

  const parseCleanAmt = (val) => {
    if (val === null || val === undefined) return 0;
    const str = String(val).replace(/,/g, '').trim();
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // Collect Recipe: Base items
  const recipeBase = [];
  document.querySelectorAll('#prod-recipe-base-list .recipe-base-row').forEach(row => {
    const matId = row.querySelector('.recipe-mat-select')?.value;
    const amt = parseCleanAmt(row.querySelector('.recipe-amount-input')?.value);
    if (matId && amt > 0) {
      recipeBase.push({ materialId: String(matId), amount: amt });
    }
  });

  // Collect Recipe: Sizes items
  const recipeSizes = {};
  document.querySelectorAll('#prod-recipe-sizes-list .recipe-size-block').forEach(block => {
    const sName = block.getAttribute('data-size-name');
    if (sName) {
      const items = [];
      block.querySelectorAll('.recipe-size-item-row').forEach(row => {
        const matId = row.querySelector('.recipe-mat-select')?.value;
        const amt = parseCleanAmt(row.querySelector('.recipe-amount-input')?.value);
        if (matId && amt > 0) {
          items.push({ materialId: String(matId), amount: amt });
        }
      });
      if (items.length > 0) {
        recipeSizes[sName] = items;
      }
    }
  });

  // Collect Recipe: Addons items
  const recipeAddons = {};
  document.querySelectorAll('#prod-recipe-addons-list .recipe-addon-block').forEach(block => {
    const aName = block.getAttribute('data-addon-name');
    if (aName) {
      const items = [];
      block.querySelectorAll('.recipe-addon-item-row').forEach(row => {
        const matId = row.querySelector('.recipe-mat-select')?.value;
        const amt = parseCleanAmt(row.querySelector('.recipe-amount-input')?.value);
        if (matId && amt > 0) {
          items.push({ materialId: String(matId), amount: amt });
        }
      });
      if (items.length > 0) {
        recipeAddons[aName] = items;
      }
    }
  });

  const recipe = {
    base: recipeBase,
    sizes: recipeSizes,
    addons: recipeAddons
  };

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
    recipe,
    visible: isVisible
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري الحفظ';
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
      showToastNotification("تم حفظ وتحديث بيانات الصنف بنجاح!", "success");
    } else {
      await Store.addProduct(productData);
      showToastNotification("تمت إضافة الصنف الجديد بنجاح!", "success");
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

window.setupProductManagement = setupProductManagement;
window.renderCatalog = renderCatalog;
window.handleCatalogSearch = handleCatalogSearch;
window.setCatalogCategoryFilter = setCatalogCategoryFilter;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.addSizeRow = addSizeRow;
window.addAddonRow = addAddonRow;
window.saveProductForm = saveProductForm;
