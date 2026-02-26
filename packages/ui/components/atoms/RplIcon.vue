<script setup lang="ts">
export interface RplIconProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
}

withDefaults(defineProps<RplIconProps>(), {
  size: 'md',
  color: 'currentColor'
})

const sizeMap: Record<string, string> = {
  sm: '16',
  md: '24',
  lg: '32',
  xl: '48'
}
</script>

<template>
  <svg
    :class="['rpl-icon', `rpl-icon--${size}`]"
    :width="sizeMap[size]"
    :height="sizeMap[size]"
    :fill="color"
    aria-hidden="true"
  >
    <use :href="`#rpl-icon-${name}`" />
  </svg>
</template>

<style scoped>
.rpl-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
