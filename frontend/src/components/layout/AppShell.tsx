import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  activeService: string
  children: React.ReactNode
}

export function AppShell({ activeService, children }: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-slate-900">
      <Sidebar activeService={activeService} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
      <BottomNav activeService={activeService} />
    </div>
  )
}
