import { useQuery } from '@tanstack/react-query'
import { Eye, Monitor } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { tautulliApi } from '@/services/api/tautulli'
import { formatBytes } from '@/lib/utils'

interface NowStreamingWidgetProps {
  refreshInterval: number
}

export function NowStreamingWidget({ refreshInterval }: NowStreamingWidgetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tautulli', 'activity'],
    queryFn: () => tautulliApi.getActivity(),
    refetchInterval: refreshInterval,
  })

  const activity = data?.response?.data
  const sessions = activity?.sessions ?? []
  const streamCount = parseInt(activity?.stream_count ?? '0')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-purple-400" />
          <CardTitle>Streaming</CardTitle>
        </div>
        <Badge variant={streamCount > 0 ? 'purple' : 'default'}>
          {streamCount} stream{streamCount !== 1 ? 's' : ''}
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-xs text-red-400">Connection failed</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-500 py-2 text-center">No active streams</p>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 3).map((session) => {
              const progress = parseInt(session.progress_percent ?? '0')
              return (
                <div key={session.session_id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Monitor size={11} className="text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 truncate font-medium">
                        {session.grandparent_title ?? session.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {session.friendly_name} · {session.video_decision}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} color="violet" size="xs" />
                </div>
              )
            })}
            {activity && (
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-700/50">
                <span>LAN: {formatBytes((activity.lan_bandwidth ?? 0) * 1024)}/s</span>
                <span>WAN: {formatBytes((activity.wan_bandwidth ?? 0) * 1024)}/s</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
