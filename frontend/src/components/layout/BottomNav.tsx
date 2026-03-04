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

interface BottomNavProps {
  activeService: string
}

export function BottomNav({ activeService }: BottomNavProps) {
  const navigate = useNavigate()
  const instances = useAllInstances()
  const enabledInstances = instances.filter((i) => i.enabled && i.baseUrl)

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 pb-safe z-50">
      <div className="flex overflow-x-auto scrollbar-none">
        {/* Dashboard */}
        <MobileNavItem
          id="dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          active={activeService === 'dashboard'}
          onClick={() => navigate('/dashboard')}
        />

        {/* Service instances */}
        {enabledInstances.map((instance) => {
          const Icon = SERVICE_ICONS[instance.type] ?? Server
          return (
            <MobileNavItem
              key={instance.id}
              id={instance.id}
              label={instance.name}
              icon={Icon}
              active={activeService === instance.id}
              onClick={() => navigate(`/${instance.id}`)}
            />
          )
        })}

        {/* Settings */}
        <MobileNavItem
          id="settings"
          label="Settings"
          icon={Settings}
          active={activeService === 'settings'}
          onClick={() => navigate('/settings')}
        />
      </div>
    </nav>
  )
}

interface MobileNavItemProps {
  id: string
  label: string
  icon: Icon
  active: boolean
  onClick: () => void
}

function MobileNavItem({ label, icon: Icon, active, onClick }: MobileNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-2 min-w-[56px] transition-colors shrink-0',
        active ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300',
      )}
    >
      <Icon size={20} />
      <span className="text-[10px] leading-none truncate max-w-[52px]">{label}</span>
    </button>
  )
}
