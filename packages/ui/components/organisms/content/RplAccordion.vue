<script setup lang="ts">
const props = defineProps<{
  title?: string
  items: Array<{ title: string; body: string }>
}>()

const openItems = ref<Set<number>>(new Set())

function toggle(index: number): void {
  const next = new Set(openItems.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  openItems.value = next
}

function isOpen(index: number): boolean {
  return openItems.value.has(index)
}
</script>

<template>
  <div class="rpl-accordion">
    <h2 v-if="props.title" class="rpl-accordion__title">
      {{ props.title }}
    </h2>
    <div
      v-for="(item, index) in props.items"
      :key="index"
      class="rpl-accordion__item"
      :class="{ 'rpl-accordion__item--open': isOpen(index) }"
    >
      <button
        class="rpl-accordion__header"
        :aria-expanded="isOpen(index)"
        :aria-controls="`rpl-accordion-panel-${index}`"
        @click="toggle(index)"
      >
        <span class="rpl-accordion__header-text">{{ item.title }}</span>
        <span class="rpl-accordion__icon" :class="{ 'rpl-accordion__icon--open': isOpen(index) }">
          &#9660;
        </span>
      </button>
      <div
        v-show="isOpen(index)"
        :id="`rpl-accordion-panel-${index}`"
        role="region"
        class="rpl-accordion__content"
        v-html="item.body"
      />
    </div>
  </div>
</template>

<style scoped>
.rpl-accordion {
  margin: 1.5rem 0;
}

.rpl-accordion__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-accordion__item {
  border: 1px solid var(--rpl-clr-border, #e0e0e0);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.rpl-accordion__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: var(--rpl-clr-primary, #0052c2);
  text-align: left;
}

.rpl-accordion__header:hover {
  background-color: var(--rpl-clr-light, #f5f5f5);
}

.rpl-accordion__header:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: -2px;
}

.rpl-accordion__icon {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.rpl-accordion__icon--open {
  transform: rotate(180deg);
}

.rpl-accordion__content {
  padding: 0 1rem 1rem;
  line-height: 1.6;
  color: var(--rpl-clr-type-default, #333333);
}
</style>
