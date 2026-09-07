// Automated Static WebAPK Manifest Generator for HarpyOrder Tenants
// Generates standalone manifests with authentic HTTPS URLs for WebAPK minting without Chrome badge
const fs = require('fs');
const path = require('path');

const FIREBASE_BASE = 'https://harpy-order-default-rtdb.firebaseio.com/restaurants';
const FIREBASE_SECRET = 'd2x4acW2XKMUxLs0sWJuGCv3QzZY4TBOxA8d7vtH';

async function getSlugs() {
  try {
    const res = await fetch("https://harpy-order-default-rtdb.firebaseio.com/restaurants.json?auth=" + FIREBASE_SECRET + "&shallow=true");
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

  for (const slug of slugs) {
    try {
      const res = await fetch(FIREBASE_BASE + "/" + slug + "/settings.json?auth=" + FIREBASE_SECRET);
      let settings = {};
      if (res.ok) {
        settings = (await res.json()) || {};
      }

      const storeName = (settings.storeName || settings.name || slug).trim();
      let iconUrl = (settings.logo && settings.logo.startsWith('http'))
        ? settings.logo
        : (slug === 'saj' ? 'https://iili.io/n3HWDDG.jpg' : 'https://iili.io/n3HVHX4.jpg');

      // 1. Menu Manifest (Customer Facing)
      const menuManifest = {
        id: "harpy-menu-" + slug + "-v33",
        name: storeName,
        short_name: storeName,
        description: storeName + " - منيو ذكي وطلب أونلاين مباشر",
        start_url: "./index.html?m=" + slug,
        scope: "./",
        display: "standalone",
        background_color: "#120e0c",
        theme_color: "#ea580c",
        orientation: "portrait",
        icons: [
          { src: iconUrl, sizes: "512x512", type: "image/jpeg", purpose: "any" },
          { src: iconUrl, sizes: "192x192", type: "image/jpeg", purpose: "any" },
          { src: iconUrl, sizes: "512x512", type: "image/jpeg", purpose: "maskable" }
        ]
      };
      fs.writeFileSync("manifest-" + slug + ".json", JSON.stringify(menuManifest, null, 2));

      // 2. Admin Manifest (Restaurant Manager / Kitchen Display)
      const adminManifest = {
        id: "harpy-admin-" + slug + "-v33",
        name: "إدارة " + storeName,
        short_name: "إدارة " + storeName,
        description: "إدارة " + storeName + " - لوحة التحكم والطلبات",
        start_url: "./admin.html?m=" + slug,
        scope: "./admin.html",
        display: "standalone",
        background_color: "#120e0c",
        theme_color: "#ea580c",
        orientation: "portrait",
        icons: [
          { src: iconUrl, sizes: "512x512", type: "image/jpeg", purpose: "any" },
          { src: iconUrl, sizes: "192x192", type: "image/jpeg", purpose: "any" },
          { src: iconUrl, sizes: "512x512", type: "image/jpeg", purpose: "maskable" }
        ]
      };
      fs.writeFileSync("admin-manifest-" + slug + ".json", JSON.stringify(adminManifest, null, 2));

      console.log("Generated manifests for: " + slug + " (" + storeName + ")");
    } catch (err) {
      console.warn("Error generating for " + slug + ":", err.message);
    }
  }

  // 3. Fallback Root Manifests (Pure Cloud CDN Hosted)
  const defaultIconUrl = 'https://iili.io/n3HVHX4.jpg';
  const defaultMenuManifest = {
    id: 'harpy-menu-app-v33',
    name: 'منيو المطعم',
    short_name: 'المنيو',
    description: 'المنيو الذكي وطلب الأوردر المباشر',
    start_url: './index.html',
    scope: './',
    display: 'standalone',
    background_color: '#120e0c',
    theme_color: '#ea580c',
    orientation: 'portrait',
    icons: [
      { src: defaultIconUrl, sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
      { src: defaultIconUrl, sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
      { src: defaultIconUrl, sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' }
    ]
  };
  fs.writeFileSync('manifest.json', JSON.stringify(defaultMenuManifest, null, 2));

  const defaultAdminManifest = {
    id: 'harpy-admin-app-v33',
    name: 'إدارة المطعم',
    short_name: 'الإدارة',
    description: 'لوحة التحكم وإدارة الطلبات',
    start_url: './admin.html',
    scope: './admin.html',
    display: 'standalone',
    background_color: '#120e0c',
    theme_color: '#ea580c',
    orientation: 'portrait',
    icons: [
      { src: defaultIconUrl, sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
      { src: defaultIconUrl, sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
      { src: defaultIconUrl, sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' }
    ]
  };
  fs.writeFileSync('admin-manifest.json', JSON.stringify(defaultAdminManifest, null, 2));

  console.log('Manifest generation complete!');
}

generate();