import { z } from 'zod'

// ── Shared primitives ──────────────────────────────────────────────────

export const contentStatusSchema = z.enum(['published', 'draft', 'archived'])

export const cmsImageSchema = z.object({
  id: z.string().min(1),
  src: z.string().url(),
  alt: z.string(),
  title: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  focalPoint: z
    .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
    .optional()
})

export const cmsFileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  size: z.number().int().nonnegative(),
  mimeType: z.string().min(1)
})

export const cmsLinkSchema = z.object({
  text: z.string().min(1),
  url: z.string().min(1),
  external: z.boolean().optional()
})

// ── Page sections ──────────────────────────────────────────────────────

export const accordionItemSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1)
})

export const cardItemSchema = z.object({
  title: z.string().min(1),
  summary: z.string(),
  link: cmsLinkSchema.optional(),
  image: cmsImageSchema.optional()
})

export const timelineItemSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  body: z.string().min(1),
  date: z.string().optional()
})

export const callToActionSchema = z.object({
  title: z.string().min(1),
  summary: z.string(),
  link: cmsLinkSchema,
  image: cmsImageSchema.optional()
})

export const keyDateSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  description: z.string().optional()
})

export const pageSectionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('wysiwyg'), html: z.string() }),
  z.object({
    type: z.literal('accordion'),
    title: z.string().optional(),
    items: z.array(accordionItemSchema).min(1)
  }),
  z.object({
    type: z.literal('card-collection'),
    title: z.string().optional(),
    cards: z.array(cardItemSchema).min(1)
  }),
  z.object({
    type: z.literal('timeline'),
    title: z.string().optional(),
    items: z.array(timelineItemSchema).min(1)
  }),
  z.object({
    type: z.literal('call-to-action'),
    cta: callToActionSchema
  }),
  z.object({
    type: z.literal('key-dates'),
    title: z.string().optional(),
    dates: z.array(keyDateSchema).min(1)
  }),
  z.object({
    type: z.literal('image'),
    image: cmsImageSchema,
    caption: z.string().optional()
  }),
  z.object({
    type: z.literal('embedded-video'),
    url: z.string().url(),
    title: z.string().optional(),
    transcript: z.string().optional()
  })
])

// ── CMS Metadata ───────────────────────────────────────────────────────

export const cmsMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: cmsImageSchema.optional(),
  keywords: z.array(z.string()).optional(),
  noIndex: z.boolean().optional()
})

// ── Taxonomy ───────────────────────────────────────────────────────────

export const cmsTaxonomyTermSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  vocabulary: z.string().min(1),
  parent: z.string().optional(),
  weight: z.number().int().optional()
})

export const cmsTaxonomyVocabularySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  machineName: z.string().min(1)
})

// ── CMS Page ───────────────────────────────────────────────────────────

export const cmsPageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().optional(),
  body: z.string().optional(),
  sections: z.array(pageSectionSchema),
  featuredImage: cmsImageSchema.optional(),
  status: contentStatusSchema,
  contentType: z.string().min(1),
  taxonomy: z.array(cmsTaxonomyTermSchema),
  created: z.string(),
  updated: z.string(),
  meta: cmsMetadataSchema
})

// ── Menu ───────────────────────────────────────────────────────────────

const cmsMenuItemBaseSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().min(1),
  parent: z.string().optional(),
  weight: z.number().int()
})

export const cmsMenuItemSchema: z.ZodType<{
  id: string
  label: string
  url: string
  parent?: string
  weight: number
  children: Array<{
    id: string
    label: string
    url: string
    parent?: string
    weight: number
    children: Array<unknown>
  }>
}> = cmsMenuItemBaseSchema.extend({
  children: z.lazy(() => z.array(cmsMenuItemSchema))
})

export const cmsMenuSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  items: z.array(cmsMenuItemSchema)
})

// ── Route ──────────────────────────────────────────────────────────────

export const cmsRouteSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  contentType: z.string().min(1),
  redirect: z.string().optional(),
  statusCode: z.number().int().optional()
})

// ── Search ─────────────────────────────────────────────────────────────

export const cmsSearchQuerySchema = z.object({
  query: z.string().min(1),
  filters: z.record(z.union([z.string(), z.array(z.string())])).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  sort: z.string().optional()
})

export const cmsSearchResultItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  url: z.string().min(1),
  contentType: z.string().min(1),
  updated: z.string()
})

export const cmsSearchResultSchema = z.object({
  items: z.array(cmsSearchResultItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative()
})

// ── Inferred Types ─────────────────────────────────────────────────────

export type ContentStatusInput = z.infer<typeof contentStatusSchema>
export type CmsPageInput = z.infer<typeof cmsPageSchema>
export type CmsSearchQueryInput = z.infer<typeof cmsSearchQuerySchema>
