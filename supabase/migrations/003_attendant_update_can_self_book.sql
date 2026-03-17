-- Migration: Atendentes/Secretárias podem ver e atualizar can_self_book de pacientes
-- Permite que atendentes liberem pacientes para agendamento online

-- Atendentes e Administradores veem todos os perfis (para tela de usuários)
CREATE POLICY "Atendente vê perfis" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name IN ('Atendente', 'Administrador')
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Atendentes e Administradores atualizam can_self_book de pacientes
CREATE POLICY "Atendente atualiza can_self_book" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name IN ('Atendente', 'Administrador')
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (true);
