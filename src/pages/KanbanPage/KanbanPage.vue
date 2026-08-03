<script setup lang="ts">
import PageHeader from '../../layouts/PageHeader.vue'
import Card from '../../shared/ui/Card/Card.vue'
import Badge from '../../shared/ui/Badge/Badge.vue'
import Avatar from '../../shared/ui/Avatar/Avatar.vue'
import InlineAlert from '../../shared/ui/InlineAlert/InlineAlert.vue'

const kanbanColumns = [
  {
    id: 'open',
    title: 'Aberto / Fila',
    cards: [
      { id: 'k1', client: 'Carlos Eduardo', text: 'Pedido corporativo de 10 pizzas', time: '14:32', badge: 'Urgente' }
    ]
  },
  {
    id: 'in_progress',
    title: 'Em Atendimento',
    cards: [
      { id: 'k2', client: 'Mariana Souza', text: 'Dúvida sobre fatura pendente', time: '13:15', badge: 'Normal' }
    ]
  },
  {
    id: 'waiting',
    title: 'Aguardando Cliente',
    cards: [
      { id: 'k3', client: 'Lucas Oliveira', text: 'Aguardando envio do comprovante', time: '11:40', badge: 'Atenção' }
    ]
  },
  {
    id: 'resolved',
    title: 'Resolvido',
    cards: [
      { id: 'k4', client: 'Roberto Alves', text: 'Atendimento concluído com sucesso', time: 'Ontem', badge: 'Concluído' }
    ]
  }
]
</script>

<template>
  <div class="space-y-4">
    <PageHeader title="Kanban de Atendimentos" description="Visualização em colunas por estágios de fluxo (Referência Visual)." />

    <InlineAlert
      title="Modo de Demonstração Visual"
      message="As colunas do Kanban operam sobre dados determinísticos mockados. O drag-and-drop e a persistência real de dados dependem das fases de backend."
      variant="info"
    />

    <!-- Colunas Kanban -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="col in kanbanColumns"
        :key="col.id"
        class="bg-[var(--bg-subtle)] p-3 rounded-[var(--radius-md)] border border-[var(--border-default)] flex flex-col gap-3 min-h-[500px]"
      >
        <div class="flex items-center justify-between font-semibold text-xs text-[var(--text-primary)] border-b border-[var(--border-default)] pb-2">
          <span>{{ col.title }}</span>
          <span class="px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[10px] font-bold">
            {{ col.cards.length }}
          </span>
        </div>

        <div class="flex flex-col gap-2">
          <Card
            v-for="card in col.cards"
            :key="card.id"
            class="hover:border-[var(--border-strong)] transition-colors cursor-pointer"
          >
            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Avatar :name="card.client" size="sm" />
                  <span class="font-bold text-[var(--text-primary)]">{{ card.client }}</span>
                </div>
                <Badge variant="neutral">{{ card.badge }}</Badge>
              </div>

              <p class="text-[var(--text-secondary)]">{{ card.text }}</p>

              <div class="text-[10px] text-[var(--text-tertiary)] text-right">
                {{ card.time }}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
