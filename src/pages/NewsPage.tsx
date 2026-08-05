import { Link } from 'react-router-dom'
import { FaNewspaper, FaArrowLeft } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Skeleton } from '@/components/atoms/Skeleton'
import { SmartImage } from '@/components/atoms/SmartImage'
import { useNews } from '@/lib/api'
import { useDocumentTitle } from '@/hooks/useSeo'
import { formatDate } from '@/lib/utils'

export default function NewsPage() {
  useDocumentTitle('الأخبار')
  const { data: news, isLoading } = useNews()

  return (
    <>
      <Seo title="الأخبار" description="آخر الأخبار المتعلقة بالجامعات السورية والمفاضلات." />

      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative text-center">
          <span className="glass-gold inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-accent-gold">
            <FaNewspaper className="h-3 w-3" />
            أخبار المنصة
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">الأخبار</h1>
          <p className="mt-3 text-sm text-white/70">آخر المستجدات حول الجامعات السورية والمفاضلات.</p>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="container-app">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-3xl" />
              ))}
            </div>
          ) : news && news.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.slug}`}
                  className="glass group overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
                >
                  <SmartImage
                    src={item.cover_url}
                    alt={item.title}
                    className="h-44 w-full"
                    fallback="linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary-deep)) 100%)"
                  />
                  <div className="p-5">
                    <p className="text-xs font-semibold text-text-muted">{formatDate(item.published_at)}</p>
                    <h2 className="mt-2 text-lg font-extrabold leading-snug text-ink-dark group-hover:text-primary">
                      {item.title}
                    </h2>
                    {item.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">{item.excerpt}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                      اقرأ المزيد <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-text-muted">لا توجد أخبار منشورة حالياً.</div>
          )}
        </div>
      </section>
    </>
  )
}
