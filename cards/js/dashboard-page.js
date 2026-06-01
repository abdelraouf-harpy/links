import { Services } from "./services.js?v=3.0.0";
import { UI } from "./ui.js?v=3.0.0";

let currentUser = null;
let userData = null;
let theme = '#7c3aed';
let lang = 'ar';

const BASE_URL = 'https://harpymenu.com/cards';

// Auth State Monitor
Services.onAuth(async user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;
  try {
    await loadData();
  } catch (e) {
    console.error("Error loading user profile:", e);
    UI.toast("حدث خطأ أثناء تحميل البيانات. يرجى التحقق من اتصالك بالشبكة.", "error");
  } finally {
    UI.showLoader(false);
  }
});

// Load user data
async function loadData() {
  const profile = await Services.getUserProfile(currentUser.uid);
  if (profile) {
    userData = profile;

    // Clean up insecure legacy field if present
    if (profile.savedAccounts) {
      await Services.removeInsecureSavedAccountsField(currentUser.uid);
    }
  } else {
    userData = {
      uid: currentUser.uid,
      username: '',
      name: currentUser.displayName || 'مستخدم جديد',
      email: currentUser.email || '',
      theme: '#7c3aed',
      lang: 'ar'
    };
  }

  // ─ Restore/Merge saved accounts from Firestore into localStorage
  try {
    const dbAccounts = await Services.getSavedAccounts(currentUser.uid);
    if (Array.isArray(dbAccounts) && dbAccounts.length > 0) {
      let localAccounts = [];
      try {
        localAccounts = JSON.parse(localStorage.getItem('harpy_saved_accounts')) || [];
      } catch (_) {}

      let deletedEmails = [];
      try {
        deletedEmails = JSON.parse(localStorage.getItem('harpy_deleted_accounts')) || [];
      } catch (_) {}

      // Filter out deleted accounts from the Firestore list
      const activeDbAccounts = dbAccounts.filter(a => !deletedEmails.includes(a.email.toLowerCase()));

      // Merge: add any active db accounts to local cache if not present
      let merged = [...localAccounts];
      for (const da of activeDbAccounts) {
        const idx = merged.findIndex(a => a.email.toLowerCase() === da.email.toLowerCase());
        if (idx === -1) {
          merged.push(da);
        } else {
          // Update details if present
          if (da.pass && !merged[idx].pass) merged[idx].pass = da.pass;
          if (da.username) merged[idx].username = da.username;
          if (da.name) merged[idx].name = da.name;
          if (da.photo) merged[idx].photo = da.photo;
        }
      }

      localStorage.setItem('harpy_saved_accounts', JSON.stringify(merged));
    }
  } catch (e) {
    console.warn("Could not restore saved accounts from Firestore on load:", e);
  }

  fillUI(userData);
  await updateSavedAccounts(userData);
}

// Populate fields
function fillUI(d) {
  /* sidebar */
  document.getElementById('sb-name').textContent = d.name || '—';
  document.getElementById('sb-uname').textContent = '@' + (d.username || '—');
  updateSidebarAvatar(d.photo, d.name);

  /* username link claim status */
  const uInput = document.getElementById('f-username');
  const uHint = document.getElementById('f-username-hint');
  
  if (uInput && uHint) {
    if (d.username) {
      uInput.value = d.username;
      uInput.disabled = true;
      uHint.textContent = "اليوزرنيم ثابت ولا يمكن تعديله بعد إنشائه لتجنب تلف روابط البطاقات.";
      uHint.style.color = "var(--dim)";
    } else {
      uInput.value = '';
      uInput.disabled = false;
      uHint.textContent = "الرجاء تعيين يوزرنيم لإنشاء رابط بطاقتك.";
      uHint.style.color = "var(--warn)";
    }
  }

  /* personal inputs */
  document.getElementById('f-name').value = d.name || '';
  document.getElementById('f-title').value = d.title || '';
  document.getElementById('f-company').value = d.company || '';
  document.getElementById('f-bio').value = d.bio || '';

  /* gallery photos display */
  renderPhotosGallery(d.photos);

  /* contact inputs */
  populateDynamicField('mobile', d.mobile);
  populateDynamicField('whatsapp', d.whatsapp);
  populateDynamicField('publicEmail', d.publicEmail);
  populateDynamicField('location', d.location);
  populateDynamicField('website', d.website);

  /* social links */
  populateDynamicField('instagram', d.instagram);
  populateDynamicField('facebook', d.facebook);
  populateDynamicField('linkedin', d.linkedin);
  populateDynamicField('tiktok', d.tiktok);
  populateDynamicField('twitter', d.twitter);
  populateDynamicField('snapchat', d.snapchat);
  populateDynamicField('youtube', d.youtube);

  /* appearance presets */
  theme = d.theme || '#7c3aed';
  lang = d.lang || 'ar';
  
  document.getElementById('f-color-picker').value = theme;
  document.getElementById('f-color-hex').value = theme;
  
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.c === theme);
  });
  
  document.getElementById('lang-ar').classList.toggle('active', lang === 'ar');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');

  /* card urls and QR code rendering */
  const url = d.username ? `${BASE_URL}/profile.html?u=${d.username}` : '';
  
  document.getElementById('profile-url-text').textContent = url || 'يرجى تعيين يوزرنيم أولاً في قسم المعلومات الشخصية';
  document.getElementById('info-url').textContent         = url || '—';
  
  const viewBtn = document.getElementById('btn-view-card');
  if (viewBtn) {
    viewBtn.href = d.username ? `profile.html?u=${d.username}` : '#';
  }
  
  if (d.username) {
    buildQR(url);
  } else {
    document.getElementById('qr-output').innerHTML = '<p style="color:var(--warn);font-size:12px;padding:20px;">الرجاء تعيين يوزرنيم في قسم المعلومات الشخصية لعرض رمز QR</p>';
  }

  const accEmail = document.getElementById('f-acc-email');
  if (accEmail && currentUser) {
    accEmail.value = currentUser.email || '';
  }

  // Prefill current login credentials in the show card and password forms
  const showEmail = document.getElementById('f-show-login-email');
  const showPass = document.getElementById('f-show-login-pass');
  if (showEmail && currentUser) {
    showEmail.value = currentUser.email || '';
  }
  if (showPass) {
    const savedPass = localStorage.getItem('harpy_login_password') || '';
    showPass.value = savedPass || '••••••••';
    
    // Also prefill current password fields for update forms if saved
    const emailPassField = document.getElementById('f-acc-email-pass');
    const currPassField = document.getElementById('f-acc-curr-pass');
    if (emailPassField && savedPass) emailPassField.value = savedPass;
    if (currPassField && savedPass) currPassField.value = savedPass;
  }
}

