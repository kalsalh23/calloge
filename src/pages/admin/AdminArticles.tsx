import { EntityManager } from '@/components/admin/EntityManager'
import { Input, Textarea } from '@/components/atoms/fields'
import { Badge } from '@/components/atoms/Badge'
import { useDocumentTitle } from '@/hooks/useSeo'
import { useAuth } from '@/providers/AuthProvider'
import type { Article } from '@/types'

export default function AdminArticles() {
  useDocumentTitle('المقالات')
  const { user } = useAuth()
  return (
    <EntityManager<Article>
      table="articles"
      title="المقالات"
      subtitle="إدارة المقالات التعليمية والإرشادية"
      searchKeys={['title', 'slug']}
      defaultValues={() => ({ title: '', slug: '', excerpt: '', content: '', cover_url: '', author_id: user?.id ?? null, tags: [], is_published: false, published_at: new Date().toISOString() })}
      columns={[
        {
          key: 'title',
          label: 'العنوان',
          render: (r) => <span className="font-bold text-ink-dark">{r.title}</span>,
        },
        { key: 'published_at', label: 'تاريخ النشر' },
        {
          key: 'is_published',
          label: 'الحالة',
          render: (r) => (r.is_published ? <Badge tone="success">منشور</Badge> : <Badge tone="neutral">مسودة</Badge>),
        },
      ]}
      renderForm={({ values, set }) => (
        <>
          <Input label="العنوان *" value={values.title ?? ''} onChange={(e) => set({ title: e.target.value })} />
          <Input label="المعرف (slug) *" value={values.slug ?? ''} onChange={(e) => set({ slug: e.target.value })} />
          <Textarea label="الملخص" value={values.excerpt ?? ''} onChange={(e) => set({ excerpt: e.target.value })} />
          <Textarea label="المحتوى" rows={8} value={values.content ?? ''} onChange={(e) => set({ content: e.target.value })} />
          <Input label="رابط الصورة" value={values.cover_url ?? ''} onChange={(e) => set({ cover_url: e.target.value })} />
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-dark">
            <input type="checkbox" checked={values.is_published ?? false} onChange={(e) => set({ is_published: e.target.checked, published_at: e.target.checked ? new Date().toISOString() : values.published_at })} className="h-4 w-4" />
            منشور
          </label>
        </>
      )}
    />
  )
}
