import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { lidarrApi } from '@/services/api/lidarr'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { useSettingsStore } from '@/stores/settingsStore'

export function ArtistList() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { getService } = useSettingsStore()
  const cfg = getService('lidarr')

  const { data: artists = [], isLoading, error, refetch } = useQuery({
    queryKey: ['lidarr', 'artists'],
    queryFn: lidarrApi.getArtists,
  })

  const filtered = artists.filter((a: any) => a.artistName.toLowerCase().includes(search.toLowerCase()))

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 p-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input placeholder="Search artists..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50">
        {filtered.map((artist: any) => {
          const img = artist.images?.find((i: any) => i.coverType === 'poster' || i.coverType === 'fanart')
          const imgUrl = img ? `${cfg?.baseUrl}${img.url}` : null
          return (
            <button key={artist.id} onClick={() => navigate(`/artists/${artist.id}`)}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-slate-800/50 transition-colors text-left">
              <div className="w-10 h-10 rounded-full shrink-0 bg-slate-700 overflow-hidden">
                {imgUrl && <img src={imgUrl} alt={artist.artistName} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{artist.artistName}</p>
                <p className="text-xs text-slate-500">{artist.statistics?.albumCount ?? 0} albums · {artist.statistics?.trackFileCount ?? 0} tracks</p>
              </div>
              <Badge variant={artist.monitored ? 'info' : 'default'} className="text-[11px]">
                {artist.monitored ? 'Monitored' : 'Unmonitored'}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}
