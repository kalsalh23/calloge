import { Link } from 'react-router-dom'
import { Logo } from '@/components/atoms/Logo'
import { FaFacebookF, FaInstagram, FaYoutube, FaTelegramPlane, FaPhoneAlt, FaCode } from 'react-icons/fa'
import { useSettings } from '@/lib/api'

export function Footer() {
  const { data: settings } = useSettings()
  const social = (settings?.social ?? {}) as Record<string, string>

  const groups = [
    {
      title: 'المنصة',
      links: [
        { label: 'الرئيسية', to: '/' },
        { label: 'اكتشف تخصصك', to: '/discover' },
        { label: 'الجامعات', to: '/universities' },
        { label: 'مقارنة التخصصات', to: '/compare' },
        { label: 'البحث', to: '/search' },
      ],
    },
    {
      title: 'المحتوى',
      links: [
        { label: 'الأخبار', to: '/news' },
        { label: 'المقالات', to: '/articles' },
        { label: 'الأسئلة الشائعة', to: '/faq' },
        { label: 'المفضلة', to: '/favorites' },
        { label: 'التسجيل', to: '/auth?mode=signup' },
      ],
    },
    {
      title: 'الدعم',
      links: [
        { label: 'من نحن', to: '/about' },
        { label: 'تواصل معنا', to: '/contact' },
        { label: 'شروط الاستخدام', to: '/terms' },
        { label: 'سياسة الخصوصية', to: '/privacy' },
      ],
    },
  ]

  const socials = [
    { icon: FaFacebookF, href: social.facebook, label: 'فيسبوك' },
    { icon: FaInstagram, href: social.instagram, label: 'إنستغرام' },
    { icon: FaYoutube, href: social.youtube, label: 'يوتيوب' },
    { icon: FaTelegramPlane, href: social.telegram, label: 'تيليغرام' },
  ].filter((s) => s.href)

  return (
    <footer className="mt-20 bg-primary-deep text-white">
      <div className="container-app py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              منصة حلمك الجامعي — دليلك الذكي نحو مستقبلك الجامعي. نساعد الطلاب السوريين على اختيار
              التخصص والجامعة المناسبين حسب شهادتهم ومعدلهم.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-colors hover:bg-accent-gold hover:text-primary-deep"
                >
                  <s.icon />
                </a>
              ))}
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-accent-gold">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} حلمك الجامعي — جميع الحقوق محفوظة
          </p>
          <p className="flex items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1.5"><FaCode /> تطوير: قصي مهند الصالح</span>
            <span className="flex items-center gap-1.5"><FaPhoneAlt /> 0952639157</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
