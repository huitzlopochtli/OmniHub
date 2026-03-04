import { TabRouter, useTabLocation, useTabNavigate } from '@/lib/tabRouter'
import { Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MovieGrid } from './MovieGrid'
import { MovieDetail } from './MovieDetail'
import { RadarrQueue } from './RadarrQueue'
import { RadarrCalendar } from './RadarrCalendar'
import { RadarrHistory } from './RadarrHistory'

const TABS = [
  { path: '/movies', label: 'Movies' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/queue', label: 'Queue' },
  { path: '/history', label: 'History' },
]

function RadarrNav() {
  const navigate = useTabNavigate()
  const location = useTabLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Film size={18} className="text-yellow-400" />
        <h1 className="text-base font-bold text-slate-100">Radarr</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path === '/movies' && location.pathname.startsWith('/movies'))
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-yellow-500 text-yellow-400'
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

function RadarrContent() {
  const { pathname } = useTabLocation()
  if (pathname.startsWith('/movies/')) return <MovieDetail />
  if (pathname === '/calendar') return <RadarrCalendar />
  if (pathname === '/queue') return <RadarrQueue />
  if (pathname === '/history') return <RadarrHistory />
  return <MovieGrid />
}

export function RadarrApp() {
  return (
    <TabRouter initialPath="/movies">
      <div className="h-full flex flex-col overflow-hidden">
        <RadarrNav />
        <div className="flex-1 overflow-hidden">
          <RadarrContent />
        </div>
      </div>
    </TabRouter>
  )
}
