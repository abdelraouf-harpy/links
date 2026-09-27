// ═══════════════════════════════════════════════════════════
// HarpyOrder — Admin Dashboard Orchestrator (Modular Entry Point)
// ═══════════════════════════════════════════════════════════
// All modular domains are loaded before this file:
// - js/admin/admin-core.js
// - js/admin/admin-auth.js
// - js/admin/kitchen-orders.js
// - js/admin/catalog-manager.js
// - js/admin/category-manager.js
// - js/admin/stories-manager.js
// - js/admin/backup-restore.js
// - js/admin/settings-manager.js
// - js/admin/pos-terminal.js

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof initAdmin === 'function') initAdmin();
  });
} else {
  if (typeof initAdmin === 'function') initAdmin();
}
