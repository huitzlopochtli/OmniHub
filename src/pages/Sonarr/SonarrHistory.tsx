import { useQuery } from '@tanstack/react-query'
import { sonarrApi } from '@/services/api/sonarr'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/shared/ErrorState'
import { formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

const EVENT_COLORS: Record<string, 'success' | 'danger' | 'info' | 'warning' | 'default'> = {
  grabbed: 'info',
  downloadFolderImported: 'success',
  downloadFailed: 'danger',
  episodeFileDeleted: 'warning',
  episodeFileRenamed: 'default',
}

export function SonarrHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['sonarr', 'history'],
    queryFn: () => sonarrApi.getHistory(1, 50),
  })

  const records = data?.records ?? []

  return (
    <div className="h-full overflow-y-auto p-4 pb-20 lg:pb-4">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">History</h2>
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : records.length === 0 ? (
        <EmptyState title="No history" description="No past download activity" />
      ) : (
        <div className="space-y-1.5">
          {records.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">
                  {item.series?.title} — {item.episode?.title ?? 'Unknown'}
                </p>
                <p className="text-xs text-slate-500 truncate">{item.sourceTitle}</p>
                <p className="text-[10px] text-slate-600">{formatDateTime(item.date)}</p>
              </div>
              <div className="shrink-0">
                <Badge variant={EVENT_COLORS[item.eventType] ?? 'default'}>
                  {item.eventType.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
