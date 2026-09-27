// ═══════════════════════════════════════════════════════════
// HarpyOrder — Item Customizer Modal (Sizes, Addons & Quantities)
// ═══════════════════════════════════════════════════════════

// Customizer state
let customizerProduct = null;
let customizerSelectedSize = null;
let customizerSelectedAddons = [];
let customizerQty = 1;


// ── Advanced Item Customizer Modal ─────────────────────────
window.openCustomizer = function(productId) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  customizerProduct = p;
  customizerSelectedSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : null;
  customizerSelectedAddons = [];
  customizerQty = 1;

  const currency = Store.getSettings().currency || "ج.م";

  if (elements.customizerTitle) elements.customizerTitle.textContent = p.name;
  if (elements.customizerDesc) elements.customizerDesc.textContent = p.desc;
  if (elements.customizerImg) elements.customizerImg.src = p.image;
  if (elements.customizerBasePrice) elements.customizerBasePrice.textContent = `${p.price} ${currency}`;
  if (elements.customizerNotes) elements.customizerNotes.value = '';
  if (elements.customizerQtyVal) elements.customizerQtyVal.textContent = '1';

  // Render Sizes
  if (p.sizes && p.sizes.length > 0) {
    if (elements.customizerSizesSection) elements.customizerSizesSection.style.display = 'block';
    if (elements.customizerSizesList) {
      elements.customizerSizesList.innerHTML = p.sizes.map((s, idx) => `
        <div class="customizer-option-card ${idx === 0 ? 'selected' : ''}" onclick="selectCustomizerSize('${s.id || s.name || idx}')" data-size-id="${s.id || ''}" data-size-name="${s.name || ''}" data-size-idx="${idx}">
          <div class="option-left-wrap">
            <div class="custom-radio-circle"></div>
            <span class="option-name">${s.name}</span>
          </div>
          <span class="option-price-extra font-num">${s.price > 0 ? `+${s.price} ${currency}` : 'السعر الأساسي'}</span>
        </div>
      `).join('');
    }
  } else {
    if (elements.customizerSizesSection) elements.customizerSizesSection.style.display = 'none';
  }

  // Render Add-ons
  if (p.addons && p.addons.length > 0) {
    if (elements.customizerAddonsSection) elements.customizerAddonsSection.style.display = 'block';
    if (elements.customizerAddonsList) {
      elements.customizerAddonsList.innerHTML = p.addons.map(a => `
        <div class="customizer-option-card" onclick="toggleCustomizerAddon('${a.id || a.name}')" data-addon-id="${a.id || ''}" data-addon-name="${a.name || ''}">
          <div class="option-left-wrap">
            <div class="custom-check-box"></div>
            <span class="option-name">${a.name}</span>
          </div>
          <span class="option-price-extra font-num">+${a.price} ${currency}</span>
        </div>
      `).join('');
    }
  } else {
    if (elements.customizerAddonsSection) elements.customizerAddonsSection.style.display = 'none';
  }

  calculateCustomizerTotal();

  if (elements.customizerBackdrop) elements.customizerBackdrop.classList.add('open');
  if (elements.customizerModal) elements.customizerModal.classList.add('open');
  pushNavState('customizer', { productId });
  SoundFX.playPop();
};

window.selectCustomizerSize = function(sizeIdentifier) {
  if (!customizerProduct || !customizerProduct.sizes) return;
  customizerSelectedSize = customizerProduct.sizes.find((s, idx) => (s.id && s.id === sizeIdentifier) || s.name === sizeIdentifier || String(idx) === String(sizeIdentifier));
  
  const cards = document.querySelectorAll('#customizer-sizes-list .customizer-option-card');
  cards.forEach((card, idx) => {
    const isSel = card.dataset.sizeId === sizeIdentifier || card.dataset.sizeName === sizeIdentifier || String(idx) === String(sizeIdentifier);
    card.classList.toggle('selected', isSel);
  });

  SoundFX.playPop();
  calculateCustomizerTotal();
};

