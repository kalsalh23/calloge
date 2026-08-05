import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'start'
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'mb-10 max-w-2xl sm:mb-14',
        align === 'center' ? 'mx-auto text-center' : 'text-start',
        className
      )}
    >
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full border border-accent-gold/40 bg-accent-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-dark-brown">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-text-muted">{subtitle}</p>}
    </motion.div>
  )
}
