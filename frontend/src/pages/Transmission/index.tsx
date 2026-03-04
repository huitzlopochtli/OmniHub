import { MemoryRouter as _MemoryRouter } from 'react-router-dom'
import { Magnet, Pause, Play, X } from 'lucide-react'
import { formatBytes, formatSpeed } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transmissionApi } from '@/services/api/transmission'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: 'Stopped', color: 'warning' },
  1: { label: 'Check Queue', color: 'default' },
  2: { label: 'Checking', color: 'info' },
  3: { label: 'DL Queue', color: 'default' },
  4: { label: 'Downloading', color: 'info' },
  5: { label: 'Seed Queue', color: 'default' },
  6: { label: 'Seeding', color: 'success' },
}

function TorrentsView() {
  const qc = useQueryClient()
  const {
    data: torrents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['transmission', 'torrents'],
    queryFn: () => transmissionApi.getTorrents().then((r) => r.torrents),
    refetchInterval: 3000,
  })
  const { data: stats } = useQuery({
    queryKey: ['transmission', 'stats'],
    queryFn: transmissionApi.getSessionStats,
    refetchInterval: 3000,
  })
  const stopMut = useMutation({
    mutationFn: (id: number) => transmissionApi.stopTorrents([id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transmission'] }),
  })
  const startMut = useMutation({
    mutationFn: (id: number) => transmissionApi.startTorrents([id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transmission'] }),
  })
  const removeMut = useMutation({
    mutationFn: (id: number) => transmissionApi.removeTorrents([id], false),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transmission'] }),
  })

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />

  const st = stats

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {st && (
        <div className="shrink-0 flex items-center gap-4 px-4 py-2 border-b border-slate-700/50 bg-slate-800/30 text-xs text-slate-400">
          <span className="text-green-400">↓ {formatSpeed(st.downloadSpeed ?? 0)}</span>
          <span className="text-sky-400">↑ {formatSpeed(st.uploadSpeed ?? 0)}</span>
          <span className="ml-auto">{st.activeTorrentCount} active</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {(torrents as any[]).map((t: any) => {
          const pct = Math.round((t.percentDone ?? 0) * 100)
          const statusInfo = STATUS_MAP[t.status] ?? { label: 'Unknown', color: 'default' }
          return (
            <div key={t.id} className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatBytes(t.totalSize)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {t.status === 4 ? (
                    <button
                      onClick={() => stopMut.mutate(t.id)}
                      className="p-1.5 rounded hover:bg-slate-700 text-slate-400 transition-colors"
                    >
                      <Pause size={13} />
                    </button>
                  ) : (
                    <button
                      onClick={() => startMut.mutate(t.id)}
                      className="p-1.5 rounded hover:bg-slate-700 text-slate-400 transition-colors"
                    >
                      <Play size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => removeMut.mutate(t.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
              <ProgressBar value={Math.min(100, pct)} className="mb-2" />
              <div className="flex items-center gap-2">
                <Badge variant={statusInfo.color as any} className="text-[10px]">
                  {statusInfo.label}
                </Badge>
                <span className="text-xs text-green-400">↓ {formatSpeed(t.rateDownload ?? 0)}</span>
                <span className="text-xs text-sky-400">↑ {formatSpeed(t.rateUpload ?? 0)}</span>
              </div>
            </div>
          )
        })}
        {!(torrents as any[]).length && (
          <div className="text-center py-16 text-slate-500">No torrents</div>
        )}
      </div>
    </div>
  )
}

export function TransmissionApp() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <Magnet size={18} className="text-red-400" />
          <h1 className="text-base font-bold text-slate-100">Transmission</h1>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <TorrentsView />
      </div>
    </div>
  )
}
