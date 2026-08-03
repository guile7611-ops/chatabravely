# CHAT-ABRAVELY — Design System Oficial

> **Versão:** 1.0  
> **Status:** normativa  
> **Escopo:** aplicação SaaS B2B omnichannel com Inteligência Artificial  
> **Público:** Product Design, Frontend Engineering, QA e agentes de IA que produzem interface.

## 1. Autoridade e modo de uso

Este documento é a fonte única de verdade visual e comportamental do CHAT-ABRAVELY. Toda interface deve usar os tokens, componentes, estados e padrões definidos aqui. Uma IA, pessoa ou equipe **não pode criar uma nova variante visual, cor semântica, componente, tamanho ou animação** sem atualizar primeiro esta especificação.

Em caso de conflito, a ordem de precedência é:

1. Acessibilidade e segurança operacional.
2. Tarefa e contexto do usuário.
3. Tokens e regras deste documento.
4. Preferência estética.

Use os nomes de tokens na implementação; não replique valores hexadecimais ou pixels arbitrários. Quando houver lacuna real, use a composição mais próxima de componentes existentes e registre a decisão antes de consolidá-la.

---

# 2. Fundamentos

## 2.1 Filosofia de design

**Objetivo.** Fazer o produto parecer uma estação de trabalho confiável: veloz para operar, legível sob carga cognitiva e previsível após horas de uso.

**Quando utilizar.** Em toda decisão de produto, layout, componente e copy.

**Quando não utilizar.** Nunca sacrificar acessibilidade, compreensão ou necessidades de um fluxo crítico apenas para aumentar densidade.

**Regras obrigatórias.**

- Produtividade é o critério principal; decoração não é requisito funcional.
- Informação recorrente deve estar estável no mesmo lugar e ter leitura escaneável.
- A interface revela complexidade progressivamente; não a esconde de forma misteriosa.
- Cada cor, borda, ícone, espaço e movimento deve comunicar hierarquia, estado ou ação.
- A identidade é sóbria: superfícies discretas, contraste deliberado, cor de marca restrita a intenção e foco.

**Boas práticas.** Manter filas, filtros e contexto da conversa visíveis; oferecer atalhos e preservação de estado; usar títulos objetivos e controles compactos.

**Erros comuns.** Telas "vazias" com cartões enormes; gradientes decorativos; excesso de sombras; ações escondidas atrás de ícones ambíguos; usar animação para compensar fluxo lento.

**Exemplo.** Uma fila de atendimento mostra cliente, canal, responsável, SLA, última mensagem e tags sem abrir o detalhe. Ações secundárias aparecem no hover/foco, mas a ação primária continua explícita.

## 2.2 UX principles

| Princípio | Regra operacional | Exemplo correto | Evitar |
| --- | --- | --- | --- |
| Contexto antes da ação | Preserve a origem e o estado da tarefa. | Drawer de cliente sobre a conversa. | Navegar para página nova para editar uma tag. |
| Decisão reversível | Prefira ações com desfazer quando o impacto for baixo. | Toast “Conversa arquivada — Desfazer”. | Modal de confirmação para marcar uma mensagem como lida. |
| Visibilidade do sistema | Toda ação assíncrona tem estado, resultado e falha. | Botão mostra progresso e toast final. | Clique sem retorno visual. |
| Menor custo cognitivo | Uma escolha por controle, rótulos diretos e defaults seguros. | “Atribuir a” com busca. | Seletor com 20 avatares sem texto. |
| Reconhecimento, não memória | Mostre filtros, escopo e decisões anteriores. | Chips de filtros ativos. | Exigir que a pessoa lembre a fila selecionada. |
| Tolerância a erro | Preserve entradas e explique a recuperação. | Formulário mantém valores após erro de API. | Limpar o formulário ao falhar. |
| Escaneabilidade | Priorize coluna, contraste e ritmo vertical. | Tabela com cabeçalho fixo e alinhamento consistente. | Blocos longos de texto centralizados. |

**Objetivo.** Tornar decisões de experiência repetíveis. **Quando utilizar.** Sempre; são critérios de revisão. **Quando não utilizar.** Não são desculpa para ignorar requisitos legais ou acessibilidade. **Erros comuns.** Aplicar “menos cliques” quando isso elimina revisão importante, ou “densidade” quando reduz o alvo de toque.

## 2.3 UI principles

**Objetivo.** Converter os princípios de UX em decisões de interface.

**Quando utilizar.** Em design, implementação e code review.

**Quando não utilizar.** Não trate uma regra visual como garantia de usabilidade; valide fluxos reais.

**Regras obrigatórias.**

- Use uma coluna de leitura e um ponto focal por região.
- Use bordas sutis para agrupar; sombras apenas para elevação transitória.
- Alinhe controles por baseline; números, valores e datas usam alinhamento à direita em tabelas.
- Ações primárias são únicas por contexto; o restante é secundário, terciário ou menu.
- Ícone sozinho só é permitido para ação comum, repetida e com tooltip.

**Boas práticas.** Preferir listas e tabelas para trabalho operacional, e cartões apenas para objetos resumidos ou métricas. **Erros comuns.** Colocar botões primários repetidos, alternar raios de borda, usar cor como único significado. **Exemplo.** Em “Configurações de canal”, “Salvar alterações” é primário; “Cancelar” é secundário e “Excluir canal” é destrutivo, separado.

## 2.4 Hierarquia visual e densidade

**Objetivo.** Permitir leitura rápida sem criar ruído.

**Quando utilizar.** Em qualquer tela com mais de três blocos informacionais.

**Quando não utilizar.** Não comprima fluxos de criação ou campos complexos abaixo do limite de leitura confortável.

**Regras obrigatórias.**

- Hierarquia vem nesta ordem: posição, tamanho, peso, contraste, cor; não comece pela cor.
- Título de página é um por tela; títulos de seção usam `heading-sm`.
- Espaço entre seções é maior que espaço entre itens da mesma seção.
- O modo padrão é denso: linhas de tabela 40 px, inputs 36 px, barra de ferramenta 48 px.
- Não centralize conteúdo operacional; alinhe à esquerda, salvo estados vazios ou confirmações.

**Exemplo bom.** Painel de conversa: lista à esquerda, conversa no centro, contexto do cliente à direita, com divisores e cabeçalhos fixos. **Exemplo ruim.** Cinco cartões de mesma ênfase e métricas gigantes ocupando o topo da fila.

---

# 3. Tokens visuais

## 3.1 Sistema de cores

**Objetivo.** Comunicar função, estado e hierarquia sem depender de efeitos decorativos.

**Quando utilizar.** Sempre por token semântico. **Quando não utilizar.** Nunca aplique cores primitivas diretamente em componentes de produto.

### Paleta base — modo claro

