import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'glass rounded-3xl',
        hover &&
          'transition-all duration-300 hover:-translate-y-1 hover:shadow-soft hover:border-accent-gold/40',
        className
      )}
    >
      {children}
    </div>
  )
}
