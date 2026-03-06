import { secretsConformance } from '@ripple-next/testing/conformance/secrets.conformance'
import { MemorySecretsProvider } from '../providers/memory'

secretsConformance({
  name: 'MemorySecretsProvider',
  factory: () => new MemorySecretsProvider(),
})
