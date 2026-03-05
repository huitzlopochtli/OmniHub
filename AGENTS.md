# OmniHub — Agent Instructions

This document exists specifically for AI agents working on this codebase. Read it fully before making any changes.

---

## Project Overview

**OmniHub** is a React 19 + TypeScript PWA that acts as a unified dashboard for self-hosted media server services (Sonarr, Radarr, Lidarr, etc.). It is a **pure frontend app** — no backend, no server, no database. Everything runs in the user's browser.

- **Repo root**: `C:/Users/ZSYSCFE/Codes/Servarr/` (folder name is legacy; the project is called OmniHub)
- **All source code**: `frontend/` subfolder
- **Remote**: `https://github.com/huitzlopochtli/OmniHub.git`
- **Branch**: `master`

---

## Before You Touch Anything

Always run the full build first to confirm you're starting from a clean state:

```bash
cd frontend
npm run build
```

`npm run build` runs: `tsc -b && eslint src && prettier --check . && vite build`  
**All four must pass with zero errors.** Do not commit if the build is broken.

## Before Every Commit

**Always run `npm run build` and confirm it exits with code 0 before staging or committing any files.** This includes documentation-only changes — Prettier checks `index.html` and other non-TS files too.

If Prettier fails, run `npm run format` then re-run `npm run build` before committing.

---

## Architecture — Critical Patterns

### 1. TabRouter (NOT React Router inside service pages)

React Router v7 forbids nested routers. Every service page previously used `<MemoryRouter>` — this caused a crash. The fix is `src/lib/tabRouter.tsx`.

**Rule**: Service pages and their sub-components must NEVER import `useNavigate`, `useLocation`, or `useParams` from `react-router-dom`. Use the tab equivalents instead:

| react-router-dom | tabRouter equivalent |
|---|---|
| `<MemoryRouter initialEntries={['/x']}>` | `<TabRouter initialPath="/x">` |
| `useNavigate()` | `useTabNavigate()` |
| `useLocation()` | `useTabLocation()` |
| `useParams<T>()` | `useTabParams<T>()` |

`useTabParams` parses the pathname positionally: `/base/id` → `{ id: 'id' }`.

Any list/grid component that navigates to a detail view (e.g. `SeriesList`, `MovieGrid`, `ArtistList`) must use `useTabNavigate()` — not `useNavigate()` — or it will push to the browser URL and render a blank page.

Detail view back-buttons must navigate to an explicit path string (e.g. `navigate('/series')`) — NOT `navigate(-1)` — because `useTabNavigate` only accepts strings.

### 2. Multi-instance / Profiles (Zustand)

Settings are stored in `src/stores/settingsStore.ts` (Zustand, persisted to localStorage).

Key types:
```typescript
interface ServiceInstance extends ServiceConfig {
  id: string        // uuid
  type: ServiceKey  // 'sonarr' | 'radarr' | ...
  label: string
  enabled: boolean
}

interface ServerProfile {
  id: string
  name: string
  instances: ServiceInstance[]
}
```

**Do NOT call `getInstancesByType()` or `getActiveProfile()` inside a Zustand selector** — these return new array references every call, causing infinite re-render loops. Instead, select raw `state.profiles` and use `useMemo` for derived data. See `src/hooks/useServiceEnabled.ts` for the correct pattern.

### 3. API Layer

Each service has its own file in `src/services/api/`. All files export a factory function plus a proxy shim for backwards compatibility.

The `rpc<T>()` helper used by Transmission/Deluge returns `res.data.arguments` (already unwrapped). Do not double-unwrap.

### 4. No `react-router-dom` in service sub-components

The grep to catch violations:
```bash
grep -rn "from 'react-router-dom'" src/pages/ --include="*.tsx"
```
The only acceptable matches are in `src/App.tsx` (the top-level `<BrowserRouter>`) and service page `index.tsx` files that import `TabRouter` from `@/lib/tabRouter` (which internally does not use react-router-dom).

---

## File Structure

