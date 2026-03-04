import { serviceGet, servicePost } from '@/services/apiClient'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'overseerr'
const getApiKey = () => useSettingsStore.getState().getService(KEY)?.apiKey ?? ''
const h = () => ({ headers: { 'X-Api-Key': getApiKey() } })

export interface SeerrMedia {
  id: number
  mediaType: 'movie' | 'tv'
  tmdbId: number
  tvdbId?: number
  imdbId?: string
  status: number // 1=unknown, 2=pending, 3=processing, 4=partiallyAvailable, 5=available
  requests: SeerrRequest[]
  createdAt: string
  updatedAt: string
}

export interface SeerrRequest {
  id: number
  status: number
  media: { mediaType: string; tmdbId: number; id: number; status: number }
  createdAt: string
  updatedAt: string
  requestedBy: { id: number; displayName: string; email: string; avatar: string }
  modifiedBy?: { id: number; displayName: string }
  is4k: boolean
  serverId?: number
  profileId?: number
  rootFolder?: string
  languageProfileId?: number
  seasonCount?: number
  seasons?: number[]
}

export interface SeerrMovieResult {
  id: number
  mediaType: 'movie'
  title: string
  originalTitle: string
  releaseDate: string
  overview: string
  posterPath: string
  backdropPath: string
  voteAverage: number
  popularity: number
  mediaInfo?: SeerrMedia
  genres: { id: number; name: string }[]
}

export interface SeerrTVResult {
  id: number
  mediaType: 'tv'
  name: string
  originalName: string
  firstAirDate: string
  overview: string
  posterPath: string
  backdropPath: string
  voteAverage: number
  popularity: number
  mediaInfo?: SeerrMedia
}

export const overseerrApi = {
  // Discover
  getDiscoverMovies: (page = 1) =>
    serviceGet<{ results: SeerrMovieResult[]; totalPages: number; totalResults: number }>(
      KEY, '/api/v1/discover/movies', { ...h(), params: { page } },
    ),

  getDiscoverTV: (page = 1) =>
    serviceGet<{ results: SeerrTVResult[]; totalPages: number; totalResults: number }>(
      KEY, '/api/v1/discover/tv', { ...h(), params: { page } },
    ),

  getTrending: (page = 1) =>
    serviceGet(KEY, '/api/v1/discover/trending', { ...h(), params: { page } }),

  // Search
  search: (query: string, page = 1) =>
    serviceGet(KEY, '/api/v1/search', { ...h(), params: { query, page } }),

  // Movie detail
  getMovieDetail: (tmdbId: number) =>
    serviceGet<SeerrMovieResult>(KEY, `/api/v1/movie/${tmdbId}`, h()),

  // TV detail
  getTVDetail: (tvdbId: number) =>
    serviceGet<SeerrTVResult>(KEY, `/api/v1/tv/${tvdbId}`, h()),

  // Requests
  getRequests: (take = 20, skip = 0, filter = 'all', sort = 'added') =>
    serviceGet<{ pageInfo: { pages: number; pageSize: number; results: number; page: number }; results: SeerrRequest[] }>(
      KEY, '/api/v1/request', { ...h(), params: { take, skip, filter, sort } },
    ),

  requestMovie: (tmdbId: number, is4k = false) =>
    servicePost(KEY, '/api/v1/request', { mediaType: 'movie', mediaId: tmdbId, is4k }, h()),

  requestTV: (tvdbId: number, seasons: number[], is4k = false) =>
    servicePost(KEY, '/api/v1/request', { mediaType: 'tv', mediaId: tvdbId, seasons, is4k }, h()),

  approveRequest: (requestId: number) =>
    servicePost(KEY, `/api/v1/request/${requestId}/approve`, undefined, h()),

  declineRequest: (requestId: number) =>
    servicePost(KEY, `/api/v1/request/${requestId}/decline`, undefined, h()),

  // Status
  getStatus: () => serviceGet(KEY, '/api/v1/status', h()),
}
