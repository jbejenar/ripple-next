import { eventBusConformance } from '@ripple/testing/conformance/events.conformance'
import { MemoryEventBus } from '../bus'

eventBusConformance({
  name: 'MemoryEventBus',
  factory: () => new MemoryEventBus()
})
