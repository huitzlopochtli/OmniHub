# OmniHub

**Your entire self-hosted media stack. One app.**

OmniHub is a **Progressive Web App (PWA)** that brings together every service in your home media server into a single, beautiful, mobile-friendly dashboard. No more jumping between a dozen browser tabs — everything you need is in one place.

> **Built with Agentic Engineering** — this project was designed and implemented end-to-end using AI-driven agentic workflows, where an AI agent autonomously wrote code, resolved bugs, refactored architecture, and set up CI/CD with minimal human intervention. Every piece of code was carefully reviewed by the project author, huitzlopochtli, to ensure correctness, quality, and alignment with the intended design.

---

## Live Demo

👉 **[huitzlopochtli.github.io/OmniHub](https://huitzlopochtli.github.io/OmniHub/)**

---

## What's Inside

### 🎛️ Dashboard
A fully customisable home screen. Drag, resize, and rearrange widgets to build the overview that works for you:
- **Now Streaming** — see what's playing on Plex/Tautulli right now
- **Calendar** — upcoming TV episodes and movie releases
- **Download Queue** — everything currently downloading, at a glance
- **Torrent Speed** — live upload/download speeds
- **Disk Space** — how much room you have left
- **Requests** — pending Overseerr requests waiting for approval
- **Unraid Overview** — server health at a glance

### 📺 Sonarr — TV Series
Browse your entire series library, track episode progress season by season, manage your download queue, and never miss a release with the built-in calendar.

### 🎬 Radarr — Movies
Your full movie collection in a poster grid. Drill into any title for file details, quality profile, and cast info. Manage the queue and browse history.

### 🎵 Lidarr — Music
Artist and album library with download queue and wanted list management.

### 📚 Readarr — Books
Book library management with queue, wanted, and history views.

### 🗣️ Bazarr — Subtitles
Check subtitle status for all your series and movies. Browse the history of downloaded subtitles.

### ⬇️ SABnzbd & NZBGet — Usenet
Live download queues with per-item progress bars, pause/resume controls, and history logs.

### 🌊 qBittorrent, Transmission & Deluge — Torrents
Full torrent management — monitor progress, pause, resume, or remove individual torrents, with live speed indicators.

### 🎟️ Overseerr — Requests
Approve or decline pending media requests and browse the Discover feed.

### 🔍 Prowlarr — Indexers
Monitor indexer health and run manual searches across all your indexers.

### 📊 Tautulli — Statistics
Live stream monitoring, play history, and usage statistics for your Plex server.

### 🖥️ Unraid — Server
Full Unraid dashboard — CPU, RAM, array status, Docker container controls, virtual machine management, and user share usage.

---

## Highlights

- **Install as an app** — OmniHub is a PWA. Add it to your phone or desktop home screen and it works like a native app, including offline support.
- **Multi-instance** — running two Sonarr servers? Add both. Each instance has its own URL and API key.
- **Server profiles** — group your instances into profiles (e.g. Home, VPN, Remote) and switch between them with one tap.
- **Personalise it** — pick your accent colour: Sky, Blue, Violet, Emerald, Orange, or Rose.
- **Works on any device** — fully responsive, designed for both phone and desktop.

---

## Privacy & Data

> **OmniHub never sends your data anywhere.**

Everything — your server addresses, API keys, and layout preferences — is stored **locally in your browser only**. API calls go directly from your browser to your own servers. There is no OmniHub backend, no account, and no telemetry of any kind.

| What | Stored in |
|---|---|
| Server URLs, API keys, profiles | Browser `localStorage` |
| Widget layout & positions | Browser IndexedDB |

---

## Getting Started

### Option A — GitHub Pages (no install)

1. Open **[huitzlopochtli.github.io/OmniHub](https://huitzlopochtli.github.io/OmniHub/)** in your browser
2. Go to **Settings**, add a Server Profile and your service instances
3. Head to the **Dashboard** and customise your widgets

### Option B — Docker (self-hosted)

```yaml
# docker/docker-compose.yml
services:
  omnihub:
    image: huitzlopochtli/omnihub:latest
    container_name: omnihub
    restart: unless-stopped
    ports:
      - "8080:80"
```

```bash
docker compose -f docker/docker-compose.yml up -d
```

Then open **http://localhost:8080**.

### Option C — Unraid

Copy [`unraid/omnihub.xml`](unraid/omnihub.xml) to `/boot/config/plugins/dockerMan/templates-user/` and add the container from the Unraid Docker tab.

For full setup instructions and contribution guidelines see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## License

MIT