// Update sidebar profile avatar image
function updateSidebarAvatar(photo, name) {
  const el = document.getElementById('sb-avatar');
  if (!el) return;
  if (photo) {
    el.innerHTML = `<img src="${photo}" />`;
  } else {
    el.textContent = (name || 'U')[0].toUpperCase();
  }
}

// Generate QR Code onto DOM
function buildQR(url) {
  const el = document.getElementById('qr-output');
  if (!el) return;
  el.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(el, { 
      text: url, 
      width: 180, 
      height: 180,
      colorDark: '#000000', 
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H 
    });
  }
}

// Page bindings setup
document.addEventListener('DOMContentLoaded', () => {
  // Navigation goTo triggers
  const navIds = ['personal', 'contact', 'social', 'appearance', 'mycard', 'account'];
  navIds.forEach(id => {
    const btn = document.getElementById(`nav-${id}`);
    if (btn) {
      btn.addEventListener('click', () => goTo(id));
    }
  });

  // Mobile menu control
  const menuBtn = document.querySelector('.mob-menu-btn');
  const overlay = document.getElementById('mob-overlay');
  
  if (menuBtn) menuBtn.addEventListener('click', openSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Dynamic add buttons event binding
  document.querySelectorAll('.btn-add-field').forEach(btn => {
    btn.addEventListener('click', () => {
      const fieldKey = btn.dataset.field;
      const container = document.getElementById(`container-${fieldKey}`);
      if (container) {
        const row = createDynamicFieldRow(fieldKey, '');
        container.appendChild(row);
        row.querySelector('input').focus();
      }
    });
  });

  // Photo gallery upload trigger
  const btnAddPhoto = document.getElementById('btn-add-gallery-photo');
  const galleryPhotoFile = document.getElementById('gallery-photo-file');
  if (btnAddPhoto && galleryPhotoFile) {
    btnAddPhoto.addEventListener('click', () => galleryPhotoFile.click());
    galleryPhotoFile.addEventListener('change', (e) => uploadGalleryPhoto(e.target.files[0]));
  }

  // Swatch color selection
  document.querySelectorAll('.swatch').forEach(s => {
    s.addEventListener('click', () => pickColor(s));
  });

  // Custom theme color pickers
  const picker = document.getElementById('f-color-picker');
  const hexInput = document.getElementById('f-color-hex');
  if (picker) picker.addEventListener('input', (e) => onColorPicker(e.target.value));
  if (hexInput) hexInput.addEventListener('input', (e) => onHexInput(e.target.value));

  // Language selectors
  const langAr = document.getElementById('lang-ar');
  const langEn = document.getElementById('lang-en');
  if (langAr) langAr.addEventListener('click', () => setLang('ar'));
  if (langEn) langEn.addEventListener('click', () => setLang('en'));

  // Section Save bindings
  const savePersonal = document.getElementById('save-personal');
  const saveContact = document.getElementById('save-contact');
  const saveSocial = document.getElementById('save-social');
  const saveAppearance = document.getElementById('save-appearance');
  
  if (savePersonal) savePersonal.addEventListener('click', () => saveSection('personal'));
  if (saveContact) saveContact.addEventListener('click', () => saveSection('contact'));
  if (saveSocial) saveSocial.addEventListener('click', () => saveSection('social'));
  if (saveAppearance) saveAppearance.addEventListener('click', () => saveSection('appearance'));

  // Previews
  document.querySelectorAll('.btn-preview').forEach(p => {
    p.addEventListener('click', previewCard);
  });

  // Share action triggers
  const btnCopy = document.querySelector('.btn-copy');
  const btnDownloadQR = document.querySelector('.btn-action.outline');
  const btnLogout = document.querySelector('.btn-logout');
  
  if (btnCopy) btnCopy.addEventListener('click', copyUrl);
  if (btnDownloadQR) btnDownloadQR.addEventListener('click', downloadQR);
  if (btnLogout) btnLogout.addEventListener('click', doLogout);

  const btnUpdateEmail = document.getElementById('btn-update-email');
  const btnUpdatePass = document.getElementById('btn-update-pass');
  if (btnUpdateEmail) btnUpdateEmail.addEventListener('click', updateEmailAction);
  if (btnUpdatePass) btnUpdatePass.addEventListener('click', updatePasswordAction);

  // Copy login email & password bindings
  const copyLoginEmail = document.getElementById('btn-copy-login-email');
  if (copyLoginEmail) {
    copyLoginEmail.addEventListener('click', () => {
      const emailVal = document.getElementById('f-show-login-email').value;
      if (emailVal) {
        navigator.clipboard.writeText(emailVal).then(() => {
          UI.toast('تم نسخ البريد الإلكتروني بنجاح', 'success');
        });
      }
    });
  }

  const copyLoginPass = document.getElementById('btn-copy-login-pass');
  if (copyLoginPass) {
    copyLoginPass.addEventListener('click', () => {
      const passVal = document.getElementById('f-show-login-pass').value;
      if (passVal && passVal !== '••••••••') {
        navigator.clipboard.writeText(passVal).then(() => {
          UI.toast('تم نسخ كلمة المرور بنجاح', 'success');
        });
      } else {
        UI.toast('لا توجد كلمة مرور لنسخها حالياً', 'warn');
      }
    });
  }

  // Password visibility eye toggles
  document.querySelectorAll('.btn-toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `<svg class="svg-icon" style="stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round;" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/></svg>`;
      } else {
        input.type = 'password';
        btn.innerHTML = `<svg class="svg-icon" style="stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round;" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      }
    });
  });

  // Account Switcher new account binding
  const btnSwitcherAdd = document.getElementById('btn-switcher-add');
  if (btnSwitcherAdd) {
    btnSwitcherAdd.addEventListener('click', addNewAccount);
  }
});

// Sidebar navigation controls
function goTo(sec) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  const section = document.getElementById(`sec-${sec}`);
  const navBtn = document.getElementById(`nav-${sec}`);
  if (section) section.classList.add('active');
  if (navBtn) navBtn.classList.add('active');
  
  if (window.innerWidth <= 768) closeSidebar();
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('mob-overlay').classList.add('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mob-overlay').classList.remove('show');
}

// Swatch selector
function pickColor(el) {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  theme = el.dataset.c;
  document.getElementById('f-color-picker').value = theme;
  document.getElementById('f-color-hex').value = theme;
}

function onColorPicker(val) {
  theme = val;
  document.getElementById('f-color-hex').value = val;
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
}

function onHexInput(val) {
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    theme = val;
    document.getElementById('f-color-picker').value = val;
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  }
}

// Language selector
function setLang(l) {
  lang = l;
  document.getElementById('lang-ar').classList.toggle('active', l === 'ar');
  document.getElementById('lang-en').classList.toggle('active', l === 'en');
}

// Dynamic Field Definitions (for placeholders and types)
const FIELD_DEFS = {
  mobile:      { placeholder: '+20 123 456 7890', type: 'tel', dir: 'ltr' },
  whatsapp:    { placeholder: '+20 123 456 7890', type: 'tel', dir: 'ltr' },
  publicEmail: { placeholder: 'ahmed@email.com',  type: 'email', dir: 'ltr' },
  location:    { placeholder: 'القاهرة، مصر (أو الاسم | الرابط)', type: 'text', dir: 'rtl' },
  website:     { placeholder: 'https://mywebsite.com', type: 'url', dir: 'ltr' },
  instagram:   { placeholder: 'https://instagram.com/username', type: 'url', dir: 'ltr' },
  facebook:    { placeholder: 'https://facebook.com/username', type: 'url', dir: 'ltr' },
  linkedin:    { placeholder: 'https://linkedin.com/in/username', type: 'url', dir: 'ltr' },
  tiktok:      { placeholder: 'https://tiktok.com/@username', type: 'url', dir: 'ltr' },
  twitter:     { placeholder: 'https://x.com/username', type: 'url', dir: 'ltr' },
  snapchat:    { placeholder: 'https://snapchat.com/add/username', type: 'url', dir: 'ltr' },
  youtube:     { placeholder: 'https://youtube.com/@channel', type: 'url', dir: 'ltr' }
};

// Render a single dynamic input row
function createDynamicFieldRow(fieldKey, value = '') {
  const def = FIELD_DEFS[fieldKey] || { placeholder: '', type: 'text', dir: 'ltr' };
  const row = document.createElement('div');
  row.className = 'dynamic-field-row';
  
  const input = document.createElement('input');
  input.className = 'input';
  input.type = def.type;
  input.placeholder = def.placeholder;
  input.value = value;
  input.style.direction = def.dir;
  if (def.dir === 'ltr') {
    input.style.textAlign = 'left';
  }
  
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove-field';
  removeBtn.title = 'إزالة الحقل';
  removeBtn.innerHTML = `
    <svg class="svg-icon" viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `;
  
  removeBtn.addEventListener('click', () => {
    const container = row.parentElement;
    row.remove();
    // Ensure there's at least one empty input if all are removed
    if (container && container.children.length === 0) {
      container.appendChild(createDynamicFieldRow(fieldKey, ''));
    }
  });
  
  row.appendChild(input);
  row.appendChild(removeBtn);
  return row;
}

// Populate container with values (string or array of strings)
function populateDynamicField(fieldKey, dataValue) {
  const containerId = `container-${fieldKey}`;
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  
  let values = [];
  if (Array.isArray(dataValue)) {
    values = dataValue.filter(Boolean);
  } else if (dataValue) {
    values = [dataValue];
  }
  
  if (values.length === 0) {
    values = [''];
  }
  
  values.forEach(val => {
    container.appendChild(createDynamicFieldRow(fieldKey, val));
  });
}

// Get array of values from a container
function getDynamicFieldValues(fieldKey) {
  const containerId = `container-${fieldKey}`;
  const container = document.getElementById(containerId);
  if (!container) return [];
  const inputs = container.querySelectorAll('input');
  return Array.from(inputs).map(inp => inp.value.trim()).filter(Boolean);
}

let localPhotos = []; // Keep local array of photo URLs

function renderPhotosGallery(photosArray) {
  const grid = document.getElementById('photos-gallery-grid');
  if (!grid) return;
  
  const addCard = document.getElementById('btn-add-gallery-photo');
  grid.innerHTML = '';
  
  localPhotos = Array.isArray(photosArray) ? [...photosArray] : [];
  if (localPhotos.length === 0) {
    if (userData?.photo) localPhotos.push(userData.photo);
    if (userData?.photo2) localPhotos.push(userData.photo2);
  }
  
  localPhotos.forEach((url, index) => {
    const card = document.createElement('div');
    card.className = 'gallery-photo-card';
    card.innerHTML = `
      <img src="${url}" alt="Photo ${index + 1}" />
      <button type="button" class="delete-btn" title="حذف الصورة">🗑️</button>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
        localPhotos.splice(index, 1);
        renderPhotosGallery(localPhotos);
      }
    });
    grid.appendChild(card);
  });
  
  grid.appendChild(addCard);
}

