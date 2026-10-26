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
        showToastNotification("تمت إضافة القسم الجديد بنجاح!", "success");
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
        <div style="margin-bottom:8px;"><svg class="icon" viewBox="0 0 24 24" style="width:32px; height:32px; color:var(--text-muted);"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
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
            <span class="cat-admin-icon"><svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
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

window.openCategoryModal = function(index = null) {
  const modal = document.getElementById('category-modal');
  const backdrop = document.getElementById('category-modal-backdrop');
  const title = document.getElementById('category-modal-title');
  const subtitle = document.getElementById('category-modal-subtitle');
  const submitBtn = document.getElementById('btn-save-category-modal');
  const deleteBtn = document.getElementById('btn-delete-category-modal');
  const indexInput = document.getElementById('category-modal-index');
  const nameInput = document.getElementById('category-modal-name-input');
  const errBox = document.getElementById('category-modal-error');
  const legacyIdx = document.getElementById('edit-cat-index');
  const legacyName = document.getElementById('edit-cat-name-input');

  if (errBox) {
    errBox.style.display = 'none';
    errBox.textContent = '';
  }

  const cats = Store.getCategories();
  const isEdit = (index !== null && index !== undefined && index !== '' && !isNaN(parseInt(index, 10)));

  if (isEdit) {
    const idx = parseInt(index, 10);
    if (idx >= 0 && idx < cats.length) {
      const currentCat = cats[idx];
      if (title) title.textContent = "تعديل اسم القسم";
      if (subtitle) subtitle.textContent = "سيتم تحديث كافة المنتجات المرتبطة بهذا القسم تلقائياً دون أي فقدان للبيانات";
      if (submitBtn) submitBtn.textContent = "حفظ التعديل";
      if (indexInput) indexInput.value = idx;
      if (nameInput) nameInput.value = currentCat;
      if (legacyIdx) legacyIdx.value = idx;
      if (legacyName) legacyName.value = currentCat;

      if (deleteBtn) {
        deleteBtn.style.display = 'inline-flex';
        deleteBtn.onclick = () => {
          closeCategoryModal();
          deleteCategoryFast(currentCat);
        };
      }
    }
  } else {
    if (title) title.textContent = "إضافة قسم جديد";
    if (subtitle) subtitle.textContent = "تنظيم وتصنيف الأصناف في المنيو وشاشات المطبخ والكاشير";
    if (submitBtn) submitBtn.textContent = "إضافة القسم";
    if (indexInput) indexInput.value = '';
    if (nameInput) nameInput.value = '';
    if (legacyIdx) legacyIdx.value = '';
    if (legacyName) legacyName.value = '';

    if (deleteBtn) {
      deleteBtn.style.display = 'none';
      deleteBtn.onclick = null;
    }
  }

  if (modal) modal.classList.add('open', 'show');
  if (backdrop) backdrop.classList.add('open', 'show');
  if (nameInput) {
    setTimeout(() => {
      nameInput.focus();
      if (isEdit) nameInput.select();
    }, 100);
  }
};

window.closeCategoryModal = function() {
  const modal = document.getElementById('category-modal');
  const backdrop = document.getElementById('category-modal-backdrop');
  if (modal) modal.classList.remove('open', 'show');
  if (backdrop) backdrop.classList.remove('open', 'show');
  const errBox = document.getElementById('category-modal-error');
  if (errBox) {
    errBox.style.display = 'none';
    errBox.textContent = '';
  }
};

