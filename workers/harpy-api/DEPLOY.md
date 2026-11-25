# HarpyAPI Cloudflare Worker Deployment & Key Rotation Guide

## 1. Install Wrangler & Authenticate
From `workers/harpy-api/`:
```bash
npm install -D wrangler
npx wrangler login
```

## 2. Configure Required Secrets
Set each secret securely inside Cloudflare Workers (never commit to Git):
```bash
npx wrangler secret put MASTER_ADMIN_SECRET
npx wrangler secret put JWT_SIGNING_SECRET
npx wrangler secret put ONESIGNAL_REST_KEY
npx wrangler secret put FIREBASE_WEB_API_KEY
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON
# Optional GitHub PAT for instant sync dispatch:
npx wrangler secret put GITHUB_SYNC_TOKEN
```

## 3. Deploy & Bind `api.harpymenu.com`
In `wrangler.toml`, uncomment the custom domain route for `api.harpymenu.com` (or bind it in Cloudflare Dashboard -> Workers -> `harpy-api` -> Settings -> Domains & Routes):
```bash
npx wrangler deploy
curl https://api.harpymenu.com/health
```

## 4. Rotate Previously Exposed Keys & Lock Firebase Signup
1. **Firebase Service Account**: Project Settings -> Service accounts -> Generate new private key (store in `FIREBASE_SERVICE_ACCOUNT_JSON`).
2. **Legacy Firebase Database Secret**: Project Settings -> Service accounts -> Database secrets -> **Delete/Revoke** the old exposed secret (once `FIREBASE_SERVICE_ACCOUNT_JSON` is active on the Worker, legacy secret is no longer needed; if `.github/workflows/sync-tenants.yml` still uses `FIREBASE_MASTER_KEY`, update that GitHub repo secret or remove it since public `licenses/{slug}` sync already works).
3. **OneSignal REST API Key**: OneSignal Dashboard -> Settings -> Keys & IDs -> Revoke/Regenerate REST API Key -> save new key into `ONESIGNAL_REST_KEY`.
4. **Firebase Auth Signup**: Firebase Console -> Authentication -> Settings -> User actions -> Uncheck **Enable create (sign-up)**.
5. Merge `fix/step5-cloudflare-worker-secrets` to `main` and push!
