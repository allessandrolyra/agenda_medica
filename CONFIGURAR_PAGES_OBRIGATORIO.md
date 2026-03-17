# ⚠️ CONFIGURAÇÃO OBRIGATÓRIA – GitHub Pages

O site estava mostrando "Carregando Agenda Médica..." porque o GitHub Pages servia o **código fonte** em vez do **build**.

## ✅ Solução aplicada

O workflow foi alterado para usar **peaceiris/actions-gh-pages**, que envia o build para a branch `gh-pages`.

## 📋 O que você precisa fazer

### 0. Permissões do workflow (se necessário)

Se o deploy falhar por permissão, vá em **Settings** → **Actions** → **General** → **Workflow permissions** → marque **"Read and write permissions"** → Save.

### 1. Abra o repositório
https://github.com/allessandrolyra/agenda_medica

### 2. Vá em Settings → Pages

### 3. Em "Build and deployment" → "Source"

Selecione **"Deploy from a branch"** (não "GitHub Actions").

### 4. Configure:

| Campo | Valor |
|-------|-------|
| **Branch** | `gh-pages` |
| **Folder** | `/ (root)` |

### 5. Salve (Save)

### 6. Faça um push para disparar o deploy

```bash
cd "c:/01. Foursys/07. Aulas Criando Agentes .MD/01.Agentes DevOps/Clinica"
git add .
git commit -m "fix: deploy via gh-pages branch"
git push origin main
```

### 7. Aguarde o workflow

- Vá em **Actions** → aguarde o workflow concluir (✓ verde)
- A branch `gh-pages` será criada/atualizada com o build

### 8. Teste

Acesse: https://allessandrolyra.github.io/agenda_medica/

---

## Por que isso resolve?

| Antes | Depois |
|-------|--------|
| Pages servia a branch `main` (código fonte) | Pages serve a branch `gh-pages` (build) |
| index.html com `/src/main.tsx` | index.html com `/agenda_medica/assets/xxx.js` |
| 404 nos scripts | Scripts carregam corretamente |
