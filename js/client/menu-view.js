// ═══════════════════════════════════════════════════════════
// HarpyOrder — Menu View Engine (Categories, Products & Previews)
// ═══════════════════════════════════════════════════════════

var activeCategoryFilter = 'all';
var activeDiscoveryFilter = 'all';
var searchDebounceTimer = null;
var currentPreviewProductId = null;

function getCategorySvgIcon(catName) {
  const c = (catName || '').toLowerCase().trim();
  if (c === 'all' || c.includes('كل القائمة') || c.includes('الكل')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M12 1.5 2.5 19.8c2.8 1.8 6.3 2.7 9.5 2.7s6.7-.9 9.5-2.7L12 1.5zm0 4.3 5.4 10.8c-1.6-.5-3.5-.6-5.4.3-1.9-.9-3.8-.8-5.4-.3L12 5.8zm-2 9.2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm4-4a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0zm3 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>';
  }
  if (c === 'fav' || c.includes('مفضل')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  }
  if (c.includes('بيتزا') || c.includes('pizza')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M12 1.5 2.5 19.8c2.8 1.8 6.3 2.7 9.5 2.7s6.7-.9 9.5-2.7L12 1.5zm0 4.3 5.4 10.8c-1.6-.5-3.5-.6-5.4.3-1.9-.9-3.8-.8-5.4-.3L12 5.8zm-2 9.2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm4-4a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0zm3 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>';
  }
  if (c.includes('برجر') || c.includes('burger')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M19.5 8.5C18.7 4.5 15.6 2 12 2s-6.7 2.5-7.5 6.5h15zM2 11h20v2H2zm1 4c.8 0 1.5-.7 1.5-1.5S5.2 12 6 12s1.5.7 1.5 1.5S8.2 15 9 15s1.5-.7 1.5-1.5S11.2 12 12 12s1.5.7 1.5 1.5S14.2 15 15 15s1.5-.7 1.5-1.5S17.2 12 18 12s1.5.7 1.5 1.5S20.2 15 21 15v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1zm1 3h16a1 1 0 0 1 1 1c0 2-3 4-8 4s-8-2-8-4a1 1 0 0 1 1-1z"/></svg>';
  }
  if (c.includes('كريب') || c.includes('crepe') || c.includes('crape')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 19a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3L12 2z"/><path d="m8 12 4-2 4 2"/><path d="m6 16 6-2 6 2"/><circle cx="12" cy="7" r="1" fill="currentColor"/></svg>';
  }
  if (c.includes('ساندوتش') || c.includes('سوري') || c.includes('راب') || c.includes('sandwich')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M3 8.5C3 5.5 6 3 12 3s9 2.5 9 5.5v1H3v-1zm-1 3.5h20v2H2zm1 4h18v1.5c0 3-4 4.5-9 4.5s-9-1.5-9-4.5V16z"/><circle cx="8" cy="6" r=".7" fill="#fff"/><circle cx="12" cy="5.5" r=".7" fill="#fff"/><circle cx="16" cy="6" r=".7" fill="#fff"/></svg>';
  }
  if (c.includes('حواوشي') || c.includes('طاجن') || c.includes('طواجن') || c.includes('فطير')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 6.5v11"/><path d="m8 8 8 8"/><path d="m16 8-8 8"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2"/></svg>';
  }
  if (c.includes('مشوي') || c.includes('مشاوي') || c.includes('كباب') || c.includes('شاورما') || c.includes('grill') || c.includes('shawarma')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="22" x2="22" y2="2"/><rect x="5" y="13" width="6" height="6" rx="1.5" transform="rotate(-45 8 16)" fill="currentColor" opacity="0.25"/><rect x="10" y="8" width="6" height="6" rx="1.5" transform="rotate(-45 13 11)" fill="currentColor" opacity="0.25"/><rect x="15" y="3" width="6" height="6" rx="1.5" transform="rotate(-45 18 6)" fill="currentColor" opacity="0.25"/></svg>';
  }
  if (c.includes('فراخ') || c.includes('دجاج') || c.includes('chicken') || c.includes('بروست')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M19.4 4.6c-2.8-2.8-8.2-1.2-11.2 1.8-2.6 2.6-3.4 6.8-1.7 9.8l-2.8 2.8a2 2 0 1 0 2.8 2.8l2.8-2.8c3 1.7 7.2.9 9.8-1.7 3.1-3.1 4.6-8.5 1.8-11.3l-1.5-1.4zm-2.4 3.4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>';
  }
  if (c.includes('بطاطس') || c.includes('فرايز') || c.includes('fries') || c.includes('سناكس') || c.includes('مقبلات') || c.includes('إضافات')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M5 11l1.8 11h10.4L19 11H5zm3.5-9h2v7h-2V2zm4.5 0h2v7h-2V2zm-7 2.5h2v6.5h-2V4.5zm13.5 0h2v6.5h-2V4.5z"/></svg>';
  }
  if (c.includes('مشروب') || c.includes('عصير') || c.includes('drink') || c.includes('غازية') || c.includes('بيبسي') || c.includes('مياه')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M6 9l1.8 12.5a2 2 0 0 0 2 1.5h4.4a2 2 0 0 0 2-1.5L18 9H6zm-1-3h14a1 1 0 0 1 1 1v1H4V7a1 1 0 0 1 1-1zm8-4h2l-2 3h-2l2-3z"/></svg>';
  }
  if (c.includes('حلو') || c.includes('حلويات') || c.includes('ديزرت') || c.includes('dessert') || c.includes('وافل') || c.includes('waffle')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M12 2a2 2 0 0 0-2 2c0 .4.1.7.3 1L3 11v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9l-7.3-6c.2-.3.3-.6.3-1a2 2 0 0 0-2-2zm-7 11h14v2H5v-2zm0 4h14v3H5v-3z"/></svg>';
  }
  if (c.includes('مكرونة') || c.includes('باستا') || c.includes('أرز') || c.includes('pasta') || c.includes('rice') || c.includes('نودلز')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M3 11c0 5 4 9 9 9s9-4 9-9H3zm4-7c-.5 0-1 .5-1 1s1 1.5 1 2.5c0 .6-.4 1-1 1s-1 .5-1 1 1 1.5 1 2.5H8c0-1.5-1-2-1-3 0-1 1-1.5 1-2.5 0-1-1-1-1-2zm5 0c-.5 0-1 .5-1 1s1 1.5 1 2.5c0 .6-.4 1-1 1s-1 .5-1 1 1 1.5 1 2.5h2c0-1.5-1-2-1-3 0-1 1-1.5 1-2.5 0-1-1-1-1-2zm5 0c-.5 0-1 .5-1 1s1 1.5 1 2.5c0 .6-.4 1-1 1s-1 .5-1 1 1 1.5 1 2.5h2c0-1.5-1-2-1-3 0-1 1-1.5 1-2.5 0-1-1-1-1-2z"/></svg>';
  }
  if (c.includes('صوص') || c.includes('سلط') || c.includes('salad')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="currentColor"><path d="M12 2C9 2 7 4 7 6c0 1.2.6 2.3 1.5 3H3c0 5 4 9 9 9s9-4 9-9h-5.5c.9-.7 1.5-1.8 1.5-3 0-2-2-4-5-4zm0 2c1.7 0 3 1 3 2s-1.3 2-3 2-3-1-3-2 1.3-2 3-2z"/></svg>';
  }
  if (c.includes('وجب') || c.includes('كومبو') || c.includes('meal')) {
    return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="10" x2="10" y2="20"/></svg>';
  }
  // Default Appetizing Food Cloche / Plate SVG
  return '<svg viewBox="0 0 24 24" class="cat-svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v2"/><path d="M4 18h16"/><path d="M4 18a8 8 0 0 1 16 0"/><line x1="2" y1="20" x2="22" y2="20"/></svg>';
}

