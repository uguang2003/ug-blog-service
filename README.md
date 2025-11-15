# UG Blog Service

一个基于 Next.js 和 Prisma 的博客服务项目，提供博客文章的管理和展示功能。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **数据库 ORM**: Prisma 6.14.0
- **数据库**: PostgreSQL
- **认证**: JWT (jsonwebtoken) + bcryptjs
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4 (通过 PostCSS 配置)
- **代码质量**: ESLint 9
- **包管理**: npm/yarn/pnpm

## 项目结构

```
├── prisma/
│   ├── schema.prisma          # 数据库模式定义
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── app/
│   │   ├── api/               # API 路由
│   │   │   ├── admin/         # 管理员 API
│   │   │   │   ├── blogs/     # 博客管理
│   │   │   │   ├── pictures/  # 图片管理
│   │   │   │   ├── stats/     # 统计信息
│   │   │   │   └── types/     # 分类管理
│   │   │   ├── blogs/         # 前端博客 API
│   │   │   ├── comments/      # 评论管理
│   │   │   ├── login/         # 用户登录
│   │   │   ├── messages/      # 留言管理
│   │   │   ├── pictures/      # 图片管理
│   │   │   ├── stats/         # 统计信息
│   │   │   └── types/         # 分类管理
│   │   ├── docs/              # API 文档页面
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   ├── generated/             # Prisma 生成的文件
│   └── lib/                   # 工具库
│       ├── auth.ts            # 认证相关
│       └── prisma.ts          # Prisma 客户端配置
├── public/                    # 静态资源
└── package.json               # 项目配置和依赖
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
POST /api/login
```
请求体:
```json
{
  "username": "用户名",
  "password": "密码"
}
```
响应:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "用户名",
    "nickname": "昵称",
    "avatar": "头像URL",
    "type": 0
  }
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
GET /api/blogs?page=1&limit=10&recommend=true&typeId=1&query=搜索关键词
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
GET /api/comments?blogId=1
```

#### 创建评论
```
POST /api/comments
```

#### 获取留言
```
GET /api/messages
```

#### 创建留言
```
POST /api/messages
```

#### 获取图片
```
GET /api/pictures
```

#### 获取统计信息
```
GET /api/stats
```

## 数据库模式

项目使用 Prisma 定义数据库模式，主要包含以下模型：

### User (用户表)
- `id`: 用户ID (BigInt, 主键)
- `avatar`: 用户头像 (String, 可选)
- `createTime`: 创建时间 (DateTime, 可选)
- `email`: 用户邮箱 (String, 可选)
- `nickname`: 用户昵称 (String, 可选)
- `password`: 用户密码 (String, 可选)
- `type`: 用户类型 (Int, 可选)
- `updateTime`: 更新时间 (DateTime, 可选)
- `username`: 用户名 (String, 可选, 唯一)

### Type (分类表)
- `id`: 分类ID (BigInt, 主键)
- `name`: 分类名称 (String)

### Blog (博客表)
- `id`: 博客ID (BigInt, 主键)
- `appreciation`: 是否开启赞赏 (Boolean)
- `commentabled`: 是否允许评论 (Boolean)
- `content`: 博客内容 (String, 可选)
- `createTime`: 创建时间 (DateTime, 可选)
- `description`: 博客描述 (String, 可选)
- `firstPicture`: 首图地址 (String, 可选)
- `flag`: 博客标识 (String, 可选)
- `published`: 是否发布 (Boolean)
- `recommend`: 是否推荐 (Boolean)
- `shareStatement`: 是否开启分享声明 (Boolean)
- `title`: 博客标题 (String, 可选)
- `updateTime`: 更新时间 (DateTime, 可选)
- `views`: 浏览次数 (Int, 可选)
- `typeId`: 分类ID (BigInt, 可选)
- `userId`: 用户ID (BigInt, 可选)
- `commentCount`: 评论数量 (Int, 可选)

### Comment (评论表)
- `id`: 评论ID (BigInt, 主键)
- `nickname`: 评论者昵称 (String, 可选)
- `email`: 评论者邮箱 (String, 可选)
- `content`: 评论内容 (String, 可选)
- `avatar`: 评论者头像 (String, 可选)
- `createTime`: 创建时间 (DateTime, 可选)
- `blogId`: 博客ID (BigInt, 可选)
- `parentCommentId`: 父评论ID (BigInt, 可选)
- `adminComment`: 是否管理员评论 (Boolean)

### Message (留言表)
- `id`: 留言ID (BigInt, 主键)
- `nickname`: 留言者昵称 (String, 可选)
- `email`: 留言者邮箱 (String, 可选)
- `content`: 留言内容 (String, 可选)
- `avatar`: 留言者头像 (String, 可选)
- `createTime`: 创建时间 (DateTime, 可选)
- `parentMessageId`: 父留言ID (BigInt, 可选)
- `adminMessage`: 是否管理员留言 (Boolean)

### Picture (图片表)
- `id`: 图片ID (BigInt, 主键)
- `pictureAddress`: 图片地址 (String, 可选)
- `pictureDescription`: 图片描述 (String, 可选)
- `pictureName`: 图片名称 (String, 可选)
- `pictureTime`: 图片时间 (String, 可选)

## 开发命令

```bash
# 开发服务器 (使用 Turbopack)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 生成 Prisma 客户端
npx prisma generate

