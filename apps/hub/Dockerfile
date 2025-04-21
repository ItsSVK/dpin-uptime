# Use the official Bun image with alpine for builder
FROM oven/bun:1-alpine as builder

WORKDIR /app

# Install only required dependencies for building
RUN apk add --no-cache openssl

# Copy only necessary files for dependency installation
COPY package.json bun.lockb turbo.json tsconfig.json ./
COPY packages/ ./packages/
COPY apps/hub/package.json ./apps/hub/package.json

# Install dependencies and generate Prisma Client
RUN bun install && \
    cd packages/db && \
    bunx prisma generate

# Copy hub source code and build
COPY apps/hub/ ./apps/hub/
RUN cd apps/hub && \
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
COPY --from=builder /app/apps/hub/dist ./dist
COPY --from=builder /app/apps/hub/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production

# Create the start script in a verifiable way
RUN echo '#!/bin/sh' > start.sh && \
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
    echo '# Validate Pusher environment variables' >> start.sh && \
    echo 'if [ -z "$NEXT_PUBLIC_PUSHER_APP_ID" ] || \' >> start.sh && \
    echo '   [ -z "$NEXT_PUBLIC_PUSHER_APP_KEY" ] || \' >> start.sh && \
    echo '   [ -z "$NEXT_PUBLIC_PUSHER_APP_SECRET" ] || \' >> start.sh && \
    echo '   [ -z "$NEXT_PUBLIC_PUSHER_APP_CLUSTER" ]; then' >> start.sh && \
    echo '    echo "Error: Missing required Pusher environment variables"' >> start.sh && \
    echo '    exit 1' >> start.sh && \
    echo 'fi' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start the application' >> start.sh && \
    echo 'exec bun ./dist/index.js' >> start.sh && \
    chmod +x start.sh && \
    # Verify the script exists and is executable
    ls -la start.sh && \
    cat start.sh

# Expose the port the app runs on
EXPOSE 8081

# Use full path and verify script exists before starting
CMD ["/bin/sh", "-c", "ls -la /app/start.sh && /app/start.sh"] 