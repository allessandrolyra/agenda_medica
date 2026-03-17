import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from './types'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import Admin from './pages/Admin'
import AttendantAgenda from './pages/AttendantAgenda'
import SetupAdmin from './pages/SetupAdmin'
import Health from './pages/Health'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
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
      return
    }
    const load = async () => {
      try {
        const { data } = await supabase.from('profiles').select('*, role_detail:roles(id, name)').eq('id', user!.id).single()
        setProfile(data as Profile | null)
      } catch {
        setProfile(null)
      }
    }
    load()
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
          <Route path="admin/*" element={user ? <Admin profile={profile} /> : <Navigate to="/login" />} />
          <Route path="health" element={<Health />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
