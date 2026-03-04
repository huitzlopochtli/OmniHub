import { useQuery } from '@tanstack/react-query'
import { Heart, Film, Tv2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { overseerrApi } from '@/services/api/overseerr'

interface RequestsWidgetProps {
  refreshInterval: number
}

const STATUS_LABELS: Record<number, string> = {
  1: 'Pending',
  2: 'Approved',
  3: 'Declined',
  4: 'Available',
}

export function RequestsWidget({ refreshInterval }: RequestsWidgetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['overseerr', 'requests', 'pending'],
    queryFn: () => overseerrApi.getRequests(10, 0, 'pending', 'added'),
    refetchInterval: refreshInterval,
  })

  const requests = data?.results ?? []
  const total = data?.pageInfo?.results ?? 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-pink-400" />
          <CardTitle>Requests</CardTitle>
        </div>
        <Badge variant={total > 0 ? 'warning' : 'default'}>{total} pending</Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-xs text-red-400">Connection failed</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-500 py-2 text-center">No pending requests</p>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center gap-2">
                {req.media.mediaType === 'movie' ? (
                  <Film size={11} className="text-yellow-400 shrink-0" />
                ) : (
                  <Tv2 size={11} className="text-sky-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{req.requestedBy.displayName}</p>
                  <p className="text-[10px] text-slate-500">
                    {STATUS_LABELS[req.status] ?? 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
