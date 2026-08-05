import { useEffect } from 'react'

interface SeoProps {
  title?: string
  description?: string
  image?: string
  type?: string
  jsonLd?: Record<string, unknown>
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function Seo({ title, description, image, type = 'website', jsonLd }: SeoProps) {
  useEffect(() => {
    document.title = title
      ? `${title} | حلمك الجامعي`
      : 'حلمك الجامعي | دليلك الذكي نحو مستقبلك الجامعي'

    const desc =
      description ??
      'منصة حلمك الجامعي تساعد الطلاب السوريين على اكتشاف التخصصات والجامعات المتاحة لهم حسب نوع الشهادة والمعدل، مع بيانات المفاضلات الرسمية.'

    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', title ?? 'حلمك الجامعي')
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', type)
    if (image) setMeta('property', 'og:image', image)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title ?? 'حلمك الجامعي')
    setMeta('name', 'twitter:description', desc)
    if (image) setMeta('name', 'twitter:image', image)

    let script: HTMLScriptElement | null = null
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => {
      script?.remove()
    }
  }, [title, description, image, type, jsonLd])

  return null
}