window.handleCategoryModalSubmit = async function(event) {
  if (event && event.preventDefault) event.preventDefault();

  const indexInput = document.getElementById('category-modal-index');
  const nameInput = document.getElementById('category-modal-name-input');
  const errBox = document.getElementById('category-modal-error');
  const submitBtn = document.getElementById('btn-save-category-modal');

  const rawName = (nameInput ? nameInput.value : '').trim();
  if (!rawName) {
    if (errBox) {
      errBox.textContent = "يرجى كتابة اسم صحيح للقسم";
      errBox.style.display = 'block';
    }
    return;
  }

  const rawIdx = indexInput ? indexInput.value : '';
  const isEdit = (rawIdx !== '' && !isNaN(parseInt(rawIdx, 10)));
  const cats = Store.getCategories();

  if (isEdit) {
    const index = parseInt(rawIdx, 10);
    if (index < 0 || index >= cats.length) return;
    const oldName = cats[index];

    if (rawName === oldName) {
      closeCategoryModal();
      return;
    }

    const existingIdx = cats.findIndex((c, i) => i !== index && c.trim().toLowerCase() === rawName.toLowerCase());
    if (existingIdx !== -1) {
      if (errBox) {
        errBox.textContent = "يوجد قسم آخر بهذا الاسم بالفعل!";
        errBox.style.display = 'block';
      } else {
        showToastNotification("يوجد قسم آخر بهذا الاسم بالفعل!", "error");
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "جاري الحفظ...";
    }

    try {
      cats[index] = rawName;
      const prods = Store.getProducts();
      let updatedProductsCount = 0;
      prods.forEach(p => {
        if (p && p.category === oldName) {
          p.category = rawName;
          updatedProductsCount++;
        }
      });

      if (updatedProductsCount > 0) {
        await Store.saveProducts(prods);
      }
      await Store.saveCategories(cats);

      if (typeof currentCatalogCategoryFilter !== 'undefined' && currentCatalogCategoryFilter === oldName) {
        currentCatalogCategoryFilter = rawName;
      }

      renderCategoriesList();
      if (typeof renderCatalog === 'function') renderCatalog();
      if (typeof renderPOSCategories === 'function') renderPOSCategories();
      if (typeof renderPOSProducts === 'function') renderPOSProducts();

      closeCategoryModal();
      showToastNotification(`تم تعديل القسم وتحديث (${updatedProductsCount}) صنف مرتبط بنجاح!`, "success");
    } catch(err) {
      console.error("Error saving category edit:", err);
      showToastNotification("حدث خطأ أثناء حفظ تعديل القسم", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "حفظ التعديل";
      }
    }
  } else {
    // Add mode
    const existingIdx = cats.findIndex(c => c.trim().toLowerCase() === rawName.toLowerCase());
    if (existingIdx !== -1) {
      if (errBox) {
        errBox.textContent = "هذا القسم مسجل بالفعل!";
        errBox.style.display = 'block';
      } else {
        showToastNotification("هذا القسم مسجل بالفعل!", "error");
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "جاري الإضافة...";
    }

    try {
      cats.push(rawName);
      await Store.saveCategories(cats);

      if (typeof currentCatalogCategoryFilter !== 'undefined') {
        currentCatalogCategoryFilter = rawName;
      }

      renderCategoriesList();
      if (typeof renderCatalog === 'function') renderCatalog();
      if (typeof renderPOSCategories === 'function') renderPOSCategories();

      closeCategoryModal();
      showToastNotification(`تمت إضافة قسم "${rawName}" بنجاح!`, "success");
    } catch(err) {
      console.error("Error adding category:", err);
      showToastNotification("حدث خطأ أثناء إضافة القسم", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "إضافة القسم";
      }
    }
  }
};

// Backwards compatibility aliases
window.openCategoryEditModal = function(index) {
  window.openCategoryModal(index);
};
window.openCategoryEditModalByName = function(catName) {
  const cats = Store.getCategories();
  const idx = cats.indexOf(catName);
  if (idx !== -1) {
    window.openCategoryModal(idx);
  }
};
window.closeCategoryEditModal = function() {
  window.closeCategoryModal();
};
window.saveCategoryEdit = function() {
  return window.handleCategoryModalSubmit();
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
    icon: "",
    confirmText: attachedProds.length > 0 ? "حذف ونقل الأصناف" : "حذف القسم",
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

    // Reset filter if deleting active category
    if (typeof window.currentCatalogCategoryFilter !== 'undefined' && window.currentCatalogCategoryFilter === cat) {
      if (typeof window.setCatalogCategoryFilter === 'function') {
        window.setCatalogCategoryFilter('all');
      } else {
        window.currentCatalogCategoryFilter = 'all';
      }
    }

    renderCategoriesList();
    if (typeof renderCatalog === 'function') {
      renderCatalog();
    }
    if (typeof renderManageCategoriesModalList === 'function') {
      renderManageCategoriesModalList();
    }
    if (typeof renderPOSCategories === 'function') {
      renderPOSCategories();
    }
    if (typeof renderPOSProducts === 'function') {
      renderPOSProducts();
    }
    
    if (updatedProductsCount > 0) {
      showToastNotification(`تم حذف القسم بنجاح ونقل (${updatedProductsCount}) صنف إلى "${fallbackCat}"`, "success");
    } else {
      showToastNotification("تم حذف القسم بنجاح", "success");
    }
  }
};

// ═══ LUXURY MANAGE ALL CATEGORIES MODAL CONTROLLER ═══════════
window.openManageCategoriesModal = function() {
  const modal = document.getElementById('manage-categories-modal');
  const backdrop = document.getElementById('manage-categories-modal-backdrop');
  renderManageCategoriesModalList();
  if (modal) modal.classList.add('open', 'show');
  if (backdrop) backdrop.classList.add('open', 'show');
  pushAdminNavState('admin_manage_categories');
};

window.closeManageCategoriesModal = function(triggerHistoryBack = true) {
  const modal = document.getElementById('manage-categories-modal');
  const backdrop = document.getElementById('manage-categories-modal-backdrop');
  if (modal) modal.classList.remove('open', 'show');
  if (backdrop) backdrop.classList.remove('open', 'show');
  if (triggerHistoryBack && window.history.state && window.history.state.adminNav === 'admin_manage_categories') {
    try { history.back(); } catch(e) {}
  }
};

window.renderManageCategoriesModalList = function() {
  const container = document.getElementById('manage-categories-modal-list');
  if (!container) return;

  const cats = Store.getCategories();
  const prods = Store.getProducts();

  if (cats.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:32px 16px; color:var(--text-muted); font-size:12.5px;">
        لا توجد أي أقسام مضافة حالياً.
      </div>
    `;
    return;
  }

  container.innerHTML = cats.map((cat, idx) => {
    const count = prods.filter(p => p && p.category === cat).length;
    const countLabel = count === 0 ? '0 صنف' : (count === 1 ? 'صنف واحد' : (count === 2 ? 'صنفان' : (count >= 3 && count <= 10 ? `${count} أصناف` : `${count} صنف`)));

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px 14px; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          <span style="width:32px; height:32px; border-radius:8px; background:var(--primary-subtle); color:var(--primary); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </span>
          <div style="min-width:0;">
            <div style="font-weight:900; font-size:13.5px; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${Store.escapeHtml(cat)}</div>
            <div style="font-size:11px; color:var(--text-muted); font-weight:700;">${countLabel}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="closeManageCategoriesModal(); openCategoryModal(${idx});" style="font-size:11.5px; font-weight:800; padding:6px 10px; border:1px solid var(--border); border-radius:6px; display:inline-flex; align-items:center; gap:4px; background:var(--surface);" title="تعديل اسم القسم">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            <span>تعديل</span>
          </button>
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteCategoryFast('${Store.escapeHtml(cat)}')" style="font-size:11.5px; font-weight:800; padding:6px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:4px; cursor:pointer;" title="حذف القسم">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            <span>حذف</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
};

window.setupCategoryManagement = setupCategoryManagement;
window.renderCategoriesList = renderCategoriesList;
