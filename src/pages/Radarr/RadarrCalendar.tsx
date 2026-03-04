import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Film } from 'lucide-react'
import { radarrApi } from '@/services/api/radarr'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { useSettingsStore } from '@/stores/settingsStore'
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format, parseISO } from 'date-fns'

export function RadarrCalendar() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const { getService } = useSettingsStore()
  const cfg = getService('radarr')

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['radarr', 'calendar', weekStart.toISOString()],
    queryFn: () => radarrApi.getCalendar(weekStart.toISOString(), weekEnd.toISOString()),
  })

  const days: Record<string, typeof data> = {}
  data.forEach((m) => {
    const key = format(parseISO(m.digitalRelease || m.physicalRelease || m.inCinemas || new Date().toISOString()), 'yyyy-MM-dd')
    if (!days[key]) days[key] = []
    days[key].push(m)
  })

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (error) return <ErrorState error={error} retry={refetch} />

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Week nav */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <button onClick={() => setWeekStart((w) => subWeeks(w, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-slate-200">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
        </span>
        <button onClick={() => setWeekStart((w) => addWeeks(w, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.keys(days).sort().map((dateKey) => (
          <div key={dateKey}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {format(parseISO(dateKey), 'EEEE, MMM d')}
            </div>
            <div className="space-y-2">
              {days[dateKey].map((movie) => {
                const poster = movie.images?.find((i: any) => i.coverType === 'poster')
                const posterUrl = poster ? `${cfg?.baseUrl}${poster.url}` : null
                return (
                  <div key={movie.id} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3">
                    {posterUrl ? (
                      <img src={posterUrl} alt={movie.title} className="w-8 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-12 rounded bg-slate-700 flex items-center justify-center">
                        <Film size={14} className="text-slate-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{movie.title}</p>
                      <p className="text-xs text-slate-500">{movie.year}</p>
                    </div>
                    <div className="shrink-0 flex flex-col gap-1 items-end">
                      {movie.hasFile && <Badge variant="success" className="text-[10px]">Downloaded</Badge>}
                      {movie.inCinemas && <Badge variant="info" className="text-[10px]">In Cinemas</Badge>}
                      {movie.digitalRelease && <Badge variant="default" className="text-[10px]">Digital</Badge>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {Object.keys(days).length === 0 && (
          <div className="text-center py-16 text-slate-500">No movies releasing this week</div>
        )}
      </div>
    </div>
  )
}
