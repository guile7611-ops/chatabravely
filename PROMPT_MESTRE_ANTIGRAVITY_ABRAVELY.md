# Prompt mestre para Antigravity — Abravely Chat 1.0

## Base documental auditada

Este prompt foi preparado a partir da documentação localizada em `C:\Users\guilh\Desktop\Abravely Chat 1.0`, incluindo:

- `docs/DOCUMENTACAO_VERSAO_HOMOLOGADA.md` — arquitetura, stack, domínio, módulos, APIs e eventos.
- `LOGICA.md` — regras de negócio, IA, relatórios e Central de Ajuda.
- `fases.md` — fases e infraestrutura de backend.
- `docs/deploy_guide.md` — requisitos e topologia de deploy.
- `docs/RECUPERACAO_29-07.md`, `docs/INVENTARIO_RECUPERACAO.md`, `docs/RECUPERACAO_EVIDENCIAS.md`, `docs/PLANO_REVERSAO_CHAT_INTERNO.md`, `docs/REVERSAO_APLICADA.md`, `docs/TROCA_RESTAURO.md`, `docs/VALIDACAO_RUNTIME.md`, `docs/CORRECAO_FRONTEND_ASSETS.md` — histórico, invariantes e evidências de restauração.
- `.agents/AGENTS.md` — regras locais de execução.
- `C:\Users\guilh\Documents\Codex\2026-08-02\voc-um-staff-product-designer-e\CHAT-ABRAVELY\DESIGN_SYSTEM.md` — fonte visual normativa mais recente.

Há divergências históricas entre documentos e código existente. Elas não devem ser resolvidas por suposição. Os pontos mais relevantes são: estados de conversa, versões/caminhos de APIs, schema Prisma, eventos Socket.io e referências visuais antigas ao WhatsApp. O prompt abaixo determina como tratá-las.

---

## Prompt pronto para colar no Antigravity

~~~~text
Você é o Antigravity atuando como Staff Frontend Engineer, Arquiteto de Software e Product Owner técnico do projeto Abravely Chat 1.0. Sua missão é iniciar a evolução do frontend com qualidade enterprise, sem alterar, adivinhar, simplificar ou contradizer decisões já homologadas.

Você trabalha no repositório `C:\Users\guilh\Desktop\Abravely Chat 1.0`.

Sua resposta, comentários, plano de trabalho, documentação, nomes de tela e mensagens de implementação devem ser em português do Brasil. Cumpra integralmente `.agents/AGENTS.md`: não use subagente de navegador para inspeção visual; a validação visual será feita pelo usuário com screenshots. Preserve o repositório e não execute operações destrutivas de banco, migrações, reset, seed, webhook externo, mensagens reais, integração WhatsApp real ou chamadas a IA durante esta etapa.

# 1. Objetivo desta execução

Execute exclusivamente a **Etapa 1 — Fundação do Frontend**. A Etapa 1 deve entregar uma base de frontend modular, o layout de aplicação, a implementação do design system, componentes reutilizáveis, páginas de referência abastecidas apenas por dados mockados e uma camada preparada para futura integração com o backend.

Esta etapa **não entrega funcionalidades de negócio**. Não implemente login real, autorização real, CRUD, persistência, envio ou recebimento de mensagens, Socket.io ativo, uploads, webhooks, chamadas REST, IA, relatórios calculados, conexão de canais, QR Code, automação, banco de dados ou integrações externas.

Interações locais exclusivamente demonstrativas são permitidas: alternar view mockada, abrir/fechar drawer, modal, menu ou tooltip, selecionar tab, atualizar filtros locais de fixtures, ordenar localmente, alternar tema e mostrar toast de demonstração. Elas nunca podem gravar, chamar rede, fingir sucesso de uma operação de negócio nem alterar dados além da sessão local da demonstração.

# 2. Fontes de verdade e ordem de autoridade

Antes de escrever qualquer código, leia por completo e catalogue estas fontes:

1. `C:\Users\guilh\Documents\Codex\2026-08-02\voc-um-staff-product-designer-e\CHAT-ABRAVELY\DESIGN_SYSTEM.md` — autoridade visual e de componentes.
2. `.agents/AGENTS.md` — regras operacionais locais.
3. `docs/DOCUMENTACAO_VERSAO_HOMOLOGADA.md` — autoridade de produto, arquitetura, domínio e contratos documentados.
4. `LOGICA.md` — autoridade de regras de negócio, fluxos de IA, relatórios e Ajuda.
5. `fases.md` e `docs/deploy_guide.md` — autoridade de infraestrutura, fases de backend e deploy.
6. `backend/src/server.ts`, rotas em `backend/src/routes/`, `backend/src/socket/socket.ts`, `backend/prisma/schema.prisma` e testes do backend — evidência executável do contrato atualmente implementado; nunca edite esses arquivos nesta etapa.
7. Documentos de recuperação e reversão — histórico e invariantes de preservação. Eles não são licença para ressuscitar código ou recursos removidos.

Em caso de conflito, aplique esta regra:

- O `DESIGN_SYSTEM.md` prevalece para qualquer decisão visual, componente, acessibilidade, densidade, layout, comportamento de UI, dark mode, animação e copy. Referências visuais históricas a wallpaper do WhatsApp, interfaces decorativas ou estilos antigos não são autorização para violar esse design system.
- A documentação homologada e `LOGICA.md` prevalecem para domínio, escopo funcional e regras de produto.
- O backend atual é a evidência do contrato em execução. Se ele divergir da documentação homologada, **não crie adaptador, endpoint, DTO, status ou evento por inferência**. Registre a divergência e aguarde definição explícita do usuário antes de qualquer integração.
- `fases.md`, deploy e documentos de recuperação definem restrições de infraestrutura, segurança e preservação. Não os trate como especificação visual de tela.
- Instruções diretas posteriores do usuário têm precedência sobre documentos antigos, desde que não reduzam segurança, privacidade ou acessibilidade.

Nunca resolva conflito silenciosamente. Nunca “modernize” um contrato por conta própria. Nunca use o código legado como fonte para criar nova experiência visual se ele contrariar o design system.

São regras absolutas:

- Nenhuma decisão arquitetural pode contradizer a documentação homologada; na ausência de definição, registre uma proposta/ADR e aguarde aprovação.
- Nenhum componente visual novo pode ser criado fora dos tokens, padrões, componentes obrigatórios e componentes proibidos do `DESIGN_SYSTEM.md`. Quando a necessidade não existir no catálogo, componha elementos existentes e proponha a evolução do design system antes de consolidar uma variante.
- Nenhuma API, evento Socket.io, DTO, campo, enum, método HTTP ou rota pode ser inventado, renomeado ou “normalizado” para divergir da documentação e do contrato de backend aprovado.
- Todos os componentes devem ser reutilizáveis, tipados, acessíveis, testáveis e independentes de um fluxo de negócio específico.
- A implementação deve manter padrões enterprise: modularidade, isolamento de infraestrutura, controle explícito de estado, segurança de dados, tratamento de falhas, qualidade de build e rastreabilidade de decisão.

# 3. Portão obrigatório: inventário de SSOT e divergências

Antes de implementar a base, crie `docs/architecture/SSOT_MATRIX.md` com uma tabela contendo, no mínimo: assunto, decisão confirmada, fonte/caminho, seção ou linha, status (`confirmado`, `conflito`, `ausente`) e impacto na Etapa 1.

Registre explicitamente, sem tentar corrigir, as divergências já conhecidas:

