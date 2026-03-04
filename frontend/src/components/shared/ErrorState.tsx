import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface ErrorStateProps {
  title?: string
  message?: string
  error?: Error | null
  onRetry?: () => void
  retry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  retry,
  className,
}: ErrorStateProps) {
  const msg =
    message ?? (error instanceof Error ? error.message : error ? String(error) : undefined)
  const handleRetry = onRetry ?? retry
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 p-8 text-center', className)}
    >
      <div className="size-12 rounded-full bg-red-900/30 flex items-center justify-center">
        <AlertCircle className="text-red-400" size={24} />
      </div>
      <div>
        <p className="font-semibold text-slate-200">{title}</p>
        {msg && <p className="text-sm text-slate-400 mt-1 max-w-sm">{msg}</p>}
      </div>
      {handleRetry && (
        <Button variant="secondary" size="sm" onClick={handleRetry}>
          <RefreshCw size={14} />
          Retry
        </Button>
      )}
    </div>
  )
}

export function NotConfigured({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center h-full">
      <div className="size-12 rounded-full bg-slate-700/50 flex items-center justify-center">
        <WifiOff className="text-slate-500" size={24} />
      </div>
      <div>
        <p className="font-semibold text-slate-300">{serviceName} not configured</p>
        <p className="text-sm text-slate-500 mt-1">
          Go to Settings to add your {serviceName} URL and API key.
        </p>
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string
  description?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      {Icon && (
        <div className="size-12 rounded-full bg-slate-700/50 flex items-center justify-center">
          <Icon size={24} className="text-slate-500" />
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-300">{title}</p>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
