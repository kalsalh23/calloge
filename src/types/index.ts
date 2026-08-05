// Database entity types mirroring the Supabase schema

export type Role = 'student' | 'editor' | 'admin' | 'super_admin'

export interface UserProfile {
  id: string
  role_id: number
  full_name: string | null
  email: string | null
  avatar_url: string | null
  phone: string | null
  governorate_id: number | null
  certificate_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoleRow {
  id: number
  name: Role
  description: string | null
  created_at: string
}

export interface Certificate {
  id: number
  name_ar: string
  name_en: string | null
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type UniversityType = 'government' | 'private'

export interface University {
  id: number
  name_ar: string
  name_en: string | null
  slug: string
  type: UniversityType
  logo_url: string | null
  cover_url: string | null
  description: string | null
  website: string | null
  address: string | null
  governorate_id: number | null
  email: string | null
  phone: string | null
  facebook: string | null
  instagram: string | null
  youtube: string | null
  founding_year: number | null
  housing_available: boolean
  tuition_notes: string | null
  rating: number
  is_active: boolean
  created_at: string
  updated_at: string
  governorate?: Governorate | null
}

export interface College {
  id: number
  university_id: number
  name_ar: string
  name_en: string | null
  slug: string
  description: string | null
  cover_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  university?: University | null
  majors?: Major[]
}

export interface Major {
  id: number
  college_id: number
  name_ar: string
  name_en: string | null
  slug: string
  summary: string | null
  description: string | null
  degree: string | null
  study_duration_years: number | null
  difficulty: number | null
  career_opportunities: string[] | null
  avg_salary: string | null
  salary_min: number | null
  salary_max: number | null
  skills: string[] | null
  subjects: string[] | null
  study_nature: string | null
  postgraduate_opportunities: boolean | null
  video_url: string | null
  cover_url: string | null
  rating: number | null
  views: number
  is_active: boolean
  created_at: string
  updated_at: string
  college?: College | null
}

export interface Governorate {
  id: number
  name_ar: string
  name_en: string | null
  created_at: string
}

export type AdmissionType = 'general' | 'parallel' | 'private' | 'wafi' | 'other'

export interface AdmissionScore {
  id: number
  year: number
  university_id: number
  college_id: number | null
  major_id: number
  certificate_type_id: number
  admission_type: AdmissionType
  minimum_score: number
  notes: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  university?: University | null
  college?: College | null
  major?: Major | null
  certificate?: Certificate | null
}

export interface AdmissionRule {
  id: number
  certificate_id: number
  university_id: number | null
  title: string | null
  body: string | null
  conditions: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Article {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_url: string | null
  author_id: string | null
  tags: string[] | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  author?: UserProfile | null
}

export interface News {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_url: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Faq {
  id: number
  question: string
  answer: string
  category: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Testimonial {
  id: number
  student_name: string
  university: string | null
  major: string | null
  quote: string
  avatar_url: string | null
  rating: number | null
  is_active: boolean
  created_at: string
}

export interface Favorite {
  id: number
  user_id: string
  target_type: 'major' | 'university'
  target_id: number
  created_at: string
}

export interface Comparison {
  id: number
  user_id: string
  name: string | null
  major_ids: number[]
  created_at: string
}

export interface Notification {
  id: number
  user_id: string | null
  title: string
  body: string | null
  type: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export interface Media {
  id: number
  entity_type: 'university' | 'major' | 'college' | 'news' | 'article' | 'testimonial'
  entity_id: number
  url: string
  media_type: 'image' | 'video'
  alt: string | null
  sort_order: number
  created_at: string
}

export interface Settings {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

// ---- Composite types used across the app ----

export interface MajorWithUniversity extends Major {
  college: College & { university: University }
}

export interface ScoreWithRelations extends AdmissionScore {
  university: University
  major: Major & { college: College & { university: University } }
  certificate: Certificate
}

export interface SearchResult {
  majors: MajorWithUniversity[]
  universities: University[]
}

export interface DiscoverQuery {
  certificateId: number
  score: number
  year: number
  governorateId?: number | null
  universityType?: UniversityType | 'all'
  admissionType?: AdmissionType | 'all'
}

export interface DiscoverResult {
  eligible: ScoreWithRelations[]
  near: ScoreWithRelations[]
  ineligible: ScoreWithRelations[]
}