# 数据库迁移
npx prisma migrate dev

# 查看数据库状态
npx prisma migrate status

# 重置数据库
npx prisma migrate reset

# 打开 Prisma Studio
npx prisma studio
```

## 部署

### Docker 部署

#### 1. 准备工作

确保已安装 Docker 和 Docker Compose。

#### 2. 配置环境变量

复制 `.env.example` 文件为 `.env` 并修改其中的配置：

```bash
cp .env.example .env
```

修改 `.env` 文件中的数据库连接和 JWT 密钥等配置。

#### 3. 使用 Docker Compose 启动

```bash
# 启动所有服务(数据库 + 应用)
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v
```

应用将运行在 `http://localhost:6067`

#### 4. 构建 Docker 镜像

```bash
# 构建镜像
docker build -t ug-blog-service .

# 运行容器(需要先有 PostgreSQL 数据库)
docker run -d \
  -p 6067:6067 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
  -e JWT_SECRET="your-secret-key" \
  --name ug-blog-app \
  ug-blog-service
```

### GitHub Actions 自动部署到 Docker Hub

本项目已配置 GitHub Actions 自动化工作流，可以自动构建并推送 Docker 镜像到 Docker Hub。

#### 配置步骤

1. **在 Docker Hub 创建 Access Token**
   - 访问 [Docker Hub](https://hub.docker.com/)
   - 进入 Account Settings → Security → Access Tokens
   - 点击 "New Access Token" 创建新令牌
   - 保存生成的 token

2. **在 GitHub 仓库配置 Secrets**
   - 进入你的 GitHub 仓库
   - 点击 Settings → Secrets and variables → Actions
   - 点击 "New repository secret" 添加以下两个 secrets：
     - `DOCKERHUB_USERNAME`: 你的 Docker Hub 用户名
     - `DOCKERHUB_TOKEN`: 刚才创建的 Access Token

3. **触发自动构建**
   
   工作流会在以下情况自动触发：
   - 推送代码到 `main` 分支
   - 创建新的 Git 标签(如 `v1.0.0`)
   - 手动触发(在 Actions 页面点击 "Run workflow")

4. **查看构建状态**
   
   在仓库的 "Actions" 标签页可以查看构建进度和日志

5. **从 Docker Hub 拉取镜像**

   ```bash
   # 拉取最新版本
   docker pull <你的Docker Hub用户名>/ug-blog-service:latest
   
   # 拉取特定版本
   docker pull <你的Docker Hub用户名>/ug-blog-service:v1.0.0
   
   # 运行镜像
   docker run -d \
     -p 6067:6067 \
     -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
     -e JWT_SECRET="your-secret-key" \
     <你的Docker Hub用户名>/ug-blog-service:latest
   ```

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量 `DATABASE_URL` 和 `JWT_SECRET`
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
