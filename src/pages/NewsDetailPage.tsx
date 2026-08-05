import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Seo } from '@/components/Seo'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useDocumentTitle } from '@/hooks/useSeo'
import { formatDate } from '@/lib/utils'

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: item, isLoading } = useQuery({
    queryKey: ['news-detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('news').select('*').eq('slug', slug!).eq('is_published', true).single()
      if (error) throw error
      return data
    },
    enabled: !!slug,
  })
  useDocumentTitle(item?.title)

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="mt-8 h-8 w-1/2" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container-app py-24 text-center">
        <h1 className="text-2xl font-black">الخبر غير موجود</h1>
        <Link to="/news" className="btn-primary mt-6">العودة للأخبار</Link>
      </div>
    )
  }

  return (
    <>
      <Seo title={item.title} description={item.excerpt ?? ''} image={item.cover_url ?? undefined} type="article" />
      <article className="container-app max-w-3xl py-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <span>/</span>
          <Link to="/news" className="hover:text-primary">الأخبار</Link>
          <span>/</span>
          <span className="text-ink-dark">{item.title}</span>
        </nav>

        {item.cover_url && (
          <img src={item.cover_url} alt={item.title} className="mb-8 aspect-video w-full rounded-3xl object-cover" loading="lazy" />
        )}

        <p className="text-sm font-semibold text-text-muted">{formatDate(item.published_at)}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink-dark sm:text-4xl">{item.title}</h1>
        {item.excerpt && <p className="mt-4 text-lg leading-relaxed text-ink-muted">{item.excerpt}</p>}

        <div className="mt-8 whitespace-pre-line text-base leading-loose text-ink-dark">
          {item.content}
        </div>

        <div className="mt-12 border-t border-surface-border pt-6">
          <Link to="/news" className="text-sm font-bold text-primary hover:text-accent-dark-brown">
            ← جميع الأخبار
          </Link>
        </div>
      </article>
    </>
  )
}
