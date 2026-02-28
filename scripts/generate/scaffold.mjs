#!/usr/bin/env node
/**
 * Project Scaffold Generator — bootstraps a downstream repository with
 * the full ripple-next DX infrastructure (AI-first docs, quality gates,
 * CI/CD, documentation structure, config files).
 *
 * Usage:
 *   pnpm generate:scaffold <target-dir> [options]
 *
 * Options:
 *   --name=<project-name>       Project name (default: directory basename)
 *   --org=<github-org>          GitHub org (default: "your-org")
 *   --description=<text>        Project description (default: "A downstream project")
 *   --dry-run                   Preview without writing files
 *   --force                     Overwrite existing files
 *
 * Examples:
 *   pnpm generate:scaffold /tmp/my-gov-site --name=my-gov-site --org=vic-gov
 *   pnpm generate:scaffold ./downstream --dry-run
 *   pnpm generate:scaffold /path/to/repo --force
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { resolve, basename } from 'node:path'
import { existsSync } from 'node:fs'
import { parseArgs } from './lib.mjs'
import { scaffoldAi } from './scaffold/ai.mjs'
import { scaffoldDocs } from './scaffold/docs.mjs'
import { scaffoldScripts } from './scaffold/scripts.mjs'
import { scaffoldCi } from './scaffold/ci.mjs'
import { scaffoldConfig } from './scaffold/config.mjs'

/**
 * Parse a --key=value flag from a Set of flags.
 */
function getFlagValue(flags, prefix) {
  for (const flag of flags) {
    if (flag.startsWith(prefix)) {
      return flag.slice(prefix.length)
    }
  }
  return null
}

export function generateScaffold(targetDir, options = {}) {
  const resolved = resolve(targetDir)

  if (!existsSync(resolved)) {
    console.error(`Error: Target directory does not exist: ${resolved}`)
    console.error('Create it first, then run the scaffold generator.')
    process.exit(1)
  }

  const config = {
    name: options.name || basename(resolved),
    org: options.org || 'your-org',
    description: options.description || 'A downstream project built on ripple-next conventions',
  }

  const genOptions = {
    dryRun: options.dryRun || false,
    force: options.force || false,
  }

  const modeLabel = genOptions.dryRun ? ' (dry-run)' : ''
  console.log(`\nScaffolding project: ${config.name}${modeLabel}`)
  console.log('Target: ' + resolved)
  console.log('═'.repeat(50))

  // Run all category generators
  scaffoldAi(resolved, config, genOptions)
  scaffoldDocs(resolved, config, genOptions)
  scaffoldScripts(resolved, config, genOptions)
  scaffoldCi(resolved, config, genOptions)
  scaffoldConfig(resolved, config, genOptions)

  // Summary
  console.log('\n' + '═'.repeat(50))
  console.log(`\nDone! Project "${config.name}" has been scaffolded.`)
  console.log('\nNext steps:')
  console.log(`  1. cd ${resolved}`)
  console.log('  2. git init (if not already a git repo)')
  console.log('  3. pnpm init (if no package.json yet)')
  console.log('  4. Copy .env.example to .env and fill in values')
  console.log('  5. Update CODEOWNERS with your team')
  console.log('  6. Review and customize CLAUDE.md and AGENTS.md')
  console.log('  7. Run: pnpm doctor')
  console.log('  8. Run: pnpm verify')
  console.log('\nFor ongoing governance, use fleet-sync:')
  console.log(`  pnpm check:fleet-drift -- --target=${resolved}`)
}

// CLI entrypoint
if (process.argv[1]?.endsWith('scaffold.mjs')) {
  const { positional, flags } = parseArgs(process.argv)
  const target = positional[0]

  if (!target) {
    console.error('Usage: pnpm generate:scaffold <target-dir> [options]')
    console.error('')
    console.error('Options:')
    console.error('  --name=<project-name>       Project name (default: directory basename)')
    console.error('  --org=<github-org>          GitHub org (default: "your-org")')
    console.error('  --description=<text>        Project description')
    console.error('  --dry-run                   Preview without writing files')
    console.error('  --force                     Overwrite existing files')
    process.exit(1)
  }

  generateScaffold(target, {
    name: getFlagValue(flags, '--name='),
    org: getFlagValue(flags, '--org='),
    description: getFlagValue(flags, '--description='),
    dryRun: flags.has('--dry-run'),
    force: flags.has('--force'),
  })
}