async function uploadGalleryPhoto(file) {
  if (!file) return;
  openCropper(file, async (croppedBlob) => {
    const addCard = document.getElementById('btn-add-gallery-photo');
    if (addCard) {
      addCard.innerHTML = `<div class="upload-spin" style="display:block"></div> جاري الرفع...`;
      addCard.style.pointerEvents = 'none';
    }
    try {
      const croppedFile = new File([croppedBlob], file.name || 'photo.jpg', { type: 'image/jpeg' });
      const url = await Services.uploadImage(croppedFile);
      localPhotos.push(url);
      renderPhotosGallery(localPhotos);
      UI.toast('تم رفع الصورة بنجاح ✅', 'success');
    } catch (e) {
      console.error("Gallery photo upload error:", e);
      UI.toast('فشل رفع الصورة، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      if (addCard) {
        addCard.innerHTML = `
          <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          رفع صورة جديدة
        `;
        addCard.style.pointerEvents = 'all';
      }
      const fileInput = document.getElementById('gallery-photo-file');
      if (fileInput) fileInput.value = '';
    }
  });
}

// Save Section
async function saveSection(sec) {
  UI.setLoading(`save-${sec}`, true);
  let d = { updatedAt: new Date().toISOString() };

  try {
    if (sec === 'personal') {
      const newUname = document.getElementById('f-username').value.trim().toLowerCase();
      
      // If setting username for first time
      if (!userData.username) {
        if (!newUname) {
          UI.toast('يرجى اختيار يوزرنيم لبطاقتك', 'error');
          UI.setLoading('save-personal', false);
          return;
        }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUname)) {
          UI.toast('اليوزرنيم غير صحيح (أرقام وحروف إنجليزية فقط 3-20 حرف)', 'error');
          UI.setLoading('save-personal', false);
          return;
        }
        
        await Services.reserveUsername(newUname, currentUser.uid);
        d.username = newUname;
      }

      d.name = document.getElementById('f-name').value.trim();
      d.title = document.getElementById('f-title').value.trim();
      d.company = document.getElementById('f-company').value.trim();
      d.bio = document.getElementById('f-bio').value.trim();
      d.photos = localPhotos;
      d.photo = localPhotos[0] || '';
      d.photo2 = localPhotos[1] || '';

      document.getElementById('sb-name').textContent = d.name || '—';
      updateSidebarAvatar(d.photo, d.name);
      
      if (d.username) {
        document.getElementById('sb-uname').textContent = '@' + d.username;
        const url = `${BASE_URL}/profile.html?u=${d.username}`;
        document.getElementById('profile-url-text').textContent = url;
        document.getElementById('info-url').textContent         = url;
        document.getElementById('btn-view-card').href           = `profile.html?u=${d.username}`;
        buildQR(url);
        
        // Disable username edit
        const uInput = document.getElementById('f-username');
        const uHint = document.getElementById('f-username-hint');
        if (uInput && uHint) {
          uInput.disabled = true;
          uHint.textContent = "اليوزرنيم ثابت ولا يمكن تعديله بعد إنشائه لتجنب تلف روابط البطاقات.";
          uHint.style.color = "var(--dim)";
        }
      }
    }

    if (sec === 'contact') {
      d.mobile = getDynamicFieldValues('mobile');
      d.whatsapp = getDynamicFieldValues('whatsapp');
      d.publicEmail = getDynamicFieldValues('publicEmail');
      d.location = getDynamicFieldValues('location');
      d.website = getDynamicFieldValues('website');
    }

    if (sec === 'social') {
      d.instagram = getDynamicFieldValues('instagram');
      d.facebook = getDynamicFieldValues('facebook');
      d.linkedin = getDynamicFieldValues('linkedin');
      d.tiktok = getDynamicFieldValues('tiktok');
      d.twitter = getDynamicFieldValues('twitter');
      d.snapchat = getDynamicFieldValues('snapchat');
      d.youtube = getDynamicFieldValues('youtube');
    }

    if (sec === 'appearance') {
      d.theme = theme;
      d.lang = lang;
    }

    await Services.saveUserProfile(currentUser.uid, d, userData.username || d.username);
    userData = { ...userData, ...d };
    UI.toast('تم حفظ البيانات بنجاح', 'success');
  } catch (e) {
    console.error("Save error:", e);
    UI.toast(e.message || 'حدث خطأ أثناء الحفظ', 'error');
  } finally {
    UI.setLoading(`save-${sec}`, false);
  }
}

