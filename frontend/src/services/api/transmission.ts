import { useMemo } from 'react'
import axios from 'axios'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

const sessionIds = new Map<string, string>() // instanceId → X-Transmission-Session-Id

export interface TransmissionTorrent {
  id: number
  name: string
  status: number
  totalSize: number
  percentDone: number
  rateDownload: number
  rateUpload: number
  eta: number
  uploadRatio: number
  peersConnected: number
  peersSendingToUs: number
  peersGettingFromUs: number
  downloadDir: string
  addedDate: number
  doneDate: number
  error: number
  errorString: string
  isFinished: boolean
  leftUntilDone: number
  sizeWhenDone: number
  trackers: { id: number; announce: string; tier: number }[]
  files: { name: string; length: number; bytesCompleted: number }[]
  fileStats: { bytesCompleted: number; wanted: boolean; priority: number }[]
  bandwidthPriority: number
  uploadLimited: boolean
  downloadLimited: boolean
  uploadLimit: number
  downloadLimit: number
}

const ALL_FIELDS = [
  'id','name','status','totalSize','percentDone','rateDownload','rateUpload',
  'eta','uploadRatio','peersConnected','downloadDir','addedDate','doneDate',
  'error','errorString','isFinished','leftUntilDone','sizeWhenDone','trackers',
  'bandwidthPriority','uploadLimited','downloadLimited','uploadLimit','downloadLimit',
]

export function createTransmissionApi(instanceId: string) {
  async function rpc<T = unknown>(method: string, args: Record<string, unknown> = {}): Promise<T> {
    const cfg = useSettingsStore.getState().getInstance(instanceId)
    if (!cfg) throw new Error('Transmission not configured')
    const base = cfg.baseUrl.replace(/\/$/, '')
    const url = `${base}/transmission/rpc`
    const headers: Record<string, string> = {}
    if (sessionIds.has(instanceId)) headers['X-Transmission-Session-Id'] = sessionIds.get(instanceId)!
    if (cfg.username) {
      headers['Authorization'] = 'Basic ' + btoa(`${cfg.username}:${cfg.password ?? ''}`)
    }
    const makeRequest = async (): Promise<T> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await axios.post<any>(url, { method, arguments: args }, { headers })
        if (res.data.result !== 'success') throw new Error(res.data.result)
        return res.data.arguments
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          const newId = err.response.headers['x-transmission-session-id'] as string
          sessionIds.set(instanceId, newId)
          headers['X-Transmission-Session-Id'] = newId
          return makeRequest()
        }
        throw err
      }
    }
    return makeRequest()
  }

  return {
    getTorrents: (fields = ALL_FIELDS) =>
      rpc<{ torrents: TransmissionTorrent[] }>('torrent-get', { fields }),

    getTorrent: (id: number) =>
      rpc<{ torrents: TransmissionTorrent[] }>('torrent-get', {
        ids: [id],
        fields: [...ALL_FIELDS, 'files', 'fileStats', 'peersSendingToUs', 'peersGettingFromUs'],
      }),

    startTorrents: (ids: number[] | 'all') =>
      rpc('torrent-start', ids === 'all' ? {} : { ids }),

    stopTorrents: (ids: number[] | 'all') =>
      rpc('torrent-stop', ids === 'all' ? {} : { ids }),

    removeTorrents: (ids: number[], deleteLocalData = false) =>
      rpc('torrent-remove', { ids, 'delete-local-data': deleteLocalData }),

    addTorrentUrl: (url: string, downloadDir?: string) =>
      rpc('torrent-add', { filename: url, ...(downloadDir ? { 'download-dir': downloadDir } : {}) }),

    setTorrent: (ids: number[], fields: Record<string, unknown>) =>
      rpc('torrent-set', { ids, ...fields }),

    getSessionStats: () =>
      rpc<{
        downloadSpeed: number
        uploadSpeed: number
        torrentCount: number
        activeTorrentCount: number
        pausedTorrentCount: number
      }>('session-stats'),

    getSession: () => rpc<Record<string, unknown>>('session-get'),

    setSession: (fields: Record<string, unknown>) => rpc('session-set', fields),

    testPort: () => rpc<{ 'port-is-open': boolean }>('port-test'),
  }
}

// Backward-compatible shim: always binds to first enabled transmission instance.
// For multi-instance awareness inside service panels, use useTransmissionApi() instead.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transmissionApi: ReturnType<typeof createTransmissionApi> = new Proxy({} as unknown as ReturnType<typeof createTransmissionApi>, {
  get(_: unknown, prop: string) {
    const id = useSettingsStore.getState()
      .getInstancesByType('transmission')
      .find((i) => i.enabled && i.baseUrl)?.id ?? ''
    return (createTransmissionApi(id) as Record<string, unknown>)[prop]
  },
})

export function useTransmissionApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createTransmissionApi(instanceId), [instanceId])
}
