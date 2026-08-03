# 📘 LÓGICA E REGRAS DE NEGÓCIO DO SISTEMA (ABRAVELY CHAT 1.0)

Este documento registra todas as regras de negócio, fluxos de eventos, arquitetura de IA e comportamentos lógicos do painel Abravely Chat. Ele serve como fonte de verdade para o desenvolvimento do **Frontend** e da integração futura do **Backend**.

---

## 1. Nomenclatura e Entidades Principais
- **Atendentes Humanos:** Membros da equipe com perfil de atendimento ou administração no painel (nomenclatura unificada para **"Atendente"** / **"Atendentes"**).
- **Agente Robô / Automação:** Identificado unicamente como **"IA"** (nomenclaturas como "Capitão IA" foram completamente removidas).
- **Status da Conversa:**
  - `ABERTA`: Conversa ativa na fila.
  - `PENDENTE`: Aguardando resposta do cliente ou atribuição.
  - `RESOLVIDA` / `FINALIZADA`: Conversa encerrada por atendente humano ou robô IA.

- **Conexões & Canais Suportados (Configurações > Caixas de Entrada):**
  - **Simplificação de UX para o Cliente:** No formulário de criação de conexão, o cliente escolhe o tipo (*Evolution API GO* ou *Meta Cloud API*) e preenche **apenas o Nome da Conexão**.
  - **Parâmetros Padrão de Infraestrutura (Ocultos do Cliente):**
    1. **Evolution API GO (QR Code):** A URL do servidor Docker (`http://localhost:8080`), API Key e o ID da instância são atribuídos automaticamente pelo sistema. O cliente apenas lê o QR Code para conectar.
    2. **WhatsApp Meta Cloud API (Oficial):** As credenciais de ambiente (Token, Phone ID, WABA ID) e Webhook são tratadas pela infraestrutura padrão do servidor.

---

## 2. Fluxo de Encerramento e Resumo Individual por IA
### Gatilho de Encerramento (`onConversationFinished`)
1. Quando um atendimento é encerrado (pelo agente ou pela IA ao concluir o fluxo):
   - O status muda para `RESOLVIDA`.
   - O sistema dispara em segundo plano a chamada para o microserviço de IA (`POST /api/ai/summarize-conversation`).
2. **Resumo Individual de Conversa:**
   - A IA lê toda a transcrição da conversa.
   - Gera um texto sintético descrevendo o motivo do contato, a solução dada e o resultado final.
   - Classifica o **Sentimento do Cliente** (`Positivo`, `Neutro`, `Crítico/Insatisfeito`) e atrai uma pontuação de confiança (ex: `95%`).
3. O resumo e o sentimento são armazenados na tabela/model da conversa no banco de dados.

---

## 3. Tela de Relatórios - Atendimentos Finalizados
A tela de relatórios de atendimentos finalizados é composta por três camadas lógicas:

### A. Dashboard Superior (3 Cards de Métricas Principais)
1. **Card 1: SLA (Tempo Médio de Atendimento - TMA)**
   - Cálculo: `Soma(Tempo de Resolução de cada conversa) / Total de conversas finalizadas`.
   - Exibido em minutos (ex: `7.2 min`).
2. **Card 2: Sentimento Geral do Cliente**
   - Cálculo: `(Conversas com Sentimento Positivo / Total de conversas finalizadas) * 100`.
   - Exibido com indicador visual e percentual (ex: `95% Positivo`).
3. **Card 3: Quantidade de Atendimentos Fechados**
   - Total absoluto de conversas encerradas no período selecionado (7, 14 ou 30 dias).

### B. Resumo Executivo Consolidado por IA (Nível Geral)
- **Botão `Gerar Relatório Geral`** (anteriormente chamado "Gerar Resumo IA"):
  - Ao ser clicado, a IA executa uma agregação inteligente baseada nos resumos individuais das conversas do período selecionado.
  - **Entrada da IA:** Os **resumos individuais** de todas as conversas finalizadas no período.
  - **Saída da IA:** Um diagnóstico executivo formatado com gráfico de assuntos recorrentes, SLA/desempenho e sugestões operacionais.

