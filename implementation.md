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
- Real Firebase Auth (email/password) with a local demo fallback.
- Fix functional/visual bugs found in browser QA.
- Remove dead code, unused deps/assets, and fix env/API-key handling.

**Non-goals**
- No framework or styling-library migration (stay React + Tailwind v4 + `App.css`).
- No Firestore / no server-side favorites (favorites stay in localStorage).
- No new runtime dependencies beyond what is already installed (`firebase` is already present).

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
| D11 | Auth | **Firebase Auth** (email/password) with localStorage **demo fallback** when unconfigured |
| D12 | Firebase config | `.env.example` template; real values supplied by the user in gitignored `.env` |
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

### Phase 8 — Firebase Auth + Demo Fallback + Login
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
- `.env.example`: document both `VITE_OMDB_API_KEY` and `VITE_TMDB_API_KEY` (+ Firebase vars).
- Remove deps `simple-icons`, `tailwindcss-motion`, `lucide-react`; keep `firebase`; run `npm install`.
- Delete `CustomCursor.jsx`, `Mannequin.jsx`, `sunday-walks/`, `the-japan/`, `public/fonts/`,
  `Background/`.
- Replace remaining `100vh` → `100dvh`.
**Acceptance:** app runs; no references to removed files. **Verify:** lint + build.

### Phase 11 — Final QA, Build & Commit
- Re-run full `agent-browser` QA in **both themes** (desktop + mobile viewports).
- `npm run lint` + `npm run build`.
- Commit per-phase on `ft/redesign`; push only on explicit request.

### 6.1 Phase 0 Bug Log

| # | Area | Route/Flow | Description | Severity | Type | Status |
|---|------|-----------|-------------|----------|------|--------|
| — | — | — | _(populated during Phase 0)_ | — | — | — |

## 7. File Manifest

**Create:** `src/Components/PixelIcon.jsx`, `src/Components/PixelFrame.jsx`,
`src/Components/NotFound.jsx`, `src/lib/firebase.js`, `implementation.md`.
**Modify:** `index.html`, `src/App.css`, `src/App.jsx`, `src/main.jsx`, `src/MovieGrid.jsx`,
`src/Components/{NavBar,MovieDetail,Favorites,About,Login,PlatformIcon,Marquee,ScrollProgress,
TiltCard,MagneticButton,RevealOnScroll}.jsx`, `src/Context/{ThemeContext,AuthContext}.jsx`,
`src/API/{omdb.js,tmdb.jsx}`, `package.json`, `.env.example`.
**Delete:** `src/Components/CustomCursor.jsx`, `src/Components/Mannequin.jsx`, `sunday-walks/`,
`the-japan/`, `public/fonts/`, `Background/`.

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
| Firebase keys absent during dev/QA | Demo fallback path keeps the app usable |
| Env change breaks running app | Keep graceful fallbacks; verify build |

## 10. Open Questions / Assumptions

1. **Firebase credentials:** must be supplied by the user in `.env` before live Firebase auth can be
   browser-tested; otherwise the demo fallback path is verified.
2. **Fonts:** Google Fonts CDN (no self-hosting).
3. **Security:** the OMDb key (`4e2dfea1`) and TMDB fallback key are already in git history —
   rotate them; they will be removed from source in Phase 10.

## 11. Commit Strategy

Small, phase-scoped commits on `ft/redesign` using the
`feat|fix|update|chore: one_line_description` convention (no phase/step numbers). No pushes until
explicitly requested.
