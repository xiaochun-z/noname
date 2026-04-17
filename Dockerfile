# ========================================================================
# Stage 1: Build Stage
# ========================================================================
FROM node:24 AS builder

RUN npm install -g pnpm@9
WORKDIR /app

# Copy package definitions
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/core/package.json ./apps/core/
COPY apps/electron/package.json ./apps/electron/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/fs/package.json ./packages/fs/
COPY packages/jit/package.json ./packages/jit/
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build core application
RUN pnpm build

# Build file server package
RUN cd packages/fs && pnpm build

# Build ws server package
RUN cd packages/server && pnpm build

# ========================================================================
# Stage 2: Runtime Stage
# ========================================================================
FROM node:24-alpine

ENV NODE_ENV=production

RUN npm install -g pm2
WORKDIR /app

# Copy core build artifacts
COPY --from=builder /app/apps/core/dist ./

# Copy file server build artifacts
COPY --from=builder /app/packages/fs/dist ./packages/fs/dist
COPY --from=builder /app/packages/fs/package.json ./packages/fs/package.json

# Copy ws server build artifacts
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json

# Copy and rename game lobby server (from .js to .cjs for direct execution)
COPY --from=builder /app/server.js ./server.cjs

# Copy configuration scripts
COPY process.yml ./
COPY http-server.js ./
COPY apps/core/image/ ./image/
COPY apps/core/audio/ ./audio/
COPY apps/core/font/ ./font/
COPY apps/core/extension/ ./extension/

# Prepare runtime environment
RUN echo '{"type": "module"}' > package.json

# Install runtime dependencies
RUN npm install --omit=dev ws fastify @fastify/cors @fastify/static minimist vue@^3.5.27

# Create Vue symlink for importmap compatibility
RUN ln -s node_modules/vue/dist/vue.esm-browser.prod.js vue.js || \
    ln -s node_modules/vue/dist/vue.esm-browser.js vue.js

# Debug: list directory structure for troubleshooting
RUN echo "=== Listing /app/src ===" && \
    ls -la /app/src || echo "src directory missing" && \
    echo "=== Listing /app/ ===" && \
    ls -la /app/

EXPOSE 80
EXPOSE 8080

CMD ["pm2-runtime", "process.yml"]