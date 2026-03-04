import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Film, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { overseerrApi } from '@/services/api/overseerr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'

const TABS = [{ path: '/requests', label: 'Requests' }, { path: '/discover', label: 'Discover' }]

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'Pending', color: 'warning' },
  2: { label: 'Approved', color: 'info' },
  3: { label: 'Declined', color: 'error' },
  4: { label: 'Available', color: 'success' },
  5: { label: 'Processing', color: 'info' },
}

function OverseerrNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Film size={18} className="text-rose-400" />
        <h1 className="text-base font-bold text-slate-100">Overseerr</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={cn('px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
              location.pathname === tab.path ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function RequestsView() {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['overseerr', 'requests'],
    queryFn: () => overseerrApi.getRequests(50, 0),
  })
  const approveMut = useMutation({
    mutationFn: (id: number) => overseerrApi.approveRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['overseerr', 'requests'] }),
  })
  const declineMut = useMutation({
    mutationFn: (id: number) => overseerrApi.declineRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['overseerr', 'requests'] }),
  })
  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />
  const items = (data as any)?.results ?? []
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {items.map((req: any) => {
        const statusInfo = STATUS_MAP[req.status] ?? { label: 'Unknown', color: 'default' }
        const media = req.media
        const title = media?.originalTitle || media?.name || 'Untitled'
        return (
          <div key={req.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {req.requestedBy?.displayName} · {formatDistanceToNow(parseISO(req.createdAt), { addSuffix: true })}
                </p>
              </div>
              <Badge variant={statusInfo.color as any} className="text-[10px] shrink-0">{statusInfo.label}</Badge>
            </div>
            {req.status === 1 && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="primary" onClick={() => approveMut.mutate(req.id)} loading={approveMut.isPending}>
                  <Check size={12} /> Approve
                </Button>
                <Button size="sm" variant="ghost" onClick={() => declineMut.mutate(req.id)} loading={declineMut.isPending}>
                  <X size={12} /> Decline
                </Button>
              </div>
            )}
          </div>
        )
      })}
      {!items.length && <div className="text-center py-16 text-slate-500">No requests</div>}
    </div>
  )
}

function DiscoverView() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['overseerr', 'search', submitted],
    queryFn: () => overseerrApi.search(submitted),
    enabled: !!submitted,
  })
  const items = (data as any)?.results ?? []
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 p-3 flex gap-2">
        <div className="flex-1 relative">
          <Input placeholder="Search movies/shows..." value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSubmitted(query)} className="h-9 text-sm" />
        </div>
        <button onClick={() => setSubmitted(query)} className="px-3 h-9 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors">Search</button>
      </div>
      {isLoading && <div className="flex items-center justify-center flex-1"><Spinner size="lg" /></div>}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50">
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            {item.posterPath ? (
              <img src={`https://image.tmdb.org/t/p/w92${item.posterPath}`} alt={item.title || item.name} className="w-8 h-12 rounded object-cover" />
            ) : null}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{item.title || item.name}</p>
              <p className="text-xs text-slate-500">{item.mediaType} · {(item.releaseDate || item.firstAirDate || '').slice(0, 4)}</p>
            </div>
            <Badge variant={item.mediaInfo?.status === 5 ? 'success' : item.mediaInfo ? 'info' : 'default'} className="text-[10px]">
              {item.mediaInfo?.status === 5 ? 'Available' : item.mediaInfo ? 'Requested' : 'Not Requested'}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OverseerrApp() {
  return (
    <MemoryRouter initialEntries={['/requests']}>
      <div className="h-full flex flex-col overflow-hidden">
        <OverseerrNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/requests" replace />} />
            <Route path="/requests" element={<RequestsView />} />
            <Route path="/discover" element={<DiscoverView />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
