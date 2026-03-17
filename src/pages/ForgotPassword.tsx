import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

function getResetRedirectUrl(): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || ''
  return `${window.location.origin}${base}/reset-password`
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const redirectTo = getResetRedirectUrl()
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      setSent(true)
      logger.info('Email de redefinição enviado', { email })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar email'
      setError(msg)
      logger.error('Erro ao solicitar reset de senha', { email, msg })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Email enviado</h2>
        <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-emerald-800 mb-4">
            Enviamos um link para redefinir sua senha em <strong>{email}</strong>. Verifique sua caixa de entrada e o spam.
          </p>
          <Link
            to="/login"
            className="inline-block min-h-[44px] px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Esqueci a senha</h2>
      <p className="text-slate-600 mb-6">
        Informe seu email e enviaremos um link para redefinir sua senha.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        <Link to="/login" className="text-emerald-600 hover:underline">Voltar ao login</Link>
      </p>
    </div>
  )
}
