# ADR-004 — Migração do painel de conversas para componentes nativos

## Contexto

O backend Abravely já é a fonte de verdade para conversas, filas, mensagens,
atribuições, encerramentos e a janela de 24 horas da Meta. O painel visual ainda
usa o `ChatList.vue` e partes do `ConversationBox.vue` herdadas do Chatwoot.

Trocar somente a lista por um componente novo causou tela vazia, pois o
`ChatList.vue` também registra ações por `provide()` consumidas por componentes
filhos. Portanto, o painel não pode ser substituído por partes sem remover ou
substituir essas dependências explícitas.

## Fonte de verdade atual

| Área | Fonte de verdade | Situação |
| --- | --- | --- |
| Conversas e filas | `GET /api/v1/conversations` | Nativa e pronta para uso |
| Detalhe e mensagens | `GET /api/v1/conversations/:id` | Nativa e pronta para uso |
| Assumir, transferir, finalizar e reabrir | `conversation.routes.ts` | Nativa e pronta para uso |
| Atualizações em tempo real | Socket.IO por workspace | Nativa |
| Lista e painel visuais | `ChatList.vue` + `ConversationBox.vue` | Herdados, em transição |
| Rota `/api/v1/accounts/:accountId/conversations` | `account.routes.ts` | Compatibilidade temporária; não usar em novas telas |

## Dependências herdadas críticas

O `ChatList.vue` fornece as ações abaixo por injeção. Enquanto o
`ConversationBox.vue` e seus descendentes as consumirem, o `ChatList` precisa
continuar montado:

- seleção e deseleção da conversa;
- atribuição a atendente ou departamento;
- etiquetas, prioridade e leitura;
- alteração de status e exclusão.

Ele também depende de módulos herdados como `customViews`, `conversationPage`,
`conversationStats`, `campaigns` e parte dos filtros do store de conversas.

## Decisão

Migrar o painel por uma fronteira funcional completa, e não por troca visual
isolada:

1. Criar `conversationPanel` nativo, com estado próprio de lista, fila,
   conversa selecionada e carregamento.
2. Criar `ConversationQueueList` nativo somente após o painel nativo não
   precisar dos `provide()` de `ChatList`.
3. Migrar o detalhe, cabeçalho e compositor para ações REST nativas.
4. Validar cada fluxo em ambiente local: recepção, departamento, ativas,
   transferência, assumir, resolver, reabrir e mensagens Meta.
5. Remover os módulos e APIs de compatibilidade somente quando não houver
   importações ativas.

## Ordem de remoção segura

1. `customViews`, campanhas e filtros herdados da lista.
2. `conversationStats`, paginação e contadores Chatwoot.
3. `ChatList.vue` e seus componentes exclusivos.
4. Adaptadores `/api/v1/accounts/:accountId/conversations`.
5. Recursos Chatwoot fora do escopo: Twilio/voz, integrações, canais antigos,
   widget, upgrade/cloud e comandos associados.

## Critério de aceite por etapa

- build de produção passa;
- nenhuma requisição para rota Rails/Chatwoot é feita pela tela migrada;
- erros de API continuam visíveis e não inventam dados;
- Socket.IO atualiza lista e detalhe sem recarregar;
- navegação entre módulos continua funcionando com conversa aberta.
