# 📘 Documentação Completa – Agenda Médica Online

**Versão:** 1.0  
**Data:** Março 2026  
**URL:** https://allessandrolyra.github.io/agenda_medica

---

## 1. Visão Geral

### 1.1 O que é o programa

O **Agenda Médica Online** é um sistema web para clínicas médicas gerenciarem agendamentos de consultas. Permite que pacientes agendem online (quando liberados), atendentes e secretárias gerenciem a agenda completa e administradores controlem médicos, horários e usuários.

### 1.2 Finalidade

- **Reduzir ligações e filas** na recepção
- **Centralizar a agenda** em um único sistema
- **Permitir agendamento online** 24 horas para pacientes liberados
- **Automatizar** cadastro, confirmação e cancelamento de consultas

### 1.3 Objetivos de negócio

| Objetivo | Descrição |
|----------|-----------|
| Autoatendimento | Pacientes liberados agendam online sem precisar ligar |
| Controle de acesso | Perfis distintos (Admin, Atendente, Paciente) com permissões específicas |
| Compliance LGPD | Consentimento de dados no cadastro |
| Escalabilidade | Suporte a múltiplos médicos, especialidades e horários |

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend / Banco | Supabase (PostgreSQL, Auth, RLS) |
| Estilo | Tailwind CSS |
| Deploy | GitHub Pages / Vercel |
| CI/CD | GitHub Actions |

### Dependências principais

- `@supabase/supabase-js` ^2.45.0 – autenticação e banco
- `react` ^18.3.1, `react-dom` ^18.3.1
- `react-router-dom` ^6.26.0

---

## 3. Estrutura do Projeto

