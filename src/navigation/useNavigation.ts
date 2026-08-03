import { ref, computed } from 'vue'
import type { ViewKey } from './types'
import { NAVIGATION_ITEMS } from './navigation.config'

const currentView = ref<ViewKey>('conversas')
const isSidebarOpen = ref(true)
const isSuperAdmin = ref(true) // Mock de papel Super Admin

export function useNavigation() {
  function navigateTo(key: ViewKey) {
    currentView.value = key
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  const visibleNavigationItems = computed(() => {
    return NAVIGATION_ITEMS.filter(item => {
      if (item.superAdminOnly && !isSuperAdmin.value) {
        return false
      }
      return true
    })
  })

  return {
    currentView,
    isSidebarOpen,
    isSuperAdmin,
    navigateTo,
    toggleSidebar,
    visibleNavigationItems
  }
}
