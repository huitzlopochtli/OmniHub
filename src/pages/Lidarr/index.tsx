import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useServiceEnabled } from '@/hooks/useServiceEnabled'
import { NotConfigured } from '@/components/shared/ErrorState'
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
  const navigate = useNavigate()
  const location = useLocation()
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
            <button key={tab.path} onClick={() => navigate(tab.path)}
              className={cn('px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                isActive ? 'border-green-500 text-green-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function LidarrApp() {
  const enabled = useServiceEnabled('lidarr')
  if (!enabled) return <NotConfigured serviceName="Lidarr" />
  return (
    <MemoryRouter initialEntries={['/artists']}>
      <div className="h-full flex flex-col overflow-hidden">
        <LidarrNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/artists" replace />} />
            <Route path="/artists" element={<ArtistList />} />
            <Route path="/artists/:id" element={<ArtistDetail />} />
            <Route path="/queue" element={<LidarrQueue />} />
            <Route path="/wanted" element={<LidarrWanted />} />
            <Route path="/history" element={<LidarrHistory />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