| Token | Valor | Uso obrigatório |
| --- | --- | --- |
| `color.brand.600` | `#155EEF` | ação primária, foco e links ativos |
| `color.brand.700` | `#004EEB` | hover de ação primária |
| `color.brand.50` | `#EFF4FF` | fundos de seleção e informação suave |
| `color.neutral.950` | `#101828` | texto forte |
| `color.neutral.700` | `#344054` | texto padrão |
| `color.neutral.500` | `#667085` | texto secundário e ícones padrão |
| `color.neutral.300` | `#D0D5DD` | borda forte e controles neutros |
| `color.neutral.200` | `#EAECF0` | borda padrão e divisores |
| `color.neutral.100` | `#F2F4F7` | superfícies sutis e hover neutro |
| `color.neutral.50` | `#F9FAFB` | canvas secundário |
| `color.surface.base` | `#FFFFFF` | canvas e painéis principais |
| `color.success.600` | `#039855` | sucesso e status saudável |
| `color.warning.600` | `#DC6803` | alerta que exige atenção |
| `color.danger.600` | `#D92D20` | erro, destruição e SLA crítico |
| `color.info.600` | `#155EEF` | informação e estado em andamento |

### Tokens semânticos

| Token | Claro | Regra |
| --- | --- | --- |
| `bg.canvas` | `neutral.50` | fundo da aplicação |
| `bg.surface` | `surface.base` | cartões, formulários, overlays internos |
| `bg.subtle` | `neutral.100` | hover, cabeçalho de tabela, áreas secundárias |
| `text.primary` | `neutral.950` | texto de maior importância |
| `text.secondary` | `neutral.700` | texto corrente |
| `text.tertiary` | `neutral.500` | apoio; nunca para informação essencial pequena |
| `border.default` | `neutral.200` | borda de componentes |
| `border.strong` | `neutral.300` | foco não colorido, divisões importantes |
| `action.primary` | `brand.600` | CTA principal |
| `status.*` | tom `600` correspondente | ícone + texto/badge; nunca só a cor |

### Tokens semânticos — Modo Escuro Oficial

| Token | Escuro | Regra |
| --- | --- | --- |
| `bg.sidebar` | `#1c1d21` | fundo do menu lateral estrutural |
| `bg.canvas` | `#141517` | fundo geral da aplicação |
| `bg.surface` | `#141517` | fundo de painéis operacionais e workspace |
| `bg.subtle` | `#1c1d21` | superfícies secundárias, hover e cartões sutis |
| `border.default` | `#23252b` | bordas e divisores de 1px entre painéis |
| `border.strong` | `#373a43` | bordas destacadas e anéis de foco |
| `text.primary` | `#f3f4f6` | texto de maior importância (WCAG 2.2 AA) |
| `text.secondary` | `#9ca3af` | texto corrente e rótulos secundários |
| `text.tertiary` | `#6b7280` | metadados e apoio |
| `action.primary` | `#155EEF` | ação principal e destaque |
| `status.*` | tom `600` correspondente | status semânticos de erro, aviso, sucesso e informação |

**Regras obrigatórias.**

- Uma tela operacional não deve ter mais de uma ação preenchida por região.
- Vermelho significa falha, risco ou destruição; nunca apenas “chamar atenção”.
- Verde significa êxito, disponível ou dentro do SLA; nunca “continuar”.
- Amarelo/laranja significa atenção, pendência ou risco; não use para texto longo.
- Links devem ter `brand.600`, sublinhado no hover e indicador de foco visível.
- O contraste mínimo é 4.5:1 para texto normal, 3:1 para texto grande e componentes interativos.

**Boas práticas.** Use badge com ícone e rótulo “SLA em risco”, não apenas fundo laranja. **Erros comuns.** Criar “azul claro da tela X”, texto cinza abaixo do contraste, cinco cores de status para o mesmo conceito.

## 3.2 Tipografia

**Objetivo.** Maximizar legibilidade em interface densa, principalmente mensagens, tabelas e dados.

**Família.** `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`. Código e identificadores técnicos: `"JetBrains Mono", "SFMono-Regular", Consolas, monospace`.

| Token | Tamanho / linha | Peso | Uso |
| --- | --- | --- | --- |
| `display-sm` | 30 / 38 px | 600 | título de dashboard ou página excepcional |
| `heading-lg` | 24 / 32 px | 600 | título de página padrão |
| `heading-md` | 20 / 28 px | 600 | seção principal |
| `heading-sm` | 16 / 24 px | 600 | subseção, título de card |
| `body-md` | 14 / 20 px | 400 | padrão de interface |
| `body-sm` | 13 / 18 px | 400 | metadados e tabelas densas |
| `label-md` | 14 / 20 px | 500 | labels, botões e tabs |
| `label-sm` | 12 / 16 px | 500 | badges e apoio |

**Quando utilizar.** `body-md` é a base; `body-sm` somente onde a densidade justifica. **Quando não utilizar.** Não use texto menor que 12 px, `font-weight: 700` como padrão ou caixa alta para blocos de leitura.

**Regras obrigatórias.** Texto de UI é sentence case em português; números tabulares usam `font-variant-numeric: tabular-nums`; não reduza line-height para “caber”; mensagens preservam quebras de linha e URLs longas têm quebra segura.

**Exemplo bom.** “Última atividade há 12 min”. **Exemplo ruim.** “ÚLTIMA ATIVIDADE HÁ 12 MIN” em 10 px.

## 3.3 Espaçamento, raio, borda e elevação

**Objetivo.** Criar ritmo previsível e composição modular.

| Token | Valor | Uso |
| --- | --- | --- |
| `space.1` | 4 px | microgap, ícone–rótulo curto |
| `space.2` | 8 px | itens relacionados |
| `space.3` | 12 px | campos/linhas compactas |
| `space.4` | 16 px | padding padrão de painel/card |
| `space.5` | 20 px | grupos de formulário |
| `space.6` | 24 px | seção interna |
| `space.8` | 32 px | separação entre seções |
| `space.10` | 40 px | respiro de página |
| `space.12` | 48 px | regiões independentes |

- `radius.sm`: 4 px para inputs, badges e botões.
- `radius.md`: 6 px para cards e menus.
- `radius.lg`: 8 px exclusivamente modais/drawers destacados.
- Não use pílula (`9999 px`) salvo avatar, contador circular e toggle.
- `border.default`: 1 px sólido `border.default`; não use bordas de 2 px exceto anel de foco.
- Elevação: `shadow.overlay = 0 12px 24px rgba(16,24,40,.14)`; `shadow.raised = 0 1px 3px rgba(16,24,40,.10)`. Cards repousam com borda, não sombra.

**Erro comum.** Margens de 10, 14, 18 ou 22 px; use a escala. **Exemplo.** Card: padding 16 px, itens 12 px, título para conteúdo 8 px, cards vizinhos 16 px.

## 3.4 Grid e layout

**Objetivo.** Sustentar telas de dados, chat e configuração sem deslocamento imprevisível.

**Regras obrigatórias.**

- Canvas com largura total; conteúdo de páginas administrativas: `max-width: 1440px` e padding responsivo.
- Grid de 12 colunas em desktop; 8 em tablet; 4 em mobile. Gutter: 24 / 16 / 12 px.
- Sidebar desktop tem 240 px expandida e 64 px recolhida. Painel contextual, quando houver, 320 px.
- A área de chat é fluida e não fica abaixo de 560 px em desktop; esconda/recolha painéis laterais antes disso.
- Nenhuma tela depende apenas de hover para revelar informação essencial.

**Quando utilizar.** Grid para páginas e dashboard; flex para agrupamentos lineares. **Quando não utilizar.** Não force os 12 slots para uma pequena configuração de formulário: use coluna de 640–760 px.

## 3.5 Breakpoints

