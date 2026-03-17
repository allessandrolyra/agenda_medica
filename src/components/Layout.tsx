import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { canAccessFullAgenda, canSelfBook, isAdmin, isAttendant } from '../lib/auth'
import type { Profile } from '../types'

interface LayoutProps {
  user: User | null
  profile?: Profile | null
}

const navLinkClass = 'block py-3 text-slate-600 hover:text-emerald-600 min-h-[44px] flex items-center'

export default function Layout({ user, profile }: LayoutProps) {
  const showAgenda = canAccessFullAgenda(profile ?? null)
  const showAgendar = canSelfBook(profile ?? null)
  const showAdmin = isAdmin(profile ?? null) || isAttendant(profile ?? null)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    navigate('/')
  }

  const closeMenu = () => setMenuOpen(false)

  const NavLinks = () => (
    <>
      <Link to="/" className={navLinkClass} onClick={closeMenu}>
        Início
      </Link>
      <Link to="/health" className={navLinkClass} onClick={closeMenu}>
        Health
      </Link>
          {user ? (
        <>
          <Link to="/dashboard" className={navLinkClass} onClick={closeMenu}>
            Painel
          </Link>
          {showAdmin && (
            <>
              <Link to="/cadastro" className={navLinkClass} onClick={closeMenu}>
                Cadastro
              </Link>
              <Link to="/admin" className={navLinkClass} onClick={closeMenu}>
                {isAdmin(profile ?? null) ? 'Admin' : 'Recepção'}
              </Link>
            </>
          )}
          {showAgenda && (
            <Link to="/agenda" className={navLinkClass} onClick={closeMenu}>
              Agenda completa
            </Link>
          )}
          {showAgendar && !showAgenda && (
            <Link to="/agendar" className={navLinkClass} onClick={closeMenu}>
              Agendar
            </Link>
          )}
          <Link to="/minhas-consultas" className={navLinkClass} onClick={closeMenu}>
            Minhas Consultas
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left py-3 min-h-[44px] px-0 text-slate-600 hover:text-emerald-600 rounded-lg bg-transparent hover:bg-slate-100 border-0"
          >
            Sair
          </button>
        </>
      ) : (
        <>
          <Link to="/setup" className={navLinkClass} onClick={closeMenu}>
            Configuração inicial
          </Link>
          <Link to="/login" className={navLinkClass} onClick={closeMenu}>
            Entrar
          </Link>
          <Link
            to="/register"
            className="block py-3 min-h-[44px] flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={closeMenu}
          >
            Cadastrar
          </Link>
        </>
      )}
    </>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-emerald-700">
            Agenda Médica
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/" className="py-3 text-slate-600 hover:text-emerald-600">
              Início
            </Link>
            <Link to="/health" className="py-3 text-slate-600 hover:text-emerald-600">
              Health
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="py-3 text-slate-600 hover:text-emerald-600">
                  Painel
                </Link>
                {showAdmin && (
                  <>
                    <Link to="/cadastro" className="py-3 text-slate-600 hover:text-emerald-600">
                      Cadastro
                    </Link>
                    <Link to="/admin" className="py-3 text-slate-600 hover:text-emerald-600">
                      {isAdmin(profile ?? null) ? 'Admin' : 'Recepção'}
                    </Link>
                  </>
                )}
                {showAgenda && (
                  <Link to="/agenda" className="py-3 text-slate-600 hover:text-emerald-600">
                    Agenda completa
                  </Link>
                )}
                {showAgendar && !showAgenda && (
                  <Link to="/agendar" className="py-3 text-slate-600 hover:text-emerald-600">
                    Agendar
                  </Link>
                )}
                <Link to="/minhas-consultas" className="py-3 text-slate-600 hover:text-emerald-600">
                  Minhas Consultas
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 min-h-[44px] rounded-lg bg-slate-100 hover:bg-slate-200 text-sm"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/setup" className="py-3 text-slate-600 hover:text-emerald-600">
                  Configuração inicial
                </Link>
                <Link to="/login" className="py-3 text-slate-600 hover:text-emerald-600">
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-3 min-h-[44px] flex items-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden p-3 min-h-[44px] min-w-[44px] rounded-lg hover:bg-slate-100 flex flex-col justify-center gap-1.5"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-6 h-0.5 bg-slate-700 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
            />
            <span
              className={`block w-6 h-0.5 bg-slate-700 transition-opacity ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block w-6 h-0.5 bg-slate-700 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
            />
          </button>
        </nav>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <>
            <div
              className="sm:hidden fixed inset-0 bg-black/30 z-40"
              onClick={closeMenu}
              aria-hidden="true"
            />
            <div
              className="sm:hidden fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl z-50 p-4 flex flex-col gap-1"
              role="dialog"
              aria-label="Menu de navegação"
            >
              <NavLinks />
            </div>
          </>
        )}
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
        Agenda Médica Online &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
