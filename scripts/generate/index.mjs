#!/usr/bin/env node
/**
 * Code Generator CLI — scaffolds convention-compliant code.
 * Implements RN-041: Code Generation Templates.
 *
 * Usage:
 *   pnpm generate:component <name> [--tier=atoms|molecules|organisms] [--dry-run]
 *   pnpm generate:provider <package> <name> [--dry-run]
 *   pnpm generate:endpoint <router> <procedure> [--dry-run]
 *   pnpm generate:package <name> [--dry-run]
 *
 * All generators support --dry-run to preview files without writing.
 * Zero external dependencies — uses only Node.js built-ins.
 */

const GENERATORS = {
  component: {
    usage: 'pnpm generate:component <name> [--tier=atoms|molecules|organisms] [--dry-run]',
    description: 'Vue SFC + test + Storybook story + index export'
  },
  provider: {
    usage: 'pnpm generate:provider <package> <name> [--dry-run]',
    description: 'Provider class + conformance test registration'
  },
  endpoint: {
    usage: 'pnpm generate:endpoint <router> <procedure> [--dry-run]',
    description: 'tRPC router + validation schema + test stub'
  },
  package: {
    usage: 'pnpm generate:package <name> [--dry-run]',
    description: 'Full package scaffold (types, index, tests, package.json, tsconfig)'
  }
}

const command = process.argv[2]

if (!command || command === '--help' || !GENERATORS[command]) {
  console.log('Ripple Next — Code Generators (RN-041)')
  console.log('───────────────────────────────────────')
  console.log()
  for (const [name, gen] of Object.entries(GENERATORS)) {
    console.log(`  ${gen.usage}`)
    console.log(`    ${gen.description}`)
    console.log()
  }
  console.log('All generators support --dry-run to preview without writing.')
  process.exit(command === '--help' ? 0 : 1)
}

// Forward remaining args to the specific generator
const remaining = process.argv.slice(3)
process.argv = [process.argv[0], process.argv[1], ...remaining]

const mod = await import(`./${command}.mjs`)

// The generator modules handle their own CLI parsing and execution
// when invoked as the main script. Since we're importing them,
// we need to call the exported function directly.
const { parseArgs } = await import('./lib.mjs')
const { positional, flags } = parseArgs(process.argv)
const dryRun = flags.has('--dry-run')

switch (command) {
  case 'component': {
    const name = positional[0]
    if (!name) {
      console.error('Usage: ' + GENERATORS.component.usage)
      process.exit(1)
    }
    const tierArg = [...flags].find((f) => f.startsWith('--tier='))
    const tier = tierArg ? tierArg.split('=')[1] : 'atoms'
    mod.generateComponent(name, { tier, dryRun })
    break
  }
  case 'provider': {
    const [pkg, name] = positional
    if (!pkg || !name) {
      console.error('Usage: ' + GENERATORS.provider.usage)
      process.exit(1)
    }
    mod.generateProvider(pkg, name, { dryRun })
    break
  }
  case 'endpoint': {
    const [router, procedure] = positional
    if (!router || !procedure) {
      console.error('Usage: ' + GENERATORS.endpoint.usage)
      process.exit(1)
    }
    mod.generateEndpoint(router, procedure, { dryRun })
    break
  }
  case 'package': {
    const name = positional[0]
    if (!name) {
      console.error('Usage: ' + GENERATORS.package.usage)
      process.exit(1)
    }
    mod.generatePackage(name, { dryRun })
    break
  }
}
