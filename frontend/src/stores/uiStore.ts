import { create } from "zustand";
import { persist } from "zustand/middleware";
// ServiceId is now a plain string (instance id or service key)
type ServiceId = string;

export type Theme = "dark" | "light" | "amoled" | "system";
export type AccentColor =
  | "sky"
  | "blue"
  | "violet"
  | "emerald"
  | "orange"
  | "rose";

export interface DashboardWidget {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}

export interface UIState {
  theme: Theme;
  accentColor: AccentColor;
  sidebarCollapsed: boolean;
  dashboardWidgets: DashboardWidget[];
  // Per-service panel navigation state tracking (for UI only)
  serviceLastVisited: Partial<Record<ServiceId, number>>;
  // Actions
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateDashboardWidgets: (widgets: DashboardWidget[]) => void;
  markServiceVisited: (service: ServiceId) => void;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "speed", type: "speed", x: 0, y: 0, w: 1, h: 1, visible: true },
  { id: "torrents", type: "torrents", x: 1, y: 0, w: 1, h: 1, visible: true },
  { id: "disk", type: "disk", x: 2, y: 0, w: 1, h: 1, visible: true },
  {
    id: "sonarr-queue",
    type: "sonarrQueue",
    x: 0,
    y: 1,
    w: 1,
    h: 1,
    visible: true,
  },
  {
    id: "radarr-queue",
    type: "radarrQueue",
    x: 1,
    y: 1,
    w: 1,
    h: 1,
    visible: true,
  },
  { id: "calendar", type: "calendar", x: 0, y: 2, w: 2, h: 2, visible: true },
  { id: "streaming", type: "streaming", x: 2, y: 1, w: 1, h: 2, visible: true },
  { id: "requests", type: "requests", x: 0, y: 4, w: 1, h: 1, visible: true },
  { id: "unraid", type: "unraid", x: 1, y: 4, w: 2, h: 1, visible: true },
];

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "dark",
      accentColor: "sky",
      sidebarCollapsed: false,
      dashboardWidgets: DEFAULT_WIDGETS,
      serviceLastVisited: {},

      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      updateDashboardWidgets: (dashboardWidgets) => set({ dashboardWidgets }),
      markServiceVisited: (service) =>
        set((state) => ({
          serviceLastVisited: {
            ...state.serviceLastVisited,
            [service]: Date.now(),
          },
        })),
    }),
    {
      name: "servarr-ui",
    },
  ),
);
