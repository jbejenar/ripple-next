#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# Bootstrap Doctor — validates that a dev/agent environment can run
# the full quality-gate pipeline (install → build → lint → test).
#
# Usage:
#   pnpm doctor          # from repo root
#   ./scripts/doctor.sh  # directly
#
# Exit codes:
#   0 — all checks passed
#   1 — one or more checks failed (details printed to stderr)
# ──────────────────────────────────────────────────────────────────────
set -euo pipefail

PASS=0
FAIL=0
WARNINGS=()

pass() { PASS=$((PASS + 1)); echo "  ✓ $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  ✗ $1" >&2; }
warn() { WARNINGS+=("$1"); echo "  ! $1"; }

echo "Ripple Next — Bootstrap Doctor"
echo "────────────────────────────────"

# ── 1. Node.js ──────────────────────────────────────────────────────
echo ""
echo "Runtime:"
if command -v node &>/dev/null; then
  NODE_VER=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 22 ]; then
    pass "Node.js $NODE_VER (>=22 required)"
  else
    fail "Node.js $NODE_VER found — >=22.0.0 required"
  fi
else
  fail "Node.js not found"
fi

# ── 2. pnpm ─────────────────────────────────────────────────────────
if command -v pnpm &>/dev/null; then
  PNPM_VER=$(pnpm -v)
  PNPM_MAJOR=$(echo "$PNPM_VER" | cut -d. -f1)
  if [ "$PNPM_MAJOR" -ge 9 ]; then
    pass "pnpm $PNPM_VER (>=9 required)"
  else
    fail "pnpm $PNPM_VER found — >=9.0.0 required"
  fi
else
  fail "pnpm not found"
fi

# ── 3. npm registry access ──────────────────────────────────────────
echo ""
echo "Network:"
if npm ping --registry https://registry.npmjs.org/ &>/dev/null 2>&1; then
  pass "npm registry reachable"
else
  fail "npm registry unreachable — check network / .npmrc / proxy"
fi

# ── 4. Docker (optional — needed for local dev + testcontainers) ───
echo ""
echo "Optional services:"
if command -v docker &>/dev/null; then
  if docker info &>/dev/null 2>&1; then
    pass "Docker running"
  else
    warn "Docker installed but not running — needed for local dev & testcontainers"
  fi
else
  warn "Docker not installed — needed for local dev & testcontainers"
fi

# ── 5. Lockfile presence ────────────────────────────────────────────
echo ""
echo "Repository:"
if [ -f "pnpm-lock.yaml" ]; then
  pass "pnpm-lock.yaml present"
else
  fail "pnpm-lock.yaml missing — run 'pnpm install' first"
fi

# ── 6. node_modules present ─────────────────────────────────────────
if [ -d "node_modules" ]; then
  pass "node_modules installed"
else
  warn "node_modules missing — run 'pnpm install'"
fi

# ── 7. Environment variables (optional) ─────────────────────────────
echo ""
echo "Environment:"
if [ -n "${DATABASE_URL:-}" ]; then
  pass "DATABASE_URL set"
else
  warn "DATABASE_URL not set — needed for DB commands & integration tests"
fi

if [ -n "${REDIS_URL:-}" ]; then
  pass "REDIS_URL set"
else
  warn "REDIS_URL not set — needed for BullMQ queue provider"
fi

# ── 8. Turbo installed ──────────────────────────────────────────────
echo ""
echo "Build tooling:"
if npx turbo --version &>/dev/null 2>&1; then
  pass "turbo available"
else
  fail "turbo not available — check devDependencies"
fi

# ── Summary ─────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────"
echo "Results: $PASS passed, $FAIL failed, ${#WARNINGS[@]} warnings"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Fix the failures above before running quality gates."
  exit 1
fi

if [ "${#WARNINGS[@]}" -gt 0 ]; then
  echo ""
  echo "Warnings are non-blocking but may affect some workflows."
fi

echo ""
echo "Environment ready."
exit 0