// Previews & actions
function previewCard() {
  if (userData && userData.username) {
    window.open(`profile.html?u=${userData.username}`, '_blank');
  } else {
    UI.toast('يرجى تعيين يوزرنيم أولاً لمعاينة بطاقتك', 'error');
  }
}

function copyUrl() {
  const url = document.getElementById('profile-url-text').textContent;
  if (!userData || !userData.username) {
    UI.toast('يرجى تعيين يوزرنيم أولاً للحصول على رابط البطاقة', 'error');
    return;
  }
  navigator.clipboard.writeText(url).then(() => {
    UI.toast('تم نسخ الرابط بنجاح', 'success');
  });
}

function downloadQR() {
  const canvas = document.querySelector('#qr-output canvas');
  if (!canvas) {
    UI.toast('رمز الـ QR غير متاح حالياً', 'error');
    return;
  }
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `harpy-card-${userData?.username || 'qr'}.png`;
  a.click();
  UI.toast('تم تحميل الرمز بنجاح', 'success');
}

async function doLogout() {
  localStorage.removeItem('harpy_login_password');
  await Services.logout();
  window.location.href = 'index.html';
}

// Change Login Email Action
async function updateEmailAction() {
  const newEmail = document.getElementById('f-acc-email').value;
  const pass = document.getElementById('f-acc-email-pass').value;
  
  if (!newEmail || !pass) {
    UI.toast("يرجى إدخال البريد الإلكتروني الجديد وكلمة المرور الحالية للتأكيد.", "warn");
    return;
  }
  
  UI.setLoading('btn-update-email', true);
  try {
    await Services.updateAccountEmail(newEmail, pass);
    UI.toast("تم تحديث البريد الإلكتروني بنجاح!", "success");
    localStorage.setItem('harpy_login_email', newEmail);
    const showEmail = document.getElementById('f-show-login-email');
    if (showEmail) showEmail.value = newEmail;
    document.getElementById('f-acc-email-pass').value = '';
  } catch (e) {
    console.error("Error updating email:", e);
    let errMsg = e.message;
    if (e.code === 'auth/wrong-password') {
      errMsg = "كلمة المرور الحالية غير صحيحة.";
    } else if (e.code === 'auth/invalid-email') {
      errMsg = "صيغة البريد الإلكتروني الجديد غير صحيحة.";
    }
    UI.toast(errMsg, "error");
  } finally {
    UI.setLoading('btn-update-email', false);
  }
}

