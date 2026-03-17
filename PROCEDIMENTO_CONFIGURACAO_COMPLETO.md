# 📘 Procedimento Completo de Configuração – Agenda Médica Online

Guia detalhado para configurar o programa **localmente** e no **GitHub**, com contribuições de todos os agentes DevOps.

---

## 🎯 Visão geral

| Fase | Responsável | O que faz |
|------|-------------|-----------|
| 1. Pré-requisitos | **Maestro** | Garantir ferramentas instaladas |
| 2. Segurança | **Shield** | Proteger credenciais e .gitignore |
| 3. Banco/Integrações | **Nexus** | Configurar Supabase |
| 4. Infraestrutura | **Forge** | Workflows como código |
| 5. CI | **Pulse** | Build e validação |
| 6. CD | **Flow** | Deploy no GitHub Pages |
| 7. Observabilidade | **Watcher** | Health check e logs |
| 8. Análise | **Insight** | Boas práticas de código |
| 9. Colaboração | **Bridge** | Documentação e checklists |
| 10. Arquitetura | **Visionary** | Base path e estrutura SPA |

---

## Parte 1: Ambiente local (desenvolvimento)

### 1.1 Pré-requisitos [Maestro]

- [ ] **Node.js 18+** – [nodejs.org](https://nodejs.org)
- [ ] **Git** – [git-scm.com](https://git-scm.com)
- [ ] **Conta Supabase** – [supabase.com](https://supabase.com)
- [ ] **Conta GitHub** – [github.com](https://github.com)

### 1.2 Clonar ou baixar o projeto

```bash
# Se o repositório já existe no GitHub:
git clone https://github.com/SEU-USUARIO/agenda_medica.git
cd agenda_medica

# OU, se o projeto está em pasta local (ex: Clinica):
cd "caminho/para/Clinica"
```

### 1.3 Instalar dependências

```bash
npm install
```

### 1.4 Configurar variáveis de ambiente [Shield]

**Nunca commite credenciais.** O `.gitignore` já exclui `.env` e `.env.local`.

```bash
# Copiar exemplo (se existir)
cp .env.example .env.local

# OU criar manualmente
```

Crie o arquivo `.env.local` na raiz do projeto:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Use a chave **anon public**, nunca a **service_role**.

### 1.5 Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## Parte 2: Configurar Supabase [Nexus]

### 2.1 Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. **New Project** → nome (ex: `agenda-medica`) → região → senha do banco
3. Aguarde a criação

### 2.2 Executar scripts SQL (na ordem)

Acesse **SQL Editor** → **New query**. Execute cada arquivo **na ordem**:

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `supabase/schema.sql` | Tabelas, enums, trigger, RLS |
| 2 | `supabase/migrations/001_roles_specialties.sql` | Roles, especialidades |
| 3 | `supabase/migrations/002_can_self_book.sql` | Liberação de agendamento |
| 4 | `supabase/migrations/003_attendant_update_can_self_book.sql` | Políticas atendente |
| 5 | `supabase/migrations/004_initial_admin_setup.sql` | Setup admin inicial |
| 6 | `supabase/migrations/005_fix_handle_new_user.sql` | Correção trigger cadastro |

**Como executar:** Abra o arquivo → Ctrl+A → Ctrl+C → Cole no SQL Editor → Run

### 2.3 Obter credenciais

1. **Project Settings** (ícone ⚙️) → **API**
2. Copie **Project URL**
3. Copie **anon public** (Project API keys)

### 2.4 Configurar autenticação

**Authentication** → **URL Configuration**:

| Campo | Desenvolvimento | Produção |
|-------|----------------|----------|
| **Site URL** | `http://localhost:5173` | `https://SEU-USUARIO.github.io/agenda_medica/` |
| **Redirect URLs** | `http://localhost:5173/**` | `https://SEU-USUARIO.github.io/agenda_medica/**` |

**Importante:** Use a URL **exata** do seu site em produção (incluindo underscore no nome do repo, se for `agenda_medica`).

---

## Parte 3: Git e GitHub [Shield + Forge]

### 3.1 Verificar .gitignore [Shield]

Confirme que **não** serão commitados:

- `node_modules/`
- `dist/`
- `.env` e `.env.local`
- `*.log`

```bash
git status
# .env.local NÃO deve aparecer
```

### 3.2 Inicializar repositório (se novo)

```bash
git init
git add .
git status   # Revise os arquivos
git commit -m "feat: Agenda Médica - versão inicial"
```

### 3.3 Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. **Repository name:** `agenda_medica` (ou o nome desejado)
3. **Public** → **Create repository**
4. **Não** marque "Add a README" se já tiver arquivos

### 3.4 Conectar e enviar

```bash
git remote add origin https://github.com/SEU-USUARIO/agenda_medica.git
git branch -M main
git push -u origin main
```

---

## Parte 4: Deploy no GitHub Pages [Flow + Forge]

### 4.1 Configurar secrets [Shield]

1. Repositório → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Adicione:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (começa com `eyJ...`) |

### 4.2 Habilitar GitHub Pages

1. **Settings** → **Pages**
2. **Source:** **GitHub Actions**

### 4.3 Disparar o deploy

O workflow `.github/workflows/deploy.yml` roda automaticamente em cada push na `main`.

- Vá em **Actions** → aguarde o workflow **Deploy to GitHub Pages** concluir (✓ verde)
- Acesse: `https://SEU-USUARIO.github.io/agenda_medica/`

**URL correta:** Use o nome **exato** do repositório (ex: `agenda_medica` com underscore, não `agenda-medica` com hífen).

---

## Parte 5: Supabase para produção [Nexus]

Após o deploy, configure o Supabase para aceitar a URL de produção:

1. **Authentication** → **URL Configuration**
2. **Site URL:** `https://SEU-USUARIO.github.io/agenda_medica/`
3. **Redirect URLs:** adicione `https://SEU-USUARIO.github.io/agenda_medica/**`

---

## Parte 6: Cadastrar primeiro administrador

1. Acesse o site: `https://SEU-USUARIO.github.io/agenda_medica/`
2. Clique em **Configuração inicial** ou vá em `/setup`
3. Preencha nome, email e senha
4. Se pedir confirmação de email: verifique o email, clique no link, volte e faça login

---

## 🔧 Problema: "Carregando Agenda Médica..." e não abre

### Causa

A mensagem **"Carregando Agenda Médica..."** aparece no HTML **antes** do JavaScript carregar. Isso indica que os arquivos `.js` retornam **404** (não encontrados).

### Soluções

1. **URL correta**
   - Use: `https://SEU-USUARIO.github.io/agenda_medica/` (com barra no final)
   - Nome do repo deve coincidir (ex: `agenda_medica` com underscore)

2. **Base path no workflow**
   - O workflow usa `VITE_BASE_PATH: /${{ github.event.repository.name }}/`
   - Garante que os assets sejam carregados corretamente

3. **Novo deploy**
   - Após alterar o workflow, faça um novo push
   - **Actions** → aguarde o build concluir

4. **Supabase (Site URL e Redirect URLs)**
   - **Site URL:** `https://allessandrolyra.github.io/agenda_medica/`
   - **Redirect URLs:** `https://allessandrolyra.github.io/agenda_medica/**`
   - Não use `localhost` para produção

5. **Console do navegador (F12)**
   - Aba **Console** → verifique erros 404 em vermelho
   - Aba **Network** → veja se algum `.js` ou `.css` retorna 404

---

## 📋 Comandos Git Bash (resumo)

```bash
cd "c:/01. Foursys/07. Aulas Criando Agentes .MD/01.Agentes DevOps/Clinica"

git add .
git commit -m "feat: correções e procedimento de configuração"
git push origin main
```

---

## 📚 Documentos de referência

| Documento | Conteúdo |
|-----------|----------|
| [CHECKLIST_SUPABASE.md](./CHECKLIST_SUPABASE.md) | Checklist Supabase |
| [DEPLOY_GITHUB.md](./DEPLOY_GITHUB.md) | Deploy no GitHub |
| [DIAGNOSTICO_CARREGANDO.md](./DIAGNOSTICO_CARREGANDO.md) | Diagnóstico "Carregando..." |
| [TROUBLESHOOTING_SITE_CARREGANDO.md](./TROUBLESHOOTING_SITE_CARREGANDO.md) | Troubleshooting do site |
| [TROUBLESHOOTING_LOGIN.md](./TROUBLESHOOTING_LOGIN.md) | Login e esqueci a senha |
| [RELATORIO_ANALISE_CODIGO.md](./RELATORIO_ANALISE_CODIGO.md) | Análise de código (Insight) |

---

*Procedimento elaborado com contribuições dos agentes Maestro, Pulse, Flow, Shield, Forge, Watcher, Bridge, Insight, Nexus e Visionary.*
