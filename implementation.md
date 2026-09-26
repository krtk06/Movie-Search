# CINEMART — Pixel Art Redesign · Implementation Plan

> **Status:** Active · **Branch:** `ft/redesign` · **Repo:** `krtk06/Movie-Search` · **Local:** `Movies-main/`
> **Audience:** humans + coding agents. Each phase is independently executable and verifiable.
> **Working agreement:** implement phase by phase; commit each meaningful step as
> `feat|fix|update|chore: one_line_description`; stop after each phase for review.

---

## 1. Overview

CINEMART is a React 19 + Vite 6 + Tailwind v4 + `motion` movie search app (OMDb data, TMDB
streaming availability, auth, localStorage favorites). This plan converts the entire UI to a
**cohesive pixel-art ("8-bit") theme** — every page, component, icon and interaction — while
preserving all functionality, then cleans up accumulated tech debt.

## 2. Goals / Non-goals

**Goals**
- Full pixel-art visual system across all routes (Home, Movie Detail, Collection, About, Login, + new 404).
- Real dark **and** light pixel themes with a working toggle.
- Hand-rolled pixel icon set (no smooth line icons).
- Real Cloudflare Workers Auth (email/password, Worker + D1) with a local demo fallback.
- Fix functional/visual bugs found in browser QA.
- Remove dead code, unused deps/assets, and fix env/API-key handling.

**Non-goals**
- No framework or styling-library migration (stay React + Tailwind v4 + `App.css`).
- No Firestore / no server-side favorites (favorites stay in localStorage).
- No new frontend runtime dependencies (auth uses the platform `fetch`; `firebase` removed in Phase 12).

## 3. Decisions Log

| # | Decision | Choice |
|---|----------|--------|
| D1 | Scope | Full visual overhaul (all features/routes preserved) |
| D2 | Direction | Pixel-art theme for every element |
| D3 | Brand | Keep **CINEMART** (mark, copy, favicon) |
| D4 | Fonts | **Press Start 2P** (display/logo) + **Pixelify Sans** (body/UI) |
| D5 | Posters | Framed hi-res images + chunky pixel borders + `image-rendering: pixelated` (no canvas pixelation) |
| D6 | Theme | Dark **+** light toggle, wiring the existing `ThemeContext` properly |
| D7 | Cleanup | Address all loose ends (§10) |
| D8 | Icons | Hand-rolled pixel SVG set; remove `lucide-react` |
| D9 | Styling | Keep `App.css` class system + Tailwind v4 utilities; move inline styles into CSS |
| D10 | Motion | Snappy, stepped (`steps()`) animations; no soft eases/blur |
| D11 | Auth | **Cloudflare Workers + D1** (email/password, see Phase 12) with localStorage **demo fallback** when unconfigured |
| D12 | Auth config | `.env.example` documents `VITE_AUTH_API_URL`; Worker config (`auth-worker/wrangler.jsonc`) holds `ALLOWED_ORIGIN` |
| D13 | Favorites | Stay in localStorage (per-account sync out of scope) |
| D14 | Font delivery | Google Fonts CDN |
| D15 | Bug handling | Fix functional bugs found in QA on this branch, in addition to the redesign |

## 4. Current State (as-is)

- **Routes:** `/`, `/favorites` (protected), `/movie/:imdbID`, `/about`, `/login`.
- **Providers:** `BrowserRouter` → `ThemeProvider` → `AuthProvider` → `FavText(FavoritesContext)` → `App`.
- **Styling:** `src/App.css` (~2009 lines, single source of truth) + `@import "tailwindcss"`;
  heavy inline styles in `MovieGrid`, `MovieDetail`, `Favorites`, `App`.
- **Data:** `API/omdb.js` (hardcoded key), `API/tmdb.jsx` (hardcoded fallback key), `API/translate.js` (MyMemory).
- **Dead code:** `Components/CustomCursor.jsx`, `Components/Mannequin.jsx` (unused).
- **Unused deps:** `firebase` (to be used), `simple-icons`, `tailwindcss-motion`.
- **Unused assets:** `sunday-walks/`, `the-japan/`, `public/fonts/`, `Background/` (duplicate of `public/video/login-bg.mp4`).
- **Theme bug:** `ThemeProvider` adds `.light` but no light styles exist; `useTheme` never consumed.
- **Lint baseline:** 0 errors, 7 warnings (exhaustive-deps + react-refresh).

