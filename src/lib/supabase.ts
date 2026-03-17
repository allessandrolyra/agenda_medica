import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!url || !anonKey) {
  console.warn('Supabase não configurado. Configure .env.local')
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder')
