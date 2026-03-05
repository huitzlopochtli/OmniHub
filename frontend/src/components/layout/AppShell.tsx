import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  activeService: string
  children: React.ReactNode
}

export function AppShell({ activeService, children }: AppShellProps) {
  return (
    <div className="safe-top app-height flex overflow-hidden bg-slate-900">
      <Sidebar activeService={activeService} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* pb reserves space above the fixed BottomNav (--nav-offset = 3.5rem + safe-area-bottom).
            Pages using h-full+overflow-hidden manage their own scroll; h-full resolves to this
            div's content-box height (border-box minus padding), so they are correctly bounded. */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-[var(--nav-offset)] lg:pb-0">
          {children}
        </div>
      </main>
      <BottomNav activeService={activeService} />
    </div>
  )
}
