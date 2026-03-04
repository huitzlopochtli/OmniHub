import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ServiceConfig {
  enabled: boolean
  baseUrl: string
  apiKey: string
  username?: string
  password?: string
  customHeaders?: Record<string, string>
  // Local/Remote auto-switching
  localUrl?: string
  remoteUrl?: string
  localNetworkSubnet?: string // e.g. "192.168.1."
  useAutoSwitch?: boolean
  // Friendly name
  displayName?: string
}

export interface ServerProfile {
  id: string
  name: string
  services: Partial<Record<ServiceKey, ServiceConfig>>
}

export type ServiceKey =
  | 'sonarr'
  | 'radarr'
  | 'lidarr'
  | 'readarr'
  | 'bazarr'
  | 'sabnzbd'
  | 'nzbget'
  | 'qbittorrent'
  | 'deluge'
  | 'transmission'
  | 'utorrent'
  | 'rtorrent'
  | 'prowlarr'
  | 'jackett'
  | 'nzbhydra'
  | 'overseerr'
  | 'tautulli'
  | 'unraid'
  | 'sickbeard'

export interface WolConfig {
  enabled: boolean
  macAddress: string
  broadcastAddress: string
  port: number
  relayUrl?: string // tiny relay server or browser extension bridge
}

export interface GeneralSettings {
  refreshInterval: number // seconds
  defaultView: 'poster' | 'list' | 'banner'
  posterSize: 'compact' | 'comfortable' | 'large'
  fontSize: 'small' | 'normal' | 'large'
  notificationsEnabled: boolean
  serviceOrder: string[]
}

export interface SettingsState {
  // Current active server profile id
  activeProfileId: string
  // All server profiles
  profiles: ServerProfile[]
  // WOL config
  wol: WolConfig
  // General
  general: GeneralSettings
  // Actions
  getActiveProfile: () => ServerProfile
  getService: (key: ServiceKey) => ServiceConfig | undefined
  updateService: (key: ServiceKey, config: Partial<ServiceConfig>) => void
  setServiceEnabled: (key: ServiceKey, enabled: boolean) => void
  addProfile: (profile: ServerProfile) => void
  removeProfile: (id: string) => void
  setActiveProfile: (id: string) => void
  updateGeneral: (settings: Partial<GeneralSettings>) => void
  updateWol: (wol: Partial<WolConfig>) => void
}

const DEFAULT_SERVICE_CONFIG: ServiceConfig = {
  enabled: false,
  baseUrl: '',
  apiKey: '',
}

const DEFAULT_PROFILE: ServerProfile = {
  id: 'default',
  name: 'Home Server',
  services: {},
}

const DEFAULT_GENERAL: GeneralSettings = {
  refreshInterval: 30,
  defaultView: 'poster',
  posterSize: 'comfortable',
  fontSize: 'normal',
  notificationsEnabled: true,
  serviceOrder: [
    'sonarr',
    'radarr',
    'lidarr',
    'readarr',
    'bazarr',
    'sabnzbd',
    'nzbget',
    'qbittorrent',
    'deluge',
    'transmission',
    'prowlarr',
    'overseerr',
    'tautulli',
    'unraid',
  ],
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      activeProfileId: 'default',
      profiles: [DEFAULT_PROFILE],
      wol: {
        enabled: false,
        macAddress: '',
        broadcastAddress: '255.255.255.255',
        port: 9,
      },
      general: DEFAULT_GENERAL,

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get()
        return profiles.find((p) => p.id === activeProfileId) ?? profiles[0]
      },

      getService: (key: ServiceKey) => {
        const profile = get().getActiveProfile()
        return profile.services[key]
      },

      updateService: (key: ServiceKey, config: Partial<ServiceConfig>) => {
        set((state) => {
          const profiles = state.profiles.map((p) => {
            if (p.id !== state.activeProfileId) return p
            return {
              ...p,
              services: {
                ...p.services,
                [key]: {
                  ...(p.services[key] ?? DEFAULT_SERVICE_CONFIG),
                  ...config,
                },
              },
            }
          })
          return { profiles }
        })
      },

      setServiceEnabled: (key: ServiceKey, enabled: boolean) => {
        get().updateService(key, { enabled })
      },

      addProfile: (profile: ServerProfile) => {
        set((state) => ({ profiles: [...state.profiles, profile] }))
      },

      removeProfile: (id: string) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId:
            state.activeProfileId === id ? 'default' : state.activeProfileId,
        }))
      },

      setActiveProfile: (id: string) => {
        set({ activeProfileId: id })
      },

      updateGeneral: (settings: Partial<GeneralSettings>) => {
        set((state) => ({ general: { ...state.general, ...settings } }))
      },

      updateWol: (wol: Partial<WolConfig>) => {
        set((state) => ({ wol: { ...state.wol, ...wol } }))
      },
    }),
    {
      name: 'servarr-settings',
    },
  ),
)
