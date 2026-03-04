import { serviceGet, servicePost, servicePut, serviceDelete } from '@/services/apiClient'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'radarr'

function getApiKey() {
  return useSettingsStore.getState().getService(KEY)?.apiKey ?? ''
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RadarrMovie {
  id: number
  title: string
  originalTitle: string
  alternateTitles: { sourceType: string; movieId: number; title: string }[]
  sortTitle: string
  sizeOnDisk: number
  status: string
  overview: string
  inCinemas: string
  physicalRelease: string
  digitalRelease: string
  images: { coverType: string; remoteUrl: string; url: string }[]
  website: string
  year: number
  hasFile: boolean
  youTubeTrailerId: string
  studio: string
  path: string
  qualityProfileId: number
  monitored: boolean
  minimumAvailability: string
  isAvailable: boolean
  folderName: string
  runtime: number
  cleanTitle: string
  imdbId: string
  tmdbId: number
  titleSlug: string
  certification: string
  genres: string[]
  tags: number[]
  added: string
  ratings: { tmdb: { votes: number; value: number }; imdb: { votes: number; value: number } }
  movieFile?: {
    id: number
    movieId: number
    relativePath: string
    path: string
    size: number
    dateAdded: string
    quality: { quality: { name: string } }
    mediaInfo: {
      videoCodec: string
      audioCodec: string
      audioChannels: number
      resolution: string
    }
  }
  collection?: { name: string; tmdbId: number }
  popularity: number
}

export interface RadarrQueueItem {
  id: number
  movieId: number
  movie: RadarrMovie
  quality: { quality: { name: string } }
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

// ── API functions ──────────────────────────────────────────────────────────────

export const radarrApi = {
  // Movies
  getMovies: () =>
    serviceGet<RadarrMovie[]>(KEY, '/api/v3/movie', {
      params: { apikey: getApiKey() },
    }),

  getMovieById: (id: number) =>
    serviceGet<RadarrMovie>(KEY, `/api/v3/movie/${id}`, {
      params: { apikey: getApiKey() },
    }),

  addMovie: (payload: Partial<RadarrMovie> & { tmdbId: number }) =>
    servicePost<RadarrMovie>(KEY, '/api/v3/movie', payload, {
      params: { apikey: getApiKey() },
    }),

  updateMovie: (movie: RadarrMovie) =>
    servicePut<RadarrMovie>(KEY, `/api/v3/movie/${movie.id}`, movie, {
      params: { apikey: getApiKey() },
    }),

  deleteMovie: (id: number, deleteFiles = false, addImportExclusion = false) =>
    serviceDelete(KEY, `/api/v3/movie/${id}`, {
      params: { apikey: getApiKey(), deleteFiles, addImportExclusion },
    }),

  searchMovies: (term: string) =>
    serviceGet<RadarrMovie[]>(KEY, '/api/v3/movie/lookup', {
      params: { apikey: getApiKey(), term },
    }),

  // Queue
  getQueue: () =>
    serviceGet<{ totalRecords: number; records: RadarrQueueItem[] }>(
      KEY,
      '/api/v3/queue',
      { params: { apikey: getApiKey(), includeUnknownMovieItems: true } },
    ),

  removeFromQueue: (id: number, blacklist = false) =>
    serviceDelete(KEY, `/api/v3/queue/${id}`, {
      params: { apikey: getApiKey(), blacklist },
    }),

  // Calendar
  getCalendar: (start: string, end: string) =>
    serviceGet<RadarrMovie[]>(KEY, '/api/v3/calendar', {
      params: { apikey: getApiKey(), start, end },
    }),

  // History
  getHistory: (page = 1, pageSize = 50) =>
    serviceGet(KEY, '/api/v3/history', {
      params: { apikey: getApiKey(), page, pageSize, sortKey: 'date', sortDirection: 'descending' },
    }),

  // Commands
  searchMovie: (movieIds: number[]) =>
    servicePost(KEY, '/api/v3/command', { name: 'MoviesSearch', movieIds }, {
      params: { apikey: getApiKey() },
    }),

  refreshMovie: (movieId: number) =>
    servicePost(KEY, '/api/v3/command', { name: 'RefreshMovie', movieId }, {
      params: { apikey: getApiKey() },
    }),

  // Disk space
  getDiskSpace: () =>
    serviceGet<{ path: string; label: string; freeSpace: number; totalSpace: number }[]>(KEY, '/api/v3/diskspace', {
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
    serviceGet(KEY, '/api/v3/system/status', {
      params: { apikey: getApiKey() },
    }),

  // Wanted
  getMissing: (page = 1, pageSize = 50) =>
    serviceGet(KEY, '/api/v3/wanted/missing', {
      params: { apikey: getApiKey(), page, pageSize },
    }),

  getCutoffUnmet: (page = 1, pageSize = 50) =>
    serviceGet(KEY, '/api/v3/wanted/cutoff', {
      params: { apikey: getApiKey(), page, pageSize },
    }),
}
