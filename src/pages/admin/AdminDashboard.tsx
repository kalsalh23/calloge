import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  FaGraduationCap,
  FaUniversity,
  FaBook,
  FaChartLine,
  FaNewspaper,
  FaUsers,
  FaArrowLeft,
} from 'react-icons/fa'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useDocumentTitle } from '@/hooks/useSeo'

function useCounts() {
  return useQuery({
    queryKey: ['admin-counts'],
    queryFn: async () => {
      const tables = ['certificates', 'universities', 'colleges', 'majors', 'admission_scores', 'news', 'articles', 'users', 'faq']
      const entries = await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t).select('id', { count: 'exact', head: true })
          return [t, count ?? 0]
        })
      )
      return Object.fromEntries(entries)
    },
  })
}

export default function AdminDashboard() {
  useDocumentTitle('لوحة المعلومات')
  const { data: counts, isLoading } = useCounts()

  const cards = [
    { key: 'certificates', label: 'أنواع الشهادات', icon: FaGraduationCap, to: 'certificates' },
    { key: 'universities', label: 'الجامعات', icon: FaUniversity, to: 'universities' },
    { key: 'colleges', label: 'الكليات', icon: FaUniversity, to: 'colleges' },
    { key: 'majors', label: 'التخصصات', icon: FaBook, to: 'majors' },
    { key: 'admission_scores', label: 'بيانات القبول', icon: FaChartLine, to: 'admissions' },
    { key: 'news', label: 'الأخبار', icon: FaNewspaper, to: 'news' },
    { key: 'users', label: 'المستخدمون', icon: FaUsers, to: 'users' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-black text-ink-dark">لوحة المعلومات</h1>
      <p className="mt-1 text-sm text-text-muted">نظرة عامة على محتوى المنصة.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="glass group rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl text-primary">
                <card.icon />
              </span>
              <FaArrowLeft className="text-xs text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            {isLoading ? (
              <Skeleton className="mt-4 h-8 w-16" />
            ) : (
              <p className="mt-4 text-3xl font-black text-ink-dark">{counts?.[card.key] ?? 0}</p>
            )}
            <p className="mt-1 text-sm font-semibold text-text-muted">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="glass mt-8 rounded-3xl p-6">
        <h2 className="text-lg font-extrabold text-ink-dark">إدارة المفاضلات</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          أدر بيانات القبول لكل سنة، استورد ملفات Excel أو CSV، وقارن المفاضلات بين الأعوام — كل ذلك من
          لوحة التحكم دون أي تعديل على الكود.
        </p>
        <Link to="admissions" className="btn-primary mt-4">
          <FaChartLine className="text-xs" />
          فتح إدارة المفاضلات
        </Link>
      </div>
    </div>
  )
}
