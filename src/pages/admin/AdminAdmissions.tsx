import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/admin/Modal'
import { Input, Select, Textarea } from '@/components/atoms/fields'
import { Badge } from '@/components/atoms/Badge'
import { Skeleton } from '@/components/atoms/Skeleton'
import { useCertificates, useUniversities, useColleges, useMajors } from '@/lib/api'
import { useDocumentTitle } from '@/hooks/useSeo'
import { formatNumber } from '@/lib/utils'
import {
  FaPlus,
  FaTrashAlt,
  FaUpload,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa'

interface ScoreRow {
  id: number
  year: number
  university_id: number
  college_id: number | null
  major_id: number
  certificate_type_id: number
  admission_type: string
  minimum_score: number
  notes: string | null
  is_published: boolean
  university?: { name_ar: string }
  major?: { name_ar: string }
  college?: { name_ar: string } | null
}

const admissionTypes = [
  { value: 'general', label: 'مفاضلة عامة' },
  { value: 'parallel', label: 'موازي' },
  { value: 'private', label: 'خاص' },
  { value: 'wafi', label: 'وافٍ' },
  { value: 'other', label: 'أخرى' },
]

export default function AdminAdmissions() {
  useDocumentTitle('إدارة المفاضلات')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: certificates } = useCertificates()
  const { data: universities } = useUniversities()
  const { data: colleges } = useColleges()
  const { data: majors } = useMajors()

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ScoreRow | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const { data: scores, isLoading } = useQuery({
    queryKey: ['admin-scores', selectedYear],
    queryFn: async (): Promise<ScoreRow[]> => {
      const { data, error } = await supabase
        .from('admission_scores')
        .select('*, university:universities(name_ar), major:majors(name_ar), college:colleges(name_ar)')
        .eq('year', selectedYear)
        .order('minimum_score', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  const { data: years } = useQuery({
    queryKey: ['admin-score-years'],
    queryFn: async (): Promise<number[]> => {
      const { data, error } = await supabase.from('admission_scores').select('year')
      if (error) throw error
      return [...new Set((data ?? []).map((r) => r.year))].sort((a, b) => b - a)
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from('admission_scores').update({
          university_id: Number(form.university_id),
          college_id: form.college_id ? Number(form.college_id) : null,
          major_id: Number(form.major_id),
          certificate_type_id: Number(form.certificate_type_id),
          admission_type: form.admission_type,
          minimum_score: Number(form.minimum_score),
          notes: form.notes || null,
        }).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('admission_scores').insert({
          year: Number(form.year),
          university_id: Number(form.university_id),
          college_id: form.college_id ? Number(form.college_id) : null,
          major_id: Number(form.major_id),
          certificate_type_id: Number(form.certificate_type_id),
          admission_type: form.admission_type,
          minimum_score: Number(form.minimum_score),
          notes: form.notes || null,
          is_published: true,
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scores'] })
      queryClient.invalidateQueries({ queryKey: ['admin-score-years'] })
      setOpen(false)
      toast(editing ? 'تم التعديل' : 'تمت الإضافة', 'success')
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'حدث خطأ', 'error'),
  })

  const publishMutation = useMutation({
    mutationFn: async ({ year, published }: { year: number; published: boolean }) => {
      const { error } = await supabase.from('admission_scores').update({ is_published: published }).eq('year', year)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scores'] })
      toast('تم تحديث حالة النشر', 'success')
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'حدث خطأ', 'error'),
  })

  const deleteYearMutation = useMutation({
    mutationFn: async (year: number) => {
      const { error } = await supabase.from('admission_scores').delete().eq('year', year)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scores'] })
      queryClient.invalidateQueries({ queryKey: ['admin-score-years'] })
      toast('تم حذف مفاضلة السنة', 'success')
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'حدث خطأ', 'error'),
  })

  const deleteRowMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('admission_scores').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scores'] })
      toast('تم الحذف', 'success')
    },
  })

  // CSV import
  const [csv, setCsv] = useState('')
  const importMutation = useMutation({
    mutationFn: async () => {
      const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean)
      const header = lines[0].split(',')
      const rows = lines.slice(1).map((line) => {
        const cells = line.split(',')
        const obj: Record<string, string> = {}
        header.forEach((h, i) => {
          obj[h.trim()] = cells[i]?.trim() ?? ''
        })
        return obj
      })
      const valid = rows.filter((r) => r.year && r.university_id && r.major_id && r.certificate_type_id && r.minimum_score)
      if (valid.length === 0) throw new Error('لا توجد صفوف صالحة. تأكد من الترويسة: year,university_id,college_id,major_id,certificate_type_id,admission_type,minimum_score,notes')
      const insertable = valid.map((r) => ({
        year: Number(r.year),
        university_id: Number(r.university_id),
        college_id: r.college_id ? Number(r.college_id) : null,
        major_id: Number(r.major_id),
        certificate_type_id: Number(r.certificate_type_id),
        admission_type: r.admission_type || 'general',
        minimum_score: Number(r.minimum_score),
        notes: r.notes || null,
        is_published: true,
      }))
      const { error } = await supabase.from('admission_scores').upsert(insertable, { onConflict: 'year,university_id,college_id,major_id,certificate_type_id,admission_type' })
      if (error) throw error
      return insertable.length
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-scores'] })
      queryClient.invalidateQueries({ queryKey: ['admin-score-years'] })
      setImportOpen(false)
      setCsv('')
      toast(`تم استيراد ${count} سجلاً بنجاح`, 'success')
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'فشل الاستيراد', 'error'),
  })

  const filteredColleges = useMemo(() => {
    if (!form.university_id) return colleges ?? []
    return (colleges ?? []).filter((c) => c.university_id === Number(form.university_id))
  }, [form.university_id, colleges])

  const filteredMajors = useMemo(() => {
    if (!form.college_id) return majors ?? []
    return (majors ?? []).filter((m) => m.college_id === Number(form.college_id))
  }, [form.college_id, majors])

  const openCreate = () => {
    setEditing(null)
    setForm({ year: String(selectedYear), admission_type: 'general' })
    setOpen(true)
  }

  const openEdit = (row: ScoreRow) => {
    setEditing(row)
    setForm({
      year: String(row.year),
      university_id: String(row.university_id),
      college_id: row.college_id ? String(row.college_id) : '',
      major_id: String(row.major_id),
      certificate_type_id: String(row.certificate_type_id),
      admission_type: row.admission_type,
      minimum_score: String(row.minimum_score),
      notes: row.notes ?? '',
    })
    setOpen(true)
  }

  const yearStats = useMemo(() => {
    if (!scores) return null
    return {
      total: scores.length,
      min: scores.length ? Math.min(...scores.map((s) => s.minimum_score)) : 0,
      max: scores.length ? Math.max(...scores.map((s) => s.minimum_score)) : 0,
      published: scores.filter((s) => s.is_published).length,
    }
  }, [scores])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink-dark">إدارة المفاضلات</h1>
          <p className="mt-1 text-sm text-text-muted">
            أضف، عدّل، استورد، وانسخ بيانات القبول لكل سنة. النظام جاهز لمفاضلات جميع الأعوام القادمة.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            options={(years ?? []).concat(selectedYear).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => b - a).map((y) => ({ value: y, label: `مفاضلة ${y}` }))}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-40"
          />
          <Button variant="ghost" onClick={() => setImportOpen(true)}>
            <FaUpload className="text-xs" /> استيراد CSV
          </Button>
          <Button onClick={openCreate}>
            <FaPlus className="text-xs" /> إضافة سجل قبول
          </Button>
        </div>
      </div>

      {yearStats && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-ink-dark">{yearStats.total}</p>
            <p className="text-xs font-semibold text-text-muted">سجل قبول</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-ink-dark">{formatNumber(yearStats.min, 1)}</p>
            <p className="text-xs font-semibold text-text-muted">أدنى معدل</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-ink-dark">{formatNumber(yearStats.max, 1)}</p>
            <p className="text-xs font-semibold text-text-muted">أعلى معدل</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-ink-dark">{yearStats.published}</p>
            <p className="text-xs font-semibold text-text-muted">منشور</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="gold"
          onClick={() => publishMutation.mutate({ year: selectedYear, published: true })}
          loading={publishMutation.isPending}
        >
          <FaCheckCircle className="text-xs" /> نشر مفاضلة {selectedYear}
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => {
            if (window.confirm(`هل تريد حذف جميع سجلات مفاضلة ${selectedYear}؟`)) deleteYearMutation.mutate(selectedYear)
          }}
          loading={deleteYearMutation.isPending}
        >
          <FaTrashAlt className="text-xs" /> حذف/أرشفة السنة
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-alt">
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">الجامعة</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">التخصص</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">النظام</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">الحد الأدنى</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">الحالة</th>
                  <th className="px-4 py-3 text-start font-bold text-ink-dark">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(scores ?? []).map((row) => (
                  <tr key={row.id} className="border-b border-surface-border/60 hover:bg-surface-alt">
                    <td className="px-4 py-3 font-semibold text-ink-dark">{row.university?.name_ar ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.major?.name_ar ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge tone="neutral">{admissionTypes.find((a) => a.value === row.admission_type)?.label ?? row.admission_type}</Badge>
                    </td>
                    <td className="px-4 py-3 font-black text-primary">{formatNumber(row.minimum_score, 2)}</td>
                    <td className="px-4 py-3">
                      {row.is_published ? <Badge tone="success">منشور</Badge> : <Badge tone="neutral">مسودة</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                          <FaChartLine className="text-xs" /> تعديل
                        </Button>
                        <button
                          onClick={() => {
                            if (window.confirm('حذف هذا السجل؟')) deleteRowMutation.mutate(row.id)
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-burgundy/10 text-accent-burgundy hover:bg-accent-burgundy hover:text-white"
                          aria-label="حذف"
                        >
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(scores ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-text-muted">
                      لا توجد بيانات لمفاضلة {selectedYear}. أضف سجلاً جديداً أو استورد ملف CSV.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'تعديل سجل قبول' : 'إضافة سجل قبول'} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="سنة المفاضلة *"
            options={[...new Set([new Date().getFullYear(), ...(years ?? []), Number(form.year)].filter(Boolean))].sort((a, b) => b - a).map((y) => ({ value: y, label: String(y) }))}
            value={form.year ?? selectedYear}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
          <Select
            label="نوع الشهادة *"
            placeholder="اختر الشهادة"
            options={(certificates ?? []).map((c) => ({ value: c.id, label: c.name_ar }))}
            value={form.certificate_type_id ?? ''}
            onChange={(e) => setForm({ ...form, certificate_type_id: e.target.value })}
          />
          <Select
            label="الجامعة *"
            placeholder="اختر الجامعة"
            options={(universities ?? []).map((u) => ({ value: u.id, label: u.name_ar }))}
            value={form.university_id ?? ''}
            onChange={(e) => setForm({ ...form, university_id: e.target.value, college_id: '', major_id: '' })}
          />
          <Select
            label="الكلية"
            placeholder="اختر الكلية"
            options={filteredColleges.map((c) => ({ value: c.id, label: c.name_ar }))}
            value={form.college_id ?? ''}
            onChange={(e) => setForm({ ...form, college_id: e.target.value, major_id: '' })}
          />
          <Select
            label="التخصص *"
            placeholder="اختر التخصص"
            options={filteredMajors.map((m) => ({ value: m.id, label: m.name_ar }))}
            value={form.major_id ?? ''}
            onChange={(e) => setForm({ ...form, major_id: e.target.value })}
          />
          <Select
            label="نظام القبول *"
            options={admissionTypes}
            value={form.admission_type ?? 'general'}
            onChange={(e) => setForm({ ...form, admission_type: e.target.value })}
          />
          <Input
            label="الحد الأدنى *"
            type="number"
            step="0.01"
            value={form.minimum_score ?? ''}
            onChange={(e) => setForm({ ...form, minimum_score: e.target.value })}
          />
          <Textarea
            label="ملاحظات"
            rows={2}
            value={form.notes ?? ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-surface-border pt-5">
          <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>حفظ</Button>
        </div>
      </Modal>

      {/* Import modal */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="استيراد بيانات القبول من CSV" size="lg">
        <p className="mb-3 text-sm text-text-muted">
          الترويسة المطلوبة:
          <code className="mx-1 rounded bg-surface-alt px-2 py-0.5 text-xs text-primary">
            year,university_id,college_id,major_id,certificate_type_id,admission_type,minimum_score,notes
          </code>
        </p>
        <Textarea
          rows={8}
          placeholder={'year,university_id,college_id,major_id,certificate_type_id,admission_type,minimum_score,notes\n2025,1,2,3,1,general,220.5,\n2025,1,2,4,1,general,214.0,'}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="font-mono text-xs"
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs text-text-muted">
            <FaExclamationTriangle className="text-amber-500" />
            يتم استخدام الترقيم المعرف (ID) الحالي في قاعدة البيانات.
          </p>
          <Button onClick={() => importMutation.mutate()} loading={importMutation.isPending}>
            <FaUpload className="text-xs" /> استيراد
          </Button>
        </div>
      </Modal>
    </div>
  )
}
