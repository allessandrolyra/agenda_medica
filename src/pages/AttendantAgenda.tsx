import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'
import { canAccessFullAgenda } from '../lib/auth'
import type { Profile } from '../types'
import type { Doctor } from '../types'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface AttendantAgendaProps {
  profile?: Profile | null
}

export default function AttendantAgenda({ profile }: AttendantAgendaProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<{ id: string; full_name: string; email: string }[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!canAccessFullAgenda(profile ?? null)) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 text-amber-800">
        Acesso restrito. A agenda completa é disponível apenas para atendentes e secretárias.
      </div>
    )
  }

  useEffect(() => {
    supabase.from('doctors').select('*').eq('is_active', true).order('name').then(({ data }) => setDoctors(data || []))
    supabase.from('profiles').select('id, full_name, email').order('full_name').then(({ data }) => setPatients(data || []))
  }, [])

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setSlots([])
      return
    }
    const day = new Date(selectedDate).getDay()
    supabase
      .from('availability_slots')
      .select('start_time, end_time')
      .eq('doctor_id', selectedDoctor.id)
      .eq('day_of_week', day)
      .then(({ data }) => {
        if (!data?.length) {
          setSlots([])
          return
        }
        const occupied: string[] = []
        supabase
          .from('appointments')
          .select('start_time')
          .eq('doctor_id', selectedDoctor.id)
          .eq('appointment_date', selectedDate)
          .neq('status', 'cancelada')
          .then(({ data: apps }) => {
            if (apps) apps.forEach((a) => occupied.push(a.start_time))
            const duration = selectedDoctor.default_duration_minutes
            const available: string[] = []
            data.forEach((s) => {
              const start = s.start_time as string
              const end = s.end_time as string
              let t = start
              while (t < end) {
                if (!occupied.includes(t)) available.push(t)
                const [h, m] = t.split(':').map(Number)
                const next = new Date(0, 0, 0, h, m + duration)
                t = `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}:00`
              }
            })
            setSlots(available)
          })
      })
  }, [selectedDoctor, selectedDate])

  const handleBook = async (startTime: string) => {
    if (!selectedDoctor || !selectedDate || !selectedPatient) {
      setError('Selecione médico, paciente e horário.')
      return
    }
    setLoading(true)
    setError('')
    const [h, m] = startTime.split(':').map(Number)
    const endDate = new Date(0, 0, 0, h, m + selectedDoctor.default_duration_minutes)
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`

    const { error: err } = await supabase.from('appointments').insert({
      patient_id: selectedPatient,
      doctor_id: selectedDoctor.id,
      appointment_date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      status: 'agendada',
    })

    if (err) {
      setError(err.message)
      logger.error('Erro ao agendar', { err })
    } else {
      setSuccess(true)
      logger.info('Consulta agendada pela secretária', { doctor: selectedDoctor.id, patient: selectedPatient })
      setSlots((prev) => prev.filter((s) => s !== startTime))
    }
    setLoading(false)
  }

  const minDate = new Date().toISOString().slice(0, 10)
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Agenda completa</h1>
      <p className="text-slate-600 mb-6">Agende consultas para os pacientes. Dias e horários disponíveis por médico.</p>
      {success && (
        <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-800">
          Consulta agendada com sucesso!
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700">{error}</div>
      )}

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Paciente</label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            required
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Selecione o paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name} - {p.email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Médico</label>
          <select
            value={selectedDoctor?.id ?? ''}
            onChange={(e) => {
              const d = doctors.find((x) => x.id === e.target.value)
              setSelectedDoctor(d || null)
              setSelectedDate('')
            }}
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Selecione o médico</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {typeof d.specialty === 'object' ? d.specialty?.name : d.specialty ? `- ${d.specialty}` : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedDoctor && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
              <input
                type="date"
                value={selectedDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Horários disponíveis ({DAYS[new Date(selectedDate).getDay()]})
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {slots.length === 0 ? (
                    <p className="text-slate-500 col-span-full">Nenhum horário disponível nesta data.</p>
                  ) : (
                    slots.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleBook(s)}
                        disabled={loading}
                        className="min-h-[44px] px-4 py-3 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 disabled:opacity-50 text-sm sm:text-base"
                      >
                        {s.slice(0, 5)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