## 5. Target Design System

### 5.1 Palette (CSS custom properties)

| Token | Dark (`:root`) | Light (`html.light`) |
|-------|----------------|----------------------|
| `--bg` | `#12101c` | `#f4ead8` |
| `--bg-2` | `#1b1830` | `#ece0c8` |
| `--panel` | `#221d38` | `#fff8e7` |
| `--panel-2` | `#2b2447` | `#f7efd8` |
| `--line` | `#000000` | `#201a2e` |
| `--ink` | `#f4ead8` | `#201a2e` |
| `--ink-2` | `#c9bfa8` | `#4a4058` |
| `--ink-3` | `#8a7f6a` | `#7a7088` |
| `--accent` | `#e5344a` | `#e5344a` |
| `--accent-2` | `#f2b632` | `#f2b632` |
| `--ok` / `--err` / `--info` | `#6ab04c` / `#e5344a` / `#4aa3e5` | same |

### 5.2 Typography
- `--font-display: "Press Start 2P"` — logo, page titles, section heads, buttons, labels.
- `--font-body: "Pixelify Sans"` — body copy, metadata, forms.
- Body 16px / line-height 1.5; display uses `clamp()`; `text-wrap: balance` on titles; heavy
  tracking on labels; never use Press Start 2P for long paragraphs.

### 5.3 Shape, surface, texture
- `border-radius: 0` everywhere (override all existing radii).
- Chunky borders: 3px inputs/small, 4px panels, 6px hero/frames.
- Hard offset shadows only: `box-shadow: 4px 4px 0 var(--line)` (light source: down-right). No blur.
- `image-rendering: pixelated` on scaled imagery.
- Replace `.grain`/`.vignette` with `.fx-scanlines` + `.fx-dither`, fixed, `pointer-events:none`.

### 5.4 Motion
- Durations 90 / 180 / 320ms with `steps(2)`–`steps(6)` easing.
- Press interaction: `translate(2px,2px)` + shadow collapse; hover: solid color swap / hard lift.
- Blinking caret animation for the hero; stepped reveals via `RevealOnScroll` (retuned).
- Keep the `prefers-reduced-motion` kill-switch.

### 5.5 Icons & z-index
- `PixelIcon.jsx` exports crisp-edge SVGs: `Search, Heart, Star, ArrowRight, ArrowLeft,
  ArrowUpRight, Film, Clapperboard, Menu, X, Info, Clock, Calendar, User, Award, Eye, EyeOff,
  AlertCircle, Sparkles, Languages, ExternalLink, Sun, Moon`.
- z-index scale: `--z-menu 95`, `--z-nav 100`, `--z-fx 9990`.

## 6. Phase Plan

### Phase 0 — Baseline QA & Bug Log
**Goal:** Establish the functional baseline and catch bugs independently of styling.
- Start `npm run dev`; drive Chrome via the `agent-browser` skill (session `cine`).
- Capture console + page errors, walk every route/flow (search, translation banner, detail,
  favorite add/remove, signup/login/logout, About, mobile viewport, 404 probe).
- Record findings in the bug table (§6.1); classify **functional** (must fix) vs **visual**.
**Acceptance:** Bug table populated; functional bugs fixed or scheduled.

### Phase 1 — Design Tokens, Fonts, Base & Theme Skeleton
**Files:** `index.html`, `src/App.css`, `src/App.jsx`, `src/main.jsx`.
- Swap Google Fonts link (D4); update `--font-*`.
- Rewrite `:root` + add `html.light`; base resets, scrollbar, selection, focus.
- Swap FX overlay classes; update `App.jsx` usage.
- Confirm `ThemeContext` toggles `html.light`; add `color-scheme` + dynamic `theme-color`.
**Acceptance:** Both themes render base tokens; no unstyled FOUC. **Verify:** devtools + lint.

