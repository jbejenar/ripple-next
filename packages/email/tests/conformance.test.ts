import { emailConformance } from '@ripple-next/testing/conformance/email.conformance'
import { MemoryEmailProvider } from '../providers/smtp'

emailConformance({
  name: 'MemoryEmailProvider',
  factory: () => new MemoryEmailProvider()
})
