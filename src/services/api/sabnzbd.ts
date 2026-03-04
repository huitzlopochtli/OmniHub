import { serviceGet } from '@/services/apiClient'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'sabnzbd'

function getApiKey() {
  return useSettingsStore.getState().getService(KEY)?.apiKey ?? ''
}

function apiParams(mode: string, extra?: Record<string, string | number | boolean>) {
  return { params: { apikey: getApiKey(), mode, output: 'json', ...extra } }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SABnzbdQueueSlot {
  status: string
  index: number
  password: string
  avg_age: string
  script: string
  direct_unpack: string
  mb: string
  mbleft: string
  mbmissing: string
  size: string
  sizeleft: string
  filename: string
  labels: string[]
  priority: string
  cat: string
  timeleft: string
  percentage: string
  nzo_id: string
  unpackopts: string
}

export interface SABnzbdQueue {
  status: string
  speedlimit: string
  speedlimit_abs: string
  paused: boolean
  noofslots_total: number
  noofslots: number
  limit: number
  start: number
  timeleft: string
  speed: string
  kbpersec: string
  size: string
  sizeleft: string
  mb: string
  mbleft: string
  slots: SABnzbdQueueSlot[]
}

export interface SABnzbdHistorySlot {
  action_line: string
  duplicate_key: string
  meta: null
  fail_message: string
  loaded: boolean
  id: number
  size: string
  category: string
  pp: string
  completeness: null
  script: string
  nzb_name: string
  download_time: number
  storage: string
  has_rating: boolean
  status: string
  script_log: string
  script_line: string
  completed: number
  nzo_id: string
  downloaded: number
  report: string
  url: string
  name: string
  md5sum: string
  bytes: number
  url_info: string
  stage_log: { name: string; actions: string[] }[]
}

// ── API ──────────────────────────────────────────────────────────────────────

export const sabnzbdApi = {
  getQueue: (start = 0, limit = 100) =>
    serviceGet<{ queue: SABnzbdQueue }>(KEY, '/api', apiParams('queue', { start, limit })),

  getHistory: (start = 0, limit = 50) =>
    serviceGet<{ history: { noofslots: number; slots: SABnzbdHistorySlot[] } }>(
      KEY,
      '/api',
      apiParams('history', { start, limit }),
    ),

  pauseQueue: () =>
    serviceGet(KEY, '/api', apiParams('pause')),

  resumeQueue: () =>
    serviceGet(KEY, '/api', apiParams('resume')),

  pauseJob: (nzoId: string) =>
    serviceGet(KEY, '/api', apiParams('queue', { name: 'pause', value: nzoId })),

  resumeJob: (nzoId: string) =>
    serviceGet(KEY, '/api', apiParams('queue', { name: 'resume', value: nzoId })),

  deleteJob: (nzoId: string, deletefile = true) =>
    serviceGet(KEY, '/api', apiParams('queue', { name: 'delete', value: nzoId, del_files: deletefile ? 1 : 0 })),

  setSpeedLimit: (value: number | string) =>
    serviceGet(KEY, '/api', apiParams('config', { name: 'speedlimit', value })),

  setPriority: (nzoId: string, priority: number) =>
    serviceGet(KEY, '/api', apiParams('queue', { name: 'priority', value: nzoId, value2: priority })),

  moveJob: (nzoId: string, toPosition: number) =>
    serviceGet(KEY, '/api', apiParams('switch', { value: nzoId, value2: toPosition })),

  retryJob: (nzoId: string) =>
    serviceGet(KEY, '/api', apiParams('retry', { value: nzoId })),

  deleteHistory: (nzoId: string | 'all', delFiles = false) =>
    serviceGet(KEY, '/api', apiParams('history', { name: 'delete', value: nzoId, del_files: delFiles ? 1 : 0 })),

  getCategories: () =>
    serviceGet<{ categories: string[] }>(KEY, '/api', apiParams('get_cats')),

  getScripts: () =>
    serviceGet<{ scripts: string[] }>(KEY, '/api', apiParams('get_scripts')),

  getStatus: () =>
    serviceGet(KEY, '/api', apiParams('fullstatus', { skip_dashboard: 1 })),

  setCategory: (nzoId: string, value: string) =>
    serviceGet(KEY, '/api', apiParams('change_cat', { value: nzoId, value2: value })),

  setScript: (nzoId: string, script: string) =>
    serviceGet(KEY, '/api', apiParams('change_script', { value: nzoId, value2: script })),
}
