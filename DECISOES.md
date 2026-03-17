# Decisões de Implementação – Agenda Médica Online

**Data:** Março 2026  
**Status:** Aprovado pelo time

---

## Decisões Aprovadas

| # | Decisão | Detalhe |
|---|---------|---------|
| 1 | **Job scheduler** | Implementar com Supabase Cron (Edge Functions) |
| 2 | **SMS** | Não implementar no MVP; apenas email |
| 3 | **Calendar sync** | Adiar; oferecer export ICS/CSV |
| 4 | **Staging** | Não implementar por enquanto |

---

## Condições de Segurança (sem staging)

- CI com lint + testes unitários
- Teste manual antes do merge
- Rollback documentado (git revert + redeploy)

---

## Prioridades de Implementação

1. **Sprint 1:** Status detalhados, audit logs, LGPD (consent_version, consent_at)
2. **Sprint 2:** Lembretes por email (Supabase Cron), dashboard KPIs
3. **Sprint 3:** Lista de espera, export ICS/CSV
4. **Sprint 4:** Ajustes, QA, documentação

---

## Implementado (Sprint 1–2)

| Item | Status |
|------|--------|
| DECISOES.md | ✓ |
| Migrations 008–013 | ✓ (status, audit_logs, LGPD, waitlist, cron doc, metrics RPC) |
| CI: lint + test | ✓ |
| Edge Function send-reminders | ✓ |
| GitHub Actions reminders-cron | ✓ (fallback para Free tier) |
| Dashboard Métricas | ✓ |
| Export ICS/CSV | ✓ |

## Próximos passos

1. Executar migrations no Supabase (008–013)
2. `supabase functions deploy send-reminders`
3. Configurar RESEND_API_KEY no Supabase (lembretes)
4. Habilitar workflow `reminders-cron.yml` (se não usar pg_cron)

## Referências

- [AVALIACAO_MELHORIAS_PRIORITARIAS.md](./AVALIACAO_MELHORIAS_PRIORITARIAS.md)
- [DOCUMENTACAO_COMPLETA.md](./DOCUMENTACAO_COMPLETA.md)
