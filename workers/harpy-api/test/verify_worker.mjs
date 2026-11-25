import assert from 'node:assert';
import crypto from 'node:crypto';
import worker from '../src/index.js';

let pass = 0, fail = 0;
async function test(name, fn) {
  try {
    await fn();
    pass++;
    console.log(`[PASS] ${name}`);
  } catch (err) {
    fail++;
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' });

const mockEnv = {
  FIREBASE_PROJECT_ID: 'harpy-order',
  RTDB_BASE_URL: 'https://harpy-order-default-rtdb.firebaseio.com',
  ONESIGNAL_APP_ID: 'c8c2ee02-8064-4c05-97bc-c2ff272b9627',
  ONESIGNAL_REST_KEY: 'test-onesignal-rest-key',
  FIREBASE_WEB_API_KEY: 'test-web-api-key',
  MASTER_ADMIN_SECRET: 'SuperStrongMasterPass!2026',
  JWT_SIGNING_SECRET: 'jwt-signing-secret-test-64chars-abcdefghijklmnopqrstuvwxyz123456',
  FIREBASE_MASTER_KEY: 'legacy-master-key-fallback',
  ALLOW_LOCALHOST_CORS: 'true'
};

const mockState = {
  rtdb: {
    masterConfig: { founderName: 'Abdelraouf', githubToken: 'ghp_secret_pat', pin: '9999', sessionVersion: 100 },
    domains: { customshop_com: 'smoke' },
    licenses: {
      king: { active: true, suspended: false, status: 'active', restaurantName: 'King' }
    },
    restaurants: {
      king: {
        meta: { ownerUid: 'uid-king-owner' },
        settings: { storeName: 'مطعم كينج' },
        orders: {
          'ORD-100': {
            orderId: 'ORD-100',
            source: 'web',
            type: 'delivery',
            finalTotal: 250,
            timestamp: Date.now(),
            customer: { name: 'أحمد' }
          },
          'ORD-POS': {
            orderId: 'ORD-POS',
            source: 'pos',
            finalTotal: 100,
            timestamp: Date.now()
          },
          'ORD-OLD': {
            orderId: 'ORD-OLD',
            source: 'web',
            finalTotal: 100,
            timestamp: Date.now() - 25 * 60 * 1000
          }
        }
      }
    }
  },
  oneSignalCalls: [],
  identityCalls: []
};

const originalFetch = globalThis.fetch;
globalThis.fetch = async (urlStr, opts = {}) => {
  const u = new URL(urlStr);
  const body = opts.body ? (opts.headers && opts.headers['Content-Type'] === 'application/x-www-form-urlencoded' ? opts.body : JSON.parse(opts.body)) : null;

  if (u.hostname === 'harpy-order-default-rtdb.firebaseio.com') {
    const clean = u.pathname.replace(/^\/+/, '').replace(/\.json$/, '').split('/').filter(Boolean);
    const method = (opts.method || 'GET').toUpperCase();
    if (method === 'GET') {
      let cur = mockState.rtdb;
      for (const p of clean) cur = cur ? cur[p] : undefined;
      return new Response(JSON.stringify(cur === undefined ? null : cur), { status: 200 });
    }
    if (method === 'PUT' || method === 'PATCH') {
      let cur = mockState.rtdb;
      for (let i = 0; i < clean.length - 1; i++) {
        cur[clean[i]] = cur[clean[i]] || {};
        cur = cur[clean[i]];
      }
      const last = clean[clean.length - 1];
      if (method === 'PATCH' && cur[last] && typeof cur[last] === 'object' && typeof body === 'object') {
        Object.assign(cur[last], body);
      } else {
        cur[last] = body;
      }
      return new Response(JSON.stringify(body), { status: 200 });
    }
    if (method === 'DELETE') {
      let cur = mockState.rtdb;
      for (let i = 0; i < clean.length - 1; i++) cur = cur ? cur[clean[i]] : undefined;
      if (cur) delete cur[clean[clean.length - 1]];
      return new Response('null', { status: 200 });
    }
  }

  if (u.hostname === 'api.onesignal.com') {
    mockState.oneSignalCalls.push({ headers: opts.headers, body });
    return new Response(JSON.stringify({ id: 'notif-1', recipients: 1 }), { status: 200 });
  }

  if (u.hostname === 'oauth2.googleapis.com') {
    return new Response(JSON.stringify({ access_token: 'mock-google-oauth-token', expires_in: 3600 }), { status: 200 });
  }

  if (u.hostname === 'identitytoolkit.googleapis.com') {
    mockState.identityCalls.push({ url: u.pathname, headers: opts.headers, body });
    if (u.pathname.endsWith('/accounts:lookup')) {
      if (body.idToken === 'valid-king-token') {
        return new Response(JSON.stringify({ users: [{ localId: 'uid-king-owner', email: 'king@harpymenu.com' }] }), { status: 200 });
      }
      if (body.idToken === 'valid-other-token') {
        return new Response(JSON.stringify({ users: [{ localId: 'uid-other', email: 'other@harpymenu.com' }] }), { status: 200 });
      }
      if (Array.isArray(body.email) && body.email[0] === 'newshop@harpymenu.com') {
        return new Response(JSON.stringify({ users: [] }), { status: 200 });
      }
      return new Response(JSON.stringify({ users: [{ localId: 'uid-existing', email: (body.email && body.email[0]) || 'x@y.com' }] }), { status: 200 });
    }
    if (u.pathname.endsWith('/accounts')) {
      return new Response(JSON.stringify({ localId: 'uid-newshop' }), { status: 200 });
    }
    if (u.pathname.endsWith('/accounts:update')) {
      return new Response(JSON.stringify({ localId: body.localId || 'uid-updated' }), { status: 200 });
    }
  }

  return new Response(JSON.stringify({ error: 'Unmocked ' + urlStr }), { status: 500 });
};

await test('GET /health returns status without exposing secrets', async () => {
  const res = await worker.fetch(new Request('https://api.harpymenu.com/health', { headers: { Origin: 'https://harpymenu.com' } }), mockEnv);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.ok, true);
  assert.strictEqual(data.oneSignalConfigured, true);
  assert.strictEqual(JSON.stringify(data).includes('test-onesignal-rest-key'), false);
});

await test('Blocks unknown Origin via CORS check', async () => {
  const res = await worker.fetch(new Request('https://api.harpymenu.com/health', { headers: { Origin: 'https://evil-attacker.com' } }), mockEnv);
  assert.strictEqual(res.status, 403);
});

await test('Allows dynamically registered custom tenant domains in RTDB', async () => {
  const res = await worker.fetch(new Request('https://api.harpymenu.com/health', { headers: { Origin: 'https://customshop.com' } }), mockEnv);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), 'https://customshop.com');
});