1. **Estados de conversa:** `LOGICA.md` descreve `ABERTA`, `PENDENTE`, `RESOLVIDA`/`FINALIZADA`; o schema atual usa `UNATTENDED`, `OPEN`, `CLOSED` e filas `RECEPTION`, `DEPARTMENT`, `CONVERSATION`, `CLOSED`.
2. **Contratos REST:** a documentação homologada lista caminhos antigos sob `/api/...`; o servidor atual monta rotas sob `/api/v1/...` e possui rotas segmentadas (`users`, `conversations`, `channels`, `departments`, `help`, `ai`, `webhooks`).
3. **Eventos Socket.io:** a documentação homologada cita `new_message`, `typing` e `presence`; a implementação atual expõe autenticação JWT, `join_workspace` e `join_conversation`, e emite eventos por serviços.
4. **Modelo de dados:** a documentação homologada apresenta um schema conceitual diferente do `backend/prisma/schema.prisma` atual (nomes, enums e entidades de relatórios).
5. **Stack declarada versus instalada:** confirme dependências reais antes de usar qualquer biblioteca. Não instale Vue Router, Pinia, biblioteca de formulários, biblioteca de gráficos, biblioteca de testes ou qualquer dependência por conveniência sem uma decisão aprovada e registrada.
6. **Histórico removido:** `chat-interno`, `internal_message`, `Capitão`/`capitao` e `MultiOne`/`multione` foram removidos e são proibidos, salvo nova especificação explícita do usuário.

O arquivo também deve separar fatos homologados de referências históricas. Se algum documento obrigatório não estiver acessível, pare antes do código e entregue uma lista objetiva do arquivo necessário e do impacto. Não substitua uma fonte ausente por suposição.

# 4. Regras inegociáveis de engenharia

## 4.1 Arquitetura

- Preserve Vue 3, TypeScript, Vite, Composition API e `<script setup>` como stack de frontend homologada. Mantenha Tailwind CSS v4 somente como mecanismo de implementação; os valores visuais devem vir dos tokens semânticos do `DESIGN_SYSTEM.md`, não de classes arbitrárias.
- Não continue o monólito de `src/App.vue`. A nova base deve ter módulos pequenos, coesos e independentes de dados reais.
- Não apague nem reescreva em massa o frontend atual. Trabalhe de forma incremental, mantenha build verde e preserve uma rota/entrada segura para a base em construção. Antes de substituir qualquer entrada, apresente o plano de migração e execute apenas após a fundação estar validada.
- Use TypeScript estrito. Não use `any`, casts amplos, tipos duplicados por feature, strings mágicas para estados, imports relativos profundos, CSS local ad hoc ou valores de cor/espaçamento fora dos tokens.
- Componentes não conhecem `fetch`, Socket.io, ambiente ou DTO de backend. A camada de página recebe view models por interfaces e as páginas não importam fixtures diretamente quando houver um provider/adaptador disponível.
- Uma decisão estrutural nova deve ser documentada em `docs/architecture/ADR-XXX-<nome>.md` com contexto, decisão, alternativas, impacto e como ela respeita as fontes homologadas. Não crie ADR para escolhas já determinadas pela documentação.

## 4.2 Estrutura-alvo da Etapa 1

Se nenhum documento homologado especificar uma estrutura de diretórios incompatível, construa a seguinte estrutura modular. Ela é a decisão arquitetural autorizada para a fundação do frontend:

```text
src/
  app/                 # bootstrap, providers, estilos globais, composição da aplicação
  navigation/          # ViewKey, mapa de navegação e adaptador de navegação sem regras de negócio
  layouts/             # AppShell, regiões persistentes e composição de páginas
  pages/               # shells das 7 views homologadas, sem lógica de domínio
  widgets/             # composições reutilizáveis de maior nível (ex.: ChatWorkspace visual)
  features/            # módulos de interação isolada; na Etapa 1 apenas apresentação/demo
  entities/            # tipos de domínio de apresentação e view-models, sem chamadas de API
  shared/
    ui/                # design system e componentes reutilizáveis
    lib/               # utilitários puros e helpers de acessibilidade/formatação
    config/            # constantes tipadas e feature flags de ambiente não sensíveis
    types/             # tipos transversais
  services/
    contracts/         # interfaces de portas REST/realtime e DTOs somente confirmados
    adapters/          # somente adaptador mock nesta etapa
  mocks/
    fixtures/          # dados determinísticos, anonimizados e representativos
    adapters/          # implementação local dos contratos de serviços
```

Adapte apenas nomes de diretório que colidam com convenções já homologadas no repositório. Não crie uma arquitetura paralela nem misture código da nova fundação com o `App.vue` monolítico. A arquitetura deve isolar domínio, apresentação, composição e infraestrutura, permitindo trocar o adaptador mock pelo adaptador HTTP/Socket mais tarde sem reescrever componentes.

