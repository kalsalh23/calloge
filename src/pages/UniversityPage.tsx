import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaGlobe,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaBuilding,
  FaBed,
  FaMoneyBillWave,
  FaHeart,
  FaRegHeart,
  FaCalendarAlt,
} from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Badge } from '@/components/atoms/Badge'
import { Skeleton } from '@/components/atoms/Skeleton'
import { SmartImage } from '@/components/atoms/SmartImage'
import { MajorCard } from '@/components/molecules/MajorCard'
import { useUniversity, useUniversityMajors, useColleges } from '@/lib/api'
import { useFavorites } from '@/hooks/useFavorites'
import { useDocumentTitle } from '@/hooks/useSeo'

export default function UniversityPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: university, isLoading } = useUniversity(slug ?? '')
  const { data: majors, isLoading: loadingMajors } = useUniversityMajors(university?.id ?? null)
  const { data: colleges } = useColleges(university?.id ?? null)
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [activeTab, setActiveTab] = useState<'overview' | 'majors'>('overview')
  useDocumentTitle(university?.name_ar)

  const majorsByCollege = useMemo(() => {
    if (!majors) return []
    const map = new Map<number, typeof majors>()
    for (const m of majors) {
      const key = m.college_id
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return [...map.entries()]
  }, [majors])

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="mt-8 h-8 w-1/3" />
        <SkeletonTextBlock />
      </div>
    )
  }

  if (!university) {
    return (
      <div className="container-app py-24 text-center">
        <h1 className="text-2xl font-black">الجامعة غير موجودة</h1>
        <Link to="/universities" className="btn-primary mt-6">تصفح الجامعات</Link>
      </div>
    )
  }

  const isFav = isFavorite('university', university.id)
  const toggleFav = () => {
    if (isFav) removeFavorite.mutate({ targetType: 'university', targetId: university.id })
    else addFavorite.mutate({ targetType: 'university', targetId: university.id })
  }

  const socials = [
    { icon: FaFacebookF, href: university.facebook, label: 'فيسبوك' },
    { icon: FaInstagram, href: university.instagram, label: 'إنستغرام' },
    { icon: FaYoutube, href: university.youtube, label: 'يوتيوب' },
  ].filter((s): s is { icon: typeof FaFacebookF; href: string; label: string } => Boolean(s.href))

  return (
    <>
      <Seo
        title={university.name_ar}
        description={university.description?.slice(0, 160) ?? ''}
        image={university.cover_url ?? undefined}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-deep text-white">
        <div className="absolute inset-0">
          {university.cover_url ? (
            <img src={university.cover_url} alt="" className="h-full w-full object-cover opacity-30" loading="eager" />
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
            <span className="text-accent-gold">{university.name_ar}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {university.logo_url ? (
                <SmartImage
                  src={university.logo_url}
                  alt={`شعار ${university.name_ar}`}
                  className="h-24 w-24 shrink-0 rounded-3xl border-2 border-white/20 bg-white"
                  fallback="rgb(var(--color-bg-alt))"
                  imgClassName="object-contain p-2"
                />
              ) : (
                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-4xl">
                  <FaBuilding />
                </span>
              )}
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone={university.type === 'government' ? 'primary' : 'gold'}>
                    {university.type === 'government' ? 'حكومية' : 'خاصة'}
                  </Badge>
                  {university.founding_year && (
                    <Badge tone="neutral" className="bg-white/10 text-white border-white/20">
                      <FaCalendarAlt className="text-xs" /> تأسست {university.founding_year}
                    </Badge>
                  )}
                  {university.housing_available && (
                    <Badge tone="success" className="bg-white/10 text-white border-white/20">
                      <FaBed className="text-xs" /> سكن جامعي
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-black sm:text-4xl">{university.name_ar}</h1>
                {university.name_en && <p className="mt-1 text-sm text-white/50">{university.name_en}</p>}
                {university.address && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-white/70">
                    <FaMapMarkerAlt className="text-accent-gold" /> {university.address}
                  </p>
                )}
              </div>
            </div>

            <button onClick={toggleFav} className="btn-ghost-light shrink-0 self-start lg:self-auto">
              {isFav ? <FaHeart className="text-accent-gold" /> : <FaRegHeart />}
              {isFav ? 'محفوظة في المفضلة' : 'احفظ الجامعة'}
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-surface py-10 sm:py-14">
        <div className="container-app">
          <div className="mb-8 flex gap-2 border-b border-surface-border">
            {([
              { key: 'overview', label: 'نظرة عامة' },
              { key: 'majors', label: `التخصصات (${majors?.length ?? 0})` },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`-mb-px border-b-2 px-5 py-3 text-sm font-bold transition-colors ${
                  activeTab === tab.key
                    ? 'border-accent-gold text-primary'
                    : 'border-transparent text-text-muted hover:text-ink-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <section aria-labelledby="about-uni">
                  <h2 id="about-uni" className="mb-4 text-xl font-extrabold">نبذة عن الجامعة</h2>
                  <div className="glass rounded-3xl p-6 leading-relaxed text-ink-muted">
                    {university.description ?? 'لا توجد نبذة متوفرة لهذه الجامعة بعد.'}
                  </div>
                </section>

                <section aria-labelledby="colleges">
                  <h2 id="colleges" className="mb-4 text-xl font-extrabold">الكليات ({colleges?.length ?? 0})</h2>
                  {colleges && colleges.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {colleges.map((college) => (
                        <div key={college.id} className="glass flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-accent-gold/40">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl text-primary">
                            <FaBuilding />
                          </span>
                          <div>
                            <p className="font-extrabold text-ink-dark">{college.name_ar}</p>
                            <p className="text-xs text-text-muted">{college.name_en}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">لا توجد كليات مسجلة بعد.</p>
                  )}
                </section>

                {/* Tuition */}
                {university.tuition_notes && (
                  <section aria-labelledby="tuition" className="glass rounded-3xl p-6">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-gold/15 text-accent-dark-brown">
                        <FaMoneyBillWave className="text-xl" />
                      </span>
                      <div>
                        <h2 id="tuition" className="font-extrabold">الأقساط والرسوم</h2>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{university.tuition_notes}</p>
                      </div>
                    </div>
                  </section>
                )}

                {university.housing_available && (
                  <section aria-labelledby="housing" className="glass rounded-3xl p-6">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <FaBed className="text-xl" />
                      </span>
                      <div>
                        <h2 id="housing" className="font-extrabold">السكن الجامعي</h2>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                          تتوفر خدمة السكن الجامعي لهذه الجامعة. للاستفسار عن شروط التقديم، يرجى التواصل مع الجامعة مباشرة.
                        </p>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                <div className="glass rounded-3xl p-6">
                  <h3 className="mb-4 font-extrabold">معلومات التواصل</h3>
                  <ul className="space-y-3 text-sm">
                    {university.email && (
                      <li>
                        <a href={`mailto:${university.email}`} className="flex items-center gap-3 text-ink-muted hover:text-primary">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FaEnvelope /></span>
                          {university.email}
                        </a>
                      </li>
                    )}
                    {university.phone && (
                      <li className="flex items-center gap-3 text-ink-muted">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FaPhoneAlt /></span>
                        {university.phone}
                      </li>
                    )}
                    {university.website && (
                      <li>
                        <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-ink-muted hover:text-primary">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FaGlobe /></span>
                          الموقع الإلكتروني
                        </a>
                      </li>
                    )}
                  </ul>
                  {socials.length > 0 && (
                    <div className="mt-4 flex gap-2 border-t border-surface-border pt-4">
                      {socials.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                        >
                          <s.icon />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {university.address && (
                  <div className="glass rounded-3xl p-6">
                    <h3 className="mb-3 font-extrabold">الموقع</h3>
                    <p className="flex items-start gap-2 text-sm text-ink-muted">
                      <FaMapMarkerAlt className="mt-0.5 shrink-0 text-accent-gold" />
                      {university.address}
                    </p>
                  </div>
                )}

                <div className="glass-gold rounded-3xl p-6">
                  <h3 className="font-extrabold">هل تريد معرفة إمكانية قبولك؟</h3>
                  <p className="mt-2 text-sm text-ink-muted">أدخل معدلك واكتشف التخصصات المتاحة لك في هذه الجامعة.</p>
                  <Link to="/discover" className="btn-primary mt-4 w-full">اكتشف تخصصك</Link>
                </div>
              </aside>
            </div>
          )}

          {activeTab === 'majors' && (
            <div>
              {loadingMajors ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-3xl" />
                  ))}
                </div>
              ) : majors && majors.length > 0 ? (
                <div className="space-y-10">
                  {majorsByCollege.map(([collegeId, list]) => {
                    const collegeName = list[0]?.college?.name_ar ?? 'تخصصات'
                    return (
                      <section key={collegeId}>
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
                          <span className="h-2 w-2 rounded-full bg-accent-gold" />
                          {collegeName}
                        </h3>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {list.map((major, i) => (
                            <MajorCard key={major.id} major={major} index={i} />
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              ) : (
                <p className="py-16 text-center text-text-muted">لا توجد تخصصات مسجلة لهذه الجامعة بعد.</p>
              )}
            </div>
          )}
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
    </div>
  )
}
