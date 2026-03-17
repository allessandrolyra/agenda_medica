// Supabase Edge Function - Enviar confirmação por email
// Deploy: supabase functions deploy send-confirmation
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })
  try {
    const { email, patientName, doctorName, date, time } = await req.json()
    if (!email || !patientName || !doctorName || !date || !time) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios faltando' }), { status: 400 })
    }
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY não configurada - simulando envio')
      return new Response(JSON.stringify({ ok: true, simulated: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Agenda Médica <noreply@seudominio.com>',
        to: email,
        subject: 'Consulta agendada - Confirmação',
        html: `
          <h2>Consulta agendada</h2>
          <p>Olá, ${patientName}!</p>
          <p>Sua consulta com <strong>${doctorName}</strong> foi agendada para:</p>
          <p><strong>${date}</strong> às <strong>${time}</strong></p>
          <p>Em caso de necessidade de cancelamento, acesse o sistema.</p>
        `,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data))
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