### Phase 2 — Pixel Primitives & Icons
**Files:** add `src/Components/PixelIcon.jsx`, `src/Components/PixelFrame.jsx`; `App.css`.
- Implement icon set + CSS primitives: `.pixel-btn`, `.pixel-panel`, `.pixel-tag`,
  `.pixel-input`, `.pixel-meter`, `.pixel-skeleton`, `.pixel-card`.
- Replace all `lucide-react` imports across the 6 files.
**Acceptance:** zero `lucide-react` imports; icons crisp at integer sizes.

### Phase 3 — NavBar + Theme Toggle
**Files:** `src/Components/NavBar.jsx`, `App.css`.
- Pixel logo, nav links + active state, mobile slide-over.
- Theme toggle button consuming `useTheme()` (`aria-label`, 44px target).
**Acceptance:** toggle switches themes and persists via `cinephile_theme`; active route styled.

### Phase 4 — Home (`MovieGrid.jsx`)
- Pixel hero: blocky `CINEMART` wordmark, blinking caret, pixel search bar + chunky button,
  pixel suggestion chips.
- Restyle Recommended + Results grids with `PixelFrame`; pixel skeletons/empty/error states;
  stepped staggered entry.
- Move inline footer styles → `.site-footer` CSS.
**Acceptance:** search, suggestions, translation banner, favorite toggle, loading/empty/error work.

### Phase 5 — Movie Detail (`MovieDetail.jsx`)
- Pixel poster frame, "stat cartridge" panels, ratings as pixel meters, pixel platform tiles,
  marquee, stepped scroll motion.
**Acceptance:** data, ratings, streaming tiles, back nav, not-found state all work.

### Phase 6 — Collection (`Favorites.jsx`)
- Pixel header/count, pixel grid, "NO SAVE DATA" empty state, pixel marquee. Inline styles → CSS.
**Acceptance:** add/remove persists; empty state correct.

### Phase 7 — About (`About.jsx`)
- Pixel editorial layout; **fix copy**: remove "Firebase Auth" claim; tech tags → React 19, Vite,
  Tailwind v4, OMDb API, TMDB, Motion, Firebase Auth.
**Acceptance:** accurate content, on-theme.

### Phase 8 — Cloudflare Workers Auth + Demo Fallback + Login
*(Superseded in Phase 12 — this phase originally introduced Firebase; auth now runs on a
Cloudflare Worker + D1. See Phase 12 for the shipped design.)*
**Files:** add `src/lib/firebase.js`; `src/Context/AuthContext.jsx`, `src/Components/Login.jsx`,
`.env.example`.
- `firebase.js`: initialize from `import.meta.env.VITE_FIREBASE_{API_KEY,AUTH_DOMAIN,PROJECT_ID,
  STORAGE_BUCKET,MESSAGING_SENDER_ID,APP_ID}`; export `auth` or `null` when unconfigured.
- `AuthContext.jsx`:
  - Firebase path: `onAuthStateChanged`, `createUserWithEmailAndPassword`,
    `signInWithEmailAndPassword`, `signOut`; user shape `{ uid, email }`.
  - Demo path (no config): existing localStorage logic behind the same context API; expose `isDemo`.
- `Login.jsx`: map Firebase error codes → friendly messages; show demo-mode notice.
- `.env.example`: add Firebase vars alongside `VITE_OMDB_API_KEY` and `VITE_TMDB_API_KEY`.
**Acceptance:** demo path works end-to-end; Firebase path compiles and is testable once keys exist.

### Phase 9 — 404, A11y & Meta
**Files:** add `src/Components/NotFound.jsx`; `App.jsx`, `index.html`.
- Route `path="*"` → pixel "GAME OVER — reel not found" page with links home.
- Skip-to-content link; semantic `<main>/<nav>/<section>`; refreshed title/description/OG +
  pixel favicon.
**Acceptance:** unknown URL shows 404; keyboard skip-link works.

