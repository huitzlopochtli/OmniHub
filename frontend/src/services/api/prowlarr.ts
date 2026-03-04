import { useMemo } from 'react'
import { serviceGet, servicePost, serviceDelete } from '@/services/apiClient'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

export interface ProwlarrIndexer {
  id: number;
  name: string;
  enable: boolean;
  priority: number;
  supportsRss: boolean;
  supportsSearch: boolean;
  protocol: string;
  privacy: string;
  categories: { id: number; name: string }[];
  fields: { name: string; value: unknown }[];
  implementationName: string;
  implementation: string;
  configContract: string;
  tags: number[];
}

export interface ProwlarrSearchResult {
  guid: string;
  age: number;
  ageHours: number;
  ageMinutes: number;
  files: number;
  grabs: number;
  indexer: string;
  indexerId: number;
  categories: { id: number; name: string }[];
  imdbId: string;
  tmdbId: number;
  tvdbId: number;
  title: string;
  size: number;
  publishDate: string;
  downloadUrl: string;
  magnetUrl: string;
  infoUrl: string;
  protocol: string;
  seeders: number;
  leechers: number;
}

export function createProwlarrApi(instanceId: string) {
  return {
  getIndexers: () => serviceGet<ProwlarrIndexer[]>(instanceId, "/api/v1/indexer", {}),

  addIndexer: (payload: Partial<ProwlarrIndexer>) =>
    servicePost(instanceId, "/api/v1/indexer", payload, {}),

  deleteIndexer: (id: number) =>
    serviceDelete(instanceId, `/api/v1/indexer/${id}`, {}),

  testIndexer: (id: number) =>
    servicePost(instanceId, `/api/v1/indexer/test/${id}`, undefined, {}),

  search: (query: string, categories?: number[], indexerIds?: number[]) =>
    serviceGet<ProwlarrSearchResult[]>(instanceId, "/api/v1/search", { params: { query, ...(categories && { categories }), ...(indexerIds && { indexerIds }) } }),

  getHistory: (page = 1, pageSize = 50) =>
    serviceGet(instanceId, "/api/v1/history", { params: { page, pageSize } }),

  getApps: () => serviceGet(instanceId, "/api/v1/applications", {}),

  syncAppIndexers: (id: number) =>
    servicePost(instanceId, `/api/v1/applications/actiontrigger/${id}`, { name: "SyncIndexers" }),

  getCategories: () => serviceGet(instanceId, "/api/v1/indexercategory", {}),

  getStatus: () => serviceGet(instanceId, "/api/v1/system/status", {}),
  }
}

// Backward-compatible shim: always binds to first enabled prowlarr instance.
// For multi-instance awareness inside service panels, use useProwlarrApi() instead.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prowlarrApi: ReturnType<typeof createProwlarrApi> = new Proxy({} as unknown as ReturnType<typeof createProwlarrApi>, {
  get(_: unknown, prop: string) {
    const id = useSettingsStore.getState()
      .getInstancesByType('prowlarr')
      .find((i) => i.enabled && i.baseUrl)?.id ?? ''
    return (createProwlarrApi(id) as Record<string, unknown>)[prop]
  },
})

export function useProwlarrApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createProwlarrApi(instanceId), [instanceId])
}
