# ==========================================
# Stage 1: 构建阶段 (Builder)
# ==========================================
FROM node:20 AS builder

RUN npm install -g pnpm@9
WORKDIR /app

# 1. 复制依赖定义
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/core/package.json ./apps/core/
COPY apps/electron/package.json ./apps/electron/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/fs/package.json ./packages/fs/
COPY packages/jit/package.json ./packages/jit/
COPY packages/server/package.json ./packages/server/

# 2. 安装所有依赖
RUN pnpm install --frozen-lockfile

# 3. 复制源码
COPY . .

# 4. 构建核心
RUN pnpm build:full

# 5. 构建文件服务
RUN cd packages/fs && pnpm build

# 6. 构建大厅服务
RUN pnpm -F @noname/server build

# ==========================================
# Stage 2: 运行阶段 (Runner)
# ==========================================
FROM node:20-alpine

ENV NODE_ENV=production

RUN npm install -g pm2
WORKDIR /app

# 1. 复制核心构建产物
COPY --from=builder /app/apps/core/dist ./

# 2. 复制文件服务构建产物
COPY --from=builder /app/packages/fs/dist ./packages/fs/dist
COPY --from=builder /app/packages/fs/package.json ./packages/fs/package.json

# 3. 复制大厅服务
COPY --from=builder /app/packages/server/dist ./packages/server/dist

# 4. 复制脚本
COPY process.yml ./
COPY http-server.js ./

# 5. 准备运行环境
RUN echo '{"type": "module"}' > package.json

# 6. 安装运行时依赖
RUN npm install --omit=dev ws fastify @fastify/cors @fastify/static minimist vue@^3.5.27

# 7. 创建 vue 软链接
RUN ln -s node_modules/vue vue

# 8. 调试：列出 mode 目录结构，帮助排查 missing file 问题
# (这会在构建日志中显示 /app/mode 下到底有什么文件)
RUN echo "=== Listing /app/mode contents ===" && \
    ls -R /app/mode || echo "Mode directory missing"

EXPOSE 80
EXPOSE 8082

CMD ["pm2-runtime", "process.yml"]