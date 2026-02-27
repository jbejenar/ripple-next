<script setup lang="ts">
const props = defineProps<{
  title?: string
  dates: Array<{
    title: string
    date: string
    description?: string
  }>
}>()
</script>

<template>
  <div class="rpl-key-dates">
    <h2 v-if="props.title" class="rpl-key-dates__title">
      {{ props.title }}
    </h2>
    <div class="rpl-key-dates__list">
      <div
        v-for="(item, index) in props.dates"
        :key="index"
        class="rpl-key-dates__item"
      >
        <div class="rpl-key-dates__date">{{ item.date }}</div>
        <div class="rpl-key-dates__content">
          <h3 class="rpl-key-dates__item-title">{{ item.title }}</h3>
          <p v-if="item.description" class="rpl-key-dates__description">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rpl-key-dates {
  margin: 1.5rem 0;
}

.rpl-key-dates__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-key-dates__item {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--rpl-clr-border, #e0e0e0);
}

.rpl-key-dates__item:last-child {
  border-bottom: none;
}

.rpl-key-dates__date {
  flex-shrink: 0;
  width: 100px;
  font-weight: 700;
  color: var(--rpl-clr-primary, #0052c2);
  font-size: 0.875rem;
}

.rpl-key-dates__item-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-key-dates__description {
  font-size: 0.875rem;
  color: var(--rpl-clr-type-light, #666666);
  line-height: 1.5;
}
</style>
