import { useQuery } from '@tanstack/react-query'
import { Server } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { unraidApi } from '@/services/api/unraid'
import { formatBytes } from '@/lib/utils'

interface UnraidWidgetProps {
  refreshInterval: number
}

export function UnraidWidget({ refreshInterval }: UnraidWidgetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['unraid', 'dashboard'],
    queryFn: () => unraidApi.getDashboard(),
    refetchInterval: refreshInterval,
  })

  const memPct = data ? (data.memory.used / data.memory.total) * 100 : 0
  const arrayStatus = data?.array.state ?? 'unknown'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Server size={14} className="text-orange-400" />
          <CardTitle>Unraid</CardTitle>
        </div>
        <Badge variant={arrayStatus === 'Started' ? 'success' : arrayStatus === 'Stopped' ? 'danger' : 'warning'}>
          {arrayStatus}
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : error ? (
          <p className="text-xs text-red-400">Connection failed</p>
        ) : data ? (
          <div className="space-y-3">
            {/* Memory */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">RAM</span>
                <span className="text-slate-300">
                  {formatBytes(data.memory.used * 1024)} / {formatBytes(data.memory.total * 1024)}
                </span>
              </div>
              <ProgressBar
                value={memPct}
                color={memPct > 90 ? 'red' : memPct > 75 ? 'amber' : 'sky'}
                size="sm"
              />
            </div>

            {/* Array disks */}
            <div className="flex justify-between text-xs text-slate-400">
              <span>{data.array.disks?.length ?? 0} disks</span>
              <span className="text-slate-300">
                {data.vars?.version ?? ''}
              </span>
            </div>

            {/* Hottest disk */}
            {data.array.disks?.length > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Hottest disk</span>
                <span className={
                  Math.max(...data.array.disks.map((d) => d.temp ?? 0)) > 50
                    ? 'text-red-400'
                    : 'text-slate-300'
                }>
                  {Math.max(...data.array.disks.map((d) => d.temp ?? 0))}°C
                </span>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
