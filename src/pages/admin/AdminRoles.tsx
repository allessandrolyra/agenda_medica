import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Role } from '../../types'

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', permissions: '' })
  const [editing, setEditing] = useState<Role | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase.from('roles').select('*').order('name')
    setRoles((data || []).map((r) => ({ ...r, permissions: r.permissions || [] })))
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing?.is_system) return
    const perms = form.permissions ? form.permissions.split(',').map((p) => p.trim()).filter(Boolean) : []
    if (editing) {
      await supabase.from('roles').update({
        name: form.name,
        description: form.description || null,
        permissions: perms,
      }).eq('id', editing.id)
      setEditing(null)
    } else {
      await supabase.from('roles').insert({
        name: form.name,
        description: form.description || null,
        permissions: perms,
        is_system: false,
      })
    }
    setForm({ name: '', description: '', permissions: '' })
    load()
  }

  const handleEdit = (r: Role) => {
    if (r.is_system) return
    setEditing(r)
    setForm({
      name: r.name,
      description: r.description || '',
      permissions: Array.isArray(r.permissions) ? r.permissions.join(', ') : '',
    })
  }

  if (loading) return <div className="animate-pulse">Carregando...</div>

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-white border border-slate-200 space-y-4 max-w-md">
        <h3 className="font-semibold">{editing ? 'Editar função' : 'Nova função'}</h3>
        <input
          type="text"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          disabled={!!editing?.is_system}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          placeholder="Permissões (ex: users.read, appointments.create)"
          value={form.permissions}
          onChange={(e) => setForm((f) => ({ ...f, permissions: e.target.value }))}
          disabled={!!editing?.is_system}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={!!editing?.is_system}
            className="min-h-[44px] px-4 py-3 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
          >
            {editing ? 'Salvar' : 'Adicionar'}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className="min-h-[44px] px-4 py-3 rounded-lg bg-slate-200">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {roles.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="font-medium">
                {r.name}
                {r.is_system && <span className="ml-2 text-xs text-slate-500">(sistema)</span>}
              </p>
              {r.description && <p className="text-sm text-slate-500">{r.description}</p>}
              {Array.isArray(r.permissions) && r.permissions.length > 0 && (
                <p className="text-xs text-slate-400 mt-1">{r.permissions.join(', ')}</p>
              )}
            </div>
            {!r.is_system && (
              <button
                onClick={() => handleEdit(r)}
                className="min-h-[44px] px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 self-start sm:self-center"
              >
                Editar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
