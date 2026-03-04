import axios from 'axios'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'transmission'
let sessionId: string | null = null
let reqId = 1

function getBase() {
  const cfg = useSettingsStore.getState().getService(KEY)
  return (cfg?.baseUrl ?? '').replace(/\/$/, '')
}

async function rpc<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const cfg = useSettingsStore.getState().getService(KEY)
  const makeRequest = async (): Promise<T> => {
    try {
      const res = await axios.post<{ result: string; arguments: T }>(
        `${getBase()}/transmission/rpc`,
        { method, arguments: args, tag: reqId++ },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(sessionId ? { 'X-Transmission-Session-Id': sessionId } : {}),
          },
          ...(cfg?.username ? { auth: { username: cfg.username, password: cfg.password ?? '' } } : {}),
        },
      )
      if (res.data.result !== 'success') throw new Error(res.data.result)
      return res.data.arguments
    } catch (err: unknown) {
      // 409 = need new session ID
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        sessionId = err.response?.headers['x-transmission-session-id'] ?? null
        return makeRequest()
      }
      throw err
    }
  }
  return makeRequest()
}

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
  'id', 'name', 'status', 'totalSize', 'percentDone', 'rateDownload', 'rateUpload',
  'eta', 'uploadRatio', 'peersConnected', 'downloadDir', 'addedDate', 'doneDate',
  'error', 'errorString', 'isFinished', 'leftUntilDone', 'sizeWhenDone', 'trackers',
  'bandwidthPriority', 'uploadLimited', 'downloadLimited', 'uploadLimit', 'downloadLimit',
]

export const transmissionApi = {
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
    rpc<{ downloadSpeed: number; uploadSpeed: number; torrentCount: number; activeTorrentCount: number; pausedTorrentCount: number }>('session-stats'),

  getSession: () =>
    rpc<Record<string, unknown>>('session-get'),

  setSession: (fields: Record<string, unknown>) =>
    rpc('session-set', fields),

  testPort: () =>
    rpc<{ 'port-is-open': boolean }>('port-test'),
}
