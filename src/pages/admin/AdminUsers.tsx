import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Profile, Role } from '../../types'

export default function AdminUsers() {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const [users, setUsers] = useState<(Profile & { role_detail?: Role })[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role_id: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const [rolesRes, usersRes] = await Promise.all([
      supabase.from('roles').select('*').order('name'),
      supabase.from('profiles').select('*, role_detail:roles(id, name, description)').order('full_name'),
    ])
    const rolesData = rolesRes.data || []
    setRoles(rolesData)
    setUsers((usersRes.data as (Profile & { role_detail?: Role })[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    if (roleParam === 'paciente' && roles.length > 0) {
      const pacienteRole = roles.find((r) => r.name === 'Paciente')
      if (pacienteRole) setForm((f) => ({ ...f, role_id: pacienteRole.id }))
    }
  }, [roleParam, roles])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const base = import.meta.env.VITE_SUPABASE_URL ? new URL(import.meta.env.VITE_SUPABASE_URL).origin : ''
    const fnUrl = base ? `${base}/functions/v1/create-user` : ''
    if (!fnUrl) {
      setError('Configure Supabase. Para criar usuários, deploy a Edge Function create-user.')
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role_id: form.role_id || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || 'Erro ao criar usuário')
      setSuccess('Usuário criado. Verifique o email para confirmar (se necessário).')
      setForm({ email: '', full_name: '', password: '', role_id: '' })
      load()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário')
    }
  }

  const handleUpdateRole = async (userId: string, roleId: string) => {
    const { error } = await supabase.from('profiles').update({ role_id: roleId || null, updated_at: new Date().toISOString() }).eq('id', userId)
    if (error) setError(error.message)
    else {
      setSuccess('Função atualizada.')
      load()
    }
  }

  if (loading) return <div className="animate-pulse">Carregando...</div>

  return (
    <div className="space-y-6">
      {error && <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      {success && <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 text-sm">{success}</div>}

      <form onSubmit={handleCreateUser} className="p-4 rounded-xl bg-white border border-slate-200 space-y-4 max-w-md">
        <h3 className="font-semibold">Novo usuário</h3>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          placeholder="Nome completo"
          value={form.full_name}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          required
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
          minLength={6}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={form.role_id}
          onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Selecione a função</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button type="submit" className="min-h-[44px] px-4 py-3 rounded-lg bg-emerald-600 text-white">
          Cadastrar usuário
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="font-semibold">Usuários cadastrados</h3>
        {users.map((u) => (
          <div
            key={u.id}
            className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="font-medium">{u.full_name}</p>
              <p className="text-sm text-slate-500">{u.email}</p>
              <p className="text-xs text-slate-400">{u.role_detail?.name || u.role || '-'}</p>
              {u.role_detail?.name === 'Paciente' && (
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={u.can_self_book ?? false}
                    onChange={(e) => {
                      supabase.from('profiles').update({ can_self_book: e.target.checked, updated_at: new Date().toISOString() }).eq('id', u.id).then(() => load())
                    }}
                    className="rounded"
                  />
                  Liberado para agendar online
                </label>
              )}
            </div>
            <select
              value={u.role_id || ''}
              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
              className="min-h-[44px] px-4 py-3 rounded-lg border border-slate-300 self-start sm:self-center"
            >
              <option value="">Sem função</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
