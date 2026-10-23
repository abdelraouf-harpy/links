/**
 * Harpy Order — SaaS Marketing Landing Page Interactive Engine
 * Ultra-fast Vanilla JavaScript with Zero External Dependencies
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // 1. Sticky Header scroll listener
  const header = document.querySelector('.ho-header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 2. Mobile Drawer Navigation System (Opens from Left smoothly)
  const mobileToggle = document.getElementById('hoMobileToggle');
  const drawer = document.getElementById('hoMobileDrawer');
  const backdrop = document.getElementById('hoDrawerBackdrop');
  const drawerClose = document.getElementById('hoDrawerClose');

  function openDrawer() {
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('menu-open');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('menu-open');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (drawer && drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  // Close drawer on link click
  document.querySelectorAll('.ho-drawer-link').forEach(function(link) {
    link.addEventListener('click', closeDrawer);
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // 3. Interactive Product Showcase Tabs & Screenshots
  const tabBtns = document.querySelectorAll('.ho-tab-btn');
  const showcasePanes = document.querySelectorAll('.ho-showcase-pane');
  const themeToggleBtn = document.querySelector('.ho-theme-toggle-btn');
  const themeLabel = document.querySelector('.ho-theme-toggle-label');

  let currentTheme = 'light'; // 'light' | 'dark'

  // Tab Switching
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabBtns.forEach(function(b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      showcasePanes.forEach(function(p) {
        p.classList.remove('active');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetId = btn.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // Light / Dark Mode Screenshot Swapping
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // Update toggle button text and icon
      if (themeLabel) {
        themeLabel.textContent = currentTheme === 'light' ? 'عرض الوضع الداكن' : 'عرض الوضع الفاتح';
      }

      // Swap images in showcase panes
      document.querySelectorAll('.ho-showcase-img').forEach(function(img) {
        const lightSrc = img.getAttribute('data-light');
        const darkSrc = img.getAttribute('data-dark');
        if (currentTheme === 'dark' && darkSrc) {
          img.src = darkSrc;
        } else if (currentTheme === 'light' && lightSrc) {
          img.src = lightSrc;
        }
      });
    });
  }

  // 4. Smooth Anchor Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 70;
        const targetPos = targetElem.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
});
