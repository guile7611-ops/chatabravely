<script setup>
import { computed, reactive, watch } from 'vue';
import { required } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

import Input from 'dashboard/components-next/input/Input.vue';
import PhoneNumberInput from 'dashboard/components-next/phonenumberinput/PhoneNumberInput.vue';

const props = defineProps({
  contactData: { type: Object, default: null },
  isNewContact: { type: Boolean, default: false },
});

const emit = defineEmits(['update']);

const emptyState = () => ({
  id: null,
  name: '',
  phoneNumber: '',
  additionalAttributes: { companyName: '' },
});

const state = reactive(emptyState());
const rules = computed(() => ({
  name: { required },
  phoneNumber: { required },
}));
const v$ = useVuelidate(rules, state);
const isFormInvalid = computed(() => v$.value.$invalid);

const emitContactUpdate = async () => {
  if (!(await v$.value.$validate())) return;
  emit('update', {
    id: state.id,
    name: state.name.trim(),
    phoneNumber: state.phoneNumber,
    additionalAttributes: {
      companyName: state.additionalAttributes.companyName.trim(),
    },
  });
};

const resetValidation = () => v$.value.$reset();
const resetForm = () => {
  Object.assign(state, emptyState());
  resetValidation();
};

watch(
  () => props.contactData,
  contact => {
    if (props.isNewContact || !contact) return;
    Object.assign(state, {
      id: contact.id,
      name: contact.name || '',
      phoneNumber: contact.phoneNumber || '',
      additionalAttributes: {
        companyName: contact.additionalAttributes?.companyName || '',
      },
    });
  },
  { immediate: true, deep: true }
);

defineExpose({ state, resetValidation, isFormInvalid, resetForm });
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <Input
      v-model="state.name"
      label="Nome"
      placeholder="Nome do contato"
      :message-type="v$.name.$error ? 'error' : 'info'"
      @input="v$.name.$touch(); emitContactUpdate()"
      @blur="v$.name.$touch()"
    />
    <Input
      v-model="state.additionalAttributes.companyName"
      label="Empresa"
      placeholder="Empresa"
      @input="emitContactUpdate"
    />
    <PhoneNumberInput
      v-model="state.phoneNumber"
      label="Número de telefone"
      placeholder="Ex.: +55 11 99999-9999"
      :show-border="true"
      @input="v$.phoneNumber.$touch(); emitContactUpdate()"
      @blur="v$.phoneNumber.$touch()"
    />
  </div>
</template>
