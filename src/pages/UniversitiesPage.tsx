import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaUniversity } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Select } from '@/components/atoms/fields'
import { Skeleton } from '@/components/atoms/Skeleton'
import { UniversityCard } from '@/components/molecules/UniversityCard'
import { useUniversities, useGovernorates } from '@/lib/api'
import { useDocumentTitle } from '@/hooks/useSeo'

export default function UniversitiesPage() {
  useDocumentTitle('الجامعات')
  const { data: governorates } = useGovernorates()
  const [type, setType] = useState<string>('all')
  const [governorateId, setGovernorateId] = useState<string>('')
  const { data: universities, isLoading } = useUniversities({
    type,
    governorateId: governorateId ? Number(governorateId) : null,
  })

  const sorted = useMemo(() => (universities ?? []).slice(), [universities])

  return (
    <>
      <Seo
        title="الجامعات"
        description="تصفح جميع الجامعات الحكومية والخاصة في سوريا، مع معلومات الكليات والتخصصات وشروط القبول."
      />

      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative">
          <div className="mx-auto max-w-xl text-center">
            <span className="glass-gold inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-accent-gold">
              <FaUniversity className="h-3 w-3" />
              جميع الجامعات
            </span>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">الجامعات السورية</h1>
            <p className="mt-3 text-sm text-white/70 sm:text-base">
              استعرض الجامعات الحكومية والخاصة في سوريا وتعرف على كلياتها وتخصصاتها.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="container-app">
          <div className="glass mb-8 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-end">
            <Select
              label="نوع الجامعة"
              options={[
                { value: 'all', label: 'الجميع' },
                { value: 'government', label: 'حكومية' },
                { value: 'private', label: 'خاصة' },
              ]}
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <Select
              label="المحافظة"
              placeholder="كل المحافظات"
              options={(governorates ?? []).map((g) => ({ value: g.id, label: g.name_ar }))}
              value={governorateId}
              onChange={(e) => setGovernorateId(e.target.value)}
            />
            <p className="pb-3 text-sm font-semibold text-text-muted">
              {sorted.length} جامعة
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-3xl" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-20 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                <FaUniversity />
              </span>
              <h3 className="mt-5 text-xl font-extrabold">لا توجد جامعات مطابقة</h3>
              <p className="mt-2 text-sm text-text-muted">جرّب تغيير الفلاتر.</p>
            </div>
          ) : (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((uni, i) => (
                <UniversityCard key={uni.id} university={uni} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
