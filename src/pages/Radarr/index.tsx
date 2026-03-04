import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MovieGrid } from './MovieGrid'
import { MovieDetail } from './MovieDetail'
import { RadarrQueue } from './RadarrQueue'
import { RadarrCalendar } from './RadarrCalendar'
import { RadarrHistory } from './RadarrHistory'
import { NotConfigured } from '@/components/shared/ErrorState'
import { useServiceEnabled } from '@/hooks/useServiceEnabled'

const TABS = [
  { path: '/movies', label: 'Movies' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/queue', label: 'Queue' },
  { path: '/history', label: 'History' },
]

function RadarrNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Film size={18} className="text-yellow-400" />
        <h1 className="text-base font-bold text-slate-100">Radarr</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.path || (tab.path === '/movies' && location.pathname.startsWith('/movies'))
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              className={cn('px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                isActive ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-slate-200',
              )}>
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function RadarrApp() {
  const enabled = useServiceEnabled('radarr')
  if (!enabled) return <NotConfigured serviceName="Radarr" />
  return (
    <MemoryRouter initialEntries={['/movies']}>
      <div className="h-full flex flex-col overflow-hidden">
        <RadarrNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/movies" replace />} />
            <Route path="/movies" element={<MovieGrid />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/calendar" element={<RadarrCalendar />} />
            <Route path="/queue" element={<RadarrQueue />} />
            <Route path="/history" element={<RadarrHistory />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
