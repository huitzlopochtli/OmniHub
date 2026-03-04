import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Search, RefreshCw, Star, Clock, Calendar } from 'lucide-react'
import { radarrApi } from '@/services/api/radarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatBytes } from '@/lib/utils'

export function MovieDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { getService } = useSettingsStore()
  const cfg = getService('radarr')

  const {
    data: movie,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['radarr', 'movie', id],
    queryFn: () => radarrApi.getMovieById(Number(id)),
    enabled: !!id,
  })

  const searchMut = useMutation({
    mutationFn: () => radarrApi.searchMovie([Number(id)]),
  })

  const refreshMut = useMutation({
    mutationFn: () => radarrApi.refreshMovie(Number(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['radarr', 'movie', id] }),
  })

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error || !movie) return <ErrorState error={error} retry={refetch} />

  const fanart = movie.images.find((i) => i.coverType === 'fanart')
  const poster = movie.images.find((i) => i.coverType === 'poster')
  const fanartUrl = fanart ? `${cfg?.baseUrl}${fanart.url}` : null
  const posterUrl = poster ? `${cfg?.baseUrl}${poster.url}` : null

  return (
    <div className="h-full overflow-y-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 px-4 py-3 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Backdrop */}
      {fanartUrl && (
        <div className="relative h-48 md:h-64 overflow-hidden -mt-1">
          <img src={fanartUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="px-4 pb-4 flex gap-3 -mt-16 relative z-10">
        {posterUrl && (
          <div className="w-24 h-36 shrink-0 rounded-lg overflow-hidden ring-2 ring-slate-700 shadow-xl">
            <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0 pt-16">
          <h1 className="text-xl font-bold text-slate-100 leading-tight">{movie.title}</h1>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {movie.genres?.slice(0, 3).map((g) => (
              <Badge key={g} variant="default" className="text-xs">
                {g}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400">
            {movie.year && (
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {movie.year}
              </span>
            )}
            {movie.runtime && (
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {movie.runtime}m
              </span>
            )}
            {movie.ratings?.imdb?.value && (
              <span className="flex items-center gap-1">
                <Star size={13} className="text-yellow-400" />
                {movie.ratings.imdb.value.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() => searchMut.mutate()}
          loading={searchMut.isPending}
        >
          <Search size={14} /> Search
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => refreshMut.mutate()}
          loading={refreshMut.isPending}
        >
          <RefreshCw size={14} /> Refresh
        </Button>
        <Badge variant={movie.hasFile ? 'success' : 'warning'} className="px-3 py-1">
          {movie.hasFile ? 'Downloaded' : 'Missing'}
        </Badge>
        <Badge variant={movie.monitored ? 'info' : 'default'} className="px-3 py-1">
          {movie.monitored ? 'Monitored' : 'Unmonitored'}
        </Badge>
      </div>

      {/* Overview */}
      {movie.overview && (
        <div className="px-4 pb-4">
          <h2 className="text-sm font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            Overview
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">{movie.overview}</p>
        </div>
      )}

      {/* File Info */}
      {movie.movieFile && (
        <div className="px-4 pb-4">
          <h2 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            File Info
          </h2>
          <div className="bg-slate-800/50 rounded-xl p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Quality</span>
              <span className="text-slate-200">{movie.movieFile.quality.quality.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Size</span>
              <span className="text-slate-200">{formatBytes(movie.movieFile.size)}</span>
            </div>
            {movie.movieFile.mediaInfo?.resolution && (
              <div className="flex justify-between">
                <span className="text-slate-400">Resolution</span>
                <span className="text-slate-200">{movie.movieFile.mediaInfo.resolution}</span>
              </div>
            )}
            {movie.movieFile.mediaInfo?.videoCodec && (
              <div className="flex justify-between">
                <span className="text-slate-400">Video</span>
                <span className="text-slate-200">{movie.movieFile.mediaInfo.videoCodec}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Path */}
      {movie.path && (
        <div className="px-4 pb-6">
          <h2 className="text-sm font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            Path
          </h2>
          <p className="text-xs text-slate-500 font-mono break-all">{movie.path}</p>
        </div>
      )}
    </div>
  )
}
