# Plano de Implementação: Customização da IA (Capitão) e Gerenciamento de Marcadores

Este documento detalha o plano técnico para implementar a personalização da Inteligência Artificial (Chatbot Capitão) individualmente por canal de entrada e o gerenciamento dinâmico de marcadores na barra de informações do contato.

---

## 🛠️ Objetivos
1. **Configuração de IA por Canal**: Permitir que cada canal de atendimento (WhatsApp, Instagram, etc.) possua seu próprio Prompt de Sistema (instruções personalizadas) e modelo de IA (ex: GPT-4o, Gemini 1.5, Claude 3.5).
2. **Respostas Inteligentes Personalizadas**: Ajustar o processador do BullMQ (`queue.ts`) para injetar dinamicamente as instruções configuradas de cada canal ao invocar a API de IA.
3. **Gerenciador de Marcadores (Tags)**: Tornar a seção de Marcadores do painel direito funcional, permitindo adicionar novas tags com autocompletar e remover marcadores existentes em tempo real no banco de dados.

---

## 📋 Proposta de Alterações

### 1. Banco de Dados & Modelos (Backend)

#### [MODIFY] [schema.prisma](file:///c:/Users/guilh/Desktop/chat-multicanal-ia/backend/prisma/schema.prisma)
* Adicionar novos campos de configuração de IA no modelo `Inbox` (Caixa de Entrada / Canal):
  ```prisma
  model Inbox {
    id          String   @id @default(uuid())
    name        String
    // ... campos existentes ...
    aiEnabled   Boolean  @default(false)
    aiPrompt    String?  @db.Text // Instruções de comportamento e contexto para o chatbot
    aiModel     String   @default("gemini-1.5-flash") // Modelo selecionado (gpt-4o, gemini-1.5, claude-3-5)
    aiTemperature Float  @default(0.3) // Criatividade/Precisão do chatbot
  }
  ```

---

### 2. Rotas & Processamento de IA (Backend)

#### [MODIFY] [api.routes.ts](file:///c:/Users/guilh/Desktop/chat-multicanal-ia/backend/src/routes/api.routes.ts)
* Criar rotas para gerenciar as configurações da IA por Inbox:
  * `GET /api/inboxes/:id/ai-settings` - Retorna as configurações de prompt e modelo da IA daquela caixa de entrada.
  * `PATCH /api/inboxes/:id/ai-settings` - Atualiza o prompt, modelo de IA selecionado, temperatura e status de ativação.
* Criar rotas para vinculação de marcadores no contato:
  * `POST /api/contacts/:id/labels` - Adiciona uma tag ao contato.
  * `DELETE /api/contacts/:id/labels/:labelId` - Remove uma tag do contato.

#### [MODIFY] [queue.ts](file:///c:/Users/guilh/Desktop/chat-multicanal-ia/backend/src/queue/queue.ts)
* Atualizar o fluxo do worker do BullMQ que responde as mensagens automáticas:
  1. Ao receber a mensagem, buscar os campos `aiPrompt`, `aiModel` e `aiTemperature` configurados no `Inbox` associado à conversa.
  2. Substituir o prompt hardcoded de sistema atual pelas instruções do `aiPrompt` configurado no canal.
  3. Enviar a requisição para a API de IA apropriada de acordo com o `aiModel` selecionado (GPT-4o, Gemini 1.5 Pro/Flash, Claude 3.5 Sonnet).

---

### 3. Interface Visual & Configurações (Frontend)

#### [MODIFY] [App.vue](file:///c:/Users/guilh/Desktop/chat-multicanal-ia/frontend/src/App.vue)

##### **Painel de Configurações da IA (Configurações → IA Assistente)**:
* Criar uma nova sub-aba nas Configurações chamada **"IA Assistente"**.
* Exibir um painel para customização do Chatbot:
  * **Dropdown de Modelos**: Seleção de modelos (`Gemini 1.5 Flash`, `Gemini 1.5 Pro`, `GPT-4o`, `Claude 3.5 Sonnet`).
  * **Editor de Prompt (Instruções)**: Campo grande de texto (`textarea` premium) com exemplos úteis (ex: suporte técnico, vendas, triagem).
  * **Controles Deslizantes (Sliders)**: Ajuste fino de *Temperatura* (criatividade) e *Frequência de Penalidade*.
  * **Botão Testar**: Área interativa para simular uma conversa com a IA e testar o prompt antes de salvar.

##### **Gerenciamento de Marcadores (Sidebar Direita)**:
* Adicionar a possibilidade de clicar no `x` de cada etiqueta na área de Marcadores do contato para disparar a exclusão dinâmica via API.
* Adicionar um botão interativo **"+ Adicionar"** que abre um pequeno menu flutuante (dropdown) com as tags cadastradas no sistema e um campo de busca para adicionar novas de forma reativa.

---

## 🔬 Plano de Verificação

### Testes Manuais
1. **Configuração de IA por Canal**:
   * Acessar o menu **Configurações → IA Assistente**.
   * Definir um prompt específico de vendas (ex: *"Diga que vende carros e responda em tom animado"*), selecionar o modelo e clicar em Salvar.
2. **Validação do Chatbot**:
   * Simular o recebimento de uma mensagem de WhatsApp via webhook para a aba de Recepção.
   * Confirmar se a resposta automática segue o prompt de sistema configurado e utiliza o modelo correto.
3. **Gerenciador de Tags**:
   * Abrir a barra lateral direita de um contato, clicar no `x` de uma tag e validar se ela desaparece e é removida do banco de dados ao recarregar.
   * Adicionar uma nova tag e validar se ela é anexada ao contato na mesma hora.
