# ADR-003 — Filas de atendimento e janela de mensagens Meta

## Status

Aceito — contrato operacional para a próxima etapa de implementação.

## Contexto

O frontend ainda mistura as abas legadas (`Minhas`, `Não atribuídas` e `Todas`) com as filas reais do backend (`RECEPTION`, `DEPARTMENT`, `CONVERSATION` e `CLOSED`). Isso permite estados incoerentes: envio humano antes da atribuição, conversas aparecendo na aba errada e contadores divergentes.

## Decisão

O Inbox usará quatro filas canônicas, nesta ordem visual para o atendimento ativo:

1. **Recepção** (`RECEPTION`): conversa nova, sem atendente e sem departamento. A IA pode responder. O humano apenas visualiza, transfere para atendente/departamento ou finaliza.
2. **Departamentos** (`DEPARTMENT`): fila de um departamento, sem atendente individual. Somente membro do departamento (ou ADMIN) pode assumir. Não há envio humano antes da assunção.
3. **Ativas** (`CONVERSATION`): conversa atribuída ao atendente atual. O responsável pode responder, usar respostas rápidas/templates, transferir e finalizar.
4. **Finalizados** (`CLOSED`): histórico de conversas encerradas. A reabertura atribui imediatamente a conversa ao usuário que reabriu e a coloca em Ativas.

O estado de atribuição é determinado por `agentId`, `departmentId`, `queue` e `status`; filtros legados não serão a fonte de verdade.

## Transições autorizadas

```text
RECEPTION --assumir--> CONVERSATION (agentId = usuário)
RECEPTION --transferir departamento--> DEPARTMENT (departmentId definido)
RECEPTION --transferir atendente--> CONVERSATION (agentId definido)
DEPARTMENT --assumir--> CONVERSATION (agentId = usuário membro)
CONVERSATION --transferir departamento--> DEPARTMENT (agentId = null)
CONVERSATION --transferir atendente--> CONVERSATION (novo agentId)
CONVERSATION --finalizar--> CLOSED
CLOSED --reabrir--> CONVERSATION (agentId = usuário que reabriu)
```

Uma tentativa de envio humano em `RECEPTION` ou `DEPARTMENT` deve ser bloqueada no frontend e rejeitada pelo backend. A atribuição automática no endpoint de envio não é permitida.

## IA

O departamento de fallback da IA será uma configuração do futuro painel Super Admin e será aplicado pelo prompt/configuração da IA. Enquanto essa configuração não existir, uma conversa sem intenção identificada permanece na Recepção. Se um humano assumir ou transferir, a resposta automática pendente da IA deve ser cancelada.

## Templates Meta e janela de 24 horas

- Templates são exclusivos de canais Meta Cloud.
- O backend consulta a Graph API e retorna somente templates `APPROVED`, com idioma e variáveis.
- Não existe fallback local, `default_waba` ou template fictício.
- Uma conversa iniciada pelo atendente exige template aprovado antes da primeira mensagem livre.
- A janela é aberta somente quando chega uma mensagem do cliente e dura 24 horas desde o último inbound.
- Dentro da janela, texto normal é permitido; fora dela, somente template aprovado.
- O horário do último inbound deve ser persistido e atualizado por webhook. O envio do atendente não reabre a janela.
- Erros da Meta, variáveis inválidas e ausência de templates devem ser exibidos sem registrar falso sucesso.

## Consequências

O backend deverá expor listagem por `queue`, filtros secundários (`departmentId`, `agentId`, `channelId`, período e busca), contadores server-side e eventos realtime para mudança de fila, atribuição, status e mensagens. O frontend deverá refletir as mesmas transições, com loading, erro, bloqueios e confirmação de ação.

## Fora deste ADR

A configuração visual e operacional da IA no painel Super Admin será definida em ADR próprio quando esse painel for implementado.
