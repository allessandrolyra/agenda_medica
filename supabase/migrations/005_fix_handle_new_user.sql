-- Migration: Corrige trigger handle_new_user para evitar "Database error saving new user"
-- Causas comuns: search_path, RLS, duplicatas, constraints
-- Ref: https://supabase.com/docs/guides/auth/managing-user-data

-- 1. Recria a função com SECURITY DEFINER e search_path explícito (recomendação Supabase)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, data_consent)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), 'Usuário'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'paciente'::public.user_role
    ),
    COALESCE((NEW.raw_user_meta_data->>'data_consent')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    data_consent = EXCLUDED.data_consent,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Garante que o trigger existe (pode já existir do schema.sql)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
