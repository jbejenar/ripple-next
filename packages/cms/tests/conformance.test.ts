import { cmsConformance, createTestPage, createTestPageTwo, createDraftPage } from '@ripple/testing/conformance/cms.conformance'
import { MockCmsProvider } from '../providers/mock'

cmsConformance({
  name: 'MockCmsProvider',
  factory: () => new MockCmsProvider(),
  seed: (provider) => {
    const mock = provider as MockCmsProvider

    mock.addPage(createTestPage())
    mock.addPage(createTestPageTwo())
    mock.addPage(createDraftPage())

    mock.addVocabulary(
      { id: 'vocab-1', name: 'Topic', machineName: 'topic' },
      [
        { id: 'term-1', name: 'Topic A', vocabulary: 'topic', weight: 0 },
        { id: 'term-2', name: 'Topic B', vocabulary: 'topic', weight: 1 }
      ]
    )

    mock.addMenu({
      id: 'main',
      name: 'main',
      items: [
        { id: 'menu-1', label: 'Home', url: '/', weight: 0, children: [] },
        {
          id: 'menu-2',
          label: 'About',
          url: '/about',
          weight: 1,
          children: [
            { id: 'menu-3', label: 'Team', url: '/about/team', parent: 'menu-2', weight: 0, children: [] }
          ]
        }
      ]
    })
  }
})
