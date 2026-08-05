import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FaHeart, FaUniversity, FaGraduationCap } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Skeleton } from '@/components/atoms/Skeleton'
import { MajorCard } from '@/components/molecules/MajorCard'
import { UniversityCard } from '@/components/molecules/UniversityCard'
import { useFavorites } from '@/hooks/useFavorites'
import { useMajors, useUniversities } from '@/lib/api'
import { useDocumentTitle } from '@/hooks/useSeo'

export default function FavoritesPage() {
  useDocumentTitle('المفضلة')
  const { favorites } = useFavorites()
  const { data: majors, isLoading: loadingMajors } = useMajors()
  const { data: universities, isLoading: loadingUniversities } = useUniversities()

  const favMajors = useMemo(() => {
    if (!favorites.data || !majors) return []
    return favorites.data
      .filter((f) => f.target_type === 'major')
      .map((f) => majors.find((m) => m.id === f.target_id))
      .filter(Boolean) as NonNullable<typeof majors>
  }, [favorites.data, majors])

  const favUniversities = useMemo(() => {
    if (!favorites.data || !universities) return []
    return favorites.data
      .filter((f) => f.target_type === 'university')
      .map((f) => universities.find((u) => u.id === f.target_id))
      .filter(Boolean) as NonNullable<typeof universities>
  }, [favorites.data, universities])

  const isEmpty = favorites.data?.length === 0

  return (
    <>
      <Seo title="المفضلة" description="التخصصات والجامعات التي قمت بحفظها." />

      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative text-center">
          <span className="glass-gold inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-accent-gold">
            <FaHeart className="h-3 w-3" />
            مفضلتك
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">التخصصات والجامعات المحفوظة</h1>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="container-app">
          {isEmpty && (
            <div className="mx-auto max-w-lg py-16 text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-4xl text-primary">
                <FaHeart />
              </span>
              <h3 className="mt-6 text-xl font-extrabold">مفضلتك فارغة</h3>
              <p className="mt-2 text-sm text-text-muted">
                اضغط على أيقونة القلب في بطاقات التخصصات والجامعات لحفظها هنا.
              </p>
              <Link to="/discover" className="btn-primary mt-6">اكتشف التخصصات</Link>
            </div>
          )}

          {!isEmpty && (loadingMajors || loadingUniversities) && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-3xl" />
              ))}
            </div>
          )}

          {favMajors.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold">
                <FaGraduationCap className="text-accent-gold" />
                التخصصات ({favMajors.length})
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favMajors.map((major, i) => (
                  <MajorCard key={major.id} major={major} index={i} />
                ))}
              </div>
            </section>
          )}

          {favUniversities.length > 0 && (
            <section>
              <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold">
                <FaUniversity className="text-accent-gold" />
                الجامعات ({favUniversities.length})
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favUniversities.map((uni, i) => (
                  <UniversityCard key={uni.id} university={uni} index={i} />
                ))}
              </div>
            </section>
          )}

          {!isEmpty && favMajors.length === 0 && favUniversities.length === 0 && (
            <div className="py-16 text-center text-text-muted">لا توجد عناصر محفوظة.</div>
          )}
        </div>
      </section>
    </>
  )
}
