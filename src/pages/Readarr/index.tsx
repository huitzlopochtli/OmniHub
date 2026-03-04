import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useServiceEnabled } from '@/hooks/useServiceEnabled'
import { NotConfigured } from '@/components/shared/ErrorState'
import { BookList } from './BookList'
import { ReadarrQueue } from './ReadarrQueue'
import { ReadarrWanted } from './ReadarrWanted'
import { ReadarrHistory } from './ReadarrHistory'

const TABS = [
  { path: '/books', label: 'Books' },
  { path: '/queue', label: 'Queue' },
  { path: '/wanted', label: 'Wanted' },
  { path: '/history', label: 'History' },
]

function ReadarrNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <BookOpen size={18} className="text-orange-400" />
        <h1 className="text-base font-bold text-slate-100">Readarr</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path)
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              className={cn('px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                isActive ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ReadarrApp() {
  const enabled = useServiceEnabled('readarr')
  if (!enabled) return <NotConfigured serviceName="Readarr" />
  return (
    <MemoryRouter initialEntries={['/books']}>
      <div className="h-full flex flex-col overflow-hidden">
        <ReadarrNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/books" replace />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/queue" element={<ReadarrQueue />} />
            <Route path="/wanted" element={<ReadarrWanted />} />
            <Route path="/history" element={<ReadarrHistory />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