- **Botão `Salvar Relatório Executivo` & Fluxo de Armazenamento:**
  - Ao clicar em `Salvar Relatório Executivo`:
    1. O relatório gerado é salvo na lista **"Relatórios Salvos"** contendo data/hora do salvamento e o diagnóstico completo.
    2. A tela principal do resumo é **limpa** (`executiveSummary = ''`), retornando ao estado inicial para permitir que o usuário clique em **`Gerar relatório geral`** para um novo ciclo.

- **Botão e Modal "Relatórios Salvos" no Topo:**
  - No topo da tela (Header), existe o botão **`Relatórios salvos`** com o contador de itens salvos.
  - Ao clicar no botão, abre-se uma tela/modal dedicada listando todos os relatórios arquivados.
  - **Expansão em Acordeão:** Cada relatório na lista exibe seu título e data/hora. Ao clicar no item, o relatório **expande em sanfona**, permitindo a leitura detalhada e/ou exclusão do registro.

### C. Tabela de Histórico de Atendimentos Encerrados
- **Colunas:**
  - `CLIENTE` (Nome, Telefone / WhatsApp)
  - `ATENDENTE / IA` (Nome e foto de quem finalizou)
  - `DEPARTAMENTO` (Comercial, Suporte, Financeiro, etc.)
  - `MOTIVO` (Motivo de encerramento)
  - `DATA / DURAÇÃO` (Data de encerramento e duração total)
  - `AÇÕES` (Ações rápidas)

- **Botões da Coluna Ações:**
  1. **`Reabrir conversa`**:
     - Retorna a conversa finalizada para o status `ABERTA`, reatribuindo ao grupo de conversas ativas.
  2. **`Ver resumo`**:
     - Abre a janela/modal de detalhes da conversa encerrada.

---

## 4. Modal "Ver Resumo / Detalhes da Conversa Encerrada"
Ao clicar em **`Ver resumo`** na tabela:
1. **Lado Esquerdo / Central:** Exibe o histórico/transcrição completa das mensagens trocadas entre cliente e agente/IA.
2. **Painel Lateral Direito:**
   - Exibe o **Sentimento do Cliente** (Positivo/Neutro/Crítico).
   - Exibe o **Resumo da Conversa**.
   - Botão **`Gerar resumo com IA`**: Permite forçar a regeração do resumo individual daquela conversa específica a qualquer momento.

---

---

## 5. Central de Ajuda (`currentView === 'ajuda'`)
A **Central de Ajuda** funciona como a Base de Conhecimento interna do sistema para suporte a clientes e treinamento da equipe:

1. **Estrutura Visual:**
   - Exibida em **tela cheia** (100% da largura útil do painel).
   - Tabela com os artigos cadastrados contendo: *Título do Artigo*, *Categoria*, *Visualizações*, *Status (Publicado/Rascunho)* e botão para criar novo artigo.
2. **Funcionalidades & Regras de Negócio:**
   - **Cadastro & Edição de Artigos:** Permite criar novos artigos com título, categoria (*Canais*, *IA & Automação*, *Configurações*), texto e suporte futuro a anexos/vídeos.
   - **Busca em Tempo Real:** Campo de pesquisa inteligente por palavras-chave no título ou conteúdo do artigo (`searchArticleQuery`).
   - **Contador de Leitura:** Registro automático do número de visualizações (`views`) por artigo.
3. **Endpoints de Backend (API REST):**
   - `GET /api/help/articles`: Retorna a lista de artigos de suporte.
   - `POST /api/help/articles`: Cadastra, edita ou altera o status de um artigo.

---

## 6. Próximos Passos de Integração de Backend
- **Tabelas / Schemas (Prisma ORM):**
  - `Conversation`: adicionar campos `summary` (String?), `sentiment` (String?), `sentimentScore` (Int?).
  - `HelpArticle`: id, title, content, category, views, status, createdAt, updatedAt.
- **Endpoints a Implementar:**
  - `GET /api/reports/finished-conversations`
  - `POST /api/reports/generate-global-summary`
  - `POST /api/conversations/:id/reopen`
  - `POST /api/conversations/:id/summarize`
  - `GET /api/help/articles`
  - `POST /api/help/articles`
