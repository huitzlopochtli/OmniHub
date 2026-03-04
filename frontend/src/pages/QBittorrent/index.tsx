import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Magnet, Pause, Play, X } from 'lucide-react'
import { cn, formatBytes, formatSpeed, formatETA } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { qbittorrentApi } from '@/services/api/qbittorrent'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'

const TABS = [{ path: '/torrents', label: 'Torrents' }]

const STATE_COLORS: Record<string, string> = {
  downloading: 'info', seeding: 'success', paused: 'warning',
  pausedUP: 'warning', pausedDL: 'warning', error: 'error',
  stalledDL: 'default', stalledUP: 'default', queuedDL: 'default', queuedUP: 'default',
}

function QBNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Magnet size={18} className="text-teal-400" />
        <h1 className="text-base font-bold text-slate-100">qBittorrent</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={cn('px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
              location.pathname === tab.path ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TorrentsView() {
  const qc = useQueryClient()
  const { data: torrents = [], isLoading, error, refetch } = useQuery({
    queryKey: ['qbittorrent', 'torrents'],
    queryFn: () => qbittorrentApi.getTorrents(),
    refetchInterval: 3000,
  })
  const { data: info } = useQuery({ queryKey: ['qbittorrent', 'info'], queryFn: qbittorrentApi.getTransferInfo, refetchInterval: 3000 })
  const pauseMut = useMutation({ mutationFn: (hash: string) => qbittorrentApi.pauseTorrent(hash), onSuccess: () => qc.invalidateQueries({ queryKey: ['qbittorrent'] }) })
  const resumeMut = useMutation({ mutationFn: (hash: string) => qbittorrentApi.resumeTorrent(hash), onSuccess: () => qc.invalidateQueries({ queryKey: ['qbittorrent'] }) })
  const deleteMut = useMutation({ mutationFn: (hash: string) => qbittorrentApi.deleteTorrent(hash, false), onSuccess: () => qc.invalidateQueries({ queryKey: ['qbittorrent'] }) })

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {info && (
        <div className="shrink-0 flex items-center gap-4 px-4 py-2 border-b border-slate-700/50 bg-slate-800/30 text-xs text-slate-400">
          <span className="text-green-400">↓ {formatSpeed((info as any).dl_info_speed)}</span>
          <span className="text-sky-400">↑ {formatSpeed((info as any).up_info_speed)}</span>
          <span className="ml-auto">{(torrents as any[]).length} torrents</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {(torrents as any[]).map((t: any) => (
          <div key={t.hash} className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{t.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatBytes(t.size)} · ETA {t.eta === 8640000 ? '∞' : formatETA(t.eta)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                {t.state === 'downloading' || t.state === 'stalledDL' ? (
                  <button onClick={() => pauseMut.mutate(t.hash)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"><Pause size={13} /></button>
                ) : (
                  <button onClick={() => resumeMut.mutate(t.hash)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"><Play size={13} /></button>
                )}
                <button onClick={() => deleteMut.mutate(t.hash)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"><X size={13} /></button>
              </div>
            </div>
            <ProgressBar value={Math.round(t.progress * 100)} className="mb-2" />
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={(STATE_COLORS[t.state] || 'default') as any} className="text-[10px]">{t.state}</Badge>
              <span className="text-xs text-green-400">↓ {formatSpeed(t.dlspeed)}</span>
              <span className="text-xs text-sky-400">↑ {formatSpeed(t.upspeed)}</span>
              {t.category && <span className="text-xs text-slate-500">{t.category}</span>}
            </div>
          </div>
        ))}
        {!(torrents as any[]).length && <div className="text-center py-16 text-slate-500">No torrents</div>}
      </div>
    </div>
  )
}

export function QBittorrentApp() {
  return (
    <MemoryRouter initialEntries={['/torrents']}>
      <div className="h-full flex flex-col overflow-hidden">
        <QBNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/torrents" replace />} />
            <Route path="/torrents" element={<TorrentsView />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
