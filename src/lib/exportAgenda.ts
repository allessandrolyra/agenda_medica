/**
 * Exporta consultas para ICS (Google/Outlook) e CSV
 */

type AppointmentExport = {
  id: string
  patient_name?: string
  patient_email?: string
  doctor_name?: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
}

function formatDateForICS(d: string, t: string): string {
  const [h, m] = (t || '00:00').slice(0, 5).split(':').map(Number)
  const date = new Date(d)
  date.setHours(h, m, 0, 0)
  return date.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
}

export function exportToICS(appointments: AppointmentExport[]): void {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agenda Medica//Consultas//PT',
    'CALSCALE:GREGORIAN',
  ]
  for (const a of appointments) {
    const start = formatDateForICS(a.appointment_date, a.start_time)
    const end = formatDateForICS(a.appointment_date, a.end_time)
    const summary = `Consulta - ${a.doctor_name || 'Médico'} - ${a.patient_name || 'Paciente'}`
    const desc = `Status: ${a.status}. Paciente: ${a.patient_name || '-'} (${a.patient_email || '-'})`
    lines.push(
      'BEGIN:VEVENT',
      `UID:${a.id}@agenda-medica`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc}`,
      'END:VEVENT'
    )
  }
  lines.push('END:VCALENDAR')
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `consultas-${new Date().toISOString().slice(0, 10)}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(appointments: AppointmentExport[]): void {
  const headers = ['Data', 'Horário', 'Médico', 'Paciente', 'Email', 'Status']
  const rows = appointments.map((a) => [
    a.appointment_date,
    `${(a.start_time || '').slice(0, 5)} - ${(a.end_time || '').slice(0, 5)}`,
    a.doctor_name || '',
    a.patient_name || '',
    a.patient_email || '',
    a.status || '',
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\r\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `consultas-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