// Change Login Password Action
async function updatePasswordAction() {
  const currPass = document.getElementById('f-acc-curr-pass').value;
  const newPass = document.getElementById('f-acc-new-pass').value;
  const newPassConf = document.getElementById('f-acc-new-pass-conf').value;
  
  if (!currPass || !newPass || !newPassConf) {
    UI.toast("يرجى ملء جميع حقول كلمة المرور.", "warn");
    return;
  }
  
  if (newPass.length < 6) {
    UI.toast("يجب أن تكون كلمة المرور الجديدة مكونة من 6 أحرف على الأقل.", "warn");
    return;
  }
  
  if (newPass !== newPassConf) {
    UI.toast("كلمة المرور الجديدة لا تطابق تأكيد كلمة المرور.", "warn");
    return;
  }
  
  UI.setLoading('btn-update-pass', true);
  try {
    await Services.updateAccountPassword(newPass, currPass);
    UI.toast("تم تغيير كلمة المرور بنجاح!", "success");
    localStorage.setItem('harpy_login_password', newPass);
    const showPass = document.getElementById('f-show-login-pass');
    if (showPass) showPass.value = newPass;
    
    const emailPassField = document.getElementById('f-acc-email-pass');
    const currPassField = document.getElementById('f-acc-curr-pass');
    if (emailPassField) emailPassField.value = newPass;
    if (currPassField) currPassField.value = newPass;

    document.getElementById('f-acc-new-pass').value = '';
    document.getElementById('f-acc-new-pass-conf').value = '';
  } catch (e) {
    console.error("Error updating password:", e);
    let errMsg = e.message;
    if (e.code === 'auth/wrong-password') {
      errMsg = "كلمة المرور الحالية غير صحيحة.";
    }
    UI.toast(errMsg, "error");
  } finally {
    UI.setLoading('btn-update-pass', false);
  }
}

