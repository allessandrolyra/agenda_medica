export type UserRole = 'paciente' | 'admin'
export type AppointmentStatus = 'agendada' | 'confirmada' | 'cancelada' | 'realizada'

export interface Specialty {
  id: string
  name: string
  is_system: boolean
  created_at?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  is_system: boolean
  permissions: string[]
  created_at?: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role?: UserRole
  role_id?: string
  role_detail?: Role
  can_self_book?: boolean
  data_consent: boolean
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: string
  name: string
  specialty?: string | Specialty
  specialty_id?: string
  user_id?: string
  default_duration_minutes: number
  is_active: boolean
  created_at: string
}

export interface AvailabilitySlot {
  id: string
  doctor_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
  doctor?: Doctor
}
