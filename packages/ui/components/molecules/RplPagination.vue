<script setup lang="ts">
import { computed } from 'vue'

export interface RplPaginationProps {
  currentPage: number
  totalPages: number
  ariaLabel?: string
  visiblePages?: number
}

const props = withDefaults(defineProps<RplPaginationProps>(), {
  ariaLabel: 'Pagination',
  visiblePages: 5
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const pages = computed((): (number | 'ellipsis')[] => {
  const total = props.totalPages
  const current = props.currentPage
  const visible = props.visiblePages

  if (total <= visible) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const result: (number | 'ellipsis')[] = [1]
  const half = Math.floor((visible - 2) / 2)
  let start = Math.max(2, current - half)
  let end = Math.min(total - 1, current + half)

  if (current <= half + 1) {
    end = visible - 1
  } else if (current >= total - half) {
    start = total - visible + 2
  }

  if (start > 2) {
    result.push('ellipsis')
  }

  for (let i = start; i <= end; i++) {
    result.push(i)
  }

  if (end < total - 1) {
    result.push('ellipsis')
  }

  result.push(total)
  return result
})

function goToPage(page: number): void {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <nav :aria-label="ariaLabel" class="rpl-pagination">
    <ul class="rpl-pagination__list">
      <li class="rpl-pagination__item">
        <button
          class="rpl-pagination__button rpl-pagination__button--prev"
          :disabled="currentPage <= 1"
          :aria-label="`Go to previous page, page ${currentPage - 1}`"
          @click="goToPage(currentPage - 1)"
        >
          <span aria-hidden="true">&lsaquo;</span>
          <span class="rpl-pagination__button-text">Previous</span>
        </button>
      </li>

      <li
        v-for="(page, index) in pages"
        :key="`page-${index}`"
        class="rpl-pagination__item"
      >
        <span
          v-if="page === 'ellipsis'"
          class="rpl-pagination__ellipsis"
          aria-hidden="true"
        >
          &hellip;
        </span>
        <button
          v-else
          :class="[
            'rpl-pagination__button',
            'rpl-pagination__button--page',
            { 'rpl-pagination__button--active': page === currentPage }
          ]"
          :aria-label="`Page ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </li>

      <li class="rpl-pagination__item">
        <button
          class="rpl-pagination__button rpl-pagination__button--next"
          :disabled="currentPage >= totalPages"
          :aria-label="`Go to next page, page ${currentPage + 1}`"
          @click="goToPage(currentPage + 1)"
        >
          <span class="rpl-pagination__button-text">Next</span>
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.rpl-pagination {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-pagination__list {
  display: flex;
  align-items: center;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--rpl-sp-1, 0.25rem);
}

.rpl-pagination__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: var(--rpl-sp-1, 0.25rem) var(--rpl-sp-2, 0.5rem);
  font-family: inherit;
  font-size: var(--rpl-type-size-base, 1rem);
  font-weight: 600;
  color: var(--rpl-clr-primary, #0052c2);
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--rpl-border-radius, 4px);
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.rpl-pagination__button:hover:not(:disabled) {
  background-color: var(--rpl-clr-primary-light, #e5edf8);
  border-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-pagination__button:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-pagination__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rpl-pagination__button--active {
  background-color: var(--rpl-clr-primary, #0052c2);
  color: var(--rpl-clr-text-inverse, #ffffff);
  border-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-pagination__button--active:hover:not(:disabled) {
  background-color: var(--rpl-clr-primary-dark, #003e91);
  border-color: var(--rpl-clr-primary-dark, #003e91);
}

.rpl-pagination__button--prev,
.rpl-pagination__button--next {
  gap: var(--rpl-sp-1, 0.25rem);
}

.rpl-pagination__button-text {
  font-size: var(--rpl-type-size-sm, 0.875rem);
}

.rpl-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  color: var(--rpl-clr-text-light, #666666);
  font-size: var(--rpl-type-size-base, 1rem);
}

@media (max-width: 480px) {
  .rpl-pagination__button-text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
}
</style>
