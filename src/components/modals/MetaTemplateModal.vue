<template>
  <div v-if="show" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-6 text-left font-sans backdrop-blur-xs">
    <div class="bg-[#151718] border border-[#222526] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      
      <!-- Header do Modal -->
      <div class="p-4 border-b border-[#222526] flex items-center justify-between bg-[#1a1d1e]">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#0091ff]/15 border border-[#0091ff]/30 text-[#0091ff] flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-semibold text-white flex items-center gap-2">
              Enviar Template Meta (HSM)
              <span class="text-[10px] bg-[#30a46c]/15 text-[#30a46c] border border-[#30a46c]/30 px-2 py-0.5 rounded-full font-medium">Meta Cloud API</span>
            </h2>
            <p class="text-[12px] text-[#a3a8ae]">Destinatário: <strong class="text-white">{{ contactName }}</strong> ({{ contactPhone || 'Sem número' }})</p>
          </div>
        </div>

        <button @click="$emit('close')" class="text-[#a3a8ae] hover:text-white p-1.5 rounded-lg hover:bg-[#202425] transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Corpo do Modal -->
      <div class="flex-1 p-5 overflow-y-auto space-y-5 bg-[#111314]">
        <!-- Indicador de Carregamento dos Templates -->
        <div v-if="isLoadingTemplates" class="py-12 flex flex-col items-center justify-center space-y-3 text-[#a3a8ae]">
          <svg class="animate-spin h-6 w-6 text-[#0091ff]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs">Buscando templates aprovados na Meta Graph API...</span>
        </div>

        <template v-else>
          <!-- Seleção de Template -->
          <div class="space-y-1.5">
            <label class="text-[12px] font-medium text-white flex items-center justify-between">
              <span>Selecione o Template Aprovado</span>
              <span class="text-[11px] text-[#a3a8ae] font-normal">{{ templates.length }} modelo(s) disponível(is)</span>
            </label>
            <select 
              v-model="selectedTemplateId" 
              @change="onSelectTemplate"
              class="w-full bg-[#1a1d1e] border border-[#222526] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0091ff] transition-all"
            >
              <option v-for="tpl in templates" :key="tpl.id || tpl.name" :value="tpl.id || tpl.name">
                {{ tpl.name }} ({{ tpl.category || 'UTILITY' }}) - {{ tpl.language || 'pt_BR' }}
              </option>
            </select>
          </div>

          <!-- Campos Dinâmicos para Parâmetros/Variáveis -->
          <div v-if="paramFields.length > 0" class="p-4 bg-[#1a1d1e] border border-[#222526] rounded-xl space-y-3">
            <span class="text-[12px] font-semibold text-white block">Preencher Parâmetros do Template</span>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="(field, idx) in paramFields" :key="idx" class="space-y-1">
                <label class="text-[11px] text-[#a3a8ae] font-medium">Variável \{\{\ {{ idx + 1 }}\ \}\}</label>
                <input 
                  v-model="paramValues[idx]" 
                  type="text" 
                  :placeholder="`Valor para {{${idx + 1}}}`"
                  class="w-full bg-[#151718] border border-[#222526] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0091ff]"
                />
              </div>
            </div>
          </div>

          <!-- Pré-visualização do Balão de WhatsApp -->
          <div class="space-y-1.5">
            <span class="text-[12px] font-medium text-[#a3a8ae]">Pré-visualização do WhatsApp</span>
            <div class="p-4 bg-[#0b141a] border border-[#222526] rounded-2xl flex justify-start">
              <div class="bg-[#202c33] text-[#e9edef] rounded-2xl rounded-tl-none p-3.5 max-w-sm space-y-2 border border-[#233138] shadow-md text-xs">
                <!-- Header -->
                <div v-if="previewHeader" class="font-bold text-white text-[13px] border-b border-[#233138] pb-1">
                  {{ previewHeader }}
                </div>
                <!-- Body com substituição -->
                <div class="whitespace-pre-wrap leading-relaxed text-[12.5px]">
                  {{ formattedBodyText }}
                </div>
                <!-- Footer -->
                <div v-if="previewFooter" class="text-[10px] text-[#8696a0]">
                  {{ previewFooter }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer / Ações -->
      <div class="p-4 border-t border-[#222526] bg-[#1a1d1e] flex items-center justify-end gap-3">
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 text-xs text-[#a3a8ae] hover:text-white font-medium hover:bg-[#202425] rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button 
          @click="handleSendTemplate"
          :disabled="isSending || !selectedTemplate"
          class="px-5 py-2.5 bg-[#0091ff] hover:bg-[#0081e0] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#0091ff]/10"
        >
          <svg v-if="isSending" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSending ? 'Enviando...' : 'Enviar Template (HSM)' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getApiUrl } from '../../config/api';

const props = defineProps<{
  show: boolean;
  channelId: string | null;
  conversationId: string | null;
  contactName: string;
  contactPhone: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'sent'): void;
}>();

