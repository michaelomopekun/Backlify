FROM node:20-bookworm-slim AS base

WORKDIR /app

# 1. Copy package manifests
COPY package.json package-lock.json ./
COPY package/shared/package.json ./package/shared/
COPY package/db/package.json ./package/db/
COPY app/web/package.json ./app/web/

# 2. Install dependencies
RUN npm ci --workspace=shared --workspace=db --workspace=web

# 3. Copy source code
COPY package/shared ./package/shared
COPY package/db ./package/db
COPY app/web ./app/web

# 4. Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=web

# 5. Production runner
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=web"]
