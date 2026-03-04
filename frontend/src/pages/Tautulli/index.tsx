import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { BarChart2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { tautulliApi } from '@/services/api/tautulli'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDistanceToNow, fromUnixTime } from 'date-fns'

const TABS = [
  { path: '/activity', label: 'Activity' },
  { path: '/history', label: 'History' },
  { path: '/stats', label: 'Stats' },
]

function TautulliNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <BarChart2 size={18} className="text-amber-400" />
        <h1 className="text-base font-bold text-slate-100">Tautulli</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
              location.pathname === tab.path
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ActivityView() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tautulli', 'activity'],
    queryFn: tautulliApi.getActivity,
    refetchInterval: 10000,
  })
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />
  const sessions = (data as any)?.response?.data?.sessions ?? []
  const streamCount = (data as any)?.response?.data?.stream_count ?? 0
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-slate-700/50 text-sm text-slate-400">
        <Users size={14} />
        <span>{streamCount} active streams</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sessions.map((s: any) => (
          <div key={s.session_id} className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-start gap-3 mb-2">
              {s.thumb && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${s.thumb}`}
                  alt=""
                  className="w-10 h-14 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{s.full_title}</p>
                <p className="text-xs text-slate-500">
                  {s.friendly_name} · {s.player}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      s.state === 'playing'
                        ? 'success'
                        : s.state === 'paused'
                          ? 'warning'
                          : 'default'
                    }
                    className="text-[10px]"
                  >
                    {s.state}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {s.stream_video_resolution} {s.stream_video_codec}
                  </span>
                  <span className="text-xs text-slate-500">{s.transcode_decision}</span>
                </div>
              </div>
            </div>
            <ProgressBar value={s.progress_percent ?? 0} />
          </div>
        ))}
        {!sessions.length && (
          <div className="text-center py-16 text-slate-500">No active streams</div>
        )}
      </div>
    </div>
  )
}

function HistoryView() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tautulli', 'history'],
    queryFn: () => tautulliApi.getHistory(0, 50),
  })
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />
  const items = (data as any)?.response?.data?.data ?? []
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {items.map((item: any) => (
        <div key={item.id} className="px-4 py-3">
          <p className="text-sm font-medium text-slate-200 truncate">{item.full_title}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            <span>{item.friendly_name}</span>
            <span>· {item.player}</span>
            {item.started && (
              <span>· {formatDistanceToNow(fromUnixTime(item.started), { addSuffix: true })}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatsView() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tautulli', 'home-stats'],
    queryFn: () => tautulliApi.getHomeStats(30),
  })
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />
  const stats = (data as any)?.response?.data ?? []
  return (
    <div className="h-full overflow-y-auto p-3 space-y-4">
      {stats.map((stat: any) => (
        <div key={stat.stat_id} className="bg-slate-800/50 rounded-xl p-3">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">{stat.stat_title}</h3>
          <div className="space-y-1.5">
            {(stat.rows ?? []).slice(0, 5).map((row: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate flex-1">
                  {row.title || row.full_title || row.friendly_name}
                </span>
                <span className="text-slate-300 ml-2 shrink-0">
                  {row.total_plays ?? row.total_duration} {row.total_plays != null ? 'plays' : 's'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TautulliApp() {
  return (
    <MemoryRouter initialEntries={['/activity']}>
      <div className="h-full flex flex-col overflow-hidden">
        <TautulliNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/activity" replace />} />
            <Route path="/activity" element={<ActivityView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/stats" element={<StatsView />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
