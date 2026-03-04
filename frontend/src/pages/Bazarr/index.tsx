import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Subtitles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { bazarrApi } from '@/services/api/bazarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { formatDistanceToNow, parseISO } from 'date-fns'

const TABS = [{ path: '/series', label: 'Series' }, { path: '/movies', label: 'Movies' }, { path: '/history', label: 'History' }]

function BazarrNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Subtitles size={18} className="text-purple-400" />
        <h1 className="text-base font-bold text-slate-100">Bazarr</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={cn('px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
              location.pathname === tab.path ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SeriesView() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['bazarr', 'missing-episodes'], queryFn: () => bazarrApi.getMissingEpisodes() })
  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />
  const items = (data as any)?.data ?? []
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {items.map((s: any, i: number) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{s.seriesTitle || s.video_path}</p>
            <p className="text-xs text-slate-500">{s.episode_number} · {s.language}</p>
          </div>
          <Badge variant="warning" className="text-[10px]">Missing</Badge>
        </div>
      ))}
      {!items.length && <div className="text-center py-16 text-slate-500">No missing subtitles</div>}
    </div>
  )
}

function MoviesView() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['bazarr', 'movies'], queryFn: () => bazarrApi.getMovies() })
  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />
  const items = (data as any)?.data ?? []
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {items.map((m: any) => (
        <div key={m.radarrId} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{m.title}</p>
            <p className="text-xs text-slate-500">{m.languages || 'No languages set'}</p>
          </div>
          <Badge variant={m.subtitles?.length > 0 ? 'success' : 'warning'} className="text-[10px]">
            {m.subtitles?.length > 0 ? `${m.subtitles.length} subs` : 'Missing'}
          </Badge>
        </div>
      ))}
    </div>
  )
}

function HistoryView() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['bazarr', 'history'], queryFn: () => bazarrApi.getHistory() })
  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />
  const items = (data as any)?.data ?? []
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {items.map((item: any, i: number) => (
        <div key={i} className="px-4 py-3">
          <p className="text-sm font-medium text-slate-200 truncate">{item.video_path}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="default" className="text-[10px]">{item.language}</Badge>
            <span className="text-xs text-slate-500">{item.provider}</span>
          </div>
          {item.timestamp && <p className="text-xs text-slate-600 mt-1">{formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}</p>}
        </div>
      ))}
    </div>
  )
}

export function BazarrApp() {
  return (
    <MemoryRouter initialEntries={['/series']}>
      <div className="h-full flex flex-col overflow-hidden">
        <BazarrNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/series" replace />} />
            <Route path="/series" element={<SeriesView />} />
            <Route path="/movies" element={<MoviesView />} />
            <Route path="/history" element={<HistoryView />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
