import { eventBusConformance } from '@ripple-next/testing/conformance/events.conformance'
import { MemoryEventBus } from '../bus'

eventBusConformance({
  name: 'MemoryEventBus',
  factory: () => new MemoryEventBus()
})
