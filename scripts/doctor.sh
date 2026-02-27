#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# Bootstrap Doctor — validates that a dev/agent environment can run
# the full quality-gate pipeline (install → build → lint → test).
#
# Usage:
#   pnpm doctor              # human-readable output
#   pnpm doctor -- --json    # machine-readable JSON output
#   pnpm doctor -- --offline # skip network checks (ephemeral runners)
#
# Exit codes:
#   0 — all checks passed
#   1 — one or more checks failed (details printed to stderr)
# ──────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Parse flags ───────────────────────────────────────────────────────
JSON_MODE=false
OFFLINE_MODE=false
for arg in "$@"; do
  case "$arg" in
    --json) JSON_MODE=true ;;
    --offline) OFFLINE_MODE=true ;;
  esac
done

PASS=0
FAIL=0
WARNINGS=()
CHECKS=()

pass() {
  PASS=$((PASS + 1))
  CHECKS+=("{\"name\":\"$1\",\"status\":\"pass\",\"category\":\"$2\"}")
  if [ "$JSON_MODE" = false ]; then
    echo "  ✓ $1"
  fi
}

fail() {
  FAIL=$((FAIL + 1))
  CHECKS+=("{\"name\":\"$1\",\"status\":\"fail\",\"category\":\"$2\"}")
  if [ "$JSON_MODE" = false ]; then
    echo "  ✗ $1" >&2
  fi
}

warn() {
  WARNINGS+=("$1")
  CHECKS+=("{\"name\":\"$1\",\"status\":\"warn\",\"category\":\"$2\"}")
  if [ "$JSON_MODE" = false ]; then
    echo "  ! $1"
  fi
}

section() {
  if [ "$JSON_MODE" = false ]; then
    echo ""
    echo "$1:"
  fi
}

if [ "$JSON_MODE" = false ]; then
  echo "Ripple Next — Bootstrap Doctor"
  echo "────────────────────────────────"
fi

# ── 1. Node.js ──────────────────────────────────────────────────────
section "Runtime"
if command -v node &>/dev/null; then
  NODE_VER=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 22 ]; then
    pass "Node.js $NODE_VER (>=22 required)" "runtime"
  else
    fail "Node.js $NODE_VER found — >=22.0.0 required" "runtime"
  fi
else
  fail "Node.js not found" "runtime"
fi

# ── 2. pnpm ─────────────────────────────────────────────────────────
if command -v pnpm &>/dev/null; then
  PNPM_VER=$(pnpm -v)
  PNPM_MAJOR=$(echo "$PNPM_VER" | cut -d. -f1)
  if [ "$PNPM_MAJOR" -ge 9 ]; then
    pass "pnpm $PNPM_VER (>=9 required)" "runtime"
  else
    fail "pnpm $PNPM_VER found — >=9.0.0 required" "runtime"
  fi
else
  fail "pnpm not found" "runtime"
fi

# ── 3. npm registry access ──────────────────────────────────────────
section "Network"
if [ "$OFFLINE_MODE" = true ]; then
  warn "npm registry check skipped (--offline)" "network"
else
  if npm ping --registry https://registry.npmjs.org/ &>/dev/null 2>&1; then
    pass "npm registry reachable" "network"
  else
    warn "npm registry unreachable — non-blocking, but installs may fail" "network"
  fi
fi

# ── 4. Docker (optional — needed for local dev + testcontainers) ───
section "Optional services"
if command -v docker &>/dev/null; then
  if docker info &>/dev/null 2>&1; then
    pass "Docker running" "services"
  else
    warn "Docker installed but not running — needed for local dev & testcontainers" "services"
  fi
else
  warn "Docker not installed — needed for local dev & testcontainers" "services"
fi

# ── 5. Lockfile presence ────────────────────────────────────────────
section "Repository"
if [ -f "pnpm-lock.yaml" ]; then
  pass "pnpm-lock.yaml present" "repository"
else
  fail "pnpm-lock.yaml missing — run 'pnpm install' first" "repository"
fi

# ── 6. node_modules present ─────────────────────────────────────────
if [ -d "node_modules" ]; then
  pass "node_modules installed" "repository"
else
  warn "node_modules missing — run 'pnpm install'" "repository"
