# Matriz de Fonte Única de Verdade (SSOT) & Divergências Auditadas

> **Projeto:** Abravely Chat 1.0  
> **Status:** Homologado / Etapa 1 (Fundação do Frontend — Ajustada conforme instruções)  
> **Data:** 02 de Agosto de 2026  
> **Escopo:** Matriz de autoridade normativa, mapeamento de conflitos abertos/pendentes e impactos na Etapa 1.

---

## 1. Ordem de Precedência Normativa

Conforme determinado no Prompt Mestre e nas regras de governança do projeto, a ordem hierárquica de autoridade para qualquer decisão é:

1. **`DESIGN_SYSTEM.md`**: Autoridade visual, componentes, acessibilidade, densidade, layout, comportamento de UI, tokens, animações e copy.
2. **`.agents/AGENTS.md`**: Regras operacionais locais (sem subagente de navegador, commits/push a cada 5 solicitações, comunicação em PT-BR).
3. **`docs/DOCUMENTACAO_VERSAO_HOMOLOGADA.md`**: Autoridade de produto, arquitetura, modelo de domínio e funcionalidades homologadas.
4. **`LOGICA.md`**: Autoridade de regras de negócio, fluxos de encerramento, sumarização por IA, relatórios executivos e Central de Ajuda.
5. **`fases.md` & `docs/deploy_guide.md`**: Autoridade de infraestrutura, topologia Docker, deploys, Nginx e fases de backend.
6. **Evidência Executável de Backend (`backend/src/server.ts`, `backend/src/routes/`, `backend/prisma/schema.prisma`)**: Evidência do contrato em execução.
7. **Documentos de Recuperação & Reversão (`docs/RECUPERACAO_29-07.md`, etc.)**: Histórico de restauração e invariantes de preservação.

---

## 2. Matriz SSOT & Status de Decisões

