# ⚠️ CONFIGURAÇÃO OBRIGATÓRIA – GitHub Pages

O site estava mostrando "Carregando Agenda Médica..." porque o GitHub Pages servia o **código fonte** em vez do **build**.

## ✅ Solução aplicada

O workflow usa o **deploy oficial do GitHub** (`actions/deploy-pages` + `actions/upload-pages-artifact`), sem dependências de terceiros. Isso elimina o aviso de Node.js 20 deprecado.

## 📋 O que você precisa fazer

### 0. Permissões do workflow (se necessário)

Se o deploy falhar por permissão, vá em **Settings** → **Actions** → **General** → **Workflow permissions** → marque **"Read and write permissions"** → Save.

### 1. Abra o repositório
https://github.com/allessandrolyra/agenda_medica

### 2. Vá em Settings → Pages

### 3. Em "Build and deployment" → "Source"

Selecione **"GitHub Actions"** (não "Deploy from a branch").

### 4. Salve (Save)

### 5. Faça um push para disparar o deploy

```bash
cd "c:/01. Foursys/07. Aulas Criando Agentes .MD/01.Agentes DevOps/Clinica"
git add .
git commit -m "fix: deploy oficial GitHub Pages (sem warning Node 20)"
git push origin main
```

### 6. Aguarde o workflow

- Vá em **Actions** → aguarde o workflow concluir (✓ verde)
- O build será enviado diretamente para o GitHub Pages via `actions/deploy-pages`

### 7. Teste

Acesse: https://allessandrolyra.github.io/agenda_medica/

---

## Por que isso resolve?

| Antes | Depois |
|-------|--------|
| peaceiris/actions-gh-pages (Node 20 deprecado) | actions/deploy-pages (oficial, sem warning) |
| Source: Deploy from branch (gh-pages) | Source: GitHub Actions |
| Aviso de depreciação no deploy | Deploy limpo, sem avisos |
