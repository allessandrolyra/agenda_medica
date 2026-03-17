# ✅ Checklist – Pós-upload no GitHub

**Arquivos já estão no GitHub.** Use este checklist para validar a configuração e concluir a integração com o banco de dados.

*Consultado: Maestro (Orquestrador), Shield (Segurança), Nexus (Banco), Flow (CD), Bridge (Colaboração)*

---

## Parte 1: Validar o que está no GitHub

### 1.1 Estrutura do repositório

- [ ] O repositório tem `package.json` na raiz
- [ ] Existe a pasta `src/` com App.tsx, main.tsx, pages, components
- [ ] Existe a pasta `supabase/` com schema.sql e migrations
- [ ] Existe a pasta `.github/workflows/` com deploy.yml
- [ ] Existe o arquivo `.gitignore`
- [ ] Existe o arquivo `.env.example` (modelo, sem credenciais)

### 1.2 Arquivos que NÃO devem estar no GitHub

- [ ] **Não** há pasta `node_modules/`
- [ ] **Não** há pasta `dist/`
- [ ] **Não** há arquivo `.env` ou `.env.local`
- [ ] **Não** há credenciais visíveis em nenhum arquivo

---

## Parte 2: Integração com o banco de dados (Supabase)

### 2.1 Banco configurado no Supabase

- [ ] Projeto criado no [supabase.com](https://supabase.com)
- [ ] Scripts SQL executados **na ordem**:
  - [ ] `supabase/schema.sql`
  - [ ] `supabase/migrations/001_roles_specialties.sql`
  - [ ] `supabase/migrations/002_can_self_book.sql`
  - [ ] `supabase/migrations/003_attendant_update_can_self_book.sql`
  - [ ] `supabase/migrations/004_initial_admin_setup.sql`

### 2.2 Credenciais do Supabase

- [ ] Acessou **Project Settings** → **API**
- [ ] Copiou **Project URL**
- [ ] Copiou **anon public** (chave anônima)

### 2.3 Secrets no GitHub

- [ ] Repositório → **Settings** → **Secrets and variables** → **Actions**
- [ ] Adicionou secret `VITE_SUPABASE_URL` = sua URL do Supabase
- [ ] Adicionou secret `VITE_SUPABASE_ANON_KEY` = sua chave anônima

---

## Parte 3: Publicar o site (GitHub Pages)

### 3.1 Habilitar GitHub Pages

- [ ] Repositório → **Settings** → **Pages**
- [ ] Em **Source**, selecionou **GitHub Actions**

### 3.2 Verificar o deploy

- [ ] Foi em **Actions** no repositório
- [ ] O workflow **Deploy to GitHub Pages** rodou (ou rodará no próximo push)
- [ ] O build concluiu com sucesso (ícone verde ✓)
- [ ] Acessou a URL: `https://SEU-USUARIO.github.io/NOME-DO-REPO/`

---

## Parte 4: Configurar Supabase para produção

### 4.1 Redirect URLs (obrigatório para login funcionar)

No Supabase → **Authentication** → **URL Configuration**:

- [ ] **Site URL:** `https://SEU-USUARIO.github.io/NOME-DO-REPO/`
- [ ] **Redirect URLs:** adicionou `https://SEU-USUARIO.github.io/NOME-DO-REPO/**`

*Substitua SEU-USUARIO e NOME-DO-REPO pelos seus valores.*

### 4.2 Autenticação por email

- [ ] **Authentication** → **Providers** → **Email** está habilitado
- [ ] Se quiser testar sem confirmar email: desative **Confirm email** em Providers → Email

---

## Parte 5: Cadastrar o administrador inicial

- [ ] Acessou o site publicado (URL do GitHub Pages)
- [ ] Clicou em **Configuração inicial** ou acessou `/setup`
- [ ] Cadastrou o primeiro administrador (nome, email, senha)
- [ ] Fez login e verificou se o menu **Admin** aparece

---

## Parte 6: Futuras atualizações

### 6.1 Fluxo para enviar alterações

```bash
cd "caminho/para/Clinica"

git add .
git status
git commit -m "descricao da alteracao"
git push
```

### 6.2 O que acontece automaticamente

- [ ] O GitHub Actions detecta o push
- [ ] Roda o build com os secrets (Supabase)
- [ ] Publica no GitHub Pages
- [ ] O site é atualizado em poucos minutos

### 6.3 Quando alterar o Supabase

- [ ] Se criar nova migration: executar no SQL Editor do Supabase
- [ ] Se mudar schema: documentar no README ou em migrations
- [ ] **Não** é necessário alterar os secrets no GitHub (URL e chave continuam iguais)

### 6.4 Quando alterar variáveis de ambiente

- [ ] Atualizar os **Secrets** em Settings → Secrets and variables → Actions
- [ ] Fazer um novo push (ou rodar o workflow manualmente em Actions) para o build usar os novos valores

---

## 📌 Resumo – ordem de execução

| # | Onde | O quê |
|---|------|-------|
| 1 | GitHub | Validar estrutura e ausência de credenciais |
| 2 | Supabase | Executar SQL, copiar URL e chave |
| 3 | GitHub Settings | Adicionar secrets VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY |
| 4 | GitHub Settings | Pages → Source: GitHub Actions |
| 5 | GitHub Actions | Aguardar build concluir |
| 6 | Supabase | Configurar Redirect URLs com a URL do site |
| 7 | Site | Cadastrar admin em /setup |
| 8 | Futuro | git add, commit, push para atualizar |

---

## ❓ Problemas comuns

| Problema | Solução |
|----------|---------|
| Build falha no Actions | Verificar se os 2 secrets estão configurados |
| Site em branco | Verificar se a URL está correta (inclui /nome-do-repo/) |
| Login não funciona | Configurar Redirect URLs no Supabase com a URL exata |
| "Supabase não configurado" | Secrets com nome errado (devem ser exatamente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) |

---

*Checklist elaborado com o time: Maestro, Shield, Nexus, Flow, Bridge*
