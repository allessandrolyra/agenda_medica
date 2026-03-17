-- ============================================
-- Seed: Especialidades e Funções pré-cadastradas
-- Execute após schema/migrations
-- ============================================

-- Especialidades
INSERT INTO specialties (name, is_system) VALUES
  ('Clínica Geral', true),
  ('Cardiologia', true),
  ('Dermatologia', true),
  ('Endocrinologia', true),
  ('Gastroenterologia', true),
  ('Ginecologia e Obstetrícia', true),
  ('Neurologia', true),
  ('Oftalmologia', true),
  ('Ortopedia', true),
  ('Otorrinolaringologia', true),
  ('Pediatria', true),
  ('Pneumologia', true),
  ('Psiquiatria', true),
  ('Urologia', true)
ON CONFLICT (name) DO NOTHING;

-- Funções (roles)
INSERT INTO roles (name, description, is_system, permissions) VALUES
  ('Administrador', 'Acesso total ao sistema', true, '["users.create","users.read","users.update","users.delete","roles.manage","doctors.manage","slots.manage","appointments.manage"]'::jsonb),
  ('Médico', 'Profissional de saúde - agenda e consultas', true, '["appointments.read","appointments.confirm","slots.read"]'::jsonb),
  ('Atendente', 'Recepção - cadastro e agendamento', true, '["users.create","users.read","doctors.read","slots.read","appointments.create","appointments.read","appointments.update"]'::jsonb),
  ('Paciente', 'Usuário final - agendar e cancelar consultas', true, '["appointments.create","appointments.read","appointments.cancel"]'::jsonb)
ON CONFLICT (name) DO NOTHING;
