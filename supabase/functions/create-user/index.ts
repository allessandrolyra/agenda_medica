// Edge Function: Criar usuário (admin ou atendente)
// Requer: SUPABASE_SERVICE_ROLE_KEY
// Deploy: supabase functions deploy create-user
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: cors })
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceKey) return new Response(JSON.stringify({ error: 'Service role não configurada' }), { status: 500, headers: cors })
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401, headers: cors })
    const adminClient = createClient(supabaseUrl, serviceKey)
    const { data: profile } = await adminClient.from('profiles').select('role_id, role').eq('id', user.id).single()
    const canCreate = profile?.role === 'admin' ||
      (profile?.role_id && await checkRoleCanCreateUser(adminClient, profile.role_id))
    if (!canCreate) return new Response(JSON.stringify({ error: 'Sem permissão' }), { status: 403, headers: cors })
    const { email, password, full_name, role_id } = await req.json()
    if (!email || !password) return new Response(JSON.stringify({ error: 'Email e senha obrigatórios' }), { status: 400, headers: cors })
    const { data: newUser, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || email.split('@')[0] },
    })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: cors })
    if (newUser?.user && role_id) {
      await adminClient.from('profiles').update({ role_id, full_name: full_name || newUser.user.email }).eq('id', newUser.user.id)
    }
    return new Response(JSON.stringify({ ok: true, user_id: newUser?.user?.id }), { status: 200, headers: cors })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors })
  }
})

async function checkRoleCanCreateUser(supabase: any, roleId: string): Promise<boolean> {
  const { data } = await supabase.from('roles').select('name, permissions').eq('id', roleId).single()
  if (!data) return false
  if (data.name === 'Administrador') return true
  if (data.name === 'Atendente' && Array.isArray(data.permissions) && data.permissions.includes('users.create')) return true
  return false
}
