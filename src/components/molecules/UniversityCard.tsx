import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaArrowLeft } from 'react-icons/fa'
import { Card } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { SmartImage } from '@/components/atoms/SmartImage'
import type { University } from '@/types'

interface UniversityCardProps {
  university: University
  isFavorite?: boolean
  onToggleFavorite?: () => void
  index?: number
}

export function UniversityCard({
  university,
  isFavorite,
  onToggleFavorite,
  index = 0,
}: UniversityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Card hover className="group relative overflow-hidden">
        <div className="relative h-36 sm:h-44">
          <SmartImage
            src={university.cover_url}
            alt={university.name_ar}
            className="h-full w-full"
            fallback="linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary-dark)) 50%, rgb(var(--color-primary-deep)) 100%)"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/80 via-primary-deep/20 to-transparent" />
          <div className="absolute bottom-3 right-4 left-4 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white drop-shadow">{university.name_ar}</h3>
              <p className="text-xs font-medium text-white/80">{university.name_en ?? 'University'}</p>
            </div>
          </div>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onToggleFavorite()
              }}
              aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-accent-burgundy"
            >
              {isFavorite ? <FaHeart className="text-accent-gold" /> : <FaRegHeart />}
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Badge tone={university.type === 'government' ? 'primary' : 'gold'}>
              {university.type === 'government' ? 'حكومية' : 'خاصة'}
            </Badge>
            {university.founding_year && <Badge tone="neutral">تأسست {university.founding_year}</Badge>}
            {university.housing_available && <Badge tone="success">سكن جامعي</Badge>}
          </div>

          {university.address && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-text-muted sm:mb-4">
              <FaMapMarkerAlt className="text-accent-gold" />
              {university.address}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              {university.rating > 0 ? `${university.rating} تقييم` : 'جديد'}
            </span>
            <Link
              to={`/university/${university.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-accent-dark-brown"
            >
              استكشف الجامعة
              <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