let masterToken = '';
await test('Master login rejects wrong password and locks out after 5 tries', async () => {
  for (let i = 0; i < 5; i++) {
    const r = await worker.fetch(new Request('https://api.harpymenu.com/api/master/login', {
      method: 'POST',
      headers: { Origin: 'https://harpymenu.com', 'CF-Connecting-IP': '1.2.3.4', 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong' })
    }), mockEnv);
    assert.strictEqual(r.status, 401);
  }
  const rLocked = await worker.fetch(new Request('https://api.harpymenu.com/api/master/login', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', 'CF-Connecting-IP': '1.2.3.4', 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: mockEnv.MASTER_ADMIN_SECRET })
  }), mockEnv);
  assert.strictEqual(rLocked.status, 429);
});

await test('Master login succeeds with valid secret and returns signed JWT without raw githubToken/pin', async () => {
  const r = await worker.fetch(new Request('https://api.harpymenu.com/api/master/login', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', 'CF-Connecting-IP': '5.6.7.8', 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: mockEnv.MASTER_ADMIN_SECRET })
  }), mockEnv);
  assert.strictEqual(r.status, 200);
  const data = await r.json();
  assert.ok(data.token && data.token.includes('.'));
  assert.strictEqual(data.config.hasGithubToken, true);
  assert.strictEqual('githubToken' in data.config, false);
  assert.strictEqual('pin' in data.config, false);
  masterToken = data.token;
});

await test('Master RTDB rejects unauthenticated calls and path traversal', async () => {
  const rNoAuth = await worker.fetch(new Request('https://api.harpymenu.com/api/master/rtdb', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: 'licenses.json', method: 'GET' })
  }), mockEnv);
  assert.strictEqual(rNoAuth.status, 401);

  const rBadPath = await worker.fetch(new Request('https://api.harpymenu.com/api/master/rtdb', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', Authorization: `Bearer ${masterToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: '../.settings/rules.json', method: 'PUT', data: {} })
  }), mockEnv);
  assert.strictEqual(rBadPath.status, 400);
});

await test('Master RTDB strips githubToken & pin when reading masterConfig', async () => {
  const r = await worker.fetch(new Request('https://api.harpymenu.com/api/master/rtdb', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', Authorization: `Bearer ${masterToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: 'masterConfig.json', method: 'GET' })
  }), mockEnv);
  assert.strictEqual(r.status, 200);
  const body = await r.json();
  assert.strictEqual(body.data.hasGithubToken, true);
  assert.strictEqual('githubToken' in body.data, false);
  assert.strictEqual('pin' in body.data, false);
});

