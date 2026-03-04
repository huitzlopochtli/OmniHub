import { useSettingsStore } from '@/stores/settingsStore'
import axios from 'axios'

const KEY = 'qbittorrent'

function getBaseUrl(): string {
  const cfg = useSettingsStore.getState().getService(KEY)
  return (cfg?.baseUrl ?? '').replace(/\/$/, '')
}

// qBittorrent uses cookie-based auth — we manage session separately
let sessionCookie: string | null = null

async function ensureAuth(): Promise<void> {
  if (sessionCookie) return
  const cfg = useSettingsStore.getState().getService(KEY)
  if (!cfg) return
  const base = getBaseUrl()
  const res = await axios.post(
    `${base}/api/v2/auth/login`,
    new URLSearchParams({
      username: cfg.username ?? 'admin',
      password: cfg.password ?? 'adminadmin',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true },
  )
  const setCookie = res.headers['set-cookie']
  if (Array.isArray(setCookie)) {
    sessionCookie = setCookie.find((c) => c.startsWith('SID=')) ?? null
  }
}

function withCookie(config: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...config,
    headers: { ...((config.headers as Record<string, unknown>) ?? {}), Cookie: sessionCookie ?? '' },
    withCredentials: true,
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface QBTorrent {
  hash: string
  name: string
  size: number
  progress: number
  dlspeed: number
  upspeed: number
  priority: number
  num_seeds: number
  num_complete: number
  num_leechs: number
  num_incomplete: number
  ratio: number
  eta: number
  state: string
  seq_dl: boolean
  f_l_piece_prio: boolean
  category: string
  tags: string
  super_seeding: boolean
  force_start: boolean
  save_path: string
  added_on: number
  completion_on: number
  tracker: string
  trackers_count: number
  downloaded: number
  uploaded: number
  ratio_limit: number
  seeding_time: number
  last_activity: number
  total_size: number
  amount_left: number
  content_path: string
  time_active: number
  auto_tmm: boolean
  availability: number
  completed: number
  downloaded_session: number
  uploaded_session: number
  magnet_uri: string
  seen_complete: number
  dl_limit: number
  up_limit: number
}

export interface QBGlobalStats {
  dl_info_speed: number
  dl_info_data: number
  up_info_speed: number
  up_info_data: number
  dl_rate_limit: number
  up_rate_limit: number
  dht_nodes: number
  connection_status: string
}

// ── API ──────────────────────────────────────────────────────────────────────

export const qbittorrentApi = {
  login: async () => {
    sessionCookie = null
    await ensureAuth()
  },

  getTorrents: async (filter?: string, category?: string) => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    const res = await axios.get<QBTorrent[]>(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/info`,
      { ...withCookie(), params: { filter: filter ?? 'all', category } },
    )
    return res.data
  },

  getTransferInfo: async () => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    const res = await axios.get<QBGlobalStats>(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/transfer/info`,
      withCookie(),
    )
    return res.data
  },

  pauseTorrent: async (hashes: string | 'all') => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    await axios.post(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/pause`,
      new URLSearchParams({ hashes }),
      { ...withCookie(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
  },

  resumeTorrent: async (hashes: string | 'all') => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    await axios.post(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/resume`,
      new URLSearchParams({ hashes }),
      { ...withCookie(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
  },

  deleteTorrent: async (hashes: string, deleteFiles = false) => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    await axios.post(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/delete`,
      new URLSearchParams({ hashes, deleteFiles: deleteFiles ? 'true' : 'false' }),
      { ...withCookie(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
  },

  addTorrentByUrl: async (urls: string, category = '', savepath = '') => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    const form = new FormData()
    form.append('urls', urls)
    if (category) form.append('category', category)
    if (savepath) form.append('savepath', savepath)
    await axios.post(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/add`,
      form,
      withCookie(),
    )
  },

  setGlobalDownloadLimit: async (limit: number) => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    await axios.post(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/transfer/setDownloadLimit`,
      new URLSearchParams({ limit: String(limit) }),
      { ...withCookie(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
  },

  setGlobalUploadLimit: async (limit: number) => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    await axios.post(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/transfer/setUploadLimit`,
      new URLSearchParams({ limit: String(limit) }),
      { ...withCookie(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
  },

  getCategories: async () => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    const res = await axios.get<Record<string, { name: string; savePath: string }>>(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/categories`,
      withCookie(),
    )
    return res.data
  },

  getTags: async () => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    const res = await axios.get<string[]>(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/tags`,
      withCookie(),
    )
    return res.data
  },

  getTorrentProperties: async (hash: string) => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    const res = await axios.get(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/properties`,
      { ...withCookie(), params: { hash } },
    )
    return res.data
  },

  getTorrentTrackers: async (hash: string) => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    const res = await axios.get(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/trackers`,
      { ...withCookie(), params: { hash } },
    )
    return res.data
  },

  getTorrentFiles: async (hash: string) => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    const res = await axios.get(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/files`,
      { ...withCookie(), params: { hash } },
    )
    return res.data
  },

  recheckTorrents: async (hashes: string) => {
    await ensureAuth()
    const cfg = useSettingsStore.getState().getService(KEY)
    await axios.post(
      `${(cfg?.baseUrl ?? '').replace(/\/$/, '')}/api/v2/torrents/recheck`,
      new URLSearchParams({ hashes }),
      { ...withCookie(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
  },
}
