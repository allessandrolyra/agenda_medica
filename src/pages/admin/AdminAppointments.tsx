import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import ConfirmModal from '../../components/ConfirmModal'
import { exportToICS, exportToCSV } from '../../lib/exportAgenda'
import type { Appointment, Doctor, Profile } from '../../types'

type AppointmentWithDetails = Appointment & { doctor?: Doctor; patient?: Profile }
type ViewMode = 'lista' | 'por_medico'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'agendada', label: 'Agendada' },
  { value: 'pending_confirmation', label: 'Pendente confirmação' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'no_show', label: 'Não compareceu' },
  { value: 'cancelada', label: 'Cancelada' },
] as const

const statusLabel: Record<string, string> = {
  agendada: 'Agendada',
  pending_confirmation: 'Pendente confirmação',
  confirmada: 'Confirmada',
  in_progress: 'Em andamento',
  realizada: 'Realizada',
  no_show: 'Não compareceu',
  cancelada: 'Cancelada',
}
const statusColor: Record<string, string> = {
  agendada: 'bg-amber-100 text-amber-800',
  pending_confirmation: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-emerald-100 text-emerald-800',
  in_progress: 'bg-blue-100 text-blue-800',
  cancelada: 'bg-slate-100 text-slate-600',
  realizada: 'bg-blue-100 text-blue-800',
  no_show: 'bg-red-100 text-red-800',
}

function normalizeForSearch(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)

  const [searchName, setSearchName] = useState('')
  const [filterDoctor, setFilterDoctor] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('lista')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const [appRes, docRes] = await Promise.all([
      supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(*),
          patient:profiles(full_name, email, phone)
        `)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true }),
      supabase.from('doctors').select('*').eq('is_active', true).order('name'),
    ])
    setAppointments((appRes.data as AppointmentWithDetails[]) || [])
    setDoctors((docRes.data as Doctor[]) || [])
    setLoading(false)
  }

  const filteredAppointments = useMemo(() => {
    let result = [...appointments]

    if (searchName.trim()) {
      const term = normalizeForSearch(searchName.trim())
      result = result.filter((a) => {
        const name = normalizeForSearch(a.patient?.full_name || '')
        const email = normalizeForSearch(a.patient?.email || '')
        return name.includes(term) || email.includes(term)
      })
    }

    if (filterDoctor) {
      result = result.filter((a) => a.doctor_id === filterDoctor)
    }

    if (filterDateFrom) {
      result = result.filter((a) => a.appointment_date >= filterDateFrom)
    }

    if (filterDateTo) {
      result = result.filter((a) => a.appointment_date <= filterDateTo)
    }

    if (filterStatus) {
      result = result.filter((a) => a.status === filterStatus)
    }

    return result
  }, [appointments, searchName, filterDoctor, filterDateFrom, filterDateTo, filterStatus])

  const groupedByDoctor = useMemo(() => {
    const map = new Map<string, AppointmentWithDetails[]>()
    for (const a of filteredAppointments) {
      const key = a.doctor?.name || a.doctor_id || 'Sem médico'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(a)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredAppointments])

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

  const clearFilters = () => {
    setSearchName('')
    setFilterDoctor('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterStatus('')
  }

  const hasActiveFilters = searchName || filterDoctor || filterDateFrom || filterDateTo || filterStatus

  const AppointmentCard = ({ a }: { a: AppointmentWithDetails }) => (
    <div
      key={a.id}
      className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <p className="font-medium">
          {viewMode === 'lista' ? `${a.doctor?.name} - ` : ''}
          {a.patient?.full_name}
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
  )

  if (loading) return <div className="animate-pulse">Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        <h3 className="font-semibold text-slate-800">Pesquisar e filtrar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome ou email do paciente</label>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Médico</label>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todos os médicos</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data de</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data até</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`px-4 py-2 text-sm font-medium ${viewMode === 'lista' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Lista
            </button>
            <button
              type="button"
              onClick={() => setViewMode('por_medico')}
              className={`px-4 py-2 text-sm font-medium ${viewMode === 'por_medico' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Por médico
            </button>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-slate-600 hover:text-emerald-600 underline"
            >
              Limpar filtros
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportToICS(filteredAppointments.map((a) => ({
                id: a.id,
                patient_name: a.patient?.full_name,
                patient_email: a.patient?.email,
                doctor_name: a.doctor?.name,
                appointment_date: a.appointment_date,
                start_time: a.start_time,
                end_time: a.end_time,
                status: a.status,
              })))}
              disabled={filteredAppointments.length === 0}
              className="text-sm px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Exportar ICS
            </button>
            <button
              type="button"
              onClick={() => exportToCSV(filteredAppointments.map((a) => ({
                id: a.id,
                patient_name: a.patient?.full_name,
                patient_email: a.patient?.email,
                doctor_name: a.doctor?.name,
                appointment_date: a.appointment_date,
                start_time: a.start_time,
                end_time: a.end_time,
                status: a.status,
              })))}
              disabled={filteredAppointments.length === 0}
              className="text-sm px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Exportar CSV
            </button>
          </div>
          <span className="text-sm text-slate-500">
            {filteredAppointments.length} consulta{filteredAppointments.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Lista ou agrupado por médico */}
      <div className="space-y-4">
        {viewMode === 'lista' ? (
          filteredAppointments.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">Nenhuma consulta encontrada.</p>
          ) : (
            filteredAppointments.map((a) => <AppointmentCard key={a.id} a={a} />)
          )
        ) : (
          groupedByDoctor.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">Nenhuma consulta encontrada.</p>
          ) : (
            groupedByDoctor.map(([doctorName, apps]) => (
              <div key={doctorName} className="space-y-2">
                <h4 className="font-semibold text-emerald-800 border-b border-emerald-200 pb-2">
                  Dr(a). {doctorName} — {apps.length} consulta{apps.length !== 1 ? 's' : ''}
                </h4>
                <div className="space-y-2 pl-2 border-l-2 border-slate-200">
                  {apps.map((a) => (
                    <AppointmentCard key={a.id} a={a} />
                  ))}
                </div>
              </div>
            ))
          )
        )}
      </div>

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
