<script setup lang="ts">
defineProps<{
  html: string
}>()
</script>

<template>
  <div class="rpl-content-wysiwyg" v-html="html" />
</template>

<style scoped>
.rpl-content-wysiwyg {
  max-width: 100%;
  line-height: 1.6;
  font-size: 1rem;
  color: var(--rpl-clr-type-default, #333333);
}

.rpl-content-wysiwyg :deep(h2) {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.rpl-content-wysiwyg :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.rpl-content-wysiwyg :deep(p) {
  margin-bottom: 1rem;
}

.rpl-content-wysiwyg :deep(ul),
.rpl-content-wysiwyg :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.rpl-content-wysiwyg :deep(a) {
  color: var(--rpl-clr-primary, #0052c2);
  text-decoration: underline;
}

.rpl-content-wysiwyg :deep(img) {
  max-width: 100%;
  height: auto;
}

.rpl-content-wysiwyg :deep(blockquote) {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  border-left: 4px solid var(--rpl-clr-primary, #0052c2);
  background-color: var(--rpl-clr-light, #f5f5f5);
}

.rpl-content-wysiwyg :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.rpl-content-wysiwyg :deep(th),
.rpl-content-wysiwyg :deep(td) {
  padding: 0.5rem;
  border: 1px solid var(--rpl-clr-border, #e0e0e0);
  text-align: left;
}

.rpl-content-wysiwyg :deep(th) {
  background-color: var(--rpl-clr-light, #f5f5f5);
  font-weight: 600;
}
</style>
