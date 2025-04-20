# Use the official Bun image with alpine for builder
FROM oven/bun:1-alpine as builder

WORKDIR /app

# Install only required dependencies for building
RUN apk add --no-cache openssl

# Copy only necessary files for dependency installation
COPY package.json bun.lock turbo.json tsconfig.json ./
COPY packages/ ./packages/
COPY apps/poller/package.json ./apps/poller/package.json

# Install dependencies and generate Prisma Client
RUN bun install && \
    cd packages/db && \
    bunx prisma generate

# Copy poller source code and build
COPY apps/poller/ ./apps/poller/
RUN cd apps/poller && \
    bun run build && \
    # Clean up dev dependencies after build
    bun install --production

# Production stage using alpine
FROM oven/bun:1-alpine

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache openssl ca-certificates

# Copy only necessary files from builder
COPY --from=builder /app/apps/poller/dist ./dist
COPY --from=builder /app/apps/poller/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production

# Create startup script with environment validation
RUN echo '#!/bin/sh\n\
\n\
# Validate NEXT_PUBLIC_SOLANA_NETWORK\n\
if [ -z "$NEXT_PUBLIC_SOLANA_NETWORK" ]; then\n\
    echo "Error: NEXT_PUBLIC_SOLANA_NETWORK is not set"\n\
    exit 1\n\
fi\n\
\n\
# Validate DATABASE_URL format\n\
if ! echo "$DATABASE_URL" | grep -qE "^postgresql://"; then\n\
    echo "Error: DATABASE_URL must start with postgresql://"\n\
    echo "Current value: $DATABASE_URL"\n\
    exit 1\n\
fi\n\
\n\
# Validate SOLANA_KEYPAIR format\n\
if [ -z "$SOLANA_KEYPAIR" ]; then\n\
    echo "Error: SOLANA_KEYPAIR is not set"\n\
    exit 1\n\
fi\n\
\n\
# Start the application\n\
exec bun ./dist/index.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"] 