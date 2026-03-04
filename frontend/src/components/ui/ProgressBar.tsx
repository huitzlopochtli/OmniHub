import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0–100
  max?: number
  className?: string
  trackClassName?: string
  color?: 'sky' | 'emerald' | 'amber' | 'red' | 'violet'
  size?: 'xs' | 'sm' | 'md'
  animated?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  className,
  trackClassName,
  color = 'sky',
  size = 'sm',
  animated,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  const colors = {
    sky: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500',
  }

  const sizes = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
  }

  return (
    <div
      className={cn(
        'w-full rounded-full bg-slate-700 overflow-hidden',
        sizes[size],
        trackClassName,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          colors[color],
          animated && 'animate-pulse',
          className,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
