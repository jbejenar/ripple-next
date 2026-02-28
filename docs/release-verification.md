# Release Verification

> Part of RN-027 | See [ADR-010](adr/010-ci-observability-supply-chain.md) for supply chain strategy

## Overview

Every `@ripple/*` package release includes:

1. **SHA-256 checksums** for all dist files (`release-checksums.json`)
2. **SBOM** in CycloneDX JSON format (`sbom.cdx.json`)
3. **Build provenance attestation** via GitHub's sigstore-backed attestation service

These artifacts allow consumers to verify that installed packages match
exactly what was built and published in the CI pipeline.

## For Package Maintainers

### Generating Checksums

Checksums are generated automatically in the release workflow. To generate
them locally (e.g., for pre-release validation):

```bash
# Build all packages first
pnpm build

# Generate checksums
pnpm verify:release -- --generate

# Output: release-checksums.json
```

### Checksums Schema (`ripple-release-checksums/v1`)

```json
{
  "schema": "ripple-release-checksums/v1",
  "timestamp": "ISO-8601",
  "generator": "verify-release.mjs --generate",
  "packages": [
    {
      "name": "@ripple/auth",
      "version": "0.2.0",
      "checksums": {
        "dist/index.js": "sha256-hex...",
        "dist/index.d.ts": "sha256-hex..."
      }
    }
  ]
}
```

## For Package Consumers

### Verifying Installed Packages

After installing `@ripple/*` packages in your project:

```bash
# Verify against a checksums manifest
pnpm verify:release -- --checksums=path/to/release-checksums.json

# JSON output for CI
pnpm verify:release -- --checksums=path/to/release-checksums.json --json
```

### Verification Report Schema (`ripple-release-verification/v1`)

```json
{
  "schema": "ripple-release-verification/v1",
  "timestamp": "ISO-8601",
  "status": "pass | fail | warning",
  "checksumsSource": "release-checksums.json",
  "packages": [
    {
      "name": "@ripple/auth",
      "version": "0.2.0",
      "status": "verified",
      "reason": "All checksums match"
    }
  ],
  "summary": {
    "total": 10,
    "verified": 10,
    "failed": 0,
    "skipped": 0
  }
}
```

### Package Statuses

| Status | Meaning |
|--------|---------|
| `verified` | All file checksums match the manifest |
| `failed` | One or more files differ from the manifest |
| `computed` | Checksums computed but no manifest to verify against |
| `skipped` | Package not installed or not built |
| `warning` | Package not found in checksums manifest |

### Verifying Build Provenance

GitHub build provenance attestations can be verified using the GitHub CLI:

```bash
# Verify attestation for a specific artifact
gh attestation verify release-checksums.json --repo jbejenar/ripple-next

# Verify SBOM attestation
gh attestation verify sbom.cdx.json --repo jbejenar/ripple-next
```

This confirms that the artifact was produced by the CI pipeline in the
expected repository, branch, and workflow.

## CI Integration

### In the Release Workflow

The release workflow automatically:

1. Builds all packages (`pnpm build`)
2. Validates exports (smoke test)
3. Generates SBOM (`sbom.cdx.json`)
4. Generates package checksums (`release-checksums.json`)
5. Attests both SBOM and checksums with build provenance
6. Publishes packages via changesets
7. Attests published dist/ directories

### In Consumer CI Pipelines

Add verification to your CI pipeline:

```yaml
- name: Verify @ripple/* package integrity
  run: |
    # Download checksums from the latest release
    gh release download --repo jbejenar/ripple-next --pattern release-checksums.json
    pnpm verify:release -- --checksums=release-checksums.json --json
```

### CLI Flags

| Flag | Description |
|------|-------------|
| `--json` | Emit JSON to stdout |
| `--ci` | Write `release-verification.json` for CI artifact upload |
| `--generate` | Generate checksums for current build (maintainer use) |
| `--checksums=path` | Verify against a specific checksums manifest |
| `--output=path` | Write output to a specific file |

## Release Artifacts

| Artifact | Format | Retention | Purpose |
|----------|--------|-----------|---------|
| `release-checksums` | `ripple-release-checksums/v1` JSON | 90 days | Per-file SHA-256 digests |
| `sbom-cyclonedx` | CycloneDX JSON | 90 days | Software bill of materials |
| Build attestation | Sigstore bundle | Permanent | Tamper-proof build provenance |

## Security Model

- **Checksums** provide integrity verification — detect tampering or corruption
- **SBOM** provides dependency transparency — know what's in each package
- **Build provenance** provides origin verification — confirm CI built the artifact
- All three together provide strong supply chain assurance for consumers
- No secrets or signing keys are needed — GitHub's OIDC-backed sigstore handles signing
