import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const switchId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <label
        htmlFor={switchId}
        className={cn(
          'flex items-center justify-between gap-4 cursor-pointer',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <div className="flex flex-col gap-0.5">
          {label && <span className="text-sm font-medium text-slate-200">{label}</span>}
          {description && <span className="text-xs text-slate-500">{description}</span>}
        </div>
        <div className="relative shrink-0">
          <input ref={ref} id={switchId} type="checkbox" className="sr-only peer" {...props} />
          <div className="w-10 h-6 bg-slate-700 peer-checked:bg-sky-600 rounded-full transition-colors peer-disabled:opacity-50" />
          <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
        </div>
      </label>
    )
  },
)
Switch.displayName = 'Switch'
