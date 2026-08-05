import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/atoms/Spinner'
import { useAuth } from '@/providers/AuthProvider'

function FullPageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to={`/auth?mode=login&redirect=${encodeURIComponent(location.pathname)}`} replace />
  return <>{children}</>
}

export function StaffRoute({ children }: { children: ReactNode }) {
  const { user, isStaff, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to={`/auth?mode=login&redirect=${encodeURIComponent(location.pathname)}`} replace />
  if (!isStaff) return <Navigate to="/" replace />
  return <>{children}</>
}
