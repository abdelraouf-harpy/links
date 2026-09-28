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
  SoundFX.playPop();
  loadCurrentStory();
};

function loadCurrentStory() {
  const stories = Store.getStories();
  const s = stories[currentStoryIndex];
  if (!s) return;

  if (elements.storyViewerTitle) elements.storyViewerTitle.textContent = s.title;
  if (elements.storyViewerTime) elements.storyViewerTime.textContent = s.tagline || 'عرض مميز';
  if (elements.storyViewerImg) elements.storyViewerImg.src = s.image;
  if (elements.storyViewerBadge) elements.storyViewerBadge.textContent = s.badge || 'حصري';
  if (elements.storyViewerHeadline) elements.storyViewerHeadline.textContent = s.title;
  if (elements.storyViewerDesc) elements.storyViewerDesc.textContent = s.desc || s.tagline || '';

  if (elements.storyProgressWrap) {
    elements.storyProgressWrap.innerHTML = stories.map((_, idx) => `
      <div class="story-bar-segment">
        <div class="story-bar-fill ${idx < currentStoryIndex ? 'finished' : ''}" id="story-fill-${idx}"></div>
      </div>
    `).join('');
  }

  if (elements.btnStoryCta) {
    elements.btnStoryCta.onclick = () => {
      if (s.productId) {
        handleQuickAddItem(s.productId);
        closeStoryViewer();
        openCartDrawer();
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
