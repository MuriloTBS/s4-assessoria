import { type SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, className, children, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-[#e2e8f0]">{label}</label>}
    <select
      ref={ref}
      className={cn(
        'bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0]',
        'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all',
        error && 'border-red-500',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
))
Select.displayName = 'Select'
export default Select
