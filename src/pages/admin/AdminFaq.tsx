import { EntityManager } from '@/components/admin/EntityManager'
import { Input, Textarea } from '@/components/atoms/fields'
import { Badge } from '@/components/atoms/Badge'
import { useDocumentTitle } from '@/hooks/useSeo'
import type { Faq } from '@/types'

export default function AdminFaq() {
  useDocumentTitle('الأسئلة الشائعة')
  return (
    <EntityManager<Faq>
      table="faq"
      title="الأسئلة الشائعة"
      subtitle="إدارة أسئلة وأجوبة الأسئلة الشائعة"
      searchKeys={['question', 'category']}
      defaultValues={() => ({ question: '', answer: '', category: 'عام', sort_order: 0, is_active: true })}
      columns={[
        {
          key: 'question',
          label: 'السؤال',
          render: (r) => <span className="font-bold text-ink-dark">{r.question}</span>,
        },
        { key: 'category', label: 'التصنيف' },
        {
          key: 'is_active',
          label: 'الحالة',
          render: (r) => (r.is_active ? <Badge tone="success">مفعّل</Badge> : <Badge tone="danger">معطّل</Badge>),
        },
      ]}
      renderForm={({ values, set }) => (
        <>
          <Input label="السؤال *" value={values.question ?? ''} onChange={(e) => set({ question: e.target.value })} />
          <Textarea label="الجواب *" value={values.answer ?? ''} onChange={(e) => set({ answer: e.target.value })} />
          <Input label="التصنيف" value={values.category ?? 'عام'} onChange={(e) => set({ category: e.target.value })} />
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
