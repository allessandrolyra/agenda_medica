-- Migration: Pacientes liberados para agendamento online
-- Pacientes precisam ser liberados pela secretária para agendar sozinhos

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_self_book BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.can_self_book IS 'Paciente liberado pela secretária para agendar consultas online';
