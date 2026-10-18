// ═══════════════════════════════════════════════════════════
// HarpyOrder — Raw Materials & Recipe Inventory Engine
// ═══════════════════════════════════════════════════════════

let currentInventoryFilter = 'all'; // 'all' | 'low' | 'safe'
let currentInventorySearch = '';
let currentEditingMaterialId = null;
let currentRestockMaterialId = null;

const UNIT_LABELS = {
  g: 'جرام',
  kg: 'كيلوجرام',
  ml: 'ملليلتر',
  L: 'لتر',
  pcs: 'قطعة / حبة'
};

function initInventoryManagement() {
  const searchInput = document.getElementById('inventory-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentInventorySearch = (e.target.value || '').trim().toLowerCase();
      renderInventory();
    });
  }

  const addBtn = document.getElementById('btn-open-add-raw-material');
  if (addBtn) {
    addBtn.addEventListener('click', () => openRawMaterialModal(null));
  }

  const matForm = document.getElementById('raw-material-form');
  if (matForm) {
    matForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveRawMaterialForm();
    });
  }

  const restockForm = document.getElementById('raw-material-restock-form');
  if (restockForm) {
    restockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitRestockForm();
    });
  }

  window.addEventListener('store_raw_materials_updated', () => {
    renderInventory();
  });
}

function filterInventory(filter) {
  currentInventoryFilter = filter;
  document.querySelectorAll('.btn-filter-inventory').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.inventoryFilter === filter);
  });
  renderInventory();
}

function formatStockDisplay(stock, unit) {
  const s = parseFloat(stock) || 0;
  const unitLabel = UNIT_LABELS[unit] || unit;
  
  if (unit === 'g' && s >= 1000) {
    const inKg = (s / 1000).toFixed(2).replace(/\.00$/, '');
    return `${s.toLocaleString('en-US')} ${unitLabel} <span class="text-muted" style="font-size:11px;">(${inKg} كجم)</span>`;
  }
  if (unit === 'ml' && s >= 1000) {
    const inL = (s / 1000).toFixed(2).replace(/\.00$/, '');
    return `${s.toLocaleString('en-US')} ${unitLabel} <span class="text-muted" style="font-size:11px;">(${inL} لتر)</span>`;
  }
  return `${s.toLocaleString('en-US')} ${unitLabel}`;
}

