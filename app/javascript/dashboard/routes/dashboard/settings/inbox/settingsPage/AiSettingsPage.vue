<script>
import { useAlert } from 'dashboard/composables';
import SettingsFieldSection from 'dashboard/components-next/Settings/SettingsFieldSection.vue';
import NextInput from 'dashboard/components-next/input/Input.vue';
import NextButton from 'dashboard/components-next/button/Button.vue';

export default {
  name: 'AiSettingsPage',
  components: {
    SettingsFieldSection,
    NextInput,
    NextButton,
  },
  props: {
    inbox: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      aiWebhookUrl: this.inbox.ai_webhook_url || '',
      aiToken: this.inbox.ai_token || '',
      isUpdating: false,
    };
  },
  watch: {
    'inbox.ai_webhook_url'(val) {
      this.aiWebhookUrl = val || '';
    },
    'inbox.ai_token'(val) {
      this.aiToken = val || '';
    },
  },
  methods: {
    async updateAiSettings() {
      this.isUpdating = true;
      try {
        await this.$store.dispatch('inboxes/updateInbox', {
          id: this.inbox.id,
          ai_webhook_url: this.aiWebhookUrl?.trim() || null,
          ai_token: this.aiToken?.trim() || null,
        });
        useAlert(this.$t('INBOX_MGMT.EDIT.API.SUCCESS_MESSAGE'));
      } catch (error) {
        useAlert(this.$t('INBOX_MGMT.EDIT.API.ERROR_MESSAGE'));
      } finally {
        this.isUpdating = false;
      }
    },
  },
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h3 class="text-lg font-semibold text-n-slate-12">Agente de IA</h3>
      <p class="text-sm text-n-slate-11">
        Configure um webhook e token para integrar um agente inteligente que responderá aos atendimentos automaticamente quando estiverem na aba "Recepção".
      </p>
    </div>

    <div class="flex flex-col gap-4">
      <NextInput
        v-model="aiWebhookUrl"
        label="URL do Webhook da IA"
        placeholder="https://exemplo.com/webhook-da-ia"
      />
      <NextInput
        v-model="aiToken"
        type="password"
        label="Token de Autenticação da IA"
        placeholder="Insira o Token Bearer de segurança"
      />
    </div>

    <div>
      <NextButton
        :is-loading="isUpdating"
        label="Salvar Configurações"
        @click="updateAiSettings"
      />
    </div>
  </div>
</template>
