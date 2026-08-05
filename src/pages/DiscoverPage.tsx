import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGraduationCap, FaUniversity, FaFilter, FaChartLine } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/atoms/Button'
import { Input, Select } from '@/components/atoms/fields'
import { Skeleton } from '@/components/atoms/Skeleton'
import { MajorCard } from '@/components/molecules/MajorCard'
import { useCertificates, useGovernorates, useAdmissionYears, useDiscoverScores } from '@/lib/api'
import { useFavorites } from '@/hooks/useFavorites'
import type { AdmissionType, ScoreWithRelations, UniversityType } from '@/types'

interface DiscoverForm {
  certificateId: number
  score: number
  year: number
  governorateId: number | null
  universityType: UniversityType | 'all'
  admissionType: AdmissionType | 'all'
}

export default function DiscoverPage() {
  const { data: certificates } = useCertificates()
  const { data: governorates } = useGovernorates()
  const { data: years } = useAdmissionYears()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()

  const [applied, setApplied] = useState(false)
  const [params, setParams] = useState<{
    certificateId: number
    year: number
    universityType: string
    governorateId: number | null
  } | null>(null)

  const defaultYear = useMemo(() => {
    if (years && years.length > 0) return years[0]
    return new Date().getFullYear()
  }, [years])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DiscoverForm>({
    defaultValues: {
      certificateId: 1,
      score: 1900,
      year: defaultYear,
      governorateId: null,
      universityType: 'all',
      admissionType: 'all',
    },
  })

  const watchCertificate = watch('certificateId')
  const watchAdmissionType = watch('admissionType')

  const { data: allScores, isLoading } = useDiscoverScores({
    certificateId: params?.certificateId ?? 0,
    year: params?.year ?? defaultYear,
    universityType: params?.universityType ?? 'all',
    governorateId: params?.governorateId ?? null,
    enabled: applied && !!params,
  })

  const onSubmit = handleSubmit((values) => {
    setApplied(true)
    setParams({
      certificateId: Number(values.certificateId),
      year: Number(values.year),
      universityType: values.universityType,
      governorateId: values.governorateId ? Number(values.governorateId) : null,
    })
  })

  const score = watch('score')

  const results = useMemo(() => {
    if (!allScores || !score) return { eligible: [], near: [], ineligible: [] }
    const filtered =
      watchAdmissionType === 'all'
        ? allScores
        : allScores.filter((s) => s.admission_type === watchAdmissionType)
    const eligible: ScoreWithRelations[] = []
    const near: ScoreWithRelations[] = []
    const ineligible: ScoreWithRelations[] = []
    for (const s of filtered) {
      const diff = Number(score) - s.minimum_score
      if (diff >= 0) eligible.push(s)
      else if (diff >= -5) near.push(s)
      else ineligible.push(s)
    }
    eligible.sort((a, b) => Number(score) - a.minimum_score - (Number(score) - b.minimum_score))
    near.sort((a, b) => a.minimum_score - b.minimum_score)
    ineligible.sort((a, b) => a.minimum_score - b.minimum_score)
    return { eligible, near, ineligible }
  }, [allScores, score, watchAdmissionType])

  const toggleFavorite = (type: 'major' | 'university', id: number) => {
    if (isFavorite(type, id)) removeFavorite.mutate({ targetType: type, targetId: id })
    else addFavorite.mutate({ targetType: type, targetId: id })
  }

  const renderGrid = (items: ScoreWithRelations[]) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <MajorCard
          key={item.id}
          major={item.major}
          studentScore={Number(score)}
          minimumScore={item.minimum_score}
          isFavorite={isFavorite('major', item.major.id)}
          onToggleFavorite={() => toggleFavorite('major', item.major.id)}
          index={i}
        />
      ))}
    </div>
  )

  return (
    <>
      <Seo
        title="اكتشف تخصصك"
        description="أدخل نوع شهادتك ومجموع علاماتك لاكتشاف التخصصات والجامعات التي يحق لك التقديم إليها وفق بيانات المفاضلات الرسمية."
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-primary-dark text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative py-14 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="glass-gold inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-accent-gold">
              <FaGraduationCap className="h-3 w-3" />
              أداة الاستكشاف الذكية
            </span>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">اعثر على تخصصك الجامعي</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
              أدخل بياناتك واحصل على قائمة مخصصة بالتخصصات والجامعات المتاحة لك، مرتبة حسب فرصة القبول.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-surface py-10 sm:py-14">
        <div className="container-app">
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mx-auto max-w-3xl rounded-3xl p-6 sm:p-10"
            noValidate
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className="input-label">نوع الشهادة *</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(certificates ?? []).map((cert) => (
                    <label
                      key={cert.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all ${
                        Number(watchCertificate) === cert.id
                          ? 'border-accent-gold bg-accent-gold/10'
                          : 'border-surface-border hover:border-primary/30'
                      }`}
                    >
                      <input
                        type="radio"
                        value={cert.id}
                        {...register('certificateId', { required: 'اختر نوع الشهادة' })}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          Number(watchCertificate) === cert.id ? 'bg-accent-gold text-primary-deep' : 'bg-surface-alt text-text-muted'
                        }`}
                      >
                        <FaGraduationCap className="text-sm" />
                      </span>
                      <span className="text-sm font-semibold text-ink-dark">{cert.name_ar}</span>
                    </label>
                  ))}
                </div>
                {errors.certificateId && (
                  <p className="mt-1.5 text-xs font-medium text-accent-burgundy">{errors.certificateId.message}</p>
                )}
              </div>

              <Input
                label="مجموع علاماتك"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="مثال: 1800"
                error={errors.score?.message}
                {...register('score', {
                  required: 'أدخل مجموع علاماتك',
                  min: { value: 0, message: 'المجموع يجب أن يكون 0 فأكثر' },
                  max: { value: 2200, message: 'المجموع يتجاوز الحد الأقصى (2200)' },
                })}
              />

              <Select
                label="سنة المفاضلة"
                options={(years ?? [defaultYear]).map((y) => ({ value: y, label: `مفاضلة ${y}` }))}
                {...register('year')}
              />

              <Select
                label="المحافظة (اختياري)"
                placeholder="كل المحافظات"
                options={(governorates ?? []).map((g) => ({ value: g.id, label: g.name_ar }))}
                {...register('governorateId')}
              />

              <div className="space-y-1.5">
                <span className="input-label">نوع الجامعة</span>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'all', label: 'الجميع' },
                    { value: 'government', label: 'حكومية' },
                    { value: 'private', label: 'خاصة' },
                  ] as const).map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center justify-center rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                        watch('universityType') === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-surface-border text-text-muted hover:border-primary/30'
                      }`}
                    >
                      <input type="radio" value={opt.value} {...register('universityType')} className="sr-only" />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <Select
                label="نظام القبول"
                placeholder="الجميع"
                options={[
                  { value: 'general', label: 'مفاضلة عامة' },
                  { value: 'parallel', label: 'موازي' },
                  { value: 'private', label: 'خاص' },
                  { value: 'wafi', label: 'وافٍ' },
                ]}
                {...register('admissionType')}
              />
            </div>

            <Button type="submit" size="lg" fullWidth className="mt-8">
              <FaFilter className="text-xs" />
              اعرض التخصصات
            </Button>
          </motion.form>
        </div>
      </section>

      {/* Results */}
      <section className="bg-surface-alt pb-16 pt-4">
        <div className="container-app">
          {applied && isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-3xl" />
              ))}
            </div>
          )}

          {applied && !isLoading && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-ink-dark">نتائج بحثك</h2>
                    <p className="mt-1 text-sm text-text-muted">
                      {results.eligible.length} تخصص يحق لك التقديم إليه
                      {results.near.length > 0 && ` — ${results.near.length} قريب من الحد`}
                      {results.ineligible.length > 0 && ` — ${results.ineligible.length} غير متاح`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                    <FaChartLine className="text-accent-gold" />
                    مجموعك: <span className="font-black text-ink-dark">{Number(score).toFixed(2)}</span>
                  </div>
                </div>

                {results.eligible.length === 0 && results.near.length === 0 && (
                  <div className="glass mx-auto max-w-lg rounded-3xl p-10 text-center">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-burgundy/10 text-3xl text-accent-burgundy">
                      <FaUniversity />
                    </span>
                    <h3 className="mt-5 text-xl font-extrabold text-ink-dark">لا توجد نتائج مطابقة</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      لم نجد تخصصات تناسب معدلك لهذه الشهادة في هذه السنة. جرّب تغيير نوع الجامعة أو
                      الاطلاع على مفاضلات أخرى.
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-6"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      تعديل البحث
                    </Button>
                  </div>
                )}

                {results.eligible.length > 0 && (
                  <>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-emerald-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      التخصصات المتاحة لك ({results.eligible.length})
                    </h3>
                    {renderGrid(results.eligible)}
                  </>
                )}

                {results.near.length > 0 && (
                  <>
                    <h3 className="mb-4 mt-12 flex items-center gap-2 text-lg font-extrabold text-amber-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      قريبة من الحد الأدنى ({results.near.length})
                    </h3>
                    {renderGrid(results.near)}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {!applied && (
            <div className="mx-auto max-w-lg py-16 text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-4xl text-primary">
                <FaGraduationCap />
              </span>
              <h3 className="mt-6 text-xl font-extrabold text-ink-dark">املأ النموذج أعلاه</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                ستعرض نتائجك هنا بعد إدخال بياناتك والضغط على "اعرض التخصصات".
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
