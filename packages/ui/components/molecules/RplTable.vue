<script setup lang="ts">
export interface RplTableColumn {
  /** Unique key matching the data object property */
  key: string
  /** Display label for the column header */
  label: string
  /** Whether the column is sortable */
  sortable?: boolean
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
}

export interface RplTableProps {
  /** Column definitions */
  columns: RplTableColumn[]
  /** Row data — each row is a record keyed by column key */
  rows: Record<string, unknown>[]
  /** Optional table caption for accessibility */
  caption?: string
  /** Whether to show striped rows */
  striped?: boolean
  /** Currently sorted column key */
  sortBy?: string
  /** Sort direction */
  sortDirection?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<RplTableProps>(), {
  caption: '',
  striped: false,
  sortBy: '',
  sortDirection: 'asc'
})

const emit = defineEmits<{
  sort: [column: string, direction: 'asc' | 'desc']
}>()

function handleSort(column: RplTableColumn): void {
  if (!column.sortable) return
  const direction =
    props.sortBy === column.key && props.sortDirection === 'asc' ? 'desc' : 'asc'
  emit('sort', column.key, direction)
}

function getSortLabel(column: RplTableColumn): string {
  if (!column.sortable) return ''
  if (props.sortBy !== column.key) return 'Sort'
  return props.sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'
}

function cellValue(row: Record<string, unknown>, key: string): string {
  const val = row[key]
  return val == null ? '' : String(val)
}
</script>

<template>
  <div class="rpl-table-wrapper">
    <table class="rpl-table" :class="{ 'rpl-table--striped': striped }">
      <caption v-if="caption" class="rpl-table__caption">
        {{ caption }}
      </caption>
      <thead class="rpl-table__head">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :class="[
              'rpl-table__header',
              `rpl-table__header--${col.align || 'left'}`,
              { 'rpl-table__header--sortable': col.sortable }
            ]"
            :aria-sort="
              sortBy === col.key
                ? sortDirection === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined
            "
            @click="handleSort(col)"
            @keydown.enter="handleSort(col)"
          >
            <span class="rpl-table__header-content">
              {{ col.label }}
              <span v-if="col.sortable" class="rpl-table__sort-icon" aria-hidden="true">
                <template v-if="sortBy === col.key">
                  {{ sortDirection === 'asc' ? '▲' : '▼' }}
                </template>
                <template v-else>⇅</template>
              </span>
            </span>
            <span v-if="col.sortable" class="rpl-u-visually-hidden">
              {{ getSortLabel(col) }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody class="rpl-table__body">
        <tr
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          class="rpl-table__row"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="[
              'rpl-table__cell',
              `rpl-table__cell--${col.align || 'left'}`
            ]"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="cellValue(row, col.key)">
              {{ cellValue(row, col.key) }}
            </slot>
          </td>
        </tr>
        <tr v-if="rows.length === 0" class="rpl-table__row rpl-table__row--empty">
          <td :colspan="columns.length" class="rpl-table__cell rpl-table__cell--empty">
            <slot name="empty">No data available</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.rpl-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.rpl-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  font-size: var(--rpl-type-size-base, 1rem);
  line-height: 1.5;
}

.rpl-table__caption {
  text-align: left;
  font-weight: 700;
  font-size: var(--rpl-type-size-lg, 1.125rem);
  padding: var(--rpl-sp-4, 1rem) 0;
  caption-side: top;
  color: var(--rpl-clr-text, #333);
}

.rpl-table__head {
  border-bottom: 2px solid var(--rpl-clr-primary, #0052c2);
}

.rpl-table__header {
  padding: var(--rpl-sp-3, 0.75rem) var(--rpl-sp-4, 1rem);
  font-weight: 700;
  color: var(--rpl-clr-text, #333);
  white-space: nowrap;
  user-select: none;
}

.rpl-table__header--left {
  text-align: left;
}

.rpl-table__header--center {
  text-align: center;
}

.rpl-table__header--right {
  text-align: right;
}

.rpl-table__header--sortable {
  cursor: pointer;
}

.rpl-table__header--sortable:hover {
  background-color: var(--rpl-clr-background-light, #f5f5f5);
}

.rpl-table__header--sortable:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: -2px;
}

.rpl-table__header-content {
  display: inline-flex;
  align-items: center;
  gap: var(--rpl-sp-2, 0.5rem);
}

.rpl-table__sort-icon {
  font-size: var(--rpl-type-size-xs, 0.75rem);
  color: var(--rpl-clr-text-light, #666);
}

.rpl-table__row {
  border-bottom: 1px solid var(--rpl-clr-border-light, #e0e0e0);
}

.rpl-table--striped .rpl-table__row:nth-child(even) {
  background-color: var(--rpl-clr-background-light, #f5f5f5);
}

.rpl-table__cell {
  padding: var(--rpl-sp-3, 0.75rem) var(--rpl-sp-4, 1rem);
  color: var(--rpl-clr-text, #333);
}

.rpl-table__cell--left {
  text-align: left;
}

.rpl-table__cell--center {
  text-align: center;
}

.rpl-table__cell--right {
  text-align: right;
}

.rpl-table__cell--empty {
  text-align: center;
  color: var(--rpl-clr-text-light, #666);
  padding: var(--rpl-sp-8, 2rem) var(--rpl-sp-4, 1rem);
  font-style: italic;
}

.rpl-u-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
