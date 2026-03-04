import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Grid3X3, List } from 'lucide-react'
import { radarrApi, type RadarrMovie } from '@/services/api/radarr'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { useSettingsStore } from '@/stores/settingsStore'


type SortKey = 'sortTitle' | 'year' | 'added' | 'downloaded'
type ViewMode = 'poster' | 'list'

export function MovieGrid() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('sortTitle')
  const [viewMode, setViewMode] = useState<ViewMode>('poster')
  const navigate = useNavigate()
  const { getService } = useSettingsStore()
  const cfg = getService('radarr')

  const { data: movies = [], isLoading, error, refetch } = useQuery({
    queryKey: ['radarr', 'movies'],
    queryFn: radarrApi.getMovies,
  })

  const filtered = movies
    .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'sortTitle') return a.sortTitle.localeCompare(b.sortTitle)
      if (sortKey === 'year') return b.year - a.year
      if (sortKey === 'added') return new Date(b.added).getTime() - new Date(a.added).getTime()
      if (sortKey === 'downloaded') return (b.hasFile ? 1 : 0) - (a.hasFile ? 1 : 0)
      return 0
    })

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 p-3 flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input placeholder="Search movies..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm" />
        </div>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 h-9 text-sm">
          <option value="sortTitle">Title</option>
          <option value="year">Year</option>
          <option value="added">Added</option>
          <option value="downloaded">Downloaded</option>
        </select>
        <button onClick={() => setViewMode(viewMode === 'poster' ? 'list' : 'poster')}
          className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200">
          {viewMode === 'poster' ? <List size={16} /> : <Grid3X3 size={16} />}
        </button>
      </div>

      {/* Count */}
      <div className="shrink-0 px-4 pb-2 text-xs text-slate-500">{filtered.length} movies</div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'poster' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 p-3 pt-0">
            {filtered.map((movie) => (
              <PosterCard key={movie.id} movie={movie} baseUrl={cfg?.baseUrl || ''} onClick={() => navigate(`/movies/${movie.id}`)} />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filtered.map((movie) => (
              <ListRow key={movie.id} movie={movie} baseUrl={cfg?.baseUrl || ''} onClick={() => navigate(`/movies/${movie.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PosterCard({ movie, baseUrl, onClick }: { movie: RadarrMovie; baseUrl: string; onClick: () => void }) {
  const poster = movie.images.find((i) => i.coverType === 'poster')
  const posterUrl = poster ? `${baseUrl}${poster.url}` : null
  return (
    <button onClick={onClick} className="group flex flex-col rounded-lg overflow-hidden bg-slate-800/50 hover:bg-slate-800 transition-colors text-left">
      <div className="aspect-[2/3] bg-slate-700 relative overflow-hidden">
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <Grid3X3 size={24} />
          </div>
        )}
        {!movie.hasFile && (
          <div className="absolute inset-0 bg-black/40 flex items-end p-1">
            <span className="text-[10px] bg-yellow-500/90 text-black rounded px-1 font-semibold">Missing</span>
          </div>
        )}
      </div>
      <div className="p-1.5">
        <p className="text-xs text-slate-300 truncate leading-tight">{movie.title}</p>
        <p className="text-[11px] text-slate-500">{movie.year}</p>
      </div>
    </button>
  )
}

function ListRow({ movie, baseUrl, onClick }: { movie: RadarrMovie; baseUrl: string; onClick: () => void }) {
  const poster = movie.images.find((i) => i.coverType === 'poster')
  const posterUrl = poster ? `${baseUrl}${poster.url}` : null
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-4 py-3 w-full hover:bg-slate-800/50 transition-colors text-left">
      <div className="w-10 h-14 shrink-0 rounded overflow-hidden bg-slate-700">
        {posterUrl && <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate font-medium">{movie.title}</p>
        <p className="text-xs text-slate-500">{movie.year}{movie.runtime ? ` · ${movie.runtime}m` : ''}</p>
        {movie.ratings?.imdb?.value && <p className="text-xs text-slate-500">IMDb {movie.ratings.imdb.value.toFixed(1)}</p>}
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <Badge variant={movie.hasFile ? 'success' : 'warning'} className="text-[11px]">
          {movie.hasFile ? 'Downloaded' : 'Missing'}
        </Badge>
        {movie.monitored && <Badge variant="default" className="text-[11px]">Monitored</Badge>}
      </div>
    </button>
  )
}
