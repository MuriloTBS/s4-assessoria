import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'orange'
}

const colorMap = {
  blue:   'border-blue-500/30 bg-blue-500/5',
  green:  'border-green-500/30 bg-green-500/5',
  yellow: 'border-yellow-500/30 bg-yellow-500/5',
  red:    'border-red-500/30 bg-red-500/5',
  orange: 'border-orange-500/30 bg-orange-500/5',
}

export default function Card({ children, className, color }: CardProps) {
  return (
    <div className={cn(
      'bg-[#162032] border border-[#2a3f5f] rounded-2xl',
      color && colorMap[color],
      className,
    )}>
      {children}
    </div>
  )
}
