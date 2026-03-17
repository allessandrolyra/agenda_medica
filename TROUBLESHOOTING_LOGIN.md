# Troubleshooting: Login e Esqueci a senha

## "Invalid login credentials" após cadastro

### Possíveis causas

1. **Confirmação de email obrigatória**
   - No Supabase, se **Confirm email** estiver ativo (padrão), o usuário precisa clicar no link enviado por email antes de fazer login.
   - **Solução:** Verificar a caixa de entrada (e spam) e clicar no link de confirmação.

2. **Senha incorreta**
   - Conferir se a senha foi digitada corretamente (caps lock, idioma do teclado, etc.).

3. **Email incorreto**
   - Conferir se o email está correto e corresponde ao cadastrado.

### O que fazer

- Use **"Esqueci a senha"** para receber um link e definir uma nova senha.
- Confirme o email se ainda não fez isso.
- Tente novamente com atenção à senha e ao email.

---

## Fluxo "Esqueci a senha"

1. Na tela de login, clique em **"Esqueci a senha"**.
2. Informe o email cadastrado.
3. Verifique o email (e spam) e clique no link recebido.
4. Defina a nova senha na tela que abrir.
5. Faça login com a nova senha.

### Configuração no Supabase

Para o fluxo funcionar, a URL de redirect deve estar em **Authentication** → **URL Configuration** → **Redirect URLs**:

- Local: `http://localhost:5173/**` (já cobre `/reset-password`)
- Produção: `https://seu-usuario.github.io/agenda_medica/**` (ajustar conforme o repositório)
