<script setup lang="ts">
import { ref, watch } from 'vue'

export interface RplVerticalNavItem {
  /** Unique identifier */
  id: string
  /** Display text */
  text: string
  /** Link URL */
  url: string
  /** Whether this item is the current/active page */
  active?: boolean
  /** Nested child items */
  items?: RplVerticalNavItem[]
}

export interface RplVerticalNavProps {
  /** Optional heading above the navigation */
  title?: string
  /** Navigation items (supports nesting) */
  items: RplVerticalNavItem[]
  /** Number of nesting levels that are expandable/collapsible */
  toggleLevels?: number
}

const props = withDefaults(defineProps<RplVerticalNavProps>(), {
  title: undefined,
  toggleLevels: 1
})

const emit = defineEmits<{
  navigate: [item: RplVerticalNavItem]
  toggle: [item: RplVerticalNavItem, expanded: boolean]
}>()

const expandedIds = ref<Set<string>>(new Set())

function findActiveParentChain(
  items: RplVerticalNavItem[],
  ancestors: string[] = []
): string[] | null {
  for (const item of items) {
    if (item.active) {
      return ancestors
    }
    if (item.items?.length) {
      const found = findActiveParentChain(item.items, [...ancestors, item.id])
      if (found) return found
    }
  }
  return null
}

function initExpandedState() {
  const chain = findActiveParentChain(props.items)
  if (chain) {
    expandedIds.value = new Set(chain)
  }
}

initExpandedState()

watch(() => props.items, initExpandedState, { deep: true })

function isExpanded(id: string): boolean {
  return expandedIds.value.has(id)
}

function toggleItem(item: RplVerticalNavItem) {
  const next = new Set(expandedIds.value)
  const willExpand = !next.has(item.id)
  if (willExpand) {
    next.add(item.id)
  } else {
    next.delete(item.id)
  }
  expandedIds.value = next
  emit('toggle', item, willExpand)
}

function handleNavigate(item: RplVerticalNavItem, event: MouseEvent) {
  emit('navigate', item)
  // Allow default link behaviour unless consumer calls preventDefault
  void event
}

function isToggleable(level: number): boolean {
  return level <= props.toggleLevels
}
</script>

<template>
  <nav class="rpl-vertical-nav" aria-label="Secondary navigation">
    <h3 v-if="title" class="rpl-vertical-nav__heading">{{ title }}</h3>
    <ul class="rpl-vertical-nav__list rpl-vertical-nav__list--level-1">
      <li
        v-for="item in items"
        :key="item.id"
        class="rpl-vertical-nav__item"
      >
        <div class="rpl-vertical-nav__item-header">
          <a
            :href="item.url"
            :class="[
              'rpl-vertical-nav__link',
              { 'rpl-vertical-nav__link--active': item.active }
            ]"
            @click="handleNavigate(item, $event)"
          >
            {{ item.text }}
          </a>
          <button
            v-if="item.items?.length && isToggleable(1)"
            type="button"
            class="rpl-vertical-nav__toggle"
            :aria-expanded="isExpanded(item.id)"
            :aria-label="`Toggle ${item.text}`"
            @click="toggleItem(item)"
          >
            <span
              :class="[
                'rpl-vertical-nav__chevron',
                { 'rpl-vertical-nav__chevron--open': isExpanded(item.id) }
              ]"
            />
          </button>
        </div>
        <!-- Level 2 -->
        <ul
          v-if="item.items?.length && (!isToggleable(1) || isExpanded(item.id))"
          class="rpl-vertical-nav__list rpl-vertical-nav__list--level-2"
        >
          <li
            v-for="child in item.items"
            :key="child.id"
            class="rpl-vertical-nav__item"
          >
            <div class="rpl-vertical-nav__item-header">
              <a
                :href="child.url"
                :class="[
                  'rpl-vertical-nav__link',
                  { 'rpl-vertical-nav__link--active': child.active }
                ]"
                @click="handleNavigate(child, $event)"
              >
                {{ child.text }}
              </a>
              <button
                v-if="child.items?.length && isToggleable(2)"
                type="button"
                class="rpl-vertical-nav__toggle"
                :aria-expanded="isExpanded(child.id)"
                :aria-label="`Toggle ${child.text}`"
                @click="toggleItem(child)"
              >
                <span
                  :class="[
                    'rpl-vertical-nav__chevron',
                    { 'rpl-vertical-nav__chevron--open': isExpanded(child.id) }
                  ]"
                />
              </button>
            </div>
            <!-- Level 3 -->
            <ul
              v-if="child.items?.length && (!isToggleable(2) || isExpanded(child.id))"
              class="rpl-vertical-nav__list rpl-vertical-nav__list--level-3"
            >
              <li
                v-for="grandchild in child.items"
                :key="grandchild.id"
                class="rpl-vertical-nav__item"
              >
                <div class="rpl-vertical-nav__item-header">
                  <a
                    :href="grandchild.url"
                    :class="[
                      'rpl-vertical-nav__link',
                      { 'rpl-vertical-nav__link--active': grandchild.active }
                    ]"
                    @click="handleNavigate(grandchild, $event)"
                  >
                    {{ grandchild.text }}
                  </a>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<!--
  CSS is intentionally unscoped. The template renders nested lists that need
  consistent styling at every depth level. Scoped styles would not penetrate
  dynamically rendered children.
