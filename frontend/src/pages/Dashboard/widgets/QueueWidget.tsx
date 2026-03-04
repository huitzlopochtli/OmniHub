import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Tv2, Film } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { sonarrApi } from '@/services/api/sonarr'
import { radarrApi } from '@/services/api/radarr'

interface QueueWidgetProps {
  service: 'sonarr' | 'radarr'
  refreshInterval: number
}

export function QueueWidget({ service, refreshInterval }: QueueWidgetProps) {
  const isSonarr = service === 'sonarr'

  const { data, isLoading, error } = useQuery({
    queryKey: [service, 'queue'],
    queryFn: () => (isSonarr ? sonarrApi.getQueue() : radarrApi.getQueue()) as Promise<{ totalRecords: number; records: any[] }>,
    refetchInterval: refreshInterval,
  })

  const records: any[] = (data as any)?.records ?? []
  const total: number = (data as any)?.totalRecords ?? 0
  const hasWarnings = records.some(
    (r) => r.trackedDownloadStatus === 'warning' || r.trackedDownloadStatus === 'error',
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isSonarr ? (
            <Tv2 size={14} className="text-sky-400" />
          ) : (
            <Film size={14} className="text-yellow-400" />
          )}
          <CardTitle>{isSonarr ? 'Sonarr' : 'Radarr'} Queue</CardTitle>
        </div>
        {hasWarnings ? (
          <AlertCircle size={14} className="text-amber-400" />
        ) : total > 0 ? (
          <Badge variant="info">{total}</Badge>
        ) : (
          <CheckCircle2 size={14} className="text-emerald-400" />
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : error ? (
          <p className="text-xs text-red-400">Connection failed</p>
        ) : total === 0 ? (
          <p className="text-sm text-slate-500 py-2 text-center">Queue is empty</p>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 4).map((item) => {
              const hasIssue =
                item.trackedDownloadStatus === 'warning' ||
                item.trackedDownloadStatus === 'error'
              const progress = item.size > 0
                ? ((item.size - item.sizeleft) / item.size) * 100
                : 0

              const title = isSonarr
                ? (item as typeof item & { series?: { title?: string }; episode?: { seasonNumber?: number; episodeNumber?: number } }).series?.title ?? item.title
                : (item as typeof item & { movie?: { title?: string } }).movie?.title ?? item.title

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-300 truncate flex-1">{title}</p>
                    {hasIssue && <AlertCircle size={11} className="text-amber-400 shrink-0" />}
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${hasIssue ? 'bg-amber-500' : 'bg-sky-500'}`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{item.status}</span>
                    <span>{item.timeleft}</span>
                  </div>
                </div>
              )
            })}
            {total > 4 && (
              <p className="text-xs text-slate-500 text-center">+{total - 4} more</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
