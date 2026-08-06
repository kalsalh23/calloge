import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaHeart, FaRegHeart, FaUniversity } from 'react-icons/fa'
import { Card } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { SmartImage } from '@/components/atoms/SmartImage'
import type { MajorWithUniversity } from '@/types'
import { formatNumber } from '@/lib/utils'

interface MajorCardProps {
  major: MajorWithUniversity
  studentScore?: number
  minimumScore?: number
  isFavorite?: boolean
  onToggleFavorite?: () => void
  index?: number
}

export function MajorCard({
  major,
  studentScore,
  minimumScore,
  isFavorite,
  onToggleFavorite,
  index = 0,
}: MajorCardProps) {
  const university = major.college?.university
  const diff = studentScore !== undefined && minimumScore ? studentScore - minimumScore : null
  const eligible = diff !== null && diff >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Card hover className="group relative overflow-hidden">
        <div className="relative h-40 overflow-hidden">
          <SmartImage
            src={major.cover_url}
            alt={major.name_ar}
            className="h-full w-full"
            fallback="linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary-dark)) 50%, rgb(var(--color-primary-deep)) 100%)"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 right-4 left-4 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white drop-shadow">{major.name_ar}</h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-white/80">
                <FaUniversity className="text-accent-gold" />
                {university?.name_ar}
              </p>
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

        <div className="p-5">
          {university && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone={university.type === 'government' ? 'primary' : 'gold'}>
                {university.type === 'government' ? 'حكومية' : 'خاصة'}
              </Badge>
              <Badge tone="neutral">{major.degree ?? 'بكالوريوس'}</Badge>
              {major.study_duration_years && (
                <Badge tone="neutral">{formatNumber(major.study_duration_years, 0)} سنوات</Badge>
              )}
            </div>
          )}

          {studentScore !== undefined && minimumScore !== undefined && (
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface-alt p-3 text-center">
              <div>
                <p className="text-[11px] font-medium text-text-muted">معدل الطالب</p>
                <p className="text-sm font-bold text-ink-dark">{formatNumber(studentScore, 2)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted">الحد الأدنى</p>
                <p className="text-sm font-bold text-ink-dark">{formatNumber(minimumScore, 2)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted">الفرق</p>
                <p className={`text-sm font-bold ${eligible ? 'text-emerald-400' : 'text-red-400'}`}>
                  {diff !== null && diff >= 0 ? `+${formatNumber(diff, 2)}` : formatNumber(diff, 2)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge tone={eligible ? 'success' : diff === null ? 'info' : 'danger'}>
              {eligible ? 'إمكانية قبول عالية' : diff === null ? 'تفاصيل القبول' : 'أقل من الحد'}
            </Badge>
            <Link
              to={`/major/${major.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-accent-dark-brown"
            >
              التفاصيل
              <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
