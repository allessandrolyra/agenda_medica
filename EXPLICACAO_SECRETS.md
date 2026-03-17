# Explicação simples: Secrets (variáveis secretas)

---

## O que é isso?

Quando a função **send-reminders** roda, ela precisa enviar emails. Para isso, usa um serviço chamado **Resend**. O Resend exige uma **chave de acesso** (como uma senha) para saber que é você quem está pedindo para enviar o email.

Essa chave não pode ficar no código (qualquer um poderia ver). Por isso guardamos no Supabase em um lugar chamado **Secrets**.

---

## Analogia

Imagine que:
- **Resend** = Correios (quem entrega o email)
- **RESEND_API_KEY** = Sua credencial para usar os Correios
- **Secrets no Supabase** = Cofre onde você guarda essa credencial

A Edge Function abre o cofre, pega a credencial e usa para enviar o email.

---

## Onde fica no Supabase?

```
Supabase (site)
    └── Seu projeto
            └── Menu lateral esquerdo
                    └── "Edge Functions"
                            └── Botão "Manage secrets" ou "Secrets" (no topo)
                                    └── "Add new secret"
                                            └── Name: RESEND_API_KEY
                                            └── Value: re_xxxxxxxxxx (sua chave)
```

---

## Passo a passo resumido

| Passo | O que fazer |
|-------|-------------|
| 1 | Entrar no [Supabase](https://supabase.com) e abrir seu projeto |
| 2 | Clicar em **Edge Functions** no menu |
| 3 | Clicar em **Manage secrets** |
| 4 | Clicar em **Add new secret** |
| 5 | Nome: `RESEND_API_KEY` |
| 6 | Valor: a chave que você copiou do [Resend](https://resend.com) |
| 7 | Salvar |

---

## E as outras (SUPABASE_URL, etc.)?

O Supabase **já coloca** essas variáveis para você. Não precisa fazer nada. Só a `RESEND_API_KEY` que você adiciona.

---

## Não tenho conta no Resend

Sem problema. A função roda do mesmo jeito, só que não envia email de verdade. Ela "simula" o envio. Depois você pode criar conta no Resend e configurar.
