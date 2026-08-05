import { useState } from 'react'
import { useToast } from '@/providers/ToastProvider'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/admin/Modal'
import { Input, Textarea, Select } from '@/components/atoms/fields'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Badge } from '@/components/atoms/Badge'
import { useAdminData } from '@/hooks/useAdminData'
import { useGovernorates } from '@/lib/api'
import { useDocumentTitle } from '@/hooks/useSeo'
import { FaPlus, FaEdit, FaTrashAlt, FaUniversity } from 'react-icons/fa'
import type { University } from '@/types'

export default function AdminUniversities() {
  useDocumentTitle('الجامعات')
  const { list, create, update, remove } = useAdminData<University>('universities')
  const { data: governorates } = useGovernorates()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<University | null>(null)
  const [form, setForm] = useState<Partial<University>>({})

  const openCreate = () => {
    setEditing(null)
    setForm({ type: 'government', is_active: true, housing_available: false })
    setOpen(true)
  }
  const openEdit = (u: University) => {
    setEditing(u)
    setForm({ ...u })
    setOpen(true)
  }
  const set = (patch: Partial<University>) => setForm((v) => ({ ...v, ...patch }))

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
    if (!window.confirm('هل أنت متأكد من حذف هذه الجامعة؟')) return
    await remove.mutateAsync(id)
    toast('تم الحذف', 'success')
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink-dark">الجامعات</h1>
          <p className="mt-1 text-sm text-text-muted">إدارة الجامعات الحكومية والخاصة</p>
        </div>
        <Button onClick={openCreate}>
          <FaPlus className="text-xs" /> إضافة جامعة
        </Button>
      </div>

      {list.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(list.data ?? []).map((uni) => (
            <div key={uni.id} className="glass rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FaUniversity />
                  </span>
                  <div>
                    <p className="font-extrabold text-ink-dark">{uni.name_ar}</p>
                    <p className="text-xs text-text-muted">{uni.name_en}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(uni)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white" aria-label="تعديل">
                    <FaEdit className="text-xs" />
                  </button>
                  <button onClick={() => removeOne(uni.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-burgundy/10 text-accent-burgundy hover:bg-accent-burgundy hover:text-white" aria-label="حذف">
                    <FaTrashAlt className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={uni.type === 'government' ? 'primary' : 'gold'}>
                  {uni.type === 'government' ? 'حكومية' : 'خاصة'}
                </Badge>
                {uni.housing_available && <Badge tone="success">سكن</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'تعديل الجامعة' : 'إضافة جامعة'} size="xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="الاسم بالعربية *" value={form.name_ar ?? ''} onChange={(e) => set({ name_ar: e.target.value })} />
          <Input label="الاسم بالإنجليزية" value={form.name_en ?? ''} onChange={(e) => set({ name_en: e.target.value })} />
          <Input label="المعرف (slug) *" value={form.slug ?? ''} onChange={(e) => set({ slug: e.target.value })} />
          <Select
            label="النوع"
            options={[
              { value: 'government', label: 'حكومية' },
              { value: 'private', label: 'خاصة' },
            ]}
            value={form.type ?? 'government'}
            onChange={(e) => set({ type: e.target.value as University['type'] })}
          />
          <Select
            label="المحافظة"
            placeholder="اختر المحافظة"
            options={(governorates ?? []).map((g) => ({ value: g.id, label: g.name_ar }))}
            value={form.governorate_id ? String(form.governorate_id) : ''}
            onChange={(e) => set({ governorate_id: e.target.value ? Number(e.target.value) : null })}
          />
          <Input label="سنة التأسيس" type="number" value={form.founding_year ?? ''} onChange={(e) => set({ founding_year: e.target.value ? Number(e.target.value) : null })} />
          <Input label="رابط الشعار" value={form.logo_url ?? ''} onChange={(e) => set({ logo_url: e.target.value })} />
          <Input label="رابط صورة الغلاف" value={form.cover_url ?? ''} onChange={(e) => set({ cover_url: e.target.value })} />
          <Input label="الموقع الإلكتروني" value={form.website ?? ''} onChange={(e) => set({ website: e.target.value })} />
          <Input label="العنوان" value={form.address ?? ''} onChange={(e) => set({ address: e.target.value })} />
          <Input label="البريد الإلكتروني" value={form.email ?? ''} onChange={(e) => set({ email: e.target.value })} />
          <Input label="الهاتف" value={form.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} />
          <Input label="فيسبوك" value={form.facebook ?? ''} onChange={(e) => set({ facebook: e.target.value })} />
          <Input label="إنستغرام" value={form.instagram ?? ''} onChange={(e) => set({ instagram: e.target.value })} />
          <Input label="يوتيوب" value={form.youtube ?? ''} onChange={(e) => set({ youtube: e.target.value })} />
          <div className="sm:col-span-2">
            <Textarea label="نبذة عن الجامعة" rows={4} value={form.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="ملاحظات الأقساط" rows={3} value={form.tuition_notes ?? ''} onChange={(e) => set({ tuition_notes: e.target.value })} />
          </div>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-dark">
              <input type="checkbox" checked={form.housing_available ?? false} onChange={(e) => set({ housing_available: e.target.checked })} className="h-4 w-4" />
              يتوفر سكن جامعي
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
