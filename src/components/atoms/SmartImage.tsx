import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/atoms/Skeleton'

interface SmartImageProps {
  src?: string | null
  alt: string
  className?: string
  imgClassName?: string
  fallback?: string
  eager?: boolean
}

const GRADIENT_FALLBACK =
  'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary-deep)) 100%)'

export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  fallback = GRADIENT_FALLBACK,
  eager = false,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const url = src && !error ? src : null

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={!url ? { background: fallback } : undefined}
    >
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      {url ? (
        <img
          src={url}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn('h-full w-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', imgClassName)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-white/70"
          aria-hidden="true"
        >
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  )
}
