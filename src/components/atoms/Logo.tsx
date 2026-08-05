import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)} aria-label="حلمك الجامعي - الرئيسية">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-primary-deep shadow-glow">
        <svg className="h-5 w-5 text-accent-gold" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
        </svg>
      </span>
      <span className={cn('font-display text-xl font-extrabold leading-none', light ? 'text-white' : 'text-ink-dark')}>
        حلمك
        <span className="text-gradient-gold"> الجامعي</span>
      </span>
    </Link>
  )
}
