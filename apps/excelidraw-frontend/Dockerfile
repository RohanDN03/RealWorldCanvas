FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/excelidraw-frontend/package.json ./apps/excelidraw-frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# Build packages first
RUN pnpm --filter @repo/common build
RUN pnpm --filter @repo/db build
RUN pnpm --filter @repo/ui build

# Build the frontend
RUN pnpm --filter excelidraw-frontend build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/excelidraw-frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/excelidraw-frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/excelidraw-frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