function getCategoryEmoji(catName) {
  return '';
}

function renderDiscoveryRibbon() {
  if (!elements.discoveryContainer) return;
  const favorites = Store.getFavorites();

  const discoveryTags = [
    { 
      id: 'all', 
      label: `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg><span>جميع الأصناف</span>`, 
      count: null 
    },
    { 
      id: 'fav', 
      label: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg><span>المفضلة</span> <span class="chip-count font-num">${favorites.length}</span>`, 
      count: favorites.length 
    }
  ];

  elements.discoveryContainer.innerHTML = discoveryTags.map(tag => `
    <button class="discovery-chip ${activeDiscoveryFilter === tag.id ? 'active' : ''}" onclick="handleDiscoveryFilter('${tag.id}')">
      ${tag.label}
    </button>
  `).join('');
}

window.handleDiscoveryFilter = function(filterId) {
  activeDiscoveryFilter = filterId;
  activeCategoryFilter = 'all';
  renderDiscoveryRibbon();
  renderCategories();
  renderProducts();
  SoundFX.playPop();

  if (elements.discoveryContainer) {
    const activeBtn = elements.discoveryContainer.querySelector('.discovery-chip.active');
    if (activeBtn) {
      scrollPillToCenter(elements.discoveryContainer, activeBtn);
    }
  }
};

function extractCategoryEmojiAndLabel(catName) {
  const raw = catName || '';
  const emojiMatch = raw.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u);
  const cleanLabel = raw.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  let emoji = emojiMatch ? emojiMatch[0] : null;
  if (!emoji) {
    emoji = getCategoryEmoji(cleanLabel);
  }
  return { emoji: emoji || '', label: cleanLabel || raw };
}

let lastRenderedCategoriesSignature = '';

function renderCategories() {
  if (!elements.categoriesContainer) return;
  const categories = Store.getCategories();
  const currentSig = JSON.stringify(categories);

  // Only re-build DOM if the list of categories actually changed!
  if (lastRenderedCategoriesSignature !== currentSig) {
    lastRenderedCategoriesSignature = currentSig;
    const favCount = (Store.getFavorites && typeof Store.getFavorites === 'function') ? Store.getFavorites().length : 0;
    const isAllActive = (activeCategoryFilter === 'all' && activeDiscoveryFilter === 'all');
    const isFavActive = (activeDiscoveryFilter === 'fav');

    let html = `
      <button class="cat-card-pill cat-pill ${isAllActive ? 'active' : ''}" data-cat="all" onclick="handleCategoryFilter('all')" title="الكل">
        <div class="cat-card-icon">${getCategorySvgIcon('all')}</div>
        <span class="cat-card-label">الكل</span>
      </button>
    `;

    if (favCount > 0) {
      html += `
        <button class="cat-card-pill cat-pill ${isFavActive ? 'active' : ''}" data-cat="fav" onclick="handleCategoryFilter('fav')" title="الأصناف المفضلة">
          <div class="cat-card-icon">${getCategorySvgIcon('fav')}</div>
          <span class="cat-card-label">المفضلة (${favCount})</span>
        </button>
      `;
    }

    html += categories.map(cat => {
      const isSelected = (!isFavActive && activeCategoryFilter === cat);
      const cleanLabel = (cat || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, '').trim() || cat;
      const iconSvg = getCategorySvgIcon(cat);
      return `
        <button class="cat-card-pill cat-pill ${isSelected ? 'active' : ''}" data-cat="${encodeURIComponent(cat)}" onclick="handleCategoryFilter(decodeURIComponent(this.dataset.cat))" title="${cleanLabel}">
          <div class="cat-card-icon">${iconSvg}</div>
          <span class="cat-card-label">${cleanLabel}</span>
        </button>
      `;
    }).join('');

    elements.categoriesContainer.innerHTML = html;
  } else {
    // Fast in-place class toggle with 0 DOM reconstruction
    updateCategoryPillsActiveState();
  }
}

function updateCategoryPillsActiveState() {
  if (!elements.categoriesContainer) return;
  const pills = elements.categoriesContainer.querySelectorAll('.cat-card-pill, .cat-pill');
  pills.forEach(pill => {
    const rawCat = pill.dataset.cat;
    let isMatch = false;
    if (activeDiscoveryFilter === 'fav') {
      isMatch = (rawCat === 'fav');
    } else if (activeCategoryFilter === 'all') {
      isMatch = (rawCat === 'all');
    } else {
      isMatch = (decodeURIComponent(rawCat) === activeCategoryFilter);
    }
    pill.classList.toggle('active', isMatch);
  });
}

function scrollPillToCenter(container, pillEl) {
  if (!container || !pillEl) return;
  const containerWidth = container.clientWidth;
  const pillLeft = pillEl.offsetLeft;
  const pillWidth = pillEl.offsetWidth;
  const targetScroll = pillLeft - (containerWidth / 2) + (pillWidth / 2);
  container.scrollTo({
    left: targetScroll,
    behavior: 'smooth'
  });
}

window.handleCategoryFilter = function(cat) {
  if (cat === 'fav') {
    activeDiscoveryFilter = 'fav';
    activeCategoryFilter = 'all';
  } else {
    activeDiscoveryFilter = 'all';
    activeCategoryFilter = cat;
  }

  // 1. Instant in-place UI active state update (0ms, 0 DOM recreation)
  updateCategoryPillsActiveState();
  const headerFavBtn = document.getElementById('btn-header-fav-filter');
  if (headerFavBtn) {
    headerFavBtn.classList.toggle('active', activeDiscoveryFilter === 'fav');
  }

  // 2. Smoothly center selected pill in horizontal strip
  if (elements.categoriesContainer) {
    const activeBtn = elements.categoriesContainer.querySelector('.cat-pill.active');
    if (activeBtn) {
      scrollPillToCenter(elements.categoriesContainer, activeBtn);
    }
  }

  // 3. Fast discovery ribbon sync
  if (elements.discoveryContainer) {
    elements.discoveryContainer.querySelectorAll('.discovery-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('onclick')?.includes("'all'"));
    });
  }

  // 4. Instant 0ms product filtering (CSS display toggle)
  renderProducts();

  // 5. Sound feedback
  SoundFX.playPop();
};

let lastRenderedProductsSignature = '';
let renderProductsRAF = null;

function scheduleRenderProducts(forceRebuild = false) {
  if (forceRebuild) {
    if (renderProductsRAF) cancelAnimationFrame(renderProductsRAF);
    renderProductsRAF = null;
    renderProducts(true);
    return;
  }
  if (renderProductsRAF) return;
  renderProductsRAF = requestAnimationFrame(() => {
    renderProductsRAF = null;
    renderProducts(false);
  });
}

function renderProducts(forceRebuild = false) {
  if (renderProductsRAF) {
    cancelAnimationFrame(renderProductsRAF);
    renderProductsRAF = null;
  }
  if (!elements.productsContainer) return;

  const allProds = Store.getProducts().filter(p => p.visible !== false);
  const settings = Store.getSettings();
  const currency = settings.currency || "ج.م";
  const favorites = Store.getFavorites();
  const cart = Store.getCart();
  const searchQuery = (elements.searchInput && elements.searchInput.value || '').trim().toLowerCase();

  // Dynamic Section Heading Sync (e.g. "الأكثر مبيعاً")
  const secTitleEl = document.getElementById('menu-section-title');
  if (secTitleEl) {
    if (searchQuery) {
      secTitleEl.textContent = `نتائج البحث عن "${searchQuery}"`;
    } else if (activeDiscoveryFilter === 'fav') {
      secTitleEl.textContent = 'الأصناف المفضلة';
    } else if (activeCategoryFilter === 'all') {
      secTitleEl.textContent = 'الأكثر مبيعاً';
    } else {
      const cleanCat = (activeCategoryFilter || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, '').trim();
      secTitleEl.textContent = `${cleanCat || activeCategoryFilter}`;
    }
  }

  // Fast content signature to detect real product data changes
  const currentSig = allProds.map(p => `${p.id}_${p.price}_${p.originalPrice || 0}_${p.name}_${p.category}_${p.isFeatured ? 1 : 0}_${p.badge || ''}_${(p.sizes || []).length}_${(p.addons || []).length}`).join('|');

  const existingCards = elements.productsContainer.querySelectorAll('.food-item-card');
  const needsFullBuild = forceRebuild || existingCards.length === 0 || currentSig !== lastRenderedProductsSignature || allProds.length !== existingCards.length;

  if (needsFullBuild) {
    lastRenderedProductsSignature = currentSig;

    // Priority Sorting: Favorited products appear at the top
    let sortedProds = [...allProds];
    if (favorites.length > 0) {
      sortedProds.sort((a, b) => {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
      });
    }

    if (sortedProds.length === 0) {
      if (typeof Store !== 'undefined' && Store.isCloudDataLoaded && !Store.isCloudDataLoaded()) {
        elements.productsContainer.innerHTML = renderSkeletonCards(6);
      } else {
        elements.productsContainer.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1; padding: 60px 20px;">
            <svg class="empty-icon" viewBox="0 0 24 24" style="width:64px;height:64px;opacity:0.3;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <div class="empty-title" style="font-size:1.1rem;">المنيو قيد الإعداد</div>
            <p style="font-size:13px; color:var(--text-muted); max-width:260px; margin: 8px auto 0;">يقوم المطعم حالياً بإضافة قائمة الأصناف. ارجع قريباً!</p>
          </div>
        `;
      }
    } else {
      elements.productsContainer.innerHTML = sortedProds.map((p, idx) => renderProductCard(p, currency, idx)).join('');
    }
  }

  // Precompute Lookup Maps for O(1) instantaneous access
  const prodMap = new Map();
  allProds.forEach(p => prodMap.set(p.id, p));

  const cartQtyMap = new Map();
  cart.forEach(i => {
    if (!i.selectedSize && (!i.selectedAddons || i.selectedAddons.length === 0)) {
      const id = i.productId || i.id;
      cartQtyMap.set(id, (cartQtyMap.get(id) || 0) + (i.qty || 1));
    }
  });

  // 0ms Fast In-Place Visibility Filtering & In-Place Stepper Updates
  let visibleCount = 0;
  const cards = elements.productsContainer.querySelectorAll('.food-item-card');
  cards.forEach(card => {
    const pid = card.dataset.productId;
    const p = prodMap.get(pid);
    if (!p) {
      card.style.display = 'none';
      card.classList.add('is-hidden');
      return;
    }

    const isFav = favorites.includes(p.id);
    const catMatch = (activeDiscoveryFilter === 'fav')
      ? isFav
      : (activeCategoryFilter === 'all' || p.category === activeCategoryFilter);

    const pDesc = (p.desc || p.description || '').toLowerCase();
    const pCategory = (p.category || '').toLowerCase();
    const pBadge = (p.badge || '').toLowerCase();
    const searchMatch = !searchQuery || (
      p.name.toLowerCase().includes(searchQuery) ||
      pDesc.includes(searchQuery) ||
      pCategory.includes(searchQuery) ||
      pBadge.includes(searchQuery)
    );

    if (catMatch && searchMatch) {
      card.style.display = '';
      card.classList.remove('is-hidden');
      visibleCount++;

      // In-place button stepper update (skips DOM traversal if qty didn't change)
      const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);
      if (!hasOptions) {
        const qty = cartQtyMap.get(p.id) || 0;
        const qtyStr = String(qty);
        if (card.dataset.renderedQty !== qtyStr) {
          card.dataset.renderedQty = qtyStr;
          const btnContainer = card.querySelector('.food-item-footer > div:last-child');
          if (btnContainer) {
            btnContainer.innerHTML = renderCardActionButton(p, qty);
          }
        }
      }

      // In-place heart icon active state sync (skips DOM traversal if fav status didn't change)
      const favStr = isFav ? '1' : '0';
      if (card.dataset.renderedFav !== favStr) {
        card.dataset.renderedFav = favStr;
        const favBtnTop = card.querySelector('.card-top-actions .btn-fav-toggle');
        if (favBtnTop) {
          favBtnTop.classList.toggle('active', isFav);
          const svg = favBtnTop.querySelector('svg');
          if (svg) svg.style.fill = isFav ? 'currentColor' : 'none';
        }
        const favBtnInline = card.querySelector('.btn-fav-inline');
        if (favBtnInline) {
          favBtnInline.classList.toggle('active', isFav);
          const svg = favBtnInline.querySelector('svg');
          if (svg) svg.style.fill = isFav ? 'currentColor' : 'none';
        }
      }
    } else {
      card.style.display = 'none';
      card.classList.add('is-hidden');
    }
  });

  // Handle Search / Filter Empty State Overlay
  let emptyOverlay = elements.productsContainer.querySelector('.dynamic-empty-filter-state');
  if (visibleCount === 0 && allProds.length > 0) {
    if (!emptyOverlay) {
      emptyOverlay = document.createElement('div');
      emptyOverlay.className = 'empty-state dynamic-empty-filter-state';
      emptyOverlay.style.gridColumn = '1 / -1';
      emptyOverlay.innerHTML = `
        <svg class="empty-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <div class="empty-title">لا توجد أصناف مطابقة</div>
        <p style="font-size:12px; color:var(--text-muted);">جرب البحث بكلمة أخرى أو تصفح باقي الأقسام</p>
      `;
      elements.productsContainer.appendChild(emptyOverlay);
    }
    emptyOverlay.style.display = 'block';
  } else if (emptyOverlay) {
    emptyOverlay.style.display = 'none';
  }

  // Hero Featured
  const featured = allProds.find(p => p.isFeatured);
  if (elements.heroShowcaseContainer) {
    if (featured && activeCategoryFilter === 'all' && activeDiscoveryFilter === 'all' && !searchQuery) {
      elements.heroShowcaseContainer.style.display = 'block';
      elements.heroShowcaseContainer.innerHTML = renderHeroShowcase(featured, currency);
    } else {
      elements.heroShowcaseContainer.style.display = 'none';
    }
  }
}

