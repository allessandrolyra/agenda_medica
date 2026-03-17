-- ============================================
-- Migration: Roles, Especialidades, Usuários
-- Execute APÓS o schema.sql em projetos existentes
-- Para projeto novo: use schema_completo.sql
-- ============================================

-- 1. Especialidades
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Funções (roles)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Adicionar role_id em profiles (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role_id') THEN
    ALTER TABLE profiles ADD COLUMN role_id UUID REFERENCES roles(id);
  END IF;
END $$;

-- 4. Adicionar specialty_id e user_id em doctors
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'specialty_id') THEN
    ALTER TABLE doctors ADD COLUMN specialty_id UUID REFERENCES specialties(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'user_id') THEN
    ALTER TABLE doctors ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 5. Seed roles e specialties (para backfill funcionar)
INSERT INTO roles (name, description, is_system, permissions) VALUES
  ('Administrador', 'Acesso total ao sistema', true, '["users.create","users.read","users.update","users.delete","roles.manage","doctors.manage","slots.manage","appointments.manage"]'::jsonb),
  ('Médico', 'Profissional de saúde - agenda e consultas', true, '["appointments.read","appointments.confirm","slots.read"]'::jsonb),
  ('Atendente', 'Recepção - cadastro e agendamento', true, '["users.create","users.read","doctors.read","slots.read","appointments.create","appointments.read","appointments.update"]'::jsonb),
  ('Paciente', 'Usuário final - agendar e cancelar consultas', true, '["appointments.create","appointments.read","appointments.cancel"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO specialties (name, is_system) VALUES
  ('Clínica Geral', true), ('Cardiologia', true), ('Dermatologia', true), ('Endocrinologia', true),
  ('Gastroenterologia', true), ('Ginecologia e Obstetrícia', true), ('Neurologia', true), ('Oftalmologia', true),
  ('Ortopedia', true), ('Otorrinolaringologia', true), ('Pediatria', true), ('Pneumologia', true),
  ('Psiquiatria', true), ('Urologia', true)
ON CONFLICT (name) DO NOTHING;

-- 6. Backfill role_id para profiles existentes (se tiver coluna role)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    UPDATE profiles p SET role_id = r.id FROM roles r
    WHERE p.role_id IS NULL AND r.name = CASE p.role::text WHEN 'admin' THEN 'Administrador' ELSE 'Paciente' END;
  END IF;
END $$;

-- 7. Índices
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user ON doctors(user_id);

-- 8. RLS para novas tabelas
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos leem especialidades" ON specialties FOR SELECT USING (true);
CREATE POLICY "Admin gerencia especialidades" ON specialties FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'Administrador')
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Todos leem roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Admin gerencia roles" ON roles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'Administrador')
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
