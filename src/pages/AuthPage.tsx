import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaUser, FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Seo } from '@/components/Seo'
import { Logo } from '@/components/atoms/Logo'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/fields'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/providers/ToastProvider'
import { useDocumentTitle } from '@/hooks/useSeo'
import { cn } from '@/lib/utils'

export default function AuthPage() {
  useDocumentTitle('تسجيل الدخول')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signIn, signUp, signInWithProvider } = useAuth()
  const { toast } = useToast()

  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const redirect = searchParams.get('redirect') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const switchMode = (m: 'login' | 'signup') => {
    setError(null)
    navigate(`/auth?mode=${m}${redirect !== '/' ? `&redirect=${encodeURIComponent(redirect)}` : ''}`, { replace: true })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (!email.includes('@') || !email.includes('.')) {
      setError('أدخل بريداً إلكترونياً صحيحاً')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      setLoading(false)
      return
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('أدخل اسمك الكامل')
      setLoading(false)
      return
    }

    const res =
      mode === 'signup' ? await signUp(email, password, fullName) : await signIn(email, password)

    if (res.error) {
      setError(res.error)
    } else {
      toast(mode === 'signup' ? 'تم إنشاء الحساب بنجاح' : 'تم تسجيل الدخول', 'success')
      navigate(redirect)
    }
    setLoading(false)
  }

  const handleProvider = async (provider: 'google' | 'github') => {
    const res = await signInWithProvider(provider)
    if (res.error) setError(res.error)
  }

  return (
    <>
      <Seo title={mode === 'signup' ? 'إنشاء حساب' : 'تسجيل الدخول'} description="أنشئ حسابك أو سجّل دخولك إلى منصة حلمك الجامعي." />

      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-primary-deep px-4 py-16">
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(185,167,121,0.5), transparent 45%), radial-gradient(circle at 10% 90%, rgba(5,66,57,0.9), transparent 50%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <div className="glass-dark rounded-3xl p-8 sm:p-10">
            <div className="mb-8 text-center">
              <div className="flex justify-center"><Logo light /></div>
              <h1 className="mt-6 text-2xl font-black text-white">
                {mode === 'signup' ? 'أنشئ حسابك مجاناً' : 'أهلاً بعودتك'}
              </h1>
              <p className="mt-2 text-sm text-white/60">
                {mode === 'signup'
                  ? 'احفظ تخصصاتك المفضلة وقارن بينها'
                  : 'سجّل دخولك للوصول إلى مفضلتك ومقارناتك'}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    'rounded-xl py-2.5 text-sm font-bold transition-all',
                    mode === m ? 'bg-accent-gold text-primary-deep' : 'text-white/60 hover:text-white'
                  )}
                >
                  {m === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Input
                  label="الاسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<FaUser className="text-sm" />}
                  placeholder="اسمك الكامل"
                />
              )}
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<FaEnvelope className="text-sm" />}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <div>
                <div className="relative">
                  <Input
                    label="كلمة المرور"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<FaLock className="text-sm" />}
                    placeholder="••••••••"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute left-4 top-[42px] text-white/40 hover:text-white"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-accent-burgundy/15 px-4 py-3 text-sm font-medium text-red-300">
                  {error}
                </p>
              )}

              <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>
                {mode === 'signup' ? 'إنشاء الحساب' : 'تسجيل الدخول'}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-white/40">أو</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghostLight" onClick={() => handleProvider('google')}>
                <FaGoogle /> جوجل
              </Button>
              <Button variant="ghostLight" onClick={() => handleProvider('github')}>
                <FaGithub /> جيت هاب
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-white/40">
              بالمتابعة فأنت توافق على <Link to="/terms" className="text-accent-gold hover:underline">شروط الاستخدام</Link>
            </p>
          </div>
        </motion.div>
      </section>
    </>
  )
}
