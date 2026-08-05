import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('ar-SY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value)
}

export function diffPercent(studentScore: number, minimum: number): number {
  if (!minimum) return 0
  return ((studentScore - minimum) / minimum) * 100
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
}

export function truncate(text: string, length = 120): string {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length).trim()}…` : text
}

export function debounce<F extends (...args: never[]) => void>(fn: F, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function isValidScore(value: number): boolean {
  return value >= 0 && value <= 2500
}

export function getAdmissionStatus(studentScore: number, minimum: number) {
  const diff = studentScore - minimum
  if (diff >= 0) {
    return {
      label: 'مقبول',
      tone: 'success' as const,
      note: diff === 0 ? 'ضمن الحد الأدنى تماماً' : `تتجاوز الحد الأدنى بمقدار ${formatNumber(diff)} درجة`,
    }
  }
  return {
    label: 'غير كافٍ',
    tone: 'danger' as const,
    note: `ينقصك ${formatNumber(Math.abs(diff))} درجة للوصول إلى الحد الأدنى`,
  }
}
