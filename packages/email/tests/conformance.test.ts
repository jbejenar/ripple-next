import { emailConformance } from '@ripple/testing/conformance/email.conformance'
import { MemoryEmailProvider } from '../providers/smtp'

emailConformance({
  name: 'MemoryEmailProvider',
  factory: () => new MemoryEmailProvider()
})
