import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaCompass,
  FaGraduationCap,
  FaUniversity,
  FaChartLine,
  FaBalanceScale,
  FaShieldAlt,
  FaBolt,
  FaArrowLeft,
} from 'react-icons/fa'
import { FaMagnifyingGlass, FaPlus } from 'react-icons/fa6'
import { Seo } from '@/components/Seo'
import { Badge } from '@/components/atoms/Badge'
import { Skeleton } from '@/components/atoms/Skeleton'
import { SectionHeading } from '@/components/molecules/SectionHeading'
import { UniversityCard } from '@/components/molecules/UniversityCard'
import { MajorCard } from '@/components/molecules/MajorCard'
import { useUniversities, useMajors, useTestimonials, useFaqs, useStats } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useDocumentTitle } from '@/hooks/useSeo'

const steps = [
  {
    icon: FaGraduationCap,
    title: 'اختر نوع شهادتك',
    desc: 'حدد نوع الشهادة التي تحملها، من الثانوية العامة إلى الشهادات المهنية والتجارية.',
  },
  {
    icon: FaChartLine,
    title: 'أدخل معدلك',
    desc: 'أدخل معدلك وسنة التخرج واختر نوع الجامعة التي تفضلها.',
  },
  {
    icon: FaCompass,
    title: 'اكتشف تخصصك',
    desc: 'ستحصل على قائمة بالتخصصات والجامعات التي يحق لك التقديم إليها، مرتبة حسب فرصتك.',
  },
]

const features = [
  {
    icon: FaBolt,
    title: 'بحث فوري ذكي',
    desc: 'نتائج فورية مصنفة حسب فرصة القبول مع مقارنة معدلك بالحد الأدنى لكل تخصص.',
  },
  {
    icon: FaBalanceScale,
    title: 'مقارنة التخصصات',
    desc: 'قارن بين تخصصين أو أكثر بجدول شامل يغطي كل ما تحتاجه لاتخاذ قرارك.',
  },
  {
    icon: FaUniversity,
    title: 'ملفات جامعية شاملة',
    desc: 'معلومات كاملة عن الجامعات: الكليات، السكن، الأقساط، وسائل التواصل وأكثر.',
  },
  {
    icon: FaShieldAlt,
    title: 'بيانات رسمية موثوقة',
    desc: 'نعتمد على معدلات المفاضلات الرسمية المنشورة بشكل سنوي من المصادر الموثوقة.',
  },
]

