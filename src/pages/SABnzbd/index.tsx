import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Download } from 'lucide-react'
import { cn, formatSpeed } from '@/lib/utils'
import { useServiceEnabled } from '@/hooks/useServiceEnabled'
import { NotConfigured } from '@/components/shared/ErrorState'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sabnzbdApi } from '@/services/api/sabnzbd'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Pause, Play, X, Clock } from 'lucide-react'

const TABS = [{ path: '/queue', label: 'Queue' }, { path: '/history', label: 'History' }]

function SABNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Download size={18} className="text-sky-400" />
        <h1 className="text-base font-bold text-slate-100">SABnzbd</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={cn('px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
              location.pathname === tab.path ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function QueueView() {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sabnzbd', 'queue'],
    queryFn: () => sabnzbdApi.getQueue(),
    refetchInterval: 3000,
  })
  const pauseMut = useMutation({ mutationFn: sabnzbdApi.pauseQueue, onSuccess: () => qc.invalidateQueries({ queryKey: ['sabnzbd', 'queue'] }) })
  const resumeMut = useMutation({ mutationFn: sabnzbdApi.resumeQueue, onSuccess: () => qc.invalidateQueries({ queryKey: ['sabnzbd', 'queue'] }) })
  const deleteMut = useMutation({ mutationFn: (id: string) => sabnzbdApi.deleteJob(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['sabnzbd', 'queue'] }) })

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />

  const q = (data as any)?.queue
  const paused = q?.paused
  const items = q?.slots ?? []
  const speed = q?.speed || '0'
  const eta = q?.timeleft || '--'

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3 text-sm">
          <span className={cn('font-medium', paused ? 'text-yellow-400' : 'text-green-400')}>{paused ? 'Paused' : formatSpeed(parseFloat(speed) * 1024 * 1024)}</span>
          <span className="text-slate-500 flex items-center gap-1"><Clock size={12} />{eta}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => paused ? resumeMut.mutate() : pauseMut.mutate()} loading={pauseMut.isPending || resumeMut.isPending}>
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.map((item: any) => {
          const pct = item.percentage ? parseFloat(item.percentage) : 0
          return (
            <div key={item.nzo_id} className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{item.filename}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.cat} · {item.sizeleft} left</p>
                </div>
                <button onClick={() => deleteMut.mutate(item.nzo_id)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"><X size={14} /></button>
              </div>
              <ProgressBar value={pct} className="mb-2" />
              <div className="flex gap-2 text-xs text-slate-400">
                <Badge variant={item.status === 'Downloading' ? 'info' : 'default'} className="text-[10px]">{item.status}</Badge>
                <span>{item.size}</span>
              </div>
            </div>
          )
        })}
        {!items.length && <div className="text-center py-16 text-slate-500">Queue is empty</div>}
      </div>
    </div>
  )
}

function HistoryView() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['sabnzbd', 'history'], queryFn: () => sabnzbdApi.getHistory() })
  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />
  const items = (data as any)?.history?.slots ?? []
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {items.map((item: any) => (
        <div key={item.nzo_id} className="px-4 py-3">
          <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
            <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Failed' ? 'danger' : 'default'} className="text-[10px]">{item.status}</Badge>
            <span>{item.size}</span>
            <span>{item.category}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SABnzbdApp() {
  const enabled = useServiceEnabled('sabnzbd')
  if (!enabled) return <NotConfigured serviceName="SABnzbd" />
  return (
    <MemoryRouter initialEntries={['/queue']}>
      <div className="h-full flex flex-col overflow-hidden">
        <SABNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/queue" replace />} />
            <Route path="/queue" element={<QueueView />} />
            <Route path="/history" element={<HistoryView />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
