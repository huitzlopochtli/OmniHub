import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ServiceConfig {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  username?: string;
  password?: string;
  customHeaders?: Record<string, string>;
  localUrl?: string;
  remoteUrl?: string;
  localNetworkSubnet?: string;
  useAutoSwitch?: boolean;
  displayName?: string;
}

/** A single named instance of a service (e.g. "Sonarr 4K", "Radarr Anime") */
export interface ServiceInstance extends ServiceConfig {
  id: string; // unique identifier like 'sonarr-abc123'
  type: ServiceKey; // which service type
  name: string; // user-defined display name
}

export interface ServerProfile {
  id: string;
  name: string;
  instances: ServiceInstance[];
}

export type ServiceKey =
  | "sonarr"
  | "radarr"
  | "lidarr"
  | "readarr"
  | "bazarr"
  | "sabnzbd"
  | "nzbget"
  | "qbittorrent"
  | "deluge"
  | "transmission"
  | "prowlarr"
  | "overseerr"
  | "tautulli"
  | "unraid";

export interface WolConfig {
  enabled: boolean;
  macAddress: string;
  broadcastAddress: string;
  port: number;
  relayUrl?: string;
}

export interface GeneralSettings {
  refreshInterval: number;
  defaultView: "poster" | "list" | "banner";
  posterSize: "compact" | "comfortable" | "large";
  fontSize: "small" | "normal" | "large";
  notificationsEnabled: boolean;
  serviceOrder: string[];
}

export interface SettingsState {
  activeProfileId: string;
  profiles: ServerProfile[];
  wol: WolConfig;
  general: GeneralSettings;
  // Actions
  getActiveProfile: () => ServerProfile;
  /** Get all instances for a service type */
  getInstancesByType: (type: ServiceKey) => ServiceInstance[];
  /** Get a single instance by its unique id */
  getInstance: (id: string) => ServiceInstance | undefined;
  /** Get first instance of a type (backward compat) */
  getService: (key: ServiceKey) => ServiceConfig | undefined;
  /** Add a new instance - returns the new instanceId */
  addInstance: (type: ServiceKey, name?: string) => string;
  removeInstance: (id: string) => void;
  updateInstance: (id: string, config: Partial<ServiceInstance>) => void;
  setServiceEnabled: (id: string, enabled: boolean) => void;
  addProfile: (profile: ServerProfile) => void;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  updateGeneral: (settings: Partial<GeneralSettings>) => void;
  updateWol: (wol: Partial<WolConfig>) => void;
}

const DEFAULT_GENERAL: GeneralSettings = {
  refreshInterval: 30,
  defaultView: "poster",
  posterSize: "comfortable",
  fontSize: "normal",
  notificationsEnabled: true,
  serviceOrder: [
    "sonarr",
    "radarr",
    "lidarr",
    "readarr",
    "bazarr",
    "sabnzbd",
    "nzbget",
    "qbittorrent",
    "deluge",
    "transmission",
    "prowlarr",
    "overseerr",
    "tautulli",
    "unraid",
  ],
};

const DEFAULT_PROFILE: ServerProfile = {
  id: "default",
  name: "Home Server",
  instances: [],
};

function genId(type: ServiceKey): string {
  return type + "-" + Math.random().toString(36).slice(2, 8);
}

const SERVICE_LABELS: Partial<Record<ServiceKey, string>> = {
  sonarr: "Sonarr",
  radarr: "Radarr",
  lidarr: "Lidarr",
  readarr: "Readarr",
  bazarr: "Bazarr",
  sabnzbd: "SABnzbd",
  nzbget: "NZBGet",
  qbittorrent: "qBittorrent",
  deluge: "Deluge",
  transmission: "Transmission",
  prowlarr: "Prowlarr",
  overseerr: "Overseerr",
  tautulli: "Tautulli",
  unraid: "Unraid",
};

/** Migrate old flat services record → instances array */
function migrateProfile(p: any): ServerProfile {
  if (Array.isArray(p.instances)) return p as ServerProfile;
  const instances: ServiceInstance[] = [];
  const services = p.services ?? {};
  for (const [type, cfg] of Object.entries(services)) {
    if (!cfg) continue;
    const c = cfg as ServiceConfig;
    instances.push({
      ...(c as ServiceConfig),
      id: genId(type as ServiceKey),
      type: type as ServiceKey,
      name: c.displayName ?? SERVICE_LABELS[type as ServiceKey] ?? type,
    });
  }
  return { id: p.id, name: p.name, instances };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      activeProfileId: "default",
      profiles: [DEFAULT_PROFILE],
      wol: {
        enabled: false,
        macAddress: "",
        broadcastAddress: "255.255.255.255",
        port: 9,
      },
      general: DEFAULT_GENERAL,

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get();
        const p = profiles.find((p) => p.id === activeProfileId) ?? profiles[0];
        return migrateProfile(p);
      },

      getInstancesByType: (type) =>
        get()
          .getActiveProfile()
          .instances.filter((i) => i.type === type),

      getInstance: (id) =>
        get()
          .getActiveProfile()
          .instances.find((i) => i.id === id),

      getService: (key) => get().getInstancesByType(key)[0],

      addInstance: (type, name) => {
        const id = genId(type);
        const baseName = name ?? SERVICE_LABELS[type] ?? type;
        const existing = get().getInstancesByType(type);
        const displayName =
          existing.length === 0
            ? baseName
            : baseName + " " + (existing.length + 1);
        const newInstance: ServiceInstance = {
          id,
          type,
          name: displayName,
          enabled: false,
          baseUrl: "",
          apiKey: "",
        };
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id !== state.activeProfileId
              ? p
              : { ...p, instances: [...(p.instances ?? []), newInstance] },
          ),
        }));
        return id;
      },

      removeInstance: (id) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id !== state.activeProfileId
              ? p
              : {
                  ...p,
                  instances: (p.instances ?? []).filter((i) => i.id !== id),
                },
          ),
        }));
      },

      updateInstance: (id, config) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id !== state.activeProfileId
              ? p
              : {
                  ...p,
                  instances: (p.instances ?? []).map((i) =>
                    i.id === id ? { ...i, ...config } : i,
                  ),
                },
          ),
        }));
      },

      setServiceEnabled: (id, enabled) => get().updateInstance(id, { enabled }),

      addProfile: (profile) =>
        set((state) => ({ profiles: [...state.profiles, profile] })),

      removeProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId:
            state.activeProfileId === id ? "default" : state.activeProfileId,
        })),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      updateGeneral: (settings) =>
        set((state) => ({ general: { ...state.general, ...settings } })),

      updateWol: (wol) => set((state) => ({ wol: { ...state.wol, ...wol } })),
    }),
    {
      name: "servarr-settings",
      onRehydrateStorage: () => (state) => {
        if (state) state.profiles = state.profiles.map(migrateProfile);
      },
    },
  ),
);
