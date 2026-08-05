import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/admin/Modal'
import { Input, Select } from '@/components/atoms/fields'
import { Badge } from '@/components/atoms/Badge'
import { Skeleton } from '@/components/atoms/Skeleton'
import { SmartImage } from '@/components/atoms/SmartImage'
import { useDocumentTitle } from '@/hooks/useSeo'
import { FaPlus, FaTrashAlt, FaImages } from 'react-icons/fa'

interface MediaRow {
  id: number
  entity_type: string
  entity_id: number
  url: string
  media_type: string
  alt: string | null
  sort_order: number
}

const entityTypes = [
  { value: 'university', label: 'جامعة' },
  { value: 'major', label: 'تخصص' },
  { value: 'college', label: 'كلية' },
  { value: 'news', label: 'خبر' },
  { value: 'article', label: 'مقال' },
  { value: 'testimonial', label: 'رأي طالب' },
]

export default function AdminMedia() {
  useDocumentTitle('الصور والفيديو')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: media, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async (): Promise<MediaRow[]> => {
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('media').insert({
        entity_type: form.entity_type,
        entity_id: Number(form.entity_id),
        url: form.url,
        media_type: form.media_type,
        alt: form.alt || null,
        sort_order: Number(form.sort_order || 0),
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      setOpen(false)
      setForm({})
      toast('تمت الإضافة', 'success')
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'حدث خطأ', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('media').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      toast('تم الحذف', 'success')
    },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink-dark">الصور والفيديو</h1>
          <p className="mt-1 text-sm text-text-muted">إدارة وسائط المنصة (الصور والفيديوهات)</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <FaPlus className="text-xs" /> إضافة وسيط
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : media && media.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="glass overflow-hidden rounded-2xl">
              <div className="h-36">
                {m.media_type === 'image' ? (
                  <SmartImage src={m.url} alt={m.alt ?? ''} className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-deep text-white">
                    <FaImages className="text-3xl text-accent-gold" />
                    <p className="mr-2 text-xs">فيديو</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <Badge tone="primary">{entityTypes.find((e) => e.value === m.entity_type)?.label}</Badge>
                  <button
                    onClick={() => {
                      if (window.confirm('حذف هذا الوسيط؟')) deleteMutation.mutate(m.id)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-burgundy/10 text-accent-burgundy hover:bg-accent-burgundy hover:text-white"
                    aria-label="حذف"
                  >
                    <FaTrashAlt className="text-xs" />
                  </button>
                </div>
                <p className="mt-2 truncate text-xs text-text-muted">المعرف: {m.entity_id} — {m.alt ?? 'بدون وصف'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-text-muted">لا توجد وسائط. أضف أول وسيط الآن.</p>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة وسيط">
        <div className="space-y-4">
          <Select
            label="نوع الكيان *"
            options={entityTypes}
            value={form.entity_type ?? ''}
            onChange={(e) => setForm({ ...form, entity_type: e.target.value })}
          />
          <Input label="معرف الكيان *" type="number" value={form.entity_id ?? ''} onChange={(e) => setForm({ ...form, entity_id: e.target.value })} placeholder="مثال: 5" />
          <Select
            label="نوع الوسيط *"
            options={[
              { value: 'image', label: 'صورة' },
              { value: 'video', label: 'فيديو' },
            ]}
            value={form.media_type ?? 'image'}
            onChange={(e) => setForm({ ...form, media_type: e.target.value })}
          />
          <Input label="رابط الوسيط *" value={form.url ?? ''} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <Input label="الوصف البديل" value={form.alt ?? ''} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
          <Input label="ترتيب العرض" type="number" value={form.sort_order ?? '0'} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-surface-border pt-5">
          <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={() => addMutation.mutate()} loading={addMutation.isPending}>حفظ</Button>
        </div>
      </Modal>
    </div>
  )
}
