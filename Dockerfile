# Dockerfile optimized for macOS (ARM64/x64) builds
FROM node:20-alpine AS base

# Install build dependencies for macOS compatibility
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with native architecture detection
# Let npm automatically detect and install correct binaries for the host platform
RUN npm ci --include=optional && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build for production
ENV NODE_ENV=production

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Copy only production node_modules (optional dependencies included)
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production \
    PORT=5000 \
    HOSTNAME=0.0.0.0

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]