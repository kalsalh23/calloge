import { Link } from 'react-router-dom'
import { FaCompass, FaHeart, FaBalanceScale, FaBolt, FaUserGraduate, FaPhoneAlt } from 'react-icons/fa'
import { FaInstagram, FaFacebookF } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { useDocumentTitle } from '@/hooks/useSeo'

const developer = {
  name: 'قصي مهند الصالح',
  role: 'مطوّر ومصمّم منصة حلمك الجامعي',
  phone: '+963952639157',
  phoneHref: 'tel:+963952639157',
  instagram: 'https://www.instagram.com/kosai_al_saleh?igsh=cWM0dzEzaThqN2sz',
  facebook: 'https://www.facebook.com/share/17m6YZ1NKS/',
}

export default function AboutPage() {
  useDocumentTitle('من نحن')
  const values = [
    { icon: FaCompass, title: 'رؤيتنا', desc: 'أن يكون كل طالب سوري قادراً على اتخاذ قراره الجامعي بثقة ووضوح، مستنداً إلى بيانات موثوقة.' },
    { icon: FaHeart, title: 'مهمتنا', desc: 'نوفّر منصة تجمع كل التخصصات والجامعات ومعدلات القبول في مكان واحد، سهلة الاستخدام وحديثة باستمرار.' },
    { icon: FaBalanceScale, title: 'قيمنا', desc: 'الشفافية، الدقة، والعدالة في تقديم المعلومات. نعتمد على المصادر الرسمية المنشورة.' },
    { icon: FaBolt, title: 'طموحنا', desc: 'التوسع مستقبلاً ليشمل التوجيه المهني، وفرص المنح الدراسية، وكل ما يخدم الطالب السوري.' },
  ]

  return (
    <>
      <Seo title="من نحن" description="تعرف على منصة حلمك الجامعي ورسالتها." />
      <section className="relative overflow-hidden bg-primary-dark py-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(185,167,121,0.6), transparent 45%)' }}
        />
        <div className="container-app relative text-center">
          <h1 className="text-3xl font-black sm:text-4xl">من نحن</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            منصة "حلمك الجامعي" وُلدت من حاجة حقيقية: فهم الشباب السوري أين يتوجهون بعد الثانوية.
            جمعنا كل المعلومات التي يحتاجها الطالب — التخصصات، الجامعات، ومعدلات القبول الرسمية —
            في منصة واحدة بسيطة وذكية.
          </p>
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="container-app">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="glass rounded-3xl p-7 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                  <v.icon />
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link to="/discover" className="btn-primary">ابدأ استكشافك الآن</Link>
          </div>
        </div>
      </section>

      {/* Developer card */}
      <section className="bg-surface-alt pb-16 pt-4">
        <div className="container-app">
          <div className="glass-gold relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-8 text-center sm:p-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: 'radial-gradient(circle at 50% -10%, rgba(185,167,121,0.55), transparent 55%)' }}
            />
            <span className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent-gold to-accent-brown text-4xl font-black text-primary-deep shadow-soft">
              <FaUserGraduate />
            </span>
            <h2 className="relative mt-6 text-2xl font-black text-ink-dark">بطاقة المطوّر</h2>
            <p className="relative mt-1 text-sm font-semibold text-text-muted">{developer.role}</p>

            <div className="relative mt-6 flex flex-col items-center gap-3">
              <span className="text-3xl font-black tracking-tight text-gradient-gold">{developer.name}</span>
              <a
                href={developer.phoneHref}
                className="flex items-center gap-2 rounded-lg border border-accent-gold/40 bg-accent-gold/10 px-5 py-2.5 text-base font-bold text-ink-dark transition-colors hover:bg-accent-gold/20"
              >
                <FaPhoneAlt className="text-accent-gold" />
                {developer.phone}
              </a>
            </div>

            <div className="relative mt-8 flex items-center justify-center gap-3">
              <a
                href={developer.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 text-xl text-white shadow-lg transition-transform hover:scale-110"
                aria-label="انستغرام"
              >
                <FaInstagram />
              </a>
              <a
                href={developer.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877f2] text-xl text-white shadow-lg transition-transform hover:scale-110"
                aria-label="فيسبوك"
              >
                <FaFacebookF />
              </a>
            </div>

            <p className="relative mt-6 text-xs text-text-muted">
              يسعدني استقبال ملاحظاتك واقتراحاتك عبر أي من وسائل التواصل
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
