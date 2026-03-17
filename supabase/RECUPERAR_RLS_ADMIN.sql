-- ============================================
-- Recuperação RLS e Admin - Execute no SQL Editor do Supabase
-- Use quando: login OK, role=admin no banco, mas Cadastro/lista não funciona
-- ============================================

-- 1. Criar funções SECURITY DEFINER (evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role_id IN (SELECT id FROM public.roles WHERE name = 'Administrador'))
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_attendant_or_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND (p.role = 'admin' OR r.name IN ('Administrador', 'Atendente'))
  );
$$;

-- 2. Garantir que admin tenha role correto
UPDATE public.profiles p
SET role = 'admin'::public.user_role
FROM public.roles r
WHERE p.role_id = r.id AND r.name = 'Administrador'
  AND (p.role IS NULL OR p.role::text != 'admin');

-- 3. Recriar policies usando as funções (evita recursão)
DROP POLICY IF EXISTS "Admin vê perfis" ON public.profiles;
CREATE POLICY "Admin vê perfis" ON public.profiles
  FOR SELECT USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Atendente vê perfis" ON public.profiles;
CREATE POLICY "Atendente vê perfis" ON public.profiles
  FOR SELECT USING (public.current_user_is_attendant_or_admin());

DROP POLICY IF EXISTS "Atendente atualiza can_self_book" ON public.profiles;
CREATE POLICY "Atendente atualiza can_self_book" ON public.profiles
  FOR UPDATE
  USING (public.current_user_is_attendant_or_admin())
  WITH CHECK (true);
