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
  } else {
    // Missing document fallback
    userData = {
      uid: currentUser.uid,
      username: '',
      name: currentUser.displayName || 'مستخدم جديد',
      email: currentUser.email || '',
      theme: '#7c3aed',
      lang: 'ar'
    };
  }
  fillUI(userData);
  updateSavedAccounts(userData);
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

  /* photo display — front */
  const pImg = document.getElementById('photo-img');
  const pEmoji = document.getElementById('photo-emoji');
  if (pImg && pEmoji) {
    if (d.photo) {
      pImg.src = d.photo;
      pImg.style.display = 'block';
      pEmoji.style.display = 'none';
    } else {
      pImg.style.display = 'none';
      pEmoji.style.display = 'block';
    }
  }

  /* photo display — back */
  const p2Img = document.getElementById('photo2-img');
  const p2Emoji = document.getElementById('photo2-emoji');
  if (p2Img && p2Emoji) {
    if (d.photo2) {
      p2Img.src = d.photo2;
      p2Img.style.display = 'block';
      p2Emoji.style.display = 'none';
    } else {
      p2Img.style.display = 'none';
      p2Emoji.style.display = 'block';
    }
  }

  /* contact inputs */
  document.getElementById('f-mobile').value = d.mobile || '';
  document.getElementById('f-whatsapp').value = d.whatsapp || '';
  document.getElementById('f-email').value = d.publicEmail || '';
  document.getElementById('f-location').value = d.location || '';
  document.getElementById('f-website').value = d.website || '';

  /* social links */
  document.getElementById('f-instagram').value = d.instagram || '';
  document.getElementById('f-facebook').value = d.facebook || '';
  document.getElementById('f-linkedin').value = d.linkedin || '';
  document.getElementById('f-tiktok').value = d.tiktok || '';
  document.getElementById('f-twitter').value = d.twitter || '';
  document.getElementById('f-snapchat').value = d.snapchat || '';
  document.getElementById('f-youtube').value = d.youtube || '';

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

  // File upload trigger
  const photoRing = document.getElementById('photo-ring');
  const uploadBtn = document.getElementById('upload-btn');
  const photoFile = document.getElementById('photo-file');
  
  if (photoRing) photoRing.addEventListener('click', () => photoFile.click());
  if (uploadBtn) uploadBtn.addEventListener('click', () => photoFile.click());
  if (photoFile) {
    photoFile.addEventListener('change', (e) => uploadPhoto(e.target.files[0]));
  }

  // Back photo upload trigger
  const photo2Ring = document.getElementById('photo2-ring');
  const uploadBtn2 = document.getElementById('upload-btn2');
  const photo2File = document.getElementById('photo2-file');

  if (photo2Ring) photo2Ring.addEventListener('click', () => photo2File && photo2File.click());
  if (uploadBtn2) uploadBtn2.addEventListener('click', () => photo2File && photo2File.click());
  if (photo2File) {
    photo2File.addEventListener('change', (e) => uploadPhoto2(e.target.files[0]));
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

// Photo uploading to ImgBB — front photo
async function uploadPhoto(file) {
  if (!file) return;
  UI.setLoading('upload-btn', true);
  try {
    const url = await Services.uploadImage(file);
    await Services.saveUserProfile(currentUser.uid, { photo: url }, userData.username);
    userData.photo = url;

    const pImg = document.getElementById('photo-img');
    const pEmoji = document.getElementById('photo-emoji');
    if (pImg && pEmoji) {
      pImg.src = url;
      pImg.style.display = 'block';
      pEmoji.style.display = 'none';
    }

    updateSidebarAvatar(url, userData.name);
    UI.toast('تم رفع الصورة الأمامية بنجاح ✅', 'success');
  } catch (e) {
    console.error("Photo upload error:", e);
    UI.toast('فشل رفع الصورة، يرجى المحاولة مرة أخرى', 'error');
  } finally {
    UI.setLoading('upload-btn', false);
  }
}

// Photo uploading to ImgBB — back photo
async function uploadPhoto2(file) {
  if (!file) return;
  UI.setLoading('upload-btn2', true);
  try {
    const url = await Services.uploadImage(file);
    await Services.saveUserProfile(currentUser.uid, { photo2: url }, userData.username);
    userData.photo2 = url;

    const p2Img = document.getElementById('photo2-img');
    const p2Emoji = document.getElementById('photo2-emoji');
    if (p2Img && p2Emoji) {
      p2Img.src = url;
      p2Img.style.display = 'block';
      p2Emoji.style.display = 'none';
    }

    UI.toast('تم رفع الصورة الخلفية بنجاح ✅', 'success');
  } catch (e) {
    console.error("Photo2 upload error:", e);
    UI.toast('فشل رفع الصورة الخلفية، يرجى المحاولة مرة أخرى', 'error');
  } finally {
    UI.setLoading('upload-btn2', false);
  }
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

      document.getElementById('sb-name').textContent = d.name || '—';
      
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
      d.mobile = document.getElementById('f-mobile').value.trim();
      d.whatsapp = document.getElementById('f-whatsapp').value.trim();
      d.publicEmail = document.getElementById('f-email').value.trim();
      d.location = document.getElementById('f-location').value.trim();
      d.website = document.getElementById('f-website').value.trim();
    }

    if (sec === 'social') {
      d.instagram = document.getElementById('f-instagram').value.trim();
      d.facebook = document.getElementById('f-facebook').value.trim();
      d.linkedin = document.getElementById('f-linkedin').value.trim();
      d.tiktok = document.getElementById('f-tiktok').value.trim();
      d.twitter = document.getElementById('f-twitter').value.trim();
      d.snapchat = document.getElementById('f-snapchat').value.trim();
      d.youtube = document.getElementById('f-youtube').value.trim();
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

// ─── Account Switcher Logic ───
function updateSavedAccounts(d) {
  if (!currentUser || !currentUser.email) return;
  const email = currentUser.email;
  const pass = localStorage.getItem('harpy_login_password') || '';

  let accounts = [];
  try {
    accounts = JSON.parse(localStorage.getItem('harpy_saved_accounts')) || [];
  } catch (e) {
    accounts = [];
  }

  // Find if this account is already saved
  const idx = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  const accountData = {
    email: email.toLowerCase(),
    pass: pass,
    username: d.username || '',
    name: d.name || 'مستخدم جديد',
    photo: d.photo || ''
  };

  if (idx > -1) {
    // Update existing credentials and info
    if (!accountData.pass && accounts[idx].pass) {
      accountData.pass = accounts[idx].pass;
    }
    accounts[idx] = accountData;
  } else {
    // Add new account
    accounts.push(accountData);
  }

  localStorage.setItem('harpy_saved_accounts', JSON.stringify(accounts));
  renderAccountSwitcher(accounts, email);
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

  accounts = accounts.filter(a => a.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem('harpy_saved_accounts', JSON.stringify(accounts));
  
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
