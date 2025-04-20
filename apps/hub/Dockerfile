# Use the official Bun image with alpine for builder
FROM oven/bun:1-alpine as builder

WORKDIR /app

# Install only required dependencies for building
RUN apk add --no-cache openssl

# Copy only necessary files for dependency installation
COPY package.json bun.lock turbo.json tsconfig.json ./
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

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache openssl ca-certificates

# Copy only necessary files from builder
COPY --from=builder /app/apps/hub/dist ./dist
COPY --from=builder /app/apps/hub/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production

# Create startup script with environment validation
RUN echo '#!/bin/sh\n\
\n\
# Validate DATABASE_URL\n\
if [ -z "$DATABASE_URL" ]; then\n\
    echo "Error: DATABASE_URL is not set"\n\
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
# Validate Pusher environment variables\n\
if [ -z "$NEXT_PUBLIC_PUSHER_APP_ID" ] || \n\
   [ -z "$NEXT_PUBLIC_PUSHER_APP_KEY" ] || \n\
   [ -z "$NEXT_PUBLIC_PUSHER_APP_SECRET" ] || \n\
   [ -z "$NEXT_PUBLIC_PUSHER_APP_CLUSTER" ]; then\n\
    echo "Error: Missing required Pusher environment variables"\n\
    exit 1\n\
fi\n\
\n\
# Start the application\n\
exec bun ./dist/index.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose the port the app runs on
EXPOSE 8081

# Start the application
CMD ["/app/start.sh"] 