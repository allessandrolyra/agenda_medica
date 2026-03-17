-- ============================================
-- Agenda Médica - Schema Supabase
-- Execute no SQL Editor do Supabase
-- ============================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para status de consulta
CREATE TYPE appointment_status AS ENUM ('agendada', 'confirmada', 'cancelada', 'realizada');

-- Enum para roles
CREATE TYPE user_role AS ENUM ('paciente', 'admin');

-- Perfis de usuário (extensão do auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'paciente',
  data_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Médicos
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT,
  default_duration_minutes INT NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Horários disponíveis (slots) por médico
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=domingo
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doctor_id, day_of_week, start_time)
);

-- Bloqueios de agenda (feriados, férias)
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Consultas
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'agendada',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_overlap UNIQUE (doctor_id, appointment_date, start_time)
);

-- Índices para performance
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_availability_doctor ON availability_slots(doctor_id);
CREATE INDEX idx_blocked_dates ON blocked_dates(doctor_id, blocked_date);

-- Função para criar perfil ao registrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone, role, data_consent)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'paciente'),
    COALESCE((NEW.raw_user_meta_data->>'data_consent')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Paciente: vê e edita só seu perfil
CREATE POLICY "Paciente vê próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Paciente atualiza próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin: vê todos os perfis
CREATE POLICY "Admin vê perfis" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Médicos: leitura pública (para listar na agenda)
CREATE POLICY "Todos leem médicos ativos" ON doctors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin gerencia médicos" ON doctors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Slots: leitura para usuários autenticados
CREATE POLICY "Autenticados leem slots" ON availability_slots
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin gerencia slots" ON availability_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Bloqueios: leitura para autenticados
CREATE POLICY "Autenticados leem bloqueios" ON blocked_dates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin gerencia bloqueios" ON blocked_dates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Consultas: paciente vê/cancela as suas; admin vê/gerencia todas
CREATE POLICY "Paciente vê próprias consultas" ON appointments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Paciente cria consulta" ON appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Paciente cancela própria" ON appointments
  FOR UPDATE USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Admin gerencia consultas" ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Função para verificar conflito de horário
CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_doctor_id UUID,
  p_date DATE,
  p_start TIME,
  p_end TIME,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM appointments
    WHERE doctor_id = p_doctor_id
      AND appointment_date = p_date
      AND status != 'cancelada'
      AND (id IS NULL OR id != COALESCE(p_exclude_id, '00000000-0000-0000-0000-000000000000'::uuid))
      AND (
        (start_time < p_end AND end_time > p_start)
      )
  );
END;
$$ LANGUAGE plpgsql;
