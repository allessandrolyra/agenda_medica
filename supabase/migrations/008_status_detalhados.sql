-- Migration: Status detalhados para consultas
-- Adiciona novos valores ao enum appointment_status
-- Valores atuais: agendada, confirmada, cancelada, realizada
-- Novos: pending_confirmation, in_progress, no_show
-- PostgreSQL 12+: ADD VALUE IF NOT EXISTS suportado dentro de transação

ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'pending_confirmation';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'no_show';

COMMENT ON TYPE appointment_status IS 'agendada|pending_confirmation|confirmada|in_progress|realizada|no_show|cancelada';
