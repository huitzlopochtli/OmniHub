import { TabRouter, useTabLocation } from '@/lib/tabRouter'
import { SeriesList } from './SeriesList'
import { SeriesDetail } from './SeriesDetail'
import { SonarrCalendar } from './SonarrCalendar'
import { SonarrQueue } from './SonarrQueue'
import { SonarrHistory } from './SonarrHistory'
import { SonarrWanted } from './SonarrWanted'
import { SonarrNav } from './SonarrNav'

function SonarrContent() {
  const { pathname } = useTabLocation()
  if (pathname.startsWith('/series/')) return <SeriesDetail />
  if (pathname === '/calendar') return <SonarrCalendar />
  if (pathname === '/queue') return <SonarrQueue />
  if (pathname === '/history') return <SonarrHistory />
  if (pathname === '/wanted') return <SonarrWanted />
  return <SeriesList />
}

export function SonarrApp() {
  return (
    <TabRouter initialPath="/series">
      <div className="h-full flex flex-col overflow-hidden">
        <SonarrNav />
        <div className="flex-1 overflow-hidden">
          <SonarrContent />
        </div>
      </div>
    </TabRouter>
  )
}
