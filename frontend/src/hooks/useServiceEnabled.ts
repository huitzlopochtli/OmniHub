import { useMemo } from 'react'
import { useSettingsStore, type ServiceKey } from '@/stores/settingsStore'

/**
 * Select the raw instances array from state directly (stable reference).
 * Avoids calling getInstancesByType/getActiveProfile which always produce new
 * array references via migrateProfile() + .filter(), causing infinite loops.
 */
function useRawInstances() {
  return useSettingsStore((s) => {
    const p = s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]
    return p?.instances ?? ([] as import('@/stores/settingsStore').ServiceInstance[])
  })
}

/** Returns true if at least one configured+enabled instance of the given type exists. */
export function useServiceEnabled(type: ServiceKey): boolean {
  const instances = useRawInstances()
  return useMemo(
    () => instances.some((i) => i.type === type && i.enabled && !!i.baseUrl),
    [instances, type],
  )
}

/** Returns all instanceIds that are enabled and have a baseUrl configured. */
export function useEnabledInstances(type: ServiceKey): string[] {
  const instances = useRawInstances()
  return useMemo(
    () => instances.filter((i) => i.type === type && i.enabled && !!i.baseUrl).map((i) => i.id),
    [instances, type],
  )
}

/** Returns all configured instances across all service types. */
export function useAllInstances() {
  return useRawInstances()
}

/** Returns the config for a specific instance by id. */
export function useInstance(id: string) {
  return useSettingsStore((s) => {
    const p = s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]
    return p?.instances.find((i) => i.id === id)
  })
}
