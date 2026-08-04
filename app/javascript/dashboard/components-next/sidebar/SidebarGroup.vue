<script setup>
import { computed, onMounted, onUnmounted, watch, nextTick, ref } from 'vue';
import { useSidebarContext, usePopoverState } from './provider';
import { useRoute, useRouter } from 'vue-router';
import Policy from 'dashboard/components/policy.vue';
import Icon from 'next/icon/Icon.vue';
import SidebarGroupHeader from './SidebarGroupHeader.vue';
import SidebarGroupLeaf from './SidebarGroupLeaf.vue';
import SidebarSubGroup from './SidebarSubGroup.vue';
import SidebarGroupEmptyLeaf from './SidebarGroupEmptyLeaf.vue';
import SidebarCollapsedPopover from './SidebarCollapsedPopover.vue';

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: [String, Object, Function], default: null },
  to: { type: Object, default: null },
  activeOn: { type: Array, default: () => [] },
  children: { type: Array, default: undefined },
  getterKeys: { type: Object, default: () => ({}) },
});

const {
  expandedItem,
  isExpandedItem,
  setExpandedItem,
  resolvePath,
  resolvePermissions,
  resolveFeatureFlag,
  isAllowed,
  isCollapsed,
  isResizing,
} = useSidebarContext();

const {
  activePopover,
  setActivePopover,
  closeActivePopover,
  scheduleClose,
  cancelClose,
} = usePopoverState();

const navigableChildren = computed(() => {
  return props.children?.flatMap(child => child.children || child) || [];
});

const route = useRoute();
const router = useRouter();
const isExpanded = computed(() => {
  if (typeof isExpandedItem === 'function') {
    return isExpandedItem(props.name);
  }
  if (expandedItem?.value instanceof Set) {
    return expandedItem.value.has(props.name);
  }
  return expandedItem?.value === props.name;
});

const isExpandable = computed(
  () => Array.isArray(props.children) && props.children.length > 0
);
const hasChildren = computed(
  () => Array.isArray(props.children) && props.children.length > 0
);

// Use shared popover state - only one popover can be open at a time
const isPopoverOpen = computed(() => activePopover.value === props.name);
const triggerRef = ref(null);
const triggerRect = ref({ top: 0, left: 0, bottom: 0, right: 0 });
const isSortMenuOpen = ref(false);

const openPopover = () => {
  if (triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect();
    triggerRect.value = {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
    };
  }
  setActivePopover(props.name);
};

const closePopover = () => {
  if (activePopover.value === props.name) {
    closeActivePopover();
  }
};

const handleMouseEnter = () => {
  if (!hasChildren.value || isResizing.value) return;
  cancelClose();
  openPopover();
};

const handleMouseLeave = () => {
  if (!hasChildren.value || isSortMenuOpen.value) return;
  scheduleClose(200);
};

const handlePopoverMouseEnter = () => {
  cancelClose();
};

const handlePopoverMouseLeave = () => {
  if (isSortMenuOpen.value) return;
  scheduleClose(100);
};

const handleSortToggle = isOpen => {
  isSortMenuOpen.value = isOpen;
  cancelClose();
};

const handleWindowBlur = () => {
  closeActivePopover();
};

const hasAccessibleSubChildren = child => {
  return child.children?.some(
    subChild => subChild.to && isAllowed(subChild.to)
  );
};

const visibleChildren = computed(() => {
  if (!hasChildren.value) return [];

  return props.children.filter(child => {
    if (child.children) return hasAccessibleSubChildren(child);

    return child.to && isAllowed(child.to);
  });
});

const accessibleItems = computed(() => {
  if (!hasChildren.value) return [];

  return visibleChildren.value
    .flatMap(child => child.children || child)
    .filter(child => child.to && isAllowed(child.to));
});

const hasAccessibleChildren = computed(() => {
  return visibleChildren.value.length > 0;
});

const isLastVisibleChild = child => {
  const lastChild = visibleChildren.value[visibleChildren.value.length - 1];
  return lastChild === child;
};

const isActive = computed(() => {
  if (props.to) {
    if (route.path === resolvePath(props.to)) return true;

    return props.activeOn.includes(route.name);
  }

  return false;
});

