import { TabRouter, useTabLocation, useTabNavigate } from '@/lib/tabRouter'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const navigate = useTabNavigate()
  const location = useTabLocation()
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
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ReadarrContent() {
  const { pathname } = useTabLocation()
  if (pathname === '/queue') return <ReadarrQueue />
  if (pathname === '/wanted') return <ReadarrWanted />
  if (pathname === '/history') return <ReadarrHistory />
  return <BookList />
}

export function ReadarrApp() {
  return (
    <TabRouter initialPath="/books">
      <div className="h-full flex flex-col overflow-hidden">
        <ReadarrNav />
        <div className="flex-1 overflow-hidden">
          <ReadarrContent />
        </div>
      </div>
    </TabRouter>
  )
}