const isLoadingTemplates = ref(false);
const isSending = ref(false);
const templates = ref<any[]>([]);
const selectedTemplateId = ref('');
const selectedTemplate = ref<any>(null);
const paramValues = ref<string[]>([]);

// Carregar templates ao abrir a modal
watch(() => props.show, async (newVal) => {
  if (newVal && props.channelId) {
    await fetchChannelTemplates();
  }
});

async function fetchChannelTemplates() {
  if (!props.channelId) return;
  isLoadingTemplates.value = true;
  try {
    const res = await fetch(getApiUrl(`/api/v1/channels/${props.channelId}/templates`), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.templates)) {
      templates.value = data.templates;
      if (templates.value.length > 0) {
        selectedTemplateId.value = templates.value[0].id || templates.value[0].name;
        onSelectTemplate();
      }
    }
  } catch (err) {
    console.error('Erro ao buscar templates HSM:', err);
  } finally {
    isLoadingTemplates.value = false;
  }
}

function onSelectTemplate() {
  const found = templates.value.find(t => (t.id || t.name) === selectedTemplateId.value);
  selectedTemplate.value = found || null;
  
  // Resetar parâmetros e auto-preencher {{1}} com nome do contato se houver
  const count = getPlaceholderCount();
  const initialParams = new Array(count).fill('');
  if (initialParams.length > 0 && props.contactName) {
    initialParams[0] = props.contactName;
  }
  paramValues.value = initialParams;
}

function getPlaceholderCount(): number {
  if (!selectedTemplate.value) return 0;
  const bodyComp = selectedTemplate.value.components?.find((c: any) => c.type === 'BODY');
  if (!bodyComp?.text) return 0;
  const matches = bodyComp.text.match(/\{\{\d+\}\}/g);
  return matches ? matches.length : 0;
}

const paramFields = computed(() => {
  const count = getPlaceholderCount();
  return Array.from({ length: count }, (_, i) => i);
});

const previewHeader = computed(() => {
  if (!selectedTemplate.value) return '';
  const headerComp = selectedTemplate.value.components?.find((c: any) => c.type === 'HEADER');
  return headerComp?.text || '';
});

const previewFooter = computed(() => {
  if (!selectedTemplate.value) return '';
  const footerComp = selectedTemplate.value.components?.find((c: any) => c.type === 'FOOTER');
  return footerComp?.text || '';
});

const formattedBodyText = computed(() => {
  if (!selectedTemplate.value) return '';
  const bodyComp = selectedTemplate.value.components?.find((c: any) => c.type === 'BODY');
  let text = bodyComp?.text || '';
  paramValues.value.forEach((val, idx) => {
    const placeholder = `{{${idx + 1}}}`;
    const replacement = val.trim() ? val.trim() : placeholder;
    text = text.replace(new RegExp(placeholder.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'), replacement);
  });
  return text;
});

async function handleSendTemplate() {
  if (!selectedTemplate.value || !props.conversationId) return;
  isSending.value = true;
  try {
    const res = await fetch(getApiUrl(`/api/v1/conversations/${props.conversationId}/send-template`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({
        templateName: selectedTemplate.value.name,
        languageCode: selectedTemplate.value.language || 'pt_BR',
        parameters: paramValues.value,
        templateText: formattedBodyText.value
      })
    });
    const data = await res.json();
    if (data.success) {
      emit('sent');
      emit('close');
    } else {
      alert(data.message || 'Erro ao enviar template');
    }
  } catch (err: any) {
    alert('Erro de conexão ao enviar template.');
  } finally {
    isSending.value = false;
  }
}
</script>
