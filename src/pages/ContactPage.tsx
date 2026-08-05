import { useState, type FormEvent } from 'react'
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/atoms/Button'
import { Input, Textarea } from '@/components/atoms/fields'
import { useToast } from '@/providers/ToastProvider'
import { useDocumentTitle } from '@/hooks/useSeo'

export default function ContactPage() {
  useDocumentTitle('تواصل معنا')
  const { toast } = useToast()
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast('يرجى تعبئة جميع الحقول المطلوبة', 'warning')
      return
    }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      toast('تم إرسال رسالتك بنجاح، سنتواصل معك قريباً', 'success')
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 800)
  }

  return (
    <>
      <Seo title="تواصل معنا" description="راسلنا لأي استفسار أو اقتراح." />
      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative text-center">
          <h1 className="text-3xl font-black sm:text-4xl">تواصل معنا</h1>
          <p className="mt-3 text-sm text-white/70">لديك سؤال أو اقتراح؟ نحن هنا من أجلك.</p>
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="container-app max-w-2xl">
          <form onSubmit={handleSubmit} className="glass space-y-5 rounded-3xl p-6 sm:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="الاسم *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسمك الكامل"
              />
              <Input
                label="البريد الإلكتروني *"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <Input
              label="الموضوع"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="موضوع الرسالة"
            />
            <Textarea
              label="الرسالة *"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="اكتب رسالتك هنا..."
            />
            <Button type="submit" size="lg" fullWidth loading={sending}>
              <FaPaperPlane className="text-xs" />
              إرسال الرسالة
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            <p className="flex items-center justify-center gap-2">
              <FaEnvelope className="text-accent-gold" /> يمكنك أيضاً مراسلتنا عبر البريد الإلكتروني: info@hilmek.com
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
