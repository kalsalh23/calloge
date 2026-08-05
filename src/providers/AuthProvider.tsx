import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Role, UserProfile } from '@/types'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  role: Role | null
  isStaff: boolean
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile(data)
      setRole(data.role_id === 1 ? 'student' : data.role_id === 2 ? 'editor' : data.role_id === 3 ? 'admin' : 'super_admin')
    }
  }

  const refreshProfile = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      await fetchProfile(data.session.user.id)
    }
  }

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user ?? null)
      if (data.session?.user) fetchProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setRole(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error: error?.message ?? null }
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const isStaff = role === 'editor' || role === 'admin' || role === 'super_admin'
  const isAdmin = role === 'admin' || role === 'super_admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isStaff,
        isAdmin,
        loading,
        signIn,
        signUp,
        signInWithProvider,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