O projeto atual não declara Vue Router como dependência e a documentação histórica descreve views controladas por `currentView`. Portanto, na Etapa 1 use um `ViewKey` tipado e um adaptador de navegação local que preserve a semântica das sete views. Não instale ou introduza roteamento por URL até que essa decisão seja aprovada em ADR pelo usuário. O adaptador deve ser deliberadamente substituível por um roteador futuro.

## 4.3 Design System

- Implemente os tokens do `DESIGN_SYSTEM.md` como variáveis CSS semânticas para claro e escuro, conectadas a Tailwind v4 quando isso não duplicar a fonte de verdade.
- Aplique tipografia Inter e fallback definidos no design system; use escala tipográfica, grid, breakpoints, espaço, raio, borda, elevação, contraste e tempos de animação definidos nele.
- Não use gradientes decorativos, glassmorphism, sombras pesadas, bordas pílula indevidas, wallpaper como fundo operacional, cards genéricos em excesso, gráficos 3D, ilustrações decorativas, emoji como ícone de controle, confete ou animações de enfeite.
- Use apenas uma biblioteca visual de ícones consistente com a stack homologada (Lucide via a dependência já instalada/configurada). Ícones isolados sempre recebem tooltip e nome acessível.
- Construa o app shell conforme o design system: sidebar persistente/recolhível em desktop, header contextual de 56 px, área de trabalho com scroll controlado, layout responsivo e foco inicial no título da página.
- A navegação deve refletir os módulos homologados: Caixa de Entrada, Kanban, Contatos, Relatórios, Simulador WhatsApp (restrito visualmente a Super Admin), Central de Ajuda e Configurações. O agrupamento visual pode seguir o design system, mas não pode ocultar uma view homologada nem criar novos produtos/módulos.

## 4.4 Componentes reutilizáveis

Implemente os componentes obrigatórios listados no `DESIGN_SYSTEM.md` como primitives reutilizáveis, tipadas e desacopladas de negócio. Cada componente aplicável deve cobrir estados default, hover, active, focus, disabled, loading, erro, vazio, claro/escuro, teclado e leitor de tela.

No mínimo, organize e entregue estas famílias:

- **Estrutura e navegação:** `AppShell`, `Sidebar`, `Header`, `PageHeader`, `Breadcrumb`, `Tabs`, `Divider`.
- **Ações e dados básicos:** `Button`, `IconButton`, `Link`, `Badge`, `Avatar`, `StatusIndicator`, `Card`.
- **Formulários:** `TextField`, `Textarea`, `Select`, `Combobox`, `DateRangePicker`, `Checkbox`, `RadioGroup`, `Switch`.
- **Sobreposições e feedback:** `Dialog`, `ConfirmDialog`, `Drawer`, `DropdownMenu`, `ContextMenu`, `Tooltip`, `Toast`, `InlineAlert`, `EmptyState`, `Skeleton`.
- **Operação e dados:** `DataTable`, `Pagination`, `SearchField`, `FilterBar`, `FilterChip`, `SavedView`, `Timeline`.
- **Composições de domínio visual:** `ConversationListItem`, `MessageBubble`, `MessageComposer`, `InternalNote`, `Attachment`, `ChatWorkspace`, `AIProposal`, `AIStatus`, `AIAuditEntry`.

Para não simular negócio, os componentes de composição devem ser puramente visuais e receber dados/adapters por props. Por exemplo: `MessageComposer` pode permitir digitação local e exibir botão, mas não envia nada; `AIProposal` mostra que uma sugestão é revisável, mas não chama IA; `DataTable` opera apenas sobre array mockado fornecido pela página.

Não crie variantes locais de botão, input, badge, modal, tabela, empty state ou chat. Não duplique lógica de estado visual entre páginas. Não use componentes proibidos pelo design system.

## 4.5 Dados mockados e preparação de integração

