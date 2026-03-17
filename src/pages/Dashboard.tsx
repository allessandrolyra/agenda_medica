import { Link } from 'react-router-dom'
import { canAccessFullAgenda, canSelfBook } from '../lib/auth'
import type { Profile } from '../types'

interface DashboardProps {
  profile?: Profile | null
}

export default function Dashboard({ profile }: DashboardProps) {
  const showAgenda = canAccessFullAgenda(profile ?? null)
  const showAgendar = canSelfBook(profile ?? null)

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Painel</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showAgenda && (
          <Link
            to="/agenda"
            className="block p-6 min-h-[100px] rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition"
          >
            <h3 className="font-semibold text-emerald-700 mb-2">Agenda completa</h3>
            <p className="text-sm text-slate-600">Visualize e agende consultas para os pacientes.</p>
          </Link>
        )}
        {showAgendar && !showAgenda && (
          <Link
            to="/agendar"
            className="block p-6 min-h-[100px] rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition"
          >
            <h3 className="font-semibold text-emerald-700 mb-2">Agendar consulta</h3>
            <p className="text-sm text-slate-600">Escolha o médico e horário disponível.</p>
          </Link>
        )}
        {!showAgendar && !showAgenda && (
          <div className="block p-6 min-h-[100px] rounded-xl bg-amber-50 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Solicitar agendamento</h3>
            <p className="text-sm text-amber-700">
              Entre em contato com a clínica para solicitar sua consulta. Após o cadastro, a secretária liberará o agendamento online.
            </p>
            <p className="text-sm text-amber-600 mt-2 font-medium">Telefone: (11) 1234-5678</p>
          </div>
        )}
        <Link
          to="/minhas-consultas"
          className="block p-6 min-h-[100px] rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition"
        >
          <h3 className="font-semibold text-emerald-700 mb-2">Minhas consultas</h3>
          <p className="text-sm text-slate-600">Visualize, confirme ou cancele.</p>
        </Link>
      </div>
    </div>
  )
}
