<script setup lang="ts">
import { inject } from 'vue'
import ThemeProvider from './app/providers/ThemeProvider.vue'
import NavigationProvider from './app/providers/NavigationProvider.vue'
import AppShell from './layouts/AppShell.vue'
import { useNavigation } from './navigation/useNavigation'

// Importação dos 7 Shells Visuais Homologados
import InboxPage from './pages/InboxPage/InboxPage.vue'
import KanbanPage from './pages/KanbanPage/KanbanPage.vue'
import ContactsPage from './pages/ContactsPage/ContactsPage.vue'
import ReportsPage from './pages/ReportsPage/ReportsPage.vue'
import HelpCenterPage from './pages/HelpCenterPage/HelpCenterPage.vue'
import SimulatorPage from './pages/SimulatorPage/SimulatorPage.vue'
import SettingsPage from './pages/SettingsPage/SettingsPage.vue'

const nav = useNavigation()
</script>

<template>
  <ThemeProvider>
    <NavigationProvider>
      <AppShell>
        <!-- Roteamento Reativo pelas 7 Views Homologadas -->
        <InboxPage v-if="nav.currentView.value === 'conversas'" />
        <KanbanPage v-else-if="nav.currentView.value === 'kanban'" />
        <ContactsPage v-else-if="nav.currentView.value === 'contatos'" />
        <ReportsPage v-else-if="nav.currentView.value === 'relatorios'" />
        <HelpCenterPage v-else-if="nav.currentView.value === 'ajuda'" />
        <SimulatorPage v-else-if="nav.currentView.value === 'simulador'" />
        <SettingsPage v-else-if="nav.currentView.value === 'configuracoes'" />
      </AppShell>
    </NavigationProvider>
  </ThemeProvider>
</template>
