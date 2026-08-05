import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'gold' | 'neutral' | 'primary'

const tones: Record<BadgeTone, string> = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-300 border-red-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  info: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  gold: 'bg-accent-gold/15 text-accent-gold border-accent-gold/40',
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