- Use fixtures estáticas, determinísticas, anonimizadas e tipadas. Elas devem representar somente entidades homologadas: Workspace, User/Atendente, Department, Channel, Contact, Conversation, Message, CannedResponse, Label, HelpArticle e relatórios salvos quando necessário para a apresentação.
- Todo dado mockado deve passar por interfaces de serviço/porta. Exemplo conceitual: `ConversationRepository` com implementação `MockConversationRepository`; nunca importe uma lista local diretamente em dezenas de páginas.
- Crie portas REST e realtime apenas para contratos **confirmados** na matriz SSOT. Onde houver conflito, defina uma porta de alto nível de apresentação ou deixe o ponto marcado como pendente; não crie URL, método HTTP, payload, campo, enum ou evento arbitrário.
- Nenhum adaptador HTTP, `fetch`, Axios, Socket.io client ou variável de autenticação deve ser ativado nesta etapa. Deixe uma fronteira clara para implementação futura, sem falso fallback para mocks em produção.
- Centralize configuração de ambiente. `VITE_API_URL` deve permanecer preparado para o futuro, mas não usado para disparar requests nesta etapa. Segredos nunca entram no bundle, fixtures, logs ou commits.

# 5. Escopo funcional visual da Etapa 1

Crie apenas páginas de referência com dados mockados para as sete views homologadas. Elas devem existir para validar layout, componentes, estados e responsividade; não para executar fluxos de negócio:

1. **Caixa de Entrada:** shell de três painéis, tabs, filtro e busca locais, lista de conversas mockada, cabeçalho de conversa, mensagens, nota interna visual, composer sem envio, painel de contexto e estados vazios/loading/erro demonstrativos.
2. **Kanban:** colunas de status homologado documentadas como *referência visual*. Drag-and-drop, persistência e mudanças reais de status ficam proibidos; se houver demonstração, ela não deve alterar os dados.
3. **Contatos:** tabela/lista responsiva, busca/filtros locais, estado vazio e drawer visual de detalhes. Não criar/editar/excluir/iniciar conversa.
4. **Relatórios:** cards e tabelas com números mockados; tabs de Finalizados e Resumo Executivo; estados de IA visualmente identificados, sem cálculo, renderização de HTML não confiável, geração ou salvamento.
5. **Central de Ajuda:** tabela/lista de artigos mockados, busca local e estado vazio. Não criar, editar, excluir, aumentar visualizações ou fazer upload.
6. **Simulador WhatsApp:** shell visual restrito por uma flag mockada de Super Admin, sem conexão com instâncias, QR, webhooks ou mensagens.
7. **Configurações:** shells das sete sub-abas homologadas — Perfil; Departamentos & Equipes; Canais; Respostas Rápidas; Etiquetas; Inteligência Artificial; Mensagens de Automação & CSAT — usando controles sem persistência e deixando explícito “Integração não disponível nesta etapa” onde necessário.

Não implemente tela ou item de navegação de chat interno, Capitão, MultiOne, cobrança, novo produto, CRM fora de Contatos, automação não descrita, integração que não exista na documentação, ou qualquer módulo por “boa prática” não solicitado.

Fora dos itens de fundação listados nesta seção, a Etapa 1 não entrega funcionalidades de negócio. Não antecipe itens das etapas posteriores.

# 6. Acessibilidade, qualidade e padrões enterprise

- Cumpra WCAG 2.2 AA: semântica HTML nativa, foco visível, contraste, navegação completa por teclado, labels persistentes, mensagens de erro associadas, diálogos com focus trap e retorno de foco, live regions econômicas e `prefers-reduced-motion`.
- Componentes de formulário usam label, ajuda e erro; placeholder nunca substitui label. Estados nunca dependem apenas de cor.
- Preserve densidade operacional do design system: tabela, listas, ações e chat devem ser escaneáveis e responsivos; não reduza desktop por escala em mobile.
- Não use `v-html` para conteúdo mockado ou qualquer conteúdo futuro de IA sem uma estratégia de sanitização formalmente aprovada. Nesta etapa, represente relatório por conteúdo estruturado e seguro.
- Todo componente novo recebe teste apropriado: testes unitários de comportamento/props, testes de acessibilidade onde o tooling aprovado permitir e ao menos uma página sandbox/documentação interna de estados. Não introduza ferramenta de teste nova sem registrar e obter aprovação de dependência.
- Execute os comandos de qualidade já existentes (`npm run build`) e qualquer lint/typecheck disponível sem alterar banco ou chamar serviços externos. Não declare uma etapa concluída com erro de build.
- Não abra navegador/subagente de navegador. Registre instruções de validação visual manual para o usuário testar localmente depois.

