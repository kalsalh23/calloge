import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/organisms/Navbar'
import { Footer } from '@/components/organisms/Footer'
import { Spinner } from '@/components/atoms/Spinner'

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-18">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
