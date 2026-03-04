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
import { useUIStore } from '@/stores/uiStore'

export type ServiceId =
  | 'dashboard'
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
  | 'prowlarr'
  | 'overseerr'
  | 'tautulli'
  | 'unraid'
  | 'settings'

export const ALL_SERVICES: ServiceId[] = [
  'dashboard',
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
  'settings',
]

const SERVICE_PANELS: Record<ServiceId, React.ComponentType> = {
  dashboard: DashboardPage,
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
  settings: SettingsPage,
}

function getServiceFromPath(pathname: string): ServiceId {
  const segment = pathname.split('/')[1]
  if (ALL_SERVICES.includes(segment as ServiceId)) return segment as ServiceId
  return 'dashboard'
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, accentColor } = useUIStore()
  const [mountedServices, setMountedServices] = useState<Set<ServiceId>>(
    new Set(['dashboard']),
  )

  const activeService = getServiceFromPath(location.pathname)

  // Redirect root to /dashboard
  useEffect(() => {
    if (location.pathname === '/') navigate('/dashboard', { replace: true })
  }, [location.pathname, navigate])

  // Mount service panel on first visit — never unmount after
  useEffect(() => {
    setMountedServices((prev) => {
      if (prev.has(activeService)) return prev
      return new Set([...prev, activeService])
    })
  }, [activeService])

  // Apply theme to document
  useEffect(() => {
    const applyTheme = (resolved: 'dark' | 'light' | 'amoled') => {
      document.documentElement.setAttribute('data-theme', resolved)
      document.documentElement.classList.toggle('dark', resolved !== 'light')
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mq.matches ? 'dark' : 'light')
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      applyTheme(theme as 'dark' | 'light' | 'amoled')
    }
  }, [theme])

  // Apply accent color to document
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor)
  }, [accentColor])

  return (
    <AppShell activeService={activeService}>
      {ALL_SERVICES.map((serviceId) => {
        if (!mountedServices.has(serviceId)) return null
        const Panel = SERVICE_PANELS[serviceId]
        return (
          <div
            key={serviceId}
            className="service-panel"
            style={{ display: activeService === serviceId ? 'flex' : 'none' }}
          >
            <Panel />
          </div>
        )
      })}
    </AppShell>
  )
}
