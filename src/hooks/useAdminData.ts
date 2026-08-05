import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

type Row = { id: number | string }

export function useAdminData<T extends Row>(table: string) {
  const queryClient = useQueryClient()
  const key = ['admin', table]

  const list = useQuery({
    queryKey: key,
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase.from(table).select('*').order('id', { ascending: false })
      if (error) throw error
      return (data ?? []) as T[]
    },
  })

  const create = useMutation({
    mutationFn: async (payload: Partial<T>) => {
      const { error } = await supabase.from(table).insert(payload as T)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: number | string; payload: Partial<T> }) => {
      const { error } = await supabase.from(table).update(payload as T).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation({
    mutationFn: async (id: number | string) => {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { list, create, update, remove }
}
