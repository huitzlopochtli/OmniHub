import { useSettingsStore, type ServiceKey } from '@/stores/settingsStore'

/**
 * Returns whether a service is configured and enabled.
 */
export function useServiceEnabled(key: ServiceKey): boolean {
  const enabled = useSettingsStore((s) => s.getService(key)?.enabled ?? false)
  const baseUrl = useSettingsStore((s) => s.getService(key)?.baseUrl ?? '')
  return !!(enabled && baseUrl)
}

/**
 * Returns all enabled service keys.
 */
export function useEnabledServices(): ServiceKey[] {
  const getService = useSettingsStore((s) => s.getService)
  const serviceOrder = useSettingsStore((s) => s.general.serviceOrder)
  return serviceOrder.filter((key) => {
    const cfg = getService(key as ServiceKey)
    return cfg?.enabled && cfg?.baseUrl
  }) as ServiceKey[]
}

/**
 * Returns the configuration for a service.
 */
export function useService(key: ServiceKey) {
  return useSettingsStore((s) => s.getService(key))
}
