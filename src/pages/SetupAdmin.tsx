import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export default function SetupAdmin() {
  const navigate = useNavigate()
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [setupDone, setSetupDone] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const [adminRes, sessionRes] = await Promise.all([
          supabase.rpc('has_admin'),
          supabase.auth.getSession(),
        ])
        setSetupDone(adminRes.data === true)
        setHasSession(!!sessionRes.data?.session)
      } catch {
        setSetupDone(false)
        setHasSession(false)
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            role: 'paciente',
            data_consent: true,
          },
        },
      })
      if (error) throw error
      if (!data.user) throw new Error('Erro ao criar conta')

      if (data.session) {
        const { error: rpcError } = await supabase.rpc('create_initial_admin', {
          p_full_name: form.fullName,
        })
        if (rpcError) throw rpcError
        logger.info('Administrador inicial cadastrado', { email: form.email })
        navigate('/dashboard')
      } else {
        setNeedsConfirm(true)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar'
      setError(msg)
      logger.error('Erro no setup admin', { email: form.email, msg })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[200px] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-emerald-600" />
        <p className="text-slate-600">Verificando...</p>
      </div>
    )
  }

  if (needsConfirm) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Confirme seu email</h2>
        <div className="p-6 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-amber-800 mb-4">
            Enviamos um link de confirmação para <strong>{form.email}</strong>. Clique no link no seu email e depois retorne aqui para fazer login e completar a configuração.
          </p>
          <Link
            to="/login"
            className="inline-block min-h-[44px] px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    )
  }

  const handleCompleteSetup = async () => {
    setCompleting(true)
    setError('')
    try {
      const { error: rpcError } = await supabase.rpc('create_initial_admin')
      if (rpcError) throw rpcError
      navigate('/dashboard')
      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao completar')
    } finally {
      setCompleting(false)
    }
  }

  if (setupDone) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Setup já concluído</h2>
        <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-emerald-800 mb-4">
            O administrador inicial já foi cadastrado. Faça login para acessar o painel.
          </p>
          <Link
            to="/login"
            className="inline-block min-h-[44px] px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    )
  }

  if (hasSession && !setupDone) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Completar configuração</h2>
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-slate-700 mb-4">
            Você já está logado. Clique no botão abaixo para ser configurado como administrador da clínica.
          </p>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
          <button
            onClick={handleCompleteSetup}
            disabled={completing}
            className="w-full min-h-[44px] py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {completing ? 'Configurando...' : 'Completar como administrador'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Configuração inicial</h2>
      <p className="text-slate-600 mb-6">
        Cadastre o primeiro administrador da clínica. Este usuário terá acesso total ao sistema.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
          <input
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            required
            placeholder="Ex: Maria Silva"
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            placeholder="admin@clinica.com"
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar administrador'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Já tem conta? <Link to="/login" className="text-emerald-600 hover:underline">Entrar</Link>
      </p>
    </div>
  )
}
