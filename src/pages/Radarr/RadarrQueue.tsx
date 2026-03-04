import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { radarrApi } from '@/services/api/radarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatBytes } from '@/lib/utils'

export function RadarrQueue() {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['radarr', 'queue'],
    queryFn: radarrApi.getQueue,
    refetchInterval: 5000,
  })

  const removeMut = useMutation({
    mutationFn: (id: number) => radarrApi.removeFromQueue(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['radarr', 'queue'] }),
  })

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />

  const records = data?.records ?? []

  if (records.length === 0)
    return <div className="flex items-center justify-center h-full text-slate-500">Queue is empty</div>

  return (
    <div className="h-full overflow-y-auto p-3 space-y-2">
      {records.map((item: any) => {
        const pct = item.size > 0 ? ((item.size - item.sizeleft) / item.size) * 100 : 0
        return (
          <div key={item.id} className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{item.title || item.movie?.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.movie?.title && item.title !== item.movie.title ? item.movie.title : ''}</p>
              </div>
              <button onClick={() => removeMut.mutate(item.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
            <ProgressBar value={pct} className="mb-2" />
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span>{formatBytes(item.size - item.sizeleft)} / {formatBytes(item.size)}</span>
              {item.downloadClient && <span>· {item.downloadClient}</span>}
              {item.status && <Badge variant="default" className="text-[10px]">{item.status}</Badge>}
              {item.trackedDownloadStatus === 'warning' && <Badge variant="warning" className="text-[10px]">Warning</Badge>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
