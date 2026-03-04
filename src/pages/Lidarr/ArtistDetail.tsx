import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Search } from 'lucide-react'
import { lidarrApi } from '@/services/api/lidarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/stores/settingsStore'

export function ArtistDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getService } = useSettingsStore()
  const cfg = getService('lidarr')

  const { data: artist, isLoading, error, refetch } = useQuery({
    queryKey: ['lidarr', 'artist', id],
    queryFn: () => lidarrApi.getArtistById(Number(id)),
    enabled: !!id,
  })

  const { data: albums = [] } = useQuery({
    queryKey: ['lidarr', 'albums', id],
    queryFn: () => lidarrApi.getAlbums(Number(id)),
    enabled: !!id,
  })

  const searchMut = useMutation({ mutationFn: () => lidarrApi.searchArtists('') })

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error || !artist) return <ErrorState error={error} retry={refetch} />

  const fanart = (artist as any).images?.find((i: any) => i.coverType === 'fanart' || i.coverType === 'banner')
  const poster = (artist as any).images?.find((i: any) => i.coverType === 'poster')

  return (
    <div className="h-full overflow-y-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 px-4 py-3 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      {fanart && (
        <div className="h-40 overflow-hidden relative -mt-1">
          <img src={`${cfg?.baseUrl}${fanart.url}`} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
      )}
      <div className="px-4 pb-4 flex gap-3 -mt-12 relative z-10">
        {poster && (
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-slate-700 shrink-0">
            <img src={`${cfg?.baseUrl}${poster.url}`} alt={(artist as any).artistName} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 pt-12">
          <h1 className="text-xl font-bold text-slate-100">{(artist as any).artistName}</h1>
          <p className="text-xs text-slate-500 mt-1">{(artist as any).statistics?.albumCount} albums · {(artist as any).statistics?.trackFileCount} tracks</p>
        </div>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <Button size="sm" variant="primary" onClick={() => searchMut.mutate()} loading={searchMut.isPending}>
          <Search size={14} /> Search All
        </Button>
      </div>
      <div className="px-4 pb-6 space-y-2">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Albums</h2>
        {(albums as any[]).map((album: any) => (
          <div key={album.id} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{album.title}</p>
              <p className="text-xs text-slate-500">{album.releaseDate?.slice(0, 4)} · {album.statistics?.trackCount} tracks</p>
            </div>
            <Badge variant={album.statistics?.percentOfTracks >= 100 ? 'success' : 'warning'} className="text-[10px]">
              {Math.round(album.statistics?.percentOfTracks ?? 0)}%
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
