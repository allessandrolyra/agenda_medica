-- Migration: LGPD - consent_version e consent_at
-- Registra versão e data do consentimento para conformidade

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '1.0';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.consent_version IS 'Versão do termo de consentimento aceito';
COMMENT ON COLUMN profiles.consent_at IS 'Data/hora em que o consentimento foi dado';

-- Backfill: se data_consent=true e consent_at é null, usar created_at
UPDATE profiles SET consent_at = created_at, consent_version = '1.0'
WHERE data_consent = true AND consent_at IS NULL;
