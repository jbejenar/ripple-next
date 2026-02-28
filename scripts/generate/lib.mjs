#!/usr/bin/env node
/**
 * Shared utilities for code generators.
 * Zero external dependencies — Node.js built-ins only.
 */
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export const ROOT = resolve(import.meta.dirname, '../..')

/**
 * Convert a name to PascalCase (e.g., "my-component" → "MyComponent")
 */
export function toPascalCase(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase())
}

/**
 * Convert a name to camelCase (e.g., "my-component" → "myComponent")
 */
export function toCamelCase(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase())
}

/**
 * Convert a name to kebab-case (e.g., "MyComponent" → "my-component")
 */
export function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

/**
 * Write a file, creating directories as needed.
 * In dry-run mode, prints what would be written instead.
 */
export function writeFile(absPath, content, dryRun = false) {
  const resolved = resolve(absPath)
  if (!resolved.startsWith(ROOT)) {
    throw new Error(`Path traversal blocked: ${resolved} is outside repo root`)
  }
  const relPath = resolved.replace(ROOT + '/', '')
  if (dryRun) {
    console.log(`  [dry-run] Would create: ${relPath}`)
    return
  }
  mkdirSync(dirname(resolved), { recursive: true })
  writeFileSync(resolved, content)
  console.log(`  Created: ${relPath}`)
}

/**
 * Append a line to a file if the line doesn't already exist.
 * Useful for adding exports to index.ts files.
 */
export function appendToFile(absPath, line, dryRun = false) {
  const resolved = resolve(absPath)
  if (!resolved.startsWith(ROOT)) {
    throw new Error(`Path traversal blocked: ${resolved} is outside repo root`)
  }
  const relPath = resolved.replace(ROOT + '/', '')

  // Read existing content atomically (avoids TOCTOU race vs existsSync)
  let existing
  try {
    existing = readFileSync(resolved, 'utf-8')
  } catch {
    // File does not exist — create it
    if (dryRun) {
      console.log(`  [dry-run] Would create: ${relPath}`)
      return
    }
    writeFile(resolved, line + '\n')
    return
  }

  if (existing.includes(line.trim())) {
    console.log(`  Skipped (already exists): ${relPath}`)
    return
  }

  if (dryRun) {
    console.log(`  [dry-run] Would append to: ${relPath}`)
    return
  }

  // Ensure file ends with newline before appending
  const separator = existing.endsWith('\n') ? '' : '\n'
  writeFileSync(resolved, existing + separator + line + '\n')
  console.log(`  Updated: ${relPath}`)
}

/**
 * Parse CLI args for the generators.
 * Returns { name, flags } where flags is a Set of --flag values.
 */
export function parseArgs(argv) {
  const args = argv.slice(2)
  const flags = new Set()
  const positional = []

  for (const arg of args) {
    if (arg.startsWith('--')) {
      flags.add(arg)
    } else {
      positional.push(arg)
    }
  }

  return { positional, flags, dryRun: flags.has('--dry-run') }
}
