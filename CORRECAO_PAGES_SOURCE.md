# 🔴 Correção: GitHub Pages servindo código fonte em vez do build

## O problema

O navegador solicita: `https://allessandrolyra.github.io/src/main.tsx` → **404**

Isso significa que o **index.html** servido tem `<script src="/src/main.tsx">` – ou seja, o **código fonte**, não o build.

## Causa

O **GitHub Pages está configurado para "Deploy from a branch"** em vez de **"GitHub Actions"**.

Quando usa "Deploy from a branch", o GitHub serve os arquivos **diretamente do repositório** (index.html, src/, etc.). O `dist/` (build) **não está no repositório** (está no .gitignore), então o site usa o index.html original, que aponta para `/src/main.tsx`.

## ✅ Solução

### 1. Abra o repositório no GitHub
https://github.com/allessandrolyra/agenda_medica

### 2. Vá em Settings → Pages

### 3. Em "Build and deployment" → "Source"

Altere de **"Deploy from a branch"** para **"GitHub Actions"**:

| ❌ Errado | ✅ Correto |
|-----------|------------|
| Source: **Deploy from a branch** | Source: **GitHub Actions** |
| Branch: main | (automático) |

### 4. Salve

Não é necessário fazer push. A alteração é só nas configurações.

### 5. Aguarde o próximo deploy

- Se já houve push recente, o workflow pode rodar de novo
- Ou faça um push vazio: `git commit --allow-empty -m "trigger deploy" && git push`
- Ou em **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### 6. Teste

Acesse: https://allessandrolyra.github.io/agenda_medica/

O site deve carregar corretamente (com os assets em `/agenda_medica/assets/`).