const activeChild = computed(() => {
  const pathSame = navigableChildren.value.find(
    child => child.to && route.path === resolvePath(child.to)
  );
  if (pathSame) return pathSame;

  const activeOnPages = navigableChildren.value.filter(child =>
    child.activeOn?.includes(route.name)
  );

  if (activeOnPages.length > 0) {
    const rankedPage = activeOnPages.find(child => {
      if (!child.to || typeof child.to !== 'object' || !child.to.params) return true;
      return Object.keys(child.to.params)
        .map(key => {
          return String(child.to.params[key]) === String(route.params[key]);
        })
        .every(match => match);
    });

    return rankedPage ?? activeOnPages[0];
  }

  return navigableChildren.value.find(child => {
    if (!child.to) return false;
    const childPath = resolvePath(child.to);
    return route.path === childPath || route.path.startsWith(`${childPath}/`);
  });
});

const hasActiveChild = computed(() => {
  return activeChild.value !== undefined;
});

const handleCollapsedClick = () => {
  if (hasChildren.value && hasAccessibleChildren.value) {
    const firstItem = accessibleItems.value[0];
    if (firstItem?.to) {
      router.push(firstItem.to);
    }
  }
};

const toggleTrigger = () => {
  setExpandedItem(props.name);
};

onMounted(async () => {
  await nextTick();
  if (hasActiveChild.value) {
    setExpandedItem(props.name);
  }
  window.addEventListener('blur', handleWindowBlur);
  document.addEventListener('mouseleave', handleWindowBlur);
});

onUnmounted(() => {
  window.removeEventListener('blur', handleWindowBlur);
  document.removeEventListener('mouseleave', handleWindowBlur);
});

watch(
  hasActiveChild,
  hasNewActiveChild => {
    if (hasNewActiveChild && !isExpanded.value) {
      setExpandedItem(props.name);
    }
  },
  { once: true }
);
</script>

<template>
  <Policy
    v-if="!hasChildren || hasAccessibleChildren"
    :permissions="resolvePermissions(to)"
    :feature-flag="resolveFeatureFlag(to)"
    as="li"
    class="list-none group/sidebar-group relative text-n-slate-12 min-w-0"
  >
    <div ref="triggerRef">
      <!-- Collapsed Group Item with Popover Trigger -->
      <button
        v-if="isCollapsed"
        class="w-full flex items-center justify-center p-2 rounded-xl text-n-slate-11 hover:text-n-slate-12 hover:bg-n-alpha-2 transition-colors relative group/collapsed min-w-0"
        :class="{
          '!text-n-slate-12 bg-n-alpha-2 font-medium':
            isActive || hasActiveChild,
        }"
        @click="handleCollapsedClick"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <Icon v-if="icon" :icon="icon" class="size-5" />
        <span
          v-if="hasActiveChild && !isActive"
          class="absolute top-1.5 right-1.5 size-2 rounded-full bg-n-brand"
        />
      </button>

      <!-- Expanded Group Item -->
      <template v-else>
        <SidebarGroupHeader
          v-bind="{
            to,
            label,
            icon,
            isExpanded,
            isActive,
            hasActiveChild,
            getterKeys,
            expandable: isExpandable,
          }"
          @toggle="toggleTrigger"
        />
        <ul
          v-if="hasChildren"
          v-show="isExpanded"
          class="m-0 py-0.5 list-none reset-base relative flex flex-col group min-w-0"
        >
          <template v-if="visibleChildren.length > 0">
            <template v-for="child in visibleChildren" :key="child.name">
              <SidebarSubGroup
                v-if="child.children"
                v-bind="child"
                :is-expanded="isExpanded"
                :active-child="activeChild"
                :show-tree-line="visibleChildren.length > 1"
                :end-tree-line="isLastVisibleChild(child)"
              />
              <SidebarGroupLeaf
                v-else
                v-bind="child"
                :active="activeChild?.name === child.name"
                :hide-tree-line="visibleChildren.length === 1"
              />
            </template>
          </template>
          <SidebarGroupEmptyLeaf v-else />
        </ul>
      </template>
    </div>

    <!-- Popover for Collapsed Mode (Only for groups with children) -->
    <SidebarCollapsedPopover
      v-if="isCollapsed && hasChildren && isPopoverOpen"
      :group-name="name"
      :label="label"
      :children="visibleChildren"
      :active-child="activeChild"
      :trigger-rect="triggerRect"
      @mouseenter="handlePopoverMouseEnter"
      @mouseleave="handlePopoverMouseLeave"
      @sort-toggle="handleSortToggle"
    />
  </Policy>
</template>
