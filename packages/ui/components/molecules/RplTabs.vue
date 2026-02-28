<script setup lang="ts">
import { ref, computed } from 'vue'

export interface RplTabItem {
  id: string
  label: string
}

export interface RplTabsProps {
  /** Tab definitions */
  tabs: RplTabItem[]
  /** ID of the initially active tab */
  modelValue?: string
}

const props = withDefaults(defineProps<RplTabsProps>(), {
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const firstTab = props.tabs[0] as RplTabItem | undefined
const internalActive = ref(props.modelValue || firstTab?.id || '')

const activeTab = computed((): string => {
  return props.modelValue || internalActive.value
})

function selectTab(id: string): void {
  internalActive.value = id
  emit('update:modelValue', id)
}

function handleKeydown(event: KeyboardEvent, index: number): void {
  const tabCount = props.tabs.length
  let newIndex: number

  if (event.key === 'ArrowRight') {
    newIndex = (index + 1) % tabCount
  } else if (event.key === 'ArrowLeft') {
    newIndex = (index - 1 + tabCount) % tabCount
  } else if (event.key === 'Home') {
    newIndex = 0
  } else if (event.key === 'End') {
    newIndex = tabCount - 1
  } else {
    return
  }

  event.preventDefault()
  const targetTab = props.tabs[newIndex] as RplTabItem | undefined
  if (!targetTab) return
  selectTab(targetTab.id)
  const tabEl = (event.currentTarget as HTMLElement)
    .parentElement?.parentElement?.querySelector(
      `[data-tab-index="${newIndex}"]`
    ) as HTMLElement | null
  tabEl?.focus()
}
</script>

<template>
  <div class="rpl-tabs">
    <div role="tablist" class="rpl-tabs__list" aria-label="Tabs">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        role="tab"
        type="button"
        :id="`rpl-tab-${tab.id}`"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`rpl-tabpanel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        :data-tab-index="index"
        :class="['rpl-tabs__tab', { 'rpl-tabs__tab--active': activeTab === tab.id }]"
        @click="selectTab(tab.id)"
        @keydown="handleKeydown($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="tab in tabs"
      :key="`panel-${tab.id}`"
      role="tabpanel"
      :id="`rpl-tabpanel-${tab.id}`"
      :aria-labelledby="`rpl-tab-${tab.id}`"
      :hidden="activeTab !== tab.id || undefined"
      class="rpl-tabs__panel"
    >
      <slot :name="tab.id" />
    </div>
  </div>
</template>

<style scoped>
.rpl-tabs {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-tabs__list {
  display: flex;
  border-bottom: 2px solid var(--rpl-clr-border, #ccc);
  gap: var(--rpl-sp-1, 0.25rem);
}

.rpl-tabs__tab {
  padding: var(--rpl-sp-3, 0.75rem) var(--rpl-sp-5, 1.25rem);
  font: inherit;
  font-size: var(--rpl-type-size-base, 1rem);
  font-weight: 600;
  color: var(--rpl-clr-text-light, #666);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.rpl-tabs__tab:hover {
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-tabs__tab--active {
  color: var(--rpl-clr-primary, #0052c2);
  border-bottom-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-tabs__tab:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: -2px;
  border-radius: var(--rpl-border-radius, 4px) var(--rpl-border-radius, 4px) 0 0;
}

.rpl-tabs__panel {
  padding: var(--rpl-sp-5, 1.25rem) 0;
}

.rpl-tabs__panel[hidden] {
  display: none;
}
</style>
