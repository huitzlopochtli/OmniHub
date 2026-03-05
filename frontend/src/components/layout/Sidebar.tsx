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
import { useUIStore } from '@/stores/uiStore'
import { useAllInstances } from '@/hooks/useServiceEnabled'
import type { ServiceKey } from '@/stores/settingsStore'

type Icon = React.ComponentType<{ size?: number; className?: string }>

const SERVICE_ICONS: Record<ServiceKey, Icon> = {
  sonarr: Tv2,
  radarr: Film,
  lidarr: Music,
  readarr: BookOpen,
  bazarr: Subtitles,
  prowlarr: Search,
  sabnzbd: Download,
  nzbget: HardDriveDownload,
  qbittorrent: CloudDownload,
  deluge: CloudDownload,
  transmission: CloudDownload,
  overseerr: Heart,
  tautulli: BarChart2,
  unraid: Server,
}

interface SidebarProps {
  activeService: string
}

export function Sidebar({ activeService }: SidebarProps) {
  const navigate = useNavigate()
  const { sidebarCollapsed } = useUIStore()
  const instances = useAllInstances()

  const enabledInstances = instances.filter((i) => i.enabled && i.baseUrl)

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-slate-900 border-r border-slate-700/50 transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-52',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 h-14 border-b border-slate-700/50',
          sidebarCollapsed && 'justify-center px-0',
        )}
      >
        <div className="size-7 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          O
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold text-slate-100 truncate">OmniHub</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {/* Dashboard */}
        <NavButton
          id="dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          active={activeService === 'dashboard'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/dashboard')}
        />

        {/* Service instances */}
        {enabledInstances.map((instance) => {
          const Icon = SERVICE_ICONS[instance.type] ?? Server
          return (
            <NavButton
              key={instance.id}
              id={instance.id}
              label={instance.name}
              icon={Icon}
              active={activeService === instance.id}
              collapsed={sidebarCollapsed}
              onClick={() => navigate(`/${instance.id}`)}
            />
          )
        })}

        {/* Settings */}
        <NavButton
          id="settings"
          label="Settings"
          icon={Settings}
          active={activeService === 'settings'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/settings')}
        />
      </nav>
    </aside>
  )
}

interface NavButtonProps {
  id: string
  label: string
  icon: Icon
  active: boolean
  collapsed: boolean
  onClick: () => void
}

function NavButton({ label, icon: Icon, active, collapsed, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-lg mx-1',
        collapsed ? 'justify-center mx-1 w-auto' : '',
        active
          ? 'bg-sky-600/20 text-sky-400'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
      )}
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )
}
