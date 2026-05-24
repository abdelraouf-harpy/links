import { Services } from "./services.js";
import { UI } from "./ui.js";

let profileData = null;

// Helpers for color dynamic theme calculations
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 124, g: 58, b: 237 };
}

function darken(hex, pct = 0.45) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.floor(r * (1 - pct))},${Math.floor(g * (1 - pct))},${Math.floor(b * (1 - pct))})`;
}

function lighter(hex, pct = 0.25) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, Math.floor(r + (255 - r) * pct))},${Math.min(255, Math.floor(g + (255 - g) * pct))},${Math.min(255, Math.floor(b + (255 - b) * pct))})`;
}

// Load profile on page start
async function loadProfile() {
  const params = new URLSearchParams(window.location.search);
  const uname = params.get('u');
  if (!uname) {
    show404();
    return;
  }

  try {
    const uid = await Services.getUidByUsername(uname);
    if (!uid) {
      show404();
      return;
    }

    const data = await Services.getUserProfile(uid);
    if (!data) {
      show404();
      return;
    }

    profileData = data;
    render(profileData);
  } catch (e) {
    console.error("Error loading public profile:", e);
    show404();
  }
}

function show404() {
  UI.showLoader(false);
  const notFound = document.getElementById('not-found');
  if (notFound) notFound.style.display = 'flex';
}

function showProfile() {
  UI.showLoader(false);
  const profile = document.getElementById('profile');
  if (profile) profile.style.display = 'block';
}

