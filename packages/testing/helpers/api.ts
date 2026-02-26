/**
 * Test API client helpers.
 * Will be extended when tRPC test utils are configured.
 */
export interface TestContext {
  baseUrl: string
  cleanup: () => Promise<void>
}

export async function createTestContext(): Promise<TestContext> {
  // Will be implemented to spin up Nitro test server
  return {
    baseUrl: 'http://localhost:3000',
    cleanup: async () => {
      // Cleanup resources
    }
  }
}
