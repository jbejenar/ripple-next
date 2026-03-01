import { queueConformance } from '@ripple-next/testing/conformance/queue.conformance'
import { MemoryQueueProvider } from '../providers/memory'

queueConformance({
  name: 'MemoryQueueProvider',
  factory: () => new MemoryQueueProvider()
})