// Render values into elements
function render(d) {
  const isAr = d.lang !== 'en';
  const dir  = isAr ? 'rtl' : 'ltr';

  /* doc lang and direction settings */
  document.documentElement.lang = isAr ? 'ar' : 'en';
  document.documentElement.dir  = dir;

  /* dynamic styling variables mapping */
  const themeHex = d.theme || '#7c3aed';
  const rgb      = hexToRgb(themeHex);
  const root     = document.documentElement.style;
  root.setProperty('--theme',   themeHex);
  root.setProperty('--theme-r', rgb.r);
  root.setProperty('--theme-g', rgb.g);
  root.setProperty('--theme-b', rgb.b);

  /* dynamic hero gradient values */
  const dark = darken(themeHex, 0.5);
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    heroEl.style.background = `linear-gradient(145deg, ${lighter(themeHex, .1)} 0%, ${dark} 100%)`;
  }

  /* meta tags updates */
  document.title = `${d.name || 'HARPY CARDS'} — HARPY CARDS`;
  setMeta('og:title',       d.name || 'HARPY CARDS');
  setMeta('og:description', d.bio  || `بطاقة بيزنس رقمية`);
  if (d.photo) setMeta('og:image', d.photo);

  /* user avatar image */
  const photoEl = document.getElementById('photo-el');
  if (photoEl && d.photo) {
    photoEl.innerHTML = `<img src="${d.photo}" alt="${d.name}" style="width:112px;height:112px;border-radius:50%;object-fit:cover;display:block;" />`;
  }

  /* basic headers */
  const nameEl = document.getElementById('h-name');
  if (nameEl) nameEl.textContent = d.name || '—';
  
  if (d.title) { 
    const el = document.getElementById('h-title');   
    if (el) { el.textContent = d.title; el.style.display='block'; } 
  }
  if (d.company) { 
    const el = document.getElementById('h-company'); 
    if (el) { el.textContent = d.company; el.style.display='block'; } 
  }

  /* save contact button label */
  const saveLbl = document.getElementById('save-lbl');
  if (saveLbl) saveLbl.textContent = isAr ? 'حفظ في جهات الاتصال' : 'Save Contact';

  /* bio description card */
  if (d.bio) {
    const bioCard = document.getElementById('bio-card');
    const bioText = document.getElementById('bio-text');
    if (bioCard && bioText) {
      bioCard.style.display = 'block';
      bioText.textContent   = d.bio;
    }
  }

  /* action buttons (Call, WA, Email) */
  const acts = [];
  if (d.mobile) {
    acts.push({ 
      href: `tel:${d.mobile}`, 
      icon: `<svg class="svg-icon" style="stroke:currentColor;fill:none;width:22px;height:22px;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`, 
      lbl: isAr ? 'اتصال' : 'Call' 
    });
  }
  
  if (d.whatsapp) {
    const waNum = Services.formatEgyptianWhatsApp(d.whatsapp);
    acts.push({ 
      href: `https://wa.me/${waNum}`, 
      icon: `<svg class="svg-icon-fill" style="fill:currentColor;width:22px;height:22px;" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.55 0 8.25 3.7 8.25 8.26 0 2.2-.86 4.28-2.42 5.84l-.41.41 1.43 5.24-5.37-1.41-.42.25c-1.44.86-3.09 1.31-4.78 1.31-4.55 0-8.25-3.7-8.25-8.26 0-2.2.86-4.28 2.42-5.84a8.204 8.204 0 0 1 5.82-2.42v-.03zm-1.89 3.11c-.26 0-.51.06-.72.27-.3.3-.87.87-.87 2.12 0 1.25.91 2.46 1.04 2.63.13.17 1.79 2.73 4.33 3.83.6.26 1.07.42 1.44.54.61.19 1.16.16 1.59.1.48-.07 1.48-.61 1.69-1.19.21-.58.21-1.07.15-1.19-.06-.12-.24-.18-.51-.31-.27-.13-1.59-.79-1.84-.87-.25-.09-.44-.13-.62.15-.18.27-.7 1.02-.85 1.19-.15.17-.3.19-.57.06-.27-.13-1.14-.42-2.18-1.35-.8-.71-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.06-.13-.62-1.5-.85-2.05-.23-.55-.46-.48-.62-.48z"/></svg>`, 
      lbl: 'WhatsApp', 
      target: '_blank' 
    });
  }
  
  if (d.publicEmail) {
    acts.push({ 
      href: `mailto:${d.publicEmail}`, 
      icon: `<svg class="svg-icon" style="stroke:currentColor;fill:none;width:22px;height:22px;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`, 
      lbl: isAr ? 'إيميل' : 'Email' 
    });
  }

  const grid = document.getElementById('actions-grid');
  if (grid) {
    if (acts.length) {
      grid.innerHTML = acts.map(a =>
        `<a href="${a.href}" class="act-btn" ${a.target ? `target="${a.target}"` : ''}>` +
          `<div class="act-icon">${a.icon}</div>` +
          `<span class="act-lbl">${a.lbl}</span>` +
        `</a>`
      ).join('');
    } else {
      grid.parentElement.style.display = 'none';
    }
  }

  /* location & website detail links */
  const infoRows = [];
  if (d.location) {
    infoRows.push({
      href: `https://maps.google.com?q=${encodeURIComponent(d.location)}`,
      icon: `<svg class="svg-icon" style="stroke:currentColor;fill:none;width:20px;height:20px;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`, 
      lbl: isAr ? 'الموقع' : 'Location', 
      val: d.location, 
      target: '_blank'
    });
  }
  
  if (d.website) {
    const clean = d.website.replace(/^https?:\/\//, '');
    const href  = d.website.startsWith('http') ? d.website : `https://${d.website}`;
    infoRows.push({ 
      href, 
      icon: `<svg class="svg-icon" style="stroke:currentColor;fill:none;width:20px;height:20px;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`, 
      lbl: isAr ? 'الموقع الإلكتروني' : 'Website', 
      val: clean, 
      target: '_blank' 
    });
  }

  const infoList = document.getElementById('info-rows');
  if (infoList) {
    infoList.innerHTML = infoRows.map(r =>
      `<a href="${r.href}" class="info-row" ${r.target ? `target="${r.target}"` : ''}>` +
        `<div class="info-icon-box">${r.icon}</div>` +
        `<div class="info-content">` +
          `<div class="info-lbl">${r.lbl}</div>` +
          `<div class="info-val">${r.val}</div>` +
        `</div>` +
        `<span class="info-arr">←</span>` +
      `</a>`
    ).join('');
  }

  /* social grids render */
  const platforms = [
    { key: 'instagram', icon: `<svg class="svg-icon" style="stroke:currentColor;fill:none;width:18px;height:18px;stroke-width:2;vertical-align:middle;margin-inline-end:4px;" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`, label: 'Instagram' },
    { key: 'facebook',  icon: `<svg class="svg-icon-fill" style="fill:currentColor;width:18px;height:18px;vertical-align:middle;margin-inline-end:4px;" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`, label: 'Facebook' },
    { key: 'linkedin',  icon: `<svg class="svg-icon-fill" style="fill:currentColor;width:18px;height:18px;vertical-align:middle;margin-inline-end:4px;" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`, label: 'LinkedIn' },
    { key: 'tiktok',    icon: `<svg class="svg-icon-fill" style="fill:currentColor;width:18px;height:18px;vertical-align:middle;margin-inline-end:4px;" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.84-.74-3.96-1.72-.01 2.92.01 5.84-.02 8.75-.1 1.6-.74 3.18-1.91 4.27-1.41 1.34-3.44 2.01-5.36 1.73-1.89-.24-3.66-1.41-4.63-3.07-1.12-1.85-1.25-4.27-.37-6.22.9-2.02 2.92-3.52 5.13-3.79V10.2c-1.17.15-2.28.84-2.88 1.86-.73 1.2-.7 2.8.11 3.88.8 1.1 2.23 1.61 3.53 1.25 1.13-.3 1.93-1.33 2.03-2.5.05-2.92-.01-5.83.02-8.74-1.56.08-3.17-.46-4.24-1.63C9.09 3.19 8.56 1.6 8.52 0c1.33.02 2.67.01 4 .02z"/></svg>`, label: 'TikTok' },
    { key: 'twitter',   icon: `<svg class="svg-icon-fill" style="fill:currentColor;width:18px;height:18px;vertical-align:middle;margin-inline-end:4px;" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`, label: 'X / Twitter' },
    { key: 'snapchat',  icon: `<svg class="svg-icon-fill" style="fill:currentColor;width:18px;height:18px;vertical-align:middle;margin-inline-end:4px;" viewBox="0 0 24 24"><path d="M12 2.019c-1.819 0-3.684.524-4.887 1.728-1.077 1.077-1.636 2.673-1.636 4.673.01 1.728.32 2.456.631 3.116-.272.194-.573.437-.903.718-.544.466-.99.98-1.32 1.543-.544.932-.67 1.854-.369 2.68.223.612.7 1.039 1.417 1.272.233.078.68.175.767.194.039.01.078.029.117.039v.039a.747.747 0 0 0 .544.573c.485.146.99.233 1.505.262.136.01.272.01.408.01a14.73 14.73 0 0 0 2.252-.165 4.398 4.398 0 0 0 .806.117c.223.01.456 0 .689-.01 1.068.049 2.146.01 3.204-.126.311.058.621.097.942.097.233 0 .456-.029.68-.058a.747.747 0 0 0 .553-.573v-.039c.039-.01.078-.029.117-.039.087-.019.534-.117.767-.194.718-.233 1.194-.66 1.417-1.272.301-.825.175-1.748-.369-2.68-.33-.563-.777-1.078-1.32-1.544a8.16 8.16 0 0 1-.903-.718c.311-.66.621-1.388.631-3.116 0-2-.558-3.596-1.636-4.673C15.684 2.543 13.819 2.019 12 2.019z"/></svg>`, label: 'Snapchat' },
    { key: 'youtube',   icon: `<svg class="svg-icon-fill" style="fill:currentColor;width:18px;height:18px;vertical-align:middle;margin-inline-end:4px;" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`, label: 'YouTube' }
  ];

  const activeSocials = platforms.filter(p => d[p.key]);
  const socialCard = document.getElementById('social-card');
  const socialGrid = document.getElementById('social-grid');
  
  if (socialCard && socialGrid) {
    if (activeSocials.length) {
      socialCard.style.display = 'block';
      document.getElementById('social-label').textContent = isAr ? 'تابعني على' : 'Follow Me';
      socialGrid.innerHTML = activeSocials.map(p =>
        `<a href="${d[p.key]}" class="soc-btn" target="_blank" rel="noopener">` +
          `<span class="soc-icon">${p.icon}</span>` +
          `<span>${p.label}</span>` +
        `</a>`
      ).join('');
    } else {
      socialCard.style.display = 'none';
    }
  }

  showProfile();
}

function setMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { 
    el = document.createElement('meta'); 
    el.setAttribute('property', property); 
    document.head.appendChild(el); 
  }
  el.setAttribute('content', content);
}

// vCard compiler and download trigger
function downloadVCard() {
  if (!profileData) return;
  const d = profileData;
  const lines = [
    'BEGIN:VCARD', 'VERSION:3.0',
    `FN:${d.name || ''}`,
    d.title   ? `TITLE:${d.title}`   : '',
    d.company ? `ORG:${d.company}`   : '',
    d.mobile  ? `TEL;TYPE=CELL:${d.mobile}` : '',
    d.publicEmail ? `EMAIL:${d.publicEmail}` : '',
    d.website ? `URL:${d.website}`   : '',
    d.location ? `ADR:;;${d.location};;;;` : '',
    d.photo ? `PHOTO;VALUE=URI:${d.photo}` : '',
    d.bio   ? `NOTE:${d.bio}`  : '',
    'END:VCARD'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([lines], { type: 'text/vcard;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; 
  a.download = `${d.name || 'contact'}.vcf`;
  document.body.appendChild(a); 
  a.click();
  document.body.removeChild(a); 
  URL.revokeObjectURL(url);
}

// Bind load and save actions
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  
  const saveBtn = document.getElementById('save-contact-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', downloadVCard);
  }
});
