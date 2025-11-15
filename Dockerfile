# 使用官方 Node.js 镜像作为基础镜像
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# 安装项目依赖
RUN npm ci

# 构建阶段
FROM base AS builder
WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建 Next.js 应用
# 禁用遥测数据收集
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户来运行应用(提高安全性)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# 复制 Next.js 构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# 切换到非 root 用户
USER nextjs

# 暴露端口 6067
EXPOSE 6067

# 设置端口环境变量
ENV PORT=6067

# 启动应用
CMD ["node", "server.js"]
