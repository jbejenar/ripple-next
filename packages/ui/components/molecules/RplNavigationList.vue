<script setup lang="ts">
import type { RplNavigationItem } from './RplNavigation.vue'

defineProps<{
  items: RplNavigationItem[]
  depth: number
}>()
</script>

<template>
  <ul :class="depth === 0 ? 'rpl-navigation__list' : 'rpl-navigation__submenu'">
    <li
      v-for="item in items"
      :key="item.id"
      :class="[
        depth === 0 ? 'rpl-navigation__item' : 'rpl-navigation__subitem',
        { 'rpl-navigation__item--has-children': depth === 0 && item.children.length > 0 }
      ]"
    >
      <a
        :href="item.url"
        :class="depth === 0 ? 'rpl-navigation__link' : 'rpl-navigation__sublink'"
      >
        {{ item.label }}
      </a>
      <RplNavigationList
        v-if="item.children.length > 0"
        :items="item.children"
        :depth="depth + 1"
      />
    </li>
  </ul>
</template>
