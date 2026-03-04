import { useMemo } from 'react'
import axios from 'axios'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

const cookies = new Map<string, string>() // instanceId → SID cookie

export function createQbittorrentApi(instanceId: string) {
  function getBase() {
    return (useSettingsStore.getState().getInstance(instanceId)?.baseUrl ?? '').replace(/\/$/, '')
  }

  async function ensureAuth() {
    if (cookies.has(instanceId)) return
    const cfg = useSettingsStore.getState().getInstance(instanceId)
    if (!cfg) return
    const res = await axios.post(
      `${getBase()}/api/v2/auth/login`,
      new URLSearchParams({ username: cfg.username ?? 'admin', password: cfg.password ?? 'adminadmin' }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true },
    )
    const sid = (res.headers['set-cookie'] ?? []).find((c: string) => c.startsWith('SID='))
    if (sid) cookies.set(instanceId, sid)
  }

  function withCookie(extra: Record<string, unknown> = {}): Record<string, unknown> {
    return { ...extra, headers: { Cookie: cookies.get(instanceId) ?? '' }, withCredentials: true }
  }

  const base = () => getBase()

  return {
    login: async () => { cookies.delete(instanceId); await ensureAuth() },

    getTorrents: async (filter?: string, category?: string) => {
      await ensureAuth()
      const res = await axios.get(`${base()}/api/v2/torrents/info`, { ...withCookie(), params: { filter: filter ?? 'all', category } } as any)
      return res.data
    },

    getMainData: async () => {
      await ensureAuth()
      const res = await axios.get(`${base()}/api/v2/sync/maindata`, withCookie() as any)
      return res.data
    },

    getTransferInfo: async () => {
      await ensureAuth()
      const res = await axios.get(`${base()}/api/v2/transfer/info`, withCookie() as any)
      return res.data
    },

    pauseTorrent: async (hash: string) => {
      await ensureAuth()
      await axios.post(`${base()}/api/v2/torrents/pause`, `hashes=${hash}`,
        { ...withCookie(), headers: { ...((withCookie() as any).headers), 'Content-Type': 'application/x-www-form-urlencoded' } } as any)
    },

    resumeTorrent: async (hash: string) => {
      await ensureAuth()
      await axios.post(`${base()}/api/v2/torrents/resume`, `hashes=${hash}`,
        { ...withCookie(), headers: { ...((withCookie() as any).headers), 'Content-Type': 'application/x-www-form-urlencoded' } } as any)
    },

    deleteTorrent: async (hash: string, deleteFiles = false) => {
      await ensureAuth()
      await axios.post(`${base()}/api/v2/torrents/delete`,
        `hashes=${hash}&deleteFiles=${deleteFiles}`,
        { ...withCookie(), headers: { ...((withCookie() as any).headers), 'Content-Type': 'application/x-www-form-urlencoded' } } as any)
    },

    setCategory: async (hash: string, category: string) => {
      await ensureAuth()
      await axios.post(`${base()}/api/v2/torrents/setCategory`,
        `hashes=${hash}&category=${encodeURIComponent(category)}`,
        { ...withCookie(), headers: { ...((withCookie() as any).headers), 'Content-Type': 'application/x-www-form-urlencoded' } } as any)
    },

    addTorrentUrl: async (url: string, savePath?: string) => {
      await ensureAuth()
      const form = new FormData()
      form.append('urls', url)
      if (savePath) form.append('savepath', savePath)
      await axios.post(`${base()}/api/v2/torrents/add`, form, withCookie() as any)
    },

    setSpeedLimits: async (dlLimit: number, ulLimit: number) => {
      await ensureAuth()
      await axios.post(`${base()}/api/v2/transfer/setDownloadLimit`, `limit=${dlLimit}`,
        { ...withCookie(), headers: { ...((withCookie() as any).headers), 'Content-Type': 'application/x-www-form-urlencoded' } } as any)
      await axios.post(`${base()}/api/v2/transfer/setUploadLimit`, `limit=${ulLimit}`,
        { ...withCookie(), headers: { ...((withCookie() as any).headers), 'Content-Type': 'application/x-www-form-urlencoded' } } as any)
    },

    getTorrentProperties: async (hash: string) => {
      await ensureAuth()
      const res = await axios.get(`${base()}/api/v2/torrents/properties`, { ...withCookie(), params: { hash } } as any)
      return res.data
    },

    getTorrentTrackers: async (hash: string) => {
      await ensureAuth()
      const res = await axios.get(`${base()}/api/v2/torrents/trackers`, { ...withCookie(), params: { hash } } as any)
      return res.data
    },

    reannounce: async (hash: string) => {
      await ensureAuth()
      await axios.post(`${base()}/api/v2/torrents/reannounce`, `hashes=${hash}`,
        { ...withCookie(), headers: { ...((withCookie() as any).headers), 'Content-Type': 'application/x-www-form-urlencoded' } } as any)
    },
  }
}

// Backward-compatible shim: always binds to first enabled qbittorrent instance.
// For multi-instance awareness inside service panels, use useQbittorrentApi() instead.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const qbittorrentApi: ReturnType<typeof createQbittorrentApi> = new Proxy({} as unknown as ReturnType<typeof createQbittorrentApi>, {
  get(_: unknown, prop: string) {
    const id = useSettingsStore.getState()
      .getInstancesByType('qbittorrent')
      .find((i) => i.enabled && i.baseUrl)?.id ?? ''
    return (createQbittorrentApi(id) as Record<string, unknown>)[prop]
  },
})

export function useQbittorrentApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createQbittorrentApi(instanceId), [instanceId])
}
