import { serviceGet, servicePost, serviceDelete } from '@/services/apiClient'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'bazarr'
const getApiKey = () => useSettingsStore.getState().getService(KEY)?.apiKey ?? ''
const headers = () => ({ headers: { 'X-Api-Key': getApiKey() } })

export interface BazarrEpisode {
  seriesId: number
  episodeId: number
  title: string
  season: number
  episode: number
  subtitles: { code2: string; name: string; path: string; forced: boolean; hi: boolean; file_size: number; time: number }[]
  missing_subtitles: { code2: string; name: string; forced: boolean; hi: boolean }[]
}

export interface BazarrMovie {
  radarrId: number
  title: string
  year: number
  subtitles: { code2: string; name: string; path: string; forced: boolean; hi: boolean; file_size: number }[]
  missing_subtitles: { code2: string; name: string; forced: boolean; hi: boolean }[]
}

export const bazarrApi = {
  getEpisodes: (seriesId?: number) =>
    serviceGet(KEY, '/api/episodes', { ...headers(), params: { seriesid: seriesId } }),

  getMissingEpisodes: (page = 1, perPage = 50) =>
    serviceGet(KEY, '/api/episodes/wanted', { ...headers(), params: { start: (page - 1) * perPage, length: perPage } }),

  getMissingMovies: (page = 1, perPage = 50) =>
    serviceGet(KEY, '/api/movies/wanted', { ...headers(), params: { start: (page - 1) * perPage, length: perPage } }),

  getMovies: (radarrId?: number) =>
    serviceGet(KEY, '/api/movies', { ...headers(), params: { radarrid: radarrId } }),

  searchEpisodeSubtitles: (_seriesId: number, episodeId: number, language: string) =>
    servicePost(KEY, '/api/subtitles', { type: 'episode', id: episodeId, language, hi: 'False', forced: 'False' }, headers()),

  searchMovieSubtitles: (radarrId: number, language: string) =>
    servicePost(KEY, '/api/subtitles', { type: 'movie', id: radarrId, language, hi: 'False', forced: 'False' }, headers()),

  getHistory: (page = 1, perPage = 50) =>
    serviceGet(KEY, '/api/history', { ...headers(), params: { start: (page - 1) * perPage, length: perPage } }),

  getProviders: () =>
    serviceGet(KEY, '/api/providers', headers()),

  getLanguages: () =>
    serviceGet(KEY, '/api/languages', headers()),

  getStatus: () =>
    serviceGet(KEY, '/api/system/status', headers()),

  deleteSubtitle: (path: string) =>
    serviceDelete(KEY, `/api/subtitles`, { ...headers(), params: { path } }),
}
