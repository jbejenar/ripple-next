<script setup lang="ts">
import { computed } from 'vue'

export interface RplImageFocalPoint {
  x: number
  y: number
}

export type RplImageAspect = 'square' | 'full' | 'wide' | 'ultrawide' | 'panorama' | 'portrait'

export interface RplImageProps {
  /** Image source URL */
  src: string
  /** Alt text for accessibility */
  alt?: string
  /** Image title attribute */
  title?: string
  /** Intrinsic width */
  width?: number
  /** Intrinsic height */
  height?: number
  /** Sizes attribute for responsive images */
  sizes?: string
  /** Clip image to a circle */
  circle?: boolean
  /** Focal point for object-position (values 0-100) */
  focalPoint?: RplImageFocalPoint
  /** Aspect ratio preset */
  aspect?: RplImageAspect
  /** Object-fit mode */
  fit?: 'none' | 'contain' | 'cover'
  /** Loading priority */
  priority?: 'auto' | 'low' | 'high'
}

const props = withDefaults(defineProps<RplImageProps>(), {
  alt: '',
  title: undefined,
  width: undefined,
  height: undefined,
  sizes: undefined,
  circle: false,
  focalPoint: undefined,
  aspect: undefined,
  fit: 'cover',
  priority: 'auto'
})

const classes = computed(() => [
  'rpl-image',
  {
    'rpl-image--circle': props.circle,
    [`rpl-image--${props.fit}`]: props.fit,
    [`rpl-image--aspect-${props.aspect}`]: props.aspect,
    'rpl-image--aspect-square': props.circle && !props.aspect
  }
])

const objectPosition = computed(() => {
  if (!props.focalPoint) return undefined
  return `${props.focalPoint.x}% ${props.focalPoint.y}%`
})

const fetchPriority = computed(() => {
  if (props.priority === 'high') return 'high'
  if (props.priority === 'low') return 'low'
  return undefined
})

const loading = computed(() => {
  return props.priority === 'high' ? 'eager' : 'lazy'
})
</script>

<template>
  <img
    :class="classes"
    :src="src"
    :alt="alt"
    :title="title"
    :width="width"
    :height="height"
    :sizes="sizes"
    :loading="loading"
    :fetchpriority="fetchPriority"
    :style="objectPosition ? { objectPosition } : undefined"
  />
</template>

<style scoped>
.rpl-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.rpl-image--cover {
  object-fit: cover;
}

.rpl-image--contain {
  object-fit: contain;
}

.rpl-image--none {
  object-fit: none;
}

.rpl-image--circle {
  border-radius: 50%;
  overflow: hidden;
}

.rpl-image--aspect-square {
  aspect-ratio: 1 / 1;
  width: 100%;
  height: 100%;
}

.rpl-image--aspect-full {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: 100%;
}

.rpl-image--aspect-wide {
  aspect-ratio: 2 / 1;
  width: 100%;
  height: 100%;
}

.rpl-image--aspect-ultrawide {
  aspect-ratio: 21 / 9;
  width: 100%;
  height: 100%;
}

.rpl-image--aspect-panorama {
  aspect-ratio: 3 / 1;
  width: 100%;
  height: 100%;
}

.rpl-image--aspect-portrait {
  aspect-ratio: 3 / 4;
  width: 100%;
  height: 100%;
}
</style>
