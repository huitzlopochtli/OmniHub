import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settingsStore'
import { NAV_ITEMS } from './Sidebar'
import type { ServiceId } from '@/App'

interface BottomNavProps {
  activeService: ServiceId
}

export function BottomNav({ activeService }: BottomNavProps) {
  const navigate = useNavigate()
  const getService = useSettingsStore((s) => s.getService)

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.serviceKey) return true
    const cfg = getService(item.serviceKey as Parameters<typeof getService>[0])
    return cfg?.enabled && cfg?.baseUrl
  })

  // Mobile: show max 5 items with overflow in a scrollable row
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 pb-safe z-50">
      <div className="flex overflow-x-auto scrollbar-none">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = activeService === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 min-w-[56px] transition-colors shrink-0',
                isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] leading-none truncate max-w-[52px]">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
