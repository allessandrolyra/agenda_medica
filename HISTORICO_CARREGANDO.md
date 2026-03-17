# 📜 Histórico: "Carregando Agenda Médica..." – O que mudou

Documento para rastrear alterações que afetaram o carregamento do site no GitHub Pages.

---

## 🔴 Problema

A tela fica em **"Carregando Agenda Médica..."** e não abre. Essa mensagem vem do **HTML estático** (index.html), antes do React carregar. Significa que os arquivos **JavaScript não estão sendo carregados** (404 ou erro de path).

---

## 📋 Linha do tempo de mudanças

### Configuração que funcionava (inicial)

- `base: '/'` ou `base: '/agenda_medica/'` no Vite
- Build gerava paths absolutos: `/agenda_medica/assets/xxx.js`
- Site funcionava em https://allessandrolyra.github.io/agenda_medica/

### Mudanças que causaram o problema

1. **Path relativo (./)**  
   - Workflow passou a usar `VITE_BASE_PATH: ./`  
   - Objetivo: evitar 404 (referência a Stack Overflow)  
   - Resultado: paths relativos `./assets/xxx.js` podem falhar quando a URL não tem barra final

2. **Plugin htmlBasePlugin**  
   - Injetava `<base href="/agenda_medica/">` no HTML  
   - Objetivo: corrigir resolução de paths relativos  
   - Possível conflito: tag `<base>` pode alterar o comportamento de resolução de URLs em alguns cenários

3. **Alternância base absoluto ↔ relativo**  
   - Várias alterações entre `base: './'` e `base: '/agenda_medica/'`  
   - Inconsistência entre documentação e implementação

---

## ✅ Correção aplicada (atual)

**Conforme [docs oficiais do Vite](https://vitejs.dev/guide/static-deploy.html#github-pages):**

> If you are deploying to `https://<user>.github.io/<repo>/`, then set `base` to `'/<repo>/'`.

### Alterações

1. **Remoção do htmlBasePlugin** – simplificação e menos risco de conflito
2. **Base absoluto no workflow** – `VITE_BASE_PATH: /${{ github.event.repository.name }}/`
3. **vite.config.ts** – `base: process.env.VITE_BASE_PATH || '/'`

### Resultado do build

```html
<script src="/agenda_medica/assets/index-xxx.js"></script>
<link href="/agenda_medica/assets/index-xxx.css">
```

Paths absolutos, compatíveis com o GitHub Pages.

---

## 🧪 Verificação

1. Build local com env de produção:
   ```powershell
   $env:VITE_BASE_PATH="/agenda_medica/"
   npm run build
   ```

2. Conferir `dist/index.html` – scripts devem ter `/agenda_medica/assets/...`

3. Após push, conferir em **Actions** se o workflow concluiu com sucesso

4. Testar: https://allessandrolyra.github.io/agenda_medica/

---

## 📚 Referências

- [Vite – Deploying a Static Site – GitHub Pages](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [Stack Overflow – GitHub pages and absolute paths](https://stackoverflow.com/questions/79409403/github-pages-and-absolute-paths)
- `DIAGNOSTICO_CARREGANDO.md` – checklist de diagnóstico
