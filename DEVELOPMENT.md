# OmniHub — Development Guide

> For a feature overview and general information see [README.md](README.md).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | React Router v7 |
| State | Zustand v5 |
| Server state / caching | TanStack Query v5 |
| HTTP | Axios |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| Drag & drop | dnd-kit + react-grid-layout |
| Date handling | date-fns |
| Build | Vite 6 |
| PWA | vite-plugin-pwa (Workbox) |
| Linting | ESLint 9 (flat config) + typescript-eslint |
| Formatting | Prettier 3 |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |

---

## Prerequisites

- Node.js ≥ 20
- npm ≥ 9

---

## Local Development

```bash
git clone https://github.com/huitzlopochtli/OmniHub.git
cd OmniHub/frontend

npm install
npm run dev
```

The app starts at `http://localhost:5173`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check → lint → format-check → Vite production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run check` | TypeScript type-check only (no emit) |

---

## Building for GitHub Pages

The CI workflow handles this automatically. To replicate locally:

```bash
VITE_BASE=/OmniHub/ npm run build
```

Output lands in `frontend/dist/`.

---

## Project Structure

```
OmniHub/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD — GitHub Pages deploy + versioned releases
└── frontend/
    ├── public/                 # Static assets (icons, favicon)
    ├── src/
    │   ├── components/
    │   │   ├── shared/         # ErrorState, etc.
    │   │   └── ui/             # Badge, Button, Card, Input, ProgressBar, Spinner, ...
    │   ├── contexts/
    │   │   └── ServiceInstanceContext.tsx
    │   ├── hooks/
    │   │   └── useServiceEnabled.ts
    │   ├── lib/
    │   │   ├── tabRouter.tsx   # Lightweight in-panel tab navigation (replaces MemoryRouter)
    │   │   └── utils.ts
    │   ├── pages/
    │   │   ├── Dashboard/      # Widget grid + all widget components
    │   │   ├── Sonarr/         # SeriesList, SeriesDetail, Calendar, Queue, History, Wanted
    │   │   ├── Radarr/         # MovieGrid, MovieDetail, Calendar, Queue, History
    │   │   ├── Lidarr/         # ArtistList, ArtistDetail, Queue, Wanted, History
    │   │   ├── Readarr/        # BookList, Queue, Wanted, History
    │   │   ├── Bazarr/         # Series, Movies, History
    │   │   ├── SABnzbd/        # Queue, History
    │   │   ├── NZBGet/         # Queue, History
    │   │   ├── QBittorrent/    # Torrents
    │   │   ├── Transmission/   # Torrents
    │   │   ├── Deluge/         # Torrents
    │   │   ├── Overseerr/      # Requests, Discover
    │   │   ├── Prowlarr/       # Indexers, Search
    │   │   ├── Tautulli/       # Activity, History, Stats
    │   │   ├── Unraid/         # Dashboard, Containers, VMs, Shares
    │   │   └── Settings/       # Profiles, instances, accent colour
    │   ├── services/
    │   │   └── api/            # One file per service (sonarr.ts, radarr.ts, ...)
    │   └── stores/
    │       ├── settingsStore.ts  # Zustand — profiles, instances, accent
    │       └── uiStore.ts        # Zustand — widget layout, sidebar state
    ├── eslint.config.js
    ├── .prettierrc
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── vite.config.ts
```

---

## CI/CD

Defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### On every push to `main`

1. Install dependencies (`npm ci`)
2. Build with `VITE_BASE=/OmniHub/`
3. Copy `index.html` → `404.html` for SPA deep-link support
4. Deploy to GitHub Pages

### On `v*.*.*` tag push

All of the above, **plus**:

5. Zip `dist/` as `omnihub-v1.2.3.zip`
6. Create a GitHub Release with the zip attached and auto-generated release notes

**To cut a release:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

**GitHub Pages setup** (one-time, in repo Settings):  
Settings → Pages → Source → **GitHub Actions**

---

## Contributing

1. Fork and clone the repo
2. `cd frontend && npm install`
3. Create a feature branch: `git checkout -b feature/my-thing`
4. Make changes — `npm run build` must pass with zero errors before opening a PR
5. Open a Pull Request against `main`

Code style is enforced by ESLint + Prettier. Run `npm run lint:fix && npm run format` before committing.
