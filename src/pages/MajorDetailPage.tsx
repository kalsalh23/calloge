import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaClock,
  FaGraduationCap,
  FaBriefcase,
  FaMoneyBillWave,
  FaChartLine,
  FaUniversity,
  FaHeart,
  FaRegHeart,
  FaExternalLinkAlt,
  FaBook,
  FaTools,
  FaUsers,
  FaCheckCircle,
  FaArrowLeft,
} from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/atoms/Badge'
import { Skeleton } from '@/components/atoms/Skeleton'
import { SmartImage } from '@/components/atoms/SmartImage'
import { useMajor, useMajorScores } from '@/lib/api'
import { useFavorites } from '@/hooks/useFavorites'
import { useDocumentTitle } from '@/hooks/useSeo'
import { formatNumber } from '@/lib/utils'
import { useComparison } from '@/hooks/useComparison'
import type { AdmissionScore } from '@/types'

const difficultyLabels: Record<number, { label: string; tone: 'info' | 'warning' | 'danger' }> = {
  1: { label: 'سهل جداً', tone: 'info' },
  2: { label: 'سهل', tone: 'info' },
  3: { label: 'متوسط', tone: 'warning' },
  4: { label: 'صعب', tone: 'danger' },
  5: { label: 'صعب جداً', tone: 'danger' },
}

