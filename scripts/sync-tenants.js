/**
 * Harpy Order — Dynamic Tenant Social Preview & Routing Generator
 * Generates static entrypoints and Open Graph cards for all tenants.
 * Ensures 100% WhatsApp, Facebook, iMessage, and Twitter card preview compatibility.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_RTDB = 'https://harpy-order-default-rtdb.firebaseio.com';

// Built-in registry of known tenants with fallback branding
const KNOWN_TENANTS = {
  'king': {
    slug: 'king',
    name: 'مطعم كينج',
    tagline: 'أشهى المشويات، البرجر الفاخر، والبيتزا الإيطالية على أصولها في سوهاج',
    logo: 'https://res.cloudinary.com/pq2pimug/image/upload/v1794005707/fekgebaclepbe4hmt4ga.jpg',
    cover: 'https://res.cloudinary.com/pq2pimug/image/upload/v1794005719/akjpktm1dibqxpjovjxd.jpg',
    themeColor: '#ea580c'
  },
  'saj': {
    slug: 'saj',
    name: 'مطعم صــاج',
    tagline: 'أصل البيتزا والكريبات والحواوشي والسوري في سوهاج الجديدة',
    logo: 'https://iili.io/n3HVHX4.jpg',
    cover: 'https://iili.io/n3HVHX4.jpg',
    themeColor: '#c2410c'
  },
  'aloo': {
    slug: 'aloo',
    name: 'Aloo Burger',
    tagline: 'أشهى ساندوتشات البرجر والوجبات السريعة على أصولها',
    logo: 'https://res.cloudinary.com/pq2pimug/image/upload/v1793879648/ycssznrc2i1rf8abpyu2.jpg',
    cover: '',
    themeColor: '#ea580c'
  },
  'bazzes': {
    slug: 'bazzes',
    name: 'مطعم بازيز',
    tagline: 'قائمة طعام مطعم بازيز — أشهى الأطباق والوجبات السريعة أونلاين عبر واتساب',
    logo: 'https://harpymenu.com/assets/icons/order-icon-512.png',
    cover: '',
    themeColor: '#FF6A00'
  },
  'sasa': {
    slug: 'sasa',
    name: 'مطعم ساسا',
    tagline: 'قائمة طعام مطعم ساسا — أشهى الوجبات والمأكولات أونلاين عبر واتساب',
    logo: 'https://harpymenu.com/assets/icons/order-icon-512.png',
    cover: '',
    themeColor: '#FF6A00'
  }
};

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function generateMenuHtml(tenant) {
  const storeName = tenant.name || tenant.storeName || tenant.slug;
  const desc = tenant.tagline || tenant.description || `تصفح قائمة طعام ${storeName} وأشهى الوجبات واطلب أونلاين مباشرة عبر واتساب مع خدمة التوصيل والاستلام.`;
  const img = (tenant.logo && tenant.logo.startsWith('http')) ? tenant.logo : (tenant.cover && tenant.cover.startsWith('http') ? tenant.cover : 'https://harpymenu.com/assets/brand/og_banner.png');
  const theme = tenant.themeColor || '#ea580c';
  const slug = tenant.slug;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>منيو ${storeName} — قائمة الطعام والطلبات</title>
  
  <meta name="description" content="${desc}">
  
  <!-- Open Graph / WhatsApp / Facebook / Telegram Social Preview -->
  <meta property="og:type" content="restaurant.menu">
  <meta property="og:site_name" content="${storeName}">
  <meta property="og:title" content="منيو ${storeName} — قائمة الطعام والطلبات">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://harpymenu.com/${encodeURIComponent(slug)}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="منيو ${storeName} — قائمة الطعام والطلبات">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${img}">

  <link rel="icon" href="${img}">
  <link rel="apple-touch-icon" href="${img}">
  <link rel="manifest" href="/manifest-${slug}.json?v=182.0">
  <meta name="theme-color" content="${theme}">

  <!-- Instant Browser Redirect to Interactive Menu App -->
  <meta http-equiv="refresh" content="0; url=/order/?m=${encodeURIComponent(slug)}">
  <script>
    (function() {
      try {
        var s = window.location.search || '';
        var h = window.location.hash || '';
        var p = new URLSearchParams(s);
        p.set('m', '${slug}');
        window.location.replace('/order/?' + p.toString() + h);
      } catch(e) {
        window.location.replace('/order/?m=${encodeURIComponent(slug)}');
      }
    })();
  </script>
</head>
<body style="background:#070B13; color:#FAFAFA; font-family:'Cairo',system-ui,sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; text-align:center;">
  <div style="width:44px; height:44px; border:3px solid rgba(234,88,12,0.2); border-top-color:#ea580c; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:16px;"></div>
  <p style="font-weight:700; font-size:15px; margin:0 0 10px 0;">جاري فتح قائمة طعام ${storeName}...</p>
  <a href="/order/?m=${encodeURIComponent(slug)}" style="color:#ea580c; font-size:13px; text-decoration:none; font-weight:600;">اضغط هنا إذا لم يتم التحويل تلقائياً</a>
  <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
</body>
</html>
`;
}

function generateAdminHtml(tenant) {
  const storeName = tenant.name || tenant.storeName || tenant.slug;
  const desc = `لوحة التحكم السحابية لإدارة طلبات ${storeName} المباشرة، قوائم الطعام، المطبخ وإحصائيات المبيعات.`;
  const img = (tenant.logo && tenant.logo.startsWith('http')) ? tenant.logo : (tenant.cover && tenant.cover.startsWith('http') ? tenant.cover : 'https://harpymenu.com/assets/brand/og_banner.png');
  const theme = tenant.themeColor || '#ea580c';
  const slug = tenant.slug;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>لوحة إدارة ${storeName} — Harpy Admin</title>
  
  <meta name="description" content="${desc}">
  
  <!-- Open Graph / WhatsApp / Facebook / Telegram Social Preview -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Harpy Order Admin">
  <meta property="og:title" content="لوحة إدارة ${storeName} — Harpy Admin">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://harpymenu.com/admin/${encodeURIComponent(slug)}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="لوحة إدارة ${storeName} — Harpy Admin">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${img}">

  <link rel="icon" href="${img}">
  <link rel="apple-touch-icon" href="${img}">
  <link rel="manifest" href="/admin-manifest-${slug}.json?v=182.0">
  <meta name="theme-color" content="${theme}">

  <!-- Instant Browser Redirect to Full Admin App -->
  <meta http-equiv="refresh" content="0; url=/admin/?m=${encodeURIComponent(slug)}">
  <script>
    (function() {
      try {
        var s = window.location.search || '';
        var h = window.location.hash || '';
        var p = new URLSearchParams(s);
        p.set('m', '${slug}');
        window.location.replace('/admin/?' + p.toString() + h);
      } catch(e) {
        window.location.replace('/admin/?m=${encodeURIComponent(slug)}');
      }
    })();
  </script>
</head>
<body style="background:#070B13; color:#FAFAFA; font-family:'Cairo',system-ui,sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; text-align:center;">
  <div style="width:44px; height:44px; border:3px solid rgba(234,88,12,0.2); border-top-color:#ea580c; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:16px;"></div>
  <p style="font-weight:700; font-size:15px; margin:0 0 10px 0;">جاري فتح لوحة إدارة ${storeName}...</p>
  <a href="/admin/?m=${encodeURIComponent(slug)}" style="color:#ea580c; font-size:13px; text-decoration:none; font-weight:600;">اضغط هنا إذا لم يتم التحويل تلقائياً</a>
  <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
</body>
</html>
`;
}

function generateMenuManifest(tenant) {
  const storeName = tenant.name || tenant.storeName || tenant.slug;
  const slug = tenant.slug;
  const icon = (tenant.logo && tenant.logo.startsWith('http')) ? tenant.logo : '/assets/icons/order-icon-512.png';
  return JSON.stringify({
    id: `/order/?m=${slug}`,
    name: `${storeName} | قائمة الطعام`,
    short_name: storeName,
    description: `قائمة طعام ${storeName} والطلب الإلكتروني المباشر`,
    start_url: `./order/?m=${slug}`,
    scope: `./order/`,
    display: 'standalone',
    background_color: '#070B13',
    theme_color: tenant.themeColor || '#ea580c',
    orientation: 'portrait',
    icons: [
      { src: icon, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icon, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icon, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2);
}

function generateAdminManifest(tenant) {
  const storeName = tenant.name || tenant.storeName || tenant.slug;
  const slug = tenant.slug;
  const icon = (tenant.logo && tenant.logo.startsWith('http')) ? tenant.logo : '/assets/icons/admin-icon-512.png';
  return JSON.stringify({
    id: `/admin/?m=${slug}`,
    name: `${storeName} | لوحة الإدارة`,
    short_name: `إدارة ${storeName}`,
    description: `لوحة إدارة ${storeName} وتجهيز الطلبات`,
    start_url: `./admin/?m=${slug}`,
    scope: `./admin/`,
    display: 'standalone',
    background_color: '#070B13',
    theme_color: tenant.themeColor || '#ea580c',
    orientation: 'portrait',
    icons: [
      { src: icon, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icon, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icon, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2);
}

async function syncAllTenants() {
  console.log('[SyncTenants] Starting tenant social preview sync...');
  const tenants = { ...KNOWN_TENANTS };

  // Attempt to fetch live settings for each known tenant from Firebase RTDB
  for (const slug of Object.keys(tenants)) {
    try {
      const liveSettings = await fetchJson(`${BASE_RTDB}/restaurants/${slug}/settings.json`);
      if (liveSettings && (liveSettings.storeName || liveSettings.name)) {
        tenants[slug].name = (liveSettings.storeName || liveSettings.name).split('|')[0].trim();
        if (liveSettings.logo && liveSettings.logo.startsWith('http')) {
          tenants[slug].logo = liveSettings.logo;
        }
        if (liveSettings.cover && liveSettings.cover.startsWith('http')) {
          tenants[slug].cover = liveSettings.cover;
        }
        if (liveSettings.storeTagline || liveSettings.description) {
          tenants[slug].tagline = liveSettings.storeTagline || liveSettings.description;
        }
      }
    } catch(e) {
      console.warn(`[SyncTenants] Could not fetch live settings for ${slug}, using fallback.`);
    }
  }

  // Generate files for each tenant
  for (const [slug, tenant] of Object.entries(tenants)) {
    console.log(`[SyncTenants] Generating entrypoints for: ${slug} (${tenant.name})`);

    // 1. Menu entrypoint: /{slug}/index.html & {slug}.html
    const menuDir = path.join(ROOT_DIR, slug);
    if (!fs.existsSync(menuDir)) fs.mkdirSync(menuDir, { recursive: true });
    const menuHtml = generateMenuHtml(tenant);
    fs.writeFileSync(path.join(menuDir, 'index.html'), menuHtml, 'utf8');
    fs.writeFileSync(path.join(ROOT_DIR, `${slug}.html`), menuHtml, 'utf8');

    // 2. Admin entrypoint: /admin/{slug}/index.html & {slug}-admin.html
    const adminDir = path.join(ROOT_DIR, 'admin', slug);
    if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir, { recursive: true });
    const adminHtml = generateAdminHtml(tenant);
    fs.writeFileSync(path.join(adminDir, 'index.html'), adminHtml, 'utf8');
    fs.writeFileSync(path.join(ROOT_DIR, `${slug}-admin.html`), adminHtml, 'utf8');

    // 3. Manifests: manifest-{slug}.json & admin-manifest-{slug}.json
    fs.writeFileSync(path.join(ROOT_DIR, `manifest-${slug}.json`), generateMenuManifest(tenant), 'utf8');
    fs.writeFileSync(path.join(ROOT_DIR, `admin-manifest-${slug}.json`), generateAdminManifest(tenant), 'utf8');
  }

  // Export JSON registry for client-side embedding
  const registryPath = path.join(ROOT_DIR, 'js', 'tenant-registry.json');
  fs.writeFileSync(registryPath, JSON.stringify(tenants, null, 2), 'utf8');
  console.log(`[SyncTenants] Successfully generated static entrypoints and manifests for ${Object.keys(tenants).length} tenants.`);
}

syncAllTenants().catch(err => {
  console.error('[SyncTenants] Error syncing tenants:', err);
  process.exit(1);
});