### Phase 10 — Cleanup
**Files:** `package.json`, `.env.example`, `API/omdb.js`, `API/tmdb.jsx`; delete dead files.
- `omdb.js`: read `import.meta.env.VITE_OMDB_API_KEY` (env-first).
- `tmdb.jsx`: remove hardcoded fallback → env-only (graceful null already handled).
- `.env.example`: document both `VITE_OMDB_API_KEY` and `VITE_TMDB_API_KEY` (+ `VITE_AUTH_API_URL`).
- Remove deps `simple-icons`, `tailwindcss-motion`, `lucide-react`; run `npm install`.
- Delete `CustomCursor.jsx`, `Mannequin.jsx`, `sunday-walks/`, `the-japan/`, `public/fonts/`,
  `Background/`.
- Replace remaining `100vh` → `100dvh`.
**Acceptance:** app runs; no references to removed files. **Verify:** lint + build.

### Phase 11 — Final QA, Build & Commit
- Re-run full `agent-browser` QA in **both themes** (desktop + mobile viewports).
- `npm run lint` + `npm run build`.
- Commit per-phase on `ft/redesign`; push only on explicit request.

### Phase 12 — Cloudflare Workers Auth (replaces Firebase)
**Decision:** user rejected Firebase; auth now runs on a Cloudflare Worker + D1, deployed from
`auth-worker/`. Frontend reads `VITE_AUTH_API_URL`; when unset it falls back to the local demo mode.

**Files:** add `auth-worker/` (Worker + D1 migration + Vitest suite), `src/lib/cloudflare-auth.js`,
`src/lib/cloudflare-auth.test.js`, `src/Context/AuthContext.test.js`, `vitest.config.js`; modify
`src/Context/AuthContext.jsx`, `src/Components/Login.jsx`, `src/Components/About.jsx`, `.env.example`,
`vite.config.js`, `package.json`, `.gitignore`; delete `src/lib/firebase.js`.

- **Worker API** (`auth-worker/src/index.js`): `GET /api/health`, `POST /api/auth/{signup,login,logout}`,
  `GET /api/auth/me`. PBKDF2-SHA256 password hashing (100k iterations, per-user salt); opaque
  32-byte session tokens stored in D1 as SHA-256 hashes (raw token never persisted).
- **Security:** exact-origin CORS allow-list (mismatched `Origin` → 403), `Cache-Control: no-store`,
  security headers, bounded request-body reader (rejects >8 KB even without `Content-Length`),
  generic login errors, constant-time hash comparison, and D1-backed rate limits
  (5 failed logins/account/60s, 3 signups/client-IP/60s) via an atomic upsert + `RETURNING`.
- **Frontend client** (`src/lib/cloudflare-auth.js`): `Authorization: Bearer` session stored in
  `localStorage` under `cinephile_cloudflare_session` (separate from demo key `cinephile_session`);
  validates Worker responses; clears the token only on `401` (preserves it on transient network/5xx).
- **AuthContext:** identical public API (`user, loading, login, signup, logout, isDemo`); Cloudflare
  path restores the session via `/me` on mount, demo path restores synchronously.
- **Vite watcher fix:** `vite.config.js` ignores `**/auth-worker/**` so the Worker's local
  `.wrangler` SQLite writes don't trigger full-page HMR reloads during auth flows.
- **Dependency hygiene:** removed `firebase`; upgraded `react-router-dom` → 7.18.4 and `vite` →
  6.4.3 for security advisories; added `overrides` to force patched transitive versions
  (`npm audit` → 0 vulnerabilities). JS bundle shrank ~573 kB → ~413 kB.
- **Tests:** 11 Worker tests (`@cloudflare/vitest-plugin`, real D1 + rate-limit tables) and 9
  frontend tests (jsdom, `cloudflare-auth` + `AuthContext`).
**Acceptance:** `npm test` (both suites) green; `npm run lint` 0 errors; `npm run build` clean;
`npm audit` 0 vulnerabilities; browser QA of signup → protected route → logout → login with the
local Worker. **Deployed:** https://cinemart-auth.cinemart-auth.workers.dev (D1
`cinemart-auth-db`, APAC). Production-verified: signup/login/me/logout, CORS 403 on wrong
origin, brute force → 429 after 5 attempts, signup flood → 429 after 3, password stored as
`pbkdf2-sha256$100000$…`. Remaining: set `ALLOWED_ORIGIN` to the deployed site origin and put the
Worker URL in `VITE_AUTH_API_URL`.