export default function MajorDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: major, isLoading } = useMajor(slug ?? '')
  const { data: scores } = useMajorScores(major?.id ?? null)
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const { saveComparison } = useComparison()
  useDocumentTitle(major?.name_ar)

  const university = major?.college?.university

  const groupedScores = useMemo(() => {
    if (!scores) return []
    const map = new Map<string, AdmissionScore[]>()
    for (const s of scores) {
      const key = `${s.year}-${s.university_id}-${s.admission_type}`
      const existing = map.get(key) ?? []
      existing.push(s)
      map.set(key, existing)
    }
    return [...map.values()].sort((a, b) => b[0].year - a[0].year).map((list) => list[0])
  }, [scores])

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="mt-6 h-8 w-1/2" />
            <SkeletonTextBlock />
          </div>
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!major) {
    return (
      <div className="container-app py-24 text-center">
        <h1 className="text-2xl font-black">التخصص غير موجود</h1>
        <Link to="/" className="btn-primary mt-6">العودة للرئيسية</Link>
      </div>
    )
  }

  const diffMeta = difficultyLabels[major.difficulty ?? 2] ?? difficultyLabels[2]
  const isFav = isFavorite('major', major.id)

  const toggleFav = () => {
    if (isFav) removeFavorite.mutate({ targetType: 'major', targetId: major.id })
    else addFavorite.mutate({ targetType: 'major', targetId: major.id })
  }

  const handleCompare = () => {
    saveComparison.mutate({ name: major.name_ar, majorIds: [major.id] })
  }

  const stats = [
    { icon: FaClock, label: 'مدة الدراسة', value: major.study_duration_years ? `${formatNumber(major.study_duration_years, 0)} سنوات` : '—' },
    { icon: FaGraduationCap, label: 'الدرجة العلمية', value: major.degree ?? 'بكالوريوس' },
    { icon: FaUniversity, label: 'الكلية', value: major.college?.name_ar ?? '—' },
    { icon: FaChartLine, label: 'صعوبة الدراسة', value: diffMeta.label },
  ]

  return (
    <>
      <Seo
        title={major.name_ar}
        description={major.summary ?? major.description?.slice(0, 160) ?? ''}
        image={major.cover_url ?? undefined}
        type="article"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-deep text-white">
        <div className="absolute inset-0">
          {major.cover_url ? (
            <img src={major.cover_url} alt="" className="h-full w-full object-cover opacity-30" loading="eager" />
          ) : (
            <div className="h-full w-full" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(185,167,121,0.4), transparent 50%)' }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/70 to-primary-deep/40" />
        </div>
        <div className="container-app relative py-16 sm:py-20">
          <nav className="mb-6 flex items-center gap-2 text-xs text-white/50" aria-label="مسار التنقل">
            <Link to="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link to="/universities" className="hover:text-white">الجامعات</Link>
            <span>/</span>
            <Link to={`/university/${university?.slug}`} className="hover:text-white">{university?.name_ar}</Link>
            <span>/</span>
            <span className="text-accent-gold">{major.name_ar}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="gold">{university?.name_ar}</Badge>
                <Badge tone={university?.type === 'government' ? 'primary' : 'gold'}>
                  {university?.type === 'government' ? 'حكومية' : 'خاصة'}
                </Badge>
                <Badge tone="neutral">{major.degree}</Badge>
              </div>
              <h1 className="text-3xl font-black sm:text-4xl">{major.name_ar}</h1>
              {major.name_en && <p className="mt-1 text-sm text-white/50">{major.name_en}</p>}
              {major.summary && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75">{major.summary}</p>}
            </div>

            <div className="flex shrink-0 gap-3">
              <Button variant="gold" onClick={handleCompare}>
                <FaUsers className="text-xs" />
                أضف للمقارنة
              </Button>
              <Button variant="ghostLight" onClick={toggleFav} aria-label="حفظ في المفضلة">
                {isFav ? <FaHeart className="text-accent-gold" /> : <FaRegHeart />}
                {isFav ? 'محفوظ' : 'احفظ'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-10 sm:py-14">
        <div className="container-app">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Main content */}
            <div className="space-y-10 lg:col-span-2">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl p-4 text-center"
                  >
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg text-primary">
                      <s.icon />
                    </span>
                    <p className="mt-3 text-[11px] font-medium text-text-muted">{s.label}</p>
                    <p className="mt-0.5 text-sm font-extrabold text-ink-dark">{s.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Description */}
              <section aria-labelledby="about-major">
                <h2 id="about-major" className="mb-4 text-xl font-extrabold">نبذة عن التخصص</h2>
                <div className="glass rounded-3xl p-6 leading-relaxed text-ink-muted">
                  {major.description ?? 'لا توجد وصف متوفر لهذا التخصص بعد.'}
                </div>
              </section>

              {/* Subjects */}
              {major.subjects && major.subjects.length > 0 && (
                <section aria-labelledby="subjects">
                  <h2 id="subjects" className="mb-4 flex items-center gap-2 text-xl font-extrabold">
                    <FaBook className="text-accent-gold" /> المواد الأساسية
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {major.subjects.map((subj) => (
                      <Badge key={subj} tone="primary" className="px-4 py-1.5 text-sm">{subj}</Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {major.skills && major.skills.length > 0 && (
                <section aria-labelledby="skills">
                  <h2 id="skills" className="mb-4 flex items-center gap-2 text-xl font-extrabold">
                    <FaTools className="text-accent-gold" /> المهارات المطلوبة
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {major.skills.map((skill) => (
                      <div key={skill} className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                        <FaCheckCircle className="shrink-0 text-emerald-500" />
                        <span className="text-sm font-semibold text-ink-dark">{skill}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Study nature */}
              {major.study_nature && (
                <section aria-labelledby="nature">
                  <h2 id="nature" className="mb-4 flex items-center gap-2 text-xl font-extrabold">
                    <FaUsers className="text-accent-gold" /> طبيعة الدراسة
                  </h2>
                  <div className="glass rounded-3xl p-6 text-sm leading-relaxed text-ink-muted">{major.study_nature}</div>
                </section>
              )}

              {/* Career opportunities */}
              {major.career_opportunities && major.career_opportunities.length > 0 && (
                <section aria-labelledby="careers">
                  <h2 id="careers" className="mb-4 flex items-center gap-2 text-xl font-extrabold">
                    <FaBriefcase className="text-accent-gold" /> فرص العمل
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {major.career_opportunities.map((job) => (
                      <div key={job} className="glass rounded-2xl px-4 py-3 text-sm font-semibold text-ink-dark">
                        {job}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Salary */}
              {(major.avg_salary || major.salary_min || major.salary_max) && (
                <section aria-labelledby="salary">
                  <h2 id="salary" className="mb-4 flex items-center gap-2 text-xl font-extrabold">
                    <FaMoneyBillWave className="text-accent-gold" /> متوسط الرواتب
                  </h2>
                  <div className="glass rounded-3xl p-6">
                    {major.avg_salary ? (
                      <p className="text-lg font-extrabold text-primary">{major.avg_salary}</p>
                    ) : (
                      <p className="text-lg font-extrabold text-primary">
                        {major.salary_min ? `${formatNumber(major.salary_min)}` : ''}
                        {major.salary_min && major.salary_max ? ' - ' : ''}
                        {major.salary_max ? formatNumber(major.salary_max) : ''} دولار أمريكي
                      </p>
                    )}
                    <p className="mt-2 text-xs text-text-muted">تقديري حسب سوق العمل، وقد يختلف حسب الخبرة والمؤسسة.</p>
                  </div>
                </section>
              )}

              {/* Postgraduate */}
              {major.postgraduate_opportunities !== null && (
                <section aria-labelledby="postgrad" className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-4">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${major.postgraduate_opportunities ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <FaGraduationCap className="text-xl" />
                    </span>
                    <div>
                      <h2 id="postgrad" className="font-extrabold">الدراسات العليا</h2>
                      <p className="mt-0.5 text-sm text-text-muted">
                        {major.postgraduate_opportunities
                          ? 'متاحة: يمكنك متابعة الماجستير والدكتوراه في هذا التخصص.'
                          : 'غير متاحة حالياً في هذا التخصص.'}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Video */}
              {major.video_url && (
                <section aria-labelledby="video">
                  <h2 id="video" className="mb-4 text-xl font-extrabold">فيديو تعريفي</h2>
                  <div className="overflow-hidden rounded-3xl">
                    <iframe
                      src={major.video_url}
                      title={`فيديو تعريفي عن ${major.name_ar}`}
                      className="aspect-video w-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Admission scores */}
              <div className="glass rounded-3xl p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
                  <FaChartLine className="text-accent-gold" /> الحدود الدنيا
                </h3>
                {groupedScores.length === 0 ? (
                  <p className="text-sm text-text-muted">لا توجد بيانات قبول منشورة لهذا التخصص بعد.</p>
                ) : (
                  <div className="space-y-3">
                    {groupedScores.slice(0, 5).map((s) => (
                      <div key={s.id} className="rounded-2xl bg-surface-alt p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-ink-dark">{s.university?.name_ar}</p>
                          <Badge tone="gold">مفاضلة {s.year}</Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-text-muted">الحد الأدنى</span>
                          <span className="text-lg font-black text-primary">{formatNumber(s.minimum_score, 2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Universities */}
              <div className="glass rounded-3xl p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
                  <FaUniversity className="text-accent-gold" /> الجامعة الموفرة للتخصص
                </h3>
                {university ? (
                  <Link to={`/university/${university.slug}`} className="group flex items-center gap-4 rounded-2xl bg-surface-alt p-4 transition-colors hover:bg-surface-border">
                    {university.logo_url ? (
                      <SmartImage src={university.logo_url} alt={university.name_ar} className="h-12 w-12 shrink-0 rounded-xl" fallback="rgb(var(--color-bg-alt))" />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FaUniversity />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-ink-dark">{university.name_ar}</p>
                      <p className="text-xs text-text-muted">{university.address ?? '—'}</p>
                    </div>
                    <FaArrowLeft className="mr-auto shrink-0 text-xs text-text-muted transition-transform group-hover:-translate-x-1" />
                  </Link>
                ) : (
                  <p className="text-sm text-text-muted">لا توجد جامعة مرتبطة.</p>
                )}
              </div>

              {/* Useful links */}
              <div className="glass rounded-3xl p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
                  <FaExternalLinkAlt className="text-accent-gold" /> روابط مفيدة
                </h3>
                <ul className="space-y-2 text-sm">
                  {university?.website && (
                    <li>
                      <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <FaExternalLinkAlt className="text-xs" /> الموقع الرسمي للجامعة
                      </a>
                    </li>
                  )}
                  <li>
                    <Link to="/discover" className="flex items-center gap-2 text-primary hover:underline">
                      <FaChartLine className="text-xs" /> تحقق من إمكانية قبولك
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Comparison CTA */}
              <div className="glass-gold rounded-3xl p-6">
                <h3 className="font-extrabold">قارن مع تخصصات أخرى</h3>
                <p className="mt-2 text-sm text-ink-muted">قارن هذا التخصص مع غيره لاختيار الأنسب لك.</p>
                <Link to={`/compare?m=${major.id}`} className="btn-primary mt-4 w-full">
                  ابدأ المقارنة
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

function SkeletonTextBlock() {
  return (
    <div className="mt-4 space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
