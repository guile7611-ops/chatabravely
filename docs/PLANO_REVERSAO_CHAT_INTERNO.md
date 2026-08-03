# Plano Cirúrgico Complementar de Reversão do Chat Interno e Alterações de 30/07
**Data da Auditoria:** 31 de Julho de 2026  
**Diretório do Projeto Isolado:** `C:\Users\guilh\Desktop\chat-multicanal-ia_reconstruido_29-07`  
**Estado Alvo:** Reversão 100% fiel à versão estável de 29/07/2026  
**Status do Projeto:** Nenhum código alterado, Nenhuma migration executada, Nenhum comando destrutivo rodado no banco.

---

## 1. Confirmação Explícita de Módulos e Dependências

Com base na varredura profunda realizada no projeto isolado:

1. **Rotas REST de `internal_message` / `internal-chat`**:
   - **Status**: **NÃO EXISTEM rotas REST ativas** para `/api/internal-chat` ou `internal_message` em `api.routes.ts`. A purga dessas rotas no backend já havia sido finalizada nos logs do final do dia 30/07.

2. **Handlers Socket.io**:
   - **Status**: Existe apenas **1 handler Socket.io residual** em `backend/src/socket/socket.ts` (linha 80: `internal_typing`). Não existem handlers de `send_internal_message` ou `join_internal_room`.

3. **Referências a `InternalChat*` em Serviços, API e Seed**:
   - **Status**: Os modelos `InternalChat`, `InternalChatParticipant` e `InternalChatMessage` existem **apenas em `backend/prisma/schema.prisma`**. Nenhum serviço (`ai.service.ts`, `report.service.ts`, `evolution.service.ts`, `meta.service.ts`, `dashboard.service.ts`, `billing.service.ts`) faz chamadas a esses modelos.

4. **Variáveis, Modais e Watchers de Chat Interno no Frontend**:
   - **Status**: Os modais temporários (`showNewInternalChatModal`, `startInternalAudioRecording`, `internalFileInput`) já haviam sido removidos em `App.vue`. Restam apenas os **rótulos da sidebar ("Multione" e "Capitão")** e a **view standalone "Capitão"** (`currentView === 'capitao'`).

5. **Chamadas de API Órfãs**:
   - **Status**: Nenhuma chamada de API ficará órfã, pois não há chamadas ativas do frontend apontando para endpoints internos.

---

## 2. Tabela Detalhada das 32 Ocorrências Mapeadas

