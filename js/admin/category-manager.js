// ═══════════════════════════════════════════════════════════
// HarpyOrder — Category Management & Ordering Engine
// ═══════════════════════════════════════════════════════════

let editingCategoryOriginalName = null;

function setupCategoryManagement() {
  if (adminElements.btnAddCat) {
    const handleAdd = async () => {
      const val = (adminElements.newCatInput.value || '').trim();
      if (!val) return;
      const cats = Store.getCategories();
      if (!cats.includes(val)) {
        cats.push(val);
        adminElements.btnAddCat.disabled = true;
        await Store.saveCategories(cats);
        adminElements.btnAddCat.disabled = false;
        adminElements.newCatInput.value = '';
        renderCategoriesList();
        if (typeof renderCatalog === 'function') renderCatalog();
        if (typeof renderPOSCategories === 'function') renderPOSCategories();
        showToastNotification("تمت إضافة القسم الجديد بنجاح! ✓", "success");
      } else {
        showToastNotification("هذا القسم موجود بالفعل!", "error");
      }
    };
    adminElements.btnAddCat.addEventListener('click', handleAdd);
    if (adminElements.newCatInput) {
      adminElements.newCatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAdd();
        }
      });
    }
  }
}

function renderCategoriesList() {
  if (!adminElements.categoriesListContainer) return;
  const cats = Store.getCategories();
  const prods = Store.getProducts();

  if (cats.length === 0) {
    adminElements.categoriesListContainer.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px 20px; background:var(--surface-raised); border:1.5px dashed var(--border); border-radius:var(--radius-md); color:var(--text-muted);">
        <div style="font-size:32px; margin-bottom:8px;">📂</div>
        <div style="font-size:15px; font-weight:800; color:var(--text-main); margin-bottom:4px;">لا توجد أقسام مسجلة بعد</div>
        <div style="font-size:12.5px;">أضف أول قسم في الأعلى لتبدأ تنظيم وجبات المنيو!</div>
      </div>
    `;
    return;
  }

  adminElements.categoriesListContainer.innerHTML = cats.map((cat, idx) => {
    const count = prods.filter(p => p && p.category === cat).length;
    const countLabel = count === 0 ? '0 صنف' : (count === 1 ? 'صنف واحد' : (count === 2 ? 'صنفان' : (count >= 3 && count <= 10 ? `${count} أصناف` : `${count} صنف`)));
    return `
      <div class="cat-admin-card">
        <div class="cat-admin-header">
          <div class="cat-admin-title-wrap">
            <span class="cat-admin-icon">📂</span>
            <div class="cat-admin-title-col">
              <h3 class="cat-admin-name" title="${cat}">${cat}</h3>
            </div>
          </div>
          <span class="cat-admin-badge font-num">${countLabel}</span>
        </div>
        <div class="cat-admin-divider"></div>
        <div class="cat-admin-actions">
          <button type="button" class="btn btn-sm btn-ghost cat-btn-edit" onclick="openCategoryEditModal(${idx})" title="تعديل اسم القسم">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            <span>تعديل</span>
          </button>
          <button type="button" class="btn btn-sm btn-ghost cat-btn-del" onclick="deleteCategoryFastByIndex(${idx})" title="حذف القسم">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            <span>حذف</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.deleteCategoryFastByIndex = function(idx) {
  const cats = Store.getCategories();
  if (idx >= 0 && idx < cats.length) {
    deleteCategoryFast(cats[idx]);
  }
};

window.openCategoryEditModal = function(index) {
  const cats = Store.getCategories();
  if (index < 0 || index >= cats.length) return;
  const currentCat = cats[index];

  const modal = document.getElementById('category-edit-modal');
  const backdrop = document.getElementById('category-edit-backdrop');
  const indexInput = document.getElementById('edit-cat-index');
  const nameInput = document.getElementById('edit-cat-name-input');

  if (!modal || !indexInput || !nameInput) return;

  indexInput.value = index;
  nameInput.value = currentCat;

  modal.classList.add('open', 'show');
  if (backdrop) backdrop.classList.add('open', 'show');
  setTimeout(() => {
    nameInput.focus();
    nameInput.select();
  }, 100);
};

window.closeCategoryEditModal = function() {
  const modal = document.getElementById('category-edit-modal');
  const backdrop = document.getElementById('category-edit-backdrop');
  if (modal) modal.classList.remove('open', 'show');
  if (backdrop) backdrop.classList.remove('open', 'show');
};

window.saveCategoryEdit = async function() {
  const indexInput = document.getElementById('edit-cat-index');
  const nameInput = document.getElementById('edit-cat-name-input');
  if (!indexInput || !nameInput) return;

  const index = parseInt(indexInput.value, 10);
  const newName = (nameInput.value || '').trim();

  if (isNaN(index) || !newName) {
    showToastNotification("يرجى كتابة اسم صحيح للقسم", "error");
    return;
  }

  const cats = Store.getCategories();
  if (index < 0 || index >= cats.length) return;
  const oldName = cats[index];

  // If no changes made, quietly close modal
  if (newName === oldName) {
    closeCategoryEditModal();
    return;
  }

  // Check if newName already exists in another category
  const existingIdx = cats.findIndex((c, i) => i !== index && c.trim().toLowerCase() === newName.toLowerCase());
  if (existingIdx !== -1) {
    showToastNotification("يوجد قسم آخر بهذا الاسم بالفعل!", "error");
    return;
  }

  const saveBtn = document.getElementById('btn-save-cat-edit');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "جاري الحفظ...";
  }

  try {
    // 1. Update category name in-place
    cats[index] = newName;

    // 2. Non-destructive update: Update all products linked to old category name
    const prods = Store.getProducts();
    let updatedProductsCount = 0;
    prods.forEach(p => {
      if (p && p.category === oldName) {
        p.category = newName;
        updatedProductsCount++;
      }
    });

    if (updatedProductsCount > 0) {
      await Store.saveProducts(prods);
    }
    await Store.saveCategories(cats);

    renderCategoriesList();
    if (typeof renderCatalog === 'function') {
      renderCatalog();
    }
    if (typeof renderPOSCategories === 'function') {
      renderPOSCategories();
    }
    if (typeof renderPOSProducts === 'function') {
      renderPOSProducts();
    }
    if (typeof renderPOSCategories === 'function') {
      renderPOSCategories();
    }
    if (typeof renderPOSProducts === 'function') {
      renderPOSProducts();
    }
    closeCategoryEditModal();
    showToastNotification(`تم تعديل القسم وتحديث (${updatedProductsCount}) منتج مرتبط بنجاح! ✓`, "success");
  } catch(err) {
    console.error("Error saving category edit:", err);
    showToastNotification("حدث خطأ أثناء حفظ تعديل القسم", "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "حفظ التعديل ✓";
    }
  }
};

window.deleteCategoryFast = async function(cat) {
  const prods = Store.getProducts();
  const attachedProds = prods.filter(p => p && p.category === cat);
  const remainingCats = Store.getCategories().filter(c => c !== cat);

  let fallbackCat = remainingCats.length > 0 ? remainingCats[0] : "عام";

  let confirmMsg = `هل أنت متأكد من رغبتك في حذف قسم "<strong>${cat}</strong>"؟`;
  if (attachedProds.length > 0) {
    confirmMsg += `<br><span style="display:inline-block; margin-top:8px; font-size:12.5px; color:var(--text-muted); line-height:1.4;">يحتوي هذا القسم على <strong>${attachedProds.length}</strong> صنف، سيتم نقلها تلقائياً إلى قسم "<strong>${fallbackCat}</strong>" لضمان بقائها وظهورها في المنيو.</span>`;
  }

  const confirmed = await showCustomConfirm({
    title: "حذف قسم من المنيو",
    message: confirmMsg,
    icon: "📂",
    confirmText: attachedProds.length > 0 ? "حذف ونقل الأصناف 🗑️" : "حذف القسم 🗑️",
    cancelText: "إلغاء",
    isDanger: true
  });

  if (confirmed) {
    let updatedProductsCount = 0;
    if (attachedProds.length > 0) {
      prods.forEach(p => {
        if (p && p.category === cat) {
          p.category = fallbackCat;
          updatedProductsCount++;
        }
      });
      await Store.saveProducts(prods);
    }

    let finalCats = remainingCats;
    if (finalCats.length === 0) {
      finalCats = [fallbackCat];
    }
    await Store.saveCategories(finalCats);

    renderCategoriesList();
    if (typeof renderCatalog === 'function') {
      renderCatalog();
    }
    if (typeof renderPOSCategories === 'function') {
      renderPOSCategories();
    }
    if (typeof renderPOSProducts === 'function') {
      renderPOSProducts();
    }
    
    if (updatedProductsCount > 0) {
      showToastNotification(`تم حذف القسم بنجاح ونقل (${updatedProductsCount}) صنف إلى "${fallbackCat}" ✓`, "success");
    } else {
      showToastNotification("تم حذف القسم بنجاح ✓", "success");
    }
  }
};

window.setupCategoryManagement = setupCategoryManagement;
window.renderCategoriesList = renderCategoriesList;
