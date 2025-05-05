# Use the official Bun image with alpine for builder
FROM oven/bun:1-alpine as builder

WORKDIR /app

# Install only required dependencies for building
RUN apk add --no-cache openssl

# Copy only necessary files for dependency installation
COPY package.json bun.lockb turbo.json tsconfig.json ./
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

# Install runtime dependencies
RUN apk add --no-cache openssl ca-certificates

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/apps/poller/dist ./dist
COPY --from=builder /app/apps/poller/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production

# Create the start script in a verifiable way
RUN echo '#!/bin/sh' > start.sh && \
    echo '' >> start.sh && \
    echo '# Validate SOLANA_KEYPAIR' >> start.sh && \
    echo 'if [ -z "$SOLANA_KEYPAIR" ]; then' >> start.sh && \
    echo '    echo "Error: SOLANA_KEYPAIR is not set"' >> start.sh && \
    echo '    exit 1' >> start.sh && \
    echo 'fi' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Validate DATABASE_URL' >> start.sh && \
    echo 'if [ -z "$DATABASE_URL" ]; then' >> start.sh && \
    echo '    echo "Error: DATABASE_URL is not set"' >> start.sh && \
    echo '    exit 1' >> start.sh && \
    echo 'fi' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Validate DATABASE_URL format' >> start.sh && \
    echo 'if ! echo "$DATABASE_URL" | grep -qE "^postgresql://"; then' >> start.sh && \
    echo '    echo "Error: DATABASE_URL must start with postgresql://"' >> start.sh && \
    echo '    echo "Current value: $DATABASE_URL"' >> start.sh && \
    echo '    exit 1' >> start.sh && \
    echo 'fi' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start the application' >> start.sh && \
    echo 'exec bun ./dist/index.js' >> start.sh && \
    chmod +x start.sh && \
    # Verify the script exists and is executable
    ls -la start.sh && \
    cat start.sh

# Use full path and verify script exists before starting
CMD ["/bin/sh", "-c", "ls -la /app/start.sh && /app/start.sh"] 