import { authConformance } from '@ripple/testing/conformance/auth.conformance'
import { MockAuthProvider } from '../providers/mock'

authConformance({
  name: 'MockAuthProvider',
  factory: () => new MockAuthProvider()
})
