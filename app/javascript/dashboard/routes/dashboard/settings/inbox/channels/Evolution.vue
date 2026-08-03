<script>
import { mapGetters } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { useAlert } from 'dashboard/composables';
import { required } from '@vuelidate/validators';
import router from '../../../../index';
import NextButton from 'dashboard/components-next/button/Button.vue';

const shouldBeUrl = (value = '') =>
  value ? value.startsWith('http') : true;

export default {
  components: {
    NextButton,
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      channelName: '',
      phoneNumber: '',
      evolutionUrl: window.chatwootConfig?.evolutionUrl || 'http://localhost:8080',
      evolutionApiKey: window.chatwootConfig?.evolutionApiKey || 'workly_secreto_global',
      qrCode: '',
      connectionStatus: 'idle', // 'idle', 'creating', 'connecting', 'connected', 'error'
      errorMessage: '',
      inboxId: null,
      pollingInterval: null,
    };
  },
  computed: {
    ...mapGetters({
      uiFlags: 'inboxes/getUIFlags',
      currentUser: 'getCurrentUser',
      currentAccountId: 'getCurrentAccountId',
    }),
  },
  validations: {
    channelName: { required },
    phoneNumber: { required },
  },
  beforeDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  },
  methods: {
    async createChannel() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }

      this.connectionStatus = 'creating';
      this.errorMessage = '';

      try {
        const cleanPhone = this.phoneNumber.replace(/\D/g, '');
        
        // 1. Criar o Canal de API no Chatwoot
        const apiChannel = await this.$store.dispatch('inboxes/createChannel', {
          name: this.channelName?.trim(),
          channel: {
            type: 'api',
            webhook_url: `${this.evolutionUrl.replace(/\/$/, '')}/webhook/chatwoot/${cleanPhone}`,
          },
        });

        this.inboxId = apiChannel.id;
        const inboxIdentifier = apiChannel.inbox_identifier;
        const chatwootToken = this.currentUser?.access_token;

        // 2. Chamar a Evolution API para criar a instância
        const createUrl = `${this.evolutionUrl.replace(/\/$/, '')}/instance/create`;
        let instanceCreated = false;

        try {
          const createRes = await fetch(createUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.evolutionApiKey,
            },
            body: JSON.stringify({
              instanceName: cleanPhone,
              token: inboxIdentifier,
              qrcode: true,
              integration: 'WHATSAPP-BAILEYS',
            }),
          });

          if (createRes.ok || createRes.status === 400 || createRes.status === 403) {
            instanceCreated = true;
          } else {
            const errData = await createRes.json().catch(() => ({}));
            throw new Error(errData.message || 'Erro ao criar instância de conexão');
          }
        } catch (err) {
          throw new Error(`Falha ao conectar com o serviço de WhatsApp QR Code: ${err.message}`);
        }

        if (instanceCreated) {
          // Detectar e ajustar URL para rodar localmente no Docker se necessário
          const origin = window.location.origin;
          const cleanUrl = origin.includes('localhost') || origin.includes('127.0.0.1')
            ? origin.replace(/localhost|127\.0\.0\.1/, 'host.docker.internal')
            : origin;

          // 3. Configurar a integração do Chatwoot na Evolution API
          const setChatwootUrl = `${this.evolutionUrl.replace(/\/$/, '')}/chatwoot/set/${cleanPhone}`;
          const setRes = await fetch(setChatwootUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.evolutionApiKey,
            },
            body: JSON.stringify({
              enabled: true,
              url: cleanUrl,
              accountId: String(this.currentAccountId),
              token: chatwootToken,
              inboxId: this.inboxId,
              nameInbox: this.channelName?.trim(),
              signMsg: true,
              reopenConversation: true,
              conversationPending: true,
              importContacts: true,
              importMessages: true,
            }),
          });

          if (!setRes.ok) {
            const errData = await setRes.json().catch(() => ({}));
            const apiError = errData.response?.message
              ? (Array.isArray(errData.response.message) ? errData.response.message.join(', ') : errData.response.message)
              : (errData.message || 'Erro ao configurar a integração no WhatsApp');
            throw new Error(apiError);
          }

          // 4. Iniciar polling para obter o QR code e verificar conexão
          this.connectionStatus = 'connecting';
          await this.fetchQrCode();
          this.pollingInterval = setInterval(this.fetchQrCode, 5000);
        }
      } catch (error) {
        this.connectionStatus = 'error';
        this.errorMessage = error.message || 'Ocorreu um erro inesperado.';
        useAlert(this.errorMessage);
      }
    },
    async fetchQrCode() {
      try {
        const cleanPhone = this.phoneNumber.replace(/\D/g, '');
        const connectUrl = `${this.evolutionUrl.replace(/\/$/, '')}/instance/connect/${cleanPhone}`;
        const res = await fetch(connectUrl, {
          method: 'GET',
          headers: {
            'apikey': this.evolutionApiKey,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        
        if (data.base64) {
          this.qrCode = data.base64;
          this.connectionStatus = 'connecting';
        } else if (data.instance?.state === 'open' || data.status === 'open' || data.instance?.connectionStatus === 'CONNECTED') {
          this.connectionStatus = 'connected';
          this.qrCode = '';
          if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar QR code:', err);
      }
    },
    finishSetup() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
      
      router.replace({
        name: 'settings_inboxes_add_agents',
        params: {
          page: 'new',
          inbox_id: this.inboxId,
        },
      });
    },
  },
};
</script>

<template>
  <div class="evolution-container">
    <!-- Formulário inicial de Configuração -->
    <form v-if="connectionStatus === 'idle' || connectionStatus === 'error'" class="flex flex-wrap flex-col mx-0" @submit.prevent="createChannel()">
      <div class="flex-shrink-0 flex-grow-0">
        <label :class="{ error: v$.channelName.$error }">
          Nome da Caixa de Entrada
          <input
            v-model="channelName"
            type="text"
            placeholder="Ex: WhatsApp Suporte"
            @blur="v$.channelName.$touch"
          />
          <span v-if="v$.channelName.$error" class="message">
            O nome da caixa é obrigatório.
          </span>
        </label>
      </div>

      <div class="flex-shrink-0 flex-grow-0">
        <label :class="{ error: v$.phoneNumber.$error }">
          Número do WhatsApp (com DDI e DDD)
          <input
            v-model="phoneNumber"
            type="text"
            placeholder="Ex: 5511999999999"
            @blur="v$.phoneNumber.$touch"
          />
          <span v-if="v$.phoneNumber.$error" class="message">
            O número do WhatsApp é obrigatório.
          </span>
        </label>
      </div>

      <div class="w-full mt-4">
        <NextButton
          :is-loading="connectionStatus === 'creating'"
          type="submit"
          solid
          blue
          label="Criar Canal & Gerar QR Code"
        />
      </div>
    </form>

    <!-- Estado de Carregamento / Criação da Instância -->
    <div v-else-if="connectionStatus === 'creating'" class="flex flex-col items-center justify-center py-8">
      <span class="spinner mb-4"></span>
      <p class="text-sm text-n-slate-11">Criando canal no Chatwoot e gerando o QR Code...</p>
    </div>

    <!-- Tela de Leitura de QR Code -->
    <div v-else-if="connectionStatus === 'connecting'" class="flex flex-col items-center justify-center py-6 text-center">
      <h3 class="text-base font-semibold text-n-slate-12 mb-2">Escaneie o QR Code no seu WhatsApp</h3>
      <p class="text-sm text-n-slate-11 max-w-[80%] mb-6">
        Abra o WhatsApp no seu celular, vá em <strong>Aparelhos Conectados</strong> e escaneie o código abaixo.
      </p>

      <!-- Imagem do QR Code -->
      <div v-if="qrCode" class="qr-code-wrapper p-4 bg-white rounded-xl border border-n-weak shadow-md mb-6">
        <img :src="qrCode" alt="WhatsApp QR Code" class="size-64" />
      </div>
      <div v-else class="flex flex-col items-center justify-center size-64 bg-n-slate-2 rounded-xl border border-n-weak mb-6">
        <span class="spinner mb-2"></span>
        <p class="text-xs text-n-slate-10">Aguardando QR Code de pareamento...</p>
      </div>

      <div class="flex gap-2">
        <NextButton
          outline
          slate
          label="Voltar"
          @click="connectionStatus = 'idle'; qrCode = '';"
        />
        <NextButton
          solid
          teal
          label="Já escaneei / Avançar"
          @click="finishSetup"
        />
      </div>
    </div>

    <!-- Tela de Conectado com Sucesso -->
    <div v-else-if="connectionStatus === 'connected'" class="flex flex-col items-center justify-center py-8 text-center">
      <div class="size-16 bg-n-teal-2 text-n-teal-11 rounded-full flex items-center justify-center mb-4">
        <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-n-slate-12 mb-2">WhatsApp Conectado com Sucesso!</h3>
      <p class="text-sm text-n-slate-11 max-w-[80%] mb-8">
        Sua conta do WhatsApp foi pareada e está pronta para enviar e receber mensagens pelo Chatwoot.
      </p>

      <NextButton
        solid
        teal
        label="Concluir Configuração"
        @click="finishSetup"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.evolution-container {
  width: 100%;
}
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
