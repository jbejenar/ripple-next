import type { Meta, StoryObj } from '@storybook/vue3'
import RplDocumentDownload from './RplDocumentDownload.vue'

const meta: Meta<typeof RplDocumentDownload> = {
  title: 'Molecules/RplDocumentDownload',
  component: RplDocumentDownload,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplDocumentDownload>

export const Default: Story = {
  args: {
    title: 'Related Documents',
    documents: [
      {
        id: '1',
        name: 'Annual Report 2025.pdf',
        url: '/files/annual-report-2025.pdf',
        size: 2457600,
        mimeType: 'application/pdf',
        description: 'Annual report for the Victorian Government financial year 2024-25.'
      },
      {
        id: '2',
        name: 'Budget Summary FY2025.xlsx',
        url: '/files/budget-summary.xlsx',
        size: 156000,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        updated: '2025-12-15'
      },
      {
        id: '3',
        name: 'Policy Guidelines v3.docx',
        url: '/files/policy-guidelines.docx',
        size: 89000,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        description: 'Updated policy guidelines for government departments.'
      }
    ]
  }
}

export const WithoutTitle: Story = {
  args: {
    documents: [
      {
        id: '1',
        name: 'Media Kit.zip',
        url: '/files/media-kit.zip',
        size: 15728640,
        mimeType: 'application/zip',
        description: 'Complete media kit with logos, photos, and brand guidelines.'
      }
    ]
  }
}

export const MixedFileTypes: Story = {
  args: {
    title: 'Downloads',
    documents: [
      {
        id: '1',
        name: 'Presentation.pptx',
        url: '/files/presentation.pptx',
        size: 4500000,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      },
      {
        id: '2',
        name: 'Data Export.csv',
        url: '/files/data.csv',
        size: 12000,
        mimeType: 'text/csv'
      },
      {
        id: '3',
        name: 'Site Photo.jpg',
        url: '/files/photo.jpg',
        size: 890000,
        mimeType: 'image/jpeg',
        description: 'High-resolution photograph of the project site.'
      }
    ]
  }
}
