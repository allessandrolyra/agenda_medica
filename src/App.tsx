import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile, Role } from './types'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import Admin from './pages/Admin'
import AttendantAgenda from './pages/AttendantAgenda'
import Cadastro from './pages/Cadastro'
import SetupAdmin from './pages/SetupAdmin'
import Health from './pages/Health'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ])
        if (!cancelled) setUser(session?.user ?? null)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    const timeout = setTimeout(() => setLoading(false), 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      cancelled = true
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setProfileLoaded(false)
      return
    }
    let cancelled = false
    setProfileLoaded(false)
    const load = async () => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user!.id)
          .single()

        if (cancelled) return
        if (error) throw error
        let p = profileData as Profile | null
        if (!p) {
          setProfile(null)
          setProfileLoaded(true)
          return
        }
        if (p.role_id) {
          const { data: roleData } = await supabase.from('roles').select('id, name').eq('id', p.role_id).single()
          if (cancelled) return
          if (roleData) p = { ...p, role_detail: roleData as Role }
        }
        setProfile(p)
      } catch {
        if (!cancelled) setProfile(null)
      } finally {
        if (!cancelled) setProfileLoaded(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-emerald-600" />
        <p className="text-slate-600">Carregando...</p>
      </div>
    )
  }

  const basename = import.meta.env.VITE_APP_BASENAME || import.meta.env.BASE_URL || '/'
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Layout user={user} profile={profile} />}>
          <Route index element={<Home />} />
          <Route path="login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="setup" element={<SetupAdmin />} />
          <Route
            path="dashboard"
            element={user ? <Dashboard profile={profile} /> : <Navigate to="/login" />}
          />
          <Route
            path="agendar"
            element={user ? <BookAppointment profile={profile} /> : <Navigate to="/login" />}
          />
          <Route
            path="minhas-consultas"
            element={user ? <MyAppointments /> : <Navigate to="/login" />}
          />
          <Route path="agenda" element={user ? <AttendantAgenda profile={profile} /> : <Navigate to="/login" />} />
          <Route path="cadastro" element={user ? <Cadastro profile={profile} profileLoaded={profileLoaded} /> : <Navigate to="/login" />} />
          <Route path="admin/*" element={user ? <Admin profile={profile} /> : <Navigate to="/login" />} />
          <Route path="health" element={<Health />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
