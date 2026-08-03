<template>
  <div v-show="show" class="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 md:p-6 text-left font-sans">
    <div v-if="conversation" class="bg-[#151718] border border-[#222526] rounded-2xl max-w-6xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden">
      
      <!-- Header do Modal -->
      <div class="p-4 border-b border-[#222526] flex items-center justify-between bg-[#1a1d1e]">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-[#0091ff] flex items-center justify-center font-bold text-white text-xs">
            {{ conversation.avatar }}
          </div>
          <div>
            <h2 class="text-base font-semibold text-white flex items-center gap-2">
              Atendimento: {{ conversation.customer }}
              <span class="text-[11px] bg-[#202425] border border-[#2e3335] text-[#a3a8ae] px-2 py-0.5 rounded font-normal">Encerrado</span>
            </h2>
            <p class="text-[12px] text-[#a3a8ae]">Duração: {{ conversation.duration }} | Data: {{ conversation.date }}</p>
          </div>
        </div>

        <button @click="$emit('close')" class="text-[#a3a8ae] hover:text-white p-1 rounded-lg hover:bg-[#202425] transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Conteúdo Principal (Grid de 2 Colunas) -->
      <div class="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#222526]">
        
        <!-- Coluna Esquerda: Transcrição Completa das Mensagens -->
        <div class="md:col-span-2 p-5 overflow-y-auto flex flex-col space-y-4 bg-[#111314] scrollbar-thin">
          <div class="flex items-center justify-between border-b border-[#222526] pb-2 mb-2">
            <span class="text-xs font-semibold text-[#a3a8ae] uppercase tracking-wider">Histórico de Mensagens</span>
            <span class="text-[11px] text-[#889096]">Responsável: {{ conversation.agent || conversation.assignedTo }}</span>
          </div>

          <div 
            v-for="(msg, idx) in conversation.messages" 
            :key="idx" 
            :class="['flex flex-col max-w-[80%]', msg.sender === 'customer' ? 'self-start' : 'self-end items-end']"
          >
            <div class="flex items-center gap-1.5 mb-1 text-[11px] text-[#a3a8ae]">
              <span class="font-semibold text-white">{{ msg.name }}</span>
              <span>• {{ msg.time }}</span>
            </div>
            <div 
              :class="[
                'px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm',
                msg.sender === 'customer' 
                  ? 'bg-[#202425] border border-[#2e3335] text-[#eceded] rounded-tl-none' 
                  : 'bg-[#0091ff] text-white rounded-tr-none'
              ]"
            >
              {{ msg.text }}
            </div>
          </div>
        </div>

        <!-- Coluna Direita: Análise de IA & Sentimento -->
        <div class="p-5 bg-[#151718] flex flex-col justify-between overflow-y-auto space-y-5">
          <div class="space-y-4">
            <div>
              <span class="text-xs font-semibold text-[#a3a8ae] uppercase tracking-wider block mb-2">Sentimento do Cliente</span>
              <span :class="['text-xs px-2.5 py-1 rounded-full border font-semibold inline-flex items-center gap-1.5', conversation.sentimentBadgeClass || 'bg-[#30a46c]/15 text-[#30a46c] border-[#30a46c]/30']">
                <span class="w-2 h-2 rounded-full bg-current"></span>
                {{ conversation.sentiment || 'Positivo' }} ({{ conversation.sentimentScore || '96%' }})
              </span>
            </div>

            <div class="space-y-1">
              <span class="text-xs font-semibold text-[#a3a8ae] uppercase tracking-wider block">Departamento & Motivo</span>
              <p class="text-[13px] text-white font-medium">{{ conversation.department || 'Geral' }}</p>
              <p class="text-[12px] text-[#a3a8ae]">{{ conversation.closureReason || 'Dúvida Sanada' }}</p>
            </div>

            <div class="space-y-2 border-t border-[#222526] pt-3">
              <span class="text-xs font-semibold text-white block flex items-center gap-1.5">
                <IconZap width="14" height="14" class="text-[#0091ff]" />
                Resumo Individual IA
              </span>
              <div class="p-3 bg-[#1a1d1e] border border-[#222526] rounded-xl text-[12.5px] text-[#eceded] leading-relaxed">
                {{ conversation.aiSummary }}
              </div>
            </div>
          </div>

          <!-- Botão de Gerar Resumo Individual com IA -->
          <div class="pt-3 border-t border-[#222526]">
            <button 
              @click="$emit('generate-summary', conversation)" 
              :disabled="isGeneratingSummary"
              class="w-full bg-[#0091ff] hover:bg-[#0081e0] disabled:opacity-50 text-white font-semibold text-[13px] py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <IconZap v-if="!isGeneratingSummary" width="15" height="15" />
              <svg v-else class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ isGeneratingSummary ? 'Gerando resumo com IA...' : 'Gerar resumo com IA' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconZap from '~icons/lucide/zap';

defineProps<{
  show: boolean;
  conversation: any;
  isGeneratingSummary: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'generate-summary', conversation: any): void;
}>();
</script>
