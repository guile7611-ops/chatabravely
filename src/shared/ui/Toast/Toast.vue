<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from '../Button/Button.vue'

withDefaults(defineProps<{
  open?: boolean
  message: string
  actionLabel?: string
  variant?: 'info' | 'success' | 'warning' | 'danger'
}>(), {
  open: false,
  variant: 'info'
})

const emit = defineEmits<{
  (e: 'action'): void
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-overlay)] text-xs text-[var(--text-primary)] max-w-md"
        role="status"
        aria-live="polite"
      >
        <Icon
          :icon="variant === 'success' ? 'lucide:check-circle' : (variant === 'danger' ? 'lucide:alert-octagon' : 'lucide:info')"
          class="text-base flex-shrink-0"
          :class="{
            'text-[var(--status-success)]': variant === 'success',
            'text-[var(--status-danger)]': variant === 'danger',
            'text-[var(--status-warning)]': variant === 'warning',
            'text-[var(--status-info)]': variant === 'info'
          }"
        />

        <span class="flex-1">{{ message }}</span>

        <Button v-if="actionLabel" variant="ghost" size="sm" @click="emit('action')">
          {{ actionLabel }}
        </Button>

        <button type="button" class="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer" @click="emit('close')" aria-label="Fechar notificação">
          <Icon icon="lucide:x" class="text-sm" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