-->
<style>
.rpl-vertical-nav {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-vertical-nav__heading {
  margin: 0 0 var(--rpl-sp-4, 1rem);
  font-size: var(--rpl-type-size-lg, 1.125rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333333);
}

.rpl-vertical-nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rpl-vertical-nav__list--level-2 {
  padding-left: var(--rpl-sp-5, 1.25rem);
  border-left: 2px solid var(--rpl-clr-neutral-200, #e0e0e0);
}

.rpl-vertical-nav__list--level-3 {
  padding-left: var(--rpl-sp-5, 1.25rem);
  border-left: 2px solid var(--rpl-clr-neutral-200, #e0e0e0);
}

.rpl-vertical-nav__item {
  margin: 0;
}

.rpl-vertical-nav__item-header {
  display: flex;
  align-items: center;
}

.rpl-vertical-nav__link {
  display: block;
  flex: 1;
  padding: var(--rpl-sp-2, 0.5rem) var(--rpl-sp-3, 0.75rem);
  color: var(--rpl-clr-type-default, #333333);
  text-decoration: none;
  font-size: var(--rpl-type-size-base, 1rem);
  font-weight: 500;
  line-height: 1.5;
  border-radius: var(--rpl-border-radius, 4px);
  transition: background-color 0.2s, color 0.2s;
}

.rpl-vertical-nav__link:hover {
  background-color: var(--rpl-clr-light, #f5f5f5);
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-vertical-nav__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
  border-radius: 2px;
}

.rpl-vertical-nav__link--active {
  color: var(--rpl-clr-primary, #0052c2);
  font-weight: 700;
  border-left: 3px solid var(--rpl-clr-primary, #0052c2);
  padding-left: calc(var(--rpl-sp-3, 0.75rem) - 3px);
  background-color: var(--rpl-clr-primary-alpha, rgba(0, 82, 194, 0.05));
}

.rpl-vertical-nav__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--rpl-border-radius, 4px);
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.rpl-vertical-nav__toggle:hover {
  background-color: var(--rpl-clr-light, #f5f5f5);
}

.rpl-vertical-nav__toggle:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-vertical-nav__chevron {
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid var(--rpl-clr-type-default, #333333);
  border-bottom: 2px solid var(--rpl-clr-type-default, #333333);
  transform: rotate(-45deg);
  transition: transform 0.2s ease;
}

.rpl-vertical-nav__chevron--open {
  transform: rotate(45deg);
}
</style>
