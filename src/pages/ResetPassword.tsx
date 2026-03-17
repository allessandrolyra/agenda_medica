import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setHasSession(true)
        return
      }
      const hasRecoveryHash = typeof window !== 'undefined' && /type=recovery|access_token/.test(window.location.hash)
      if (hasRecoveryHash) {
        await new Promise((r) => setTimeout(r, 1500))
        const { data: { session: s2 } } = await supabase.auth.getSession()
        setHasSession(!!s2)
      } else {
        setHasSession(false)
      }
    }
    check()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      logger.info('Senha redefinida com sucesso')
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao redefinir senha'
      setError(msg)
      logger.error('Erro ao redefinir senha', { msg })
    } finally {
      setLoading(false)
    }
  }

  if (hasSession === null) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[200px] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-emerald-600" />
        <p className="text-slate-600">Verificando...</p>
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Link inválido ou expirado</h2>
        <div className="p-6 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-amber-800 mb-4">
            O link para redefinir a senha expirou ou já foi usado. Solicite um novo link.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block min-h-[44px] px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
          >
            Solicitar novo link
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          <Link to="/login" className="text-emerald-600 hover:underline">Voltar ao login</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Nova senha</h2>
      <p className="text-slate-600 mb-6">
        Digite e confirme sua nova senha.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nova senha</label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar senha</label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Repita a senha"
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        <Link to="/login" className="text-emerald-600 hover:underline">Voltar ao login</Link>
      </p>
    </div>
  )
}
