import { type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600': variant === 'primary',
          'bg-[#1B263B] text-[#e2e8f0] border border-[#2a3f5f] hover:bg-[#243147]': variant === 'secondary',
          'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20': variant === 'danger',
          'text-[#8a9bb0] hover:text-white hover:bg-[#1B263B]': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
