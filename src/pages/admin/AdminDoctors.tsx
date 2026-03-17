import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Doctor, Specialty } from '../../types'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<(Doctor & { specialty?: Specialty })[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', specialty_id: '', specialty: '', default_duration_minutes: 30 })
  const [editing, setEditing] = useState<Doctor | null>(null)

  useEffect(() => {
    supabase.from('specialties').select('*').order('name').then(({ data }) => setSpecialties(data || []))
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase.from('doctors').select('*, specialty:specialties(id, name)').order('name')
    setDoctors((data as (Doctor & { specialty?: Specialty })[]) || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      specialty_id: form.specialty_id || null,
      specialty: form.specialty || null,
      default_duration_minutes: form.default_duration_minutes,
    }
    if (editing) {
      await supabase.from('doctors').update(payload).eq('id', editing.id)
      setEditing(null)
    } else {
      await supabase.from('doctors').insert(payload)
    }
    setForm({ name: '', specialty_id: '', specialty: '', default_duration_minutes: 30 })
    load()
  }

  const handleEdit = (d: Doctor & { specialty?: Specialty }) => {
    setEditing(d)
    const spec = typeof d.specialty === 'object' ? d.specialty : null
    setForm({
      name: d.name,
      specialty_id: d.specialty_id || (spec && 'id' in spec ? spec.id : '') || '',
      specialty: spec ? '' : (typeof d.specialty === 'string' ? d.specialty : '') || '',
      default_duration_minutes: d.default_duration_minutes,
    })
  }

  const handleToggleActive = async (d: Doctor) => {
    await supabase.from('doctors').update({ is_active: !d.is_active }).eq('id', d.id)
    load()
  }

  if (loading) return <div className="animate-pulse">Carregando...</div>

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-white border border-slate-200 space-y-4 max-w-md">
        <h3 className="font-semibold">{editing ? 'Editar médico' : 'Novo médico'}</h3>
        <input
          type="text"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={form.specialty_id}
          onChange={(e) => setForm((f) => ({ ...f, specialty_id: e.target.value }))}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Selecione especialidade</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Ou digite outra especialidade"
          value={form.specialty}
          onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="number"
          placeholder="Duração (min)"
          value={form.default_duration_minutes}
          onChange={(e) => setForm((f) => ({ ...f, default_duration_minutes: +e.target.value }))}
          min={15}
          step={15}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="min-h-[44px] px-4 py-3 rounded-lg bg-emerald-600 text-white">
            {editing ? 'Salvar' : 'Adicionar'}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className="min-h-[44px] px-4 py-3 rounded-lg bg-slate-200">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {doctors.map((d) => (
          <div
            key={d.id}
            className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="font-medium">
                {d.name} {typeof d.specialty === 'object' && d.specialty && 'name' in d.specialty ? `- ${d.specialty.name}` : typeof d.specialty === 'string' ? `- ${d.specialty}` : ''}
              </p>
              <p className="text-sm text-slate-500">{d.default_duration_minutes} min</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleEdit(d)}
                className="min-h-[44px] px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                Editar
              </button>
              <button
                onClick={() => handleToggleActive(d)}
                className={`min-h-[44px] px-4 py-3 rounded-lg ${d.is_active ? 'bg-amber-100' : 'bg-emerald-100'}`}
              >
                {d.is_active ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
