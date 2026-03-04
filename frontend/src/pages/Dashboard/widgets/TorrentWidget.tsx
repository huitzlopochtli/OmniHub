import { useQuery } from '@tanstack/react-query'
import { Download, Upload } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatSpeed, formatBytes } from '@/lib/utils'
import { qbittorrentApi } from '@/services/api/qbittorrent'


interface TorrentWidgetProps {
  refreshInterval: number
}

export function TorrentWidget({ refreshInterval }: TorrentWidgetProps) {
  const { data: torrents, isLoading, error } = useQuery({
    queryKey: ['qbittorrent', 'torrents'],
    queryFn: () => qbittorrentApi.getTorrents(),
    refetchInterval: refreshInterval,
  })

  const { data: stats } = useQuery({
    queryKey: ['qbittorrent', 'transfer'],
    queryFn: () => qbittorrentApi.getTransferInfo(),
    refetchInterval: refreshInterval,
  })

  const dlSpeed = stats?.dl_info_speed ?? 0
  const upSpeed = stats?.up_info_speed ?? 0
  const active = torrents?.filter((t: { state: string }) => t.state !== 'pausedDL' && t.state !== 'pausedUP').length ?? 0
  const paused = torrents?.filter((t: { state: string }) => t.state === 'pausedDL').length ?? 0
  const total = torrents?.length ?? 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download size={14} className="text-violet-400" />
          <CardTitle>Torrents</CardTitle>
        </div>
        <Badge variant={active > 0 ? 'success' : 'default'}>
          {active}/{total}
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : error ? (
          <p className="text-xs text-red-400">Connection failed</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sky-400">
                <Download size={13} />
                <span className="text-xl font-bold text-slate-100">{formatSpeed(dlSpeed)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Upload size={13} />
                <span className="text-sm font-semibold">{formatSpeed(upSpeed)}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {active > 0 && <Badge variant="success">{active} active</Badge>}
              {paused > 0 && <Badge variant="warning">{paused} paused</Badge>}
              {total === 0 && <Badge>No torrents</Badge>}
            </div>
            {stats && (
              <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-700/50">
                <span>↓ {formatBytes(stats.dl_info_data)}</span>
                <span>↑ {formatBytes(stats.up_info_data)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
