#!/bin/bash
set -e

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Waiting for Postgres..."
until pg_isready -h postgres -U app 2>/dev/null; do sleep 1; done

echo "Running migrations..."
pnpm db:migrate

echo "Seeding database..."
pnpm db:seed

echo "Preparing Nuxt types..."
cd apps/web && npx nuxi prepare && cd ../..

echo "Creating MinIO bucket..."
mc alias set local http://minio:9000 minioadmin minioadmin 2>/dev/null || true
mc mb local/app-dev 2>/dev/null || true

echo "Environment ready!"
echo "Run 'pnpm dev' to start, 'pnpm test' to test"
