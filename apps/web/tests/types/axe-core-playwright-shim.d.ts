declare module '@axe-core/playwright' {
  interface AxeBuilderOptions {
    page: unknown
  }

  interface AxeResults {
    violations: Array<{
      impact: 'minor' | 'moderate' | 'serious' | 'critical' | null
      id: string
      description: string
      helpUrl: string
      nodes: Array<unknown>
    }>
  }

  export default class AxeBuilder {
    constructor(options: AxeBuilderOptions)
    withTags(tags: string[]): AxeBuilder
    analyze(): Promise<AxeResults>
  }
}
