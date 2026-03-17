import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { isAdmin } from '../../lib/auth'
import type { Profile, Role } from '../../types'

type ProfileWithRole = Profile & { role_detail?: Role }

interface Props {
  profile?: Profile | null
}

export default function AdminUsuariosPrivilegios({ profile }: Props) {
  const [users, setUsers] = useState<ProfileWithRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('id, email, full_name, phone, role, role_id, can_self_book, created_at').order('full_name'),
      supabase.from('roles').select('id, name, description, permissions'),
    ])
    const profiles = (profilesRes.data || []) as ProfileWithRole[]
    const roles = (rolesRes.data || []) as Role[]
    const roleMap = new Map(roles.map((r) => [r.id, r]))
    const merged = profiles.map((p) => ({
      ...p,
      role_detail: p.role_id ? roleMap.get(p.role_id) : undefined,
    }))
    setUsers(merged)
    setLoading(false)
  }

  if (!isAdmin(profile ?? null)) {
    return <Navigate to="/admin/consultas" replace />
  }

  if (loading) return <div className="animate-pulse">Carregando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Usuários e privilégios</h2>
        <p className="text-sm text-slate-600">
          Lista de todos os usuários cadastrados e suas funções/permissões.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-200 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-left p-3 font-semibold text-slate-700 border-b border-slate-200">Nome</th>
              <th className="text-left p-3 font-semibold text-slate-700 border-b border-slate-200">Email</th>
              <th className="text-left p-3 font-semibold text-slate-700 border-b border-slate-200">Função</th>
              <th className="text-left p-3 font-semibold text-slate-700 border-b border-slate-200">Privilégios</th>
              <th className="text-left p-3 font-semibold text-slate-700 border-b border-slate-200">Agendar online</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">{u.full_name}</td>
                <td className="p-3 text-slate-600">{u.email}</td>
                <td className="p-3">
                  <span className="inline-block px-2 py-1 rounded text-sm font-medium bg-emerald-100 text-emerald-800">
                    {u.role_detail?.name || u.role || '-'}
                  </span>
                </td>
                <td className="p-3">
                  {u.role_detail?.permissions?.length ? (
                    <ul className="text-xs text-slate-600 space-y-0.5">
                      {(u.role_detail.permissions as string[]).slice(0, 5).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                      {(u.role_detail.permissions as string[]).length > 5 && (
                        <li className="text-slate-400">+{u.role_detail.permissions.length - 5} mais</li>
                      )}
                    </ul>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="p-3">
                  {u.role_detail?.name === 'Paciente' ? (
                    u.can_self_book ? (
                      <span className="text-emerald-600 text-sm">Sim</span>
                    ) : (
                      <span className="text-slate-500 text-sm">Não</span>
                    )
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="text-slate-500 py-8 text-center">Nenhum usuário cadastrado.</p>
      )}
    </div>
  )
}
