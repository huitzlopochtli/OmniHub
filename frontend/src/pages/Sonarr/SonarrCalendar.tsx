import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft as CL, ChevronRight as CR } from 'lucide-react'
import { sonarrApi } from '@/services/api/sonarr'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { startOfWeek as sodw, endOfWeek as eodw, addWeeks as aw, format as fmt } from 'date-fns'

export function SonarrCalendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const now = new Date()
  const weekStart = sodw(aw(now, weekOffset), { weekStartsOn: 1 })
  const weekEnd = eodw(aw(now, weekOffset), { weekStartsOn: 1 })

  const { data, isLoading } = useQuery({
    queryKey: ['sonarr', 'calendar', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: () => sonarrApi.getCalendar(weekStart.toISOString(), weekEnd.toISOString()),
  })

  const days: Record<string, typeof data> = {}
  const startDay = new Date(weekStart)
  for (let i = 0; i < 7; i++) {
    const key = fmt(new Date(startDay.getTime() + i * 86400000), 'yyyy-MM-dd')
    days[key] = []
  }
  data?.forEach((ep) => {
    const key = ep.airDate
    if (days[key]) days[key]!.push(ep)
  })

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Week navigation */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
          <CL size={14} />
        </Button>
        <p className="text-sm font-medium text-slate-200">
          {fmt(weekStart, 'MMM d')} – {fmt(weekEnd, 'MMM d, yyyy')}
        </p>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
          <CR size={14} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 lg:pb-4">
          {Object.entries(days).map(([dateKey, episodes]) => {
            const date = new Date(dateKey)
            const isToday = fmt(date, 'yyyy-MM-dd') === fmt(now, 'yyyy-MM-dd')
            return (
              <div key={dateKey}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-sm font-semibold ${isToday ? 'text-sky-400' : 'text-slate-300'}`}
                  >
                    {fmt(date, 'EEE MMM d')}
                  </span>
                  {isToday && <Badge variant="info">Today</Badge>}
                </div>
                {!episodes || episodes.length === 0 ? (
                  <p className="text-xs text-slate-600 pl-2">Nothing airing</p>
                ) : (
                  <div className="space-y-2">
                    {episodes.map((ep) => {
                      const poster = ep.series?.images?.find(
                        (i) => i.coverType === 'poster',
                      )?.remoteUrl
                      return (
                        <div
                          key={ep.id}
                          className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg"
                        >
                          {poster && (
                            <img
                              src={poster}
                              alt=""
                              className="size-10 rounded object-cover shrink-0"
                              loading="lazy"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">
                              {ep.series?.title}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              S{String(ep.seasonNumber).padStart(2, '0')}E
                              {String(ep.episodeNumber).padStart(2, '0')} — {ep.title}
                            </p>
                            {ep.series?.airTime && (
                              <p className="text-[10px] text-slate-500">
                                {ep.series.airTime} · {ep.series.network}
                              </p>
                            )}
                          </div>
                          {ep.hasFile && <Badge variant="success">Downloaded</Badge>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
