// ═══════════════════════════════════════════════════════════
// HarpyOrder — Backup, Restore & Factory Reset Engine
// ═══════════════════════════════════════════════════════════

window.openFactoryResetPwdModal = function() {
  const modal = document.getElementById('factory-reset-pwd-modal');
  const backdrop = document.getElementById('factory-reset-pwd-backdrop');
  const input = document.getElementById('factory-reset-password-input');
  const err = document.getElementById('factory-reset-pwd-error-msg');
  if (err) err.style.display = 'none';
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 150);
  }
  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
};

window.closeFactoryResetPwdModal = function() {
  const modal = document.getElementById('factory-reset-pwd-modal');
  const backdrop = document.getElementById('factory-reset-pwd-backdrop');
  const input = document.getElementById('factory-reset-password-input');
  const err = document.getElementById('factory-reset-pwd-error-msg');
  if (modal) modal.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  if (input) input.value = '';
  if (err) err.style.display = 'none';
};

window.executeFactoryResetWithPassword = async function() {
  const input = document.getElementById('factory-reset-password-input');
  const err = document.getElementById('factory-reset-pwd-error-msg');
  const btn = document.getElementById('btn-confirm-factory-reset-pwd');
  const enteredPassword = (input ? input.value : '').trim();

  if (!enteredPassword) {
    if (err) {
      err.textContent = "يرجى إدخال كلمة المرور للمتابعة!";
      err.style.display = 'block';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "جاري التحقق... ⏳";
  }

  try {
    const slug = Store.getRestaurantSlug();
    const isVerified = await window.verifyAdminCredentials(enteredPassword, slug);

    if (isVerified) {
      window.closeFactoryResetPwdModal();
      await Store.resetAllDataToDefault(slug);
      if (typeof showToastNotification === 'function') {
        showToastNotification("تمت استعادة إعدادات المصنع بنجاح! 🔄", "success");
      }
      if (typeof loadAllDashboardData === 'function') {
        loadAllDashboardData();
      }
    } else {
      if (err) {
        err.textContent = "❌ كلمة المرور غير صحيحة! تم منع استعادة المصنع.";
        err.style.display = 'block';
      }
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  } catch (ex) {
    if (err) {
      err.textContent = "حدث خطأ أثناء التحقق: " + ex.message;
      err.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "تأكيد استعادة المصنع ⚠️";
    }
  }
};

function setupBackupAndRestore() {
  if (adminElements.btnExportBackup) {
    adminElements.btnExportBackup.addEventListener('click', () => {
      const json = Store.exportAllDataJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harpy_order_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (adminElements.importFileInput) {
    adminElements.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          await Store.importAllDataJSON(ev.target.result);
          showToastNotification("تم استرجاع كافة بيانات المنيو بنجاح! 📦", "success");
          loadAllDashboardData();
        } catch (err) {
          showToastNotification("حدث خطأ أثناء استرجاع الملف: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    });
  }

  if (adminElements.btnFactoryReset) {
    adminElements.btnFactoryReset.addEventListener('click', () => {
      window.openFactoryResetPwdModal();
    });
  }
}

window.setupBackupAndRestore = setupBackupAndRestore;
