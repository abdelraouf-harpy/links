#!/usr/bin/env node
/**
 * Harpy Order — Dynamic Multi-Tenant Sync & Orphan Pruner
 * Synchronizes static tenant entrypoints, social OG previews, manifests,
 * tenant-registry.json, 404.html registry, and firebase.json redirects with Firebase RTDB.
 * Removes any deleted/orphan restaurant folders, manifests, or redirects completely.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const RTDB_BASE = 'https://harpy-order-default-rtdb.firebaseio.com';
const MASTER_KEY = (process.env.FIREBASE_MASTER_KEY || '').trim();
const ASSET_VERSION = '198.0';

const RESERVED_SLUGS = new Set([
  'admin', 'order', 'menu', 'cards', 'assets', 'js', 'css', 'scripts',
  'docs', 'backups', 'scratch', 'master', 'portfolio', 'products',
  'index', '404', 'api', 'demo', 'onesignalsdkworker', '.git', '.github', 'node_modules'
]);

function normalizeSlug(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeAbsoluteUrl(url, fallback) {
  const raw = String(url || '').trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) return raw;
  return 'https://harpymenu.com/' + raw.replace(/^\/+/, '');
}

async function fetchJson(urlPath) {
  const sep = urlPath.includes('?') ? '&' : '?';
  const authSuffix = MASTER_KEY ? `${sep}auth=${encodeURIComponent(MASTER_KEY)}` : '';
  const url = `${RTDB_BASE}/${urlPath.replace(/^\/+/, '')}${authSuffix}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = res.ok ? await res.json().catch(() => null) : null;
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err };
  }
}

function discoverCandidateSlugs() {
  const candidates = new Set();

  // 1. From existing js/tenant-registry.json
  const registryPath = path.join(ROOT_DIR, 'js', 'tenant-registry.json');
  if (fs.existsSync(registryPath)) {
    try {
      const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      Object.keys(reg || {}).forEach(k => {
        const s = normalizeSlug(k);
        if (s && !RESERVED_SLUGS.has(s)) candidates.add(s);
      });
    } catch (e) {}
  }

  // 2. From root directories ({slug}/index.html) and legacy root files
  const rootEntries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  for (const ent of rootEntries) {
    const name = ent.name;
    if (ent.isDirectory()) {
      const s = normalizeSlug(name);
      if (s && !RESERVED_SLUGS.has(s) && fs.existsSync(path.join(ROOT_DIR, name, 'index.html'))) {
        candidates.add(s);
      }
    } else if (ent.isFile()) {
      let m;
      if ((m = name.match(/^([a-z0-9_-]+)-admin\.html$/i))) {
        const s = normalizeSlug(m[1]);
        if (s && !RESERVED_SLUGS.has(s)) candidates.add(s);
      } else if ((m = name.match(/^([a-z0-9_-]+)\.html$/i))) {
        const s = normalizeSlug(m[1]);
        if (s && !RESERVED_SLUGS.has(s)) candidates.add(s);
      } else if ((m = name.match(/^admin-manifest-([a-z0-9_-]+)\.json$/i))) {
        const s = normalizeSlug(m[1]);
        if (s && !RESERVED_SLUGS.has(s)) candidates.add(s);
      } else if ((m = name.match(/^manifest-([a-z0-9_-]+)\.json$/i))) {
        const s = normalizeSlug(m[1]);
        if (s && !RESERVED_SLUGS.has(s)) candidates.add(s);
      }
    }
  }

  // 3. From admin/{slug}/, order/, menu/
  const adminDir = path.join(ROOT_DIR, 'admin');
  if (fs.existsSync(adminDir)) {
    for (const ent of fs.readdirSync(adminDir, { withFileTypes: true })) {
      if (ent.isDirectory()) {
        const s = normalizeSlug(ent.name);
        if (s && !RESERVED_SLUGS.has(s)) candidates.add(s);
      } else if (ent.isFile()) {
        const m = ent.name.match(/^admin-manifest-([a-z0-9_-]+)\.json$/i);
        if (m) {
          const s = normalizeSlug(m[1]);
          if (s && !RESERVED_SLUGS.has(s)) candidates.add(s);
        }
      }
    }
  }

  for (const sub of ['order', 'menu']) {
    const subDir = path.join(ROOT_DIR, sub);
    if (fs.existsSync(subDir)) {
      for (const ent of fs.readdirSync(subDir, { withFileTypes: true })) {
        if (ent.isFile()) {
          const m = ent.name.match(/^manifest-([a-z0-9_-]+)\.json$/i);
          if (m) {
            const s = normalizeSlug(m[1]);
            if (s && !RESERVED_SLUGS.has(s)) candidates.add(s);
          }
        }
      }
    }
  }

  // 4. Hints from HINT_SLUG env and CLI args
  const hintRaw = [process.env.HINT_SLUG || '', ...process.argv.slice(2)].join(',');
  hintRaw.split(/[\s,]+/).forEach(tok => {
    const s = normalizeSlug(tok);
    if (s && !RESERVED_SLUGS.has(s)) candidates.add(s);
  });

  return Array.from(candidates);
}

function buildManifest(slug, name, logoUrl, isAdmin) {
  return {
    id: isAdmin ? `/admin/?m=${slug}` : `/order/?m=${slug}`,
    name: isAdmin ? `${name} | لوحة الإدارة` : `${name} | قائمة الطعام`,
    short_name: isAdmin ? `إدارة ${name}` : name,
    description: isAdmin ? `لوحة إدارة ${name} وتجهيز الطلبات` : `قائمة طعام ${name} والطلب الإلكتروني المباشر`,
    start_url: isAdmin ? `./admin/?m=${slug}` : `./order/?m=${slug}`,
    scope: isAdmin ? './admin/' : './order/',
    display: 'standalone',
    background_color: '#070B13',
    theme_color: '#ea580c',
    orientation: 'portrait',
    icons: [
      { src: logoUrl, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: logoUrl, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: logoUrl, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
}

function buildMenuEntryHtml(slug, name, desc, logoUrl, themeColor, manifestHref) {
  const safeName = escapeHtml(name);
  const safeDesc = escapeHtml(desc);
  const safeLogo = escapeHtml(logoUrl);
  const title = `منيو ${safeName} — قائمة الطعام والطلبات`;
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${title}</title>

  <meta name="description" content="${safeDesc}">

  <!-- Open Graph / WhatsApp / Facebook / Telegram Social Preview -->
  <meta property="og:type" content="restaurant.menu">
  <meta property="og:site_name" content="${safeName}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeLogo}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://harpymenu.com/${slug}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeLogo}">

  <link rel="icon" href="${safeLogo}">
  <link rel="apple-touch-icon" href="${safeLogo}">
  <link rel="manifest" href="${manifestHref}?v=${ASSET_VERSION}">
  <meta name="theme-color" content="${escapeHtml(themeColor)}">

  <!-- Instant Browser Redirect to Interactive Menu App -->
  <meta http-equiv="refresh" content="0; url=/order/?m=${slug}">
  <script>
    (function() {
      try {
        var s = window.location.search || '';
        var h = window.location.hash || '';
        var p = new URLSearchParams(s);
        p.set('m', '${slug}');
        window.location.replace('/order/?' + p.toString() + h);
      } catch(e) {
        window.location.replace('/order/?m=${slug}');
      }
    })();
  </script>
</head>
<body style="background:#070B13; color:#FAFAFA; font-family:'Cairo',system-ui,sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; text-align:center;">
  <div style="width:44px; height:44px; border:3px solid rgba(234,88,12,0.2); border-top-color:#ea580c; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:16px;"></div>
  <p style="font-weight:700; font-size:15px; margin:0 0 10px 0;">جاري فتح قائمة طعام ${safeName}...</p>
  <a href="/order/?m=${slug}" style="color:#ea580c; font-size:13px; text-decoration:none; font-weight:600;">اضغط هنا إذا لم يتم التحويل تلقائياً</a>
  <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
</body>
</html>
`;
}

function buildAdminEntryHtml(slug, name, logoUrl, themeColor, manifestHref) {
  const safeName = escapeHtml(name);
  const safeLogo = escapeHtml(logoUrl);
  const title = `لوحة إدارة ${safeName} — Harpy Admin`;
  const desc = `لوحة التحكم السحابية لإدارة طلبات ${safeName} المباشرة، قوائم الطعام، المطبخ وإحصائيات المبيعات.`;
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${title}</title>

  <meta name="description" content="${desc}">

  <!-- Open Graph / WhatsApp / Facebook / Telegram Social Preview -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Harpy Order Admin">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${safeLogo}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://harpymenu.com/admin/${slug}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${safeLogo}">

  <link rel="icon" href="${safeLogo}">
  <link rel="apple-touch-icon" href="${safeLogo}">
  <link rel="manifest" href="${manifestHref}?v=${ASSET_VERSION}">
  <meta name="theme-color" content="${escapeHtml(themeColor)}">

  <!-- Instant Browser Redirect to Full Admin App -->
  <meta http-equiv="refresh" content="0; url=/admin/?m=${slug}">
  <script>
    (function() {
      try {
        var s = window.location.search || '';
        var h = window.location.hash || '';
        var p = new URLSearchParams(s);
        p.set('m', '${slug}');
        window.location.replace('/admin/?' + p.toString() + h);
      } catch(e) {
        window.location.replace('/admin/?m=${slug}');
      }
    })();
  </script>
</head>
<body style="background:#070B13; color:#FAFAFA; font-family:'Cairo',system-ui,sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; text-align:center;">
  <div style="width:44px; height:44px; border:3px solid rgba(234,88,12,0.2); border-top-color:#ea580c; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:16px;"></div>
  <p style="font-weight:700; font-size:15px; margin:0 0 10px 0;">جاري فتح لوحة إدارة ${safeName}...</p>
  <a href="/admin/?m=${slug}" style="color:#ea580c; font-size:13px; text-decoration:none; font-weight:600;">اضغط هنا إذا لم يتم التحويل تلقائياً</a>
  <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
</body>
</html>
`;
}

function removeTenantArtifacts(slug) {
  const targets = [
    path.join(ROOT_DIR, slug),
    path.join(ROOT_DIR, 'admin', slug),
    path.join(ROOT_DIR, `${slug}.html`),
    path.join(ROOT_DIR, `${slug}-admin.html`),
    path.join(ROOT_DIR, `manifest-${slug}.json`),
    path.join(ROOT_DIR, `admin-manifest-${slug}.json`),
    path.join(ROOT_DIR, 'order', `manifest-${slug}.json`),
    path.join(ROOT_DIR, 'menu', `manifest-${slug}.json`),
    path.join(ROOT_DIR, 'admin', `admin-manifest-${slug}.json`)
  ];
  let removedCount = 0;
  for (const target of targets) {
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
      removedCount++;
    }
  }
  return removedCount;
}

function update404Registry(registryObj) {
  const f404Path = path.join(ROOT_DIR, '404.html');
  if (!fs.existsSync(f404Path)) return;
  const content = fs.readFileSync(f404Path, 'utf8');
  const entries = Object.entries(registryObj).map(([slug, info]) => {
    const n = String(info.name || slug).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const l = String(info.logo || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const d = String(info.desc || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `        '${slug}': { name: '${n}', logo: '${l}', desc: '${d}' }`;
  });
  const replacement = `var TENANT_REGISTRY = {\n${entries.join(',\n')}\n      };`;
  const updated = content.replace(/var TENANT_REGISTRY\s*=\s*\{[\s\S]*?\};/, replacement);
  if (updated !== content) {
    fs.writeFileSync(f404Path, updated, 'utf8');
  }
}

function updateFirebaseRedirects(activeSlugs) {
  const fbPath = path.join(ROOT_DIR, 'firebase.json');
  if (!fs.existsSync(fbPath)) return;
  const fb = JSON.parse(fs.readFileSync(fbPath, 'utf8'));
  const systemRedirects = [
    { source: '/master', destination: '/master.html', type: 301 },
    { source: '/products', destination: 'https://abdelraouf-harpy.github.io/products/', type: 301 },
    { source: '/products/**', destination: 'https://abdelraouf-harpy.github.io/products/', type: 301 }
  ];
  const tenantRedirects = [];
  for (const slug of activeSlugs) {
    tenantRedirects.push(
      { source: `/${slug}.html`, destination: `/order.html?m=${slug}`, type: 301 },
      { source: `/${slug}-admin.html`, destination: `/admin.html?m=${slug}`, type: 301 },
      { source: `/manifest-${slug}.json`, destination: `/manifest.json?m=${slug}`, type: 301 },
      { source: `/admin-manifest-${slug}.json`, destination: `/admin-manifest.json?m=${slug}`, type: 301 }
    );
  }
  fb.hosting = fb.hosting || {};
  fb.hosting.redirects = [...systemRedirects, ...tenantRedirects];
  fs.writeFileSync(fbPath, JSON.stringify(fb, null, 2) + '\n', 'utf8');
}

async function run() {
  console.log('=== Harpy Order Dynamic Tenant Sync ===');

  const candidates = discoverCandidateSlugs();
  const activeLicenses = {};
  const deletedSlugs = new Set();

  // Optional full enumeration when FIREBASE_MASTER_KEY is present
  if (MASTER_KEY) {
    const allLicRes = await fetchJson('licenses.json');
    if (allLicRes.ok && allLicRes.data && typeof allLicRes.data === 'object') {
      for (const [rawSlug, lic] of Object.entries(allLicRes.data)) {
        const s = normalizeSlug(rawSlug);
        if (!s || RESERVED_SLUGS.has(s)) continue;
        if (lic && typeof lic === 'object' && lic.status !== 'deleted') {
          activeLicenses[s] = lic;
        } else {
          deletedSlugs.add(s);
        }
      }
      for (const c of candidates) {
        if (!activeLicenses[c]) deletedSlugs.add(c);
      }
    } else {
      console.warn(`Warning: Failed to read full licenses map (HTTP ${allLicRes.status}), checking candidates individually.`);
    }
  }

  // Always check remaining candidates publicly via /licenses/{slug}.json (.read: true)
  for (const slug of candidates) {
    if (activeLicenses[slug] || deletedSlugs.has(slug)) continue;
    const licRes = await fetchJson(`licenses/${slug}.json`);
    if (licRes.ok) {
      if (licRes.data && typeof licRes.data === 'object' && licRes.data.status !== 'deleted') {
        activeLicenses[slug] = licRes.data;
      } else if (licRes.data === null || (licRes.data && licRes.data.status === 'deleted')) {
        deletedSlugs.add(slug);
      }
    } else {
      console.warn(`Skipping delete/update for "${slug}" due to network status ${licRes.status}`);
    }
  }

  // Prune all confirmed deleted / orphan tenants
  for (const slug of deletedSlugs) {
    const removed = removeTenantArtifacts(slug);
    console.log(`[PRUNED] Deleted tenant "${slug}" (${removed} artifact(s) removed)`);
  }

  // Synchronize active tenants & custom domains map
  const registry = {};
  const domainMap = {};
  const activeSlugs = Object.keys(activeLicenses).sort();
  if (activeSlugs.length === 0) {
    console.error('Safety abort: zero active licenses resolved; refusing to wipe registry.');
    process.exit(1);
  }

  for (const slug of activeSlugs) {
    const lic = activeLicenses[slug];
    const setRes = await fetchJson(`restaurants/${slug}/settings.json`);
    const settings = (setRes.ok && setRes.data && typeof setRes.data === 'object') ? setRes.data : {};

    const businessType = (settings.businessType === 'store' || lic.businessType === 'store') ? 'store' : 'restaurant';
    const name = settings.storeName || settings.name || lic.restaurantName || slug;
    const desc = settings.storeTagline || settings.tagline || settings.description || (businessType === 'store' ? `متجر ${name} الإلكتروني والطلب المباشر` : `قائمة طعام ${name} والطلب الإلكتروني المباشر`);
    const logoUrl = normalizeAbsoluteUrl(
      settings.logoUrl || settings.logo || 'https://harpymenu.com/assets/brand/og_banner.png',
      'https://harpymenu.com/assets/brand/og_banner.png'
    );
    const themeColor = (settings.siteColors && settings.siteColors.primary) || '#ea580c';
    const rawCustomDomain = String(settings.customDomain || lic.customDomain || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    if (rawCustomDomain && rawCustomDomain.includes('.')) {
      domainMap[rawCustomDomain] = slug;
    }

    registry[slug] = { slug, name, logo: logoUrl, desc, businessType, customDomain: rawCustomDomain || '' };

    // Root manifests
    fs.writeFileSync(
      path.join(ROOT_DIR, `manifest-${slug}.json`),
      JSON.stringify(buildManifest(slug, name, logoUrl, false), null, 2),
      'utf8'
    );
    fs.writeFileSync(
      path.join(ROOT_DIR, `admin-manifest-${slug}.json`),
      JSON.stringify(buildManifest(slug, name, logoUrl, true), null, 2),
      'utf8'
    );

    // Clean URL entrypoints ({slug}/index.html and admin/{slug}/index.html)
    fs.mkdirSync(path.join(ROOT_DIR, slug), { recursive: true });
    fs.writeFileSync(
      path.join(ROOT_DIR, slug, 'index.html'),
      buildMenuEntryHtml(slug, name, desc, logoUrl, themeColor, `/manifest-${slug}.json`),
      'utf8'
    );
    fs.mkdirSync(path.join(ROOT_DIR, 'admin', slug), { recursive: true });
    fs.writeFileSync(
      path.join(ROOT_DIR, 'admin', slug, 'index.html'),
      buildAdminEntryHtml(slug, name, logoUrl, themeColor, `/admin-manifest-${slug}.json`),
      'utf8'
    );

    // Legacy root .html entrypoints
    fs.writeFileSync(
      path.join(ROOT_DIR, `${slug}.html`),
      buildMenuEntryHtml(slug, name, desc, logoUrl, themeColor, `/manifest-${slug}.json`),
      'utf8'
    );
    fs.writeFileSync(
      path.join(ROOT_DIR, `${slug}-admin.html`),
      buildAdminEntryHtml(slug, name, logoUrl, themeColor, `/admin-manifest-${slug}.json`),
      'utf8'
    );

    console.log(`[SYNCED] ${slug} -> "${name}"`);
  }

  // Write js/tenant-registry.json, js/domain-map.json, update 404.html & firebase.json
  fs.writeFileSync(
    path.join(ROOT_DIR, 'js', 'tenant-registry.json'),
    JSON.stringify(registry, null, 2) + '\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(ROOT_DIR, 'js', 'domain-map.json'),
    JSON.stringify(domainMap, null, 2) + '\n',
    'utf8'
  );
  update404Registry(registry);
  updateFirebaseRedirects(activeSlugs);

  console.log(`=== Done: ${activeSlugs.length} active, ${deletedSlugs.size} pruned ===`);
}

run().catch(err => {
  console.error('Tenant sync failed:', err);
  process.exit(1);
});
