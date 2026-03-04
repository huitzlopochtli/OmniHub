import { useMemo } from 'react'
import { serviceGet, servicePost, serviceDelete } from '@/services/apiClient'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

export interface BazarrEpisode {
  seriesId: number
  episodeId: number
  title: string
  season: number
  episode: number
  subtitles: {
    code2: string
    name: string
    path: string
    forced: boolean
    hi: boolean
    file_size: number
    time: number
  }[]
  missing_subtitles: {
    code2: string
    name: string
    forced: boolean
    hi: boolean
  }[]
}

export interface BazarrMovie {
  radarrId: number
  title: string
  year: number
  subtitles: {
    code2: string
    name: string
    path: string
    forced: boolean
    hi: boolean
    file_size: number
  }[]
  missing_subtitles: {
    code2: string
    name: string
    forced: boolean
    hi: boolean
  }[]
}

export function createBazarrApi(instanceId: string) {
  return {
    getEpisodes: (seriesId?: number) =>
      serviceGet(instanceId, '/api/episodes', {
        params: seriesId !== undefined ? { seriesId } : {},
      }),

    getMissingEpisodes: (page = 1, perPage = 50) =>
      serviceGet(instanceId, '/api/episodes/wanted', {
        params: { page, per_page: perPage },
      }),

    getMissingMovies: (page = 1, perPage = 50) =>
      serviceGet(instanceId, '/api/movies/wanted', {
        params: { page, per_page: perPage },
      }),

    getMovies: (radarrId?: number) =>
      serviceGet(instanceId, '/api/movies', {
        params: radarrId !== undefined ? { radarr_id: radarrId } : {},
      }),

    searchEpisodeSubtitles: (_seriesId: number, episodeId: number, language: string) =>
      servicePost(instanceId, '/api/subtitles', {
        type: 'episode',
        id: episodeId,
        language,
        hi: 'False',
        forced: 'False',
      }),

    searchMovieSubtitles: (radarrId: number, language: string) =>
      servicePost(instanceId, '/api/subtitles', {
        type: 'movie',
        id: radarrId,
        language,
        hi: 'False',
        forced: 'False',
      }),

    getHistory: (page = 1, perPage = 50) =>
      serviceGet(instanceId, '/api/history', {
        params: { page, per_page: perPage },
      }),

    getProviders: () => serviceGet(instanceId, '/api/providers'),

    getLanguages: () => serviceGet(instanceId, '/api/languages'),

    getStatus: () => serviceGet(instanceId, '/api/system/status'),

    deleteSubtitle: (path: string) =>
      serviceDelete(instanceId, `/api/subtitles`, { params: { path } }),
  }
}

// Backward-compatible shim: always binds to first enabled bazarr instance.
// For multi-instance awareness inside service panels, use useBazarrApi() instead.
// @ts-expect-error -- Proxy shim: {} is not assignable but is safe at runtime

export const bazarrApi: ReturnType<typeof createBazarrApi> = new Proxy(
  {} as unknown as ReturnType<typeof createBazarrApi>,
  {
    get(_: unknown, prop: string) {
      const id =
        useSettingsStore
          .getState()
          .getInstancesByType('bazarr')
          .find((i) => i.enabled && i.baseUrl)?.id ?? ''
      return (createBazarrApi(id) as Record<string, unknown>)[prop]
    },
  },
)

export function useBazarrApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createBazarrApi(instanceId), [instanceId])
}
