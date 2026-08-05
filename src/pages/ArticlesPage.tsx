import { Link } from 'react-router-dom'
import { FaBookOpen, FaArrowLeft, FaUserGraduate } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useArticles } from '@/lib/api'
import { useDocumentTitle } from '@/hooks/useSeo'
import { formatDate } from '@/lib/utils'

export default function ArticlesPage() {
  useDocumentTitle('المقالات')
  const { data: articles, isLoading } = useArticles()

  return (
    <>
      <Seo title="المقالات" description="مقالات تعليمية وإرشادية لطلاب الجامعات السورية." />

      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative text-center">
          <span className="glass-gold inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-accent-gold">
            <FaBookOpen className="h-3 w-3" />
            مقالات
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">مقالات تعليمية وإرشادية</h1>
          <p className="mt-3 text-sm text-white/70">محتوى مفيد لمساعدتك في رحلتك الجامعية.</p>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="container-app">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.slug}`}
                  className="glass group overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
                >
                  <div className="p-6">
                    <p className="text-xs font-semibold text-text-muted">{formatDate(article.published_at)}</p>
                    <h2 className="mt-2 text-lg font-extrabold leading-snug text-ink-dark group-hover:text-primary">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted">{article.excerpt}</p>
                    )}
                    <div className="mt-5 flex items-center gap-3 border-t border-surface-border pt-4">
                      {article.author?.full_name && (
                        <>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FaUserGraduate className="text-xs" />
                          </span>
                          <span className="text-xs font-bold text-ink-dark">{article.author.full_name}</span>
                        </>
                      )}
                      <span className="mr-auto inline-flex items-center gap-1 text-sm font-bold text-primary">
                        اقرأ <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-text-muted">لا توجد مقالات منشورة حالياً.</div>
          )}
        </div>
      </section>
    </>
  )
}