| Assunto / Domínio | Decisão Confirmada / Regra Homologada | Fonte Primária | Seção / Linha | Status | Impacto na Etapa 1 (Fundação Frontend) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stack Frontend** | Vue 3, Composition API (`<script setup>`), TypeScript, Vite, Tailwind CSS v4, Lucide Icons. Sem Vue Router ou Pinia instalados. | `DOCUMENTACAO_VERSAO_HOMOLOGADA.md`, `package.json` | Seção 1 / `package.json` | `confirmado` | Usar stack homologada. Navegação local por `ViewKey` desacoplada. Sem novas libs. |
| **Tokens & Visual Strict** | Mapeamento **exclusivo e estrito** dos valores documentados em `DESIGN_SYSTEM.md` sob tokens semânticos (`bg.canvas`, `bg.surface`, `bg.subtle`, `text.primary`, `text.secondary`, `text.tertiary`, `border.default`, `border.strong`, `action.primary`, `status.*`). NENHUM valor fora do documento (como `#0C111D`) é permitido. Componentes consomem apenas tokens semânticos. | `DESIGN_SYSTEM.md` | Seções 1–3 | `confirmado` | Declarar `src/app/styles/tokens.css` contendo unicamente os tokens documentados. Proibido hexadecimais diretos nos componentes. |
| **Navegação & Views** | 7 views homologadas: Caixa de Entrada (`conversas`), Kanban (`kanban`), Contatos (`contatos`), Relatórios (`relatorios`), Central de Ajuda (`ajuda`), Simulador WhatsApp (`simulador`), Configurações (`configuracoes`). | `DOCUMENTACAO_VERSAO_HOMOLOGADA.md`, `LOGICA.md` | Seção 3 / Seção 1 | `confirmado` | Criar os 7 shells de páginas e navegação reativa por `ViewKey` tipada. |
| **Estados de Conversa** | `LOGICA.md` especifica `ABERTA`, `PENDENTE`, `RESOLVIDA`/`FINALIZADA`. O Prisma atual usa `UNATTENDED`, `OPEN`, `CLOSED` e filas (`RECEPTION`, `DEPARTMENT`, etc.). | `LOGICA.md` vs `backend/prisma/schema.prisma` | Section 1 vs schema.prisma L21-32 | `PENDENTE (conflito)` | **Sem normalizador/adapter definitivo:** Fixtures da Etapa 1 usam tipos de apresentação isolados. Não escolher uma fonte como contrato final nem criar adaptadores de normalização. |
| **Prefixos & Contratos REST** | Documentação homologada cita `/api/...`; backend atual monta em `/api/v1/...` com rotas segmentadas. | `DOCUMENTACAO_VERSAO_HOMOLOGADA.md` vs `backend/src/routes/` | Seção 5 vs `backend/src/routes/` | `PENDENTE (conflito)` | **Sem cliente HTTP/interfaces definitivas de API:** Etapa 1 opera 100% desconectada da rede. Nenhuma interface de serviço REST será consolidada como final. |
| **Eventos Socket.io** | Doc homologada cita `new_message`, `typing`. Backend atual usa `message:new`, `conversation:update`, `agent:status`. | `DOCUMENTACAO_VERSAO_HOMOLOGADA.md` vs `fases.md` / `socket.ts` | Seção 5 vs `fases.md` L70 | `PENDENTE (conflito)` | **Socket desativado:** Sem cliente Socket.io nem interfaces definitivas de tempo real ativadas nesta etapa. |
| **Schema Homologado vs Atual** | Divergências em entidades de relatório, enums de canal, campos de contato e auditoria. | `DOCUMENTACAO_VERSAO_HOMOLOGADA.md` vs `schema.prisma` | Seção 2 vs schema.prisma | `PENDENTE (conflito)` | **Sem alinhamento forçado:** Mocks de apresentação suprem apenas a interface visual sem assumir o schema de backend como definitivo. |
| **Papeis de Usuário (Roles)** | `ADMIN` e `AGENT`. `isPlatformAdmin` / Super Admin para acesso ao Simulador WhatsApp. | `DOCUMENTACAO_VERSAO_HOMOLOGADA.md`, `LOGICA.md` | Seção 2 / Seção 3.6 | `confirmado` | Controlar visibilidade do Simulador na sidebar por flag mockada de perfil. |
| **Relatórios Executivos IA** | 3 cards de métricas; períodos 7, 14, 30 dias; filtro horário comercial; salvamento em lista sanfona. | `LOGICA.md`, `DOCUMENTACAO_VERSAO_HOMOLOGADA.md` | Seção 3 / Seção 3.4 | `confirmado` | Tela visual com dados mockados estáticos e modais demonstrativos. |
| **Central de Ajuda** | Tabela em tela cheia com artigos; busca local; cadastro/edição visual. | `LOGICA.md`, `DOCUMENTACAO_VERSAO_HOMOLOGADA.md` | Seção 5 / Seção 3.5 | `confirmado` | Tela visual com artigos mockados e busca reativa local. |
| **Configurações Globais** | 7 sub-abas: Perfil; Departamentos & Equipes; Canais; Respostas Rápidas; Etiquetas; IA; Automação & CSAT. | `DOCUMENTACAO_VERSAO_HOMOLOGADA.md` | Seção 3.7 | `confirmado` | Sub-abas visuais sem chamadas de persistência ou chamadas de API. |
| **Recursos Históricos Removidos** | `chat-interno`, `internal_message`, `Capitão`, `MultiOne` foram removidos e são estritamente PROIBIDOS. | `PLANO_REVERSAO_CHAT_INTERNO.md` | Documentos de reversão | `confirmado` | Nenhuma referência em código, menus, mocks ou interfaces. |
| **Migração do `src/App.vue`** | Não reescrever em massa. Manter o App.vue legível/compilável e chavear para a nova base modular incrementalmente. | Diretiva do Usuário | N/A | `confirmado` | Migração incremental com build verde a cada etapa. |

---

## 3. Registro Explicito de Pendências (Bloqueadas para Etapas Futuras)

As seguintes divergências permanecem **PENDENTES DE DEFINIÇÃO EXPLÍCITA DO USUÁRIO** e **NÃO serão resolvidas por inferência nem por adaptadores preliminares** na Etapa 1:

1. **Enquadramento Final dos Status de Conversa**: A escolha entre os enums do Prisma (`UNATTENDED`, `OPEN`, `CLOSED`) e a taxonomia da documentação (`ABERTA`, `PENDENTE`, `RESOLVIDA`) está pendente e será tratada na Etapa 2 após aprovação.
2. **Versionamento e Rotas de Endpoints REST**: A definição do prefixo unificado (`/api/v1/` vs `/api/`) e estrutura de DTOs fica pendente para a Etapa 2.
3. **Nomenclatura e Handshake do Socket.io**: O mapeamento de eventos (`message:new` vs `new_message`) permanece pendente de definição para a Etapa 2.
4. **Alinhamento do Schema Prisma vs Schema Homologado**: A reconciliação entre entidades conceituais e o banco permanece pendente de definição.

---

## 4. Garantias de Zero Efeito Colateral & Zero Valor Visual Fora do Spec

Nenhum valor hexadecimal arbitrário ou não documentado (incluindo `#0C111D`) será utilizado. Todos os componentes consumirão exclusivamente tokens semânticos (`bg.canvas`, `bg.surface`, `bg.subtle`, `text.primary`, `text.secondary`, `text.tertiary`, `border.default`, `border.strong`, `action.primary`, `status.*`).

Nenhum arquivo do backend, schema Prisma, endpoint REST, servidor WebSocket, banco de dados ou integração externa será tocado. Todos os componentes e páginas operarão 100% com fixtures determinísticas e estado reativo local.
