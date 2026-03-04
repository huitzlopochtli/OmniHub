import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SeriesList } from './SeriesList'
import { SeriesDetail } from './SeriesDetail'
import { SonarrCalendar } from './SonarrCalendar'
import { SonarrQueue } from './SonarrQueue'
import { SonarrHistory } from './SonarrHistory'
import { SonarrWanted } from './SonarrWanted'
import { SonarrNav } from './SonarrNav'

export function SonarrApp() {

  return (
    <MemoryRouter initialEntries={['/series']}>
      <div className="h-full flex flex-col overflow-hidden">
        <SonarrNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/series" replace />} />
            <Route path="/series" element={<SeriesList />} />
            <Route path="/series/:id" element={<SeriesDetail />} />
            <Route path="/calendar" element={<SonarrCalendar />} />
            <Route path="/queue" element={<SonarrQueue />} />
            <Route path="/history" element={<SonarrHistory />} />
            <Route path="/wanted" element={<SonarrWanted />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
