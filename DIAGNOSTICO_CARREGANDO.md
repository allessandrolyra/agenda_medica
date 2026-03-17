# 🔍 Diagnóstico: "Carregando Agenda Médica..." e não abre

**"Carregando Agenda Médica..."** = o JavaScript **não carregou**. O Supabase **não** é a causa – o problema é que os arquivos JS/CSS retornam 404.

---

## ✅ Checklist de verificação

### 1. URL correta (muito importante)

Seu repositório é **agenda_medica** (com underscore). A URL deve ser:

```
https://allessandrolyra.github.io/agenda_medica/
```

| ❌ Errado | ✅ Correto |
|-----------|------------|
| `.../agenda-medica/` (hífen) | `.../agenda_medica/` (underscore) |
| `.../agenda_medica` (sem barra) | `.../agenda_medica/` (com barra no final) |
| `.../Agenda_Medica/` (maiúsculas) | `.../agenda_medica/` (minúsculas) |

---

### 2. Conferir erros no navegador (F12)

1. Abra o site
2. Pressione **F12** (ou botão direito → Inspecionar)
3. Vá na aba **Console**
4. Procure erros em vermelho, principalmente **404**

Exemplo de erro típico:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
```

Se aparecer 404 em arquivos `.js` ou `.css`, o problema é o **base path** (caminho dos arquivos).

---

### 3. Build no GitHub Actions

1. Acesse: https://github.com/allessandrolyra/agenda_medica/actions  
2. Abra o último workflow **Deploy to GitHub Pages**  
3. Confirme que terminou com **ícone verde** ✓  

Se o build falhou, o site não será atualizado.

---

### 4. GitHub Pages ativado

1. Repositório → **Settings** → **Pages**
2. Em **Source**, deve estar: **GitHub Actions**

---

## 📤 O que fazer agora

1. **Testar a URL exata:** https://allessandrolyra.github.io/agenda_medica/

2. **Abrir o Console (F12)** e ver se há erros 404 nos arquivos .js ou .css

3. **Verificar o build:** https://github.com/allessandrolyra/agenda_medica/actions – o último workflow deve estar verde ✓

4. Se ainda não funcionar, confira em **Settings** → **Pages** se o Source está como **GitHub Actions**

---

## 📋 Resumo

| Causa | Solução |
|------|---------|
| URL errada | Usar `.../agenda_medica/` (underscore, barra no final) |
| Base path errado | Workflow usa `VITE_BASE_PATH: /agenda_medica/` (path absoluto) |
| Supabase URL | Site URL e Redirect URLs devem ser da **produção**, não localhost |
| Build falhou | Conferir Actions e secrets |
| Pages desativado | Settings → Pages → Source: GitHub Actions |

---

## Sobre o Supabase

O Supabase **não** causa a tela "Carregando Agenda Médica...".  
Essa mensagem vem do HTML estático, antes do React carregar.  
Se o JS carregasse, você veria "Carregando..." (spinner do React) e, em até 8 segundos, a tela mudaria.

**Conclusão:** o problema é o carregamento dos arquivos JavaScript (404), não o Supabase.

---

## Correção aplicada (base path)

**Conforme docs oficiais do Vite** ([static-deploy](https://vitejs.dev/guide/static-deploy.html#github-pages)):

1. **Workflow** usa base **absoluto**: `VITE_BASE_PATH: /${{ github.event.repository.name }}/`
2. **htmlBasePlugin removido** – simplificação, menos risco de conflito
3. Build gera paths: `/agenda_medica/assets/xxx.js`

Ver `HISTORICO_CARREGANDO.md` para o histórico completo de mudanças.

**Após essa alteração:** faça um novo push para disparar o deploy.
