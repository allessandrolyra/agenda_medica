import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import type { Profile } from '../types'
import { isAdmin, isAttendant } from '../lib/auth'
import AdminDoctors from './admin/AdminDoctors'
import AdminRoles from './admin/AdminRoles'
import AdminUsers from './admin/AdminUsers'
import AdminSlots from './admin/AdminSlots'
import AdminAppointments from './admin/AdminAppointments'

interface AdminProps {
  profile?: Profile | null
}

export default function Admin({ profile }: AdminProps) {
  const loc = useLocation()
  const base = '/admin'
  const admin = isAdmin(profile ?? null)
  const attendant = isAttendant(profile ?? null)
  const attendantOnly = attendant && !admin

  const linkClass = (path: string) =>
    `min-h-[44px] flex items-center px-3 py-2 rounded-lg ${
      loc.pathname === path ? 'font-semibold text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
    }`

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        {attendantOnly ? 'Recepção' : 'Painel Administrativo'}
      </h1>
      <nav className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
        {!attendantOnly && (
          <>
            <Link to={`${base}`} className={linkClass(base)}>
              Médicos
            </Link>
            <Link to={`${base}/funcoes`} className={linkClass(`${base}/funcoes`)}>
              Funções
            </Link>
            <Link to={`${base}/horarios`} className={linkClass(`${base}/horarios`)}>
              Horários
            </Link>
          </>
        )}
        <Link to={`${base}/usuarios`} className={linkClass(`${base}/usuarios`)}>
          Usuários
        </Link>
        <Link to={`${base}/consultas`} className={linkClass(`${base}/consultas`)}>
          Consultas
        </Link>
      </nav>
      <Routes>
        <Route index element={attendantOnly ? <Navigate to={`${base}/consultas`} replace /> : <AdminDoctors />} />
        <Route path="funcoes" element={admin ? <AdminRoles /> : <Navigate to={`${base}/consultas`} replace />} />
        <Route path="usuarios" element={<AdminUsers />} />
        <Route path="horarios" element={admin ? <AdminSlots /> : <Navigate to={`${base}/consultas`} replace />} />
        <Route path="consultas" element={<AdminAppointments />} />
      </Routes>
    </div>
  )
}
