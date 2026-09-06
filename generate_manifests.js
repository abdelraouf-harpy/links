// Automated Static WebAPK Manifest Generator for HarpyOrder Tenants
// Generates standalone manifests with authentic HTTPS URLs for WebAPK minting without Chrome badge
const fs = require('fs');
const path = require('path');

const FIREBASE_BASE = 'https://harpy-order-default-rtdb.firebaseio.com/restaurants';
const KNOWN_SLUGS = ['saj', 'king'];

async function generate() {
  console.log('Fetching active restaurant settings from Firebase...');
  for (const slug of KNOWN_SLUGS) {
    try {
      const res = await fetch(`${FIREBASE_BASE}/${slug}/settings.json`);
      if (!res.ok) continue;
      const settings = await res.json();
      if (!settings || (!settings.storeName && !settings.name)) continue;

      const storeName = (settings.storeName || settings.name || slug).trim();
      let iconRelativePath = 'pwa_icon.png';
      let adminIconRelativePath = 'admin_pwa_icon.png';

      // If logo is base64 or URL, save locally
      if (settings.logo) {
        try {
          const logoPath = `icons/${slug}-logo.png`;
          if (settings.logo.startsWith('data:image')) {
            const base64Data = settings.logo.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync(logoPath, Buffer.from(base64Data, 'base64'));
            iconRelativePath = logoPath;
            adminIconRelativePath = logoPath;
          } else if (settings.logo.startsWith('http')) {
            const imgRes = await fetch(settings.logo);
            if (imgRes.ok) {
              const buf = await imgRes.arrayBuffer();
              fs.writeFileSync(logoPath, Buffer.from(buf));
              iconRelativePath = logoPath;
              adminIconRelativePath = logoPath;
            }
          }
        } catch (e) {
          console.warn(`[Logo] Could not save logo for ${slug}:`, e.message);
        }
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
