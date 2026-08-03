<script setup lang="ts">
import { provide } from 'vue'
import { useNavigation } from '../../navigation/useNavigation'

const nav = useNavigation()

provide('navigation', nav)
</script>

<template>
  <slot />
</template>
