import type {
  PageSection,
  CmsImage,
  CmsLink,
  AccordionItem,
  CardItem,
  TimelineItem,
  CallToAction,
  KeyDate
} from '../types'

// ── JSON:API shapes used by Tide paragraph entities ────────────────────

interface JsonApiResource {
  type: string
  id: string
  attributes: Record<string, unknown>
  relationships?: Record<
    string,
    { data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null }
  >
}

interface JsonApiResourceIdentifier {
  type: string
  id: string
}

// ── Tide paragraph type → section type mapping ─────────────────────────
//
// Tide stores page content as Drupal "paragraph" entities referenced via
// field_landing_page_component (landing pages) or field_node_paragraphs.
// Each paragraph type maps to a PageSection discriminated union member.
//
// This mapper is the ONLY place with Drupal/Tide-specific knowledge.
// Changing or removing Drupal does NOT affect the CmsProvider interface,
// the UI components, or any tests.

const PARAGRAPH_TYPE_MAP: Record<string, string> = {
  'paragraph--accordion': 'accordion',
  'paragraph--card_collection': 'card-collection',
  'paragraph--timeline': 'timeline',
  'paragraph--call_to_action': 'call-to-action',
  'paragraph--key_dates': 'key-dates',
  'paragraph--embedded_video': 'embedded-video',
  'paragraph--content_image': 'image',
  'paragraph--wysiwyg': 'wysiwyg',
  'paragraph--basic_text': 'wysiwyg',
  'paragraph--body': 'wysiwyg'
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Maps Drupal/Tide paragraph entities to platform-agnostic PageSection[].
 *
 * Resolves paragraph references from a node's relationships and maps each
 * Tide paragraph type to the corresponding PageSection discriminated union
 * member. Unknown paragraph types are skipped with a warning.
 *
 * @param node       The parent JSON:API node resource
 * @param included   The JSON:API `included` array with resolved relationships
 * @param fieldNames Paragraph reference field names to check (in order)
 */
export function mapParagraphsToSections(
  node: JsonApiResource,
  included?: JsonApiResource[],
  fieldNames: string[] = [
    'field_landing_page_component',
    'field_node_paragraphs',
    'field_page_component'
  ]
): PageSection[] {
  if (!included || included.length === 0) {
    return fallbackToBody(node)
  }

  // Find the first paragraph reference field that exists on the node
  const paragraphRefs = findParagraphRefs(node, fieldNames)
  if (paragraphRefs.length === 0) {
    return fallbackToBody(node)
  }

  const sections: PageSection[] = []
  for (const ref of paragraphRefs) {
    const resource = included.find((r) => r.type === ref.type && r.id === ref.id)
    if (!resource) continue

    const section = mapParagraphToSection(resource, included)
    if (section) {
      sections.push(section)
    }
  }

  // If no paragraphs resolved, fall back to body field
  if (sections.length === 0) {
    return fallbackToBody(node)
  }

  return sections
}

// ── Individual paragraph mappers ───────────────────────────────────────

function mapParagraphToSection(
  paragraph: JsonApiResource,
  included: JsonApiResource[]
): PageSection | null {
  const sectionType = PARAGRAPH_TYPE_MAP[paragraph.type]
  if (!sectionType) {
    // Unknown paragraph type — skip gracefully
    return null
  }

  switch (sectionType) {
    case 'wysiwyg':
      return mapWysiwyg(paragraph)
    case 'accordion':
      return mapAccordion(paragraph, included)
    case 'card-collection':
      return mapCardCollection(paragraph, included)
    case 'timeline':
      return mapTimeline(paragraph, included)
    case 'call-to-action':
      return mapCallToAction(paragraph, included)
    case 'key-dates':
      return mapKeyDates(paragraph, included)
    case 'embedded-video':
      return mapEmbeddedVideo(paragraph)
    case 'image':
      return mapContentImage(paragraph, included)
    default:
      return null
  }
}

// ── Wysiwyg / Basic Text ───────────────────────────────────────────────

function mapWysiwyg(paragraph: JsonApiResource): PageSection | null {
  const html = extractProcessedText(paragraph.attributes['field_body'])
    ?? extractProcessedText(paragraph.attributes['field_body_value'])
    ?? extractProcessedText(paragraph.attributes['body'])
  if (!html) return null
  return { type: 'wysiwyg', html }
}

// ── Accordion ──────────────────────────────────────────────────────────

function mapAccordion(
  paragraph: JsonApiResource,
  included: JsonApiResource[]
): PageSection | null {
  const title = paragraph.attributes['field_paragraph_title'] as string | undefined
  const itemRefs = getRelationships(paragraph, 'field_paragraph_accordion')
  if (itemRefs.length === 0) {
    // Try alternate field name
    const altRefs = getRelationships(paragraph, 'field_paragraph_items')
    if (altRefs.length === 0) return null
    itemRefs.push(...altRefs)
  }

  const items: AccordionItem[] = []
  for (const ref of itemRefs) {
    const resource = included.find((r) => r.type === ref.type && r.id === ref.id)
    if (!resource) continue
    const itemTitle = String(resource.attributes['field_paragraph_title'] ?? resource.attributes['field_paragraph_accordion_name'] ?? '')
    const itemBody = extractProcessedText(resource.attributes['field_paragraph_accordion_body'])
      ?? extractProcessedText(resource.attributes['field_paragraph_body'])
      ?? ''
    if (itemTitle) {
      items.push({ title: itemTitle, body: itemBody })
    }
  }

  if (items.length === 0) return null
  return { type: 'accordion', title: title ?? undefined, items }
}

// ── Card Collection ────────────────────────────────────────────────────

function mapCardCollection(
  paragraph: JsonApiResource,
  included: JsonApiResource[]
): PageSection | null {
  const title = paragraph.attributes['field_paragraph_title'] as string | undefined
  const cardRefs = getRelationships(paragraph, 'field_paragraph_reference')
    .concat(getRelationships(paragraph, 'field_paragraph_cards'))
  if (cardRefs.length === 0) return null

  const cards: CardItem[] = []
  for (const ref of cardRefs) {
    const resource = included.find((r) => r.type === ref.type && r.id === ref.id)
    if (!resource) continue

    const cardTitle = String(resource.attributes['title'] ?? resource.attributes['field_paragraph_title'] ?? '')
    const summary = String(resource.attributes['field_paragraph_summary'] ?? resource.attributes['field_summary'] ?? '')
    const link = extractLink(resource)
    const image = resolveImage(resource, 'field_featured_image', included)
      ?? resolveImage(resource, 'field_media_image', included)

    if (cardTitle) {
      cards.push({ title: cardTitle, summary, link, image })
    }
  }

  if (cards.length === 0) return null
  return { type: 'card-collection', title: title ?? undefined, cards }
}

// ── Timeline ───────────────────────────────────────────────────────────

function mapTimeline(
  paragraph: JsonApiResource,
  included: JsonApiResource[]
): PageSection | null {
  const title = paragraph.attributes['field_paragraph_title'] as string | undefined
  const itemRefs = getRelationships(paragraph, 'field_timeline')
    .concat(getRelationships(paragraph, 'field_paragraph_items'))
  if (itemRefs.length === 0) return null

  const items: TimelineItem[] = []
  for (const ref of itemRefs) {
    const resource = included.find((r) => r.type === ref.type && r.id === ref.id)
    if (!resource) continue

    const itemTitle = String(resource.attributes['field_paragraph_title'] ?? '')
    const subtitle = resource.attributes['field_paragraph_subtitle'] as string | undefined
    const body = extractProcessedText(resource.attributes['field_paragraph_body']) ?? ''
    const date = resource.attributes['field_paragraph_date'] as string | undefined

    if (itemTitle) {
      items.push({ title: itemTitle, subtitle, body, date })
    }
  }

  if (items.length === 0) return null
  return { type: 'timeline', title: title ?? undefined, items }
}

// ── Call to Action ─────────────────────────────────────────────────────

function mapCallToAction(
  paragraph: JsonApiResource,
  included: JsonApiResource[]
): PageSection | null {
  const title = String(paragraph.attributes['field_paragraph_title'] ?? '')
  const summary = String(paragraph.attributes['field_paragraph_summary']
    ?? extractProcessedText(paragraph.attributes['field_paragraph_body'])
    ?? '')
  const link = extractLink(paragraph)
  const image = resolveImage(paragraph, 'field_paragraph_media', included)
    ?? resolveImage(paragraph, 'field_media_image', included)

  if (!title || !link) return null

  const cta: CallToAction = { title, summary, link, image }
  return { type: 'call-to-action', cta }
}

// ── Key Dates ──────────────────────────────────────────────────────────

function mapKeyDates(
  paragraph: JsonApiResource,
  included: JsonApiResource[]
): PageSection | null {
  const title = paragraph.attributes['field_paragraph_title'] as string | undefined
  const dateRefs = getRelationships(paragraph, 'field_paragraph_keydates')
    .concat(getRelationships(paragraph, 'field_paragraph_items'))
  if (dateRefs.length === 0) return null

  const dates: KeyDate[] = []
  for (const ref of dateRefs) {
    const resource = included.find((r) => r.type === ref.type && r.id === ref.id)
    if (!resource) continue

    const dateTitle = String(resource.attributes['field_paragraph_title'] ?? '')
    const dateValue = String(resource.attributes['field_paragraph_date'] ?? '')
    const description = resource.attributes['field_paragraph_summary'] as string | undefined

    if (dateTitle && dateValue) {
      dates.push({ title: dateTitle, date: dateValue, description })
    }
  }

  if (dates.length === 0) return null
  return { type: 'key-dates', title: title ?? undefined, dates }
}

// ── Embedded Video ─────────────────────────────────────────────────────

function mapEmbeddedVideo(paragraph: JsonApiResource): PageSection | null {
  const url = String(paragraph.attributes['field_paragraph_media_url']
    ?? paragraph.attributes['field_media_video_embed_field']
    ?? '')
  if (!url) return null

  const title = paragraph.attributes['field_paragraph_title'] as string | undefined
  const transcript = extractProcessedText(paragraph.attributes['field_paragraph_transcript'])

  return { type: 'embedded-video', url, title, transcript }
}

// ── Content Image ──────────────────────────────────────────────────────

function mapContentImage(
  paragraph: JsonApiResource,
  included: JsonApiResource[]
): PageSection | null {
  const image = resolveImage(paragraph, 'field_paragraph_media', included)
    ?? resolveImage(paragraph, 'field_media_image', included)
  if (!image) return null

  const caption = paragraph.attributes['field_paragraph_caption'] as string | undefined

  return { type: 'image', image, caption }
}

// ── Utility helpers ────────────────────────────────────────────────────

function findParagraphRefs(
  node: JsonApiResource,
  fieldNames: string[]
): JsonApiResourceIdentifier[] {
  for (const field of fieldNames) {
    const refs = getRelationships(node, field)
    if (refs.length > 0) return refs
  }
  return []
}

function getRelationships(
  resource: JsonApiResource,
  field: string
): JsonApiResourceIdentifier[] {
  const rel = resource.relationships?.[field]?.data
  if (!rel) return []
  return Array.isArray(rel) ? rel : [rel]
}

function extractProcessedText(field: unknown): string | undefined {
  if (!field) return undefined
  if (typeof field === 'string') return field
  if (typeof field === 'object' && field !== null) {
    if ('processed' in field) return String((field as Record<string, unknown>)['processed'])
    if ('value' in field) return String((field as Record<string, unknown>)['value'])
  }
  return undefined
}

function extractLink(resource: JsonApiResource): CmsLink | undefined {
  const linkField = resource.attributes['field_paragraph_link']
    ?? resource.attributes['field_paragraph_cta']
  if (!linkField || typeof linkField !== 'object') return undefined

  const link = linkField as Record<string, unknown>
  const url = String(link['uri'] ?? link['url'] ?? '')
  const text = String(link['title'] ?? link['text'] ?? '')
  if (!url) return undefined

  return {
    text: text || url,
    url,
    external: url.startsWith('http')
  }
}

function resolveImage(
  resource: JsonApiResource,
  field: string,
  included: JsonApiResource[]
): CmsImage | undefined {
  const ref = getRelationship(resource, field)
  if (!ref) return undefined

  const mediaResource = included.find((r) => r.type === ref.type && r.id === ref.id)
  if (!mediaResource) return undefined

  // Media entity → file entity (field_media_image)
  const fileRef = getRelationship(mediaResource, 'field_media_image')
  const fileResource = fileRef
    ? included.find((r) => r.type === fileRef.type && r.id === fileRef.id)
    : null

  const uri = fileResource?.attributes['uri'] as { url?: string } | undefined
  const src = uri?.url ?? ''
  if (!src) return undefined

  return {
    id: mediaResource.id,
    src,
    alt: String(
      mediaResource.attributes['field_media_alt']
        ?? mediaResource.attributes['name']
        ?? ''
    ),
    title: mediaResource.attributes['name'] as string | undefined,
    width: mediaResource.attributes['field_media_width'] as number | undefined,
    height: mediaResource.attributes['field_media_height'] as number | undefined
  }
}

function getRelationship(
  resource: JsonApiResource,
  field: string
): JsonApiResourceIdentifier | undefined {
  const rel = resource.relationships?.[field]?.data
  if (!rel || Array.isArray(rel)) return undefined
  return rel
}

function fallbackToBody(node: JsonApiResource): PageSection[] {
  const body = extractProcessedText(node.attributes['body'])
  if (body) {
    return [{ type: 'wysiwyg', html: body }]
  }
  return []
}
