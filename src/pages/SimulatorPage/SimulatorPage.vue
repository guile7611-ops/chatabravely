<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '../../layouts/PageHeader.vue'
import Card from '../../shared/ui/Card/Card.vue'
import InlineAlert from '../../shared/ui/InlineAlert/InlineAlert.vue'
import TextField from '../../shared/ui/TextField/TextField.vue'
import Button from '../../shared/ui/Button/Button.vue'
import MessageBubble from '../../shared/ui/Domain/MessageBubble.vue'

const selectedWorkspace = ref('Pizzaria Bella Napoli')
const simText = ref('')
const simMessages = ref([
  { id: 's1', content: 'Olá, gostaria de saber se vocês abrem aos domingos?', senderType: 'USER' as const, senderName: 'Cliente Simulado', createdAt: '15:00' },
  { id: 's2', content: 'Olá! Sim, funcionamos aos domingos das 18h às 23h.', senderType: 'AGENT' as const, senderName: 'IA / Atendente', createdAt: '15:01' }
])

function handleSendSimulated() {
  if (!simText.value) return
  simMessages.value.push({
    id: `s-${Date.now()}`,
    content: simText.value,
    senderType: 'USER',
    senderName: 'Cliente Simulado',
    createdAt: 'Agora'
  })
  simText.value = ''
}
</script>

<template>
  <div class="space-y-4 max-w-4xl mx-auto text-left">
    <PageHeader title="Simulador WhatsApp" description="Ambiente de testes visuais exclusivo para perfil Super Admin." />

    <InlineAlert
      title="Restrito para Super Admin"
      message="Este simulador permite testar visualmente a experiência do cliente sem conectar instâncias reais do WhatsApp ou disparar webhooks."
      variant="warning"
    />

    <Card title="Simulação Visual de Mensagens">
      <div class="space-y-3">
        <TextField v-model="selectedWorkspace" label="Empresa / Workspace Selecionado" readonly />

        <!-- Chat Simulado -->
        <div class="h-80 border border-[var(--border-default)] rounded-[var(--radius-sm)] p-4 bg-[var(--bg-canvas)] overflow-y-auto space-y-2">
          <MessageBubble
            v-for="msg in simMessages"
            :key="msg.id"
            :id="msg.id"
            :content="msg.content"
            :sender-type="msg.senderType"
            :sender-name="msg.senderName"
            :created-at="msg.createdAt"
          />
        </div>

        <div class="flex items-center gap-2">
          <TextField v-model="simText" placeholder="Digite uma mensagem como cliente..." class="flex-1" />
          <Button variant="primary" size="sm" @click="handleSendSimulated">Simular Envio</Button>
        </div>
      </div>
    </Card>
  </div>
</template>
