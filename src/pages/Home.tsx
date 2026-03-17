import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="text-center py-8 sm:py-16">
      <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-4 px-2">
        Agende sua consulta com facilidade
      </h1>
      <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto px-2">
        Sistema online para agendar, visualizar e cancelar consultas médicas.
        Cadastre-se, escolha o médico e horário disponível.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap px-4">
        <Link
          to="/register"
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
        >
          Cadastrar como paciente
        </Link>
        <Link
          to="/login"
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          Já tenho conta
        </Link>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Primeira vez na clínica?{' '}
        <Link to="/setup" className="text-emerald-600 hover:underline">
          Configuração inicial do administrador
        </Link>
      </p>
    </div>
  )
}
