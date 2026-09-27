// ═══════════════════════════════════════════════════════════
// HarpyOrder — Client App Orchestrator (Modular Entry Point)
// ═══════════════════════════════════════════════════════════
// Submodules loaded before this file:
// - js/client/client-core.js
// - js/client/menu-view.js
// - js/client/stories-viewer.js
// - js/client/customizer-modal.js
// - js/client/cart-ledger.js
// - js/client/order-tracking.js

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.__isPortfolio && typeof initApp === 'function') initApp();
  });
} else {
  if (!window.__isPortfolio && typeof initApp === 'function') initApp();
}
