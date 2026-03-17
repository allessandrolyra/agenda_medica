# ✅ Verificação do deploy – "Carregando Agenda Médica..."

Se o problema continua após o push, siga esta checklist:

## 1. Estrutura do repositório

O **package.json** deve estar na **raiz** do repositório. Ao fazer push:

- ✅ **Correto:** A raiz do repo tem `package.json`, `src/`, `index.html`
- ❌ **Errado:** A raiz tem pasta `Clinica/` e o `package.json` está em `Clinica/`

**Se o package.json está em Clinica/:** O workflow falhará. Duas opções:
- Fazer push apenas do conteúdo de Clinica (como raiz do repo)
- Ou adicionar `defaults.run.working-directory: Clinica` no workflow

## 2. Nome do repositório

O nome no GitHub deve ser **exatamente** o usado na URL:
- URL: `https://allessandrolyra.github.io/agenda_medica/`
- Repo: `agenda_medica` (com underscore)

## 3. Após o push

1. Vá em **Actions** → aguarde o workflow concluir (✓ verde)
2. Se falhar, abra o log e veja o erro
3. Acesse: https://allessandrolyra.github.io/agenda_medica/ (com barra no final)

## 4. Console do navegador (F12)

1. Abra o site
2. F12 → aba **Console**
3. Procure erros 404 em vermelho
4. Aba **Network** → recarregue → veja quais arquivos retornam 404

Se `index-xxx.js` ou `index-xxx.css` retornam 404, o path está errado.

## 5. Correções aplicadas nesta versão

- Redirect para adicionar barra final na URL (evita path relativo quebrado)
- Cópia de `index.html` para `404.html` (SPA routing)
- Base path: `/agenda_medica/`