await test('Service Account Admin API provisions new tenant & isolates secrets in tenantPrivate', async () => {
  const saEnv = {
    ...mockEnv,
    FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
      client_email: 'firebase-adminsdk@harpy-order.iam.gserviceaccount.com',
      private_key: privPem,
      project_id: 'harpy-order'
    })
  };
  const r = await worker.fetch(new Request('https://api.harpymenu.com/api/master/tenants', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', Authorization: `Bearer ${masterToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: 'newshop',
      name: 'New Shop',
      phone: '01012345678',
      businessType: 'store',
      password: 'shopPass99',
      price: 899,
      expTimestamp: 0
    })
  }), saEnv);
  assert.strictEqual(r.status, 200);
  const res = await r.json();
  assert.strictEqual(res.ownerUid, 'uid-newshop');
  assert.strictEqual('adminPassword' in mockState.rtdb.licenses.newshop, false);
  assert.strictEqual('adminPassword' in mockState.rtdb.restaurants.newshop.settings, false);
  assert.strictEqual(mockState.rtdb.tenantPrivate.newshop.adminPassword, 'shopPass99');
  assert.ok(mockState.identityCalls.some(c => c.url === '/v1/projects/harpy-order/accounts' && c.headers.Authorization === 'Bearer mock-google-oauth-token'));
});

await test('Push order sends verified OneSignal push server-side & prevents duplicate replay', async () => {
  mockState.oneSignalCalls.length = 0;
  const r1 = await worker.fetch(new Request('https://api.harpymenu.com/api/push/order', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'king', orderId: 'ORD-100', origin: 'https://harpymenu.com', basePath: '/admin/' })
  }), mockEnv);
  assert.strictEqual(r1.status, 200);
  assert.strictEqual(mockState.oneSignalCalls.length, 1);
  assert.strictEqual(mockState.oneSignalCalls[0].headers.Authorization, 'Key test-onesignal-rest-key');
  assert.ok(mockState.oneSignalCalls[0].body.headings.ar.includes('ORD-100'));

  const r2 = await worker.fetch(new Request('https://api.harpymenu.com/api/push/order', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'king', orderId: 'ORD-100', origin: 'https://harpymenu.com', basePath: '/admin/' })
  }), mockEnv);
  const d2 = await r2.json();
  assert.strictEqual(d2.skipped, 'already_notified');
  assert.strictEqual(mockState.oneSignalCalls.length, 1);
});

await test('Push order ignores fake/non-existent, POS, and stale orders', async () => {
  mockState.oneSignalCalls.length = 0;
  const rMissing = await worker.fetch(new Request('https://api.harpymenu.com/api/push/order', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'king', orderId: 'ORD-FAKE' })
  }), mockEnv);
  assert.strictEqual(rMissing.status, 404);

  const rPos = await worker.fetch(new Request('https://api.harpymenu.com/api/push/order', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'king', orderId: 'ORD-POS' })
  }), mockEnv);
  assert.strictEqual((await rPos.json()).skipped, 'pos_order');

  const rOld = await worker.fetch(new Request('https://api.harpymenu.com/api/push/order', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'king', orderId: 'ORD-OLD' })
  }), mockEnv);
  assert.strictEqual((await rOld.json()).skipped, 'stale_order');
  assert.strictEqual(mockState.oneSignalCalls.length, 0);
});

await test('Push test requires matching tenant Firebase Auth ID token', async () => {
  mockState.oneSignalCalls.length = 0;
  const rUnauth = await worker.fetch(new Request('https://api.harpymenu.com/api/push/test', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'king' })
  }), mockEnv);
  assert.strictEqual(rUnauth.status, 401);

  const rWrongTenant = await worker.fetch(new Request('https://api.harpymenu.com/api/push/test', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', Authorization: 'Bearer valid-other-token', 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'king' })
  }), mockEnv);
  assert.strictEqual(rWrongTenant.status, 403);

  const rOk = await worker.fetch(new Request('https://api.harpymenu.com/api/push/test', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', Authorization: 'Bearer valid-king-token', 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'king', origin: 'https://harpymenu.com', isSubdir: false })
  }), mockEnv);
  assert.strictEqual(rOk.status, 200);
  assert.strictEqual(mockState.oneSignalCalls.length, 1);
});

await test('Logout-all bumps sessionVersion and revokes prior master tokens', async () => {
  const rLogout = await worker.fetch(new Request('https://api.harpymenu.com/api/master/logout-all', {
    method: 'POST',
    headers: { Origin: 'https://harpymenu.com', Authorization: `Bearer ${masterToken}` }
  }), mockEnv);
  assert.strictEqual(rLogout.status, 200);

  const rReuse = await worker.fetch(new Request('https://api.harpymenu.com/api/master/session', {
    method: 'GET',
    headers: { Origin: 'https://harpymenu.com', Authorization: `Bearer ${masterToken}` }
  }), mockEnv);
  assert.strictEqual(rReuse.status, 401);
});

globalThis.fetch = originalFetch;
console.log(`\nWorker Unit Tests: ${pass} PASSED, ${fail} FAILED`);
if (fail > 0) process.exit(1);