| # | Arquivo (Caminho) | Linha | Trecho / Função / Evento | Evidência de Origem (Log de 30/07) | Ação Exata (Remover / Renomear / Preservar) | Risco de Dependências |
|---|---|---|---|---|---|---|
| 1 | `backend/prisma/schema.prisma` | 74 | `internalChats InternalChat[]` no model Workspace | Sessão `b864e150` (Injeção de modelo) | **Remover** | Nenhum. Relação não consumida por serviços. |
| 2 | `backend/prisma/schema.prisma` | 105 | `internalChatParticipants InternalChatParticipant[]` no User | Sessão `b864e150` | **Remover** | Nenhum. |
| 3 | `backend/prisma/schema.prisma` | 106 | `internalMessages InternalChatMessage[]` no User | Sessão `b864e150` | **Remover** | Nenhum. |
| 4 | `backend/prisma/schema.prisma` | 505 | `model InternalChat { id String ... }` | Sessão `b864e150` | **Remover** | Exige rodar `npx prisma generate` após remoção. |
| 5 | `backend/prisma/schema.prisma` | 514 | `participants InternalChatParticipant[]` no InternalChat | Sessão `b864e150` | **Remover** | Nenhum. |
| 6 | `backend/prisma/schema.prisma` | 515 | `messages InternalChatMessage[]` no InternalChat | Sessão `b864e150` | **Remover** | Nenhum. |
| 7 | `backend/prisma/schema.prisma` | 518 | `model InternalChatParticipant { ... }` | Sessão `b864e150` | **Remover** | Nenhum. |
| 8 | `backend/prisma/schema.prisma` | 520 | `internalChatId String` em InternalChatParticipant | Sessão `b864e150` | **Remover** | Nenhum. |
| 9 | `backend/prisma/schema.prisma` | 521 | `internalChat InternalChat @relation(...)` | Sessão `b864e150` | **Remover** | Nenhum. |
| 10 | `backend/prisma/schema.prisma` | 527 | `@@unique([internalChatId, userId])` | Sessão `b864e150` | **Remover** | Nenhum. |
| 11 | `backend/prisma/schema.prisma` | 530 | `model InternalChatMessage { ... }` | Sessão `b864e150` | **Remover** | Nenhum. |
| 12 | `backend/prisma/schema.prisma` | 532 | `internalChatId String` em InternalChatMessage | Sessão `b864e150` | **Remover** | Nenhum. |
| 13 | `backend/prisma/schema.prisma` | 533 | `internalChat InternalChat @relation(...)` | Sessão `b864e150` | **Remover** | Nenhum. |
| 14 | `backend/prisma/seed.ts` | 57 | `// 5. Criar configurações de IA padrão (Capitão)` | Sessão `8213a740` (Renomeação IA) | **Renomear** (Para "Configurações de IA padrão") | Nenhum (apenas comentário de seed). |
| 15 | `backend/src/routes/api.routes.ts` | 671 | `content: IA (Capitão) ${aiEnabled ? ...}` | Sessão `8213a740` | **Renomear** (Para "Inteligência Artificial habilitada...") | Nenhum (apenas mensagem de sistema). |
| 16 | `backend/src/socket/socket.ts` | 80 | `socket.on('internal_typing', ...)` | Sessão `b864e150` (Eventos internos) | **Remover** | Nenhum. Evento não acionado por clientes. |
| 17 | `frontend/src/App.vue` | 45 | `// Valores possíveis: 'conversas', 'capitao'...` | Sessão `8213a740` | **Renomear / Limpar** comentário | Nenhum. |
| 18 | `frontend/src/App.vue` | 141 | `// 2. Capitão (IA OpenRouter)` | Sessão `8213a740` | **Remover** comentário e bloco inútil | Nenhum. |
| 19 | `frontend/src/App.vue` | 153 | `alert('Configurações do Capitão (IA)...')` | Sessão `8213a740` | **Renomear** (Para "Configurações de IA salvas...") | Nenhum. |
| 20 | `frontend/src/App.vue` | 219 | `title: 'Configurando a IA no Capitão'` em Ajuda | Sessão `8213a740` | **Renomear** (Para "Configurando a Inteligência Artificial") | Nenhum. |
| 21 | `frontend/src/App.vue` | 445 | `<!-- Item 1: Multione (Único e Último) -->` | Sessão `8213a740` (Step 291) | **Renomear** (Comentário da sidebar) | Nenhum. |
| 22 | `frontend/src/App.vue` | 449 | `@click="selectView('conversas', 'multione')"` | Sessão `8213a740` | **Renomear** (Para `selectView('conversas')`) | Baixo. Atualiza estado de navegação. |
| 23 | `frontend/src/App.vue` | 452 | `activeMenu === 'multione'` no estilizador | Sessão `8213a740` | **Renomear** (Manter estilizador nativo) | Baixo. |
| 24 | `frontend/src/App.vue` | 462 | `<span class="text-[13px]...">Multione</span>` | Sessão `8213a740` | **Renomear** (Para "Caixa de Entrada") | NULO. Apenas exibição no DOM. |
| 25 | `frontend/src/App.vue` | 471 | `<!-- Capitão -->` | Sessão `8213a740` | **Remover** item da sidebar | NULO. |
| 26 | `frontend/src/App.vue` | 474 | `@click="selectView('capitao')"` | Sessão `8213a740` | **Remover** botão da sidebar | NULO. |
| 27 | `frontend/src/App.vue` | 477 | `currentView === 'capitao'` no estilizador | Sessão `8213a740` | **Remover** | NULO. |
| 28 | `frontend/src/App.vue` | 481 | `<span class="font-medium">Capitão</span>` | Sessão `8213a740` | **Remover** | NULO. |
| 29 | `frontend/src/App.vue` | 767 | `<!-- 2. VISÃO DO CAPITÃO (IA & OPENROUTER) -->` | Sessão `8213a740` | **Remover** bloco de template | NULO. |
| 30 | `frontend/src/App.vue` | 768 | `<template v-else-if="currentView === 'capitao'">` | Sessão `8213a740` | **Remover** view inteira | NULO. View standalone desnecessária. |
| 31 | `frontend/src/App.vue` | 779 | `<h1 class="text-xl...">IA Capitão</h1>` | Sessão `8213a740` | **Remover** (Pertence à view Capitão) | NULO. |
| 32 | `frontend/src/App.vue` | 1500 | Referências residuais em seletores | Sessão `8213a740` | **Preservar / Sanitizar** | NULO. |

---

## 3. Ordem Cirúrgica Recomendada de Execução

1. **Etapa 1 (Remoções de Modelos Prisma)**:
   - Remover linhas 74, 105, 106 e 505–533 em `backend/prisma/schema.prisma`.
   - Executar `npx prisma generate` em `backend` para atualizar os tipos sem alterar o banco de dados.

2. **Etapa 2 (Remoções de Backend Socket & Textos)**:
   - Remover o handler `internal_typing` em `backend/src/socket/socket.ts` (linha 80).
   - Ajustar texto de sistema na linha 671 em `backend/src/routes/api.routes.ts` e linha 57 em `seed.ts`.

3. **Etapa 3 (Limpeza e Ajuste da Sidebar no Frontend)**:
   - Em `frontend/src/App.vue`, alterar o rótulo de "Multione" para **"Caixa de Entrada"** (linhas 445–462).
   - Remover o botão da sidebar do "Capitão" (linhas 471–481).

4. **Etapa 4 (Remoção da View Standalone Capitão no Frontend)**:
   - Em `frontend/src/App.vue`, remover o bloco de template `<template v-else-if="currentView === 'capitao'">` (linhas 767–779).

5. **Etapa 5 (Validação dos Builds de Verificação)**:
   - Compilar backend com `npm run build` (`tsc`).
   - Compilar frontend com `npx vite build`.

---
*Plano cirúrgico complementar registrado em PLANO_REVERSAO_CHAT_INTERNO.md. Processo pausado aguardando autorização do usuário.*
