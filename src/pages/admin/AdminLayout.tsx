import { NavLink, Outlet, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  FaTachometerAlt,
  FaGraduationCap,
  FaUniversity,
  FaBuilding,
  FaBook,
  FaChartLine,
  FaNewspaper,
  FaQuestionCircle,
  FaUsers,
  FaCommentDots,
  FaCog,
  FaImages,
  FaBars,
  FaTimes,
  FaHome,
  FaSignOutAlt,
} from 'react-icons/fa'
import { FaBookOpen } from 'react-icons/fa6'
import { useAuth } from '@/providers/AuthProvider'
import { cn } from '@/lib/utils'

const nav = [
  { to: 'dashboard', label: 'لوحة المعلومات', icon: FaTachometerAlt },
  { to: 'certificates', label: 'أنواع الشهادات', icon: FaGraduationCap },
  { to: 'universities', label: 'الجامعات', icon: FaUniversity },
  { to: 'colleges', label: 'الكليات', icon: FaBuilding },
  { to: 'majors', label: 'التخصصات', icon: FaBook },
  { to: 'admissions', label: 'إدارة المفاضلات', icon: FaChartLine },
  { to: 'news', label: 'الأخبار', icon: FaNewspaper },
  { to: 'articles', label: 'المقالات', icon: FaBookOpen },
  { to: 'faq', label: 'الأسئلة الشائعة', icon: FaQuestionCircle },
  { to: 'testimonials', label: 'آراء الطلاب', icon: FaCommentDots },
  { to: 'users', label: 'المستخدمون', icon: FaUsers },
  { to: 'media', label: 'الصور والفيديو', icon: FaImages },
  { to: 'settings', label: 'الإعدادات', icon: FaCog },
]

export default function AdminLayout() {
  const { profile, role, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-surface-alt">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 top-16 z-40 w-72 transform border-l border-surface-border bg-surface transition-transform duration-300 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="border-b border-surface-border p-5">
            <p className="font-extrabold text-ink-dark">لوحة التحكم</p>
            <p className="mt-1 text-xs text-text-muted">{profile?.full_name ?? 'مدير'}</p>
            <span className="mt-2 inline-block rounded-full bg-accent-gold/15 px-3 py-1 text-xs font-bold text-accent-dark-brown">
              {role === 'super_admin' ? 'مدير عام' : role === 'admin' ? 'مدير' : role === 'editor' ? 'محرر' : 'مستخدم'}
            </span>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                    isActive ? 'bg-primary text-white' : 'text-ink-muted hover:bg-surface-alt hover:text-ink-dark'
                  )
                }
              >
                <item.icon className="text-base" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-1 border-t border-surface-border p-3">
            <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-muted hover:bg-surface-alt">
              <FaHome className="text-base" /> العودة للموقع
            </Link>
            <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-accent-burgundy hover:bg-accent-burgundy/10">
              <FaSignOutAlt className="text-base" /> تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-glow lg:hidden"
        aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
