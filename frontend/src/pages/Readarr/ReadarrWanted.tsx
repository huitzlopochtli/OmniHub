import { useQuery, useMutation } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { readarrApi } from '@/services/api/readarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/Button'

export function ReadarrWanted() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['readarr', 'wanted'],
    queryFn: () => readarrApi.getWanted(),
  })
  const searchMut = useMutation({ mutationFn: (id: number) => readarrApi.getBooks(id) })
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
      <div className="flex items-center justify-center h-full text-slate-500">No missing books</div>
    )
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {records.map((book: any) => (
        <div key={book.id} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{book.title}</p>
            <p className="text-xs text-slate-500">{book.author?.authorName}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => searchMut.mutate(book.id)}
            loading={searchMut.isPending}
          >
            <Search size={12} />
          </Button>
        </div>
      ))}
    </div>
  )
}
