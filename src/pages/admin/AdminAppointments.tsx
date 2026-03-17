import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ConfirmModal from '../../components/ConfirmModal'
import type { Appointment, Doctor, Profile } from '../../types'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<(Appointment & { doctor?: Doctor; patient?: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(*),
        patient:profiles(full_name, email, phone)
      `)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
    setAppointments((data as (Appointment & { doctor?: Doctor; patient?: Profile })[]) || [])
    setLoading(false)
  }

  const handleConfirm = async (id: string) => {
    await supabase
      .from('appointments')
      .update({ status: 'confirmada', updated_at: new Date().toISOString() })
      .eq('id', id)
    load()
  }

  const handleCancelClick = (id: string) => setCancelTarget(id)

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    await supabase
      .from('appointments')
      .update({ status: 'cancelada', updated_at: new Date().toISOString() })
      .eq('id', cancelTarget)
    setCancelTarget(null)
    load()
  }

  const statusLabel: Record<string, string> = {
    agendada: 'Agendada',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
    realizada: 'Realizada',
  }
  const statusColor: Record<string, string> = {
    agendada: 'bg-amber-100 text-amber-800',
    confirmada: 'bg-emerald-100 text-emerald-800',
    cancelada: 'bg-slate-100 text-slate-600',
    realizada: 'bg-blue-100 text-blue-800',
  }

  if (loading) return <div className="animate-pulse">Carregando...</div>

  return (
    <div className="space-y-4">
      {appointments.map((a) => (
        <div
          key={a.id}
          className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="font-medium">
              {a.doctor?.name} - {a.patient?.full_name}
            </p>
            <p className="text-sm text-slate-600">
              {new Date(a.appointment_date).toLocaleDateString('pt-BR')} às {a.start_time?.slice(0, 5)}
            </p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${statusColor[a.status]}`}>
              {statusLabel[a.status]}
            </span>
          </div>
          {a.status !== 'cancelada' && a.status !== 'realizada' && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleConfirm(a.id)}
                className="min-h-[44px] px-4 py-3 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              >
                Confirmar
              </button>
              <button
                onClick={() => handleCancelClick(a.id)}
                className="min-h-[44px] px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      ))}

      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancelar consulta"
        message="Deseja cancelar esta consulta?"
        confirmLabel="Sim, cancelar"
        cancelLabel="Não"
        variant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  )
}
