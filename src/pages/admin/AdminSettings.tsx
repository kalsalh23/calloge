import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'
import { Button } from '@/components/atoms/Button'
import { Input, Textarea } from '@/components/atoms/fields'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useDocumentTitle } from '@/hooks/useSeo'
import { FaSave } from 'react-icons/fa'

type StrMap = Record<string, string>

export default function AdminSettings() {
  useDocumentTitle('الإعدادات')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error
      return (data ?? []) as { key: string; value: Record<string, unknown> }[]
    },
    select: (rows) => {
      const toMap = (key: string) =>
        Object.fromEntries(
          Object.entries(rows.find((d) => d.key === key)?.value ?? {}).map(([k, v]) => [k, String(v ?? '')])
        )
      return { site: toMap('site'), social: toMap('social') }
    },
  })

  const [draft, setDraft] = useState<{ site: StrMap; social: StrMap } | null>(null)
  const site = draft?.site ?? data?.site ?? {}
  const social = draft?.social ?? data?.social ?? {}

  const patchSite = (patch: StrMap) => setDraft({ site: { ...site, ...patch }, social })
  const patchSocial = (patch: StrMap) => setDraft({ social: { ...social, ...patch }, site })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error: e1 } = await supabase.from('settings').upsert({ key: 'site', value: site })
      if (e1) throw e1
      const { error: e2 } = await supabase.from('settings').upsert({ key: 'social', value: social })
      if (e2) throw e2
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setDraft(null)
      toast('تم حفظ الإعدادات', 'success')
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'حدث خطأ', 'error'),
  })

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black text-ink-dark">الإعدادات العامة</h1>
      <p className="mt-1 text-sm text-text-muted">تعديل هوية الموقع وروابط التواصل الاجتماعي</p>

      <div className="glass mt-6 space-y-5 rounded-3xl p-6 sm:p-8">
        <h2 className="text-lg font-extrabold">معلومات الموقع</h2>
        <Input label="اسم الموقع" value={site.name ?? ''} onChange={(e) => patchSite({ name: e.target.value })} />
        <Input label="الشعار النصي (شعار فرعي)" value={site.tagline ?? ''} onChange={(e) => patchSite({ tagline: e.target.value })} />
        <Input label="العنوان الرئيسي" value={site.hero_heading ?? ''} onChange={(e) => patchSite({ hero_heading: e.target.value })} />
        <Textarea label="الوصف الفرعي" rows={2} value={site.hero_subheading ?? ''} onChange={(e) => patchSite({ hero_subheading: e.target.value })} />
        <Input label="سنة المفاضلة الافتراضية" type="number" value={site.current_year ?? ''} onChange={(e) => patchSite({ current_year: e.target.value })} />
      </div>

      <div className="glass mt-6 space-y-5 rounded-3xl p-6 sm:p-8">
        <h2 className="text-lg font-extrabold">روابط التواصل الاجتماعي</h2>
        <Input label="فيسبوك" value={social.facebook ?? ''} onChange={(e) => patchSocial({ facebook: e.target.value })} />
        <Input label="إنستغرام" value={social.instagram ?? ''} onChange={(e) => patchSocial({ instagram: e.target.value })} />
        <Input label="تيليغرام" value={social.telegram ?? ''} onChange={(e) => patchSocial({ telegram: e.target.value })} />
        <Input label="يوتيوب" value={social.youtube ?? ''} onChange={(e) => patchSocial({ youtube: e.target.value })} />
      </div>

      <Button className="mt-6" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
        <FaSave className="text-xs" /> حفظ الإعدادات
      </Button>
    </div>
  )
}
