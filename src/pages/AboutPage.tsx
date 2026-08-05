import { Link } from 'react-router-dom'
import { FaCompass, FaHeart, FaBalanceScale, FaBolt } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { useDocumentTitle } from '@/hooks/useSeo'

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
    </>
  )
}
