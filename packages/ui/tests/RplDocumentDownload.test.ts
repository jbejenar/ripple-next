import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplDocumentDownload from '../components/molecules/RplDocumentDownload.vue'

const documents = [
  {
    id: '1',
    name: 'Annual Report 2025.pdf',
    url: '/files/annual-report-2025.pdf',
    size: 2457600,
    mimeType: 'application/pdf',
    description: 'Annual report for the Victorian Government 2025'
  },
  {
    id: '2',
    name: 'Budget Summary.xlsx',
    url: '/files/budget-summary.xlsx',
    size: 156000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    updated: '2025-12-15'
  },
  {
    id: '3',
    name: 'Policy Guidelines.docx',
    url: '/files/policy-guidelines.docx',
    size: 89000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
]

describe('RplDocumentDownload', () => {
  it('renders all documents', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const items = wrapper.findAll('.rpl-document-download__item')
    expect(items).toHaveLength(3)
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents, title: 'Downloads' }
    })
    expect(wrapper.find('.rpl-document-download__title').text()).toBe('Downloads')
  })

  it('hides title when not provided', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    expect(wrapper.find('.rpl-document-download__title').exists()).toBe(false)
  })

  it('renders document names', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const names = wrapper.findAll('.rpl-document-download__name')
    expect(names[0].text()).toBe('Annual Report 2025.pdf')
    expect(names[1].text()).toBe('Budget Summary.xlsx')
  })

  it('renders download links with href', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const links = wrapper.findAll('.rpl-document-download__link')
    expect(links[0].attributes('href')).toBe('/files/annual-report-2025.pdf')
    expect(links[0].attributes('download')).toBe('Annual Report 2025.pdf')
  })

  it('renders file type icons with correct labels', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const icons = wrapper.findAll('.rpl-document-download__icon')
    expect(icons[0].text()).toBe('PDF')
    expect(icons[1].text()).toBe('XLSX')
    expect(icons[2].text()).toBe('DOCX')
  })

  it('applies correct icon class for PDF', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const icon = wrapper.find('.rpl-document-download__icon')
    expect(icon.classes()).toContain('rpl-document-download__icon--pdf')
  })

  it('applies correct icon class for Excel', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents: [documents[1]] }
    })
    const icon = wrapper.find('.rpl-document-download__icon')
    expect(icon.classes()).toContain('rpl-document-download__icon--xls')
  })

  it('formats file size correctly', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const meta = wrapper.findAll('.rpl-document-download__meta')
    expect(meta[0].text()).toContain('2.3 MB')
    expect(meta[1].text()).toContain('152.3 KB')
  })

  it('renders description when provided', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const descriptions = wrapper.findAll('.rpl-document-download__description')
    expect(descriptions).toHaveLength(1)
    expect(descriptions[0].text()).toBe('Annual report for the Victorian Government 2025')
  })

  it('renders updated date when provided', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const meta = wrapper.findAll('.rpl-document-download__meta')
    expect(meta[1].text()).toContain('2025-12-15')
  })

  it('has accessible aria-label on links', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const link = wrapper.find('.rpl-document-download__link')
    expect(link.attributes('aria-label')).toBe('Download Annual Report 2025.pdf (PDF, 2.3 MB)')
  })

  it('uses role="list" for document list', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    expect(wrapper.find('.rpl-document-download__list').attributes('role')).toBe('list')
  })

  it('uses section with aria-label', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents, title: 'Reports' }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Reports')
  })

  it('defaults aria-label to Documents when no title', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Documents')
  })

  it('hides icon from assistive technology', () => {
    const wrapper = mount(RplDocumentDownload, {
      props: { documents }
    })
    const icon = wrapper.find('.rpl-document-download__icon')
    expect(icon.attributes('aria-hidden')).toBe('true')
  })
})
