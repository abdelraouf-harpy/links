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

  /* photo display */
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
  const navIds = ['personal', 'contact', 'social', 'appearance', 'mycard'];
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

// Photo uploading to ImgBB
async function uploadPhoto(file) {
  if (!file) return;
  UI.setLoading('upload-btn', true);
  try {
    const url = await Services.uploadImage(file);
    
    // Save photo URL in user document and username mapping
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
    UI.toast('تم رفع الصورة بنجاح', 'success');
  } catch (e) {
    console.error("Photo upload error:", e);
    UI.toast('فشل رفع الصورة، يرجى المحاولة مرة أخرى', 'error');
  } finally {
    UI.setLoading('upload-btn', false);
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
  await Services.logout();
  window.location.href = 'index.html';
}
