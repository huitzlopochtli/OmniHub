import { MemoryRouter } from 'react-router-dom'
import { Magnet, Pause, Play, X } from 'lucide-react'
import { formatBytes, formatSpeed } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { delugeApi } from '@/services/api/deluge'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'

const STATE_COLORS: Record<string, string> = {
  Downloading: 'info', Seeding: 'success', Paused: 'warning', Error: 'error', Queued: 'default',
}

function DelugeNav() {
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Magnet size={18} className="text-lime-400" />
        <h1 className="text-base font-bold text-slate-100">Deluge</h1>
      </div>
    </div>
  )
}

function TorrentsView() {
  const qc = useQueryClient()
  const { data: status, isLoading, error, refetch } = useQuery({
    queryKey: ['deluge', 'status'],
    queryFn: () => delugeApi.getSessionStatus(),
    refetchInterval: 3000,
  })
  const { data: torrentsData } = useQuery({
    queryKey: ['deluge', 'torrents'],
    queryFn: delugeApi.getTorrents,
    refetchInterval: 3000,
  })
  const pauseMut = useMutation({ mutationFn: (hash: string) => delugeApi.pauseTorrent([hash]), onSuccess: () => qc.invalidateQueries({ queryKey: ['deluge'] }) })
  const resumeMut = useMutation({ mutationFn: (hash: string) => delugeApi.resumeTorrent([hash]), onSuccess: () => qc.invalidateQueries({ queryKey: ['deluge'] }) })
  const deleteMut = useMutation({ mutationFn: (hash: string) => delugeApi.removeTorrent(hash, false), onSuccess: () => qc.invalidateQueries({ queryKey: ['deluge'] }) })

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />

  const torrents = torrentsData ? Object.entries((torrentsData as any).result ?? {}) : []
  const st = (status as any)?.result?.upload_rate !== undefined ? (status as any).result : null

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {st && (
        <div className="shrink-0 flex items-center gap-4 px-4 py-2 border-b border-slate-700/50 bg-slate-800/30 text-xs text-slate-400">
          <span className="text-green-400">↓ {formatSpeed(st.download_rate ?? 0)}</span>
          <span className="text-sky-400">↑ {formatSpeed(st.upload_rate ?? 0)}</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {torrents.map(([hash, t]: any) => (
          <div key={hash} className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{t.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formatBytes(t.total_size)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {t.state === 'Downloading' ? (
                  <button onClick={() => pauseMut.mutate(hash)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 transition-colors"><Pause size={13} /></button>
                ) : (
                  <button onClick={() => resumeMut.mutate(hash)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 transition-colors"><Play size={13} /></button>
                )}
                <button onClick={() => deleteMut.mutate(hash)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"><X size={13} /></button>
              </div>
            </div>
            <ProgressBar value={Math.round((t.progress ?? 0) * 100) / 100} className="mb-2" />
            <div className="flex items-center gap-2">
              <Badge variant={(STATE_COLORS[t.state] || 'default') as any} className="text-[10px]">{t.state}</Badge>
              <span className="text-xs text-green-400">↓ {formatSpeed(t.download_payload_rate ?? 0)}</span>
            </div>
          </div>
        ))}
        {!torrents.length && <div className="text-center py-16 text-slate-500">No torrents</div>}
      </div>
    </div>
  )
}

export function DelugeApp() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <div className="h-full flex flex-col overflow-hidden">
        <DelugeNav />
        <div className="flex-1 overflow-hidden">
          <TorrentsView />
        </div>
      </div>
    </MemoryRouter>
  )
}
