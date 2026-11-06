// ═══════════════════════════════════════════════════════════
// HarpyOrder — Stories Highlights & Fullscreen Viewer Engine
// ═══════════════════════════════════════════════════════════

// Stories state
let currentStoryIndex = 0;
let storyProgress = 0;
let storyInterval = null;
let isStoryPaused = false;

// ── Stories Highlights Engine ──────────────────────────────
function renderStories() {
  if (!elements.storiesTrack) return;
  const settings = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};
  const isStoriesDisabled = (settings && settings.modules && settings.modules.stories === false) ||
                            (window.ModuleEnforcer && window.ModuleEnforcer.modules && window.ModuleEnforcer.modules.stories === false);
  if (isStoriesDisabled) {
    if (elements.storiesSection) {
      elements.storiesSection.style.setProperty('display', 'none', 'important');
      elements.storiesSection.innerHTML = '';
    }
    return;
  }
  const stories = Store.getStories();
  if (!stories || stories.length === 0) {
    if (elements.storiesSection) elements.storiesSection.style.display = 'none';
    return;
  }
  if (elements.storiesSection) elements.storiesSection.style.display = 'block';

  elements.storiesTrack.innerHTML = stories.map((s, idx) => `
    <div class="story-circle-item" onclick="openStoryViewer(${idx})">
      <div class="story-ring-wrap">
        <img src="${s.image}" alt="" class="story-avatar-img" loading="lazy" onerror="this.onerror=null; this.src='assets/portfolio/order_restaurant_showcase.jpg';">
      </div>
      <span class="story-circle-label">${s.title}</span>
    </div>
  `).join('');
}

window.openStoryViewer = function(index) {
  const stories = Store.getStories();
  if (!stories || stories.length === 0) return;
  
  currentStoryIndex = Math.max(0, Math.min(index, stories.length - 1));
  const settings = Store.getSettings();

  if (elements.storyHeaderLogo) elements.storyHeaderLogo.src = settings.logo || stories[0].image;
  if (elements.storyModalBackdrop) elements.storyModalBackdrop.classList.add('active');
  if (elements.storyViewerModal) elements.storyViewerModal.classList.add('active');

  pushNavState('story', { index: currentStoryIndex });
  loadCurrentStory();
};