```
Clinica/
├── .github/workflows/deploy.yml    # CI/CD GitHub Pages
├── src/
│   ├── components/
│   │   ├── ConfirmModal.tsx        # Modal de confirmação
│   │   ├── ErrorBoundary.tsx       # Tratamento de erros React
│   │   └── Layout.tsx              # Layout principal
│   ├── lib/
│   │   ├── auth.ts                 # Funções de permissão
│   │   ├── logger.ts               # Logging
│   │   └── supabase.ts             # Cliente Supabase
│   ├── pages/
│   │   ├── admin/                  # Páginas administrativas
│   │   ├── Admin.tsx
│   │   ├── AttendantAgenda.tsx
│   │   ├── BookAppointment.tsx
│   │   ├── Cadastro.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Health.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── MyAppointments.tsx
│   │   ├── Register.tsx
│   │   ├── ResetPassword.tsx
│   │   └── SetupAdmin.tsx
│   ├── types/index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── functions/                  # Edge Functions
│   │   ├── create-user/
│   │   ├── health/
│   │   └── send-confirmation/
│   ├── migrations/
│   └── schema.sql
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 4. Modelo de Dados

### 4.1 Tabelas principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuário (extensão de auth.users). Campos: id, email, full_name, phone, role, role_id, can_self_book, data_consent |
| `doctors` | Médicos. Campos: id, name, specialty, specialty_id, default_duration_minutes, is_active |
| `availability_slots` | Horários disponíveis por médico e dia da semana. Campos: doctor_id, day_of_week (0–6), start_time, end_time |
| `blocked_dates` | Bloqueios (feriados, férias). Campos: doctor_id, blocked_date, reason |
| `appointments` | Consultas. Campos: patient_id, doctor_id, appointment_date, start_time, end_time, status |
| `roles` | Funções (Administrador, Médico, Atendente, Paciente). Campos: name, description, permissions (JSONB) |
| `specialties` | Especialidades médicas (14 pré-cadastradas) |

### 4.2 Status de consulta

- `agendada` – recém-agendada
- `confirmada` – confirmada pela clínica
- `cancelada` – cancelada
- `realizada` – consulta realizada

### 4.3 Enums

- `user_role`: `paciente` | `admin`
- `appointment_status`: `agendada` | `confirmada` | `cancelada` | `realizada`

---

## 5. Funcionalidades Implementadas

### 5.1 Página inicial (Home)

- Apresentação do sistema
- Links: Cadastrar como paciente, Já tenho conta
- Link para configuração inicial do administrador (`/setup`)

### 5.2 Autenticação

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| Login | `/login` | Login com email/senha. Mensagem amigável para credenciais inválidas |
| Cadastro de paciente | `/register` | Nome, email, telefone, senha, consentimento LGPD obrigatório |
| Esqueci a senha | `/forgot-password` | Solicitação de reset por email |
| Redefinir senha | `/reset-password` | Nova senha via link de recuperação |
| Setup inicial | `/setup` | Configuração do primeiro administrador. Verifica se já existe admin |

### 5.3 Cadastro

| Funcionalidade | Rota | Descrição |
|----------------|------|-----------|
| Hub de cadastro | `/cadastro` | Links para cadastrar usuário, paciente, agendar, ver consultas |
| Cadastrar usuário | `/admin/usuarios` | Admin/atendente cria médicos, atendentes, administradores via Edge Function |
| Cadastrar paciente | `/admin/usuarios?role=paciente` | Pré-seleciona função Paciente |
| Cadastrar médico | `/admin/usuarios` | Seleciona função Médico |
| Agendar consulta | `/agenda` | Atendente agenda para paciente |
| Ver consultas | `/admin/consultas` | Lista e gerencia consultas |

### 5.4 Agendamento

| Funcionalidade | Rota | Perfil | Descrição |
|----------------|------|--------|-----------|
| Agendar (paciente) | `/agendar` | Paciente | Seleção de médico, data e horário. Exige `can_self_book` |
| Agenda completa | `/agenda` | Atendente/Admin | Agenda para qualquer paciente |
| Minhas consultas | `/minhas-consultas` | Todos | Lista, cancelamento (apenas agendada/confirmada) |

### 5.5 Painel administrativo

| Subrota | Perfil | Funcionalidades |
|---------|--------|-----------------|
| `/admin` | Admin | CRUD de médicos, especialidade, duração, ativar/desativar |
| `/admin/funcoes` | Admin | CRUD de funções (roles, permissões). Funções de sistema não editáveis |
| `/admin/horarios` | Admin | CRUD de horários disponíveis por médico e dia |
| `/admin/usuarios` | Admin/Atendente | Lista usuários, cria via Edge Function, altera role e `can_self_book` |
| `/admin/usuarios-privilegios` | Admin | Tabela de usuários e permissões |
| `/admin/consultas` | Admin/Atendente | Lista, filtra, confirma e cancela consultas |

### 5.6 Consultas (Admin/Atendente)

- Filtros: nome/email, médico, data de/até, status
- Visualização: lista ou agrupada por médico
- Ações: confirmar, cancelar

### 5.7 Observabilidade

- `/health` – Health check da Edge Function. Retorna status ou erro.

---

## 6. Controle de Acesso e Permissões

### 6.1 Funções

| Função | Descrição | Permissões principais |
|--------|-----------|------------------------|
| Administrador | Acesso total | users.*, roles.manage, doctors.manage, slots.manage, appointments.* |
| Médico | Profissional de saúde | appointments.read, appointments.confirm, slots.read |
| Atendente | Recepção | users.create, users.read, appointments.create, appointments.read, appointments.update |
| Paciente | Usuário final | appointments.create, appointments.read, appointments.cancel |

### 6.2 Funções de permissão (auth.ts)

| Função | Retorno |
|--------|---------|
| `isAdmin(profile)` | `profile.role === 'admin'` OU `role_detail.name === 'Administrador'` |
| `isAttendant(profile)` | `role_detail.name === 'Atendente'` OU `isAdmin` |
| `canAccessFullAgenda(profile)` | `isAttendant` |
| `canSelfBook(profile)` | `isAdmin` OU `isAttendant` OU `profile.can_self_book === true` |

### 6.3 Menu condicional (Layout)

- **Cadastro** – visível para todos logados
- **Admin/Recepção** – visível para admin/atendente
- **Agenda completa** – visível para atendente/admin
- **Agendar** – visível para quem tem `canSelfBook` (paciente liberado)

---

## 7. Row Level Security (RLS)

### 7.1 Policies principais

| Tabela | Policy | Regra |
|--------|--------|-------|
| profiles | Paciente vê próprio perfil | `auth.uid() = id` |
| profiles | Admin vê perfis | `current_user_is_admin()` |
| profiles | Atendente vê perfis | `current_user_is_attendant_or_admin()` |
| profiles | Atendente atualiza can_self_book | Atendente/Admin podem atualizar |
| doctors | Todos leem médicos ativos | `is_active = true` |
| doctors | Admin gerencia | `current_user_is_admin()` |
| appointments | Paciente vê próprias | `patient_id = auth.uid()` |
| appointments | Paciente cria | `patient_id = auth.uid()` |
| appointments | Admin gerencia | `current_user_is_admin()` |

### 7.2 Funções SECURITY DEFINER

- `current_user_is_admin()` – verifica se usuário é admin (evita recursão RLS)
- `current_user_is_attendant_or_admin()` – verifica atendente ou admin
- `has_admin()` – verifica se já existe administrador
- `create_initial_admin(p_full_name)` – promove usuário atual a admin (apenas se não existir admin)

---

## 8. Edge Functions

| Função | Função | Uso |
|--------|--------|-----|
| `create-user` | Cria usuário (admin/atendente) | `auth.admin.createUser` + atualiza profile.role_id e role |
| `send-confirmation` | Envia email de confirmação | Resend API (opcional). Simula envio se não configurado |
| `health` | Health check | Retorna status |

### 8.1 create-user

- Requer: `Authorization: Bearer <token>` do usuário logado
- Verifica: `profile.role === 'admin'` OU role com permissão `users.create`
- Cria usuário via `auth.admin.createUser`
- Atualiza `profiles` com `role_id`, `full_name` e `role = 'admin'` se Administrador

---

## 9. Fluxos Principais

### 9.1 Primeiro acesso (setup)

1. Acessar `/setup`
2. Cadastrar com email/senha
3. Se `has_admin()` = false: `create_initial_admin` promove a admin
4. Redireciona para `/dashboard`

### 9.2 Paciente agendando online

1. Cadastro em `/register` com consentimento LGPD
2. Login
3. Atendente libera `can_self_book` em Admin/Usuários
4. Paciente acessa `/agendar`, escolhe médico, data e horário
5. Sistema chama `send-confirmation` (opcional) para email

### 9.3 Atendente agendando

1. Login como atendente
2. Acessa `/agenda`
3. Seleciona paciente, médico, data e horário
4. Insere consulta

### 9.4 Admin gerenciando

1. Login como admin
2. Cadastra médicos em `/admin`
3. Cadastra horários em `/admin/horarios`
4. Cadastra usuários em `/admin/usuarios`
5. Gerencia consultas em `/admin/consultas`

---

## 10. Migrations (Supabase)

| Arquivo | Conteúdo |
|---------|----------|
| `001_roles_specialties.sql` | Tabelas roles, specialties, role_id em profiles, seed |
| `002_can_self_book.sql` | Coluna `can_self_book` em profiles |
| `003_attendant_update_can_self_book.sql` | Policies Atendente vê perfis, Atendente atualiza can_self_book |
| `004_initial_admin_setup.sql` | `has_admin`, `create_initial_admin` |
| `005_fix_handle_new_user.sql` | Ajuste no trigger de novo usuário |
| `006_fix_admin_role.sql` | UPDATE profiles para role = 'admin' |
| `007_fix_admin_definitivo.sql` | Funções SECURITY DEFINER, correção admin, policies |

---

## 11. Variáveis de Ambiente

| Variável | Uso |
|----------|-----|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (pública) |
| `VITE_BASE_PATH` | Base path para deploy (ex.: `/agenda_medica/`) |
| `VITE_APP_BASENAME` | Router basename |

### Build (GitHub Actions)

- `VITE_BASE_PATH` e `VITE_APP_BASENAME` = `/${{ github.event.repository.name }}/`
- Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 12. CI/CD

- **Trigger:** push em `main` ou `workflow_dispatch`
- **Build:** `npm run build` com `tsc -b && vite build`
- **Pós-build:** `cp dist/index.html dist/404.html`, `touch dist/.nojekyll`
- **Deploy:** GitHub Pages via `deploy-pages`

---

## 13. Especialidades Pré-cadastradas

Clínica Geral, Cardiologia, Dermatologia, Endocrinologia, Gastroenterologia, Ginecologia e Obstetrícia, Neurologia, Oftalmologia, Ortopedia, Otorrinolaringologia, Pediatria, Pneumologia, Psiquiatria, Urologia.

---

## 14. Documentos Relacionados

| Documento | Conteúdo |
|-----------|----------|
| `README.md` | Visão geral, setup, agentes |
| `CHECKLIST_SUPABASE.md` | Configuração do Supabase |
| `DEPLOY_GITHUB.md` | Deploy no GitHub |
| `CORRECAO_ADMIN.md` | Correção de permissões admin |
| `PROCEDIMENTO_CONFIGURACAO_COMPLETO.md` | Guia completo de configuração |
| `RELATORIO_ANALISE_CODIGO.md` | Análise de código (Insight) |

---

## 15. Agentes DevOps

| Agente | Contribuição |
|--------|--------------|
| Maestro (Orquestrador) | Coordenação, prioridades |
| Pulse (CI) | Build, validação |
| Flow (CD) | Deploy GitHub Pages |
| Shield (Segurança) | Credenciais, .gitignore |
| Forge (IaC) | Workflows como código |
| Watcher (Observabilidade) | Health check, logs |
| Bridge (Colaboração) | Documentação |
| Insight (Análise) | Código, boas práticas |
| Nexus (Banco) | Supabase, migrations, RLS |
| Visionary (Arquitetura) | Base path, estrutura SPA |

---

*Documentação gerada com base em análise profunda do código e estrutura do projeto.*
