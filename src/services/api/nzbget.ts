import axios from 'axios'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'nzbget'

let reqId = 1

async function rpc(method: string, params: unknown[] = []) {
  const cfg = useSettingsStore.getState().getService(KEY)
  if (!cfg) throw new Error('NZBGet not configured')
  const base = cfg.baseUrl.replace(/\/$/, '')
  const url = cfg.username
    ? `${base.replace('://', `://${cfg.username}:${cfg.password}@`)}/jsonrpc`
    : `${base}/jsonrpc`

  const res = await axios.post(url, {
    version: '1.1',
    method,
    params,
    id: reqId++,
  })
  if (res.data.error) throw new Error(res.data.error.message)
  return res.data.result
}

export const nzbgetApi = {
  version: () => rpc('version'),
  status: () => rpc('status'),
  listGroups: (numberFiles = 0) => rpc('listgroups', [numberFiles]),
  listFiles: () => rpc('listfiles', [0, 0, 0]),
  history: (hidden = false) => rpc('history', [hidden]),
  pauseDownload: () => rpc('pausedownload'),
  resumeDownload: () => rpc('resumedownload'),
  pausePost: () => rpc('pausepost'),
  resumePost: () => rpc('resumepost'),
  setDownloadRate: (rate: number) => rpc('rate', [rate]),
  editQueue: (editAction: string, editOffset: number, editText: string, ids: number[]) =>
    rpc('editqueue', [editAction, editOffset, editText, ids]),
  deleteFromQueue: (id: number) =>
    rpc('editqueue', ['GroupDelete', 0, '', [id]]),
  pauseFromQueue: (id: number) =>
    rpc('editqueue', ['GroupPause', 0, '', [id]]),
  resumeFromQueue: (id: number) =>
    rpc('editqueue', ['GroupResume', 0, '', [id]]),
  moveToTop: (id: number) =>
    rpc('editqueue', ['GroupMoveTop', 0, '', [id]]),
  setPriority: (id: number, priority: number) =>
    rpc('editqueue', ['GroupSetPriority', priority, '', [id]]),
  setCategory: (id: number, category: string) =>
    rpc('editqueue', ['GroupSetCategory', 0, category, [id]]),
  historyMarkSuccess: (id: number) =>
    rpc('history', [false]).then(() => rpc('editqueue', ['HistoryMarkSuccess', 0, '', [id]])),
  historyDelete: (id: number) =>
    rpc('editqueue', ['HistoryDelete', 0, '', [id]]),
  scan: () => rpc('scan'),
  log: (idFrom: number, numberOfLines: number) => rpc('log', [idFrom, numberOfLines]),
  loadLog: (nzbId: number) => rpc('loadlog', [nzbId, 0, 100]),
  getConfig: () => rpc('config'),
  serverVolumes: () => rpc('servervolumes'),
}
