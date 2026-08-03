<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

export interface MenuItem {
  id: string
  label: string
  icon?: string
  danger?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  items: MenuItem[]
}>(), {})

const emit = defineEmits<{
  (e: 'select', item: MenuItem): void
}>()

const isOpen = ref(false)
const position = ref({ x: 0, y: 0 })

function openMenu(e: MouseEvent) {
  e.preventDefault()
  position.value = { x: e.clientX, y: e.clientY }
  isOpen.value = true
}

function closeMenu() {
  isOpen.value = false
}

function handleSelect(item: MenuItem) {
  if (!item.disabled) {
    emit('select', item)
    closeMenu()
  }
}

function handleOutsideClick(e: MouseEvent) {
  if (isOpen.value) {
    closeMenu()
  }
}

onMounted(() => window.addEventListener('click', handleOutsideClick))
onUnmounted(() => window.removeEventListener('click', handleOutsideClick))

defineExpose({
  openMenu,
  closeMenu
})
</script>

<template>
  <div class="contents" @contextmenu="openMenu">
    <slot />

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed z-50 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-overlay)] min-w-[160px] text-xs"
        :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      >
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          :disabled="item.disabled"
          class="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          :class="item.danger ? 'text-[var(--status-danger)] hover:bg-[var(--bg-subtle)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'"
          @click.stop="handleSelect(item)"
        >
          <Icon v-if="item.icon" :icon="item.icon" class="text-sm" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>
