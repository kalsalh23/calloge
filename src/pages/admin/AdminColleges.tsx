import { useState } from 'react'
import { useToast } from '@/providers/ToastProvider'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/admin/Modal'
import { Input, Textarea, Select } from '@/components/atoms/fields'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useAdminData } from '@/hooks/useAdminData'
import { useUniversities } from '@/lib/api'
import { useDocumentTitle } from '@/hooks/useSeo'
import { FaPlus, FaEdit, FaTrashAlt, FaBuilding } from 'react-icons/fa'
import type { College } from '@/types'

export default function AdminColleges() {
  useDocumentTitle('الكليات')
  const { list, create, update, remove } = useAdminData<College>('colleges')
  const { data: universities } = useUniversities()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<College | null>(null)
  const [form, setForm] = useState<Partial<College>>({})

  const openCreate = () => {
    setEditing(null)
    setForm({ is_active: true })
    setOpen(true)
  }
  const openEdit = (c: College) => {
    setEditing(c)
    setForm({ ...c })
    setOpen(true)
  }
  const set = (patch: Partial<College>) => setForm((v) => ({ ...v, ...patch }))

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
    if (!window.confirm('سيتم حذف جميع التخصصات المرتبطة. متابعة؟')) return
    await remove.mutateAsync(id)
    toast('تم الحذف', 'success')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink-dark">الكليات</h1>
          <p className="mt-1 text-sm text-text-muted">إدارة كليات الجامعات</p>
        </div>
        <Button onClick={openCreate}>
          <FaPlus className="text-xs" /> إضافة كلية
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
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">الكلية</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">الجامعة</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(list.data ?? []).map((c) => (
                  <tr key={c.id} className="border-b border-surface-border/60 hover:bg-surface-alt">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-bold text-ink-dark">
                        <FaBuilding className="text-primary" /> {c.name_ar}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {universities?.find((u) => u.id === c.university_id)?.name_ar ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white" aria-label="تعديل">
                          <FaEdit className="text-xs" />
                        </button>
                        <button onClick={() => removeOne(c.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-burgundy/10 text-accent-burgundy hover:bg-accent-burgundy hover:text-white" aria-label="حذف">
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(list.data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-14 text-center text-text-muted">لا توجد كليات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'تعديل الكلية' : 'إضافة كلية'}>
        <div className="grid gap-4">
          <Select
            label="الجامعة *"
            placeholder="اختر الجامعة"
            options={(universities ?? []).map((u) => ({ value: u.id, label: u.name_ar }))}
            value={form.university_id ? String(form.university_id) : ''}
            onChange={(e) => set({ university_id: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input label="اسم الكلية بالعربية *" value={form.name_ar ?? ''} onChange={(e) => set({ name_ar: e.target.value })} />
          <Input label="الاسم بالإنجليزية" value={form.name_en ?? ''} onChange={(e) => set({ name_en: e.target.value })} />
          <Input label="المعرف (slug) *" value={form.slug ?? ''} onChange={(e) => set({ slug: e.target.value })} />
          <Textarea label="الوصف" rows={3} value={form.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-dark">
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => set({ is_active: e.target.checked })} className="h-4 w-4" />
            مفعّل
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-surface-border pt-5">
          <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={submit} loading={create.isPending || update.isPending}>حفظ</Button>
        </div>
      </Modal>
    </div>
  )
}
