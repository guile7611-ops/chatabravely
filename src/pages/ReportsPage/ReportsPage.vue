<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Badge from '../../shared/ui/Badge/Badge.vue'
import Button from '../../shared/ui/Button/Button.vue'
</script>

<template>
  <div class="space-y-4 text-left">
    <!-- Título da Seção -->
    <h2 class="text-base font-bold text-[var(--text-primary)] tracking-tight">Visão geral</h2>

    <!-- Grid de Métricas 1 (Conversas Abertas & Status do Agente - Imagem 3) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Card: Conversas Abertas -->
      <div class="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-xs font-bold text-[var(--text-primary)]">Conversas Abertas</h3>
            <span class="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-800/40">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Em tempo real
            </span>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 pt-2 text-left">
          <div>
            <p class="text-[10px] text-[var(--text-tertiary)]">Abertas</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">0</p>
          </div>
          <div>
            <p class="text-[10px] text-[var(--text-tertiary)]">Não atendidas</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">0</p>
          </div>
          <div>
            <p class="text-[10px] text-[var(--text-tertiary)]">Não atribuídas</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">0</p>
          </div>
          <div>
            <p class="text-[10px] text-[var(--text-tertiary)]">Pendentes</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">0</p>
          </div>
        </div>
      </div>

      <!-- Card: Status do Agente -->
      <div class="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-xs font-bold text-[var(--text-primary)]">Status do agente</h3>
            <span class="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-800/40">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Em tempo real
            </span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 pt-2 text-left">
          <div>
            <p class="text-[10px] text-[var(--text-tertiary)]">Disponível</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">1</p>
          </div>
          <div>
            <p class="text-[10px] text-[var(--text-tertiary)]">Ocupado</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">0</p>
          </div>
          <div>
            <p class="text-[10px] text-[var(--text-tertiary)]">Desconectado</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">0</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Card: Tráfego de conversa (Imagem 3) -->
    <div class="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h3 class="text-xs font-bold text-[var(--text-primary)]">Tráfego de conversa</h3>
          <span class="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-800/40">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Em tempo real
          </span>
        </div>

        <div class="flex items-center gap-2">
          <select class="bg-[#23252b] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] rounded-[var(--radius-sm)] px-2.5 py-1 focus:outline-none">
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
          </select>

          <select class="bg-[#23252b] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] rounded-[var(--radius-sm)] px-2.5 py-1 focus:outline-none">
            <option>Todas as caixas de entrada</option>
          </select>

          <button type="button" class="p-1.5 bg-[#23252b] border border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-white rounded-[var(--radius-sm)] cursor-pointer">
            <Icon icon="lucide:download" class="text-xs" />
          </button>
        </div>
      </div>

      <!-- Gráfico de Calor / Heatmap Demonstrativo (Imagem 3) -->
      <div class="pt-4 border-t border-[var(--border-default)] min-h-[140px] flex items-center justify-center text-xs text-[var(--text-tertiary)]">
        Gráfico de distribuição temporal de tráfego por dia e hora (7 dias)
      </div>
    </div>

    <!-- Card: Resoluções (Imagem 3) -->
    <div class="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h3 class="text-xs font-bold text-[var(--text-primary)]">Resoluções</h3>
          <span class="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-800/40">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Em tempo real
          </span>
        </div>

        <div class="flex items-center gap-2">
          <select class="bg-[#23252b] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] rounded-[var(--radius-sm)] px-2.5 py-1 focus:outline-none">
            <option>Últimos 7 dias</option>
          </select>

          <select class="bg-[#23252b] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] rounded-[var(--radius-sm)] px-2.5 py-1 focus:outline-none">
            <option>Todas as caixas de entrada</option>
          </select>

          <button type="button" class="p-1.5 bg-[#23252b] border border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-white rounded-[var(--radius-sm)] cursor-pointer">
            <Icon icon="lucide:download" class="text-xs" />
          </button>
        </div>
      </div>

      <div class="pt-4 border-t border-[var(--border-default)] min-h-[140px] flex items-center justify-center text-xs text-[var(--text-tertiary)]">
        Métricas de tempo de primeira resposta e tempo médio de resolução
      </div>
    </div>
  </div>
</template>
