import { useMemo } from 'react'
import axios from 'axios'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

const sessions = new Map<string, string>() // instanceId → session cookie
let reqId = 1

const TORRENT_KEYS = [
  'name',
  'state',
  'progress',
  'download_payload_rate',
  'upload_payload_rate',
  'total_size',
  'total_done',
  'eta',
  'ratio',
  'num_seeds',
  'num_peers',
  'seeds_peers_ratio',
  'label',
  'save_path',
  'time_added',
  'is_finished',
]

export function createDelugeApi(instanceId: string) {
  function getBase() {
    return (useSettingsStore.getState().getInstance(instanceId)?.baseUrl ?? '').replace(/\/$/, '')
  }

  async function ensureAuth() {
    if (sessions.has(instanceId)) return
    const cfg = useSettingsStore.getState().getInstance(instanceId)
    const res = await axios.post(
      `${getBase()}/json`,
      { method: 'auth.login', params: [cfg?.password ?? ''], id: reqId++ },
      { withCredentials: true },
    )
    const cookie = (res.headers['set-cookie'] ?? []).find((c: string) =>
      c.startsWith('_session_id='),
    )
    if (cookie) sessions.set(instanceId, cookie)
  }

  async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
    await ensureAuth()
    const res = await axios.post<{ result: T; error: null | { message: string } }>(
      `${getBase()}/json`,
      { method, params, id: reqId++ },
      { headers: { Cookie: sessions.get(instanceId) ?? '' }, withCredentials: true },
    )
    if (res.data.error) throw new Error(res.data.error.message)
    return res.data.result
  }

  return {
    login: async () => {
      sessions.delete(instanceId)
      await ensureAuth()
    },
    isConnected: () => rpc<boolean>('web.connected'),
    getTorrents: () =>
      rpc<Record<string, Record<string, unknown>>>('web.update_ui', [TORRENT_KEYS, {}]),
    pauseTorrent: (hashes: string[]) => rpc('core.pause_torrents', [hashes]),
    resumeTorrent: (hashes: string[]) => rpc('core.resume_torrents', [hashes]),
    removeTorrent: (hash: string, deleteData = false) =>
      rpc('core.remove_torrent', [hash, deleteData]),
    addTorrentUrl: (url: string, options: Record<string, unknown> = {}) =>
      rpc('web.add_torrents', [[{ path: url, options }]]),
    getTorrentStatus: (hash: string) => rpc('core.get_torrent_status', [hash, []]),
    getLabels: () => rpc('label.get_labels'),
    setLabel: (hash: string, label: string) => rpc('label.set_torrent', [hash, label]),
    moveStorage: (hash: string, dest: string) => rpc('core.move_storage', [[hash], dest]),
    getSessionStatus: () =>
      rpc('core.get_session_status', [
        ['upload_rate', 'download_rate', 'total_upload', 'total_download'],
      ]),
    getConfig: () => rpc('core.get_config'),
  }
}

// Backward-compatible shim: always binds to first enabled deluge instance.
// For multi-instance awareness inside service panels, use useDelugeApi() instead.
// @ts-expect-error -- Proxy shim: {} is not assignable but is safe at runtime

export const delugeApi: ReturnType<typeof createDelugeApi> = new Proxy(
  {} as unknown as ReturnType<typeof createDelugeApi>,
  {
    get(_: unknown, prop: string) {
      const id =
        useSettingsStore
          .getState()
          .getInstancesByType('deluge')
          .find((i) => i.enabled && i.baseUrl)?.id ?? ''
      return (createDelugeApi(id) as Record<string, unknown>)[prop]
    },
  },
)

export function useDelugeApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createDelugeApi(instanceId), [instanceId])
}
