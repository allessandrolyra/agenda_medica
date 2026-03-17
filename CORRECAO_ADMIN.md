# Correção definitiva: Admin não visualiza usuários / Acesso restrito

Se você vê "Acesso restrito", não consegue listar usuários ou cadastrar, mesmo com `role=admin` no banco, execute o SQL abaixo no **Supabase → SQL Editor**.

> **Arquivo completo:** `supabase/RECUPERAR_RLS_ADMIN.sql`

## Passo 1: Executar o SQL de correção

Copie e execute todo o bloco no SQL Editor do Supabase:

```sql
-- Corrige admin: role_id = Administrador OU único usuário
DO $$
DECLARE
  v_admin_role_id UUID;
  v_total_profiles INT;
BEGIN
  SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'Administrador' LIMIT 1;
  IF v_admin_role_id IS NULL THEN
    RAISE NOTICE 'Tabela roles não encontrada. Execute as migrations primeiro.';
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_total_profiles FROM public.profiles;

  -- Caso 1: role_id aponta para Administrador mas role != 'admin'
  UPDATE public.profiles p
  SET role = 'admin'::public.user_role
  WHERE p.role_id = v_admin_role_id
    AND (p.role IS NULL OR p.role::text != 'admin');

  -- Caso 2: único usuário no sistema -> tornar admin
  IF v_total_profiles = 1 THEN
    UPDATE public.profiles
    SET role = 'admin'::public.user_role,
        role_id = COALESCE(role_id, v_admin_role_id)
    WHERE role IS NULL OR role::text != 'admin';
  END IF;

  RAISE NOTICE 'Correção aplicada. Atualize a página (F5).';
END $$;
```

## Passo 2: Atualizar a página

Após executar, pressione **F5** no navegador para recarregar a aplicação.

## Se ainda não funcionar

1. **Verifique seu perfil**: No SQL Editor, execute:
   ```sql
   SELECT id, email, full_name, role, role_id FROM profiles;
   ```
   Confirme que sua linha tem `role = 'admin'` e `role_id` preenchido.

2. **Force admin para seu usuário** (substitua `SEU_EMAIL@exemplo.com`):
   ```sql
   UPDATE profiles p
   SET role = 'admin'::public.user_role,
       role_id = (SELECT id FROM roles WHERE name = 'Administrador' LIMIT 1)
   FROM auth.users u
   WHERE p.id = u.id AND u.email = 'SEU_EMAIL@exemplo.com';
   ```

3. **Execute a migration completa** `007_fix_admin_definitivo.sql` no Supabase (se usar migrations).
