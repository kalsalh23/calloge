import { EntityManager } from '@/components/admin/EntityManager'
import { Input, Textarea } from '@/components/atoms/fields'
import { Badge } from '@/components/atoms/Badge'
import { useDocumentTitle } from '@/hooks/useSeo'
import type { Testimonial } from '@/types'

export default function AdminTestimonials() {
  useDocumentTitle('آراء الطلاب')
  return (
    <EntityManager<Testimonial>
      table="testimonials"
      title="آراء الطلاب"
      subtitle="إدارة شهادات الطلاب المعروضة في الصفحة الرئيسية"
      searchKeys={['student_name', 'university']}
      defaultValues={() => ({ student_name: '', university: '', major: '', quote: '', avatar_url: '', rating: 5, is_active: true })}
      columns={[
        {
          key: 'student_name',
          label: 'الطالب',
          render: (r) => <span className="font-bold text-ink-dark">{r.student_name}</span>,
        },
        { key: 'university', label: 'الجامعة' },
        { key: 'rating', label: 'التقييم' },
        {
          key: 'is_active',
          label: 'الحالة',
          render: (r) => (r.is_active ? <Badge tone="success">مفعّل</Badge> : <Badge tone="danger">معطّل</Badge>),
        },
      ]}
      renderForm={({ values, set }) => (
        <>
          <Input label="اسم الطالب *" value={values.student_name ?? ''} onChange={(e) => set({ student_name: e.target.value })} />
          <Input label="الجامعة" value={values.university ?? ''} onChange={(e) => set({ university: e.target.value })} />
          <Input label="التخصص" value={values.major ?? ''} onChange={(e) => set({ major: e.target.value })} />
          <Textarea label="الاقتباس *" value={values.quote ?? ''} onChange={(e) => set({ quote: e.target.value })} />
          <Input label="التقييم (1-5)" type="number" min={1} max={5} value={values.rating ?? 5} onChange={(e) => set({ rating: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-dark">
            <input type="checkbox" checked={values.is_active ?? true} onChange={(e) => set({ is_active: e.target.checked })} className="h-4 w-4" />
            مفعّل
          </label>
        </>
      )}
    />
  )
}
