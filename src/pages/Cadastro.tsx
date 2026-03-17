import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { canAccessFullAgenda, isAdmin, isAttendant } from '../lib/auth'
import type { Profile } from '../types'

interface CadastroProps {
  profile?: Profile | null
  profileLoaded?: boolean
}

export default function Cadastro({ profile, profileLoaded = true }: CadastroProps) {
  const [isOnlyUser, setIsOnlyUser] = useState(false)
  const showCadastro = isAdmin(profile ?? null) || isAttendant(profile ?? null) || isOnlyUser
  const showAgenda = canAccessFullAgenda(profile ?? null)

  useEffect(() => {
    if (!profileLoaded || !profile) return
    supabase.from('profiles').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setIsOnlyUser(count === 1)
    })
  }, [profileLoaded, profile])

  if (!profileLoaded) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 text-slate-600 flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-emerald-600" />
        Carregando...
      </div>
    )
  }

  if (!showCadastro) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 text-amber-800 space-y-4">
        <p>Acesso restrito. Cadastro disponível apenas para administradores e secretárias.</p>
        <p className="text-sm">
          Se você é o administrador e completou o setup, execute no Supabase (SQL Editor):
        </p>
        <pre className="p-3 bg-amber-100 rounded text-xs overflow-x-auto">
{`UPDATE profiles p
SET role = 'admin'::public.user_role
FROM roles r
WHERE p.role_id = r.id AND r.name = 'Administrador'
  AND (p.role IS NULL OR p.role::text != 'admin');`}
        </pre>
        <div className="flex flex-wrap gap-4">
          <Link to="/setup" className="inline-block text-sm font-medium text-emerald-700 hover:underline">
            Configuração inicial (completar como administrador)
          </Link>
          <span className="text-sm text-amber-700">Após corrigir, atualize a página (F5).</span>
        </div>
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
