import { useState } from 'react'
import { useToast } from '@/providers/ToastProvider'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/admin/Modal'
import { Input, Textarea, Select } from '@/components/atoms/fields'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useAdminData } from '@/hooks/useAdminData'
import { useColleges } from '@/lib/api'
import { useDocumentTitle } from '@/hooks/useSeo'
import { FaPlus, FaEdit, FaTrashAlt, FaBook } from 'react-icons/fa'
import type { Major } from '@/types'

export default function AdminMajors() {
  useDocumentTitle('التخصصات')
  const { list, create, update, remove } = useAdminData<Major>('majors')
  const { data: colleges } = useColleges()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Major | null>(null)
  const [form, setForm] = useState<Partial<Major>>({})

  const openCreate = () => {
    setEditing(null)
    setForm({ is_active: true, degree: 'بكالوريوس', study_duration_years: 4, difficulty: 2, career_opportunities: [], skills: [], subjects: [], postgraduate_opportunities: true })
    setOpen(true)
  }
  const openEdit = (m: Major) => {
    setEditing(m)
    setForm({ ...m })
    setOpen(true)
  }
  const set = (patch: Partial<Major>) => setForm((v) => ({ ...v, ...patch }))

  const submit = async () => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload: form })
        toast('تم التعديل', 'success')
      } else {
        await create.mutateAsync(form)
        toast('تمت الإضافة', 'success')
      }
      setOpen(false)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'حدث خطأ', 'error')
    }
  }

  const removeOne = async (id: number) => {
    if (!window.confirm('سيتم حذف جميع بيانات القبول المرتبطة. متابعة؟')) return
    await remove.mutateAsync(id)
    toast('تم الحذف', 'success')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink-dark">التخصصات</h1>
          <p className="mt-1 text-sm text-text-muted">إدارة التخصصات الجامعية</p>
        </div>
        <Button onClick={openCreate}>
          <FaPlus className="text-xs" /> إضافة تخصص
        </Button>
      </div>

      {list.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-alt">
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">التخصص</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">الكلية</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(list.data ?? []).map((m) => (
                  <tr key={m.id} className="border-b border-surface-border/60 hover:bg-surface-alt">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-bold text-ink-dark">
                        <FaBook className="text-primary" /> {m.name_ar}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {colleges?.find((c) => c.id === m.college_id)?.name_ar ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(m)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white" aria-label="تعديل">
                          <FaEdit className="text-xs" />
                        </button>
                        <button onClick={() => removeOne(m.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-burgundy/10 text-accent-burgundy hover:bg-accent-burgundy hover:text-white" aria-label="حذف">
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(list.data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-14 text-center text-text-muted">لا توجد تخصصات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'تعديل التخصص' : 'إضافة تخصص'} size="xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="الكلية *"
            placeholder="اختر الكلية"
            options={(colleges ?? []).map((c) => ({ value: c.id, label: c.name_ar }))}
            value={form.college_id ? String(form.college_id) : ''}
            onChange={(e) => set({ college_id: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input label="الدرجة العلمية" value={form.degree ?? 'بكالوريوس'} onChange={(e) => set({ degree: e.target.value })} />
          <Input label="الاسم بالعربية *" value={form.name_ar ?? ''} onChange={(e) => set({ name_ar: e.target.value })} />
          <Input label="الاسم بالإنجليزية" value={form.name_en ?? ''} onChange={(e) => set({ name_en: e.target.value })} />
          <Input label="المعرف (slug) *" value={form.slug ?? ''} onChange={(e) => set({ slug: e.target.value })} />
          <Input label="مدة الدراسة (سنوات)" type="number" step="0.5" value={form.study_duration_years ?? 4} onChange={(e) => set({ study_duration_years: Number(e.target.value) })} />
          <Input label="الصعوبة (1-5)" type="number" min={1} max={5} value={form.difficulty ?? 2} onChange={(e) => set({ difficulty: Number(e.target.value) })} />
          <Input label="رابط صورة الغلاف" value={form.cover_url ?? ''} onChange={(e) => set({ cover_url: e.target.value })} />
          <Input label="رابط فيديو تعريفي (YouTube)" value={form.video_url ?? ''} onChange={(e) => set({ video_url: e.target.value })} />
          <Input label="متوسط الرواتب (نص)" value={form.avg_salary ?? ''} onChange={(e) => set({ avg_salary: e.target.value })} />
          <Input label="الحد الأدنى للراتب ($)" type="number" value={form.salary_min ?? ''} onChange={(e) => set({ salary_min: e.target.value ? Number(e.target.value) : null })} />
          <Input label="الحد الأقصى للراتب ($)" type="number" value={form.salary_max ?? ''} onChange={(e) => set({ salary_max: e.target.value ? Number(e.target.value) : null })} />
          <div className="sm:col-span-2">
            <Textarea label="ملخص قصير" rows={2} value={form.summary ?? ''} onChange={(e) => set({ summary: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="الوصف الكامل" rows={4} value={form.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="طبيعة الدراسة" rows={2} value={form.study_nature ?? ''} onChange={(e) => set({ study_nature: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="فرص العمل (افصل بينها بفاصلة منقوطة)"
              value={(form.career_opportunities ?? []).join('؛')}
              onChange={(e) => set({ career_opportunities: e.target.value.split('؛').map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="المهارات المطلوبة (افصل بينها بفاصلة منقوطة)"
              value={(form.skills ?? []).join('؛')}
              onChange={(e) => set({ skills: e.target.value.split('؛').map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="المواد الأساسية (افصل بينها بفاصلة منقوطة)"
              value={(form.subjects ?? []).join('؛')}
              onChange={(e) => set({ subjects: e.target.value.split('؛').map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-dark">
              <input type="checkbox" checked={form.postgraduate_opportunities ?? true} onChange={(e) => set({ postgraduate_opportunities: e.target.checked })} className="h-4 w-4" />
              إمكانية الدراسات العليا
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-dark">
              <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => set({ is_active: e.target.checked })} className="h-4 w-4" />
              مفعّل
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-surface-border pt-5">
          <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={submit} loading={create.isPending || update.isPending}>حفظ</Button>
        </div>
      </Modal>
    </div>
  )
}
