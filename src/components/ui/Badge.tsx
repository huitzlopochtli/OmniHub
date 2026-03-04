import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    success: 'bg-emerald-900/60 text-emerald-400',
    warning: 'bg-amber-900/60 text-amber-400',
    danger: 'bg-red-900/60 text-red-400',
    info: 'bg-sky-900/60 text-sky-400',
    purple: 'bg-violet-900/60 text-violet-400',
  }
  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
  }
  return (
    <span className={cn('inline-flex items-center rounded-md font-medium', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}
