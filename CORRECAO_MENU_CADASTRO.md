# Correção: Menu Cadastro

## O que foi alterado

### 1. Menu Cadastro visível para TODOS os usuários logados
- Antes: só aparecia para Admin e Secretária
- Agora: aparece para qualquer usuário logado
- Segurança: a página `/cadastro` continua verificando acesso e mostra "Acesso restrito" para pacientes

### 2. Edge Function create-user
- Ao criar usuário com função Administrador, agora atualiza também `role = 'admin'` no perfil

### 3. Migration para corrigir admins existentes
- `006_fix_admin_role.sql` – corrige perfis que têm `role_id` de Administrador mas `role` incorreto

---

## Se o menu ainda não aparecer

### Passo 1: Executar a migration no Supabase

1. Acesse o **Supabase Dashboard** → seu projeto
2. Vá em **SQL Editor**
3. Cole e execute:

```sql
-- Corrige admins com role incorreto
UPDATE profiles p
SET role = 'admin'::public.user_role
FROM roles r
WHERE p.role_id = r.id
  AND r.name = 'Administrador'
  AND (p.role IS NULL OR p.role::text != 'admin');
```

### Passo 2: Verificar o usuário Admin no banco

No **Table Editor** → **profiles**, confira seu usuário:

| Coluna   | Valor esperado para Admin        |
|----------|----------------------------------|
| role     | `admin`                          |
| role_id  | UUID do role "Administrador"      |

Se `role` estiver como `paciente`, execute o SQL do Passo 1.

### Passo 3: Fazer deploy

```bash
cd "c:/01. Foursys/07. Aulas Criando Agentes .MD/01.Agentes DevOps/Clinica"
git add .
git commit -m "fix: menu Cadastro visível para todos os logados"
git push origin main
```

### Passo 4: Redeploy da Edge Function (opcional)

```bash
npx supabase functions deploy create-user
```

---

## Comportamento esperado

| Usuário   | Menu Cadastro | Ao clicar em Cadastro      |
|-----------|---------------|----------------------------|
| Admin     | Visível       | Hub completo (usuários, pacientes, agendar) |
| Secretária| Visível       | Hub completo               |
| Paciente  | Visível       | "Acesso restrito"          |
