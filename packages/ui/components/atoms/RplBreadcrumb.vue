<script setup lang="ts">
export interface RplBreadcrumbItem {
  label: string
  url?: string
}

export interface RplBreadcrumbProps {
  items: RplBreadcrumbItem[]
  ariaLabel?: string
}

withDefaults(defineProps<RplBreadcrumbProps>(), {
  ariaLabel: 'Breadcrumb'
})
</script>

<template>
  <nav :aria-label="ariaLabel" class="rpl-breadcrumb">
    <ol class="rpl-breadcrumb__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="rpl-breadcrumb__item"
      >
        <a
          v-if="item.url && index < items.length - 1"
          :href="item.url"
          class="rpl-breadcrumb__link"
        >
          {{ item.label }}
        </a>
        <span
          v-else
          class="rpl-breadcrumb__text"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
        <span
          v-if="index < items.length - 1"
          class="rpl-breadcrumb__separator"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.rpl-breadcrumb {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  font-size: var(--rpl-type-size-sm, 0.875rem);
  line-height: 1.5;
}

.rpl-breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--rpl-sp-1, 0.25rem);
}

.rpl-breadcrumb__item {
  display: flex;
  align-items: center;
  gap: var(--rpl-sp-1, 0.25rem);
}

.rpl-breadcrumb__link {
  color: var(--rpl-clr-primary, #0052c2);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.rpl-breadcrumb__link:hover {
  color: var(--rpl-clr-primary-dark, #003e91);
  text-decoration-thickness: 2px;
}

.rpl-breadcrumb__link:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
  border-radius: 2px;
}

.rpl-breadcrumb__text {
  color: var(--rpl-clr-text, #333333);
}

.rpl-breadcrumb__separator {
  color: var(--rpl-clr-text-light, #666666);
  user-select: none;
}
</style>
