# Use the official Bun image with alpine for builder
FROM oven/bun:1-alpine as builder

WORKDIR /app

# Install only required dependencies for building
RUN apk add --no-cache openssl

# Copy only necessary files for dependency installation
COPY package.json bun.lock turbo.json tsconfig.json ./
COPY packages/ ./packages/
COPY apps/validator/package.json ./apps/validator/package.json

# Install dependencies and generate Prisma Client
RUN bun install && \
    cd packages/db && \
    bunx prisma generate

# Copy validator source code and build
COPY apps/validator/ ./apps/validator/
RUN cd apps/validator && \
    bun run build && \
    # Clean up dev dependencies after build
    bun install --production

# Production stage using alpine
FROM oven/bun:1-alpine

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache openssl ca-certificates

# Copy only necessary files from builder
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