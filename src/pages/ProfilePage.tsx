import { useState, type FormEvent } from 'react'
import { FaUserGraduate, FaEnvelope, FaSignOutAlt } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/atoms/Button'
import { Input, Select } from '@/components/atoms/fields'
import { useAuth } from '@/providers/AuthProvider'
import { useGovernorates, useCertificates } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'
import { useDocumentTitle } from '@/hooks/useSeo'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  useDocumentTitle('الملف الشخصي')
  const { profile, user, refreshProfile, signOut } = useAuth()
  const { data: governorates } = useGovernorates()
  const { data: certificates } = useCertificates()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [governorateId, setGovernorateId] = useState(profile?.governorate_id ?? '')
  const [certificateId, setCertificateId] = useState(profile?.certificate_id ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        governorate_id: governorateId ? Number(governorateId) : null,
        certificate_id: certificateId ? Number(certificateId) : null,
      })
      .eq('id', user!.id)
    if (error) {
      toast('حدث خطأ أثناء الحفظ', 'error')
    } else {
      toast('تم حفظ البيانات', 'success')
      refreshProfile()
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <Seo title="الملف الشخصي" description="إدارة بياناتك الشخصية على حلمك الجامعي." />

      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative flex items-center gap-5">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-gold/20 text-4xl text-accent-gold">
            <FaUserGraduate />
          </span>
          <div>
            <h1 className="text-3xl font-black">{profile?.full_name ?? 'مستخدم'}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/60">
              <FaEnvelope className="text-accent-gold" /> {user?.email}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="container-app max-w-2xl">
          <form onSubmit={handleSave} className="glass space-y-6 rounded-3xl p-6 sm:p-10">
            <h2 className="text-xl font-extrabold">البيانات الشخصية</h2>

            <Input label="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="اسمك الكامل" />

            <Select
              label="المحافظة"
              placeholder="اختر محافظتك"
              options={(governorates ?? []).map((g) => ({ value: g.id, label: g.name_ar }))}
              value={String(governorateId)}
              onChange={(e) => setGovernorateId(e.target.value)}
            />

            <Select
              label="نوع الشهادة"
              placeholder="اختر نوع شهادتك"
              options={(certificates ?? []).map((c) => ({ value: c.id, label: c.name_ar }))}
              value={String(certificateId)}
              onChange={(e) => setCertificateId(e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-3 border-t border-surface-border pt-6">
              <Button type="submit" loading={saving}>
                حفظ التغييرات
              </Button>
              <Button type="button" variant="danger" onClick={handleSignOut}>
                <FaSignOutAlt className="text-xs" />
                تسجيل الخروج
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
