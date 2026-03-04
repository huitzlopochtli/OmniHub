import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

    const variants = {
      primary: 'bg-sky-600 hover:bg-sky-500 text-white',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
      ghost: 'hover:bg-slate-800 text-slate-300 hover:text-slate-100',
      danger: 'bg-red-700 hover:bg-red-600 text-white',
      outline: 'border border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-slate-100',
    }

    const sizes = {
      xs: 'text-xs px-2 py-1 h-6',
      sm: 'text-sm px-3 py-1.5 h-8',
      md: 'text-sm px-4 py-2 h-9',
      lg: 'text-base px-5 py-2.5 h-11',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
