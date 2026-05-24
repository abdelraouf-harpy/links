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
  }
};
