import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, LayoutGrid, List, Plus } from 'lucide-react'
import { sonarrApi, type SonarrSeries } from '@/services/api/sonarr'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatBytes } from '@/lib/utils'

type ViewMode = 'grid' | 'list'
type SortKey = 'sortTitle' | 'added' | 'status' | 'statistics.sizeOnDisk'

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  continuing: 'success',
  ended: 'default',
  upcoming: 'info',
}

export function SeriesList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortKey, _setSortKey] = useState<SortKey>('sortTitle')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sonarr', 'series'],
    queryFn: sonarrApi.getSeries,
  })

  const filtered = (data ?? [])
    .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'sortTitle') return a.sortTitle.localeCompare(b.sortTitle)
      if (sortKey === 'added') return b.added.localeCompare(a.added)
      if (sortKey === 'status') return a.status.localeCompare(b.status)
      if (sortKey === 'statistics.sizeOnDisk')
        return (b.statistics?.sizeOnDisk ?? 0) - (a.statistics?.sizeOnDisk ?? 0)
      return 0
    })

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )

  if (error)
    return (
      <ErrorState
        title="Failed to load series"
        message={(error as Error).message}
        onRetry={refetch}
        className="h-full"
      />
    )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-700/50 shrink-0">
        <div className="flex-1">
          <Input
            placeholder={`Search ${data?.length ?? 0} series…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}
        </Button>
        <Button variant="secondary" size="sm">
          <Plus size={14} />
          Add
        </Button>
      </div>

      {/* Series grid/list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No series found</p>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-20 lg:pb-4">
            {filtered.map((series) => (
              <SeriesPosterCard
                key={series.id}
                series={series}
                onClick={() => navigate(`/series/${series.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1 pb-20 lg:pb-4">
            {filtered.map((series) => (
              <SeriesListRow
                key={series.id}
                series={series}
                onClick={() => navigate(`/series/${series.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SeriesPosterCard({ series, onClick }: { series: SonarrSeries; onClick: () => void }) {
  const posterUrl = series.images.find((i) => i.coverType === 'poster')?.remoteUrl
  const pct = series.statistics?.percentOfEpisodes ?? 0

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group rounded-lg overflow-hidden bg-slate-800 border border-slate-700/50 hover:border-sky-500/50 transition-all hover:shadow-lg hover:shadow-sky-900/20"
    >
      <div className="aspect-[2/3] bg-slate-700 relative overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs text-center p-2">
            {series.title}
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-1.5 left-1.5">
          <Badge variant={STATUS_COLORS[series.status] ?? 'default'}>{series.status}</Badge>
        </div>
        {/* Not monitored overlay */}
        {!series.monitored && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <span className="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
              Unmonitored
            </span>
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-slate-200 truncate">{series.title}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {series.statistics?.episodeFileCount ?? 0}/{series.statistics?.totalEpisodeCount ?? 0} eps
        </p>
        <ProgressBar
          value={pct}
          color={pct === 100 ? 'emerald' : 'sky'}
          size="xs"
          className="mt-1.5"
        />
      </div>
    </div>
  )
}

function SeriesListRow({ series, onClick }: { series: SonarrSeries; onClick: () => void }) {
  const posterUrl = series.images.find((i) => i.coverType === 'poster')?.remoteUrl
  const pct = series.statistics?.percentOfEpisodes ?? 0

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
    >
      <div className="size-10 rounded bg-slate-700 overflow-hidden shrink-0">
        {posterUrl && (
          <img
            src={posterUrl}
            alt={series.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{series.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <ProgressBar value={pct} color="sky" size="xs" className="w-16" />
          <span className="text-[10px] text-slate-500">
            {series.statistics?.episodeFileCount ?? 0}/{series.statistics?.totalEpisodeCount ?? 0}{' '}
            eps
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={STATUS_COLORS[series.status] ?? 'default'}>{series.status}</Badge>
        <span className="text-xs text-slate-500 hidden sm:block">
          {formatBytes(series.statistics?.sizeOnDisk ?? 0)}
        </span>
      </div>
    </div>
  )
}
