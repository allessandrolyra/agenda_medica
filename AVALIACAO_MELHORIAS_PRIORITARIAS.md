# Avaliação das Melhorias Prioritárias – Agenda Médica Online

**Documento:** Avaliação pré-implementação  
**Data:** Março 2026  
**Solicitante:** Maestro (Orquestrador)  
**Participantes:** Pulse, Flow, Insight, Forge, Nexus, Watcher, Shield, Bridge, Visionary

---

## 1. Resumo Executivo

A proposta de melhorias está **bem estruturada e alinhada às melhores práticas**. Porém, o projeto atual usa **Supabase** (PostgreSQL + Auth + RLS + Edge Functions) em vez de um backend REST tradicional. Isso exige **adaptações significativas** em várias tarefas.

**Recomendação geral:** Aprovar o escopo com ajustes de implementação. Priorizar Sprints 1 e 2; Sprints 3–5 podem ser simplificados ou adiados conforme capacidade.

---

## 2. Gap Analysis: Proposta vs. Stack Atual

| Aspecto | Proposta | Atual | Gap |
|---------|----------|-------|-----|
| Backend | REST/GraphQL | Supabase Client + RLS + Edge Functions | Sem API REST explícita |
| Jobs | Jobs agendados | Nenhum | Precisa pg_cron ou cron externo |
| Testes | Unit, integration, E2E | Nenhum | Começar do zero |
| Feature flags | Rollout gradual | Nenhum | Adicionar |
| Staging | Ambiente staging | Apenas produção (GitHub Pages) | Criar |
| Infra | Terraform, Docker | Nenhum | Opcional para Supabase |
| Notificações | SendGrid + Twilio | Resend (parcial) | Trocar/estender |

---

## 3. Avaliação por Funcionalidade

### 3.1 Status detalhados e workflow de estados

| Critério | Avaliação | Observações |
|----------|-----------|-------------|
| **Viabilidade** | Alta | Migration direta no Postgres |
| **Esforço** | Baixo–médio | 2–3 dias |
| **Risco** | Baixo | Enum existente: `agendada`, `confirmada`, `cancelada`, `realizada` |

**Adaptações necessárias:**
- Proposta: `scheduled, pending_confirmation, confirmed, in_progress, completed, no_show, cancelled`
- Atual: `agendada, confirmada, cancelada, realizada`
- **Recomendação:** Mapear para manter compatibilidade:
  - `agendada` → `scheduled` (ou manter `agendada`)
  - `pending_confirmation` → novo
  - `confirmada` → `confirmed`
  - `in_progress` → novo
  - `realizada` → `completed`
  - `no_show` → novo
  - `cancelada` → `cancelled`

**Forge:** Migration idempotente com `ALTER TYPE ... ADD VALUE` (Postgres) ou novo enum + migração de dados.

**Nexus:** Transições via RPC ou Edge Function `PATCH /appointments/:id/status` (Supabase não tem PATCH nativo; usar Edge Function ou RPC).

---

### 3.2 Audit logs

| Critério | Avaliação | Observações |
|----------|-----------|-------------|
| **Viabilidade** | Alta | Tabela + triggers |
| **Esforço** | Médio | 3–4 dias |
| **Risco** | Baixo | Triggers em `profiles`, `doctors`, `appointments` |

**Adaptações necessárias:**
- Sem middleware REST: usar **triggers PostgreSQL** em `profiles`, `doctors`, `appointments`, `availability_slots`.
- `user_id` via `auth.uid()` no contexto do trigger.
- `ip` e `user_agent`: não disponíveis no trigger; gravar via Edge Function ou ignorar inicialmente.

**Forge:** Tabela `audit_logs` conforme proposta. Trigger `AFTER INSERT OR UPDATE OR DELETE` nas tabelas críticas.

**Shield:** Definir retenção (ex.: 90 dias) e política de acesso.

---

### 3.3 Lembretes automáticos (email/SMS)

| Critério | Avaliação | Observações |
|----------|-----------|-------------|
| **Viabilidade** | Média–alta | Depende de job scheduler |
| **Esforço** | Alto | 5–7 dias |
| **Risco** | Médio | Custo de SMS, falhas de provedor |

**Adaptações necessárias:**
- **Jobs:** Supabase não tem cron nativo. Opções:
  1. **pg_cron** (extensão Postgres) – se disponível no plano
  2. **Supabase Edge Functions + Cron** (Supabase suporta cron em Edge Functions)
  3. **GitHub Actions** – workflow agendado (limitado)
  4. **Serviço externo** (Vercel Cron, Railway Cron, etc.)

**Bridge:** Já existe `send-confirmation` com Resend. Proposta usa SendGrid – avaliar manter Resend ou migrar. SMS via Twilio exige conta e custos.

