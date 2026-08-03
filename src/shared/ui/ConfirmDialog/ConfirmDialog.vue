<script setup lang="ts">
import Dialog from '../Dialog/Dialog.vue'
import Button from '../Button/Button.vue'

withDefaults(defineProps<{
  open?: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
}>(), {
  open: false,
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  variant: 'primary'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Dialog :open="open" :title="title" @close="emit('cancel')">
    <p class="text-sm text-[var(--text-secondary)]">{{ message }}</p>

    <template #footer>
      <Button variant="secondary" size="sm" @click="emit('cancel')">
        {{ cancelLabel }}
      </Button>
      <Button :variant="variant" size="sm" @click="emit('confirm')">
        {{ confirmLabel }}
      </Button>
    </template>
  </Dialog>
</template>
