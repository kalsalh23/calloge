import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FaSearch, FaUniversity, FaGraduationCap, FaArrowLeft } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Skeleton } from '@/components/atoms/Skeleton'
import { MajorCard } from '@/components/molecules/MajorCard'
import { UniversityCard } from '@/components/molecules/UniversityCard'
import { useSearch } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useDocumentTitle } from '@/hooks/useSeo'

export default function SearchPage() {
  useDocumentTitle('البحث')
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debounced = useDebounce(query, 300)
  const { data, isLoading } = useSearch(debounced)

  const handleChange = (value: string) => {
    setQuery(value)
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

  return (
    <>
      <Seo title="البحث" description="ابحث عن التخصصات والجامعات والكليات في المنصة." />

      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-black sm:text-4xl">البحث الشامل</h1>
          <p className="mt-3 text-sm text-white/70">ابحث عن تخصص، جامعة، كلية أو مدينة.</p>
          <div className="glass-dark mx-auto mt-8 flex items-center gap-2 rounded-2xl p-2">
            <FaSearch className="mr-3 h-5 w-5 shrink-0 text-accent-gold" />
            <input
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="اكتب اسم التخصص أو الجامعة..."
              className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
              autoFocus
              aria-label="بحث"
            />
            {query && (
              <button onClick={() => handleChange('')} className="shrink-0 px-3 text-sm text-white/50 hover:text-white" aria-label="مسح البحث">
                مسح
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="container-app">
          {!debounced && (
            <div className="py-20 text-center text-text-muted">
              <FaSearch className="mx-auto h-12 w-12 text-text-muted/40" />
              <p className="mt-4 text-sm">ابدأ الكتابة لعرض النتائج.</p>
            </div>
          )}

          {debounced && isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-3xl" />
              ))}
            </div>
          )}

          {debounced && !isLoading && data && (
            <>
              {data.majors.length === 0 && data.universities.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-lg font-extrabold text-ink-dark">لا توجد نتائج مطابقة</p>
                  <p className="mt-2 text-sm text-text-muted">جرّب كلمات بحث أخرى.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {data.majors.length > 0 && (
                    <section>
                      <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold">
                        <FaGraduationCap className="text-accent-gold" />
                        التخصصات ({data.majors.length})
                      </h2>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {data.majors.map((major, i) => (
                          <MajorCard key={major.id} major={major} index={i} />
                        ))}
                      </div>
                    </section>
                  )}

                  {data.universities.length > 0 && (
                    <section>
                      <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold">
                        <FaUniversity className="text-accent-gold" />
                        الجامعات ({data.universities.length})
                      </h2>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {data.universities.map((uni, i) => (
                          <UniversityCard key={uni.id} university={uni} index={i} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          )}

          <div className="mt-16 text-center">
            <Link to="/discover" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-accent-dark-brown">
              <FaArrowLeft className="text-xs" />
              أو اكتشف تخصصك بمعدلك
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
