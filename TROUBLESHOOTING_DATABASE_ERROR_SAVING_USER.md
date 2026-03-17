# Correção: "Database error saving new user"

## Problema
Ao criar o usuário Admin no `/setup`, o erro **"Database error saving new user"** aparece. Isso ocorre quando o trigger `handle_new_user` falha ao inserir na tabela `profiles`.

## Causas comuns
1. **search_path** – Função sem `SET search_path = ''` (recomendação Supabase)
2. **data_consent** – Metadata não enviada no signUp (schema exige NOT NULL)
3. **Duplicatas** – Retry ou fluxo de confirmação de email gerando conflito
4. **RLS** – Políticas bloqueando o insert (mitigado com SECURITY DEFINER)

## Correções aplicadas

### 1. SetupAdmin.tsx
- Adicionado `data_consent: true` no `signUp` (obrigatório para o trigger)

### 2. Trigger handle_new_user (migration 005)
- `SECURITY DEFINER` + `SET search_path = ''` conforme docs Supabase
- Uso de `public.profiles` e `public.user_role` explícitos
- `ON CONFLICT (id) DO UPDATE` para evitar falha em retries
- `COALESCE(NEW.email, '')` para signup por telefone (se aplicável)

### 3. schema.sql
- Atualizado para refletir o mesmo trigger corrigido

## Como aplicar no Supabase

1. Abra o **SQL Editor** no dashboard do Supabase
2. Execute o conteúdo de `supabase/migrations/005_fix_handle_new_user.sql`
3. Ou rode as migrations via CLI: `supabase db push`

## Verificação

Após aplicar:
1. Acesse `/setup`
2. Cadastre o primeiro admin (nome, email, senha)
3. O cadastro deve concluir sem erro

## Se o erro persistir

1. **Logs do Postgres** – Dashboard > Logs > Postgres para ver o erro exato
2. **Logs do Auth** – Dashboard > Logs > Auth
3. **Migrations** – Confirme que 001, 002, 003 e 004 foram executadas antes da 005
4. **Estrutura** – Verifique se `profiles` tem as colunas: id, email, full_name, phone, role, data_consent
