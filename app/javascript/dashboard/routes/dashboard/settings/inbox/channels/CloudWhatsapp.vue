<script>
import { mapGetters } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { useAlert } from 'dashboard/composables';
import { required } from '@vuelidate/validators';
import router from '../../../../index';

import NextButton from 'dashboard/components-next/button/Button.vue';

export default {
  components: {
    NextButton,
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      inboxName: '',
      apiKey: '',
      phoneNumberId: '',
      verifyToken: 'abravely_verify_token',
      createdChannel: null,
      copiedWebhook: false,
      copiedToken: false,
    };
  },
  computed: {
    ...mapGetters({ uiFlags: 'inboxes/getUIFlags' }),
    webhookUrl() {
      const origin = window.location.origin;
      return `${origin}/api/v1/webhooks/whatsapp/meta`;
    },
  },
  validations: {
    inboxName: { required },
    apiKey: { required },
    phoneNumberId: { required },
  },
  methods: {
    copyText(text, type) {
      navigator.clipboard.writeText(text);
      if (type === 'webhook') {
        this.copiedWebhook = true;
        setTimeout(() => (this.copiedWebhook = false), 2000);
      } else {
        this.copiedToken = true;
        setTimeout(() => (this.copiedToken = false), 2000);
      }
    },
    async createChannel() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }

      try {
        const payload = {
          name: this.inboxName?.trim() || 'WhatsApp Meta Cloud API (Oficial)',
          metaPhoneNumberId: this.phoneNumberId,
          metaToken: this.apiKey,
        };

        const whatsappChannel = await this.$store.dispatch(
          'inboxes/createMetaChannel',
          payload
        );

        this.createdChannel = whatsappChannel;

        useAlert('Conexão oficial Meta Cloud API criada com sucesso!');

        setTimeout(() => {
          router.replace({
            name: 'settings_inbox_list',
          });
        }, 3000);
      } catch (error) {
        useAlert(
          error.message || this.$t('INBOX_MGMT.ADD.WHATSAPP.API.ERROR_MESSAGE')
        );
      }
    },
  },
};
</script>

<template>
  <div class="space-y-6">
    <!-- Caixa Informativa do Webhook/ngrok -->
    <div class="hidden">
      <div class="flex items-center gap-2 font-semibold text-n-brand text-base">
        <span class="i-lucide-webhook size-5 flex-shrink-0" />
        <span>Configuração do Webhook Oficial Meta (ngrok)</span>
      </div>
      <p class="text-sm text-n-slate-11">
        Para receber mensagens reais em tempo real, configure os dados abaixo no painel do <strong>Meta for Developers</strong> (em <em>WhatsApp > Configuração > Webhook</em>):
      </p>

      <div class="space-y-2 text-xs">
        <div>
          <label class="font-medium text-n-slate-11 block mb-1">URL de Callback (Webhook):</label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              readonly
              :value="webhookUrl"
              class="w-full bg-n-alpha-2 border border-n-slate-4 rounded-lg px-3 py-1.5 font-mono text-n-slate-12"
            />
            <button
              type="button"
              class="px-3 py-1.5 bg-n-brand text-white rounded-lg font-medium text-xs hover:opacity-90 transition-opacity flex-shrink-0"
              @click="copyText(webhookUrl, 'webhook')"
            >
              {{ copiedWebhook ? 'Copiado!' : 'Copiar URL' }}
            </button>
          </div>
        </div>

        <div>
          <label class="font-medium text-n-slate-11 block mb-1">Token de Verificação (Verify Token):</label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              readonly
              :value="verifyToken"
              class="w-full bg-n-alpha-2 border border-n-slate-4 rounded-lg px-3 py-1.5 font-mono text-n-slate-12"
            />
            <button
              type="button"
              class="px-3 py-1.5 bg-n-brand text-white rounded-lg font-medium text-xs hover:opacity-90 transition-opacity flex-shrink-0"
              @click="copyText(verifyToken, 'token')"
            >
              {{ copiedToken ? 'Copiado!' : 'Copiar Token' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulário de Cadastro da Conexão Meta -->
    <form
      class="flex flex-wrap flex-col mx-0 space-y-4 px-4 pb-4 md:px-5"
      @submit.prevent="createChannel()"
    >
      <div class="flex-shrink-0 flex-grow-0">
        <label :class="{ error: v$.inboxName.$error }" class="font-medium text-sm text-n-slate-12">
          {{ $t('INBOX_MGMT.ADD.WHATSAPP.INBOX_NAME.LABEL') }}
          <input
            v-model="inboxName"
            type="text"
            placeholder="Ex: WhatsApp Comercial Oficial"
            class="mt-1 w-full bg-n-alpha-2 border border-n-slate-4 rounded-lg px-3 py-2 text-n-slate-12"
            @blur="v$.inboxName.$touch"
          />
          <span v-if="v$.inboxName.$error" class="text-xs text-red-500 mt-1 block">
            {{ $t('INBOX_MGMT.ADD.WHATSAPP.INBOX_NAME.ERROR') }}
          </span>
        </label>
      </div>

      <div class="flex-shrink-0 flex-grow-0">
        <label :class="{ error: v$.phoneNumberId.$error }" class="font-medium text-sm text-n-slate-12">
          Phone Number ID (Meta Graph API):
          <input
            v-model="phoneNumberId"
            type="text"
            placeholder="Ex: 104829104812903"
            class="mt-1 w-full bg-n-alpha-2 border border-n-slate-4 rounded-lg px-3 py-2 text-n-slate-12"
            @blur="v$.phoneNumberId.$touch"
          />
          <span v-if="v$.phoneNumberId.$error" class="text-xs text-red-500 mt-1 block">
            O Phone Number ID gerado no painel da Meta é obrigatório.
          </span>
        </label>
      </div>

      <div class="flex-shrink-0 flex-grow-0">
        <label :class="{ error: v$.apiKey.$error }" class="font-medium text-sm text-n-slate-12">
          Token de Acesso Permanente (Permanent Access Token):
          <input
            v-model="apiKey"
            type="password"
            placeholder="Ex: EAA..."
            class="mt-1 w-full bg-n-alpha-2 border border-n-slate-4 rounded-lg px-3 py-2 text-n-slate-12 font-mono"
            @blur="v$.apiKey.$touch"
          />
          <span v-if="v$.apiKey.$error" class="text-xs text-red-500 mt-1 block">
            O Token de Acesso da Meta é obrigatório.
          </span>
        </label>
      </div>

      <div class="w-full mt-4">
        <NextButton
          :is-loading="uiFlags.isCreating"
          type="submit"
          solid
          blue
          label="Conectar Meta Cloud API Oficial"
        />
      </div>
    </form>
  </div>
</template>