| Nome | Faixa | Comportamento |
| --- | --- | --- |
| `xs` | < 480 px | uma coluna; controles de toque; sidebar em drawer |
| `sm` | 480–767 px | uma coluna; filtros em drawer; tabela vira lista quando necessário |
| `md` | 768–1023 px | 8 colunas; sidebar recolhida; painel de contexto sob demanda |
| `lg` | 1024–1279 px | 12 colunas; sidebar expandida; chat com dois painéis |
| `xl` | ≥ 1280 px | três painéis possíveis; preserve largura máxima de leitura |

Não crie breakpoints por dispositivo específico. O layout deve responder ao conteúdo e à largura disponível.

## 3.6 Ícones

**Objetivo.** Acelerar reconhecimento de ações e status sem substituir linguagem clara.

**Padrão.** Ícones lineares de uma única biblioteca, grade de 24 px, traço visual consistente; tamanhos 16, 20 e 24 px. Use 16 px dentro de controles densos, 20 px padrão e 24 px em empty state.

**Regras obrigatórias.** Ícones vêm antes do texto em botões quando adicionam reconhecimento; ícone sozinho exige nome acessível e tooltip; não misture estilos preenchido, 3D, emoji ou ilustração; ícone decorativo tem `aria-hidden=true`.

**Quando não utilizar.** Não use ícone quando ele duplica rótulo sem reduzir tempo de reconhecimento. **Erro comum.** Usar engrenagem para qualquer configuração ou três pontos como ação principal. **Exemplo.** `+ Nova conversa` é um botão textual com ícone de adição; `Arquivar` não é só uma caixa sem tooltip.

---

# 4. Estrutura de aplicação e navegação

## 4.1 App shell

**Objetivo.** Prover um enquadramento estável para operação contínua.

**Quando utilizar.** Em toda rota autenticada. **Quando não utilizar.** Login, recuperação de senha, onboarding de tela única e páginas públicas.

**Regras obrigatórias.** Sidebar persistente em desktop, header de contexto, área de conteúdo com scroll próprio quando necessário. Evite dois scrolls verticais simultâneos numa mesma tarefa. O foco inicial após navegação vai ao título principal.

**Boas práticas.** Mantenha escopo ativo (workspace, inbox ou conta) claro. **Erros comuns.** Trocar ordem da navegação por tela, esconder a ação global em páginas internas.

## 4.2 Sidebar

**Objetivo.** Permitir mudança rápida entre áreas principais e preservar orientação.

**Quando utilizar.** Navegação primária de produto. **Quando não utilizar.** Navegação local dentro de formulário ou etapas de wizard.

**Estrutura obrigatória.**

1. Marca compacta e seletor de workspace.
2. Ação global primária opcional (`Nova conversa` ou equivalente).
3. Grupos de navegação: Operação, Clientes, Automação, Análises, Configurações.
4. Rodapé: ajuda, notificações, perfil.

**Regras obrigatórias.** Item ativo tem fundo `brand.50`, texto `brand.700`, indicador esquerdo de 2 px e ícone correspondente; item possui alvo mínimo de 36 px; badges de contagem mostram apenas números relevantes (máximo `99+`); grupos podem colapsar, mas a seleção ativa nunca fica invisível.

**Não utilizar para.** Ações de linha, filtros, tabs ou links externos de baixo uso. **Erros comuns.** Mais de oito itens no primeiro nível; todos os itens com badge; navegação expandida ocupando área de trabalho pequena. **Exemplo.** “Atendimento” ativo, com inboxes como nível secundário colapsável; “Configurações” não compete visualmente com a fila.

## 4.3 Header

**Objetivo.** Mostrar localização, escopo e ações do contexto atual.

**Quando utilizar.** Topo de páginas no app shell. **Quando não utilizar.** Dentro de modal, drawer ou página de autenticação.

**Regras obrigatórias.** Altura 56 px; borda inferior; título/breadcrumb à esquerda; ações da página à direita; até duas ações visíveis antes de um overflow menu. Header de chat mostra status, responsável e ações da conversa; não repita título da página e título do painel sem necessidade.

**Boas práticas.** Ações persistentes (salvar, exportar) ficam próximas ao título de escopo. **Erros comuns.** Header com duas linhas sem motivo; ações globais misturadas a ações do item selecionado.

## 4.4 Navegação, breadcrumb e tabs

**Objetivo.** Diferenciar mudança de área, caminho hierárquico e variação de conteúdo no mesmo contexto.

**Quando utilizar.** Sidebar para área; breadcrumb para caminho profundo; tabs para views mutuamente exclusivas do mesmo objeto.

**Quando não utilizar.** Não use breadcrumb em até dois níveis estáveis; não use tabs como filtro multi-seleção; não combine sidebar secundária e tabs para a mesma hierarquia.

**Regras obrigatórias.** Breadcrumb tem máximo de quatro níveis, último não é link e truncamento preserva início identificável. Tabs têm rótulos de uma a três palavras, indicador inferior de 2 px, estado ativo e foco; em mobile tornam-se seletor ou scroll horizontal, nunca quebram em duas linhas. Alterar tab não deve descartar dados não salvos sem aviso.

**Exemplo bom.** `Clientes / Aurora Ltda. / Conversas`; tabs `Perfil | Conversas | Atividade`. **Exemplo ruim.** Tabs `Visão geral`, `Detalhes gerais`, `Informações` para conteúdo sobreposto.

---

# 5. Componentes de ação e entrada

## 5.1 Botões

**Objetivo.** Tornar ações explícitas, priorizadas e acessíveis.

**Quando utilizar.** Para iniciar uma ação imediata. **Quando não utilizar.** Navegação pura usa link; seleção persistente usa toggle/checkbox; escolhas mutuamente exclusivas usam radio/select.

**Variantes permitidas.**

| Variante | Uso | Restrições |
| --- | --- | --- |
| Primário | ação principal do contexto | máximo um por região |
| Secundário | ação importante, não dominante | borda padrão, fundo de superfície |
| Terciário/ghost | ação auxiliar | sem borda em repouso |
| Destrutivo | excluir, encerrar, revogar | texto explícito; confirmação conforme impacto |
| Ícone | ação repetida e reconhecível | tooltip e nome acessível obrigatórios |

Tamanhos: `sm` 32 px, `md` 36 px (padrão), `lg` 40 px. Gap entre ícone e rótulo: 8 px. O rótulo começa com verbo: “Salvar alterações”, “Atribuir conversa”, “Exportar CSV”.

**Regras obrigatórias.** Estados hover, active, disabled, focus e loading. Loading bloqueia duplo envio, preserva largura e substitui ícone por spinner; não troque o texto por “Carregando...” se o verbo ainda der contexto. Disabled explica o motivo próximo do controle quando não for óbvio.

**Erros comuns.** “OK”, “Enviar” para salvar configuração, dois primários adjacentes, botão vermelho para cancelar. **Exemplo.** `Salvar alterações` (primário) + `Cancelar` (terciário).

## 5.2 Inputs de texto

**Objetivo.** Capturar uma única informação textual curta.

**Quando utilizar.** Nome, e-mail, URL, identificador, assunto, valor curto. **Quando não utilizar.** Texto multilinha, escolha entre opções ou busca complexa.

**Regras obrigatórias.** Label visível acima; placeholder é exemplo, não rótulo; altura 36 px; padding horizontal 12 px; texto de ajuda abaixo; erro associado por `aria-describedby`; foco com anel de 2 px `brand.600` e offset de 2 px. Use tipo HTML correto (`email`, `url`, `tel`, `number`) sem confiar apenas nele para validação.

