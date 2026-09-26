# CINEMART auth worker

Email/password auth API for CINEMART on Cloudflare Workers + D1.
Passwords are PBKDF2-SHA256 hashes; sessions are opaque tokens
(only SHA-256 hashes stored in D1).

**Deployed:** https://cinemart-auth.cinemart-auth.workers.dev

## Endpoints (JSON)

- `GET  /api/health`
- `POST /api/auth/signup` `{ email, password }` → `201 { user, token }`
- `POST /api/auth/login` `{ email, password }` → `200 { user, token }`
- `POST /api/auth/logout` (Bearer token) → `200 { ok: true }`
- `GET  /api/auth/me` (Bearer token) → `200 { user }`

Errors look like `{ "error": { "code": "email_taken", "message": "..." } }`.

## Local development (no Cloudflare account needed)

```bash
npm install
npm run db:migrate:local   # create local D1 tables
npm run dev                # http://127.0.0.1:8787
```

Point the frontend at it with `VITE_AUTH_API_URL=http://127.0.0.1:8787`
in `Movies-main/.env` (gitignored). `ALLOWED_ORIGIN` in `wrangler.jsonc`
must match the Vite dev URL.

If you run the Vite dev server in the parent project, note that
`vite.config.js` already ignores `**/auth-worker/**` — otherwise the
worker's local `.wrangler` SQLite writes trigger full-page HMR reloads.

## Deploy

```bash
npm run db:migrate:remote
npm run deploy
```

`database_id` is already committed in `wrangler.jsonc`. To create a fresh
database instead, run `wrangler d1 create cinemart-auth-db` and copy the
returned id into `wrangler.jsonc`.

After deploying, set the frontend's `VITE_AUTH_API_URL` to the Worker URL
and update `ALLOWED_ORIGIN` to the site's origin, then redeploy.

## Security notes

- **PBKDF2 iteration cap.** Cloudflare Workers' Web Crypto rejects
  `deriveBits` above **100,000 iterations** for PBKDF2 — this is a platform
  limit, not a plan limit, so a paid plan does not raise it. OWASP currently
  recommends 600,000 for PBKDF2-HMAC-SHA256, so this sits below that
  guidance. `parseIterations()` throws at startup if `PBKDF2_ITERATIONS`
  is set above 100,000, to fail loudly instead of returning error 1101.
- **Rate limiting is D1-backed, not the Cloudflare Rate Limiting binding.**
  The binding was tested against the deployed Worker and did not enforce
  across separate HTTP requests (10/10 bad logins passed), even though it
  worked when called repeatedly inside a single request. Counts now live in
  a `rate_limits` D1 table using an atomic upsert with `RETURNING`, which is
  strongly consistent and verifiable in production.
  - Failed logins: 5 per account per 60s window.
  - Signups: 3 per client IP per 60s window.
- **CORS** is an exact-origin allow-list; a mismatched `Origin` gets 403
  before any handler runs. Requests without an `Origin` header (e.g. curl)
  are allowed, so the Worker is a public API — the rate limits and
  PBKDF2 cost are the real protections.
- Bodies are capped at 8 KB and the reader cancels the stream as soon as
  the cap is exceeded, so an oversized chunked upload is never buffered.
- There are **no secrets** in this config; all settings are plain `vars`.
