# Use the official Bun image
FROM oven/bun:1 as builder

WORKDIR /app

# Install required system dependencies
RUN apt-get update && \
    apt-get install -y curl openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy monorepo configuration files
COPY package.json ./
COPY bun.lock ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy packages directory for shared dependencies
COPY packages/ ./packages/

# Copy hub package.json
COPY apps/hub/package.json ./apps/hub/package.json

# Install dependencies
RUN bun install

# Generate Prisma Client
RUN cd packages/db && bunx prisma generate

# Copy hub source code
COPY apps/hub/ ./apps/hub/

# Build the application
RUN cd apps/hub && bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Install OpenSSL 3.0
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy built files and dependencies
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