// Saves accounts to Firestore (survives clearing browser data)
async function updateSavedAccounts(d) {
  if (!currentUser || !currentUser.email) return;
  const email = currentUser.email;
  const pass  = localStorage.getItem('harpy_login_password') || '';

  const accountData = {
    email:    email.toLowerCase(),
    pass:     pass,
    username: d.username || '',
    name:     d.name     || 'مستخدم جديد',
    photo:    d.photo    || ''
  };

  // ─ 1. Load from Firestore first (source of truth)
  let firestoreAccounts = [];
  try {
    const snap = await Services.getSavedAccounts(currentUser.uid);
    firestoreAccounts = snap || [];
  } catch (e) {
    console.warn('Could not load saved accounts from Firestore:', e);
  }

  // Retrieve deleted accounts list to filter them out
  let deletedEmails = [];
  try {
    deletedEmails = JSON.parse(localStorage.getItem('harpy_deleted_accounts')) || [];
  } catch (_) {}

  // ─ 2. Merge local cache into Firestore list
  let localAccounts = [];
  try { localAccounts = JSON.parse(localStorage.getItem('harpy_saved_accounts')) || []; } catch (_) {}

  // Merge: add any local accounts not yet in Firestore, filtering out deleted ones
  for (const la of localAccounts) {
    if (deletedEmails.includes(la.email.toLowerCase())) continue;
    if (!firestoreAccounts.find(a => a.email.toLowerCase() === la.email.toLowerCase())) {
      firestoreAccounts.push(la);
    }
  }

  // Filter Firestore accounts list to remove deleted ones
  firestoreAccounts = firestoreAccounts.filter(a => !deletedEmails.includes(a.email.toLowerCase()));

  // ─ 3. Upsert current account
  const idx = firestoreAccounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  if (idx > -1) {
    if (!accountData.pass && firestoreAccounts[idx].pass) {
      accountData.pass = firestoreAccounts[idx].pass;
    }
    firestoreAccounts[idx] = accountData;
  } else {
    firestoreAccounts.push(accountData);
  }

  // ─ 4. Save to both Firestore and localStorage
  try {
    await Services.setSavedAccounts(currentUser.uid, firestoreAccounts);
    // Once successfully saved to Firestore, we can clear the deleted list for this user session since it's synced
    localStorage.removeItem('harpy_deleted_accounts');
  } catch (e) {
    console.warn('Could not save accounts to Firestore:', e);
  }
  localStorage.setItem('harpy_saved_accounts', JSON.stringify(firestoreAccounts));

  renderAccountSwitcher(firestoreAccounts, email);
}

