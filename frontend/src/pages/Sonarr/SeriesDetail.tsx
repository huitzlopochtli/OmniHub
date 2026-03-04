import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Search, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { sonarrApi } from '@/services/api/sonarr'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatBytes } from '@/lib/utils'

export function SeriesDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const seriesId = parseInt(id ?? '0')

  const {
    data: series,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sonarr', 'series', seriesId],
    queryFn: () => sonarrApi.getSeriesById(seriesId),
    enabled: !!seriesId,
  })

  const { data: episodes } = useQuery({
    queryKey: ['sonarr', 'episodes', seriesId],
    queryFn: () => sonarrApi.getEpisodes(seriesId),
    enabled: !!seriesId,
  })

  const searchMutation = useMutation({
    mutationFn: () => sonarrApi.searchSeriesNow(seriesId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sonarr'] }),
  })

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error || !series)
    return (
      <ErrorState
        title="Failed to load series"
        message={(error as Error)?.message}
        className="h-full"
      />
    )

  const fanartUrl = series.images.find((i) => i.coverType === 'fanart')?.remoteUrl
  const posterUrl = series.images.find((i) => i.coverType === 'poster')?.remoteUrl
  const pct = series.statistics?.percentOfEpisodes ?? 0

  // Group episodes by season
  const bySeason: Record<number, typeof episodes> = {}
  episodes?.forEach((ep) => {
    if (!bySeason[ep.seasonNumber]) bySeason[ep.seasonNumber] = []
    bySeason[ep.seasonNumber]!.push(ep)
  })

  return (
    <div className="h-full overflow-y-auto">
      {/* Backdrop */}
      {fanartUrl && (
        <div className="relative h-40 overflow-hidden">
          <img src={fanartUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
        </div>
      )}

      {/* Back button */}
      <div className="px-4 pt-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/series')}>
          <ArrowLeft size={14} />
          All Series
        </Button>
      </div>

      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-4">
        {posterUrl && (
          <img
            src={posterUrl}
            alt={series.title}
            className="w-20 h-28 rounded-lg object-cover shrink-0 -mt-10 shadow-xl border border-slate-700"
          />
        )}
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-xl font-bold text-slate-100 leading-tight">{series.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <Badge variant={series.status === 'continuing' ? 'success' : 'default'}>
              {series.status}
            </Badge>
            <span className="text-xs text-slate-400">{series.year}</span>
            {series.network && <span className="text-xs text-slate-400">{series.network}</span>}
            {series.runtime > 0 && (
              <span className="text-xs text-slate-400">{series.runtime}m</span>
            )}
          </div>
          {series.overview && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-3">{series.overview}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-slate-400">
            {series.statistics?.episodeFileCount ?? 0} / {series.statistics?.totalEpisodeCount ?? 0}{' '}
            episodes
          </span>
          <span className="text-xs text-slate-500">
            {formatBytes(series.statistics?.sizeOnDisk ?? 0)}
          </span>
        </div>
        <ProgressBar value={pct} color={pct === 100 ? 'emerald' : 'sky'} size="md" />
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 flex gap-2 flex-wrap">
        <Button
          variant="primary"
          size="sm"
          onClick={() => searchMutation.mutate()}
          loading={searchMutation.isPending}
        >
          <Search size={13} />
          Search All
        </Button>
        <Button variant="secondary" size="sm">
          <RefreshCw size={13} />
          Refresh
        </Button>
      </div>

      {/* Seasons */}
      <div className="px-4 space-y-4 pb-20 lg:pb-4">
        {series.seasons
          .slice()
          .reverse()
          .map((season) => {
            const seasonEps = bySeason[season.seasonNumber] ?? []
            const hasEps = seasonEps.length > 0
            return (
              <div key={season.seasonNumber}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-slate-200">
                    {season.seasonNumber === 0 ? 'Specials' : `Season ${season.seasonNumber}`}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {season.statistics?.episodeFileCount ?? 0}/
                    {season.statistics?.totalEpisodeCount ?? 0}
                  </span>
                  <Badge variant={season.monitored ? 'info' : 'default'} size="sm">
                    {season.monitored ? 'Monitored' : 'Unmonitored'}
                  </Badge>
                </div>
                {hasEps && (
                  <div className="space-y-0.5">
                    {seasonEps.map((ep) => (
                      <div
                        key={ep.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="text-xs text-slate-500 w-6 text-right shrink-0">
                          {ep.episodeNumber}
                        </span>
                        <p className="flex-1 text-xs text-slate-300 truncate">{ep.title}</p>
                        {ep.airDate && (
                          <span className="text-[10px] text-slate-500 shrink-0 hidden sm:block">
                            {new Date(ep.airDate).toLocaleDateString()}
                          </span>
                        )}
                        {ep.hasFile ? (
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle size={13} className="text-slate-600 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
