# 📁 Arquivos para subir no Git

Lista completa do que deve ser enviado ao GitHub. O `.gitignore` já exclui automaticamente `node_modules`, `dist`, `.env`, etc.

---

## 📂 Estrutura (pasta Clinica)

```
Clinica/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/                    (vazio ou favicon, se houver)
├── src/
│   ├── components/
│   │   ├── ConfirmModal.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Layout.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── logger.ts
│   │   └── supabase.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminAppointments.tsx
│   │   │   ├── AdminDoctors.tsx
│   │   │   ├── AdminRoles.tsx
│   │   │   ├── AdminSlots.tsx
│   │   │   └── AdminUsers.tsx
│   │   ├── Admin.tsx
│   │   ├── AttendantAgenda.tsx
│   │   ├── BookAppointment.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Health.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── MyAppointments.tsx
│   │   ├── Register.tsx
│   │   └── SetupAdmin.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   ├── migrations/
│   │   ├── 001_roles_specialties.sql
│   │   ├── 002_can_self_book.sql
│   │   ├── 003_attendant_update_can_self_book.sql
│   │   └── 004_initial_admin_setup.sql
│   ├── functions/
│   │   ├── create-user/
│   │   │   └── index.ts
│   │   ├── health/
│   │   │   └── index.ts
│   │   └── send-confirmation/
│   │       └── index.ts
│   ├── schema.sql
│   └── seed.sql
├── .env.example
├── .gitignore
├── CHECKLIST_SUPABASE.md
├── DEPLOY_GITHUB.md
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── RELATORIO_ANALISE_CODIGO.md
├── RELATORIO_VALIDACAO.md
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## ✅ O que SUBIR

| Pasta/Arquivo | Descrição |
|---------------|-----------|
| `.github/workflows/deploy.yml` | Pipeline de deploy |
| `src/` | Código fonte (componentes, páginas, lib) |
| `supabase/` | Schema, migrations, functions |
| `.env.example` | Modelo de variáveis (sem valores reais) |
| `.gitignore` | Arquivos a ignorar |
| `index.html` | HTML principal |
| `package.json` | Dependências |
| `package-lock.json` | Versões fixas |
| `tsconfig.json` | Config TypeScript |
| `tsconfig.node.json` | Config TS para Vite |
| `vite.config.ts` | Config Vite |
| `*.md` | Documentação |

---

## ❌ O que NÃO subir (já no .gitignore)

| Item | Motivo |
|------|--------|
| `node_modules/` | Dependências (npm install) |
| `dist/` | Build gerado |
| `.env` | Credenciais |
| `.env.local` | Credenciais locais |
| `*.log` | Logs |
| `*.tsbuildinfo` | Cache do TypeScript |

---

## 🚀 Comando rápido

Na pasta **Clinica**:

```bash
cd Clinica
git add .
git status   # Revise antes de commitar
```

O `git add .` respeita o `.gitignore` – só adiciona o que deve ir pro repositório.
