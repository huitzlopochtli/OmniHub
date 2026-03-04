import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { sonarrApi } from '@/services/api/sonarr'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/shared/ErrorState'
import { formatRelativeDate } from '@/lib/utils'

export function SonarrWanted() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['sonarr', 'wanted'],
    queryFn: () => sonarrApi.getMissing(1, 50),
  })

  const searchMutation = useMutation({
    mutationFn: (episodeIds: number[]) => sonarrApi.searchEpisode(episodeIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sonarr'] }),
  })

  const records =
    (
      data as {
        records?: {
          id: number
          title: string
          airDateUtc: string
          seasonNumber: number
          episodeNumber: number
          series: { title: string }
        }[]
      }
    )?.records ?? []

  return (
    <div className="h-full overflow-y-auto p-4 pb-20 lg:pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Wanted · {(data as { totalRecords?: number })?.totalRecords ?? 0}
        </h2>
        {records.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => searchMutation.mutate(records.map((r) => r.id))}
            loading={searchMutation.isPending}
          >
            <Search size={13} />
            Search All
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : records.length === 0 ? (
        <EmptyState title="Nothing wanted" description="All monitored episodes have files" />
      ) : (
        <div className="space-y-1.5">
          {records.map((ep) => (
            <div
              key={ep.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{ep.series?.title}</p>
                <p className="text-xs text-slate-400">
                  S{String(ep.seasonNumber).padStart(2, '0')}E
                  {String(ep.episodeNumber).padStart(2, '0')} — {ep.title}
                </p>
                <p className="text-[10px] text-slate-500">{formatRelativeDate(ep.airDateUtc)}</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => searchMutation.mutate([ep.id])}
              >
                <Search size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
