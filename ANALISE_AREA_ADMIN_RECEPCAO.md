# Análise: Área de Administração e Recepção

**Objetivo:** Avaliar as mudanças solicitadas (área admin, cadastro de usuários, agendamento por secretárias) e sugerir opções.

---

## Estado atual do sistema

### O que já existe

| Funcionalidade | Admin | Secretária/Atendente |
|---------------|-------|----------------------|
| **Cadastrar usuários** | ✅ Via Admin → Usuários (Edge Function) | ❌ Bloqueado – Edge Function só aceita admin |
| **Marcar consultas** | ✅ Admin → Consultas ou /agenda | ✅ /agenda (Agenda completa) |
| **Consultar agendas dos médicos** | ✅ /agenda | ✅ /agenda |
| **Liberar paciente para agendar online** | ✅ Admin → Usuários (checkbox) | ✅ Admin → Usuários (checkbox) |
| **Médicos, Horários, Funções** | ✅ Admin → Médicos, Horários, Funções | ⚠️ Vê menu, mas RLS bloqueia edição |

### Rotas e navegação

- **Admin** (`/admin`): Médicos, Funções, Usuários, Horários, Consultas
- **Agenda completa** (`/agenda`): Marcar consultas para pacientes (médico, data, horário)
- **Layout:** Admin e Secretária veem o mesmo link "Admin" (ambos acessam `/admin`)

---

## Lacunas identificadas

### 1. Secretárias não conseguem cadastrar usuários

O modelo de permissões define `users.create` para Atendente, mas a Edge Function `create-user` só permite Administrador:

```typescript
// create-user/index.ts: só admin
const isAdmin = profile?.role === 'admin' || ...
if (!isAdmin) return new Response(JSON.stringify({ error: 'Sem permissão' }), { status: 403 })
```

### 2. Área Admin confusa para secretárias

- Secretárias veem o menu completo (Médicos, Funções, Horários, etc.),
- RLS impede que alterem médicos, funções e horários,
- Resultado: telas podem ficar vazias ou com erros de permissão.

### 3. Navegação pouco clara

- "Admin" é usado para Admin e Recepção,
- Não há uma área específica para recepção com foco em cadastro + agenda.

---

## Opções de evolução

### Opção A – Manutenção mínima (rápida)

**O que fazer:**  
- Permitir que Atendentes também criem usuários na Edge Function.

**Prós:**  
- Pouca mudança  
- Secretárias passam a cadastrar usuários  
- Mantém o fluxo atual  

**Contras:**  
- Secretárias continuam vendo o menu Admin completo (Médicos, Funções, etc.)  
- Possíveis erros de permissão em algumas telas  

**Estimativa:** ~1 hora  

---

### Opção B – Menu condicional por perfil

**O que fazer:**  
- Permitir Atendentes na Edge Function (como na Opção A).  
- No menu Admin, só exibir links para o que o perfil pode usar:
  - **Admin:** Médicos, Funções, Usuários, Horários, Consultas
  - **Atendente:** Usuários e Consultas

**Prós:**  
- Interface mais clara  
- Menos erros de permissão  
- Implementação simples  

**Contras:**  
- Secretárias continuam entrando em Admin  

**Estimativa:** ~2–3 horas  

---

### Opção C – Área separada para Recepção

**O que fazer:**  
- Nova área: **Recepção** (`/recepcao`):
  - Cadastrar usuários  
  - Agenda completa (visualização por médico)  
  - Marcar consultas  
- Admin continua com: Médicos, Funções, Usuários, Horários, Consultas
- Layout: Admin vê "Admin"; Atendente vê "Recepção" (e não "Admin").

**Prós:**  
- Separação clara entre Admin e Recepção  
- UX mais intuitiva para secretárias  
- Facilita evolução futura (ex.: relatórios, confirmações)  

**Contras:**  
- Mais refatoração  
- Pode haver duplicação de lógica entre Admin e Recepção  

**Estimativa:** ~4–6 horas  

---

### Opção D – Recepção unificada com dashboard

**O que fazer:**  
- Área de Recepção com dashboard:
  - Visão geral da agenda  
  - Cadastro rápido de usuário  
  - Filtros por médico, data, status  
  - Atalhos para agendar e consultar  

**Prós:**  
- Experiência mais adequada para uso diário  

**Contras:**  
- Maior esforço de desenvolvimento  

**Estimativa:** ~8–12 horas  

---

## Opinião do time (por agente)

| Agente | Foco | Recomendação |
|--------|------|--------------|
| **Shield** | Segurança | Opção A ou B: permitir Atendente na Edge Function, mas restringir criação de usuários (ex.: só Paciente). |
| **Forge** | Infraestrutura | Opção A ou B: menos mudanças, menos risco de regressão. |
| **Visionary** | Arquitetura | Opção C: separar Admin e Recepção melhora evolução e manutenção. |
| **Bridge** | UX/Colaboração | Opção B ou C: reduzir confusão e erros de permissão. |
| **Insight** | Código | Opção B: reutilizar componentes existentes. |

---

## Recomendação sugerida

**Curto prazo:**  
**Opção B** – Menu condicional + Atendente na Edge Function.

**Médio prazo:**  
**Opção C** – Área separada de Recepção para melhor organização e escalabilidade.

---

## Próximos passos sugeridos

1. **Imediato:**  
   - Permitir Atendente na Edge Function `create-user`  
   - Garantir que secretárias consigam cadastrar usuários  

2. **Próxima fase:**  
   - Escolher entre Opção B ou C  
   - Implementar menu condicional ou área separada de Recepção  

3. **Opcional:**  
   - Documentar fluxos de Admin e Recepção  
   - Atualizar README com as novas áreas  

---

## Resumo

| Item | Situação |
|------|----------|
| Admin cadastrar usuários | ✅ Funciona |
| Admin marcar consultas | ✅ Funciona |
| Secretária marcar consultas | ✅ Funciona |
| Secretária consultar agendas | ✅ Funciona |
| Secretária cadastrar usuários | ❌ Bloqueado – Edge Function só aceita admin |
| Menu Admin para secretárias | ⚠️ Mostra tudo, mas RLS bloqueia parte |

Ação principal: **liberar Atendentes na Edge Function `create-user`** para permitir cadastro de usuários pelas secretárias.
