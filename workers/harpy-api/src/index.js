/**
 * HarpyOrder — Cloudflare Worker Backend API (`harpy-api`)
 *
 * Isolates privileged credentials (Firebase Service Account / Database Secret,
 * OneSignal REST Key, GitHub Actions PAT, Master Auth) off browser bundles.
 */

const STATIC_ALLOWED_ORIGINS = new Set([
  'https://harpymenu.com',
  'https://www.harpymenu.com',
  'https://abdelraouf-harpy.github.io',
  'https://harpy-order.web.app',
  'https://harpy-order.firebaseapp.com',
  'https://amounsmoke.com',
  'https://www.amounsmoke.com',
  'https://elmetaashy.com',
  'https://www.elmetaashy.com'
]);

const RESERVED_SLUGS = new Set([
  'admin', 'order', 'menu', 'master', 'portfolio', 'products', 'cards',
  'assets', 'js', 'css', 'scripts', 'docs', 'backups', 'scratch',
  'api', 'demo', 'index', '404', 'onesignalsdkworker'
]);

const SAFE_RTDB_PATH_RE = /^(\.json|(licenses|restaurants|tenantPrivate|subscriptionPlans|systemBroadcast|announcements|domains|auditLogs|masterConfig|orders)(\/[A-Za-z0-9_.\-@]+)*(\.json)?)$/;

const DEFAULT_MODULES = {
  ordering: true, pos: true, inventory: false, smartTables: false,
  delivery: true, takeaway: true, onlinePayment: true, archive: true, shifts: false,
  coupons: false, cartDiscount: false, announcementBar: false, stories: false,
  branches: false, reviews: false, settings: true, backup: true,
  bulkPricing: true, pieceStock: true, store24_7: true, multiImageGallery: true,
  catalogFilters: true, bulkImport: true, returnPolicy: true,
  ageGate18: false, nutritionInfo: false, workingHoursGate: true
};

// Isolate caches (per Cloudflare edge isolate)
let cachedGoogleAuth = { token: '', expiresAt: 0, clientEmail: '' };
const domainCache = new Map();
const loginAttemptState = new Map();

