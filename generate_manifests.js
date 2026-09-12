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

  const MENU_ICON_URL = 'https://iili.io/n3HVHX4.jpg';
  const ADMIN_ICON_URL = 'https://iili.io/n3rYXyu.png';

  for (const slug of slugs) {
    try {
      let storeName = slug;
      try {
        const res = await fetch(FIREBASE_BASE + "/" + slug + "/settings.json?auth=" + FIREBASE_SECRET);
        if (res.ok) {
          const settings = await res.json();
          if (settings) {
            storeName = (settings.storeName || settings.name || slug).trim();
          }
        }
      } catch(e) {}

      // 1. Menu Manifest (Customer Facing)
      const menuManifest = {
        id: "harpy-order-" + slug + "-v38",
        name: "Order",
        short_name: "Order",
        description: storeName + " — Smart Digital Menu",
        start_url: "./index.html?m=" + slug,
        scope: "./",
        display: "standalone",
        background_color: "#120e0c",
        theme_color: "#ea580c",
        orientation: "portrait",
        icons: [
          { src: MENU_ICON_URL, sizes: "512x512", type: "image/jpeg", purpose: "any" },
          { src: MENU_ICON_URL, sizes: "192x192", type: "image/jpeg", purpose: "any" },
          { src: MENU_ICON_URL, sizes: "512x512", type: "image/jpeg", purpose: "maskable" }
        ]
      };
      fs.writeFileSync("manifest-" + slug + ".json", JSON.stringify(menuManifest, null, 2));

      // 2. Admin Manifest (Restaurant Manager / Kitchen Display)
      const adminManifest = {
        id: "harpy-admin-" + slug + "-v38",
        name: "Admin",
        short_name: "Admin",
        description: storeName + " — Dashboard & Kitchen",
        start_url: "./admin.html?m=" + slug,
        scope: "./admin.html",
        display: "standalone",
        background_color: "#120e0c",
        theme_color: "#ea580c",
        orientation: "portrait",
        icons: [
          { src: ADMIN_ICON_URL, sizes: "512x512", type: "image/png", purpose: "any" },
          { src: ADMIN_ICON_URL, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: ADMIN_ICON_URL, sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      };
      fs.writeFileSync("admin-manifest-" + slug + ".json", JSON.stringify(adminManifest, null, 2));

      console.log("Generated manifests for: " + slug + " (" + storeName + ")");
    } catch (err) {
      console.warn("Error generating for " + slug + ":", err.message);
    }
  }

  // 3. Fallback Root Manifests (Pure Cloud CDN Hosted)
  const defaultMenuManifest = {
    id: 'harpy-order-app-v38',
    name: 'Order',
    short_name: 'Order',
    description: 'Order — Smart Digital Menu',
    start_url: './index.html',
    scope: './',
    display: 'standalone',
    background_color: '#120e0c',
    theme_color: '#ea580c',
    orientation: 'portrait',
    icons: [
      { src: MENU_ICON_URL, sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
      { src: MENU_ICON_URL, sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
      { src: MENU_ICON_URL, sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' }
    ]
  };
  fs.writeFileSync('manifest.json', JSON.stringify(defaultMenuManifest, null, 2));

  const defaultAdminManifest = {
    id: 'harpy-admin-app-v38',
    name: 'Admin',
    short_name: 'Admin',
    description: 'Order Admin — Dashboard & Kitchen',
    start_url: './admin.html',
    scope: './admin.html',
    display: 'standalone',
    background_color: '#120e0c',
    theme_color: '#ea580c',
    orientation: 'portrait',
    icons: [
      { src: ADMIN_ICON_URL, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: ADMIN_ICON_URL, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: ADMIN_ICON_URL, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
  fs.writeFileSync('admin-manifest.json', JSON.stringify(defaultAdminManifest, null, 2));

  console.log('Manifest generation complete!');
}

generate();