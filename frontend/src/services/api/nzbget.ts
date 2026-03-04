import { useMemo } from 'react'
import axios from 'axios'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

let reqId = 1

export function createNzbgetApi(instanceId: string) {
  async function rpc(method: string, params: unknown[] = []) {
    const cfg = useSettingsStore.getState().getInstance(instanceId)
    if (!cfg) throw new Error('NZBGet not configured')
    const base = cfg.baseUrl.replace(/\/$/, '')
    const url = cfg.username
      ? `${base.replace('://', `://${cfg.username}:${cfg.password}@`)}/jsonrpc`
      : `${base}/jsonrpc`
    const res = await axios.post(url, { version: '1.1', method, params, id: reqId++ })
    if (res.data.error) throw new Error(res.data.error.message)
    return res.data.result
  }

  return {
    version: () => rpc('version'),
    status: () => rpc('status'),
    listGroups: (numberFiles = 0) => rpc('listgroups', [numberFiles]),
    listFiles: () => rpc('listfiles', [0, 0, 0]),
    history: (hidden = false) => rpc('history', [hidden]),
    pauseDownload: () => rpc('pausedownload'),
    resumeDownload: () => rpc('resumedownload'),
    setDownloadRate: (rate: number) => rpc('rate', [rate]),
    editQueue: (action: string, offset: number, text: string, ids: number[]) =>
      rpc('editqueue', [action, offset, text, ids]),
    deleteFromQueue: (id: number) => rpc('editqueue', ['GroupDelete', 0, '', [id]]),
    pauseFromQueue: (id: number) => rpc('editqueue', ['GroupPause', 0, '', [id]]),
    resumeFromQueue: (id: number) => rpc('editqueue', ['GroupResume', 0, '', [id]]),
    moveToTop: (id: number) => rpc('editqueue', ['GroupMoveTop', 0, '', [id]]),
    setPriority: (id: number, priority: number) =>
      rpc('editqueue', ['GroupSetPriority', priority, '', [id]]),
    setCategory: (id: number, category: string) =>
      rpc('editqueue', ['GroupSetCategory', 0, category, [id]]),
    historyDelete: (id: number) => rpc('editqueue', ['HistoryDelete', 0, '', [id]]),
    scan: () => rpc('scan'),
    getConfig: () => rpc('config'),
    serverVolumes: () => rpc('servervolumes'),
  }
}

// Backward-compatible shim: always binds to first enabled nzbget instance.
// For multi-instance awareness inside service panels, use useNzbgetApi() instead.
// @ts-expect-error -- Proxy shim: {} is not assignable but is safe at runtime

export const nzbgetApi: ReturnType<typeof createNzbgetApi> = new Proxy(
  {} as unknown as ReturnType<typeof createNzbgetApi>,
  {
    get(_: unknown, prop: string) {
      const id =
        useSettingsStore
          .getState()
          .getInstancesByType('nzbget')
          .find((i) => i.enabled && i.baseUrl)?.id ?? ''
      return (createNzbgetApi(id) as Record<string, unknown>)[prop]
    },
  },
)

export function useNzbgetApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createNzbgetApi(instanceId), [instanceId])
}