function base64UrlEncode(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeToBytes(str) {
  const norm = String(str).replace(/-/g, '+').replace(/_/g, '/');
  const pad = norm.length % 4 ? '='.repeat(4 - (norm.length % 4)) : '';
  const binary = atob(norm + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function sanitizePasswordInput(raw) {
  return String(raw || '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .trim();
}

function timingSafeEqualStrings(a, b) {
  const aBytes = new TextEncoder().encode(String(a || ''));
  const bBytes = new TextEncoder().encode(String(b || ''));
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLen; i++) {
    const x = i < aBytes.length ? aBytes[i] : 0;
    const y = i < bBytes.length ? bBytes[i] : 0;
    diff |= x ^ y;
  }
  return diff === 0;
}

function normalizeHost(originHeader) {
  try {
    const u = new URL(originHeader);
    return { protocol: u.protocol, hostname: u.hostname.toLowerCase().replace(/^www\./, ''), port: u.port };
  } catch {
    return null;
  }
}

function domainToFirebaseKey(host) {
  return String(host || '').toLowerCase().trim().replace(/^www\./, '').replace(/\./g, '_');
}

function parseOrderTimestampMs(order) {
  if (!order || typeof order !== 'object') return 0;
  if (typeof order.timestamp === 'number' && isFinite(order.timestamp)) {
    return order.timestamp < 1e11 ? order.timestamp * 1000 : order.timestamp;
  }
  if (order.createdAt) {
    const ms = new Date(order.createdAt).getTime();
    if (!isNaN(ms)) return ms;
  }
  return 0;
}

/**
 * Resolves an OAuth2 access token from a Firebase Service Account secret using WebCrypto RS256.
 * Returns null if FIREBASE_SERVICE_ACCOUNT_JSON is not configured.
 */
async function getServiceAccountAccessToken(env) {
  const rawJson = (env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  if (!rawJson) return null;

  const sa = JSON.parse(rawJson);
  const nowSec = Math.floor(Date.now() / 1000);
  if (cachedGoogleAuth.token && cachedGoogleAuth.clientEmail === sa.client_email && cachedGoogleAuth.expiresAt > nowSec + 120) {
    return { accessToken: cachedGoogleAuth.token, projectId: sa.project_id || env.FIREBASE_PROJECT_ID || 'harpy-order' };
  }

  const headerB64 = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimB64 = base64UrlEncode(JSON.stringify({
    iss: sa.client_email,
    scope: [
      'https://www.googleapis.com/auth/firebase.database',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/identitytoolkit'
    ].join(' '),
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
    iat: nowSec,
    exp: nowSec + 3600
  }));

  const signingInput = `${headerB64}.${claimB64}`;
  const pemBody = String(sa.private_key || '')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const pkcs8Bytes = base64UrlDecodeToBytes(pemBody);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pkcs8Bytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );
  const assertion = `${signingInput}.${base64UrlEncode(signature)}`;

  const tokenRes = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${encodeURIComponent(assertion)}`
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(`Google OAuth error: ${tokenData.error_description || tokenData.error || tokenRes.status}`);
  }

  cachedGoogleAuth = {
    token: tokenData.access_token,
    expiresAt: nowSec + (Number(tokenData.expires_in) || 3600),
    clientEmail: sa.client_email
  };
  return { accessToken: tokenData.access_token, projectId: sa.project_id || env.FIREBASE_PROJECT_ID || 'harpy-order' };
}

/**
 * Performs an authenticated RTDB request using OAuth access_token (preferred) or legacy FIREBASE_MASTER_KEY.
 */
async function rtdbAdminFetch(env, rawPath, method = 'GET', body = undefined) {
  const cleanPath = String(rawPath || '').replace(/^\/+/, '');
  if (!SAFE_RTDB_PATH_RE.test(cleanPath)) {
    const err = new Error('Invalid RTDB path');
    err.status = 400;
    throw err;
  }
  const normalizedPath = cleanPath.endsWith('.json') ? cleanPath : `${cleanPath}.json`;
  const baseUrl = String(env.RTDB_BASE_URL || 'https://harpy-order-default-rtdb.firebaseio.com').replace(/\/+$/, '');

  let authParam = '';
  const saAuth = await getServiceAccountAccessToken(env).catch(() => null);
  if (saAuth && saAuth.accessToken) {
    authParam = `access_token=${encodeURIComponent(saAuth.accessToken)}`;
  } else if (env.FIREBASE_MASTER_KEY) {
    authParam = `auth=${encodeURIComponent(env.FIREBASE_MASTER_KEY)}`;
  } else {
    const err = new Error('Server Firebase credentials not configured');
    err.status = 500;
    throw err;
  }

  const url = `${baseUrl}/${normalizedPath}?${authParam}`;
  const init = { method };
  if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  const text = await res.text();
  let parsed = null;
  if (text) {
    try { parsed = JSON.parse(text); } catch { parsed = text; }
  }
  if (!res.ok) {
    const err = new Error((parsed && parsed.error) || `RTDB HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return parsed;
}

/**
 * Verifies CORS origin against static origins + dynamically mapped custom tenant domains in RTDB.
 */
async function isAllowedOrigin(origin, env) {
  if (!origin) return true;
  if (STATIC_ALLOWED_ORIGINS.has(origin)) return true;

  const parsed = normalizeHost(origin);
  if (!parsed) return false;

  if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
    return String(env.ALLOW_LOCALHOST_CORS || 'true') === 'true';
  }
  if (parsed.protocol !== 'https:') return false;
  if (parsed.hostname === 'harpymenu.com' || parsed.hostname.endsWith('.harpymenu.com')) return true;

  const cacheHit = domainCache.get(parsed.hostname);
  if (cacheHit && cacheHit.expiresAt > Date.now()) {
    return cacheHit.allowed;
  }

  let allowed = false;
  try {
    const baseUrl = String(env.RTDB_BASE_URL || 'https://harpy-order-default-rtdb.firebaseio.com').replace(/\/+$/, '');
    const key = domainToFirebaseKey(parsed.hostname);
    const res = await fetch(`${baseUrl}/domains/${encodeURIComponent(key)}.json`);
    if (res.ok) {
      const slug = await res.json();
      allowed = typeof slug === 'string' && slug.trim().length > 0;
    }
  } catch {
    allowed = false;
  }

  domainCache.set(parsed.hostname, { allowed, expiresAt: Date.now() + 300000 });
  return allowed;
}

function buildCorsHeaders(origin, allowOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store'
  };
  if (origin && allowOrigin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}

async function importHmacKey(secret) {
  const raw = String(secret || '').trim();
  if (!raw) throw new Error('JWT_SIGNING_SECRET is required');
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(raw),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signMasterToken(env, sessionVersion = 0) {
  const secret = env.JWT_SIGNING_SECRET || env.MASTER_ADMIN_SECRET;
  const key = await importHmacKey(secret);
  const now = Date.now();
  const payload = {
    sub: 'harpy_master',
    iat: now,
    exp: now + (12 * 60 * 60 * 1000),
    ver: Number(sessionVersion) || 0
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return { token: `${payloadB64}.${base64UrlEncode(sig)}`, expiresAt: payload.exp };
}

async function verifyMasterBearer(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) return { ok: false, status: 401, error: 'Missing Authorization token' };
  const parts = m[1].trim().split('.');
  if (parts.length !== 2) return { ok: false, status: 401, error: 'Malformed token' };

  const secret = env.JWT_SIGNING_SECRET || env.MASTER_ADMIN_SECRET;
  if (!secret) return { ok: false, status: 500, error: 'Master auth not configured' };

  const key = await importHmacKey(secret);
  const sigBytes = base64UrlDecodeToBytes(parts[1]);
  const validSig = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(parts[0]));
  if (!validSig) return { ok: false, status: 401, error: 'Invalid token signature' };

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecodeToBytes(parts[0])));
  if (!payload || payload.sub !== 'harpy_master' || !payload.exp || Date.now() > payload.exp) {
    return { ok: false, status: 401, error: 'Session expired' };
  }

  try {
    const liveVer = await rtdbAdminFetch(env, 'masterConfig/sessionVersion.json', 'GET');
    if (liveVer && Number(liveVer) > (Number(payload.ver) || 0)) {
      return { ok: false, status: 401, error: 'Session revoked' };
    }
  } catch {
    // Allow if sessionVersion node does not exist yet
  }

  return { ok: true, payload };
}

