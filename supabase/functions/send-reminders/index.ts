// Edge Function: Lembretes de consulta (48h e 24h antes)
// Chamada por pg_cron diariamente
// Deploy: supabase functions deploy send-reminders
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }

const RETRY_MAX = 3
const RETRY_DELAY_MS = 2000

async function sendEmail(
  resendKey: string,
  to: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
  hoursUntil: number
): Promise<{ ok: boolean; error?: string }> {
  const subject = `Lembrete: Consulta em ${hoursUntil}h - ${doctorName}`
  const html = `
    <h2>Lembrete de consulta</h2>
    <p>Olá, ${patientName}!</p>
    <p>Sua consulta com <strong>${doctorName}</strong> está agendada para:</p>
    <p><strong>${date}</strong> às <strong>${time}</strong></p>
    <p>Faltam aproximadamente ${hoursUntil} horas. Não esqueça!</p>
    <p>Em caso de necessidade de cancelamento, acesse o sistema com antecedência.</p>
  `
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Agenda Médica <noreply@seudominio.com>',
        to,
        subject,
        html,
      }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: JSON.stringify(data) }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  try {
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!serviceKey || !supabaseUrl) {
      return new Response(JSON.stringify({ error: 'Configuração incompleta' }), { status: 500, headers: cors })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Consultas confirmadas ou agendadas nas próximas 48h e 24h
    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const dateFrom = now.toISOString().slice(0, 10)
    const dateTo = in48h.toISOString().slice(0, 10)

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        patient_id,
        doctor_id
      `)
      .in('status', ['agendada', 'confirmada'])
      .gte('appointment_date', dateFrom)
      .lte('appointment_date', dateTo)

    if (error) {
      console.error('Erro ao buscar consultas:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors })
    }

    let sent = 0
    let failed = 0

    for (const apt of appointments || []) {
      const { data: patient } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', apt.patient_id)
        .single()
      const { data: doctor } = await supabase
        .from('doctors')
        .select('name')
        .eq('id', apt.doctor_id)
        .single()
      const email = patient?.email
      if (!email) continue

      const aptDate = new Date(`${apt.appointment_date}T${apt.start_time}`)
      const diffHours = (aptDate.getTime() - now.getTime()) / (60 * 60 * 1000)
      let hoursUntil = 24
      if (diffHours <= 26 && diffHours >= 22) hoursUntil = 24
      else if (diffHours <= 50 && diffHours >= 46) hoursUntil = 48
      else continue

      // Verificar se já enviou
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('appointment_id', apt.id)
        .eq('type', 'email')
        .eq('status', 'sent')
        .single()
      if (existing) continue

      let lastError = ''
      for (let attempt = 0; attempt < RETRY_MAX; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        const result = resendKey
          ? await sendEmail(
              resendKey,
              email,
              patient?.full_name ?? 'Paciente',
              doctor?.name ?? 'Médico',
              new Date(apt.appointment_date).toLocaleDateString('pt-BR'),
              String(apt.start_time).slice(0, 5),
              hoursUntil
            )
          : { ok: true }

        if (result.ok) {
          await supabase.from('notifications').insert({
            appointment_id: apt.id,
            type: 'email',
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          sent++
          break
        }
        lastError = result.error || 'Erro desconhecido'
      }
      if (!lastError) continue
      await supabase.from('notifications').insert({
        appointment_id: apt.id,
        type: 'email',
        status: 'failed',
        provider_response: lastError,
        retry_count: RETRY_MAX,
      })
      failed++
    }

    return new Response(
      JSON.stringify({
        ok: true,
        sent,
        failed,
        total: (appointments || []).length,
        simulated: !resendKey,
      }),
      { status: 200, headers: cors }
    )
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors })
  }
})
