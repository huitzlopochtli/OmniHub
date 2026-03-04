import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import type { ServiceId } from '@/App'

interface AppShellProps {
  activeService: ServiceId
  children: React.ReactNode
}

export function AppShell({ activeService, children }: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-slate-900">
      {/* Desktop sidebar */}
      <Sidebar activeService={activeService} />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Service panels — all mounted, only active one shown */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav activeService={activeService} />
    </div>
  )
}
