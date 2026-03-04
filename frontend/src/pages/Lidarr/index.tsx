import { TabRouter, useTabLocation, useTabNavigate } from '@/lib/tabRouter'
import { Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArtistList } from './ArtistList'
import { ArtistDetail } from './ArtistDetail'
import { LidarrQueue } from './LidarrQueue'
import { LidarrWanted } from './LidarrWanted'
import { LidarrHistory } from './LidarrHistory'

const TABS = [
  { path: '/artists', label: 'Artists' },
  { path: '/queue', label: 'Queue' },
  { path: '/wanted', label: 'Wanted' },
  { path: '/history', label: 'History' },
]

function LidarrNav() {
  const navigate = useTabNavigate()
  const location = useTabLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Music size={18} className="text-green-400" />
        <h1 className="text-base font-bold text-slate-100">Lidarr</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LidarrContent() {
  const { pathname } = useTabLocation()
  if (pathname.startsWith('/artists/')) return <ArtistDetail />
  if (pathname === '/queue') return <LidarrQueue />
  if (pathname === '/wanted') return <LidarrWanted />
  if (pathname === '/history') return <LidarrHistory />
  return <ArtistList />
}

export function LidarrApp() {
  return (
    <TabRouter initialPath="/artists">
      <div className="h-full flex flex-col overflow-hidden">
        <LidarrNav />
        <div className="flex-1 overflow-hidden">
          <LidarrContent />
        </div>
      </div>
    </TabRouter>
  )
}
