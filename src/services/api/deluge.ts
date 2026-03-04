import axios from 'axios'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'deluge'
let reqId = 1
let delugeSessionCookie: string | null = null

function getBase() {
  const cfg = useSettingsStore.getState().getService(KEY)
  return (cfg?.baseUrl ?? '').replace(/\/$/, '')
}

async function ensureAuth() {
  if (delugeSessionCookie) return
  const cfg = useSettingsStore.getState().getService(KEY)
  const res = await axios.post(
    `${getBase()}/json`,
    { method: 'auth.login', params: [cfg?.password ?? ''], id: reqId++ },
    { withCredentials: true },
  )
  const setCookie = res.headers['set-cookie']
  if (Array.isArray(setCookie)) {
    delugeSessionCookie = setCookie.find((c) => c.startsWith('_session_id=')) ?? null
  }
}

async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  await ensureAuth()
  const res = await axios.post<{ result: T; error: null | { message: string } }>(
    `${getBase()}/json`,
    { method, params, id: reqId++ },
    { headers: { Cookie: delugeSessionCookie ?? '' }, withCredentials: true },
  )
  if (res.data.error) throw new Error(res.data.error.message)
  return res.data.result
}

const TORRENT_KEYS = [
  'name', 'state', 'progress', 'download_payload_rate', 'upload_payload_rate',
  'total_size', 'total_done', 'eta', 'ratio', 'num_seeds', 'num_peers',
  'seeds_peers_ratio', 'label', 'save_path', 'time_added', 'is_finished',
]

export const delugeApi = {
  login: async () => {
    delugeSessionCookie = null
    await ensureAuth()
  },
  isConnected: () => rpc<boolean>('web.connected'),
  getTorrents: () => rpc<Record<string, Record<string, unknown>>>('web.update_ui', [TORRENT_KEYS, {}]),
  pauseTorrent: (hashes: string[]) => rpc('core.pause_torrents', [hashes]),
  resumeTorrent: (hashes: string[]) => rpc('core.resume_torrents', [hashes]),
  removeTorrent: (hash: string, deleteData = false) => rpc('core.remove_torrent', [hash, deleteData]),
  addTorrentUrl: (url: string, options: Record<string, unknown> = {}) => rpc('web.add_torrents', [[{ path: url, options }]]),
  getTorrentStatus: (hash: string) => rpc('core.get_torrent_status', [hash, []]),
  getPlugins: () => rpc('web.get_plugins'),
  getLabels: () => rpc('label.get_labels'),
  setLabel: (hash: string, label: string) => rpc('label.set_torrent', [hash, label]),
  moveStorage: (hash: string, dest: string) => rpc('core.move_storage', [[hash], dest]),
  setTorrentOptions: (hash: string, options: Record<string, unknown>) => rpc('core.set_torrent_options', [[hash], options]),
  getSessionStatus: () => rpc('core.get_session_status', [['upload_rate', 'download_rate', 'total_upload', 'total_download']]),
  setSessionConfig: (config: Record<string, unknown>) => rpc('core.set_config', [config]),
  getConfig: () => rpc('core.get_config'),
}
