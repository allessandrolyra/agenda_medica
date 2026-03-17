import { Routes, Route, Link, useLocation } from 'react-router-dom'
import AdminDoctors from './admin/AdminDoctors'
import AdminRoles from './admin/AdminRoles'
import AdminUsers from './admin/AdminUsers'
import AdminSlots from './admin/AdminSlots'
import AdminAppointments from './admin/AdminAppointments'

export default function Admin() {
  const loc = useLocation()
  const base = '/admin'

  const linkClass = (path: string) =>
    `min-h-[44px] flex items-center px-3 py-2 rounded-lg ${
      loc.pathname === path ? 'font-semibold text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
    }`

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Painel Administrativo</h1>
      <nav className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
        <Link to={`${base}`} className={linkClass(base)}>
          Médicos
        </Link>
        <Link to={`${base}/funcoes`} className={linkClass(`${base}/funcoes`)}>
          Funções
        </Link>
        <Link to={`${base}/usuarios`} className={linkClass(`${base}/usuarios`)}>
          Usuários
        </Link>
        <Link to={`${base}/horarios`} className={linkClass(`${base}/horarios`)}>
          Horários
        </Link>
        <Link to={`${base}/consultas`} className={linkClass(`${base}/consultas`)}>
          Consultas
        </Link>
      </nav>
      <Routes>
        <Route index element={<AdminDoctors />} />
        <Route path="funcoes" element={<AdminRoles />} />
        <Route path="usuarios" element={<AdminUsers />} />
        <Route path="horarios" element={<AdminSlots />} />
        <Route path="consultas" element={<AdminAppointments />} />
      </Routes>
    </div>
  )
}
