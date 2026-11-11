/**
 * Harpy Order — SaaS Marketing Landing Page Interactive Engine (v7.0)
 * Vanilla JS — Zero External Dependencies
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // 1. Sticky Header scroll state
  const header = document.querySelector('.ho-header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 18);
    }, { passive: true });
  }

  // 2. Mobile Drawer Navigation
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
      if (drawer && drawer.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
  }

  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.querySelectorAll('.ho-drawer-link').forEach(function(link) {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // 3. Interactive Product Showcase Tabs & Light/Dark Toggle
  const tabBtns = document.querySelectorAll('.ho-tab-btn');
  const showcasePanes = document.querySelectorAll('.ho-showcase-pane');
  const themeToggleBtn = document.querySelector('.ho-theme-toggle-btn');
  const themeLabel = document.querySelector('.ho-theme-toggle-label');
  let currentTheme = 'light';

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
      if (targetPane) targetPane.classList.add('active');
    });
  });

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      if (themeLabel) {
        themeLabel.textContent = currentTheme === 'light' ? 'عرض الوضع الداكن' : 'عرض الوضع الفاتح';
      }
      document.querySelectorAll('.ho-showcase-img').forEach(function(img) {
        const lightSrc = img.getAttribute('data-light');
        const darkSrc = img.getAttribute('data-dark');
        if (currentTheme === 'dark' && darkSrc) img.src = darkSrc;
        else if (currentTheme === 'light' && lightSrc) img.src = lightSrc;
      });
    });
  }

  // 4. Interactive Modular Add-Ons Billing Period Switcher
  const addonPills = document.querySelectorAll('.ho-addon-pill');
  const bundlePriceEl = document.getElementById('hoBundlePrice');
  const bundlePeriodEl = document.getElementById('hoBundlePeriod');
  const bundleCtaEl = document.getElementById('hoBundleCta');

  const bundleRates = {
    monthly: {
      price: '+399 ج.م',
      period: 'شهرياً (بدلاً من 792 ج.م منفردة)',
      msg: 'أهلاً بك، أرغب في الاستفسار عن حزمة الإضافات الشاملة (399 ج.م / شهر).'
    },
    '6m': {
      price: '+1,950 ج.م',
      period: 'كل 6 شهور (بدلاً من 4,000 ج.م منفردة)',
      msg: 'أهلاً بك، أرغب في الاستفسار عن حزمة الإضافات الشاملة لمدة 6 شهور (1,950 ج.م).'
    },
    yearly: {
      price: '+3,500 ج.م',
      period: 'سنوياً (بدلاً من 6,850 ج.م منفردة)',
      msg: 'أهلاً بك، أرغب في الاستفسار عن حزمة الإضافات الشاملة السنوية (3,500 ج.م / سنة).'
    },
    lifetime: {
      price: '+6,500 ج.م',
      period: 'دفعة واحدة مدى الحياة (بدلاً من 12,900 ج.م)',
      msg: 'أهلاً بك، أرغب في الاستفسار عن حزمة الإضافات الشاملة مدى الحياة (6,500 ج.م).'
    }
  };

  function setAddonPeriod(period) {
    addonPills.forEach(function(pill) {
      const isActive = pill.getAttribute('data-period') === period;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('.ho-addons-table [data-period]').forEach(function(cell) {
      cell.classList.toggle('is-selected-col', cell.getAttribute('data-period') === period);
    });

    const bundle = bundleRates[period] || bundleRates.yearly;
    if (bundlePriceEl) bundlePriceEl.textContent = bundle.price;
    if (bundlePeriodEl) bundlePeriodEl.textContent = bundle.period;
    if (bundleCtaEl) {
      bundleCtaEl.href = 'https://wa.me/201113453475?text=' + encodeURIComponent(bundle.msg);
    }
  }

  addonPills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      const period = pill.getAttribute('data-period');
      if (period) setAddonPeriod(period);
    });
  });

  // 5. Smooth Anchor Scrolling with sticky header offset
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 64;
        const targetPos = targetElem.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
        window.scrollTo({
          top: Math.max(0, targetPos),
          behavior: 'smooth'
        });
      }
    });
  });
});