function renderInventory() {
  const container = document.getElementById('inventory-grid-container');
  if (!container) return;

  const materials = (Store.getRawMaterials ? Store.getRawMaterials() : []) || [];
  const currency = (Store.getSettings ? Store.getSettings().currency : "ج.م") || "ج.م";

  // Calculate statistics
  let lowCount = 0;
  let outCount = 0;
  let safeCount = 0;
  let totalValue = 0;

  materials.forEach(m => {
    const stock = parseFloat(m.stock) || 0;
    const minAlert = parseFloat(m.minAlert) || 0;
    const cost = parseFloat(m.costPerUnit) || 0;
    totalValue += (stock * cost);

    if (stock <= 0) {
      outCount++;
      lowCount++;
    } else if (stock <= minAlert) {
      lowCount++;
    } else {
      safeCount++;
    }
  });

  // Update summary stats in DOM
  const totalEl = document.getElementById('inv-stat-total');
  const lowEl = document.getElementById('inv-stat-low');
  const safeEl = document.getElementById('inv-stat-safe');
  const valEl = document.getElementById('inv-stat-value');
  const drawerBadge = document.getElementById('inventory-low-stock-badge');

  if (totalEl) totalEl.textContent = materials.length;
  if (lowEl) lowEl.textContent = lowCount;
  if (safeEl) safeEl.textContent = safeCount;
  if (valEl) valEl.textContent = `${totalValue.toFixed(0)} ${currency}`;

  // Update drawer badge
  if (drawerBadge) {
    if (lowCount > 0) {
      drawerBadge.style.display = 'inline-block';
      drawerBadge.textContent = lowCount;
    } else {
      drawerBadge.style.display = 'none';
    }
  }

  // Filter list
  let filtered = materials.filter(m => {
    const nameMatch = !currentInventorySearch || (m.name || '').toLowerCase().includes(currentInventorySearch);
    if (!nameMatch) return false;

    const stock = parseFloat(m.stock) || 0;
    const minAlert = parseFloat(m.minAlert) || 0;

    if (currentInventoryFilter === 'low') {
      return stock <= minAlert;
    }
    if (currentInventoryFilter === 'safe') {
      return stock > minAlert;
    }
    return true;
  });

  if (filtered.length === 0) {
    if (materials.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:45px 20px; background:var(--surface); border:1px dashed var(--border-strong); border-radius:var(--radius-md);">
          <div style="margin-bottom:12px;">
            <svg class="icon" viewBox="0 0 24 24" style="width:38px; height:38px; color:var(--text-muted);"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:6px;">سجل المواد الخام فارغ</div>
          <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:20px; max-width:340px; margin-left:auto; margin-right:auto;">
            ابدأ بتسجيل المواد الخام التي يعتمد عليها مطبخك (الدقيق، الجبنة، اللحوم، الصوصات، كراتين التعبئة) لمراقبة الاستهلاك بدقة ومنع النواقص.
          </div>
          <button type="button" class="btn btn-primary" onclick="openRawMaterialModal(null)" style="padding:10px 22px; font-weight:800; font-size:0.9rem; display:inline-flex; align-items:center; gap:6px;">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>إضافة أول مادة خام</span>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:35px 20px; color:var(--text-muted); font-size:13px; font-weight:700;">
          لا توجد مواد خام تطابق بحثك الحالي
        </div>
      `;
    }
    return;
  }

  container.innerHTML = filtered.map(m => {
    const stock = parseFloat(m.stock) || 0;
    const minAlert = parseFloat(m.minAlert) || 0;
    const cost = parseFloat(m.costPerUnit) || 0;
    const isOut = stock <= 0;
    const isLow = !isOut && stock <= minAlert;
    
    // Status visual
    let statusBadge = `<span style="background:rgba(34,197,94,0.15); color:#16a34a; font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;"><span style="width:6px; height:6px; border-radius:50%; background:#22c55e;"></span>متوفر</span>`;
    if (isOut) {
      statusBadge = `<span style="background:rgba(239,68,68,0.15); color:#ef4444; font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;"><span style="width:6px; height:6px; border-radius:50%; background:#ef4444;"></span>نفد من المخزون</span>`;
    } else if (isLow) {
      statusBadge = `<span style="background:rgba(245,158,11,0.15); color:#d97706; font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;"><span style="width:6px; height:6px; border-radius:50%; background:#f59e0b;"></span>قارب على النفاد</span>`;
    }

    // Gauge calculation
    const benchmark = Math.max(minAlert * 2, stock, 1);
    const pct = Math.min(100, Math.max(0, (stock / benchmark) * 100));
    const barColor = isOut ? '#ef4444' : (isLow ? '#f59e0b' : '#22c55e');

    return `
      <div class="inv-material-card" data-id="${m.id}" style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-sm); padding:16px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; gap:8px;">
            <div>
              <div style="font-size:15px; font-weight:900; color:var(--text-main); line-height:1.3;">${Store.escapeHtml(m.name)}</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">وحدة القياس: <strong>${UNIT_LABELS[m.unit] || m.unit}</strong></div>
            </div>
            ${statusBadge}
          </div>

          <!-- Stock Counter -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:10px 12px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11px; color:var(--text-muted); font-weight:700;">الرصيد المتبقي:</span>
              <span class="font-num" style="font-size:15px; font-weight:900; color:var(--text-main);">${formatStockDisplay(stock, m.unit)}</span>
            </div>
            <!-- Progress bar -->
            <div style="width:100%; height:6px; background:var(--border); border-radius:3px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:${barColor}; border-radius:3px; transition:width 0.3s ease;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; font-size:10px; color:var(--text-muted);">
              <span>حد التنبيه: ${minAlert.toLocaleString('en-US')} ${m.unit}</span>
              ${cost > 0 ? `<span>التكلفة: ${cost} ${currency}/${m.unit}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; gap:6px; align-items:center; border-top:1px solid var(--border); padding-top:10px; margin-top:6px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="openRestockModal('${m.id}')" style="flex:1; font-weight:800; font-size:12px; padding:6px 10px; display:inline-flex; align-items:center; justify-content:center; gap:5px;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>وارد جديد</span>
          </button>
          <button type="button" class="btn btn-sm btn-ghost" onclick="openRawMaterialModal('${m.id}')" title="تعديل المادة الخام" style="border:1px solid var(--border); padding:6px 10px; font-size:12px; font-weight:700;">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            <span>تعديل</span>
          </button>
          <button type="button" class="btn btn-sm btn-ghost" onclick="deleteRawMaterialFast('${m.id}')" title="حذف المادة الخام" style="color:var(--danger); border:1px solid rgba(239,68,68,0.25); padding:6px 8px; border-radius:6px;">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openRawMaterialModal(materialId) {
  currentEditingMaterialId = materialId;
  const modal = document.getElementById('raw-material-modal');
  const backdrop = document.getElementById('raw-material-modal-backdrop');
  const title = document.getElementById('raw-material-modal-title');
  const form = document.getElementById('raw-material-form');

  if (form) form.reset();

  const idInput = document.getElementById('mat-id');
  const nameInput = document.getElementById('mat-name');
  const unitSelect = document.getElementById('mat-unit');
  const stockInput = document.getElementById('mat-stock');
  const minAlertInput = document.getElementById('mat-min-alert');
  const costInput = document.getElementById('mat-cost');

  if (materialId) {
    const materials = Store.getRawMaterials();
    const mat = materials.find(m => m.id === materialId);
    if (!mat) return;

    if (title) title.textContent = "تعديل المادة الخام";
    if (idInput) idInput.value = mat.id;
    if (nameInput) nameInput.value = mat.name || '';
    if (unitSelect) unitSelect.value = mat.unit || 'g';
    if (stockInput) stockInput.value = mat.stock ?? 0;
    if (minAlertInput) minAlertInput.value = mat.minAlert ?? 0;
    if (costInput) costInput.value = mat.costPerUnit ?? 0;
  } else {
    if (title) title.textContent = "إضافة مادة خام جديدة";
    if (idInput) idInput.value = '';
    if (unitSelect) unitSelect.value = 'g';
    if (stockInput) stockInput.value = '';
    if (minAlertInput) minAlertInput.value = '1000';
    if (costInput) costInput.value = '';
  }

  if (modal) modal.classList.add('open', 'show');
  if (backdrop) backdrop.classList.add('open', 'show');
  if (nameInput) setTimeout(() => nameInput.focus(), 100);
}

function closeRawMaterialModal() {
  currentEditingMaterialId = null;
  const modal = document.getElementById('raw-material-modal');
  const backdrop = document.getElementById('raw-material-modal-backdrop');
  if (modal) modal.classList.remove('open', 'show');
  if (backdrop) backdrop.classList.remove('open', 'show');
}

function parseCleanNumber(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  const str = String(val).replace(/,/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

async function saveRawMaterialForm() {
  const name = (document.getElementById('mat-name')?.value || '').trim();
  const unit = document.getElementById('mat-unit')?.value || 'g';
  const stock = parseCleanNumber(document.getElementById('mat-stock')?.value, 0);
  const minAlert = parseCleanNumber(document.getElementById('mat-min-alert')?.value, 0);
  const costPerUnit = parseCleanNumber(document.getElementById('mat-cost')?.value, 0);

  if (!name) {
    showToastNotification("يرجى إدخال اسم المادة الخام", "error");
    document.getElementById('mat-name')?.focus();
    return;
  }

  const matData = {
    name,
    unit,
    stock,
    minAlert,
    costPerUnit
  };

  try {
    if (currentEditingMaterialId) {
      await Store.updateRawMaterial(currentEditingMaterialId, matData);
      showToastNotification("تم تحديث بيانات المادة الخام بنجاح!", "success");
    } else {
      await Store.addRawMaterial(matData);
      showToastNotification("تمت إضافة المادة الخام بنجاح!", "success");
    }
    closeRawMaterialModal();
    renderInventory();
  } catch (err) {
    console.error("[Inventory] Save error:", err);
    showToastNotification("حدث خطأ أثناء الحفظ: " + (err.message || 'فشل الاتصال'), "error");
  }
}

function openRestockModal(materialId) {
  currentRestockMaterialId = materialId;
  const materials = Store.getRawMaterials();
  const mat = materials.find(m => m.id === materialId);
  if (!mat) return;

  const modal = document.getElementById('raw-material-restock-modal');
  const backdrop = document.getElementById('raw-material-restock-backdrop');
  const title = document.getElementById('restock-modal-mat-name');
  const curStockEl = document.getElementById('restock-modal-cur-stock');
  const qtyInput = document.getElementById('restock-qty-input');
  const noteInput = document.getElementById('restock-note-input');
  const unitBadge = document.getElementById('restock-unit-badge');

  if (title) title.textContent = mat.name;
  if (curStockEl) curStockEl.textContent = `${(mat.stock || 0).toLocaleString('en-US')} ${UNIT_LABELS[mat.unit] || mat.unit}`;
  if (unitBadge) unitBadge.textContent = UNIT_LABELS[mat.unit] || mat.unit;
  if (qtyInput) qtyInput.value = '';
  if (noteInput) noteInput.value = '';

  if (modal) modal.classList.add('open', 'show');
  if (backdrop) backdrop.classList.add('open', 'show');
  if (qtyInput) setTimeout(() => qtyInput.focus(), 100);
}

function closeRestockModal() {
  currentRestockMaterialId = null;
  const modal = document.getElementById('raw-material-restock-modal');
  const backdrop = document.getElementById('raw-material-restock-backdrop');
  if (modal) modal.classList.remove('open', 'show');
  if (backdrop) backdrop.classList.remove('open', 'show');
}

async function submitRestockForm() {
  if (!currentRestockMaterialId) return;
  const qty = parseCleanNumber(document.getElementById('restock-qty-input')?.value, 0);
  const note = (document.getElementById('restock-note-input')?.value || '').trim();

  if (qty <= 0) {
    showToastNotification("يرجى إدخال كمية توريد صحيحة أكبر من الصفر", "error");
    document.getElementById('restock-qty-input')?.focus();
    return;
  }

  try {
    const res = await Store.restockRawMaterial(currentRestockMaterialId, qty, note);
    if (res && res.success === false) {
      showToastNotification(res.message || "فشلت عملية التوريد", "error");
    } else {
      showToastNotification("تم تسجيل الوارد الجديد وتحديث الرصيد بنجاح!", "success");
      closeRestockModal();
      renderInventory();
    }
  } catch (err) {
    console.error("[Inventory] Restock error:", err);
    showToastNotification("حدث خطأ أثناء التوريد: " + (err.message || 'فشل الاتصال'), "error");
  }
}

async function deleteRawMaterialFast(materialId) {
  const materials = Store.getRawMaterials();
  const mat = materials.find(m => m.id === materialId);
  const name = mat ? mat.name : 'هذه المادة الخام';

  const confirmed = await showCustomConfirm({
    title: "حذف مادة خام",
    message: `هل أنت متأكد من حذف المادة الخام "<strong>${name}</strong>" نهائياً؟ ستتوقف الوجبات عن خصمها تلقائياً.`,
    confirmText: "حذف نهائي",
    cancelText: "إلغاء",
    isDanger: true
  });

  if (confirmed) {
    await Store.deleteRawMaterial(materialId);
    showToastNotification("تم حذف المادة الخام بنجاح", "success");
    renderInventory();
  }
}

window.initInventoryManagement = initInventoryManagement;
window.renderInventory = renderInventory;
window.filterInventory = filterInventory;
window.openRawMaterialModal = openRawMaterialModal;
window.closeRawMaterialModal = closeRawMaterialModal;
window.saveRawMaterialForm = saveRawMaterialForm;
window.openRestockModal = openRestockModal;
window.closeRestockModal = closeRestockModal;
window.submitRestockForm = submitRestockForm;
window.deleteRawMaterialFast = deleteRawMaterialFast;
