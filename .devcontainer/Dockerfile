FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install pnpm
RUN corepack enable pnpm

# Install PostgreSQL client (for pg_isready and migrations)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
