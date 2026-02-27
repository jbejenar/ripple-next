<script setup lang="ts">
const props = defineProps<{
  title?: string
  items: Array<{
    title: string
    subtitle?: string
    body: string
    date?: string
  }>
}>()
</script>

<template>
  <div class="rpl-timeline">
    <h2 v-if="props.title" class="rpl-timeline__title">
      {{ props.title }}
    </h2>
    <div class="rpl-timeline__list">
      <div
        v-for="(item, index) in props.items"
        :key="index"
        class="rpl-timeline__item"
      >
        <div class="rpl-timeline__marker" />
        <div class="rpl-timeline__content">
          <span v-if="item.date" class="rpl-timeline__date">{{ item.date }}</span>
          <h3 class="rpl-timeline__item-title">{{ item.title }}</h3>
          <p v-if="item.subtitle" class="rpl-timeline__subtitle">{{ item.subtitle }}</p>
          <div class="rpl-timeline__body" v-html="item.body" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rpl-timeline {
  margin: 1.5rem 0;
}

.rpl-timeline__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-timeline__list {
  position: relative;
  padding-left: 2rem;
}

.rpl-timeline__list::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-timeline__item {
  position: relative;
  padding-bottom: 1.5rem;
}

.rpl-timeline__marker {
  position: absolute;
  left: -1.75rem;
  top: 0.25rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--rpl-clr-primary, #0052c2);
  border: 2px solid white;
}

.rpl-timeline__date {
  display: inline-block;
  font-size: 0.875rem;
  color: var(--rpl-clr-type-light, #666666);
  margin-bottom: 0.25rem;
}

.rpl-timeline__item-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-timeline__subtitle {
  font-size: 0.875rem;
  color: var(--rpl-clr-type-light, #666666);
  margin-bottom: 0.5rem;
}

.rpl-timeline__body {
  line-height: 1.6;
  color: var(--rpl-clr-type-default, #333333);
}
</style>
