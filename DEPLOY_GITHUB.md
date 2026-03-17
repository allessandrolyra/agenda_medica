# 🚀 Guia: Publicar Agenda Médica no GitHub

Passo a passo didático para subir o projeto no GitHub e publicar o site.

---

## 📋 Pré-requisitos

- [ ] Conta no [GitHub](https://github.com)
- [ ] [Git](https://git-scm.com) instalado no computador
- [ ] Projeto Supabase configurado (veja `CHECKLIST_SUPABASE.md`)
- [ ] Node.js instalado (para build local)

---

## Parte 1: Preparar o repositório local

### Passo 1.0 – Estrutura do projeto

Se o projeto está dentro de uma pasta maior (ex: `01.Agentes DevOps/Clinica/`), crie o repositório **apenas com o conteúdo da pasta Clinica**:

```bash
cd "caminho/para/Clinica"   # Entre na pasta do projeto
```

O repositório no GitHub terá como raiz: `package.json`, `src/`, `supabase/`, etc.

### Passo 1.1 – Verificar arquivos sensíveis

O `.gitignore` já exclui:
- `node_modules/`
- `dist/`
- `.env` e `.env.local` (credenciais)
- `*.log`

**Importante:** Nunca commite `.env.local` – ele contém chaves do Supabase.

### Passo 1.2 – Inicializar Git (se ainda não fez)

```bash
git init
```

### Passo 1.3 – Adicionar arquivos

```bash
git add .
git status   # Revise o que será enviado
```

Confirme que **não** aparecem: `.env`, `.env.local`, `node_modules`.

### Passo 1.4 – Primeiro commit

```bash
git commit -m "feat: Agenda Médica - versão inicial"
```

---

## Parte 2: Criar repositório no GitHub

### Passo 2.1 – Criar o repositório

1. Acesse [github.com/new](https://github.com/new)
2. **Repository name:** `agenda-medica` (ou outro nome)
3. **Description:** Sistema de agendamento de consultas médicas
4. Escolha **Public**
5. **Não** marque "Add a README" (já temos arquivos)
6. Clique em **Create repository**

### Passo 2.2 – Conectar e enviar

O GitHub mostrará comandos. Use:

```bash
git remote add origin https://github.com/SEU-USUARIO/agenda-medica.git
git branch -M main
git push -u origin main
```

Substitua `SEU-USUARIO` pelo seu usuário do GitHub.

---

## Parte 3: Configurar variáveis secretas

O build precisa das credenciais do Supabase. No GitHub:

1. Vá no repositório → **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Sua chave anônima do Supabase |

---

## Parte 4: Publicar o site (GitHub Pages)

### Passo 4.1 – Habilitar GitHub Pages

1. Repositório → **Settings** → **Pages**
2. Em **Source**, selecione **GitHub Actions**

### Passo 4.2 – Ajustar o base path (se necessário)

Se o repositório se chama `agenda-medica`, a URL será:
`https://seu-usuario.github.io/agenda-medica/`

O workflow já está configurado para isso. Se o nome do repo for outro, edite o arquivo `.github/workflows/deploy.yml` e altere a linha `base: '/agenda-medica/'`.

### Passo 4.3 – Disparar o deploy

1. Vá em **Actions**
2. O workflow **Deploy to GitHub Pages** deve rodar automaticamente no push
3. Aguarde o build concluir (ícone verde ✓)
4. Acesse: `https://SEU-USUARIO.github.io/agenda-medica/`

---

## Parte 5: Configurar Supabase para produção

### Passo 5.1 – Redirect URLs

No Supabase → **Authentication** → **URL Configuration**:

1. **Site URL:** `https://seu-usuario.github.io/agenda-medica/`
2. **Redirect URLs:** adicione `https://seu-usuario.github.io/agenda-medica/**`

---

## 📌 Resumo rápido

| Etapa | Onde | O quê |
|-------|------|-------|
| 1 | Local | `git init`, `git add`, `git commit` |
| 2 | GitHub | Criar repo, `git push` |
| 3 | GitHub Settings | Adicionar secrets (Supabase) |
| 4 | GitHub Pages | Source: GitHub Actions |
| 5 | Supabase | Configurar Redirect URLs |

---

## 🔄 Alternativa: Vercel (mais simples)

Se preferir Vercel em vez de GitHub Pages:

1. Acesse [vercel.com](https://vercel.com) e conecte o GitHub
2. Importe o repositório `agenda-medica`
3. **Root Directory:** `Clinica` (se o repo tiver a pasta Clinica na raiz)
4. **Environment Variables:** adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
5. Deploy automático a cada push

---

## ❓ Problemas comuns

**Site em branco?**
- Verifique se o `base` no `vite.config.ts` está correto para a URL do GitHub Pages.

**Erro de login/redirect?**
- Confira as Redirect URLs no Supabase com a URL exata do site.

**Build falha no GitHub Actions?**
- Verifique se os secrets estão configurados corretamente.
