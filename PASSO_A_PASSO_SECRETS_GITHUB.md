# 📖 Passo a passo: Integração com o banco (Supabase + GitHub)

Guia detalhado para configurar a integração entre o GitHub e o Supabase.

---

## Parte A: Pegar as credenciais no Supabase

### Passo 1 – Acessar o Supabase

1. Abra o navegador e vá em **[supabase.com](https://supabase.com)**
2. Faça login na sua conta
3. Clique no seu projeto (ex: `agendamento-medico`)

### Passo 2 – Abrir as configurações do projeto

1. No menu lateral **esquerdo**, clique no ícone de **engrenagem** (⚙️)
2. O nome da seção é **"Project Settings"** ou **"Configurações do projeto"**

### Passo 3 – Ir na seção API

1. No menu lateral **dentro** de Project Settings, clique em **"API"**
2. Você verá uma página com:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - **Project API keys** (chaves de API)

### Passo 4 – Copiar os dois valores

| Campo | Onde fica | O que copiar |
|-------|-----------|--------------|
| **Project URL** | No topo da página, em "Project URL" | A URL completa (ex: `https://xxxxx.supabase.co`) |
| **anon public** | Na tabela "Project API keys", na linha "anon" e coluna "key" | A chave longa que começa com `eyJ...` |

**Dica:** Clique no ícone de copiar ao lado de cada valor para copiar facilmente.

**Guarde esses dois valores** – você vai colar no GitHub no próximo passo.

---

## Parte B: Adicionar os Secrets no GitHub

### Passo 1 – Abrir o repositório no GitHub

1. Abra **[github.com](https://github.com)** e faça login
2. Clique no seu repositório (ex: `agenda-medica`)

### Passo 2 – Ir em Settings (Configurações)

1. No topo da página do repositório, você verá várias abas: **Code**, **Issues**, **Pull requests**, etc.
2. Clique na última aba: **"Settings"** (ou **"Configurações"**)
3. Se aparecer um aviso de que você está em área restrita, é normal – você é o dono do repo

### Passo 3 – Abrir Secrets and variables

1. No menu lateral **esquerdo** das Settings, procure a seção **"Security"** (Segurança)
2. Clique em **"Secrets and variables"** → **"Actions"**
   - Caminho completo: **Settings** → **Secrets and variables** → **Actions**

### Passo 4 – Adicionar o primeiro secret (VITE_SUPABASE_URL)

1. Clique no botão **"New repository secret"** (ou **"Novo secret do repositório"**)
2. No campo **"Name"** (Nome), digite **exatamente**:
   ```
   VITE_SUPABASE_URL
   ```
   *(Copie e cole para não errar)*
3. No campo **"Secret"** (ou "Value"), **cole a Project URL** que você copiou do Supabase
   - Exemplo: `https://abcdefghijk.supabase.co`
4. Clique em **"Add secret"** (Adicionar secret)

### Passo 5 – Adicionar o segundo secret (VITE_SUPABASE_ANON_KEY)

1. Clique novamente em **"New repository secret"**
2. No campo **"Name"**, digite **exatamente**:
   ```
   VITE_SUPABASE_ANON_KEY
   ```
3. No campo **"Secret"**, **cole a chave anon public** que você copiou do Supabase
   - É uma chave longa que começa com `eyJ...`
4. Clique em **"Add secret"**

### Passo 6 – Conferir

1. Na lista de secrets, você deve ver:
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_URL`
2. Os valores **não** aparecem (ficam ocultos por segurança) – isso é normal

---

## Resumo visual do caminho no GitHub

```
Repositório (agenda-medica)
    └── Settings (aba no topo)
            └── Secrets and variables (menu lateral esquerdo, em Security)
                    └── Actions
                            └── New repository secret
```

---

## Resumo visual do caminho no Supabase

```
Projeto (agendamento-medico)
    └── Project Settings (ícone engrenagem no menu lateral)
            └── API
                    └── Project URL (copiar)
                    └── Project API keys → anon → key (copiar)
```

---

## ⚠️ Atenção

| Item | Detalhe |
|------|---------|
| **Nome exato** | Os nomes devem ser `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` – sem espaço, com underscore |
| **Não compartilhe** | Nunca publique essas chaves em lugar público |
| **anon, não service_role** | Use a chave **anon public**, não a **service_role** |

---

## Próximo passo

Depois de configurar os secrets, vá em **Settings** → **Pages** e selecione **GitHub Actions** como source. O build usará esses secrets automaticamente.
