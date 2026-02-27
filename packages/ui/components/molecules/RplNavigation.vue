<script setup lang="ts">
import RplNavigationList from './RplNavigationList.vue'

export interface RplNavigationItem {
  id: string
  label: string
  url: string
  children: RplNavigationItem[]
}

export interface RplNavigationProps {
  items: RplNavigationItem[]
  variant?: 'horizontal' | 'vertical'
  ariaLabel?: string
}

withDefaults(defineProps<RplNavigationProps>(), {
  variant: 'horizontal',
  ariaLabel: 'Navigation'
})
</script>

<template>
  <nav
    :class="['rpl-navigation', `rpl-navigation--${variant}`]"
    :aria-label="ariaLabel"
  >
    <RplNavigationList :items="items" :depth="0" />
  </nav>
</template>

<style>
.rpl-navigation__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 0.25rem;
}

.rpl-navigation--vertical .rpl-navigation__list {
  flex-direction: column;
  gap: 0;
}

.rpl-navigation__link {
  display: block;
  padding: 0.5rem 1rem;
  color: var(--rpl-clr-type-default, #333333);
  text-decoration: none;
  font-weight: 500;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.rpl-navigation--vertical .rpl-navigation__link {
  color: rgba(255, 255, 255, 0.9);
}

.rpl-navigation__link:hover {
  background-color: var(--rpl-clr-light, #f5f5f5);
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-navigation--vertical .rpl-navigation__link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.rpl-navigation__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-navigation__submenu {
  list-style: none;
  margin: 0;
  padding: 0 0 0 1rem;
}

.rpl-navigation__sublink {
  display: block;
  padding: 0.375rem 1rem;
  color: var(--rpl-clr-type-light, #666666);
  text-decoration: none;
  font-size: 0.875rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.rpl-navigation--vertical .rpl-navigation__sublink {
  color: rgba(255, 255, 255, 0.7);
}

.rpl-navigation__sublink:hover {
  background-color: var(--rpl-clr-light, #f5f5f5);
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-navigation--vertical .rpl-navigation__sublink:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
