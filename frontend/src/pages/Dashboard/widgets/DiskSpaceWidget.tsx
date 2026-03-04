import { useQuery } from '@tanstack/react-query'
import { HardDrive } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Spinner } from '@/components/ui/Spinner'
import { sonarrApi } from '@/services/api/sonarr'
import { radarrApi } from '@/services/api/radarr'
import { useServiceEnabled } from '@/hooks/useServiceEnabled'
import { formatBytes } from '@/lib/utils'

interface DiskSpaceWidgetProps {
  refreshInterval: number
}

export function DiskSpaceWidget({ refreshInterval }: DiskSpaceWidgetProps) {
  const sonarrEnabled = useServiceEnabled('sonarr')
  const radarrEnabled = useServiceEnabled('radarr')

  const { data: sonarrDisks, isLoading: sonarrLoading } = useQuery({
    queryKey: ['sonarr', 'diskspace'],
    queryFn: () => sonarrApi.getDiskSpace(),
    refetchInterval: refreshInterval,
    enabled: sonarrEnabled,
  })

  const { data: radarrDisks, isLoading: radarrLoading } = useQuery({
    queryKey: ['radarr', 'diskspace'],
    queryFn: () => radarrApi.getDiskSpace(),
    refetchInterval: refreshInterval,
    enabled: radarrEnabled,
  })

  // Deduplicate by path
  const allDisks = [
    ...(sonarrDisks?.map((d) => ({ ...d, source: 'Sonarr' })) ?? []),
    ...(radarrDisks?.map((d) => ({ ...d, source: 'Radarr' })) ?? []),
  ]
  const seen = new Set<string>()
  const disks = allDisks.filter((d) => {
    if (seen.has(d.path)) return false
    seen.add(d.path)
    return true
  })

  const isLoading = sonarrLoading || radarrLoading

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HardDrive size={14} className="text-emerald-400" />
          <CardTitle>Disk Space</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : disks.length === 0 ? (
          <p className="text-sm text-slate-500 py-2 text-center">No disk info</p>
        ) : (
          <div className="space-y-3">
            {disks.map((disk) => {
              const used = disk.totalSpace - disk.freeSpace
              const pct = disk.totalSpace > 0 ? (used / disk.totalSpace) * 100 : 0
              const color = pct > 90 ? 'red' : pct > 75 ? 'amber' : 'emerald'
              return (
                <div key={disk.path} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[60%]">{disk.label || disk.path}</span>
                    <span className="text-slate-400">{formatBytes(disk.freeSpace)} free</span>
                  </div>
                  <ProgressBar value={pct} color={color} size="sm" />
                  <p className="text-[10px] text-slate-500 text-right">
                    {formatBytes(used)} / {formatBytes(disk.totalSpace)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
