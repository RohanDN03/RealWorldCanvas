FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/ws-backend/package.json ./apps/ws-backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY apps/ws-backend ./apps/ws-backend

# Build packages first
RUN pnpm --filter @repo/common build
RUN pnpm --filter @repo/backend-common build
RUN pnpm --filter @repo/db build

# Build the backend
RUN pnpm --filter ws-backend build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/ws-backend/dist ./apps/ws-backend/dist
COPY --from=builder /app/apps/ws-backend/package.json ./apps/ws-backend/

WORKDIR /app/apps/ws-backend

EXPOSE 8080
ENV PORT=8080

CMD ["node", "dist/index.js"]
