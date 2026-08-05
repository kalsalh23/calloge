import { Seo } from '@/components/Seo'
import { useDocumentTitle } from '@/hooks/useSeo'

export default function TermsPage() {
  useDocumentTitle('شروط الاستخدام')

  return (
    <>
      <Seo title="شروط الاستخدام" description="شروط الاستخدام وسياسة الخصوصية لمنصة حلمك الجامعي." />
      <section className="bg-surface py-16">
        <div className="container-app max-w-3xl space-y-8 text-sm leading-loose text-ink-muted">
          <div className="text-center">
            <h1 className="text-3xl font-black text-ink-dark">شروط الاستخدام وسياسة الخصوصية</h1>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-extrabold text-ink-dark">1. قبول الشروط</h2>
            <p>
              باستخدامك لمنصة "حلمك الجامعي" فإنك توافق على هذه الشروط. إذا لم توافق عليها، يرجى عدم
              استخدام المنصة.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-extrabold text-ink-dark">2. دقة المعلومات</h2>
            <p>
              تُعرض بيانات المفاضلات والحدود الدنيا وفق المصادر الرسمية المنشورة. نبذل جهداً للحفاظ
              على دقتها، لكننا لا نضمن خلوّها من الأخطاء، ويجب على الطالب التحقق دائماً من المصادر
              الرسمية (وزارة التعليم العالي والبحث العلمي).
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-extrabold text-ink-dark">3. الخصوصية</h2>
            <p>
              نستخدم بيانات حسابك (البريد، الاسم) لتحسين تجربتك فقط. لا نشارك بياناتك مع أي جهة ثالثة.
              يمكنك حذف حسابك في أي وقت.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-extrabold text-ink-dark">4. الملكية الفكرية</h2>
            <p>
              جميع محتويات المنصة (تصميم، محتوى، علامات) ملك لمنصة حلمك الجامعي ولا يجوز استخدامها
              دون إذن.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-extrabold text-ink-dark">5. حدود المسؤولية</h2>
            <p>
              المنصة أداة استرشادية ولا تتحمل مسؤولية أي قرار أكاديمي يُتخذ بناءً على المعلومات
              المعروضة. القرار النهائي يعود للطالب ووفقاً للمصادر الرسمية.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
