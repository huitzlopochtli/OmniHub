# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (better layer caching)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source and build
# VITE_BASE=/ because Docker runs at the root, not a GitHub Pages sub-path
COPY frontend/ .
RUN VITE_BASE=/ npm run build

# ─── Stage 2: Serve ──────────────────────────────────────────────────────────
# nginx:alpine is ~12 MB — the lightest production-ready static file server
FROM nginx:alpine AS final

# Remove default nginx config and replace with our SPA config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1
