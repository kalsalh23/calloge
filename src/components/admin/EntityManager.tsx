import { useState, type ReactNode } from 'react'
import { useToast } from '@/providers/ToastProvider'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/admin/Modal'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useAdminData } from '@/hooks/useAdminData'
import { FaPlus, FaEdit, FaTrashAlt, FaSearch } from 'react-icons/fa'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
}

export interface EntityManagerProps<T extends { id: number | string }> {
  table: string
  title: string
  subtitle?: string
  columns: Column<T>[]
  defaultValues: () => Partial<T>
  renderForm: (props: {
    values: Partial<T>
    set: (patch: Partial<T>) => void
    editing: boolean
  }) => ReactNode
  searchKeys?: (keyof T)[]
}

export function EntityManager<T extends { id: number | string }>({
  table,
  title,
  subtitle,
  columns,
  defaultValues,
  renderForm,
  searchKeys,
}: EntityManagerProps<T>) {
  const { list, create, update, remove } = useAdminData<T>(table)
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [values, setValues] = useState<Partial<T>>(() => defaultValues())
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState<number | string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setValues(defaultValues())
    setModalOpen(true)
  }

  const openEdit = (row: T) => {
    setEditing(row)
    setValues({ ...row })
    setModalOpen(true)
  }

  const set = (patch: Partial<T>) => setValues((v) => ({ ...v, ...patch }))

  const handleSubmit = async () => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload: values })
        toast('تم التعديل بنجاح', 'success')
      } else {
        await create.mutateAsync(values)
        toast('تمت الإضافة بنجاح', 'success')
      }
      setModalOpen(false)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'حدث خطأ', 'error')
    }
  }

  const handleDelete = async (id: number | string) => {
    setDeleting(id)
    try {
      await remove.mutateAsync(id)
      toast('تم الحذف', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'فشل الحذف', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = searchKeys
    ? (list.data ?? []).filter((row) => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return searchKeys.some((key) => {
          const v = row[key]
          return v !== null && v !== undefined && String(v).toLowerCase().includes(q)
        })
      })
    : (list.data ?? [])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink-dark">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث..."
              className="input py-2 pl-4 pr-9 text-sm"
              aria-label="بحث في السجلات"
            />
          </div>
          <Button onClick={openCreate}>
            <FaPlus className="text-xs" />
            إضافة جديد
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-alt text-start">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-start font-bold text-ink-dark">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-start font-bold text-ink-dark">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border/60">
                    <td colSpan={columns.length + 1} className="p-3">
                      <Skeleton className="h-10" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-14 text-center text-text-muted">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-b border-surface-border/60 transition-colors last:border-0 hover:bg-surface-alt">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-ink-muted">
                        {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '—')}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                          aria-label="تعديل"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deleting === row.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-burgundy/10 text-accent-burgundy transition-colors hover:bg-accent-burgundy hover:text-white"
                          aria-label="حذف"
                        >
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل' : 'إضافة جديد'} size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          {renderForm({ values, set, editing: !!editing })}
          <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-5">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {editing ? 'حفظ التعديلات' : 'إضافة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
