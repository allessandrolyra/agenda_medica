import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    dataConsent: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.dataConsent) {
      setError('É necessário aceitar o consentimento de dados (LGPD).')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            data_consent: form.dataConsent,
            role: 'paciente',
          },
        },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').update({
          full_name: form.fullName,
          phone: form.phone,
          data_consent: form.dataConsent,
          consent_version: '1.0',
          consent_at: form.dataConsent ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }).eq('id', data.user.id)
      }
      logger.info('Cadastro realizado', { email: form.email })
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar'
      setError(msg)
      logger.error('Erro no cadastro', { email: form.email, msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Cadastro de Paciente</h2>
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
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="(11) 99999-9999"
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
            className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-start gap-3 min-h-[44px]">
          <input
            type="checkbox"
            id="consent"
            checked={form.dataConsent}
            onChange={(e) => setForm((f) => ({ ...f, dataConsent: e.target.checked }))}
            className="mt-3 w-5 h-5 min-w-[20px] min-h-[20px] rounded border-slate-300"
          />
          <label htmlFor="consent" className="text-sm text-slate-600 pt-2 flex-1 cursor-pointer">
            Autorizo o uso dos meus dados pessoais conforme a LGPD para fins de agendamento e contato.
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Já tem conta? <Link to="/login" className="text-emerald-600 hover:underline">Entrar</Link>
      </p>
    </div>
  )
}
