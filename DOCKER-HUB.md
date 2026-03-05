# OmniHub

**Your entire self-hosted media stack. One app.**

A unified, mobile-friendly dashboard for all your self-hosted media server services — Sonarr, Radarr, Lidarr, Readarr, Bazarr, Prowlarr, Overseerr, qBittorrent, Transmission, Deluge, SABnzbd, NZBGet, Tautulli, and Unraid.

Pure frontend PWA — no backend, no database, no proxying. Your browser talks directly to your services.

🔗 **[GitHub](https://github.com/huitzlopochtli/OmniHub)** · **[Live Demo](https://huitzlopochtli.github.io/OmniHub/)**

---

## Quick Start

### Docker Compose

```yaml
services:
  omnihub:
    image: huitzlopochtli/omnihub:latest
    container_name: omnihub
    restart: unless-stopped
    ports:
      - "8080:80"
```

```bash
docker compose up -d
```

Open **http://localhost:8080**, go to Settings, and add your service instances.

### Docker CLI

```bash
docker run -d \
  --name omnihub \
  --restart unless-stopped \
  -p 8080:80 \
  huitzlopochtli/omnihub:latest
```

---

## Features

- **Dashboard** — drag-and-drop widget grid: now streaming, calendar, queue, speeds, disk space, requests, Unraid overview
- **Sonarr / Radarr / Lidarr / Readarr** — full library browsing, queue, history, wanted, calendar
- **Bazarr** — subtitle status for series and movies
- **SABnzbd / NZBGet** — live Usenet queues with progress and history
- **qBittorrent / Transmission / Deluge** — torrent management with live speeds
- **Overseerr** — approve requests and browse Discover
- **Prowlarr** — indexer health and manual search
- **Tautulli** — live streams, history, and stats
- **Unraid** — CPU, RAM, array, containers, VMs, shares
- **Multi-instance** — add multiple servers per service
- **Server profiles** — switch between Home / VPN / Remote with one tap
- **PWA** — installable on phone and desktop, works offline
- **Privacy** — all config stored locally in your browser; nothing ever leaves your network

---

## Tags

| Tag | Description |
|---|---|
| `latest` | Latest stable build from `master` |
| `1.2.3` | Specific release version |
| `1.2` | Latest patch for minor version |

---

## Platforms

`linux/amd64` · `linux/arm64`

---

## No volumes needed

OmniHub is stateless on the server side. All user config (URLs, API keys, layout) is stored in the browser's `localStorage` and IndexedDB. No bind mounts or named volumes required.
