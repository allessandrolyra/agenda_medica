# ✅ Checklist – Configuração Supabase (Agenda Médica)

Use este checklist para configurar o Supabase do zero até o deploy no GitHub.

---

## 📋 Pré-requisitos

- [ ] Conta criada no [supabase.com](https://supabase.com)
- [ ] Projeto criado no Supabase (ex: `agendamento-medico`)

---

## 1️⃣ Executar scripts SQL no Supabase

Acesse: **Supabase** → **SQL Editor** → **New query**

Execute cada script **na ordem abaixo**, copiando e colando o conteúdo completo.

| # | Arquivo | Status |
|---|---------|--------|
| 1 | `supabase/schema.sql` | [ ] |
| 2 | `supabase/migrations/001_roles_specialties.sql` | [ ] |
| 3 | `supabase/migrations/002_can_self_book.sql` | [ ] |
| 4 | `supabase/migrations/003_attendant_update_can_self_book.sql` | [ ] |
| 5 | `supabase/migrations/004_initial_admin_setup.sql` | [ ] |
| 6 | `supabase/migrations/005_fix_handle_new_user.sql` | [ ] |

**Como fazer:**
1. Abra o arquivo no VS Code
2. Selecione tudo (Ctrl+A) e copie (Ctrl+C)
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou Ctrl+Enter)
5. Confirme que não há erros em vermelho
6. Marque o item acima como concluído

---

## 2️⃣ Obter credenciais do projeto

- [ ] Ir em **Project Settings** (ícone ⚙️ no menu lateral)
- [ ] Clicar em **API**
- [ ] Copiar **Project URL** e salvar em local seguro
- [ ] Copiar **anon public** (Project API keys) e salvar em local seguro

---

## 3️⃣ Configurar variáveis locais

- [ ] Na pasta `Clinica`, criar arquivo `.env.local`
- [ ] Adicionar as linhas (substituir pelos seus valores):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] Salvar o arquivo
- [ ] Verificar que `.env.local` está no `.gitignore` (não vai para o GitHub)

---

## 4️⃣ Configurar autenticação no Supabase

- [ ] Ir em **Authentication** → **Providers**
- [ ] Confirmar que **Email** está habilitado
- [ ] Ir em **Authentication** → **URL Configuration**
- [ ] Em **Site URL** (produção): `https://seu-usuario.github.io/agenda_medica/`
- [ ] Em **Redirect URLs**, adicionar **ambas**:
  - `http://localhost:5173/**` (desenvolvimento local)
  - `https://seu-usuario.github.io/agenda_medica/**` (produção – ajustar usuário e nome do repo)
- [ ] **Importante:** Use o nome exato do repositório (ex: `agenda_medica` com underscore)

---

## 5️⃣ Testar localmente

- [ ] Rodar `npm install` na pasta `Clinica`
- [ ] Rodar `npm run dev`
- [ ] Acessar `http://localhost:5173` (ou a porta indicada)
- [ ] Clicar em **Cadastrar** e criar conta com seu email
- [ ] Verificar se o cadastro funcionou (sem erro na tela)

---

## 6️⃣ Cadastrar o administrador inicial

**Opção A – Pela tela de Setup (recomendado):**
- [ ] Na página inicial, clicar em **"Configuração inicial do administrador"**
- [ ] Ou acessar diretamente: `/setup`
- [ ] Preencher nome, email e senha do administrador
- [ ] Clicar em **"Cadastrar administrador"**
- [ ] Se o Supabase pedir confirmação de email: verificar o email, clicar no link, depois fazer login em `/login` e voltar em `/setup` para completar

**Opção B – Manualmente (SQL):**
- [ ] Cadastrar como paciente na tela normal
- [ ] No Supabase → **SQL Editor**, executar (substituir pelo seu email):

```sql
UPDATE profiles 
SET role = 'admin', role_id = (SELECT id FROM roles WHERE name = 'Administrador')
WHERE email = 'SEU-EMAIL@exemplo.com';
```

- [ ] Fazer logout e login novamente

---

## 7️⃣ Subir no GitHub

- [ ] Criar repositório no GitHub (se ainda não existir)
- [ ] Confirmar que `.env.local` **não** está sendo commitado
- [ ] Fazer push do código

---

## 8️⃣ Deploy (GitHub Pages ou Vercel)

### Se usar **Vercel:**
- [ ] Conectar repositório no [vercel.com](https://vercel.com)
- [ ] Em **Settings** → **Environment Variables**, adicionar:
  - `VITE_SUPABASE_URL` = sua URL
  - `VITE_SUPABASE_ANON_KEY` = sua chave anônima
- [ ] Fazer deploy

### Se usar **GitHub Pages:**
- [ ] Em **Settings** → **Secrets and variables** → **Actions**, adicionar:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Configurar workflow de deploy (se usar GitHub Actions)
- [ ] Atualizar **Redirect URLs** no Supabase com a URL final (ex: `https://usuario.github.io/repo/**`)

---

## 📌 Resumo rápido

| Etapa | Onde | O quê |
|-------|------|-------|
| 1 | SQL Editor | Rodar 4 scripts SQL em ordem |
| 2 | Project Settings → API | Copiar URL e anon key |
| 3 | Pasta Clinica | Criar `.env.local` |
| 4 | Authentication | Conferir Email e Redirect URLs |
| 5 | Local | `npm run dev` e testar cadastro |
| 6 | SQL Editor | UPDATE para tornar admin |
| 7 | GitHub | Push (sem .env.local) |
| 8 | Vercel/GitHub Pages | Configurar variáveis de ambiente |

---

*Documento gerado para o projeto Agenda Médica – Clinica*
