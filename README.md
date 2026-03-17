# 🏥 Agenda Médica Online

Sistema web completo para clínicas médicas gerenciarem agendamentos de consultas. Pacientes agendam online (quando liberados), atendentes e secretárias têm agenda completa, e administradores controlam médicos, horários e usuários.

---

## 📌 O que este programa faz

O **Agenda Médica** é uma aplicação web que permite:

- **Clínicas** oferecerem agendamento online aos pacientes
- **Pacientes** marcarem consultas em horários disponíveis (após liberação pela secretária)
- **Atendentes e secretárias** gerenciarem a agenda completa e marcarem consultas em nome dos pacientes
- **Administradores** configurarem médicos, especialidades, horários e permissões

### Finalidade

Reduzir ligações e filas na recepção, centralizar a agenda em um único sistema e permitir que pacientes com acesso liberado agendem consultas pela internet, 24 horas.

---

## ✨ Funcionalidades principais

| Perfil | O que pode fazer |
|--------|------------------|
| **Paciente** | Cadastro, login, agendar/ver/cancelar consultas (se liberado), ver minhas consultas |
| **Atendente / Secretária** | Agenda completa, marcar consultas para pacientes, liberar agendamento online |
| **Administrador** | Tudo acima + médicos, funções, usuários, horários, consultas |

### Recursos técnicos

- Cadastro com consentimento LGPD
- Funções: Administrador, Médico, Atendente, Paciente
- 14 especialidades pré-cadastradas (Cardiologia, Pediatria, etc.)
- Setup inicial: primeiro admin se cadastra pela tela `/setup`
- Pacientes liberados pela secretária para agendar online
- Endpoint `/health` para monitoramento
- Deploy em GitHub Pages ou Vercel (gratuito)

---

## 🛠 Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend / Banco | Supabase (PostgreSQL, Auth, RLS) |
| Estilo | Tailwind CSS |
| Deploy | GitHub Pages / Vercel |

---

## 🚀 Como rodar

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Clonar e instalar

```bash
git clone https://github.com/seu-usuario/agenda-medica.git
cd agenda-medica
npm install
```

### 2. Configurar Supabase

Siga o guia completo: **[CHECKLIST_SUPABASE.md](./CHECKLIST_SUPABASE.md)**

Resumo: criar projeto no Supabase, executar os scripts SQL em ordem, copiar URL e chave anônima.

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`

### 5. Cadastrar o primeiro administrador

Acesse **Configuração inicial** (ou `/setup`) e cadastre o primeiro admin da clínica.

---

## 📦 Deploy em produção

Guia completo: **[DEPLOY_GITHUB.md](./DEPLOY_GITHUB.md)**

- **GitHub Pages:** workflow automático em `.github/workflows/deploy.yml`
- **Vercel:** conectar repositório e configurar variáveis de ambiente

---

## 📁 Estrutura do projeto

```
├── src/
│   ├── components/     # Layout, navegação
│   ├── lib/           # Supabase, auth, logger
│   ├── pages/         # Páginas da aplicação
│   └── types/         # Tipos TypeScript
├── supabase/
│   ├── schema.sql     # Schema do banco
│   ├── migrations/    # Migrations (roles, can_self_book, setup admin)
│   └── functions/     # Edge Functions (opcional)
├── .github/workflows/ # CI/CD para GitHub Pages
├── CHECKLIST_SUPABASE.md
├── DEPLOY_GITHUB.md
└── README.md
```

---

## 🤖 Agentes que trabalharam neste projeto

Este projeto foi desenvolvido com o apoio de uma equipe de agentes DevOps, cada um responsável por uma área específica:

| Agente | Arquivo | Contribuição |
|--------|---------|--------------|
| **Maestro** – Orquestrador | 01_Orquestrador.md | Coordenação, prioridades e fluxo entre agentes |
| **Pulse** – CI | 02_ci.md | Build, validação e pipeline de integração contínua |
| **Flow** – CD | 03_cd.md | Deploy automatizado no GitHub Pages |
| **Shield** – Segurança | 04_seguranca.md | Proteção de credenciais, .gitignore, secrets |
| **Forge** – IaC | 05_iac.md | Workflows como código (`.github/workflows/`) |
| **Watcher** – Observabilidade | 06_observabilidade.md | Health check, monitoramento e logs |
| **Bridge** – Colaboração | 07_colaboracao.md | Documentação, checklists e comunicação |
| **Análise de código** | 08_analise_codigo.md | Qualidade, revisão e boas práticas |
| **Nexus** – Banco e integrações | 09_banco_integracoes.md | Supabase, migrations, RLS e integrações |
| **Visionary** – Arquitetura | 10_arquitetura_solucao.md | Decisões técnicas, base path, estrutura SPA |

### Fluxo de trabalho dos agentes

```
Orquestrador → define plano
     ↓
Segurança → valida .gitignore e secrets
     ↓
Banco/Integrações → configura Supabase
     ↓
CI/CD → build e deploy
     ↓
Observabilidade → monitora o site
     ↓
Colaboração → documentação e checklists
```

---

## 📚 Documentação adicional

| Documento | Conteúdo |
|-----------|----------|
| [CHECKLIST_SUPABASE.md](./CHECKLIST_SUPABASE.md) | Passo a passo para configurar o Supabase |
| [DEPLOY_GITHUB.md](./DEPLOY_GITHUB.md) | Como publicar no GitHub e GitHub Pages |
| [RELATORIO_ANALISE_CODIGO.md](./RELATORIO_ANALISE_CODIGO.md) | Análise do agente Insight – boas práticas e performance |

---

## 📄 Licença

MIT – Livre para uso e publicação e Testes
