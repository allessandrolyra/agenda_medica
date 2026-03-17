// Supabase Edge Function - Health check
// Deploy: supabase functions deploy health
// URL: https://seu-projeto.supabase.co/functions/v1/health
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers })
  }
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0',
    service: 'agenda-medica',
  }
  return new Response(JSON.stringify(health), { status: 200, headers })
})