**Boas práticas.** Validar ao sair do campo e ao enviar; explicar como corrigir. **Erros comuns.** Placeholder como label, ícone sem significado, erro antes de interação. **Exemplo.** Label “E-mail de resposta”, placeholder `suporte@empresa.com`, ajuda “Usado como remetente das respostas.”

## 5.3 Selects, combobox e autocomplete

**Objetivo.** Escolher uma opção conhecida ou pesquisar em grande conjunto.

**Quando utilizar.** Select nativo/estilizado para até 10 opções estáveis; combobox para 11–100; autocomplete remoto acima disso ou para entidades pesquisáveis.

**Quando não utilizar.** Não use select para decisão de alto impacto sem descrição, múltiplas condições ou criação de item.

**Regras obrigatórias.** Label; valor atual explícito; opções agrupadas quando necessário; busca a partir de oito itens; teclado completo (setas, Enter, Escape); opção desabilitada explica motivo; “Nenhum resultado” oferece recuperação. Multi-select mostra até dois chips e depois `+N`.

**Erros comuns.** Select com centenas de clientes, dropdown que fecha ao marcar multi-select, label “Selecione”. **Exemplo.** “Responsável” é combobox com avatar, nome e opção “Não atribuído”.

## 5.4 Textareas e editor de mensagem

**Objetivo.** Capturar texto multilinha sem perder contexto ou rascunho.

**Quando utilizar.** Notas, descrições, mensagens e instruções para IA. **Quando não utilizar.** Campos curtos ou conteúdo estruturado.

**Regras obrigatórias.** Label no formulário; mínimo 80 px, crescimento automático até limite definido; contador somente se houver limite; preserve rascunho localmente; `Ctrl/⌘ + Enter` envia somente quando comunicado e com botão Enviar visível. Editor de chat deve separar claramente mensagem pública e nota interna.

**Erros comuns.** Enter enviar sem opção, perder rascunho ao trocar conversa, toolbar com formatação sem suporte real. **Exemplo.** Nota interna exibe fundo sutil âmbar, ícone e texto “Visível apenas para a equipe”.

## 5.5 Switches, checkboxes e radio buttons

**Objetivo.** Representar estados binários e escolhas claras.

| Componente | Utilizar quando | Não utilizar quando |
| --- | --- | --- |
| Switch | ligar/desligar efeito imediato ou preferência | seleção de itens para ação em lote |
| Checkbox | múltiplas escolhas independentes | escolha única obrigatória |
| Radio | uma escolha exclusiva, poucas opções | mais de cinco opções ou seleção opcional |

**Regras obrigatórias.** Alvo mínimo de toque 44 × 44 px em mobile; clique no label ativa o controle; estado indeterminado do checkbox só para seleção parcial; switch mostra estado textual adjacente quando o efeito não for evidente; radios ficam em coluna, salvo duas opções muito curtas.

**Boas práticas.** “Enviar transcrição por e-mail” com switch e ajuda de impacto. **Erros comuns.** Usar switch para “Selecionar tudo”, fazer o usuário salvar depois de switch imediato, radio escondido em card inteiro sem semântica.

## 5.6 Padrões de formulários

**Objetivo.** Permitir cadastro e configuração com baixa taxa de erro.

**Quando utilizar.** Qualquer coleção de campos que cria ou altera dados. **Quando não utilizar.** Ação de uma escolha simples; use popover ou ação direta se reversível.

**Regras obrigatórias.**

- Uma coluna até 640 px é padrão; duas colunas apenas para campos curtos e semanticamente pareados.
- Ordem segue o modelo mental do usuário, não o banco de dados.
- Campos obrigatórios recebem `*` e nota “* Campo obrigatório” no início do formulário.
- Mostre erros no campo, uma síntese no topo após submit falho e mantenha valores inseridos.
- Salve automaticamente apenas em preferências de baixo risco e informe o estado “Salvo”.
- Em configurações com impacto, barra de ações fixa mostra alterações pendentes, `Descartar` e `Salvar alterações`.

**Exemplo bom.** Integração: nome → credenciais → evento → teste → ativar. **Exemplo ruim.** Formulário de 30 campos sem seções, “Salvar” no final da página sem feedback.

---

# 6. Componentes de organização e sobreposição

## 6.1 Tabs e accordions

**Objetivo.** Organizar conteúdo sem aumentar navegação global.

**Tabs — quando utilizar.** Views pares do mesmo objeto. **Não utilizar.** Etapas sequenciais, filtros, ou mais de seis conteúdos profundos. **Regras.** Veja 4.4; painel ativo usa `role=tabpanel` e tab ativa recebe foco apenas por navegação de teclado.

**Accordions — quando utilizar.** Conteúdo secundário independente, FAQ interno ou filtros avançados. **Não utilizar.** Informação essencial, formulários que exigem comparação entre seções ou etapas. **Regras.** Cabeçalho inteiro é botão; indicador de expansão; múltiplos podem ficar abertos quando isso melhora comparação; não esconda erro dentro de seção fechada.

**Erros comuns.** Accordion dentro de accordion; tabs de uma única opção; accordion para reduzir comprimento de tabela. **Exemplo.** “Campos avançados” em configuração de webhook, fechado por padrão, preserva os campos básicos fora dele.

## 6.2 Cards

**Objetivo.** Agrupar um resumo, unidade de trabalho autocontida ou métrica.

**Quando utilizar.** Resumo de KPI, integração, item de catálogo, bloco de formulário e objeto que exige escaneamento em grade. **Quando não utilizar.** Lista longa, tabela, texto contínuo ou layout que usa card como substituto genérico de seção.

**Regras obrigatórias.** Fundo de superfície, borda padrão, raio `md`, padding 16 px; título opcional mas conteúdo tem hierarquia clara; card clicável inteiro só quando uma única navegação é sua ação; botões internos impedem clique de navegação; hover em card clicável é sutil.

**Erros comuns.** Card dentro de card sem motivo, sombra permanente, cada campo de formulário dentro de card. **Exemplo.** Card “WhatsApp Business” mostra estado, número associado, última sincronização e menu contextual.

## 6.3 Modais, dialogs e drawers

**Objetivo.** Concentrar uma decisão, tarefa breve ou detalhe sem quebrar contexto.

| Padrão | Use para | Não use para |
| --- | --- | --- |
| Dialog/Modal | confirmação de impacto, tarefa curta e focal | formulário longo ou navegação principal |
| Drawer | detalhe, edição contextual, filtros em tablet/mobile | confirmação simples |
| Modal full-screen | fluxo excepcional complexo em mobile | desktop por conveniência |

**Regras obrigatórias.** Um overlay por vez; trap de foco; `Esc` fecha se não há operação crítica em andamento; fundo não interativo; foco retorna ao disparador; título claro e `aria-labelledby`; botão fechar visível; ações no rodapé para tarefas de formulário. Modal de confirmação sempre nomeia o objeto e consequência.

**Exemplo bom.** “Excluir canal WhatsApp? As conversas permanecem no histórico, mas novas mensagens não serão recebidas.” + `Cancelar` / `Excluir canal`. **Exemplo ruim.** Modal “Tem certeza?” sem contexto; drawer para mostrar uma única confirmação.

