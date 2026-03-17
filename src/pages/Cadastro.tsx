import { Link } from 'react-router-dom'
import { canAccessFullAgenda, isAdmin, isAttendant } from '../lib/auth'
import type { Profile } from '../types'

interface CadastroProps {
  profile?: Profile | null
}

export default function Cadastro({ profile }: CadastroProps) {
  const showCadastro = isAdmin(profile ?? null) || isAttendant(profile ?? null)
  const showAgenda = canAccessFullAgenda(profile ?? null)

  if (!showCadastro) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 text-amber-800">
        Acesso restrito. Cadastro disponível apenas para administradores e secretárias.
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-2">Cadastro</h1>
      <p className="text-slate-600 mb-6">
        Cadastre usuários, pacientes e agende consultas.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/usuarios"
          className="block p-6 min-h-[120px] rounded-xl bg-white border-2 border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition"
        >
          <div className="text-2xl mb-2">👤</div>
          <h3 className="font-semibold text-emerald-700 mb-2">Cadastrar usuário</h3>
          <p className="text-sm text-slate-600">
            Cadastre médicos, atendentes, administradores ou outros perfis.
          </p>
        </Link>

        <Link
          to="/admin/usuarios?role=paciente"
          className="block p-6 min-h-[120px] rounded-xl bg-white border-2 border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition"
        >
          <div className="text-2xl mb-2">🏥</div>
          <h3 className="font-semibold text-emerald-700 mb-2">Cadastrar paciente</h3>
          <p className="text-sm text-slate-600">
            Cadastre novos pacientes para agendar consultas.
          </p>
        </Link>

        {showAgenda && (
          <Link
            to="/agenda"
            className="block p-6 min-h-[120px] rounded-xl bg-white border-2 border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition"
          >
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold text-emerald-700 mb-2">Agendar consulta</h3>
            <p className="text-sm text-slate-600">
              Marque consultas para os pacientes na agenda.
            </p>
          </Link>
        )}

        <Link
          to="/admin/consultas"
          className="block p-6 min-h-[120px] rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition"
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-semibold text-slate-800 mb-2">Ver consultas</h3>
          <p className="text-sm text-slate-600">
            Liste, filtre e gerencie todas as consultas.
          </p>
        </Link>
      </div>
    </div>
  )
}