/**
 * Verifies a tenant admin's Firebase Auth ID token via Identity Toolkit accounts:lookup.
 */
async function verifyFirebaseUserToken(idToken, env) {
  if (!idToken || !env.FIREBASE_WEB_API_KEY) return null;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  if (!res.ok) return null;
  const data = await res.json();
  const user = data && Array.isArray(data.users) ? data.users[0] : null;
  if (!user || !user.localId) return null;
  return { uid: user.localId, email: String(user.email || '').toLowerCase() };
}

/**
 * Provisions or updates a tenant's Firebase Auth account via Service Account Admin API
 * (works even when public Firebase Auth sign-up is disabled), with Web API key fallback.
 */
async function provisionTenantAuthAccount(env, email, password) {
  const saAuth = await getServiceAccountAccessToken(env).catch(() => null);
  if (saAuth && saAuth.accessToken) {
    const projectId = saAuth.projectId;
    const baseAdminUrl = `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${saAuth.accessToken}`
    };

    const lookupRes = await fetch(`${baseAdminUrl}/accounts:lookup`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ email: [email] })
    });
    const lookupData = await lookupRes.json();
    const existingUser = lookupData && Array.isArray(lookupData.users) ? lookupData.users[0] : null;
    if (existingUser && existingUser.localId) {
      const updRes = await fetch(`${baseAdminUrl}/accounts:update`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ localId: existingUser.localId, password })
      });
      if (!updRes.ok) {
        const updErr = await updRes.json().catch(() => ({}));
        throw new Error(`Identity Admin update failed: ${updErr?.error?.message || updRes.status}`);
      }
      return existingUser.localId;
    }

    const createRes = await fetch(`${baseAdminUrl}/accounts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ email, password, emailVerified: true })
    });
    const createData = await createRes.json();
    if (!createRes.ok || !createData.localId) {
      throw new Error(`Identity Admin create failed: ${createData?.error?.message || createRes.status}`);
    }
    return createData.localId;
  }

  if (!env.FIREBASE_WEB_API_KEY) {
    throw new Error('Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_WEB_API_KEY is configured');
  }

  const suRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const suData = await suRes.json();
  if (suData && suData.localId) return suData.localId;

  const slugPart = email.split('@')[0];
  for (const tryPass of [password, `Harpy_${slugPart}_2026!`]) {
    const siRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: tryPass, returnSecureToken: true })
    });
    const siData = await siRes.json();
    if (siData && siData.localId) {
      if (tryPass !== password && siData.idToken) {
        await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: siData.idToken, password, returnSecureToken: true })
        });
      }
      return siData.localId;
    }
  }
  throw new Error(suData?.error?.message || 'Unable to provision Firebase Auth account');
}

async function updateTenantAuthPassword(env, slug, newPassword, prevPasswords = []) {
  const email = `${slug}@harpymenu.com`;
  const saAuth = await getServiceAccountAccessToken(env).catch(() => null);
  if (saAuth && saAuth.accessToken) {
    const projectId = saAuth.projectId;
    const baseAdminUrl = `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${saAuth.accessToken}`
    };
    const lookupRes = await fetch(`${baseAdminUrl}/accounts:lookup`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: [email] })
    });
    const lookupData = await lookupRes.json();
    const user = lookupData && Array.isArray(lookupData.users) ? lookupData.users[0] : null;
    if (user && user.localId) {
      const updRes = await fetch(`${baseAdminUrl}/accounts:update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ localId: user.localId, password: newPassword })
      });
      if (!updRes.ok) {
        const errData = await updRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${updRes.status}`);
      }
      return user.localId;
    }
    return await provisionTenantAuthAccount(env, email, newPassword);
  }

  if (!env.FIREBASE_WEB_API_KEY) {
    throw new Error('Server Firebase Auth key not configured');
  }
  const priv = await rtdbAdminFetch(env, `tenantPrivate/${slug}.json`, 'GET').catch(() => null);
  const candidates = Array.from(new Set([
    priv && priv.adminPassword,
    ...prevPasswords,
    `Harpy_${slug}_2026!`,
    '123456'
  ].filter(Boolean)));

  for (const cand of candidates) {
    const siRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: cand, returnSecureToken: true })
    });
    const siData = await siRes.json();
    if (siData && siData.idToken) {
      const upRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: siData.idToken, password: newPassword, returnSecureToken: true })
      });
      if (upRes.ok) return siData.localId;
    }
  }
  throw new Error('Could not sync tenant Firebase Auth password');
}

function sanitizeMasterConfigResponse(cfg) {
  if (!cfg || typeof cfg !== 'object') return {};
  const copy = { ...cfg };
  copy.hasGithubToken = Boolean(copy.githubToken);
  delete copy.githubToken;
  delete copy.pin;
  return copy;
}

function sanitizeAdminOrigin(rawOrigin, rawBasePath, customDomain) {
  const defaultOrigin = 'https://harpymenu.com';
  const parsed = normalizeHost(rawOrigin);
  let safeOrigin = defaultOrigin;
  if (parsed && parsed.protocol === 'https:') {
    if (STATIC_ALLOWED_ORIGINS.has(rawOrigin) || parsed.hostname.endsWith('.harpymenu.com') || (customDomain && domainToFirebaseKey(parsed.hostname) === domainToFirebaseKey(customDomain))) {
      safeOrigin = rawOrigin.replace(/\/+$/, '');
    }
  }
  const cleanBase = rawBasePath === '/links/admin/' ? '/links/admin/' : '/admin/';
  const prefix = rawBasePath === '/links/admin/' ? '/links' : '';
  return { safeOrigin, cleanBase, prefix };
}

async function sendOneSignalNotification(env, payload) {
  const key = (env.ONESIGNAL_REST_KEY || '').trim();
  if (!key) {
    const err = new Error('ONESIGNAL_REST_KEY secret not configured');
    err.status = 500;
    throw err;
  }
  const res = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Key ${key}`
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const originOk = await isAllowedOrigin(origin, env);
    const cors = buildCorsHeaders(origin, originOk);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: originOk ? 204 : 403, headers: cors });
    }
    if (origin && !originOk) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, cors);
    }

    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    try {
      // 1. Health check (public non-sensitive readiness info)
      if (pathname === '/health' && request.method === 'GET') {
        return jsonResponse({
          ok: true,
          service: 'harpy-api',
          version: '1.0.0',
          serviceAccountConfigured: Boolean((env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim()),
          oneSignalConfigured: Boolean((env.ONESIGNAL_REST_KEY || '').trim()),
          masterAuthConfigured: Boolean((env.MASTER_ADMIN_SECRET || '').trim())
        }, 200, cors);
      }

      // 2. Public verified order push notification
      if (pathname === '/api/push/order' && request.method === 'POST') {
        const body = await request.json().catch(() => null);
        const slug = String(body && body.slug || '').toLowerCase().trim();
        const orderId = String(body && body.orderId || '').trim();
        if (!/^[a-z0-9_-]{1,50}$/.test(slug) || !/^[A-Za-z0-9_-]{2,80}$/.test(orderId)) {
          return jsonResponse({ error: 'Invalid slug or orderId' }, 400, cors);
        }

        const [order, settings, lic] = await Promise.all([
          rtdbAdminFetch(env, `restaurants/${slug}/orders/${orderId}.json`, 'GET').catch(() => null),
          rtdbAdminFetch(env, `restaurants/${slug}/settings.json`, 'GET').catch(() => null),
          rtdbAdminFetch(env, `licenses/${slug}.json`, 'GET').catch(() => null)
        ]);

        if (!order || typeof order !== 'object') {
          return jsonResponse({ error: 'Order not found' }, 404, cors);
        }
        if (order.source === 'pos') {
          return jsonResponse({ ok: true, skipped: 'pos_order' }, 200, cors);
        }
        if (order.pushSent === true) {
          return jsonResponse({ ok: true, skipped: 'already_notified' }, 200, cors);
        }
        if (lic && (lic.active === false || lic.suspended === true || ['deleted', 'suspended', 'blocked', 'expired'].includes(String(lic.status || '').toLowerCase()))) {
          return jsonResponse({ error: 'Tenant inactive' }, 403, cors);
        }

        const tsMs = parseOrderTimestampMs(order);
        if (tsMs && Math.abs(Date.now() - tsMs) > 10 * 60 * 1000) {
          return jsonResponse({ ok: true, skipped: 'stale_order' }, 200, cors);
        }

        const storeName = (settings && (settings.storeName || settings.name)) || (lic && lic.restaurantName) || slug;
        const customerName = (order.customer && order.customer.name) ? String(order.customer.name).slice(0, 60) : 'عميل';
        const total = Number(order.finalTotal ?? order.total ?? 0) || 0;
        const orderType = order.type || order.orderType;
        const orderTypeStr = orderType === 'delivery' ? 'توصيل' : ((orderType === 'dinein' || orderType === 'dine_in') ? 'صالة' : 'استلام');
        const { safeOrigin, cleanBase, prefix } = sanitizeAdminOrigin(body.origin, body.basePath, (settings && settings.customDomain) || (lic && lic.customDomain));
        const adminUrl = `${safeOrigin}${cleanBase}?m=${encodeURIComponent(slug)}&orderId=${encodeURIComponent(order.orderId || orderId)}`;
        const iconUrl = `${safeOrigin}${prefix}/assets/icons/admin-icon-192.png`;

        const osPayload = {
          app_id: env.ONESIGNAL_APP_ID || 'c8c2ee02-8064-4c05-97bc-c2ff272b9627',
          headings: {
            en: `طلب جديد #${order.orderId || orderId} - ${storeName}`,
            ar: `طلب جديد #${order.orderId || orderId} - ${storeName}`
          },
          contents: {
            en: `${customerName} (${orderTypeStr}) | الإجمالي: ${total} ج.م`,
            ar: `${customerName} (${orderTypeStr}) | الإجمالي: ${total} ج.م`
          },
          url: adminUrl,
          filters: [{ field: 'tag', key: 'restaurant', relation: '=', value: slug }],
          chrome_web_icon: iconUrl,
          chrome_web_badge: iconUrl,
          firefox_icon: iconUrl,
          priority: 10,
          ttl: 3600
        };

        const osRes = await sendOneSignalNotification(env, osPayload);
        await rtdbAdminFetch(env, `restaurants/${slug}/orders/${orderId}/pushSent.json`, 'PUT', true).catch(() => null);
        return jsonResponse({ ok: osRes.ok, data: osRes.data }, osRes.ok ? 200 : 502, cors);
      }

      // 3. Admin-authenticated test push notification
      if (pathname === '/api/push/test' && request.method === 'POST') {
        const bearerMatch = (request.headers.get('Authorization') || '').match(/^Bearer\s+(.+)$/i);
        if (!bearerMatch) {
          return jsonResponse({ error: 'Missing Firebase ID token' }, 401, cors);
        }
        const fbUser = await verifyFirebaseUserToken(bearerMatch[1].trim(), env);
        if (!fbUser) {
          return jsonResponse({ error: 'Invalid Firebase ID token' }, 401, cors);
        }

        const body = await request.json().catch(() => null);
        const slug = String(body && body.slug || '').toLowerCase().trim();
        if (!/^[a-z0-9_-]{1,50}$/.test(slug)) {
          return jsonResponse({ error: 'Invalid slug' }, 400, cors);
        }

        const meta = await rtdbAdminFetch(env, `restaurants/${slug}/meta.json`, 'GET').catch(() => null);
        const isOwner = fbUser.email === `${slug}@harpymenu.com` || (meta && meta.ownerUid === fbUser.uid);
        if (!isOwner) {
          return jsonResponse({ error: 'Forbidden for tenant' }, 403, cors);
        }

        const settings = await rtdbAdminFetch(env, `restaurants/${slug}/settings.json`, 'GET').catch(() => null);
        const { safeOrigin, cleanBase, prefix } = sanitizeAdminOrigin(body.origin, body.isSubdir ? '/links/admin/' : '/admin/', settings && settings.customDomain);
        const testAdminUrl = `${safeOrigin}${cleanBase}?m=${encodeURIComponent(slug)}`;
        const iconUrl = `${safeOrigin}${prefix}/assets/icons/admin-icon-192.png`;
        const title = `Harpy Order: طلب تجريبي جديد! (${slug})`;
        const text = `تم اختبار ربط الإشعارات السحابية للمطعم بنجاح (${new Date().toLocaleTimeString('ar-EG')})`;

        const osRes = await sendOneSignalNotification(env, {
          app_id: env.ONESIGNAL_APP_ID || 'c8c2ee02-8064-4c05-97bc-c2ff272b9627',
          headings: { en: title, ar: title },
          contents: { en: text, ar: text },
          url: testAdminUrl,
          filters: [{ field: 'tag', key: 'restaurant', relation: '=', value: slug }],
          chrome_web_icon: iconUrl,
          chrome_web_badge: iconUrl,
          firefox_icon: iconUrl,
          priority: 10,
          ttl: 3600
        });
        return jsonResponse({ ok: osRes.ok, data: osRes.data }, osRes.ok ? 200 : 502, cors);
      }

      // 4. Master login (rate-limited, constant-time secret check, stateless HMAC JWT)
      if (pathname === '/api/master/login' && request.method === 'POST') {
        const expectedSecret = sanitizePasswordInput(env.MASTER_ADMIN_SECRET || '');
        if (!expectedSecret) {
          return jsonResponse({ error: 'MASTER_ADMIN_SECRET not configured on Worker' }, 500, cors);
        }

        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const nowMs = Date.now();
        const MAX_FAILED_ATTEMPTS = 8;
        const LOCKOUT_MS = 10 * 60 * 1000;
        const state = loginAttemptState.get(ip) || { count: 0, lockedUntil: 0 };
        if (state.lockedUntil > 0 && state.lockedUntil <= nowMs) {
          loginAttemptState.delete(ip);
          state.count = 0;
          state.lockedUntil = 0;
        }
        if (state.lockedUntil > nowMs) {
          const waitMins = Math.max(1, Math.ceil((state.lockedUntil - nowMs) / 60000));
          return jsonResponse({
            error: `تم حظر المحاولات مؤقتاً لكثرة المحاولات الخاطئة، يرجى الانتظار ${waitMins} دقيقة`,
            retryAfterMinutes: waitMins
          }, 429, cors);
        }

        const body = await request.json().catch(() => null);
        const password = sanitizePasswordInput(body && body.password);
        if (!password || !timingSafeEqualStrings(password, expectedSecret)) {
          state.count += 1;
          if (state.count >= MAX_FAILED_ATTEMPTS) {
            state.lockedUntil = nowMs + LOCKOUT_MS;
            state.count = 0;
            loginAttemptState.set(ip, state);
            return jsonResponse({
              error: 'تم حظر المحاولات لمدة 10 دقائق لكثرة المحاولات الخاطئة',
              retryAfterMinutes: 10
            }, 429, cors);
          }
          loginAttemptState.set(ip, state);
          const remaining = MAX_FAILED_ATTEMPTS - state.count;
          return jsonResponse({
            error: `كلمة مرور القيادة المركزية غير صحيحة (متبقي ${remaining} محاولات)`,
            remainingAttempts: remaining
          }, 401, cors);
        }

        loginAttemptState.delete(ip);
        const cfg = await rtdbAdminFetch(env, 'masterConfig.json', 'GET').catch(() => ({}));
        const safeCfg = sanitizeMasterConfigResponse(cfg);
        safeCfg.hasGithubToken = Boolean((env.GITHUB_SYNC_TOKEN || '').trim() || (cfg && cfg.githubToken));
        const { token, expiresAt } = await signMasterToken(env, cfg && cfg.sessionVersion);
        return jsonResponse({ ok: true, token, expiresAt, config: safeCfg }, 200, cors);
      }

      // All /api/master/* routes below require a valid Master Bearer JWT
      if (pathname.startsWith('/api/master/')) {
        const authCheck = await verifyMasterBearer(request, env);
        if (!authCheck.ok) {
          return jsonResponse({ error: authCheck.error }, authCheck.status, cors);
        }

        if (pathname === '/api/master/session' && request.method === 'GET') {
          return jsonResponse({ ok: true, valid: true, expiresAt: authCheck.payload.exp }, 200, cors);
        }

        if (pathname === '/api/master/logout-all' && request.method === 'POST') {
          const newVersion = Date.now();
          await rtdbAdminFetch(env, 'masterConfig.json', 'PATCH', { sessionVersion: newVersion });
          return jsonResponse({ ok: true, sessionVersion: newVersion }, 200, cors);
        }

        if (pathname === '/api/master/rtdb' && request.method === 'POST') {
          const body = await request.json().catch(() => null);
          const reqPath = String((body && body.path) || '').replace(/^\/+/, '');
          const reqMethod = String((body && body.method) || 'GET').toUpperCase();
          if (!['GET', 'PUT', 'PATCH', 'POST', 'DELETE'].includes(reqMethod)) {
            return jsonResponse({ error: 'Unsupported RTDB method' }, 400, cors);
          }

          let payloadData = body ? body.data : undefined;
          // Prevent writing plaintext pin back into masterConfig
          if ((reqMethod === 'PUT' || reqMethod === 'PATCH') && reqPath.startsWith('masterConfig') && payloadData && typeof payloadData === 'object') {
            payloadData = { ...payloadData };
            delete payloadData.pin;
          }

          let data = await rtdbAdminFetch(env, reqPath, reqMethod, payloadData);
          if (reqMethod === 'GET' && (reqPath === 'masterConfig' || reqPath === 'masterConfig.json')) {
            data = sanitizeMasterConfigResponse(data);
            data.hasGithubToken = Boolean((env.GITHUB_SYNC_TOKEN || '').trim() || data.hasGithubToken);
          }
          return jsonResponse({ ok: true, data }, 200, cors);
        }

        if (pathname === '/api/master/tenants' && request.method === 'POST') {
          const body = await request.json().catch(() => null);
          if (!body || typeof body !== 'object') {
            return jsonResponse({ error: 'Invalid tenant payload' }, 400, cors);
          }
          const slug = String(body.slug || '').toLowerCase().trim();
          const name = String(body.name || '').trim();
          const phone = String(body.phone || '').trim();
          const password = String(body.password || '').trim();
          const bType = body.businessType === 'store' ? 'store' : 'restaurant';
          const customDomain = String(body.customDomain || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
          const planName = String(body.planName || 'الباقة الأساسية').trim();
          const price = Number(body.price) || 899;
          const expTimestamp = Number(body.expTimestamp) || 0;
          const modules = Object.assign({}, DEFAULT_MODULES, body.modules || {});

          if (!name || !phone || !/^[a-z0-9][a-z0-9_-]{0,48}[a-z0-9]?$/.test(slug) || RESERVED_SLUGS.has(slug)) {
            return jsonResponse({ error: 'Invalid slug or required tenant fields' }, 400, cors);
          }
          if (!password || password.length < 6) {
            return jsonResponse({ error: 'Password must be at least 6 characters' }, 400, cors);
          }

          const existingLic = await rtdbAdminFetch(env, `licenses/${slug}.json`, 'GET').catch(() => null);
          if (existingLic) {
            return jsonResponse({ error: `المعرّف "${slug}" مستخدم بالفعل لمطعم آخر!` }, 409, cors);
          }

          const ownerUid = await provisionTenantAuthAccount(env, `${slug}@harpymenu.com`, password);
          const now = Date.now();
          const writes = [
            rtdbAdminFetch(env, `licenses/${slug}.json`, 'PUT', {
              restaurantName: name,
              businessType: bType,
              customDomain,
              status: 'active',
              active: true,
              suspended: false,
              plan: planName,
              expiresAt: expTimestamp,
              validUntil: expTimestamp,
              createdAt: now,
              sessionVersion: now,
              modules
            }),
            rtdbAdminFetch(env, `tenantPrivate/${slug}.json`, 'PUT', {
              adminPassword: password,
              ownerPhone: phone,
              ownerUid,
              monthlyPrice: price,
              plan: planName,
              billingCycle: 'monthly',
              createdAt: now,
              lastPasswordUpdate: now
            }),
            rtdbAdminFetch(env, `restaurants/${slug}/settings.json`, 'PUT', {
              name,
              storeName: name,
              businessType: bType,
              customDomain,
              phone,
              currency: 'ج.م',
              logo: 'assets/brand/harpy_order_emblem_transparent.png',
              storeTagline: bType === 'store' ? 'منتجات مختارة بأعلى جودة وشحن سريع' : '',
              orderingPausedMessage: bType === 'store' ? 'المتجر متوقف حالياً عن استقبال الطلبات.' : 'المطعم متوقف حالياً عن استقبال الطلبات.',
              workingHours: bType === 'store' ? 'نستقبل الطلبات 24 ساعة يومياً' : 'يومياً من 11:00 صباحاً حتى 2:00 صباحاً',
              modules,
              updatedAt: now,
              subscription: {
                active: true,
                suspended: false,
                status: 'active',
                plan: planName,
                expiresAt: expTimestamp > 0 ? new Date(expTimestamp).toISOString() : null
              }
            }),
            rtdbAdminFetch(env, `restaurants/${slug}/meta.json`, 'PUT', {
              ownerUid,
              businessType: bType,
              customDomain,
              status: 'active',
              active: true,
              suspended: false,
              isSuspended: false,
              createdAt: new Date(now).toISOString(),
              sessionVersion: now
            })
          ];

          if (customDomain && customDomain.includes('.')) {
            writes.push(rtdbAdminFetch(env, `domains/${domainToFirebaseKey(customDomain)}.json`, 'PUT', slug));
          }

          await Promise.all(writes);
          return jsonResponse({ ok: true, slug, ownerUid }, 200, cors);
        }

        const pwdMatch = pathname.match(/^\/api\/master\/tenants\/([a-z0-9_-]+)\/password$/);
        if (pwdMatch && request.method === 'POST') {
          const slug = pwdMatch[1];
          const body = await request.json().catch(() => null);
          const newPass = String((body && body.newPassword) || '').trim();
          const forceLogout = Boolean(body && body.forceLogout);
          const prevCandidates = Array.isArray(body && body.prevPasswords) ? body.prevPasswords : [];
          if (!newPass || newPass.length < 6) {
            return jsonResponse({ error: 'Password must be at least 6 characters' }, 400, cors);
          }

          const ownerUid = await updateTenantAuthPassword(env, slug, newPass, prevCandidates);
          const now = Date.now();
          const ops = [
            rtdbAdminFetch(env, `tenantPrivate/${slug}.json`, 'PATCH', {
              adminPassword: newPass,
              ownerUid,
              lastPasswordUpdate: now
            }),
            rtdbAdminFetch(env, `restaurants/${slug}/settings/adminPassword.json`, 'DELETE').catch(() => null),
            rtdbAdminFetch(env, `restaurants/${slug}/settings/subscription/adminPassword.json`, 'DELETE').catch(() => null),
            rtdbAdminFetch(env, `licenses/${slug}/adminPassword.json`, 'DELETE').catch(() => null)
          ];
          if (forceLogout) {
            ops.push(rtdbAdminFetch(env, `licenses/${slug}.json`, 'PATCH', { sessionVersion: now, lastPasswordUpdate: now }));
            ops.push(rtdbAdminFetch(env, `restaurants/${slug}/meta.json`, 'PATCH', { sessionVersion: now, lastPasswordUpdate: now }));
          }
          await Promise.all(ops);
          return jsonResponse({ ok: true, slug, ownerUid, sessionVersion: forceLogout ? now : undefined }, 200, cors);
        }

        if (pathname === '/api/master/github-sync' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          let token = (env.GITHUB_SYNC_TOKEN || '').trim();
          if (!token) {
            const cfgToken = await rtdbAdminFetch(env, 'masterConfig/githubToken.json', 'GET').catch(() => null);
            if (typeof cfgToken === 'string') token = cfgToken.trim();
          }
          if (!token) {
            return jsonResponse({ ok: false, reason: 'missing_token' }, 200, cors);
          }

          const owner = env.GITHUB_REPO_OWNER || 'abdelraouf-harpy';
          const repo = env.GITHUB_REPO_NAME || 'links';
          const wf = env.GITHUB_SYNC_WORKFLOW || 'sync-tenants.yml';
          const dispatchBody = { ref: 'main' };
          if (body && body.hintSlug) dispatchBody.inputs = { hint_slug: String(body.hintSlug) };

          const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${wf}/dispatches`, {
            method: 'POST',
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${token}`,
              'X-GitHub-Api-Version': '2022-11-28',
              'User-Agent': 'harpy-api-worker',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(dispatchBody)
          });
          if (!ghRes.ok) {
            return jsonResponse({ ok: false, status: ghRes.status }, 502, cors);
          }
          return jsonResponse({ ok: true }, 200, cors);
        }
      }

      return jsonResponse({ error: 'Not found' }, 404, cors);
    } catch (err) {
      return jsonResponse({ error: err.message || 'Internal error' }, err.status || 500, cors);
    }
  }
};