function renderAccountSwitcher(accounts, currentEmail) {
  const container = document.getElementById('sb-switcher-container');
  const list = document.getElementById('sb-switcher-list');
  if (!container || !list) return;

  container.style.display = 'block';

  list.innerHTML = accounts.map(a => {
    const isCurrent = a.email.toLowerCase() === currentEmail.toLowerCase();
    const avatarHtml = a.photo 
      ? `<img src="${a.photo}" />` 
      : (a.name || 'U')[0].toUpperCase();

    return `
      <div class="sb-switcher-item ${isCurrent ? 'current' : ''}" data-email="${a.email}">
        <div class="sb-switcher-info">
          <div class="sb-switcher-avatar">${avatarHtml}</div>
          <div class="sb-switcher-meta">
            <div class="sb-switcher-name">${a.name}</div>
            <div style="font-size: 10px; color: var(--dim); direction: ltr; text-align: right;">@${a.username || '—'}</div>
          </div>
        </div>
        ${!isCurrent ? `
          <button class="sb-switcher-remove" data-email="${a.email}" title="إزالة الحساب">
            <svg style="width: 12px; height: 12px; stroke: currentColor; fill: none; stroke-width: 2;" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  }).join('');

  // Bind switcher item click to switch account
  list.querySelectorAll('.sb-switcher-item').forEach(item => {
    if (item.classList.contains('current')) return;
    item.addEventListener('click', (e) => {
      if (e.target.closest('.sb-switcher-remove')) return;
      const email = item.dataset.email;
      const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (account) switchAccount(account);
    });
  });

  // Bind remove click
  list.querySelectorAll('.sb-switcher-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const email = btn.dataset.email;
      removeSavedAccount(email);
    });
  });
}

async function switchAccount(account) {
  UI.showLoader(true);
  try {
    // Update active credentials in localStorage first to avoid any race conditions
    localStorage.setItem('harpy_login_email', account.email);
    localStorage.setItem('harpy_login_password', account.pass);

    // Log in to the selected account using stored credentials
    await Services.login(account.email, account.pass);
    
    UI.toast(`تم التبديل إلى حساب ${account.name} بنجاح`, 'success');
    // Reload page to re-trigger Auth State Monitor
    setTimeout(() => window.location.reload(), 800);
  } catch (e) {
    console.error("Account switch failed:", e);
    UI.toast(`فشل التبديل: ${e.message}`, 'error');
    UI.showLoader(false);
  }
}

