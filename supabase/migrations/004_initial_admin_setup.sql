-- Migration: Cadastro inicial do administrador
-- Permite que o primeiro usuário se cadastre como admin (setup da clínica)

-- Função: verifica se já existe algum administrador (pode ser chamada por anon)
CREATE OR REPLACE FUNCTION has_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE role = 'admin'
    OR role_id IN (SELECT id FROM roles WHERE name = 'Administrador')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: promove o usuário atual a administrador (apenas se não existir admin)
-- Deve ser chamada pelo próprio usuário logo após o cadastro
CREATE OR REPLACE FUNCTION create_initial_admin(p_full_name TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_admin_role_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Verifica se já existe admin
  IF has_admin() THEN
    RAISE EXCEPTION 'Administrador já cadastrado. Use a tela de login.';
  END IF;

  SELECT id INTO v_admin_role_id FROM roles WHERE name = 'Administrador' LIMIT 1;
  IF v_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Função Administrador não encontrada. Execute as migrations.';
  END IF;

  UPDATE profiles
  SET role = 'admin',
      role_id = v_admin_role_id,
      full_name = COALESCE(NULLIF(TRIM(p_full_name), ''), full_name),
      updated_at = now()
  WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permite anon chamar has_admin (para verificar se setup é necessário)
GRANT EXECUTE ON FUNCTION has_admin() TO anon;
GRANT EXECUTE ON FUNCTION has_admin() TO authenticated;

-- Permite authenticated chamar create_initial_admin
GRANT EXECUTE ON FUNCTION create_initial_admin(TEXT) TO authenticated;
