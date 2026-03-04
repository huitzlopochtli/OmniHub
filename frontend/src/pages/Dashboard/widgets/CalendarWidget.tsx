import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Tv2, Film } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { sonarrApi } from '@/services/api/sonarr'
import { radarrApi } from '@/services/api/radarr'
import { useServiceEnabled } from '@/hooks/useServiceEnabled'
import { format, startOfDay, endOfDay, addDays } from 'date-fns'

interface CalendarWidgetProps {
  refreshInterval: number
}

export function CalendarWidget({ refreshInterval }: CalendarWidgetProps) {
  const sonarrEnabled = useServiceEnabled('sonarr')
  const radarrEnabled = useServiceEnabled('radarr')

  const now = new Date()
  const start = startOfDay(now).toISOString()
  const end = endOfDay(addDays(now, 7)).toISOString()

  const { data: sonarrData, isLoading: sonarrLoading } = useQuery({
    queryKey: ['sonarr', 'calendar', start, end],
    queryFn: () => sonarrApi.getCalendar(start, end),
    refetchInterval: refreshInterval,
    enabled: sonarrEnabled,
  })

  const { data: radarrData, isLoading: radarrLoading } = useQuery({
    queryKey: ['radarr', 'calendar', start, end],
    queryFn: () => radarrApi.getCalendar(start, end),
    refetchInterval: refreshInterval,
    enabled: radarrEnabled,
  })

  const isLoading = sonarrLoading || radarrLoading

  // Merge and sort calendar items
  const items = [
    ...(sonarrData?.map((ep) => ({
      id: `sonarr-${ep.id}`,
      type: 'episode' as const,
      title: ep.series?.title ?? '',
      subtitle: `S${String(ep.seasonNumber).padStart(2, '0')}E${String(ep.episodeNumber).padStart(2, '0')} — ${ep.title}`,
      airDate: ep.airDateUtc,
      hasFile: ep.hasFile,
      network: ep.series?.network,
    })) ?? []),
    ...(radarrData?.map((movie) => ({
      id: `radarr-${movie.id}`,
      type: 'movie' as const,
      title: movie.title,
      subtitle: `${movie.year} · ${movie.status}`,
      airDate: movie.digitalRelease ?? movie.physicalRelease ?? movie.inCinemas,
      hasFile: movie.hasFile,
      network: movie.studio,
    })) ?? []),
  ]
    .filter((item) => item.airDate)
    .sort((a, b) => new Date(a.airDate).getTime() - new Date(b.airDate).getTime())

  // Group by day
  const grouped: Record<string, typeof items> = {}
  items.forEach((item) => {
    const key = format(new Date(item.airDate), 'EEE MMM d')
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-emerald-400" />
          <CardTitle>Calendar</CardTitle>
        </div>
        <Badge variant="info">{items.length} upcoming</Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 py-2 text-center">Nothing in the next 7 days</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(grouped).map(([day, dayItems]) => (
              <div key={day}>
                <p className="text-xs font-semibold text-slate-400 mb-1.5">{day}</p>
                <div className="space-y-1.5">
                  {dayItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      {item.type === 'episode' ? (
                        <Tv2 size={11} className="text-sky-400 shrink-0" />
                      ) : (
                        <Film size={11} className="text-yellow-400 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 truncate font-medium">{item.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p>
                      </div>
                      {item.hasFile && (
                        <Badge variant="success" size="sm">
                          ✓
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
