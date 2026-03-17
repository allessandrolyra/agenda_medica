-- Migration: Garantir que admins tenham role = 'admin'
-- Execute no SQL Editor do Supabase se o menu Cadastro não aparecer
-- Corrige perfis com role_id de Administrador mas role = 'paciente'

UPDATE profiles p
SET role = 'admin'::public.user_role
FROM roles r
WHERE p.role_id = r.id
  AND r.name = 'Administrador'
  AND (p.role IS NULL OR p.role::text != 'admin');
