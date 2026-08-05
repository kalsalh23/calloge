import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaBalanceScale, FaTrashAlt, FaArrowLeft } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/atoms/Button'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useMajors } from '@/lib/api'
import { useComparison } from '@/hooks/useComparison'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/providers/ToastProvider'
import { formatNumber } from '@/lib/utils'
import { useDocumentTitle } from '@/hooks/useSeo'
import type { MajorWithUniversity } from '@/types'

const rows: { key: string; label: string; render: (m: MajorWithUniversity) => string }[] = [
  { key: 'university', label: 'الجامعة', render: (m) => m.college?.university?.name_ar ?? '—' },
  { key: 'college', label: 'الكلية', render: (m) => m.college?.name_ar ?? '—' },
  { key: 'years', label: 'سنوات الدراسة', render: (m) => (m.study_duration_years ? `${formatNumber(m.study_duration_years, 0)}` : '—') },
  { key: 'degree', label: 'الدرجة العلمية', render: (m) => m.degree ?? '—' },
  { key: 'difficulty', label: 'صعوبة الدراسة', render: (m) => difficultyLabel(m.difficulty) },
  { key: 'salary', label: 'الرواتب', render: (m) => m.avg_salary ?? (m.salary_min || m.salary_max ? `${m.salary_min ?? ''}-${m.salary_max ?? ''}` : '—') },
  { key: 'skills', label: 'المهارات المطلوبة', render: (m) => (m.skills && m.skills.length > 0 ? m.skills.slice(0, 3).join('، ') : '—') },
  { key: 'career', label: 'فرص العمل', render: (m) => (m.career_opportunities && m.career_opportunities.length > 0 ? `${m.career_opportunities.length} فرصة` : '—') },
  { key: 'postgrad', label: 'دراسات عليا', render: (m) => (m.postgraduate_opportunities ? 'متاحة' : 'غير متاحة') },
]

function difficultyLabel(d: number | null): string {
  const map: Record<number, string> = { 1: 'سهل جداً', 2: 'سهل', 3: 'متوسط', 4: 'صعب', 5: 'صعب جداً' }
  return d ? map[d] ?? '—' : '—'
}

export default function ComparePage() {
  useDocumentTitle('مقارنة التخصصات')
  const [searchParams] = useSearchParams()
  const { data: majors, isLoading } = useMajors()
  const { user } = useAuth()
  const { saveComparison, deleteComparison, comparisons } = useComparison()
  const { toast } = useToast()

  const [selected, setSelected] = useState<number[]>(() => {
    const fromUrl = searchParams.get('m')
    return fromUrl ? [Number(fromUrl)] : []
  })

  const selectedMajors = useMemo(() => {
    if (!majors) return []
    return selected
      .map((id) => majors.find((m) => m.id === id))
      .filter((m): m is MajorWithUniversity => Boolean(m))
  }, [majors, selected])

  const toggle = (id: number) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 4) {
        toast('يمكنك مقارنة حتى 4 تخصصات', 'warning')
        return prev
      }
      return [...prev, id]
    })
  }

  const handleSave = () => {
    if (!user) {
      toast('يجب تسجيل الدخول لحفظ المقارنة', 'warning')
      return
    }
    saveComparison.mutate({ name: 'مقارنة جديدة', majorIds: selected })
    toast('تم حفظ المقارنة', 'success')
  }

  return (
    <>
      <Seo
        title="مقارنة التخصصات"
        description="قارن بين التخصصات الجامعية المختلفة بشكل شامل: سنوات الدراسة، الصعوبة، فرص العمل، الرواتب وأكثر."
      />

      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative text-center">
          <span className="glass-gold inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-accent-gold">
            <FaBalanceScale className="h-3 w-3" />
            أداة المقارنة
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">قارن التخصصات بذكاء</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
            اختر حتى 4 تخصصات وقارن بينها في جدول واحد شامل.
          </p>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="container-app">
          {/* Selector */}
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-extrabold">اختر التخصصات للمقارنة</h2>
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(majors ?? []).slice(0, 40).map((major) => {
                  const active = selected.includes(major.id)
                  return (
                    <button
                      key={major.id}
                      onClick={() => toggle(major.id)}
                      className={`flex items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-start transition-all ${
                        active
                          ? 'border-accent-gold bg-accent-gold/10'
                          : 'border-surface-border hover:border-primary/30'
                      }`}
                    >
                      <span className="text-sm font-bold text-ink-dark">{major.name_ar}</span>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${active ? 'bg-accent-gold text-primary-deep' : 'bg-surface-alt text-text-muted'}`}>
                        {active ? '✓' : '+'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Comparison table */}
          {selectedMajors.length >= 2 ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-surface-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="bg-primary-dark text-white">
                      <th className="px-5 py-4 text-start font-bold">المعيار</th>
                      {selectedMajors.map((m) => (
                        <th key={m.id} className="px-5 py-4 text-center font-bold">
                          {m.name_ar}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={row.key} className={ri % 2 === 0 ? 'bg-surface' : 'bg-surface-alt'}>
                        <td className="px-5 py-3.5 font-bold text-ink-dark">{row.label}</td>
                        {selectedMajors.map((m) => (
                          <td key={m.id} className="px-5 py-3.5 text-center text-ink-muted">
                            {row.render(m)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-surface">
                      <td className="px-5 py-4 font-bold text-ink-dark">التفاصيل</td>
                      {selectedMajors.map((m) => (
                        <td key={m.id} className="px-5 py-4 text-center">
                          <a
                            href={`/major/${m.slug}`}
                            className="inline-flex items-center gap-1 font-bold text-primary hover:text-accent-dark-brown"
                          >
                            صفحة التخصص <FaArrowLeft className="text-xs" />
                          </a>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="py-16 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                <FaBalanceScale />
              </span>
              <h3 className="mt-5 text-xl font-extrabold">اختر تخصصين على الأقل</h3>
              <p className="mt-2 text-sm text-text-muted">اختر تخصصين أو أكثر لعرض جدول المقارنة.</p>
            </div>
          )}

          {/* Actions */}
          {selectedMajors.length >= 2 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="gold" onClick={handleSave}>
                حفظ المقارنة
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelected([])}
              >
                <FaTrashAlt className="text-xs" />
                مسح الكل
              </Button>
            </div>
          )}

          {/* Saved comparisons */}
          {user && comparisons.data && comparisons.data.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-4 text-lg font-extrabold">مقارناتك المحفوظة</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {comparisons.data.map((c) => (
                  <div key={c.id} className="glass flex items-center justify-between rounded-2xl p-4">
                    <div>
                      <p className="font-bold text-ink-dark">{c.name}</p>
                      <p className="text-xs text-text-muted">{c.major_ids.length} تخصص</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected(c.major_ids)}
                      >
                        استعادة
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteComparison.mutate(c.id)}
                        aria-label="حذف المقارنة"
                      >
                        <FaTrashAlt className="text-xs" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
