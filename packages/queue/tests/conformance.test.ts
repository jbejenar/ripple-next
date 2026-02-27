import { queueConformance } from '@ripple/testing/conformance/queue.conformance'
import { MemoryQueueProvider } from '../providers/memory'

queueConformance({
  name: 'MemoryQueueProvider',
  factory: () => new MemoryQueueProvider()
})
