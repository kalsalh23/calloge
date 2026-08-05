import { createContext, useContext, useState, type ReactNode } from 'react'

type ToastTone = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const toneClasses: Record<ToastTone, string> = {
    success: 'bg-primary text-white',
    error: 'bg-accent-burgundy text-white',
    info: 'bg-primary-deep text-white',
    warning: 'bg-accent-dark-brown text-white',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-6 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-in-up rounded-xl px-5 py-3.5 text-sm font-semibold shadow-glow ${toneClasses[t.tone]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
