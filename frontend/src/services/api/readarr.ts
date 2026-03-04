import { useMemo } from 'react'
import { serviceGet, servicePost, serviceDelete } from '@/services/apiClient'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

export function createReadarrApi(instanceId: string) {
  return {
  getAuthors: () => serviceGet(instanceId, "/api/v1/author", {}),
  getAuthorById: (id: number) => serviceGet(instanceId, `/api/v1/author/${id}`, {}),
  searchAuthors: (term: string) =>
    serviceGet(instanceId, "/api/v1/author/lookup", { params: { term } }),
  addAuthor: (payload: unknown) =>
    servicePost(instanceId, "/api/v1/author", payload, {}),
  deleteAuthor: (id: number, deleteFiles = false) =>
    serviceDelete(instanceId, `/api/v1/author/${id}`, { params: { deleteFiles } }),
  getBooks: (authorId?: number) =>
    serviceGet(instanceId, "/api/v1/book", { params: authorId !== undefined ? { authorId } : {} }),
  getQueue: () => serviceGet(instanceId, "/api/v1/queue", {}),
  getHistory: (page = 1, pageSize = 50) =>
    serviceGet(instanceId, "/api/v1/history", { params: { page, pageSize } }),
  getWanted: (page = 1, pageSize = 50) =>
    serviceGet(instanceId, "/api/v1/wanted/missing", { params: { page, pageSize } }),
  getQualityProfiles: () => serviceGet(instanceId, "/api/v1/qualityprofile", {}),
  getRootFolders: () => serviceGet(instanceId, "/api/v1/rootfolder", {}),
  getStatus: () => serviceGet(instanceId, "/api/v1/system/status", {}),
  }
}

// Backward-compatible shim: always binds to first enabled readarr instance.
// For multi-instance awareness inside service panels, use useReadarrApi() instead.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const readarrApi: ReturnType<typeof createReadarrApi> = new Proxy({} as unknown as ReturnType<typeof createReadarrApi>, {
  get(_: unknown, prop: string) {
    const id = useSettingsStore.getState()
      .getInstancesByType('readarr')
      .find((i) => i.enabled && i.baseUrl)?.id ?? ''
    return (createReadarrApi(id) as Record<string, unknown>)[prop]
  },
})

export function useReadarrApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createReadarrApi(instanceId), [instanceId])
}
