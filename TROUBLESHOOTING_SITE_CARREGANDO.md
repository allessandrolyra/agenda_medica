# 🔧 Site fica carregando e não abre – O que fazer

Se a aplicação fica em "Carregando..." ou "Carregando Agenda Médica..." e não abre, siga este guia.

---

## 1. Conferir a URL

A URL precisa ser exata. No GitHub Pages:

```
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```

Exemplos:
- ✅ `https://joao.github.io/agenda-medica/`
- ❌ `https://joao.github.io/` (falta o nome do repositório)
- ❌ `https://joao.github.io/agenda-medica` (falta a barra no final)

---

## 2. Se aparecer "Carregando Agenda Médica..." (texto do HTML)

Significa que o JavaScript não carregou. Possíveis causas:

### 2.1 URL errada
- Use a URL completa com o nome do repositório e barra no final.

### 2.2 Nome do repositório diferente
- O nome do repo no GitHub deve ser o mesmo usado na URL.
- Ex.: repo `agenda-medica` → URL `.../agenda-medica/`

### 2.3 Build ainda não concluiu
- Vá em **Actions** no repositório.
- Confira se o workflow **Deploy to GitHub Pages** terminou com sucesso (ícone verde).

### 2.4 Repositório com nome estranho
- Evite espaços ou caracteres especiais no nome do repo.
- Ex.: `agenda-medica` é melhor que `01. Agentes DevOps`.

---

## 3. Se aparecer "Carregando..." (spinner do React)

Significa que o JavaScript carregou, mas a conexão com o Supabase está demorando ou falhando.

### 3.1 Secrets no GitHub
- **Settings** → **Secrets and variables** → **Actions**
- Confirme que existem:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Nomes exatos, sem espaços.

### 3.2 Valores dos secrets
- `VITE_SUPABASE_URL`: `https://xxxxx.supabase.co` (sua URL real)
- `VITE_SUPABASE_ANON_KEY`: chave que começa com `eyJ...`
- Use a chave **anon public**, não a **service_role**.

### 3.3 Novo deploy após alterar secrets
- Depois de mudar os secrets, faça um novo push ou rode o workflow manualmente em **Actions** → **Run workflow**.

---

## 4. Checklist rápido

| Item | Onde verificar |
|------|----------------|
| URL correta | `https://usuario.github.io/repo/` com barra no final |
| Build ok | Actions → workflow verde |
| Secrets | Settings → Secrets and variables → Actions |
| Supabase ativo | Projeto ativo no supabase.com |

---

## 5. Testar em aba anônima

- Abra uma janela anônima/privada.
- Acesse a URL do site.
- Evita cache e extensões que possam bloquear.

---

## 6. Ver erros no navegador

1. Pressione **F12** (ou botão direito → Inspecionar).
2. Aba **Console**.
3. Veja se há erros em vermelho (ex.: 404, CORS, falha de rede).

---

## 7. Correção aplicada no código

Foi adicionada uma proteção para o loading não ficar infinito:

- Timeout de 3 segundos na conexão com o Supabase.
- Após 8 segundos, a tela de loading é encerrada mesmo que haja falha.

Para usar essa correção, faça um novo push:

```bash
cd Clinica
git add .
git commit -m "fix: evita loading infinito"
git push
```

---

*Se o problema continuar, envie: URL que está usando, mensagem exata na tela e erros do Console (F12).*
