<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans antialiased">
    <!-- Sidebar Estrutural Estreita à Esquerda (#1c1d21) -->
    <Sidebar />

    <!-- Área Principal (#141517) -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--bg-canvas)]">
      <!-- Topbar Header Identica à Imagem 1 -->
      <Header />

      <!-- Container das Views sem padding externo extra -->
      <main class="flex-1 overflow-y-auto text-left bg-[var(--bg-canvas)]">
        <slot />
      </main>
    </div>
  </div>
</template>
