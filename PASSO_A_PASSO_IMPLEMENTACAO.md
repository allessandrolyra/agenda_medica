# Passo a passo – Implementação das melhorias

Guia para aplicar as mudanças no projeto Agenda Médica Online.

---

## Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Projeto Supabase já criado
- [Node.js](https://nodejs.org) 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (opcional, para deploy de Edge Functions)
- Git e GitHub configurados

---

## Parte 1: Executar migrations no Supabase

### Onde fazer
**Supabase Dashboard** → seu projeto → **SQL Editor**

### Como fazer

1. Acesse [supabase.com](https://supabase.com) e faça login.
2. Selecione seu projeto.
3. No menu lateral, clique em **SQL Editor**.
4. Clique em **New query**.
5. Para cada migration abaixo, **copie o conteúdo do arquivo**, cole no editor e clique em **Run**.

**Ordem de execução:**

| # | Arquivo | O que faz |
|---|---------|-----------|
| 1 | `supabase/migrations/008_status_detalhados.sql` | Novos status de consulta |
| 2 | `supabase/migrations/009_audit_logs.sql` | Tabela de auditoria + triggers |
| 3 | `supabase/migrations/010_lgpd_consent.sql` | Colunas LGPD em profiles |
| 4 | `supabase/migrations/011_waitlist_notifications.sql` | Tabelas waitlist e notifications |
| 5 | `supabase/migrations/012_cron_reminders.sql` | Documentação para cron (apenas leitura) |
| 6 | `supabase/migrations/013_admin_metrics_rpc.sql` | Função RPC para métricas |

**Importante:** Execute na ordem. Se alguma migration falhar, corrija o erro antes de continuar.

---

## Parte 2: Deploy da Edge Function send-reminders

### Onde fazer
Terminal (PowerShell, CMD ou Git Bash) na pasta do projeto.

### Como fazer

**Opção A – Com Supabase CLI**

1. Instale a CLI: `npm install -g supabase`
2. Faça login: `supabase login`
3. Vincule o projeto (se ainda não fez): `supabase link --project-ref SEU_PROJECT_REF`
   - O `project-ref` está em: Supabase Dashboard → Project Settings → General → Reference ID
4. Na pasta `Clinica`, execute:
   ```bash
   supabase functions deploy send-reminders
   ```

**Opção B – Sem CLI (manual)**

1. Acesse [supabase.com](https://supabase.com) → seu projeto.
2. Vá em **Edge Functions** no menu lateral.
3. Clique em **Create a new function**.
4. Nome: `send-reminders`.
5. Copie o conteúdo de `supabase/functions/send-reminders/index.ts` e cole no editor.
6. Clique em **Deploy**.

---

## Parte 3: Configurar variáveis de ambiente (secrets)

### O que são "secrets"?

São **variáveis secretas** (senhas, chaves de API) que a Edge Function usa para funcionar. Em vez de colocar no código, guardamos em um lugar seguro no Supabase.

### O que você precisa configurar

**Só uma coisa:** a chave do Resend para enviar emails.

O Supabase já fornece automaticamente para as Edge Functions:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

Você **não precisa** adicionar essas três.

### Passo a passo (bem simples)

**1. Abra o Supabase**
- Acesse [supabase.com](https://supabase.com) e faça login.
- Clique no seu projeto.

**2. Vá até a tela de secrets**
- No menu da esquerda, clique em **Edge Functions**.
- No topo da página, clique em **Manage secrets** (ou **Secrets**).
- Se não aparecer, tente: **Project Settings** (ícone de engrenagem) → **Edge Functions** → **Secrets**.

**3. Adicione a chave do Resend**
- Clique em **Add new secret** (ou **New secret**).
- Em **Name**, digite: `RESEND_API_KEY`
- Em **Value**, cole a chave que você obteve no Resend (veja abaixo).
- Clique em **Save**.

**4. Onde conseguir a chave do Resend**
- Acesse [resend.com](https://resend.com) e crie uma conta (grátis).
- Vá em **API Keys**.
- Clique em **Create API Key**.
- Copie a chave (começa com `re_`) e cole no Supabase.

### E se eu não configurar o Resend?

A função continua funcionando, mas **não envia emails de verdade**. Ela apenas simula o envio. Útil para testar sem ter conta no Resend.

---

## Parte 4: Lembretes automáticos (cron)

### Onde fazer
**GitHub** → repositório → **Actions** → **Lembretes diários**

### Como fazer (GitHub Actions – recomendado para Free tier)

1. Faça commit e push das alterações para o repositório.
2. No GitHub, vá em **Settings** → **Secrets and variables** → **Actions**.
3. Confirme que existem:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. O workflow `reminders-cron.yml` roda diariamente às 08:00 BRT.
5. Para testar: **Actions** → **Lembretes diários** → **Run workflow**.

### Alternativa (Supabase Pro – pg_cron)

Se tiver plano Pro, use pg_cron no SQL Editor:

1. Habilitar: `CREATE EXTENSION IF NOT EXISTS pg_cron; CREATE EXTENSION IF NOT EXISTS pg_net;`
2. Criar secrets no Vault (project_url, anon_key).
3. Rodar o SQL de agendamento descrito em `012_cron_reminders.sql`.

---

## Parte 5: Instalar dependências e rodar localmente

### Onde fazer
Terminal na pasta `Clinica`.

### Como fazer

1. Abra o terminal na pasta do projeto:
   ```bash
   cd "c:\01. Foursys\07. Aulas Criando Agentes .MD\01.Agentes DevOps\Clinica"
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Verifique se tudo está ok:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

4. Para rodar em desenvolvimento:
   ```bash
   npm run dev
   ```

5. Configure `.env.local` com:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

---

## Parte 6: Deploy no GitHub Pages

### Onde fazer
**GitHub** → repositório → **Actions**

### Como fazer

1. Faça commit e push das alterações:
   ```bash
   git add .
   git commit -m "Implementar melhorias: status, audit, LGPD, métricas, export ICS/CSV"
   git push origin main
   ```

2. O workflow `Deploy to GitHub Pages` roda automaticamente.

3. Se não tiver, configure:
   - **Settings** → **Secrets and variables** → **Actions**:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - **Settings** → **Pages** → Source: **GitHub Actions**

---

## Parte 7: Validar as alterações

### Onde fazer
No navegador, acessando o site.

### Checklist

| Funcionalidade | Onde verificar |
|----------------|----------------|
| Novos status | Admin → Consultas → filtro de status |
| Export ICS/CSV | Admin → Consultas → botões "Exportar ICS" e "Exportar CSV" |
| Dashboard métricas | Admin → Métricas |
| Lembretes | GitHub Actions → Lembretes diários (ou pg_cron) |

---

## Resumo rápido

| Etapa | Onde | Ação |
|-------|------|------|
| 1 | Supabase SQL Editor | Rodar migrations 008–013 |
| 2 | Terminal/Supabase | Deploy da Edge Function send-reminders |
| 3 | Supabase Edge Functions | Configurar RESEND_API_KEY |
| 4 | GitHub Actions | Workflow reminders-cron já configurado |
| 5 | Terminal | `npm install` | `npm run lint` | `npm run test` | `npm run build` |
| 6 | GitHub | `git push` para disparar deploy |

---

## Problemas comuns

**Migration falha com "enum already exists"**  
Os valores já existem. Pode rodar as migrations seguintes.

**Edge Function não envia email**  
Confira RESEND_API_KEY e se o domínio está verificado no Resend.

**Métricas não aparecem**  
A migration 013 deve ter run sem erros. Verifique se o usuário é admin.

**Lint ou test falham**  
Execute `npm install` de novo. Se persistir, rode `npm run lint` e `npm run test` para ver os erros.

---

## Referências

- [CHECKLIST_SUPABASE.md](./CHECKLIST_SUPABASE.md) – Configuração inicial do Supabase
- [DEPLOY_GITHUB.md](./DEPLOY_GITHUB.md) – Deploy no GitHub Pages
- [DECISOES.md](./DECISOES.md) – Decisões e status
