import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'

export default function NotFoundPage() {
  return (
    <>
      <Seo title="الصفحة غير موجودة" />
      <section className="flex min-h-[60vh] items-center justify-center bg-surface px-4">
        <div className="text-center">
          <p className="text-gradient-gold text-7xl font-black sm:text-9xl">404</p>
          <h1 className="mt-4 text-2xl font-black text-ink-dark">عذراً، الصفحة غير موجودة</h1>
          <p className="mt-2 text-sm text-text-muted">ربما تم نقل الصفحة أو حذفها.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/" className="btn-primary">العودة للرئيسية</Link>
            <Link to="/discover" className="btn-ghost">اكتشف تخصصك</Link>
          </div>
        </div>
      </section>
    </>
  )
}
