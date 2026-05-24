// Helper checks for PWA
const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

let deferredPrompt = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/cards/sw.js')
      .then(reg => console.log('PWA Service Worker registered:', reg.scope))
      .catch(err => console.warn('PWA Service Worker registration failed:', err));
  });
}

// Intercept Chrome install prompt
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  // Automatically trigger custom banner
  UI.showPwaPrompt(true);
});

export const UI = {
  toast(msg, type = 'info') {
    let c = document.getElementById('toasts');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toasts';
      document.body.appendChild(c);
    }
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3600);
  },
  
  setLoading(btnId, on) {
    const b = document.getElementById(btnId);
    if (!b) return;
    b.classList.toggle('loading', on);
    b.disabled = on;
  },

  showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.display = show ? 'flex' : 'none';
    }
  },

  showPwaPrompt(show) {
    if (!show) {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.remove();
      const iosBanner = document.getElementById('pwa-ios-banner');
      if (iosBanner) iosBanner.remove();
      return;
    }

    if (isStandalone()) return;
    if (sessionStorage.getItem('pwa-prompt-dismissed') === 'true') return;

    if (isIOS()) {
      if (document.getElementById('pwa-ios-banner')) return;
      const banner = document.createElement('div');
      banner.id = 'pwa-ios-banner';
      banner.className = 'pwa-banner ios';
      banner.innerHTML = `
        <div class="pwa-logo-box">
          <svg class="pwa-logo-svg" viewBox="0 0 24 24">
            <rect width="20" height="14" x="2" y="5" rx="2"/>
            <line x1="2" x2="22" y1="10" y2="10"/>
          </svg>
        </div>
        <div class="pwa-text">
          <div class="pwa-title">ثبّت التطبيق على آيفون</div>
          <div class="pwa-desc">اضغط على زر المشاركة <span class="ios-icon">⎋</span> ثم اختر "إضافة إلى الصفحة الرئيسية" <span class="ios-icon">⊞</span></div>
        </div>
        <div class="pwa-actions">
          <button id="pwa-btn-ios-close" class="pwa-btn secondary">موافق</button>
        </div>
      `;
      document.body.appendChild(banner);
      document.getElementById('pwa-btn-ios-close').addEventListener('click', () => {
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
        banner.remove();
      });
    } else if (deferredPrompt) {
      if (document.getElementById('pwa-install-banner')) return;
      const banner = document.createElement('div');
      banner.id = 'pwa-install-banner';
      banner.className = 'pwa-banner';
      banner.innerHTML = `
        <div class="pwa-logo-box">
          <svg class="pwa-logo-svg" viewBox="0 0 24 24">
            <rect width="20" height="14" x="2" y="5" rx="2"/>
            <line x1="2" x2="22" y1="10" y2="10"/>
          </svg>
        </div>
        <div class="pwa-text">
          <div class="pwa-title">تثبيت التطبيق</div>
          <div class="pwa-desc">ثبّت التطبيق على جهازك للوصول السريع لبطاقتك في أي وقت!</div>
        </div>
        <div class="pwa-actions">
          <button id="pwa-btn-install" class="pwa-btn primary">تثبيت</button>
          <button id="pwa-btn-close" class="pwa-btn secondary">إغلاق</button>
        </div>
      `;
      document.body.appendChild(banner);

      document.getElementById('pwa-btn-install').addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
          deferredPrompt = null;
          banner.remove();
        });
      });

      document.getElementById('pwa-btn-close').addEventListener('click', () => {
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
        banner.remove();
      });
    }
  }
};

// Auto-trigger PWA instructions on iOS Safari after a short delay
window.addEventListener('load', () => {
  setTimeout(() => {
    if (isIOS() && !isStandalone()) {
      UI.showPwaPrompt(true);
    }
  }, 3500);
});

