import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import type { Favorite } from '@/types'

export function useFavorites() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const favorites = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async (): Promise<Favorite[]> => {
      if (!user) return []
      const { data, error } = await supabase.from('favorites').select('*').eq('user_id', user.id)
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })

  const addFavorite = useMutation({
    mutationFn: async ({ targetType, targetId }: { targetType: 'major' | 'university'; targetId: number }) => {
      if (!user) throw new Error('يجب تسجيل الدخول أولاً')
      const { error } = await supabase
        .from('favorites')
        .upsert(
          { user_id: user.id, target_type: targetType, target_id: targetId },
          { onConflict: 'user_id,target_type,target_id', ignoreDuplicates: true }
        )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const removeFavorite = useMutation({
    mutationFn: async ({ targetType, targetId }: { targetType: 'major' | 'university'; targetId: number }) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const isFavorite = (targetType: 'major' | 'university', targetId: number) =>
    favorites.data?.some((f) => f.target_type === targetType && f.target_id === targetId) ?? false

  return { favorites, addFavorite, removeFavorite, isFavorite }
}