window.toggleCustomizerAddon = function(addonId) {
  if (!customizerProduct || !customizerProduct.addons) return;
  const addon = customizerProduct.addons.find(a => a.id === addonId);
  if (!addon) return;

  const exists = customizerSelectedAddons.find(a => a.id === addonId);
  if (exists) {
    customizerSelectedAddons = customizerSelectedAddons.filter(a => a.id !== addonId);
  } else {
    customizerSelectedAddons.push(addon);
  }

  const card = document.querySelector(`#customizer-addons-list .customizer-option-card[data-addon-id="${addonId}"]`);
  if (card) {
    card.classList.toggle('selected', !exists);
  }

  SoundFX.playPop();
  calculateCustomizerTotal();
};

function calculateCustomizerTotal() {
  if (!customizerProduct) return;
  const currency = Store.getSettings().currency || "ج.م";
  let unitPrice = customizerProduct.price;

  if (customizerSelectedSize && customizerSelectedSize.price) {
    unitPrice += customizerSelectedSize.price;
  }

  customizerSelectedAddons.forEach(a => {
    unitPrice += (a.price || 0);
  });

  const total = unitPrice * customizerQty;
  if (elements.customizerTotalPrice) {
    elements.customizerTotalPrice.textContent = `${total.toFixed(2)} ${currency}`;
  }
}

function initCustomizerEvents() {
  if (elements.btnCloseCustomizer) {
    elements.btnCloseCustomizer.addEventListener('click', closeCustomizer);
  }
  if (elements.customizerBackdrop) {
    elements.customizerBackdrop.addEventListener('click', closeCustomizer);
  }

  if (elements.btnCustomizerQtyMinus) {
    elements.btnCustomizerQtyMinus.addEventListener('click', () => {
      if (customizerQty > 1) {
        customizerQty--;
        if (elements.customizerQtyVal) elements.customizerQtyVal.textContent = customizerQty;
        calculateCustomizerTotal();
        SoundFX.playPop();
      }
    });
  }

  if (elements.btnCustomizerQtyPlus) {
    elements.btnCustomizerQtyPlus.addEventListener('click', () => {
      customizerQty++;
      if (elements.customizerQtyVal) elements.customizerQtyVal.textContent = customizerQty;
      calculateCustomizerTotal();
      SoundFX.playPop();
    });
  }

  if (elements.btnAddCustomizedCart) {
    elements.btnAddCustomizedCart.addEventListener('click', () => {
      if (checkOrderingPaused()) return;
      if (!customizerProduct) return;

      let unitPrice = customizerProduct.price;
      if (customizerSelectedSize && customizerSelectedSize.price) {
        unitPrice += customizerSelectedSize.price;
      }
      customizerSelectedAddons.forEach(a => {
        unitPrice += (a.price || 0);
      });

      const notes = (elements.customizerNotes && elements.customizerNotes.value || '').trim();

      const cartItem = {
        id: 'c_' + customizerProduct.id + '_' + Date.now(),
        productId: customizerProduct.id,
        name: customizerProduct.name,
        basePrice: customizerProduct.price,
        price: unitPrice,
        image: customizerProduct.image,
        category: customizerProduct.category,
        selectedSize: customizerSelectedSize ? { ...customizerSelectedSize } : null,
        selectedAddons: customizerSelectedAddons.map(a => ({ ...a })),
        notes: notes,
        qty: customizerQty
      };

      const cart = Store.getCart();
      const existing = findMatchingCartItem(cart, cartItem);
      if (existing) {
        existing.qty += cartItem.qty;
      } else {
        cart.push(cartItem);
      }
      Store.saveCart(cart);

      SoundFX.playPop();
      closeCustomizer();
      updateLedgerUI();
      renderProducts();
    });
  }
}

function closeCustomizer(triggerHistoryBack = true) {
  customizerProduct = null;
  if (elements.customizerBackdrop) elements.customizerBackdrop.classList.remove('open');
  if (elements.customizerModal) elements.customizerModal.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.harpyNav === 'customizer') {
    try { history.back(); } catch(e) {}
  }
}


window.calculateCustomizerTotal = calculateCustomizerTotal;
window.initCustomizerEvents = initCustomizerEvents;
window.closeCustomizer = closeCustomizer;