## 6.4 Dropdowns, menus de contexto e tooltips

**Objetivo.** Expor ações secundárias sem poluir o layout.

**Quando utilizar.** Dropdown para lista curta de ações associadas a um gatilho; menu de contexto como atalho adicional em tabela/lista; tooltip para explicar ícone ou termo curto.

**Quando não utilizar.** Não esconda ação principal, estado essencial ou explicação longa em tooltip. Não use menu de contexto como único caminho de uma ação.

**Regras obrigatórias.** Menu com largura mínima 180 px, itens de 36 px, ícone opcional à esquerda, atalhos à direita, divisores só entre grupos; fecha por Escape, clique fora e ação bem-sucedida; item destrutivo fica ao final, separado. Tooltip aparece em hover e foco, após 400–600 ms, não bloqueia alvo e nunca contém controles.

**Erros comuns.** Menu com mais de sete itens sem grupos; tooltip no mobile como única explicação; “…” sem tooltip. **Exemplo.** Linha de conversa oferece `Atribuir`, `Mover`, `Adicionar tag`, divisor, `Arquivar`.

## 6.5 Toasts e feedback efêmero

**Objetivo.** Confirmar resultado sem interromper trabalho.

**Quando utilizar.** Sucesso, falha não bloqueante, atualização e ação reversível. **Quando não utilizar.** Erro que exige decisão, validação de formulário ou informação crítica que precisa persistir.

**Regras obrigatórias.** Posição inferior direita em desktop, superior segura em mobile; máximo três empilhados; duração 5 s para sucesso, persistente para erro acionável; título conciso, detalhe opcional, ação no máximo uma; `role=status` para sucesso/informação, `role=alert` apenas quando necessário. Não mostre toast para cada autosave.

**Exemplo bom.** “Conversa atribuída a Marina.” **Exemplo ruim.** “Sucesso!” sem dizer o que ocorreu.

---

# 7. Dados, busca e operação

## 7.1 Tabelas

**Objetivo.** Comparar, filtrar e agir sobre conjuntos de dados estruturados.

**Quando utilizar.** Mais de cinco itens com colunas comparáveis, seleção em lote, ordenação ou leitura analítica. **Quando não utilizar.** Conteúdo narrativo, conversa ou lista de cartões com conteúdo heterogêneo.

**Regras obrigatórias.**

- Cabeçalho é persistente no scroll da região, fundo `bg.subtle`, texto `label-sm`.
- Linha padrão 40 px; 48 px para conteúdo com avatar; nunca abaixo de 36 px em desktop.
- Primeira coluna de identificação alinhada à esquerda; número/moeda/data alinhados à direita; status tem texto além de cor.
- Ordenação mostra coluna e direção; apenas uma ordem por vez salvo necessidade explícita.
- Ações por linha ficam no final; checkbox de lote no início; seleção em lote abre barra contextual.
- Colunas podem ocultar em breakpoints, mas identidade e ação principal não desaparecem.
- Use truncamento com tooltip somente quando o valor completo é necessário; preserve cópia do valor.

**Estados.** Loading usa skeleton de linhas; vazio tem explicação e CTA; erro preserva cabeçalho/filtros e oferece “Tentar novamente”.

**Erros comuns.** Linhas clicáveis e ações sem indicar prioridade; cabeçalhos sem ordenação clara; tabela horizontal sem alternativa em mobile. **Exemplo.** Clientes: Nome, Empresa, Canal, Dono, Última atividade, Status, ações.

## 7.2 Paginação e carregamento incremental

**Objetivo.** Navegar por resultados extensos com previsibilidade.

**Quando utilizar.** Paginação para conjuntos administrativos, auditáveis e com total relevante; carregamento incremental para timeline, chat e feed cronológico.

**Quando não utilizar.** Não use scroll infinito em busca que exige saltar a páginas, exportar ou comparar total.

**Regras obrigatórias.** Paginação mostra intervalo e total quando conhecido, tamanho de página (25 padrão; 50/100 opcionais), anterior/próximo e página atual. Carregamento incremental preserva posição de scroll e informa “Carregar mensagens anteriores”; não auto-roube o scroll do leitor.

**Erro comum.** Infinito sem indicador de fim ou sem retorno ao ponto anterior. **Exemplo.** `1–25 de 438 clientes · 25 por página`.

## 7.3 Busca

**Objetivo.** Encontrar rapidamente entidades, conversas e configurações.

**Quando utilizar.** Quando a pessoa conhece parte de um nome, identificador ou conteúdo. **Quando não utilizar.** Como substituto de filtros facetados ou navegação comum.

**Regras obrigatórias.** Campo com label acessível (“Buscar conversas”), atalho exibido se houver (`⌘/Ctrl K` para busca global), debounce 250–350 ms apenas para consulta remota, estado carregando e zero resultado. Destaque de termos deve preservar legibilidade e não usar apenas cor. A busca global agrupa resultados por tipo e mostra atalho de navegação.

**Boas práticas.** Preserve consulta ao voltar; ofereça limpar; corrija acentos de forma tolerante. **Erros comuns.** Buscar somente ao clicar em botão, fechar resultados ao usar setas, placeholder “Buscar...” sem escopo.

## 7.4 Filtros

**Objetivo.** Reduzir um conjunto por atributos compreensíveis e visíveis.

**Quando utilizar.** Listas, filas, relatórios e tabelas. **Quando não utilizar.** Como menu escondido para configurações estruturais ou seleção de tab.

**Regras obrigatórias.** Filtros rápidos na toolbar; filtros avançados em popover/drawer; filtros ativos viram chips removíveis e há “Limpar filtros”. Contagem de resultados atualiza depois de aplicar. Datas usam intervalo explícito e timezone do workspace. Filtros salvos têm nome e escopo claros; não sobrescreva filtros pessoais sem confirmação.

**Exemplo bom.** `Status: Aberta ×`, `Canal: WhatsApp ×`, `SLA: Em risco ×` e `Limpar filtros`. **Exemplo ruim.** Ícone de funil sem qualquer indicação de filtros ativos.

## 7.5 Dashboards

**Objetivo.** Monitorar saúde operacional e orientar investigação, não decorar a tela inicial.

**Quando utilizar.** KPIs com decisão associada: volume, tempo de primeira resposta, resolução, SLA, produtividade e qualidade de IA. **Quando não utilizar.** Para todo dado disponível ou métricas sem dono/ação.

**Regras obrigatórias.** Cada métrica declara período, comparação e definição acessível; cards de KPI têm título, valor, variação e link/drilldown opcional; gráficos usam no máximo uma série destacada e cores semânticas; tooltip de gráfico mostra unidades e período; sempre ofereça tabela/alternativa textual para leitura precisa.

**Boas práticas.** Começar por exceções (“SLA em risco”), depois tendência e detalhamento. **Erros comuns.** Medidores semicirculares, gráfico 3D, quatro gráficos por linha, cor sem legenda. **Exemplo.** “Tempo mediano de primeira resposta — 4m 12s — ↓ 18% vs. período anterior”.

## 7.6 Timeline e atividade

**Objetivo.** Mostrar eventos em ordem, sua autoria e efeito no objeto.

**Quando utilizar.** Histórico de cliente, auditoria, eventos de automação e conversas. **Quando não utilizar.** Lista de tarefas que exige reordenação ou comparação tabular.

