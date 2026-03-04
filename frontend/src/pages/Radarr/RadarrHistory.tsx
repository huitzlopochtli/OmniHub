import { useQuery } from '@tanstack/react-query'
import { radarrApi } from '@/services/api/radarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { formatDistanceToNow, parseISO } from 'date-fns'

const EVENT_COLORS: Record<string, string> = {
  grabbed: 'info',
  downloadFolderImported: 'success',
  downloadFailed: 'error',
  movieFileDeleted: 'warning',
  movieFileRenamed: 'default',
}

export function RadarrHistory() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['radarr', 'history'],
    queryFn: () => radarrApi.getHistory(),
  })

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />

  const records: any[] = (data as any)?.records ?? []

  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {records.map((item: any) => (
        <div key={item.id} className="px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {item.movie?.title || item.sourceTitle}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{item.sourceTitle}</p>
            </div>
            <Badge
              variant={(EVENT_COLORS[item.eventType] || 'default') as any}
              className="text-[10px] shrink-0"
            >
              {item.eventType}
            </Badge>
          </div>
          {item.quality?.quality?.name && (
            <p className="text-xs text-slate-400 mt-1">{item.quality.quality.name}</p>
          )}
          <p className="text-xs text-slate-600 mt-0.5">
            {formatDistanceToNow(parseISO(item.date), { addSuffix: true })}
          </p>
        </div>
      ))}
      {records.length === 0 && (
        <div className="flex items-center justify-center h-full text-slate-500 py-16">
          No history
        </div>
      )}
    </div>
  )
}
