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

### 用户认证

#### 用户登录
```
PUT /api/users
```
请求体:
```json
{
  "username": "admin",
  "password": "password"
}
```
响应:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "email": "admin@example.com",
    "avatar": "/avatar.jpg",
    "type": 1
  }
}
```

#### 创建用户
```
POST /api/users
```
请求体:
```json
{
  "username": "newuser",
  "password": "password",
  "nickname": "新用户",
  "email": "user@example.com",
  "avatar": "/avatar.jpg",
  "type": 0
}
```

### 后台管理 API (需要管理员权限)

所有后台管理API都需要在请求头中包含Authorization: Bearer {token}

#### 获取博客列表
```
GET /api/admin/blogs?page=1&pageSize=10&title=搜索标题&typeId=1
```

#### 创建博客
```
POST /api/admin/blogs
```
请求体:
```json
{
  "title": "博客标题",
  "content": "博客内容",
  "description": "博客描述",
  "firstPicture": "/image.jpg",
  "published": true,
  "recommend": false,
  "commentabled": true,
  "appreciation": false,
  "shareStatement": false,
  "typeId": 1
}
```

#### 获取单个博客
```
GET /api/admin/blogs/[id]
```

#### 更新博客
```
PUT /api/admin/blogs/[id]
```

#### 删除博客
```
DELETE /api/admin/blogs/[id]
```

#### 获取分类列表
```
GET /api/admin/types
```

#### 创建分类
```
POST /api/admin/types
```
请求体:
```json
{
  "name": "分类名称"
}
```

#### 更新分类
```
PUT /api/admin/types/[id]
```

#### 删除分类
```
DELETE /api/admin/types/[id]
```

#### 获取统计信息
```
GET /api/admin/stats
```

### 前端博客展示 API

#### 获取所有博客
```
GET /api/blogs
```

#### 获取单个博客
```
GET /api/blogs/[id]
```

#### 获取所有分类
```
GET /api/types
```

#### 获取评论
```
GET /api/comments
```

#### 创建评论
```
POST /api/comments
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
