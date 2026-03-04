import { TabRouter, useTabLocation, useTabNavigate } from '@/lib/tabRouter'
import { Download, Pause, Play } from 'lucide-react'
import { cn, formatSpeed } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nzbgetApi } from '@/services/api/nzbget'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'

const TABS = [
  { path: '/queue', label: 'Queue' },
  { path: '/history', label: 'History' },
]

function NZBGetNav() {
  const navigate = useTabNavigate()
  const location = useTabLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Download size={18} className="text-indigo-400" />
        <h1 className="text-base font-bold text-slate-100">NZBGet</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
              location.pathname === tab.path
                ? 'border-indigo-500 text-indigo-400'
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

function QueueView() {
  const qc = useQueryClient()
  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['nzbget', 'queue'],
    queryFn: () => nzbgetApi.listGroups(),
    refetchInterval: 3000,
  })
  const { data: status } = useQuery({
    queryKey: ['nzbget', 'status'],
    queryFn: () => nzbgetApi.status(),
    refetchInterval: 3000,
  })
  const pauseMut = useMutation({
    mutationFn: nzbgetApi.pauseDownload,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nzbget'] }),
  })
  const resumeMut = useMutation({
    mutationFn: nzbgetApi.resumeDownload,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nzbget'] }),
  })

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />

  const st = (status as any)?.result
  const paused = st?.ServerPaused

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3 text-sm">
          <span className={cn('font-medium', paused ? 'text-yellow-400' : 'text-green-400')}>
            {paused ? 'Paused' : formatSpeed(st?.DownloadRate ?? 0)}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => (paused ? resumeMut.mutate() : pauseMut.mutate())}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {(items as any[]).map((item: any) => {
          const pct =
            item.FileSizeMB > 0
              ? ((item.FileSizeMB - item.RemainSizeMB) / item.FileSizeMB) * 100
              : 0
          return (
            <div key={item.NZBID} className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-sm font-medium text-slate-200 truncate mb-2">{item.NZBName}</p>
              <ProgressBar value={pct} className="mb-2" />
              <div className="flex gap-2 text-xs text-slate-400">
                <span>{item.RemainSizeMB} MB left</span>
                <Badge
                  variant={item.Status === 'DOWNLOADING' ? 'info' : 'default'}
                  className="text-[10px]"
                >
                  {item.Status}
                </Badge>
              </div>
            </div>
          )
        })}
        {!(items as any[]).length && (
          <div className="text-center py-16 text-slate-500">Queue is empty</div>
        )}
      </div>
    </div>
  )
}

function HistoryView() {
  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery({ queryKey: ['nzbget', 'history'], queryFn: () => nzbgetApi.history() })
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {(items as any[]).map((item: any) => (
        <div key={item.NZBID} className="px-4 py-3">
          <p className="text-sm font-medium text-slate-200 truncate">{item.NZBName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge
              variant={
                item.Status === 'SUCCESS'
                  ? 'success'
                  : item.Status === 'FAILURE'
                    ? 'danger'
                    : 'default'
              }
              className="text-[10px]"
            >
              {item.Status}
            </Badge>
            <span className="text-xs text-slate-500">{item.FileSizeMB} MB</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function NZBGetContent() {
  const { pathname } = useTabLocation()
  if (pathname === '/history') return <HistoryView />
  return <QueueView />
}

export function NZBGetApp() {
  return (
    <TabRouter initialPath="/queue">
      <div className="h-full flex flex-col overflow-hidden">
        <NZBGetNav />
        <div className="flex-1 overflow-hidden">
          <NZBGetContent />
        </div>
      </div>
    </TabRouter>
  )
}
