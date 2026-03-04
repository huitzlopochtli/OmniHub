import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Tv2,
  Film,
  Music,
  BookOpen,
  Subtitles,
  Search,
  Download,
  HardDriveDownload,
  CloudDownload,
  Server,
  Heart,
  BarChart2,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import type { ServiceId } from '@/App'

interface NavItem {
  id: ServiceId
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  serviceKey?: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sonarr', label: 'Sonarr', icon: Tv2, serviceKey: 'sonarr' },
  { id: 'radarr', label: 'Radarr', icon: Film, serviceKey: 'radarr' },
  { id: 'lidarr', label: 'Lidarr', icon: Music, serviceKey: 'lidarr' },
  { id: 'readarr', label: 'Readarr', icon: BookOpen, serviceKey: 'readarr' },
  { id: 'bazarr', label: 'Bazarr', icon: Subtitles, serviceKey: 'bazarr' },
  { id: 'prowlarr', label: 'Prowlarr', icon: Search, serviceKey: 'prowlarr' },
  { id: 'sabnzbd', label: 'SABnzbd', icon: Download, serviceKey: 'sabnzbd' },
  { id: 'nzbget', label: 'NZBGet', icon: HardDriveDownload, serviceKey: 'nzbget' },
  { id: 'qbittorrent', label: 'qBittorrent', icon: CloudDownload, serviceKey: 'qbittorrent' },
  { id: 'deluge', label: 'Deluge', icon: CloudDownload, serviceKey: 'deluge' },
  { id: 'transmission', label: 'Transmission', icon: CloudDownload, serviceKey: 'transmission' },
  { id: 'overseerr', label: 'Overseerr', icon: Heart, serviceKey: 'overseerr' },
  { id: 'tautulli', label: 'Tautulli', icon: BarChart2, serviceKey: 'tautulli' },
  { id: 'unraid', label: 'Unraid', icon: Server, serviceKey: 'unraid' },
  { id: 'settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  activeService: ServiceId
}

export function Sidebar({ activeService }: SidebarProps) {
  const navigate = useNavigate()
  const getService = useSettingsStore((s) => s.getService)
  const { sidebarCollapsed } = useUIStore()

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.serviceKey) return true // always show dashboard + settings
    const cfg = getService(item.serviceKey as Parameters<typeof getService>[0])
    return cfg?.enabled && cfg?.baseUrl
  })

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-slate-900 border-r border-slate-700/50 transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-52',
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 h-14 border-b border-slate-700/50', sidebarCollapsed && 'justify-center px-0')}>
        <div className="size-7 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          S
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold text-slate-100 truncate">Servarr</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = activeService === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-lg mx-1',
                sidebarCollapsed ? 'justify-center mx-1 w-auto' : '',
                isActive
                  ? 'bg-sky-600/20 text-sky-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
