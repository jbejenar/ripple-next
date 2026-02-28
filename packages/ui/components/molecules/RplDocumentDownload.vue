<script setup lang="ts">
export interface RplDocumentItem {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
  description?: string
  updated?: string
}

export interface RplDocumentDownloadProps {
  documents: RplDocumentItem[]
  title?: string
}

defineProps<RplDocumentDownloadProps>()

const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'text/csv': 'CSV',
  'application/zip': 'ZIP',
  'image/jpeg': 'JPG',
  'image/png': 'PNG'
}

function getFileTypeLabel(mimeType: string): string {
  return FILE_TYPE_LABELS[mimeType] || mimeType.split('/').pop()?.toUpperCase() || 'FILE'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileTypeClass(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'rpl-document-download__icon--pdf'
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType === 'text/csv')
    return 'rpl-document-download__icon--xls'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return 'rpl-document-download__icon--ppt'
  if (mimeType.includes('wordprocessing') || mimeType === 'application/msword')
    return 'rpl-document-download__icon--doc'
  if (mimeType.startsWith('image/')) return 'rpl-document-download__icon--img'
  return 'rpl-document-download__icon--generic'
}
</script>

<template>
  <section class="rpl-document-download" :aria-label="title || 'Documents'">
    <h3 v-if="title" class="rpl-document-download__title">{{ title }}</h3>
    <ul class="rpl-document-download__list" role="list">
      <li
        v-for="doc in documents"
        :key="doc.id"
        class="rpl-document-download__item"
      >
        <a
          :href="doc.url"
          class="rpl-document-download__link"
          :download="doc.name"
          :aria-label="`Download ${doc.name} (${getFileTypeLabel(doc.mimeType)}, ${formatFileSize(doc.size)})`"
        >
          <span
            class="rpl-document-download__icon"
            :class="getFileTypeClass(doc.mimeType)"
            aria-hidden="true"
          >
            {{ getFileTypeLabel(doc.mimeType) }}
          </span>
          <span class="rpl-document-download__details">
            <span class="rpl-document-download__name">{{ doc.name }}</span>
            <span v-if="doc.description" class="rpl-document-download__description">
              {{ doc.description }}
            </span>
            <span class="rpl-document-download__meta">
              {{ getFileTypeLabel(doc.mimeType) }} &middot; {{ formatFileSize(doc.size) }}
              <span v-if="doc.updated"> &middot; {{ doc.updated }}</span>
            </span>
          </span>
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.rpl-document-download__title {
  margin: 0 0 var(--rpl-sp-4, 1rem);
  font-size: var(--rpl-type-size-l, 1.25rem);
  color: var(--rpl-clr-text, #333333);
}

.rpl-document-download__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rpl-document-download__item {
  border: 1px solid var(--rpl-clr-border, #e0e0e0);
  border-radius: var(--rpl-border-radius, 4px);
  margin-bottom: var(--rpl-sp-3, 0.75rem);
  transition: box-shadow 0.2s;
}

.rpl-document-download__item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rpl-document-download__link {
  display: flex;
  align-items: center;
  padding: var(--rpl-sp-4, 1rem);
  text-decoration: none;
  color: inherit;
  gap: var(--rpl-sp-4, 1rem);
}

.rpl-document-download__link:focus-visible {
  outline: 3px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: -3px;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-document-download__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--rpl-border-radius, 4px);
  font-size: var(--rpl-type-size-xs, 0.75rem);
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rpl-document-download__icon--pdf {
  background-color: #dc2626;
}

.rpl-document-download__icon--doc {
  background-color: #2563eb;
}

.rpl-document-download__icon--xls {
  background-color: #16a34a;
}

.rpl-document-download__icon--ppt {
  background-color: #ea580c;
}

.rpl-document-download__icon--img {
  background-color: #7c3aed;
}

.rpl-document-download__icon--generic {
  background-color: #6b7280;
}

.rpl-document-download__details {
  display: flex;
  flex-direction: column;
  gap: var(--rpl-sp-1, 0.25rem);
  min-width: 0;
}

.rpl-document-download__name {
  font-weight: 600;
  color: var(--rpl-clr-primary, #0052c2);
  font-size: var(--rpl-type-size-base, 1rem);
}

.rpl-document-download__description {
  font-size: var(--rpl-type-size-s, 0.875rem);
  color: var(--rpl-clr-text-light, #666666);
  line-height: 1.4;
}

.rpl-document-download__meta {
  font-size: var(--rpl-type-size-xs, 0.75rem);
  color: var(--rpl-clr-text-light, #666666);
}
</style>
