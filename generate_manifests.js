// Automated Static WebAPK Manifest Generator for HarpyOrder Tenants
// Generates standalone manifests with authentic HTTPS URLs for WebAPK minting without Chrome badge
const fs = require('fs');
const path = require('path');

const FIREBASE_BASE = 'https://harpy-order-default-rtdb.firebaseio.com/restaurants';
const FIREBASE_SECRET = 'd2x4acW2XKMUxLs0sWJuGCv3QzZY4TBOxA8d7vtH';

async function getSlugs() {
  try {
    const res = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants.json?auth=${FIREBASE_SECRET}&shallow=true`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const keys = Object.keys(data).filter(Boolean);
        if (keys.length > 0) {
          if (!keys.includes('king')) keys.push('king');
          if (!keys.includes('saj')) keys.push('saj');
          return keys;
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch slugs dynamically:', e.message);
  }
  return ['saj', 'king'];
}

async function generate() {
  console.log('Fetching active restaurant settings from Firebase...');
  const slugs = await getSlugs();
  if (!fs.existsSync('icons')) {
    fs.mkdirSync('icons', { recursive: true });
  }

  for (const slug of slugs) {
    try {
      const res = await fetch(`${FIREBASE_BASE}/${slug}/settings.json?auth=${FIREBASE_SECRET}`);
      let settings = {};
      if (res.ok) {
        settings = (await res.json()) || {};
      }

      const storeName = (settings.storeName || settings.name || slug).trim();
      let iconRelativePath = 'pwa_icon.png';
      let adminIconRelativePath = 'admin_pwa_icon.png';

      // If logo is a public HTTP/HTTPS URL, use it directly (requires no GitHub upload!)
      if (settings.logo && settings.logo.startsWith('http')) {
        iconRelativePath = settings.logo;
        adminIconRelativePath = settings.logo;
      } else if (slug === 'saj') {
        // saj already has its committed icon on GitHub
        iconRelativePath = 'icons/saj-logo.png';
        adminIconRelativePath = 'icons/saj-logo.png';
      } else {
        // Standard high-res icons already available on GitHub
        iconRelativePath = 'pwa_icon.png';
        adminIconRelativePath = 'admin_pwa_icon.png';
      }

      // 1. Menu Manifest
      const menuManifest = {
        id: `harpy-menu-${slug}-v2`,
        name: storeName,
        short_name: storeName.length > 12 ? storeName.substring(0, 12) : storeName,
        description: `${storeName} - منيو ذكي وطلب أونلاين مباشر`,
        start_url: `./index.html?m=${slug}`,
        scope: './index.html',
        display: 'standalone',
        background_color: '#120e0c',
        theme_color: '#ea580c',
        orientation: 'portrait',
        icons: [
          { src: iconRelativePath, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: iconRelativePath, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: iconRelativePath, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      };
      fs.writeFileSync(`manifest-${slug}.json`, JSON.stringify(menuManifest, null, 2));

      // 2. Admin Manifest
      const adminManifest = {
        id: `harpy-admin-${slug}-v2`,
        name: `لوحة تحكم ${storeName}`,
        short_name: `إدارة ${storeName.length > 8 ? storeName.substring(0, 8) : storeName}`,
        description: `لوحة تحكم وإدارة ${storeName}`,
        start_url: `./admin.html?m=${slug}`,
        scope: './admin.html',
        display: 'standalone',
        background_color: '#120e0c',
        theme_color: '#ea580c',
        orientation: 'portrait',
        icons: [
          { src: adminIconRelativePath, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: adminIconRelativePath, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: adminIconRelativePath, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      };
      fs.writeFileSync(`admin-manifest-${slug}.json`, JSON.stringify(adminManifest, null, 2));

      console.log(`Generated manifests for: ${slug} (${storeName})`);
    } catch (err) {
      console.warn(`Error generating for ${slug}:`, err.message);
    }
  }
  console.log('Manifest generation complete!');
}

generate();
