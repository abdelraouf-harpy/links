// ═══════════════════════════════════════════════════════════
// utils.js — Shared utilities across all pages
// ═══════════════════════════════════════════════════════════

// ── Toast ──────────────────────────────────────────────────
export function toast(msg, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type] || '•'}</span><span style="flex:1">${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px) scale(0.95)';
    t.style.transition = 'all 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ── Modal ──────────────────────────────────────────────────
export function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
export function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
export function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
}

// ── Image Preview ──────────────────────────────────────────
export function previewImage(input, previewId) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(previewId);
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

// ── Page Loading ───────────────────────────────────────────
export function showLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) loader.style.display = 'flex';
}
export function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 400);
  }
}

// ── Format ────────────────────────────────────────────────
export function formatPrice(price, currency = 'ج.م') {
  return `${parseFloat(price || 0).toFixed(2)} ${currency}`;
}

export function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)   return 'الآن';
  if (diff < 3600) return `${Math.floor(diff/60)} دقيقة`;
  if (diff < 86400)return `${Math.floor(diff/3600)} ساعة`;
  return `${Math.floor(diff/86400)} يوم`;
}

// ── Slug Generator ─────────────────────────────────────────
export function toSlug(str) {
  return str.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
}

// ── Confirm Dialog ─────────────────────────────────────────
export function confirm(msg) {
  return window.confirm(msg);
}

// ── Sidebar Toggle (Mobile) ────────────────────────────────
export function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    backdrop?.classList.toggle('open');
  });
  backdrop?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
  });
}

// ── Tabs ──────────────────────────────────────────────────
export function initTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      container.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('pane-' + target)?.classList.add('active');
    });
  });
}

// ── Plan helpers ───────────────────────────────────────────
export const PLAN_LABELS = {
  TRIAL:    'تجريبي',
  MONTHLY:  'شهري',
  ANNUAL:   'سنوي',
  LIFETIME: 'مدى الحياة'
};
export const PLAN_BADGES = {
  TRIAL: 'badge-amber', MONTHLY: 'badge-blue',
  ANNUAL: 'badge-purple', LIFETIME: 'badge-green'
};