window.handleCardClick = function(event, productId) {
  // If clicked directly on or inside interactive buttons/steppers, do not trigger preview
  if (event.target.closest('.btn-fav-toggle, .btn-fav-inline, .btn-quick-add, .qty-stepper, .qty-stepper-btn')) {
    return;
  }
  openQuickPreview(productId);
};

function renderHeroShowcase(p, currency) {
  const isFav = Store.isFavorite(p.id);
  const cart = Store.getCart();
  const cartItem = cart.find(i => (i.productId === p.id || i.id === p.id) && !i.selectedSize && (!i.selectedAddons || i.selectedAddons.length === 0));
  const qty = cartItem ? cartItem.qty : 0;
  const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);

  return `
    <div class="hero-product-card" onclick="handleCardClick(event, '${p.id}')">
      <div class="hero-product-img-wrap">
        <img src="${p.image}" class="hero-product-img" alt="${p.name}" loading="eager" fetchpriority="high" decoding="async">
        <span class="hero-badge-tag">${p.badge || 'اختيار الشيف'}</span>
      </div>
      <div class="hero-product-content">
        <div>
          <div class="hero-meta-row">
            <span class="meta-chip">${p.category}</span>
            <span class="meta-chip"><svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${p.prepTime || '15 دقيقة'}</span>
          </div>
          <h2 class="hero-product-title">${p.name}</h2>
          <p class="hero-product-desc">${p.desc || p.description || ''}</p>
        </div>
        <div class="hero-product-footer">
          <div class="hero-price font-num">
            ${p.originalPrice && p.originalPrice > p.price ? `<span class="price-crossed" style="font-size:14px;">${p.originalPrice} ${currency}</span>` : ''}
            ${p.price} <span>${currency}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn-fav-toggle ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); handleToggleFav('${p.id}')" title="إضافة للمفضلة">
              <svg class="icon" viewBox="0 0 24 24" style="fill: ${isFav ? 'currentColor' : 'none'};"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            ${hasOptions ? `
              <button class="btn-quick-add" onclick="event.stopPropagation(); openCustomizer('${p.id}')">
                <span>تخصيص +</span>
              </button>
            ` : renderCardActionButton(p, qty)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProductCard(p, currency, index = 0) {
  const isFav = Store.isFavorite(p.id);
  const cart = Store.getCart();
  const cartItem = cart.find(i => (i.productId === p.id || i.id === p.id) && !i.selectedSize && (!i.selectedAddons || i.selectedAddons.length === 0));
  const qty = cartItem ? cartItem.qty : 0;
  const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);
  const isAboveFold = index < 6;
  const existingCard = elements.productsContainer ? elements.productsContainer.querySelector(`.food-item-card[data-product-id="${p.id}"]`) : null;
  const existingImg = existingCard ? existingCard.querySelector('.food-item-img') : null;
  const fallbackImg = 'assets/portfolio/order_restaurant_showcase.jpg';
  const prodImg = (p.image && p.image.trim() && p.image !== 'null') ? p.image : fallbackImg;
  const isAlreadyLoaded = existingImg && (existingImg.classList.contains('loaded') || existingImg.complete) && existingImg.getAttribute('src') === prodImg;

  return `
    <div class="food-item-card" data-product-id="${p.id}" data-rendered-qty="${qty}" data-rendered-fav="${isFav ? '1' : '0'}" onclick="handleCardClick(event, '${p.id}')">
      <div class="food-item-media">
        <img src="${prodImg}" class="food-item-img ${isAlreadyLoaded ? 'loaded' : ''}" alt="" ${isAboveFold ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" onload="this.classList.add('loaded')" onerror="this.onerror=null; this.src='${fallbackImg}'; this.classList.add('loaded');">
        <div class="card-top-actions">
          ${p.badge ? `<span class="card-badge">${p.badge}</span>` : '<span></span>'}
          <button class="btn-fav-toggle ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); handleToggleFav('${p.id}')" title="إضافة للمفضلة">
            <svg class="icon" viewBox="0 0 24 24" style="fill: ${isFav ? 'currentColor' : 'none'};"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>
      </div>

      <div class="food-item-body">
        <div class="item-meta-tags">
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="item-prep-time">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${p.prepTime || '15 دقيقة'}</span>
            </span>
            <span style="font-size:11.5px; color:var(--text-muted);">• ${p.category}</span>
          </div>
          <button class="btn-fav-inline ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); handleToggleFav('${p.id}')" title="إضافة للمفضلة">
            <svg class="icon icon-sm" viewBox="0 0 24 24" style="fill: ${isFav ? 'currentColor' : 'none'};"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>

        <h3 class="food-item-title">${p.name}</h3>
        <p class="food-item-desc">${p.desc || p.description || ''}</p>

        <div class="food-item-footer">
          <div class="food-item-price font-num">
            ${p.originalPrice && p.originalPrice > p.price ? `<span class="price-crossed">${p.originalPrice} ${currency}</span>` : ''}
            ${p.price} <span>${currency}</span>
          </div>
          <div>
            ${hasOptions ? `
              <button class="btn-quick-add" onclick="event.stopPropagation(); openCustomizer('${p.id}')">
                <span>تخصيص +</span>
              </button>
            ` : renderCardActionButton(p, qty)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCardActionButton(product, qty) {
  if (qty > 0) {
    return `
      <div class="qty-stepper">
        <button class="qty-stepper-btn" onclick="event.stopPropagation(); handleUpdateItemQty('${product.id}', -1)" title="تقليل">
          ${qty === 1 ? '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>' : '−'}
        </button>
        <span class="qty-stepper-val font-num">${qty}</span>
        <button class="qty-stepper-btn" onclick="event.stopPropagation(); handleUpdateItemQty('${product.id}', 1)" title="زيادة">+</button>
      </div>
    `;
  } else {
    return `
      <button class="btn-quick-add" onclick="event.stopPropagation(); handleQuickAddItem('${product.id}', this)">
        <svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>إضافة</span>
      </button>
    `;
  }
}

window.handleToggleFav = function(productId) {
  Store.toggleFavorite(productId);
  SoundFX.playPop();
  renderCategories();
  renderProducts(true);
};


function findMatchingCartItem(cart, target) {
  if (!cart || !Array.isArray(cart) || !target) return null;
  const targetPid = target.productId || target.id;
  const targetSizeName = target.selectedSize ? target.selectedSize.name : null;
  const targetAddonNames = (target.selectedAddons || []).map(a => a.name).sort().join(',');
  const targetNotes = (target.notes || '').trim();

  return cart.find(i => {
    const iPid = i.productId || i.id;
    if (iPid !== targetPid) return false;

    const iSizeName = i.selectedSize ? i.selectedSize.name : null;
    if (iSizeName !== targetSizeName) return false;

    const iAddonNames = (i.selectedAddons || []).map(a => a.name).sort().join(',');
    if (iAddonNames !== targetAddonNames) return false;

    const iNotes = (i.notes || '').trim();
    if (iNotes !== targetNotes) return false;

    return true;
  });
}

window.handleQuickAddItem = function(productId, triggerElement) {
  if (checkOrderingPaused()) return;

  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);
  if (hasOptions) {
    openCustomizer(productId);
    return;
  }

  const cart = Store.getCart();
  const dummyQuery = {
    productId: p.id,
    selectedSize: null,
    selectedAddons: [],
    notes: ''
  };
  const existing = findMatchingCartItem(cart, dummyQuery);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: 'c_' + p.id + '_' + Date.now(),
      productId: p.id,
      name: p.name,
      basePrice: p.price,
      price: p.price,
      image: p.image,
      category: p.category,
      selectedSize: null,
      selectedAddons: [],
      notes: '',
      qty: 1
    });
  }
  Store.saveCart(cart);
  SoundFX.playPop();

  if (triggerElement) {
    animateFlyToCart(triggerElement, p.image);
  }

  updateLedgerUI();
  renderProducts();
};

