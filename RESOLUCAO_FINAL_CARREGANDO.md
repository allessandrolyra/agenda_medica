# ✅ Resolução definitiva: "Carregando Agenda Médica..."

## O problema

O site mostra "Carregando Agenda Médica..." porque o **HTML servido** tem:

```html
<script type="module" src="/src/main.tsx"></script>
```

Esse é o **index.html de desenvolvimento** – o navegador tenta carregar `/src/main.tsx` e recebe **404**. O correto seria o build com algo como `/agenda_medica/assets/index-xxx.js`.

## Causa raiz

O GitHub Pages está servindo o **código fonte** (branch `main`) em vez do **build** gerado pelo workflow. Isso ocorre quando:

1. **Source** está em "Deploy from a branch" com branch **main** (errado)
2. Ou o workflow antigo (peaceiris) não está publicando corretamente na branch `gh-pages`

## Solução aplicada

O workflow foi alterado para usar o **deploy oficial do GitHub** (`actions/deploy-pages` + `actions/upload-pages-artifact`). Com isso:

- O build é gerado com `VITE_BASE_PATH=/agenda_medica/`
- O HTML de produção usa `/agenda_medica/assets/xxx.js`
- O deploy é feito diretamente pelo GitHub Actions, sem branch `gh-pages`

---

## Passos obrigatórios (faça na ordem)

### 1. Configurar o Source do GitHub Pages

1. Acesse: https://github.com/allessandrolyra/agenda_medica
2. Vá em **Settings** → **Pages**
3. Em **Build and deployment** → **Source**, selecione **"GitHub Actions"**
4. Clique em **Save**

> ⚠️ Se continuar em "Deploy from a branch", o site não funcionará corretamente.

### 2. Fazer push do workflow atualizado

O workflow está em `Clinica/.github/workflows/deploy.yml`. Se o repositório `agenda_medica` tem o projeto na raiz (como no GitHub), copie o conteúdo desse arquivo para o `.github/workflows/deploy.yml` do seu repositório e faça push.

**Se você clona/push a partir da pasta Clinica:**

```bash
cd "c:/01. Foursys/07. Aulas Criando Agentes .MD/01.Agentes DevOps/Clinica"
git add .github/workflows/deploy.yml
git commit -m "fix: deploy oficial GitHub Pages - corrige Carregando"
git push origin main
```

**Se o repositório está em outra pasta:**

Copie o arquivo `Clinica/.github/workflows/deploy.yml` para `.github/workflows/deploy.yml` na raiz do seu repositório e faça push.

### 3. Verificar secrets

Em **Settings** → **Secrets and variables** → **Actions**, confirme que existem:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Aguardar o deploy

1. Vá em **Actions**
2. O workflow "Deploy to GitHub Pages" será executado após o push
3. Aguarde concluir (✓ verde)

### 5. Testar

Acesse: https://allessandrolyra.github.io/agenda_medica/

O site deve carregar normalmente, sem ficar em "Carregando Agenda Médica...".

---

## Resumo

| Antes | Depois |
|-------|--------|
| HTML com `/src/main.tsx` (dev) | HTML com `/agenda_medica/assets/xxx.js` (build) |
| Source: Deploy from branch (main ou gh-pages) | Source: **GitHub Actions** |
| peaceiris (branch gh-pages) | actions/deploy-pages (artefato direto) |
