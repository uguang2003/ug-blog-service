# UG Blog Service

一个基于 Next.js 和 Prisma 的博客服务项目，提供博客文章的管理和展示功能。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **数据库 ORM**: Prisma
- **数据库**: PostgreSQL
- **语言**: TypeScript
- **样式**: Tailwind CSS (通过 PostCSS 配置)
- **代码质量**: ESLint

## 项目结构

```
├── prisma/
│   ├── schema.prisma          # 数据库模式定义
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── app/
│   │   ├── api/posts/         # 博客文章 API 路由
│   │   ├── posts/[id]/        # 动态文章页面
│   │   └── page.tsx           # 首页
│   └── lib/
│       └── prisma.ts          # Prisma 客户端配置
└── public/                    # 静态资源
```

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 数据库配置

1. 确保 PostgreSQL 数据库已运行
2. 配置 `.env` 文件中的 `DATABASE_URL`
3. 运行数据库迁移：

```bash
npx prisma migrate dev
```

4. 生成 Prisma 客户端：

```bash
npx prisma generate
```

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## API 接口

### 获取所有文章

```
GET /api/posts
```

### 获取单篇文章

```
GET /api/posts/[id]
```

## 数据库模式

项目使用 Prisma 定义数据库模式，主要包含以下模型：

- `Post`: 博客文章
  - `id`: 唯一标识
  - `title`: 文章标题
  - `content`: 文章内容
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间

## 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量 `DATABASE_URL`
3. 部署应用

### 其他部署方式

参考 Next.js 官方部署文档：[https://nextjs.org/docs/app/building-your-application/deploying](https://nextjs.org/docs/app/building-your-application/deploying)

## 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

项目维护者: [uguang2003](https://github.com/uguang2003)

项目链接: [https://github.com/uguang2003/ug-blog-service](https://github.com/uguang2003/ug-blog-service)
