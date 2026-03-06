# Downstream Consumer Risk Assessment

**Date:** 2026-03-06
**Auditor:** Downstream Compatibility Specialist
**Standard:** Can a fresh Nuxt 3 project consume @ripple-next/* packages without friction?

---

## Overall Verdict: NOT SAFE for adoption without fixes

Two packages are **BLOCKED** (cannot be consumed at all), and all packages share systemic issues (no peer dependencies, no sideEffects field, no tree-shaking).

---

## Package-by-Package Status

### @ripple-next/ui — BLOCKED

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | exports field resolves correctly |
| Type declarations | **FAIL** | `declaration: false` in tsconfig, no .d.ts output. publishConfig.exports missing `types` condition. Consumers get zero type safety. |
| Peer dependencies | **FAIL** | `vue` is a regular dependency — consumers get duplicate Vue instances, breaking reactivity, provide/inject, and teleport. `@nuxt/kit` is also regular, bloating non-Nuxt consumers. |
| Tree-shaking | **FAIL** | No `sideEffects` field. No per-component subpath exports. |
| Barrel completeness | WARN | RplNavigationList exists but is not exported (intentionally internal) |
| Published files | **FAIL** | No `files` field — entire source (tests, stories, config) published |
| Prop stability | PASS | Consistent prop naming across all components |

**Consumer Impact:** Every `import { RplButton } from '@ripple-next/ui'` will:
1. Fail TypeScript compilation (no .d.ts files)
2. Install a second copy of Vue (broken reactivity)
3. Bundle the entire library (no tree-shaking)

**Remediation Priority:** CRITICAL — fix before any downstream adoption.

### @ripple-next/testing — BLOCKED

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | **FAIL** | No publishConfig, no exports map, main points to raw .ts |
| Subpath imports | **FAIL** | READMEs document `@ripple-next/testing/conformance` but no exports map entry exists |
| Dependencies | **FAIL** | 7 workspace packages as regular deps — installs entire platform for test tooling |
| secretsConformance | **FAIL** | Not exported from conformance/index.ts |
| Build step | **FAIL** | No build script, no dist directory |

**Consumer Impact:** Cannot install or import. Every conformance test example in every provider package README is broken.

**Remediation Priority:** CRITICAL — required for downstream conformance testing.

### @ripple-next/auth — READY with caveats

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Type declarations | PASS | Types exported via source .ts entry |
| Barrel completeness | PASS | All providers and types exported |
| Peer dependencies | WARN | No peer deps declared (oauth4webapi should be peer) |
| Tree-shaking | WARN | No sideEffects field |

**Safe to adopt** for projects that also use oauth4webapi.

### @ripple-next/db — READY with caveats

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Type declarations | PASS | |
| Barrel exports | **WARN** | `export *` from schema leaks Drizzle table objects as public API. Any schema change is a breaking change. |
| Peer dependencies | WARN | drizzle-orm as regular dep risks duplication |

**Safe to adopt** but consumers should import only repositories and types, not table objects.

### @ripple-next/cms — READY

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Type declarations | PASS | |
| Barrel completeness | PASS | |
| Provider factory | PASS | createCmsProvider() with dynamic imports |

**Safe to adopt.** Cleanest package for downstream consumption.

### @ripple-next/validation — READY

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Type declarations | PASS | |
| Barrel completeness | PASS | All schemas and types exported |

**Safe to adopt.** No issues found.

### @ripple-next/queue — READY with caveats

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| BullMQ export | WARN | BullMQQueueProvider exported but bullmq in devDependencies — runtime error for consumers who instantiate it |
| Tree-shaking | WARN | No sideEffects field |

### @ripple-next/email — READY with caveats

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Naming | WARN | MemoryEmailProvider defined in `smtp.ts` — confusing for consumers |
| Peer dependencies | WARN | @aws-sdk/client-ses as regular dep |

### @ripple-next/storage — READY with caveats

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Peer dependencies | WARN | @aws-sdk/client-s3 as regular dep |

### @ripple-next/events — READY with caveats

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Peer dependencies | WARN | @aws-sdk/client-eventbridge as regular dep |

### @ripple-next/secrets — READY with caveats

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Conformance | WARN | secretsConformance not in testing barrel |

### @ripple-next/config — READY

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |

### @ripple-next/shared — READY with caveats

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Barrel exports | WARN | `export *` — fragile, any new export auto-becomes public API |

### @ripple-next/cli — READY (dev dependency)

| Dimension | Status | Issue |
|-----------|--------|-------|
| Package resolution | PASS | |
| Usage | PASS | CLI is a dev dependency, not a runtime import |

---

## Critical Documentation Issue

**docs/consumer-app-guide.md line 58** instructs consumers to create `.npmrc` with:
```
@ripple:registry=https://npm.pkg.github.com
```

This is **wrong**. All packages are scoped as `@ripple-next/*`, not `@ripple/*`. The correct line is:
```
@ripple-next:registry=https://npm.pkg.github.com
```

This is the **first step** of the adoption guide and it causes every `pnpm install` to fail with 404 errors. **Severity: CRITICAL.**

---

## Systemic Issues Affecting All Packages

### 1. No peerDependencies anywhere
Zero of 14 packages declare peer dependencies. Framework libraries (vue), ORM libraries (drizzle-orm), and validation libraries (zod) should be peers to prevent duplication.

### 2. No sideEffects field
Zero of 14 packages declare `"sideEffects": false`. Bundlers cannot tree-shake unused exports.

### 3. Source-as-entry-point pattern
Most packages use `"main": "./index.ts"` pointing to raw TypeScript. This works in the monorepo (where TypeScript is compiled by the consumer's bundler) but may fail for consumers not using a TypeScript-aware bundler. The `publishConfig` in some packages correctly overrides this for npm, but not all packages have publishConfig.

---

## Recommended Workarounds for Known Issues

### For consumers adopting NOW (before fixes):

1. **UI types:** Use `// @ts-ignore` or create manual `.d.ts` declarations for used components
2. **Vue duplication:** Add `vue` to `pnpm.overrides` in consumer's package.json to force single copy
3. **Tree-shaking:** Import components directly from source paths: `import RplButton from '@ripple-next/ui/components/atoms/RplButton.vue'`
4. **Testing conformance:** Import directly from file path: `import { queueConformance } from '@ripple-next/testing/conformance/queue.conformance'`
5. **.npmrc scope:** Use `@ripple-next:registry=...` (not `@ripple:`)

### Components Safe to Adopt Now

All 55 exported UI components are functionally complete and tested. Once the type declaration and peer dependency issues are fixed, they are production-ready. The accessibility audit found issues in specific components (see full audit) but the majority pass WCAG 2.1 AA.

### Components to Defer

- **RplMediaEmbed** — missing focus trap in fullscreen dialog (CRITICAL a11y issue)
- **RplMediaGallery** — missing focus trap in lightbox (HIGH a11y issue)
- **RplCallToAction** — passes `href` to RplButton which doesn't support it (functional bug)
- **RplCardCollection** — passes `link` prop instead of `href` to RplCard (functional bug)
