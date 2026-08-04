<script setup>
import { ref, computed } from 'vue';
import { useStoreGetters } from 'dashboard/composables/store';
import NextButton from 'dashboard/components-next/button/Button.vue';

const getters = useStoreGetters();
const currentUser = computed(() => getters.getCurrentUser.value || {});

const copiedWebhook = ref(false);
const copiedToken = ref(false);

const ngrokUrl = 'https://statedly-uncommiserated-rosaura.ngrok-free.dev';
const webhookUrl = computed(() => `${ngrokUrl}/api/v1/webhooks/whatsapp/meta`);
const verifyToken = 'abravely_verify_token';

const copyText = (text, type) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
  if (type === 'webhook') {
    copiedWebhook.value = true;
    setTimeout(() => (copiedWebhook.value = false), 2000);
  } else {
    copiedToken.value = true;
    setTimeout(() => (copiedToken.value = false), 2000);
  }
};
</script>

<template>
  <div class="min-h-screen max-w-5xl mx-auto p-6 md:p-8 w-full font-inter space-y-6 overflow-auto">
    <!-- Header Abravely Chat -->
    <div class="flex items-center justify-between p-6 rounded-2xl bg-n-solid-2 border border-n-weak/30 shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⚡</span>
          <h1 class="text-2xl font-bold text-n-slate-12 tracking-tight">
            Abravely Chat
          </h1>
        </div>
        <p class="text-n-slate-11 text-sm md:text-base">
          Bem-vindo, <span class="font-semibold text-n-slate-12">{{ currentUser.name || 'Guilherme Tenorio' }}</span>! Gerencie seus canais WhatsApp e atendimentos em tempo real.
        </p>
      </div>
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-n-brand/10 border border-n-brand/20 text-n-brand text-xs font-semibold">
        <span class="w-2 h-2 rounded-full bg-n-brand animate-pulse"></span>
        Plataforma Ativa
      </div>
    </div>

    <!-- Caixa de Configuração do Webhook Oficial Meta (ngrok) -->
    <div class="hidden">
      <div class="flex items-center gap-2 font-bold text-n-brand text-lg">
        <span class="i-lucide-webhook size-5 flex-shrink-0" />
        <span>Configuração do Webhook Oficial Meta (ngrok)</span>
      </div>

      <p class="text-sm text-n-slate-11 leading-relaxed">
        Para receber mensagens reais em tempo real, configure os dados abaixo no painel do
        <strong class="text-n-slate-12">Meta for Developers</strong> (em <em class="not-italic font-semibold text-n-brand">WhatsApp &gt; Configuração &gt; Webhook</em>):
      </p>

      <div class="space-y-4">
        <!-- URL de Callback -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-n-slate-11 uppercase tracking-wider">
            URL de Callback (Webhook):
          </label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              readonly
              :value="webhookUrl"
              class="w-full px-3.5 py-2.5 rounded-lg border border-n-weak bg-n-solid-1 text-sm text-n-slate-12 font-mono focus:outline-none select-all"
            />
            <NextButton
              type="button"
              color="blue"
              size="medium"
              class="flex-shrink-0 font-medium"
              @click="copyText(webhookUrl, 'webhook')"
            >
              {{ copiedWebhook ? 'Copiado!' : 'Copiar URL' }}
            </NextButton>
          </div>
        </div>

        <!-- Token de Verificação -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-n-slate-11 uppercase tracking-wider">
            Token de Verificação (Verify Token):
          </label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              readonly
              :value="verifyToken"
              class="w-full px-3.5 py-2.5 rounded-lg border border-n-weak bg-n-solid-1 text-sm text-n-slate-12 font-mono focus:outline-none select-all"
            />
            <NextButton
              type="button"
              color="blue"
              size="medium"
              class="flex-shrink-0 font-medium"
              @click="copyText(verifyToken, 'token')"
            >
              {{ copiedToken ? 'Copiado!' : 'Copiar Token' }}
            </NextButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards de Ações Rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <router-link
        :to="{ name: 'settings_inboxes_new_cloud_whatsapp' }"
        class="p-5 rounded-xl border border-n-weak/40 bg-n-solid-2 hover:border-n-brand transition-all flex flex-col justify-between space-y-3 group"
      >
        <div class="space-y-2">
          <div class="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center font-bold text-xl">
            💬
          </div>
          <h3 class="font-bold text-n-slate-12 group-hover:text-n-brand transition-colors">
            WhatsApp API Oficial
          </h3>
          <p class="text-xs text-n-slate-11 leading-relaxed">
            Conectar conta de WhatsApp Cloud API Oficial da Meta via Graph API com Webhook.
          </p>
        </div>
        <span class="text-xs font-semibold text-n-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Configurar Conexão &rarr;
        </span>
      </router-link>

      <router-link
        :to="{ name: 'settings_inbox_new' }"
        class="p-5 rounded-xl border border-n-weak/40 bg-n-solid-2 hover:border-n-brand transition-all flex flex-col justify-between space-y-3 group"
      >
        <div class="space-y-2">
          <div class="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xl">
            📱
          </div>
          <h3 class="font-bold text-n-slate-12 group-hover:text-n-brand transition-colors">
            WhatsApp QR Code
          </h3>
          <p class="text-xs text-n-slate-11 leading-relaxed">
            Conectar número WhatsApp via escaneamento de QR Code (Evolution API GO).
          </p>
        </div>
        <span class="text-xs font-semibold text-n-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Escanear QR Code &rarr;
        </span>
      </router-link>

      <router-link
        :to="{ name: 'conversation_unattended' }"
        class="p-5 rounded-xl border border-n-weak/40 bg-n-solid-2 hover:border-n-brand transition-all flex flex-col justify-between space-y-3 group"
      >
        <div class="space-y-2">
          <div class="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xl">
            📥
          </div>
          <h3 class="font-bold text-n-slate-12 group-hover:text-n-brand transition-colors">
            Central de Recepção
          </h3>
          <p class="text-xs text-n-slate-11 leading-relaxed">
            Visualizar e triar todas as novas mensagens recebidas em tempo real.
          </p>
        </div>
        <span class="text-xs font-semibold text-n-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Ver Atendimentos &rarr;
        </span>
      </router-link>
    </div>
  </div>
</template>