export default function HomePage() {
  useDocumentTitle()
  const [q, setQ] = useState('')
  const debounced = useDebounce(q, 250)
  const { data: universities, isLoading: loadingUnis } = useUniversities()
  const { data: majors, isLoading: loadingMajors } = useMajors()
  const { data: testimonials } = useTestimonials()
  const { data: faqs } = useFaqs()
  const { data: stats } = useStats()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const popularUniversities = useMemo(() => (universities ?? []).slice(0, 4), [universities])
  const popularMajors = useMemo(() => (majors ?? []).slice(0, 4), [majors])
  const visibleFaqs = useMemo(() => (faqs ?? []).slice(0, 6), [faqs])

  return (
    <>
      <Seo />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-primary-deep text-white">
        <div className="absolute inset-0 opacity-25" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(185,167,121,0.5), transparent 40%), radial-gradient(circle at 10% 80%, rgba(5,66,57,0.8), transparent 50%)' }} />
        <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-primary-light/20 blur-3xl" />

        <div className="container-app relative py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-accent-gold"
            >
              <FaGraduationCap />
              مفاضلات {new Date().getFullYear()} الرسمية متوفرة الآن
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl"
            >
              اكتشف مستقبلك الجامعي
              <span className="text-gradient-gold block">بذكاء وبثقة</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
            >
              أدخل نوع شهادتك ومعدلك، وسنعرض لك التخصصات والجامعات التي يحق لك التقديم إليها وفق
              بيانات المفاضلات الرسمية — مرتبة من أعلى فرصة قبول إلى أدناها.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-dark mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-2xl p-2"
            >
              <FaMagnifyingGlass className="mr-3 h-5 w-5 shrink-0 text-accent-gold" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن تخصص أو جامعة..."
                className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
                aria-label="البحث عن تخصص أو جامعة"
              />
              <Link to={debounced ? `/search?q=${encodeURIComponent(debounced)}` : '/search'} className="btn-gold shrink-0">
                <FaMagnifyingGlass className="text-xs" />
                بحث
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link to="/discover" className="btn-gold w-full sm:w-auto" style={{ paddingInline: '2rem', paddingBlock: '0.9rem' }}>
                <FaPlus className="text-xs" />
                ابدأ الآن — اكتشف تخصصك
              </Link>
              <Link to="/universities" className="btn-ghost-light w-full sm:w-auto" style={{ paddingInline: '2rem', paddingBlock: '0.9rem' }}>
                <FaUniversity />
                تصفح الجامعات
              </Link>
            </motion.div>

            {stats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4"
              >
                {[
                  { value: stats.universities, label: 'جامعة' },
                  { value: stats.majors, label: 'تخصص' },
                  { value: stats.scores, label: 'بيان قبول' },
                ].map((s) => (
                  <div key={s.label} className="glass-dark rounded-2xl px-4 py-4 text-center">
                    <p className="text-2xl font-black text-accent-gold">{s.value}</p>
                    <p className="mt-1 text-xs font-medium text-white/60">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        <svg className="block w-full text-white" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,37.3C1200,43,1320,53,1380,58.7L1440,64L1440,60L0,60Z" />
        </svg>
      </section>

      {/* ===================== STEPS ===================== */}
      <section className="section bg-surface">
        <div className="container-app">
          <SectionHeading
            eyebrow="كيف تعمل المنصة"
            title="ثلاث خطوات تفصلك عن مستقبلك"
            subtitle="صممنا تجربة بسيطة وسريعة تساعدك على اكتشاف كل ما تحتاجه في دقائق."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass relative rounded-3xl p-8 text-center"
              >
                <div className="absolute -top-4 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-accent-gold text-sm font-black text-primary-deep">
                  {i + 1}
                </div>
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                  <step.icon />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== POPULAR UNIVERSITIES ===================== */}
      <section className="section bg-surface-alt">
        <div className="container-app">
          <SectionHeading
            eyebrow="أشهر الجامعات"
            title="جامعات سوريا في مكان واحد"
            subtitle="تعرف على الجامعات الحكومية والخاصة في سوريا، وكلياتها، وشروط القبول فيها."
          />
          {loadingUnis ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularUniversities.map((uni, i) => (
                <UniversityCard key={uni.id} university={uni} index={i} />
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link to="/universities" className="btn-ghost">
              عرض جميع الجامعات
              <FaArrowLeft className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== POPULAR MAJORS ===================== */}
      <section className="section bg-surface">
        <div className="container-app">
          <SectionHeading
            eyebrow="أشهر التخصصات"
            title="أهم التخصصات الجامعية"
            subtitle="تعرّف على أبرز التخصصات المطلوبة في سوق العمل السوري والإقليمي."
          />
          {loadingMajors ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularMajors.map((major, i) => (
                <MajorCard key={major.id} major={major} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="section relative overflow-hidden bg-primary-dark text-white">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(185,167,121,0.6), transparent 40%)' }} />
        <div className="container-app relative">
          <SectionHeading
            eyebrow="لماذا حلمك الجامعي؟"
            title="مزايا تجعل اختيارك أسهل"
            subtitle="كل الأدوات التي تحتاجها لاتخاذ قرار مصيري بثقة تامة."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-dark rounded-3xl p-7"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gold/20 text-xl text-accent-gold">
                  <f.icon />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      {testimonials && testimonials.length > 0 && (
        <section className="section bg-surface-alt">
          <div className="container-app">
            <SectionHeading
              eyebrow="آراء الطلاب"
              title="طلاب وجدوا طريقهم معنا"
              subtitle="قصص نجاح من طلاب استخدموا المنصة لاختيار تخصصهم الجامعي."
            />
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass rounded-3xl p-7"
                >
                  <div className="flex items-center gap-1 text-accent-gold" aria-label={`تقييم ${t.rating} من 5`}>
                    {Array.from({ length: t.rating ?? 5 }).map((_, s) => (
                      <FaGraduationCap key={s} className="h-3 w-3" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-dark">"{t.quote}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {t.student_name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink-dark">{t.student_name}</p>
                      <p className="text-xs text-text-muted">
                        {t.major} — {t.university}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== FAQ ===================== */}
      {visibleFaqs.length > 0 && (
        <section className="section bg-surface">
          <div className="container-app max-w-3xl">
            <SectionHeading
              eyebrow="الأسئلة الشائعة"
              title="إجابات عن أكثر الأسئلة تكراراً"
            />
            <div className="space-y-3">
              {visibleFaqs.map((item) => (
                <div key={item.id} className="glass overflow-hidden rounded-2xl">
                  <button
                    onClick={() => setOpenFaq((v) => (v === item.id ? null : item.id))}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-start"
                    aria-expanded={openFaq === item.id}
                  >
                    <span className="font-bold text-ink-dark">{item.question}</span>
                    <span className={`shrink-0 text-primary transition-transform ${openFaq === item.id ? 'rotate-45' : ''}`}>
                      <FaPlus className="h-4 w-4" />
                    </span>
                  </button>
                  {openFaq === item.id && (
                    <div className="px-6 pb-5 text-sm leading-relaxed text-text-muted">{item.answer}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/faq" className="btn-ghost">
                عرض جميع الأسئلة
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================== CTA ===================== */}
      <section className="section bg-surface-alt">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary via-primary-dark to-primary-deep px-8 py-16 text-center text-white">
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 10%, rgba(185,167,121,0.7), transparent 45%)' }} />
            <h2 className="relative text-3xl font-black sm:text-4xl">مستقبلك يبدأ بقرار اليوم</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/70">
              لا تترك اختيار مصيرك للصدفة. استخدم بيانات المفاضلات الرسمية واتخذ قرارك بثقة.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/discover" className="btn-gold w-full sm:w-auto" style={{ paddingInline: '2.5rem', paddingBlock: '0.95rem' }}>
                ابدأ رحلتك الآن
              </Link>
              <Link to="/compare" className="btn-ghost-light w-full sm:w-auto" style={{ paddingInline: '2.5rem', paddingBlock: '0.95rem' }}>
                <Badge tone="gold" className="border-transparent bg-transparent p-0 text-white">
                  قارن التخصصات
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
