FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/https-backend/package.json ./apps/https-backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY apps/https-backend ./apps/https-backend

# Build packages first
RUN pnpm --filter @repo/common build
RUN pnpm --filter @repo/backend-common build
RUN pnpm --filter @repo/db build

# Build the backend
RUN pnpm --filter https-backend build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/https-backend/dist ./apps/https-backend/dist
COPY --from=builder /app/apps/https-backend/package.json ./apps/https-backend/

WORKDIR /app/apps/https-backend

EXPOSE 3002
ENV PORT=3002

CMD ["node", "dist/index.js"]
