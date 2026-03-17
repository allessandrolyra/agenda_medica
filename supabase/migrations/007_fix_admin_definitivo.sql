-- ============================================
-- Migration: Correção definitiva do admin
-- Resolve: "Acesso restrito" / não visualizar usuários / não cadastrar
-- Execute no SQL Editor do Supabase se necessário
-- ============================================

-- 1. Função SECURITY DEFINER para verificar admin (evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role_id IN (SELECT id FROM public.roles WHERE name = 'Administrador'))
  );
$$;

-- 2. Função para verificar se é atendente ou admin
CREATE OR REPLACE FUNCTION public.current_user_is_attendant_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND (p.role = 'admin' OR r.name IN ('Administrador', 'Atendente'))
  );
$$;

-- 3. Corrigir admin: quem tem role_id = Administrador OU é o único usuário
DO $$
DECLARE
  v_admin_role_id UUID;
  v_total_profiles INT;
BEGIN
  SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'Administrador' LIMIT 1;
  IF v_admin_role_id IS NULL THEN RETURN; END IF;

  SELECT COUNT(*) INTO v_total_profiles FROM public.profiles;

  -- Caso 1: role_id aponta para Administrador mas role != 'admin'
  UPDATE public.profiles p
  SET role = 'admin'::public.user_role
  WHERE p.role_id = v_admin_role_id
    AND (p.role IS NULL OR p.role::text != 'admin');

  -- Caso 2: único usuário no sistema -> tornar admin (primeiro setup)
  IF v_total_profiles = 1 THEN
    UPDATE public.profiles
    SET role = 'admin'::public.user_role,
        role_id = COALESCE(role_id, v_admin_role_id)
    WHERE role IS NULL OR role::text != 'admin';
  END IF;
END $$;

-- 4. Atualizar policies para usar SECURITY DEFINER (evita recursão RLS)
DROP POLICY IF EXISTS "Admin vê perfis" ON profiles;
CREATE POLICY "Admin vê perfis" ON profiles
  FOR SELECT USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Atendente vê perfis" ON profiles;
CREATE POLICY "Atendente vê perfis" ON profiles
  FOR SELECT USING (public.current_user_is_attendant_or_admin());

-- Atendente atualiza can_self_book - usar função
DROP POLICY IF EXISTS "Atendente atualiza can_self_book" ON profiles;
CREATE POLICY "Atendente atualiza can_self_book" ON profiles
  FOR UPDATE
  USING (public.current_user_is_attendant_or_admin())
  WITH CHECK (true);
