import { useQuery } from '@tanstack/react-query'
import { Download, Pause, Play } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatSpeed, formatDuration } from '@/lib/utils'
import { sabnzbdApi } from '@/services/api/sabnzbd'
import { Button } from '@/components/ui/Button'

interface SpeedWidgetProps {
  refreshInterval: number
}

export function SpeedWidget({ refreshInterval }: SpeedWidgetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sabnzbd', 'queue'],
    queryFn: () => sabnzbdApi.getQueue(),
    refetchInterval: refreshInterval,
  })

  const queue = data?.queue
  const speed = parseFloat(queue?.kbpersec ?? '0') * 1024
  const isPaused = queue?.paused ?? false
  const slotsCount = queue?.noofslots ?? 0
  const timeLeft = queue?.timeleft ?? '0:00:00'
  const mb = parseFloat(queue?.mb ?? '0')
  const mbleft = parseFloat(queue?.mbleft ?? '0')
  const progress = mb > 0 ? ((mb - mbleft) / mb) * 100 : 0

  const handleTogglePause = async () => {
    if (isPaused) await sabnzbdApi.resumeQueue()
    else await sabnzbdApi.pauseQueue()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download size={14} className="text-sky-400" />
          <CardTitle>SABnzbd</CardTitle>
        </div>
        <Button variant="ghost" size="xs" onClick={handleTogglePause}>
          {isPaused ? <Play size={12} /> : <Pause size={12} />}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : error ? (
          <p className="text-xs text-red-400">Connection failed</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-100">{formatSpeed(speed)}</span>
              <Badge variant={isPaused ? 'warning' : slotsCount > 0 ? 'success' : 'default'}>
                {isPaused ? 'Paused' : slotsCount > 0 ? 'Downloading' : 'Idle'}
              </Badge>
            </div>
            {slotsCount > 0 && (
              <>
                <ProgressBar value={progress} color="sky" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{slotsCount} item{slotsCount > 1 ? 's' : ''}</span>
                  <span>{formatDuration(parseTimeLeft(timeLeft))} left</span>
                </div>
              </>
            )}
            {queue?.speedlimit && queue.speedlimit !== '0' && (
              <p className="text-xs text-amber-400">Limit: {queue.speedlimit}%</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function parseTimeLeft(timeleft: string): number {
  const parts = timeleft.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] ?? 0
}
