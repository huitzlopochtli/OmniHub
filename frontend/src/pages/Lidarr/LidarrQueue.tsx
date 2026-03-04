import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { lidarrApi } from '@/services/api/lidarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { formatBytes } from '@/lib/utils'

export function LidarrQueue() {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lidarr', 'queue'],
    queryFn: lidarrApi.getQueue,
    refetchInterval: 5000,
  })
  const removeMut = useMutation({
    mutationFn: (id: number) => lidarrApi.deleteArtist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lidarr', 'queue'] }),
  })
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />
  const records = (data as any)?.records ?? []
  if (!records.length)
    return (
      <div className="flex items-center justify-center h-full text-slate-500">Queue is empty</div>
    )
  return (
    <div className="h-full overflow-y-auto p-3 space-y-2">
      {records.map((item: any) => {
        const pct = item.size > 0 ? ((item.size - item.sizeleft) / item.size) * 100 : 0
        return (
          <div key={item.id} className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.artist?.artistName}</p>
              </div>
              <button
                onClick={() => removeMut.mutate(item.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <ProgressBar value={pct} className="mb-2" />
            <div className="flex gap-2 text-xs text-slate-400">
              <span>
                {formatBytes(item.size - item.sizeleft)} / {formatBytes(item.size)}
              </span>
              <Badge variant="default" className="text-[10px]">
                {item.status}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}
