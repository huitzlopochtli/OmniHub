import { serviceGet, servicePost, servicePut, serviceDelete } from '@/services/apiClient'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'sonarr'

function getApiKey() {
  return useSettingsStore.getState().getService(KEY)?.apiKey ?? ''
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SonarrSeries {
  id: number
  title: string
  sortTitle: string
  status: string
  overview: string
  network: string
  airTime: string
  images: { coverType: string; remoteUrl: string }[]
  seasons: SonarrSeason[]
  year: number
  path: string
  qualityProfileId: number
  languageProfileId: number
  seasonFolder: boolean
  monitored: boolean
  useSceneNumbering: boolean
  runtime: number
  tvdbId: number
  imdbId: string
  tmdbId: number
  firstAired: string
  seriesType: string
  cleanTitle: string
  titleSlug: string
  rootFolderPath: string
  folder: string
  certification: string
  genres: string[]
  tags: number[]
  added: string
  ratings: { votes: number; value: number }
  statistics: {
    seasonCount: number
    episodeFileCount: number
    episodeCount: number
    totalEpisodeCount: number
    sizeOnDisk: number
    percentOfEpisodes: number
  }
}

export interface SonarrSeason {
  seasonNumber: number
  monitored: boolean
  statistics: {
    previousAiring: string
    nextAiring: string
    episodeFileCount: number
    episodeCount: number
    totalEpisodeCount: number
    sizeOnDisk: number
    percentOfEpisodes: number
  }
}

export interface SonarrEpisode {
  id: number
  seriesId: number
  episodeFileId: number
  seasonNumber: number
  episodeNumber: number
  title: string
  airDate: string
  airDateUtc: string
  overview: string
  hasFile: boolean
  monitored: boolean
  absoluteEpisodeNumber: number
  unverifiedSceneNumbering: boolean
  grabbed: boolean
}

export interface SonarrQueueItem {
  id: number
  seriesId: number
  episodeId: number
  series: SonarrSeries
  episode: SonarrEpisode
  quality: { quality: { name: string }; revision: { version: number } }
  size: number
  title: string
  sizeleft: number
  timeleft: string
  estimatedCompletionTime: string
  status: string
  trackedDownloadStatus: string
  trackedDownloadState: string
  statusMessages: { title: string; messages: string[] }[]
  errorMessage: string
  downloadId: string
  protocol: string
  downloadClient: string
  indexer: string
  outputPath: string
}

export interface SonarrCalendarItem extends SonarrEpisode {
  series: SonarrSeries
}

export interface SonarrHistoryItem {
  id: number
  episodeId: number
  seriesId: number
  sourceTitle: string
  quality: { quality: { name: string } }
  date: string
  eventType: string
  data: Record<string, string>
  episode: SonarrEpisode
  series: SonarrSeries
}

export interface SonarrDiskSpace {
  path: string
  label: string
  freeSpace: number
  totalSpace: number
}

// ── API functions ──────────────────────────────────────────────────────────────

export const sonarrApi = {
  // Series
  getSeries: () =>
    serviceGet<SonarrSeries[]>(KEY, '/api/v3/series', {
      params: { apikey: getApiKey() },
    }),

  getSeriesById: (id: number) =>
    serviceGet<SonarrSeries>(KEY, `/api/v3/series/${id}`, {
      params: { apikey: getApiKey() },
    }),

  addSeries: (payload: Partial<SonarrSeries> & { tvdbId: number }) =>
    servicePost<SonarrSeries>(KEY, '/api/v3/series', payload, {
      params: { apikey: getApiKey() },
    }),

  updateSeries: (series: SonarrSeries) =>
    servicePut<SonarrSeries>(KEY, `/api/v3/series/${series.id}`, series, {
      params: { apikey: getApiKey() },
    }),

  deleteSeries: (id: number, deleteFiles = false) =>
    serviceDelete(KEY, `/api/v3/series/${id}`, {
      params: { apikey: getApiKey(), deleteFiles },
    }),

  searchSeries: (term: string) =>
    serviceGet<SonarrSeries[]>(KEY, '/api/v3/series/lookup', {
      params: { apikey: getApiKey(), term },
    }),

  // Episodes
  getEpisodes: (seriesId: number) =>
    serviceGet<SonarrEpisode[]>(KEY, '/api/v3/episode', {
      params: { apikey: getApiKey(), seriesId },
    }),

  monitorEpisode: (episodeIds: number[], monitored: boolean) =>
    servicePut(KEY, '/api/v3/episode/monitor', { episodeIds, monitored }, {
      params: { apikey: getApiKey() },
    }),

  // Queue
  getQueue: () =>
    serviceGet<{ totalRecords: number; records: SonarrQueueItem[] }>(
      KEY,
      '/api/v3/queue',
      { params: { apikey: getApiKey(), includeUnknownSeriesItems: true } },
    ),

  removeFromQueue: (id: number, blacklist = false) =>
    serviceDelete(KEY, `/api/v3/queue/${id}`, {
      params: { apikey: getApiKey(), blacklist },
    }),

  // Calendar
  getCalendar: (start: string, end: string) =>
    serviceGet<SonarrCalendarItem[]>(KEY, '/api/v3/calendar', {
      params: { apikey: getApiKey(), start, end, includeSeries: true },
    }),

  // History
  getHistory: (page = 1, pageSize = 50) =>
    serviceGet<{ totalRecords: number; records: SonarrHistoryItem[] }>(
      KEY,
      '/api/v3/history',
      { params: { apikey: getApiKey(), page, pageSize, sortKey: 'date', sortDirection: 'descending' } },
    ),

  // Commands
  searchSeriesNow: (seriesId: number) =>
    servicePost(KEY, '/api/v3/command', { name: 'SeriesSearch', seriesId }, {
      params: { apikey: getApiKey() },
    }),

  searchEpisode: (episodeIds: number[]) =>
    servicePost(KEY, '/api/v3/command', { name: 'EpisodeSearch', episodeIds }, {
      params: { apikey: getApiKey() },
    }),

  // Disk space
  getDiskSpace: () =>
    serviceGet<SonarrDiskSpace[]>(KEY, '/api/v3/diskspace', {
      params: { apikey: getApiKey() },
    }),

  // Quality profiles
  getQualityProfiles: () =>
    serviceGet<{ id: number; name: string }[]>(KEY, '/api/v3/qualityprofile', {
      params: { apikey: getApiKey() },
    }),

  // Root folders
  getRootFolders: () =>
    serviceGet<{ id: number; path: string; freeSpace: number }[]>(
      KEY,
      '/api/v3/rootfolder',
      { params: { apikey: getApiKey() } },
    ),

  // System status
  getStatus: () =>
    serviceGet<{ version: string; buildTime: string; appName: string }>(
      KEY,
      '/api/v3/system/status',
      { params: { apikey: getApiKey() } },
    ),

  // Wanted / missing
  getMissing: (page = 1, pageSize = 50) =>
    serviceGet(KEY, '/api/v3/wanted/missing', {
      params: { apikey: getApiKey(), page, pageSize, sortKey: 'airDateUtc', sortDirection: 'descending' },
    }),

  getCutoffUnmet: (page = 1, pageSize = 50) =>
    serviceGet(KEY, '/api/v3/wanted/cutoff', {
      params: { apikey: getApiKey(), page, pageSize },
    }),
}
