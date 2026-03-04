import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, X } from 'lucide-react'
import { sonarrApi } from '@/services/api/sonarr'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/shared/ErrorState'

export function SonarrQueue() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['sonarr', 'queue'],
    queryFn: sonarrApi.getQueue,
    refetchInterval: 15000,
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => sonarrApi.removeFromQueue(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sonarr', 'queue'] }),
  })

  const records = data?.records ?? []

  return (
    <div className="h-full overflow-y-auto p-4 pb-20 lg:pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Queue · {data?.totalRecords ?? 0} items
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : records.length === 0 ? (
        <EmptyState title="Queue is empty" description="Nothing currently downloading in Sonarr" />
      ) : (
        <div className="space-y-2">
          {records.map((item) => {
            const hasIssue = item.trackedDownloadStatus === 'warning' || item.trackedDownloadStatus === 'error'
            const progress = item.size > 0 ? ((item.size - item.sizeleft) / item.size) * 100 : 0
            return (
              <div key={item.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {item.series?.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      S{String(item.episode?.seasonNumber ?? 0).padStart(2, '0')}E{String(item.episode?.episodeNumber ?? 0).padStart(2, '0')} — {item.episode?.title ?? item.title}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => removeMutation.mutate(item.id)}
                    loading={removeMutation.isPending}
                  >
                    <X size={12} />
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  <ProgressBar value={progress} color={hasIssue ? 'amber' : 'sky'} size="sm" />
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{item.status}</span>
                    <div className="flex items-center gap-2">
                      {hasIssue && <AlertCircle size={10} className="text-amber-400" />}
                      <span>{item.timeleft}</span>
                      <span>{item.protocol}</span>
                    </div>
                  </div>
                  {item.statusMessages?.length > 0 && (
                    <p className="text-[10px] text-amber-400 truncate">
                      {item.statusMessages[0].title}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
