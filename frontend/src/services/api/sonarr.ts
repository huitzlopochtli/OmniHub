import { useMemo } from 'react'
import { serviceGet, servicePost, servicePut, serviceDelete } from '@/services/apiClient'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

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

export function createSonarrApi(instanceId: string) {
  return {
    // Series
    getSeries: () => serviceGet<SonarrSeries[]>(instanceId, '/api/v3/series', {}),

    getSeriesById: (id: number) => serviceGet<SonarrSeries>(instanceId, `/api/v3/series/${id}`, {}),

    addSeries: (payload: Partial<SonarrSeries> & { tvdbId: number }) =>
      servicePost<SonarrSeries>(instanceId, '/api/v3/series', payload, {}),

    updateSeries: (series: SonarrSeries) =>
      servicePut<SonarrSeries>(instanceId, `/api/v3/series/${series.id}`, series, {}),

    deleteSeries: (id: number, deleteFiles = false) =>
      serviceDelete(instanceId, `/api/v3/series/${id}`, {
        params: { deleteFiles },
      }),

    searchSeries: (term: string) =>
      serviceGet<SonarrSeries[]>(instanceId, '/api/v3/series/lookup', {
        params: { term },
      }),

    // Episodes
    getEpisodes: (seriesId: number) =>
      serviceGet<SonarrEpisode[]>(instanceId, '/api/v3/episode', {
        params: { seriesId },
      }),

    monitorEpisode: (episodeIds: number[], monitored: boolean) =>
      servicePut(instanceId, '/api/v3/episode/monitor', { episodeIds, monitored }, {}),

    // Queue
    getQueue: () =>
      serviceGet<{ totalRecords: number; records: SonarrQueueItem[] }>(
        instanceId,
        '/api/v3/queue',
        {
          params: { includeUnknownSeriesItems: true },
        },
      ),

    removeFromQueue: (id: number, blacklist = false) =>
      serviceDelete(instanceId, `/api/v3/queue/${id}`, {
        params: { blacklist },
      }),

    // Calendar
    getCalendar: (start: string, end: string) =>
      serviceGet<SonarrCalendarItem[]>(instanceId, '/api/v3/calendar', {
        params: { start, end },
      }),

    // History
    getHistory: (page = 1, pageSize = 50) =>
      serviceGet<{ totalRecords: number; records: SonarrHistoryItem[] }>(
        instanceId,
        '/api/v3/history',
        {
          params: {
            page,
            pageSize,
            sortKey: 'date',
            sortDirection: 'descending',
          },
        },
      ),

    // Commands
    searchSeriesNow: (seriesId: number) =>
      servicePost(instanceId, '/api/v3/command', { name: 'SeriesSearch', seriesId }, {}),

    searchEpisode: (episodeIds: number[]) =>
      servicePost(instanceId, '/api/v3/command', { name: 'EpisodeSearch', episodeIds }, {}),

    // Disk space
    getDiskSpace: () => serviceGet<SonarrDiskSpace[]>(instanceId, '/api/v3/diskspace', {}),

    // Quality profiles
    getQualityProfiles: () =>
      serviceGet<{ id: number; name: string }[]>(instanceId, '/api/v3/qualityprofile', {}),

    // Root folders
    getRootFolders: () =>
      serviceGet<{ id: number; path: string; freeSpace: number }[]>(
        instanceId,
        '/api/v3/rootfolder',
      ),

    // System status
    getStatus: () =>
      serviceGet<{ version: string; buildTime: string; appName: string }>(
        instanceId,
        '/api/v3/system/status',
      ),

    // Wanted / missing
    getMissing: (page = 1, pageSize = 50) =>
      serviceGet(instanceId, '/api/v3/wanted/missing', {
        params: { page, pageSize },
      }),

    getCutoffUnmet: (page = 1, pageSize = 50) =>
      serviceGet(instanceId, '/api/v3/wanted/cutoff', {
        params: { page, pageSize },
      }),
  }
}
// Backward-compatible shim: always binds to first enabled sonarr instance.
// For multi-instance awareness inside service panels, use useSonarrApi() instead.
// @ts-expect-error -- Proxy shim: {} is not assignable but is safe at runtime

export const sonarrApi: ReturnType<typeof createSonarrApi> = new Proxy(
  {} as unknown as ReturnType<typeof createSonarrApi>,
  {
    get(_: unknown, prop: string) {
      const id =
        useSettingsStore
          .getState()
          .getInstancesByType('sonarr')
          .find((i) => i.enabled && i.baseUrl)?.id ?? ''
      return (createSonarrApi(id) as Record<string, unknown>)[prop]
    },
  },
)

export function useSonarrApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createSonarrApi(instanceId), [instanceId])
}
