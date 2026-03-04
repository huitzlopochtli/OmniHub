import { serviceGet, servicePost, serviceDelete } from '@/services/apiClient'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'prowlarr'
const getApiKey = () => useSettingsStore.getState().getService(KEY)?.apiKey ?? ''
const p = () => ({ params: { apikey: getApiKey() } })

export interface ProwlarrIndexer {
  id: number
  name: string
  enable: boolean
  priority: number
  supportsRss: boolean
  supportsSearch: boolean
  protocol: string
  privacy: string
  categories: { id: number; name: string }[]
  fields: { name: string; value: unknown }[]
  implementationName: string
  implementation: string
  configContract: string
  tags: number[]
}

export interface ProwlarrSearchResult {
  guid: string
  age: number
  ageHours: number
  ageMinutes: number
  files: number
  grabs: number
  indexer: string
  indexerId: number
  categories: { id: number; name: string }[]
  imdbId: string
  tmdbId: number
  tvdbId: number
  title: string
  size: number
  publishDate: string
  downloadUrl: string
  magnetUrl: string
  infoUrl: string
  protocol: string
  seeders: number
  leechers: number
}

export const prowlarrApi = {
  getIndexers: () => serviceGet<ProwlarrIndexer[]>(KEY, '/api/v1/indexer', p()),

  addIndexer: (payload: Partial<ProwlarrIndexer>) => servicePost(KEY, '/api/v1/indexer', payload, p()),

  deleteIndexer: (id: number) => serviceDelete(KEY, `/api/v1/indexer/${id}`, p()),

  testIndexer: (id: number) => servicePost(KEY, `/api/v1/indexer/test/${id}`, undefined, p()),

  search: (query: string, categories?: number[], indexerIds?: number[]) =>
    serviceGet<ProwlarrSearchResult[]>(KEY, '/api/v1/search', {
      params: { apikey: getApiKey(), query, categories: categories?.join(','), indexerIds: indexerIds?.join(',') },
    }),

  getHistory: (page = 1, pageSize = 50) =>
    serviceGet(KEY, '/api/v1/history', { params: { apikey: getApiKey(), page, pageSize } }),

  getApps: () => serviceGet(KEY, '/api/v1/applications', p()),

  syncAppIndexers: (id: number) => servicePost(KEY, `/api/v1/applications/actiontrigger/${id}`, { name: 'SyncIndexers' }, p()),

  getCategories: () => serviceGet(KEY, '/api/v1/indexercategory', p()),

  getStatus: () => serviceGet(KEY, '/api/v1/system/status', p()),
}
