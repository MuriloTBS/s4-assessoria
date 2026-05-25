import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-[#e2e8f0]">{label}</label>}
    <textarea
      ref={ref}
      rows={3}
      className={cn(
        'bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] resize-none',
        'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all',
        error && 'border-red-500',
        className,
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'
export default Textarea