```
OmniHub/
├── .github/workflows/deploy.yml   # CI: build → Pages deploy → Docker push → release on tag
├── AGENTS.md                      # ← you are here
├── DEVELOPMENT.md                 # Human developer guide
├── README.md                      # User-facing marketing page
├── docker/
│   ├── Dockerfile                 # Multi-stage: node:20-alpine build → nginx:alpine serve
│   ├── docker-compose.yml         # docker compose up for self-hosters
│   └── nginx.conf                 # SPA fallback + cache headers
├── unraid/
│   └── omnihub.xml                # Unraid Community Applications template
└── frontend/
    ├── index.html                 # Title: OmniHub, apple-mobile-web-app-title: OmniHub
    ├── vite.config.ts             # base from VITE_BASE env; PWA manifest name: OmniHub
    ├── package.json               # name: "omnihub"
    ├── eslint.config.js           # ESLint 9 flat config; no-explicit-any: off
    ├── .prettierrc                # singleQuote, no semi, 100 width, trailingComma: all
    ├── .prettierignore            # includes patch-memoryrouter.cjs
    └── src/
        ├── App.tsx                # Top-level BrowserRouter + route definitions
        ├── lib/
        │   ├── tabRouter.tsx      # TabRouter context — see §Architecture above
        │   └── utils.ts           # cn(), formatBytes(), formatSpeed(), etc.
        ├── contexts/
        │   └── ServiceInstanceContext.tsx   # eslint-disable react-refresh at top
        ├── hooks/
        │   └── useServiceEnabled.ts         # Uses raw p.instances + useMemo (no infinite loop)
        ├── stores/
        │   ├── settingsStore.ts   # Zustand persist — profiles, instances, accent
        │   └── uiStore.ts         # Zustand — widget layout, sidebar state
        ├── services/api/          # sonarr.ts, radarr.ts, ... (factory + proxy shim)
        ├── components/
        │   ├── ui/                # Badge, Button, Card, Input, ProgressBar, Select, Spinner, Switch
        │   └── shared/            # ErrorState
        └── pages/
            ├── Dashboard/         # Widget grid (react-grid-layout) + 8 widget files
            ├── Settings/          # Profiles, instances, accent colour picker
            ├── Sonarr/            # index.tsx + SonarrNav.tsx + SeriesList.tsx + SeriesDetail.tsx + ...
            ├── Radarr/            # index.tsx + MovieGrid.tsx + MovieDetail.tsx + ...
            ├── Lidarr/            # index.tsx + ArtistList.tsx + ArtistDetail.tsx + ...
            ├── Readarr/           # index.tsx only (inline nav)
            ├── Bazarr/            # index.tsx only
            ├── SABnzbd/           # index.tsx only
            ├── NZBGet/            # index.tsx only
            ├── QBittorrent/       # index.tsx only
            ├── Transmission/      # index.tsx only (no router at all)
            ├── Deluge/            # index.tsx only (no router — single view)
            ├── Overseerr/         # index.tsx only
            ├── Prowlarr/          # index.tsx only
            ├── Tautulli/          # index.tsx only
            └── Unraid/            # index.tsx only
```

---

## Naming Conventions

- **Project name**: OmniHub (capital O, capital H, no space)
- **npm package name**: `omnihub`
- **PWA manifest name/short_name**: `OmniHub`
- **HTML title**: `OmniHub`
- **Repo**: `huitzlopochtli/OmniHub`
- **Legacy folder name**: `Servarr/` — do NOT rename the folder, it's just history

---

## CI/CD

`.github/workflows/deploy.yml` has four jobs:

| Job | Trigger | Action |
|---|---|---|
| `build` | push to `master` or `v*` tag | `npm ci` → build with `VITE_BASE=/OmniHub/` → upload artifacts |
| `deploy-pages` | same | Deploy to GitHub Pages |
| `docker` | same | Build multi-platform image (`linux/amd64`, `linux/arm64`) → push to Docker Hub as `huitzlopochtli/omnihub` |
| `release` | `v*.*.*` tag only | Zip dist → create GitHub Release as `omnihub-v*.*.*.zip` |

GitHub Pages must be configured to use **GitHub Actions** as the source (Settings → Pages → Source).

Docker Hub push requires two repository secrets: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.

---

## Code Style Rules

- **No `any` warnings**: `no-explicit-any` is turned **off** globally — `any` is allowed where needed
- **`@ts-ignore`**: must be `@ts-expect-error` (lint rule enforces this)
- **Prettier**: runs as part of `npm run build`. Always run `npm run format` after bulk edits
- **react-refresh**: files that export non-component values need `/* eslint-disable react-refresh/only-export-components */` at the top (e.g. `tabRouter.tsx`, `ServiceInstanceContext.tsx`)
- **Imports**: use `@/` alias for all src-relative imports (configured in `vite.config.ts` and `tsconfig.json`)

---

## Data Flow

```
User config (URLs, API keys)
  → settingsStore (Zustand, localStorage)
  → useServiceEnabled hook / ServiceInstanceContext
  → service API files (src/services/api/*.ts)
  → direct HTTP to user's self-hosted servers (Axios)
  → TanStack Query cache
  → UI components
```

**Nothing is ever proxied through OmniHub.** The browser calls the user's servers directly.

---

## Dependency Rules

- **Never install platform-specific npm packages as direct dependencies.** Packages like `@tailwindcss/oxide-win32-x64-msvc` are OS/CPU-specific and will break CI on Linux runners.
- Tailwind CSS is handled by `@tailwindcss/vite` → `@tailwindcss/oxide`. The oxide package already lists all platform binaries (win32, linux, macOS, ARM, etc.) as `optionalDependencies` — npm installs only the correct one for the current OS automatically. Do not manually install any `@tailwindcss/oxide-*` variant.
- If you ever need to add a package that has platform-specific variants, always install the top-level cross-platform package, not the OS/CPU-specific sub-package.

---

## Common Gotchas

1. **Blank page on service detail navigation** — means a list component is using `useNavigate()` from react-router-dom instead of `useTabNavigate()` from tabRouter
2. **Infinite render loop in Settings or hooks** — means a Zustand selector is calling a method that returns a new array reference every render; fix by selecting raw state + `useMemo`
3. **`navigate(-1)` type error** — `useTabNavigate` only accepts `string`; use an explicit path like `navigate('/series')`
4. **PWA not installing correctly on GitHub Pages** — `start_url` and `scope` in the manifest must match the `base` path; `vite.config.ts` reads `VITE_BASE` env var and threads it through
5. **`prettier --check` failing in CI** — run `npm run format` locally before committing any bulk-edited files
6. **`patch-memoryrouter.cjs`** — a one-time migration script at `frontend/patch-memoryrouter.cjs`; it is in `.prettierignore` and `.gitignore` is not needed since it's a dev utility. Do not delete it; it serves as documentation of the MemoryRouter migration.