window.handleUpdateItemQty = function(cartItemId, change) {
  if (change > 0 && checkOrderingPaused()) return;

  let cart = Store.getCart();
  // 1. Exact match by unique cart item id (e.g. from cart drawer)
  let existing = cart.find(i => i.id === cartItemId);

  // 2. If not found by unique id, match standard/base item by product id (e.g. from product card stepper)
  if (!existing) {
    existing = cart.find(i => (i.productId === cartItemId || i.id === cartItemId) && !i.selectedSize && (!i.selectedAddons || i.selectedAddons.length === 0));
  }

  // 3. Fallback to any item with that productId
  if (!existing) {
    existing = cart.find(i => i.productId === cartItemId || i.id === cartItemId);
  }

  if (!existing) return;

  existing.qty += change;
  if (existing.qty <= 0) {
    cart = cart.filter(i => i.id !== existing.id);
  }
  Store.saveCart(cart);
  SoundFX.playPop();
  updateLedgerUI();
  renderProducts();

  if (currentPreviewProductId === cartItemId || (existing && currentPreviewProductId === existing.productId)) {
    updatePreviewModalActions(existing ? existing.productId : cartItemId);
  }
};

window.openQuickPreview = function(productId) {
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  currentPreviewProductId = productId;
  const s = Store.getSettings();
  const currency = s.currency || "ج.م";

  if (elements.previewImg) elements.previewImg.src = p.image;
  if (elements.previewBadge) {
    elements.previewBadge.textContent = p.badge || 'مميز';
    elements.previewBadge.style.display = p.badge ? 'inline-block' : 'none';
  }
  if (elements.previewTitle) elements.previewTitle.textContent = p.name;
  if (elements.previewCategory) elements.previewCategory.textContent = p.category;
  if (elements.previewPrepTime) elements.previewPrepTime.textContent = p.prepTime || '15 دقيقة';
  if (elements.previewPrice) {
    elements.previewPrice.innerHTML = `
      ${p.originalPrice && p.originalPrice > p.price ? `<span class="price-crossed" style="font-size:13px;">${p.originalPrice} ${currency}</span>` : ''}
      ${p.price} <span>${currency}</span>
    `;
  }
  if (elements.previewDesc) elements.previewDesc.textContent = p.desc;

  updatePreviewModalActions(productId);

  if (elements.previewModal) elements.previewModal.classList.add('open');
  if (elements.previewModalBackdrop) elements.previewModalBackdrop.classList.add('open');
  pushNavState('preview', { productId });
  SoundFX.playPop();
};

