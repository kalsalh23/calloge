import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
}

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} | حلمك الجامعي`
      : 'حلمك الجامعي | دليلك الذكي نحو مستقبلك الجامعي'
  }, [title])
}