**Regras obrigatórias.** Ordem cronológica clara (mais recente primeiro, exceto chat); evento contém ator, ação, objeto e horário; agrupe eventos repetitivos quando não houver perda de auditoria; diferencie humano, sistema e IA por label/ícone, nunca somente cor. Datas relativas exibem data absoluta em tooltip.

**Erro comum.** “Atualizado” sem quem, o quê ou quando. **Exemplo.** “Marina atribuiu a conversa a João · hoje, 14:32”.

---

# 8. Padrões de atendimento omnichannel

## 8.1 Workspace de chat

**Objetivo.** Resolver conversas com velocidade, preservando contexto de cliente, canal e automações.

**Quando utilizar.** Atendimento individual e supervisão de conversa. **Quando não utilizar.** Relatório agregado ou edição massiva de registros.

**Estrutura obrigatória em desktop.**

- Painel de fila: busca, filtros, agrupamento, itens com cliente/canal/última mensagem/SLA/responsável.
- Painel de conversa: cabeçalho, histórico, composer fixado e ações da conversa.
- Painel de contexto sob demanda: perfil, atributos, notas, tickets e atividade.

**Regras obrigatórias.** Mensagens recebidas e enviadas têm alinhamento e superfície diferentes, mas não dependem só da cor; canal é exibido; mensagens de sistema são compactas e distinguíveis; nota interna não pode ser enviada ao cliente por engano; evento “novo” não força scroll se a pessoa está lendo histórico; há botão “Ir para mensagens recentes”.

**Boas práticas.** Composer começa com o canal explícito (`Responder por WhatsApp`); anexos têm estado de upload e erro por arquivo; respostas rápidas mostram atalho e preview. **Erros comuns.** Balões excessivamente arredondados, cores de canal dominando a conversa, cliente sem identidade no painel.

**Exemplo.** Conversa aberta mostra “SLA vence em 8 min” como badge textual de alerta ao lado do status, não como tela vermelha.

## 8.2 Filas, status e atribuição

**Objetivo.** Orquestrar prioridade e propriedade de conversas.

**Quando utilizar.** Toda operação que distribui atendimento. **Quando não utilizar.** Não use status de conversa como tag genérica.

**Regras obrigatórias.** Estados padrão: `Aberta`, `Em atendimento`, `Aguardando cliente`, `Resolvida`, `Arquivada`. Ação de atribuição mostra responsável atual e permite `Não atribuído`; mudança é auditada em timeline. SLA tem rótulo e tempo restante; crítico não depende só de vermelho. Estados e transições inválidas explicam motivo.

**Erros comuns.** “Fechada”, “Finalizada” e “Resolvida” para o mesmo conceito; permitir reatribuição silenciosa sem histórico. **Exemplo.** Ao resolver, a conversa sai da fila ativa e toast oferece “Reabrir”.

## 8.3 Padrões para IA

**Objetivo.** Tornar automação e assistência de IA verificáveis, controláveis e úteis — nunca opacas.

**Quando utilizar.** Resumo, sugestão de resposta, classificação, extração de campos, roteamento e automação com IA. **Quando não utilizar.** Como rótulo de marketing para busca simples, regra determinística ou conteúdo que exige garantia humana.

**Regras obrigatórias.**

- Toda saída de IA mostra origem: `Sugestão da IA`, modelo/automação quando relevante e horário.
- Resultado proposto é distinto de dado confirmado. O usuário pode revisar, editar, aceitar ou descartar antes de efeitos externos, salvo automação explicitamente configurada.
- Exiba entradas relevantes e regras aplicadas quando a decisão impactar cliente, SLA, roteamento ou dados.
- Nunca afirme certeza sem base; use linguagem proporcional (“Sugestão”, “Provável intenção”, “Confiança alta”).
- Falha de IA não bloqueia atendimento manual; informe fallback e opção de tentar novamente.
- Não envie conteúdo sensível a um modelo sem indicar política e consentimento adequados ao workspace.

**Interface obrigatória.** Bloco de IA tem ícone `sparkle` discreto, label textual, borda `brand.200`/fundo `brand.50` no claro, conteúdo editável quando aplicável e ações `Aplicar`, `Editar`, `Descartar`; para automação, mostre log e possibilidade de desligar conforme permissão.

**Boas práticas.** Pré-preencher uma resposta como rascunho, mantendo “Enviar” sob controle humano; indicar fontes do resumo. **Erros comuns.** Botão “Gerar” sem indicar efeito, resposta enviada automaticamente por padrão, badge “IA” em cada pixel, usar confiança como verdade. **Exemplo.** “Sugestão da IA · baseada nas últimas 12 mensagens” + resposta editável + `Usar como rascunho`.

---

# 9. Estados do sistema

## 9.1 Empty states

**Objetivo.** Explicar ausência de conteúdo e indicar próximo passo útil.

**Quando utilizar.** Conjunto vazio inicial, filtro sem resultados ou recurso não configurado. **Quando não utilizar.** Enquanto dados carregam; use skeleton. Não use ilustração para erro de sistema.

**Regras obrigatórias.** Título específico, uma frase causal/acionável, CTA quando houver ação válida. Ícone simples opcional de 24–32 px; não usar ilustração decorativa grande. Diferencie “Ainda não há conversas” de “Nenhuma conversa corresponde aos filtros”.

**Exemplo bom.** “Nenhuma conversa encontrada. Ajuste os filtros ou limpe-os para ver todas as conversas.” + `Limpar filtros`. **Exemplo ruim.** “Oops! Nada aqui” com astronauta.

## 9.2 Loading e skeletons

**Objetivo.** Manter estrutura, reduzir incerteza e prevenir interação duplicada enquanto o sistema responde.

**Quando utilizar.** Até conteúdo conhecido estar disponível (skeleton), operação pontual (spinner no controle), processamento demorado (progresso com mensagem). **Quando não utilizar.** Para mascarar falhas ou substituir feedback de progresso em tarefas longas.

**Regras obrigatórias.** Skeleton reproduz geometria final, não blocos aleatórios; shimmer suave e respeita `prefers-reduced-motion`; preserve layout para evitar salto; spinner não fica sozinho sem contexto acima de 1 s; tarefas acima de 10 s têm progresso ou estado assíncrono que permite continuar trabalhando.

**Erros comuns.** Skeleton em cada pixel, página em branco, botão ainda clicável durante submit. **Exemplo.** Lista de conversa com cinco linhas skeleton, cada uma com avatar e três linhas equivalentes ao conteúdo.

## 9.3 Estados de erro

**Objetivo.** Informar o que falhou, impacto e caminho de recuperação.

**Quando utilizar.** Falhas de validação, rede, permissão, integração e processamento. **Quando não utilizar.** Não mostre erro técnico cru ao usuário final nem toast para erro que bloqueia o formulário.

**Regras obrigatórias.** Linguagem humana, específica, sem culpar o usuário; mantenha contexto e entradas; ofereça recuperação viável (`Tentar novamente`, `Voltar`, `Copiar ID do erro`, `Falar com suporte`); mostre código técnico apenas em área secundária/copiar; mensagens de permissão descrevem a permissão necessária e o administrador aplicável.

**Exemplo bom.** “Não foi possível enviar a mensagem. Sua conexão pode ter sido interrompida. Tentar novamente.” **Exemplo ruim.** “Erro 500.”

