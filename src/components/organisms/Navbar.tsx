import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaHeart, FaBalanceScale, FaCompass, FaSearch } from 'react-icons/fa'
import { FaUserGraduate } from 'react-icons/fa'
import { Logo } from '@/components/atoms/Logo'
import { useAuth } from '@/providers/AuthProvider'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/discover', label: 'اكتشف تخصصك', icon: FaCompass },
  { to: '/compare', label: 'المقارنة', icon: FaBalanceScale },
  { to: '/universities', label: 'الجامعات' },
  { to: '/news', label: 'الأخبار' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, profile, signOut, isStaff } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open
          ? 'border-b border-surface-border bg-surface/80 backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <nav className="container-app flex h-16 items-center justify-between gap-4 sm:h-18" aria-label="التنقل الرئيسي">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-ink-muted hover:text-ink-dark hover:bg-surface-alt'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                to="/favorites"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-alt hover:text-accent-burgundy"
                aria-label="المفضلة"
              >
                <FaHeart />
              </Link>
              {isStaff && (
                <Link
                  to="/admin"
                  className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                >
                  لوحة التحكم
                </Link>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl border border-surface-border px-3 py-1.5 transition-colors hover:bg-surface-alt"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FaUserGraduate />
                </span>
                <span className="max-w-28 truncate text-sm font-bold text-ink-dark">
                  {profile?.full_name ?? user.email?.split('@')[0]}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-alt hover:text-accent-burgundy"
                aria-label="تسجيل الخروج"
              >
                <FaSignOutAlt />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth?mode=login"
                className={scrolled ? 'btn-outline-gold px-6 py-2.5' : 'btn-ghost-light px-6 py-2.5'}
              >
                تسجيل الدخول
              </Link>
              <Link to="/auth?mode=signup" className="btn-gold px-6 py-2.5">
                <FaUser />
                إنشاء حساب
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-dark lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={open}
        >
          {open ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-surface-border bg-surface/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container-app flex flex-col gap-1 py-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-base font-semibold transition-colors',
                      isActive ? 'bg-primary/10 text-primary' : 'text-ink-muted hover:bg-surface-alt'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/search"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-semibold text-ink-muted hover:bg-surface-alt"
              >
                <FaSearch /> بحث شامل
              </Link>

              <div className="mt-3 flex flex-col gap-2 border-t border-surface-border pt-4">
                {user ? (
                  <>
                    <Link to="/favorites" onClick={() => setOpen(false)} className="btn-ghost justify-start px-4 py-3">
                      <FaHeart /> المفضلة
                    </Link>
                    {isStaff && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="btn-ghost justify-start px-4 py-3">
                        لوحة التحكم
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setOpen(false)} className="btn-ghost justify-start px-4 py-3">
                      الملف الشخصي
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="btn-ghost justify-start px-4 py-3 text-accent-burgundy"
                    >
                      <FaSignOutAlt /> تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth?mode=signup" onClick={() => setOpen(false)} className="btn-gold px-6 py-3">
                      إنشاء حساب
                    </Link>
                    <Link to="/auth?mode=login" onClick={() => setOpen(false)} className="btn-outline-gold px-6 py-3">
                      تسجيل الدخول
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
