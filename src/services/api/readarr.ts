import { serviceGet, servicePost, serviceDelete } from '@/services/apiClient'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'readarr'
const getApiKey = () => useSettingsStore.getState().getService(KEY)?.apiKey ?? ''
const p = () => ({ params: { apikey: getApiKey() } })

export const readarrApi = {
  getAuthors: () => serviceGet(KEY, '/api/v1/author', p()),
  getAuthorById: (id: number) => serviceGet(KEY, `/api/v1/author/${id}`, p()),
  searchAuthors: (term: string) => serviceGet(KEY, '/api/v1/author/lookup', { params: { apikey: getApiKey(), term } }),
  addAuthor: (payload: unknown) => servicePost(KEY, '/api/v1/author', payload, p()),
  deleteAuthor: (id: number, deleteFiles = false) => serviceDelete(KEY, `/api/v1/author/${id}`, { params: { apikey: getApiKey(), deleteFiles } }),
  getBooks: (authorId?: number) => serviceGet(KEY, '/api/v1/book', { params: { apikey: getApiKey(), authorId } }),
  getQueue: () => serviceGet(KEY, '/api/v1/queue', p()),
  getHistory: (page = 1, pageSize = 50) => serviceGet(KEY, '/api/v1/history', { params: { apikey: getApiKey(), page, pageSize } }),
  getWanted: (page = 1, pageSize = 50) => serviceGet(KEY, '/api/v1/wanted/missing', { params: { apikey: getApiKey(), page, pageSize } }),
  getQualityProfiles: () => serviceGet(KEY, '/api/v1/qualityprofile', p()),
  getRootFolders: () => serviceGet(KEY, '/api/v1/rootfolder', p()),
  getStatus: () => serviceGet(KEY, '/api/v1/system/status', p()),
}
