import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { FaQuestionCircle, FaPlus } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useDocumentTitle } from '@/hooks/useSeo'

export default function FaqPage() {
  useDocumentTitle('الأسئلة الشائعة')
  const [open, setOpen] = useState<number | null>(null)
  const [category, setCategory] = useState('all')

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faq-page'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faq').select('*').eq('is_active', true).order('sort_order')
      if (error) throw error
      return data ?? []
    },
  })

  const categories = ['all', ...new Set((faqs ?? []).map((f) => f.category ?? 'عام'))]
  const filtered = category === 'all' ? (faqs ?? []) : (faqs ?? []).filter((f) => (f.category ?? 'عام') === category)

  return (
    <>
      <Seo title="الأسئلة الشائعة" description="إجابات عن أكثر الأسئلة تكراراً حول المفاضلات والتخصصات والجامعات." />

      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative text-center">
          <span className="glass-gold inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-accent-gold">
            <FaQuestionCircle className="h-3 w-3" />
            الأسئلة الشائعة
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">إجابات عن أكثر الأسئلة تكراراً</h1>
          <p className="mt-3 text-sm text-white/70">كل ما تحتاج معرفته عن المنصة والمفاضلات.</p>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="container-app max-w-3xl">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                  category === cat ? 'bg-primary text-white' : 'bg-surface-alt text-text-muted hover:bg-surface-border'
                }`}
              >
                {cat === 'all' ? 'الكل' : cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-text-muted">لا توجد أسئلة في هذا القسم بعد.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item.id} className="glass overflow-hidden rounded-2xl">
                  <button
                    onClick={() => setOpen((v) => (v === item.id ? null : item.id))}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-start"
                    aria-expanded={open === item.id}
                  >
                    <span className="font-bold text-ink-dark">{item.question}</span>
                    <span className={`shrink-0 text-primary transition-transform ${open === item.id ? 'rotate-45' : ''}`}>
                      <FaPlus className="h-4 w-4" />
                    </span>
                  </button>
                  {open === item.id && (
                    <div className="px-6 pb-5 text-sm leading-relaxed text-text-muted">{item.answer}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