## 9.4 Estados de sucesso

**Objetivo.** Confirmar conclusão sem quebrar o ritmo de trabalho.

**Quando utilizar.** Ações salvas, enviadas, importadas, conectadas ou concluídas. **Quando não utilizar.** Para ações triviais que têm confirmação visual local suficiente, como abrir uma tab.

**Regras obrigatórias.** Confirme objeto e resultado; atualize a UI de origem; use toast ou mensagem inline, não modal; ofereça desfazer se reversível. **Exemplo.** “Regra de roteamento publicada.” **Erro comum.** Tela de celebração após salvar uma configuração simples.

## 9.5 Feedback visual

**Objetivo.** Tornar causa e efeito claros, reduzindo dúvida sobre interatividade.

**Quando utilizar.** Hover, foco, pressed, drag, ação assíncrona e alteração de estado. **Quando não utilizar.** Não anime conteúdo que compete com leitura ou represente urgência falsa.

**Regras obrigatórias.** Hover é sutil e nunca único sinal; pressed dura 80–120 ms; transições de cor/opacity 120–160 ms; abrir/fechar superfície 160–220 ms com `ease-out`; nenhuma animação de interface ultrapassa 250 ms exceto progresso; respeitar `prefers-reduced-motion` removendo deslocamentos e shimmer.

**Erros comuns.** Bounce, elasticidade, parallax, cards que sobem no hover, animação em loop sem significado. **Exemplo.** Ao atribuir conversa, avatar e nome atualizam localmente, seguido de toast curto; sem modal nem confete.

### Microinterações e animações

**Objetivo.** Reforçar o estado de um controle e orientar mudanças de contexto sem introduzir distração.

**Quando utilizar.** Hover, foco, seleção, expandir/recolher, progresso, drag-and-drop e confirmação local. **Quando não utilizar.** Para decorar carregamento, adicionar personalidade a tarefas críticas ou atrasar uma ação já concluída.

**Regras obrigatórias.** Microinterações obedecem aos tempos definidos acima, preservam a posição do layout, são interrompíveis por nova ação e respeitam `prefers-reduced-motion`. A animação deve deixar o estado final inteiramente compreensível mesmo quando desativada.

**Boas práticas.** Usar fade breve ao inserir uma tag e transição curta ao abrir um menu. **Erros comuns.** Confete, bounce, scroll automático agressivo, skeleton brilhante com redução de movimento ativa. **Exemplo.** Ao arrastar uma conversa, a zona de destino ganha borda de foco e rótulo “Mover para Suporte”; ao soltar, a linha muda de fila e a timeline registra a ação.

---

# 10. Responsividade e dark mode

## 10.1 Responsividade

**Objetivo.** Preservar capacidade operacional em qualquer largura, não apenas reduzir desktop.

**Quando utilizar.** Toda interface desde a primeira implementação. **Quando não utilizar.** Não mantenha desktop miniaturizado em mobile.

**Regras obrigatórias.**

- Mobile prioriza uma tarefa: fila **ou** conversa **ou** contexto; a volta preserva scroll e filtros.
- Barra lateral vira drawer modal; ações de tabela viram menu por item; filtros avançados viram drawer.
- Alvos de toque têm 44 px; tooltips têm alternativa textual/permanente.
- Não esconda status crítico; reorganize-o para o cabeçalho ou resumo.
- Dados extensos tornam-se lista de pares label–valor ou tabela com scroll horizontal consciente, somente quando comparação tabular é indispensável.

**Exemplo bom.** Em 375 px, abrir uma conversa troca a lista pelo chat com botão “Voltar para fila (12)”. **Exemplo ruim.** Três colunas comprimidas e texto truncado sem acesso ao conteúdo.

## 10.2 Dark mode

**Objetivo.** Oferecer conforto visual mantendo semântica e contraste, não inverter cores cegamente.

**Quando utilizar.** Quando o workspace ou sistema operacional selecionar modo escuro. **Quando não utilizar.** Nunca misture superfícies claras e escuras sem indicar contexto distinto.

| Token | Escuro | Regra |
| --- | --- | --- |
| `bg.canvas` | `#101828` | fundo principal |
| `bg.surface` | `#1D2939` | painéis e inputs |
| `bg.subtle` | `#344054` | hover/cabeçalhos sutis |
| `text.primary` | `#F9FAFB` | texto forte |
| `text.secondary` | `#EAECF0` | texto padrão |
| `text.tertiary` | `#98A2B3` | apoio |
| `border.default` | `#344054` | borda padrão |
| `color.brand.600` | `#84ADFF` | ação/foco; validar contraste |

**Regras obrigatórias.** Troque tokens semânticos, não estilos de componentes isolados; reduza contrastes extremos de branco puro; sombras diminuem e bordas ganham importância; estados de sucesso/alerta/erro preservam texto e ícone. **Erros comuns.** Fundo preto puro, cinza sobre cinza sem contraste, imagens/ícones invisíveis, usar a mesma cor azul clara para texto pequeno sem testar contraste.

---

# 11. Acessibilidade e conteúdo

## 11.1 Acessibilidade

**Objetivo.** Garantir operação completa por teclado, leitor de tela, baixa visão, zoom e preferências de movimento.

**Quando utilizar.** Em todos os componentes e critérios de aceite. **Quando não utilizar.** Não trate acessibilidade como etapa final ou modo opcional.

**Regras obrigatórias.**

- Atenda WCAG 2.2 AA no mínimo.
- Toda ação é alcançável por teclado e tem foco visível; a ordem de tabulação acompanha a leitura visual.
- Use HTML semântico nativo antes de ARIA; nomes, roles e estados devem refletir o comportamento real.
- Nunca comunique status apenas por cor, ícone, posição ou som.
- Suporte zoom de 200% sem perda de conteúdo ou funcionalidade e reflow até 320 CSS px.
- Toda imagem funcional tem texto alternativo; decorativa é ignorada pelo leitor.
- Live regions são econômicas: anuncie resultados, não cada mudança visual.
- Gestos complexos possuem alternativa simples; drag-and-drop possui comandos de teclado.

**Boas práticas.** Testar navegação por teclado sem mouse, contraste nos dois modos, leitor de tela para diálogos/formulários e redução de movimento. **Erros comuns.** Focus ring removido, div clicável, tooltip inacessível, placeholder único como label.

## 11.2 Copywriting

**Objetivo.** Reduzir ambiguidade e ajudar a pessoa a agir com segurança.

**Quando utilizar.** Todo rótulo, ajuda, estado, confirmação, erro e texto de IA. **Quando não utilizar.** Não use tom promocional em operação cotidiana.

**Voz.** Direta, calma, respeitosa, específica e orientada à ação. Português do Brasil. Frases curtas. Termos técnicos apenas quando o público precisa deles; explique impacto antes do jargão.

**Regras obrigatórias.**

- Botões usam verbo + objeto: “Criar regra”, “Salvar alterações”, “Tentar novamente”.
- Erros respondem: o que ocorreu, qual impacto, o que fazer agora.
- Confirmações nomeiam objeto e efeito: “Canal conectado”, não “Sucesso”.
- Evite exclamações, culpa, humor em erro e termos vagos como “Oops”, “Algo deu errado”, “Clique aqui”.
- Datas usam padrão localizado e fuso claro em eventos importantes; números usam formatação pt-BR.