**Visionary:** Definir limites de custo (SMS caro). Priorizar email; SMS como opcional.

---

### 3.4 Dashboard administrativo com KPIs

| Critério | Avaliação | Observações |
|----------|-----------|-------------|
| **Viabilidade** | Alta | Queries agregadas |
| **Esforço** | Médio | 3–4 dias |
| **Risco** | Baixo | Performance com índices |

**Adaptações necessárias:**
- Sem endpoint REST: criar **RPCs** ou **Edge Function** `GET /admin/metrics`.
- KPIs: consultas por dia, taxa cancelamento, próximos 7 dias por médico, tempo médio confirmação.
- Frontend: gráficos com lib leve (Chart.js, Recharts) ou CSS puro.

**Nexus:** Funções SQL ou view materializada para métricas. RPC `get_admin_metrics()` retornando JSON.

**Watcher:** Reutilizar para dashboard de observabilidade.

---

### 3.5 Lista de espera

| Critério | Avaliação | Observações |
|----------|-----------|-------------|
| **Viabilidade** | Alta | Nova tabela + lógica |
| **Esforço** | Alto | 5–6 dias |
| **Risco** | Médio | Job de notificação + janela 30 min |

**Adaptações necessárias:**
- Tabela `waitlist` conforme proposta.
- Job para processar fila: mesmo desafio de scheduler (ver 3.3).
- Notificação com link de confirmação: token temporário ou query param com expiração.
- FIFO: `ORDER BY created_at` na query.

**Regra:** Cancelamento libera vaga → job notifica próximo → 30 min para confirmar → senão, próximo.

---

### 3.6 Integração Google Calendar / Outlook

| Critério | Avaliação | Observações |
|----------|-----------|-------------|
| **Viabilidade** | Média | OAuth + APIs externas |
| **Esforço** | Muito alto | 2–3 semanas |
| **Risco** | Alto | OAuth, scopes, rate limits, manutenção |

**Adaptações necessárias:**
- OAuth 2.0 para Google e Microsoft.
- Armazenar tokens em tabela `doctor_calendar_tokens` (criptografados).
- Sincronização one-way: criar/atualizar/cancelar eventos quando status mudar.
- Edge Functions para chamadas às APIs.

**Visionary:** Avaliar se essencial para MVP. Sugestão: **adiar para fase 2** ou fazer apenas Google Calendar inicialmente.

---

### 3.7 Segurança e LGPD

| Critério | Avaliação | Observações |
|----------|-----------|-------------|
| **Viabilidade** | Alta | Maioria já parcialmente atendida |
| **Esforço** | Médio | 3–4 dias |
| **Risco** | Baixo | Conformidade |

**Já existente:**
- `data_consent` no cadastro
- RLS em todas as tabelas
- Secrets em env (Supabase)

**A implementar:**
- `consent_version` e `consent_at` em `profiles`
- Rate limiting: Supabase tem limites; para IP/user, usar Edge Function ou Kong se self-hosted
- Input validation: Zod ou similar no frontend; validação no backend via RLS/triggers
- TLS: GitHub Pages e Supabase já usam HTTPS

**Shield:** Checklist de segurança antes de produção.

---

### 3.8 Testes automatizados

| Critério | Avaliação | Observações |
|----------|-----------|-------------|
| **Viabilidade** | Alta | Stack padrão |
| **Esforço** | Alto | 1–2 semanas |
| **Risco** | Baixo | Fundação para qualidade |

**A implementar:**
- **Unit:** Vitest ou Jest. Regras: conflito de horário, transições de status, waitlist FIFO.
- **Integration:** Testar fluxo Supabase (create appointment → trigger → audit_log). Usar Supabase local ou projeto de teste.
- **E2E:** Playwright ou Cypress. Smoke no staging.
- **CI:** Pipeline com lint, unit, integration. Gate de cobertura opcional inicialmente.

**Pulse:** Atualizar `.github/workflows` com jobs de teste.

**Insight:** Definir regras críticas para testes obrigatórios.

---

## 4. Avaliação por Persona

### Maestro
- **Backlog:** Priorização coerente. Sugestão: Sprint 1 (status + audit) e Sprint 2 (lembretes) como MVP.
- **Rollout:** Staging é crítico. GitHub Pages permite branch `staging` ou subpath. Avaliar Vercel/Netlify para staging com preview.
- **Checklist:** Validar antes de produção: segurança, LGPD, testes.

### Pulse
- **CI:** Adicionar lint (ESLint), unit tests (Vitest), e opcionalmente integration.
- **Gates:** Bloquear merge se build falhar. Cobertura mínima pode ser fase 2.
- **SCA:** Dependabot já disponível no GitHub; Snyk opcional.