### 6.1 Phase 0 Bug Log

**Baseline verified working (no console/page errors):** home load, search, French→English
translation banner, movie detail (+ streaming tiles via TMDB), favorites add/remove, signup →
protected route → logout, About, marquee. No horizontal overflow at 390px.

| # | Area | Route/Flow | Description | Severity | Type | Fix phase | Status |
|---|------|-----------|-------------|----------|------|-----------|--------|
| 1 | Nav | mobile ≤900px | `.nav-mobile-toggle` sits inside `.nav-right`, which is `display:none` at ≤900px → hamburger never visible; all nav links unreachable on mobile | High | Functional | Phase 3 | Fixed (Phase 3) |
| 2 | Search | Home | On a failed search, the error state and **stale** previous results render simultaneously; results header shows the failed query ("Found 10 films for \"zzzqqqxyz\"") over old data (`movies` not cleared) | Medium | Functional/UX | Phase 4 | Fixed (Phase 4) |
| 3 | Home | `/` initial load | Results header shows `Found 10 films for ""` because trending populates `movies` without a query | Low | UX | Phase 4 | Fixed (Phase 4) |
| 4 | Home | `/` initial load | "Recommended for You" and "Search Results" show identical `2025` content | Low | UX | Phase 4 | Fixed (Phase 4) |
| 5 | Login | `/login` | `<label>`s not associated with inputs (no `htmlFor`/`id`); screen readers can't associate fields | Medium | A11y | Phase 8 | Fixed (Phase 8) |
| 6 | Cards | Home/Collection | Favorite button is `opacity:0` until `.movie-card:hover`; invisible on touch/keyboard (undiscoverable) | Medium | A11y/UX | Phase 4/6 | Fixed (Phase 4) |
| 7 | Nav | mobile menu | `.nav-mobile-menu` links stay in the a11y tree when closed (no `aria-hidden`/`inert`) | Low | A11y | Phase 3 | Fixed (Phase 3) |
| 8 | Routing | any unknown URL | No `*` route → blank page instead of a 404 | Medium | Functional | Phase 9 | Fixed (Phase 9) |
| 9 | Theme | global | `ThemeContext` unused; no light mode reachable | Medium | Functional | Phase 1/3 | Fixed (Phase 3) |
| 10 | A11y | global | No skip-to-content link | Low | A11y | Phase 9 | Fixed (Phase 9) |
| 11 | Home | mobile | `.results-grid` `1fr` tracks blow out from pixel-font `min-content` → ~4px horizontal overflow at 390px | Low | Layout | Phase 4 | Fixed (Phase 4) |
| 12 | Auth | `/favorites` direct load | Demo session restored in `useEffect` after first render, but `ProtectedRoute` redirected on first render → logged-in users bounced to `/login` on refresh/deep-link | High | Functional | Phase 11 | Fixed (Phase 11) |
| 13 | A11y | skip-link | Skip target `<main>` not focusable → keyboard activation scrolled but didn't move focus | Low | A11y | Phase 11 | Fixed (Phase 11) |
| 14 | Dev | local Worker + Vite | Worker `.wrangler` SQLite writes (D1, rate-limit, observability) sit inside the Vite watch root → every auth request triggered a full-page HMR reload, resetting the SPA mid-flow | High | Dev/Functional | Phase 12 | Fixed (Phase 12: `server.watch.ignored`) |
| 15 | Auth | deployed Worker | Route handlers were `return handleSignup(...)` without `await`, so the entrypoint `try/catch` could not catch handler rejections → raw Cloudflare error 1101 instead of structured JSON | Medium | Functional | Phase 12 | Fixed (Phase 12: `return await`) |
| 16 | Auth | deployed Worker | `PBKDF2_ITERATIONS=600000` (OWASP guidance) is rejected by Workers Web Crypto, which hard-caps PBKDF2 at 100,000 iterations → error 1101 on every signup/login | High | Functional | Phase 12 | Fixed (Phase 12: 100k + startup guard) |
| 17 | Auth | deployed Worker | Cloudflare Rate Limiting binding did not enforce across separate HTTP requests (10/10 bad logins passed) despite working within a single request → brute-force protection was a no-op | High | Security | Phase 12 | Fixed (Phase 12: D1-backed counters) |

