import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { readarrApi } from '@/services/api/readarr'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { useSettingsStore } from '@/stores/settingsStore'

export function BookList() {
  const [search, setSearch] = useState('')
  const { getService } = useSettingsStore()
  const cfg = getService('readarr')

  const { data: books = [], isLoading, error, refetch } = useQuery({
    queryKey: ['readarr', 'books'],
    queryFn: () => readarrApi.getBooks(),
  })

  const filtered = (books as any[]).filter((b: any) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.authorName?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 p-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input placeholder="Search books..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
      </div>
      <div className="shrink-0 px-4 pb-2 text-xs text-slate-500">{filtered.length} books</div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50">
        {filtered.map((book: any) => {
          const cover = book.images?.find((i: any) => i.coverType === 'cover' || i.coverType === 'poster')
          const coverUrl = cover ? `${cfg?.baseUrl}${cover.url}` : null
          return (
            <div key={book.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-12 shrink-0 rounded overflow-hidden bg-slate-700">
                {coverUrl && <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{book.title}</p>
                <p className="text-xs text-slate-500 truncate">{book.author?.authorName}</p>
                <p className="text-xs text-slate-600">{book.releaseDate?.slice(0, 4)}</p>
              </div>
              <div className="shrink-0 flex flex-col gap-1">
                <Badge variant={book.grabbed ? 'success' : 'warning'} className="text-[10px]">
                  {book.grabbed ? 'Downloaded' : 'Missing'}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