### Flow
- **CD:** Deploy atual é direto para produção. Staging exige segundo ambiente (outro branch ou projeto Supabase staging).
- **Canary/Rollback:** Complexo para SPA estática. Feature flags ajudam; rollback = revert commit + redeploy.

### Insight
- **Testes:** Priorizar unit para `check_appointment_conflict`, transições de status, `canSelfBook`, `isAdmin`.
- **Análise estática:** ESLint + TypeScript strict. Regras de qualidade em PR.

### Forge
- **Migrations:** Idempotentes com `IF NOT EXISTS`, `ADD VALUE IF NOT EXISTS` (Postgres 9.1+).
- **Rollback:** Scripts de rollback para cada migration.
- **Docker:** Opcional. Supabase CLI já permite `supabase start` local.

### Nexus
- **Endpoints:** Usar Edge Functions ou RPCs. Ex.: `create_appointment` (retorna 201/409), `update_appointment_status`, `get_admin_metrics`.
- **Conflito:** Função `check_appointment_conflict` já existe no schema. Integrar na lógica de criação.

### Watcher
- **Métricas:** Dashboard com KPIs. Logs estruturados com `trace_id` (gerar no frontend ou Edge Function).
- **Alertas:** GitHub Actions não tem alertas nativos. Integrar com Uptime Robot, Better Uptime ou similar para 5xx.

### Shield
- **LGPD:** `consent_version`, `consent_at`, política de retenção.
- **Rate limiting:** Supabase tem limites por plano. Para controle fino, Edge Function com Redis ou tabela de throttling.

### Bridge
- **Templates:** Placeholders para email e SMS. Documentar opt-ins (`email_opt_in`, `sms_opt_in` em profiles).
- **Slack/Teams:** Opcional para deploy/alertas. Webhook no workflow.

### Visionary
- **Custos:** Limites para SMS/email. Priorizar email.
- **Regiões:** Supabase define região no projeto.
- **Backup:** Supabase oferece backups; validar plano.

---

## 5. Matriz de Priorização Revisada

| Prioridade | Funcionalidade | Sprint | Esforço | Dependências |
|------------|----------------|--------|---------|--------------|
| P0 | Status detalhados + transições | 1 | 2–3 dias | Migration, UI |
| P0 | Audit logs | 1 | 3–4 dias | Tabela, triggers |
| P1 | Lembretes por email (48h, 24h) | 2 | 4–5 dias | Job scheduler, send-confirmation |
| P1 | Dashboard KPIs | 2 ou 3 | 3 dias | RPC, frontend |
| P2 | Lista de espera | 3 | 5–6 dias | Job, notificações |
| P2 | LGPD (consent_version, consent_at) | 1 ou 2 | 1 dia | Migration profiles |
| P3 | SMS (fallback) | 2 ou 3 | 2–3 dias | Twilio, opt-in |
| P3 | Testes (unit + integration) | Contínuo | 1–2 sem | Vitest, Playwright |
| P4 | Calendar sync | 4 ou 5 | 2–3 sem | OAuth, APIs |
| P4 | Feature flags | 1 | 1–2 dias | Tabela ou LaunchDarkly |
| P5 | Staging + E2E | Contínuo | 1 sem | Ambiente, Playwright |

---

## 6. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Job scheduler indisponível | Média | Alto | Usar Supabase Edge Functions Cron ou serviço externo |
| Custo SMS elevado | Alta | Médio | Limitar SMS; priorizar email |
| Calendar sync complexo | Alta | Médio | Adiar; documentar para fase 2 |
| Sem staging | Média | Alto | Criar projeto Supabase staging + deploy em branch |
| Testes atrasam entrega | Média | Médio | Começar com unit para regras críticas |

---

## 7. Recomendações Finais

### Aprovar com ajustes
1. **Sprint 1:** Status detalhados, audit logs, LGPD (consent_version/consent_at), feature flags básicos.
2. **Sprint 2:** Lembretes por email, dashboard KPIs, início de testes unitários.
3. **Sprint 3:** Lista de espera, SMS opcional.
4. **Sprint 4:** Ajustes, QA, documentação.
5. **Adiar:** Calendar sync para fase 2; Terraform/Docker opcional.

### Decisões pendentes
- **Job scheduler:** Definir entre pg_cron, Edge Functions Cron ou externo.
- **Staging:** Criar projeto Supabase separado ou usar branch.
- **SMS:** Twilio ou outro provedor; definir limite de custo.

### Próximos passos
1. Maestro: validar priorização e aprovar backlog.
2. Forge: detalhar migrations (status, audit_logs, waitlist, profiles).
3. Nexus: especificar RPCs/Edge Functions.
4. Pulse: desenhar pipeline CI com testes.
5. Kickoff Sprint 1 após aprovação.

---

*Documento elaborado pela equipe de agentes para avaliação pré-implementação.*
