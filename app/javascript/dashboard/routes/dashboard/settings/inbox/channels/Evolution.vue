<script setup>
import { computed, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useStore, useMapGetter } from 'dashboard/composables/store';
import { useAlert } from 'dashboard/composables';
import { useRouter } from 'vue-router';
import Button from 'dashboard/components-next/button/Button.vue';

const store = useStore();
const router = useRouter();
const uiFlags = useMapGetter('inboxes/getUIFlags');

const name = ref('');
const instanceName = ref('');
const qrCode = ref('');
const errorMessage = ref('');

const rules = computed(() => ({
  name: { required },
  instanceName: { required },
}));
const v$ = useVuelidate(rules, { name, instanceName });

const connect = async () => {
  const valid = await v$.value.$validate();
  if (!valid) return;
  errorMessage.value = '';
  try {
    const result = await store.dispatch('inboxes/createEvolutionChannel', {
      name: name.value.trim(),
      instanceName: instanceName.value.trim(),
    });
    qrCode.value = result.qrCodeBase64 || '';
    if (!qrCode.value) {
      useAlert('Instância criada. Aguarde a conexão da Evolution Go.');
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Não foi possível gerar o QR Code.';
  }
};

const finish = () => router.replace({ name: 'settings_inbox_list' });
</script>

<template>
  <div class="flex flex-col gap-5 px-5 pb-5">
    <form v-if="!qrCode" class="flex flex-col gap-4 mx-0" @submit.prevent="connect">
      <label :class="{ error: v$.name.$error }">
        Nome do canal
        <input
          v-model="name"
          type="text"
          placeholder="Ex: WhatsApp Vendas"
          @blur="v$.name.$touch"
        />
      </label>
      <label :class="{ error: v$.instanceName.$error }">
        Nome da instância Evolution Go
        <input
          v-model="instanceName"
          type="text"
          placeholder="Ex: vendas"
          @blur="v$.instanceName.$touch"
        />
      </label>
      <div
        v-if="errorMessage"
        class="rounded-lg border border-n-ruby-5 bg-n-ruby-2 p-3 text-n-ruby-11"
      >
        {{ errorMessage }}
      </div>
      <Button
        type="submit"
        label="Gerar QR Code"
        :is-loading="uiFlags.isCreating"
        :disabled="uiFlags.isCreating"
      />
    </form>

    <div v-else class="flex flex-col items-center gap-4 py-6 text-center">
      <h3 class="text-heading-2 text-n-slate-12">Conecte o WhatsApp</h3>
      <p class="text-body-main text-n-slate-11">
        No WhatsApp, abra Aparelhos conectados e leia este QR Code.
      </p>
      <div class="rounded-xl bg-white p-4">
        <img :src="qrCode" alt="QR Code Evolution Go" class="size-64" />
      </div>
      <Button label="Concluir" @click="finish" />
    </div>
  </div>
</template>
