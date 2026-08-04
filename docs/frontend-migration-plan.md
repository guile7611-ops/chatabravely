# Plano de Migração Incremental do Frontend (newabra / Abravely Chat)

## 1. Visão Geral e Diretrizes Principais

Este documento estabelece o plano de migração incremental do frontend para o **Abravely Chat** (nome interno: `newabra`). 

O objetivo é substituir de forma gradual a camada de estado e lógica de negócio herdada do Chatwoot por nossa arquitetura própria (**Express / TypeScript / Prisma / Socket.io / AI / Meta Cloud API / Evolution API**), preservando a estabilidade da navegação e o shell visual.

---

## 2. Infraestrutura Visual Temporariamente Herdada

Os seguintes elementos são mantidos como infraestrutura de interface (UI Shell):

- **Shell Principal**: `App.vue`, `Dashboard.vue` e barra lateral (`NextSidebar` / `Sidebar.vue`).
- **Hierarquia de Roteamento**: `<router-view>` em `Dashboard.vue` e `SettingsWrapper.vue`.
- **URLs Legadas**: Compatibilidade temporária mantida para `/app/accounts/:accountId/dashboard`, `/app/accounts/:accountId/settings/*`.
- **Componentes Básicos de Design**: Componentes de UI genéricos (botões, modais, formulários, ícones).

---

## 3. Regras Próprias Já Existentes (Domínio Abravely Chat)

Toda a inteligência de negócios reside no nosso backend próprio:

- **Recepção e Distribuição de Mensagens**: Lógica customizada de fila, recepção, triagem e distribuição por departamento.
- **Conectores Oficiais e Não-Oficiais**: Integração nativa com **Meta Cloud API** (WhatsApp Business Oficial) e **Evolution API**.
- **Motor de IA & Automação**: Agentes inteligentes e LLMs (OpenAI, Gemini, Deepseek, Claude).
- **Comunicação em Tempo Real**: Eventos via **Socket.io** diretamente gerenciados por nossos gateways Node/Express.

> **Importante**: Nenhuma regra de negócio legada decide atribuição, filas ou distribuição. O frontend atua apenas como consumidor visual do nosso backend.

---

## 4. Ordem de Migração por Módulo

A substituição ocorrerá em fases isoladas (módulo por módulo):

```
┌─────────────────────────────────────────────────────────────┐
│ Fase 1: Estabilização de Infraestrutura e Rotas (Concluída) │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Fase 2: Gestão de Agentes / Atendentes (settings/agents)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Fase 3: Caixas de Entrada (settings/inboxes)                │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Fase 4: Times e Departamentos (settings/teams)              │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Fase 5: Etiquetas e Respostas Rápidas (labels / canned)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Fase 6: Painel Central de Conversas (dashboard / socket.io) │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Camada de Facade e Adaptadores Temporários

Para evitar a remoção brusca de código e garantir zero regressão visual:

1. **Facade de API**: Todas as chamadas do frontend passarão por um módulo central `src/api/abravelyClient.ts`.
2. **Data Mappers (Adaptadores)**: Mapeamento direto dos payloads retornados pelos nossos endpoints Prisma/Express para os formatos consumidos pela UI.
3. **Tratamento Transparente de Erros**:
   - Proibido o uso de mock fallbacks (dados fictícios inseridos em memória para ocultar falhas).
   - Erros de rede ou permissão devem ser apresentados ao usuário via estados visuais de erro ou notificações (toasts).

---

## 6. Critérios para Remoção da Lógica Legada

Um módulo legado só será removido do código-fonte quando:

- [ ] Todas as chamadas de API do módulo responderem a endpoints próprios (`/api/v1/...`).
- [ ] Os testes manuais de navegação e atualização (F5 / rotas diretas) forem validados sem erros no console.
- [ ] O estado no Vuex/Pinia estiver completamente migrado para a facade do Abravely Chat.
- [ ] O fluxo em tempo real (Socket.io) estiver cobrindo a atualização do módulo sem dependência de polling do Chatwoot.
