import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/Dashboard'
import { SonarrApp } from '@/pages/Sonarr'
import { RadarrApp } from '@/pages/Radarr'
import { LidarrApp } from '@/pages/Lidarr'
import { ReadarrApp } from '@/pages/Readarr'
import { BazarrApp } from '@/pages/Bazarr'
import { SABnzbdApp } from '@/pages/SABnzbd'
import { NZBGetApp } from '@/pages/NZBGet'
import { QBittorrentApp } from '@/pages/QBittorrent'
import { DelugeApp } from '@/pages/Deluge'
import { TransmissionApp } from '@/pages/Transmission'
import { ProwlarrApp } from '@/pages/Prowlarr'
import { OverseerrApp } from '@/pages/Overseerr'
import { TautulliApp } from '@/pages/Tautulli'
import { UnraidApp } from '@/pages/Unraid'
import { SettingsPage } from '@/pages/Settings'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { ServiceInstanceProvider } from '@/contexts/ServiceInstanceContext'
import type { ServiceKey } from '@/stores/settingsStore'

/** Map each ServiceKey to its page component */
const SERVICE_TYPE_PANELS: Record<ServiceKey, React.ComponentType> = {
  sonarr: SonarrApp,
  radarr: RadarrApp,
  lidarr: LidarrApp,
  readarr: ReadarrApp,
  bazarr: BazarrApp,
  sabnzbd: SABnzbdApp,
  nzbget: NZBGetApp,
  qbittorrent: QBittorrentApp,
  deluge: DelugeApp,
  transmission: TransmissionApp,
  prowlarr: ProwlarrApp,
  overseerr: OverseerrApp,
  tautulli: TautulliApp,
  unraid: UnraidApp,
}

const FIXED_PANELS = {
  dashboard: DashboardPage,
  settings: SettingsPage,
} as const

const SERVICE_KEYS = Object.keys(SERVICE_TYPE_PANELS) as ServiceKey[]

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, accentColor } = useUIStore()
  const instances = useSettingsStore((s) => s.getActiveProfile().instances)
  const [mountedPanels, setMountedPanels] = useState<Set<string>>(new Set(['dashboard']))

  const enabledInstances = instances.filter((i) => i.enabled && i.baseUrl)
  const activePanel = location.pathname.split('/')[1] || 'dashboard'

  // Redirect root to /dashboard
  useEffect(() => {
    if (location.pathname === '/') navigate('/dashboard', { replace: true })
  }, [location.pathname, navigate])

  // Redirect legacy /serviceKey routes (e.g. /sonarr) to first matching instance
  useEffect(() => {
    if (SERVICE_KEYS.includes(activePanel as ServiceKey)) {
      const match = enabledInstances.find((i) => i.type === activePanel)
      navigate(match ? `/${match.id}` : '/dashboard', { replace: true })
    }
  }, [activePanel, enabledInstances, navigate])

  // Mount panel on first visit — never unmount (preserves state)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMountedPanels((prev) => {
      if (prev.has(activePanel)) return prev
      return new Set([...prev, activePanel])
    })
  }, [activePanel])

  // Apply theme
  useEffect(() => {
    const apply = (resolved: 'dark' | 'light' | 'amoled') => {
      document.documentElement.setAttribute('data-theme', resolved)
      document.documentElement.classList.toggle('dark', resolved !== 'light')
    }
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches ? 'dark' : 'light')
      const h = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', h)
      return () => mq.removeEventListener('change', h)
    } else {
      apply(theme as 'dark' | 'light' | 'amoled')
    }
  }, [theme])

  // Apply accent color
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor)
  }, [accentColor])

  return (
    <AppShell activeService={activePanel}>
      {/* Fixed panels */}
      {(Object.keys(FIXED_PANELS) as Array<keyof typeof FIXED_PANELS>).map((id) => {
        if (!mountedPanels.has(id)) return null
        const Panel = FIXED_PANELS[id]
        return (
          <div
            key={id}
            className="service-panel"
            style={{ display: activePanel === id ? 'flex' : 'none' }}
          >
            <Panel />
          </div>
        )
      })}

      {/* Instance panels — each wrapped in its own ServiceInstanceProvider */}
      {enabledInstances.map((instance) => {
        if (!mountedPanels.has(instance.id)) return null
        const Panel = SERVICE_TYPE_PANELS[instance.type]
        if (!Panel) return null
        return (
          <div
            key={instance.id}
            className="service-panel"
            style={{ display: activePanel === instance.id ? 'flex' : 'none' }}
          >
            <ServiceInstanceProvider id={instance.id}>
              <Panel />
            </ServiceInstanceProvider>
          </div>
        )
      })}
    </AppShell>
  )
}
