import { Services } from "./services.js?v=3.0.0";
import { UI } from "./ui.js?v=3.0.0";

// Check if already logged in and redirect
Services.onAuth(user => {
  if (user) window.location.href = 'dashboard.html';
});

document.addEventListener('DOMContentLoaded', () => {
  // Tab Switch Bindings
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  
  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));
  }

  // Username Availability check
  const rUname = document.getElementById('r-uname');
  if (rUname) {
    rUname.addEventListener('input', (e) => checkUsername(e.target.value));
  }

  // Password strength check
  const rPass = document.getElementById('r-pass');
  if (rPass) {
    rPass.addEventListener('input', (e) => checkStrength(e.target.value));
  }

  // Submit Bindings
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  
  if (btnLogin) btnLogin.addEventListener('click', doLogin);
  if (btnRegister) btnRegister.addEventListener('click', doRegister);

  // Enter Key Handling
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const activeSection = document.querySelector('.form-section.active');
    if (activeSection) {
      if (activeSection.id === 'sec-login') {
        doLogin();
      } else {
        doRegister();
      }
    }
  });
});

// Tab switcher logic
function switchTab(tab) {
  ['login', 'register'].forEach(t => {
    const tabBtn = document.getElementById(`tab-${t}`);
    const section = document.getElementById(`sec-${t}`);
    if (tabBtn) tabBtn.classList.toggle('active', t === tab);
    if (section) section.classList.toggle('active', t === tab);
  });
}

// Username Live Validator
let uTimer;
function checkUsername(val) {
  const inp   = document.getElementById('r-uname');
  const badge = document.getElementById('uname-badge');
  const hint  = document.getElementById('uname-hint');
  clearTimeout(uTimer);

  if (!inp || !badge || !hint) return;

  if (!val) {
    badge.textContent = '';
    inp.className = 'form-input uname-field';
    hint.className = 'hint';
    hint.textContent = 'رابطك: harpymenu.com/cards/ahmed';
    return;
  }
  
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(val)) {
    badge.textContent = '✕'; 
    badge.style.color = 'var(--error)';
    inp.className = 'form-input uname-field is-error';
    hint.className = 'hint error';
    hint.textContent = 'حروف إنجليزية وأرقام فقط، بدون مسافات (3-20 حرف)';
    return;
  }
  
  badge.textContent = '...'; 
  badge.style.color = 'var(--muted)';
  hint.className = 'hint'; 
  hint.textContent = 'جاري التحقق...';

  uTimer = setTimeout(async () => {
    try {
      const uid = await Services.getUidByUsername(val);
      if (uid) {
        badge.textContent = '✕'; 
        badge.style.color = 'var(--error)';
        inp.className = 'form-input uname-field is-error';
        hint.className = 'hint error'; 
        hint.textContent = 'اليوزرنيم ده مأخوذ، جرّب تاني';
      } else {
        badge.textContent = '✓'; 
        badge.style.color = 'var(--success)';
        inp.className = 'form-input uname-field is-ok';
        hint.className = 'hint success';
        hint.textContent = `رابطك: harpymenu.com/cards/${val.toLowerCase()}`;
      }
    } catch (e) { 
      hint.textContent = 'مش قادر يتحقق دلوقتي'; 
    }
  }, 650);
}

// Password strength indicator
function checkStrength(pw) {
  const bars = [document.getElementById('sb1'), document.getElementById('sb2'), document.getElementById('sb3')];
  if (!bars[0]) return;
  
  bars.forEach(b => { if (b) b.className = 's-bar'; });
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++;
  for (let i = 0; i < s; i++) {
    if (bars[i]) bars[i].classList.add(`lvl-${s}`);
  }
}

// Login execution
async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  if (!email || !pass) { 
    UI.toast('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error'); 
    return; 
  }
  
  UI.setLoading('btn-login', true);
  try {
    await Services.login(email, pass);
    UI.toast('تم تسجيل الدخول بنجاح', 'success');
    localStorage.setItem('harpy_login_email', email);
    localStorage.setItem('harpy_login_password', pass);
    setTimeout(() => window.location.href = 'dashboard.html', 900);
  } catch (e) {
    UI.toast(e.message, 'error');
  } finally { 
    UI.setLoading('btn-login', false); 
  }
}

// Registration execution
async function doRegister() {
  const name  = document.getElementById('r-name').value.trim();
  const uname = document.getElementById('r-uname').value.trim().toLowerCase();
  const email = document.getElementById('r-email').value.trim();
  const pass  = document.getElementById('r-pass').value;
  const conf  = document.getElementById('r-conf').value;
  const code  = document.getElementById('r-code').value.trim();

  if (!name || !uname || !email || !pass || !conf || !code) { 
    UI.toast('يرجى إدخال جميع البيانات المطلوبة', 'error'); 
    return; 
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) { 
    UI.toast('اسم المستخدم غير صحيح', 'error'); 
    return; 
  }
  if (pass !== conf) { 
    UI.toast('كلمتا المرور غير متطابقتين', 'error'); 
    return; 
  }
  if (pass.length < 6) { 
    UI.toast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error'); 
    return; 
  }

  UI.setLoading('btn-register', true);
  try {
    await Services.registerUser(name, uname, email, pass, code);
    UI.toast('تم إنشاء الحساب بنجاح', 'success');
    localStorage.setItem('harpy_login_email', email);
    localStorage.setItem('harpy_login_password', pass);
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
  } catch (e) {
    UI.toast(e.message, 'error');
  } finally { 
    UI.setLoading('btn-register', false); 
  }
}
