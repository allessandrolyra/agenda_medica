import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Metrics = {
  total_agendadas: number
  total_confirmadas: number
  total_canceladas: number
  total_realizadas: number
  taxa_cancelamento: number
  consultas_proximos_7_dias: { doctor_name: string; total: number }[]
  por_dia: Record<string, number>
  periodo: { de: string; ate: string }
}

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setError('')
    const dateTo = new Date()
    dateTo.setDate(dateTo.getDate() + 7)
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - 30)
    const { data, error: err } = await supabase.rpc('get_admin_metrics', {
      p_date_from: dateFrom.toISOString().slice(0, 10),
      p_date_to: dateTo.toISOString().slice(0, 10),
    })
    if (err) {
      setError(err.message)
      setMetrics(null)
    } else {
      setMetrics(data as Metrics)
    }
    setLoading(false)
  }

  if (loading) return <div className="animate-pulse">Carregando...</div>
  if (error) return <div className="p-4 rounded-lg bg-red-50 text-red-700">{error}</div>
  if (!metrics) return null

  const byDoctor = metrics.consultas_proximos_7_dias || []

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Métricas (últimos 30 dias + próximos 7)</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-700">Agendadas</p>
          <p className="text-2xl font-bold text-amber-800">{metrics.total_agendadas}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-sm text-emerald-700">Confirmadas</p>
          <p className="text-2xl font-bold text-emerald-800">{metrics.total_confirmadas}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-600">Canceladas</p>
          <p className="text-2xl font-bold text-slate-800">{metrics.total_canceladas}</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-700">Realizadas</p>
          <p className="text-2xl font-bold text-blue-800">{metrics.total_realizadas}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-sm text-slate-600">Taxa de cancelamento</p>
        <p className="text-2xl font-bold text-slate-800">{metrics.taxa_cancelamento}%</p>
      </div>

      {byDoctor.length > 0 && (
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <h3 className="font-semibold mb-3">Próximos 7 dias por médico</h3>
          <ul className="space-y-2">
            {byDoctor.map((d: { doctor_name: string; total: number }) => (
              <li key={d.doctor_name} className="flex justify-between">
                <span>{d.doctor_name}</span>
                <span className="font-medium">{d.total} consulta{d.total !== 1 ? 's' : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
