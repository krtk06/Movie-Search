# CINEMART auth worker

Email/password auth API for CINEMART on Cloudflare Workers + D1.
Passwords are PBKDF2-SHA256 hashes; sessions are opaque tokens
(only SHA-256 hashes stored in D1).

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

## Deploy (needs a Cloudflare account)

```bash
wrangler login
npm run db:migrate:remote  # creates/updates the remote D1 database
wrangler deploy
```

Then set the frontend's `VITE_AUTH_API_URL` to the deployed
`https://<worker>.workers.dev` URL and update `ALLOWED_ORIGIN` in
`wrangler.jsonc` to the site's origin before deploying.

## Notes

- `PBKDF2_ITERATIONS` (default `100000`) is tunable via `vars`.
  Workers free tier allows ~10ms CPU per request; if signup/login
  exceeds it, lower the value (e.g. `10000`) or use a paid plan.
- There are no secrets in this config. All settings are plain `vars`.