function removeSavedAccount(email) {
  let accounts = [];
  try {
    accounts = JSON.parse(localStorage.getItem('harpy_saved_accounts')) || [];
  } catch (e) {
    accounts = [];
  }

  const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
  const name = account ? account.name : email;

  if (!confirm(`هل أنت متأكد من إزالة حساب "${name}" من هذا الجهاز؟`)) {
    return;
  }

  // Add to deleted accounts list in localStorage
  let deletedEmails = [];
  try {
    deletedEmails = JSON.parse(localStorage.getItem('harpy_deleted_accounts')) || [];
  } catch (_) {}
  if (!deletedEmails.includes(email.toLowerCase())) {
    deletedEmails.push(email.toLowerCase());
    localStorage.setItem('harpy_deleted_accounts', JSON.stringify(deletedEmails));
  }

  accounts = accounts.filter(a => a.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem('harpy_saved_accounts', JSON.stringify(accounts));
  
  // Also save the updated list to Firestore for the current user!
  if (currentUser) {
    try {
      Services.setSavedAccounts(currentUser.uid, accounts).catch(e => {
        console.warn('Could not save updated accounts to Firestore:', e);
      });
    } catch (e) {
      console.warn('Could not save updated accounts to Firestore:', e);
    }
  }
  
  const currentEmail = currentUser?.email || '';
  renderAccountSwitcher(accounts, currentEmail);
  UI.toast('تم إزالة الحساب من هذا الجهاز', 'success');
}

async function addNewAccount() {
  UI.showLoader(true);
  try {
    await Services.logout();
    window.location.href = 'index.html';
  } catch (e) {
    UI.toast('حدث خطأ أثناء الانتقال لصفحة تسجيل الدخول', 'error');
    UI.showLoader(false);
  }
}

// ─── Interactive Image Cropper (Frame Overlay) ───
function openCropper(file, callback) {
  const modal = document.getElementById('crop-modal');
  const preview = document.getElementById('crop-img-preview');
  const viewport = document.getElementById('crop-viewport');
  const saveBtn = document.getElementById('btn-save-crop');
  const cancelBtn = document.getElementById('btn-cancel-crop');
  const closeBtn = document.getElementById('btn-close-crop');

  if (!modal || !preview || !viewport) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    preview.src = e.target.result;
    modal.style.display = 'flex';

    // Wait for image to load to get dimensions
    preview.onload = function() {
      const vWidth = viewport.clientWidth;
      const vHeight = viewport.clientHeight;
      const imgRatio = preview.naturalWidth / preview.naturalHeight;
      const targetRatio = 460 / 350;

      let scaledWidth = 0;
      let scaledHeight = 0;
      let minX = 0, maxX = 0;
      let minY = 0, maxY = 0;
      let currentX = 0;
      let currentY = 0;

      // Fit to cover viewport
      if (imgRatio > targetRatio) {
        // Image is wider than target. Fit height to viewport, drag horizontally
        preview.style.height = '100%';
        preview.style.width = 'auto';
        scaledHeight = vHeight;
        scaledWidth = vHeight * imgRatio;
        
        minX = vWidth - scaledWidth;
        maxX = 0;
        minY = 0;
        maxY = 0;
        
        // Center horizontally initially
        currentX = (vWidth - scaledWidth) / 2;
        currentY = 0;
      } else {
        // Image is taller than target. Fit width to viewport, drag vertically
        preview.style.width = '100%';
        preview.style.height = 'auto';
        scaledWidth = vWidth;
        scaledHeight = vWidth / imgRatio;
        
        minX = 0;
        maxX = 0;
        minY = vHeight - scaledHeight;
        maxY = 0;

        // Center vertically initially
        currentX = 0;
        currentY = (vHeight - scaledHeight) / 2;
      }

      // Apply initial transform
      preview.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      // Dragging logic
      let isDragging = false;
      let startX = 0, startY = 0;
      let baseX = currentX, baseY = currentY;

      function onStart(x, y) {
        isDragging = true;
        startX = x;
        startY = y;
        baseX = currentX;
        baseY = currentY;
      }

      function onMove(x, y) {
        if (!isDragging) return;
        const dx = x - startX;
        const dy = y - startY;

        let tx = baseX + dx;
        let ty = baseY + dy;

        // Clamp
        if (tx < minX) tx = minX;
        if (tx > maxX) tx = maxX;
        if (ty < minY) ty = minY;
        if (ty > maxY) ty = maxY;

        currentX = tx;
        currentY = ty;
        preview.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      function onEnd() {
        isDragging = false;
      }

      // Mouse Events
      const mousedownHandler = (e) => {
        onStart(e.clientX, e.clientY);
      };
      const mousemoveHandler = (e) => {
        onMove(e.clientX, e.clientY);
      };
      const mouseupHandler = () => {
        onEnd();
      };

      // Touch Events
      const touchstartHandler = (e) => {
        if (e.touches.length > 0) {
          onStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      };
      const touchmoveHandler = (e) => {
        if (e.touches.length > 0) {
          onMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      };
      const touchendHandler = () => {
        onEnd();
      };

      // Bind drag event listeners
      viewport.addEventListener('mousedown', mousedownHandler);
      window.addEventListener('mousemove', mousemoveHandler);
      window.addEventListener('mouseup', mouseupHandler);

      viewport.addEventListener('touchstart', touchstartHandler, { passive: true });
      window.addEventListener('touchmove', touchmoveHandler, { passive: true });
      window.addEventListener('touchend', touchendHandler);

      // Cleanup function
      function cleanup() {
        viewport.removeEventListener('mousedown', mousedownHandler);
        window.removeEventListener('mousemove', mousemoveHandler);
        window.removeEventListener('mouseup', mouseupHandler);

        viewport.removeEventListener('touchstart', touchstartHandler);
        window.removeEventListener('touchmove', touchmoveHandler);
        window.removeEventListener('touchend', touchendHandler);

        saveBtn.removeEventListener('click', saveHandler);
        cancelBtn.removeEventListener('click', cancelHandler);
        closeBtn.removeEventListener('click', cancelHandler);
        modal.style.display = 'none';
        
        // Reset file inputs so same file can be selected again
        const fileInput = document.getElementById('gallery-photo-file');
        if (fileInput) fileInput.value = '';
      }

      // Save Handler
      const saveHandler = () => {
        // Crop mapping calculations
        const canvas = document.createElement('canvas');
        canvas.width = 920; // Double size for high resolution
        canvas.height = 700;

        const ctx = canvas.getContext('2d');

        // Translate screen offset to natural coordinates
        const scale = scaledWidth / preview.naturalWidth;
        
        const sx = -currentX / scale;
        const sy = -currentY / scale;
        const sw = vWidth / scale;
        const sh = vHeight / scale;

        ctx.drawImage(preview, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            callback(blob);
          }
          cleanup();
        }, 'image/jpeg', 0.92);
      };

      const cancelHandler = () => {
        cleanup();
      };

      saveBtn.addEventListener('click', saveHandler);
      cancelBtn.addEventListener('click', cancelHandler);
      closeBtn.addEventListener('click', cancelHandler);
    };
  };

  reader.readAsDataURL(file);
}
