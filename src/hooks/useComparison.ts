import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'

export function useComparison() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const comparisons = useQuery({
    queryKey: ['comparisons', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase.from('comparisons').select('*').eq('user_id', user.id)
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })

  const saveComparison = useMutation({
    mutationFn: async ({ name, majorIds }: { name: string; majorIds: number[] }) => {
      if (!user) throw new Error('يجب تسجيل الدخول أولاً')
      const { error } = await supabase
        .from('comparisons')
        .insert({ user_id: user.id, name, major_ids: majorIds })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comparisons'] }),
  })

  const deleteComparison = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('comparisons').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comparisons'] }),
  })

  return { comparisons, saveComparison, deleteComparison }
}
