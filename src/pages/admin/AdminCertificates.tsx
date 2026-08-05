import { EntityManager } from '@/components/admin/EntityManager'
import { Input, Textarea } from '@/components/atoms/fields'
import { Badge } from '@/components/atoms/Badge'
import { useDocumentTitle } from '@/hooks/useSeo'
import type { Certificate } from '@/types'

export default function AdminCertificates() {
  useDocumentTitle('أنواع الشهادات')
  return (
    <EntityManager<Certificate>
      table="certificates"
      title="أنواع الشهادات"
      subtitle="إدارة الشهادات الثانوية والمهنية المسموح لها بالتقديم"
      searchKeys={['name_ar', 'slug']}
      defaultValues={() => ({ name_ar: '', name_en: '', slug: '', description: '', icon: '', sort_order: 0, is_active: true })}
      columns={[
        {
          key: 'name_ar',
          label: 'الاسم',
          render: (r) => <span className="font-bold text-ink-dark">{r.name_ar}</span>,
        },
        { key: 'slug', label: 'المعرف' },
        {
          key: 'is_active',
          label: 'الحالة',
          render: (r) => (r.is_active ? <Badge tone="success">مفعّل</Badge> : <Badge tone="danger">معطّل</Badge>),
        },
      ]}
      renderForm={({ values, set }) => (
        <>
          <Input label="الاسم بالعربية *" value={values.name_ar ?? ''} onChange={(e) => set({ name_ar: e.target.value })} />
          <Input label="الاسم بالإنجليزية" value={values.name_en ?? ''} onChange={(e) => set({ name_en: e.target.value })} />
          <Input label="المعرف (slug) *" value={values.slug ?? ''} onChange={(e) => set({ slug: e.target.value })} hint="يُستخدم في الروابط، مثال: general-damascus" />
          <Textarea label="الوصف" value={values.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
          <Input label="ترتيب العرض" type="number" value={values.sort_order ?? 0} onChange={(e) => set({ sort_order: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-dark">
            <input type="checkbox" checked={values.is_active ?? true} onChange={(e) => set({ is_active: e.target.checked })} className="h-4 w-4" />
            مفعّل
          </label>
        </>
      )}
    />
  )
}
