import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'
import ConfirmModal from '../components/ConfirmModal'
import type { Appointment, Doctor } from '../types'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<(Appointment & { doctor?: Doctor })[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(*)
      `)
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
    setAppointments((data as (Appointment & { doctor?: Doctor })[]) || [])
    setLoading(false)
  }

  const handleCancelClick = (id: string) => setCancelTarget(id)

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelada', updated_at: new Date().toISOString() })
      .eq('id', cancelTarget)
    setCancelTarget(null)
    if (error) {
      logger.error('Erro ao cancelar', { id: cancelTarget, error })
      setError(error.message)
    } else {
      logger.info('Consulta cancelada', { id: cancelTarget })
      load()
    }
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

  if (loading) {
    return <div className="animate-pulse">Carregando...</div>
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Minhas consultas</h1>
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      {appointments.length === 0 ? (
        <p className="text-slate-600">Você não possui consultas agendadas.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="font-medium">
                  {a.doctor?.name} {a.doctor?.specialty ? `- ${a.doctor.specialty}` : ''}
                </p>
                <p className="text-sm text-slate-600">
                  {new Date(a.appointment_date).toLocaleDateString('pt-BR')} às{' '}
                  {a.start_time?.slice(0, 5)}
                </p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${statusColor[a.status]}`}
                >
                  {statusLabel[a.status]}
                </span>
              </div>
              {a.status !== 'cancelada' && a.status !== 'realizada' && (
                <button
                  onClick={() => handleCancelClick(a.id)}
                  className="min-h-[44px] px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 self-start sm:self-center"
                >
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancelar consulta"
        message="Deseja realmente cancelar esta consulta?"
        confirmLabel="Sim, cancelar"
        cancelLabel="Não"
        variant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  )
}
