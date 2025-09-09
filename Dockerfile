# Use full Node.js 20 LTS for better compatibility
FROM node:20 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install ALL dependencies (production + dev) as the bundled server references dev dependencies
COPY package.json package-lock.json* ./
# Remove package-lock.json and install fresh to handle optional dependencies correctly
RUN rm -f package-lock.json && npm install && npm cache clean --force

# Rebuild the source code only when needed  
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application using npm script (avoids direct binary calls)
RUN npm run build

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy the built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Copy ALL node_modules (including devDependencies) as the bundled code references them
COPY --from=deps /app/node_modules ./node_modules

# Copy shared schema and other necessary files
COPY --from=builder /app/shared ./shared

USER expressjs

EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/index.js"]