| Preferir | Evitar |
| --- | --- |
| “Não foi possível carregar os clientes. Tentar novamente.” | “Oops! Algo deu errado.” |
| “Excluir 3 conversas?” | “Confirmar ação?” |
| “A IA sugeriu uma resposta com base no histórico.” | “Resposta inteligente pronta!” |

---

# 12. Catálogo de componentes

## 12.1 Componentes obrigatórios

Todos devem existir como componentes reutilizáveis, documentados com estados e testes de acessibilidade:

- `AppShell`, `Sidebar`, `Header`, `Breadcrumb`, `PageHeader`.
- `Button`, `IconButton`, `Link`, `Badge`, `Avatar`, `StatusIndicator`.
- `TextField`, `Textarea`, `Select`, `Combobox`, `DateRangePicker`, `Checkbox`, `RadioGroup`, `Switch`.
- `Tabs`, `Accordion`, `Card`, `Divider`, `EmptyState`, `Skeleton`, `InlineAlert`.
- `Dialog`, `Drawer`, `ConfirmDialog`, `DropdownMenu`, `ContextMenu`, `Tooltip`, `Toast`.
- `DataTable`, `Pagination`, `SearchField`, `FilterBar`, `FilterChip`, `SavedView`.
- `ChatWorkspace`, `ConversationListItem`, `MessageBubble`, `MessageComposer`, `InternalNote`, `Attachment`, `Timeline`.
- `AIProposal`, `AIStatus`, `AIAuditEntry`.

**Objetivo.** Evitar implementação paralela e variações visuais acidentais. **Quando utilizar.** Antes de escrever HTML/CSS específico. **Quando não utilizar.** Não crie um “novo botão” para uma página; componha as variantes existentes. **Regra obrigatória.** Cada componente expõe `default`, `hover`, `focus`, `active`, `disabled`, `loading`/`empty`/`error` quando aplicáveis, tema claro/escuro e comportamento de teclado. **Erro comum.** Clonar `Button` para cada feature com CSS local.

## 12.2 Componentes proibidos

Estes padrões não fazem parte do CHAT-ABRAVELY e não devem ser introduzidos sem revisão explícita do design system:

- Gradientes decorativos, mesh backgrounds e auroras.
- Glassmorphism, blur de fundo em superfícies de trabalho e transparência ornamental.
- Cards flutuantes com sombra pesada ou raio acima de 8 px.
- Botões em pílula, exceto switch/contador/avatares conforme token.
- Gráficos 3D, gauge semicircular e donuts sem valor comparativo claro.
- Carrosséis, auto-play, parallax, confete e animações de entrada em massa.
- Ícones emoji como controles de produto e ilustrações genéricas em empty state.
- Texto centralizado em telas operacionais e títulos em caixa alta.
- Menu de três pontos como único acesso à ação primária.
- Inputs sem label, tooltips com conteúdo essencial, mensagens de erro genéricas.

**Objetivo.** Proteger clareza e longevidade visual. **Quando não utilizar.** Nenhuma exceção por “deixar mais moderno”; uma necessidade comprovada exige alteração documentada. **Exemplo ruim.** Dashboard com seis cartões em gradiente e números em 48 px. **Alternativa.** KPI em card com borda, valor em `heading-lg`, período e drilldown.

---

# 13. Anti-patterns e exemplos de decisão

## 13.1 Anti-patterns críticos

| Anti-pattern | Por que falha | Padrão correto |
| --- | --- | --- |
| Modal para cada ação | interrompe fluxo e aumenta fadiga | ação direta + desfazer; confirmação só para impacto real |
| Cor como único status | exclui pessoas e perde semântica | cor + ícone + rótulo |
| CTA primário repetido | dilui prioridade | um CTA por região/contexto |
| Card para toda seção | transforma informação em blocos sem hierarquia | superfície plana com divisores e headings |
| Tabela desktop comprimida no mobile | torna dados ilegíveis | lista responsiva ou scroll consciente |
| IA sem revisão | cria risco operacional | proposta editável e aprovação explícita |
| Autosave silencioso em ação crítica | gera perda de confiança | estado salvo/pendente e confirmação |
| Esconder filtros ativos | causa resultados inexplicáveis | chips persistentes e limpar filtros |
| Loading sem estrutura | parece erro e causa salto | skeleton equivalente ao conteúdo |
| Excluir sem contexto | aumenta erro irreversível | confirmação com objeto, consequência e alternativa |

## 13.2 Exemplos de boas práticas e más práticas

### Exemplo A — lista operacional de conversas

**Correto:** cabeçalho com título “Conversas”, contador de escopo, busca, filtros ativos em chips e tabela/lista. Cada linha mostra identidade, canal, resumo, dono, SLA e status textual. A linha abre detalhe; ações de manutenção estão no menu; seleção em lote explicita o número selecionado.

**Incorreto:** grade de cartões coloridos com avatar grande, três ícones sem legenda, horário em cinza pequeno e um botão primário “Ver” em cada cartão.

### Exemplo B — salvar configuração

**Correto:** formulário em coluna, labels persistentes, ajuda de impacto, validação no campo. Após alteração, barra inferior informa “Alterações não salvas” com `Descartar` e `Salvar alterações`. Ao salvar, UI atualiza e toast confirma o recurso.

**Incorreto:** inputs sem label em modal pequeno, botão “OK”, modal de sucesso após salvar e perda de valores quando API falha.

### Exemplo C — sugestão de resposta por IA

**Correto:** bloco “Sugestão da IA” informa que usa o histórico da conversa, apresenta texto editável e oferece `Usar como rascunho` ou `Descartar`; enviar ao cliente continua sendo ação humana explícita.

**Incorreto:** botão brilhante “Responder com IA” envia uma mensagem sem revisão e sem evidência de origem.

---

# 14. Checklist de qualidade antes de aprovar uma interface

- [ ] Usa tokens semânticos, escala de espaço e tipografia definidos; não há valores visuais arbitrários.
- [ ] Há uma ação primária clara por contexto e todas as ações têm rótulo ou nome acessível.
- [ ] Estados loading, vazio, erro, sucesso e disabled foram definidos onde aplicáveis.
- [ ] O fluxo funciona por teclado, tem foco visível e comunica status sem depender apenas de cor.
- [ ] O layout foi verificado nos breakpoints `xs`, `md` e `lg`, e nos temas claro e escuro.
- [ ] Formulários preservam dados e dão erros úteis; ações destrutivas têm contexto adequado.
- [ ] Busca, filtros e paginação explicam o escopo atual e preservam estado quando possível.
- [ ] IA deixa claro que é IA, permite supervisão proporcional ao impacto e registra efeitos relevantes.
- [ ] Não há componentes proibidos, decoração sem função ou padrão novo não documentado.

---

# 15. Governança

Uma alteração neste sistema deve registrar: problema que resolve, componente/token afetado, impacto em claro/escuro e responsividade, requisitos de acessibilidade, exemplos de uso e plano de migração. Tokens novos exigem intenção semântica reutilizável; não crie token para uma única tela.

Se a solicitação não se encaixar no sistema, a implementação deve escolher o padrão existente mais próximo e abrir uma proposta de evolução. A exceção temporária precisa ter prazo de remoção. Consistência operacional é uma funcionalidade do produto.