function updatePreviewModalActions(productId) {
  if (!elements.previewActionWrap) return;
  const prods = Store.getProducts();
  const p = prods.find(item => item.id === productId);
  if (!p) return;

  const hasOptions = (p.sizes && p.sizes.length > 0) || (p.addons && p.addons.length > 0);
  if (hasOptions) {
    elements.previewActionWrap.innerHTML = `
      <button class="btn btn-primary" onclick="closeQuickPreview(); openCustomizer('${p.id}');" style="padding:8px 20px;">
        <span>تخصيص وإضافة +</span>
      </button>
    `;
    return;
  }

  const cart = Store.getCart();
  const cartItem = cart.find(i => i.productId === productId || i.id === productId);
  const qty = cartItem ? cartItem.qty : 0;

  elements.previewActionWrap.innerHTML = renderCardActionButton(p, qty);
}

function closeQuickPreview(triggerHistoryBack = true) {
  currentPreviewProductId = null;
  if (elements.previewModal) elements.previewModal.classList.remove('open');
  if (elements.previewModalBackdrop) elements.previewModalBackdrop.classList.remove('open');
  if (triggerHistoryBack && window.history.state && window.history.state.harpyNav === 'preview') {
    try { history.back(); } catch(e) {}
  }
}

function renderSkeletonCards(count = 6) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="food-item-card skeleton-card">
        <div class="food-item-media skeleton-shimmer" style="height:150px; border-radius:14px 14px 0 0;"></div>
        <div class="food-item-body" style="padding:14px;">
          <div class="skeleton-line skeleton-shimmer" style="width:75%; height:15px;"></div>
          <div class="skeleton-line skeleton-shimmer" style="width:45%; height:11px; margin-bottom:12px;"></div>
          <div class="food-item-footer" style="margin-top:auto; display:flex; justify-content:space-between; align-items:center;">
            <div class="skeleton-line skeleton-shimmer" style="width:55px; height:20px; margin-bottom:0;"></div>
            <div class="skeleton-btn skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    `;
  }
  return html;
}

window.renderSkeletonCards = renderSkeletonCards;
window.renderCategories = renderCategories;
window.renderDiscoveryRibbon = renderDiscoveryRibbon;
window.renderProducts = renderProducts;
window.scheduleRenderProducts = scheduleRenderProducts;
window.updateCategoryPillsActiveState = updateCategoryPillsActiveState;
window.scrollPillToCenter = scrollPillToCenter;
window.renderHeroShowcase = renderHeroShowcase;
window.renderProductCard = renderProductCard;
window.renderCardActionButton = renderCardActionButton;
window.findMatchingCartItem = findMatchingCartItem;
window.updatePreviewModalActions = updatePreviewModalActions;
window.closeQuickPreview = closeQuickPreview;
