import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'
import { Badge } from '@/components/atoms/Badge'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Select } from '@/components/atoms/fields'
import { useDocumentTitle } from '@/hooks/useSeo'
import { useAuth } from '@/providers/AuthProvider'
import { formatDate } from '@/lib/utils'

interface AdminUser {
  id: string
  email: string | null
  full_name: string | null
  role_id: number
  is_active: boolean
  created_at: string
  role?: { name: string } | null
}

const roleLabels: Record<number, string> = { 1: 'طالب', 2: 'محرر', 3: 'مدير', 4: 'مدير عام' }
const roleTones: Record<number, 'neutral' | 'info' | 'primary' | 'gold'> = { 1: 'neutral', 2: 'info', 3: 'primary', 4: 'gold' }

export default function AdminUsers() {
  useDocumentTitle('المستخدمون')
  const { isAdmin, user: currentUser } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('*, role:roles(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  const roleMutation = useMutation({
    mutationFn: async ({ id, role_id }: { id: string; role_id: number }) => {
      const { error } = await supabase.from('users').update({ role_id }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast('تم تحديث الصلاحية', 'success')
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'حدث خطأ', 'error'),
  })

  const toggleActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from('users').update({ is_active }).eq('id', id)
    if (error) toast(error.message, 'error')
    else {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast('تم تحديث الحالة', 'success')
    }
  }

  if (!isAdmin) {
    return <p className="py-20 text-center text-text-muted">هذه الصفحة متاحة للمديرين فقط.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-ink-dark">المستخدمون</h1>
      <p className="mt-1 text-sm text-text-muted">إدارة المستخدمين وصلاحياتهم</p>

      {isLoading ? (
        <Skeleton className="mt-6 h-64 rounded-2xl" />
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-alt">
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">المستخدم</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">الدور</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">تاريخ التسجيل</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((u) => (
                  <tr key={u.id} className="border-b border-surface-border/60 hover:bg-surface-alt">
                    <td className="px-4 py-3">
                      <p className="font-bold text-ink-dark">{u.full_name ?? '—'}</p>
                      <p className="text-xs text-text-muted">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {u.id === currentUser?.id ? (
                        <Badge tone={roleTones[u.role_id]}>{roleLabels[u.role_id] ?? '—'}</Badge>
                      ) : (
                        <Select
                          options={[1, 2, 3, 4].map((r) => ({ value: r, label: roleLabels[r] }))}
                          value={u.role_id}
                          onChange={(e) => roleMutation.mutate({ id: u.id, role_id: Number(e.target.value) })}
                          className="w-36 py-1.5 text-xs"
                          aria-label={`تغيير دور ${u.email}`}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      {u.id === currentUser?.id ? (
                        <Badge tone="success">نشط</Badge>
                      ) : (
                        <button onClick={() => toggleActive(u.id, !u.is_active)}>
                          {u.is_active ? <Badge tone="success">نشط</Badge> : <Badge tone="danger">موقوف</Badge>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
