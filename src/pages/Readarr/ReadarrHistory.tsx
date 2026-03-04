import { useQuery } from '@tanstack/react-query'
import { readarrApi } from '@/services/api/readarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { formatDistanceToNow, parseISO } from 'date-fns'

export function ReadarrHistory() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['readarr', 'history'],
    queryFn: () => readarrApi.getHistory(),
  })
  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />
  const records = (data as any)?.records ?? []
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {records.map((item: any) => (
        <div key={item.id} className="px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{item.book?.title || item.sourceTitle}</p>
              <p className="text-xs text-slate-500">{item.author?.authorName}</p>
            </div>
            <Badge variant={item.eventType === 'bookFileImported' ? 'success' : item.eventType === 'downloadFailed' ? 'danger' : 'default'} className="text-[10px] shrink-0">
              {item.eventType}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 mt-1">{formatDistanceToNow(parseISO(item.date), { addSuffix: true })}</p>
        </div>
      ))}
    </div>
  )
}
