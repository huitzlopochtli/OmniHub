import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Search, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useServiceEnabled } from '@/hooks/useServiceEnabled'
import { NotConfigured } from '@/components/shared/ErrorState'
import { useQuery } from '@tanstack/react-query'
import { prowlarrApi } from '@/services/api/prowlarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'

const TABS = [{ path: '/indexers', label: 'Indexers' }, { path: '/search', label: 'Search' }]

function ProwlarrNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Search size={18} className="text-violet-400" />
        <h1 className="text-base font-bold text-slate-100">Prowlarr</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={cn('px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
              location.pathname === tab.path ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function IndexersView() {
  const { data: indexers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['prowlarr', 'indexers'],
    queryFn: prowlarrApi.getIndexers,
  })
  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {(indexers as any[]).map((idx: any) => (
        <div key={idx.id} className="flex items-center gap-3 px-4 py-3">
          <Globe size={16} className="text-slate-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{idx.name}</p>
            <p className="text-xs text-slate-500">{idx.protocol} · {idx.privacy}</p>
          </div>
          <Badge variant={idx.enable ? 'success' : 'default'} className="text-[10px]">
            {idx.enable ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      ))}
    </div>
  )
}

function SearchView() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { data = [], isLoading } = useQuery({
    queryKey: ['prowlarr', 'search', submitted],
    queryFn: () => prowlarrApi.search(submitted),
    enabled: !!submitted,
  })
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 p-3 flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input placeholder="Search all indexers..." value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSubmitted(query)} className="pl-8 h-9 text-sm" />
        </div>
        <button onClick={() => setSubmitted(query)} className="px-3 h-9 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">Search</button>
      </div>
      {isLoading && <div className="flex items-center justify-center flex-1"><Spinner size="lg" /></div>}
      {!isLoading && (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50">
          {(data as any[]).map((result: any, i: number) => (
            <div key={i} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-200 truncate">{result.title}</p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span>{result.indexer}</span>
                {result.size && <span>· {Math.round(result.size / 1024 / 1024 / 1024 * 10) / 10} GB</span>}
                {result.seeders != null && <span className="text-green-400">S:{result.seeders}</span>}
              </div>
            </div>
          ))}
          {submitted && !(data as any[]).length && !isLoading && <div className="text-center py-16 text-slate-500">No results</div>}
        </div>
      )}
    </div>
  )
}

export function ProwlarrApp() {
  const enabled = useServiceEnabled('prowlarr')
  if (!enabled) return <NotConfigured serviceName="Prowlarr" />
  return (
    <MemoryRouter initialEntries={['/indexers']}>
      <div className="h-full flex flex-col overflow-hidden">
        <ProwlarrNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/indexers" replace />} />
            <Route path="/indexers" element={<IndexersView />} />
            <Route path="/search" element={<SearchView />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
