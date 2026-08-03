<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  applyTheme()
}

function setTheme(newTheme: Theme) {
  theme.value = newTheme
  applyTheme()
}

function applyTheme() {
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

onMounted(() => {
  applyTheme()
})

provide('theme', {
  theme,
  toggleTheme,
  setTheme
})
</script>

<template>
  <slot />
</template>