fi

# ── 7. Environment contract ──────────────────────────────────────────
section "Environment"
if [ -f ".env" ] || [ -f ".env.local" ]; then
  pass "Environment file present (.env or .env.local)" "environment"
else
  if [ -f ".env.example" ]; then
    warn "No .env file — copy .env.example to .env and fill in values" "environment"
  else
    warn "No .env file or .env.example found" "environment"
  fi
fi

# Env schema validation (Zod-based) — structured diagnostics
if command -v node &>/dev/null && [ -f "scripts/validate-env.mjs" ]; then
  ENV_RESULT=$(node scripts/validate-env.mjs --json 2>/dev/null || echo "")
  if [ -n "$ENV_RESULT" ]; then
    ENV_VALID=$(echo "$ENV_RESULT" | node -e "process.stdin.on('data',d=>{const r=JSON.parse(d);process.stdout.write(String(r.valid))})" 2>/dev/null || echo "false")
    ENV_FAILED=$(echo "$ENV_RESULT" | node -e "process.stdin.on('data',d=>{const r=JSON.parse(d);process.stdout.write(String(r.failed))})" 2>/dev/null || echo "0")
    ENV_WARNINGS=$(echo "$ENV_RESULT" | node -e "process.stdin.on('data',d=>{const r=JSON.parse(d);process.stdout.write(String(r.warnings))})" 2>/dev/null || echo "0")
    if [ "$ENV_VALID" = "true" ]; then
      pass "Env schema validation passed (Zod)" "environment"
    else
      warn "Env schema: $ENV_FAILED required var(s) missing/invalid — run 'pnpm validate:env' for details" "environment"
    fi
    if [ "$ENV_WARNINGS" != "0" ]; then
      warn "Env schema: $ENV_WARNINGS optional var(s) have issues" "environment"
    fi
  else
    # Fallback to basic checks if validate-env.mjs fails
    if [ -n "${DATABASE_URL:-}" ]; then pass "DATABASE_URL set" "environment"; else warn "DATABASE_URL not set" "environment"; fi
    if [ -n "${NUXT_DATABASE_URL:-}" ]; then pass "NUXT_DATABASE_URL set" "environment"; else warn "NUXT_DATABASE_URL not set" "environment"; fi
    if [ -n "${REDIS_URL:-}" ]; then pass "REDIS_URL set" "environment"; else warn "REDIS_URL not set" "environment"; fi
  fi
else
  # Fallback: basic presence checks when Node/script not available
  if [ -n "${DATABASE_URL:-}" ]; then pass "DATABASE_URL set" "environment"; else warn "DATABASE_URL not set" "environment"; fi
  if [ -n "${NUXT_DATABASE_URL:-}" ]; then pass "NUXT_DATABASE_URL set" "environment"; else warn "NUXT_DATABASE_URL not set" "environment"; fi
  if [ -n "${REDIS_URL:-}" ]; then pass "REDIS_URL set" "environment"; else warn "REDIS_URL not set" "environment"; fi
fi

# ── 8. Turbo installed ──────────────────────────────────────────────
section "Build tooling"
if npx turbo --version &>/dev/null 2>&1; then
  pass "turbo available" "tooling"
else
  fail "turbo not available — check devDependencies" "tooling"
fi

# ── Summary ─────────────────────────────────────────────────────────
if [ "$JSON_MODE" = true ]; then
  # Build JSON array of checks
  JSON_CHECKS="["
  for i in "${!CHECKS[@]}"; do
    if [ "$i" -gt 0 ]; then
      JSON_CHECKS+=","
    fi
    JSON_CHECKS+="${CHECKS[$i]}"
  done
  JSON_CHECKS+="]"

  if [ "$FAIL" -gt 0 ]; then
    STATUS="fail"
  elif [ "${#WARNINGS[@]}" -gt 0 ]; then
    STATUS="warn"
  else
    STATUS="pass"
  fi

  cat <<ENDJSON
{"status":"$STATUS","passed":$PASS,"failed":$FAIL,"warnings":${#WARNINGS[@]},"checks":$JSON_CHECKS}
ENDJSON
  [ "$FAIL" -gt 0 ] && exit 1
  exit 0
fi

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
