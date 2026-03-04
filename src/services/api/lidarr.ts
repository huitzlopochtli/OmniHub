import { serviceGet, servicePost, serviceDelete } from '@/services/apiClient'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'lidarr'
const getApiKey = () => useSettingsStore.getState().getService(KEY)?.apiKey ?? ''
const p = () => ({ params: { apikey: getApiKey() } })

export interface LidarrArtist {
  id: number
  artistName: string
  foreignArtistId: string
  status: string
  overview: string
  artistType: string
  disambiguation: string
  links: { url: string; name: string }[]
  images: { coverType: string; remoteUrl: string }[]
  path: string
  qualityProfileId: number
  metadataProfileId: number
  monitored: boolean
  monitorNewItems: string
  genres: string[]
  cleanName: string
  sortName: string
  tags: number[]
  added: string
  ratings: { votes: number; value: number }
  statistics: { albumCount: number; trackFileCount: number; trackCount: number; totalTrackCount: number; sizeOnDisk: number; percentOfTracks: number }
}

export interface LidarrAlbum {
  id: number
  title: string
  disambiguation: string
  overview: string
  artistId: number
  foreignAlbumId: string
  monitored: boolean
  anyReleaseOk: boolean
  profileId: number
  duration: number
  albumType: string
  secondaryTypes: string[]
  mediumCount: number
  ratings: { votes: number; value: number }
  releaseDate: string
  releases: unknown[]
  genres: string[]
  media: unknown[]
  artist: LidarrArtist
  images: { coverType: string; remoteUrl: string }[]
  links: { url: string; name: string }[]
  statistics: { trackFileCount: number; trackCount: number; totalTrackCount: number; percentOfTracks: number; sizeOnDisk: number }
}

export const lidarrApi = {
  getArtists: () => serviceGet<LidarrArtist[]>(KEY, '/api/v1/artist', p()),
  getArtistById: (id: number) => serviceGet<LidarrArtist>(KEY, `/api/v1/artist/${id}`, p()),
  searchArtists: (term: string) => serviceGet<LidarrArtist[]>(KEY, '/api/v1/artist/lookup', { params: { apikey: getApiKey(), term } }),
  addArtist: (payload: Partial<LidarrArtist>) => servicePost<LidarrArtist>(KEY, '/api/v1/artist', payload, p()),
  deleteArtist: (id: number, deleteFiles = false) => serviceDelete(KEY, `/api/v1/artist/${id}`, { params: { apikey: getApiKey(), deleteFiles } }),
  getAlbums: (artistId?: number) => serviceGet<LidarrAlbum[]>(KEY, '/api/v1/album', { params: { apikey: getApiKey(), artistId } }),
  getQueue: () => serviceGet(KEY, '/api/v1/queue', p()),
  getHistory: (page = 1, pageSize = 50) => serviceGet(KEY, '/api/v1/history', { params: { apikey: getApiKey(), page, pageSize } }),
  getWanted: (page = 1, pageSize = 50) => serviceGet(KEY, '/api/v1/wanted/missing', { params: { apikey: getApiKey(), page, pageSize } }),
  getQualityProfiles: () => serviceGet(KEY, '/api/v1/qualityprofile', p()),
  getRootFolders: () => serviceGet(KEY, '/api/v1/rootfolder', p()),
  getStatus: () => serviceGet(KEY, '/api/v1/system/status', p()),
}
