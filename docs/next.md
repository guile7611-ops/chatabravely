# Planejamento & Status: Conector de WhatsApp e Próximos Passos

Este documento resume as tarefas que já foram concluídas com sucesso e os próximos passos mapeados para a continuidade do projeto.

---

## 🚀 O que já foi feito

### 1. Banco de Dados e Modelos
* **Atualização do Prisma**: Atualizamos o modelo `Channel` no arquivo [schema.prisma](file:///c:/Users/guilh/Desktop/chat-multicanal-ia/backend/prisma/schema.prisma) adicionando suporte a múltiplos provedores (`OFFICIAL` e `EVOLUTION`), status de conexão (`DISCONNECTED`, `CONNECTING`, `CONNECTED`) e credenciais da Evolution API.
* **Sincronização**: Banco de dados atualizado e tipos recriados via `npx prisma db push`.

### 2. Backend, Filas & Webhooks
* **Serviço Evolution**: Criamos o [evolution.service.ts](file:///c:/Users/guilh/Desktop/chat-multicanal-ia/backend/src/services/evolution.service.ts) para se comunicar diretamente com o servidor da Evolution API.
* **Rotas REST**: Rotas de criação/remoção de canais, consulta de QR Code e simulação de pareamento integradas em [api.routes.ts](file:///c:/Users/guilh/Desktop/chat-multicanal-ia/backend/src/routes/api.routes.ts).
* **Fila do BullMQ**: Lógica em [queue.ts](file:///c:/Users/guilh/Desktop/chat-multicanal-ia/backend/src/queue/queue.ts) ajustada para cadastrar novos contatos e mensagens recebidas por sessões QR Code, além do disparo automático da IA conversacional.
* **Webhooks**: Rota de webhook `/api/webhooks/evolution/:channelId` configurada para receber eventos em tempo real.

### 3. Ajuste de Infraestrutura Local (Docker)
* **Correção da Evolution API**: Identificamos que o container da Evolution API (`abravely-evolution-api`) estava reiniciando por falha de conexão com o Postgres (conflito de portas com containers antigos e parados do Chatwoot). Paramos os containers antigos e subimos com sucesso o banco e a Evolution API física na porta `8080`.
* **Sincronização de Credenciais**: Alteramos a chave de autenticação global no `.env` do `xatbot` e a definimos como `workly_secreto_global` para manter compatibilidade com o padrão do seu outro projeto da área de trabalho.

### 4. Frontend (Wizard de Canais)
* **Aba de Configuração**: Nova tela de gerenciamento de canais em [App.vue](file:///c:/Users/guilh/Desktop/chat-multicanal-ia/frontend/src/App.vue) que lista os canais salvos com badges de status de conexão e opção de exclusão.
* **Wizard passo-a-passo**: Modal intuitivo para criar canais escolhendo o provedor, preenchendo os dados (com a chave padrão preenchida automaticamente) e realizando o pareamento por QR Code.
* **Simulador integrado**: Botão **"Parear Sessão"** adicionado ao modal para permitir o teste visual imediato do painel simulando o escaneamento sem celular real.
* **Build de Produção**: Executamos o build do frontend e o TypeScript compilou com **zero erros**.

---

## 📋 O que vamos fazer em seguida (Próximos Passos)

1. **Testar Conexão Real**:
   * Abrir o Wizard, criar uma conexão do tipo QR Code preenchendo a chave padrão `workly_secreto_global`.
   * Ler o QR Code gerado usando um celular real e testar a troca de mensagens para validar o fluxo de webhook e IA.
2. **Configuração de Equipes/Departamentos**:
   * Criar uma nova tela/aba nas configurações no menu lateral para o gestor gerenciar equipes, cadastrar atendentes e vinculá-los a departamentos específicos (Suporte, Comercial, etc.).
3. **Restrição de Acesso por Cargo (Gestor vs. Atendente)**:
   * Implementar o controle de rotas/abas no menu lateral do frontend para que usuários com perfil de **Atendente** tenham acesso restrito apenas aos seus chats, respostas rápidas e arquivos, enquanto o painel completo de relatórios e canais permaneça exclusivo para o **Gestor/Admin**.
