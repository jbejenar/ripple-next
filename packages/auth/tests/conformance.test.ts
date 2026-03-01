import { authConformance } from '@ripple-next/testing/conformance/auth.conformance'
import { MockAuthProvider } from '../providers/mock'

authConformance({
  name: 'MockAuthProvider',
  factory: () => new MockAuthProvider()
})
