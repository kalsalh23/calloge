import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  Certificate,
  University,
  College,
  MajorWithUniversity,
  Governorate,
  AdmissionScore,
  News,
  Article,
  Faq,
  Testimonial,
  ScoreWithRelations,
} from '@/types'

// ---------------------------------------------------------------- certificates

export function useCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: async (): Promise<Certificate[]> => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60 * 60,
  })
}

// --------------------------------------------------------------- universities

export function useUniversities(opts?: { type?: string; governorateId?: number | null }) {
  return useQuery({
    queryKey: ['universities', opts?.type, opts?.governorateId],
    queryFn: async (): Promise<University[]> => {
      let query = supabase
        .from('universities')
        .select('*, governorate:governorates(*)')
        .eq('is_active', true)
      if (opts?.type && opts.type !== 'all') query = query.eq('type', opts.type)
      if (opts?.governorateId) query = query.eq('governorate_id', opts.governorateId)
      const { data, error } = await query.order('name_ar', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useUniversity(slug: string) {
  return useQuery({
    queryKey: ['university', slug],
    queryFn: async (): Promise<University | null> => {
      const { data, error } = await supabase
        .from('universities')
        .select('*, governorate:governorates(*)')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!slug,
  })
}

export function useUniversityMajors(universityId: number | null) {
  return useQuery({
    queryKey: ['university-majors', universityId],
    queryFn: async (): Promise<MajorWithUniversity[]> => {
      const { data: colleges, error: cErr } = await supabase
        .from('colleges')
        .select('id')
        .eq('university_id', universityId!)
        .eq('is_active', true)
      if (cErr) throw cErr
      if (!colleges?.length) return []
      const ids = colleges.map((c) => c.id)
      const { data, error } = await supabase
        .from('majors')
        .select('*, college:colleges(*, university:universities(*, governorate:governorates(*)))')
        .in('college_id', ids)
        .eq('is_active', true)
        .order('name_ar')
      if (error) throw error
      return (data ?? []) as unknown as MajorWithUniversity[]
    },
    enabled: !!universityId,
  })
}

// ------------------------------------------------------------------- colleges

export function useColleges(universityId?: number | null) {
  return useQuery({
    queryKey: ['colleges', universityId],
    queryFn: async (): Promise<College[]> => {
      let query = supabase
        .from('colleges')
        .select('*, university:universities(*)')
        .eq('is_active', true)
      if (universityId) query = query.eq('university_id', universityId)
      const { data, error } = await query.order('name_ar')
      if (error) throw error
      return data ?? []
    },
    enabled: universityId === undefined || !!universityId,
  })
}

// ---------------------------------------------------------------------- majors

export function useMajors() {
  return useQuery({
    queryKey: ['majors'],
    queryFn: async (): Promise<MajorWithUniversity[]> => {
      const { data, error } = await supabase
        .from('majors')
        .select('*, college:colleges(*, university:universities(*, governorate:governorates(*)))')
        .eq('is_active', true)
        .order('name_ar')
      if (error) throw error
      return (data ?? []) as unknown as MajorWithUniversity[]
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useMajor(slug: string) {
  return useQuery({
    queryKey: ['major', slug],
    queryFn: async (): Promise<MajorWithUniversity | null> => {
      const { data, error } = await supabase
        .from('majors')
        .select('*, college:colleges(*, university:universities(*, governorate:governorates(*)))')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      if (error) throw error
      return (data ?? null) as unknown as MajorWithUniversity | null
    },
    enabled: !!slug,
  })
}

export function useMajorScores(majorId: number | null, year?: number) {
  return useQuery({
    queryKey: ['major-scores', majorId, year],
    queryFn: async (): Promise<AdmissionScore[]> => {
      let query = supabase
        .from('admission_scores')
        .select('*, university:universities(*), college:colleges(*), certificate:certificates(*)')
        .eq('major_id', majorId!)
        .eq('is_published', true)
      if (year) query = query.eq('year', year)
      const { data, error } = await query.order('minimum_score', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!majorId,
  })
}

// ----------------------------------------------------------------- governorates

export function useGovernorates() {
  return useQuery({
    queryKey: ['governorates'],
    queryFn: async (): Promise<Governorate[]> => {
      const { data, error } = await supabase
        .from('governorates')
        .select('*')
        .order('name_ar')
      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60 * 60 * 24,
  })
}

// ---------------------------------------------------------------- admission scores

export function useAdmissionYears() {
  return useQuery({
    queryKey: ['admission-years'],
    queryFn: async (): Promise<number[]> => {
      const { data, error } = await supabase
        .from('admission_scores')
        .select('year')
        .eq('is_published', true)
      if (error) throw error
      const years = [...new Set((data ?? []).map((r) => r.year))]
      return years.sort((a, b) => b - a)
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useDiscoverScores(params: {
  certificateId: number
  year: number
  universityType?: string
  governorateId?: number | null
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ['discover', params.certificateId, params.year, params.universityType, params.governorateId],
    queryFn: async (): Promise<ScoreWithRelations[]> => {
      let query = supabase
        .from('admission_scores')
        .select(
          '*, university:universities(*), major:majors(*, college:colleges(*, university:universities(*, governorate:governorates(*)))), certificate:certificates(*)'
        )
        .eq('certificate_type_id', params.certificateId)
        .eq('year', params.year)
        .eq('is_published', true)
        .eq('universities.is_active', true)
      if (params.universityType && params.universityType !== 'all') {
        query = query.eq('universities.type', params.universityType)
      }
      if (params.governorateId) {
        query = query.eq('universities.governorate_id', params.governorateId)
      }
      const { data, error } = await query.order('minimum_score', { ascending: true })
      if (error) throw error
      return (data ?? []) as unknown as ScoreWithRelations[]
    },
    enabled: params.enabled ?? true,
    staleTime: 1000 * 60 * 10,
  })
}

// ----------------------------------------------------------------------- news

export function useNews(limit?: number) {
  return useQuery({
    queryKey: ['news', limit],
    queryFn: async (): Promise<News[]> => {
      let query = supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
      if (limit) query = query.limit(limit)
      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
  })
}

// -------------------------------------------------------------------- articles

export function useArticles(limit?: number) {
  return useQuery({
    queryKey: ['articles', limit],
    queryFn: async (): Promise<Article[]> => {
      let query = supabase
        .from('articles')
        .select('*, author:users(*)')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
      if (limit) query = query.limit(limit)
      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
  })
}

// ------------------------------------------------------------------------ faq

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async (): Promise<Faq[]> => {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

// ---------------------------------------------------------------- testimonials

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

// ------------------------------------------------------------------- settings

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<Record<string, Record<string, unknown>>> => {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error
      const map: Record<string, Record<string, unknown>> = {}
      for (const row of data ?? []) map[row.key] = row.value
      return map
    },
    staleTime: 1000 * 60 * 60,
  })
}

// --------------------------------------------------------------------- search

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const q = query.trim()
      if (!q) return { majors: [], universities: [] }
      const [majorsRes, universitiesRes] = await Promise.all([
        supabase
          .from('majors')
          .select('*, college:colleges(*, university:universities(*, governorate:governorates(*)))')
          .eq('is_active', true)
          .or(`name_ar.ilike.%${q}%,name_en.ilike.%${q}%`)
          .limit(20),
        supabase
          .from('universities')
          .select('*, governorate:governorates(*)')
          .eq('is_active', true)
          .or(`name_ar.ilike.%${q}%,name_en.ilike.%${q}%,address.ilike.%${q}%`)
          .limit(20),
      ])
      if (majorsRes.error) throw majorsRes.error
      if (universitiesRes.error) throw universitiesRes.error
      return {
        majors: (majorsRes.data ?? []) as unknown as MajorWithUniversity[],
        universities: universitiesRes.data ?? [],
      }
    },
    enabled: query.trim().length > 0,
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const [{ count: universities }, { count: majors }, { count: scores }] = await Promise.all([
        supabase.from('universities').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('majors').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('admission_scores').select('id', { count: 'exact', head: true }).eq('is_published', true),
      ])
      return { universities: universities ?? 0, majors: majors ?? 0, scores: scores ?? 0 }
    },
    staleTime: 1000 * 60 * 60,
  })
}
