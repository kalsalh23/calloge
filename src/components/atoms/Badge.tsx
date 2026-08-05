import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'gold' | 'neutral' | 'primary'

const tones: Record<BadgeTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  gold: 'bg-accent-gold/15 text-accent-dark-brown border-accent-gold/40',
  neutral: 'bg-surface-alt text-text-muted border-surface-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