function loadCurrentStory() {
  const stories = Store.getStories();
  const s = stories[currentStoryIndex];
  if (!s) return;

  const prods = (typeof Store !== 'undefined' && Store.getProducts) ? Store.getProducts() : [];
  const linkedProd = s.productId ? prods.find(p => p.id === s.productId) : null;
  const settings = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};
  const currency = (typeof window.getCurrency === 'function') ? window.getCurrency(settings.currency) : (settings.currency || "ج.م");

  // Determine effective price: story custom price -> linked product price -> regex parse from text
  let effectivePrice = (s.price !== undefined && s.price !== null && s.price !== '') ? parseFloat(s.price) : 0;
  if (!effectivePrice && linkedProd) {
    effectivePrice = parseFloat(linkedProd.price) || 0;
  }
  if (!effectivePrice) {
    const textToSearch = (s.desc || '') + ' ' + (s.tagline || '') + ' ' + (s.headline || '');
    const priceMatch = textToSearch.match(/(\d+(?:\.\d+)?)\s*(?:ج\.م|جنيه)/);
    if (priceMatch) {
      effectivePrice = parseFloat(priceMatch[1]);
    }
  }

  if (elements.storyViewerTitle) elements.storyViewerTitle.textContent = s.title;
  if (elements.storyViewerTime) elements.storyViewerTime.textContent = s.tagline || 'عرض مميز';
  if (elements.storyViewerImg) elements.storyViewerImg.src = s.image;
  if (elements.storyViewerBadge) elements.storyViewerBadge.textContent = s.badge || 'حصري';
  if (elements.storyViewerHeadline) elements.storyViewerHeadline.textContent = s.headline || s.title;
  if (elements.storyViewerDesc) elements.storyViewerDesc.textContent = s.desc || s.tagline || '';

  if (elements.storyProgressWrap) {
    elements.storyProgressWrap.innerHTML = stories.map((_, idx) => `
      <div class="story-bar-segment">
        <div class="story-bar-fill ${idx < currentStoryIndex ? 'finished' : ''}" id="story-fill-${idx}"></div>
      </div>
    `).join('');
  }

  // Dynamic CTA button label with price
  const ctaLabel = elements.storyCtaLabel || document.getElementById('story-cta-label');
  if (ctaLabel) {
    const baseAction = (s.ctaText && typeof Store !== 'undefined' && Store.stripEmojiNoise) ? Store.stripEmojiNoise(s.ctaText) : 'اطلب هذا العرض الآن';
    if (effectivePrice > 0) {
      ctaLabel.textContent = `${baseAction} • ${effectivePrice} ${currency}`;
    } else {
      ctaLabel.textContent = baseAction;
    }
  }

  if (elements.btnStoryCta) {
    elements.btnStoryCta.onclick = (e) => {
      if (e) e.stopPropagation();

      // Case 1: Linked product exists in active menu catalog
      if (linkedProd) {
        const hasOptions = (linkedProd.sizes && linkedProd.sizes.length > 0) || (linkedProd.addons && linkedProd.addons.length > 0);
        closeStoryViewer(false);
        if (hasOptions && typeof window.openCustomizer === 'function') {
          window.openCustomizer(linkedProd.id);
        } else if (typeof window.handleQuickAddItem === 'function') {
          window.handleQuickAddItem(linkedProd.id);
          if (typeof window.openCartDrawer === 'function') window.openCartDrawer();
        }
        return;
      }

      // Case 2: Exclusive story offer (not in catalog, or custom story deal)
      if (effectivePrice > 0 || (s.title && s.title.trim())) {
        const rawId = s.id || ('st_' + Date.now());
        const dealId = 'story_offer_' + String(rawId).replace(/[^a-zA-Z0-9_-]/g, '');
        const cleanTitle = (typeof Store !== 'undefined' && Store.stripEmojiNoise) ? Store.stripEmojiNoise(s.title || 'عرض خاص') : (s.title || 'عرض خاص');
        const cleanTagline = (typeof Store !== 'undefined' && Store.stripEmojiNoise) ? Store.stripEmojiNoise(s.tagline || s.headline || '') : (s.tagline || s.headline || '');
        const cleanDesc = (typeof Store !== 'undefined' && Store.stripEmojiNoise) ? Store.stripEmojiNoise(s.desc || '') : (s.desc || '');

        const dealItem = {
          id: dealId,
          productId: dealId,
          name: cleanTitle,
          price: effectivePrice,
          originalPrice: effectivePrice > 0 ? Math.round(effectivePrice * 1.15) : 0,
          qty: 1,
          quantity: 1,
          image: s.image || '',
          notes: cleanTagline ? (cleanTagline + (cleanDesc ? ' — ' + cleanDesc : '')) : cleanDesc,
          category: 'عروض الستوري الحصرية',
          selectedSize: null,
          selectedAddons: [],
          isStoryOffer: true
        };

        let cart = (typeof Store !== 'undefined' && Store.getCart) ? Store.getCart() : [];
        const existing = cart.find(i => i.id === dealItem.id || i.productId === dealItem.id);
        if (existing) {
          existing.qty = (existing.qty || 1) + 1;
          existing.quantity = existing.qty;
        } else {
          cart.push(dealItem);
        }
        if (typeof Store !== 'undefined' && Store.saveCart) Store.saveCart(cart);
        if (typeof window.updateLedgerUI === 'function') window.updateLedgerUI();
        if (typeof window.renderCartDrawerItems === 'function') window.renderCartDrawerItems();
        if (typeof window.renderProducts === 'function') window.renderProducts();
        if (window.SoundFX && typeof window.SoundFX.playPop === 'function') window.SoundFX.playPop();

        closeStoryViewer(false);
        if (typeof window.openCartDrawer === 'function') window.openCartDrawer();
        if (typeof window.showToastNotification === 'function') {
          window.showToastNotification(`تمت إضافة ${cleanTitle} إلى السلة بنجاح`, 'success');
        }
        return;
      }

      // Case 3: Informational story without price
      closeStoryViewer();
      if (typeof window.showToastNotification === 'function') {
        window.showToastNotification('تفضل بتصفح قائمة المنيو واختيار وجباتك المفضلة', 'info');
      }
    };
  }

  startStoryTimer();
}

function startStoryTimer() {
  clearInterval(storyInterval);
  storyProgress = 0;
  const currentFill = document.getElementById(`story-fill-${currentStoryIndex}`);
  
  const step = 50;
  const totalDuration = 4500;
  const increment = (step / totalDuration) * 100;

  storyInterval = setInterval(() => {
    if (isStoryPaused) return;
    storyProgress += increment;
    if (currentFill) currentFill.style.width = `${Math.min(100, storyProgress)}%`;

    if (storyProgress >= 100) {
      clearInterval(storyInterval);
      nextStory();
    }
  }, step);
}

function nextStory() {
  const stories = Store.getStories();
  if (currentStoryIndex < stories.length - 1) {
    currentStoryIndex++;
    loadCurrentStory();
  } else {
    closeStoryViewer();
  }
}

function prevStory() {
  if (currentStoryIndex > 0) {
    currentStoryIndex--;
    loadCurrentStory();
  }
}

function closeStoryViewer(triggerHistoryBack = true) {
  clearInterval(storyInterval);
  if (elements.storyModalBackdrop) elements.storyModalBackdrop.classList.remove('active');
  if (elements.storyViewerModal) elements.storyViewerModal.classList.remove('active');
  if (triggerHistoryBack && window.history.state && window.history.state.harpyNav === 'story') {
    try { history.back(); } catch(e) {}
  }
}


window.renderStories = renderStories;
window.loadCurrentStory = loadCurrentStory;
window.startStoryTimer = startStoryTimer;
window.nextStory = nextStory;
window.prevStory = prevStory;
window.closeStoryViewer = closeStoryViewer;