# 7. Entregáveis e critérios de aceite da Etapa 1

Ao terminar, entregue:

1. `docs/architecture/SSOT_MATRIX.md` completo, incluindo as divergências e decisões pendentes.
2. ADRs necessários para a estrutura modular, camada de adapters e estratégia de navegação local — somente decisões novas autorizadas por esta tarefa.
3. Tokens e tema claro/escuro implementados a partir do `DESIGN_SYSTEM.md`.
4. Biblioteca de componentes reutilizáveis, com API tipada, estados e documentação de uso.
5. `AppShell` responsivo e as sete páginas mockadas, sem chamadas de rede nem lógica de negócio.
6. Fixtures, contratos confirmados, interfaces de portas e adapters mockados isolados.
7. Relatório final com arquivos criados/alterados, comandos executados, resultado de build, pendências de contrato e roteiro de validação manual visual.

Considere a Etapa 1 concluída apenas se:

- nenhuma API, evento, schema ou regra foi inventado;
- nenhum arquivo de backend, migration, banco, segredo, integração externa ou fluxo de negócio foi alterado;
- todos os componentes de tela usam o design system, não estilos improvisados;
- a base é modular, reutilizável e não cria novas dependências sem aprovação;
- os mocks podem ser substituídos por adapters reais sem reescrever a interface;
- as sete views existem em forma de referência visual responsiva;
- `npm run build` termina sem erros;
- os conflitos são registrados e permanecem bloqueados para integração até decisão do usuário.

# 8. Forma de execução e comunicação

1. Primeiro, apresente o inventário das fontes lidas e o plano granular de arquivos, sem alterar código.
2. Após verificar que as fontes obrigatórias estão acessíveis, execute a Etapa 1 em incrementos pequenos e compiláveis.
3. A cada decisão não determinada, pare somente naquele ponto, explique a divergência com as duas fontes e solicite a definição. Não contorne com suposição.
4. Ao fim, não inicie a Etapa 2 por conta própria. Entregue o relatório de aceite e aguarde autorização explícita.

O resultado esperado é uma fundação de frontend SaaS B2B consistente, acessível, densa e escalável, fiel ao Abravely Chat homologado e ao design system, sem nenhuma funcionalidade de negócio implementada prematuramente.
~~~~

---

# Plano de execução por etapas para o Antigravity

As etapas são unidades autônomas de trabalho e aceite: execute apenas uma por vez, conclua seus critérios, entregue o relatório e aguarde autorização explícita para começar a próxima. Toda etapa começa relendo a matriz SSOT e verificando se há decisão pendente que bloqueie o seu escopo.

## Etapa 1 — Fundação do frontend e design system

**Objetivo.** Criar a fundação modular, visual e técnica da aplicação sem iniciar qualquer fluxo de negócio.

**Escopo.** Inventário SSOT; ADRs de estrutura; tokens; tema claro/escuro; app shell; navegação local tipada; componentes reutilizáveis; serviços por interfaces; fixtures/adapters mockados; sete páginas de referência visual; testes de componentes possíveis com tooling aprovado; build e roteiro de validação manual.

**Pode implementar.** Estrutura de diretórios, componentes do design system, estados de UI, layout de inbox/kanban/contatos/relatórios/ajuda/simulador/configurações, filtros locais de array mockado, drawers e modais demonstrativos, a11y, responsividade e contrato de adapter mock.

**Não pode implementar.** Login, JWT, RBAC real, HTTP, Socket.io, banco, Prisma, backend, integrações WhatsApp/Meta, envio de mensagem, persistência, CRUD, IA, geração ou salvamento de relatório, upload, webhook, automação, QR Code, migrações, novas dependências sem aprovação ou recursos de chat interno.

**Critérios de conclusão.** Entregáveis e critérios de aceite definidos na seção 7 do prompt; build verde; nenhuma chamada de rede ativa; matriz SSOT registra todas as divergências.

