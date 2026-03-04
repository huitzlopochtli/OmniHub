import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    xs: 'size-3 border',
    sm: 'size-4 border-2',
    md: 'size-6 border-2',
    lg: 'size-10 border-[3px]',
  }
  return (
    <span
      className={cn(
        'inline-block rounded-full border-slate-600 border-t-sky-500 animate-spin',
        sizes[size],
        className,
      )}
    />
  )
}

export function LoadingPage({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
      <Spinner size="lg" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
