import { useTabNavigate, useTabLocation } from '@/lib/tabRouter'
import { cn } from '@/lib/utils'
import { Tv2 } from 'lucide-react'

const TABS = [
  { path: '/series', label: 'Series' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/queue', label: 'Queue' },
  { path: '/history', label: 'History' },
  { path: '/wanted', label: 'Wanted' },
]

export function SonarrNav() {
  const navigate = useTabNavigate()
  const location = useTabLocation()

  return (
    <div className="shrink-0 border-b border-slate-700/50">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Tv2 size={18} className="text-sky-400" />
        <h1 className="text-base font-bold text-slate-100">Sonarr</h1>
      </div>
      {/* Tab bar */}
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path === '/series' && location.pathname.startsWith('/series'))
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-sky-500 text-sky-400'
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