## 7. File Manifest

**Create:** `src/Components/PixelIcon.jsx`, `src/Components/PixelFrame.jsx`,
`src/Components/NotFound.jsx`, `src/lib/cloudflare-auth.js`, `src/lib/cloudflare-auth.test.js`,
`src/Context/AuthContext.test.js`, `vitest.config.js`, `auth-worker/` (Worker, D1 migration, tests,
`wrangler.jsonc`), `implementation.md`.
**Modify:** `index.html`, `src/App.css`, `src/App.jsx`, `src/main.jsx`, `src/MovieGrid.jsx`,
`src/Components/{NavBar,MovieDetail,Favorites,About,Login,PlatformIcon,Marquee,ScrollProgress,
TiltCard,MagneticButton,RevealOnScroll}.jsx`, `src/Context/{ThemeContext,AuthContext}.jsx`,
`src/API/{omdb.js,tmdb.jsx}`, `package.json`, `vite.config.js`, `.env.example`, `.gitignore`.
**Delete:** `src/lib/firebase.js`, `src/Components/CustomCursor.jsx`, `src/Components/Mannequin.jsx`,
`sunday-walks/`, `the-japan/`, `public/fonts/`, `Background/`.

## 8. QA Protocol (agent-browser)

```bash
agent-browser --session cine open http://localhost:5173
agent-browser console --clear; agent-browser errors --clear
agent-browser screenshot --full /tmp/opencode/home-dark.png
agent-browser snapshot -i

agent-browser find placeholder "Search for a movie" fill "Inception"
agent-browser press Enter
agent-browser wait --text "Found"
agent-browser screenshot --full /tmp/opencode/results.png

agent-browser find first ".movie-card" click
agent-browser wait --text "Where to Watch"
agent-browser errors

agent-browser find role button click --name "Toggle favorite"
agent-browser open http://localhost:5173/favorites

agent-browser open http://localhost:5173/login
agent-browser find label "Email Address" fill "qa@test.com"
agent-browser find label "Password" fill "secret123"
agent-browser find role button click --name "Create Account"
agent-browser screenshot --full /tmp/opencode/auth.png

agent-browser open http://localhost:5173/nope
agent-browser find text "LIGHT" click
agent-browser screenshot --full /tmp/opencode/home-light.png
```

After each mutating action: `agent-browser console`, `agent-browser errors`,
`agent-browser network requests`.

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Press Start 2P too wide → overflow | Limit to logo/titles; use `clamp()`; short labels |
| `steps()` motion feels janky | Test per interaction; fall back to short linear |
| Light theme contrast for posters/overlays | Re-tune overlay/scrim tokens per theme |
| Missing an icon replacement | Phase 2 greps for `lucide-react`; lint catches undefined |
| OMDb/TMDB rate limits during QA | Reuse one query; avoid loops |
| Auth Worker not deployed / `VITE_AUTH_API_URL` unset | Demo fallback path keeps the app usable without a backend |
| Env change breaks running app | Keep graceful fallbacks; verify build |

## 10. Open Questions / Assumptions

1. **Auth deployment:** the Cloudflare Worker is verified locally (`wrangler dev` + local D1) but
   requires `wrangler login` and a real Cloudflare account to deploy. Steps in `auth-worker/README.md`.
   Until deployed, the frontend uses demo mode unless `VITE_AUTH_API_URL` is set.
2. **Fonts:** Google Fonts CDN (no self-hosting).
3. **Security:** the OMDb key (`4e2dfea1`) and TMDB fallback key are already in git history —
   rotate them; they were removed from source in Phase 10.

## 11. Commit Strategy

Small, phase-scoped commits on `ft/redesign` using the
`feat|fix|update|chore: one_line_description` convention (no phase/step numbers). No pushes until
explicitly requested.
