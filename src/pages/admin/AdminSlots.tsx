import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ConfirmModal from '../../components/ConfirmModal'
import type { Doctor, AvailabilitySlot } from '../../types'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function AdminSlots() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [slots, setSlots] = useState<(AvailabilitySlot & { doctor?: Doctor })[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState({
    doctor_id: '',
    day_of_week: 1,
    start_time: '08:00',
    end_time: '12:00',
  })

  useEffect(() => {
    supabase.from('doctors').select('*').eq('is_active', true).then(({ data }) => setDoctors(data || []))
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase
      .from('availability_slots')
      .select('*, doctor:doctors(*)')
      .order('doctor_id')
      .order('day_of_week')
      .order('start_time')
    setSlots((data as (AvailabilitySlot & { doctor?: Doctor })[]) || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('availability_slots').insert({
      doctor_id: form.doctor_id,
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
    })
    setForm({ ...form, start_time: '08:00', end_time: '12:00' })
    load()
  }

  const handleDeleteClick = (id: string) => setDeleteTarget(id)

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await supabase.from('availability_slots').delete().eq('id', deleteTarget)
    setDeleteTarget(null)
    load()
  }

  if (loading) return <div className="animate-pulse">Carregando...</div>

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-white border border-slate-200 space-y-4 max-w-md">
        <h3 className="font-semibold">Novo horário disponível</h3>
        <select
          value={form.doctor_id}
          onChange={(e) => setForm((f) => ({ ...f, doctor_id: e.target.value }))}
          required
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Médico</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={form.day_of_week}
          onChange={(e) => setForm((f) => ({ ...f, day_of_week: +e.target.value }))}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        >
          {DAYS.map((name, i) => (
            <option key={i} value={i}>{name}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
            className="flex-1 min-w-[120px] px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
            className="flex-1 min-w-[120px] px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button type="submit" className="min-h-[44px] px-4 py-3 rounded-lg bg-emerald-600 text-white">
          Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {slots.map((s) => (
          <div
            key={s.id}
            className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="font-medium">{s.doctor?.name}</p>
              <p className="text-sm text-slate-500">
                {DAYS[s.day_of_week]} {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
              </p>
            </div>
            <button
              onClick={() => handleDeleteClick(s.id)}
              className="min-h-[44px] px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 self-start sm:self-center"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Remover horário"
        message="Deseja remover este horário disponível?"
        confirmLabel="Sim, remover"
        cancelLabel="Não"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
