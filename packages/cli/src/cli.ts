#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { statusCommand } from './commands/status.js'
import { envValidateCommand } from './commands/env-validate.js'
import { envDiffCommand } from './commands/env-diff.js'
import { dbStatusCommand } from './commands/db-status.js'
import { verifyCommand } from './commands/verify.js'

const envCommand = defineCommand({
  meta: {
    name: 'env',
    description: 'Environment management commands',
  },
  subCommands: {
    validate: envValidateCommand,
    diff: envDiffCommand,
  },
})

const dbCommand = defineCommand({
  meta: {
    name: 'db',
    description: 'Database management commands',
  },
  subCommands: {
    status: dbStatusCommand,
  },
})

const main = defineCommand({
  meta: {
    name: 'rip',
    version: '0.1.0',
    description: 'Ripple Next Platform CLI — unified agent interface',
  },
  subCommands: {
    status: statusCommand,
    env: envCommand,
    db: dbCommand,
    verify: verifyCommand,
  },
})

runMain(main)
