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
  if (typeof checkOrderingPaused === 'function' && checkOrderingPaused()) return;
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  customizerProduct = p;
  customizerSelectedSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : null;
  customizerSelectedAddons = [];
  customizerQty = 1;

  const s = Store.getSettings ? Store.getSettings() : {};
  const currency = (typeof window.getCurrency === 'function') ? window.getCurrency(s.currency) : (typeof window.t === 'function' ? window.t('currency', s.currency || "ج.م") : (s.currency || "ج.م"));

  if (elements.customizerTitle) elements.customizerTitle.textContent = (typeof window.getProductName === 'function' ? window.getProductName(p) : (typeof window.tr === 'function' ? window.tr(p.name) : p.name));
  if (elements.customizerDesc) elements.customizerDesc.textContent = (typeof window.getProductDesc === 'function' ? window.getProductDesc(p) : (typeof window.tr === 'function' ? window.tr(p.desc || p.description || '') : (p.desc || p.description || '')));
  if (elements.customizerImg) elements.customizerImg.src = p.image;
  const effBasePrice = (Store.getEffectiveProductPrice) ? Store.getEffectiveProductPrice(p) : p.price;
  if (elements.customizerBasePrice) elements.customizerBasePrice.textContent = `${effBasePrice} ${currency}`;
  if (elements.customizerNotes) elements.customizerNotes.value = '';
  if (elements.customizerQtyVal) elements.customizerQtyVal.textContent = '1';

  // Multi-Image Gallery Strip (when multiImageGallery is enabled and product has extra images)
  const thumbsWrap = document.getElementById('customizer-gallery-thumbs');
  if (thumbsWrap) {
    const mods = (window.ModuleEnforcer && window.ModuleEnforcer.modules) ? window.ModuleEnforcer.modules : {};
    const extraImgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    const allImgs = [p.image, ...extraImgs.filter(u => u && u !== p.image)].filter(Boolean);
    if (mods.multiImageGallery !== false && allImgs.length > 1) {
      thumbsWrap.style.display = 'flex';
      thumbsWrap.innerHTML = allImgs.map((u, idx) => `
        <button type="button" class="customizer-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="window.selectCustomizerGalleryImage('${u.replace(/'/g, "\\'")}', this)">
          <img src="${u}" alt="" loading="lazy">
        </button>
      `).join('');
    } else {
      thumbsWrap.style.display = 'none';
      thumbsWrap.innerHTML = '';
    }
  }

  // Timed Flash Offer Countdown Badge in Customizer
  const cTimerEl = document.getElementById('customizer-offer-countdown');
  if (cTimerEl) {
    const isTimed = !!(window.NicheEngine && NicheEngine.isTimedOfferActive(p));
    if (isTimed) {
      cTimerEl.style.display = 'inline-flex';
      cTimerEl.setAttribute('data-offer-ends', String(p.offerEndsAt));
      const fmt = NicheEngine.formatCountdown(p.offerEndsAt - Date.now(), (typeof I18n !== 'undefined' ? I18n.getLanguage() : 'ar'));
      cTimerEl.innerHTML = `<span>${p.offerLabel ? Store.escapeHtml(p.offerLabel) + ' • ' : 'عرض خاص ينتهي خلال '}</span><span class="offer-timer-digits font-num">${fmt.text}</span>`;
    } else {
      cTimerEl.style.display = 'none';
      cTimerEl.removeAttribute('data-offer-ends');
    }
  }

  // Render Sizes
  if (p.sizes && p.sizes.length > 0) {
    if (elements.customizerSizesSection) elements.customizerSizesSection.style.display = 'block';
    if (elements.customizerSizesList) {
      const basePriceLabel = (typeof t === 'function' ? t('val_base_price', 'السعر الأساسي') : 'السعر الأساسي');
      elements.customizerSizesList.innerHTML = p.sizes.map((s, idx) => {
        const effSzPrice = (Store.getEffectiveSizePrice) ? Store.getEffectiveSizePrice(p, s) : (s.price || 0);
        return `
        <div class="customizer-option-card ${idx === 0 ? 'selected' : ''}" onclick="selectCustomizerSize('${s.id || s.name || idx}')" data-size-id="${s.id || ''}" data-size-name="${s.name || ''}" data-size-idx="${idx}">
          <div class="option-left-wrap">
            <div class="custom-radio-circle"></div>
            <span class="option-name">${(typeof window.getSizeName === 'function' ? window.getSizeName(s) : (typeof window.tr === 'function' ? window.tr(s.name) : s.name))}</span>
          </div>
          <span class="option-price-extra font-num">${effSzPrice > 0 ? `+${effSzPrice} ${currency}` : basePriceLabel}</span>
        </div>
      `;
      }).join('');
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
            <span class="option-name">${(typeof window.getAddonName === 'function' ? window.getAddonName(a) : (typeof window.tr === 'function' ? window.tr(a.name) : a.name))}</span>
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
  document.body.classList.add('customizer-open');
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
  const s = Store.getSettings ? Store.getSettings() : {};
  const currency = (typeof window.getCurrency === 'function') ? window.getCurrency(s.currency) : (typeof window.t === 'function' ? window.t('currency', s.currency || "ج.م") : (s.currency || "ج.م"));
  let unitPrice = (Store.getEffectiveProductPrice) ? Store.getEffectiveProductPrice(customizerProduct) : customizerProduct.price;

  if (customizerSelectedSize) {
    const effSz = (Store.getEffectiveSizePrice) ? Store.getEffectiveSizePrice(customizerProduct, customizerSelectedSize) : (customizerSelectedSize.price || 0);
    unitPrice += effSz;
  }

  customizerSelectedAddons.forEach(a => {
    unitPrice += (a.price || 0);
  });

  const total = unitPrice * customizerQty;
  const formattedTotal = (Math.round(total * 100) / 100).toString();
  if (elements.customizerTotalPrice) {
    elements.customizerTotalPrice.textContent = `${formattedTotal} ${currency}`;
  }
  const btnBadge = document.getElementById('btn-customizer-price-badge');
  if (btnBadge) {
    btnBadge.textContent = `${formattedTotal} ${currency}`;
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
      if (customizerProduct && Store.getAvailableStockQty) {
        const avail = Store.getAvailableStockQty(customizerProduct);
        if (avail !== null && customizerQty >= avail) {
          if (typeof showToastNotification === 'function') showToastNotification(`متوفر ${avail} قطعة فقط بالمخزون حالياً`, "warning");
          return;
        }
      }
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

      const effBase = (Store.getEffectiveProductPrice) ? Store.getEffectiveProductPrice(customizerProduct) : customizerProduct.price;
      const effSz = (customizerSelectedSize && Store.getEffectiveSizePrice) ? Store.getEffectiveSizePrice(customizerProduct, customizerSelectedSize) : (customizerSelectedSize ? (customizerSelectedSize.price || 0) : 0);
      const isTimed = !!(window.NicheEngine && NicheEngine.isTimedOfferActive(customizerProduct));

      let unitPrice = effBase + effSz;
      customizerSelectedAddons.forEach(a => {
        unitPrice += (a.price || 0);
      });

      const avail = Store.getAvailableStockQty ? Store.getAvailableStockQty(customizerProduct) : null;
      const cartNow = Store.getCart();
      const inCartAlready = cartNow.filter(i => (i.productId || i.id) === customizerProduct.id).reduce((s, i) => s + (i.qty || 1), 0);
      if (avail !== null && (inCartAlready + customizerQty) > avail) {
        if (typeof showToastNotification === 'function') showToastNotification(`متوفر ${avail} قطعة فقط بالمخزون (لديك ${inCartAlready} بالسلة)`, "warning");
        return;
      }

      const notes = (elements.customizerNotes && elements.customizerNotes.value || '').trim();

      const cartItem = {
        id: 'c_' + customizerProduct.id + '_' + Date.now(),
        productId: customizerProduct.id,
        name: customizerProduct.name,
        name_en: customizerProduct.name_en || (typeof window.tr === 'function' ? window.tr(customizerProduct.name) : ''),
        basePrice: effBase,
        price: unitPrice,
        appliedOfferEndsAt: isTimed ? customizerProduct.offerEndsAt : 0,
        image: customizerProduct.image,
        category: customizerProduct.category,
        category_en: customizerProduct.category_en || (typeof window.tr === 'function' ? window.tr(customizerProduct.category) : ''),
        selectedSize: customizerSelectedSize ? { 
          ...customizerSelectedSize,
          price: effSz,
          name_en: customizerSelectedSize.name_en || (typeof window.tr === 'function' ? window.tr(customizerSelectedSize.name) : '')
        } : null,
        selectedAddons: customizerSelectedAddons.map(a => ({ 
          ...a,
          name_en: a.name_en || (typeof window.tr === 'function' ? window.tr(a.name) : '')
        })),
        notes: notes,
        qty: customizerQty
      };

      const cart = Store.getCart();
      const existing = findMatchingCartItem(cart, cartItem);
      if (existing) {
        existing.qty += cartItem.qty;
        existing.price = unitPrice;
        existing.basePrice = effBase;
        existing.appliedOfferEndsAt = isTimed ? customizerProduct.offerEndsAt : 0;
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

window.selectCustomizerGalleryImage = function(url, btnEl) {
  if (elements.customizerImg && url) elements.customizerImg.src = url;
  document.querySelectorAll('.customizer-thumb-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
};

function closeCustomizer(triggerHistoryBack = true) {
  customizerProduct = null;
  if (elements.customizerBackdrop) elements.customizerBackdrop.classList.remove('open');
  if (elements.customizerModal) elements.customizerModal.classList.remove('open');
  document.body.classList.remove('customizer-open');
  if (triggerHistoryBack && window.history.state && window.history.state.harpyNav === 'customizer') {
    try { history.back(); } catch(e) {}
  }
}


window.calculateCustomizerTotal = calculateCustomizerTotal;
window.initCustomizerEvents = initCustomizerEvents;
window.closeCustomizer = closeCustomizer;
