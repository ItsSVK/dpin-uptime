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
COPY apps/validator/package.json ./apps/validator/package.json

# Install dependencies
RUN bun install

# Generate Prisma Client
RUN cd packages/db && bunx prisma generate

# Copy hub source code
COPY apps/validator/ ./apps/validator/

# Build the application
RUN cd apps/validator && bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Install OpenSSL 3.0
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy built files and dependencies
COPY --from=builder /app/apps/validator/dist ./dist
COPY --from=builder /app/apps/validator/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production

# Create startup script with environment validation
RUN echo '#!/bin/sh\n\
\n\
# Validate PRIVATE_KEY\n\
if [ -z "$PRIVATE_KEY" ]; then\n\
    echo "Error: PRIVATE_KEY is not set"\n\
    exit 1\n\
fi\n\
\n\
# Validate HUB_URL\n\
if [ -z "$HUB_URL" ]; then\n\
    echo "Error: HUB_URL is not set"\n\
    exit 1\n\
fi\n\
\n\
# Start the application\n\
exec bun ./dist/index.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"] 