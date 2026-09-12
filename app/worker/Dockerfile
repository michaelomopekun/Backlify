FROM node:20-bookworm-slim AS base

# Install official PostgreSQL 17 client tools (pg_dump & pg_restore)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    lsb-release \
    && install -d /etc/apt/keyrings \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client-17 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Copy workspace manifests for optimal Docker layer caching
COPY package.json package-lock.json ./
COPY package/shared/package.json ./package/shared/
COPY package/db/package.json ./package/db/
COPY app/worker/package.json ./app/worker/

# 2. Install dependencies for worker and its internal workspace dependencies
RUN npm ci --workspace=shared --workspace=db --workspace=worker

# 3. Copy source code
COPY package/shared ./package/shared
COPY package/db ./package/db
COPY app/worker ./app/worker

# 4. Create directory for temp dump files
RUN mkdir -p /app/app/worker/src/temp

# 5. Build worker TypeScript
RUN npm run build --workspace=worker

# 6. Prune devDependencies to minimize RAM and disk consumption
RUN npm prune --omit=dev --workspace=shared --workspace=db --workspace=worker && npm cache clean --force

# 7. Set production environment defaults
ENV NODE_ENV=production
ENV PG_DUMP_PATH=pg_dump
ENV PG_RESTORE_PATH=pg_restore

# 8. Enforce Node.js memory safety for 512MB container environments
# Caps V8 heap at 384MB so it never triggers OOM-killer (leaves 128MB for OS & pg_dump)
ENV NODE_OPTIONS="--max-old-space-size=384"
ENV PORT=8080

EXPOSE 8080

# 9. Start the worker daemon using the pre-compiled production bundle
WORKDIR /app/app/worker
CMD ["node", "dist/index.js"]


