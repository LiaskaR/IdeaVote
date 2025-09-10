# Multi-platform Dockerfile optimized for macOS Podman builds
FROM --platform=$BUILDPLATFORM node:20 AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with platform-specific handling
# Force npm to install correct binaries for target platform
RUN npm config set target_platform linux && \
    npm config set target_arch x64 && \
    npm install --verbose && \
    npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for build
ENV NODE_ENV=production

# Build frontend and backend separately to avoid binary conflicts
RUN npx vite build
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Production stage
FROM node:20-slim AS runner
WORKDIR /app

# Install only production dependencies in final stage
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Create non-root user
RUN groupadd -r ideahub && useradd -r -g ideahub ideahub

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared

# Set ownership
RUN chown -R ideahub:ideahub /app

USER ideahub

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

EXPOSE 5000

CMD ["node", "dist/index.js"]