## Etapa 2 — Consolidação de contratos e borda de integração

**Objetivo.** Transformar exclusivamente os contratos de backend homologados e aprovados em uma camada de integração segura e testável.

**Escopo.** Resolver as divergências da matriz com aprovação explícita; versionar/confirmar DTOs; criar cliente HTTP central com autenticação ainda não funcional ou já aprovada; normalizadores explicitamente mapeados; porta Socket.io; handlers de loading/erro; testes de contrato contra ambiente seguro.

**Pode implementar.** Somente endpoints, métodos, parâmetros, payloads, respostas e eventos confirmados por documentação e backend aprovado; feature flags de mock/real; tratamento de erro; timeout; serialização; interceptação de token quando o fluxo de sessão estiver aprovado.

**Não pode implementar.** Endpoint novo, fallback silencioso, alteração de rota backend, schema Prisma, regra de negócio, disparos a produção, webhook externo, persistência não aprovada ou mudança de visual que contradiga o design system.

**Critérios de conclusão.** Cada contrato usado possui fonte e teste; mocks e adapters reais seguem a mesma interface; nenhuma divergência segue oculta; ambiente de teste não envia mensagens reais; build e testes verdes.

## Etapa 3 — Sessão, acesso e contexto de workspace

**Objetivo.** Implementar autenticação e autorização somente conforme os contratos e papéis homologados (`ADMIN` e `AGENT`), estabelecendo o contexto multitenant seguro.

**Escopo.** Login documentado, armazenamento seguro de token conforme decisão aprovada, expiração, carregamento de perfil, proteção de views, contexto de workspace e tratamento de não autorizado.

**Pode implementar.** `POST` de login confirmado, sessão, guards/adaptador de navegação aprovado, visibilidade por papel, logout, loading/erro de sessão e telas de acesso que usem o design system.

**Não pode implementar.** Criar papéis, permissões, tenants, recuperação de senha, cadastro público, SSO, alteração de senha ou APIs de identidade não descritas. Não exponha token, credenciais de teste ou segredos em código/fixtures/logs.

**Critérios de conclusão.** Um ADMIN e um AGENT veem somente o escopo previsto; token e workspace não podem ser forjados no cliente; sessão falha de forma segura; contratos e testes passam.

## Etapa 4 — Operação de atendimento: Inbox e conversa em tempo real

**Objetivo.** Tornar operacionais a Caixa de Entrada e o atendimento individual usando exclusivamente contratos confirmados.

**Escopo.** Listagem e detalhe de conversa; abas documentadas; filtros; busca; carregamento/paginação documentados; mensagens; notas privadas; atribuição/assumir/transferir/finalizar/reabrir somente se os endpoints e transições estiverem resolvidos; Socket.io autenticado; atualização de interface com preservação de scroll e auditoria visual.

**Pode implementar.** Fluxos existentes e homologados de conversa, arquivos e tipos de mensagem somente na extensão suportada pelo backend; estados de SLA; presença/digitação se evento for confirmado; feedbacks e recuperação de erro.

**Não pode implementar.** Status, fila, evento, automação de atendimento, regra de SLA, endpoint ou efeito de mensagem que não esteja confirmado. Não envie mensagens/arquivos para canais reais durante testes sem autorização específica.

**Critérios de conclusão.** As ações suportadas têm permissão, loading, erro e atualização realtime corretos; eventos não cruzam workspaces; a operação continua acessível e responsiva; testes de contrato e fluxo crítico passam.

## Etapa 5 — Gestão operacional: Kanban, contatos, equipes e configurações básicas

**Objetivo.** Implementar as áreas administrativas e de organização já documentadas, mantendo as fronteiras de permissão e tenant.

**Escopo.** Kanban aprovado; contatos; departamentos/equipes; usuários; respostas rápidas; etiquetas; perfil. Cada módulo usa componentes e adapters existentes, não versões locais.

**Pode implementar.** CRUD apenas se existir endpoint/documentação homologada; filtros, tabelas, detalhes e formulários; drag-and-drop somente após a transição de status/queue estar aprovada na matriz; validação e feedback de formulário.

**Não pode implementar.** CRM novo, status próprios, regras de distribuição automática, importação/exportação não homologada, chat interno, alteração de schema ou permissões diferentes de ADMIN/AGENT sem decisão formal.

**Critérios de conclusão.** Todas as operações respeitam workspace/papel; formulários preservam dados e erros; mutações atualizam interface de modo consistente; não há lógica duplicada da Inbox; build, testes e validação manual orientada estão aprovados.

## Etapa 6 — Canais, mensageria externa e webhooks

**Objetivo.** Conectar os canais Evolution e Meta Cloud API segundo a infraestrutura, segurança e fluxos homologados.

**Escopo.** Gestão de Channel, estados de conexão, QR Code, templates Meta, envio de mídia/texto e tratamento de webhook, conforme rotas, variáveis de ambiente e backend efetivamente aprovados.

**Pode implementar.** Interfaces de canal, chamadas aprovadas, uploads dentro dos limites de deploy, feedback de conexão e observabilidade segura. Testes devem usar sandbox, mock ou ambiente autorizado.

**Não pode implementar.** Credenciais no frontend, disparos reais sem autorização, bypass de webhook, modificação de infraestrutura Docker/Nginx por conveniência, suporte a canal não documentado, persistência de segredo no navegador ou fluxo de pareamento fictício apresentado como real.

**Critérios de conclusão.** Nenhum segredo chega ao bundle; os estados de canal representam a fonte real; falhas são recuperáveis; testes externos são autorizados e auditáveis; documentação de operação é atualizada.

## Etapa 7 — Inteligência Artificial, relatórios e Central de Ajuda

**Objetivo.** Entregar os módulos de IA, relatórios e conhecimento exatamente conforme regras de negócio aprovadas, com supervisão humana e segurança de conteúdo.

**Escopo.** Resumo individual ao encerrar; resumo executivo de 7/14/30 dias; filtro de horário comercial; relatórios salvos; resumo de conversa; Central de Ajuda; configurações de IA e CSAT se o contrato estiver confirmado.

**Pode implementar.** Apenas prompts, endpoints, campos, ações e formatos já homologados; blocos de IA no padrão do design system; revisão humana de propostas; sanitização formal de conteúdo HTML; logs e estados de falha transparentes.

**Não pode implementar.** Modelo de IA, prompt, automação, métrica, confiança, endpoint ou envio automático não documentado; `v-html` sem sanitização; expor chaves; declarar saída de IA como fato; bloquear atendimento manual se IA falhar.

**Critérios de conclusão.** IA é identificada e auditável; todos os efeitos têm autorização/recuperação; relatórios respeitam período e filtros; conteúdo é seguro; ajuda é acessível; contratos e testes passam.

## Etapa 8 — Qualidade de produção, observabilidade e homologação

**Objetivo.** Validar a solução integrada para produção sem expandir escopo de produto.

**Escopo.** Testes unitários, de contrato, integração e fluxos críticos; acessibilidade; responsividade; performance; tratamento de erros; segurança de token; observabilidade; configuração de build/deploy conforme guia homologado; checklist de homologação.

**Pode implementar.** Correções necessárias para cumprir contratos, segurança, a11y, performance e deploy; documentação operacional; dashboards técnicos e health checks apenas quando documentados/aprovados; pipeline de qualidade usando stack aprovada.

**Não pode implementar.** Novas funcionalidades, redesenho, troca de stack, migrações destrutivas, alteração de dados de cliente, publicação em produção, uso de segredos ou testes que enviem mensagens reais sem autorização explícita.

**Critérios de conclusão.** Build e suites de qualidade verdes; WCAG 2.2 AA verificado; cenários críticos por papel/workspace aprovados; contratos sem divergências abertas; deploy reproduzível; aprovação explícita do usuário para publicar.

---

## Regra final de governança

Uma etapa aprovada não autoriza iniciar a seguinte. Qualquer requisito novo, documento conflitante, dependência adicional, endpoint ausente ou mudança de domínio deve voltar para a matriz SSOT e receber decisão registrada antes da implementação. O design system permanece a fonte visual exclusiva; os contratos de backend permanecem a fonte exclusiva de integração; a documentação homologada permanece a fonte de produto.
